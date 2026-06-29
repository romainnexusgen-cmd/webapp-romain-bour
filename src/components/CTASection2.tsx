'use client'

import { motion } from 'framer-motion'

interface CTASection2Props {
  targetFlag: number
  delay?: number
}

export default function CTASection2({ targetFlag, delay = 0 }: CTASection2Props) {
  const isHighPotential = targetFlag >= 2
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className="w-full mt-8 mb-8 mx-2 sm:mx-0"
    >
      {isHighPotential ? (
        // Version pour profils à haut potentiel (target_flag >= 2)
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-8 text-white text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Again, we don&apos;t offer this to anyone...</h3>
          <p className="text-blue-100 mb-4 sm:mb-6 leading-relaxed text-justify text-sm sm:text-base">
            Your CV isn&apos;t at the level it should be, which means the rest of your application has probably huge room for improvement. Don&apos;t take the risk of ending up at Audencia or Bath. Book a call, and we&apos;ll show you why LBS or ESSEC are within reach and exactly how to get there.
          </p>
          <p className="text-blue-100 mb-4 sm:mb-6 text-justify text-sm sm:text-base">
            Indeed, based on your experiences, our tool has identified that you have the potential, we&apos;ve already helped profiles very similar to yours, and we can do the same for you.
          </p>
          <a 
            href="https://www.mimprep.com/mim-prep-masterclass" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block text-sm sm:text-base"
          >
            Talk with a student advisor
          </a>
        </div>
      ) : (
        // Version pour profils moyens (target_flag < 2) - Masterclass
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-8 text-white text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Ready to level up your application?</h3>
          <p className="text-blue-100 mb-4 sm:mb-6 leading-relaxed text-justify text-sm sm:text-base">
            Your CV shows potential, but there&apos;s significant room for improvement to reach top-tier programs. Don&apos;t let a weak application hold you back from your dream schools.
          </p>
          <p className="text-blue-100 mb-4 sm:mb-6 text-justify text-sm sm:text-base">
            Join our comprehensive masterclass where we&apos;ll teach you everything you need to know about crafting winning applications, from CV optimization to interview preparation.
          </p>
          <a 
            href="https://www.mimprep.com/mim-prep-masterclass" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block text-sm sm:text-base"
          >
            Join the Masterclass
          </a>
        </div>
      )}
    </motion.div>
  )
}
