'use client'

import { useState, useEffect } from 'react'

export interface AudioDevice {
  deviceId: string
  label: string
  kind: MediaDeviceKind
}

export const useAudioDevices = () => {
  const [devices, setDevices] = useState<AudioDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Request permission first
        await navigator.mediaDevices.getUserMedia({ audio: true })
        
        // Then enumerate devices
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        
        const audioDevices = deviceList
          .filter((device) => device.kind === 'audioinput' || device.kind === 'audiooutput')
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `${device.kind} ${device.deviceId.slice(0, 5)}`,
            kind: device.kind,
          }))

        setDevices(audioDevices)
        setLoading(false)
      } catch (err) {
        setError(err as Error)
        setLoading(false)
      }
    }

    loadDevices()

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', loadDevices)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices)
    }
  }, [])

  const microphones = devices.filter((d) => d.kind === 'audioinput')
  const speakers = devices.filter((d) => d.kind === 'audiooutput')

  return {
    devices,
    microphones,
    speakers,
    loading,
    error,
  }
}
