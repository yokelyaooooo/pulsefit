"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { MusicSectionHeading } from "@/components/music-ui"
import { usePlayer } from "@/components/player-provider"
import { musicSourceName, playlistAnchorId } from "@/lib/music/library-data"
import { rememberCatalog } from "@/lib/music/local"
import type { CatalogItem, SyncedPlaylist } from "@/lib/music/types"

interface ChartAlbum { title: string; artist: string; artwork: string }

export function CoverWall({ liked }: { liked: SyncedPlaylist | null }) {
  const own = Boolean(liked?.tracks.length)
  const [charts, setCharts] = useState<ChartAlbum[]>([])
  const player = usePlayer()

  useEffect(() => {
    if (own) return
    const controller = new AbortController()
    void fetch("/api/charts", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return
        const body = (await response.json()) as { albums?: ChartAlbum[] }
        const albums = Array.isArray(body.albums) ? body.albums.filter((album) => album.artwork?.startsWith("https://")) : []
        if (!controller.signal.aborted) setCharts(albums)
      })
      .catch(() => { /* This optional discovery rail stays hidden when the public feed is unavailable. */ })
    return () => controller.abort()
  }, [own])

  const cards = own ? liked!.tracks.slice(0, 10) : charts
  if (!cards.length) return null

  function play(track: CatalogItem) {
    if (!liked) return
    rememberCatalog(liked.tracks)
    if (player.trackId === track.id) void player.toggle()
    else void player.playTrack(track.id, { queue: liked.tracks.map((item) => item.id), loop: false })
  }

  const href = liked ? `/library#${playlistAnchorId(liked.id)}` : "/sources"
  return <section className="music-section"><MusicSectionHeading title={own ? "我喜欢的音乐" : "正在流行的专辑"} subtitle={own ? `${musicSourceName(liked!.source)} · 前 10 首歌曲` : "发现更多值得一听的声音"} href={href} /><AlbumDrift cards={cards.slice(0, 12)} onPlay={own ? (track) => play(track as CatalogItem) : undefined} /><p className="music-chart-caption">{own ? "登录后自动同步 · 点按封面即可播放，查看全部会展开“我喜欢”歌单。" : "iTunes 公开专辑榜 · 封面预览，播放歌曲需连接相应音乐服务。"}</p></section>
}

function AlbumDrift({ cards, onPlay }: { cards: Array<ChartAlbum | CatalogItem>; onPlay?: (track: ChartAlbum | CatalogItem) => void }) {
  const rail = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const loop = cards.length > 4

  useEffect(() => {
    const node = rail.current
    if (!node || !loop || paused) return
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0, previous = 0, position = node.scrollLeft, resumeAt = 0
    let hovered = false, focused = false, touching = false, visible = false
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    observer.observe(node)
    const enter = (event: PointerEvent) => { if (event.pointerType === "mouse") hovered = true }
    const leave = () => { hovered = false }
    const focus = () => { focused = true }
    const blur = () => { focused = false }
    const interact = () => { resumeAt = performance.now() + 3500 }
    const down = () => { touching = true }
    const up = () => { touching = false; interact() }
    const tick = (now: number) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 0
      previous = now
      const duplicate = node.querySelector<HTMLElement>("[data-loop-start]")
      const first = node.firstElementChild as HTMLElement | null
      const distance = duplicate && first ? duplicate.offsetLeft - first.offsetLeft : 0
      if (!motion.matches && !document.hidden && visible && !hovered && !focused && !touching && now > resumeAt && distance > 0) {
        if (Math.abs(node.scrollLeft - position) > 2) position = node.scrollLeft
        position = (position + elapsed * 0.024) % distance
        node.scrollLeft = position
      } else position = node.scrollLeft
      frame = requestAnimationFrame(tick)
    }
    node.addEventListener("pointerenter", enter)
    node.addEventListener("pointerleave", leave)
    node.addEventListener("focusin", focus)
    node.addEventListener("focusout", blur)
    node.addEventListener("wheel", interact, { passive: true })
    node.addEventListener("pointerdown", down)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      node.removeEventListener("pointerenter", enter)
      node.removeEventListener("pointerleave", leave)
      node.removeEventListener("focusin", focus)
      node.removeEventListener("focusout", blur)
      node.removeEventListener("wheel", interact)
      node.removeEventListener("pointerdown", down)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
  }, [loop, paused, cards.length])

  return <div className="music-drift">
    <div ref={rail} className="music-album-rail music-drift-rail" tabIndex={0} role="region" aria-label="专辑封面，可左右滚动；悬停或聚焦时暂停自动滚动">
      {(loop ? [...cards, ...cards] : cards).map((cover, index) => <button type="button" key={`${cover.artwork}-${"id" in cover ? cover.id : cover.title}-${index}`} className="music-album-card music-chart-card" aria-hidden={index >= cards.length || undefined} aria-disabled={!onPlay || undefined} tabIndex={index >= cards.length || !onPlay ? -1 : undefined} data-loop-start={loop && index === cards.length ? "" : undefined} onClick={() => onPlay?.(cover)}><CoverArt seed={cover.title} title={cover.title} artwork={cover.artwork} className="music-chart-art" /><span><strong className="music-album-name">{cover.title}</strong><span className="music-album-byline">{cover.artist}</span></span>{onPlay ? <span className="music-chart-play"><Play size={15} fill="currentColor" /></span> : null}</button>)}
    </div>
    {loop && <button type="button" className="music-drift-toggle" aria-label={paused ? "继续专辑自动滚动" : "暂停专辑自动滚动"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={12} /> : <Pause size={12} />}<span>{paused ? "继续滚动" : "自动漫游"}</span></button>}
  </div>
}
