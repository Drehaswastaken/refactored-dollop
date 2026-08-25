export const FLOWER_TYPES = [
  'rose',
  'tulip',
  'daisy',
  'peony',
  'lavender',
  'ranunculus',
  'sunflower',
] as const

export type FlowerType = (typeof FLOWER_TYPES)[number]

export const WRAP_STYLES = ['classic', 'romantic', 'wildflower', 'elegant'] as const
export type WrapStyle = (typeof WRAP_STYLES)[number]

export const MIN_STEMS = 6

export type StemCounts = Partial<Record<FlowerType, number>>

export interface BouquetData {
  v: 1
  n: string
  m: string
  w: number
  f: number[]
}

export interface Slot {
  x: number
  y: number
  rot: number
  scale: number
  z: number
}

export const SLOTS: Slot[] = [
  { x: 160, y: 118, rot: 0, scale: 1, z: 50 },
  { x: 128, y: 150, rot: -12, scale: 0.95, z: 45 },
  { x: 192, y: 150, rot: 12, scale: 0.95, z: 45 },
  { x: 112, y: 182, rot: -20, scale: 0.9, z: 40 },
  { x: 208, y: 182, rot: 20, scale: 0.9, z: 40 },
  { x: 142, y: 88, rot: -6, scale: 0.95, z: 55 },
  { x: 178, y: 88, rot: 6, scale: 0.95, z: 55 },
  { x: 96, y: 206, rot: -30, scale: 0.82, z: 30 },
  { x: 224, y: 206, rot: 30, scale: 0.82, z: 30 },
  { x: 126, y: 64, rot: -10, scale: 0.9, z: 60 },
  { x: 194, y: 64, rot: 10, scale: 0.9, z: 60 },
  { x: 76, y: 236, rot: -42, scale: 0.75, z: 20 },
  { x: 244, y: 236, rot: 42, scale: 0.75, z: 20 },
  { x: 160, y: 46, rot: 2, scale: 0.88, z: 65 },
  { x: 104, y: 120, rot: -16, scale: 0.78, z: 48 },
]

export const MAX_STEMS = SLOTS.length

export interface GreenerySlot {
  x: number
  y: number
  rot: number
  scale: number
}

export const GREENERY_SLOTS: GreenerySlot[] = [
  { x: 72, y: 198, rot: -36, scale: 0.95 },
  { x: 248, y: 198, rot: 36, scale: 0.95 },
  { x: 88, y: 108, rot: -24, scale: 0.85 },
  { x: 232, y: 108, rot: 24, scale: 0.85 },
  { x: 60, y: 254, rot: -54, scale: 0.8 },
  { x: 260, y: 254, rot: 54, scale: 0.8 },
]

export interface AssignedFlower {
  id: string
  type: FlowerType
  slotIndex: number
  slot: Slot
}

export function sequenceFromCounts(counts: StemCounts): number[] {
  const entries = FLOWER_TYPES.filter((t) => (counts[t] ?? 0) > 0).map((t) => ({
    t,
    remaining: Math.min(counts[t] ?? 0, MAX_STEMS),
  }))
  const seq: number[] = []
  while (seq.length < MAX_STEMS && entries.some((e) => e.remaining > 0)) {
    for (const e of entries) {
      if (seq.length >= MAX_STEMS) break
      if (e.remaining <= 0) continue
      seq.push(FLOWER_TYPES.indexOf(e.t))
      e.remaining -= 1
    }
  }
  return seq
}

export function totalStems(counts: StemCounts): number {
  return FLOWER_TYPES.reduce((sum, t) => sum + (counts[t] ?? 0), 0)
}

export function arrangeFlowers(counts: StemCounts): AssignedFlower[] {
  return flowersFromSequence(sequenceFromCounts(counts))
}

export function flowersFromSequence(seq: number[]): AssignedFlower[] {
  return seq.slice(0, SLOTS.length).map((typeIndex, i) => ({
    id: `s${i}-${FLOWER_TYPES[typeIndex] ?? 'x'}`,
    type: FLOWER_TYPES[typeIndex] ?? 'rose',
    slotIndex: i,
    slot: SLOTS[i],
  }))
}

