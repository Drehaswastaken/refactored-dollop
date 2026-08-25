import { useMemo } from 'react'
import { motion } from 'framer-motion'

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PETAL_COLORS = ['#E8B7BE', '#D98A93', '#F3D3D8', '#EFB9C2']

interface DriftingPetalsProps {
  count?: number
  seed?: number
}

export function DriftingPetals({ count = 10, seed = 7 }: DriftingPetalsProps) {
  const petals = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: count }, (_, i) => {
      const x0 = r() * 110 - 5
      const drift = (r() - 0.5) * 160
      const sway = 24 + r() * 36
      const duration = 14 + r() * 14
      return {
        id: i,
        x0,
        drift,
        sway,
        duration,
        delay: -r() * duration,
        size: 9 + r() * 9,
        spin0: r() * 360,
        spins: 2 + Math.floor(r() * 3),
        peak: 0.32 + r() * 0.38,
        color: PETAL_COLORS[Math.floor(r() * PETAL_COLORS.length)],
        flip: r() > 0.5 ? -1 : 1,
      }
    })
  }, [count, seed])

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden opacity-80 dark:opacity-40" aria-hidden>
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-0 top-0"
          initial={{ x: `${p.x0}vw`, y: '-6vh', opacity: 0, rotate: p.spin0 }}
          animate={{
            x: [
              `${p.x0}vw`,
              `${p.x0 + p.drift - p.sway}vw`,
              `${p.x0 + p.drift + p.sway * 0.6}vw`,
              `${p.x0 + p.drift}vw`,
            ],
            y: ['-6vh', '34vh', '72vh', '112vh'],
            rotate: [p.spin0, p.spin0 + p.spins * 180 * p.flip],
            opacity: [0, p.peak, p.peak * 0.85, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            opacity: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear', times: [0, 0.12, 0.82, 1] },
          }}
        >
          <svg width={p.size} height={p.size * 1.3} viewBox="0 0 24 32" style={{ transform: `scaleX(${p.flip})` }}>
            <path
              d="M12 1 C19 7 21 17 12 31 C3 17 5 7 12 1 Z"
              fill={p.color}
              fillOpacity="0.62"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

export function PetalBurst() {
  const petals = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + (i % 3) * 0.35
        const dist = 180 + ((i * 37) % 120)
        return {
          id: i,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist * 0.72,
          size: 10 + ((i * 13) % 8),
          rot: (i % 2 ? 1 : -1) * (240 + i * 23),
          color: PETAL_COLORS[i % PETAL_COLORS.length],
        }
      }),
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center" aria-hidden>
      {petals.map((p) => (
        <motion.svg
          key={p.id}
          width={p.size}
          height={p.size * 1.3}
          viewBox="0 0 24 32"
          className="absolute"
          initial={{ x: 0, y: 0, opacity: 0.9, scale: 0.4, rotate: 0 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 1, rotate: p.rot }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <path d="M12 1 C19 7 21 17 12 31 C3 17 5 7 12 1 Z" fill={p.color} />
        </motion.svg>
      ))}
    </div>
  )
}
