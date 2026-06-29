'use client'

import { useState, useCallback } from 'react'

interface NotificationState {
  type: 'success' | 'error' | 'info'
  message: string
  id: string
}

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationState[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const addNotification = useCallback((
    type: 'success' | 'error' | 'info',
    message: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: NotificationState = { type, message, id }
    
    setNotifications(prev => [...prev, notification])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }, [removeNotification])

  const success = useCallback((message: string) => {
    addNotification('success', message)
  }, [addNotification])

  const error = useCallback((message: string) => {
    addNotification('error', message)
  }, [addNotification])

  const info = useCallback((message: string) => {
    addNotification('info', message)
  }, [addNotification])

  return {
    notifications,
    success,
    error,
    info,
    removeNotification
  }
}

