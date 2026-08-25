import { useId, type JSX } from 'react'
import type { FlowerType } from '../../lib/bouquet'

export const FLOWER_LABELS: Record<FlowerType, string> = {
  rose: 'Rose',
  tulip: 'Tulip',
  daisy: 'Daisy',
  peony: 'Peony',
  lavender: 'Lavender',
  ranunculus: 'Ranunculus',
  sunflower: 'Sunflower',
}

interface ArtProps {
  id: string
}

function RoseArt({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-o`} cx="42%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#EBA7AE" />
          <stop offset="100%" stopColor="#C86B78" />
        </radialGradient>
        <radialGradient id={`${id}-i`} cx="45%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#D97F8B" />
          <stop offset="100%" stopColor="#A94E5D" />
        </radialGradient>
      </defs>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx="50" cy="26" rx="16" ry="21" fill={`url(#${id}-o)`} transform={`rotate(${i * 72} 50 46)`} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <ellipse key={i} cx="50" cy="34" rx="12" ry="16" fill={`url(#${id}-i)`} transform={`rotate(${36 + i * 90} 50 46)`} />
      ))}
      <circle cx="50" cy="46" r="12" fill="#8E3F50" />
      <path
        d="M50 46 c7 -3 9 -11 3 -15 c-7 -5 -17 0 -16 8 c1 11 13 15 21 9"
        fill="none"
        stroke="#F3C9CD"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </>
  )
}

function TulipArt({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EF9AA6" />
          <stop offset="100%" stopColor="#D06B79" />
        </linearGradient>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2808E" />
          <stop offset="100%" stopColor="#C05D6E" />
        </linearGradient>
      </defs>
      <path d="M50 12 C30 17 24 45 31 65 C35 72 41 75 50 75 C59 75 65 72 69 65 C76 45 70 17 50 12 Z" fill={`url(#${id}-b)`} />
      <path d="M49 20 C39 24 33 43 36.5 60 C38.5 68 43 72 48.5 73.5 L49 20 Z" fill={`url(#${id}-f)`} />
      <path d="M51 20 C61 24 67 43 63.5 60 C61.5 68 57 72 51.5 73.5 L51 20 Z" fill={`url(#${id}-f)`} />
      <path d="M43 26 C40 36 39.5 50 41.5 60" fill="none" stroke="#F3B9C1" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
    </>
  )
}

function DaisyArt({ id }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-c`} cx="42%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#F2CD6A" />
          <stop offset="100%" stopColor="#DDA53A" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse
          key={i}
          cx="50"
          cy="22.5"
          rx="7.5"
          ry="17.5"
          fill="#FEFCF6"
          stroke="#EBDFCB"
          strokeWidth="1"
          transform={`rotate(${i * 30} 50 47)`}
        />
      ))}
      <circle cx="50" cy="47" r="12.5" fill={`url(#${id}-c)`} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return <circle key={i} cx={50 + Math.cos(a) * 7} cy={47 + Math.sin(a) * 7} r="1.5" fill="#C08A2C" />
      })}
      <circle cx="50" cy="47" r="3.4" fill="#B77F26" />
    </>
  )
}

function PeonyArt({ id }: ArtProps) {
  const ring = (n: number, radius: number, r: number, fill: string) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      return <circle key={`${fill}-${i}`} cx={50 + Math.cos(a) * radius} cy={46 + Math.sin(a) * radius} r={r} fill={fill} opacity={0.95} />
    })
  return (
    <>
      <defs>
        <radialGradient id={`${id}-g`} cx="40%" cy="36%" r="80%">
          <stop offset="0%" stopColor="#F6C6CE" />
          <stop offset="100%" stopColor="#E39AA7" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="46" r="34" fill={`url(#${id}-g)`} />
      {ring(8, 22, 13, '#F0AEBB')}
      {ring(7, 13, 11, '#E795A5')}
      {ring(5, 6, 9, '#DD8294')}
      {[
        [45, 43],
        [54, 44],
        [49, 51],
        [56, 50],
        [43, 50],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.4" fill="#C05D70" />
      ))}
    </>
  )
}

function LavenderArt(_: ArtProps) {
  const buds: [number, number, number][] = [
    [50, 13, 5.5],
    [44, 24, 5],
    [56, 26, 5],
    [43, 36, 5],
    [57, 38, 5],
    [44, 48, 4.6],
    [56, 50, 4.6],
    [46, 59, 4.4],
    [54, 61, 4.4],
  ]
  return (
    <>
      <path d="M50 16 L50 92" stroke="#7C9080" strokeWidth="2.6" strokeLinecap="round" />
      {buds.map(([cx, cy, r], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={r * 0.78}
          ry={r}
          fill={i % 2 ? '#967AB5' : '#A98BC4'}
          transform={`rotate(${cx < 50 ? -16 : 16} ${cx} ${cy})`}
        />
      ))}
    </>
  )
}

