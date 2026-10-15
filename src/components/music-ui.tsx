"use client"

import Link from "next/link"
import { ChevronRight, Pause, Play, Search } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { usePlayer } from "@/components/player-provider"
import { tagLabel } from "@/lib/catalog"
import type { Track } from "@/lib/types"

export function MusicHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <header className="music-page-header"><div><p className="music-page-kicker">MUSIC, IN YOUR RHYTHM</p><h1>{title}</h1>{subtitle ? <p className="music-page-subtitle">{subtitle}</p> : null}</div><Link href="/search" className="music-header-search" aria-label="搜索音乐"><Search size={20} /></Link></header>
}

export function MusicSectionHeading({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return <div className="music-section-heading"><div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div>{href ? <Link href={href}>查看全部 <ChevronRight size={15} /></Link> : null}</div>
}

export function MusicTrackCard({ track, queue }: { track: Track; queue: string[] }) {
  const player = usePlayer()
  const playing = player.trackId === track.id && player.status === "playing"
  return <button type="button" className={`music-album-card music-album-${track.tag}`} aria-label={`${playing ? "暂停" : "播放"}${track.title}`} onClick={() => { if (playing) void player.toggle(); else void player.playTrack(track.id, { queue, loop: false }) }}><span className="music-album-art"><CoverArt seed={track.id} title={track.title} className="music-album-photo" /><span className="music-album-shade" /><span className="music-album-brand">PULSEFIT</span><span className="music-album-lettering"><small>{tagLabel[track.tag]}精选</small><strong>{track.titleEn.toUpperCase()}</strong></span><span className="music-album-play">{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</span></span><strong className="music-album-name">{track.title} · {tagLabel[track.tag]}节拍</strong><span className="music-album-byline">PulseFit · {track.bpm} BPM</span></button>
}
