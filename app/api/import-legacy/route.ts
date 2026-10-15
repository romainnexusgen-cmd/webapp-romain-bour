import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Temporary one-shot import of the old Optiprofil Google Sheet. Delete after use.
const CORS = {
  'Access-Control-Allow-Origin': 'https://docs.google.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = '', inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') inQuotes = false
      else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

function frDate(s: string): string | null {
  const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/)
  if (!m) return null
  return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4] ?? '00'}:${m[5] ?? '00'}:00+01:00`).toISOString()
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD
  if (!password || req.headers.get('x-admin-password') !== password) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: CORS })
  }
  const [header, ...lines] = parseCsv(await req.text())
  const col = (name: string) => header.indexOf(name)
  const get = (r: string[], name: string) => (r[col(name)] ?? '').trim() || null

  const parsed = lines
    .filter(r => get(r, 'Lien résultat') || get(r, 'mail'))
    .map(r => ({
      nom: get(r, 'Nom'),
      intitule: get(r, 'Intitulé'),
      tag_activite: get(r, 'Tag activité'),
      nb_utilisation: Number(get(r, 'Nb utilisation')) || null,
      note: Number(get(r, 'Note')) || null,
      derniere_utilisation: frDate(get(r, 'Dernière utilisation') ?? ''),
      check_result: frDate(get(r, 'Check result') ?? ''),
      pays: get(r, 'Pays complet'),
      interet: get(r, 'Interêt'),
      email: get(r, 'mail')?.toLowerCase() ?? null,
      lien_profil: get(r, 'Lien profil'),
      lien_resultat: get(r, 'Lien résultat') ?? `no-result:${get(r, 'mail')}`,
    }))
  const rows = [...new Map(parsed.map(r => [r.lien_resultat, r])).values()]

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  let inserted = 0
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await supabase.from('legacy_leads').upsert(rows.slice(i, i + 200), { onConflict: 'lien_resultat' })
    if (error) return NextResponse.json({ error: error.message, inserted }, { status: 500, headers: CORS })
    inserted += rows.slice(i, i + 200).length
  }
  return NextResponse.json({ parsed: lines.length, inserted }, { headers: CORS })
}
