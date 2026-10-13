"use client"

import { useEffect, useState } from "react"
import { Equalizer } from "@/components/music-marks"
import { rankCovers, type WallCover } from "@/lib/music/wall"

interface ChartAlbum {
  title: string
  artist: string
  artwork: string
}

export function CoverWall({ personal }: { personal: WallCover[] }) {
  const ranked = rankCovers(personal)
  const own = ranked.length > 0
  const [charts, setCharts] = useState<ChartAlbum[]>([])
  const [note, setNote] = useState(own ? "" : "正在取公开榜单封面…")

  useEffect(() => {
    if (own) return
    const controller = new AbortController()
    void fetch("/api/charts", { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as { albums?: ChartAlbum[]; error?: string }
        const albums = Array.isArray(body.albums) ? body.albums.filter((album) => album.artwork?.startsWith("https://")) : []
        setCharts(albums)
        setNote(albums.length ? "" : body.error || "榜单暂时取不到。")
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return
        setNote("榜单暂时取不到。")
      })
    return () => controller.abort()
  }, [own])

  const cards = own
    ? ranked.map((cover) => ({ key: cover.id, title: cover.title, artist: cover.artist, artwork: cover.artwork }))
    : charts.map((album, index) => ({ key: `${album.artwork}-${index}`, title: album.title, artist: album.artist, artwork: album.artwork }))

  const rowA = cards.filter((_, index) => index % 2 === 0)
  const rowB = cards.filter((_, index) => index % 2 === 1)
  const caption = own ? "常听 · 来自已导入的歌单封面，按本机播放次数排" : "榜单 · iTunes 公开专辑榜，只展示封面，不在燃律里播放"

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="t-2 flex items-center gap-2">
          {own ? "常听封面" : "封面墙"}
          <Equalizer />
        </h2>
      </div>
      {cards.length === 0 ? (
        <p className="t-caption text-[color:var(--label-secondary)]">{note || "封面还在路上。"}</p>
      ) : (
        <div className="cover-wall -mx-5 space-y-2 overflow-hidden py-1">
          <WallRow covers={rowA.length ? rowA : cards} reverse={false} />
          <WallRow covers={rowB.length ? rowB : cards} reverse />
        </div>
      )}
      {cards.length > 0 ? <p className="t-caption text-[color:var(--label-secondary)]">{caption}</p> : null}
    </section>
  )
}

function WallRow({
  covers,
  reverse,
}: {
  covers: Array<{ key: string; title: string; artist: string; artwork: string }>
  reverse: boolean
}) {
  const loop = [...covers, ...covers]
  return (
    <div className={reverse ? "cover-drift-reverse flex w-max gap-2" : "cover-drift flex w-max gap-2"}>
      {loop.map((cover, index) => (
        <figure key={`${cover.key}-${index}`} className="w-[92px] shrink-0">
          {/* Artwork URL is served by the connected host or Apple's CDN. It is not stored in this repo. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.artwork} alt="" className="aspect-square w-full rounded-[12px] object-cover shadow-[0_8px_16px_rgba(28,28,30,0.16)]" />
          <figcaption className="sr-only">
            {cover.title} · {cover.artist}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
