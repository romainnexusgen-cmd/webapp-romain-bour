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
    if (!consent) { setError("Merci d'accepter de recevoir ton analyse par mail."); return }
    if (!profileLink) { setError('Merci de renseigner ton lien LinkedIn.'); return }
    if (!email) { setError('Merci de renseigner ton adresse email.'); return }
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
      {/* ── Nav bar ── */}
      <nav className="nav-bar">
        <a href="/" className="nav-logo">
          <div className="nav-logo-mark">O</div>
          <span className="nav-logo-text">optin<span>.ia</span></span>
        </a>
        <div className="nav-badge-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'blink 2.5s infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 500 }}>+700 profils analysés</span>
          </div>
          <a href="#formulaire" className="nav-cta-small">Analyser mon profil →</a>
        </div>
      </nav>

      {/* Canvas animé global — couvre toute la page en fixed */}
      <canvas ref={canvasRef} aria-hidden style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; background: #040C16; }

        .nav-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 60px;
          background: rgba(4,12,22,0.72);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .nav-logo-mark {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg, #1D4ED8 0%, #2979FF 60%, #60A5FA 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 18px rgba(41,121,255,0.4);
          font-size: 14px; font-weight: 900; color: #fff; letter-spacing: -0.5px;
          font-family: 'Inter', sans-serif;
        }
        .nav-logo-text {
          font-size: 16px; font-weight: 800; letter-spacing: -0.5px; color: #fff;
        }
        .nav-logo-text span { color: #2979FF; }
        .nav-cta-small {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(41,121,255,0.12); border: 1px solid rgba(41,121,255,0.28);
          color: #60A5FA; font-weight: 700; font-size: 13px;
          padding: 7px 16px; border-radius: 8px; text-decoration: none;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s, border-color 0.15s;
        }
        .nav-cta-small:hover { background: rgba(41,121,255,0.2); border-color: rgba(41,121,255,0.5); }
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
          .hero-dashboard   { display: none !important; }
          .section-padding  { padding: 64px 24px !important; }
          .hero-cta-row     { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>


      {/* ═══════════════════════════════════════
          HERO — Browser macOS + LinkedIn desktop réaliste
      ═══════════════════════════════════════ */}
      <section style={{
        height: 'calc(100vh - 60px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: '#1a1a1a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>

        {/* ── Bande scan IA — traverse TOUTE la section ── */}
        {scanPhase >= 1 && scanPhase < 6 && (
          <div className="li-scan-band" style={{ zIndex: 50 }} />
        )}

        {/* ── Chrome macOS — fenêtre navigateur ── */}
        <div style={{
          height: '40px', flexShrink: 0,
          background: 'linear-gradient(180deg, #ececec 0%, #d8d8d8 100%)',
          borderBottom: '1px solid #acacac',
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: '0',
          position: 'relative', zIndex: 10,
        }}>
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: '7px', marginRight: '20px' }}>
            {(['#FF5F57','#FEBC2E','#28C840'] as const).map((c, i) => (
              <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c, flexShrink: 0, boxShadow: `0 0.5px 1px rgba(0,0,0,0.3)` }} />
            ))}
          </div>
          {/* Nav arrows */}
          <div style={{ display: 'flex', gap: '1px', marginRight: '12px', color: '#aaa', fontSize: '18px', lineHeight: 1, userSelect: 'none' }}>
            <span style={{ fontWeight: 300 }}>‹</span>
            <span style={{ fontWeight: 300, opacity: 0.4 }}>›</span>
          </div>
          {/* URL bar centrée */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '420px', height: '25px',
              background: '#fff', borderRadius: '5px',
              border: '1px solid rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span style={{ fontSize: '11.5px', color: '#1a1a1a', fontWeight: 400, letterSpacing: '0.01em' }}>
                linkedin.com/<span style={{ color: '#555' }}>in/sophie-martin-67b2a4/</span>
              </span>
            </div>
          </div>
          {/* Badge IA status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: scanPhase >= 6 ? 'rgba(34,197,94,0.1)' : 'rgba(41,121,255,0.1)',
            border: `1px solid ${scanPhase >= 6 ? 'rgba(34,197,94,0.35)' : 'rgba(41,121,255,0.3)'}`,
            borderRadius: '100px', padding: '3px 10px', marginLeft: '12px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: scanPhase >= 6 ? '#22C55E' : '#2979FF',
              animation: 'blink 1.5s infinite', flexShrink: 0,
            }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: scanPhase >= 6 ? '#15803D' : '#1D4ED8', whiteSpace: 'nowrap' }}>
              {scanPhase === 0 ? 'Prêt à analyser' : scanPhase < 6 ? 'Analyse en cours…' : '✓ Terminé'}
            </span>
          </div>
        </div>

        {/* ── LinkedIn full-width ── */}
        <div style={{ flex: 1, overflow: 'hidden', background: '#f3f2ef', display: 'flex', flexDirection: 'column' }}>

          {/* Nav LinkedIn */}
          <div style={{
            background: '#fff', height: '52px', flexShrink: 0,
            display: 'flex', alignItems: 'center', padding: '0 20px', gap: '4px',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
          }}>
            {/* Logo LinkedIn SVG */}
            <svg width="34" height="34" viewBox="0 0 34 34" style={{ flexShrink: 0, marginRight: '4px' }}>
              <rect width="34" height="34" rx="4" fill="#0A66C2"/>
              <path fill="#fff" d="M8 13h3.5v11H8V13zm1.75-5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM14 13h3.4v1.5h.05A3.7 3.7 0 0 1 20.8 13c3.6 0 4.2 2.4 4.2 5.5V24h-3.5v-4.8c0-1.15-.02-2.6-1.6-2.6s-1.85 1.25-1.85 2.5V24H14V13z"/>
            </svg>
            {/* Barre de recherche */}
            <div style={{ background: '#EEF3F8', borderRadius: '4px', height: '34px', width: '220px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', marginRight: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span style={{ fontSize: '13px', color: '#999' }}>Recherche</span>
            </div>
            <div style={{ flex: 1 }} />
            {/* Nav items */}
            {[
              { icon: '⊞', label: 'Accueil' },
              { icon: '◎', label: 'Réseau' },
              { icon: '◈', label: 'Emplois' },
              { icon: '✉', label: 'Messages' },
              { icon: '🔔', label: 'Notifs' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 10px', opacity: 0.5, cursor: 'default', minWidth: '52px' }}>
                <span style={{ fontSize: '18px', color: '#666', lineHeight: 1.1 }}>{item.icon}</span>
                <span style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{item.label}</span>
              </div>
            ))}
            <div style={{ width: '1px', height: '28px', background: 'rgba(0,0,0,0.12)', margin: '0 4px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 10px', cursor: 'default' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(145deg, #2979FF, #1a3a7c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff' }}>S</div>
              <span style={{ fontSize: '10px', color: '#888', marginTop: '1px' }}>Moi ▾</span>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>

            {/* BANNIÈRE pleine largeur */}
            <div style={{
              position: 'relative', height: '200px', width: '100%',
              background: 'linear-gradient(135deg, #0f2a52 0%, #1a3a6b 30%, #1e4d8c 60%, #2563a8 85%, #3b82c4 100%)',
              overflow: 'visible',
            }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.28) 100%)' }} />
              {scanPhase >= 2 && (
                <div className="li-badge-enter" style={{
                  position: 'absolute', top: '14px', right: '28px', zIndex: 25,
                  background: '#FEF2F2', color: '#DC2626', border: '2px solid #FCA5A5',
                  borderRadius: '8px', padding: '5px 13px',
                  fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  Bannière · 7/20
                </div>
              )}
            </div>

            {/* Layout 2 colonnes */}
            <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 16px 40px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>

              {/* ─── Colonne principale ─── */}
              <div>
                {/* Card profil */}
                <div style={{ background: '#fff', borderRadius: '0 0 10px 10px', marginBottom: '12px', overflow: 'visible', position: 'relative', paddingBottom: '20px', boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}>
                  <div style={{ padding: '0 24px' }}>
                    <div style={{
                      width: '120px', height: '120px', borderRadius: '50%',
                      background: 'linear-gradient(145deg, #2979FF 0%, #1a3a7c 100%)',
                      border: '4px solid #fff', marginTop: '-60px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '36px', fontWeight: 800, color: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)', position: 'relative', zIndex: 5,
                    }}>S</div>
                  </div>
                  <div style={{ position: 'absolute', right: '20px', top: '12px', display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0A66C2', border: '1.5px solid #0A66C2', borderRadius: '100px', padding: '6px 18px', cursor: 'default', whiteSpace: 'nowrap' }}>Se connecter</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#555', border: '1.5px solid #C0C0C0', borderRadius: '100px', padding: '6px 18px', cursor: 'default' }}>Message</span>
                  </div>
                  <div style={{ padding: '14px 24px 0', position: 'relative' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1B1F23', lineHeight: 1.2, marginBottom: '3px' }}>Sophie Martin</h2>
                    <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.5, marginBottom: '4px', maxWidth: '460px' }}>
                      Co-dirigeante PME · Stratégie &amp; Développement commercial B2B
                    </p>
                    <p style={{ fontSize: '12px', color: '#888' }}>
                      Paris, Île-de-France &nbsp;·&nbsp;
                      <span style={{ color: '#0A66C2', fontWeight: 600 }}>347 relations</span>
                    </p>
                    {scanPhase >= 3 && (
                      <div className="li-badge-enter" style={{
                        position: 'absolute', bottom: '0', right: '0', zIndex: 25,
                        background: '#FFFBEB', color: '#D97706', border: '2px solid #FCD34D',
                        borderRadius: '8px', padding: '5px 12px',
                        fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#D97706"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        Titre · 11/20
                      </div>
                    )}
                  </div>
                </div>

                {/* Card À propos */}
                <div style={{ background: '#fff', borderRadius: '10px', padding: '20px 24px', marginBottom: '12px', position: 'relative', boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#1B1F23', marginBottom: '10px' }}>À propos</p>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.75, marginBottom: '6px' }}>
                    J&apos;accompagne les dirigeants et experts établis depuis plus de 10 ans à renforcer leur autorité et leur visibilité professionnelle en ligne, sans devenir influenceur et sans parler de leur vie perso.
                  </p>
                  <span style={{ fontSize: '13px', color: '#0A66C2', fontWeight: 600, cursor: 'pointer' }}>…voir plus</span>
                  {scanPhase >= 4 && (
                    <div className="li-badge-enter" style={{
                      position: 'absolute', top: '16px', right: '16px', zIndex: 25,
                      background: '#FFFBEB', color: '#D97706', border: '2px solid #FCD34D',
                      borderRadius: '8px', padding: '5px 12px',
                      fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#D97706"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      À propos · 9/15
                    </div>
                  )}
                </div>

                {/* Card Activité */}
                <div style={{ background: '#fff', borderRadius: '10px', padding: '20px 24px', position: 'relative', boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#1B1F23' }}>Activité · <span style={{ fontWeight: 500, color: '#888' }}>847 abonnés</span></p>
                    <span style={{ fontSize: '12px', color: '#0A66C2', fontWeight: 600, cursor: 'pointer' }}>Tous les posts</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {[
                      { bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', icon: '📊', title: 'Stratégie', text: 'Les 3 erreurs qui coûtent de la visibilité aux dirigeants B2B...', likes: 142, comments: 28 },
                      { bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', icon: '💡', title: 'Expertise', text: 'Ce que j\'ai appris en accompagnant 90 dirigeants sur LinkedIn...', likes: 89, comments: 15 },
                    ].map((p, i) => (
                      <div key={i} style={{ background: p.bg, borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)', padding: '14px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: '#0A66C2', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{p.icon} {p.title}</p>
                        <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.5, marginBottom: '8px' }}>{p.text}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#888' }}>👍 {p.likes}</span>
                          <span style={{ fontSize: '11px', color: '#888' }}>💬 {p.comments}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {scanPhase >= 5 && (
                    <div className="li-badge-enter" style={{
                      position: 'absolute', top: '16px', right: '16px', zIndex: 25,
                      background: '#FEF2F2', color: '#DC2626', border: '2px solid #FCA5A5',
                      borderRadius: '8px', padding: '5px 12px',
                      fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      Posts · 4/10
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Sidebar droite ─── */}
              <div>
                {/* Stats profil */}
                <div style={{ background: '#fff', borderRadius: '10px', padding: '16px 20px', marginBottom: '12px', boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1B1F23', marginBottom: '14px' }}>Tableau de bord</p>
                  {[
                    { label: 'Vues du profil', value: '127', note: '+12% cette semaine', noteColor: '#15803D' },
                    { label: 'Apparitions dans les recherches', value: '843', note: '7 derniers jours', noteColor: '#6B7280' },
                    { label: 'Interactions sur les posts', value: '234', note: '30 derniers jours', noteColor: '#6B7280' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
                      <div>
                        <p style={{ fontSize: '12px', color: '#444', fontWeight: 500 }}>{s.label}</p>
                        <p style={{ fontSize: '10px', color: s.noteColor, marginTop: '1px' }}>{s.note}</p>
                      </div>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#1B1F23' }}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Profils similaires */}
                <div style={{ background: '#fff', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1B1F23', marginBottom: '14px' }}>Profils similaires</p>
                  {[
                    { initial: 'M', name: 'Marc Dupont', title: 'DG · PME Industrie', color: '#7C3AED' },
                    { initial: 'C', name: 'Claire Vidal', title: 'Experte RH B2B', color: '#059669' },
                    { initial: 'L', name: 'Laurent Morin', title: 'Directeur Commercial', color: '#D97706' },
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < 2 ? '14px' : '0' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{p.initial}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1B1F23', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                        <p style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0A66C2', border: '1.5px solid #0A66C2', borderRadius: '100px', padding: '3px 12px', flexShrink: 0, cursor: 'default' }}>+ Suivre</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── SCORE OVERLAY PLEIN ÉCRAN ── */}
        {scanPhase >= 6 && (
          <div className="li-overlay-enter" style={{
            position: 'absolute', inset: 0, zIndex: 40,
            background: 'rgba(2,8,18,0.9)',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '40px 24px', gap: '0',
          }}>
            {/* Score — count-up */}
            <div className="s0" style={{ textAlign: 'center', marginBottom: '4px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' }}>Score LinkedIn · Sophie Martin</p>
              <div className="li-score-enter" style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'center', marginBottom: '0' }}>
                <span style={{
                  fontSize: 'clamp(88px, 12vw, 128px)', fontWeight: 900, lineHeight: 1,
                  letterSpacing: '-6px', color: '#2979FF',
                  textShadow: '0 0 60px rgba(41,121,255,0.8), 0 0 120px rgba(41,121,255,0.3)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{overlayScore}</span>
                <span style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'rgba(255,255,255,0.18)' }}>/100</span>
              </div>
            </div>

            {/* Label potentiel */}
            <div className="s1" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '24px', marginTop: '16px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', boxShadow: '0 0 8px rgba(245,158,11,0.6)' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.01em' }}>Fort potentiel · 3 priorités critiques identifiées</span>
            </div>

            {/* 3 badges section */}
            <div className="s2" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '36px' }}>
              {[
                { label: 'Bannière', score: '7/20', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
                { label: 'Titre', score: '11/20', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
                { label: 'Posts', score: '4/10', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
              ].map((b, i) => (
                <div key={i} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: '10px', padding: '8px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>{b.label}</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: b.color }}>{b.score}</p>
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="s3" style={{ width: '480px', maxWidth: '90vw', height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '28px' }} />

            {/* Headline */}
            <div className="s4" style={{ textAlign: 'center' }}>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 46px)',
                fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px',
                color: '#fff', marginBottom: '12px',
              }}>
                Ton expertise mérite d&apos;être vue.
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '16px', lineHeight: 1.7, marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
                Découvre ton score sur 8 critères et tes 3 priorités concrètes — en 5 minutes, gratuitement.
              </p>
            </div>

            {/* CTA + Trust + Social */}
            <div className="s5" style={{ textAlign: 'center' }}>
              <a href="#formulaire" className="hero-cta" style={{ fontSize: '17px', padding: '16px 36px' }}>
                Analyser mon profil →
              </a>
              {/* Trust */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                {[{ icon: '🔒', txt: 'Aucun accès' }, { icon: '⚡', txt: '5 min' }, { icon: '🎁', txt: 'Gratuit' }].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '12px' }}>{r.icon}</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{r.txt}</span>
                  </div>
                ))}
              </div>
              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                <div style={{ display: 'flex' }}>
                  {TEMOIGNAGES.map((t, i) => (
                    <img key={i} src={t.photo} alt={t.nom} width={24} height={24}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)', marginLeft: i > 0 ? '-7px' : '0', display: 'block' }} />
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>+700 experts B2B</span> ont déjà leur score
                </span>
              </div>
            </div>
          </div>
        )}
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
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>

          {/* Header centré */}
          <div className="reveal" style={{ marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', background: 'rgba(41,121,255,0.08)', border: '1px solid rgba(41,121,255,0.18)', borderRadius: '9999px', marginBottom: '20px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'blink 2.5s infinite' }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600 }}>Gratuit · Résultat en 5 minutes</span>
            </div>
            <h2 style={{ fontSize: '38px', fontWeight: 900, color: '#fff', letterSpacing: '-1.2px', lineHeight: 1.1, marginBottom: '14px' }}>
              Où en es-tu<br /><span style={{ color: 'rgba(255,255,255,0.25)' }}>vraiment ?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', lineHeight: 1.75 }}>
              Colle ton lien LinkedIn. Reçois ton score et tes 3 priorités directement par email.
            </p>
          </div>

          {/* Carte formulaire */}
          <div className="reveal d1" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '24px',
            padding: '40px 36px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04) inset',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Lueur bleue en haut de la carte */}
            <div aria-hidden style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, #2979FF, transparent)' }} />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Champ LinkedIn */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </div>
                <input className="field" type="url" placeholder="linkedin.com/in/ton-profil" value={profileLink} onChange={e => setProfileLink(e.target.value)} style={{ paddingLeft: '40px' }} />
              </div>

              {/* Champ email */}
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input className="field" type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '40px' }} />
              </div>

              {/* Consent */}
              <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left', marginTop: '4px' }}>
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '3px', accentColor: '#2979FF', flexShrink: 0, cursor: 'pointer' }} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', lineHeight: 1.65 }}>J&apos;accepte de recevoir mon analyse et des contenus sur la visibilité LinkedIn.</span>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { icon: '🔒', txt: 'Aucun accès à ton compte' },
                { icon: '⚡', txt: 'Résultat en 5 min' },
                { icon: '🎁', txt: '100% gratuit' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '11px' }}>{r.icon}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>{r.txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg,#1D4ED8,#2979FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#fff' }}>O</div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.3px' }}>optin<span style={{ color: '#2979FF' }}>.ia</span></span>
          </div>
          <span style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <img src="/romain-face.jpeg" alt="Romain Bour" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>Créé par <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>Romain Bour</span></p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>Expert Branding B2B · +90 dirigeants</p>
            </div>
          </div>
        </div>
        <a href="https://www.linkedin.com/in/romainbour/" target="_blank" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>LinkedIn →</a>
      </footer>
    </>
  )
}
