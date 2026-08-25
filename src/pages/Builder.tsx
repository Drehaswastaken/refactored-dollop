import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FLOWER_TYPES,
  MAX_STEMS,
  MIN_STEMS,
  SLOTS,
  WRAP_STYLES,
  encodeBouquet,
  sequenceFromCounts,
  totalStems,
  type FlowerType,
  type WrapStyle,
  type BouquetData,
  type StemCounts,
} from '../lib/bouquet'
import { Bloom, FLOWER_LABELS } from '../components/flowers'
import { Bouquet } from '../components/Bouquet'
import { NoteCard } from '../components/NoteCard'
import { WRAP_DESCRIPTIONS, WrapSwatch } from '../components/Wrapper'
import { Button, SectionLabel, fieldClasses } from '../components/ui'
import { PetalBurst } from '../components/Petals'

const DEFAULT_STEMS = 2

export function Builder() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState<StemCounts>({ rose: 3, tulip: 3 })
  const [wrap, setWrap] = useState<WrapStyle>('classic')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [growing, setGrowing] = useState(false)

  const total = totalStems(counts)
  const selectedTypes = FLOWER_TYPES.filter((t) => (counts[t] ?? 0) > 0)
  const seq = useMemo(() => sequenceFromCounts(counts), [counts])
  const canGrow = total >= MIN_STEMS && !growing
  const atMax = total >= MAX_STEMS

  const toggleFlower = (t: FlowerType) => {
    if (growing) return
    setCounts((prev) => {
      const next = { ...prev }
      if ((next[t] ?? 0) > 0) {
        delete next[t]
      } else {
        if (total >= MAX_STEMS) return prev
        next[t] = Math.min(DEFAULT_STEMS, MAX_STEMS - total)
      }
      return next
    })
  }

  const bump = (t: FlowerType, delta: 1 | -1) => {
    if (growing) return
    setCounts((prev) => {
      const next = { ...prev }
      const cur = next[t] ?? 0
      const value = cur + delta
      if (value <= 0) {
        delete next[t]
        return next
      }
      if (value > MAX_STEMS - (total - cur)) return prev
      next[t] = value
      return next
    })
  }

  const create = () => {
    if (!canGrow || !seq.length) return
    setGrowing(true)
    const data: BouquetData = {
      v: 1,
      n: name.trim().slice(0, 60),
      m: message.trim().slice(0, 400),
      w: Math.max(0, WRAP_STYLES.indexOf(wrap)),
      f: seq,
    }
    window.setTimeout(() => {
      navigate(`/created?s=${encodeBouquet(data)}`)
    }, 1600)
  }

  return (
    <div className="min-h-screen px-5 pb-28 pt-6 sm:px-8">
      <AnimatePresence>{growing && <PetalBurst />}</AnimatePresence>

      <div className="mx-auto max-w-6xl">
        <Link to="/" className="text-sm text-inksoft transition-colors hover:text-accent">
          &larr; Back
        </Link>

        <h1 className="mt-10 font-serif text-4xl leading-tight sm:text-5xl">
          Create <em className="text-accentdeep">your</em> bouquet.
        </h1>
        <p className="mt-3 text-sm text-inksoft">
          Pick the flowers. Write the note. Send a little love.
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_minmax(360px,44%)] lg:gap-16">
          <div className="order-last space-y-9 lg:order-first">
            <section>
              <SectionLabel>Choose your flowers</SectionLabel>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {FLOWER_TYPES.map((t) => {
                  const active = (counts[t] ?? 0) > 0
                  return (
                    <motion.button
                      key={t}
                      onClick={() => toggleFlower(t)}
                      whileTap={{ scale: 0.94 }}
                      className={`flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 transition-all duration-300 ${
                        active
                          ? 'border-accent/70 bg-accentsoft shadow-sm'
                          : 'border-line bg-card/60 hover:border-accent/40 hover:-translate-y-px'
                      }`}
                      aria-pressed={active}
                    >
                      <motion.span
                        animate={active ? { scale: 1.06, rotate: [-2, 2, -2] } : { scale: 1 }}
                        className="origin-bottom"
                        transition={active ? { repeat: Infinity, duration: 5, ease: 'easeInOut' } : undefined}
                      >
                        <Bloom type={t} size={42} />
                      </motion.span>
                      <span className={`text-[11px] ${active ? 'text-accentdeep' : 'text-inksoft'}`}>
                        {FLOWER_LABELS[t]}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-4 space-y-2">
                <AnimatePresence initial={false}>
                  {selectedTypes.map((t) => (
                    <motion.div
                      key={t}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 rounded-xl border border-line bg-card/70 px-3 py-2"
                    >
                      <Bloom type={t} size={30} />
                      <span className="text-sm">{FLOWER_LABELS[t]}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => bump(t, -1)}
                          aria-label={`Remove one ${FLOWER_LABELS[t]}`}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-line text-inksoft transition-all hover:border-accent/50 hover:text-accentdeep"
                        >
                          &minus;
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{counts[t]}</span>
                        <button
                          onClick={() => bump(t, 1)}
                          disabled={atMax}
                          aria-label={`Add one ${FLOWER_LABELS[t]}`}
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-line text-inksoft transition-all hover:border-accent/50 hover:text-accentdeep disabled:pointer-events-none disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <p className={`mt-3 text-xs ${total >= MIN_STEMS ? 'text-inksoft' : 'text-accentdeep'}`}>
                {atMax
                  ? 'A full bouquet — 15 stems.'
                  : total >= MIN_STEMS
                    ? `${total} stems, hand-arranged.`
                    : `Add ${MIN_STEMS - total} more stem${MIN_STEMS - total === 1 ? '' : 's'} to start arranging (${total}/${MIN_STEMS}).`}
              </p>
            </section>

            <section>
              <SectionLabel>The wrapping</SectionLabel>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {WRAP_STYLES.map((w) => (
                  <motion.button
                    key={w}
                    onClick={() => !growing && setWrap(w)}
                    whileTap={{ scale: 0.96 }}
                    className={`rounded-2xl border p-2.5 text-left transition-all duration-300 ${
                      wrap === w
                        ? 'border-accent/70 bg-accentsoft shadow-sm'
                        : 'border-line bg-card/60 hover:-translate-y-px hover:border-accent/40'
                    }`}
                  >
                    <div className="h-16">
                      <WrapSwatch wrap={w} selected={wrap === w} />
                    </div>
                    <p className={`mt-1 text-xs capitalize ${wrap === w ? 'text-accentdeep' : 'text-ink'}`}>{w}</p>
                    <p className="text-[10px] leading-tight text-inksoft">{WRAP_DESCRIPTIONS[w]}</p>
                  </motion.button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <SectionLabel>For whom</SectionLabel>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Their name (optional)"
                  maxLength={60}
                  className={`${fieldClasses} mt-3`}
                  disabled={growing}
                />
              </div>
              <div>
                <SectionLabel>Your note</SectionLabel>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something sweet…"
                  rows={3}
                  maxLength={400}
                  className={`${fieldClasses} mt-3 font-hand text-xl leading-snug`}
                  disabled={growing}
                />
              </div>
            </section>

            <div className="hidden lg:block">
              <Button onClick={create} disabled={!canGrow} className="min-w-56">
                {growing ? (
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    Growing your bouquet…
                  </motion.span>
                ) : total < MIN_STEMS ? (
                  `Pick at least ${MIN_STEMS} stems`
                ) : (
                  'Create My Bouquet'
                )}
              </Button>
            </div>
          </div>

          <div className="order-first lg:order-last lg:sticky lg:top-20 lg:self-start">
            <div className="mx-auto max-w-md">
              <Bouquet flowers={seq.map((typeIndex, i) => ({
                id: `s${i}-${typeIndex}`,
                type: FLOWER_TYPES[typeIndex],
                slotIndex: i,
                slot: SLOTS[i],
              }))} wrap={wrap} mode={growing ? 'converge' : 'idle'} />
              <div className="mt-6 flex justify-center">
                <NoteCard message={message} signature={name || undefined} preview />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-canvas/85 px-5 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <span className="font-hand text-lg text-inksoft">{total}</span>
          <Button onClick={create} disabled={!canGrow} className="flex-1">
            {growing ? 'Growing your bouquet…' : total < MIN_STEMS ? `Pick ${MIN_STEMS - total} more` : 'Create My Bouquet'}
          </Button>
        </div>
      </div>
    </div>
  )
}
