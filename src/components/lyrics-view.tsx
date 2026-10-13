"use client"

import { useEffect, useRef } from "react"
import { lyricIndexAt, type LyricLine } from "@/lib/music/lrc"
import { cn } from "@/lib/utils"

export function LyricsView({ lines, time }: { lines: LyricLine[]; time: number }) {
  const active = lyricIndexAt(lines, time)
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>("[data-active='true']")
    node?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [active])

  if (lines.length === 0) {
    return <p className="px-6 text-center text-sm text-muted-foreground">这首没有逐行歌词。</p>
  }

  return (
    <ol ref={listRef} className="max-h-64 space-y-3 overflow-y-auto px-2 py-6 text-center" aria-label="歌词">
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
