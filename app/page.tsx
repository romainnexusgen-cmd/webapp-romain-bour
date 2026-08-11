'use client'

import { useState, useEffect, useRef } from 'react'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || ''

const TEMOIGNAGES = [
  { texte: "J'ai construit ma réputation sur 20 ans de terrain. Mon LinkedIn ressemblait au profil d'un stagiaire. L'analyse m'a montré exactement ce qu'il fallait corriger — sans jargon.", nom: "François-Xavier D.", poste: "Agent commercial indépendant", initiale: "F", photo: "https://i.pravatar.cc/120?img=52" },
  { texte: "Je savais que mon expertise valait quelque chose. Mais mon profil ne le montrait pas. Le diagnostic était précis, adapté à mon secteur.", nom: "Sophie M.", poste: "Co-dirigeante PME", initiale: "S", photo: "https://i.pravatar.cc/120?img=47" },
  { texte: "En le corrigeant, les bonnes personnes ont commencé à me trouver — sans que j'aie à courir après.", nom: "Isabelle G.", poste: "Formatrice B2B, Genève", initiale: "I", photo: "https://i.pravatar.cc/120?img=9" },
]

const CRITERES = [
  { label: 'Photo de profil',    score: 12, max: 15, pct: 80,  color: '#10B981', bg: '#DCFCE7', tc: '#15803D', tag: 'Bon',            icon: '📸' },
  { label: 'Bannière',           score: 7,  max: 20, pct: 35,  color: '#EF4444', bg: '#FEE2E2', tc: '#DC2626', tag: 'À retravailler', icon: '🖼️' },
  { label: 'Titre du profil',    score: 11, max: 20, pct: 55,  color: '#F59E0B', bg: '#FEF9C3', tc: '#A16207', tag: 'Moyen',          icon: '✏️' },
  { label: 'Section À propos',   score: 9,  max: 15, pct: 60,  color: '#F59E0B', bg: '#FEF9C3', tc: '#A16207', tag: 'Moyen',          icon: '👤' },
  { label: 'Sélection de posts', score: 4,  max: 10, pct: 40,  color: '#EF4444', bg: '#FEE2E2', tc: '#DC2626', tag: 'À retravailler', icon: '📌' },
  { label: 'Contenu publié',     score: 5,  max: 10, pct: 50,  color: '#F59E0B', bg: '#FEF9C3', tc: '#A16207', tag: 'Moyen',          icon: '📝' },
  { label: 'Expériences',        score: 3,  max: 5,  pct: 60,  color: '#F59E0B', bg: '#FEF9C3', tc: '#A16207', tag: 'Moyen',          icon: '💼' },
  { label: 'Crédibilité',        score: 16, max: 20, pct: 80,  color: '#10B981', bg: '#DCFCE7', tc: '#15803D', tag: 'Bon',            icon: '⭐' },
]

