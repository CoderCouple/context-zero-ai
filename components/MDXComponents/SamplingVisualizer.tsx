'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Info } from 'lucide-react'

interface SamplingVisualizerProps {
  title?: string
}

export default function SamplingVisualizer({
  title = 'Digital Audio: Waveform, Sample Rate & Bit Depth',
}: SamplingVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const [sampleRate, setSampleRate] = useState(24000) // 24kHz default
  const [bitDepth, setBitDepth] = useState(16) // 16-bit default
  const [frequency, setFrequency] = useState(440) // A4 note
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSamples, setShowSamples] = useState(true)
  const [showQuantization, setShowQuantization] = useState(true)
  const [animationTime, setAnimationTime] = useState(0)

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

  // Animation loop
  useEffect(() => {
    let animationId: number

    const animate = () => {
      setAnimationTime((prev) => prev + 0.01)
      animationId = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      animate()
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPlaying])

  // Draw waveform with sampling and quantization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.5

    // Vertical grid lines
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal grid lines for bit depth levels
    const quantizationLevels = Math.pow(2, bitDepth)
    const levelHeight = height / quantizationLevels

    if (showQuantization && bitDepth <= 8) {
      ctx.strokeStyle = '#4b5563'
      ctx.setLineDash([2, 2])
      for (let i = 0; i <= quantizationLevels; i++) {
        const y = i * levelHeight
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.setLineDash([])
    }

    // Draw center line
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    // Calculate samples per window
    const windowDuration = 0.05 // 50ms window
    const samplesInWindow = Math.floor(sampleRate * windowDuration)
    const sampleSpacing = width / samplesInWindow

    // Draw continuous waveform
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.3
    ctx.beginPath()

    for (let x = 0; x < width; x++) {
      const t = (x / width) * windowDuration
      const y = Math.sin(2 * Math.PI * frequency * t + animationTime) * 0.8
      const yPos = height / 2 - (y * height) / 3

      if (x === 0) {
        ctx.moveTo(x, yPos)
      } else {
        ctx.lineTo(x, yPos)
      }
    }
    ctx.stroke()
    ctx.globalAlpha = 1

    // Draw sampled points and quantized values
    if (showSamples) {
      const samples: Array<{ x: number; continuousValue: number; quantizedValue: number }> = []

      for (let i = 0; i < samplesInWindow; i++) {
        const x = i * sampleSpacing
        const t = (i / samplesInWindow) * windowDuration
        const continuousValue = Math.sin(2 * Math.PI * frequency * t + animationTime) * 0.8

        // Quantize the value
        let quantizedValue = continuousValue
        if (showQuantization) {
          const scaledValue = (continuousValue + 1) / 2 // Scale to 0-1
          const quantizationStep = 1 / (quantizationLevels - 1)
          const quantizedLevel = Math.round(scaledValue / quantizationStep)
          quantizedValue = quantizedLevel * quantizationStep * 2 - 1 // Scale back to -1 to 1
        }

        samples.push({ x, continuousValue, quantizedValue })
      }

      // Draw sample points
      ctx.fillStyle = '#ef4444'
      samples.forEach((sample) => {
        const yPos = height / 2 - (sample.continuousValue * height) / 3
        ctx.beginPath()
        ctx.arc(sample.x, yPos, 4, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Draw quantized waveform
      if (showQuantization) {
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.beginPath()

        samples.forEach((sample, i) => {
          const yPos = height / 2 - (sample.quantizedValue * height) / 3

          if (i === 0) {
            ctx.moveTo(sample.x, yPos)
          } else {
            // Draw step function for quantized values
            const prevY = height / 2 - (samples[i - 1].quantizedValue * height) / 3
            ctx.lineTo(sample.x, prevY)
            ctx.lineTo(sample.x, yPos)
          }
        })
        ctx.stroke()

        // Draw vertical lines from samples to quantized values
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 1
        ctx.setLineDash([2, 2])
        samples.forEach((sample) => {
          const continuousY = height / 2 - (sample.continuousValue * height) / 3
          const quantizedY = height / 2 - (sample.quantizedValue * height) / 3
          ctx.beginPath()
          ctx.moveTo(sample.x, continuousY)
          ctx.lineTo(sample.x, quantizedY)
          ctx.stroke()
        })
        ctx.setLineDash([])
      }
    }

    // Draw info labels
    ctx.font = '12px monospace'
    ctx.fillStyle = '#d1d5db'

    // Sample rate info
    ctx.fillText(`${samplesInWindow} samples in 50ms window`, 10, 20)
    ctx.fillText(`Sample every ${(1000 / sampleRate).toFixed(3)}ms`, 10, 35)

    // Bit depth info
    if (showQuantization) {
      ctx.fillText(`${quantizationLevels} amplitude levels`, width - 150, 20)
      const noiseFloor = -6.02 * bitDepth - 1.76
      ctx.fillText(`Noise floor: ${noiseFloor.toFixed(1)} dB`, width - 150, 35)
    }
  }, [sampleRate, bitDepth, frequency, showSamples, showQuantization, animationTime])

  const toggleSound = () => {
    if (!audioContextRef.current) return

    if (isPlaying) {
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
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gainNode.gain.value = 0.1

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.start()

      oscillatorRef.current = oscillator
      gainNodeRef.current = gainNode
      setIsPlaying(true)
    }
  }

  // Update sound frequency when changed
  useEffect(() => {
    if (oscillatorRef.current && isPlaying) {
      oscillatorRef.current.frequency.value = frequency
    }
  }, [frequency, isPlaying])

  const getSampleRateInfo = (rate: number) => {
    if (rate === 8000) return 'Telephone quality'
    if (rate === 16000) return 'Wideband speech'
    if (rate === 24000) return 'Speech synthesis standard'
    if (rate === 44100) return 'CD quality'
    if (rate === 48000) return 'Professional audio'
    if (rate === 96000) return 'High-resolution audio'
    return ''
  }

  const getBitDepthInfo = (depth: number) => {
    const levels = Math.pow(2, depth)
    const dynamicRange = depth * 6.02 + 1.76
    return `${levels} levels, ${dynamicRange.toFixed(1)} dB range`
  }

  const calculateFileSize = () => {
    const bitsPerSample = bitDepth
    const bytesPerSecond = (sampleRate * bitsPerSample) / 8
    const kbPerSecond = bytesPerSecond / 1024
    return kbPerSecond.toFixed(1)
  }

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 rounded px-4 py-1 text-sm ${
              isPlaying
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Stop' : 'Play'} {frequency} Hz
          </button>
        </div>
      </div>

      <div className="bg-white p-4 dark:bg-gray-900">
        {/* Key Concepts - Each with definition and detailed diagram */}
        <div className="mb-6 space-y-6">
          {/* Waveform Section */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="mb-3 flex items-start gap-4">
              <div className="flex-1">
                <h4 className="mb-1 text-lg font-semibold text-blue-700 dark:text-blue-300">
                  1. Waveform — the raw shape of sound
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Air pressure changing over time. When you speak, your vocal cords push air
                  molecules in waves. A microphone measures that pressure as a continuous signal
                  between -1 and +1.
                </p>
              </div>
            </div>

            {/* Detailed Waveform Diagram */}
            <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
              <svg width="100%" height="180" viewBox="0 0 400 180" className="block">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid-wave" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="180" fill="url(#grid-wave)" />

                {/* Axes */}
                <line x1="40" y1="20" x2="40" y2="160" stroke="#6B7280" strokeWidth="1.5" />
                <line x1="40" y1="90" x2="380" y2="90" stroke="#6B7280" strokeWidth="1.5" />

                {/* Waveform */}
                <path
                  d="M 40 90 Q 80 30, 120 90 T 200 90 T 280 90 T 360 90"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  fill="none"
                />

                {/* Peak annotation */}
                <circle cx="80" cy="30" r="4" fill="#EF4444" />
                <text x="80" y="20" fontSize="12" fill="#EF4444" textAnchor="middle">
                  peak (loud)
                </text>
                <line
                  x1="80"
                  y1="35"
                  x2="80"
                  y2="90"
                  stroke="#EF4444"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Trough annotation */}
                <circle cx="160" cy="150" r="4" fill="#EF4444" />
                <text x="160" y="170" fontSize="12" fill="#EF4444" textAnchor="middle">
                  trough (loud)
                </text>
                <line
                  x1="160"
                  y1="145"
                  x2="160"
                  y2="90"
                  stroke="#EF4444"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Axis labels */}
                <text x="15" y="25" fontSize="12" fill="#6B7280">
                  amp
                </text>
                <text x="20" y="35" fontSize="11" fill="#6B7280">
                  +1
                </text>
                <text x="25" y="93" fontSize="11" fill="#6B7280">
                  0
                </text>
                <text x="20" y="155" fontSize="11" fill="#6B7280">
                  -1
                </text>
                <text x="370" y="175" fontSize="12" fill="#6B7280">
                  time
                </text>

                {/* Arrow for time */}
                <path
                  d="M 360 168 L 375 168 L 372 165 M 375 168 L 372 171"
                  stroke="#6B7280"
                  strokeWidth="1"
                  fill="none"
                />

                {/* Description box */}
                <rect
                  x="220"
                  y="120"
                  width="160"
                  height="50"
                  fill="#F3F4F6"
                  stroke="#D1D5DB"
                  rx="4"
                />
                <text x="230" y="138" fontSize="11" fill="#4B5563">
                  Air pressure over time
                </text>
                <text x="230" y="153" fontSize="11" fill="#4B5563">
                  Speakers push/pull air
                </text>
                <text x="230" y="168" fontSize="11" fill="#4B5563">
                  to recreate this shape
                </text>
              </svg>
            </div>
          </div>

          {/* Sample Rate Section */}
          <div className="rounded-lg bg-gradient-to-r from-red-50 to-red-100 p-4 dark:from-red-900/20 dark:to-red-800/20">
            <div className="mb-3 flex items-start gap-4">
              <div className="flex-1">
                <h4 className="mb-1 text-lg font-semibold text-red-700 dark:text-red-300">
                  2. Sample Rate — how often we measure the wave
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  How many "snapshots" of the waveform we take per second. 24 kHz = 24,000
                  samples/sec means one snapshot every 0.000042 seconds. More samples = better
                  reconstruction.
                </p>
              </div>
            </div>

            {/* Detailed Sample Rate Diagram */}
            <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Low rate (few snapshots) → jagged reconstruction
                  </p>
                  <svg width="100%" height="80" viewBox="0 0 400 80" className="block">
                    <path
                      d="M 20 40 Q 60 10, 100 40 T 180 40 T 260 40 T 340 40 T 380 40"
                      stroke="#D1D5DB"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                      fill="none"
                    />
                    {/* Sparse samples */}
                    <circle cx="20" cy="40" r="4" fill="#DC2626" />
                    <circle cx="100" cy="40" r="4" fill="#DC2626" />
                    <circle cx="180" cy="40" r="4" fill="#DC2626" />
                    <circle cx="260" cy="40" r="4" fill="#DC2626" />
                    <circle cx="340" cy="40" r="4" fill="#DC2626" />
                    {/* Reconstructed jagged line */}
                    <path
                      d="M 20 40 L 100 40 L 180 40 L 260 40 L 340 40"
                      stroke="#DC2626"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      fill="none"
                      opacity="0.7"
                    />
                  </svg>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    High rate (dense samples, 24kHz = 24,000/sec) → smooth reconstruction
                  </p>
                  <svg width="100%" height="80" viewBox="0 0 400 80" className="block">
                    <path
                      d="M 20 40 Q 60 10, 100 40 T 180 40 T 260 40 T 340 40 T 380 40"
                      stroke="#D1D5DB"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                      fill="none"
                    />
                    {/* Dense samples */}
                    {[
                      20, 35, 50, 65, 80, 95, 110, 125, 140, 155, 170, 185, 200, 215, 230, 245, 260,
                      275, 290, 305, 320, 335, 350, 365, 380,
                    ].map((x) => {
                      const y = parseFloat((40 + 30 * Math.sin((x - 20) * 0.04)).toFixed(2))
                      return <circle key={x} cx={x} cy={y} r="2" fill="#3B82F6" />
                    })}
                    {/* Smooth reconstruction */}
                    <path
                      d="M 20 40 Q 60 10, 100 40 T 180 40 T 260 40 T 340 40 T 380 40"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.8"
                    />
                  </svg>
                </div>

                <div className="rounded bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>24kHz is standard for TTS</strong> — humans hear up to ~20kHz, so 24k
                    comfortably covers speech
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bit Depth Section */}
          <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-4 dark:from-green-900/20 dark:to-green-800/20">
            <div className="mb-3 flex items-start gap-4">
              <div className="flex-1">
                <h4 className="mb-1 text-lg font-semibold text-green-700 dark:text-green-300">
                  3. Bit Depth — how precisely we measure each sample
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The precision of each measurement. 8 bits = 256 levels (coarse, noisy). 16 bits =
                  65,536 levels (CD quality). More bits = less quantization noise.
                </p>
              </div>
            </div>

            {/* Detailed Bit Depth Diagram */}
            <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-center text-sm font-medium">2-bit (4 levels)</p>
                  <svg width="100%" height="100" viewBox="0 0 120 100" className="block">
                    <rect width="120" height="100" fill="#FAFAFA" />
                    {/* Grid for levels */}
                    {[25, 50, 75].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="120"
                        y2={y}
                        stroke="#E5E7EB"
                        strokeWidth="0.5"
                      />
                    ))}
                    {/* Original wave */}
                    <path
                      d="M 10 50 Q 30 20, 50 50 T 90 50 T 110 50"
                      stroke="#D1D5DB"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.5"
                    />
                    {/* Quantized */}
                    <path
                      d="M 10 75 L 25 75 L 25 50 L 35 50 L 35 25 L 45 25 L 45 25 L 55 25 L 55 50 L 65 50 L 65 75 L 75 75 L 75 75 L 85 75 L 85 50 L 95 50 L 95 25 L 105 25 L 105 50 L 110 50"
                      stroke="#DC2626"
                      strokeWidth="2"
                      fill="none"
                    />
                    <text x="60" y="95" fontSize="10" fill="#6B7280" textAnchor="middle">
                      coarse / noisy
                    </text>
                  </svg>
                </div>

                <div>
                  <p className="mb-2 text-center text-sm font-medium">8-bit (256 levels)</p>
                  <svg width="100%" height="100" viewBox="0 0 120 100" className="block">
                    <rect width="120" height="100" fill="#FAFAFA" />
                    {/* Original wave */}
                    <path
                      d="M 10 50 Q 30 20, 50 50 T 90 50 T 110 50"
                      stroke="#D1D5DB"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.5"
                    />
                    {/* Better quantized */}
                    <path
                      d="M 10 52 L 15 48 L 20 42 L 25 36 L 30 32 L 35 30 L 40 32 L 45 36 L 50 42 L 55 48 L 60 52 L 65 54 L 70 52 L 75 48 L 80 42 L 85 36 L 90 32 L 95 30 L 100 32 L 105 36 L 110 42"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      fill="none"
                    />
                    <text x="60" y="95" fontSize="10" fill="#6B7280" textAnchor="middle">
                      decent quality
                    </text>
                  </svg>
                </div>

                <div>
                  <p className="mb-2 text-center text-sm font-medium">16-bit (65,536 levels)</p>
                  <svg width="100%" height="100" viewBox="0 0 120 100" className="block">
                    <rect width="120" height="100" fill="#FAFAFA" />
                    {/* Perfect match */}
                    <path
                      d="M 10 50 Q 30 20, 50 50 T 90 50 T 110 50"
                      stroke="#10B981"
                      strokeWidth="3"
                      fill="none"
                    />
                    <text x="60" y="95" fontSize="10" fill="#6B7280" textAnchor="middle">
                      CD quality
                    </text>
                  </svg>
                </div>
              </div>

              {/* File size table */}
              <div className="mt-4 rounded bg-gray-50 p-3 dark:bg-gray-700">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="py-1 text-left">Format</th>
                      <th className="py-1 text-center">Sample Rate</th>
                      <th className="py-1 text-center">Bit Depth</th>
                      <th className="py-1 text-right">File Size/min</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1">Phone call</td>
                      <td className="text-center">8 kHz</td>
                      <td className="text-center">8-bit</td>
                      <td className="text-right">~0.5 MB</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold">KittenTTS / TTS</td>
                      <td className="text-center font-semibold">24 kHz</td>
                      <td className="text-center font-semibold">16-bit</td>
                      <td className="text-right font-semibold">~2.8 MB</td>
                    </tr>
                    <tr>
                      <td className="py-1">CD audio</td>
                      <td className="text-center">44.1 kHz</td>
                      <td className="text-center">16-bit</td>
                      <td className="text-right">~10 MB</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="mb-6 h-64 w-full rounded bg-gray-900"
        />

        {/* Legend */}
        <div className="mb-4 flex gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500 opacity-30"></div>
            <span>Continuous waveform</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500"></div>
            <span>Sample points</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500"></div>
            <span>Quantized signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-3 bg-yellow-500"></div>
            <span>Quantization error</span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Sample Rate */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Sample Rate: {(sampleRate / 1000).toFixed(0)} kHz = {sampleRate.toLocaleString()}{' '}
              samples/sec
              {getSampleRateInfo(sampleRate) && ` - ${getSampleRateInfo(sampleRate)}`}
            </label>
            <input
              type="range"
              min="8000"
              max="96000"
              step="8000"
              value={sampleRate}
              onChange={(e) => setSampleRate(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>8 kHz</span>
              <span>24 kHz</span>
              <span>44.1 kHz</span>
              <span>96 kHz</span>
            </div>
          </div>

          {/* Bit Depth */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Bit Depth: {bitDepth}-bit - {getBitDepthInfo(bitDepth)}
            </label>
            <input
              type="range"
              min="4"
              max="24"
              step="4"
              value={bitDepth}
              onChange={(e) => setBitDepth(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>4-bit</span>
              <span>8-bit</span>
              <span>16-bit</span>
              <span>24-bit</span>
            </div>
          </div>

          {/* Test Frequency */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Test Frequency: {frequency} Hz
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
            />
          </div>

          {/* Toggle Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showSamples}
                onChange={(e) => setShowSamples(e.target.checked)}
                className="rounded"
              />
              Show sampling
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showQuantization}
                onChange={(e) => setShowQuantization(e.target.checked)}
                className="rounded"
              />
              Show quantization
            </label>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded bg-blue-50 p-3 dark:bg-blue-900/20">
            <h4 className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
              Waveform
            </h4>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Air pressure changing over time. The blue line shows the continuous analog signal that
              exists in nature.
            </p>
          </div>

          <div className="rounded bg-red-50 p-3 dark:bg-red-900/20">
            <h4 className="mb-2 text-sm font-semibold text-red-700 dark:text-red-300">
              Sample Rate
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400">
              How often we measure the waveform. Red dots show where we take snapshots. Higher rate
              = better quality.
            </p>
          </div>

          <div className="rounded bg-green-50 p-3 dark:bg-green-900/20">
            <h4 className="mb-2 text-sm font-semibold text-green-700 dark:text-green-300">
              Bit Depth
            </h4>
            <p className="text-xs text-green-600 dark:text-green-400">
              Precision of each measurement. Green line shows quantized values. More bits = less
              noise.
            </p>
          </div>
        </div>

        {/* File Size Calculator */}
        <div className="mt-4 rounded bg-gray-100 p-3 dark:bg-gray-800">
          <p className="text-sm">
            <strong>File Size:</strong> {calculateFileSize()} KB/second for mono audio (
            {(parseFloat(calculateFileSize()) * 60).toFixed(1)} KB/minute)
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Formula: (Sample Rate × Bit Depth) ÷ 8 ÷ 1024 = KB/sec
          </p>
        </div>

        {/* Nyquist Info */}
        <div className="mt-4 rounded bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <h4 className="mb-1 text-sm font-semibold text-yellow-700 dark:text-yellow-300">
            Nyquist Theorem
          </h4>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Maximum frequency that can be accurately captured: {(sampleRate / 2).toLocaleString()}{' '}
            Hz (half the sample rate). This is why 24 kHz is perfect for speech (captures up to 12
            kHz).
          </p>
        </div>
      </div>
    </div>
  )
}
