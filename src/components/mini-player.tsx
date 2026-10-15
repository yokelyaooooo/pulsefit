"use client"

import { AudioLines, Pause, Play, SkipForward } from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { CoverArt } from "@/components/cover-art"
import { usePlayer } from "@/components/player-provider"
import styles from "@/components/player-surfaces.module.css"

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const player = usePlayer()
  const progress = player.now && player.durationSec > 0 ? Math.min(100, (player.positionSec / player.durationSec) * 100) : 0
  const playing = player.status === "playing"

  return (
    <section className={styles.mini} aria-label="迷你播放器">
      <div className={styles.miniRow}>
        <button type="button" className={styles.miniOpen} onClick={onOpen} aria-label={player.now ? `打开播放器：${player.now.title}` : "打开播放器"}>
          {player.now ? (
            <CoverArt seed={player.now.id} title={player.now.title} artwork={player.now.artwork} className={styles.miniCover} />
          ) : (
            <BrandMark className={styles.miniCover} />
          )}
          <span className={styles.miniCopy}>
            <span className={styles.miniTitle}>{player.now?.title ?? "让节奏，陪你动起来"}</span>
            <span className={styles.miniArtist}>{player.now?.artist ?? "燃律音乐 · 点按开始聆听"}</span>
          </span>
          {playing ? <AudioLines className={styles.miniWave} aria-hidden="true" /> : null}
        </button>
        <button type="button" className={styles.miniControl} aria-label={playing ? "暂停" : player.now ? "播放" : "播放推荐歌曲"} onClick={() => void player.toggle()}>
          {playing ? <Pause size={22} fill="currentColor" strokeWidth={1.5} /> : <Play size={22} fill="currentColor" strokeWidth={1.5} />}
        </button>
        <button type="button" className={styles.miniControl} aria-label="下一首" disabled={!player.now} onClick={() => void player.next()}><SkipForward size={22} fill="currentColor" strokeWidth={1.5} /></button>
      </div>
      <div className={styles.miniProgress} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    </section>
  )
}
