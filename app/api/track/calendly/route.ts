import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    try {
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (key) {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
        await supabase
          .from('linkedin_audits')
          .update({ calendly_clicked_at: new Date().toISOString() })
          .eq('id', id)
          .is('calendly_clicked_at', null)
      }
    } catch {}
  }

  // Un client en cours (vérifié auprès de Mon LinkedIn) va vers son mentorat ; tout le monde d'autre garde le rendez-vous prospects
  if (id && (await isClient(id))) return NextResponse.redirect('https://rdv.romainbour.com/mentorat')
  return NextResponse.redirect('https://rdv.romainbour.com/?source=optinia')
}

/** Demande à Mon LinkedIn si l'auteur de cette analyse est un client en cours. En cas de doute ou de panne : non. */
async function isClient(id: string): Promise<boolean> {
  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    const secret = process.env.OPTINIA_SECRET
    if (!key || !secret) return false
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
    const { data: lead } = await supabase.from('leads').select('email').eq('id', id).maybeSingle()
    if (!lead?.email) return false
    const r = await fetch(`https://tableaudebord.romainbour.com/api/optinia/client?email=${encodeURIComponent(lead.email)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(2500),
      cache: 'no-store',
    })
    if (!r.ok) return false
    const d = await r.json() as { client?: boolean }
    return d.client === true
  } catch {
    return false
  }
}
