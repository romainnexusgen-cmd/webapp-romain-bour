'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface LargeLoadingBarProps {
  onComplete?: () => void
  isCompact?: boolean
}

export default function LargeLoadingBar({ onComplete, isCompact = false }: LargeLoadingBarProps) {
  
  // Animation de la barre avec vitesse constante
  const motionValue = useMotionValue(0)

  const width = useTransform(motionValue, (latest) => `${latest * 0.8}%`)

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

  // Démarrer l'animation de la barre immédiatement
  useEffect(() => {
    const timer = setTimeout(() => {
      motionValue.set(100)
    }, 200) // Petit délai pour s'assurer que tout est prêt

    // L'animation se termine exactement après 6 secondes
    const completeTimer = setTimeout(() => {
      // Animation completed
      if (onComplete) {
        onComplete()
      }
    }, 6200) // 6 secondes + 200ms de délai initial

    return () => {
      clearTimeout(timer)
      clearTimeout(completeTimer)
    }
  }, [motionValue, onComplete])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Barre qui prend toute la largeur */}
      <div className={`relative w-full bg-gray-200 rounded-3xl overflow-hidden shadow-inner ${
        isCompact ? 'h-16' : 'h-32'
      }`}>
        {/* Barre de progression - prend 80% de la largeur */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{
            width,
            backgroundColor
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.15, delay: 0.2 }}
        />

        {/* Zone du pourcentage au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className={`font-bold text-gray-800 ${
              isCompact ? 'text-3xl' : 'text-6xl'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 6.0 }}
          >
                                 <motion.span
                       initial={{ scale: 1 }}
                       animate={{ scale: [1, 1.05, 1] }}
                       transition={{ duration: 0.15, delay: 6.0 }}
                     >
                       {motionValue}
                     </motion.span>
            <span className={`text-gray-600 ${
              isCompact ? 'text-2xl' : 'text-4xl'
            }`}>%</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
