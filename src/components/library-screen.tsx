"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Heart, Music2, Pause, Play, Search, Shuffle } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { MusicHeader, MusicSectionHeading, MusicTrackCard } from "@/components/music-ui"
import { Equalizer } from "@/components/music-marks"
import { usePersistedStore } from "@/components/use-persisted-store"
import { usePlayer } from "@/components/player-provider"
import { tagLabel, tracks } from "@/lib/catalog"
import type { WorkoutTag } from "@/lib/types"
import { formatClock } from "@/lib/audio/clock"
import "@/components/music-home.css"

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
      return !needle || [track.title, track.titleEn, track.blurb, String(track.bpm)].join(" ").toLowerCase().includes(needle)
    })
  }, [filter, player.favorites, query])

  function playAll(shuffle: boolean) {
    const queue = visible.map((track) => track.id)
    const first = shuffle ? queue[Math.floor(Math.random() * queue.length)] : queue[0]
    if (first) void player.playTrack(first, { queue, shuffle, loop: false })
  }

  return <div className="music-page">
    <MusicHeader title="资料库" subtitle="喜欢的节拍，随时回到你身边。" />
    <section>
      <MusicSectionHeading title="你的训练原声带" />
      <div className="music-album-rail">{[tracks[0], tracks[2], tracks[7], tracks[8]].map((track) => <MusicTrackCard key={track.id} track={track} queue={tracks.map((item) => item.id)} />)}</div>
    </section>
    <section className="music-section">
      <MusicSectionHeading title="歌曲" />
      <label className="music-search-input"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="在资料库中搜索" aria-label="搜索资料库" /></label>
      <div className="music-filter-bar" aria-label="筛选歌曲">{filters.map((item) => <button key={item} type="button" className="music-filter" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item === "all" ? "全部歌曲" : item === "saved" ? "我的收藏" : tagLabel[item as WorkoutTag]}</button>)}</div>
      <div className="music-library-actions"><button type="button" className="music-primary-action" disabled={!visible.length} onClick={() => playAll(false)}><Play size={15} fill="currentColor" />播放</button><button type="button" className="music-secondary-action" disabled={!visible.length} onClick={() => playAll(true)}><Shuffle size={16} />随机播放</button><span>{visible.length} 首歌曲</span></div>
      {visible.length === 0 ? <div className="music-empty"><Music2 size={30} /><strong>{filter === "saved" && !query.trim() ? "收好每一首心动" : "还没有找到这首歌"}</strong><p>{filter === "saved" && !query.trim() ? "点按歌曲旁的爱心，把喜欢的节拍留在这里。" : "试试歌曲名称、英文名或 BPM。"}</p><button type="button" className="music-secondary-action" onClick={() => { setFilter("all"); setQuery("") }}>浏览全部歌曲</button></div> : <ol className="music-track-list">{visible.map((track, index) => {
        const playing = player.trackId === track.id && player.status === "playing"
        const saved = player.favorites.includes(track.id)
        const play = () => { if (player.trackId === track.id) void player.toggle(); else void player.playTrack(track.id, { queue: visible.map((item) => item.id), loop: false }) }
        return <li key={track.id} className="music-track-row"><span className="music-track-number">{String(index + 1).padStart(2, "0")}</span><CoverArt seed={track.id} title={track.title} className="music-track-row-cover" /><button type="button" className="music-track-row-main" onClick={play}><strong>{track.title}{playing ? <Equalizer /> : null}</strong><small>{track.titleEn} · {tagLabel[track.tag]} · {track.bpm} BPM</small></button><span className="music-track-row-duration">{formatClock(track.durationSec)}</span><button type="button" className="music-track-action" aria-label={saved ? `取消收藏${track.title}` : `收藏${track.title}`} aria-pressed={saved} onClick={() => player.toggleFavorite(track.id)}><Heart size={18} fill={saved ? "currentColor" : "none"} /></button><button type="button" className="music-track-action" aria-label={playing ? `暂停${track.title}` : `播放${track.title}`} onClick={play}>{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button></li>
      })}</ol>}
    </section>
    <footer className="music-page-footer"><span>PulseFit 原创合成节拍 · {tracks.length} 首</span><Link href="/sources">连接更多音乐 <ArrowUpRight size={13} /></Link></footer>
  </div>
}
