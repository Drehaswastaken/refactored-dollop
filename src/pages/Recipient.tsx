import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { decodeBouquet, flowersFromSequence, wrapStyleFor } from '../lib/bouquet'
import { Bloom } from '../components/flowers'
import { Bouquet } from '../components/Bouquet'
import { NoteCard } from '../components/NoteCard'
import { Button } from '../components/ui'

export function Recipient() {
  const { data: encoded } = useParams()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'sealed' | 'growing' | 'revealed'>('sealed')

  const data = useMemo(() => decodeBouquet(encoded ?? ''), [encoded])
  const flowers = useMemo(() => (data ? flowersFromSequence(data.f) : []), [data])

  if (!data) return <Wilted />

  const open = () => {
    setPhase('growing')
    window.setTimeout(() => setPhase('revealed'), 2500)
  }

  const name = data.n.trim()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12 text-center">
      <AnimatePresence mode="wait">
        {phase === 'sealed' && (
          <motion.div
            key="sealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1 } }}
            exit={{ opacity: 0, y: -18, transition: { duration: 0.6 } }}
            className="flex flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 1 } }}
              className="font-serif text-2xl italic leading-snug sm:text-3xl"
            >
              Someone has a little something
              <br />
              for you&hellip;
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="mt-10"
            >
              <Button variant="ghost" onClick={open} className="animate-breathe">
                Open it&nbsp;&hearts;
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase !== 'sealed' && (
          <motion.div
            key="bouquet"
            className="flex w-full flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
          >
            <AnimatePresence>
              {phase === 'revealed' && (
                <motion.h1
                  key="name"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-2 font-serif text-3xl leading-tight sm:text-4xl"
                >
                  For <em className="text-accentdeep">{name || 'you'}</em>
                </motion.h1>
              )}
            </AnimatePresence>

            <div className="w-full max-w-sm">
              <Bouquet flowers={flowers} wrap={wrapStyleFor(data.w)} mode="grow" />
            </div>

            <AnimatePresence>
              {phase === 'revealed' && (
                <>
                  <motion.div
                    key="note"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-4 flex w-full justify-center px-2"
                  >
                    <NoteCard message={data.m} preview={!data.m.trim()} />
                  </motion.div>
                  <motion.div
                    key="footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.9 }}
                    className="mt-8 flex flex-col items-center gap-4"
                  >
                    <Bloom type="tulip" size={26} className="rotate-6" />
                    <Button variant="ghost" onClick={() => navigate('/create')}>
                      Send one back
                    </Button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'sealed' && (
        <Link to="/" className="absolute bottom-6 right-6 text-xs text-inksoft/60 transition-colors hover:text-accent">
          what is this?
        </Link>
      )}
    </div>
  )
}

function Wilted() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <Bloom type="tulip" size={42} className="opacity-70 [filter:grayscale(0.55)_sepia(0.15)]" />
        <p className="mt-5 font-serif text-2xl italic leading-snug">
          This bouquet seems to have wilted on its way here&hellip;
        </p>
        <p className="mt-2 text-sm text-inksoft">The link may be incomplete.</p>
        <Link to="/create" className="mt-8">
          <Button variant="ghost">Grow one instead</Button>
        </Link>
      </motion.div>
    </div>
  )
}
