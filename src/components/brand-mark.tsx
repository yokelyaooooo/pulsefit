import { useId } from "react"
import { cn } from "@/lib/utils"

const flame =
  "M470 430C420 430 372 492 360 575C346 676 338 770 404 848C470 926 600 910 646 812C686 726 648 640 596 558C556 494 520 430 470 430Z"
const stem = "M548 392A48 48 0 0 1 644 392V700A48 48 0 0 1 548 700Z"
const flag = "M644 336H820A56 56 0 0 1 820 448H644A56 56 0 0 1 644 336Z"

export function BrandMark({ className }: { className?: string }) {
  const raw = useId().replace(/:/g, "")
  const bg = `${raw}-bg`
  const glow = `${raw}-glow`
  const depth = `${raw}-depth`
  const halo = `${raw}-halo`
  const soft = `${raw}-soft`
  const clip = `${raw}-clip`
  return (
    <svg viewBox="0 0 1024 1024" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={bg} x1="48" y1="16" x2="990" y2="1024" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF6EE" />
          <stop offset="0.16" stopColor="#FFE0CC" />
          <stop offset="0.38" stopColor="#F8C0B4" />
          <stop offset="0.58" stopColor="#F3A8B8" />
          <stop offset="0.78" stopColor="#E8B6D6" />
          <stop offset="1" stopColor="#D4C4F2" />
        </linearGradient>
        <radialGradient id={glow} cx="0.28" cy="0.16" r="0.72">
          <stop offset="0" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={depth} cx="0.7" cy="0.92" r="0.58">
          <stop offset="0" stopColor="#C992AE" stopOpacity="0.18" />
          <stop offset="1" stopColor="#C992AE" stopOpacity="0" />
        </radialGradient>
        <filter id={halo} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id={soft} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#D492A8" floodOpacity="0.28" />
        </filter>
        <clipPath id={clip}>
          <rect width="1024" height="1024" rx="230" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="1024" height="1024" fill={`url(#${bg})`} />
        <rect width="1024" height="1024" fill={`url(#${glow})`} />
        <rect width="1024" height="1024" fill={`url(#${depth})`} />
        <g fill="#fff" transform="translate(-84 -53)">
          <g filter={`url(#${halo})`} opacity="0.42">
            <path d={flame} />
            <path d={stem} />
            <g transform="rotate(-36 644 392)">
              <path d={flag} />
            </g>
          </g>
          <g filter={`url(#${soft})`}>
            <path d={flame} />
            <path d={stem} />
            <g transform="rotate(-36 644 392)">
              <path d={flag} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
