'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { LINKEDIN_CRITERIA, CRITERIA_EXPECTATIONS } from '@/lib/linkedin-criteria'

interface FileUploadProps {
  onProfileLinkSubmit: (profileLink: string) => void
  onEmailSubmit: (email: string) => void
  isUploading?: boolean
  onClose?: () => void
}

export default function FileUpload({ onProfileLinkSubmit, onEmailSubmit, isUploading = false, onClose }: FileUploadProps) {
  const [profileLink, setProfileLink] = useState('')
  const [email, setEmail] = useState('')
  const [origin, setOrigin] = useState<string>('direct')
  const [acceptInfo, setAcceptInfo] = useState<boolean>(false)

  // Récupérer le paramètre 'origin' depuis l'URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const originParam = urlParams.get('origin')
      if (originParam) {
        setOrigin(originParam)
      }
    }
  }, [])

  const validateLinkedInUrl = (url: string): string | null => {
    if (!url.trim()) {
      return 'Entre un lien LinkedIn'
    }
    
    // Vérifier que c'est un lien LinkedIn valide
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/
    if (!linkedinPattern.test(url)) {
      return 'Entre un lien LinkedIn valide (ex: https://linkedin.com/in/votre-nom)'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Valider le lien LinkedIn
    const linkError = validateLinkedInUrl(profileLink)
    if (linkError) {
      alert(linkError)
      return
    }
    
    if (email && profileLink && acceptInfo) {
      try {
        // Créer FormData pour l'envoi
        const formData = new FormData()
        formData.append('Email', email)
        formData.append('LinkedInProfile', profileLink)
        formData.append('submittedAt', new Date().toISOString())
        formData.append('formMode', 'test')
        formData.append('origin', origin)
        formData.append('accept_info', acceptInfo.toString())
        
        // Ajouter les critères LinkedIn en dur
        formData.append('linkedin_criteria', JSON.stringify(LINKEDIN_CRITERIA))
        formData.append('criteria_expectations', JSON.stringify(CRITERIA_EXPECTATIONS))

        // Envoyer au webhook n8n
        const response = await fetch('https://n8n.hadrien-grosbois.ovh/webhook/ad7525b9-8a18-47ea-8e89-74a26b00add9', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          onProfileLinkSubmit(profileLink)
          onEmailSubmit(email)
        } else {
          throw new Error('Failed to submit profile')
        }
      } catch (error) {
        console.error('Submit error:', error)
        alert('Erreur lors de l&apos;envoi. Réessaie.')
      }
    }
  }


  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-2xl shadow-lg p-6 relative border-2 border-[#074482]/30"
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
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="profileLink" className="block mb-2" style={{
                  fontFamily: 'var(--font-poppins)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151'
                }}>
                  Lien de ton profil LinkedIn :
                </label>
                <input
                  type="url"
                  id="profileLink"
                  value={profileLink}
                  onChange={(e) => setProfileLink(e.target.value)}
                  required
                  className="w-full px-3 py-2 border-2 border-[#074482]/30 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-[#074482] text-sm"
                  style={{
                    fontFamily: 'var(--font-poppins)',
                    fontSize: '14px'
                  }}
                  placeholder="https://linkedin.com/in/votre-nom"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2" style={{
                  fontFamily: 'var(--font-poppins)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151'
                }}>
                  Adresse email :
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border-2 border-[#074482]/30 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-[#074482] text-sm"
                  style={{
                    fontFamily: 'var(--font-poppins)',
                    fontSize: '14px'
                  }}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="acceptInfo"
                  checked={acceptInfo}
                  onChange={(e) => setAcceptInfo(e.target.checked)}
                  required
                  className="rounded border-gray-300 text-[#074482] focus:ring-[#074482]"
                />
                <label htmlFor="acceptInfo" style={{
                  fontFamily: 'var(--font-poppins)',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  J&apos;accepte de recevoir mon résultat par mail, ainsi que d&apos;autres informations pour m&apos;aider sur LinkedIn.
                </label>
              </div>

              <button
                type="submit"
                disabled={!email || !profileLink || !acceptInfo || isUploading}
                className="w-full bg-[#1378d1] text-white py-3 px-6 rounded-full font-semibold hover:bg-[#0f6bb8] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{
                  fontFamily: 'var(--font-poppins)',
                  fontSize: '16px',
                  lineHeight: '24px',
                  fontWeight: 600
                }}
              >
                {isUploading ? 'Analyse en cours...' : 'Découvrir comment améliorer mon profil'}
              </button>
            </form>
      </motion.div>
    </div>
  )
}
