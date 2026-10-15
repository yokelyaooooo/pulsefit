"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { MusicSectionHeading } from "@/components/music-ui"
import { rankCovers, type WallCover } from "@/lib/music/wall"

interface ChartAlbum { title: string; artist: string; artwork: string }

export function CoverWall({ personal }: { personal: WallCover[] }) {
  const ranked = rankCovers(personal)
  const own = ranked.length > 0
  const [charts, setCharts] = useState<ChartAlbum[]>([])

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

  const cards = own ? ranked : charts
  if (!cards.length) return null

  return <section className="music-section"><MusicSectionHeading title={own ? "你的常听专辑" : "正在流行的专辑"} subtitle={own ? "来自你导入的歌单" : "发现更多值得一听的声音"} href="/sources" /><AlbumDrift cards={cards.slice(0, 12)} /><p className="music-chart-caption">{own ? "已导入的专辑封面，可在搜索中查找并播放歌曲。" : "iTunes 公开专辑榜 · 封面预览，播放歌曲需连接相应音乐服务。"}</p></section>
}

function AlbumDrift({ cards }: { cards: ChartAlbum[] }) {
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
      {(loop ? [...cards, ...cards] : cards).map((cover, index) => <figure key={`${cover.artwork}-${index}`} className="music-album-card" aria-hidden={index >= cards.length || undefined} data-loop-start={loop && index === cards.length ? "" : undefined}><CoverArt seed={cover.title} title={cover.title} artwork={cover.artwork} className="music-chart-art" /><figcaption><strong className="music-album-name">{cover.title}</strong><span className="music-album-byline">{cover.artist}</span></figcaption></figure>)}
    </div>
    {loop && <button type="button" className="music-drift-toggle" aria-label={paused ? "继续专辑自动滚动" : "暂停专辑自动滚动"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={12} /> : <Pause size={12} />}<span>{paused ? "继续滚动" : "自动漫游"}</span></button>}
  </div>
}
