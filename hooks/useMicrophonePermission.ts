'use client'

import { useState, useCallback } from 'react'

export const useMicrophonePermission = () => {
  const [permission, setPermission] = useState<PermissionState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const requestPermission = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if permissions API is available
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setPermission(result.state)

        if (result.state === 'granted') {
          setLoading(false)
          return true
        }
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach((track) => track.stop())

      setPermission('granted')
      setLoading(false)
      return true
    } catch (err: any) {
      setError(err)
      setPermission('denied')
      setLoading(false)
      return false
    }
  }, [])

  return {
    permission,
    loading,
    error,
    requestPermission,
  }
}
