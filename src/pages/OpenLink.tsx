import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function OpenLink() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const open = (e: FormEvent) => {
    e.preventDefault()
    const match = value.match(/#\/b\/([A-Za-z0-9\-_]+)/)
    if (match) {
      navigate(`/b/${match[1]}`)
    } else if (/^[A-Za-z0-9\-_]+$/.test(value.trim())) {
      navigate(`/b/${value.trim()}`)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <form onSubmit={open} className="w-full max-w-md">
        <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
          Have a bouquet link?
        </h1>
        <p className="mt-3 text-sm text-inksoft">Paste it below and see what&rsquo;s waiting for you.</p>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="https://… or paste the code"
          autoFocus
          className={`mt-7 w-full rounded-xl border bg-card px-4 py-3 text-sm text-ink placeholder:text-inksoft/60 transition-colors focus:outline-none ${
            error ? 'border-accentdeep' : 'border-line focus:border-accent/60'
          }`}
        />
        {error && <p className="mt-2 text-left text-xs text-accentdeep">That doesn&rsquo;t look like a bouquet link yet.</p>}
        <button
          type="submit"
          className="mt-4 w-full cursor-pointer rounded-full bg-accent px-7 py-3 text-sm font-medium tracking-wide text-white shadow-petal transition-all duration-300 hover:-translate-y-px hover:bg-accentdeep"
        >
          Open my bouquet
        </button>
        <Link to="/" className="mt-6 inline-block text-sm text-inksoft transition-colors hover:text-accent">
          &larr; Back to the garden
        </Link>
      </form>
    </div>
  )
}
