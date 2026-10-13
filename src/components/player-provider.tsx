"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { getPlan, getTrack, tracks } from "@/lib/catalog"
import { PulseEngine, type EngineSnapshot } from "@/lib/audio/engine"
import { applePause, applePlay, appleResume, appleSeek, appleTransport } from "@/lib/music/apple"
import { parseLrc, type LyricLine } from "@/lib/music/lrc"
import { localPlayable, recallCatalog, recallPlayable, rememberPlayable } from "@/lib/music/local"
import { resolvePlayback } from "@/lib/music/resolve"
import type { MusicSource, Playable } from "@/lib/music/types"
import { getMusicSnapshot } from "@/lib/music/config"
import {
  getPersistedSnapshot,
  getServerPersistedSnapshot,
  subscribePersisted,
  updatePersisted,
} from "@/lib/storage"
import type { SessionRecord, WorkoutClock } from "@/lib/types"
import { phaseAt } from "@/lib/workout"

export interface NowMeta {
  id: string
  title: string
  artist: string
  artwork: string | null
  source: MusicSource
  bpm: number
}

type Status = "idle" | "playing" | "paused"

interface PlayOptions {
  bpm?: number
  energy?: number
  queue?: string[]
  loop?: boolean
}

interface PlayerContextValue {
  status: Status
  trackId: string | null
  queue: string[]
  bpm: number
  energy: number
  volume: number
  positionSec: number
  durationSec: number
  favorites: string[]
  sessions: SessionRecord[]
  workout: WorkoutClock | null
  summary: SessionRecord | null
  error: string | null
  audioLocked: boolean
  loop: boolean
  now: NowMeta | null
  lyrics: LyricLine[]
  notice: string | null
  playTrack: (id: string, options?: PlayOptions) => Promise<boolean>
  playItem: (item: Playable, queueItems?: Playable[]) => Promise<boolean>
  dismissNotice: () => void
  toggle: () => Promise<void>
  next: () => Promise<void>
  prev: () => Promise<void>
  seek: (sec: number) => void
  setBpm: (bpm: number) => void
  setEnergy: (energy: number) => void
  setVolume: (volume: number) => void
  toggleFavorite: (id: string) => void
  startWorkout: (planId: string) => Promise<void>
  skipPhase: () => void
  endWorkout: () => void
  dismissSummary: () => void
  clearSessions: () => void
  subscribeVisual: (listener: (snapshot: EngineSnapshot) => void) => () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef<PulseEngine | null>(null)
  const listeners = useRef(new Set<(snapshot: EngineSnapshot) => void>())
  const elapsedRef = useRef(0)
  const loopRef = useRef(false)
  const trackIdRef = useRef<string | null>(null)
  const queueRef = useRef<string[]>(tracks.map((track) => track.id))
  const workoutRef = useRef<WorkoutClock | null>(null)
  const finishingRef = useRef(false)
  const clockGen = useRef(0)
  const phaseRef = useRef<"work" | "rest" | null>(null)
  const nextRef = useRef<() => Promise<void>>(async () => {})
  const modeRef = useRef<"engine" | "audio" | "apple">("engine")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const bpmRef = useRef(128)

