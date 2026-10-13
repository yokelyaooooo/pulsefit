"use client"

import { Pause, Play } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { CoverArt } from "@/components/cover-art"
import { usePlayer } from "@/components/player-provider"
import { formatClock } from "@/lib/audio/clock"

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const player = usePlayer()
  const progress = player.now && player.durationSec > 0 ? Math.min(100, (player.positionSec / player.durationSec) * 100) : 0
  const playing = player.status === "playing"

  return (
    <div className="liquid-glass pointer-events-auto mb-2 overflow-hidden rounded-[18px]">
      <div className="flex items-center gap-3 px-2.5 py-2">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={onOpen}>
          {player.now ? (
            <CoverArt
              seed={player.now.id}
              title={player.now.title}
              artwork={player.now.artwork}
              className="size-10 shrink-0 rounded-[10px]"
            />
          ) : (
            <BrandMark className="size-10" />
          )}
          <span className="min-w-0">
            <span className="t-headline block truncate text-[15px]">
              {player.now ? player.now.title : "未在播放"}
            </span>
            <span className="t-caption block truncate text-[color:var(--label-secondary)]">
              {player.now ? `${player.now.artist} · ${formatClock(player.positionSec)}` : "燃律"}
            </span>
          </span>
        </button>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-full text-[#1c1c1e] disabled:opacity-30"
          aria-label={playing ? "暂停" : "播放"}
          disabled={!player.now}
          onClick={() => void player.toggle()}
        >
          {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
        </button>
      </div>
      <div className="h-[2px] bg-black/6">
        <div className="h-full bg-[#ff2d55]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
