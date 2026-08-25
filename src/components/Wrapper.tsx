import type { WrapStyle } from '../lib/bouquet'

interface WrapTheme {
  paper: string
  paperDark: string
  edge: string
  ribbon: string
  ribbonDark: string
  twine: boolean
}

const WRAP_THEMES: Record<WrapStyle, WrapTheme> = {
  classic: {
    paper: '#F7EFE1',
    paperDark: '#EEE2CC',
    edge: '#DCcbae',
    ribbon: '#C86B78',
    ribbonDark: '#A95060',
    twine: false,
  },
  romantic: {
    paper: '#F6DDE2',
    paperDark: '#EECAD3',
    edge: '#DDB2BF',
    ribbon: '#7A2E3E',
    ribbonDark: '#5E2230',
    twine: false,
  },
  wildflower: {
    paper: '#DDBF93',
    paperDark: '#CCAA77',
    edge: '#B6925C',
    ribbon: '#8A6F4D',
    ribbonDark: '#6E573B',
    twine: true,
  },
  elegant: {
    paper: '#4C4642',
    paperDark: '#3B3734',
    edge: '#2D2A27',
    ribbon: '#D8C7A9',
    ribbonDark: '#BBA887',
    twine: false,
  },
}

export function Wrapper({
  wrap,
  className,
}: {
  wrap: WrapStyle
  className?: string
}) {
  const t = WRAP_THEMES[wrap]
  return (
    <svg viewBox="0 0 320 400" className={className} aria-hidden>
      <path d="M94 248 L226 248 L178 354 L160 345 L142 354 Z" fill={t.paperDark} />
      <path d="M104 256 L216 256 L173 350 L160 343.5 L147 350 Z" fill={t.paper} />
      <path d="M120 258 L153 338" stroke={t.edge} strokeWidth="1.6" opacity="0.55" fill="none" />
      <path d="M200 258 L167 338" stroke={t.edge} strokeWidth="1.6" opacity="0.55" fill="none" />
      <path d="M104 256 L160 343.5 L216 256" stroke={t.edge} strokeWidth="1.4" opacity="0.4" fill="none" />
      {t.twine ? (
        <>
          <path
            d="M101 280 C132 292 188 292 219 280"
            fill="none"
            stroke={t.ribbon}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M103 288 C133 299 187 299 217 288"
            fill="none"
            stroke={t.ribbon}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="153" y="278" width="14" height="16" rx="2" fill={t.ribbonDark} transform="rotate(8 160 286)" />
        </>
      ) : (
        <>
          <path
            d="M99 278 C131 291 189 291 221 278 L219 294 C188 305 132 305 101 294 Z"
            fill={t.ribbon}
          />
          <path d="M99 278 C131 291 189 291 221 278" fill="none" stroke={t.ribbonDark} strokeWidth="1.4" opacity="0.6" />
          <ellipse cx="143" cy="272" rx="17" ry="10.5" fill={t.ribbon} stroke={t.ribbonDark} strokeWidth="1.4" transform="rotate(-24 143 272)" />
          <ellipse cx="177" cy="272" rx="17" ry="10.5" fill={t.ribbon} stroke={t.ribbonDark} strokeWidth="1.4" transform="rotate(24 177 272)" />
          <circle cx="160" cy="277" r="6.5" fill={t.ribbonDark} />
          <path d="M156 282 C150 296 146 306 138 318 L147 316 C151 304 155 293 158 284 Z" fill={t.ribbon} stroke={t.ribbonDark} strokeWidth="1" />
          <path d="M164 282 C170 296 174 304 182 314 L173 314 C168 303 165 292 162 284 Z" fill={t.ribbon} stroke={t.ribbonDark} strokeWidth="1" />
        </>
      )}
    </svg>
  )
}

export function WrapSwatch({ wrap, selected }: { wrap: WrapStyle; selected: boolean }) {
  const t = WRAP_THEMES[wrap]
  return (
    <svg viewBox="0 0 60 60" className="h-full w-full">
      <path d="M12 14 L48 14 L34 50 L30 47.5 L26 50 Z" fill={t.paperDark} />
      <path d="M15 17 L45 17 L33 48 L30 46 L27 48 Z" fill={t.paper} />
      {t.twine ? (
        <>
          <path d="M13 26 C22 29 38 29 47 26" fill="none" stroke={t.ribbon} strokeWidth="1.6" />
          <rect x="27.5" y="24" width="5" height="6" rx="1" fill={t.ribbonDark} />
        </>
      ) : (
        <>
          <path d="M12.5 27 C22 30.5 38 30.5 47.5 27 L47 31.5 C37.5 34.5 22.5 34.5 13 31.5 Z" fill={t.ribbon} />
          <ellipse cx="26" cy="25.5" rx="4.6" ry="2.8" fill={t.ribbon} transform="rotate(-22 26 25.5)" />
          <ellipse cx="34" cy="25.5" rx="4.6" ry="2.8" fill={t.ribbon} transform="rotate(22 34 25.5)" />
          <circle cx="30" cy="26.6" r="2" fill={t.ribbonDark} />
        </>
      )}
      {selected && (
        <path
          d="M12 14 L48 14 L34 50 L30 47.5 L26 50 Z"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          opacity="0.65"
        />
      )}
    </svg>
  )
}

export const WRAP_DESCRIPTIONS: Record<WrapStyle, string> = {
  classic: 'Ivory paper, satin rose ribbon',
  romantic: 'Blush paper, burgundy ribbon',
  wildflower: 'Kraft paper, garden twine',
  elegant: 'Deep neutral paper, champagne satin',
}
