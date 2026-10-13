"use client"

import { useState } from "react"
import Link from "next/link"
import { Play } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchLocal } from "@/lib/music/local"
import { rememberCatalog } from "@/lib/music/local"
import { getMusicSnapshot } from "@/lib/music/config"
import { searchSource } from "@/lib/music/resolve"
import type { CatalogItem, MusicSource } from "@/lib/music/types"
import { focuses } from "@/lib/training/focus"
import { formatClock } from "@/lib/audio/clock"

const sources: Array<{ id: MusicSource; label: string }> = [
  { id: "local", label: "本地" },
  { id: "netease", label: "网易云" },
  { id: "qq", label: "QQ 音乐" },
  { id: "apple", label: "Apple" },
]

export function SearchScreen() {
  const player = usePlayer()
  const [term, setTerm] = useState("")
  const [picked, setPicked] = useState<MusicSource[]>(["local"])
  const [results, setResults] = useState<CatalogItem[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [searched, setSearched] = useState(false)

  async function runSearch() {
    const query = term.trim()
    if (!query) return
    setPending(true)
    setSearched(true)
    const found: CatalogItem[] = []
    const problems: string[] = []
    if (picked.includes("local")) found.push(...searchLocal(query))
    const settings = getMusicSnapshot()
    for (const source of picked) {
      if (source === "local") continue
      try {
        found.push(...(await searchSource(source, query, settings)))
      } catch (caught) {
        problems.push(caught instanceof Error ? caught.message : `${source} 搜索失败`)
      }
    }
    rememberCatalog(found)
    setResults(found)
    setNotes(problems)
    setPending(false)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-semibold tracking-tight">搜索</h1>
      </header>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void runSearch()
        }}
      >
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="歌曲、训练日、动作"
          aria-label="搜索"
          className="h-11 rounded-2xl"
        />
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => {
            const on = picked.includes(source.id)
            return (
              <Button
                key={source.id}
                type="button"
                size="sm"
                variant={on ? "default" : "secondary"}
                aria-pressed={on}
                onClick={() =>
                  setPicked((current) =>
                    current.includes(source.id) ? current.filter((item) => item !== source.id) : [...current, source.id]
                  )
                }
              >
                {source.label}
              </Button>
            )
          })}
          <Button type="submit" size="sm" disabled={pending || !term.trim()}>
            {pending ? "搜索中" : "搜索"}
          </Button>
        </div>
      </form>

      {!searched ? (
        <div className="grid grid-cols-2 gap-3">
          {focuses.map((focus) => (
            <Link
              key={focus.id}
              href={`/focus/${focus.id}`}
              className="rounded-3xl p-4"
              style={{ background: `linear-gradient(160deg, ${focus.accent}, ${focus.ink})`, color: "white" }}
            >
              <div className="text-xs opacity-80">{focus.kind === "day" ? "训练日" : "动作"}</div>
              <div className="mt-6 text-2xl font-semibold">{focus.name}</div>
            </Link>
          ))}
        </div>
      ) : null}

      {notes.length > 0 ? (
        <ul className="space-y-2 text-sm text-ember">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      {searched && !pending && results.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-muted-foreground">
          没有结果。外部音源要先在「音源」里配好自己的接口。
        </p>
      ) : null}

      <ul className="space-y-2">
        {results.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/5 px-2 py-2">
            <CoverArt seed={item.id} title={item.title} artwork={item.artwork} className="size-14 rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{item.title}</div>
              <div className="truncate text-xs text-muted-foreground">
                {item.artist} · {item.source === "local" ? `${item.bpm} BPM` : item.source} · {formatClock(item.durationSec)}
              </div>
            </div>
            <Button
              size="icon"
              className="rounded-full"
              aria-label={`播放${item.title}`}
              onClick={() => void player.playTrack(item.id, { queue: results.map((entry) => entry.id) })}
            >
              <Play />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
