"use client"

import { useEffect, useRef } from "react"
import { lyricIndexAt, type LyricLine } from "@/lib/music/lrc"
import { cn } from "@/lib/utils"

export function LyricsView({ lines, time, className }: { lines: LyricLine[]; time: number; className?: string }) {
  const active = lyricIndexAt(lines, time)
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const list = listRef.current
    const node = list?.querySelector<HTMLElement>("[data-active='true']")
    if (!list || !node) return
    const listTop = list.getBoundingClientRect().top
    const lineTop = node.getBoundingClientRect().top
    const next = list.scrollTop + (lineTop - listTop) - list.clientHeight / 2 + node.clientHeight / 2
    list.scrollTo({ top: Math.max(0, next) })
  }, [active, lines])

  if (lines.length === 0) {
    return <p className="px-6 text-center text-sm text-muted-foreground">这首没有逐行歌词。</p>
  }

  return (
    <ol
      ref={listRef}
      className={cn(
        "max-h-64 space-y-3 overflow-y-auto px-2 py-6 text-center [mask-image:linear-gradient(180deg,transparent,#000_8%,#000_92%,transparent)]",
        className
      )}
      aria-label="歌词"
    >
      {lines.map((line, index) => (
        <li
          key={`${line.time}-${index}`}
          data-active={index === active ? "true" : "false"}
          className={cn(
            "text-lg transition",
            index === active ? "font-semibold text-foreground" : "text-muted-foreground/70"
          )}
        >
          {line.text}
        </li>
      ))}
    </ol>
  )
}
