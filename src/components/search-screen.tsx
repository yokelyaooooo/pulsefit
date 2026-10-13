"use client"

import { useState } from "react"
import { Play, Search } from "lucide-react"
import { Paint } from "@/components/artwork"
import { CoverArt } from "@/components/cover-art"
import { FocusTile } from "@/components/focus-tile"
import { usePlayer } from "@/components/player-provider"
import { Button } from "@/components/ui/button"
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
    <div className="space-y-5">
      <header>
        <h1 className="t-large">搜索</h1>
      </header>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void runSearch()
        }}
      >
        <label className="flex h-11 items-center gap-2 rounded-[12px] bg-[var(--fill)] px-3">
          <Search className="size-4 shrink-0 text-[color:var(--label-secondary)]" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="歌曲、训练日、动作"
            aria-label="搜索"
            className="t-body min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-[color:var(--label-tertiary)]"
          />
        </label>
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
            <FocusTile key={focus.id} focus={focus} />
          ))}
        </div>
      ) : null}

      {notes.length > 0 ? (
        <ul className="space-y-2 text-sm text-[#ff3b30]">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      {searched && !pending && results.length === 0 ? (
        <Paint tone="search" className="rounded-[22px] px-4 py-8">
          <p className="t-headline relative">没有结果</p>
          <p className="t-caption relative mt-1 text-white/85">外部音源要先在「音源」里配好自己的接口。</p>
        </Paint>
      ) : null}

      <ul className="space-y-2">
        {results.map((item) => (
          <li key={item.id} className="ios-row flex items-center gap-3 px-2 py-2">
            <CoverArt seed={item.id} title={item.title} artwork={item.artwork} className="size-14 rounded-[12px]" />
            <div className="min-w-0 flex-1">
              <div className="t-headline truncate">{item.title}</div>
              <div className="t-caption truncate text-[color:var(--label-secondary)]">
                {item.artist} · {item.source === "local" ? `${item.bpm} BPM` : item.source} · {formatClock(item.durationSec)}
              </div>
            </div>
            <Button
              size="icon"
              className="rounded-full"
              aria-label={`播放${item.title}`}
              onClick={() => void player.playTrack(item.id, { queue: results.map((entry) => entry.id) })}
            >
              <Play className="fill-current" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