function UrlTypingAnimation() {
  const full = 'linkedin.com/in/ton-profil'
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'pause' | 'erasing'>('typing')

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    if (phase === 'typing') {
      if (displayed.length < full.length) {
        timeout = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 1)), 60)
      } else {
        timeout = setTimeout(() => setPhase('pause'), 1800)
      }
    } else if (phase === 'pause') {
      timeout = setTimeout(() => setPhase('erasing'), 400)
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(full.slice(0, displayed.length - 1)), 30)
      } else {
        timeout = setTimeout(() => setPhase('typing'), 600)
      }
    }
    return () => clearTimeout(timeout)
  }, [displayed, phase])

  return (
    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', flex: 1 }}>
      {displayed}<span style={{ opacity: phase === 'erasing' ? 0 : 1, animation: 'blink 1s infinite' }}>|</span>
    </span>
  )
}

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [displayScore, setDisplayScore] = useState(0)
  const [barsVisible, setBarsVisible] = useState(false)
  const scoreRef = useRef<HTMLDivElement>(null)
  const [profileLink, setProfileLink] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) { setError("Merci d'accepter de recevoir ton analyse par mail."); return }
    if (!profileLink) { setError('Merci de renseigner ton lien LinkedIn.'); return }
    if (!email) { setError('Merci de renseigner ton adresse email.'); return }
    setError('')
    setLoading(true)
    try {
      await fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, profileLink }) })
      setSubmitted(true)
    } catch {
      setError('Une erreur est survenue. Réessaie dans quelques secondes.')
    } finally {
      setLoading(false)
    }
  }

  const total = CRITERES.reduce((a, c) => a + c.score, 0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const ORBS = [
      { color: [41,  121, 255], opacity: 0.55, r: 0.42, fx: 0.0055, fy: 0.0037, phase: 0.0  },
      { color: [99,  57,  229], opacity: 0.48, r: 0.38, fx: 0.0031, fy: 0.0063, phase: 1.3  },
      { color: [14,  165, 233], opacity: 0.38, r: 0.34, fx: 0.0071, fy: 0.0048, phase: 2.7  },
      { color: [168, 85,  247], opacity: 0.32, r: 0.30, fx: 0.0042, fy: 0.0029, phase: 4.1  },
      { color: [41,  121, 255], opacity: 0.40, r: 0.36, fx: 0.0058, fy: 0.0082, phase: 5.5  },
    ]

    let t = 0
    function draw() {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      ORBS.forEach(o => {
        const x = W * (0.5 + 0.42 * Math.sin(t * o.fx + o.phase))
        const y = H * (0.5 + 0.42 * Math.cos(t * o.fy + o.phase * 0.7))
        const r = o.r * Math.max(W, H)

        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0,   `rgba(${o.color},${o.opacity})`)
        g.addColorStop(0.45,`rgba(${o.color},${+(o.opacity * 0.25).toFixed(2)})`)
        g.addColorStop(1,   `rgba(${o.color},0)`)

        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      })

      t++
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = scoreRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setBarsVisible(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!barsVisible) return
    let frame = 0
    const target = total
    const duration = 90
    const tick = () => {
      frame++
      const progress = Math.min(frame / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * target))
      if (frame < duration) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [barsVisible, total])

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B1929', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(41,121,255,0.12)', border: '1px solid rgba(41,121,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#2979FF', fontWeight: 700, fontSize: '18px' }}>✓</div>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>C'est en route.</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', lineHeight: 1.7 }}>Ton rapport arrive à <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{email}</span> dans moins de 5 minutes.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Canvas animé global — couvre toute la page en fixed */}
      <canvas ref={canvasRef} aria-hidden style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; background: #040C16; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(41,121,255,0); }
          50%       { box-shadow: 0 0 32px 8px rgba(41,121,255,0.15); }
        }
        .reveal { opacity: 0; }
        .reveal.in { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards; }
        .reveal.in.d1 { animation-delay: 0.12s; }
        .reveal.in.d2 { animation-delay: 0.24s; }
        .reveal.in.d3 { animation-delay: 0.36s; }
        .float { animation: float 6s ease-in-out infinite; }
        .float-slow { animation: float 9s ease-in-out infinite; }
        .pulse { animation: pulse-glow 4s ease-in-out infinite; }

        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes bar-in { from{width:0} }
        @keyframes grain  { 0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 30%{transform:translate(3%,2%)} 50%{transform:translate(-1%,4%)} 70%{transform:translate(2%,-2%)} 90%{transform:translate(-3%,1%)} }

        @keyframes m1 {
          0%   { transform: translate(0%,   0%)   scale(1);   }
          20%  { transform: translate(8%,  -12%)  scale(1.08); }
          45%  { transform: translate(-6%,  8%)   scale(0.95); }
          70%  { transform: translate(10%, -5%)   scale(1.05); }
          100% { transform: translate(0%,   0%)   scale(1);   }
        }
        @keyframes m2 {
          0%   { transform: translate(0%,  0%)   scale(1);   }
          25%  { transform: translate(-9%, 10%)  scale(1.06); }
          55%  { transform: translate(7%,  -8%)  scale(0.92); }
          80%  { transform: translate(-4%, 6%)   scale(1.03); }
          100% { transform: translate(0%,  0%)   scale(1);   }
        }
        @keyframes m3 {
          0%   { transform: translate(0%,   0%)  scale(1);   }
          30%  { transform: translate(12%, -6%)  scale(0.9);  }
          60%  { transform: translate(-8%, 12%)  scale(1.1);  }
          85%  { transform: translate(5%,  -3%)  scale(0.97); }
          100% { transform: translate(0%,   0%)  scale(1);   }
        }
        @keyframes m4 {
          0%   { transform: translate(0%,  0%)   scale(1);   }
          35%  { transform: translate(-6%,-10%)  scale(1.07); }
          65%  { transform: translate(9%,  7%)   scale(0.93); }
          100% { transform: translate(0%,  0%)   scale(1);   }
        }
        @keyframes m5 {
          0%   { transform: translate(0%,  0%)   scale(1);   }
          40%  { transform: translate(5%,  9%)   scale(1.05); }
          75%  { transform: translate(-7%, -4%)  scale(0.96); }
          100% { transform: translate(0%,  0%)   scale(1);   }
        }

        .score-bar { animation: bar-in 1.4s cubic-bezier(0.16,1,0.3,1) forwards; }

        .field {
          width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
          padding: 12px 15px; font-size: 14px; font-family: 'Inter', sans-serif;
          color: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field::placeholder { color: rgba(255,255,255,0.3); }
        .field:focus { border-color: #2979FF; box-shadow: 0 0 0 3px rgba(41,121,255,0.15); }

        .submit {
          width: 100%; background: #2979FF; color: #fff; font-weight: 700; font-size: 15px;
          font-family: 'Inter', sans-serif; padding: 14px; border-radius: 10px; border: none;
          cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
          box-shadow: 0 4px 18px rgba(41,121,255,0.35);
        }
        .submit:hover:not(:disabled) { background: #1a68ff; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(41,121,255,0.48); }
        .submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .hero-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #2979FF; color: #fff; font-weight: 700; font-size: 15px;
          font-family: 'Inter', sans-serif; padding: 14px 28px; border-radius: 10px; border: none;
          cursor: pointer; text-decoration: none;
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
          box-shadow: 0 4px 20px rgba(41,121,255,0.4);
        }
        .hero-cta:hover { background: #1a68ff; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(41,121,255,0.5); }

        .tog { padding: 7px 15px; border-radius: 7px; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }

        @media (max-width: 960px) {
          .hero-inner  { flex-direction: column !important; }
          .hero-right  { display: none !important; }
          .hero-title  { font-size: 42px !important; letter-spacing: -1.5px !important; }
          .carousel-track::-webkit-scrollbar { display: none; }
          .form-inner  { flex-direction: column !important; }
          .form-box    { width: 100% !important; }
          .mock-layout { flex-direction: column !important; }
          .mock-right  { display: none !important; }
          .grid-temoignages { grid-template-columns: 1fr !important; }
          .grid-score       { grid-template-columns: 1fr !important; }
          .grid-dashboard   { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-stats       { display: none !important; }
          .section-padding  { padding: 64px 24px !important; }
          .hero-cta-row     { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>


      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section style={{
        background: 'transparent',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 0 0',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* ── Dot grid ── */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)' }} />

        {/* ── Grain ── */}
        <div aria-hidden style={{ position: 'absolute', inset: '-50%', width: '200%', height: '200%', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`, animation: 'grain 8s steps(10) infinite', pointerEvents: 'none' }} />

        {/* ── Vignette — recentre le regard ── */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 90% at 50% 45%, transparent 35%, rgba(4,12,22,0.80) 100%)', pointerEvents: 'none' }} />

        {/* ── Contenu texte ── */}
        <div style={{ textAlign: 'center', padding: '0 32px', marginBottom: '32px', position: 'relative', zIndex: 2 }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 12px', background: 'rgba(41,121,255,0.08)', border: '1px solid rgba(41,121,255,0.18)', borderRadius: '9999px', marginBottom: '20px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2979FF', display: 'inline-block', animation: 'blink 2.5s infinite', flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Analyse gratuite · Experts &amp; dirigeants B2B</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(38px, 4.2vw, 60px)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2.5px',
            color: '#fff', maxWidth: '740px', margin: '0 auto 16px',
          }}>
            Reconnu dans ton secteur.<br />
            <span style={{ color: '#2979FF' }}>Encore invisible sur LinkedIn.</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto 24px' }}>
            Tu as l'expertise. Les références. La légitimité.<br />
            Ton profil ne le montre pas encore.
          </p>

          <div className="hero-cta-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <a href="#formulaire" className="hero-cta">Voir mon score LinkedIn →</a>
            <div className="hero-stats" style={{ display: 'flex', gap: '20px', paddingLeft: '4px', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
              {[{ n: '+700', l: 'profils' }, { n: '8', l: 'critères' }, { n: '5 min', l: 'résultat' }].map(s => (
                <div key={s.n} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.5px' }}>{s.n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Dashboard qui émerge du bas ── */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', padding: '0 32px' }}>
          <div className="float-slow pulse" style={{
            width: '100%', maxWidth: '900px',
            background: 'linear-gradient(180deg, #0F1E30 0%, #0B1929 100%)',
            borderRadius: '16px 16px 0 0',
            border: '1px solid rgba(255,255,255,0.07)',
            borderBottom: 'none',
            boxShadow: '0 -8px 60px rgba(41,121,255,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>

            {/* ligne bleue en haut */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #2979FF 30%, #60A5FA 70%, transparent)', opacity: 0.8 }} />

            {/* score header */}
            <div style={{ padding: '20px 28px 20px', display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Score global</p>
                  <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}>·</span>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 500 }}>Sophie M. <span style={{ color: 'rgba(255,255,255,0.2)' }}>— Co-dirigeante PME</span></p>
                </div>
                <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div className="score-bar" style={{ position: 'absolute', inset: '0 auto 0 0', width: `${total}%`, background: 'linear-gradient(90deg, #1565FF, #2979FF, #60A5FA)', borderRadius: '100px', boxShadow: '0 0 20px rgba(41,121,255,0.8)' }} />
                </div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', justifyContent: 'flex-end' }}>
                  <span style={{ color: '#2979FF', fontSize: '52px', fontWeight: 900, lineHeight: 1, letterSpacing: '-3px', textShadow: '0 0 40px rgba(41,121,255,0.5)' }}>{total}</span>
                  <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '20px', fontWeight: 700 }}>/100</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#F59E0B' }}>Fort potentiel · points critiques</span>
                </div>
              </div>
            </div>

            {/* grille 4×2 — cartes métriques */}
            <div className="grid-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
              {CRITERES.map((c, i) => {
                const size = 52
                const stroke = 4
                const r = (size - stroke) / 2
                const circ = 2 * Math.PI * r
                const dash = (c.pct / 100) * circ
                return (
                  <div key={i} style={{
                    padding: '18px 16px',
                    borderRight: i % 4 < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    background: `radial-gradient(ellipse at 50% 0%, ${c.color}08 0%, transparent 70%)`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* cercle SVG */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c.color} strokeWidth={stroke}
                            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 4px ${c.color})` }} />
                        </svg>
                        {/* score au centre */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', lineHeight: 1 }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{c.score}</span>
                          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>/{c.max}</span>
                        </div>
                      </div>
                      {/* label + tag */}
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3, marginBottom: '4px' }}>{c.label}</p>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: c.tc, background: c.bg, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.04em' }}>{c.tag}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* recommandation */}
            <div style={{ padding: '16px 28px', display: 'flex', gap: '14px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(41,121,255,0.05)' }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, flex: 1 }}>
                <span style={{ color: '#60A5FA', fontWeight: 600 }}>Priorité n°1 · Bannière — </span>
                Ta bannière ne communique aucun message sur ton expertise. Crée-en une qui exprime ton positionnement en 3 secondes.
              </p>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', flexShrink: 0, whiteSpace: 'nowrap' }}>+6 analyses complètes →</span>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          APERÇU DU RAPPORT
      ═══════════════════════════════ */}
      <section className="section-padding" style={{ background: 'transparent', padding: '96px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Header */}
          <div className="reveal" style={{ marginBottom: '64px', textAlign: 'center' }}>
            <p style={{ color: '#2979FF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Ce que tu vas recevoir</p>
            <h2 style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-1.2px', lineHeight: 1.1, color: '#fff', maxWidth: '560px', margin: '0 auto' }}>
              Un diagnostic sur chaque pilier{' '}
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>de ta visibilité.</span>
            </h2>
          </div>

          {/* Layout 2 colonnes — score + barres */}
          <div ref={scoreRef} className="grid-score" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px', alignItems: 'stretch' }}>

            {/* Colonne gauche — score global + exemple analyse */}
            <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Score card */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Score global · Exemple</p>

                {/* Compteur animé */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '72px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-4px', fontVariantNumeric: 'tabular-nums' }}>{displayScore}</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>/100</span>
                  </div>

                  {/* Barre score global */}
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: barsVisible ? `${total}%` : '0%', background: 'linear-gradient(90deg, #1565FF, #2979FF, #60A5FA)', borderRadius: '100px', transition: 'width 1.6s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 0 16px rgba(41,121,255,0.6)' }} />
                  </div>
                </div>

                <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600, lineHeight: 1.5 }}>Profil à fort potentiel — 3 axes prioritaires identifiés</p>
                </div>
              </div>

              {/* Exemple carte analyse — bannière */}
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '16px', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '2px' }}>Bannière</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Première impression visuelle</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#EF4444', letterSpacing: '-0.5px', lineHeight: 1 }}>7<span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.2)' }}>/20</span></div>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.15)', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>À retravailler</span>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: '12px' }}>Ta bannière ne communique aucun message sur ton expertise. Un visiteur ne comprend pas en une seconde ce que tu fais.</p>
                <div style={{ background: 'rgba(41,121,255,0.08)', border: '1px solid rgba(41,121,255,0.18)', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 600 }}>💡 Crée une bannière qui exprime ton positionnement en 3 secondes.</p>
                </div>
              </div>
            </div>

            {/* Colonne droite — 8 critères avec barres animées */}
            <div className="reveal d1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Les 8 critères analysés</p>
              </div>
              <div style={{ padding: '8px 0' }}>
                {CRITERES.map((c, i) => (
                  <div key={i} style={{ padding: '13px 24px', borderBottom: i < CRITERES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{c.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: c.tc, background: c.bg, padding: '2px 7px', borderRadius: '4px' }}>{c.tag}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: c.color, minWidth: '32px', textAlign: 'right' }}>{c.score}/{c.max}</span>
                      </div>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: barsVisible ? `${c.pct}%` : '0%', background: c.color, borderRadius: '2px', transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s`, boxShadow: `0 0 8px ${c.color}80` }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Footer */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(41,121,255,0.05)' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>+ recommandations concrètes pour chaque critère · reçu par email</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          TEMOIGNAGES
      ═══════════════════════════════ */}
      <section className="section-padding" style={{ background: 'transparent', padding: '96px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1.2px', lineHeight: 1.15, color: '#fff', marginBottom: '12px' }}>
              Leur avis,{' '}
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>sans filtre.</span>
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>Des experts B2B qui ont voulu savoir où ils en étaient.</p>
          </div>

          <div className="grid-temoignages" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {TEMOIGNAGES.map((t, i) => {
              const isHovered = hoveredCard === i
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`reveal d${i + 1}`}
                  style={{ background: isHovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isHovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease', transform: isHovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: isHovered ? '0 20px 48px rgba(0,0,0,0.35)' : 'none', cursor: 'default' }}>

                  {/* Citation en premier — ce qui compte */}
                  <div style={{ padding: '28px 28px 20px', flex: 1 }}>
                    <div aria-hidden style={{ fontSize: '52px', fontWeight: 900, color: isHovered ? 'rgba(41,121,255,0.3)' : 'rgba(255,255,255,0.07)', lineHeight: 1, marginBottom: '2px', fontFamily: 'Georgia, serif', transition: 'color 0.25s' }}>"</div>
                    <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '14px', lineHeight: 1.85, marginTop: '-10px' }}>
                      {t.texte}
                    </p>
                  </div>

                  {/* Séparateur */}
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 28px' }} />

                  {/* Identité */}
                  <div style={{ padding: '18px 28px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={t.photo}
                        alt={t.nom}
                        width={44}
                        height={44}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', display: 'block', border: `2px solid ${isHovered ? 'rgba(41,121,255,0.6)' : 'rgba(255,255,255,0.1)'}`, transition: 'border-color 0.25s' }}
                      />
                      <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: '#0A66C2', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0B1929' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '13px', color: '#fff', marginBottom: '2px' }}>{t.nom}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{t.poste}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
                      {[...Array(5)].map((_,j) => <svg key={j} width="10" height="10" viewBox="0 0 24 24" fill={isHovered ? '#FBBF24' : 'rgba(255,255,255,0.2)'} style={{ transition: 'fill 0.25s' }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                    </div>
                  </div>

                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════
          FORMULAIRE
      ═══════════════════════════════ */}
      <section id="formulaire" className="section-padding" style={{ background: 'transparent', padding: '96px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="form-inner reveal" style={{ display: 'flex', gap: '80px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#2979FF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Évalue ton profil</p>
              <h2 style={{ fontSize: '34px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.12, marginBottom: '14px' }}>Ton profil reflète-t-il<br />ton niveau d'expertise ?</h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', lineHeight: 1.8, marginBottom: '40px' }}>En 5 minutes, tu reçois un diagnostic complet sur les 8 piliers de ta visibilité — avec des recommandations concrètes, pas des généralités.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {['Ton positionnement est-il lisible pour un inconnu ?', 'Ta crédibilité transparaît-elle dès les premières secondes ?', 'Ton profil génère-t-il des opportunités entrantes ?', 'Rapport complet par email · Gratuit · En 5 minutes.'].map((txt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid rgba(41,121,255,0.35)', background: 'rgba(41,121,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><polyline points="1,4 3,6 7,2" stroke="#2979FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', lineHeight: 1.65 }}>{txt}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-box" style={{ flexShrink: 0, width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Tutoriel animé — où trouver son URL */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
                <p style={{ padding: '12px 16px 10px', color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  Où trouver ton lien LinkedIn ?
                </p>
                {/* Fausse barre de navigateur */}
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ background: '#0A1520', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {/* Chrome bar */}
                    <div style={{ background: '#111C2A', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['#FF5F57','#FFBD2E','#28C840'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
                      </div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '5px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/></svg>
                        <UrlTypingAnimation />
                      </div>
                    </div>
                    {/* Fausse page LinkedIn */}
                    <div style={{ padding: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2979FF, #60A5FA)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, width: '60%', marginBottom: 6 }} />
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 4, width: '80%' }} />
                      </div>
                    </div>
                    <div style={{ padding: '0 14px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: 'rgba(41,121,255,0.15)', border: '1px solid rgba(41,121,255,0.3)', borderRadius: '6px', padding: '6px 12px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#60A5FA' }}>① Clique sur "Moi" → "Voir le profil"</p>
                      </div>
                    </div>
                    <div style={{ margin: '0 14px 14px', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px dashed rgba(41,121,255,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2979FF" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>linkedin.com/in/<span style={{ color: '#60A5FA', fontWeight: 700 }}>ton-nom</span></p>
                      <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#2979FF', fontWeight: 700 }}>② Copie l&apos;URL ici</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '16px', padding: '28px' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Colle ton lien LinkedIn</p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input className="field" type="url" placeholder="https://linkedin.com/in/ton-profil" value={profileLink} onChange={e => setProfileLink(e.target.value)} />
                  <input className="field" type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <label style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', cursor: 'pointer', marginTop: '2px' }}>
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '3px', accentColor: '#2979FF', flexShrink: 0, cursor: 'pointer' }} />
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', lineHeight: 1.6 }}>J&apos;accepte de recevoir mon analyse et d&apos;autres contenus par email.</span>
                  </label>
                  {error && <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: 500 }}>{error}</p>}
                  <button type="submit" disabled={loading} className="submit" style={{ marginTop: '4px' }}>
                    {loading ? 'Analyse en cours…' : 'Évaluer mon profil →'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <img src="/romain-face.jpeg" alt="Romain Bour" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '12px', color: '#fff' }}>Romain Bour</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', marginTop: '2px' }}>Expert Branding B2B · +90 dirigeants accompagnés</p>
          </div>
        </div>
        <a href="https://www.linkedin.com/in/romainbour/" target="_blank" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>LinkedIn →</a>
      </footer>
    </>
  )
}
