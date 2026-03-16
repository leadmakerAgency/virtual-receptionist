'use client'

import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  isActive: boolean
  isListening?: boolean
}

export const AudioVisualizer = ({ isActive, isListening = false }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const barsRef = useRef([0.3, 0.5, 0.7, 0.4])

  useEffect(() => {
    if (!isActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      if (isListening) {
        // Animate bars when listening
        barsRef.current = barsRef.current.map(() => Math.random() * 0.8 + 0.2)
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw ripple effect
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(canvas.width, canvas.height) / 2

      for (let i = 0; i < 3; i++) {
        const radius = maxRadius - 20 - i * 15
        const alpha = 0.1 - i * 0.03
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw audio bars
      const barWidth = 8
      const barSpacing = 12
      const totalWidth = barsRef.current.length * barWidth + (barsRef.current.length - 1) * barSpacing
      const startX = centerX - totalWidth / 2
      const barHeight = 60

      barsRef.current.forEach((height, index) => {
        const x = startX + index * (barWidth + barSpacing)
        const y = centerY - (barHeight * height) / 2
        const h = barHeight * height

        ctx.fillStyle = 'white'
        ctx.fillRect(x, y, barWidth, h)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, isListening])

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="rounded-full"
      />
    </div>
  )
}
