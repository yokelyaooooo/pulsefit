"use client"

import { useMemo, useState } from "react"
import { usePersistedStore } from "@/components/use-persisted-store"
import { Heart, Pause, Play } from "lucide-react"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { tagLabel, tracks } from "@/lib/catalog"
import type { WorkoutTag } from "@/lib/types"
import { formatClock } from "@/lib/audio/clock"

const filters = ["all", "saved", "hiit", "strength", "cardio", "yoga", "recover"] as const

export function LibraryScreen() {
  const player = usePlayer()
  usePersistedStore()
  const [filter, setFilter] = useState<(typeof filters)[number]>("all")
  const [query, setQuery] = useState("")

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return tracks.filter((track) => {
      if (filter === "saved" && !player.favorites.includes(track.id)) return false
      if (filter !== "all" && filter !== "saved" && track.tag !== filter) return false
      if (!needle) return true
      return (
        track.title.toLowerCase().includes(needle) ||
        track.titleEn.toLowerCase().includes(needle) ||
        track.blurb.toLowerCase().includes(needle)
      )
    })
  }, [filter, player.favorites, query])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">曲库</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          十二首训练循环，按项目分好。点进去就会按原速响起来。
        </p>
      </header>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜曲名或感觉"
        aria-label="搜索曲目"
        className="h-10"
      />

      <Tabs value={filter} onValueChange={(value) => setFilter(value as (typeof filters)[number])}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          {filters.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item === "all" ? "全部" : item === "saved" ? "收藏" : tagLabel[item as WorkoutTag]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center">
          <p className="font-medium">没有匹配的曲子</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "saved" ? "点曲目右边的心，会收进这里。" : "换个词，或者把筛选清掉。"}
          </p>
          {query || filter !== "all" ? (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setQuery("")
                setFilter("all")
              }}
            >
              清空筛选
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((track) => {
            const playing = player.trackId === track.id && player.status === "playing"
            const saved = player.favorites.includes(track.id)
            return (
              <li key={track.id} className="flex items-center gap-2 rounded-2xl bg-card px-3 py-3 ring-1 ring-white/8">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() =>
                    void player.playTrack(track.id, {
                      queue: visible.map((item) => item.id),
                      loop: false,
                    })
                  }
                >
                  <span className="flex items-baseline gap-2">
                    <span className="font-medium">{track.title}</span>
                    <span className="text-xs text-muted-foreground">{track.titleEn}</span>
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {tagLabel[track.tag]} · {track.bpm} BPM · {formatClock(track.durationSec)}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={saved ? `取消收藏${track.title}` : `收藏${track.title}`}
                  aria-pressed={saved}
                  onClick={() => player.toggleFavorite(track.id)}
                >
                  <Heart className={saved ? "fill-ember text-ember" : ""} />
                </Button>
                <Button
                  size="icon"
                  variant={playing ? "default" : "secondary"}
                  aria-label={playing ? `暂停${track.title}` : `播放${track.title}`}
                  onClick={() => {
                    if (player.trackId === track.id) void player.toggle()
                    else
                      void player.playTrack(track.id, {
                        queue: visible.map((item) => item.id),
                        loop: false,
                      })
                  }}
                >
                  {playing ? <Pause /> : <Play />}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
