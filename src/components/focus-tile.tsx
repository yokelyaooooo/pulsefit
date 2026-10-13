import Link from "next/link"
import { cn } from "@/lib/utils"
import type { TrainingFocus } from "@/lib/training/focus"

export function FocusTile({ focus, className }: { focus: TrainingFocus; className?: string }) {
  return (
    <Link
      href={`/focus/${focus.id}`}
      className={cn(
        "relative flex h-[118px] flex-col justify-end overflow-hidden rounded-[18px] p-3.5 text-white shadow-[0_12px_24px_rgba(28,28,30,0.12)]",
        className
      )}
      style={{ background: `linear-gradient(155deg, ${focus.accent2} 0%, ${focus.accent} 62%, ${focus.accent} 100%)` }}
    >
      <span className="pointer-events-none absolute -top-8 -right-6 size-24 rounded-full bg-white/30" />
      <span className="pointer-events-none absolute top-7 right-5 size-8 rounded-full bg-white/25" />
      <span className="t-caption relative text-white/80">{focus.kind === "day" ? "训练日" : "动作"}</span>
      <span className="t-headline relative mt-0.5">{focus.name}</span>
    </Link>
  )
}
