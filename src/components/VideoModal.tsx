'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoSrc?: string
  autoPlay?: boolean
}

export default function VideoModal({
  isOpen,
  onClose,
  videoSrc = '/video-confirmation.mp4',
  autoPlay = true
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Gérer la lecture automatique quand la modal s'ouvre
  useEffect(() => {
    if (isOpen && autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay bloqué par le navigateur, l'utilisateur devra cliquer
      })
    }
  }, [isOpen, autoPlay])

  // Mettre en pause quand la modal se ferme
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden relative">
              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              {/* Lecteur vidéo */}
              <div className="relative w-full flex justify-center bg-black">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  controls
                  playsInline
                  className="w-full h-auto max-h-[70vh] object-contain"
                >
                  Ton navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>

              {/* Texte en dessous de la vidéo (optionnel) */}
              <div className="p-6 text-center">
                <p
                  className="text-lg font-semibold text-[#191919]"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Ton analyse est en cours ! 🎉
                </p>
                <p
                  className="text-sm text-gray-600 mt-2"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Tu recevras ton résultat par email dans quelques minutes.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
