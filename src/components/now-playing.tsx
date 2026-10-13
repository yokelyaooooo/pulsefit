"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Pause, Play, SkipBack, SkipForward, TextQuote, Volume1, Volume2 } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { LyricsView } from "@/components/lyrics-view"
import { usePlayer } from "@/components/player-provider"
import { Slider } from "@/components/ui/slider"
import { formatClock } from "@/lib/audio/clock"
import { plateFor, trackPlate } from "@/lib/media"
import { cn } from "@/lib/utils"

const sliderTone =
  "[&_[data-slot=slider-track]]:h-[3px] [&_[data-slot=slider-track]]:bg-white/25 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:size-[7px] [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-none"

export function NowPlaying({ onClose }: { onClose?: () => void }) {
  const player = usePlayer()
  const now = player.now
  const [drag, setDrag] = useState<number | null>(null)
  const [lyricsOpen, setLyricsOpen] = useState(false)
  const position = drag ?? player.positionSec
  const local = now?.source === "local"
  const coverRef = useRef<HTMLDivElement>(null)
  const bpmRef = useRef<HTMLSpanElement>(null)
  const pipRef = useRef<HTMLSpanElement>(null)
  const art = now?.artwork || trackPlate[now?.id ?? ""] || plateFor(now?.id ?? "pulsefit")
  const duration = Math.max(player.durationSec, 1)
  const remain = Math.max(0, player.durationSec - position)

  useEffect(() => {
    return player.subscribeVisual((snapshot) => {
      const cover = coverRef.current
      if (cover) {
        const pulse = snapshot.playing ? 1 + (1 - snapshot.beatPhase) * 0.016 : 1
        const glow = snapshot.playing ? 0.08 + (snapshot.kick ? 0.2 : (1 - snapshot.beatPhase) * 0.1) : 0
        cover.style.transform = `scale(${pulse})`
        cover.style.boxShadow = `0 22px 44px rgba(0,0,0,0.38), 0 0 ${16 + glow * 22}px rgba(255,255,255,${glow})`
      }
      if (bpmRef.current) bpmRef.current.textContent = String(Math.round(snapshot.bpm) || now?.bpm || "—")
      if (pipRef.current) {
        const level = snapshot.playing ? 0.4 + (snapshot.kick ? 0.6 : (1 - snapshot.beatPhase) * 0.35) : 0.35
        pipRef.current.style.opacity = String(level)
        pipRef.current.style.transform = snapshot.kick ? "scale(1.35)" : "scale(1)"
      }
    })
  }, [now, player])

  return (
    <section className="relative w-full max-w-[430px] overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0">
        {/* Blurred artwork supplies the player color, the same way Apple Music does. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover blur-3xl saturate-150" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/20 to-black/75" />
      </div>

      <div className="relative flex flex-col px-5 pt-3 pb-6">
        <div className="flex h-10 items-center justify-between">
          {onClose ? (
            <button type="button" className="grid size-9 place-items-center text-white/90" aria-label="收起" onClick={onClose}>
              <ChevronDown className="size-7" strokeWidth={2.25} />
            </button>
          ) : (
            <span className="text-[12px] text-white/55">空格键播放</span>
          )}
          <button
            type="button"
            className={cn(
              "grid size-9 place-items-center rounded-full transition",
              lyricsOpen ? "bg-white/18 text-white" : "text-white/75"
            )}
            aria-label="歌词"
            aria-pressed={lyricsOpen}
            onClick={() => setLyricsOpen((open) => !open)}
          >
            <TextQuote className="size-5" />
          </button>
        </div>

        <div className="grid">
          <div
            className={cn(
              "col-start-1 row-start-1 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              lyricsOpen ? "pointer-events-none scale-[0.96] opacity-0" : "opacity-100"
            )}
            inert={lyricsOpen}
          >
            <button
              type="button"
              className="mt-2 block w-full"
              aria-label="查看歌词"
              onClick={() => setLyricsOpen(true)}
            >
              <div ref={coverRef} className="origin-center">
                <CoverArt
                  seed={now?.id ?? "pulsefit"}
                  title={now?.title ?? "燃律"}
                  artwork={now?.artwork}
                  className="aspect-square w-full rounded-[12px]"
                />
              </div>
            </button>
            <div className="mt-6 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-[22px] leading-tight font-bold tracking-[-0.4px]">
                  {now ? now.title : "还没有在播"}
                </h2>
                <p className="mt-1 truncate text-[17px] text-[#ff4d6a]">{now ? now.artist : "从首页或曲库选一首"}</p>
              </div>
              <p className="mb-1 flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-white/60 tabular-nums">
                <span ref={pipRef} className="size-1.5 rounded-full bg-white" />
                <span ref={bpmRef}>{now?.bpm ?? "—"}</span>
                BPM
              </p>
            </div>
          </div>

          <div
            className={cn(
              "col-start-1 row-start-1 flex flex-col transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              lyricsOpen ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
            )}
            inert={!lyricsOpen}
          >
            <button type="button" className="mt-1 flex items-center gap-3 text-left" onClick={() => setLyricsOpen(false)}>
              <CoverArt
                seed={now?.id ?? "pulsefit"}
                title={now?.title ?? "燃律"}
                artwork={now?.artwork}
                className="size-11 shrink-0 rounded-[6px]"
              />
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-semibold">{now ? now.title : "还没有在播"}</span>
                <span className="mt-0.5 block truncate text-[13px] text-[#ff4d6a]">{now ? now.artist : "燃律"}</span>
              </span>
            </button>
            <LyricsView
              lines={player.lyrics}
              time={position}
              onSeek={(time) => player.seek(time)}
              className="mt-2 h-[430px]"
            />
          </div>
        </div>

        <div className="mt-5">
          <Slider
            aria-label="播放进度"
            className={sliderTone}
            min={0}
            max={duration}
            step={0.1}
            value={[Math.min(position, duration)]}
            disabled={!now}
            onValueChange={(value) => setDrag(value[0] ?? 0)}
            onValueCommit={(value) => {
              player.seek(value[0] ?? 0)
              setDrag(null)
            }}
          />
          <div className="mt-1.5 flex justify-between text-[12px] font-medium text-white/60 tabular-nums">
            <span>{formatClock(position)}</span>
            <span>-{formatClock(remain)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between px-2">
          <button type="button" className="grid size-12 place-items-center text-white disabled:opacity-30" aria-label="上一首" onClick={() => void player.prev()} disabled={!now}>
            <SkipBack className="size-8 fill-white" />
          </button>
          <button
            type="button"
            className="grid size-16 place-items-center text-white"
            aria-label={player.status === "playing" ? "暂停" : "播放"}
            onClick={() => void player.toggle()}
          >
            {player.status === "playing" ? <Pause className="size-11 fill-white" /> : <Play className="size-11 fill-white" />}
          </button>
          <button type="button" className="grid size-12 place-items-center text-white disabled:opacity-30" aria-label="下一首" onClick={() => void player.next()} disabled={!now}>
            <SkipForward className="size-8 fill-white" />
          </button>
        </div>

        <label className="mt-4 flex items-center gap-3 text-white/80">
          <Volume1 className="size-4 shrink-0" />
          <Slider
            aria-label="音量"
            className={sliderTone}
            min={0}
            max={100}
            step={1}
            value={[Math.round(player.volume * 100)]}
            onValueChange={(value) => player.setVolume((value[0] ?? 80) / 100)}
          />
          <Volume2 className="size-4 shrink-0" />
        </label>

        {local ? (
          <div className="mt-3 grid grid-cols-2 gap-4 text-[11px] text-white/45">
            <label className="space-y-1">
              <span className="flex justify-between">
                节拍
                <span className="tabular-nums text-white/70">{player.bpm}</span>
              </span>
              <Slider
                aria-label="节拍"
                className={sliderTone}
                min={60}
                max={190}
                step={1}
                value={[player.bpm]}
                onValueChange={(value) => player.setBpm(value[0] ?? player.bpm)}
              />
            </label>
            <label className="space-y-1">
              <span className="flex justify-between">
                能量
                <span className="tabular-nums text-white/70">{Math.round(player.energy * 100)}</span>
              </span>
              <Slider
                aria-label="能量"
                className={sliderTone}
                min={0}
                max={100}
                step={1}
                value={[Math.round(player.energy * 100)]}
                onValueChange={(value) => player.setEnergy((value[0] ?? 70) / 100)}
              />
            </label>
          </div>
        ) : null}
      </div>
    </section>
  )
}
