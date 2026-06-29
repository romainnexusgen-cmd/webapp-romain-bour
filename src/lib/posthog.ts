'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

/**
 * Utilitaire pour utiliser PostHog dans les composants React
 * PostHog est automatiquement initialisé via instrumentation-client.ts
 */

export const usePostHog = () => {
  useEffect(() => {
    // PostHog est automatiquement initialisé côté client
  }, [])

  return posthog
}

/**
 * Capture un événement PostHog
 * @param eventName - Nom de l'événement
 * @param properties - Propriétés optionnelles de l'événement
 */
export const captureEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    try {
      posthog.capture(eventName, properties)
    } catch (error) {
      console.error('Erreur lors de la capture PostHog:', error)
    }
  }
}

/**
 * Identifie un utilisateur dans PostHog
 * @param userId - Identifiant unique de l'utilisateur
 * @param properties - Propriétés optionnelles de l'utilisateur
 */
export const identifyUser = (userId: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    try {
      posthog.identify(userId, properties)
    } catch (error) {
      console.error('Erreur lors de l\'identification PostHog:', error)
    }
  }
}

/**
 * Définit des propriétés utilisateur dans PostHog
 * @param properties - Propriétés à définir
 */
export const setUserProperties = (properties: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    try {
      posthog.setPersonProperties(properties)
    } catch (error) {
      console.error('Erreur lors de la définition des propriétés PostHog:', error)
    }
  }
}

export default posthog

