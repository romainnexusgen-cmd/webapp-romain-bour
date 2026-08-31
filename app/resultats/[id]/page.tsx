import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

function tier(pct: number) {
  if (pct >= 70) return { label: 'Profil solide',              color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' }
  if (pct >= 50) return { label: 'Profil à améliorer',         color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' }
  if (pct >= 30) return { label: 'Profil en dessous du seuil', color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74' }
  return               { label: 'Profil à reconstruire',       color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' }
}

function scoreColor(ratio: number) {
  if (ratio >= 0.65) return { bar: '#16A34A', track: '#DCFCE7', text: '#15803D', soft: '#F0FDF4', border: '#86EFAC' }
  if (ratio >= 0.4)  return { bar: '#D97706', track: '#FEF3C7', text: '#B45309', soft: '#FFFBEB', border: '#FCD34D' }
  return               { bar: '#DC2626', track: '#FEE2E2', text: '#B91C1C', soft: '#FEF2F2', border: '#FCA5A5' }
}

interface Critere { titre: string; pts: number; max: number; explication: string }

const SECTIONS = [
  { label: 'Photo de profil',              key: 'photo',       max: 15, desc: 'Première impression visuelle' },
  { label: 'Bannière',                     key: 'banner',      max: 15, desc: 'Image de couverture' },
  { label: 'Titre du profil',              key: 'headline',    max: 15, desc: 'Accroche et positionnement' },
  { label: 'Section À propos',             key: 'about',       max: 15, desc: 'Pitch et storytelling' },
  { label: 'Espace Sélection',             key: 'selection',   max: 15, desc: 'Mise en avant des services' },
  { label: 'Contenu',                      key: 'contenu',     max: 10, desc: 'Stratégie éditoriale' },
  { label: 'Expériences professionnelles', key: 'experiences', max: 5,  desc: 'Parcours et crédibilité' },
  { label: 'Crédibilité & preuves',        key: 'cred',        max: 10, desc: 'Recommandations et social proof' },
]

const ICONS: Record<string, string> = {
  photo:       `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3.5" width="14" height="10" rx="2"/><circle cx="8" cy="8.5" r="2.3"/><path d="M5.5 3.5l.9-2h3.2l.9 2"/></svg>`,
  banner:      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="2" width="14" height="12" rx="2"/><path d="M1 10.5l3.5-3.5 2.5 2.5 2-2 5 5"/><circle cx="11.5" cy="5.5" r="1.3"/></svg>`,
  headline:    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2.5 3h11M8 3v10M5 13h6"/></svg>`,
  about:       `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="5" r="2.8"/><path d="M2.5 13.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5"/></svg>`,
  selection:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5l1.7 3.5 3.8.55-2.75 2.68.65 3.8L8 10.1 4.6 12.03l.65-3.8L2.5 5.55l3.8-.55z"/></svg>`,
  contenu:     `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 2.3a2 2 0 012.8 2.8L4.5 13.7H2v-2.5z"/><path d="M9 3.6l2.8 2.8"/></svg>`,
  experiences: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="6.5" width="14" height="8" rx="2"/><path d="M5 6.5V4.5a2 2 0 014 0v2M1 10.5h14"/></svg>`,
  cred:        `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5l5.5 2.3v4.2c0 3.2-2.5 5.7-5.5 6.5-3-0.8-5.5-3.3-5.5-6.5V3.8z"/><path d="M5.5 8.5l1.5 1.5 3.5-3.5"/></svg>`,
}

function getCriteres(data: Record<string, unknown>, key: string): Critere[] {
  const out: Critere[] = []
  let i = 1
  while (data[`${key}_critere_${i}_titre`]) {
    out.push({
      titre:       data[`${key}_critere_${i}_titre`] as string,
      pts:         Number(data[`${key}_critere_${i}_points_obtenus`]) || 0,
      max:         Number(data[`${key}_critere_${i}_points_maximum`]) || 0,
      explication: data[`${key}_critere_${i}_explication`] as string || '',
    })
    i++
  }
  return out
}

export default async function ResultatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase.from('linkedin_audits').select('*').eq('id', id).single()
  if (error || !data) return notFound()

  const gScore = Number(data.global_total_points) || 0
  const gMax   = Number(data.global_total_maximum) || 100
  const gPct   = Math.round((gScore / gMax) * 100)
  const t      = tier(gPct)

  const allCriteres: (Critere & { section: string })[] = []
  for (const s of SECTIONS) {
    getCriteres(data, s.key).forEach(c => {
      if (c.max > 0) allCriteres.push({ ...c, section: s.label })
    })
  }
  const quickWins = [...allCriteres]
    .filter(c => c.pts < c.max)
    .sort((a, b) => (a.pts / a.max) - (b.pts / b.max))
    .slice(0, 3)

  const auditId = id

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        /* ── PDF BUTTON ── */
        .pdf-bar {
          background: white; border-top: 1px solid #F1F1EF;
          padding: 10px 22px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          border-radius: 0 0 16px 16px;
        }
        .pdf-hint { font-size: 12px; color: #94A3B8; }
        .pdf-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #F8FAFC; border: 1.5px solid #E2E8F0;
          color: #334155; font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 9px;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
        }
        .pdf-btn:hover { background: #EFF6FF; border-color: #2979FF; color: #2979FF; }

        /* ── PRINT / PDF ── */
        @media print {
          body { background: white; padding-bottom: 0; }
          .nav, #sticky-bar, #modal-bg, #generic-cta, .pdf-bar,
          .gate-mask, .sec-card-gate-mask, .gated-zone .gate-mask { display: none !important; }
          .hero { min-height: auto; padding: 32px 24px 40px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .wrap { padding: 20px 16px; gap: 12px; }
          .gated-zone.locked .gate-content { filter: none; opacity: 1; pointer-events: auto; }
          .sec-card-gated.locked .sec-card-body { filter: none; opacity: 1; pointer-events: auto; }
          .sec-card-gated.locked, .gated-zone.locked { overflow: visible; }
          .crit-body { max-height: none !important; overflow: visible !important; }
          .qw-body { max-height: none !important; overflow: visible !important; }
          .qw, .recap, .sec-card, .cta, .result-cta-call, .result-cta-newsletter {
            break-inside: avoid; box-shadow: none; border: 1px solid #EBEBEB;
          }
          #result-cta { display: block !important; }
          #result-call { display: none !important; }
          #result-nl { display: none !important; }
          .pf { margin-top: 16px; }
          .gauge-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sec-strip, .recap-bar-fill, .sec-ft-fill, .cta-top-bar,
          .result-cta-call-bar, .result-cta-newsletter-bar {
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          @page { margin: 1.5cm 1.5cm; size: A4; }
        }
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: #f9f8f6;
          color: #0F172A;
          -webkit-font-smoothing: antialiased;
          line-height: 1.5;
          padding-bottom: 80px;
        }

        /* ── NAV ── */
        .nav {
          position: sticky; top: 0; z-index: 100;
          height: 54px;
          background: rgba(9, 17, 28, 0.97);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
        }
        .nav-brand { display: flex; align-items: center; gap: 10px; }
        .nav-logo {
          width: 26px; height: 26px; border-radius: 7px;
          background: linear-gradient(135deg, #2979FF 0%, #2979FF 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900; color: white; letter-spacing: -0.3px;
        }
        .nav-name { color: white; font-size: 13px; font-weight: 700; letter-spacing: -0.2px; }
        .nav-tag {
          font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 3px 10px; border-radius: 100px;
        }

        /* ── HERO ── */
        .hero {
          background: #07101C;
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 56px 24px 72px;
          min-height: 540px;
        }
        .hero-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 70% 55% at 50% -10%, rgba(59,130,246,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 15% 110%, rgba(99,102,241,0.08) 0%, transparent 60%);
        }
        .hero-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }
        .hero-inner { position: relative; z-index: 1; width: 100%; max-width: 480px; text-align: center; }

        .hero-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          object-fit: cover; display: block; margin: 0 auto 14px;
          border: 2px solid rgba(255,255,255,0.12);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12), 0 16px 48px rgba(0,0,0,0.5);
        }
        .hero-name {
          font-size: clamp(20px, 4.5vw, 28px);
          font-weight: 800; color: white; letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .hero-date { font-size: 12px; color: rgba(255,255,255,0.32); margin-bottom: 44px; letter-spacing: 0.01em; }

        .score-num-row {
          display: flex; align-items: baseline; justify-content: center; gap: 2px;
          margin-bottom: 4px;
        }
        .score-num {
          font-size: clamp(80px, 20vw, 120px);
          font-weight: 900; letter-spacing: -8px; line-height: 1;
          color: white;
          font-variant-numeric: tabular-nums;
          transition: color 0.5s ease;
        }
        .score-denom {
          font-size: clamp(24px, 5vw, 36px); font-weight: 600;
          color: rgba(255,255,255,0.22); letter-spacing: -1px;
          align-self: flex-end; margin-bottom: 10px;
        }

        .score-tier {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.01em;
          padding: 5px 14px; border-radius: 100px;
          margin-bottom: 40px;
          opacity: 0; transform: translateY(6px);
          transition: opacity 0.6s 1.5s, transform 0.6s 1.5s;
        }
        .score-tier.visible { opacity: 1; transform: translateY(0); }
        .score-tier-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

        .gauge { width: 100%; }
        .gauge-track {
          width: 100%; height: 10px; border-radius: 100px;
          background: rgba(255,255,255,0.06);
          overflow: hidden; position: relative;
        }
        .gauge-fill {
          height: 100%; border-radius: 100px; width: 0%;
          transition: width 1.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative; overflow: hidden;
        }
        .gauge-fill::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
          animation: g-shimmer 2.5s 1.4s infinite;
          transform: translateX(-100%);
        }
        @keyframes g-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }

        .gauge-labels {
          display: flex; justify-content: space-between;
          margin-top: 7px; padding: 0 1px;
        }
        .gauge-label { font-size: 9px; font-weight: 600; letter-spacing: 0.05em; color: rgba(255,255,255,0.2); }

        /* ── LAYOUT ── */
        .wrap { max-width: 720px; margin: 0 auto; padding: 36px 16px 40px; display: flex; flex-direction: column; gap: 16px; }

        /* ── QUICK WINS ── */
        .qw {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
          border: 1px solid #EBEBEB;
        }
        .qw-hd {
          padding: 20px 24px;
          border-bottom: 1px solid #F1F1EF;
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
        }
        .qw-hd-left { flex: 1; }
        .qw-hd-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #94A3B8; margin-bottom: 4px;
        }
        .qw-hd-title { font-size: 16px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px; }
        .qw-hd-sub { font-size: 13px; color: #94A3B8; margin-top: 2px; }

        .qw-row {
          border-bottom: 1px solid #F1F1EF; cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }
        .qw-row:last-child { border-bottom: none; }
        .qw-row:hover { background: #FAFAFA; }

        .qw-row-hd {
          padding: 20px 24px;
          display: flex; align-items: flex-start; gap: 18px;
        }
        .qw-idx {
          font-size: 42px; font-weight: 900; letter-spacing: -3px; line-height: 1;
          color: #F1F1EF; flex-shrink: 0; width: 48px; text-align: center;
          font-variant-numeric: tabular-nums;
          transition: color 0.2s;
          user-select: none;
        }
        .qw-row:hover .qw-idx { color: #E2E8F0; }
        .qw-content { flex: 1; padding-top: 4px; }
        .qw-section-tag {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #94A3B8; margin-bottom: 6px;
        }
        .qw-title { font-size: 14px; font-weight: 700; color: #0F172A; line-height: 1.5; margin-bottom: 4px; }
        .qw-preview { font-size: 13px; color: #94A3B8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

        .qw-chevron {
          width: 20px; height: 20px; flex-shrink: 0; margin-top: 6px;
          color: #CBD5E1;
          transition: transform 0.25s, color 0.2s;
        }
        .qw-row.open .qw-chevron { transform: rotate(180deg); color: #64748B; }

        .qw-body {
          max-height: 0; overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .qw-body-inner {
          padding: 0 24px 20px 90px;
        }
        .qw-body-text {
          font-size: 13px; color: #475569; line-height: 1.75;
          padding: 14px 16px;
          background: #F8FAFC;
          border-radius: 10px;
          border-left: 3px solid #CBD5E1;
        }
        .qw-row.open .qw-body-text { border-left-color: currentColor; }

        /* ── GATING ── */
        .gated-zone {
          position: relative;
          overflow: hidden;
        }
        .gated-zone .gate-content {
          transition: filter 0.5s ease, opacity 0.5s ease;
        }
        .gated-zone.locked .gate-content {
          filter: blur(7px);
          pointer-events: none;
          user-select: none;
          opacity: 0.7;
        }
        .gate-mask {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 100%;
          background: linear-gradient(to bottom,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.7) 30%,
            rgba(255,255,255,0.97) 60%,
            rgba(255,255,255,1) 100%
          );
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 20px;
          cursor: pointer;
          transition: opacity 0.4s ease;
          z-index: 2;
        }
        .gated-zone.unlocked .gate-mask {
          opacity: 0;
          pointer-events: none;
        }
        .gated-zone.unlocked .gate-content {
          filter: none;
          pointer-events: auto;
          opacity: 1;
        }
        .gate-lock-badge {
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #2979FF, #2979FF);
          color: white;
          font-size: 13px; font-weight: 700;
          padding: 12px 22px; border-radius: 100px;
          box-shadow: 0 4px 24px rgba(59,130,246,0.45);
          letter-spacing: -0.1px;
          animation: badge-pulse 2.5s ease-in-out infinite;
        }
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 4px 24px rgba(59,130,246,0.45); transform: scale(1); }
          50% { box-shadow: 0 6px 32px rgba(59,130,246,0.65); transform: scale(1.03); }
        }

        /* section card gate — full card blur */
        .sec-card-gated {
          position: relative;
          overflow: hidden;
        }
        .sec-card-gated .sec-card-body {
          transition: filter 0.5s ease, opacity 0.5s ease;
        }
        .sec-card-gated.locked .sec-card-body {
          filter: blur(7px);
          pointer-events: none;
          user-select: none;
          opacity: 0.65;
        }
        .sec-card-gate-mask {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.75) 30%,
            rgba(255,255,255,0.97) 65%,
            rgba(255,255,255,1) 100%
          );
          display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
          padding-bottom: 20px; gap: 8px;
          cursor: pointer;
          transition: opacity 0.4s ease;
          z-index: 2;
        }
        .sec-card-gate-hint {
          font-size: 12px; color: #94A3B8; font-weight: 500;
        }
        .sec-card-gated.unlocked .sec-card-gate-mask {
          opacity: 0; pointer-events: none;
        }
        .sec-card-gated.unlocked .sec-card-body {
          filter: none; pointer-events: auto; opacity: 1;
        }

        /* ── RECAP ── */
        .recap {
          background: white; border-radius: 16px;
          border: 1px solid #EBEBEB;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .recap-hd { padding: 18px 22px; border-bottom: 1px solid #F1F1EF; }
        .recap-hd-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94A3B8; margin-bottom: 3px; }
        .recap-hd-title { font-size: 15px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px; }

        .recap-list { }
        .recap-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 22px;
          border-bottom: 1px solid #f9f8f6;
        }
        .recap-row:last-child { border-bottom: none; }
        .recap-icon {
          width: 28px; height: 28px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          color: #64748B;
        }
        .recap-name { font-size: 13px; font-weight: 600; color: #334155; flex: 1; min-width: 0; }
        .recap-bar-wrap { width: 120px; flex-shrink: 0; }
        .recap-bar-track { height: 5px; border-radius: 100px; overflow: hidden; background: #F1F5F9; }
        .recap-bar-fill { height: 100%; border-radius: 100px; transition: width 0.8s ease; }
        .recap-pts { font-size: 12px; font-weight: 700; width: 42px; text-align: right; flex-shrink: 0; }

        @media (max-width: 520px) {
          .recap-bar-wrap { width: 80px; }
        }

        /* ── SECTION CARDS ── */
        .sec-card {
          background: white; border-radius: 16px;
          border: 1px solid #EBEBEB;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .sec-strip { height: 3px; width: 100%; }
        .sec-hd { padding: 18px 22px; border-bottom: 1px solid #f9f8f6; display: flex; align-items: center; gap: 12px; }
        .sec-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .sec-info { flex: 1; min-width: 0; }
        .sec-name { font-size: 14px; font-weight: 800; color: #0F172A; letter-spacing: -0.2px; }
        .sec-desc { font-size: 12px; color: #94A3B8; margin-top: 1px; }
        .sec-score {
          font-size: 13px; font-weight: 800;
          padding: 5px 12px; border-radius: 8px; flex-shrink: 0;
        }
        .sec-banner { width: 100%; height: clamp(90px, 22vw, 140px); object-fit: cover; display: block; }
        .sec-photo-row { padding: 20px 0 4px; display: flex; justify-content: center; }
        .sec-photo { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid #F1F5F9; }

        .crit {
          border-bottom: 1px solid #f9f8f6; cursor: pointer;
          transition: background 0.15s;
        }
        .crit:last-of-type { border-bottom: none; }
        .crit:hover { background: #FAFAFA; }
        .crit-hd { padding: 14px 22px; display: flex; align-items: center; gap: 12px; }
        .crit-bar-mini {
          width: 36px; height: 36px; flex-shrink: 0; position: relative;
        }
        .crit-bar-mini svg { transform: rotate(-90deg); }
        .crit-mini-track { fill: none; stroke: #F1F5F9; stroke-width: 3; }
        .crit-mini-fill  { fill: none; stroke-width: 3; stroke-linecap: round; transition: stroke-dashoffset 0.7s ease; }
        .crit-name { font-size: 13px; font-weight: 600; color: #1E293B; flex: 1; line-height: 1.45; }
        .crit-pts { font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .crit-chev-wrap {
          display: flex; align-items: center; gap: 4px;
          flex-shrink: 0;
          color: #94A3B8; font-size: 11px; font-weight: 600;
          transition: color 0.15s;
        }
        .crit:hover .crit-chev-wrap { color: #2979FF; }
        .crit.open .crit-chev-wrap { color: #2979FF; }
        .crit-chev-label { white-space: nowrap; }
        .crit.open .crit-chev-label { display: none; }
        .crit-chev {
          width: 14px; height: 14px; flex-shrink: 0;
          transition: transform 0.25s;
        }
        .crit.open .crit-chev { transform: rotate(180deg); }

        .crit-body { max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1); }
        .crit-body-inner {
          padding: 0 22px 16px 70px;
          font-size: 13px; color: #475569; line-height: 1.75;
        }
        .crit-expl {
          padding: 12px 16px; border-radius: 9px; background: #F8FAFC;
          border-left: 3px solid #E2E8F0;
        }

        .sec-ft {
          padding: 11px 22px; background: #FAFAFA; border-top: 1px solid #F1F1EF;
          display: flex; align-items: center; gap: 12px;
        }
        .sec-ft-track { flex: 1; height: 3px; background: #EBEBEB; border-radius: 100px; overflow: hidden; }
        .sec-ft-fill  { height: 100%; border-radius: 100px; }
        .sec-ft-label { font-size: 11px; font-weight: 700; white-space: nowrap; }

        /* ── CTA (generic) ── */
        .cta {
          background: white; border-radius: 16px;
          border: 1px solid #EBEBEB;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .cta-top-bar { height: 3px; background: linear-gradient(90deg, #2979FF, #1a6aff 60%, #6366F1); }
        .cta-body { padding: 36px 28px; display: flex; flex-direction: column; align-items: flex-start; gap: 0; }
        .cta-eyebrow {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #2979FF; margin-bottom: 12px;
        }
        .cta-h {
          font-size: clamp(22px, 4.5vw, 28px); font-weight: 900;
          color: #0F172A; letter-spacing: -0.6px; line-height: 1.2;
          margin-bottom: 12px;
        }
        .cta-sub { font-size: 14px; color: #64748B; line-height: 1.75; max-width: 440px; margin-bottom: 28px; }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #2979FF;
          color: white; font-size: 14px; font-weight: 700; letter-spacing: -0.1px;
          padding: 12px 22px; border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 1px 2px rgba(29,78,216,0.2), 0 4px 14px rgba(29,78,216,0.3);
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .cta-btn:hover {
          background: #1E40AF;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(29,78,216,0.2), 0 8px 20px rgba(29,78,216,0.35);
        }
        .cta-btn svg { transition: transform 0.15s; }
        .cta-btn:hover svg { transform: translateX(2px); }

        /* ── RESULT CTA (shown after form) ── */
        #result-cta { display: none; }
        #result-cta.visible { display: block; }

        .result-cta-call {
          background: white; border-radius: 16px;
          border: 1px solid #EBEBEB;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .result-cta-call-bar { height: 3px; background: linear-gradient(90deg, #2979FF, #1a6aff 60%, #6366F1); }
        .result-cta-call-body { padding: 36px 28px; }
        .result-eyebrow {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #2979FF; margin-bottom: 12px;
        }
        .result-h {
          font-size: clamp(20px, 4vw, 26px); font-weight: 900;
          color: #0F172A; letter-spacing: -0.6px; line-height: 1.2;
          margin-bottom: 10px;
        }
        .result-sub { font-size: 14px; color: #64748B; line-height: 1.75; margin-bottom: 24px; }
        .result-btn-call {
          display: inline-flex; align-items: center; gap: 7px;
          background: #2979FF; color: white;
          font-size: 14px; font-weight: 700;
          padding: 13px 24px; border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 1px 2px rgba(29,78,216,0.2), 0 4px 14px rgba(29,78,216,0.3);
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .result-btn-call:hover {
          background: #1E40AF; transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(29,78,216,0.2), 0 8px 20px rgba(29,78,216,0.35);
        }

        .result-cta-newsletter {
          background: white; border-radius: 16px;
          border: 1px solid #EBEBEB;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .result-cta-newsletter-bar { height: 3px; background: linear-gradient(90deg, #10B981, #059669); }
        .result-cta-newsletter-body { padding: 36px 28px; }
        .result-check-icon {
          width: 40px; height: 40px; border-radius: 50%;
          background: #ECFDF5; display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; color: #10B981;
        }
        .result-nl-title {
          font-size: clamp(18px, 3.5vw, 22px); font-weight: 900;
          color: #0F172A; letter-spacing: -0.5px; line-height: 1.3;
          margin-bottom: 10px;
        }
        .result-nl-sub { font-size: 14px; color: #64748B; line-height: 1.75; margin-bottom: 24px; }
        .result-btn-li {
          display: inline-flex; align-items: center; gap: 7px;
          background: #0F172A; color: white;
          font-size: 14px; font-weight: 700;
          padding: 13px 24px; border-radius: 10px;
          text-decoration: none;
          transition: transform 0.15s, background 0.15s;
        }
        .result-btn-li:hover { background: #1E293B; transform: translateY(-1px); }

        /* ── STICKY BAR ── */
        #sticky-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
          background: rgba(9, 17, 28, 0.97);
          backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 12px 20px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #sticky-bar.visible { transform: translateY(0); }
        #sticky-bar.hidden { transform: translateY(100%); }
        .sticky-bar-text {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75);
          line-height: 1.4;
        }
        .sticky-bar-text strong { color: white; }
        .sticky-bar-btn {
          flex-shrink: 0;
          background: linear-gradient(135deg, #2979FF, #1a6aff);
          color: white; font-size: 13px; font-weight: 700;
          padding: 10px 18px; border-radius: 9px;
          border: none; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          box-shadow: 0 2px 12px rgba(59,130,246,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .sticky-bar-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(59,130,246,0.5);
        }

        /* ── MODAL ── */
        #modal-bg {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: flex-end; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        @media (min-width: 540px) {
          #modal-bg { align-items: center; }
        }
        #modal-bg.open { opacity: 1; pointer-events: auto; }
        .modal-box {
          background: white; width: 100%; max-width: 480px;
          border-radius: 24px 24px 0 0;
          padding: 8px 0 0;
          box-shadow: 0 -4px 40px rgba(0,0,0,0.15);
          transform: translateY(40px);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 92vh; overflow-y: auto;
        }
        @media (min-width: 540px) {
          .modal-box {
            border-radius: 20px;
            transform: scale(0.96) translateY(10px);
            max-height: 80vh;
          }
        }
        #modal-bg.open .modal-box {
          transform: translateY(0);
        }
        @media (min-width: 540px) {
          #modal-bg.open .modal-box { transform: scale(1) translateY(0); }
        }
        .modal-handle {
          width: 36px; height: 4px; border-radius: 100px;
          background: #E2E8F0; margin: 0 auto 20px;
        }
        @media (min-width: 540px) { .modal-handle { display: none; } }
        .modal-close {
          position: absolute; top: 16px; right: 16px;
          width: 28px; height: 28px; border-radius: 50%;
          background: #F1F5F9; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #64748B; transition: background 0.15s;
        }
        .modal-close:hover { background: #E2E8F0; }
        .modal-inner { padding: 0 24px 32px; position: relative; }
        .modal-progress {
          display: flex; gap: 6px; margin-bottom: 24px;
        }
        .mpd {
          flex: 1; height: 3px; border-radius: 100px;
          background: #F1F5F9; overflow: hidden;
          transition: background 0.3s;
        }
        .mpd.active { background: #2979FF; }
        .mpd.done { background: #CBD5E1; }

        /* question steps */
        .q-step { display: none; }
        .q-step.active { display: block; }
        .q-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #94A3B8; margin-bottom: 10px;
        }
        .q-title {
          font-size: clamp(17px, 4vw, 20px); font-weight: 800;
          color: #0F172A; letter-spacing: -0.4px; line-height: 1.35;
          margin-bottom: 20px;
        }
        .q-opts { display: flex; flex-direction: column; gap: 10px; }
        .q-opt {
          padding: 14px 16px;
          border: 1.5px solid #E2E8F0; border-radius: 12px;
          font-size: 14px; font-weight: 600; color: #1E293B;
          background: white; cursor: pointer; text-align: left;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
          display: flex; align-items: center; gap: 10px;
          line-height: 1.4;
        }
        .q-opt:hover { border-color: #2979FF; background: #EFF6FF; color: #2979FF; }
        .q-opt.selected { border-color: #2979FF; background: #EFF6FF; color: #2979FF; }
        .q-opt-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: #F8FAFC;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .q-opt:hover .q-opt-icon,
        .q-opt.selected .q-opt-icon { background: #DBEAFE; }

        /* ── FOOTER ── */
        .pf { display: flex; align-items: center; gap: 14px; padding-top: 24px; border-top: 1px solid #EBEBEB; flex-wrap: wrap; }
        .pf-img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1.5px solid #EBEBEB; }
        .pf-name { font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 1px; }
        .pf-sub { font-size: 12px; color: #94A3B8; margin-bottom: 4px; }
        .pf-link { font-size: 12px; color: #2979FF; font-weight: 600; text-decoration: none; }
        .pf-right { margin-left: auto; font-size: 11px; color: #CBD5E1; letter-spacing: 0.05em; }

        @media (max-width: 480px) {
          .qw-body-inner { padding-left: 24px; }
          .crit-body-inner { padding-left: 22px; }
          .qw-idx { width: 36px; font-size: 34px; }
          .cta-body { padding: 28px 20px; }
          .result-cta-call-body, .result-cta-newsletter-body { padding: 28px 20px; }
          .pf-right { display: none; }
          .sticky-bar-text { display: none; }
        }
      `}</style>

      {/* ── SCRIPTS ── */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var TARGET = ${gPct};
          var COLOR  = '${t.color}';
          var AUDIT_ID = '${auditId}';
          var LOCK_KEY = 'optin_unlocked_' + AUDIT_ID;
          var ANS_KEY  = 'optin_ans3_' + AUDIT_ID;

          var answers = { q1: null, q2: null, q3: null };
          var currentStep = 1;

          function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

          /* ── Score counter + gauge ── */
          window.addEventListener('DOMContentLoaded', function() {
            var numEl  = document.getElementById('score-num');
            var fillEl = document.getElementById('gauge-fill');
            var tierEl = document.getElementById('score-tier');

            if (numEl) {
              setTimeout(function() {
                var start = null, dur = 1400;
                function step(ts) {
                  if (!start) start = ts;
                  var p = Math.min((ts - start) / dur, 1);
                  var e = easeOut(p);
                  numEl.textContent = Math.round(e * TARGET);
                  if (p > 0.65) numEl.style.color = COLOR;
                  if (p < 1) { requestAnimationFrame(step); }
                  else {
                    numEl.textContent = TARGET;
                    numEl.style.color = COLOR;
                    if (tierEl) tierEl.classList.add('visible');
                  }
                }
                if (fillEl) fillEl.style.width = TARGET + '%';
                requestAnimationFrame(step);
              }, 200);
            }

            /* ── Accordions: quick wins ── */
            document.querySelectorAll('.qw-row').forEach(function(row) {
              row.addEventListener('click', function() {
                var body = row.querySelector('.qw-body');
                var inner = row.querySelector('.qw-body-inner');
                if (!body || !inner) return;
                var isOpen = row.classList.contains('open');
                if (isOpen) {
                  body.style.maxHeight = '0';
                  row.classList.remove('open');
                } else {
                  body.style.maxHeight = inner.scrollHeight + 'px';
                  row.classList.add('open');
                }
              });
            });

            /* ── Accordions: criteria ── */
            document.querySelectorAll('.crit').forEach(function(crit) {
              crit.addEventListener('click', function() {
                var body = crit.querySelector('.crit-body');
                var inner = crit.querySelector('.crit-body-inner');
                if (!body || !inner) return;
                var isOpen = crit.classList.contains('open');
                if (isOpen) {
                  body.style.maxHeight = '0';
                  crit.classList.remove('open');
                } else {
                  body.style.maxHeight = inner.scrollHeight + 'px';
                  crit.classList.add('open');
                }
              });
            });

            /* ── Scroll-triggered bars ── */
            var bars = document.querySelectorAll('[data-bar]');
            var observed = new Set();
            if (window.IntersectionObserver) {
              var obs = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                  if (entry.isIntersecting && !observed.has(entry.target)) {
                    observed.add(entry.target);
                    var el = entry.target;
                    var pct = el.getAttribute('data-bar');
                    setTimeout(function() { el.style.width = pct + '%'; }, 100);
                  }
                });
              }, { threshold: 0.1 });
              bars.forEach(function(b) { obs.observe(b); });
            } else {
              bars.forEach(function(b) { b.style.width = b.getAttribute('data-bar') + '%'; });
            }

            /* ── Mini donut circles ── */
            document.querySelectorAll('[data-ring]').forEach(function(el) {
              var pct = parseFloat(el.getAttribute('data-ring'));
              var r = 14; var circ = 2 * Math.PI * r;
              el.style.strokeDasharray = circ;
              el.style.strokeDashoffset = circ;
              setTimeout(function() {
                el.style.strokeDashoffset = circ - (pct / 100) * circ;
              }, 300);
            });

            /* ── Sticky bar: show after hero scrolls out ── */
            var hero = document.querySelector('.hero');
            var stickyBar = document.getElementById('sticky-bar');
            var alreadyUnlocked = localStorage.getItem(LOCK_KEY);

            if (alreadyUnlocked && stickyBar) {
              var savedAns = localStorage.getItem(ANS_KEY);
              unlockContent(savedAns, false);
            } else if (stickyBar && hero) {
              setTimeout(function() {
                var heroObs = new IntersectionObserver(function(entries) {
                  entries.forEach(function(entry) {
                    if (!entry.isIntersecting) {
                      stickyBar.classList.add('visible');
                    } else {
                      stickyBar.classList.remove('visible');
                    }
                  });
                }, { threshold: 0 });
                heroObs.observe(hero);
              }, 1000);
            }

            /* ── Gate mask click → open modal ── */
            document.querySelectorAll('.gate-mask, .sec-card-gate-mask').forEach(function(mask) {
              mask.addEventListener('click', function(e) { e.stopPropagation(); openModal(); });
            });

            /* ── Sticky bar button ── */
            var sBtn = document.getElementById('sticky-bar-btn');
            if (sBtn) sBtn.addEventListener('click', openModal);

            /* ── Modal close ── */
            var modalBg = document.getElementById('modal-bg');
            var mClose = document.getElementById('modal-close');
            if (modalBg) {
              modalBg.addEventListener('click', function(e) {
                if (e.target === modalBg) closeModal();
              });
            }
            if (mClose) mClose.addEventListener('click', closeModal);

            /* ── Q options ── */
            document.querySelectorAll('.q-opt').forEach(function(opt) {
              opt.addEventListener('click', function() {
                var step = opt.closest('.q-step');
                step.querySelectorAll('.q-opt').forEach(function(o) { o.classList.remove('selected'); });
                opt.classList.add('selected');
                var q = opt.getAttribute('data-q');
                var val = opt.getAttribute('data-val');
                answers[q] = val;
                setTimeout(function() { goNext(); }, 320);
              });
            });
          });

          function openModal() {
            var modalBg = document.getElementById('modal-bg');
            if (modalBg) modalBg.classList.add('open');
            document.body.style.overflow = 'hidden';
            setStep(1);
          }

          function closeModal() {
            var modalBg = document.getElementById('modal-bg');
            if (modalBg) modalBg.classList.remove('open');
            document.body.style.overflow = '';
          }

          function setStep(n) {
            currentStep = n;
            document.querySelectorAll('.q-step').forEach(function(s) { s.classList.remove('active'); });
            var target = document.getElementById('q-step-' + n);
            if (target) target.classList.add('active');
            updateProgress(n);
          }

          function updateProgress(n) {
            var dots = document.querySelectorAll('.mpd');
            dots.forEach(function(d, i) {
              d.classList.remove('active', 'done');
              if (i + 1 === n) d.classList.add('active');
              else if (i + 1 < n) d.classList.add('done');
            });
          }

          function goNext() {
            if (currentStep < 3) {
              setStep(currentStep + 1);
            } else {
              finishForm();
            }
          }

          function finishForm() {
            var ans3 = answers.q3;
            /* Save to localStorage */
            localStorage.setItem(LOCK_KEY, '1');
            localStorage.setItem(ANS_KEY, ans3 || '');
            /* Save to Supabase via API route (best-effort) */
            fetch('/api/qualify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ auditId: AUDIT_ID, q1: answers.q1, q2: answers.q2, q3: answers.q3 })
            }).catch(function() {});
            closeModal();
            /* Accompagné → ouvre Calendly immédiatement */
            if (ans3 === 'accompagne') {
              window.open('https://calendly.com/romain-visibility/callmemaybe', '_blank');
            }
            unlockContent(ans3, ans3 !== 'accompagne');
          }

          function unlockContent(ans3, animate) {
            var stickyBar = document.getElementById('sticky-bar');
            /* Remove all gates */
            document.querySelectorAll('.gated-zone').forEach(function(z) {
              if (animate) {
                z.classList.add('unlocked');
                setTimeout(function() { z.classList.remove('locked'); }, 500);
              } else {
                z.classList.remove('locked');
                z.classList.add('unlocked');
              }
            });
            document.querySelectorAll('.sec-card-gated').forEach(function(z) {
              if (animate) {
                z.classList.add('unlocked');
                setTimeout(function() { z.classList.remove('locked'); }, 500);
              } else {
                z.classList.remove('locked');
                z.classList.add('unlocked');
              }
            });
            /* Hide sticky bar */
            if (stickyBar) { stickyBar.classList.remove('visible'); stickyBar.classList.add('hidden'); }
            /* Show personalized CTA */
            var resultCta = document.getElementById('result-cta');
            var genericCta = document.getElementById('generic-cta');
            if (resultCta) resultCta.classList.add('visible');
            if (genericCta) genericCta.style.display = 'none';
            /* Show correct result variant */
            var callBox = document.getElementById('result-call');
            var nlBox   = document.getElementById('result-nl');
            if (ans3 === 'accompagne') {
              if (callBox) callBox.style.display = 'block';
              if (nlBox)   nlBox.style.display   = 'none';
            } else {
              if (callBox) callBox.style.display = 'none';
              if (nlBox)   nlBox.style.display   = 'block';
            }
            /* Scroll to result */
            if (animate && resultCta) {
              setTimeout(function() {
                resultCta.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 600);
            }
          }
        })();
      ` }} />

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-logo">R</div>
          <span className="nav-name">Romain Bour</span>
        </div>
        <span className="nav-tag">Analyse LinkedIn</span>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-dots" />
        <div className="hero-inner">
          {data.photo_url && (
            <img className="hero-avatar" src={data.photo_url} alt={`${data.first_name} ${data.last_name}`} />
          )}
          <h1 className="hero-name">{data.first_name} {data.last_name}</h1>
          <p className="hero-date">
            Analyse du {new Date(data.analyzed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="score-num-row">
            <span id="score-num" className="score-num">0</span>
            <span className="score-denom">/100</span>
          </div>

          <div id="score-tier" className="score-tier" style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
            <span className="score-tier-dot" style={{ background: t.color }} />
            {t.label}
          </div>

          <div className="gauge">
            <div className="gauge-track">
              <div
                id="gauge-fill"
                className="gauge-fill"
                style={{ background: `linear-gradient(90deg, ${t.color}CC, ${t.color})`, width: '0%' }}
              />
            </div>
            <div className="gauge-labels">
              {['0', '25', '50', '75', '100'].map(v => (
                <span key={v} className="gauge-label">{v}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">

        {/* ── QUICK WINS ── */}
        {quickWins.length > 0 && (
          <div className="qw">
            <div className="qw-hd">
              <div className="qw-hd-left">
                <p className="qw-hd-label">Plan d'action</p>
                <p className="qw-hd-title">Vos priorités de progression</p>
                <p className="qw-hd-sub">Cliquez sur chaque point pour voir les détails</p>
              </div>
            </div>

            {/* Priority 01 — free */}
            {quickWins[0] && (
              <div className="qw-row">
                <div className="qw-row-hd">
                  <span className="qw-idx">01</span>
                  <div className="qw-content">
                    <p className="qw-section-tag">{quickWins[0].section}</p>
                    <p className="qw-title">{quickWins[0].titre}</p>
                    {quickWins[0].explication && (
                      <p className="qw-preview">{quickWins[0].explication.slice(0, 70)}{quickWins[0].explication.length > 70 ? '…' : ''}</p>
                    )}
                  </div>
                  <svg className="qw-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 6l4 4 4-4"/>
                  </svg>
                </div>
                {quickWins[0].explication && (
                  <div className="qw-body">
                    <div className="qw-body-inner">
                      <div className="qw-body-text" style={{ color: t.color }}>{quickWins[0].explication}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Priorities 02 & 03 — gated */}
            {quickWins.length > 1 && (
              <div className="gated-zone locked" style={{ minHeight: '120px' }}>
                <div className="gate-content">
                  {quickWins.slice(1).map((w, i) => (
                    <div key={i} className="qw-row">
                      <div className="qw-row-hd">
                        <span className="qw-idx">0{i + 2}</span>
                        <div className="qw-content">
                          <p className="qw-section-tag">{w.section}</p>
                          <p className="qw-title">{w.titre}</p>
                          {w.explication && (
                            <p className="qw-preview">{w.explication.slice(0, 70)}{w.explication.length > 70 ? '…' : ''}</p>
                          )}
                        </div>
                        <svg className="qw-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M4 6l4 4 4-4"/>
                        </svg>
                      </div>
                      {w.explication && (
                        <div className="qw-body">
                          <div className="qw-body-inner">
                            <div className="qw-body-text" style={{ color: t.color }}>{w.explication}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="gate-mask">
                  <div className="gate-lock-badge">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="7" width="10" height="8" rx="2"/>
                      <path d="M5.5 7V5a2.5 2.5 0 015 0v2"/>
                    </svg>
                    Débloquer {quickWins.length - 1} priorité{quickWins.length - 1 > 1 ? 's' : ''} supplémentaire{quickWins.length - 1 > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RECAP ── */}
        <div className="recap">
          <div className="recap-hd">
            <p className="recap-hd-label">Vue d'ensemble</p>
            <p className="recap-hd-title">Score par catégorie</p>
          </div>
          <div className="recap-list">
            {SECTIONS.map((s) => {
              const pts = Number(data[`${s.key}_total_points`]) || 0
              const max = Number(data[`${s.key}_total_maximum`]) || s.max
              const c = scoreColor(pts / max)
              const pct = Math.round((pts / max) * 100)
              return (
                <div key={s.key} className="recap-row">
                  <div
                    className="recap-icon"
                    style={{ background: c.soft }}
                    dangerouslySetInnerHTML={{ __html: ICONS[s.key] || '' }}
                  />
                  <span className="recap-name">{s.label}</span>
                  <div className="recap-bar-wrap">
                    <div className="recap-bar-track">
                      <div
                        className="recap-bar-fill"
                        data-bar={pct}
                        style={{ width: '0%', background: c.bar }}
                      />
                    </div>
                  </div>
                  <span className="recap-pts" style={{ color: c.text }}>{pts}/{max}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── SECTION DETAIL CARDS — all gated ── */}
        {SECTIONS.map((s) => {
          const pts = Number(data[`${s.key}_total_points`]) || 0
          const max = Number(data[`${s.key}_total_maximum`]) || s.max
          const c = scoreColor(pts / max)
          const pct = Math.round((pts / max) * 100)
          const criteres = getCriteres(data, s.key)
          return (
            <div key={s.key} className="sec-card sec-card-gated locked">
              <div className="sec-card-body">
                <div className="sec-card">
                  <div className="sec-strip" style={{ background: c.bar }} />
                  <div className="sec-hd">
                    <div
                      className="sec-icon"
                      style={{ background: c.soft, color: c.text }}
                      dangerouslySetInnerHTML={{ __html: ICONS[s.key] || '' }}
                    />
                    <div className="sec-info">
                      <p className="sec-name">{s.label}</p>
                      <p className="sec-desc">{s.desc}</p>
                    </div>
                    <span className="sec-score" style={{ background: c.soft, color: c.text, border: `1px solid ${c.border}` }}>
                      {pts}/{max}
                    </span>
                  </div>

                  {s.key === 'banner' && data.cover_url && <img className="sec-banner" src={data.cover_url} alt="Bannière" />}
                  {s.key === 'photo' && data.photo_url && (
                    <div className="sec-photo-row">
                      <img className="sec-photo" src={data.photo_url} alt="Photo de profil" />
                    </div>
                  )}

                  {criteres.map((cr, i) => {
                    const cc = scoreColor(cr.pts / cr.max)
                    const r = 14; const circ = 2 * Math.PI * r
                    const initOffset = circ
                    return (
                      <div key={i} className="crit">
                        <div className="crit-hd">
                          <div className="crit-bar-mini">
                            <svg width="36" height="36" viewBox="0 0 36 36">
                              <circle className="crit-mini-track" cx="18" cy="18" r={r} />
                              <circle
                                className="crit-mini-fill"
                                cx="18" cy="18" r={r}
                                stroke={cc.bar}
                                data-ring={Math.round((cr.pts / cr.max) * 100)}
                                style={{ strokeDasharray: circ, strokeDashoffset: initOffset }}
                              />
                            </svg>
                          </div>
                          <span className="crit-name">{cr.titre}</span>
                          <span className="crit-pts" style={{ color: cc.text }}>{cr.pts}/{cr.max}</span>
                          {cr.explication && (
                            <div className="crit-chev-wrap">
                              <span className="crit-chev-label">Voir</span>
                              <svg className="crit-chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M4 6l4 4 4-4"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        {cr.explication && (
                          <div className="crit-body">
                            <div className="crit-body-inner">
                              <div className="crit-expl" style={{ borderLeftColor: cc.bar }}>{cr.explication}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <div className="sec-ft">
                    <div className="sec-ft-track">
                      <div
                        className="sec-ft-fill"
                        data-bar={pct}
                        style={{ width: '0%', background: c.bar }}
                      />
                    </div>
                    <span className="sec-ft-label" style={{ color: c.text }}>{pct}%</span>
                  </div>
                </div>
              </div>
              <div className="sec-card-gate-mask">
                <div className="gate-lock-badge">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="7" width="10" height="8" rx="2"/>
                    <path d="M5.5 7V5a2.5 2.5 0 015 0v2"/>
                  </svg>
                  Voir l'analyse complète
                </div>
                <p className="sec-card-gate-hint">Réponds à 3 questions pour débloquer</p>
              </div>
            </div>
          )
        })}

        {/* ── GENERIC CTA (shown before form) ── */}
        <div id="generic-cta" className="cta">
          <div className="cta-top-bar" />
          <div className="cta-body">
            <p className="cta-eyebrow">Analyse complète</p>
            <h2 className="cta-h">Vous savez où vous en êtes.<br />Voyons comment débloquer la suite.</h2>
            <p className="cta-sub">
              Répondez à 3 questions rapides pour accéder à votre analyse complète
              et recevoir les recommandations adaptées à votre situation.
            </p>
            <button
              className="cta-btn"
              onClick={undefined}
              style={{ border: 'none', cursor: 'pointer' }}
              id="generic-cta-btn"
            >
              Voir mon analyse complète
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 7h10M8 3l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── RESULT CTA (shown after form) ── */}
        <div id="result-cta">
          {/* Accompagné → Calendly */}
          <div id="result-call" className="result-cta-call" style={{ display: 'none' }}>
            <div className="result-cta-call-bar" />
            <div className="result-cta-call-body">
              <p className="result-eyebrow">Prochaine étape</p>
              <h2 className="result-h">Construisons votre plan<br />d'action ensemble.</h2>
              <p className="result-sub">
                30 minutes pour identifier vos leviers prioritaires, clarifier votre positionnement
                et repartir avec un plan d'action concret pour votre profil LinkedIn.
              </p>
              <a className="result-btn-call" href="https://calendly.com/romain-visibility/callmemaybe" target="_blank" rel="noreferrer">
                Réserver mon appel gratuit
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 7h10M8 3l4 4-4 4"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Seul → Newsletter */}
          <div id="result-nl" className="result-cta-newsletter" style={{ display: 'none' }}>
            <div className="result-cta-newsletter-bar" />
            <div className="result-cta-newsletter-body">
              <div className="result-check-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10l4.5 4.5 7.5-8"/>
                </svg>
              </div>
              <h2 className="result-nl-title">Rejoins la newsletter.</h2>
              <p className="result-nl-sub">
                Chaque semaine, les stratégies concrètes pour faire de votre profil LinkedIn un vrai levier de business, sans devenir influenceur.
                Vous serez parmi les premiers à recevoir le premier numéro.
              </p>
              <a className="result-btn-li" href="https://www.linkedin.com/in/romainbour/" target="_blank" rel="noreferrer">
                Suivre sur LinkedIn
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 7h10M8 3l4 4-4 4"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── PDF DOWNLOAD BAR ── */}
        <div className="pdf-bar">
          <p className="pdf-hint">Garde une trace de ton analyse pour y revenir sans la refaire.</p>
          <button className="pdf-btn" id="pdf-btn">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2v9M5 8l3 3 3-3M2 13h12"/>
            </svg>
            Télécharger mon analyse (PDF)
          </button>
        </div>

        {/* ── FOOTER ── */}
        <div className="pf">
          <img className="pf-img" src="/romain-face.jpeg" alt="Romain Bour" />
          <div>
            <p className="pf-name">Romain Bour</p>
            <p className="pf-sub">Expert branding LinkedIn pour dirigeants B2B</p>
            <a className="pf-link" href="https://www.linkedin.com/in/romainbour/" target="_blank" rel="noreferrer">Suivre sur LinkedIn →</a>
          </div>
          <span className="pf-right">Optin.ia</span>
        </div>

      </div>

      {/* ── STICKY BAR ── */}
      <div id="sticky-bar">
        <p className="sticky-bar-text"><strong>Votre analyse complète vous attend.</strong> Répondez à 3 questions rapides.</p>
        <button className="sticky-bar-btn" id="sticky-bar-btn">
          Voir mon analyse
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 6.5h9M7 3l3.5 3.5L7 10"/>
          </svg>
        </button>
      </div>

      {/* ── MODAL ── */}
      <div id="modal-bg">
        <div className="modal-box">
          <div className="modal-handle" />
          <div className="modal-inner" style={{ position: 'relative' }}>
            <button className="modal-close" id="modal-close" aria-label="Fermer">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l10 10M11 1L1 11"/>
              </svg>
            </button>

            {/* Progress dots */}
            <div className="modal-progress">
              <div className="mpd active" />
              <div className="mpd" />
              <div className="mpd" />
            </div>

            {/* Step 1 */}
            <div id="q-step-1" className="q-step active">
              <p className="q-label">Question 1 sur 3</p>
              <h3 className="q-title">Ce qui freine le plus votre visibilité LinkedIn en ce moment ?</h3>
              <div className="q-opts">
                {[
                  { val: 'methode',   icon: '🗺️', label: 'Pas de méthode claire' },
                  { val: 'message',   icon: '💬', label: 'Message flou ou trop généraliste' },
                  { val: 'temps',     icon: '⏱️', label: 'Manque de temps' },
                  { val: 'convert',   icon: '📉', label: 'Je poste mais rien ne convertit' },
                ].map(o => (
                  <button key={o.val} className="q-opt" data-q="q1" data-val={o.val}>
                    <span className="q-opt-icon">{o.icon}</span>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div id="q-step-2" className="q-step">
              <p className="q-label">Question 2 sur 3</p>
              <h3 className="q-title">Votre objectif prioritaire sur LinkedIn ?</h3>
              <div className="q-opts">
                {[
                  { val: 'leads',     icon: '🎯', label: 'Générer des leads qualifiés' },
                  { val: 'autorite',  icon: '📣', label: 'Développer mon autorité' },
                  { val: 'les-deux',  icon: '🚀', label: 'Les deux à la fois' },
                ].map(o => (
                  <button key={o.val} className="q-opt" data-q="q2" data-val={o.val}>
                    <span className="q-opt-icon">{o.icon}</span>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div id="q-step-3" className="q-step">
              <p className="q-label">Question 3 sur 3</p>
              <h3 className="q-title">Ce que vous recherchez pour avancer ?</h3>
              <div className="q-opts">
                {[
                  { val: 'seul',       icon: '📚', label: 'Comprendre et progresser seul' },
                  { val: 'accompagne', icon: '🤝', label: 'Être accompagné pour aller plus vite' },
                ].map(o => (
                  <button key={o.val} className="q-opt" data-q="q3" data-val={o.val}>
                    <span className="q-opt-icon">{o.icon}</span>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wire generic CTA + PDF button */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          /* Generic CTA → open modal */
          var btn = document.getElementById('generic-cta-btn');
          if (btn) btn.addEventListener('click', function() {
            var modalBg = document.getElementById('modal-bg');
            if (modalBg) modalBg.classList.add('open');
            document.body.style.overflow = 'hidden';
          });

          /* PDF button → unlock all then print */
          var pdfBtn = document.getElementById('pdf-btn');
          if (pdfBtn) pdfBtn.addEventListener('click', function() {
            /* Reveal all gated content before printing */
            document.querySelectorAll('.gated-zone').forEach(function(z) {
              z.classList.remove('locked'); z.classList.add('unlocked');
            });
            document.querySelectorAll('.sec-card-gated').forEach(function(z) {
              z.classList.remove('locked'); z.classList.add('unlocked');
            });
            document.querySelectorAll('.crit-body').forEach(function(b) {
              b.style.maxHeight = 'none';
            });
            document.querySelectorAll('.qw-body').forEach(function(b) {
              b.style.maxHeight = 'none';
            });
            setTimeout(function() { window.print(); }, 150);
          });
        });
      ` }} />
    </>
  )
}
