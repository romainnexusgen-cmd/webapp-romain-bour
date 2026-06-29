'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, User } from 'lucide-react'

interface LinkedInProfile {
  id: string
  name: string
  position?: string
  photo?: string
  location?: {
    linkedinText?: string
  }
  linkedinUrl: string
  publicIdentifier: string
}

interface LinkedInSearchProps {
  onProfileSelect: (profileUrl: string) => void
  value: string
}

type SearchMode = 'link' | 'name'

export default function LinkedInSearch({ onProfileSelect, value }: LinkedInSearchProps) {
  const [mode, setMode] = useState<SearchMode>('link')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<LinkedInProfile[]>([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkValue, setLinkValue] = useState(value)

  const handleSearch = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Entre ton prénom et ton nom')
      return
    }

    setIsSearching(true)
    setError(null)
    setSearchResults([])
    setShowResults(false)

    try {
      // Appeler notre route API qui gère la recherche côté serveur
      const response = await fetch('/api/linkedin-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche')
      }

      const data = await response.json()
      const results: LinkedInProfile[] = data.profiles

      if (results.length === 0) {
        setError('Aucun profil trouvé. Essaie avec un lien direct.')
      } else {
        setSearchResults(results)
        setShowResults(true)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Erreur lors de la recherche. Réessaie ou utilise un lien direct.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleProfileSelect = (profile: LinkedInProfile) => {
    onProfileSelect(profile.linkedinUrl)
    setShowResults(false)
    setFirstName('')
    setLastName('')
    setSearchResults([])
    // Passer en mode lien pour afficher le lien sélectionné
    setMode('link')
    setLinkValue(profile.linkedinUrl)
  }

  const handleLinkChange = (newValue: string) => {
    setLinkValue(newValue)
    onProfileSelect(newValue)
  }

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block" style={{
        fontFamily: 'var(--font-poppins)',
        fontSize: '14px',
        fontWeight: 500,
        color: '#374151'
      }}>
        Recherche de ton profil LinkedIn
      </label>

      {/* Boutons de sélection du mode */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode('link')
            setShowResults(false)
            setError(null)
          }}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
            mode === 'link'
              ? 'bg-[#074482] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Par lien
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('name')
            setError(null)
          }}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
            mode === 'name'
              ? 'bg-[#074482] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Par nom et prénom
        </button>
      </div>

      {/* Mode lien */}
      <AnimatePresence mode="wait">
        {mode === 'link' && (
          <motion.div
            key="link-mode"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="url"
              value={linkValue}
              onChange={(e) => handleLinkChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#074482]/30 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-[#074482] text-sm"
              style={{ fontFamily: 'var(--font-poppins)' }}
              placeholder="https://linkedin.com/in/ton-profil"
            />
          </motion.div>
        )}

        {/* Mode nom/prénom */}
        {mode === 'name' && (
          <motion.div
            key="name-mode"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-[#074482]/30 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-[#074482] text-sm"
                style={{ fontFamily: 'var(--font-poppins)' }}
                placeholder="Prénom"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-[#074482]/30 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-[#074482] text-sm"
                style={{ fontFamily: 'var(--font-poppins)' }}
                placeholder="Nom"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !firstName.trim() || !lastName.trim()}
              className="w-full py-3 px-4 bg-[#1378d1] text-white rounded-full font-medium hover:bg-[#0f6bb8] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Rechercher mon profil
                </>
              )}
            </button>

            {/* Message d'erreur */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {error}
              </motion.p>
            )}

            {/* Liste déroulante des résultats */}
            <AnimatePresence>
              {showResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border-2 border-[#074482]/30 rounded-2xl overflow-hidden shadow-lg max-h-80 overflow-y-auto"
                >
                  <p className="px-4 py-2 text-xs text-gray-500 border-b bg-gray-50" style={{ fontFamily: 'var(--font-poppins)' }}>
                    Sélectionne ton profil ({searchResults.length} résultat{searchResults.length > 1 ? 's' : ''})
                  </p>
                  {searchResults.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleProfileSelect(profile)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors border-b last:border-b-0 text-left"
                    >
                      {/* Photo */}
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {profile.photo ? (
                          <img
                            src={profile.photo}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <User className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-[#191919] truncate"
                          style={{ fontFamily: 'var(--font-poppins)', fontSize: '14px' }}
                        >
                          {profile.name}
                        </p>
                        {profile.position && (
                          <p
                            className="text-gray-500 italic truncate"
                            style={{ fontFamily: 'var(--font-poppins)', fontSize: '12px' }}
                          >
                            {profile.position}
                          </p>
                        )}
                        {profile.location?.linkedinText && (
                          <p
                            className="text-gray-400 truncate"
                            style={{ fontFamily: 'var(--font-poppins)', fontSize: '11px' }}
                          >
                            {profile.location.linkedinText}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
