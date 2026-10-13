"use client"

import { useEffect, useRef } from "react"
import { lyricIndexAt, type LyricLine } from "@/lib/music/lrc"
import { cn } from "@/lib/utils"

export function LyricsView({
  lines,
  time,
  className,
  onSeek,
}: {
  lines: LyricLine[]
  time: number
  className?: string
  onSeek?: (time: number) => void
}) {
  const active = lyricIndexAt(lines, time)
  const listRef = useRef<HTMLOListElement>(null)
  const primed = useRef(false)

  useEffect(() => {
    const list = listRef.current
    const node = list?.querySelector<HTMLElement>("[data-active='true']")
    if (!list || !node) return
    const listTop = list.getBoundingClientRect().top
    const lineTop = node.getBoundingClientRect().top
    const next = list.scrollTop + (lineTop - listTop) - list.clientHeight / 2 + node.clientHeight / 2
    list.scrollTo({ top: Math.max(0, next), behavior: primed.current ? "smooth" : "auto" })
    primed.current = true
  }, [active, lines])

  if (lines.length === 0) {
    return <p className="px-1 text-sm text-white/55">这首没有逐行歌词。</p>
  }

  return (
    <ol
      ref={listRef}
      className={cn(
        "space-y-5 overflow-y-auto py-16 text-left [mask-image:linear-gradient(180deg,transparent,#000_12%,#000_88%,transparent)]",
        className
      )}
      aria-label="歌词"
    >
      {lines.map((line, index) => {
        const current = index === active
        return (
          <li key={`${line.time}-${index}`} data-active={current ? "true" : "false"}>
            <button
              type="button"
              className={cn(
                "w-full text-left text-[28px] leading-[1.15] font-bold tracking-[-0.4px] transition-colors duration-300",
                current ? "text-white" : "text-white/35 hover:text-white/55"
              )}
              onClick={() => onSeek?.(line.time)}
            >
              {line.text}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
