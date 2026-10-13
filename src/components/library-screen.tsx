"use client"

import { useMemo, useState } from "react"
import { Paint } from "@/components/artwork"
import { CoverArt } from "@/components/cover-art"
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
        <h1 className="t-large">曲库</h1>
      </header>
      <div className="grid grid-cols-4 gap-2">
        {tracks.slice(0, 4).map((track) => (
          <button
            key={track.id}
            type="button"
            className="text-left"
            onClick={() => void player.playTrack(track.id, { queue: tracks.map((item) => item.id) })}
          >
            <CoverArt seed={track.id} title={track.title} className="aspect-square w-full rounded-[14px] shadow-[0_8px_16px_rgba(28,28,30,0.12)]" />
            <span className="t-caption mt-1 block truncate">{track.title}</span>
          </button>
        ))}
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜曲名或感觉"
        aria-label="搜索曲目"
        className="h-11"
      />

      <Tabs value={filter} onValueChange={(value) => setFilter(value as (typeof filters)[number])}>
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-full bg-[var(--fill)] p-1">
          {filters.map((item) => (
            <TabsTrigger key={item} value={item} className="rounded-full px-3 py-1 text-[13px]">
              {item === "all" ? "全部" : item === "saved" ? "收藏" : tagLabel[item as WorkoutTag]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <Paint tone="pull" className="rounded-[22px] px-4 py-8 text-center">
          <p className="t-headline relative">没有匹配的曲子</p>
          <p className="t-caption relative mt-1 text-white/80">
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
        </Paint>
      ) : (
        <ul className="space-y-2">
          {visible.map((track) => {
            const playing = player.trackId === track.id && player.status === "playing"
            const saved = player.favorites.includes(track.id)
            return (
              <li key={track.id} className="ios-row flex items-center gap-2 px-2.5 py-2.5">
                <CoverArt seed={track.id} title={track.title} className="size-12 rounded-[12px]" />
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
                  <Heart className={saved ? "fill-[#ff2d55] text-[#ff2d55]" : ""} />
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
