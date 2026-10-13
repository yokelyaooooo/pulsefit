"use client"

import { useEffect, useRef, useState } from "react"
import { Minus, Pause, Play, Plus, SkipBack, SkipForward } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { LyricsView } from "@/components/lyrics-view"
import { VinylDisc } from "@/components/music-marks"
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
  const coverRef = useRef<HTMLDivElement>(null)
  const bpmRef = useRef<HTMLSpanElement>(null)
  const repRef = useRef<HTMLSpanElement>(null)
  const beatRef = useRef<HTMLSpanElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return player.subscribeVisual((snapshot) => {
      const cover = coverRef.current
      if (cover) {
        const pulse = snapshot.playing ? 1 + (1 - snapshot.beatPhase) * 0.045 : 1
        const glow = snapshot.playing ? 0.28 + (snapshot.kick ? 0.5 : (1 - snapshot.beatPhase) * 0.35) : 0.08
        cover.style.transform = `scale(${pulse})`
        cover.style.boxShadow = `0 18px 40px rgba(28,28,30,0.16), 0 0 ${24 + glow * 40}px rgba(255,45,85,${glow})`
      }
      const beats = Math.floor((snapshot.positionSec * snapshot.bpm) / 60)
      const beatInBar = (beats % 4) + 1
      if (bpmRef.current) bpmRef.current.textContent = String(Math.round(snapshot.bpm) || now?.bpm || "—")
      if (repRef.current) repRef.current.textContent = now ? String(Math.floor(beats / 4) + 1) : "—"
      if (beatRef.current) beatRef.current.textContent = now ? String(beatInBar) : "—"
      const dots = dotsRef.current?.children
      if (!dots) return
      for (let index = 0; index < dots.length; index += 1) {
        const dot = dots[index] as HTMLElement
        const on = Boolean(now) && snapshot.playing && index === beats % 4
        dot.style.transform = on ? "scale(1.4)" : "scale(1)"
        dot.style.opacity = on ? "1" : "0.35"
        dot.style.background = on ? "#ff2d55" : "rgba(60,60,67,0.35)"
      }
    })
  }, [now, player])

  return (
    <section className="flex w-full max-w-[430px] flex-col px-5 py-4">
      <div className="flex items-center justify-between">
        <p className="t-caption text-[color:var(--label-secondary)]">
          {now ? sourceLabel[now.source] : "燃律"}
        </p>
        {onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            收起
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">空格键播放</p>
        )}
      </div>

      <div className="mt-3 flex flex-col items-center">
        <div ref={coverRef} className="relative w-full max-w-[232px] origin-center rounded-[28px]">
          <VinylDisc spinning={player.status === "playing"} className="-right-[8%] size-[78%]" />
          <CoverArt
            seed={now?.id ?? "pulsefit"}
            title={now?.title ?? "燃律"}
            artwork={now?.artwork}
            className="relative z-10 aspect-square w-full rounded-[28px]"
          />
        </div>
        <div className="mt-3 w-full max-w-sm text-center">
          <h2 className="t-1">{now ? now.title : "还没有在播"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{now ? now.artist : "从首页或曲库选一首。"}</p>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-[13px] font-medium tabular-nums">
          <span className="rounded-full bg-[var(--fill)] px-3 py-1">
            BPM <span ref={bpmRef}>{now?.bpm ?? "—"}</span>
          </span>
          <span className="rounded-full bg-[var(--fill)] px-3 py-1">
            组 <span ref={repRef}>{now ? "1" : "—"}</span>
          </span>
          <span className="rounded-full bg-[var(--fill)] px-3 py-1">
            拍 <span ref={beatRef}>{now ? "1" : "—"}</span>
          </span>
        </div>
        <div ref={dotsRef} className="mt-3 flex items-center justify-center gap-2" aria-hidden>
          {[0, 1, 2, 3].map((dot) => (
            <span key={dot} className="size-2.5 rounded-full bg-[rgba(60,60,67,0.35)]" />
          ))}
        </div>
        <div className="mt-2 w-full max-w-sm">
          <LyricsView lines={player.lyrics} time={position} className="h-40 max-h-40" />
        </div>
      </div>

      <div className="mt-3 space-y-4">
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
            className="size-16 rounded-full shadow-[0_10px_24px_rgba(28,28,30,0.16)]"
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
          <p className="text-center text-xs text-muted-foreground">
            {now ? "流媒体按原曲播放。BPM 锁定只作用在本地节拍上。" : "本地节拍由浏览器合成，外部音源要各自登录。"}
          </p>
        )}
      </div>
    </section>
  )
}
