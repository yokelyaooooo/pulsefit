"use client"

import { Pause, Play } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import { formatClock } from "@/lib/audio/clock"

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const player = usePlayer()
  if (!player.now) return null
  const progress = player.durationSec > 0 ? Math.min(100, (player.positionSec / player.durationSec) * 100) : 0

  return (
    <div className="glass pointer-events-auto mb-2 overflow-hidden rounded-3xl">
      <div className="h-0.5 bg-white/10">
        <div className="h-full bg-[var(--theme-a)]" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center gap-3 px-2.5 py-2">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={onOpen}>
          <CoverArt
            seed={player.now.id}
            title={player.now.title}
            artwork={player.now.artwork}
            className="size-11 shrink-0 rounded-xl"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{player.now.title}</span>
            <span className="block truncate text-xs text-muted-foreground tabular-nums">
              {player.now.artist} · {formatClock(player.positionSec)}
            </span>
          </span>
        </button>
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full"
          aria-label={player.status === "playing" ? "暂停" : "播放"}
          onClick={() => void player.toggle()}
        >
          {player.status === "playing" ? <Pause /> : <Play />}
        </Button>
      </div>
    </div>
  )
}
