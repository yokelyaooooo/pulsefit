"use client"

import { plateFor, trackPlate } from "@/lib/media"
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
  const src = artwork || trackPlate[seed] || plateFor(seed)
  return (
    // Remote album art comes from the connected music host. Local covers are licensed plates.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" title={title} className={cn("object-cover", className)} onError={(event) => {
      if (event.currentTarget.dataset.fallback) return
      event.currentTarget.dataset.fallback = "true"
      event.currentTarget.src = trackPlate[seed] || plateFor(seed)
    }} />
  )
}
