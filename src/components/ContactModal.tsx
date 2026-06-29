'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    objective: string
    currentSituation: string
    howToAdvance: string
    blockingPoint?: string
  }) => void
  isSubmitting?: boolean
}

// Composant Dropdown réutilisable
function Dropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder 
}: { 
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block mb-2 font-semibold text-[#191919]" style={{
        fontFamily: 'var(--font-poppins)',
        fontSize: '15px'
      }}>
        {label}
      </label>
      {/* Champ de sélection */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-left hover:border-blue-300 transition-colors"
        style={{ fontFamily: 'var(--font-poppins)' }}
      >
        <span className={`text-sm ${value ? 'text-gray-700' : 'text-gray-400'}`}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-blue-200 rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors cursor-pointer"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ContactModal({ isOpen, onClose, onSubmit, isSubmitting = false }: ContactModalProps) {
  const [objective, setObjective] = useState('')
  const [currentSituation, setCurrentSituation] = useState('')
  const [howToAdvance, setHowToAdvance] = useState('')
  const [blockingPoint, setBlockingPoint] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (objective && currentSituation && howToAdvance) {
      onSubmit({
        objective,
        currentSituation,
        howToAdvance,
        blockingPoint: blockingPoint || undefined
      })
    }
  }

  const handleClose = () => {
    setObjective('')
    setCurrentSituation('')
    setHowToAdvance('')
    setBlockingPoint('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative my-8">
              {/* Bouton fermer */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Titre */}
              <h2
                className="text-2xl font-semibold text-[#191919] mb-2"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Pour personnaliser la suite de ton analyse
              </h2>

              {/* Sous-texte */}
              <p
                className="text-sm text-[#374151] mb-6"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Réponds en 20 secondes.<br />
                Ça me permet d&apos;adapter les conseils à ta situation.
              </p>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question 1 - Menu déroulant */}
                <Dropdown
                  label="Quel est ton objectif principal sur LinkedIn en ce moment ?"
                  options={[
                    'Trouver plus de clients',
                    'Clarifier mon message et mon positionnement',
                    'Gagner en visibilité',
                    'Optimiser mon profil',
                    'Je ne sais pas encore'
                  ]}
                  value={objective}
                  onChange={setObjective}
                  placeholder="Sélectionner une option"
                />

                {/* Question 2 - Menu déroulant */}
                <Dropdown
                  label="Où est-ce que tu en es aujourd'hui ?"
                  options={[
                    'Je débute',
                    'Je poste parfois, sans vrais résultats',
                    'Je suis régulier, mais ça ne convertit pas',
                    'Je génère déjà des clients, mais je veux passer un cap'
                  ]}
                  value={currentSituation}
                  onChange={setCurrentSituation}
                  placeholder="Sélectionner une option"
                />

                {/* Question 3 - Menu déroulant */}
                <Dropdown
                  label="Comment tu veux progresser après ton analyse ?"
                  options={[
                    'Je veux avancer seul avec les ressources',
                    'Je veux un plan clair pour appliquer ce qui bloque',
                    'Je veux être guidé pour corriger rapidement ce qui ne va pas'
                  ]}
                  value={howToAdvance}
                  onChange={setHowToAdvance}
                  placeholder="Sélectionner une option"
                />

                {/* Question 4 - Facultative */}
                <div>
                  <label className="block mb-2 font-semibold text-[#191919]" style={{
                    fontFamily: 'var(--font-poppins)',
                    fontSize: '15px'
                  }}>
                    Qu&apos;est-ce qui bloque le plus pour toi aujourd&apos;hui ?
                    <span className="text-xs font-normal text-gray-500 ml-1">(facultatif)</span>
                  </label>
                  <input
                    type="text"
                    value={blockingPoint}
                    onChange={(e) => setBlockingPoint(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#074482]/30 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-[#074482] text-sm"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                    placeholder="Réponse courte..."
                  />
                </div>

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={!objective || !currentSituation || !howToAdvance || isSubmitting}
                  className="w-full bg-[#074482] text-white px-6 py-3.5 rounded-full font-semibold hover:bg-[#053a6b] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  style={{
                    fontFamily: 'var(--font-poppins)',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: 600
                  }}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Accéder à l\'analyse complète'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
