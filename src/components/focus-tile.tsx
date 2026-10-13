import Link from "next/link"
import { plateFor } from "@/lib/media"
import { cn } from "@/lib/utils"
import type { TrainingFocus } from "@/lib/training/focus"

export function FocusTile({ focus, className }: { focus: TrainingFocus; className?: string }) {
  return (
    <Link
      href={`/focus/${focus.id}`}
      className={cn(
        "relative flex h-[118px] flex-col justify-end overflow-hidden rounded-[18px] p-3.5 text-white shadow-[0_12px_24px_rgba(28,28,30,0.16)]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={plateFor(focus.id)} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <span className="t-caption relative text-white/85">{focus.kind === "day" ? "训练日" : "动作"}</span>
      <span className="t-headline relative mt-0.5">{focus.name}</span>
    </Link>
  )
}
