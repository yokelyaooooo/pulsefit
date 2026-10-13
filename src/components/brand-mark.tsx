import { useId } from "react"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  const raw = useId().replace(/:/g, "")
  const clip = `${raw}-clip`
  const cut = `${raw}-cut`
  return (
    <svg viewBox="0 0 1024 1024" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <clipPath id={clip}>
          <rect width="1024" height="1024" rx="230" />
        </clipPath>
        <mask id={cut}>
          <rect width="1024" height="1024" fill="#fff" />
          <g fill="#000">
            <circle cx="430" cy="690" r="54" />
            <circle cx="598" cy="690" r="54" />
            <rect x="430" y="666" width="168" height="48" rx="24" />
          </g>
        </mask>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="1024" height="1024" fill="#322A2C" />
        <g fill="#F6EFE9" mask={`url(#${cut})`}>
          <path d="M400 455C310 470 268 560 300 680C334 810 460 860 560 836C690 804 770 700 748 560C730 450 640 410 530 430C470 442 430 448 400 455Z" />
          <circle cx="336" cy="455" r="100" />
          <circle cx="700" cy="428" r="108" />
          <path
            d="M336 455C372 248 668 228 700 428"
            fill="none"
            stroke="#F6EFE9"
            strokeWidth="96"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  )
}
