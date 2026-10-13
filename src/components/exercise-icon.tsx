import { cn } from "@/lib/utils"

export function ExerciseIcon({ glyph, className }: { glyph: string; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-theme-a", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.14" />
      <path d={glyph} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
