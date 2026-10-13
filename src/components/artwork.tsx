import { cn } from "@/lib/utils"

const paint: Record<string, [string, string]> = {
  hiit: ["#FFB199", "#FF2D55"],
  strength: ["#C7D7FF", "#3D5AFE"],
  cardio: ["#B8F6F6", "#14C4C4"],
  yoga: ["#DDD6FE", "#7C5CFC"],
  recover: ["#FDE68A", "#D97706"],
  push: ["#FFB199", "#FF4D3A"],
  pull: ["#B7D0FF", "#3D7EFF"],
  legs: ["#B6F0D2", "#1F9D62"],
  shoulders: ["#FFE3A3", "#C48A12"],
  core: ["#E9D5FF", "#7C5CFC"],
  local: ["#FFB199", "#FF2D55"],
  netease: ["#FF8A80", "#E10600"],
  qq: ["#B6F0D2", "#12B352"],
  apple: ["#F9A8D4", "#7C5CFC"],
  search: ["#FFD0DC", "#FF2D55"],
}

export function Paint({
  tone,
  className,
  children,
}: {
  tone: string
  className?: string
  children?: React.ReactNode
}) {
  const [from, to] = paint[tone] ?? ["#E5E5EA", "#8E8E93"]
  return (
    <div
      className={cn("relative overflow-hidden text-white", className)}
      style={{ background: `linear-gradient(155deg, ${from} 0%, ${to} 78%)` }}
    >
      <span className="pointer-events-none absolute -top-8 -right-6 size-24 rounded-full bg-white/28" />
      <span className="pointer-events-none absolute top-8 right-6 size-8 rounded-full bg-white/20" />
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
      <svg viewBox="0 0 32 32" className="relative size-8" aria-hidden>
        <path d={sourceGlyph[source] ?? sourceGlyph.local} fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Paint>
  )
}
