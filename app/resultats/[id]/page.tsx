import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

function getColor(points: number, max: number): { bar: string; badge: string; text: string } {
  const pct = points / max
  if (pct >= 0.65) return { bar: '#22C55E', badge: '#DCFCE7', text: '#15803D' }
  if (pct >= 0.4)  return { bar: '#F59E0B', badge: '#FEF3C7', text: '#92400E' }
  return { bar: '#EF4444', badge: '#FEE2E2', text: '#991B1B' }
}

function getGlobalLabel(pct: number) {
  if (pct >= 70) return { label: 'Profil bien optimisé', color: '#22C55E', sub: 'Quelques ajustements ciblés peuvent encore faire la différence.' }
  if (pct >= 50) return { label: 'Profil avec du potentiel', color: '#F59E0B', sub: 'Tu perds probablement des opportunités. Plusieurs points clés manquent de clarté.' }
  if (pct >= 30) return { label: 'Profil en dessous du standard', color: '#F97316', sub: 'La majorité des personnes qui te découvrent ne comprennent pas ce que tu fais.' }
  return { label: 'Profil très en dessous du standard', color: '#EF4444', sub: 'Il est urgent de corriger ton profil pour débloquer des leads.' }
}

interface Critere {
  titre: string
  points_obtenus: number
  points_maximum: number
  explication: string
}

const SECTIONS = [
  { label: 'Photo de profil',             key: 'photo',       max: 15, icon: '📸' },
  { label: 'Bannière',                    key: 'banner',      max: 15, icon: '🖼️' },
  { label: 'Titre du profil',             key: 'headline',    max: 15, icon: '✍️' },
  { label: 'Section À propos',            key: 'about',       max: 15, icon: '💬' },
  { label: 'Espace Sélection',            key: 'selection',   max: 15, icon: '⭐' },
  { label: 'Contenu',                     key: 'contenu',     max: 10, icon: '📝' },
  { label: 'Expériences professionnelles',key: 'experiences', max: 5,  icon: '💼' },
  { label: 'Crédibilité & preuves',       key: 'cred',        max: 10, icon: '🏆' },
]

function extractCriteres(data: Record<string, unknown>, key: string): Critere[] {
  const criteres: Critere[] = []
  let i = 1
  while (data[`${key}_critere_${i}_titre`]) {
    criteres.push({
      titre:           data[`${key}_critere_${i}_titre`] as string,
      points_obtenus:  Number(data[`${key}_critere_${i}_points_obtenus`]) || 0,
      points_maximum:  Number(data[`${key}_critere_${i}_points_maximum`]) || 0,
      explication:     data[`${key}_critere_${i}_explication`] as string || '',
    })
    i++
  }
  return criteres
}

