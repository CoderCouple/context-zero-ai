'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface WaveTypeDiagramProps {
  title?: string
}

export default function WaveTypeDiagram({
  title = 'Wave Types Visualization',
}: WaveTypeDiagramProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [wavelength, setWavelength] = useState(80)
  const [frequency, setFrequency] = useState(5)
  const [phase, setPhase] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [amplitude, setAmplitude] = useState(30)

  const animationRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (isPlaying) {
      const animate = (currentTime: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = currentTime
        const deltaTime = currentTime - lastTimeRef.current

        // Update time based on frequency and speed
        const angularVelocity = (2 * Math.PI * frequency * speed) / 5
        setTime((prevTime) => prevTime + deltaTime * 0.001 * angularVelocity)

        lastTimeRef.current = currentTime
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        lastTimeRef.current = 0
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, frequency, speed])

  const reset = () => {
    setIsPlaying(false)
    setTime(0)
    setWavelength(80)
    setFrequency(5)
    setPhase(0)
    setSpeed(1)
    setAmplitude(30)
  }

  // Wave parameters
  const numParticles = 12

  // Calculate particle positions for longitudinal wave
  const getLongitudinalParticles = () => {
    const particles: Array<{ x: number; y: number; baseX: number; phase: number }> = []
    for (let i = 0; i < numParticles; i++) {
      const baseX = 50 + i * 30
      const wavePhase = (2 * Math.PI * i * 30) / wavelength + time + phase
      const displacement = amplitude * Math.sin(wavePhase) * 0.5
      particles.push({
        x: baseX + displacement,
        y: 100,
        baseX,
        phase: wavePhase,
      })
    }
    return particles
  }

  // Calculate particle positions for transverse wave
  const getTransverseParticles = () => {
    const particles: Array<{ x: number; y: number; phase: number }> = []
    for (let i = 0; i < numParticles; i++) {
      const x = 50 + i * 30
      const wavePhase = (2 * Math.PI * i * 30) / wavelength + time + phase
      const y = 100 + amplitude * Math.sin(wavePhase)
      particles.push({ x, y, phase: wavePhase })
    }
    return particles
  }

  // Generate wave path for visualization
  const getWavePath = (isTransverse: boolean) => {
    const points: Array<string | { x: number; opacity: number }> = []
    for (let x = 0; x <= 450; x += 2) {
      const wavePhase = (2 * Math.PI * x) / wavelength + time + phase
      if (isTransverse) {
        const y = 100 + amplitude * Math.sin(wavePhase)
        points.push(`${x},${y}`)
      } else {
        // For longitudinal, show compression regions
        const compression = Math.sin(wavePhase)
        const opacity = (compression + 1) / 2
        points.push({ x, opacity })
      }
    }

    if (isTransverse) {
      return `M ${points.join(' L ')}`
    }
    return points
  }

  const longitudinalParticles = getLongitudinalParticles()
  const transverseParticles = getTransverseParticles()
  const transversePath = getWavePath(true) as string
  const longitudinalRegions = getWavePath(false) as { x: number; opacity: number }[]

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 dark:bg-gray-800">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</span>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="rounded p-1.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 dark:bg-gray-900">
        {/* Interactive Controls */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Wave Controls
          </h4>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {/* Wavelength */}
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                Wavelength
              </label>
              <input
                type="range"
                min="40"
                max="160"
                value={wavelength}
                onChange={(e) => setWavelength(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              />
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{wavelength} px</div>
            </div>

            {/* Frequency */}
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                Frequency
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              />
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{frequency} Hz</div>
            </div>

            {/* Phase */}
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Phase</label>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.1"
                value={phase}
                onChange={(e) => setPhase(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              />
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {phase.toFixed(2)} rad
              </div>
            </div>

            {/* Speed */}
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Speed</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              />
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{speed} x</div>
            </div>

            {/* Amplitude */}
            <div>
              <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                Amplitude
              </label>
              <input
                type="range"
                min="10"
                max="40"
                value={amplitude}
                onChange={(e) => setAmplitude(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              />
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{amplitude} px</div>
            </div>
          </div>

          {/* Wave properties display */}
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Wave Speed (v):</span>
                <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">
                  {(frequency * wavelength).toFixed(0)} px/s
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Period (T):</span>
                <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">
                  {(1 / frequency).toFixed(2)} s
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Angular Freq (ω):</span>
                <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">
                  {(2 * Math.PI * frequency).toFixed(2)} rad/s
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Wave Number (k):</span>
                <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">
                  {((2 * Math.PI) / wavelength).toFixed(3)} rad/px
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Longitudinal Wave */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Longitudinal Wave (Sound)
            </h3>
            <div className="relative rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <svg width="100%" height="200" viewBox="0 0 450 200" className="w-full">
                {/* Compression regions visualization */}
                {longitudinalRegions.map((region, i) => (
                  <rect
                    key={i}
                    x={region.x}
                    y={70}
                    width={2}
                    height={60}
                    fill="currentColor"
                    className="text-blue-400 dark:text-blue-500"
                    opacity={region.opacity * 0.3}
                  />
                ))}

                {/* Equilibrium line */}
                <line
                  x1="0"
                  y1="100"
                  x2="450"
                  y2="100"
                  stroke="currentColor"
                  className="text-gray-300 dark:text-gray-600"
                  strokeDasharray="5,5"
                />

                {/* Wave direction arrow */}
                <g transform="translate(400, 150)">
                  <path
                    d="M 0 0 L 30 0 L 25 -3 M 30 0 L 25 3"
                    stroke="currentColor"
                    className="text-green-500"
                    strokeWidth="2"
                    fill="none"
                  />
                  <text
                    x="15"
                    y="15"
                    textAnchor="middle"
                    className="fill-current text-xs text-gray-600 dark:text-gray-400"
                  >
                    Wave →
                  </text>
                </g>

                {/* Particles */}
                {longitudinalParticles.map((particle, i) => (
                  <g key={i}>
                    {/* Particle motion arrow */}
                    {Math.abs(particle.x - particle.baseX) > 1 && (
                      <line
                        x1={particle.baseX}
                        y1={particle.y}
                        x2={particle.x}
                        y2={particle.y}
                        stroke="currentColor"
                        className="text-orange-400"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead-orange)"
                      />
                    )}
                    {/* Particle */}
                    <circle
                      cx={particle.x}
                      cy={particle.y}
                      r="6"
                      fill="currentColor"
                      className="text-blue-500"
                    />
                  </g>
                ))}

                {/* Arrow markers */}
                <defs>
                  <marker
                    id="arrowhead-orange"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                    className="text-orange-400"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                  </marker>
                </defs>

                {/* Labels */}
                <text
                  x="225"
                  y="30"
                  textAnchor="middle"
                  className="fill-current text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Particles move parallel to wave (←→)
                </text>

                {/* Compression/Rarefaction labels */}
                {longitudinalParticles[3] &&
                  longitudinalParticles[3].phase > 0 &&
                  longitudinalParticles[3].phase < Math.PI && (
                    <text
                      x={longitudinalParticles[3].x}
                      y="180"
                      textAnchor="middle"
                      className="fill-current text-xs text-gray-600 dark:text-gray-400"
                    >
                      Compression
                    </text>
                  )}
                {longitudinalParticles[7] &&
                  longitudinalParticles[7].phase > Math.PI &&
                  longitudinalParticles[7].phase < 2 * Math.PI && (
                    <text
                      x={longitudinalParticles[7].x}
                      y="180"
                      textAnchor="middle"
                      className="fill-current text-xs text-gray-600 dark:text-gray-400"
                    >
                      Rarefaction
                    </text>
                  )}
              </svg>
            </div>
          </div>

          {/* Transverse Wave */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Transverse Wave (Light)
            </h3>
            <div className="relative rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <svg width="100%" height="200" viewBox="0 0 450 200" className="w-full">
                {/* Wave curve */}
                <path
                  d={transversePath}
                  fill="none"
                  stroke="currentColor"
                  className="text-purple-400 dark:text-purple-500"
                  strokeWidth="2"
                />

                {/* Equilibrium line */}
                <line
                  x1="0"
                  y1="100"
                  x2="450"
                  y2="100"
                  stroke="currentColor"
                  className="text-gray-300 dark:text-gray-600"
                  strokeDasharray="5,5"
                />

                {/* Wave direction arrow */}
                <g transform="translate(400, 150)">
                  <path
                    d="M 0 0 L 30 0 L 25 -3 M 30 0 L 25 3"
                    stroke="currentColor"
                    className="text-green-500"
                    strokeWidth="2"
                    fill="none"
                  />
                  <text
                    x="15"
                    y="15"
                    textAnchor="middle"
                    className="fill-current text-xs text-gray-600 dark:text-gray-400"
                  >
                    Wave →
                  </text>
                </g>

                {/* Particles */}
                {transverseParticles.map((particle, i) => (
                  <g key={i}>
                    {/* Particle motion arrow */}
                    {Math.abs(particle.y - 100) > 2 && (
                      <line
                        x1={particle.x}
                        y1={100}
                        x2={particle.x}
                        y2={particle.y}
                        stroke="currentColor"
                        className="text-orange-400"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead-orange-t)"
                      />
                    )}
                    {/* Particle */}
                    <circle
                      cx={particle.x}
                      cy={particle.y}
                      r="6"
                      fill="currentColor"
                      className="text-purple-500"
                    />
                  </g>
                ))}

                {/* Arrow markers */}
                <defs>
                  <marker
                    id="arrowhead-orange-t"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                    className="text-orange-400"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                  </marker>
                </defs>

                {/* Labels */}
                <text
                  x="225"
                  y="30"
                  textAnchor="middle"
                  className="fill-current text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Particles move perpendicular to wave (↑↓)
                </text>

                {/* Crest/Trough labels */}
                {transverseParticles[2] && transverseParticles[2].y < 85 && (
                  <text
                    x={transverseParticles[2].x}
                    y="60"
                    textAnchor="middle"
                    className="fill-current text-xs text-gray-600 dark:text-gray-400"
                  >
                    Crest
                  </text>
                )}
                {transverseParticles[5] && transverseParticles[5].y > 115 && (
                  <text
                    x={transverseParticles[5].x}
                    y="145"
                    textAnchor="middle"
                    className="fill-current text-xs text-gray-600 dark:text-gray-400"
                  >
                    Trough
                  </text>
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Key differences */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
            Key Differences
          </h4>
          <div className="grid gap-4 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-2">
            <div>
              <strong className="text-blue-600 dark:text-blue-400">Longitudinal (Sound):</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Particles move parallel to wave direction</li>
                <li>• Creates compressions and rarefactions</li>
                <li>• Requires a medium (cannot travel through vacuum)</li>
                <li>• Examples: Sound, P-waves</li>
              </ul>
            </div>
            <div>
              <strong className="text-purple-600 dark:text-purple-400">Transverse (Light):</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Particles move perpendicular to wave direction</li>
                <li>• Creates crests and troughs</li>
                <li>• EM waves don't need a medium</li>
                <li>• Examples: Light, water surface waves</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
