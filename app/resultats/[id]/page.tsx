import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zgbymaqorbmpmbhbfiya.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYnltYXFvcmJtcG1iaGJmaXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzM0MTksImV4cCI6MjA5NzcwOTQxOX0.9Y6ymjUY2kY7w1sb4lLUYzabKLhmh-4Y9J_tufNG3PI'
)

function getBarClass(points: number, max: number) {
  const pct = points / max
  if (pct >= 0.65) return 'score-bar-fill green'
  if (pct >= 0.4) return 'score-bar-fill orange'
  return 'score-bar-fill red'
}

function getBadgeClass(points: number, max: number) {
  const pct = points / max
  if (pct >= 0.65) return 'badge-score badge-green'
  if (pct >= 0.4) return 'badge-score badge-yellow'
  if (pct >= 0.2) return 'badge-score badge-orange'
  return 'badge-score badge-red'
}

function getGlobalMessage(pct: number): { title: string; sub: string } {
  if (pct >= 70) return {
    title: 'Profil bien optimisé',
    sub: 'Quelques ajustements ciblés peuvent encore faire la différence et maximiser tes opportunités.'
  }
  if (pct >= 50) return {
    title: 'Profil avec du potentiel',
    sub: 'Tu perds probablement des opportunités. Plusieurs points clés manquent de clarté et freinent ta visibilité.'
  }
  if (pct >= 30) return {
    title: 'Profil en dessous du standard',
    sub: 'La majorité des personnes qui te découvrent ne comprennent pas ce que tu fais ni pourquoi te choisir.'
  }
  return {
    title: 'Profil très en dessous du standard',
    sub: 'Il est urgent de corriger ton profil pour débloquer des leads et renforcer ton réseau.'
  }
}

interface Critere {
  titre: string
  points_obtenus: number
  points_maximum: number
  explication: string
}

const SECTIONS = [
  { label: 'Photo de profil', key: 'photo', max: 15, icon: '📸' },
  { label: 'Bannière', key: 'banner', max: 15, icon: '🖼️' },
  { label: 'Titre du profil', key: 'headline', max: 15, icon: '✍️' },
  { label: 'Section À propos', key: 'about', max: 15, icon: '💬' },
  { label: 'Espace Sélection', key: 'selection', max: 15, icon: '⭐' },
  { label: 'Contenu', key: 'contenu', max: 10, icon: '📝' },
  { label: 'Expériences professionnelles', key: 'experiences', max: 5, icon: '💼' },
  { label: 'Crédibilité et preuves sociales', key: 'cred', max: 10, icon: '🏆' },
]

function extractCriteres(data: Record<string, unknown>, key: string): Critere[] {
  const criteres: Critere[] = []
  let i = 1
  while (data[`${key}_critere_${i}_titre`]) {
    criteres.push({
      titre: data[`${key}_critere_${i}_titre`] as string,
      points_obtenus: Number(data[`${key}_critere_${i}_points_obtenus`]) || 0,
      points_maximum: Number(data[`${key}_critere_${i}_points_maximum`]) || 0,
      explication: data[`${key}_critere_${i}_explication`] as string || '',
    })
    i++
  }
  return criteres
}

