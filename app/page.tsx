'use client'

import { useState, useEffect, useRef } from 'react'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || ''


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
  const full = 'linkedin.com/in/votre-profil'
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
    <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace', flex: 1 }}>
      {displayed}<span style={{ opacity: phase === 'erasing' ? 0 : 1, animation: 'blink 1s infinite' }}>|</span>
    </span>
  )
}

export default function HomePage() {
  const [displayScore, setDisplayScore] = useState(0)
  const [barsVisible, setBarsVisible] = useState(false)
  const scoreRef = useRef<HTMLDivElement>(null)
  const [profileLink, setProfileLink] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [scanPhase, setScanPhase] = useState(0)
  const [overlayScore, setOverlayScore] = useState(0)
  const scanTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Count-up 0→67 when score reveal starts
  useEffect(() => {
    if (scanPhase < 6) { setOverlayScore(0); return }
    let frame = 0
    const target = 67
    const duration = 60
    const tick = () => {
      frame++
      const progress = Math.min(frame / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setOverlayScore(Math.round(eased * target))
      if (frame < duration) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [scanPhase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) { setError("Merci d'accepter de recevoir votre analyse par mail."); return }
    if (!profileLink) { setError('Merci de renseigner votre lien LinkedIn.'); return }
    if (!email) { setError('Merci de renseigner votre adresse email.'); return }
    setError('')
    setLoading(true)
    try {
      await fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, lien: profileLink }) })
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
    // Full-screen hero: slower scan to cross full viewport height
    const timings = [0, 1600, 2400, 3100, 3700, 4300, 5200, 8500]
    const runLoop = () => {
      scanTimers.current.forEach(clearTimeout)
      scanTimers.current = []
      timings.forEach((ms, i) => {
        scanTimers.current.push(setTimeout(() => setScanPhase(i === 7 ? 0 : i), ms))
      })
      scanTimers.current.push(setTimeout(runLoop, 9200))
    }
    runLoop()
    return () => scanTimers.current.forEach(clearTimeout)
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
      <div style={{ minHeight: '100vh', background: '#f9f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#2979FF', fontWeight: 700, fontSize: '18px' }}>✓</div>
          <h2 style={{ color: '#0f1117', fontSize: '22px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>C'est en route.</h2>
          <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.7 }}>Votre rapport arrive à <span style={{ color: '#0f1117', fontWeight: 600 }}>{email}</span> dans moins de 5 minutes.</p>
          <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.7, marginTop: '16px', padding: '14px 16px', background: '#f3f4f6', borderRadius: '10px', textAlign: 'left' }}>
            Si vous ne le voyez pas dans votre boite principale, vérifiez l'onglet <strong style={{ color: '#6b7280' }}>Promotions</strong> ainsi que vos <strong style={{ color: '#6b7280' }}>spams</strong>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Nav bar ── */}
      <nav className="nav-bar">
        <a href="/" className="nav-logo">
          <div className="nav-logo-mark">O</div>
          <span className="nav-logo-text">optin<span>.ia</span></span>
        </a>
        <div className="nav-badge-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'blink 2.5s infinite' }} />
            <span style={{ color: '#9ca3af', fontSize: '11px', fontWeight: 500 }}>+700 profils analysés</span>
          </div>
          <a href="#formulaire" className="nav-cta-small">Analyser mon profil →</a>
        </div>
      </nav>

      {/* Canvas animé global — couvre toute la page en fixed */}
      <canvas ref={canvasRef} aria-hidden style={{ display: 'none' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; background: #f9f8f6; color: #0f1117; }

        .nav-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 60px;
          background: rgba(249,248,246,0.88);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .nav-logo-mark {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg, #1D4ED8 0%, #2979FF 60%, #60A5FA 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 900; color: #fff; letter-spacing: -0.5px;
          font-family: 'Inter', sans-serif;
        }
        .nav-logo-text {
          font-size: 16px; font-weight: 800; letter-spacing: -0.5px; color: #0f1117;
        }
        .nav-logo-text span { color: #2979FF; }
        .nav-cta-small {
          display: inline-flex; align-items: center; gap: 6px;
          background: #0f1117; border: none;
          color: #fff; font-weight: 700; font-size: 13px;
          padding: 8px 18px; border-radius: 8px; text-decoration: none;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s, opacity 0.15s;
        }
        .nav-cta-small:hover { background: #2979FF; }
        @media (max-width: 640px) { .nav-bar { padding: 0 20px; } .nav-badge-nav { display: none !important; } }
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
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes badge-pop {
          0%   { transform: scale(0.6) translateY(8px); opacity: 0; }
          65%  { transform: scale(1.06) translateY(-1px); opacity: 1; }
          100% { transform: scale(1)   translateY(0);    opacity: 1; }
        }
        @keyframes scan-descend {
          0%   { top: 0%;   opacity: 1; }
          95%  { top: 100%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes score-in {
          0%   { opacity: 0; transform: scale(0.7); }
          65%  { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        /* Bande scan IA — large, lumineuse */
        .li-scan-band {
          position: absolute; left: 0; right: 0; height: 90px;
          z-index: 20; pointer-events: none;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(41,121,255,0.04) 15%,
            rgba(41,121,255,0.13) 40%,
            rgba(41,121,255,0.20) 50%,
            rgba(41,121,255,0.13) 60%,
            rgba(41,121,255,0.04) 85%,
            transparent 100%
          );
          border-top: 2px solid rgba(41,121,255,0.75);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.08) inset,
            0 -2px 0 rgba(41,121,255,0.3),
            0 0 60px rgba(41,121,255,0.5),
            0 0 160px rgba(41,121,255,0.18);
          animation: scan-descend 3.3s cubic-bezier(0.4,0,0.55,1) forwards;
        }
        /* Ligne fine au bord avant de la bande */
        .li-scan-band::before {
          content: '';
          position: absolute; top: -1px; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg,
            transparent 0%, rgba(255,255,255,0.4) 8%,
            #60A5FA 25%, #fff 50%, #60A5FA 75%,
            rgba(255,255,255,0.4) 92%, transparent 100%
          );
          filter: blur(0.5px);
        }
        @keyframes stagger-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .s0 { animation: stagger-in 0.5s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.05s; }
        .s1 { animation: stagger-in 0.5s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.2s; }
        .s2 { animation: stagger-in 0.5s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.38s; }
        .s3 { animation: stagger-in 0.5s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.52s; }
        .s4 { animation: stagger-in 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.68s; }
        .s5 { animation: stagger-in 0.6s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 0.85s; }
        .li-badge-enter { animation: badge-pop 0.45s cubic-bezier(0.16,1,0.3,1) forwards; }
        .li-score-enter { animation: score-in 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .li-overlay-enter { animation: overlay-in 0.6s ease forwards; }

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
          width: 100%; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
          padding: 12px 15px; font-size: 14px; font-family: 'Inter', sans-serif;
          color: #0f1117; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field::placeholder { color: #9ca3af; }
        .field:focus { border-color: #2979FF; box-shadow: 0 0 0 3px rgba(41,121,255,0.1); }

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
          .hero-dashboard   { display: none !important; }
          .section-padding  { padding: 64px 24px !important; }
          .hero-cta-row     { flex-direction: column !important; align-items: flex-start !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-mockup-col { display: none !important; }
          .hero-section { padding: 48px 24px 56px !important; }
          .stats-section { padding: 48px 24px !important; }
          .grid-3-stats { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-mockup-col { display: none !important; }
          .hero-section { padding: 32px 20px 48px !important; min-height: auto !important; }
          .stats-section { padding: 40px 20px !important; }
          .grid-3-stats { grid-template-columns: 1fr !important; }
          .hero-cta { white-space: nowrap !important; width: 100% !important; justify-content: center !important; box-sizing: border-box !important; }
        }
      `}</style>


      {/* ═══════════════════════════════════════
          HERO — 2 colonnes épuré
      ═══════════════════════════════════════ */}
      <section className="hero-section" style={{
        minHeight: 'calc(100vh - 60px)',
        position: 'relative',
        display: 'flex', alignItems: 'center',
        padding: '80px 40px',
        zIndex: 1,
        fontFamily: 'Inter, sans-serif',
      }}>

        {/* ── LAYOUT 2 COLONNES ── */}
        <div className="hero-grid" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '64px', alignItems: 'center' }}>

          {/* ─── Colonne gauche : copywriting ─── */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2979FF', marginBottom: '20px' }}>Audit LinkedIn gratuit</p>
            <h1 style={{ fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1.5px', color: '#0f1117', marginBottom: '20px' }}>
              Démarquez-vous avec un profil LinkedIn{' '}
              <span style={{ color: '#2979FF' }}>à la hauteur de votre expertise.</span>
            </h1>
            <p style={{ fontSize: '17px', color: '#6b7280', lineHeight: 1.7, marginBottom: '32px', maxWidth: '440px' }}>
              Votre profil LinkedIn vous fait perdre des opportunités. Découvrez exactement ce qui bloque, en 5 minutes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
              {['Votre score sur 100 avec le détail par critère', 'Les 3 points qui freinent le plus votre visibilité', 'Des recommandations concrètes reçues par email'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(41,121,255,0.1)', border: '1px solid rgba(41,121,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#2979FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
            <a href="#formulaire" className="hero-cta" style={{ fontSize: '16px', padding: '15px 32px', marginBottom: '24px', display: 'inline-flex' }}>
              Analyser mon profil gratuitement →
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
              {/* Avatar group */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[
                  { initials: 'ML', bg: '#1D4ED8' },
                  { initials: 'SR', bg: '#7C3AED' },
                  { initials: 'AT', bg: '#0891B2' },
                  { initials: 'PD', bg: '#059669' },
                  { initials: 'CB', bg: '#DC2626' },
                ].map((a, i) => (
                  <div key={i} style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: a.bg,
                    border: '2px solid #f9f8f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 800, color: '#fff', letterSpacing: '0.02em',
                    marginLeft: i === 0 ? 0 : '-8px',
                    position: 'relative', zIndex: 5 - i,
                    flexShrink: 0,
                  }}>{a.initials}</div>
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                <span style={{ fontWeight: 700 }}>+700 experts</span> ont déjà leur score
              </span>
            </div>
          </div>

          {/* ─── Colonne droite : profil LinkedIn mockup + overlay résultat ─── */}
          <div className="hero-mockup-col" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingRight: '20px', paddingBottom: '20px' }}>
            <div style={{ width: '100%', maxWidth: '480px', position: 'relative', animation: 'float 7s ease-in-out infinite' }}>

              {/* Conteneur fond neutre */}
              <div style={{ background: 'linear-gradient(140deg, #F5F4F0 0%, #EDEAE4 100%)', borderRadius: '20px', padding: '20px', boxShadow: '0 24px 60px rgba(0,0,0,0.10)' }}>

                {/* Mockup profil professionnel — style original, pas LinkedIn */}
                <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', fontFamily: 'Inter, sans-serif' }}>

                  {/* Bannière abstraite — palette originale */}
                  <div style={{ height: '88px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', position: 'relative' }}>
                    {/* Formes géométriques abstraites */}
                    <div style={{ position: 'absolute', top: '12px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ position: 'absolute', bottom: '8px', right: '60px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                  </div>

                  {/* Zone profil */}
                  <div style={{ padding: '0 20px 16px', position: 'relative' }}>
                    <div style={{ marginTop: '-32px', marginBottom: '8px' }}>
                      <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'linear-gradient(145deg, #374151, #1f2937)', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#fff' }}>S</div>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f1117', marginBottom: '3px' }}>Sophie Martin</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.4 }}>Consultante RH · Experte formation · Paris</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ height: '7px', background: '#f3f4f6', borderRadius: '3px', width: '88%' }} />
                      <div style={{ height: '7px', background: '#f3f4f6', borderRadius: '3px', width: '72%' }} />
                    </div>
                  </div>

                  {/* Section À propos simulée */}
                  <div style={{ borderTop: '6px solid #f3f4f6', padding: '14px 20px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f1117', marginBottom: '10px' }}>À propos</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', width: '96%' }} />
                      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', width: '82%' }} />
                      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', width: '90%' }} />
                    </div>
                  </div>

                  {/* Section Expériences simulée */}
                  <div style={{ borderTop: '6px solid #f3f4f6', padding: '14px 20px 16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f1117', marginBottom: '10px' }}>Expériences</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', background: '#e5e7eb', borderRadius: '6px', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                        <div style={{ height: '7px', background: '#f3f4f6', borderRadius: '3px', width: '70%' }} />
                        <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', width: '55%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay résultat audit — flotte en bas à droite */}
              <div style={{
                position: 'absolute', bottom: '-14px', right: '-14px',
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: '16px', padding: '16px 18px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.14)',
                width: '200px',
                fontFamily: 'Inter, sans-serif',
              }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>Résultat de l&apos;analyse</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '40px', fontWeight: 900, color: '#2979FF', letterSpacing: '-2px', lineHeight: 1 }}>67</span>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#d1d5db' }}>/100</span>
                </div>
                <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '100px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ height: '100%', width: '67%', background: 'linear-gradient(90deg, #1565FF, #2979FF)', borderRadius: '100px' }} />
                </div>
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>3 priorités identifiées</p>
                {[
                  { label: 'Bannière', color: '#EF4444' },
                  { label: 'Titre du profil', color: '#F59E0B' },
                  { label: 'Sélection de posts', color: '#EF4444' },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: i < 2 ? '5px' : 0 }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#374151' }}>{p.label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* ═══════════════════════════════
          POURQUOI C'EST IMPORTANT
      ═══════════════════════════════ */}
      <section className="stats-section" style={{ background: '#0f1117', padding: '72px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <div className="reveal" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.15, color: '#fff', maxWidth: '640px', margin: '0 auto' }}>
              Votre profil LinkedIn est votre{' '}
              <span style={{ color: '#2979FF' }}>première impression en ligne.</span>
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', marginTop: '16px', maxWidth: '520px', margin: '16px auto 0', lineHeight: 1.7 }}>
              Quand vous rencontrez quelqu'un, la première chose qu'il fait, c'est vous chercher sur Google. Votre profil LinkedIn arrive en premier résultat. Toujours.
            </p>
          </div>

          {/* 3 stat cards */}
          <div className="reveal d1 grid-3-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1px' }}>
            {[
              {
                stat: '#1',
                title: 'Résultat Google',
                label: 'Avant chaque rendez-vous, chaque mise en relation, chaque opportunité : les gens cherchent votre nom. Votre profil LinkedIn arrive en premier résultat. Toujours.*',
                source: '* BrightEdge Research, 2024',
              },
              {
                stat: '+30%',
                title: 'De vues en plus',
                label: 'Un profil LinkedIn complet et optimisé génère 30 % de vues supplémentaires chaque semaine, sans rien changer à votre activité.*',
                source: '* LinkedIn Official Data, 2026',
              },
              {
                stat: '89%',
                title: 'Des décideurs y sont',
                label: 'Cadres, dirigeants, acheteurs, recruteurs, partenaires potentiels : 9 professionnels à responsabilités sur 10 sont actifs sur LinkedIn.*',
                source: '* LinkedIn, 2026',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: '#161b27', padding: '32px 28px' }}>
                <p style={{ fontSize: '44px', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1, marginBottom: '6px' }}>{item.stat}</p>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#2979FF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.7, marginBottom: '12px' }}>{item.label}</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.source}</p>
              </div>
            ))}
          </div>

          {/* Audience card — who's on LinkedIn */}
          <div className="reveal d2" style={{ background: '#161b27', borderRadius: '16px', padding: '32px 36px', marginTop: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px', flexWrap: 'wrap' }}>
              <div style={{ flexShrink: 0 }}>
                <p style={{ fontSize: '44px', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1, marginBottom: '4px' }}>38M</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>membres en France</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>80 % de la population active</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '14px', fontWeight: 500 }}>Votre cible est là, quelle que soit votre activité :</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Consultants', 'Coachs', 'Avocats', 'Dirigeants', 'Formateurs', 'Ingénieurs', 'RH & Recruteurs', 'Commerciaux', 'Experts-comptables', 'Médecins', 'Architectes', 'Thérapeutes', 'Freelances', 'Entrepreneurs'].map((tag) => (
                    <span key={tag} style={{ display: 'inline-block', padding: '5px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════
          APERÇU DU RAPPORT
      ═══════════════════════════════ */}
      <section className="section-padding" style={{ background: '#fff', padding: '96px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          <div className="reveal" style={{ marginBottom: '64px', textAlign: 'center' }}>
            <p style={{ color: '#2979FF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Ce que vous allez recevoir</p>
            <h2 style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-1.2px', lineHeight: 1.1, color: '#0f1117', maxWidth: '560px', margin: '0 auto' }}>
              Un diagnostic sur chaque pilier{' '}
              <span style={{ color: '#9ca3af' }}>de votre profil LinkedIn.</span>
            </h2>
          </div>

          {/* Grand card unifié */}
          <div ref={scoreRef} className="reveal" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>

            {/* Section principale : score + critères */}
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr' }}>

              {/* Gauche : score */}
              <div style={{ padding: '28px 24px', borderRight: '1px solid #f3f4f6', background: '#f9f8f6', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af' }}>Score global</p>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '64px', fontWeight: 900, color: '#0f1117', lineHeight: 1, letterSpacing: '-3px', fontVariantNumeric: 'tabular-nums' }}>{displayScore}</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#d1d5db' }}>/100</span>
                  </div>
                  <div style={{ height: '5px', background: '#e5e7eb', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: barsVisible ? `${total}%` : '0%', background: 'linear-gradient(90deg, #1565FF, #2979FF)', borderRadius: '100px', transition: 'width 1.6s cubic-bezier(0.16,1,0.3,1)' }} />
                  </div>
                </div>
                <div style={{ padding: '10px 12px', background: '#FEFCE8', border: '1px solid #FDE047', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#713F12', fontWeight: 600, lineHeight: 1.4 }}>Profil à fort potentiel · 3 axes prioritaires</p>
                </div>
              </div>

              {/* Droite : 8 critères */}
              <div>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ca3af' }}>Les 8 critères analysés</p>
                </div>
                {CRITERES.map((c, i) => (
                  <div key={i} style={{ padding: '11px 24px', borderBottom: i < CRITERES.length - 1 ? '1px solid #f9fafb' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500, width: '130px', flexShrink: 0 }}>{c.label}</span>
                    <div style={{ flex: 1, height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: barsVisible ? `${c.pct}%` : '0%', background: c.color, borderRadius: '2px', transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.07}s` }} />
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: c.tc, background: c.bg, padding: '2px 7px', borderRadius: '4px', flexShrink: 0 }}>{c.tag}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: c.color, width: '32px', textAlign: 'right', flexShrink: 0 }}>{c.score}/{c.max}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bas : exemple d'analyse */}
            <div style={{ padding: '20px 28px', background: '#FEF2F2', borderTop: '1px solid #FECACA', display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f1117' }}>Bannière</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#EF4444', background: '#FEE2E2', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>À retravailler · 7/20</span>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6 }}>Votre bannière ne communique aucun message sur votre expertise. Un visiteur ne comprend pas en une seconde ce que vous faites.</p>
              </div>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '10px 14px', flexShrink: 0, maxWidth: '280px' }}>
                <p style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 600, lineHeight: 1.5 }}>Créez une bannière qui exprime votre positionnement en 3 secondes.</p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 28px', borderTop: '1px solid #f3f4f6', background: '#fff' }}>
              <p style={{ fontSize: '11px', color: '#9ca3af' }}>Recommandations concrètes pour chaque critère, reçues directement par email</p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FORMULAIRE
      ═══════════════════════════════ */}
      <section id="formulaire" className="section-padding" style={{ background: '#f9f8f6', padding: '96px 56px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>

          {/* Header centré */}
          <div className="reveal" style={{ marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '9999px', marginBottom: '20px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'blink 2.5s infinite' }} />
              <span style={{ color: '#1D4ED8', fontSize: '11px', fontWeight: 600 }}>Gratuit · Résultat en 5 minutes</span>
            </div>
            <h2 style={{ fontSize: '38px', fontWeight: 900, color: '#0f1117', letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: '14px' }}>
              Où en êtes-vous<br /><span style={{ color: '#9ca3af' }}>vraiment ?</span>
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.75 }}>
              Collez votre lien LinkedIn. Recevez votre score et vos 3 priorités par email, en moins de 5 minutes.
            </p>
          </div>

          {/* Carte formulaire */}
          <div className="reveal d1" style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '24px',
            padding: '40px 36px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Champ LinkedIn */}
              <div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                  </div>
                  <input className="field" type="url" placeholder="Collez votre lien LinkedIn ici" value={profileLink} onChange={e => setProfileLink(e.target.value)} style={{ paddingLeft: '40px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', paddingLeft: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Ex :</span>
                  <UrlTypingAnimation />
                </div>
              </div>

              {/* Champ email */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input className="field" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '40px' }} />
              </div>

              {/* Consent */}
              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left', marginTop: '4px' }}>
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '3px', accentColor: '#2979FF', flexShrink: 0, cursor: 'pointer' }} />
                <span style={{ color: '#6b7280', fontSize: '11px', lineHeight: 1.65 }}>J&apos;accepte de recevoir mon analyse et des contenus sur la visibilité LinkedIn.</span>
              </label>

              {error && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 12px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: 500 }}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="submit" style={{ marginTop: '8px', fontSize: '16px', padding: '15px', position: 'relative', overflow: 'hidden' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Analyse en cours…
                  </span>
                ) : 'Analyser mon profil LinkedIn →'}
              </button>
            </form>

            {/* Réassurance */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Aucun accès à votre compte · Résultat en 5 min · 100% gratuit</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.08)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg,#1D4ED8,#2979FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#fff' }}>O</div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#374151', letterSpacing: '-0.3px' }}>optin<span style={{ color: '#2979FF' }}>.ia</span></span>
          </div>
          <span style={{ width: '1px', height: '16px', background: '#e5e7eb' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <img src="/romain-face.jpeg" alt="Romain Bour" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '11px', color: '#6b7280', lineHeight: 1 }}>Créé par <span style={{ color: '#0f1117', fontWeight: 700 }}>Romain Bour</span></p>
              <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Expert Branding B2B · +90 dirigeants</p>
            </div>
          </div>
        </div>
        <a href="https://www.linkedin.com/in/romainbour/" target="_blank" style={{ color: '#9ca3af', fontSize: '12px', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#0f1117')} onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>LinkedIn →</a>
      </footer>
    </>
  )
}