  const [status, setStatus] = useState<Status>("idle")
  const [trackId, setTrackId] = useState<string | null>(null)
  const [queue, setQueue] = useState<string[]>(() => tracks.map((track) => track.id))
  const [bpm, setBpmState] = useState(128)
  const [energy, setEnergyState] = useState(0.7)
  const [positionSec, setPositionSec] = useState(0)
  const [durationSec, setDurationSec] = useState(180)
  const persisted = useSyncExternalStore(
    subscribePersisted,
    getPersistedSnapshot,
    getServerPersistedSnapshot
  )
  const favorites = persisted.favorites
  const sessions = persisted.sessions
  const volume = persisted.volume
  const [workout, setWorkout] = useState<WorkoutClock | null>(null)
  const [summary, setSummary] = useState<SessionRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [audioLocked, setAudioLocked] = useState(false)
  const [loop, setLoop] = useState(false)
  const [now, setNow] = useState<NowMeta | null>(null)
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    trackIdRef.current = trackId
  }, [trackId])
  useEffect(() => {
    queueRef.current = queue
  }, [queue])
  useEffect(() => {
    loopRef.current = loop
  }, [loop])
  useEffect(() => {
    workoutRef.current = workout
    if (workout) elapsedRef.current = workout.elapsedSec
  }, [workout])

  const pushSession = useCallback((record: SessionRecord) => {
    const current = getPersistedSnapshot()
    updatePersisted({ sessions: [record, ...current.sessions].slice(0, 40) })
  }, [])

  const finishWorkout = useCallback(
    (elapsedSec: number, finished: boolean, planId: string) => {
      const current = workoutRef.current
      if (!current || current.planId !== planId || finishingRef.current) return
      finishingRef.current = true
      const plan = getPlan(current.planId)
      if (!plan) {
        setWorkout(null)
        return
      }
      const record: SessionRecord = {
        id: `${Date.now()}`,
        planId: plan.id,
        planName: plan.name,
        completedAt: new Date().toISOString(),
        durationSec: Math.round(elapsedSec),
        bpm: plan.bpm,
        finished,
      }
      pushSession(record)
      setSummary(record)
      setWorkout(null)
      setLoop(false)
      loopRef.current = false
      engineRef.current?.pause()
      setStatus("paused")
    },
    [pushSession]
  )

  const showTrack = useCallback((meta: NowMeta, lyricText: string, note: string | null, duration: number) => {
    setTrackId(meta.id)
    trackIdRef.current = meta.id
    setNow(meta)
    setLyrics(parseLrc(lyricText))
    setNotice(note)
    setBpmState(meta.bpm)
    bpmRef.current = meta.bpm
    setPositionSec(0)
    setDurationSec(duration)
  }, [])

  const playTrack = useCallback(async (id: string, options?: PlayOptions) => {
    const track = getTrack(id)
    let remote = track ? null : recallPlayable(id)
    if (!track && !remote) {
      const catalogItem = recallCatalog(id)
      if (!catalogItem || catalogItem.source === "local") {
        setError("这首曲子还没准备好。")
        return false
      }
      try {
        remote = await resolvePlayback(catalogItem, getMusicSnapshot())
        rememberPlayable(remote)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "这首外部曲目没有解析成功。")
        return false
      }
    }
    const nextQueue = options?.queue?.length ? options.queue : queueRef.current
    if (options?.loop !== undefined) {
      loopRef.current = options.loop
      setLoop(options.loop)
    }
    setQueue(nextQueue)
    queueRef.current = nextQueue
    setError(null)

    if (track) {
      const engine = engineRef.current
      if (!engine) return false
      audioRef.current?.pause()
      void applePause()
      modeRef.current = "engine"
      const nextBpm = options?.bpm ?? track.bpm
      const nextEnergy = options?.energy ?? track.energy
      engine.load({
        patternId: track.patternId,
        bpm: nextBpm,
        energy: nextEnergy,
        durationSec: track.durationSec,
      })
      const playable = localPlayable(track.id)
      showTrack(
        {
          id,
          title: track.title,
          artist: "燃律 PulseFit",
          artwork: null,
          source: "local",
          bpm: nextBpm,
        },
        playable?.lyricsText ?? "",
        null,
        track.durationSec
      )
      setEnergyState(nextEnergy)
      try {
        await engine.resume()
        engine.play()
        setStatus("playing")
        setAudioLocked(false)
        return true
      } catch {
        setStatus("paused")
        setAudioLocked(true)
        setError("浏览器拦住了声音。再点一次播放。")
        return false
      }
    }

    const item = remote
    if (!item) return false
    engineRef.current?.pause()
    const bpm = options?.bpm ?? item.bpm ?? bpmRef.current
    showTrack(
      {
        id: item.id,
        title: item.title,
        artist: item.artist,
        artwork: item.artwork,
        source: item.source,
        bpm,
      },
      item.lyricsText,
      item.note,
      item.durationSec || 30
    )

    if (item.source === "apple") {
      audioRef.current?.pause()
      modeRef.current = "apple"
      try {
        await applePlay(getMusicSnapshot().appleToken, item.nativeId)
        setStatus("playing")
        setAudioLocked(false)
        return true
      } catch (caught) {
        setStatus("paused")
        setError(caught instanceof Error ? caught.message : "Apple Music 没有开始播放。")
        return false
      }
    }

    if (!item.audioUrl) {
      modeRef.current = "engine"
      setStatus("paused")
      setError(item.note || "这个音源没有返回可播放地址。")
      return false
    }

    const audio = audioRef.current
    if (!audio) return false
    modeRef.current = "audio"
    void applePause()
    audio.src = item.audioUrl
    audio.volume = getPersistedSnapshot().volume
    try {
      await audio.play()
      setStatus("playing")
      setAudioLocked(false)
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDurationSec(audio.duration)
      return true
    } catch {
      setStatus("paused")
      setAudioLocked(true)
      setError("浏览器拦住了这首外部音频。再点一次播放。")
      return false
    }
  }, [showTrack])

  const playItem = useCallback(
    async (item: Playable, queueItems?: Playable[]) => {
      rememberPlayable(item)
      const queue = queueItems?.length ? queueItems : [item]
      queue.forEach(rememberPlayable)
      return playTrack(item.id, { queue: queue.map((entry) => entry.id), bpm: item.bpm ?? undefined })
    },
    [playTrack]
  )

  const next = useCallback(async () => {
    const currentId = trackIdRef.current
    const ids = queueRef.current
    if (!currentId || ids.length === 0) return
    const index = ids.indexOf(currentId)
    const following = ids[index + 1]
    if (following) {
      await playTrack(following)
      return
    }
    if (loopRef.current) {
      if (modeRef.current === "audio" && audioRef.current) {
        audioRef.current.currentTime = 0
        try {
          await audioRef.current.play()
          setStatus("playing")
          setPositionSec(0)
        } catch {
          setAudioLocked(true)
          setError("浏览器拦住了这首外部音频。再点一次播放。")
        }
        return
      }
      if (modeRef.current === "apple") {
        await appleSeek(0)
        await appleResume()
        setStatus("playing")
        setPositionSec(0)
        return
      }
      const engine = engineRef.current
      engine?.seek(0)
      try {
        await engine?.resume()
        engine?.play()
        setStatus("playing")
        setPositionSec(0)
      } catch {
        setAudioLocked(true)
        setError("浏览器拦住了声音。再点一次播放。")
      }
      return
    }
    engineRef.current?.pause()
    setStatus("paused")
  }, [playTrack])

  useEffect(() => {
    nextRef.current = next
  }, [next])

  useEffect(() => {
    const engine = new PulseEngine()
    engineRef.current = engine
    engine.onEnded = () => {
      void nextRef.current()
    }
    engine.setVolume(getPersistedSnapshot().volume)
    const audio = new Audio()
    audio.preload = "auto"
    audio.onended = () => {
      void nextRef.current()
    }
    audioRef.current = audio
    return () => {
      engine.onEnded = null
      engine.dispose()
      engineRef.current = null
      audio.pause()
      audio.src = ""
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!workout) finishingRef.current = false
  }, [workout])

  useEffect(() => {
    engineRef.current?.setVolume(volume)
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    let frame = 0
    let last = 0
    const loopFrame = (stamp: number) => {
      const mode = modeRef.current
      if (mode === "audio" && audioRef.current) {
        const audio = audioRef.current
        const position = audio.currentTime || 0
        const beat = (position * (bpmRef.current / 60)) % 1
        listeners.current.forEach((listener) =>
          listener({
            positionSec: position,
            bpm: bpmRef.current,
            playing: !audio.paused,
            step: Math.floor(beat * 16) % 16,
            beatPhase: beat,
            kick: !audio.paused && beat < 0.08,
            energy: 0.7,
            durationSec: Number.isFinite(audio.duration) ? audio.duration : 0,
          })
        )
        if (stamp - last > 250) {
          last = stamp
          setPositionSec(position)
          if (Number.isFinite(audio.duration) && audio.duration > 0) setDurationSec(audio.duration)
        }
      } else if (mode === "apple") {
        const transport = appleTransport()
        const beat = (transport.position * (bpmRef.current / 60)) % 1
        listeners.current.forEach((listener) =>
          listener({
            positionSec: transport.position,
            bpm: bpmRef.current,
            playing: transport.playing,
            step: Math.floor(beat * 16) % 16,
            beatPhase: beat,
            kick: transport.playing && beat < 0.08,
            energy: 0.7,
            durationSec: transport.duration,
          })
        )
        if (stamp - last > 250) {
          last = stamp
          setPositionSec(transport.position)
          if (transport.duration > 0) setDurationSec(transport.duration)
        }
      } else {
        const snapshot = engineRef.current?.getSnapshot()
        if (snapshot) {
          listeners.current.forEach((listener) => listener(snapshot))
          if (snapshot.playing && stamp - last > 250) {
            last = stamp
            setPositionSec(snapshot.positionSec)
          }
        }
      }
      frame = window.requestAnimationFrame(loopFrame)
    }
    frame = window.requestAnimationFrame(loopFrame)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!workout?.running) return
    const base = elapsedRef.current
    const started = performance.now()
    const plan = getPlan(workout.planId)
    if (!plan) return
    const generation = clockGen.current
    const timer = window.setInterval(() => {
      if (clockGen.current !== generation) return
      const elapsed = base + (performance.now() - started) / 1000
      elapsedRef.current = elapsed
      const phase = phaseAt(plan, elapsed)
      if (phase.phase !== phaseRef.current) {
        phaseRef.current = phase.phase
        const level = phase.phase === "rest" ? plan.energyRest : plan.energyWork
        engineRef.current?.setEnergy(level)
        setEnergyState(level)
      }
      if (phase.done) {
        finishWorkout(phase.total, true, plan.id)
        return
      }
      setWorkout((current) => {
        if (!current?.running) return current
        return { ...current, elapsedSec: elapsed }
      })
    }, 200)
    return () => window.clearInterval(timer)
  }, [workout?.running, workout?.planId, workout?.clockEpoch, finishWorkout])

  const holdWorkout = useCallback((running: boolean) => {
    setWorkout((current) =>
      current
        ? running
          ? { ...current, running: true, elapsedSec: elapsedRef.current, clockEpoch: current.clockEpoch + 1 }
          : { ...current, running: false, elapsedSec: elapsedRef.current }
        : current
    )
  }, [])

  const toggle = useCallback(async () => {
    const engine = engineRef.current
    if (!engine) return
    if (!trackIdRef.current) {
      await playTrack(tracks[0].id)
      return
    }
    if (modeRef.current === "audio" && audioRef.current) {
      const audio = audioRef.current
      if (!audio.paused) {
        audio.pause()
        setStatus("paused")
        setPositionSec(audio.currentTime)
        holdWorkout(false)
        return
      }
      try {
        await audio.play()
        setStatus("playing")
        setAudioLocked(false)
        setError(null)
        holdWorkout(true)
      } catch {
        setAudioLocked(true)
        setError("浏览器拦住了这首外部音频。再点一次播放。")
      }
      return
    }
    if (modeRef.current === "apple") {
      if (appleTransport().playing) {
        await applePause()
        setStatus("paused")
        holdWorkout(false)
        return
      }
      try {
        await appleResume()
        setStatus("playing")
        setError(null)
        holdWorkout(true)
      } catch {
        setError("Apple Music 没有继续播放。")
      }
      return
    }
    if (status === "playing") {
      engine.pause()
      setStatus("paused")
      setPositionSec(engine.getPosition())
      holdWorkout(false)
      return
    }
    try {
      await engine.resume()
      engine.play()
      setStatus("playing")
      setAudioLocked(false)
      setError(null)
      holdWorkout(true)
    } catch {
      setAudioLocked(true)
      setError("浏览器拦住了声音。再点一次播放。")
    }
  }, [holdWorkout, playTrack, status])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space") return
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return
      }
      event.preventDefault()
      void toggle()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])

  const prev = useCallback(async () => {
    const engine = engineRef.current
    const position =
      modeRef.current === "audio"
        ? (audioRef.current?.currentTime ?? 0)
        : modeRef.current === "apple"
          ? appleTransport().position
          : (engine?.getPosition() ?? 0)
    if (position > 2) {
      if (modeRef.current === "audio" && audioRef.current) audioRef.current.currentTime = 0
      else if (modeRef.current === "apple") await appleSeek(0)
      else engine?.seek(0)
      setPositionSec(0)
      return
    }
    const currentId = trackIdRef.current
    const ids = queueRef.current
    const index = currentId ? ids.indexOf(currentId) : 0
    const previous = ids[index - 1]
    if (previous) await playTrack(previous)
    else engine?.seek(0)
  }, [playTrack])

  const seek = useCallback((sec: number) => {
    if (modeRef.current === "audio" && audioRef.current) audioRef.current.currentTime = sec
    else if (modeRef.current === "apple") void appleSeek(sec)
    else engineRef.current?.seek(sec)
    setPositionSec(sec)
  }, [])

  const setBpm = useCallback((value: number) => {
    bpmRef.current = value
    if (modeRef.current === "engine") engineRef.current?.setBpm(value)
    setBpmState(value)
    setNow((current) => (current ? { ...current, bpm: value } : current))
  }, [])

  const setEnergy = useCallback((value: number) => {
    engineRef.current?.setEnergy(value)
    setEnergyState(value)
  }, [])

  const setVolume = useCallback((value: number) => {
    engineRef.current?.setVolume(value)
    updatePersisted({ volume: value })
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    const current = getPersistedSnapshot()
    updatePersisted({
      favorites: current.favorites.includes(id)
        ? current.favorites.filter((item) => item !== id)
        : [id, ...current.favorites],
    })
  }, [])

  const startWorkout = useCallback(
    async (planId: string) => {
      const plan = getPlan(planId)
      if (!plan) return
      const current = workoutRef.current
      if (current && elapsedRef.current > 10) {
        pushSession({
          id: `${Date.now()}`,
          planId: current.planId,
          planName: getPlan(current.planId)?.name ?? "训练",
          completedAt: new Date().toISOString(),
          durationSec: Math.round(elapsedRef.current),
          bpm: getPlan(current.planId)?.bpm ?? bpm,
          finished: false,
        })
      }
      const nextClock: WorkoutClock = {
        planId,
        elapsedSec: 0,
        running: true,
        clockEpoch: 0,
      }
      clockGen.current += 1
      phaseRef.current = null
      elapsedRef.current = 0
      finishingRef.current = false
      workoutRef.current = { ...nextClock, running: false }
      setWorkout({ ...nextClock, running: false })
      setSummary(null)
      const sameTag = tracks.filter((track) => track.tag === plan.tag).map((track) => track.id)
      const started = await playTrack(plan.trackId, {
        bpm: plan.bpm,
        energy: plan.energyWork,
        queue: sameTag,
        loop: true,
      })
      setWorkout((current) =>
        current && current.planId === planId
          ? { ...current, running: started, clockEpoch: started ? 1 : 0 }
          : current
      )
    },
    [bpm, playTrack, pushSession]
  )

  const skipPhase = useCallback(() => {
    const current = workoutRef.current
    if (!current) return
    const plan = getPlan(current.planId)
    if (!plan) return
    const phase = phaseAt(plan, elapsedRef.current)
    if (phase.done) {
      finishWorkout(phase.total, true, current.planId)
      return
    }
    const nextElapsed = Math.min(phase.total, phase.elapsed + phase.remaining + 0.05)
    if (nextElapsed >= phase.total) {
      finishWorkout(phase.total, true, current.planId)
      return
    }
    elapsedRef.current = nextElapsed
    const landed = phaseAt(plan, nextElapsed)
    if (landed.phase !== phaseRef.current) {
      phaseRef.current = landed.phase
      const level = landed.phase === "rest" ? plan.energyRest : plan.energyWork
      engineRef.current?.setEnergy(level)
      setEnergyState(level)
    }
    setWorkout({
      ...current,
      elapsedSec: nextElapsed,
      running: status === "playing",
      clockEpoch: current.clockEpoch + 1,
    })
  }, [finishWorkout, status])

  const endWorkout = useCallback(() => {
    const current = workoutRef.current
    if (!current) return
    finishWorkout(elapsedRef.current, false, current.planId)
  }, [finishWorkout])

  const clearSessions = useCallback(() => updatePersisted({ sessions: [] }), [])
  const dismissSummary = useCallback(() => setSummary(null), [])
  const dismissNotice = useCallback(() => setNotice(null), [])

  const subscribeVisual = useCallback((listener: (snapshot: EngineSnapshot) => void) => {
    listeners.current.add(listener)
    return () => listeners.current.delete(listener)
  }, [])

  const value = useMemo<PlayerContextValue>(
    () => ({
      status,
      trackId,
      queue,
      bpm,
      energy,
      volume,
      positionSec,
      durationSec,
      favorites,
      sessions,
      workout,
      summary,
      error,
      audioLocked,
      loop,
      now,
      lyrics,
      notice,
      playTrack,
      playItem,
      dismissNotice,
      toggle,
      next,
      prev,
      seek,
      setBpm,
      setEnergy,
      setVolume,
      toggleFavorite,
      startWorkout,
      skipPhase,
      endWorkout,
      dismissSummary,
      clearSessions,
      subscribeVisual,
    }),
    [
      status,
      trackId,
      queue,
      bpm,
      energy,
      volume,
      positionSec,
      durationSec,
      favorites,
      sessions,
      workout,
      summary,
      error,
      audioLocked,
      loop,
      now,
      lyrics,
      notice,
      playTrack,
      playItem,
      dismissNotice,
      toggle,
      next,
      prev,
      seek,
      setBpm,
      setEnergy,
      setVolume,
      toggleFavorite,
      startWorkout,
      skipPhase,
      endWorkout,
      dismissSummary,
      clearSessions,
      subscribeVisual,
    ]
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) throw new Error("usePlayer must be used within PlayerProvider")
  return context
}
