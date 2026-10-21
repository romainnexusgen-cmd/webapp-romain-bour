import { NextRequest, NextResponse } from 'next/server'

const SERIF = 'Newsreader,Georgia,Times New Roman,serif'
const SANS = 'DM Sans,Arial,Helvetica,sans-serif'

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function userEmail(lien: string) {
  return `<!DOCTYPE html><html lang="fr"><body style="margin:0;background:#FFFBF6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBF6;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #EEE4D8;border-radius:18px;overflow:hidden;">
<tr><td style="background:#2B2335;padding:30px 32px;">
<p style="margin:0 0 10px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#F2B9A4;">&mdash;&nbsp; Analyse LinkedIn</p>
<h1 style="margin:0;font-family:${SERIF};font-weight:400;font-size:28px;line-height:1.25;color:#FFFBF6;">On n'a pas pu <i style="color:#E58A72;">lire</i> ton profil</h1>
</td></tr>
<tr><td style="padding:28px 32px;font-family:${SANS};font-size:16px;line-height:1.65;color:#2B2335;">
<p style="margin:0 0 14px;">Hello,</p>
<p style="margin:0 0 14px;">Le lien LinkedIn que tu as envoyé ne mène à aucun profil public :</p>
<p style="margin:0 0 18px;padding:12px 14px;background:#FBF4EC;border:1px solid #EEE4D8;border-radius:10px;font-size:14px;color:#71687A;word-break:break-all;">${escapeHtml(lien)}</p>
<p style="margin:0 0 22px;">Le plus simple : ouvre ton profil LinkedIn sur ordinateur, copie l'adresse dans la barre du navigateur (elle ressemble à <b>linkedin.com/in/ton-nom</b>) et relance l'analyse. Ça prend 2 minutes.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#D9654A;border-radius:999px;">
<a href="https://optinia.romainbour.com/" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;">Relancer mon analyse &rarr;</a>
</td></tr></table>
<p style="margin:22px 0 0;font-size:14px;color:#71687A;">Un souci ? Réponds simplement à ce mail.<br>Romain</p>
</td></tr></table></td></tr></table></body></html>`
}

export async function POST(req: NextRequest) {
  const secret = process.env.AUDIT_HOOK_SECRET
  if (!secret || req.headers.get('x-hook-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const key = process.env.BREVO_API_KEY
  if (!key) return NextResponse.json({ error: 'missing brevo key' }, { status: 500 })

  const { email, lien, reason } = await req.json().catch(() => ({}))
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  const safeLien = String(lien ?? '').slice(0, 300)
  const safeReason = String(reason ?? 'inconnue').slice(0, 300)

  const send = (body: object) => fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const userRes = await send({
    sender: { name: 'Romain Bour', email: 'contact@romainbour.com' },
    replyTo: { email: 'romain.nexusgen@gmail.com' },
    to: [{ email }],
    subject: "On n'a pas pu lire ton profil LinkedIn",
    htmlContent: userEmail(safeLien),
  })

  const alertRes = await send({
    sender: { name: 'Optin.ia', email: 'contact@romainbour.com' },
    to: [{ email: 'romainbour.nexusgen@gmail.com', name: 'Romain Bour' }],
    subject: `⚠️ Audit raté — ${email}`,
    htmlContent: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#2B2335">
      <p><b>Un audit Optin.ia n'a pas pu lire le profil.</b> La personne a reçu un email pour corriger son lien.</p>
      <p>Email : <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a><br>
      Lien envoyé : ${escapeHtml(safeLien)}<br>
      Raison : ${escapeHtml(safeReason)}</p></div>`,
  })

  return NextResponse.json({ user: userRes.status, alert: alertRes.status })
}
