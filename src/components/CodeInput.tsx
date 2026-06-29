'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Key, AlertCircle, X } from 'lucide-react'

interface CodeInputProps {
  onCodeSubmit: (code: string) => void
  isLoading?: boolean
  error?: string
  onClose?: () => void
}

export default function CodeInput({ onCodeSubmit, isLoading = false, error, onClose }: CodeInputProps) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      onCodeSubmit(code.trim())
    }
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg shadow-lg p-4 relative"
      >
        {/* Bouton de fermeture */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-800">Enter your code</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your analysis code"
                />
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-2 text-red-600 text-xs"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={!code.trim() || isLoading}
                className="w-full bg-[#2C2C2C] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#3C3C3C] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm border border-[#555555] shadow-sm"
              >
                {isLoading ? 'Checking...' : 'Get my analysis'}
              </button>
            </form>
      </motion.div>
    </div>
  )
}