export default async function ResultatsPage({ params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('linkedin_audits')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return notFound()

  const globalScore = Number(data.global_total_points) || 0
  const globalMax = Number(data.global_total_maximum) || 100
  const globalPct = Math.round((globalScore / globalMax) * 100)
  const { title: globalTitle, sub: globalSub } = getGlobalMessage(globalPct)

  return (
    <div style={{ background: '#FAF8F3', minHeight: '100vh' }}>

      {/* Header navy */}
      <div style={{
        background: '#0B1929',
        padding: '24px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #2979FF, #1565FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'white'
          }}>R</div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Romain Bour</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          Analyse de profil LinkedIn
        </p>
      </div>

      {/* Hero résultats */}
      <div style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(41,121,255,0.1) 0%, transparent 60%), #0B1929',
        padding: '60px 48px',
        textAlign: 'center'
      }}>
        {data.photo_url && (
          <img
            src={data.photo_url}
            alt={`${data.first_name} ${data.last_name}`}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid rgba(41,121,255,0.5)',
              marginBottom: 16,
              boxShadow: '0 0 24px rgba(41,121,255,0.3)'
            }}
          />
        )}
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          {data.first_name} {data.last_name}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
          Analyse générée le {new Date(data.analyzed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Score global */}
        <div style={{
          background: '#0B1929',
          borderRadius: 20,
          padding: 32,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(41,121,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            Score global du profil
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
                <div
                  className={getBarClass(globalScore, globalMax)}
                  style={{ width: `${globalPct}%`, height: '100%' }}
                />
              </div>
            </div>
            <div style={{
              fontSize: 36,
              fontWeight: 900,
              color: 'white',
              lineHeight: 1,
              textShadow: '0 0 30px rgba(41,121,255,0.4)',
              whiteSpace: 'nowrap'
            }}>
              {globalPct}<span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>/100</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{globalTitle}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6 }}>{globalSub}</p>
          </div>
        </div>

        {/* Tableau récap */}
        <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(11,25,41,0.06)' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #F0EDE6' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B1929' }}>Détail du score</h2>
          </div>
          <div style={{
            background: '#0B1929',
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: 16,
            padding: '12px 28px',
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            <span>Catégorie</span>
            <span style={{ textAlign: 'center' }}>Score</span>
            <span style={{ textAlign: 'right', minWidth: 120 }}>Performance</span>
          </div>

          {SECTIONS.map((section, i) => {
            const points = Number(data[`${section.key}_total_points`]) || 0
            const max = Number(data[`${section.key}_total_maximum`]) || section.max
            return (
              <div key={section.key} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 16,
                alignItems: 'center',
                padding: '16px 28px',
                borderBottom: i < SECTIONS.length - 1 ? '1px solid #F0EDE6' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{section.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0B1929' }}>{section.label}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0B1929', textAlign: 'center', minWidth: 48 }}>
                  {points}/{max}
                </span>
                <div style={{ width: 120, height: 8, background: '#F0EDE6', borderRadius: 100, overflow: 'hidden' }}>
                  <div
                    className={getBarClass(points, max)}
                    style={{ width: `${(points / max) * 100}%`, height: '100%' }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Sections détaillées */}
        {SECTIONS.map((section) => {
          const points = Number(data[`${section.key}_total_points`]) || 0
          const max = Number(data[`${section.key}_total_maximum`]) || section.max
          const criteres = extractCriteres(data, section.key)
          const imageUrl = section.key === 'photo' ? data.photo_url : section.key === 'banner' ? data.cover_url : null

          return (
            <div key={section.key} style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 16px rgba(11,25,41,0.06)' }}>
              {/* Section header */}
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #F0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{section.icon}</span>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B1929' }}>{section.label}</h2>
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 800,
                  padding: '6px 16px',
                  borderRadius: 10,
                  background: '#0B1929',
                  color: 'white'
                }}>
                  {points}/{max}
                </div>
              </div>

              {/* Image */}
              {imageUrl && section.key === 'banner' && (
                <img src={imageUrl} alt="Bannière" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              )}
              {imageUrl && section.key === 'photo' && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 8px' }}>
                  <img src={imageUrl} alt="Photo" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #F0EDE6' }} />
                </div>
              )}

              {/* Critères header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 16,
                padding: '12px 28px',
                background: '#F7F5F0',
                fontSize: 11,
                fontWeight: 700,
                color: '#6B7A99',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                <span>Critères & feedback</span>
                <span>Score</span>
              </div>

              {criteres.map((crit, i) => (
                <div key={i} className="critere-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: crit.explication ? 10 : 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0B1929' }}>{crit.titre}</p>
                    <span className={getBadgeClass(crit.points_obtenus, crit.points_maximum)}>
                      {crit.points_obtenus}/{crit.points_maximum}
                    </span>
                  </div>
                  {crit.explication && (
                    <p style={{ fontSize: 13, color: '#6B7A99', lineHeight: 1.65 }}>
                      <span style={{ fontWeight: 600, color: '#0B1929' }}>→ Feedback : </span>
                      {crit.explication}
                    </p>
                  )}
                </div>
              ))}

              {/* Score bar */}
              <div style={{ padding: '16px 28px', background: '#F7F5F0', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, height: 8, background: '#E8E4DC', borderRadius: 100, overflow: 'hidden' }}>
                  <div className={getBarClass(points, max)} style={{ width: `${(points / max) * 100}%`, height: '100%' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0B1929', whiteSpace: 'nowrap' }}>
                  Score {points}/{max}
                </span>
              </div>
            </div>
          )
        })}

        {/* CTA */}
        <div style={{
          background: '#0B1929',
          borderRadius: 20,
          padding: '48px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(41,121,255,0.15) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />
          <p style={{ color: '#2979FF', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Prochaine étape
          </p>
          <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, lineHeight: 1.3, marginBottom: 12 }}>
            Tu sais maintenant ce qui freine<br />ton profil LinkedIn.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            La vraie question, c'est : tu passes à l'action, ou tu restes bloqué au diagnostic ? Booke un appel et transformons ton profil en levier d'opportunités.
          </p>
          <a
            href="https://www.romainbour.com/waitingroom"
            target="_blank"
            style={{
              display: 'inline-block',
              background: '#2979FF',
              color: 'white',
              fontWeight: 700,
              fontSize: 15,
              padding: '16px 36px',
              borderRadius: 14,
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(41,121,255,0.4)',
              transition: 'all 0.2s'
            }}
          >
            → Booker un call
          </a>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #E8E4DC',
          paddingTop: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src="/romain-face.jpeg"
              alt="Romain Bour"
              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#0B1929' }}>Romain Bour</p>
              <p style={{ fontSize: 12, color: '#6B7A99' }}>J'aide les indépendants à transformer leurs 3 likes en 10 clients.</p>
              <a href="https://www.linkedin.com/in/romainbour/" target="_blank" style={{ color: '#2979FF', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                Me contacter sur LinkedIn
              </a>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#B0A99A' }}>Conditions du licenser</p>
        </div>
      </div>
    </div>
  )
}
