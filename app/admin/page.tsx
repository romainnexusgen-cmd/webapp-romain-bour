export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'

interface Lead {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  global_total_points: number | null
  global_total_maximum: number | null
  created_at: string
  opened_at: string | null
  qualify_completed_at: string | null
  calendly_clicked_at: string | null
  qualification_q1: string | null
  qualification_q2: string | null
  qualification_q3: string | null
}

interface Legacy {
  nom: string | null
  intitule: string | null
  tag_activite: string | null
  note: number | null
  derniere_utilisation: string | null
  check_result: string | null
  pays: string | null
  email: string | null
  lien_profil: string | null
  lien_resultat: string | null
}

const Q3_LABEL: Record<string, string> = {
  accompagne: '🔥 Accompagné',
  seul: '📚 Seul',
}

function fmt(ts: string | null) {
  if (!ts) return null
  const d = new Date(ts)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
}

function score(pts: number | null, max: number | null) {
  if (!pts || !max || max === 0) return '—'
  return Math.round((pts / max) * 100) + '/100'
}

export default async function AdminPage() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return <div className="p-8 text-red-500">Missing service key</div>

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)

  const { data: audits } = await supabase
    .from('linkedin_audits')
    .select('id, first_name, last_name, global_total_points, global_total_maximum, created_at, opened_at, qualify_completed_at, calendly_clicked_at, qualification_q1, qualification_q2, qualification_q3')
    .order('created_at', { ascending: false })
    .limit(200)

  const { data: leadsRaw } = await supabase
    .from('leads')
    .select('id, email')

  const emailMap = Object.fromEntries((leadsRaw ?? []).map((l: { id: string; email: string }) => [l.id, l.email]))

  const rows: Lead[] = (audits ?? []).map((a: Lead) => ({ ...a, email: emailMap[a.id] ?? null }))

  const { data: legacyRaw } = await supabase
    .from('legacy_leads')
    .select('nom, intitule, tag_activite, note, derniere_utilisation, check_result, pays, email, lien_profil, lien_resultat')
    .order('derniere_utilisation', { ascending: false, nullsFirst: false })
    .limit(2000)
  const legacy = (legacyRaw ?? []) as Legacy[]
  const newEmails = new Set(rows.map(r => r.email?.toLowerCase()).filter(Boolean))
  const legacyOpened = legacy.filter(l => l.check_result).length

  const total = rows.length
  const opened = rows.filter(r => r.opened_at).length
  const qualified = rows.filter(r => r.qualify_completed_at).length
  const clicked = rows.filter(r => r.calendly_clicked_at).length

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#0F172A', minHeight: '100vh', color: '#E2E8F0', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Optin.ia — Leads</h1>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: total, color: '#3B82F6' },
          { label: 'Ont ouvert', value: opened, color: '#10B981' },
          { label: 'Ont qualifié', value: qualified, color: '#F59E0B' },
          { label: 'Ont cliqué Calendly', value: clicked, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1E293B', borderRadius: 12, padding: '16px 24px', minWidth: 120 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#64748B', borderBottom: '1px solid #1E293B' }}>
              {['Nom', 'Email', 'Score', 'Lead reçu', 'Page ouverte', 'Form qualif', 'Calendly cliqué', 'Intention'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #1E293B', background: i % 2 === 0 ? 'transparent' : '#0F172A' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <a href={`/resultats/${r.id}`} target="_blank" rel="noreferrer" style={{ color: '#93C5FD', textDecoration: 'none' }}>
                    {r.first_name} {r.last_name}
                  </a>
                </td>
                <td style={{ padding: '10px 12px', color: '#94A3B8' }}>{r.email ?? '—'}</td>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#10B981' }}>{score(r.global_total_points, r.global_total_maximum)}</td>
                <td style={{ padding: '10px 12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{fmt(r.created_at)}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  {r.opened_at ? <span style={{ color: '#10B981' }}>✓ {fmt(r.opened_at)}</span> : <span style={{ color: '#475569' }}>—</span>}
                </td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  {r.qualify_completed_at ? <span style={{ color: '#F59E0B' }}>✓ {fmt(r.qualify_completed_at)}</span> : <span style={{ color: '#475569' }}>—</span>}
                </td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  {r.calendly_clicked_at ? <span style={{ color: '#EF4444' }}>✓ {fmt(r.calendly_clicked_at)}</span> : <span style={{ color: '#475569' }}>—</span>}
                </td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  {r.qualification_q3 ? (Q3_LABEL[r.qualification_q3] ?? r.qualification_q3) : <span style={{ color: '#475569' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', padding: 48 }}>Aucun lead</div>
        )}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '48px 0 8px' }}>Anciens leads — Optiprofil ({legacy.length})</h2>
      <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>
        Import du Google Sheet. {legacyOpened} ont consulté leur résultat. « Déjà revenu » = même email dans Optin.ia.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#64748B', borderBottom: '1px solid #1E293B' }}>
              {['Nom', 'Activité', 'Email', 'Note', 'Analyse', 'Résultat consulté', 'Pays', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {legacy.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1E293B' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                  {l.lien_profil ? <a href={l.lien_profil} target="_blank" rel="noreferrer" style={{ color: '#93C5FD', textDecoration: 'none' }}>{l.nom}</a> : l.nom}
                </td>
                <td style={{ padding: '10px 12px', color: '#94A3B8' }}>{l.tag_activite ?? '—'}</td>
                <td style={{ padding: '10px 12px', color: '#94A3B8' }}>{l.email ?? '—'}</td>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#10B981' }}>{l.note != null ? `${l.note}/100` : '—'}</td>
                <td style={{ padding: '10px 12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{fmt(l.derniere_utilisation) ?? '—'}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  {l.check_result ? <span style={{ color: '#10B981' }}>✓ {fmt(l.check_result)}</span> : <span style={{ color: '#475569' }}>—</span>}
                </td>
                <td style={{ padding: '10px 12px', color: '#94A3B8' }}>{l.pays ?? '—'}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  {l.email && newEmails.has(l.email) && <span style={{ color: '#F59E0B', fontWeight: 600 }}>Déjà revenu</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
