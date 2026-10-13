import { useId } from "react"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  const raw = useId().replace(/:/g, "")
  const bg = `${raw}-bg`
  const glow = `${raw}-glow`
  const shade = `${raw}-shade`
  const soft = `${raw}-soft`
  const clip = `${raw}-clip`
  return (
    <svg viewBox="0 0 1024 1024" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={bg} x1="40" y1="0" x2="1000" y2="1040" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE39A" />
          <stop offset="0.2" stopColor="#FF8A3C" />
          <stop offset="0.52" stopColor="#FF2D55" />
          <stop offset="1" stopColor="#5428F0" />
        </linearGradient>
        <radialGradient id={glow} cx="0.3" cy="0.14" r="0.78">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={shade} x1="512" y1="700" x2="512" y2="1024" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1a0840" stopOpacity="0" />
          <stop offset="1" stopColor="#1a0840" stopOpacity="0.28" />
        </linearGradient>
        <filter id={soft} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#2a0830" floodOpacity="0.3" />
        </filter>
        <clipPath id={clip}>
          <rect width="1024" height="1024" rx="230" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="1024" height="1024" fill={`url(#${bg})`} />
        <rect width="1024" height="1024" fill={`url(#${glow})`} />
        <rect width="1024" height="1024" fill={`url(#${shade})`} />
        <g filter={`url(#${soft})`} fill="#fff">
          <path d="M452 214c28 70 78 130 140 196 86 92 168 176 140 286-30 118-150 188-280 188s-250-70-280-188c-28-110 54-194 140-286 62-66 112-126 140-196z" />
          <path d="M600 188h108c10 0 18 8 18 18v470c0 30-24 58-70 76-16 6-38-6-38-24V188z" />
          <path d="M616 156c150 8 250 110 196 214-40 78-150 102-230 42-18-14-28-36-28-58V156z" />
        </g>
      </g>
    </svg>
  )
}
