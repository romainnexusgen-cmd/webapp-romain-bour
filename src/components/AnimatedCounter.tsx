'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  onComplete?: () => void
  delay?: number
  shouldStart?: boolean
}

export default function AnimatedCounter({ 
  value, 
  duration = 1200, 
  className = '',
  onComplete,
  delay = 0,
  shouldStart = false
}: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Fonction pour arrêter l'animation en cours
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    startTimeRef.current = null
  }, [])

  // Fonction pour démarrer l'animation
  const startAnimation = useCallback(() => {
    // Si on a déjà animé, ne pas recommencer
    if (hasAnimated) return
    
    // Arrêter toute animation en cours
    stopAnimation()
    
    // Réinitialiser à 0 et marquer qu'on va animer
    setCurrentValue(0)
    setHasAnimated(true)
    startTimeRef.current = Date.now()

    const animate = () => {
      if (!startTimeRef.current) return

      const elapsed = Date.now() - startTimeRef.current
      const progressRatio = Math.min(elapsed / duration, 1)
      const newValue = Math.round(value * progressRatio)
      
      setCurrentValue(newValue)
      
      if (progressRatio < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation terminée - arrêter définitivement
        stopAnimation()
        if (onComplete) onComplete()
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [value, duration, onComplete, stopAnimation, hasAnimated])

  // Gérer le démarrage de l'animation
  useEffect(() => {
    if (shouldStart && !hasAnimated) {
      if (delay > 0) {
        const timer = setTimeout(startAnimation, delay)
        return () => clearTimeout(timer)
      } else {
        startAnimation()
      }
    }
  }, [shouldStart, delay, startAnimation, hasAnimated])

  // Nettoyer l'animation au démontage
  useEffect(() => {
    return () => {
      stopAnimation()
    }
  }, [stopAnimation])

  // Réinitialiser si la valeur change et qu'on n'a pas encore animé
  useEffect(() => {
    if (!hasAnimated) {
      setCurrentValue(0)
    }
  }, [value, hasAnimated])

  return (
    <span className={className}>
      {currentValue}
    </span>
  )
}
