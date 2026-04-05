'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, Play, Pause } from 'lucide-react'

interface WaveVisualizerProps {
  title?: string
  showHarmonics?: boolean
  showPhase?: boolean
}

export default function WaveVisualizer({
  title = 'Interactive Sound Wave Properties',
  showHarmonics = true,
  showPhase = true,
}: WaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const [frequency, setFrequency] = useState(440) // A4 note
  const [amplitude, setAmplitude] = useState(0.5)
  const [phase, setPhase] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveType, setWaveType] = useState<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine')

  // Harmonics
  const [harmonic2, setHarmonic2] = useState(0)
  const [harmonic3, setHarmonic3] = useState(0)
  const [harmonic4, setHarmonic4] = useState(0)

  const [showFrequencyInfo, setShowFrequencyInfo] = useState(false)
  const [showAmplitudeInfo, setShowAmplitudeInfo] = useState(false)

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
        oscillatorRef.current.disconnect()
      }
    }
  }, [])

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0

    const draw = () => {
      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 0.5

      // Vertical lines
      for (let x = 0; x <= width; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw center line
      ctx.strokeStyle = '#6b7280'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Draw main wave
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.beginPath()

      for (let x = 0; x < width; x++) {
        const t = (x / width) * 4 * Math.PI // Show 2 complete cycles

        let y = 0

        if (waveType === 'sine') {
          // Calculate y position with harmonics
          y = amplitude * Math.sin((frequency * t) / 100 + phase + time)

          if (showHarmonics) {
            y += harmonic2 * amplitude * Math.sin((2 * frequency * t) / 100 + phase + time)
            y += harmonic3 * amplitude * Math.sin((3 * frequency * t) / 100 + phase + time)
            y += harmonic4 * amplitude * Math.sin((4 * frequency * t) / 100 + phase + time)
          }
        } else if (waveType === 'square') {
          const sineValue = Math.sin((frequency * t) / 100 + phase + time)
          y = amplitude * (sineValue > 0 ? 1 : -1)
        } else if (waveType === 'triangle') {
          const period = (2 * Math.PI * 100) / frequency
          const localTime = (t + phase + time) % period
          const halfPeriod = period / 2
          if (localTime < halfPeriod) {
            y = amplitude * ((2 * localTime) / halfPeriod - 1)
          } else {
            y = amplitude * (3 - (2 * localTime) / halfPeriod)
          }
        } else if (waveType === 'sawtooth') {
          const period = (2 * Math.PI * 100) / frequency
          const localTime = (t + phase + time) % period
          y = amplitude * ((2 * localTime) / period - 1)
        }

        const yPos = height / 2 - (y * height) / 3

        if (x === 0) {
          ctx.moveTo(x, yPos)
        } else {
          ctx.lineTo(x, yPos)
        }
      }

      ctx.stroke()

      // Draw harmonics separately if enabled
      if (showHarmonics && harmonic2 > 0) {
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        for (let x = 0; x < width; x++) {
          const t = (x / width) * 4 * Math.PI
          const y = harmonic2 * amplitude * Math.sin((2 * frequency * t) / 100 + phase + time)
          const yPos = height / 2 - (y * height) / 3
          if (x === 0) ctx.moveTo(x, yPos)
          else ctx.lineTo(x, yPos)
        }
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Update time for animation
      if (isPlaying) {
        time += 0.05
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    frequency,
    amplitude,
    phase,
    waveType,
    harmonic2,
    harmonic3,
    harmonic4,
    isPlaying,
    showHarmonics,
  ])

  const toggleSound = () => {
    if (!audioContextRef.current) return

    if (isPlaying) {
      // Stop playing
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
        oscillatorRef.current.disconnect()
        oscillatorRef.current = null
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect()
        gainNodeRef.current = null
      }
      setIsPlaying(false)
    } else {
      // Start playing
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.type = waveType
      oscillator.frequency.value = frequency
      gainNode.gain.value = amplitude * 0.1 // Scale down for comfortable volume

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.start()

      oscillatorRef.current = oscillator
      gainNodeRef.current = gainNode
      setIsPlaying(true)
    }
  }

  // Update sound parameters when changed
  useEffect(() => {
    if (oscillatorRef.current && isPlaying) {
      oscillatorRef.current.frequency.value = frequency
      oscillatorRef.current.type = waveType
    }
    if (gainNodeRef.current && isPlaying) {
      gainNodeRef.current.gain.value = amplitude * 0.1
    }
  }, [frequency, amplitude, waveType, isPlaying])

  const getFrequencyNote = (freq: number) => {
    if (freq >= 255 && freq <= 270) return 'C4 (Middle C)'
    if (freq >= 430 && freq <= 450) return 'A4 (Concert Pitch)'
    if (freq >= 875 && freq <= 885) return 'A5 (High A)'
    if (freq < 20) return 'Below Human Hearing'
    if (freq > 20000) return 'Above Human Hearing'
    if (freq >= 85 && freq <= 255) return 'Human Speech Range'
    return ''
  }

  const getAmplitudeLevel = (amp: number) => {
    const db = 20 * Math.log10(amp)
    if (db < -20) return 'Very Quiet (~30 dB)'
    if (db < -10) return 'Quiet (~40-50 dB)'
    if (db < -3) return 'Normal (~60 dB)'
    if (db < 0) return 'Loud (~70-80 dB)'
    return 'Very Loud (~90+ dB)'
  }

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 rounded px-4 py-1 text-sm ${
            isPlaying
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? 'Stop Sound' : 'Play Sound'}
        </button>
      </div>

      <div className="bg-white p-4 dark:bg-gray-900">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="mb-6 h-64 w-full rounded bg-gray-900"
        />

        {/* Controls */}
        <div className="space-y-4">
          {/* Wave Type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Wave Type
            </label>
            <div className="flex gap-2">
              {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setWaveType(type)}
                  className={`rounded px-3 py-1 text-sm capitalize ${
                    waveType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Frequency (Pitch): {frequency} Hz{' '}
              {getFrequencyNote(frequency) && `- ${getFrequencyNote(frequency)}`}
            </label>
            <input
              type="range"
              min="20"
              max="2000"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>20 Hz (Low)</span>
              <span>440 Hz (A4)</span>
              <span>2000 Hz (High)</span>
            </div>
          </div>

          {/* Amplitude */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Amplitude (Loudness): {(amplitude * 100).toFixed(0)}% - {getAmplitudeLevel(amplitude)}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={amplitude * 100}
              onChange={(e) => setAmplitude(parseInt(e.target.value) / 100)}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Silent</span>
              <span>Normal</span>
              <span>Loud</span>
            </div>
          </div>

          {/* Phase */}
          {showPhase && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Phase Shift: {((phase / Math.PI) * 180).toFixed(0)}°
              </label>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.1"
                value={phase}
                onChange={(e) => setPhase(parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>0°</span>
                <span>180°</span>
                <span>360°</span>
              </div>
            </div>
          )}

          {/* Harmonics / Timbre */}
          {showHarmonics && waveType === 'sine' && (
            <div className="border-t pt-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Timbre (Harmonics) - Creates unique sound character
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    2nd Harmonic ({(frequency * 2).toFixed(0)} Hz): {(harmonic2 * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={harmonic2 * 100}
                    onChange={(e) => setHarmonic2(parseInt(e.target.value) / 100)}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-green-200 dark:bg-green-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    3rd Harmonic ({(frequency * 3).toFixed(0)} Hz): {(harmonic3 * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={harmonic3 * 100}
                    onChange={(e) => setHarmonic3(parseInt(e.target.value) / 100)}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-yellow-200 dark:bg-yellow-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    4th Harmonic ({(frequency * 4).toFixed(0)} Hz): {(harmonic4 * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={harmonic4 * 100}
                    onChange={(e) => setHarmonic4(parseInt(e.target.value) / 100)}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-red-200 dark:bg-red-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded bg-blue-50 p-3 dark:bg-blue-900/20">
            <h4 className="mb-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
              Try These:
            </h4>
            <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              <li>• Set frequency to 262 Hz for Middle C</li>
              <li>• Add harmonics to create richer sounds</li>
              <li>• Compare sine vs square waves at same frequency</li>
              <li>• Observe how phase affects wave position</li>
            </ul>
          </div>

          <div className="rounded bg-green-50 p-3 dark:bg-green-900/20">
            <h4 className="mb-1 text-sm font-semibold text-green-700 dark:text-green-300">
              Key Concepts:
            </h4>
            <ul className="space-y-1 text-xs text-green-600 dark:text-green-400">
              <li>• Higher frequency = higher pitch</li>
              <li>• Larger amplitude = louder sound</li>
              <li>• Harmonics create timbre (tone quality)</li>
              <li>• Phase affects how waves combine</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
