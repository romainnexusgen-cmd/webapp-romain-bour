'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, LinkedInData } from '@/lib/supabase'
import { LINKEDIN_CRITERIA, SECTION_MAPPING, getCriteriaExpectation, getCriteriaTitle } from '@/lib/linkedin-criteria'
import GlobalScore from '@/components/GlobalScore'
import SectionScores from '@/components/SectionScores'
import DetailSection from '@/components/DetailSection'
import Footer from '@/components/Footer'
import ContactModal from '@/components/ContactModal'
import { captureEvent, identifyUser } from '@/lib/posthog'

export default function ResultsPage() {
  const params = useParams()
  const code = params.code as string
  
  // Fonction pour vérifier si on doit déclencher le webhook
  const shouldTriggerWebhook = () => {
    // Vérifier les paramètres d'URL qui indiquent qu'on ne doit pas déclencher le webhook
    if (typeof window === 'undefined') return true // Côté serveur, on déclenche par défaut
    
    const urlParams = new URLSearchParams(window.location.search)
    const skipParams = ['utm', 'admin', 'preview', 'test']
    
    for (const param of skipParams) {
      if (urlParams.has(param)) {
        return false
      }
    }
    
    return true
  }
  
  const [linkedinData, setLinkedinData] = useState<LinkedInData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [animationPhase, setAnimationPhase] = useState(0)
  const [showSpacer, setShowSpacer] = useState(true)
  const [startTime] = useState(() => Date.now())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isContentUnlocked, setIsContentUnlocked] = useState(false)

  // Auto-unlock content when ?admin is present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('admin')) {
        setIsContentUnlocked(true)
      }
    }
  }, [])

  // Track page view
  useEffect(() => {
    captureEvent('results_page_viewed', { code: code })
  }, [code])

  // Tracking du temps passé sur la page (pour N8n uniquement)
  useEffect(() => {
    const sendTimeTracking = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000) // temps en secondes
      
      // Envoyer à N8n seulement si l'utilisateur a passé au moins 1 seconde
      if (timeSpent > 0) {
        navigator.sendBeacon(
          'https://n8n.hadrien-grosbois.ovh/webhook/time-tracking',
          JSON.stringify({
            code: code,
            timeSpent: timeSpent,
            timestamp: new Date().toISOString()
          })
        )
      }
    }

    // Détecter quand l'utilisateur quitte la page
    const handleBeforeUnload = () => {
      sendTimeTracking()
    }

    // Détecter quand l'onglet est caché (changement d'onglet)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendTimeTracking()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      sendTimeTracking() // Envoyer aussi au démontage du composant
    }
  }, [code, startTime])

  useEffect(() => {
    const fetchLinkedInData = async () => {
      try {
        console.log('🔍 Requête Supabase pour code:', code)
        
        const { data, error } = await supabase
          .from('database-analyse-profile')
          .select('*')
          .eq('id', code)
          .single()

        console.log('📥 Réponse Supabase:', {
          hasError: !!error,
          error: error,
          hasData: !!data,
          rawData: data
        })

        if (error) {
          console.error('❌ Erreur Supabase:', error)
          captureEvent('results_page_error', {
            code: code,
            error: error.message
          })
          setError('Analyse LinkedIn non trouvée')
          return
        }

        // Debug: Afficher tous les champs disponibles pour voir si l'email existe sous un autre nom
        console.log('📊 Analyse des données Supabase:', {
          hasEmail: !!data?.email,
          emailValue: data?.email,
          emailType: typeof data?.email,
          allKeys: Object.keys(data || {}),
          allKeysWithEmail: Object.keys(data || {}).filter(key => 
            key.toLowerCase().includes('email') || 
            key.toLowerCase().includes('mail')
          ),
          sampleData: {
            id: data?.id,
            first_name: data?.first_name,
            last_name: data?.last_name,
            linkedin_url: data?.linkedin_url,
            // Chercher tous les champs qui pourraient être l'email
            ...Object.keys(data || {}).reduce((acc, key) => {
              if (key.toLowerCase().includes('email') || key.toLowerCase().includes('mail')) {
                acc[key] = data[key]
              }
              return acc
            }, {} as Record<string, unknown>)
          }
        })
        
        // Identify user in PostHog with their email from Supabase
        if (data && data.email) {
          identifyUser(data.email, {
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            code: code
          })
        }
        
        // Track successful results load
        captureEvent('results_loaded', {
          code: code,
          has_data: !!data,
          email: data?.email || null
        })
        
        // Envoyer au webhook N8n quand la page de résultats est chargée
        // Seulement si aucun paramètre d'URL ne bloque le déclenchement
        if (shouldTriggerWebhook()) {
          fetch('https://n8n.hadrien-grosbois.ovh/webhook/check-result', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: code,
              email: data?.email || null,
              first_name: data?.first_name || null,
              last_name: data?.last_name || null,
              timestamp: new Date().toISOString()
            }),
            keepalive: true
          }).catch(error => {
            console.error('Erreur webhook check-result:', error)
          })
        } else {
          console.log('Webhook check-result ignoré à cause des paramètres d\'URL')
        }
        
        setLinkedinData(data)
      } catch {
        setError('Erreur lors du chargement de l\'analyse LinkedIn')
      } finally {
        setLoading(false)
      }
    }

    if (code) {
      fetchLinkedInData()
    }
  }, [code])

  const handleGlobalScoreComplete = () => {
    setAnimationPhase(1)
    // Retirer l'espaceur rapidement après l'animation
    setTimeout(() => {
      setShowSpacer(false)
    }, 200)
  }

  const handleSectionScoresComplete = () => {
    setAnimationPhase(2)
  }

  // Handler pour les clics sur les CTAs
  // L'email est récupéré depuis Supabase via linkedinData.email
  const handleCTAClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>, ctaName: string, url: string) => {
    // Récupérer l'email depuis Supabase (stocké dans linkedinData)
    const userEmail = linkedinData?.email || null
    
    console.log('🔵 CTA cliqué:', { ctaName, userEmail, code, url, linkedinData: !!linkedinData })
    
    // Track dans PostHog
    captureEvent('cta_clicked', {
      cta_name: ctaName,
      cta_url: url,
      code: code,
      email: userEmail
    })

    // Si c'est le bouton de déblocage, ouvrir le modal
    if (ctaName === '🔒 Clique ici pour débloquer cette section') {
      e.preventDefault()
      setIsModalOpen(true)
      return
    }

    // Envoyer au webhook N8n pour tous les CTAs bootcamp
    // N8n pourra récupérer l'email via le code depuis sa base de données
    const ctaNamesToTrack = ['Booker un call', '🔒 Clique ici pour débloquer cette section']
    if (ctaNamesToTrack.includes(ctaName)) {
      const webhookData = {
        email: userEmail || null, // Email si disponible, sinon null
        cta_name: ctaName,
        cta_url: url,
        code: code, // N8n peut utiliser ce code pour retrouver l'email
        timestamp: new Date().toISOString()
      }
      
      // Utiliser fetch avec keepalive pour garantir l'envoi même si la page redirige
      fetch('https://n8n.hadrien-grosbois.ovh/webhook/click-cta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
        keepalive: true
      }).catch(error => {
        console.error('Erreur webhook:', error)
      })
    }
    
    // Pour les autres CTAs, rediriger vers l'URL
    if (url && ctaName !== '🔒 Clique ici pour débloquer cette section') {
      // Petit délai pour permettre l'envoi du webhook
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer')
      }, 100)
    }
  }

  // Handler pour la soumission du modal
  const handleModalSubmit = async (data: {
    objective: string
    currentSituation: string
    howToAdvance: string
    blockingPoint?: string
  }) => {
    setIsSubmitting(true)
    
    try {
      const userEmail = linkedinData?.email || null
      
      // Envoyer les données du questionnaire au webhook click-cta
      const webhookData = {
        email: userEmail || null,
        cta_name: '🔒 Clique ici pour débloquer cette section',
        cta_url: 'https://calendly.com/romain-visibility/callmemaybe',
        code: code,
        objective: data.objective,
        current_situation: data.currentSituation,
        how_to_advance: data.howToAdvance,
        blocking_point: data.blockingPoint || null,
        timestamp: new Date().toISOString()
      }
      
      console.log('📤 Envoi du questionnaire au webhook click-cta...', webhookData)
      
      const response = await fetch('https://n8n.hadrien-grosbois.ovh/webhook/click-cta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
        keepalive: true
      })
      
      console.log('📥 Réponse webhook click-cta:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (response.ok) {
        console.log('✅ Questionnaire envoyé avec succès')
        
        // Débloquer le contenu
        setIsContentUnlocked(true)
        setIsModalOpen(false)
        
        // Track dans PostHog
        captureEvent('questionnaire_submitted', {
          code: code,
          email: userEmail
        })
      } else {
        const errorText = await response.text()
        console.error('❌ Erreur webhook click-cta:', response.status, errorText)
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('❌ Erreur complète lors de la soumission du questionnaire:', error)
      alert(`Erreur lors de l'envoi: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Réessaie.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Faire apparaître la section bleue immédiatement après le début des section scores
  useEffect(() => {
    if (animationPhase >= 1) {
      setAnimationPhase(2)
    }
  }, [animationPhase])

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background avec carreaux gris clairs dessinés à la main */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="handDrawnGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* Carreaux avec des lignes légèrement irrégulières */}
                <path d="M 0 0 L 60 0" stroke="#f3f4f6" strokeWidth="1" fill="none" opacity="0.6"/>
                <path d="M 0 0 L 0 60" stroke="#f3f4f6" strokeWidth="1" fill="none" opacity="0.6"/>
                
                {/* Lignes horizontales avec légères variations */}
                <path d="M 0 20 L 60 20" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M 0 40 L 60 40" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
                
                {/* Lignes verticales avec légères variations */}
                <path d="M 20 0 L 20 60" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M 40 0 L 40 60" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#handDrawnGrid)"/>
          </svg>
        </div>
        
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de votre analyse LinkedIn...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !linkedinData) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background avec carreaux gris clairs dessinés à la main */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="handDrawnGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* Carreaux avec des lignes légèrement irrégulières */}
                <path d="M 0 0 L 60 0" stroke="#f3f4f6" strokeWidth="1" fill="none" opacity="0.6"/>
                <path d="M 0 0 L 0 60" stroke="#f3f4f6" strokeWidth="1" fill="none" opacity="0.6"/>
                
                {/* Lignes horizontales avec légères variations */}
                <path d="M 0 20 L 60 20" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M 0 40 L 60 40" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
                
                {/* Lignes verticales avec légères variations */}
                <path d="M 20 0 L 20 60" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
                <path d="M 40 0 L 40 60" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#handDrawnGrid)"/>
          </svg>
        </div>
        
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Analyse non trouvée</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/" 
              className="bg-[#2C2C2C] text-white px-6 py-3 rounded-lg hover:bg-[#3C3C3C] transition-colors text-sm border border-[#555555] shadow-sm"
              style={{ 
                boxShadow: 'inset 0 2px 0 0 #666666, inset 0 -2px 0 0 #666666, inset 2px 0 0 0 #666666, inset -2px 0 0 0 #666666, 0 1px 3px rgba(0, 0, 0, 0.1)' 
              }}
              onClick={() => {
                captureEvent('cta_clicked', {
                  cta_name: 'Retour à l\'accueil',
                  cta_url: '/',
                  code: code
                })
              }}
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculer le score de la sélection avant les sections
  const selectionTotalScore = linkedinData.selection_critere_1_points_obtenus + 1 + 1
  const selectionTotalMax = 15
  
  // Calculer le score de crédibilité (Services forcé à 1)
  const credTotalScore = linkedinData.cred_critere_1_points_obtenus + (linkedinData.cred_critere_3_points_obtenus || 0) + 1
  
  // Préparer les données pour les sections LinkedIn
  const sections = [
    {
      name: 'Photo de profil',
      score: linkedinData.photo_total_points,
      maxScore: linkedinData.photo_total_maximum
    },
    {
      name: 'Bannière',
      score: linkedinData.banner_total_points,
      maxScore: linkedinData.banner_total_maximum
    },
    {
      name: 'Titre du profil',
      score: linkedinData.headline_total_points,
      maxScore: linkedinData.headline_total_maximum
    },
    {
      name: 'Section À propos',
      score: linkedinData.about_total_points,
      maxScore: linkedinData.about_total_maximum
    },
    {
      name: 'Espace Sélection',
      score: selectionTotalScore,
      maxScore: selectionTotalMax
    },
    {
      name: 'Contenu',
      score: linkedinData.contenu_total_points,
      maxScore: linkedinData.contenu_total_maximum
    },
    {
      name: 'Expériences professionnelles',
      score: linkedinData.experiences_total_points,
      maxScore: linkedinData.experiences_total_maximum
    },
    {
      name: 'Crédibilité et preuves sociales',
      score: credTotalScore,
      maxScore: linkedinData.cred_total_maximum
    }
  ]

  // Fonction pour créer les critères d'une catégorie avec les nouveaux critères
  const createCriteria = (category: string, count: number) => {
    const criteria = []
    const mappedSection = SECTION_MAPPING[category as keyof typeof SECTION_MAPPING] || category
    const sectionCriteria = LINKEDIN_CRITERIA[mappedSection as keyof typeof LINKEDIN_CRITERIA] || []
    
    for (let i = 1; i <= count; i++) {
      const criteriaTitle = sectionCriteria[i - 1] || linkedinData[`${category}_critere_${i}_titre` as keyof LinkedInData] as string
      const score = linkedinData[`${category}_critere_${i}_points_obtenus` as keyof LinkedInData] as number
      const maxScore = linkedinData[`${category}_critere_${i}_points_maximum` as keyof LinkedInData] as number
      const feedback = linkedinData[`${category}_critere_${i}_explication` as keyof LinkedInData] as string
      
      criteria.push({
        name: getCriteriaTitle(criteriaTitle),
        description: criteriaTitle,
        score: score,
        maxScore: maxScore,
        feedback: feedback,
        expectation: getCriteriaExpectation(category, criteriaTitle),
        isMaxScore: score === maxScore
      })
    }
    return criteria
  }

  // Préparer les critères détaillés pour chaque catégorie
  const bannerCriteria = createCriteria('banner', linkedinData.banner_total_categories)
  const photoCriteria = createCriteria('photo', linkedinData.photo_total_categories)
  const headlineCriteria = createCriteria('headline', linkedinData.headline_total_categories)
  const aboutCriteria = createCriteria('about', linkedinData.about_total_categories)
  
  // Créer les critères pour Espace Sélection (1 réel + 2 factices)
  // Total : 15 points (5+5+5)
  // IMPORTANT : Critères 2 et 3 sont TOUJOURS floutés (indépendamment du score)
  const selectionCriteria = [
    // Critère 1 : vient de la database - TOUJOURS VISIBLE
    {
      name: 'CTA sur le premier élément de sélection',
      description: linkedinData.selection_critere_1_titre,
      score: linkedinData.selection_critere_1_points_obtenus,
      maxScore: 5,
      feedback: linkedinData.selection_critere_1_explication || undefined,
      expectation: getCriteriaExpectation('selection', linkedinData.selection_critere_1_titre),
      isMaxScore: linkedinData.selection_critere_1_points_obtenus === 5,
      shouldBlur: false
    },
    // Critère 2 : factice - TOUJOURS FLOUTÉ
    {
      name: 'Diversité et pertinence des ressources',
      description: 'Diversité et pertinence des ressources',
      score: 1,
      maxScore: 5,
      feedback: 'Les ressources sélectionnées montrent une certaine diversité, mais pourraient être plus variées et actualisées régulièrement pour maximiser l\'impact et la pertinence auprès de votre audience cible.',
      expectation: getCriteriaExpectation('selection', 'Diversité et pertinence des ressources'),
      isMaxScore: false,
      shouldBlur: true
    },
    // Critère 3 : factice - TOUJOURS FLOUTÉ
    {
      name: 'Structuration et mise en avant',
      description: 'Structuration et mise en avant',
      score: 1,
      maxScore: 5,
      feedback: 'La structuration de votre sélection est présente mais pourrait être améliorée avec des titres plus engageants et une hiérarchisation plus claire pour mettre en avant vos meilleurs contenus en priorité.',
      expectation: getCriteriaExpectation('selection', 'Structuration et mise en avant'),
      isMaxScore: false,
      shouldBlur: true
    }
  ]
  
  const contenuCriteria = createCriteria('contenu', linkedinData.contenu_total_categories)
  const experiencesCriteria = createCriteria('experiences', linkedinData.experiences_total_categories)
  
  // Créer les critères de crédibilité dans le bon ordre : Compétences → Recommandations → Services
  // IMPORTANT : Services est TOUJOURS flouté (indépendamment du score)
  const credCriteria = [
    // Critère 1 : Compétences (de la DB) - VISIBLE
    {
      name: getCriteriaTitle(linkedinData.cred_critere_1_titre),
      description: linkedinData.cred_critere_1_titre,
      score: linkedinData.cred_critere_1_points_obtenus,
      maxScore: linkedinData.cred_critere_1_points_maximum,
      feedback: linkedinData.cred_critere_1_explication || undefined,
      expectation: getCriteriaExpectation('cred', linkedinData.cred_critere_1_titre),
      isMaxScore: linkedinData.cred_critere_1_points_obtenus === linkedinData.cred_critere_1_points_maximum,
      shouldBlur: false
    },
    // Critère 2 : Recommandations (de la DB - anciennement critère 3) - VISIBLE
    {
      name: getCriteriaTitle(linkedinData.cred_critere_3_titre),
      description: linkedinData.cred_critere_3_titre,
      score: linkedinData.cred_critere_3_points_obtenus,
      maxScore: linkedinData.cred_critere_3_points_maximum,
      feedback: linkedinData.cred_critere_3_explication || undefined,
      expectation: getCriteriaExpectation('cred', linkedinData.cred_critere_3_titre),
      isMaxScore: linkedinData.cred_critere_3_points_obtenus === linkedinData.cred_critere_3_points_maximum,
      shouldBlur: false
    },
    // Critère 3 : Services (de la DB - anciennement critère 2, forcé à 1) - TOUJOURS FLOUTÉ
    {
      name: getCriteriaTitle(linkedinData.cred_critere_2_titre),
      description: linkedinData.cred_critere_2_titre,
      score: 1,
      maxScore: linkedinData.cred_critere_2_points_maximum,
      feedback: linkedinData.cred_critere_2_explication || undefined,
      expectation: getCriteriaExpectation('cred', linkedinData.cred_critere_2_titre),
      isMaxScore: false,
      shouldBlur: true
    }
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background avec carreaux gris clairs dessinés à la main */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="handDrawnGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              {/* Carreaux avec des lignes légèrement irrégulières */}
              <path d="M 0 0 L 60 0" stroke="#f3f4f6" strokeWidth="1" fill="none" opacity="0.6"/>
              <path d="M 0 0 L 0 60" stroke="#f3f4f6" strokeWidth="1" fill="none" opacity="0.6"/>
              
              {/* Lignes horizontales avec légères variations */}
              <path d="M 0 20 L 60 20" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
              <path d="M 0 40 L 60 40" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
              
              {/* Lignes verticales avec légères variations */}
              <path d="M 20 0 L 20 60" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
              <path d="M 40 0 L 40 60" stroke="#e5e7eb" strokeWidth="0.8" fill="none" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#handDrawnGrid)"/>
        </svg>
      </div>

      {/* Header avec texte Romain Bour */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white shadow-sm py-4 relative z-10"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative overflow-visible">
          <div className="text-center">
            <h1 style={{
              fontFamily: 'var(--font-poppins)',
              fontSize: '2rem',
              fontWeight: 600,
              color: '#191919',
              letterSpacing: '-0.02em'
            }}>
              Romain Bour
            </h1>
            <p style={{
              fontFamily: 'var(--font-poppins)',
              fontSize: '1rem',
              fontWeight: 400,
              color: '#191919',
              marginTop: '0.5rem'
            }}>
              J&apos;aide les indépendants à transformer leurs 3 likes en 10 clients
            </p>
          </div>
          {/* Image retirée sur demande */}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Espaceur invisible pour centrer la barre de chargement */}
        {showSpacer && (
          <motion.div
            initial={{ height: '15vh' }}
            animate={{ height: showSpacer ? '15vh' : 0 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full"
          />
        )}

        {/* Global Score */}
        <GlobalScore
          score={linkedinData.global_total_points - linkedinData.selection_critere_1_points_obtenus + selectionTotalScore - linkedinData.cred_critere_2_points_obtenus + 1}
          maxScore={linkedinData.global_total_maximum - linkedinData.selection_total_maximum + selectionTotalMax}
          onComplete={handleGlobalScoreComplete}
        />

        {/* Section Scores */}
        {animationPhase >= 1 && (
          <SectionScores
            sections={sections}
            onComplete={handleSectionScoresComplete}
          />
        )}

        {/* Detail Sections */}
        {animationPhase >= 2 && (
          <div>
            <DetailSection
              title="Photo de profil"
              criteria={photoCriteria}
              totalScore={linkedinData.photo_total_points}
              maxScore={linkedinData.photo_total_maximum}
              delay={0.6}
              image={linkedinData.photo_url}
              imageAspectRatio="1 / 1"
              onCTAClick={handleCTAClick}
              unlockContent={isContentUnlocked}
            />

            <DetailSection
              title="Bannière"
              criteria={bannerCriteria}
              totalScore={linkedinData.banner_total_points}
              maxScore={linkedinData.banner_total_maximum}
              delay={0.75}
              blurLastN={2}
              image={linkedinData.cover_url}
              imageAspectRatio="1584 / 396"
              onCTAClick={handleCTAClick}
              unlockContent={isContentUnlocked}
            />
            
            <DetailSection
              title="Titre du profil"
              criteria={headlineCriteria}
              totalScore={linkedinData.headline_total_points}
              maxScore={linkedinData.headline_total_maximum}
              delay={0.9}
              blurLastN={2}
              onCTAClick={handleCTAClick}
              unlockContent={isContentUnlocked}
            />
            
            <DetailSection
              title="Section À propos"
              criteria={aboutCriteria}
              totalScore={linkedinData.about_total_points}
              maxScore={linkedinData.about_total_maximum}
              delay={1.05}
              blurLastN={2}
              onCTAClick={handleCTAClick}
              unlockContent={isContentUnlocked}
            />
            
            <DetailSection
              title="Espace Sélection"
              criteria={selectionCriteria}
              totalScore={selectionTotalScore}
              maxScore={selectionTotalMax}
              delay={1.2}
              disableSort={true}
              onCTAClick={handleCTAClick}
              unlockContent={isContentUnlocked}
            />
            
            <div className="mt-10">
              <div className="bg-[#074482] text-white border-2 border-[#074482] rounded-3xl shadow-lg px-6 sm:px-10 py-6 sm:py-8 text-center">
                <h3
                  className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4"
                  style={{ fontFamily: 'var(--font-poppins)', letterSpacing: '-0.01em' }}
                >
                  Tu sais maintenant ce qui freine ton profil LinkedIn et comment l&apos;améliorer.
                </h3>
                <p
                  className="text-base sm:text-lg font-semibold mb-4"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  La vraie question, c&apos;est : tu passes à l&apos;action, ou tu restes bloqué au diagnostic ?
                </p>
                <p
                  className="text-base sm:text-lg leading-relaxed mb-4"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Pour aller plus loin et transformer ton profil en vrai levier d&apos;opportunités, booke un appel avec moi.
                </p>
                <div className="mt-5 flex justify-center">
                  <Link
                    href="https://calendly.com/romain-visibility/callmemaybe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-[#074482] font-semibold px-6 sm:px-8 py-3 rounded-2xl border-2 border-white shadow-md transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                    onClick={(e) => handleCTAClick(e, 'Booker un call', 'https://calendly.com/romain-visibility/callmemaybe')}
                  >
                    → Booker un call
                  </Link>
                </div>
              </div>
            </div>
            
            <DetailSection
              title="Contenu"
              criteria={contenuCriteria}
              totalScore={linkedinData.contenu_total_points}
              maxScore={linkedinData.contenu_total_maximum}
              delay={1.35}
              blurLastN={1}
              onCTAClick={handleCTAClick}
              unlockContent={isContentUnlocked}
            />
            
            <DetailSection
              title="Expériences professionnelles"
              criteria={experiencesCriteria}
              totalScore={linkedinData.experiences_total_points}
              maxScore={linkedinData.experiences_total_maximum}
              delay={1.5}
              blurLastN={2}
              onCTAClick={handleCTAClick}
              unlockContent={isContentUnlocked}
            />
            
            <DetailSection
              title="Crédibilité et preuves sociales"
              criteria={credCriteria}
              totalScore={credTotalScore}
              maxScore={linkedinData.cred_total_maximum}
              delay={1.65}
              disableSort={true}
              onCTAClick={handleCTAClick}
              unlockContent={isContentUnlocked}
            />
            
            <div className="mt-10">
              <div className="bg-[#074482] text-white border-2 border-[#074482] rounded-3xl shadow-lg px-6 sm:px-10 py-6 sm:py-8 text-center">
                <h3
                  className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4"
                  style={{ fontFamily: 'var(--font-poppins)', letterSpacing: '-0.01em' }}
                >
                  Tu as maintenant une vision claire de ton profil. Prochaine étape : passer à l&apos;action.
                </h3>
                <p
                  className="text-base sm:text-lg leading-relaxed mb-4"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Pour transformer ton profil en vrai levier d&apos;opportunités, booke un appel avec moi.
                </p>
                <div className="mt-5 flex justify-center">
                  <Link
                    href="https://calendly.com/romain-visibility/callmemaybe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-[#074482] font-semibold px-6 sm:px-8 py-3 rounded-2xl border-2 border-white shadow-md transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                    onClick={(e) => handleCTAClick(e, 'Booker un call', 'https://calendly.com/romain-visibility/callmemaybe')}
                  >
                    → Booker un call
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      
      {/* Modal de questionnaire de qualification */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

