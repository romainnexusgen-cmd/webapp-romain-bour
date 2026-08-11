import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Optin.ia — Audit LinkedIn gratuit pour experts B2B',
  description: 'Découvre ton score LinkedIn en 5 minutes. Analyse gratuite sur 8 critères, recommandations concrètes, pour experts et dirigeants B2B.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
