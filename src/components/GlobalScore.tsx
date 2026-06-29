'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import AnimatedCounter from './AnimatedCounter'

interface GlobalScoreProps {
  score: number
  maxScore: number
  onComplete?: () => void
}

export default function GlobalScore({ score, maxScore, onComplete }: GlobalScoreProps) {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [shouldStartCounter, setShouldStartCounter] = useState(false)
  const [shouldMoveScore, setShouldMoveScore] = useState(false)

  // Assurer que les valeurs sont bien numériques
  const safeScore = score || 0
  const safeMaxScore = maxScore || 0

  // Animation de la barre avec vitesse constante
  const progress = safeMaxScore > 0 ? (safeScore / safeMaxScore) * 100 : 0
  
  // Déterminer le texte selon le score
  const getStandardText = () => {
    if (progress < 75) {
      return 'très en dessous du standard'
    } else if (progress < 81) {
      return 'en dessous du standard'
    } else {
      return 'au standard'
    }
  }
  const motionValue = useMotionValue(0)
  
  const width = useTransform(motionValue, (latest) => `${latest}%`)
  
  // Interpolation des couleurs selon le pourcentage
  const backgroundColor = useTransform(motionValue, (latest) => {
    const percentage = latest
    if (percentage <= 30) {
      return '#F04438' // Rouge
    } else if (percentage <= 75) {
      // Interpolation entre rouge et jaune
      const ratio = (percentage - 30) / 45
      return `hsl(${60 * ratio}, 91%, 50%)` // Transition rouge -> jaune
    } else {
      // Interpolation entre jaune et vert
      const ratio = (percentage - 75) / 25
      return `hsl(${60 + 60 * ratio}, 91%, 50%)` // Transition jaune -> vert
    }
  })

  const handleCounterComplete = () => {
    // Counter completed
  }

  // Démarrer l'animation de la barre immédiatement
  useEffect(() => {
    // Démarrer le compteur en même temps que la barre
    setShouldStartCounter(true)
    
    // Animation progressive de 0 à la valeur finale sur 6 secondes
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progressRatio = Math.min(elapsed / 6000, 1) // 6 secondes
      const currentWidth = progress * progressRatio
      
      motionValue.set(currentWidth)
      
      if (progressRatio < 1) {
        requestAnimationFrame(animate)
      } else {
        handleComplete()
      }
    }
    
    requestAnimationFrame(animate)
  }, [motionValue, progress]) // Déclencher seulement une fois au montage

  const handleComplete = () => {
    setAnimationComplete(true)
    // Démarrer l'animation de déplacement du score après un court délai
    setTimeout(() => {
      setShouldMoveScore(true)
    }, 200)
  }

  useEffect(() => {
    if (animationComplete && onComplete) {
      onComplete()
    }
  }, [animationComplete, onComplete])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full mb-6"
      >
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 relative inline-block"
              style={{
                fontFamily: 'var(--font-poppins)',
                fontWeight: 600
              }}>
            Score Global du profil
            <motion.div
              className="absolute bottom-0 left-0 h-1.5 bg-blue-500 rounded-full"
              style={{ bottom: '-6px' }}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 2, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.3
              }}
            />
          </h2>
        </div>
        
        {/* Container avec marge et ombres */}
        <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-lg border-2 border-[#074482]/30 mx-2 sm:mx-0">
          {/* Barre de progression */}
          <div className="relative w-full h-16 sm:h-20 bg-gray-200 rounded-2xl overflow-hidden mb-4">
            {/* Barre de progression - prend toute la largeur */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                width,
                backgroundColor
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.15, delay: 0.2 }}
            />
          </div>
          
          {/* Case isolée pour le score */}
          <div className="relative w-full" style={{ minHeight: '80px' }}>
            {/* Desktop: texte à gauche */}
            {shouldMoveScore && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1,
                  x: 0
                }}
                transition={{ 
                  opacity: { duration: 0.4, delay: 0.4 },
                  x: { duration: 0.4, delay: 0.4 }
                }}
                className="hidden sm:block absolute left-0 top-0 pr-4"
                style={{
                  fontFamily: 'var(--font-poppins)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#191919',
                  maxWidth: 'calc(100% - 200px)'
                }}
              >
                <p>
                  Ton profil est <span style={{ color: '#F04438', fontWeight: 700 }}>{getStandardText()}</span>. La majorité des professionnels que j&apos;accompagne dépassent <span style={{ color: '#10B981', fontWeight: 700 }}>81/100</span>.
                </p>
                <p className="mt-1">
                  👉 Tu perds aujourd&apos;hui en <span style={{ textDecoration: 'underline' }}>visibilité</span>, en <span style={{ textDecoration: 'underline' }}>crédibilité</span> et en <span style={{ textDecoration: 'underline' }}>opportunités</span>.
                </p>
                <p className="mt-1">
                  Il est <span style={{ color: '#F04438', fontWeight: 700 }}>urgent</span> de corriger ton profil pour débloquer davantage de leads et renforcer ton réseau.
                </p>
              </motion.div>
            )}
            
            {/* Mobile: score centré + texte en dessous */}
            <div className="flex flex-col items-center">
              {/* Bloc de score - toujours centré sur mobile, se déplace à droite sur desktop */}
              <motion.div
                className={`bg-[#074482] text-white border-2 border-[#074482] rounded-2xl px-6 sm:px-8 py-3 sm:py-4 shadow-lg relative ${
                  shouldMoveScore ? 'sm:absolute sm:right-0' : ''
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1
                }}
                transition={{ 
                  opacity: { duration: 0.3, delay: 0.2 },
                  scale: { duration: 0.3, delay: 0.2 }
                }}
                style={{
                  fontFamily: 'var(--font-poppins)',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  // Transition seulement sur desktop
                  transition: shouldMoveScore ? 'right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), margin-right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                  transitionDelay: shouldMoveScore ? '0.2s' : '0s'
                }}
              >
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white">
                    <AnimatedCounter 
                      value={safeScore} 
                      duration={6000}
                      shouldStart={shouldStartCounter}
                      onComplete={handleCounterComplete}
                    />
                    <span className="text-xl sm:text-2xl text-white/70">/{safeMaxScore}</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Mobile: texte en dessous du score */}
              {shouldMoveScore && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1,
                    y: 0
                  }}
                  transition={{ 
                    opacity: { duration: 0.4, delay: 0.4 },
                    y: { duration: 0.4, delay: 0.4 }
                  }}
                  className="block sm:hidden mt-4 text-center w-full px-4"
                  style={{
                    fontFamily: 'var(--font-poppins)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#191919'
                  }}
                >
                  <p>
                    Ton profil est <span style={{ color: '#F04438', fontWeight: 700 }}>{getStandardText()}</span>. La majorité des professionnels que j&apos;accompagne dépassent <span style={{ color: '#10B981', fontWeight: 700 }}>81/100</span>.
                  </p>
                  <p className="mt-1">
                    👉 Tu perds aujourd&apos;hui en <span style={{ textDecoration: 'underline' }}>visibilité</span>, en <span style={{ textDecoration: 'underline' }}>crédibilité</span> et en <span style={{ textDecoration: 'underline' }}>opportunités</span>.
                  </p>
                  <p className="mt-1">
                    Il est <span style={{ color: '#F04438', fontWeight: 700 }}>urgent</span> de corriger ton profil pour débloquer davantage de leads et renforcer ton réseau.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
