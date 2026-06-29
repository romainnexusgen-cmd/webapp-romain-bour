'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface ScoreBarProps {
  score: number
  maxScore: number
  duration?: number
  className?: string
  onComplete?: () => void
  shouldStart?: boolean
}

export default function ScoreBar({ 
  score, 
  maxScore, 
  duration = 1200, 
  className = '',
  onComplete,
  shouldStart = false
}: ScoreBarProps) {
  const progress = (score / maxScore) * 100
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration / 1000
  })

  const width = useTransform(springValue, (latest) => `${latest}%`)

  // Interpolation des couleurs selon le pourcentage
  const backgroundColor = useTransform(springValue, (latest) => {
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

  useEffect(() => {
    if (shouldStart) {
      motionValue.set(progress)
      
      if (onComplete) {
        const timer = setTimeout(onComplete, duration)
        return () => clearTimeout(timer)
      }
    }
  }, [shouldStart, progress, duration, motionValue, onComplete])

  return (
    <div className={`relative h-4 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full rounded-full transition-all duration-150"
        style={{
          width: shouldStart ? width : '0%',
          backgroundColor: shouldStart ? backgroundColor : '#F04438'
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: shouldStart ? 1 : 0 }}
        transition={{ duration: 0.15, delay: shouldStart ? 0 : 0 }}
      />
    </div>
  )
}
