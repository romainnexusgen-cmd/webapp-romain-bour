'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import AnimatedCounter from './AnimatedCounter'
import ScoreBar from './ScoreBar'

interface SectionScore {
  name: string
  score: number
  maxScore: number
  shouldBlur?: boolean
}

interface PreviewScoresSimpleProps {
  sections: SectionScore[]
  onComplete?: () => void
}

export default function PreviewScoresSimple({ sections, onComplete }: PreviewScoresSimpleProps) {
  const [completedSections, setCompletedSections] = useState(0)
  const [animationStates, setAnimationStates] = useState<boolean[]>(new Array(sections.length).fill(false))
  
  const sortedSections = sections

  const handleSectionComplete = () => {
    setCompletedSections(prev => prev + 1)
  }

  useEffect(() => {
    if (completedSections === sortedSections.length && onComplete) {
      onComplete()
    }
  }, [completedSections, sortedSections.length, onComplete])

  useEffect(() => {
    sortedSections.forEach((_, index) => {
      const delay = (index * 0.5) + 0.3
      const timer = setTimeout(() => {
        setAnimationStates(prev => {
          const newStates = [...prev]
          newStates[index] = true
          return newStates
        })
      }, delay * 1000)
      
      return () => clearTimeout(timer)
    })
  }, [sortedSections])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className="w-full bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-[#074482]/30"
    >
      <div className="p-6">
        {/* Titre avec animation de soulignement bleu */}
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 relative inline-block"
              style={{
                fontFamily: 'var(--font-poppins)',
                fontWeight: 600
              }}>
            Détail des scores
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
          </h3>
        </div>

        {/* En-tête du tableau */}
        <div className="grid grid-cols-12 gap-3 bg-[#074482] text-white font-bold py-3 px-4 text-sm"
             style={{ 
               fontFamily: 'var(--font-poppins)',
               borderRadius: '0.875rem 0.875rem 0 0'
             }}>
          <div className="col-span-4">Catégorie</div>
          <div className="col-span-2 text-center">Score</div>
          <div className="col-span-6">Performance</div>
        </div>
        
        {/* Lignes du tableau */}
        <div className="border-2 border-[#074482]/30 border-t-0 rounded-b-lg overflow-hidden">
          {sortedSections.map((section, index) => (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                ease: 'easeOut',
                delay: index * 0.5
              }}
              className={`grid grid-cols-12 gap-3 py-3 px-4 border-b border-gray-100 last:border-b-0 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } ${section.shouldBlur ? 'blur-sm select-none pointer-events-none' : ''}`}
              style={{
                fontFamily: 'var(--font-poppins)',
                fontSize: '14px'
              }}
            >
              {/* Colonne 1: Category */}
              <div className="col-span-4 flex items-center">
                <span className="font-medium text-gray-800 text-sm">{section.name}</span>
              </div>
              
              {/* Colonne 2: Score */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="text-base font-bold text-gray-900">
                  <AnimatedCounter 
                    value={section.score} 
                    duration={2000}
                    shouldStart={animationStates[index]}
                  />
                  <span className="text-gray-500">/{section.maxScore}</span>
                </div>
              </div>
              
              {/* Colonne 3: Performance */}
              <div className="col-span-6 flex items-center">
                <div className="w-full">
                  <ScoreBar 
                    score={section.score} 
                    maxScore={section.maxScore} 
                    duration={2000}
                    shouldStart={animationStates[index]}
                    onComplete={index === sortedSections.length - 1 ? handleSectionComplete : undefined}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

