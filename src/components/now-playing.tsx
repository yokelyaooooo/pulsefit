"use client"

import { useEffect, useRef, useState } from "react"
import { AudioLines, ChevronDown, ListMusic, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, SlidersHorizontal, Star, TextQuote, Volume1, Volume2, VolumeX } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { CoverArt } from "@/components/cover-art"
import { LyricsView } from "@/components/lyrics-view"
import { usePlayer } from "@/components/player-provider"
import { Slider } from "@/components/ui/slider"
import { formatClock } from "@/lib/audio/clock"
import { plateFor, trackPlate } from "@/lib/media"
import { recallCatalog } from "@/lib/music/local"
import { cn } from "@/lib/utils"
import styles from "@/components/player-surfaces.module.css"

type PlayerView = "cover" | "lyrics" | "queue" | "tuning"

export function NowPlaying({ onClose }: { onClose?: () => void }) {
  const player = usePlayer()
  const now = player.now
  const [drag, setDrag] = useState<number | null>(null)
  const [view, setView] = useState<PlayerView>("cover")
  const coverRef = useRef<HTMLDivElement>(null)
  const bpmRef = useRef<HTMLSpanElement>(null)
  const pipRef = useRef<HTMLSpanElement>(null)
  const previousVolume = useRef(0.8)
  const position = drag ?? player.positionSec
  const duration = Math.max(player.durationSec, 1)
  const remain = Math.max(0, player.durationSec - position)
  const art = now?.artwork || trackPlate[now?.id ?? ""] || plateFor(now?.id ?? "pulsefit")
  const favorite = Boolean(now && player.favorites.includes(now.id))
  const playing = player.status === "playing"
  const local = now?.source === "local"
  const queue = player.queue.map((id) => ({ id, item: recallCatalog(id) }))
  const currentIndex = player.queue.indexOf(now?.id ?? "")
  const sourceLabel = now?.source === "apple" ? "Apple Music" : now?.source === "netease" ? "网易云音乐" : now?.source === "qq" ? "QQ 音乐" : "燃律音乐"
  const subscribeVisual = player.subscribeVisual

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    return subscribeVisual((snapshot) => {
      if (coverRef.current && !reduceMotion) coverRef.current.style.transform = `scale(${snapshot.playing ? 1 + (1 - snapshot.beatPhase) * 0.008 : 0.96})`
      if (bpmRef.current) bpmRef.current.textContent = String(Math.round(snapshot.bpm) || now?.bpm || "—")
      if (pipRef.current) pipRef.current.style.opacity = String(snapshot.playing ? 0.5 + (snapshot.kick ? 0.5 : (1 - snapshot.beatPhase) * 0.35) : 0.4)
    })
  }, [now?.bpm, subscribeVisual])

  const toggleView = (next: PlayerView) => setView((current) => current === next ? "cover" : next)
  const toggleMute = () => {
    if (player.volume > 0) {
      previousVolume.current = player.volume
      player.setVolume(0)
    } else player.setVolume(previousVolume.current)
  }

  return (
    <section className={styles.player} aria-label="正在播放">
      <div className={styles.ambient} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} alt="" />
      </div>
      <div className={styles.playerContent}>
        <header className={styles.playerHeader}>
          {onClose ? <button type="button" className={styles.roundButton} aria-label="收起播放器" onClick={onClose}><ChevronDown size={25} /></button> : <AudioLines size={22} aria-hidden="true" />}
          <span>{view === "lyrics" ? "歌词" : view === "queue" ? "待播清单" : view === "tuning" ? "训练节拍" : "正在播放"}</span>
          <span className={styles.headerSpacer} />
        </header>

        <div className={styles.mainArea}>
          {view === "cover" ? (
            <div className={styles.artStage}><div ref={coverRef} className={styles.coverFrame}>
              {now ? <CoverArt seed={now.id} title={now.title} artwork={now.artwork} className={styles.fullCover} /> : <BrandMark className={styles.fullCover} />}
            </div></div>
          ) : (
            <div className={styles.detailPanel}>
              <button type="button" className={styles.compactTrack} onClick={() => setView("cover")} aria-label="返回专辑封面">
                {now ? <CoverArt seed={now.id} title={now.title} artwork={now.artwork} className={styles.compactCover} /> : <BrandMark className={styles.compactCover} />}
                <span><strong>{now?.title ?? "随心聆听"}</strong><small>{now?.artist ?? "燃律音乐"}</small></span>
              </button>
              {view === "lyrics" ? <LyricsView lines={player.lyrics} time={position} onSeek={player.seek} className={styles.lyrics} /> : view === "queue" ? (
                <div className={styles.queueScroll}>
                  <div className={styles.queueHeading}><h3>接下来播放</h3><span>{Math.max(0, queue.length - currentIndex - 1)} 首</span></div>
                  <ol className={styles.queueList}>
                    {queue.map(({ id, item }, index) => (
                      <li key={`${id}-${index}`}><button type="button" className={cn(styles.queueTrack, id === now?.id && styles.queueCurrent)} aria-label={`播放 ${item?.title ?? id}`} aria-current={id === now?.id ? "true" : undefined} onClick={() => void player.playTrack(id, { queue: player.queue })}>
                        <CoverArt seed={id} title={item?.title ?? id} artwork={item?.artwork} className={styles.queueCover} />
                        <span><strong>{item?.title ?? id}</strong><small>{item?.artist ?? sourceLabel}</small></span>
                        {id === now?.id ? <AudioLines size={19} /> : <span className={styles.queueTime}>{item ? formatClock(item.durationSec) : ""}</span>}
                      </button></li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className={styles.tuning}>
                  <div className={styles.tuningIntro}><AudioLines size={30} /><h3>找到你的节奏</h3><p>跟随每一次发力，调整训练音乐的节拍与能量。</p></div>
                  {local ? <>
                    <label className={styles.tuningLabel}><span>节拍 <strong>{player.bpm}<small> BPM</small></strong></span><Slider aria-label="训练节拍" className={styles.slider} min={60} max={190} step={1} value={[player.bpm]} onValueChange={(value) => player.setBpm(value[0] ?? player.bpm)} /></label>
                    <label className={styles.tuningLabel}><span>能量 <strong>{Math.round(player.energy * 100)}<small> %</small></strong></span><Slider aria-label="训练音乐能量" className={styles.slider} min={0} max={100} step={1} value={[Math.round(player.energy * 100)]} onValueChange={(value) => player.setEnergy((value[0] ?? 70) / 100)} /></label>
                  </> : <p className={styles.tuningHint}>选择燃律原创训练音乐，即可调节节拍与能量。</p>}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.metadata}>
          <div className={styles.trackName}><h2>{now?.title ?? "音乐，让运动有了节奏"}</h2><p>{now?.artist ?? "选一首喜欢的，或直接开始播放"}</p></div>
          <button type="button" className={cn(styles.roundButton, styles.favorite, favorite && styles.isFavorite)} aria-label={favorite ? "取消收藏" : "收藏歌曲"} aria-pressed={favorite} disabled={!now} onClick={() => now && player.toggleFavorite(now.id)}><Star size={21} fill={favorite ? "currentColor" : "none"} /></button>
        </div>

        <div className={styles.timeline}>
          <Slider aria-label="播放进度" className={styles.slider} min={0} max={duration} step={0.1} value={[Math.min(position, duration)]} disabled={!now} onValueChange={(value) => setDrag(value[0] ?? 0)} onValueCommit={(value) => { player.seek(value[0] ?? 0); setDrag(null) }} />
          <div className={styles.timestamps}><span>{formatClock(position)}</span><span>-{formatClock(remain)}</span></div>
        </div>

        <div className={styles.transport}>
          <button type="button" className={cn(styles.modeButton, player.shuffle && styles.modeActive)} aria-label="随机播放" aria-pressed={player.shuffle} onClick={player.toggleShuffle}><Shuffle size={20} /></button>
          <button type="button" aria-label="上一首" onClick={() => void player.prev()} disabled={!now}><SkipBack size={34} fill="currentColor" strokeWidth={1.25} /></button>
          <button type="button" className={styles.playButton} aria-label={playing ? "暂停" : "播放"} onClick={() => void player.toggle()}>{playing ? <Pause size={47} fill="currentColor" strokeWidth={1.25} /> : <Play size={47} fill="currentColor" strokeWidth={1.25} />}</button>
          <button type="button" aria-label="下一首" onClick={() => void player.next()} disabled={!now}><SkipForward size={34} fill="currentColor" strokeWidth={1.25} /></button>
          <button type="button" className={cn(styles.modeButton, player.repeatMode !== "off" && styles.modeActive)} aria-label={player.repeatMode === "one" ? "单曲循环" : player.repeatMode === "all" ? "列表循环" : "循环播放已关闭"} aria-pressed={player.repeatMode !== "off"} onClick={player.cycleRepeat}>{player.repeatMode === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}</button>
        </div>

        <div className={styles.volume}>
          <button type="button" aria-label={player.volume > 0 ? "静音" : "取消静音"} onClick={toggleMute}>{player.volume === 0 ? <VolumeX size={18} /> : <Volume1 size={18} />}</button>
          <Slider aria-label="音量" className={styles.slider} min={0} max={100} step={1} value={[Math.round(player.volume * 100)]} onValueChange={(value) => player.setVolume((value[0] ?? 80) / 100)} />
          <Volume2 size={20} aria-hidden="true" />
        </div>

        {player.error ? <p className={styles.playerError} role="alert">{player.error}</p> : null}

        <footer className={styles.playerFooter}>
          <button type="button" className={cn(styles.footerButton, view === "lyrics" && styles.footerActive)} aria-label="显示歌词" aria-pressed={view === "lyrics"} onClick={() => toggleView("lyrics")}><TextQuote size={23} /><span>歌词</span></button>
          {local ? <button type="button" className={cn(styles.footerButton, view === "tuning" && styles.footerActive)} aria-label="调节训练节拍" aria-pressed={view === "tuning"} onClick={() => toggleView("tuning")}><SlidersHorizontal size={22} /><span><i ref={pipRef} /><span ref={bpmRef}>{now?.bpm ?? "—"}</span> BPM</span></button> : <span className={styles.sourceLabel}><AudioLines size={21} />{sourceLabel}</span>}
          <button type="button" className={cn(styles.footerButton, view === "queue" && styles.footerActive)} aria-label="显示待播清单" aria-pressed={view === "queue"} onClick={() => toggleView("queue")}><ListMusic size={23} /><span>待播清单</span></button>
        </footer>
      </div>
    </section>
  )
}
