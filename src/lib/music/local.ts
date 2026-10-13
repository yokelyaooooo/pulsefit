import { tracks } from "@/lib/catalog"
import type { Track } from "@/lib/types"
import type { CatalogItem, Playable } from "@/lib/music/types"

export function localCatalogItem(track: Track): CatalogItem {
  return {
    id: track.id,
    source: "local",
    nativeId: track.id,
    title: track.title,
    artist: "燃律 PulseFit",
    album: track.titleEn,
    artwork: null,
    durationSec: track.durationSec,
    bpm: track.bpm,
  }
}

export function searchLocal(term: string): CatalogItem[] {
  const query = term.trim().toLowerCase()
  const matched = query
    ? tracks.filter((track) =>
        [track.title, track.titleEn, track.blurb, String(track.bpm)].join(" ").toLowerCase().includes(query)
      )
    : tracks
  return matched.map(localCatalogItem)
}

export function localPlayable(id: string): Playable | null {
  const track = tracks.find((item) => item.id === id)
  if (!track) return null
  const cues = [
    track.title,
    `${track.titleEn} · ${track.bpm}`,
    "吸气，肩沉下来",
    "一，发力",
    "二，收回",
    "三，稳住核心",
    "四，换边",
    track.blurb,
    "组间把气吐干净",
    "再跟四拍",
    "节奏还在，别抢",
    "最后一下，干净落地",
  ]
  const step = track.durationSec / cues.length
  const lyrics = cues.map((line, index) => `[${formatStamp(index * step)}]${line}`).join("\n")
  return {
    ...localCatalogItem(track),
    audioUrl: null,
    lyricsText: lyrics,
    previewOnly: false,
    note: null,
  }
}

function formatStamp(seconds: number) {
  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const remain = whole % 60
  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}.00`
}

const remembered = new Map<string, Playable>()
const catalogMemory = new Map<string, CatalogItem>()

export function rememberPlayable(item: Playable) {
  remembered.set(item.id, item)
  catalogMemory.set(item.id, item)
}

export function rememberCatalog(items: CatalogItem[]) {
  items.forEach((item) => catalogMemory.set(item.id, item))
}

export function recallCatalog(id: string) {
  return catalogMemory.get(id) ?? localPlayable(id) ?? undefined
}

export function recallPlayable(id: string) {
  return remembered.get(id) ?? localPlayable(id)
}
