import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Optimise ton profil LinkedIn | Romain Bour',
  description: 'Le premier outil qui analyse ton profil LinkedIn en 5 minutes et t\'indique ce qu\'il faut améliorer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
