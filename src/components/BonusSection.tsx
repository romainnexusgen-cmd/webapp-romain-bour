'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface BonusSectionProps {
  originalBullet: string
  feedback: string
  suggestion: string
  delay?: number
}

export default function BonusSection({ 
  originalBullet, 
  feedback, 
  suggestion,
  delay = 0
}: BonusSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className="w-full mt-16">
      {/* Titre avec animation de soulignement bleu - en dehors du cadre */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center mb-6"
      >
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 relative inline-block">
          🎁 BONUS : How to frame your bullet points 🎁
          <motion.div
            className="absolute bottom-0 left-0 h-1.5 bg-blue-500 rounded-full"
            style={{ bottom: '-6px' }}
            initial={{ width: 0 }}
            animate={isInView ? { width: "100%" } : { width: 0 }}
            transition={{ 
              duration: 2, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.3
            }}
          />
        </h3>
      </motion.div>

      {/* Carte principale avec le contenu */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: delay + 0.1 }}
        className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-8 mx-2 sm:mx-0"
      >
        {/* Texte d'introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: delay + 0.2 }}
          className="mb-4 sm:mb-6"
        >
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            <span className="font-bold">The structure of your bullet points is absolutely crucial:</span> you can have the best experiences in the world, but if you don&apos;t know how to showcase them, they won&apos;t serve any purpose.
          </p>
        </motion.div>

        {/* Encadré gris avec bordure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: delay + 0.3 }}
          className="bg-gray-100 border border-gray-400 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Each bullet point should follow these 4 rules:</h4>
          <ul className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold text-lg">•</span>
              <span>Begin with a clear action verb (e.g., Led, Designed, Implemented) to show initiative</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold text-lg">•</span>
              <span>Show the value or outcome of what you did, not just the responsibility</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold text-lg">•</span>
              <span>Use numbers to clarify scope or impact (%, $, team size, time saved)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold text-lg">•</span>
              <span>Keep it short and punchy, ideally one line, easy to scan</span>
            </li>
          </ul>
        </motion.div>

        {/* Structure idéale en plus gros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: delay + 0.4 }}
          className="text-center mb-6 sm:mb-8"
        >
          <p className="text-base sm:text-lg font-semibold text-gray-800">
            Ideal structure: Action verb + specific task + method/tools + quantified result or impact
          </p>
        </motion.div>

        {/* Section avec bullet point, feedback et proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: delay + 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6"
        >
          <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
            <span className="font-medium text-gray-800">One of your bullet points:</span> &ldquo;{originalBullet}&rdquo;
          </p>
          
          <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
            <span className="font-medium text-gray-800">⚠️ Feedback:</span> {feedback}
          </p>

          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-medium text-gray-800">Reformulation proposal:</span> &ldquo;{suggestion}&rdquo;
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
