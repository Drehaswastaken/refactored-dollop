import { motion } from 'framer-motion'
import { Bloom } from './flowers'

export function NoteCard({
  message,
  signature,
  preview = false,
}: {
  message: string
  signature?: string
  preview?: boolean
}) {
  const shown =
    message.trim() ||
    (preview ? 'For you, because you deserve flowers even on ordinary days.' : '')
  return (
    <motion.div
      whileHover={{ rotate: -0.3, y: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="relative w-full max-w-sm -rotate-[1.4deg] rounded-xl border border-line/80 bg-card px-7 py-6 shadow-card transition-colors duration-700"
    >
      <div className="paper-grain pointer-events-none absolute inset-0 rounded-xl opacity-[0.06] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen" />
      <div className="absolute -right-3 -top-4 rotate-12 opacity-95">
        <Bloom type="rose" size={34} variant={2} />
      </div>
      <div className="absolute bottom-3 left-4 h-px w-10 bg-line" />
      <p className="font-hand text-2xl leading-snug text-ink/85">
        {shown || '…'}
        {signature && <span className="mt-2 block text-right text-xl text-inksoft">— {signature}</span>}
      </p>
    </motion.div>
  )
}
