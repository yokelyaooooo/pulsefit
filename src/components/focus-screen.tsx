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
        <h1 className="text-3xl font-semibold">没有这个训练页</h1>
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
        className="rounded-[2rem] p-5 text-white"
        style={{ background: `linear-gradient(160deg, ${focus.accent}, ${focus.ink})` }}
      >
        <p className="text-xs tracking-[0.18em] uppercase opacity-80">{focus.kind === "day" ? "训练日" : "动作"}</p>
        <h1 className="mt-2 text-4xl font-semibold">{focus.name}</h1>
        <p className="mt-3 text-sm leading-6 opacity-90">{focus.blurb}</p>
        <p className="mt-4 text-xs opacity-80">
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
              <li key={id} className="flex items-center gap-3 rounded-2xl bg-white/5 px-2 py-2">
                <CoverArt seed={track.id} title={track.title} className="size-12 rounded-xl" />
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
          <h2 className="mb-2 text-sm text-muted-foreground">还可以加上</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((id) => {
              const track = tracks.find((item) => item.id === id)
              if (!track) return null
              return (
                <Button key={id} size="sm" variant="secondary" onClick={() => save([...ids, id])}>
                  {track.title}
                </Button>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
