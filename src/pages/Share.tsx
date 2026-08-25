import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { bouquetUrl, decodeBouquet, flowersFromSequence, wrapStyleFor } from '../lib/bouquet'
import { Bloom } from '../components/flowers'
import { Bouquet } from '../components/Bouquet'
import { NoteCard } from '../components/NoteCard'
import { Button } from '../components/ui'

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

export function Share() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const data = useMemo(() => decodeBouquet(params.get('s') ?? ''), [params])

  const url = useMemo(() => (data ? bouquetUrl(data) : ''), [data])
  const flowers = useMemo(() => (data ? flowersFromSequence(data.f) : []), [data])

  if (!data) return <Navigate to="/create" replace />

  const copy = async () => {
    if (await copyText(url)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'A little something for you', url })
        return
      } catch {
        /* dismissed */
      }
    }
    void copy()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-screen flex-col items-center justify-center px-5 py-14 text-center"
    >
      <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
        It&rsquo;s ready.{' '}
        <span className="ml-1 inline-block align-[-8px]">
          <Bloom type="tulip" size={38} />
        </span>
      </h1>
      <p className="mt-3 text-sm text-inksoft">Now send it to someone special.</p>

      <div className="mt-8 w-full max-w-sm">
        <Bouquet flowers={flowers} wrap={wrapStyleFor(data.w)} />
      </div>

      {(data.m.trim() || data.n.trim()) && (
        <div className="mt-4 flex w-full justify-center">
          <NoteCard message={data.m} />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-8 w-full max-w-md rounded-2xl border border-line/80 bg-card p-5 shadow-card"
      >
        <p className="text-left text-[11px] font-medium uppercase tracking-[0.22em] text-inksoft">
          Their bouquet link
        </p>
        <button
          onClick={() => void copy()}
          className="group mt-2 flex w-full items-center gap-2 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-left transition-colors hover:border-accent/50"
          title="Copy to clipboard"
        >
          <span className="truncate font-mono text-xs text-inksoft group-hover:text-ink">{url}</span>
          <span className={`ml-auto shrink-0 text-xs ${copied ? 'text-sage' : 'text-accent'}`}>
            {copied ? 'Copied ♡' : 'Copy'}
          </span>
        </button>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <Button onClick={() => void copy()} className="flex-1">
            {copied ? 'Copied ♡' : 'Copy Bouquet Link'}
          </Button>
          <Button variant="ghost" onClick={() => void share()} className="flex-1">
            Share
          </Button>
        </div>

        <div className="my-4 h-px bg-line-soft" />
        <button
          onClick={() => navigate('/create')}
          className="w-full cursor-pointer text-center text-sm text-inksoft transition-colors hover:text-accentdeep"
        >
          Create Another Bouquet
        </button>
      </motion.div>

      <p className="mt-5 max-w-xs text-xs leading-relaxed text-inksoft/80">
        Anyone with this link can open their bouquet — no account, no app, nothing to install.
      </p>
    </motion.div>
  )
}
