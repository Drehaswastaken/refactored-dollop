import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'soft'

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-accent px-7 py-3 text-white shadow-petal hover:bg-accentdeep',
  ghost:
    'border border-line bg-card/70 px-7 py-3 text-ink backdrop-blur hover:border-accent/60 hover:text-accentdeep dark:hover:text-accentdeep',
  soft: 'bg-accentsoft px-6 py-2.5 text-accentdeep hover:bg-blush dark:text-accentdeep',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-inksoft">{children}</p>
}

export const fieldClasses =
  'w-full rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink placeholder:text-inksoft/60 transition-colors duration-300 focus:border-accent/60 focus:outline-none'
