import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bloom } from '../components/flowers'
import { Button } from '../components/ui'

const EDGE_FLOWERS: {
  type: Parameters<typeof Bloom>[0]['type']
  className: string
  size: number
  delay?: number
}[] = [
  { type: 'rose', className: '-bottom-10 -left-12 rotate-[24deg]', size: 190 },
  { type: 'sunflower', className: '-right-14 top-16 -rotate-[18deg] blur-[1.5px] opacity-80', size: 170, delay: -2 },
  { type: 'tulip', className: '-left-8 top-1/4 -rotate-[32deg] opacity-90', size: 120, delay: -4 },
  { type: 'peony', className: 'bottom-1/4 -right-9 rotate-[30deg] blur-[0.5px] opacity-85', size: 130, delay: -5 },
  { type: 'daisy', className: 'left-[16%] -top-7 rotate-[14deg] opacity-70 blur-[1px]', size: 95, delay: -3 },
  { type: 'lavender', className: 'right-[20%] bottom-10 rotate-[-12deg] opacity-75', size: 110, delay: -6 },
]

export function Landing() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {EDGE_FLOWERS.map((f, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute z-0 animate-sway ${f.className}`}
          style={{ animationDelay: `${f.delay ?? -i}s` }}
          aria-hidden
        >
          <Bloom type={f.type} size={f.size} variant={i % 3} />
        </div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-w-2xl flex-col items-center text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-[11px] font-medium uppercase tracking-[0.34em] text-inksoft"
        >
          DigiBouquet
        </motion.p>

        <h1 className="mt-6 text-balance font-serif text-5xl leading-[1.08] sm:text-7xl">
          Flowers,
          <br />
          <em className="italic text-accentdeep">but make them digital.</em>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.9 }}
          className="mt-6 max-w-md text-sm leading-relaxed tracking-wide text-inksoft sm:text-base"
        >
          Pick the flowers. Write the note.
          <br />
          Send a little love.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.9 }}
          className="mt-11 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link to="/create">
            <Button className="px-9 py-3.5">Create a Bouquet</Button>
          </Link>
          <Link to="/open">
            <Button variant="ghost" className="px-8 py-3.5">
              I have a Bouquet
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1.2 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="h-9 w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
      </motion.div>
    </div>
  )
}
