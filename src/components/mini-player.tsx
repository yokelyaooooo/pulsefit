"use client"

import { Pause, Play } from "lucide-react"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import { getTrack } from "@/lib/catalog"
import { formatClock } from "@/lib/audio/clock"

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const player = usePlayer()
  const track = player.trackId ? getTrack(player.trackId) : null
  if (!track) return null
  const progress = player.durationSec > 0 ? (player.positionSec / player.durationSec) * 100 : 0

  return (
    <div className="absolute inset-x-3 bottom-[4.6rem] z-20 lg:bottom-4">
      <div className="overflow-hidden rounded-2xl bg-card/95 shadow-lg ring-1 ring-white/10 backdrop-blur">
        <div className="h-0.5 bg-white/10">
          <div className="h-full bg-ember" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
            <div className="truncate text-sm font-medium">{track.title}</div>
            <div className="truncate text-xs text-muted-foreground tabular-nums">
              {player.bpm} BPM · {formatClock(player.positionSec)}
            </div>
          </button>
          <Button
            size="icon"
            variant="secondary"
            aria-label={player.status === "playing" ? "暂停" : "播放"}
            onClick={() => void player.toggle()}
          >
            {player.status === "playing" ? <Pause /> : <Play />}
          </Button>
        </div>
      </div>
    </div>
  )
}