export function isValidSequence(seq: number[]): boolean {
  return (
    Array.isArray(seq) &&
    seq.length > 0 &&
    seq.length <= SLOTS.length &&
    seq.every((t) => Number.isInteger(t) && t >= 0 && t < FLOWER_TYPES.length)
  )
}

export function greeneryFor(count: number): GreenerySlot[] {
  const n = Math.min(GREENERY_SLOTS.length, 2 + Math.floor(count / 4))
  return GREENERY_SLOTS.slice(0, n)
}

const FORMAT_BINARY = 2
const STEMS_BITS = 3
const STEMS_MASK = (1 << STEMS_BITS) - 1

export function encodeBouquet(b: BouquetData): string {
  const seq = b.f.slice(0, MAX_STEMS)
  const name = new TextEncoder().encode(b.n.slice(0, 60))
  const msg = new TextEncoder().encode(b.m.slice(0, 400))
  const stemBytes = Math.ceil((seq.length * STEMS_BITS) / 8)

  const out = new Uint8Array(4 + name.length + 2 + msg.length + stemBytes)
  let o = 0
  out[o++] = FORMAT_BINARY
  out[o++] = b.w
  out[o++] = seq.length
  out[o++] = name.length
  out.set(name, o)
  o += name.length
  out[o++] = (msg.length >> 8) & 255
  out[o++] = msg.length & 255
  out.set(msg, o)
  o += msg.length

  let acc = 0
  let bits = 0
  for (const t of seq) {
    acc = (acc << STEMS_BITS) | t
    bits += STEMS_BITS
    if (bits >= 8) {
      bits -= 8
      out[o++] = (acc >> bits) & 255
    }
  }
  if (bits > 0) out[o] = (acc << (8 - bits)) & 255

  let bin = ''
  out.forEach((byte) => {
    bin += String.fromCharCode(byte)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBinary(bytes: Uint8Array): BouquetData | null {
  try {
    if (bytes[0] !== FORMAT_BINARY || bytes.length < 6) return null
    const w = bytes[1]
    if (w < 0 || w >= WRAP_STYLES.length) return null
    const count = bytes[2]
    if (count < 1 || count > MAX_STEMS) return null
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

    const nameLen = bytes[3]
    let o = 4
    if (o + nameLen + 2 > bytes.length) return null
    const n = new TextDecoder().decode(bytes.subarray(o, o + nameLen))
    o += nameLen

    const msgLen = view.getUint16(o)
    o += 2
    if (o + msgLen > bytes.length) return null
    const m = new TextDecoder().decode(bytes.subarray(o, o + msgLen))
    o += msgLen

    const f: number[] = []
    let acc = 0
    let bits = 0
    for (let i = o; i < bytes.length && f.length < count; i++) {
      acc = (acc << 8) | bytes[i]
      bits += 8
      while (bits >= STEMS_BITS && f.length < count) {
        bits -= STEMS_BITS
        f.push((acc >> bits) & STEMS_MASK)
      }
    }
    if (!isValidSequence(f)) return null
    return { v: 1, n, m, w, f }
  } catch {
    return null
  }
}

function decodeLegacy(bytes: Uint8Array): BouquetData | null {
  try {
    const data = JSON.parse(new TextDecoder().decode(bytes)) as BouquetData
    if (data.v !== 1 || typeof data.w !== 'number' || !isValidSequence(data.f)) return null
    return data
  } catch {
    return null
  }
}

export function decodeBouquet(s: string): BouquetData | null {
  try {
    let b64 = s.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    if (bytes.length === 0) return null
    return bytes[0] === FORMAT_BINARY ? decodeBinary(bytes) : decodeLegacy(bytes)
  } catch {
    return null
  }
}

export function bouquetUrl(data: BouquetData): string {
  return `${location.origin}${location.pathname}#/b/${encodeBouquet(data)}`
}

export function wrapStyleFor(w: number): WrapStyle {
  return WRAP_STYLES[w] ?? 'classic'
}
