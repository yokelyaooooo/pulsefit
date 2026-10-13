import { useId } from "react"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "")
  return (
    <svg viewBox="0 0 32 32" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7A59" />
          <stop offset="1" stopColor="#FF2D55" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      <path
        d="M16 6.5c.6 4 3 6.4 5.2 8.6 2 2 3.4 4 3.4 6.6a8.6 8.6 0 0 1-17.2 0c0-2.6 1.4-4.6 3.4-6.6C13 12.9 15.4 10.5 16 6.5z"
        fill="white"
      />
    </svg>
  )
}
