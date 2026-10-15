"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, LoaderCircle, Pause, Play, RefreshCw, Sparkles } from "lucide-react"
import { CoverArt } from "@/components/cover-art"
import { Equalizer } from "@/components/music-marks"
import { PlatformLogo } from "@/components/platform-logo"
import { usePlayer } from "@/components/player-provider"
import { playlistAnchorId, musicSourceName } from "@/lib/music/library-data"
import { rememberCatalog } from "@/lib/music/local"
import type { CatalogItem, SyncedPlaylist } from "@/lib/music/types"
import { formatClock } from "@/lib/audio/clock"
import "./synced-playlists.css"

export function SyncedPlaylists({
  playlists,
  busy = false,
  syncing = false,
  onRefresh,
}: {
  playlists: SyncedPlaylist[]
  busy?: boolean
  syncing?: boolean
  onRefresh?: () => void
}) {
  const player = usePlayer()
  const [expanded, setExpanded] = useState<string | null>(null)
  const ordered = useMemo(() => [...playlists].sort((left, right) => Number(Boolean(right.isLiked)) - Number(Boolean(left.isLiked)) || right.syncedAt - left.syncedAt), [playlists])

  useEffect(() => {
    rememberCatalog(playlists.flatMap((playlist) => playlist.tracks))
  }, [playlists])

  useEffect(() => {
    const reveal = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1))
      const playlist = playlists.find((item) => playlistAnchorId(item.id) === hash)
      if (!playlist) return
      setExpanded(playlist.id)
      window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80)
    }
    reveal()
    window.addEventListener("hashchange", reveal)
    return () => window.removeEventListener("hashchange", reveal)
  }, [playlists])

  function playTrack(track: CatalogItem, queue: CatalogItem[]) {
    rememberCatalog(queue)
    if (player.trackId === track.id) void player.toggle()
    else void player.playTrack(track.id, { queue: queue.map((item) => item.id), loop: false })
  }

  function playPlaylist(playlist: SyncedPlaylist) {
    const first = playlist.tracks[0]
    if (first) playTrack(first, playlist.tracks)
  }

  if (!ordered.length) return null
  return <section className="synced-library" aria-label="已同步的平台歌单">
    <header className="synced-library-heading">
      <div><span>CONNECTED LIBRARY</span><h2>已同步的歌单</h2><p>展开歌单即可查看并选择歌曲。</p></div>
      {onRefresh ? <button type="button" disabled={busy || syncing} onClick={onRefresh}>{syncing ? <LoaderCircle size={14} className="animate-spin" /> : <RefreshCw size={14} />}同步全部</button> : null}
    </header>
    <div className="synced-playlist-grid">
      {ordered.map((playlist) => {
        const open = expanded === playlist.id
        return <article key={playlist.id} id={playlistAnchorId(playlist.id)} className={`synced-playlist ${open ? "is-open" : ""}`}>
          <button type="button" className="synced-playlist-summary" aria-expanded={open} aria-controls={`${playlistAnchorId(playlist.id)}-tracks`} onClick={() => setExpanded(open ? null : playlist.id)}>
            <span className="synced-playlist-art">
              <CoverArt seed={playlist.id} title={playlist.name} artwork={playlist.cover} />
              <span className="synced-playlist-source"><PlatformLogo source={playlist.source} /></span>
              {playlist.isLiked ? <span className="synced-playlist-liked"><Sparkles size={11} />我喜欢</span> : null}
            </span>
            <span className="synced-playlist-copy"><strong>{playlist.name}</strong><small>{musicSourceName(playlist.source)} · {playlist.trackCount ?? playlist.tracks.length} 首</small><em>{playlist.cover ? "封面来自最新歌曲" : "平台歌单"}</em></span>
            <ChevronDown size={18} className="synced-playlist-chevron" />
          </button>
          {open ? <div id={`${playlistAnchorId(playlist.id)}-tracks`} className="synced-playlist-panel">
            <div className="synced-playlist-actions"><span>已载入 {playlist.tracks.length} 首</span><button type="button" disabled={!playlist.tracks.length || busy} onClick={() => playPlaylist(playlist)}><Play size={13} fill="currentColor" />播放歌单</button></div>
            {playlist.tracks.length ? <ol>{playlist.tracks.map((track, index) => {
              const playing = player.trackId === track.id && player.status === "playing"
              return <li key={track.id}>
                <span className="synced-track-index">{String(index + 1).padStart(2, "0")}</span>
                <CoverArt seed={track.id} title={track.title} artwork={track.artwork} className="synced-track-cover" />
                <button type="button" className="synced-track-main" onClick={() => playTrack(track, playlist.tracks)}><strong>{track.title}{playing ? <Equalizer /> : null}</strong><small>{track.artist}{track.album ? ` · ${track.album}` : ""}</small></button>
                <span className="synced-track-duration">{track.durationSec ? formatClock(track.durationSec) : ""}</span>
                <button type="button" className="synced-track-play" aria-label={playing ? `暂停${track.title}` : `播放${track.title}`} onClick={() => playTrack(track, playlist.tracks)}>{playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button>
              </li>
            })}</ol> : <p className="synced-playlist-empty">平台暂未返回这个歌单的歌曲，稍后重新同步即可。</p>}
          </div> : null}
        </article>
      })}
    </div>
  </section>
}
