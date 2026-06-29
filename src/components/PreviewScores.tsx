'use client'

import { motion, useInView } from 'framer-motion'
import { useState, useEffect, useRef, useMemo } from 'react'
import AnimatedCounter from './AnimatedCounter'
import ScoreBar from './ScoreBar'

interface PreviewSection {
  name: string
  score: number
  maxScore: number
}

export default function PreviewScores() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [animationStates, setAnimationStates] = useState<boolean[]>(new Array(3).fill(false))
  
  // Exemples de sections avec scores
  const sections: PreviewSection[] = useMemo(
    () => [
      { name: 'Bannière', score: 11, maxScore: 20 },
      { name: 'Photo de profil', score: 15, maxScore: 20 },
      { name: 'etc', score: 0, maxScore: 20 } // Section avec "etc" pour indiquer qu'il y en a plus
    ],
    []
  )

  // Démarrer les animations pour chaque section avec délai QUAND le tableau est visible
  useEffect(() => {
    if (isInView) {
      const timers: NodeJS.Timeout[] = []
      sections.forEach((_, index) => {
        const delay = index * 0.3
        const timer = setTimeout(() => {
          setAnimationStates(prev => {
            const newStates = [...prev]
            newStates[index] = true
            return newStates
          })
        }, delay * 1000)
        timers.push(timer)
      })
      
      return () => {
        timers.forEach(timer => clearTimeout(timer))
      }
    }
  }, [isInView, sections])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full mx-2 sm:mx-0"
    >
      {/* En-tête du tableau avec style de la page de garde */}
      <div className="grid grid-cols-12 gap-2 sm:gap-4 bg-[#2C2C2C] text-white font-bold py-2 sm:py-3 px-2 sm:px-4 border border-[#555555] text-sm sm:text-base"
           style={{ 
             boxShadow: 'inset 0 2px 0 0 #666666, inset 0 -2px 0 0 #666666, inset 2px 0 0 0 #666666, inset -2px 0 0 0 #666666, 0 1px 3px rgba(0, 0, 0, 0.1)' 
           }}>
        <div className="col-span-4">Section</div>
        <div className="col-span-2 text-center">Score</div>
        <div className="col-span-6">Performance</div>
      </div>
      
      {/* Lignes du tableau */}
      <div className="border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
        {sections.map((section, index) => (
          <motion.div
            key={section.name}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: 'easeOut',
              delay: index * 0.1
            }}
            className={`grid grid-cols-12 gap-2 sm:gap-4 py-2 sm:py-3 px-2 sm:px-4 border-b border-gray-100 last:border-b-0 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            {/* Colonne 1: Section */}
            <div className={`col-span-4 flex items-center ${section.name === 'etc' ? 'justify-center' : ''}`}>
              <span className="font-medium text-gray-800 text-sm sm:text-base">
                {section.name === 'etc' ? (
                  <span className="text-gray-500">etc</span>
                ) : (
                  section.name
                )}
              </span>
            </div>
            
            {/* Colonne 2: Score */}
            <div className="col-span-2 flex items-center justify-center">
              {section.name === 'etc' ? (
                <span className="text-gray-400 text-base sm:text-lg">etc</span>
              ) : (
                <div className="text-base sm:text-lg font-bold text-gray-900">
                  <AnimatedCounter 
                    value={section.score} 
                    duration={2000}
                    shouldStart={animationStates[index]}
                  />
                  <span className="text-gray-500">/{section.maxScore}</span>
                </div>
              )}
            </div>
            
            {/* Colonne 3: Performance */}
            <div className={`col-span-6 flex items-center ${section.name === 'etc' ? 'justify-center' : ''}`}>
              {section.name === 'etc' ? (
                <span className="text-gray-400 text-sm">etc</span>
              ) : (
                <div className="w-full">
                  <ScoreBar 
                    score={section.score} 
                    maxScore={section.maxScore} 
                    duration={2000}
                    shouldStart={animationStates[index]}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

