"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp, Check, Download, Plus, Timer, Trash2 } from "lucide-react"
import { MuscleMap } from "@/components/muscle-map"
import { ExerciseIcon } from "@/components/exercise-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { activeMuscles, estimateKcal, formatLoad, logCardioSeconds, logVolumeKg, shareCardSvg } from "@/lib/trainlog/stats"
import { findExercise, getTrainSnapshot, updateTrain } from "@/lib/trainlog/store"
import { clockLabel, completedSets, makeSet, previousExercise } from "@/lib/trainlog/workouts"
import { muscleLabel, type SetEntry, type SetKind, type WorkoutLog } from "@/lib/trainlog/types"

export function saveWorkout(log: WorkoutLog) {
  const state = getTrainSnapshot()
  updateTrain({ logs: state.logs.some((item) => item.id === log.id) ? state.logs.map((item) => item.id === log.id ? log : item) : [log, ...state.logs] })
}

export function useTrainClock() {
  const [now, setNow] = useState(0)
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const initial = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 1000)
    return () => { window.clearTimeout(initial); window.clearInterval(interval) }
  }, [])
  return now
}

const kinds: Record<SetKind, string> = { work: "正式", warmup: "热身", drop: "递减", cardio: "有氧" }

export function WorkoutEditor({ log, onChange, history = false }: { log: WorkoutLog; onChange: (log: WorkoutLog) => void; history?: boolean }) {
  const now = useTrainClock()
  const restRemaining = log.restEndsAt && now ? Math.max(0, Math.ceil((Date.parse(log.restEndsAt) - now) / 1000)) : 0
  const elapsed = history ? log.durationSec : now ? Math.max(0, Math.floor((now - Date.parse(log.startedAt)) / 1000)) : 0
  const total = log.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)

  function patchSet(entryId: string, setId: string, patch: Partial<SetEntry>) {
    const rest = patch.completed && !history ? { restEndsAt: new Date(now + (log.restSeconds ?? 90) * 1000).toISOString() } : {}
    onChange({ ...log, ...rest, exercises: log.exercises.map((entry) => entry.id === entryId ? { ...entry, sets: entry.sets.map((set) => set.id === setId ? { ...set, ...patch } : set) } : entry) })
  }
  function addSet(entryId: string, kind: SetKind) {
    onChange({ ...log, exercises: log.exercises.map((entry) => {
      const def = findExercise(getTrainSnapshot(), entry.exerciseId)
      if (entry.id !== entryId || !def) return entry
      const set = makeSet(def, kind, entry.sets.filter((item) => item.kind !== "cardio").at(-1))
      return { ...entry, sets: [...entry.sets, { ...set, completed: history }] }
    }) })
  }
  function move(index: number, direction: number) {
    const next = [...log.exercises]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange({ ...log, exercises: next })
  }

  return <div className="train-editor">
    <div className="train-live-strip">
      <div><Timer size={16} /><strong>{clockLabel(elapsed)}</strong><span>训练时长</span></div>
      <div><Check size={16} /><strong>{completedSets(log)} / {total}</strong><span>已完成组</span></div>
      <div><strong>{Math.round(logVolumeKg(log)).toLocaleString()}</strong><span>容量 kg</span></div>
    </div>
    <div className="train-session-settings">
      <Input aria-label="训练名称" value={log.title} onChange={(event) => onChange({ ...log, title: event.target.value })} />
      {!history && <label className="train-rest-setting"><Timer size={15} /> 组间休息<select aria-label="组间休息时长" value={log.restSeconds ?? 90} onChange={(event) => onChange({ ...log, restSeconds: Number(event.target.value) })}><option value={0}>关闭</option><option value={30}>30 秒</option><option value={60}>60 秒</option><option value={90}>90 秒</option><option value={120}>2 分钟</option><option value={180}>3 分钟</option></select></label>}
    </div>
    {!history && log.restEndsAt && (log.restSeconds ?? 90) > 0 && <div className={`train-rest-banner ${restRemaining === 0 ? "is-ready" : ""}`} role="status"><Timer size={20} /><div><strong>{restRemaining ? clockLabel(restRemaining) : "休息结束"}</strong><span>{restRemaining ? "放松呼吸，为下一组蓄力" : "准备好就开始下一组"}</span></div><button type="button" onClick={() => onChange({ ...log, restEndsAt: new Date(Math.max(Date.now(), Date.parse(log.restEndsAt!)) + 30000).toISOString() })}>+30 秒</button><button type="button" onClick={() => onChange({ ...log, restEndsAt: null })}>{restRemaining ? "跳过" : "收起"}</button></div>}
    {log.exercises.length === 0 && <div className="train-empty">添加第一个动作，开始记录今天的进步。</div>}
    {log.exercises.map((entry, entryIndex) => {
      const previous = previousExercise(getTrainSnapshot().logs, entry.exerciseId, log.id)
      return <section className="train-exercise-card" key={entry.id}>
        <header><ExerciseIcon exerciseId={entry.exerciseId} className="size-11 shrink-0" /><div className="min-w-0 flex-1"><h3>{entry.name}</h3><p>{findExercise(getTrainSnapshot(), entry.exerciseId)?.muscles.map((id) => muscleLabel[id]).join(" · ")}</p></div><div className="train-exercise-tools"><button aria-label={`上移${entry.name}`} disabled={entryIndex === 0} onClick={() => move(entryIndex, -1)}><ArrowUp size={15} /></button><button aria-label={`下移${entry.name}`} disabled={entryIndex === log.exercises.length - 1} onClick={() => move(entryIndex, 1)}><ArrowDown size={15} /></button><button aria-label={`移除${entry.name}`} onClick={() => onChange({ ...log, exercises: log.exercises.filter((item) => item.id !== entry.id) })}><Trash2 size={15} /></button></div></header>
        {previous && <div className="train-previous">上次 <span>{previous.sets.filter((set) => set.kind !== "warmup" && set.completed !== false).slice(0, 3).map(formatLoad).join(" · ")}</span></div>}
        <details className="train-muscle-detail"><summary>查看动作目标肌群</summary><MuscleMap active={findExercise(getTrainSnapshot(), entry.exerciseId)?.muscles ?? []} /></details>
        <div className="train-set-heading"><span>组别</span><span>重量 kg / 时间</span><span>次数</span><span>完成</span><span /></div>
        {entry.sets.map((set, index) => <div className={`train-set-row ${set.completed !== false ? "is-complete" : ""}`} key={set.id}>
          <select aria-label={`${entry.name}第${index + 1}组类型`} value={set.kind} onChange={(event) => patchSet(entry.id, set.id, { kind: event.target.value as SetKind, ...(event.target.value === "cardio" ? { seconds: set.seconds || 60, label: set.label || "组间有氧" } : { reps: set.reps || 10 }) })}>{Object.entries(kinds).map(([key, label]) => <option value={key} key={key}>{key === "work" ? `${index + 1}` : label}</option>)}</select>
          <div className="train-load-input">{set.kind === "cardio" ? <><Input min={0} max={86400} aria-label={`${entry.name}第${index + 1}组秒数`} type="number" inputMode="numeric" value={set.seconds || ""} placeholder="60" onChange={(event) => patchSet(entry.id, set.id, { seconds: safeNumber(event.target.value, 86400) })} /><span>秒</span></> : <><Input min={0} max={2000} step={0.5} aria-label={`${entry.name}第${index + 1}组${set.mode === "dumbbell" ? "左侧" : ""}公斤`} type="number" inputMode="decimal" value={set.kg || ""} placeholder="0" onChange={(event) => patchSet(entry.id, set.id, { kg: safeNumber(event.target.value) })} />{set.mode === "dumbbell" && <><span>+</span><Input min={0} max={2000} step={0.5} aria-label={`${entry.name}第${index + 1}组右侧公斤`} type="number" inputMode="decimal" value={set.kgRight || ""} placeholder="0" onChange={(event) => patchSet(entry.id, set.id, { kgRight: safeNumber(event.target.value) })} /></>}</>}</div>
          {set.kind === "cardio" ? <span className="text-center text-xs text-muted-foreground">有氧</span> : <Input min={0} max={999} aria-label={`${entry.name}第${index + 1}组次数`} type="number" inputMode="numeric" value={set.reps || ""} placeholder="0" onChange={(event) => patchSet(entry.id, set.id, { reps: Math.floor(safeNumber(event.target.value, 999)) })} />}
          <button type="button" className="train-complete-set" aria-label={`${entry.name}第${index + 1}组${set.completed !== false ? "取消完成" : "标记完成"}`} aria-pressed={set.completed !== false} onClick={() => patchSet(entry.id, set.id, { completed: set.completed === false })}><Check size={18} /></button>
          <button type="button" className="train-remove-set" aria-label={`删除${entry.name}第${index + 1}组`} onClick={() => onChange({ ...log, exercises: log.exercises.map((item) => item.id === entry.id ? { ...item, sets: item.sets.filter((row) => row.id !== set.id) } : item) })}>×</button>
        </div>)}
        <div className="train-add-sets">{Object.entries(kinds).map(([kind, label]) => <button type="button" key={kind} onClick={() => addSet(entry.id, kind as SetKind)}><Plus size={13} />{label}{kind === "cardio" ? "" : "组"}</button>)}</div>
        <div className="train-entry-footer"><input aria-label={`${entry.name}备注`} placeholder="记录动作感受、节奏或下次目标…" value={entry.notes ?? ""} onChange={(event) => onChange({ ...log, exercises: log.exercises.map((item) => item.id === entry.id ? { ...item, notes: event.target.value } : item) })} /><select aria-label={`${entry.name}超级组`} value={entry.supersetGroup ?? ""} onChange={(event) => onChange({ ...log, exercises: log.exercises.map((item) => item.id === entry.id ? { ...item, supersetGroup: event.target.value } : item) })}><option value="">独立动作</option><option value="A">超级组 A</option><option value="B">超级组 B</option><option value="C">超级组 C</option></select></div>
      </section>
    })}
    <textarea className="train-notes" aria-label="训练心得" placeholder="今天状态怎么样？写下你的训练心得…" value={log.notes ?? ""} onChange={(event) => onChange({ ...log, notes: event.target.value })} rows={2} />
  </div>
}

