"use client"

import { useState } from "react"
import { Minus, Pause, Play, Plus, SkipBack, SkipForward } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { LyricsView } from "@/components/lyrics-view"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { formatClock } from "@/lib/audio/clock"

const sourceLabel = {
  local: "本地节拍",
  netease: "网易云音乐",
  qq: "QQ 音乐",
  apple: "Apple Music",
} as const

export function NowPlaying({ onClose }: { onClose?: () => void }) {
  const player = usePlayer()
  const now = player.now
  const [drag, setDrag] = useState<number | null>(null)
  const position = drag ?? player.positionSec
  const local = now?.source === "local"

  return (
    <section className="flex h-full min-h-[70vh] flex-col px-5 py-6 sm:px-8">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-[0.22em] text-[var(--theme-a)] uppercase">
          {now ? sourceLabel[now.source] : "PulseFit"}
        </p>
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            收起
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">空格键播放</p>
        )}
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center">
        <CoverArt
          seed={now?.id ?? "pulsefit"}
          title={now?.title ?? "燃律"}
          artwork={now?.artwork}
          className="aspect-square w-full max-w-sm rounded-[2rem] shadow-2xl"
        />
        <div className="mt-6 w-full max-w-sm text-center">
          <h2 className="text-3xl font-semibold tracking-tight">{now ? now.title : "还没有在播"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {now
              ? `${now.artist} · ${now.bpm} BPM`
              : "从首页或曲库选一首。本地节拍由浏览器合成，外部音源要各自登录。"}
          </p>
        </div>
        <div className="mt-4 w-full max-w-sm">
          <LyricsView lines={player.lyrics} time={position} />
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <Slider
            aria-label="播放进度"
            min={0}
            max={Math.max(player.durationSec, 1)}
            step={0.1}
            value={[Math.min(position, Math.max(player.durationSec, 1))]}
            disabled={!now}
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
          <Button variant="outline" size="icon-lg" className="rounded-full" aria-label="上一首" onClick={() => void player.prev()} disabled={!now}>
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
          <Button variant="outline" size="icon-lg" className="rounded-full" aria-label="下一首" onClick={() => void player.next()} disabled={!now}>
            <SkipForward />
          </Button>
        </div>

        {local ? (
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
        ) : (
          <p className="text-center text-xs text-muted-foreground">流媒体按原曲播放。BPM 锁定只作用在本地节拍上。</p>
        )}
      </div>
    </section>
  )
}
