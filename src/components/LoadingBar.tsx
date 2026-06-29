'use client'

import { motion } from 'framer-motion'

export default function LoadingBar() {
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
          animate={{
            width: ['30%', '70%', '30%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>
      <p className="text-center text-gray-600 text-sm mt-2">
        Analysis in progress...
      </p>
    </div>
  )
}


