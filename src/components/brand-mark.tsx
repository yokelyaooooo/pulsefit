import { useId } from "react"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  const clip = `${useId().replace(/:/g, "")}-clip`
  return (
    <svg viewBox="0 0 1024 1024" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <clipPath id={clip}>
          <rect width="1024" height="1024" rx="230" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="1024" height="1024" fill="#FF846C" />
        <g transform="rotate(-11 490 500)" fill="#FFF8F3">
          <path d="M420 450C338 468 300 555 332 660C366 770 488 812 580 782C692 746 752 640 726 520C704 420 610 388 510 412C454 426 430 438 420 450Z" />
          <circle cx="352" cy="448" r="90" />
          <circle cx="690" cy="408" r="98" />
          <path
            d="M352 448C392 258 652 236 690 408"
            fill="none"
            stroke="#FFF8F3"
            strokeWidth="84"
            strokeLinecap="round"
          />
        </g>
        <g fill="#E4FF55" transform="rotate(14 780 800)">
          <rect x="700" y="786" width="150" height="32" rx="16" />
          <circle cx="700" cy="802" r="36" />
          <circle cx="850" cy="802" r="36" />
        </g>
        <path fill="#FFF8F3" d="M790 248l9 22 22 9-22 9-9 22-9-22-22-9 22-9z" />
      </g>
    </svg>
  )
}
