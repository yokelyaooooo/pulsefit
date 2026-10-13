"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

export function CoverArt({
  seed,
  title,
  artwork,
  className,
}: {
  seed: string
  title: string
  artwork?: string | null
  className?: string
}) {
  const gradientId = useId().replace(/:/g, "")
  if (artwork) {
    return (
      // Album art comes from whichever music host the user connected. Hosts are not known ahead of time.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={artwork} alt="" className={cn("object-cover", className)} />
    )
  }
  const hue = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360
  return (
    <svg viewBox="0 0 80 80" className={cn("bg-black", className)} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 78% 58%)`} />
          <stop offset="100%" stopColor={`hsl(${(hue + 36) % 360} 70% 28%)`} />
        </linearGradient>
      </defs>
      <rect width="80" height="80" fill={`url(#${gradientId})`} />
      <circle cx="62" cy="18" r="10" fill="white" opacity="0.16" />
      <text x="40" y="46" textAnchor="middle" fill="white" fontSize="18" fontFamily="sans-serif">
        {title.slice(0, 2)}
      </text>
    </svg>
  )
}
