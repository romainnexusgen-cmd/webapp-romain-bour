import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  'https://zgbymaqorbmpmbhbfiya.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYnltYXFvcmJtcG1iaGJmaXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzM0MTksImV4cCI6MjA5NzcwOTQxOX0.9Y6ymjUY2kY7w1sb4lLUYzabKLhmh-4Y9J_tufNG3PI'
)

export async function POST(req: NextRequest) {
  try {
    const { auditId, q1, q2, q3 } = await req.json()
    if (!auditId) return NextResponse.json({ error: 'missing auditId' }, { status: 400 })

    await supabase
      .from('linkedin_audits')
      .update({ qualification_q1: q1, qualification_q2: q2, qualification_q3: q3 })
      .eq('id', auditId)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
