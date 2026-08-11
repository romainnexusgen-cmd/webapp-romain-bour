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

// Minimal SVG icons — 16×16, 1.5px stroke
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
    'https://zgbymaqorbmpmbhbfiya.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYnltYXFvcmJtcG1iaGJmaXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzM0MTksImV4cCI6MjA5NzcwOTQxOX0.9Y6ymjUY2kY7w1sb4lLUYzabKLhmh-4Y9J_tufNG3PI'
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: #F8F8F7;
          color: #0F172A;
          -webkit-font-smoothing: antialiased;
          line-height: 1.5;
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
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
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

        /* score reveal */
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

        /* tier badge */
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

        /* gauge */
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
        .wrap { max-width: 720px; margin: 0 auto; padding: 36px 16px 80px; display: flex; flex-direction: column; gap: 16px; }

        /* ── QUICK WINS — NEW DESIGN ── */
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

        /* each win row */
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
        /* big ghost number */
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

        /* chevron */
        .qw-chevron {
          width: 20px; height: 20px; flex-shrink: 0; margin-top: 6px;
          color: #CBD5E1;
          transition: transform 0.25s, color 0.2s;
        }
        .qw-row.open .qw-chevron { transform: rotate(180deg); color: #64748B; }

        /* accordion body */
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
          border-bottom: 1px solid #F8F8F7;
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
        /* colored top strip by score */
        .sec-strip { height: 3px; width: 100%; }
        .sec-hd { padding: 18px 22px; border-bottom: 1px solid #F8F8F7; display: flex; align-items: center; gap: 12px; }
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

        /* criteria — accordion */
        .crit {
          border-bottom: 1px solid #F8F8F7; cursor: pointer;
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
        .crit-chev {
          width: 16px; height: 16px; color: #CBD5E1; flex-shrink: 0;
          transition: transform 0.25s, color 0.15s;
        }
        .crit.open .crit-chev { transform: rotate(180deg); color: #64748B; }

        .crit-body { max-height: 0; overflow: hidden; transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1); }
        .crit-body-inner {
          padding: 0 22px 16px 70px;
          font-size: 13px; color: #475569; line-height: 1.75;
        }
        .crit-expl {
          padding: 12px 16px; border-radius: 9px; background: #F8FAFC;
          border-left: 3px solid #E2E8F0;
        }

        /* section footer */
        .sec-ft {
          padding: 11px 22px; background: #FAFAFA; border-top: 1px solid #F1F1EF;
          display: flex; align-items: center; gap: 12px;
        }
        .sec-ft-track { flex: 1; height: 3px; background: #EBEBEB; border-radius: 100px; overflow: hidden; }
        .sec-ft-fill  { height: 100%; border-radius: 100px; }
        .sec-ft-label { font-size: 11px; font-weight: 700; white-space: nowrap; }

        /* ── CTA ── */
        .cta {
          background: white; border-radius: 16px;
          border: 1px solid #EBEBEB;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .cta-top-bar { height: 3px; background: linear-gradient(90deg, #3B82F6, #2563EB 60%, #6366F1); }
        .cta-body { padding: 36px 28px; display: flex; flex-direction: column; align-items: flex-start; gap: 0; }
        .cta-eyebrow {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #3B82F6; margin-bottom: 12px;
        }
        .cta-h {
          font-size: clamp(22px, 4.5vw, 28px); font-weight: 900;
          color: #0F172A; letter-spacing: -0.6px; line-height: 1.2;
          margin-bottom: 12px;
        }
        .cta-sub { font-size: 14px; color: #64748B; line-height: 1.75; max-width: 440px; margin-bottom: 28px; }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #1D4ED8;
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

        /* ── FOOTER ── */
        .pf { display: flex; align-items: center; gap: 14px; padding-top: 24px; border-top: 1px solid #EBEBEB; flex-wrap: wrap; }
        .pf-img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1.5px solid #EBEBEB; }
        .pf-name { font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 1px; }
        .pf-sub { font-size: 12px; color: #94A3B8; margin-bottom: 4px; }
        .pf-link { font-size: 12px; color: #3B82F6; font-weight: 600; text-decoration: none; }
        .pf-right { margin-left: auto; font-size: 11px; color: #CBD5E1; letter-spacing: 0.05em; }

        @media (max-width: 480px) {
          .qw-body-inner { padding-left: 24px; }
          .crit-body-inner { padding-left: 22px; }
          .qw-idx { width: 36px; font-size: 34px; }
          .cta-body { padding: 28px 20px; }
          .pf-right { display: none; }
        }
      `}</style>

      {/* ── SCRIPTS ── */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var TARGET = ${gPct};
          var COLOR  = '${t.color}';
          var BG     = '${t.bg}';
          var BORDER = '${t.border}';

          function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

          /* ── score counter + gauge ── */
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

            /* ── accordion: quick wins ── */
            document.querySelectorAll('.qw-row').forEach(function(row) {
              row.addEventListener('click', function() {
                var body = row.querySelector('.qw-body');
                var inner = row.querySelector('.qw-body-inner');
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

            /* ── accordion: criteria ── */
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

            /* ── scroll-triggered bar animations ── */
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

            /* ── mini donut circles ── */
            document.querySelectorAll('[data-ring]').forEach(function(el) {
              var pct = parseFloat(el.getAttribute('data-ring'));
              var r = 14; var circ = 2 * Math.PI * r;
              el.style.strokeDasharray = circ;
              el.style.strokeDashoffset = circ;
              setTimeout(function() {
                el.style.strokeDashoffset = circ - (pct / 100) * circ;
              }, 300);
            });
          });
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
                <p className="qw-hd-title">Tes priorités de progression</p>
                <p className="qw-hd-sub">Clique sur chaque point pour voir les détails</p>
              </div>
            </div>

            {quickWins.map((w, i) => (
              <div key={i} className="qw-row">
                <div className="qw-row-hd">
                  <span className="qw-idx">0{i + 1}</span>
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

        {/* ── SECTION DETAIL CARDS ── */}
        {SECTIONS.map((s) => {
          const pts = Number(data[`${s.key}_total_points`]) || 0
          const max = Number(data[`${s.key}_total_maximum`]) || s.max
          const c = scoreColor(pts / max)
          const pct = Math.round((pts / max) * 100)
          const criteres = getCriteres(data, s.key)
          return (
            <div key={s.key} className="sec-card">
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
                      {/* mini donut */}
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
                        <svg className="crit-chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M4 6l4 4 4-4"/>
                        </svg>
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
          )
        })}

        {/* ── CTA ── */}
        <div className="cta">
          <div className="cta-top-bar" />
          <div className="cta-body">
            <p className="cta-eyebrow">Prochaine étape</p>
            <h2 className="cta-h">Tu sais ce qui freine ton profil.<br />Passons à l'action.</h2>
            <p className="cta-sub">
              Un diagnostic, c'est utile. Mais sans plan d'action concret, ça reste du bruit.
              Un appel de 30 min suffit à transformer ton profil en levier de business réel.
            </p>
            <a className="cta-btn" href="https://www.romainbour.com/waitingroom" target="_blank" rel="noreferrer">
              Réserver un appel gratuit
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 7h10M8 3l4 4-4 4"/>
              </svg>
            </a>
          </div>
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
    </>
  )
}
