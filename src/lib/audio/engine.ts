import { clamp, sixteenthDuration } from "@/lib/audio/clock"
import { getPattern, type Pattern } from "@/lib/audio/patterns"

export interface EngineLoad {
  patternId: string
  bpm: number
  energy: number
  durationSec: number
}

export interface EngineSnapshot {
  positionSec: number
  bpm: number
  playing: boolean
  step: number
  beatPhase: number
  kick: boolean
  energy: number
  durationSec: number
}

const LOOKAHEAD = 0.12

export class PulseEngine {
  private ctx: AudioContext | null = null
  private noise: AudioBuffer | null = null
  private drumBus: GainNode | null = null
  private bassBus: GainNode | null = null
  private bassDuck: GainNode | null = null
  private musicBus: GainNode | null = null
  private master: GainNode | null = null
  private pattern: Pattern = getPattern("house")
  private bpm = 120
  private energy = 0.7
  private durationSec = 180
  private volume = 0.8
  private playing = false
  private positionAtStart = 0
  private startedAtCtx = 0
  private nextIndex = 0
  private nextNoteTime = 0
  private timer: number | null = null
  private ending = false
  private killers: Array<() => void> = []
  onEnded: (() => void) | null = null

  async resume() {
    this.ensure()
    const ctx = this.ctx
    if (!ctx) throw new Error("locked")
    if (ctx.state === "suspended") await ctx.resume()
    if (ctx.state !== "running") throw new Error("locked")
  }

  load(options: EngineLoad) {
    const wasPlaying = this.playing
    if (wasPlaying) this.pause()
    this.pattern = getPattern(options.patternId)
    this.bpm = clamp(options.bpm, 60, 190)
    this.energy = clamp(options.energy, 0, 1)
    this.durationSec = Math.max(8, options.durationSec)
    this.positionAtStart = 0
    this.ending = false
    if (wasPlaying) this.play()
  }

  play() {
    const ctx = this.ctx
    if (!ctx || ctx.state !== "running") throw new Error("locked")
    if (this.playing) return
    if (this.positionAtStart >= this.durationSec - 0.05) this.positionAtStart = 0
    this.ending = false
    const step = sixteenthDuration(this.bpm)
    this.nextIndex = Math.floor(this.positionAtStart / step)
    this.positionAtStart = this.nextIndex * step
    this.startedAtCtx = ctx.currentTime
    this.nextNoteTime = ctx.currentTime + 0.05
    this.playing = true
    this.timer = window.setInterval(() => this.scheduler(), 25)
    this.scheduler()
  }

  pause() {
    if (!this.playing) return
    this.positionAtStart = this.getPosition()
    this.playing = false
    this.stopTimer()
    this.silence()
  }

  seek(sec: number) {
    const wasPlaying = this.playing
    if (wasPlaying) this.pause()
    this.positionAtStart = clamp(sec, 0, Math.max(0, this.durationSec - 0.05))
    this.ending = false
    if (wasPlaying) this.play()
  }

  setBpm(bpm: number) {
    const position = this.getPosition()
    this.bpm = clamp(bpm, 60, 190)
    if (this.playing) {
      this.pause()
      this.positionAtStart = position
      this.play()
    }
  }

  setEnergy(energy: number) {
    this.energy = clamp(energy, 0, 1)
  }

