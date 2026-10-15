"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronRight, Music2, Pause, Play, Search, X } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { MusicHeader, MusicSectionHeading } from "@/components/music-ui"
import { usePlayer } from "@/components/player-provider"
import { localCatalogItem, rememberCatalog, searchLocal } from "@/lib/music/local"
import { getMusicSnapshot, hydrateMusic } from "@/lib/music/config"
import { searchSource } from "@/lib/music/resolve"
import { tracks } from "@/lib/catalog"
import type { CatalogItem, MusicSource } from "@/lib/music/types"
import type { WorkoutTag } from "@/lib/types"
import { formatClock } from "@/lib/audio/clock"
import "@/components/music-home.css"

const sources: Array<{ id: MusicSource; label: string }> = [{ id: "local", label: "PulseFit" }, { id: "netease", label: "网易云音乐" }, { id: "qq", label: "QQ 音乐" }, { id: "apple", label: "Apple Music" }]
const categories: Array<{ id: WorkoutTag | "all"; title: string; subtitle: string; image: string }> = [
  { id: "hiit", title: "燃脂与冲刺", subtitle: "HIGH ENERGY", image: "/photos/battle.jpg" },
  { id: "strength", title: "力量训练", subtitle: "GET STRONGER", image: "/photos/gym-dark.jpg" },
  { id: "cardio", title: "有氧时刻", subtitle: "KEEP MOVING", image: "/photos/bike-pexels.jpg" },
  { id: "yoga", title: "瑜伽与冥想", subtitle: "FIND YOUR BALANCE", image: "/photos/yoga-pexels.jpg" },
  { id: "recover", title: "放松与恢复", subtitle: "SLOW DOWN", image: "/photos/waves.jpg" },
  { id: "all", title: "全部节拍", subtitle: "PULSEFIT ESSENTIALS", image: "/photos/vinyl.jpg" },
]

export function SearchScreen() {
  const player = usePlayer()
  const requestId = useRef(0)
  const [term, setTerm] = useState("")
  const [picked, setPicked] = useState<MusicSource[]>(["local"])
  const [results, setResults] = useState<CatalogItem[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [searched, setSearched] = useState(false)
  const [resultTitle, setResultTitle] = useState("搜索结果")

  useEffect(() => {
    hydrateMusic()
    const requests = requestId
    return () => { requests.current++ }
  }, [])

  async function runSearch() {
    const query = term.trim()
    if (!query || !picked.length) return
    const request = ++requestId.current
    setPending(true)
    setSearched(true)
    setNotes([])
    setResultTitle(`“${query}”的搜索结果`)
    const settings = getMusicSnapshot()
    const responses = await Promise.allSettled(picked.map((source) => source === "local" ? Promise.resolve(searchLocal(query)) : searchSource(source, query, settings)))
    if (request !== requestId.current) return
    const found: CatalogItem[] = []
    const problems: string[] = []
    responses.forEach((response, index) => {
      if (response.status === "fulfilled") found.push(...response.value)
      else problems.push(response.reason instanceof Error ? response.reason.message : `${sources.find((source) => source.id === picked[index])?.label} 搜索暂不可用`)
    })
    const unique = [...new Map(found.map((item) => [item.id, item])).values()]
    rememberCatalog(unique)
    setResults(unique)
    setNotes(problems)
    setPending(false)
  }

  function browseCategory(category: (typeof categories)[number]) {
    requestId.current++
    const found = tracks.filter((track) => category.id === "all" || track.tag === category.id).map(localCatalogItem)
    rememberCatalog(found)
    setResults(found)
    setTerm("")
    setNotes([])
    setResultTitle(category.title)
    setPending(false)
    setSearched(true)
  }

  function clearSearch() { requestId.current++; setTerm(""); setSearched(false); setResults([]); setNotes([]); setPending(false) }

  return <div className="music-page">
    <MusicHeader title="搜索" subtitle="下一首心动，从这里开始。" />
    <form onSubmit={(event) => { event.preventDefault(); void runSearch() }}>
      <label className="music-search-input"><Search size={18} /><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="歌曲、艺人、专辑或 BPM" aria-label="搜索音乐" />{term || searched ? <button type="button" aria-label="清除搜索" onClick={clearSearch}><X size={17} /></button> : null}</label>
      <div className="music-filter-bar" aria-label="搜索音乐来源">{sources.map((source) => <button key={source.id} type="button" className="music-filter" aria-pressed={picked.includes(source.id)} onClick={() => setPicked((current) => current.includes(source.id) ? current.length === 1 ? current : current.filter((item) => item !== source.id) : [...current, source.id])}>{source.label}</button>)}<button type="submit" className="music-primary-action" disabled={pending || !term.trim()}>{pending ? "搜索中…" : "搜索"}</button></div>
    </form>
    <Link href="/sources" className="music-source-link">管理已连接的音乐服务 <ArrowUpRight size={13} /></Link>
    {notes.length ? <ul className="music-note" role="status">{notes.map((note) => <li key={note}>{note}</li>)}</ul> : null}
    {pending ? <div className="music-empty" role="status"><Music2 size={30} /><strong>正在寻找你的下一首心动…</strong></div> : searched ? <section aria-live="polite"><MusicSectionHeading title={resultTitle} />{results.length === 0 ? <div className="music-empty"><Search size={30} /><strong>没有找到相关音乐</strong><p>试试其他关键词，或在音乐服务中连接你的账号。</p><button type="button" className="music-secondary-action" onClick={clearSearch}>浏览音乐分类</button></div> : <ul className="music-track-list">{results.map((item) => {
      const playing = player.trackId === item.id && player.status === "playing"
      const play = () => { if (player.trackId === item.id) void player.toggle(); else void player.playTrack(item.id, { queue: results.map((entry) => entry.id) }) }
      return <li key={item.id} className="music-track-row"><CoverArt seed={item.id} title={item.title} artwork={item.artwork} className="music-track-row-cover" /><button type="button" className="music-track-row-main" onClick={play}><strong>{item.title}</strong><small>{item.artist} · {item.source === "local" ? `${item.bpm} BPM` : sources.find((source) => source.id === item.source)?.label}</small></button><span className="music-track-row-duration">{formatClock(item.durationSec)}</span><button type="button" className="music-track-action" aria-label={`${playing ? "暂停" : "播放"}${item.title}`} onClick={play}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button></li>
    })}</ul>}</section> : <section><MusicSectionHeading title="浏览分类" /><div className="music-browse-grid">{categories.map((category) => <button key={category.id} type="button" className="music-browse-card" onClick={() => browseCategory(category)}><CoverArt seed={category.id} title={category.title} artwork={category.image} /><span>{category.title}</span><small>{category.subtitle}</small><ChevronRight size={19} /></button>)}</div></section>}
  </div>
}