function RanunculusArt(_: ArtProps) {
  const ring = (n: number, radius: number, rx: number, ry: number, offsetDeg: number, fill: string) =>
    Array.from({ length: n }, (_, i) => {
      const deg = offsetDeg + (i / n) * 360
      const a = ((deg - 90) * Math.PI) / 180
      const cx = 46 + Math.cos(a) * radius
      const cy = 44 + Math.sin(a) * radius
      return (
        <ellipse key={`${fill}-${i}`} cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} transform={`rotate(${deg} ${cx} ${cy})`} />
      )
    })
  return (
    <>
      {ring(8, 22, 10.5, 13.5, 0, '#F2ABB6')}
      {ring(8, 14, 8.5, 11, 22.5, '#E995A3')}
      {ring(6, 7, 6.5, 8.5, 10, '#DF7F90')}
      <circle cx="46" cy="44" r="7.5" fill="#D26B7D" />
      <path
        d="M46 44 c4 -1.5 5 -6 1.5 -8 c-4 -2 -9 1 -8 5 c1 5 7 7 11 4"
        fill="none"
        stroke="#F6CBD3"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  )
}

function SunflowerArt({ id }: ArtProps) {
  const petal = 'M50 6 L56.5 26.5 C56.5 32 43.5 32 43.5 26.5 Z'
  return (
    <>
      <defs>
        <linearGradient id={`${id}-p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5CA5C" />
          <stop offset="100%" stopColor="#EBA32C" />
        </linearGradient>
        <radialGradient id={`${id}-c`} cx="40%" cy="36%" r="80%">
          <stop offset="0%" stopColor="#6B4F30" />
          <stop offset="100%" stopColor="#4A3520" />
        </radialGradient>
      </defs>
      {Array.from({ length: 14 }, (_, i) => (
        <path key={`b${i}`} d={petal} fill="#D8931F" transform={`translate(3.2 3.2) rotate(${i * (360 / 14)} 50 46)`} />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <path key={`f${i}`} d={petal} fill={`url(#${id}-p)`} transform={`rotate(${i * (360 / 14) + 12.85} 50 46)`} />
      ))}
      <circle cx="50" cy="46" r="14.5" fill={`url(#${id}-c)`} />
      {[3.5, 6.5, 9.5].map((r, ri) =>
        Array.from({ length: 6 + ri * 4 }, (_, i) => {
          const a = (i / (6 + ri * 4)) * Math.PI * 2 + ri
          return (
            <circle
              key={`${ri}-${i}`}
              cx={50 + Math.cos(a) * r}
              cy={46 + Math.sin(a) * r}
              r="1.25"
              fill={ri === 1 ? '#6D5335' : '#38281A'}
            />
          )
        }),
      )}
      <path d="M39.5 39 A12 12 0 0 1 50 34.5" fill="none" stroke="#8A6A3F" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </>
  )
}

const ART: Record<FlowerType, (p: ArtProps) => JSX.Element> = {
  rose: RoseArt,
  tulip: TulipArt,
  daisy: DaisyArt,
  peony: PeonyArt,
  lavender: LavenderArt,
  ranunculus: RanunculusArt,
  sunflower: SunflowerArt,
}

export function FlowerArt({ type }: { type: FlowerType }) {
  const id = useId()
  const Component = ART[type]
  return <Component id={id} />
}

const VARIANT_FILTER = [
  '',
  '[filter:hue-rotate(-8deg)]',
  '[filter:hue-rotate(9deg)_brightness(1.05)]',
] as const

export function Bloom({
  type,
  size = 60,
  variant = 0,
  className,
}: {
  type: FlowerType
  size?: number
  variant?: number
  className?: string
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <g className={VARIANT_FILTER[variant % 3]}>
        <FlowerArt type={type} />
      </g>
    </svg>
  )
}

function EucalyptusArt({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A9BCA4" />
          <stop offset="100%" stopColor="#7E947E" />
        </linearGradient>
      </defs>
      <path d="M80 96 C62 72 48 44 42 8" fill="none" stroke="#87A087" strokeWidth="2.6" strokeLinecap="round" />
      {(
        [
          [64, 74, 8.5],
          [52, 58, 7.5],
          [46.5, 43, 6.8],
          [43.5, 29, 6],
          [42, 16, 5],
        ] as const
      ).map(([cx, cy, r], i) => (
        <circle key={i} cx={cx + (i % 2 ? 3.5 : -3)} cy={cy} r={r} fill={`url(#${id}-l)`} opacity="0.95" />
      ))}
    </>
  )
}

function LeafArt({ id }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-lf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8FA489" />
          <stop offset="100%" stopColor="#5F775E" />
        </linearGradient>
      </defs>
      <path d="M8 84 C18 52 44 26 88 16 C82 56 52 82 8 84 Z" fill={`url(#${id}-lf)`} />
      <path d="M14 80 C34 62 56 42 82 22" fill="none" stroke="#4C634D" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </>
  )
}

export function GreeneryArt({ kind }: { kind: 'eucalyptus' | 'leaf' }) {
  const id = useId()
  return kind === 'eucalyptus' ? <EucalyptusArt id={id} /> : <LeafArt id={id} />
}
