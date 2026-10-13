"use client"

import { useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Play, X } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import { tracks } from "@/lib/catalog"
import { getFocus } from "@/lib/training/focus"
import { playlistFor, recommendIds } from "@/lib/training/recommend"
import {
  getFocusSnapshot,
  getServerFocusSnapshot,
  hydrateFocus,
  subscribeFocus,
  updateFocus,
} from "@/lib/training/store"

export function FocusScreen() {
  const params = useParams<{ id: string }>()
  const focus = getFocus(String(params.id ?? ""))
  const player = usePlayer()
  const state = useSyncExternalStore(subscribeFocus, getFocusSnapshot, getServerFocusSnapshot)

  useEffect(() => {
    queueMicrotask(hydrateFocus)
  }, [])

  if (!focus) {
    return (
      <div className="space-y-3">
        <h1 className="t-1">没有这个训练页</h1>
        <Link href="/" className="text-sm text-muted-foreground">
          回首页
        </Link>
      </div>
    )
  }

  const library = tracks.map((track) => ({ id: track.id, tag: track.tag, bpm: track.bpm, energy: track.energy }))
  const pinned = state.pins[focus.id]
  const ids = playlistFor(focus, library, pinned)
  const suggestions = recommendIds(focus, library, 8).filter((id) => !ids.includes(id))

  function save(next: string[] | null) {
    const pins = { ...getFocusSnapshot().pins }
    if (next) pins[focus!.id] = next
    else delete pins[focus!.id]
    updateFocus({ pins })
  }

  return (
    <div className="space-y-6">
      <header
        className="relative overflow-hidden rounded-[22px] p-5 text-white shadow-[0_14px_30px_rgba(28,28,30,0.12)]"
        style={{ background: `linear-gradient(155deg, ${focus.accent2}, ${focus.accent} 68%)` }}
      >
        <span className="pointer-events-none absolute -top-10 -right-8 size-32 rounded-full bg-white/25" />
        <p className="t-caption relative text-white/80">{focus.kind === "day" ? "训练日" : "动作"}</p>
        <h1 className="t-large relative mt-1">{focus.name}</h1>
        <p className="t-sub relative mt-2 text-white/90">{focus.blurb}</p>
        <p className="t-caption relative mt-4 text-white/80">
          目标 {focus.targetBpm} BPM · 强度 {Math.round(focus.intensity * 100)} · {pinned ? "你的歌单" : "按类型、强度和 BPM 自动推荐"}
        </p>
      </header>

      <div className="flex gap-2">
        <Button
          disabled={ids.length === 0}
          onClick={() => void player.playTrack(ids[0], { queue: ids, bpm: focus.targetBpm, energy: focus.intensity })}
        >
          <Play />
          播放
        </Button>
        <Button variant="secondary" onClick={() => save(null)} disabled={!pinned}>
          恢复自动推荐
        </Button>
      </div>

      {ids.length === 0 ? (
        <p className="text-sm text-muted-foreground">这首单是空的。从下面的建议里加回去。</p>
      ) : (
        <ul className="space-y-2">
          {ids.map((id) => {
            const track = tracks.find((item) => item.id === id)
            if (!track) return null
            return (
              <li key={id} className="ios-row flex items-center gap-3 px-2 py-2">
                <CoverArt seed={track.id} title={track.title} className="size-12 rounded-[12px]" />
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => void player.playTrack(track.id, { queue: ids, bpm: focus.targetBpm, energy: focus.intensity })}
                >
                  <span className="block truncate font-medium">{track.title}</span>
                  <span className="block text-xs text-muted-foreground">{track.bpm} BPM</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`从${focus.name}移除${track.title}`}
                  onClick={() => save(ids.filter((item) => item !== id))}
                >
                  <X />
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      {suggestions.length > 0 ? (
        <section>
          <h2 className="t-2 mb-3">还可以加上</h2>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
            {suggestions.map((id) => {
              const track = tracks.find((item) => item.id === id)
              if (!track) return null
              return (
                <button key={id} type="button" className="w-[104px] shrink-0 text-left" onClick={() => save([...ids, id])}>
                  <CoverArt seed={track.id} title={track.title} className="aspect-square w-full rounded-[14px]" />
                  <span className="t-caption mt-1.5 block truncate">{track.title}</span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
