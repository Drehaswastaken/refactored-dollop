import { AnimatePresence, motion } from 'framer-motion'
import {
  type AssignedFlower,
  type FlowerType,
  type WrapStyle,
  arrangeFlowers,
  greeneryFor,
} from '../lib/bouquet'
import { FlowerArt, GreeneryArt } from './flowers'
import { Wrapper } from './Wrapper'

const ORIGIN = { x: 160, y: 332 }

const BLOOM_SIZE: Record<FlowerType, number> = {
  rose: 70,
  tulip: 66,
  daisy: 62,
  peony: 78,
  lavender: 58,
  ranunculus: 68,
  sunflower: 84,
}

function stemPath(slot: { x: number; y: number; scale: number }, type: FlowerType) {
  const side = Math.sign(slot.x - ORIGIN.x) || 1
  const cx = ORIGIN.x + (slot.x - ORIGIN.x) * 0.34 + side * 13
  const cy = ORIGIN.y - (ORIGIN.y - slot.y) * 0.46
  const reach = type === 'lavender' ? slot.scale * 26 : slot.scale * 7
  return `M ${ORIGIN.x} ${ORIGIN.y} Q ${cx} ${cy} ${slot.x} ${slot.y + reach}`
}

function stemMidpoint(slot: { x: number; y: number }) {
  const side = Math.sign(slot.x - ORIGIN.x) || 1
  const cx = ORIGIN.x + (slot.x - ORIGIN.x) * 0.34 + side * 13
  const cy = ORIGIN.y - (ORIGIN.y - slot.y) * 0.46
  const t = 0.56
  const mt = 1 - t
  return {
    x: mt * mt * ORIGIN.x + 2 * mt * t * cx + t * t * slot.x,
    y: mt * mt * ORIGIN.y + 2 * mt * t * cy + t * t * slot.y,
    side,
  }
}

export interface BouquetProps {
  flowers: AssignedFlower[]
  wrap: WrapStyle
  mode?: 'idle' | 'converge' | 'grow'
  className?: string
}

export function Bouquet({ flowers, wrap, mode = 'idle', className }: BouquetProps) {
  const growing = mode === 'grow'
  const converging = mode === 'converge'
  const greenery = greeneryFor(flowers.length)
  const wrapperDelay = growing ? Math.min(0.55 + flowers.length * 0.055, 1.35) : 0

  return (
    <motion.svg
      viewBox="0 0 320 400"
      className={`h-auto w-full overflow-visible ${className ?? ''}`}
      animate={converging ? { scale: 1.06, y: -8 } : { scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: '50% 92%' }}
        animate={{ rotate: [-0.35, 0.35, -0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <AnimatePresence>
          {flowers.map((f, i) => (
            <motion.path
              key={`${f.id}-stem`}
              d={stemPath(f.slot, f.type)}
              fill="none"
              stroke="var(--color-sagedeep)"
              strokeWidth={3.6}
              strokeLinecap="round"
              initial={growing ? { pathLength: 0, opacity: 0 } : false}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{
                pathLength: { duration: 0.6, delay: growing ? i * 0.055 : 0, ease: 'easeOut' },
                opacity: { duration: growing ? 0.15 : 0.25 },
              }}
            />
          ))}
        </AnimatePresence>

        {flowers.map((f, i) => {
          if (i % 3 !== 1 || i === 0) return null
          const mid = stemMidpoint(f.slot)
          const flip = mid.side <= 0
          return (
            <g key={`${f.id}-leaf`} transform={`translate(${mid.x} ${mid.y})`}>
              <motion.g
                style={{ transformBox: 'fill-box', transformOrigin: 'left center' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 15,
                  delay: growing ? i * 0.055 + 0.35 : 0.12,
                }}
              >
                <g transform={`rotate(${flip ? -30 : 150}) scale(0.32)`}>
                  <GreeneryArt kind="leaf" />
                </g>
              </motion.g>
            </g>
          )
        })}

        {greenery.map((g, i) => (
          <g key={`gr-${i}`} transform={`translate(${g.x} ${g.y}) rotate(${g.rot}) scale(${g.scale})`}>
            <motion.g
              style={{ transformBox: 'fill-box', transformOrigin: '20% 90%' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              transition={{
                type: 'spring',
                stiffness: 160,
                damping: 16,
                delay: growing ? 0.2 + i * 0.09 : i * 0.04,
              }}
            >
              <g transform="translate(-45 -45)">
                <GreeneryArt kind="eucalyptus" />
              </g>
            </motion.g>
          </g>
        ))}

        <AnimatePresence>
          {[...flowers]
            .sort((a, b) => a.slot.z - b.slot.z)
            .map((f) => {
              const size = BLOOM_SIZE[f.type] * f.slot.scale
              const k = size / 100
              const dx = converging ? (160 - f.slot.x) * 0.42 : 0
              const dy = converging ? (140 - f.slot.y) * 0.42 : 0
              return (
                <g key={f.id} transform={`translate(${f.slot.x} ${f.slot.y}) rotate(${f.slot.rot})`}>
                  <motion.g
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    initial={{ scale: 0, y: -12, opacity: 0 }}
                    animate={{ scale: 1, y: dy, x: dx, opacity: 1 }}
                    exit={{ scale: 0, y: 10, opacity: 0, transition: { duration: 0.22 } }}
                    transition={{
                      type: 'spring',
                      stiffness: 205,
                      damping: 16,
                      delay: growing ? f.slotIndex * 0.075 + 0.3 : (f.slotIndex % 4) * 0.03,
                    }}
                    whileHover={{ rotate: [0, -3, 3, 0], transition: { duration: 0.6 } }}
                  >
                    <g transform={`translate(-50 -46) scale(${k})`} className={(f.slotIndex % 3) === 1 ? '[filter:hue-rotate(-8deg)]' : (f.slotIndex % 3) === 2 ? '[filter:hue-rotate(9deg)_brightness(1.05)]' : undefined}>
                      <FlowerArt type={f.type} />
                    </g>
                  </motion.g>
                </g>
              )
            })}
        </AnimatePresence>

        <motion.g
          style={{ transformBox: 'fill-box', transformOrigin: '50% 20%' }}
          initial={growing ? { y: 30, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.75, delay: wrapperDelay, ease: [0.22, 1, 0.36, 1] }}
        >
          <Wrapper wrap={wrap} className="h-auto w-full" />
        </motion.g>
      </motion.g>
    </motion.svg>
  )
}

export function LiveBouquet(props: Omit<BouquetProps, 'flowers'> & { counts: Partial<Record<FlowerType, number>> }) {
  return <Bouquet {...props} flowers={arrangeFlowers(props.counts)} />
}