function safeNumber(value: string, max = 2000) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.min(max, number)) : 0
}

export function WorkoutSummary({ log, compact = false }: { log: WorkoutLog; compact?: boolean }) {
  const volume = logVolumeKg(log)
  const kcal = estimateKcal(volume, logCardioSeconds(log), log.durationSec)
  const muscles = activeMuscles(log, (id) => findExercise(getTrainSnapshot(), id))
  const bodyRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState("")
  async function exportCard() {
    setExporting(true)
    setExportError("")
    const figures = Array.from(bodyRef.current?.querySelectorAll("svg") ?? []).map((svg) => svg.outerHTML)
    const svg = shareCardSvg({ title: log.title, date: log.date, volumeKg: volume, kcal, durationSec: log.durationSec, muscles: muscles.map((id) => muscleLabel[id]), exercises: log.exercises, bodySvgs: figures, notes: log.notes })
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }))
    try {
      const image = new Image()
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject; image.src = url })
      const canvas = document.createElement("canvas")
      canvas.width = image.width; canvas.height = image.height
      const context = canvas.getContext("2d")
      if (!context) throw new Error("canvas unavailable")
      context.drawImage(image, 0, 0)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (!blob) throw new Error("export failed")
      downloadBlob(blob, `PulseFit-${log.date}.png`)
    } catch {
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `PulseFit-${log.date}.svg`)
      setExportError("已导出 SVG 训练卡，可在浏览器打开。")
    } finally { URL.revokeObjectURL(url); setExporting(false) }
  }
  return <section className="train-summary">
    <div className="train-summary-label"><span className="train-complete-badge"><Check size={12} />训练完成</span><span>{log.date}</span></div>
    <h2 className="train-summary-title">{log.title}</h2>
    <div className="train-body-stats"><div ref={bodyRef}><MuscleMap active={muscles} /></div><div className="train-summary-numbers"><div><strong>{kcal}</strong><span>估算消耗 kcal</span></div><div><strong>{Math.round(volume).toLocaleString()}</strong><span>总容量 kg</span></div><div><strong>{Math.max(1, Math.round(log.durationSec / 60))}<small>m</small></strong><span>训练时长</span></div></div></div>
    {!compact && <div className="train-summary-exercises">{log.exercises.map((entry) => <div key={entry.id}><h3>{entry.name}{entry.supersetGroup && <small>超级组 {entry.supersetGroup}</small>}</h3><div className="train-summary-sets">{entry.sets.filter((set) => set.completed !== false).map((set, i) => <span key={set.id}><small>{set.kind === "warmup" ? "热" : set.kind === "drop" ? "递" : i + 1}</small>{formatLoad(set)}</span>)}</div>{entry.notes && <p>{entry.notes}</p>}</div>)}</div>}
    {log.notes && <p className="train-summary-note">{log.notes}</p>}
    <div className="train-summary-bottom"><span>热身不计容量 · 热量仅为估算</span><Button size="sm" variant="secondary" disabled={exporting} onClick={() => void exportCard()}><Download size={14} />{exporting ? "生成中…" : "导出训练卡"}</Button></div>
    {exportError && <p role="status" className="text-xs text-muted-foreground">{exportError}</p>}
  </section>
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url; anchor.download = name; anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

