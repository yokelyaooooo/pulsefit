import { plateFor } from "@/lib/media"
import { cn } from "@/lib/utils"

export function Paint({
  tone,
  className,
  children,
}: {
  tone: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("relative overflow-hidden text-white", className)}>
      {/* Decorative plate. Attribution is in public/photos/ATTRIBUTION.md. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={plateFor(tone)} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
      {children}
    </div>
  )
}

const sourceGlyph: Record<string, string> = {
  local: "M16 6.5c.6 4 3 6.4 5.2 8.6 2 2 3.4 4 3.4 6.6a8.6 8.6 0 0 1-17.2 0c0-2.6 1.4-4.6 3.4-6.6C13 12.9 15.4 10.5 16 6.5z",
  netease: "M8 18c0-5 3.4-8 8-8s8 3 8 8-3.2 7-8 7-8-2-8-7zM11 17.5c2.2 1.6 7.6 1.6 10 0",
  qq: "M10 22V12.5a6 6 0 0 1 12 0V22M16 8.5V6M13.5 6h5",
  apple: "M12 21c4-1 8-5 8-10 0 0-3 1.5-5 1.2C13 8.5 12 6 12 6s-1 2.5-3 6.2C7 12.5 4 11 4 11c0 5 4 9 8 10z",
}

export function SourceMark({ source, className }: { source: string; className?: string }) {
  return (
    <Paint tone={source} className={cn("grid size-14 shrink-0 place-items-center rounded-[16px]", className)}>
      <svg viewBox="0 0 32 32" className="relative size-7 drop-shadow" aria-hidden>
        <path d={sourceGlyph[source] ?? sourceGlyph.local} fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Paint>
  )
}
