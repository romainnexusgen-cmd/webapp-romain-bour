'use client'

import Image from "next/image";
import { useState } from "react";

export default function FloatingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-3/4 max-w-6xl">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        {/* Layout mobile - visible seulement sur mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo LinkedIn Coach */}
            <div className="flex-shrink-0">
              <Image
                src="/linkedin-coach-logo.svg"
                alt="LinkedIn Coach Logo"
                width={180}
                height={54}
                className="h-10 w-auto"
              />
            </div>

            {/* Bouton menu mobile */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className={`w-6 h-6 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Layout desktop - caché sur mobile */}
        <div className="hidden md:block">
          <div className="flex items-center px-8 py-3">
            {/* Logo LinkedIn Coach */}
            <div className="flex-shrink-0">
              <Image
                src="/linkedin-coach-logo.svg"
                alt="LinkedIn Coach Logo"
                width={180}
                height={54}
                className="h-14 w-auto"
              />
            </div>

            {/* Espace restant divisé en 5 parties égales avec liens aux points 1/5, 2/5, 3/5, 4/5 */}
            <div className="flex-1 relative">
              {/* Graduate Program - 1/5 */}
              <a
                href="https://www.mimprep.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-1/5 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black hover:text-gray-700 font-medium text-base transition-colors"
              >
                Graduate Program
              </a>
              
              {/* Masterclass - 2/5 */}
              <a
                href="https://www.mimprep.com/mim-prep-masterclass"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-2/5 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black hover:text-gray-700 font-medium text-base transition-colors"
              >
                Coaching
              </a>
              
              {/* Smart Prep - 3/5 */}
              <a
                href="https://smartprep.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-3/5 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black hover:text-gray-700 font-medium text-base transition-colors"
              >
                Aviclient
              </a>
              
              {/* The Banking Vault - 4/5 */}
              <a
                href="https://thebankingvault.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-4/5 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black hover:text-gray-700 font-medium text-base transition-colors"
              >
                Résultat
              </a>
            </div>
          </div>
        </div>

        {/* Menu mobile accordéon - visible seulement sur mobile */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4 space-y-2 border-t border-gray-200">
            <a
              href="https://www.mimprep.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 px-4 text-black hover:text-gray-700 hover:bg-gray-50 font-medium text-base transition-colors rounded-lg"
            >
              Graduate Program
            </a>
            
            <a
              href="https://www.mimprep.com/mim-prep-masterclass"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 px-4 text-black hover:text-gray-700 hover:bg-gray-50 font-medium text-base transition-colors rounded-lg"
            >
              Masterclass
            </a>
            
            <a
              href="https://smartprep.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 px-4 text-black hover:text-gray-700 hover:bg-gray-50 font-medium text-base transition-colors rounded-lg"
            >
              Smart Prep
            </a>
            
            <a
              href="https://thebankingvault.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 px-4 text-black hover:text-gray-700 hover:bg-gray-50 font-medium text-base transition-colors rounded-lg"
            >
              The Banking Vault
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
