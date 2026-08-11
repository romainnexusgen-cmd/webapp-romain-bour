import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const Q1_LABELS: Record<string, string> = {
  methode:  'Pas de méthode claire',
  message:  'Message flou ou trop généraliste',
  temps:    'Manque de temps',
  convert:  'Je poste mais rien ne convertit',
}
const Q2_LABELS: Record<string, string> = {
  leads:     'Générer des leads qualifiés',
  autorite:  'Développer mon autorité',
  'les-deux': 'Les deux à la fois',
}
const Q3_LABELS: Record<string, string> = {
  seul:       'Comprendre seul',
  accompagne: 'Être accompagné',
}

export async function POST(req: NextRequest) {
  try {
    const { auditId, q1, q2, q3 } = await req.json()
    if (!auditId) return NextResponse.json({ error: 'missing auditId' }, { status: 400 })

    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) return NextResponse.json({ ok: false, error: 'missing key' }, { status: 500 })

    const supabase = createClient('https://zgbymaqorbmpmbhbfiya.supabase.co', key)

    /* Save qualification answers */
    const { data: audit } = await supabase
      .from('linkedin_audits')
      .update({ qualification_q1: q1, qualification_q2: q2, qualification_q3: q3 })
      .eq('id', auditId)
      .select('first_name, last_name, global_total_points')
      .single()

    /* Fetch lead email */
    const { data: lead } = await supabase
      .from('leads')
      .select('email')
      .eq('id', auditId)
      .single()

    /* Send notification email to Romain via Brevo */
    const brevoKey = process.env.BREVO_API_KEY
    if (brevoKey && lead?.email) {
      const name = audit ? `${audit.first_name} ${audit.last_name}` : 'Lead'
      const score = audit?.global_total_points ?? '?'
      const intent = q3 === 'accompagne' ? '🔥 Veut être accompagné' : '📚 Veut comprendre seul'
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Optin.ia', email: 'romain.nexusgen@gmail.com' },
          to: [{ email: 'romain.nexusgen@gmail.com', name: 'Romain Bour' }],
          subject: `${intent} — ${name} (${score}/100)`,
          htmlContent: `
            <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0F172A">
              <h2 style="font-size:20px;font-weight:800;margin-bottom:16px">Nouveau lead qualifié</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Nom</td><td style="font-weight:600;font-size:14px">${name}</td></tr>
                <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Email</td><td><a href="mailto:${lead.email}" style="color:#3B82F6;font-weight:600;font-size:14px">${lead.email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Score LinkedIn</td><td style="font-weight:600;font-size:14px">${score}/100</td></tr>
                <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Frein</td><td style="font-size:14px">${Q1_LABELS[q1] ?? q1}</td></tr>
                <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Objectif</td><td style="font-size:14px">${Q2_LABELS[q2] ?? q2}</td></tr>
                <tr><td style="padding:8px 0;color:#64748B;font-size:14px">Intention</td><td style="font-weight:700;font-size:14px">${Q3_LABELS[q3] ?? q3}</td></tr>
              </table>
              <div style="margin-top:24px">
                <a href="https://webapp-romain-bour-seven.vercel.app/resultats/${auditId}"
                   style="display:inline-block;background:#1D4ED8;color:white;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px;text-decoration:none">
                  Voir l'analyse complète →
                </a>
              </div>
            </div>
          `,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
