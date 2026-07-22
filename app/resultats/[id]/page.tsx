import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

function getColor(pct: number) {
  if (pct >= 0.65) return { main: '#16A34A', light: '#F0FDF4', border: '#BBF7D0', text: '#15803D' }
  if (pct >= 0.4)  return { main: '#D97706', light: '#FFFBEB', border: '#FDE68A', text: '#92400E' }
  return               { main: '#DC2626', light: '#FFF1F2', border: '#FECDD3', text: '#991B1B' }
}

function getGlobalTier(pct: number) {
  if (pct >= 70) return { label: 'Profil solide', desc: 'Ton profil convertit. Quelques ajustements ciblés peuvent encore amplifier tes résultats.', emoji: '🟢' }
  if (pct >= 50) return { label: 'Profil avec du potentiel', desc: 'La base est là, mais tu perds des opportunités. Des points clés freinent ta visibilité.', emoji: '🟡' }
  if (pct >= 30) return { label: 'Profil en dessous du standard', desc: 'La majorité des visiteurs ne comprennent pas ce que tu fais ni pourquoi te choisir.', emoji: '🟠' }
  return              { label: 'Profil à reconstruire', desc: 'Ton profil te coûte des opportunités chaque jour. Il est urgent d\'agir.', emoji: '🔴' }
}

interface Critere { titre: string; points_obtenus: number; points_maximum: number; explication: string }

const SECTIONS = [
  { label: 'Photo de profil',              key: 'photo',       max: 15, icon: '📸' },
  { label: 'Bannière',                     key: 'banner',      max: 15, icon: '🖼️' },
  { label: 'Titre du profil',              key: 'headline',    max: 15, icon: '✍️' },
  { label: 'Section À propos',             key: 'about',       max: 15, icon: '💬' },
  { label: 'Espace Sélection',             key: 'selection',   max: 15, icon: '⭐' },
  { label: 'Contenu',                      key: 'contenu',     max: 10, icon: '📝' },
  { label: 'Expériences professionnelles', key: 'experiences', max: 5,  icon: '💼' },
  { label: 'Crédibilité & preuves',        key: 'cred',        max: 10, icon: '🏆' },
]

function extractCriteres(data: Record<string, unknown>, key: string): Critere[] {
  const out: Critere[] = []
  let i = 1
  while (data[`${key}_critere_${i}_titre`]) {
    out.push({
      titre:          data[`${key}_critere_${i}_titre`] as string,
      points_obtenus: Number(data[`${key}_critere_${i}_points_obtenus`]) || 0,
      points_maximum: Number(data[`${key}_critere_${i}_points_maximum`]) || 0,
      explication:    data[`${key}_critere_${i}_explication`] as string || '',
    })
    i++
  }
  return out
}

