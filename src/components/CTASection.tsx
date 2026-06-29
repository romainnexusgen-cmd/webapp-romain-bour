'use client'

import { motion } from 'framer-motion'

interface CTASectionProps {
  targetFlag: number
  targetReason?: string
  delay?: number
}

export default function CTASection({ targetFlag, targetReason, delay = 0 }: CTASectionProps) {
  const isTop5Percent = targetFlag >= 2

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className="w-full mb-8 mx-2 sm:mx-0"
    >
      {isTop5Percent ? (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-8 text-white text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">You have the potential to aim very high</h3>
          <p className="text-blue-100 mb-4 sm:mb-6 leading-relaxed text-justify text-sm sm:text-base">
            {targetReason || "Our tool has identified your profile as exceptional - you have the exact combination of experiences, achievements, and potential that top-tier programs are looking for."} We&apos;ve already successfully guided candidates with similar profiles to their dream schools, and we can do the same for you.
          </p>
          <p className="text-blue-100 mb-4 sm:mb-6 text-justify text-sm sm:text-base">
            We don&apos;t offer this to everyone, but we&apos;d love to help you prepare for your entire application 
            package with a free 30-minute consultation call where we&apos;ll provide personalized feedback on 
            your essays, interview preparation, and overall strategy.
          </p>
          <a 
            href="https://www.mimprep.com/mim-prep-masterclass" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block text-sm sm:text-base"
          >
            Get a consultation call
          </a>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-8 text-white text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Want to go further?</h3>
          <p className="text-blue-100 mb-4 sm:mb-6 leading-relaxed text-justify text-sm sm:text-base">
            Your CV is just the first step. To truly stand out in competitive applications, you need to 
            prepare your entire application package with the same level of attention to detail. Our 
            comprehensive masterclass has helped 150+ students secure admits to their dream programs.
          </p>
          <a 
            href="https://www.mimprep.com/mim-prep-masterclass" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white text-blue-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block text-sm sm:text-base"
          >
            Access the Masterclass
          </a>
        </div>
      )}
    </motion.div>
  )
}
