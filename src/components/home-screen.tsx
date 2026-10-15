"use client"

import { useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronRight, Dumbbell, Music2, Play, Radio } from "lucide-react"
import { CoverWall } from "@/components/cover-wall"
import { MusicHeader, MusicSectionHeading, MusicTrackCard } from "@/components/music-ui"
import { usePlayer } from "@/components/player-provider"
import { tracks } from "@/lib/catalog"
import { getServerWallSnapshot, getWallSnapshot, hydrateWall, subscribeWall } from "@/lib/music/wall"
import { getMusicSnapshot, getServerMusicSnapshot, hydrateMusic, subscribeMusic } from "@/lib/music/config"
import { hydratePersisted } from "@/lib/storage"
import "@/components/music-home.css"

const essentials = ["meltdown", "iron-law", "night-run", "tide", "flow", "embers"]

export function HomeScreen() {
  const player = usePlayer()
  const wall = useSyncExternalStore(subscribeWall, getWallSnapshot, getServerWallSnapshot)
  const music = useSyncExternalStore(subscribeMusic, getMusicSnapshot, getServerMusicSnapshot)
  const recommended = essentials.flatMap((id) => tracks.filter((track) => track.id === id))

  useEffect(() => {
    hydratePersisted()
    hydrateWall()
    hydrateMusic()
  }, [])

  function playMix(ids: string[]) {
    if (ids[0]) void player.playTrack(ids[0], { queue: ids, loop: false })
  }

  return (
    <div className="music-page">
      <MusicHeader title="现在就听" subtitle="让音乐，跟上你的每一次心跳。" />

      <section className="music-editorial-grid" aria-label="今日精选">
        <div className="music-editorial-item">
          <div className="music-eyebrow">为你精选</div>
          <h2 className="music-editorial-title">好状态，听出来。</h2>
          <p className="music-editorial-caption">你的今日训练原声带</p>
          <button type="button" className="music-hero music-hero-move" onClick={() => playMix(tracks.filter((track) => track.tag === "hiit" || track.tag === "strength").map((track) => track.id))} aria-label="播放今日训练原声带">
            <span className="music-hero-brand"><Music2 size={17} /> PULSEFIT MUSIC</span>
            <span className="music-hero-big-type">MOVE<br /><span>WITH</span><br />THE BEAT.</span>
            <span className="music-glass-disc" aria-hidden="true"><span /><i /></span>
            <span className="music-hero-footer"><span>给每一次突破<br /><strong>一个心动的节拍。</strong></span><span className="music-glass-play"><Play size={20} fill="currentColor" /></span></span>
          </button>
        </div>
        <div className="music-editorial-item">
          <div className="music-eyebrow">给自己一点时间</div>
          <h2 className="music-editorial-title">把世界调成慢速。</h2>
          <p className="music-editorial-caption">呼吸、舒展，让身心回到平衡</p>
          <button type="button" className="music-hero music-hero-unwind" onClick={() => playMix(["tide", "flow", "embers", "landing"])} aria-label="播放放松与恢复歌单">
            {/* Existing licensed photo; attribution is in public/photos/ATTRIBUTION.md. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photos/waves.jpg" alt="" className="music-hero-photo" />
            <span className="music-hero-brand"><Music2 size={17} /> PULSEFIT CHILL</span>
            <span className="music-unwind-type">慢下来，<br />也很好。</span>
            <span className="music-unwind-english">TAKE A BREATH.</span>
            <span className="music-hero-footer"><span>放松与恢复<br /><strong>在节拍之间，找回自己。</strong></span><span className="music-glass-play"><Play size={20} fill="currentColor" /></span></span>
          </button>
        </div>
      </section>

      <section className="music-section">
        <MusicSectionHeading title="为你的训练而选" subtitle="从热身到最后一组，总有合拍的节奏。" href="/library" />
        <div className="music-album-rail">
          {recommended.map((track) => <MusicTrackCard key={track.id} track={track} queue={recommended.map((item) => item.id)} />)}
        </div>
      </section>

      <section className="music-section">
        <MusicSectionHeading title="找到你的节奏" href="/search" />
        <div className="music-station-grid">
          <button type="button" className="music-station music-station-energy" onClick={() => playMix(["burst", "meltdown", "ramp", "core"])}>
            <Radio size={26} /><span><strong>全力以赴</strong><small>高能节拍 · 132–174 BPM</small></span><Play size={18} fill="currentColor" />
          </button>
          <button type="button" className="music-station music-station-focus" onClick={() => playMix(["barbell", "iron-law", "core"])}>
            <Music2 size={26} /><span><strong>专注每一组</strong><small>力量时刻 · 102–132 BPM</small></span><Play size={18} fill="currentColor" />
          </button>
          <button type="button" className="music-station music-station-calm" onClick={() => playMix(["tide", "embers", "landing"])}>
            <Radio size={26} /><span><strong>呼吸之间</strong><small>舒缓慢拍 · 60–72 BPM</small></span><Play size={18} fill="currentColor" />
          </button>
        </div>
      </section>

      <CoverWall personal={wall.imported.filter((cover) => cover.source === "netease" ? Boolean(music.neteaseCookie || music.neteaseName) : cover.source === "qq" ? Boolean(music.qqCookie || music.qqName) : cover.source === "apple" ? Boolean(music.appleToken) : true)} />

      <Link href="/train" className="music-training-link"><span className="music-training-icon"><Dumbbell size={23} /></span><span><strong>音乐就位，开始今天的训练</strong><small>记录每一组，见证每一点进步。</small></span><ChevronRight size={19} /></Link>
      <footer className="music-page-footer"><span>PulseFit 原创合成节拍 · 为运动而生</span><Link href="/sources">连接你的音乐服务 <ArrowUpRight size={13} /></Link></footer>
    </div>
  )
}