export default async function ResultatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient(
    'https://zgbymaqorbmpmbhbfiya.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYnltYXFvcmJtcG1iaGJmaXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzM0MTksImV4cCI6MjA5NzcwOTQxOX0.9Y6ymjUY2kY7w1sb4lLUYzabKLhmh-4Y9J_tufNG3PI'
  )
  const { data, error } = await supabase.from('linkedin_audits').select('*').eq('id', id).single()
  if (error || !data) return notFound()

  const globalScore = Number(data.global_total_points) || 0
  const globalMax   = Number(data.global_total_maximum) || 100
  const globalPct   = Math.round((globalScore / globalMax) * 100)
  const tier        = getGlobalTier(globalPct)
  const globalColor = getColor(globalPct / 100)

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #F4F3F0; color: #111827; -webkit-font-smoothing: antialiased; }

        /* NAV */
        .nav { position: sticky; top: 0; z-index: 10; background: rgba(15,31,53,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 32px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .nav-brand { display: flex; align-items: center; gap: 10px; }
        .nav-dot { width: 28px; height: 28px; border-radius: 7px; background: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: white; }
        .nav-name { color: white; font-size: 14px; font-weight: 700; }
        .nav-pill { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); }

        /* HERO */
        .hero { background: #0F1F35; padding: 64px 24px 72px; text-align: center; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 50% at 50% -10%, rgba(37,99,235,0.25) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { position: relative; z-index: 1; }
        .hero-avatar-wrap { position: relative; display: inline-block; margin-bottom: 20px; }
        .hero-avatar { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; display: block; border: 3px solid rgba(255,255,255,0.15); box-shadow: 0 0 0 6px rgba(37,99,235,0.15), 0 20px 60px rgba(0,0,0,0.4); }
        .hero-name { color: white; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
        .hero-meta { color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 36px; }

        /* SCORE DIAL */
        .score-dial-wrap { display: inline-flex; flex-direction: column; align-items: center; gap: 0; }
        .score-dial { position: relative; width: 160px; height: 160px; margin-bottom: 16px; }
        .score-dial svg { transform: rotate(-90deg); }
        .score-dial-track { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 10; }
        .score-dial-fill { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 1s ease; }
        .score-dial-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .score-num { font-size: 44px; font-weight: 900; color: white; line-height: 1; letter-spacing: -2px; }
        .score-denom { font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 600; margin-top: 2px; }
        .score-tier-label { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
        .score-tier-desc { color: rgba(255,255,255,0.6); font-size: 13px; max-width: 380px; line-height: 1.65; }

        /* CONTENT */
        .content { max-width: 740px; margin: 0 auto; padding: 40px 20px 80px; display: flex; flex-direction: column; gap: 20px; }

        /* GRID RECAP */
        .recap-card { background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04); }
        .recap-title { font-size: 13px; font-weight: 700; color: #374151; padding: 20px 24px 16px; border-bottom: 1px solid #F3F4F6; }
        .recap-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .recap-item { padding: 16px 20px; border-bottom: 1px solid #F3F4F6; border-right: 1px solid #F3F4F6; }
        .recap-item:nth-child(even) { border-right: none; }
        .recap-item:nth-last-child(-n+2) { border-bottom: none; }
        .recap-item-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .recap-item-label { font-size: 12px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 6px; }
        .recap-item-pts { font-size: 12px; font-weight: 700; }
        .recap-bar-track { height: 4px; background: #F3F4F6; border-radius: 100px; overflow: hidden; }
        .recap-bar-fill { height: 100%; border-radius: 100px; }

        /* SECTION CARD */
        .section-card { background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04); }
        .section-hd { padding: 20px 24px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid #F3F4F6; }
        .section-icon-wrap { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .section-hd-info { flex: 1; }
        .section-hd-name { font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 2px; }
        .section-hd-sub { font-size: 12px; color: #6B7280; }
        .section-score-badge { font-size: 14px; font-weight: 800; padding: 6px 14px; border-radius: 10px; }
        .section-banner { width: 100%; height: 140px; object-fit: cover; display: block; }
        .section-avatar-wrap { padding: 24px 0 8px; display: flex; justify-content: center; }
        .section-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #F3F4F6; }

        /* CRITERES */
        .critere { padding: 18px 24px; border-bottom: 1px solid #F9FAFB; }
        .critere:last-of-type { border-bottom: none; }
        .critere-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        .critere-name { font-size: 13px; font-weight: 700; color: #111827; line-height: 1.45; }
        .critere-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }
        .critere-bar-track { height: 3px; background: #F3F4F6; border-radius: 100px; overflow: hidden; margin-bottom: 10px; }
        .critere-bar-fill { height: 100%; border-radius: 100px; }
        .critere-feedback { font-size: 13px; color: #4B5563; line-height: 1.65; padding: 10px 14px; border-radius: 8px; background: #F9FAFB; border-left: 3px solid #E5E7EB; }

        /* SECTION FOOTER */
        .section-ft { padding: 14px 24px; background: #FAFAFA; border-top: 1px solid #F3F4F6; display: flex; align-items: center; gap: 12px; }
        .section-ft-track { flex: 1; height: 4px; background: #EEECEC; border-radius: 100px; overflow: hidden; }
        .section-ft-fill { height: 100%; border-radius: 100px; }
        .section-ft-label { font-size: 11px; font-weight: 700; color: #6B7280; white-space: nowrap; }

        /* CTA */
        .cta { background: #0F1F35; border-radius: 20px; padding: 52px 40px; text-align: center; position: relative; overflow: hidden; }
        .cta::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(37,99,235,0.2) 0%, transparent 70%); pointer-events: none; }
        .cta-inner { position: relative; z-index: 1; }
        .cta-eyebrow { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #60A5FA; background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.3); padding: 5px 14px; border-radius: 20px; margin-bottom: 20px; }
        .cta-title { color: white; font-size: 26px; font-weight: 800; line-height: 1.3; margin-bottom: 14px; letter-spacing: -0.4px; }
        .cta-sub { color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.75; max-width: 420px; margin: 0 auto 32px; }
        .cta-btn { display: inline-flex; align-items: center; gap: 8px; background: #2563EB; color: white; font-weight: 700; font-size: 15px; padding: 15px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(37,99,235,0.45), 0 1px 3px rgba(37,99,235,0.3); }

        /* FOOTER */
        .page-footer { display: flex; align-items: center; gap: 16px; padding-top: 28px; border-top: 1px solid #E5E3DE; }
        .pf-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .pf-name { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 3px; }
        .pf-sub { font-size: 12px; color: #6B7280; margin-bottom: 5px; }
        .pf-link { font-size: 12px; color: #2563EB; font-weight: 600; text-decoration: none; }
        .pf-right { margin-left: auto; font-size: 11px; color: #9CA3AF; }

        @media (max-width: 600px) {
          .recap-grid { grid-template-columns: 1fr; }
          .recap-item:nth-child(even) { border-right: none; }
          .recap-item { border-right: none; }
          .cta { padding: 40px 24px; }
          .cta-title { font-size: 22px; }
          .hero { padding: 48px 20px 56px; }
          .score-num { font-size: 36px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-dot">R</div>
          <span className="nav-name">Romain Bour</span>
        </div>
        <span className="nav-pill">Analyse LinkedIn</span>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          {data.photo_url && (
            <div className="hero-avatar-wrap">
              <img className="hero-avatar" src={data.photo_url} alt={`${data.first_name} ${data.last_name}`} />
            </div>
          )}
          <h1 className="hero-name">{data.first_name} {data.last_name}</h1>
          <p className="hero-meta">
            Analyse générée le {new Date(data.analyzed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {/* Score dial SVG */}
          <div className="score-dial-wrap">
            <div className="score-dial">
              {(() => {
                const r = 68
                const circ = 2 * Math.PI * r
                const offset = circ - (globalPct / 100) * circ
                return (
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle className="score-dial-track" cx="80" cy="80" r={r} />
                    <circle
                      className="score-dial-fill"
                      cx="80" cy="80" r={r}
                      stroke={globalColor.main}
                      strokeDasharray={circ}
                      strokeDashoffset={offset}
                    />
                  </svg>
                )
              })()}
              <div className="score-dial-text">
                <span className="score-num" style={{ color: globalColor.main }}>{globalPct}</span>
                <span className="score-denom">/100</span>
              </div>
            </div>
            <p className="score-tier-label" style={{ color: globalColor.main }}>{tier.label}</p>
            <p className="score-tier-desc">{tier.desc}</p>
          </div>
        </div>
      </div>

      <div className="content">

        {/* GRILLE RECAP */}
        <div className="recap-card">
          <p className="recap-title">Résumé par catégorie</p>
          <div className="recap-grid">
            {SECTIONS.map((s) => {
              const pts = Number(data[`${s.key}_total_points`]) || 0
              const max = Number(data[`${s.key}_total_maximum`]) || s.max
              const col = getColor(pts / max)
              return (
                <div key={s.key} className="recap-item">
                  <div className="recap-item-top">
                    <span className="recap-item-label">{s.icon} {s.label}</span>
                    <span className="recap-item-pts" style={{ color: col.text }}>{pts}/{max}</span>
                  </div>
                  <div className="recap-bar-track">
                    <div className="recap-bar-fill" style={{ width: `${(pts/max)*100}%`, background: col.main }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SECTIONS DÉTAILLÉES */}
        {SECTIONS.map((s) => {
          const pts      = Number(data[`${s.key}_total_points`]) || 0
          const max      = Number(data[`${s.key}_total_maximum`]) || s.max
          const col      = getColor(pts / max)
          const criteres = extractCriteres(data, s.key)
          const bannerUrl = s.key === 'banner' ? data.cover_url  : null
          const photoUrl  = s.key === 'photo'  ? data.photo_url  : null

          return (
            <div key={s.key} className="section-card">
              <div className="section-hd">
                <div className="section-icon-wrap" style={{ background: col.light, border: `1px solid ${col.border}` }}>
                  {s.icon}
                </div>
                <div className="section-hd-info">
                  <p className="section-hd-name">{s.label}</p>
                  <p className="section-hd-sub">{criteres.length} critère{criteres.length > 1 ? 's' : ''} analysé{criteres.length > 1 ? 's' : ''}</p>
                </div>
                <span className="section-score-badge" style={{ background: col.light, color: col.text, border: `1px solid ${col.border}` }}>
                  {pts}/{max}
                </span>
              </div>

              {bannerUrl && <img className="section-banner" src={bannerUrl} alt="Bannière LinkedIn" />}
              {photoUrl  && (
                <div className="section-avatar-wrap">
                  <img className="section-avatar" src={photoUrl} alt="Photo de profil" />
                </div>
              )}

              {criteres.map((c, i) => {
                const cc = getColor(c.points_obtenus / c.points_maximum)
                return (
                  <div key={i} className="critere">
                    <div className="critere-hd">
                      <p className="critere-name">{c.titre}</p>
                      <span className="critere-badge" style={{ background: cc.light, color: cc.text, border: `1px solid ${cc.border}` }}>
                        {c.points_obtenus}/{c.points_maximum}
                      </span>
                    </div>
                    <div className="critere-bar-track">
                      <div className="critere-bar-fill" style={{ width: `${(c.points_obtenus/c.points_maximum)*100}%`, background: cc.main }} />
                    </div>
                    {c.explication && (
                      <div className="critere-feedback" style={{ borderLeftColor: cc.main }}>
                        {c.explication}
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="section-ft">
                <div className="section-ft-track">
                  <div className="section-ft-fill" style={{ width: `${(pts/max)*100}%`, background: col.main }} />
                </div>
                <span className="section-ft-label" style={{ color: col.text }}>{pts}/{max} pts</span>
              </div>
            </div>
          )
        })}

        {/* CTA */}
        <div className="cta">
          <div className="cta-inner">
            <span className="cta-eyebrow">Prochaine étape</span>
            <h2 className="cta-title">Tu sais ce qui freine ton profil.<br />Passons à l'action.</h2>
            <p className="cta-sub">
              Un diagnostic, c'est utile. Mais sans plan d'action, ça reste du bruit.
              Booke un appel de 30 min et on transforme ton profil en levier de business.
            </p>
            <a className="cta-btn" href="https://www.romainbour.com/waitingroom" target="_blank">
              Booker un appel gratuit →
            </a>
          </div>
        </div>

        {/* PAGE FOOTER */}
        <div className="page-footer">
          <img className="pf-avatar" src="/romain-face.jpeg" alt="Romain Bour" />
          <div>
            <p className="pf-name">Romain Bour</p>
            <p className="pf-sub">Expert branding LinkedIn pour dirigeants B2B</p>
            <a className="pf-link" href="https://www.linkedin.com/in/romainbour/" target="_blank">Suivre sur LinkedIn →</a>
          </div>
          <span className="pf-right">Optin.ia</span>
        </div>

      </div>
    </>
  )
}