  setVolume(volume: number) {
    this.volume = clamp(volume, 0, 1)
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.03)
    }
  }

  getPosition() {
    if (!this.playing || !this.ctx) return this.positionAtStart
    return this.positionAtStart + (this.ctx.currentTime - this.startedAtCtx)
  }

  getSnapshot(): EngineSnapshot {
    const positionSec = Math.min(this.getPosition(), this.durationSec)
    const stepLen = sixteenthDuration(this.bpm)
    const index = Math.floor(positionSec / stepLen)
    const step = ((index % 16) + 16) % 16
    const beatDur = 60 / this.bpm
    const intoBeat = beatDur > 0 ? positionSec % beatDur : 0
    return {
      positionSec,
      bpm: this.bpm,
      playing: this.playing,
      step,
      beatPhase: beatDur > 0 ? intoBeat / beatDur : 0,
      kick: this.playing && step % 4 === 0 && intoBeat < 0.12,
      energy: this.energy,
      durationSec: this.durationSec,
    }
  }

  dispose() {
    this.pause()
    void this.ctx?.close()
    this.ctx = null
  }

  private ensure() {
    if (this.ctx || typeof window === "undefined") return
    const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) throw new Error("locked")
    const ctx = new Ctx()
    this.ctx = ctx
    this.noise = this.makeNoise(ctx)
    this.drumBus = ctx.createGain()
    this.bassBus = ctx.createGain()
    this.bassDuck = ctx.createGain()
    this.musicBus = ctx.createGain()
    this.master = ctx.createGain()
    this.master.gain.value = this.volume
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -16
    compressor.knee.value = 18
    compressor.ratio.value = 3.2
    compressor.attack.value = 0.008
    compressor.release.value = 0.18
    this.drumBus.connect(compressor)
    this.bassBus.connect(this.bassDuck)
    this.bassDuck.connect(compressor)
    this.musicBus.connect(compressor)
    compressor.connect(this.master)
    this.master.connect(ctx.destination)
  }

  private scheduler() {
    const ctx = this.ctx
    if (!ctx || !this.playing) return
    const horizon = ctx.currentTime + LOOKAHEAD
    const step = sixteenthDuration(this.bpm)
    while (this.nextNoteTime < horizon) {
      const position = this.nextIndex * step
      if (position >= this.durationSec) {
        this.finish()
        return
      }
      const index = this.nextIndex % 16
      let when = this.nextNoteTime
      if (this.pattern.swing && index % 2 === 1) when += step * this.pattern.swing
      this.scheduleStep(index, when)
      this.nextIndex += 1
      this.nextNoteTime += step
    }
  }

  private finish() {
    if (this.ending) return
    this.ending = true
    this.positionAtStart = this.durationSec
    this.playing = false
    this.stopTimer()
    queueMicrotask(() => this.onEnded?.())
  }

  private scheduleStep(step: number, time: number) {
    const pattern = this.pattern
    const energy = this.energy
    if (pattern.kick[step] && energy >= 0.28) {
      this.kick(time, pattern.kick[step] === 2 || energy > 0.8)
    }
    if (pattern.hat[step] && energy >= 0.42) {
      this.hat(time, pattern.hat[step] === 2)
    }
    if (pattern.clap[step] && energy >= 0.5) {
      this.clap(time, pattern.clap[step] === 2)
    }
    if (pattern.bass[step] && pattern.bassNotes[step] >= 0 && energy >= 0.24) {
      this.bass(time, pattern.bassNotes[step], energy)
    }
    if (pattern.stab[step] && energy >= 0.66) this.stab(time)
    if (step === 0 && energy < 0.62) this.pad(time)
  }

  private kick(time: number, accent: boolean) {
    const ctx = this.ctx
    const bus = this.drumBus
    if (!ctx || !bus) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(accent ? 168 : 142, time)
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.09)
    gain.gain.setValueAtTime(accent ? 0.95 : 0.72, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26)
    osc.connect(gain)
    gain.connect(bus)
    osc.start(time)
    osc.stop(time + 0.28)
    this.track(osc)
    this.click(time, accent ? 0.18 : 0.1)
    this.duckBass(time)
  }

  private click(time: number, amount: number) {
    const ctx = this.ctx
    const noise = this.noise
    const bus = this.drumBus
    if (!ctx || !noise || !bus) return
    const src = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    src.buffer = noise
    filter.type = "highpass"
    filter.frequency.value = 1800
    gain.gain.setValueAtTime(amount, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(bus)
    src.start(time)
    src.stop(time + 0.03)
    this.track(src)
  }

  private hat(time: number, open: boolean) {
    const ctx = this.ctx
    const noise = this.noise
    const bus = this.drumBus
    if (!ctx || !noise || !bus) return
    const src = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    src.buffer = noise
    filter.type = "highpass"
    filter.frequency.value = open ? 6000 : 8000
    const decay = open ? 0.16 : 0.04
    gain.gain.setValueAtTime(open ? 0.16 : 0.09, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(bus)
    src.start(time)
    src.stop(time + decay + 0.02)
    this.track(src)
  }

  private clap(time: number, accent: boolean) {
    const ctx = this.ctx
    const noise = this.noise
    const bus = this.drumBus
    if (!ctx || !noise || !bus) return
    const bursts = accent ? [0, 0.012, 0.024] : [0, 0.01]
    for (const offset of bursts) {
      const src = ctx.createBufferSource()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      src.buffer = noise
      filter.type = "bandpass"
      filter.frequency.value = 1700
      filter.Q.value = 0.7
      const at = time + offset
      gain.gain.setValueAtTime(accent ? 0.28 : 0.2, at)
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.12)
      src.connect(filter)
      filter.connect(gain)
      gain.connect(bus)
      src.start(at)
      src.stop(at + 0.14)
      this.track(src)
    }
  }

  private bass(time: number, semi: number, energy: number) {
    const ctx = this.ctx
    const bus = this.bassBus
    if (!ctx || !bus) return
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(this.pattern.root * 2 ** (semi / 12), time)
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(160 + energy * 380, time)
    filter.Q.value = 7
    gain.gain.setValueAtTime(0.001, time)
    gain.gain.exponentialRampToValueAtTime(0.2 + energy * 0.08, time + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(bus)
    osc.start(time)
    osc.stop(time + 0.28)
    this.track(osc)
  }

  private stab(time: number) {
    const ctx = this.ctx
    const bus = this.musicBus
    if (!ctx || !bus) return
    for (const semi of [0, 7, 10]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(this.pattern.root * 4 * 2 ** (semi / 12), time)
      gain.gain.setValueAtTime(0.045, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14)
      osc.connect(gain)
      gain.connect(bus)
      osc.start(time)
      osc.stop(time + 0.16)
      this.track(osc)
    }
  }

  private pad(time: number) {
    const ctx = this.ctx
    const bus = this.musicBus
    if (!ctx || !bus) return
    const length = sixteenthDuration(this.bpm) * 16
    for (const detune of [-6, 5]) {
      const osc = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(this.pattern.root * 2, time)
      osc.detune.setValueAtTime(detune, time)
      filter.type = "lowpass"
      filter.frequency.value = 900
      gain.gain.setValueAtTime(0.001, time)
      gain.gain.linearRampToValueAtTime(0.06, time + 0.4)
      gain.gain.linearRampToValueAtTime(0.001, time + length)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(bus)
      osc.start(time)
      osc.stop(time + length + 0.02)
      this.track(osc)
    }
  }

  private duckBass(time: number) {
    const ctx = this.ctx
    const duck = this.bassDuck
    if (!ctx || !duck) return
    duck.gain.cancelScheduledValues(time)
    duck.gain.setValueAtTime(1, time)
    duck.gain.linearRampToValueAtTime(0.4, time + 0.03)
    duck.gain.linearRampToValueAtTime(1, time + 0.18)
  }

  private makeNoise(ctx: AudioContext) {
    const length = ctx.sampleRate
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
    return buffer
  }

  private track(node: AudioScheduledSourceNode) {
    const stop = () => node.stop()
    this.killers.push(stop)
    node.onended = () => {
      const index = this.killers.indexOf(stop)
      if (index >= 0) this.killers.splice(index, 1)
    }
  }

  private silence() {
    for (const stop of this.killers) {
      try {
        stop()
      } catch {
        // Source may already have ended.
      }
    }
    this.killers = []
  }

  private stopTimer() {
    if (this.timer !== null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
  }
}
