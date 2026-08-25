export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-canvas transition-colors duration-700" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% -10%, var(--color-canvas-deep) 0%, transparent 55%), radial-gradient(80% 60% at 85% 110%, var(--color-accentsoft) 0%, transparent 60%)',
          opacity: 0.55,
        }}
      />

      <svg
        viewBox="0 0 400 700"
        className="text-sage absolute -bottom-10 -left-14 w-[46vmin] max-w-[420px] opacity-[0.09] dark:opacity-[0.06] animate-breathe"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M60 700 C70 520 60 380 110 210 C130 145 170 95 235 70" />
        <path d="M92 480 C60 470 40 444 44 410 C76 418 94 444 92 480 Z" />
        <path d="M84 330 C116 322 136 296 134 262 C102 270 82 296 84 330 Z" />
        <path d="M124 208 C154 200 172 176 172 146 C142 154 122 178 124 208 Z" />
        <circle cx="245" cy="62" r="26" />
        <circle cx="245" cy="62" r="13" />
        <path d="M245 36 C245 20 258 10 274 12 C274 30 262 38 245 36 Z" />
      </svg>

      <svg
        viewBox="0 0 400 700"
        className="text-sage absolute -top-16 -right-16 w-[42vmin] max-w-[380px] rotate-180 opacity-[0.08] dark:opacity-[0.05] animate-breathe [animation-delay:-4s]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M40 700 C56 540 52 400 108 240 C132 168 178 108 250 84" />
        <path d="M74 500 C44 488 28 460 34 428 C64 438 80 464 74 500 Z" />
        <path d="M70 350 C102 340 120 314 118 282 C88 290 68 318 70 350 Z" />
        <circle cx="260" cy="76" r="30" />
        <circle cx="260" cy="76" r="15" />
      </svg>

      <div className="paper-grain absolute inset-0 opacity-[0.05] mix-blend-multiply dark:opacity-[0.035] dark:mix-blend-screen" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(140% 100% at 50% 40%, transparent 60%, rgb(0 0 0 / 0.05) 100%)' }}
      />
    </div>
  )
}
