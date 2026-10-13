"use client"

import { useState } from "react"
import { Minus, Pause, Play, Plus, SkipBack, SkipForward } from "lucide-react"
import { BeatRing } from "@/components/beat-ring"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { getTrack, tagLabel } from "@/lib/catalog"
import { formatClock } from "@/lib/audio/clock"

export function NowPlaying({ onClose }: { onClose?: () => void }) {
  const player = usePlayer()
  const track = player.trackId ? getTrack(player.trackId) : null
  const [drag, setDrag] = useState<number | null>(null)
  const position = drag ?? player.positionSec

  return (
    <section className="flex h-full min-h-[70vh] flex-col px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-[0.22em] text-ember uppercase">
          {track ? tagLabel[track.tag] : "PulseFit"}
        </p>
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            收起
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">空格键播放</p>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <BeatRing
          label={track ? String(player.bpm) : "—"}
          caption={track ? "BPM" : "待播"}
        />
        <div className="max-w-sm text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            {track ? track.title : "还没有在播"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {track
              ? `${track.titleEn} · ${track.blurb}`
              : "从曲库选一首，或开始一轮训练。节拍由浏览器实时生成，不播放版权曲库。"}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <Slider
            aria-label="播放进度"
            min={0}
            max={Math.max(player.durationSec, 1)}
            step={0.1}
            value={[Math.min(position, player.durationSec)]}
            disabled={!track}
            onValueChange={(value) => setDrag(value[0] ?? 0)}
            onValueCommit={(value) => {
              player.seek(value[0] ?? 0)
              setDrag(null)
            }}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{formatClock(position)}</span>
            <span>{formatClock(player.durationSec)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon-lg" aria-label="上一首" onClick={() => void player.prev()} disabled={!track}>
            <SkipBack />
          </Button>
          <Button
            size="icon-lg"
            className="size-16 rounded-full"
            aria-label={player.status === "playing" ? "暂停" : "播放"}
            onClick={() => void player.toggle()}
          >
            {player.status === "playing" ? <Pause className="size-6" /> : <Play className="size-6" />}
          </Button>
          <Button variant="outline" size="icon-lg" aria-label="下一首" onClick={() => void player.next()} disabled={!track}>
            <SkipForward />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="flex items-center justify-between text-xs text-muted-foreground">
              节拍
              <span className="inline-flex items-center gap-1">
                <Button variant="ghost" size="icon-xs" aria-label="降低节拍" onClick={() => player.setBpm(player.bpm - 1)}>
                  <Minus />
                </Button>
                <span className="w-10 text-center text-foreground tabular-nums">{player.bpm}</span>
                <Button variant="ghost" size="icon-xs" aria-label="升高节拍" onClick={() => player.setBpm(player.bpm + 1)}>
                  <Plus />
                </Button>
              </span>
            </span>
            <Slider
              aria-label="节拍"
              min={60}
              max={190}
              step={1}
              value={[player.bpm]}
              onValueChange={(value) => player.setBpm(value[0] ?? player.bpm)}
            />
          </label>
          <label className="space-y-2">
            <span className="flex justify-between text-xs text-muted-foreground">
              能量
              <span className="text-foreground tabular-nums">{Math.round(player.energy * 100)}</span>
            </span>
            <Slider
              aria-label="能量"
              min={0}
              max={100}
              step={1}
              value={[Math.round(player.energy * 100)]}
              onValueChange={(value) => player.setEnergy((value[0] ?? 70) / 100)}
            />
          </label>
        </div>
      </div>
    </section>
  )
}
