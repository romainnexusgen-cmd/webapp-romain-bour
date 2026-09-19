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

  return NextResponse.redirect('https://calendly.com/romain-visibility/callmemaybe')
}
