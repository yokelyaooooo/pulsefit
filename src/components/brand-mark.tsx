import { useId } from "react"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  const raw = useId().replace(/:/g, "")
  const bg = `${raw}-bg`
  const body = `${raw}-body`
  const clip = `${raw}-clip`
  return (
    <svg viewBox="0 0 1024 1024" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={bg} x1="72" y1="16" x2="980" y2="1024" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE9DE" />
          <stop offset="0.46" stopColor="#F6B7C6" />
          <stop offset="1" stopColor="#E4C6EE" />
        </linearGradient>
        <radialGradient id={body} cx="0.36" cy="0.3" r="0.78">
          <stop offset="0" stopColor="#FFFDFB" />
          <stop offset="1" stopColor="#FFE3DA" />
        </radialGradient>
        <clipPath id={clip}>
          <rect width="1024" height="1024" rx="230" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="1024" height="1024" fill={`url(#${bg})`} />
        <ellipse cx="512" cy="868" rx="200" ry="30" fill="#E098AE" opacity="0.28" />
        <circle cx="512" cy="590" r="246" fill={`url(#${body})`} />
        <ellipse cx="430" cy="500" rx="78" ry="42" fill="#fff" opacity="0.55" />
        <path d="M312 575C312 348 712 348 712 575" fill="none" stroke="#E56D8C" strokeWidth="78" strokeLinecap="round" />
        <circle cx="312" cy="590" r="80" fill="#E56D8C" />
        <circle cx="712" cy="590" r="80" fill="#E56D8C" />
        <circle cx="312" cy="590" r="38" fill="#FFF5F7" />
        <circle cx="712" cy="590" r="38" fill="#FFF5F7" />
        <rect x="368" y="492" width="288" height="52" rx="26" fill="#F08A96" />
        <rect x="392" y="500" width="240" height="14" rx="7" fill="#fff" opacity="0.35" />
        <circle cx="442" cy="636" r="42" fill="#4E3840" />
        <circle cx="582" cy="636" r="42" fill="#4E3840" />
        <circle cx="428" cy="622" r="14" fill="#fff" />
        <circle cx="568" cy="622" r="14" fill="#fff" />
        <circle cx="370" cy="716" r="28" fill="#F4A8B6" />
        <circle cx="654" cy="716" r="28" fill="#F4A8B6" />
        <path d="M466 714Q512 766 558 714" fill="none" stroke="#4E3840" strokeWidth="22" strokeLinecap="round" />
      </g>
    </svg>
  )
}