export default async function ResultatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient(
    'https://zgbymaqorbmpmbhbfiya.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYnltYXFvcmJtcG1iaGJmaXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzM0MTksImV4cCI6MjA5NzcwOTQxOX0.9Y6ymjUY2kY7w1sb4lLUYzabKLhmh-4Y9J_tufNG3PI'
  )
  const { data, error } = await supabase
    .from('linkedin_audits')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return notFound()

  const globalScore = Number(data.global_total_points) || 0
  const globalMax   = Number(data.global_total_maximum) || 100
  const globalPct   = Math.round((globalScore / globalMax) * 100)
  const { label: globalLabel, color: globalColor, sub: globalSub } = getGlobalLabel(globalPct)

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F6F5F3; }
        .page { background: #F6F5F3; min-height: 100vh; }

        /* Header */
        .header { background: #0D1B2A; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; }
        .header-logo { display: flex; align-items: center; gap: 10px; }
        .header-logo-dot { width: 30px; height: 30px; border-radius: 8px; background: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: white; }
        .header-name { color: white; font-weight: 700; font-size: 15px; }
        .header-tag { color: rgba(255,255,255,0.6); font-size: 13px; }

        /* Hero */
        .hero { background: #0D1B2A; padding: 24px 40px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .hero-avatar { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; display: block; flex-shrink: 0; border: 2px solid rgba(37,99,235,0.5); }
        .hero-name { color: #fff; font-size: 18px; font-weight: 800; letter-spacing: -0.3px; margin-bottom: 3px; }
        .hero-date { color: rgba(255,255,255,0.6); font-size: 13px; }

        /* Wrapper */
        .content { max-width: 720px; margin: 0 auto; padding: 40px 20px 80px; display: flex; flex-direction: column; gap: 24px; }

        /* Score global */
        .score-card { background: #0D1B2A; border-radius: 20px; padding: 32px; }
        .score-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 24px; }
        .score-main { display: flex; align-items: center; gap: 24px; margin-bottom: 20px; }
        .score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .score-number { font-size: 28px; font-weight: 900; color: white; line-height: 1; }
        .score-denom { font-size: 11px; color: rgba(255,255,255,0.65); font-weight: 600; }
        .score-right { flex: 1; }
        .score-title { color: white; font-size: 17px; font-weight: 700; margin-bottom: 6px; }
        .score-sub { color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.6; }
        .score-bar-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 100px; overflow: hidden; margin-top: 16px; }
        .score-bar-fill { height: 100%; border-radius: 100px; }

        /* Tableau */
        .table-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04); }
        .table-head { padding: 22px 28px 18px; border-bottom: 1px solid #F0EDE6; }
        .table-head h2 { font-size: 16px; font-weight: 800; color: #0D1B2A; }
        .table-row { display: flex; align-items: center; gap: 16px; padding: 14px 28px; border-bottom: 1px solid #F7F5F2; }
        .table-row:last-child { border-bottom: none; }
        .table-icon { font-size: 15px; flex-shrink: 0; }
        .table-name { flex: 1; font-size: 14px; font-weight: 600; color: #1A2535; }
        .table-pts { font-size: 13px; font-weight: 700; color: #0D1B2A; white-space: nowrap; min-width: 44px; text-align: right; }
        .table-bar-track { width: 100px; height: 5px; background: #F0EDE6; border-radius: 100px; overflow: hidden; flex-shrink: 0; }
        .table-bar-fill { height: 100%; border-radius: 100px; }

        /* Section détail */
        .section-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04); }
        .section-header { padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F0EDE6; }
        .section-header-left { display: flex; align-items: center; gap: 10px; }
        .section-icon { font-size: 18px; }
        .section-title { font-size: 15px; font-weight: 800; color: #0D1B2A; }
        .section-badge { font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 8px; background: #0D1B2A; color: white; }
        .section-image { width: 100%; height: 140px; object-fit: cover; display: block; }
        .section-image-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; display: block; margin: 20px auto 8px; border: 2px solid #F0EDE6; }
        .critere { padding: 18px 24px; border-bottom: 1px solid #F7F5F2; }
        .critere:last-of-type { border-bottom: none; }
        .critere-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .critere-titre { font-size: 13px; font-weight: 700; color: #0D1B2A; line-height: 1.4; }
        .critere-badge { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }
        .critere-feedback { font-size: 13px; color: #6B7A99; line-height: 1.65; }
        .critere-feedback strong { color: #0D1B2A; font-weight: 600; }
        .section-footer { padding: 14px 24px; background: #FAFAF9; display: flex; align-items: center; gap: 14px; border-top: 1px solid #F0EDE6; }
        .section-footer-bar-track { flex: 1; height: 5px; background: #EEEBE5; border-radius: 100px; overflow: hidden; }
        .section-footer-label { font-size: 12px; font-weight: 700; color: #4B5563; white-space: nowrap; }

        /* CTA */
        .cta-card { background: #0D1B2A; border-radius: 20px; padding: 48px 40px; text-align: center; }
        .cta-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #2563EB; margin-bottom: 16px; }
        .cta-title { color: white; font-size: 24px; font-weight: 800; line-height: 1.3; margin-bottom: 14px; letter-spacing: -0.3px; }
        .cta-sub { color: rgba(255,255,255,0.72); font-size: 14px; line-height: 1.7; max-width: 420px; margin: 0 auto 32px; }
        .cta-btn { display: inline-block; background: #2563EB; color: white; font-weight: 700; font-size: 15px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 6px 24px rgba(37,99,235,0.4); transition: all 0.2s; }

        /* Footer */
        .footer { display: flex; align-items: center; justify-content: space-between; padding-top: 24px; border-top: 1px solid #E8E4DC; }
        .footer-left { display: flex; align-items: center; gap: 14px; }
        .footer-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
        .footer-name { font-size: 14px; font-weight: 700; color: #0D1B2A; margin-bottom: 3px; }
        .footer-sub { font-size: 12px; color: #6B7A99; margin-bottom: 4px; }
        .footer-link { font-size: 12px; color: #2563EB; font-weight: 600; text-decoration: none; }
        .footer-right { font-size: 11px; color: #6B7A99; }
      `}</style>

      <div className="page">

        {/* Header */}
        <div className="header">
          <div className="header-logo">
            <div className="header-logo-dot">R</div>
            <span className="header-name">Romain Bour</span>
          </div>
          <span className="header-tag">Analyse de profil LinkedIn</span>
        </div>

        {/* Hero */}
        <div className="hero">
          {data.photo_url && (
            <img className="hero-avatar" src={data.photo_url} alt={`${data.first_name} ${data.last_name}`} />
          )}
          <div>
            <h1 className="hero-name">{data.first_name} {data.last_name}</h1>
            <p className="hero-date">Analyse générée le {new Date(data.analyzed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="content">

          {/* Score global */}
          <div className="score-card">
            <p className="score-label">Score global du profil</p>
            <div className="score-main">
              <div className="score-circle" style={{ background: `${globalColor}18`, border: `2px solid ${globalColor}40` }}>
                <span className="score-number" style={{ color: globalColor }}>{globalPct}</span>
                <span className="score-denom">/100</span>
              </div>
              <div className="score-right">
                <p className="score-title" style={{ color: globalColor }}>{globalLabel}</p>
                <p className="score-sub">{globalSub}</p>
              </div>
            </div>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: `${globalPct}%`, background: globalColor }} />
            </div>
          </div>

          {/* Tableau récap */}
          <div className="table-card">
            <div className="table-head"><h2>Détail du score</h2></div>
            {SECTIONS.map((section) => {
              const pts = Number(data[`${section.key}_total_points`]) || 0
              const max = Number(data[`${section.key}_total_maximum`]) || section.max
              const { bar } = getColor(pts, max)
              return (
                <div key={section.key} className="table-row">
                  <span className="table-icon">{section.icon}</span>
                  <span className="table-name">{section.label}</span>
                  <span className="table-pts">{pts}/{max}</span>
                  <div className="table-bar-track">
                    <div className="table-bar-fill" style={{ width: `${(pts / max) * 100}%`, background: bar }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sections détaillées */}
          {SECTIONS.map((section) => {
            const pts = Number(data[`${section.key}_total_points`]) || 0
            const max = Number(data[`${section.key}_total_maximum`]) || section.max
            const { bar } = getColor(pts, max)
            const criteres = extractCriteres(data, section.key)
            const bannerUrl = section.key === 'banner' ? data.cover_url : null
            const photoUrl  = section.key === 'photo'  ? data.photo_url  : null

            return (
              <div key={section.key} className="section-card">
                <div className="section-header">
                  <div className="section-header-left">
                    <span className="section-icon">{section.icon}</span>
                    <h2 className="section-title">{section.label}</h2>
                  </div>
                  <span className="section-badge">{pts}/{max}</span>
                </div>

                {bannerUrl && <img className="section-image" src={bannerUrl} alt="Bannière" />}
                {photoUrl  && <img className="section-image-avatar" src={photoUrl} alt="Photo de profil" />}

                {criteres.map((crit, i) => {
                  const { badge, text } = getColor(crit.points_obtenus, crit.points_maximum)
                  return (
                    <div key={i} className="critere">
                      <div className="critere-top">
                        <p className="critere-titre">{crit.titre}</p>
                        <span className="critere-badge" style={{ background: badge, color: text }}>
                          {crit.points_obtenus}/{crit.points_maximum}
                        </span>
                      </div>
                      {crit.explication && (
                        <p className="critere-feedback">
                          <strong>Feedback —</strong> {crit.explication}
                        </p>
                      )}
                    </div>
                  )
                })}

                <div className="section-footer">
                  <div className="section-footer-bar-track">
                    <div className="score-bar-fill" style={{ width: `${(pts / max) * 100}%`, height: '100%', background: bar, borderRadius: 100 }} />
                  </div>
                  <span className="section-footer-label">{pts}/{max} pts</span>
                </div>
              </div>
            )
          })}

          {/* CTA */}
          <div className="cta-card">
            <p className="cta-eyebrow">Prochaine étape</p>
            <h2 className="cta-title">Tu sais maintenant ce qui<br />freine ton profil LinkedIn.</h2>
            <p className="cta-sub">La vraie question : tu passes à l'action, ou tu restes bloqué au diagnostic ? Booke un appel et transformons ton profil en levier d'opportunités.</p>
            <a className="cta-btn" href="https://www.romainbour.com/waitingroom" target="_blank">
              Booker un appel →
            </a>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-left">
              <img className="footer-avatar" src="/romain-face.jpeg" alt="Romain Bour" />
              <div>
                <p className="footer-name">Romain Bour</p>
                <p className="footer-sub">J'aide les indépendants à transformer leurs 3 likes en 10 clients.</p>
                <a className="footer-link" href="https://www.linkedin.com/in/romainbour/" target="_blank">Me contacter sur LinkedIn</a>
              </div>
            </div>
            <p className="footer-right">Optin.ia</p>
          </div>

        </div>
      </div>
    </>
  )
}
