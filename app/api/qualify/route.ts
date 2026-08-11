import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { auditId, q1, q2, q3 } = await req.json()
    if (!auditId) return NextResponse.json({ error: 'missing auditId' }, { status: 400 })

    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) return NextResponse.json({ ok: false, error: 'missing key' }, { status: 500 })

    const supabase = createClient('https://zgbymaqorbmpmbhbfiya.supabase.co', key)

    await supabase
      .from('linkedin_audits')
      .update({ qualification_q1: q1, qualification_q2: q2, qualification_q3: q3 })
      .eq('id', auditId)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
