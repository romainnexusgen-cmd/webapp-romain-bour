import { NextRequest, NextResponse } from 'next/server'
import templates from './templates.json'

// Temporary one-shot update of Brevo sequence emails. Delete after use.
export async function POST(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD
  if (!password || req.headers.get('x-admin-password') !== password) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const key = process.env.BREVO_API_KEY
  if (!key) return NextResponse.json({ error: 'missing brevo key' }, { status: 500 })
  const results: Record<string, number | string> = {}
  for (const [id, htmlContent] of Object.entries(templates as Record<string, string>)) {
    const res = await fetch(`https://api.brevo.com/v3/smtp/templates/${id}`, {
      method: 'PUT',
      headers: { 'api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ htmlContent }),
    })
    results[id] = res.ok ? res.status : `${res.status} ${await res.text()}`
  }
  return NextResponse.json(results)
}
