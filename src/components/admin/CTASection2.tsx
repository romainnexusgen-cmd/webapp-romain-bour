'use client'

import { motion } from 'framer-motion'

interface CTASection2Props {
  delay?: number
}

export default function CTASection2({ delay = 0 }: CTASection2Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className="w-full mb-8"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-6">
            <h3 className="text-2xl font-bold mb-4">Again, we don&apos;t offer this to anyone.</h3>
            <p className="text-blue-100 mb-4 leading-relaxed text-justify">
              With a poor CV like that, chances are for the rest of your application file to be really improvable.
            </p>
            <p className="text-blue-100 leading-relaxed text-justify">
              Don&apos;t end up at Bath or Audencia, take a call and we&apos;ll explain why to aim for LSE and how you&apos;re going to get there.
            </p>
            <p className="text-blue-100 leading-relaxed text-justify">
              (and if we say that, it&apos;s because our tool has checked your CV and you have the capabilities, we&apos;ve already done it)
            </p>
          </div>
          <div className="flex-shrink-0">
            <button className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get a consultation call
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
