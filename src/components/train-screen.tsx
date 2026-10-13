"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Paint } from "@/components/artwork"
import { ExerciseIcon } from "@/components/exercise-icon"
import { MuscleMap } from "@/components/muscle-map"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { builtinExercises, getBuiltinExercise } from "@/lib/trainlog/exercises"
import { activeMuscles, estimateKcal, formatLoad, logCardioSeconds, logVolumeKg, shareCardSvg } from "@/lib/trainlog/stats"
import { allPlans, findExercise, getServerTrainSnapshot, getTrainSnapshot, hydrateTrain, subscribeTrain, updateTrain } from "@/lib/trainlog/store"
import { muscleLabel, type LoadMode, type MuscleId, type SetEntry, type SetKind, type WorkoutLog } from "@/lib/trainlog/types"

const serverDay = { day: "" }
let daySnapshot = serverDay
const dayListeners = new Set<() => void>()

function subscribeDay(listener: () => void) {
  dayListeners.add(listener)
  return () => dayListeners.delete(listener)
}

function publishDay() {
  const now = new Date()
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  daySnapshot = { day }
  dayListeners.forEach((listener) => listener())
}

function nid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function blankSet(mode: LoadMode, kind: SetKind): SetEntry {
  return {
    id: nid(),
    kind,
    mode,
    kg: kind === "warmup" ? 20 : 0,
    kgRight: mode === "dumbbell" ? (kind === "warmup" ? 20 : 0) : null,
    reps: kind === "cardio" ? 0 : 8,
    seconds: kind === "cardio" ? 60 : 0,
    label: kind === "cardio" ? "划船机" : "",
  }
}

export function TrainScreen() {
  const train = useSyncExternalStore(subscribeTrain, getTrainSnapshot, getServerTrainSnapshot)
  const clock = useSyncExternalStore(subscribeDay, () => daySnapshot, () => serverDay)
  const [picker, setPicker] = useState(false)
  const [filter, setFilter] = useState("")
  const day = clock.day
  const open = train.logs.find((log) => log.date === day && !log.endedAt) ?? null
  const done = train.logs.filter((log) => log.date === day && log.endedAt)

  useEffect(() => {
    queueMicrotask(() => {
      publishDay()
      hydrateTrain()
    })
  }, [])

  function write(log: WorkoutLog) {
    const logs = getTrainSnapshot().logs.some((item) => item.id === log.id)
      ? getTrainSnapshot().logs.map((item) => (item.id === log.id ? log : item))
      : [log, ...getTrainSnapshot().logs]
    updateTrain({ logs })
  }

  function startFromPlan(planId: string) {
    if (!day) return
    const plan = allPlans(getTrainSnapshot()).find((item) => item.id === planId)
    if (!plan) return
    const state = getTrainSnapshot()
    write({
      id: nid(),
      date: day,
      title: plan.name,
      planId: plan.id,
      focusId: plan.focus,
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationSec: 0,
      exercises: plan.exerciseIds.flatMap((exerciseId) => {
        const exercise = findExercise(state, exerciseId)
        if (!exercise) return []
        return [{ id: nid(), exerciseId, name: exercise.name, sets: [blankSet(exercise.defaultMode, "work")] }]
      }),
    })
  }

  function addExercise(exerciseId: string) {
    if (!open) return
    const exercise = findExercise(getTrainSnapshot(), exerciseId)
    if (!exercise) return
    write({
      ...open,
      exercises: [
        ...open.exercises,
        { id: nid(), exerciseId, name: exercise.name, sets: [blankSet(exercise.defaultMode, "work")] },
      ],
    })
    setPicker(false)
  }

  function patchSet(exerciseEntryId: string, setId: string, patch: Partial<SetEntry>) {
    if (!open) return
    write({
      ...open,
      exercises: open.exercises.map((exercise) =>
        exercise.id === exerciseEntryId
          ? { ...exercise, sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)) }
          : exercise
      ),
    })
  }

  function finish(log: WorkoutLog) {
    const durationSec = Math.max(1, Math.round((Date.now() - Date.parse(log.startedAt)) / 1000))
    write({ ...log, endedAt: new Date().toISOString(), durationSec })
  }

  const exercises = [...builtinExercises, ...train.customExercises]

  const headline = open?.title ?? done[0]?.title ?? "今天"

  return (
    <div className="space-y-5">
      <header>
        <p className="t-sub">{formatDay(day)}</p>
        <div className="mt-0.5 flex items-end justify-between gap-3">
          <h1 className="t-large">{headline}</h1>
          <div className="flex gap-4 pb-1.5">
            <Link href="/train/library" className="ios-link t-sub">
              动作库
            </Link>
            <Link href="/train/history" className="ios-link t-sub">
              历史
            </Link>
          </div>
        </div>
      </header>

      {!day ? <p className="text-sm text-muted-foreground">正在打开今天的训练。</p> : null}

      {done.map((log) => (
        <Summary key={log.id} log={log} />
      ))}

      {day && !open ? (
        <section className="space-y-3">
          <h2 className="t-2">{done.length ? "再开一轮" : "开始训练"}</h2>
          {done.length ? null : <p className="t-sub">选一个计划，或先建一个空的。</p>}
          <div className="grid grid-cols-2 gap-2.5">
            {allPlans(train).map((plan) => (
              <button
                key={plan.id}
                type="button"
                className="overflow-hidden rounded-[18px] text-left shadow-[0_10px_24px_rgba(28,28,30,0.08)]"
                onClick={() => startFromPlan(plan.id)}
              >
                <Paint tone={plan.focus} className="flex h-[132px] flex-col justify-end p-3">
                  <span className="absolute top-3 left-3 flex">
                    {plan.exerciseIds.slice(0, 3).map((id) => {
                      const exercise = getBuiltinExercise(id)
                      return exercise ? <ExerciseIcon key={id} exerciseId={exercise.id} className="size-8 rounded-[8px]" /> : null
                    })}
                  </span>
                  <span className="t-headline relative">{plan.name}</span>
                  <span className="t-caption relative line-clamp-1 text-white/80">{plan.blurb}</span>
                </Paint>
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              write({
                id: nid(),
                date: day,
                title: "自定义训练",
                planId: null,
                focusId: null,
                startedAt: new Date().toISOString(),
                endedAt: null,
                durationSec: 0,
                exercises: [],
              })
            }
          >
            空白记录
          </Button>
        </section>
      ) : null}

      {open ? <LogEditor log={open} onPatch={patchSet} onAddSet={(entryId, kind) => {
        const entry = open.exercises.find((item) => item.id === entryId)
        const exercise = entry ? findExercise(train, entry.exerciseId) : undefined
        patchAdd(open, entryId, blankSet(exercise?.defaultMode ?? "barbell", kind), write)
      }} onRemoveSet={(entryId, setId) => {
        write({
          ...open,
          exercises: open.exercises.map((exercise) =>
            exercise.id === entryId ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) } : exercise
          ),
        })
      }} /> : null}

      {open ? (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPicker(true)}>
            加动作
          </Button>
          <Button onClick={() => finish(open)}>完成今天</Button>
        </div>
      ) : null}

      <Dialog open={picker} onOpenChange={setPicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>加一个动作</DialogTitle>
          </DialogHeader>
          <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="搜动作" aria-label="搜动作" />
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {exercises
              .filter((exercise) => exercise.name.includes(filter.trim()))
              .map((exercise) => (
                <li key={exercise.id}>
                  <button type="button" className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-black/4" onClick={() => addExercise(exercise.id)}>
                    <ExerciseIcon exerciseId={exercise.id} className="size-9" />
                    <span>
                      <span className="block text-sm font-medium">{exercise.name}</span>
                      <span className="block text-xs text-muted-foreground">{exercise.muscles.map((id) => muscleLabel[id]).join(" · ")}</span>
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function patchAdd(log: WorkoutLog, entryId: string, set: SetEntry, write: (log: WorkoutLog) => void) {
  write({
    ...log,
    exercises: log.exercises.map((exercise) =>
      exercise.id === entryId ? { ...exercise, sets: [...exercise.sets, set] } : exercise
    ),
  })
}

function LogEditor({
  log,
  onPatch,
  onAddSet,
  onRemoveSet,
}: {
  log: WorkoutLog
  onPatch: (entryId: string, setId: string, patch: Partial<SetEntry>) => void
  onAddSet: (entryId: string, kind: SetKind) => void
  onRemoveSet: (entryId: string, setId: string) => void
}) {
  return (
    <div className="ios-card space-y-1 p-4">
      {log.exercises.length === 0 ? <p className="t-sub">还没有动作。</p> : null}
      {log.exercises.map((exercise) => {
        const def = findExercise(getTrainSnapshot(), exercise.exerciseId)
        return (
          <section key={exercise.id} className="border-b border-black/6 py-3 last:border-0">
            <div className="flex items-center gap-3">
              <ExerciseIcon exerciseId={def?.id ?? exercise.exerciseId} className="size-10" />
              <h3 className="t-headline">{exercise.name}</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {exercise.sets.map((set, index) => (
                <li key={set.id} className="rounded-[12px] bg-[var(--fill)] p-2">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {set.kind === "warmup" ? "热身" : set.kind === "cardio" ? "组间有氧" : `第 ${index + 1} 组`} · {formatLoad(set)}
                    </span>
                    <button type="button" onClick={() => onRemoveSet(exercise.id, set.id)}>
                      删除
                    </button>
                  </div>
                  {set.kind === "cardio" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input aria-label="有氧名称" value={set.label} onChange={(event) => onPatch(exercise.id, set.id, { label: event.target.value })} />
                      <Input aria-label="秒" type="number" value={set.seconds} onChange={(event) => onPatch(exercise.id, set.id, { seconds: Number(event.target.value) })} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <Input aria-label={set.mode === "dumbbell" ? "左侧公斤" : "公斤"} type="number" value={set.kg} onChange={(event) => onPatch(exercise.id, set.id, { kg: Number(event.target.value) })} />
                      {set.mode === "dumbbell" ? (
                        <Input aria-label="右侧公斤" type="number" value={set.kgRight ?? set.kg} onChange={(event) => onPatch(exercise.id, set.id, { kgRight: Number(event.target.value) })} />
                      ) : (
                        <span className="self-center text-center text-xs text-muted-foreground">kg</span>
                      )}
                      <Input aria-label="次数" type="number" value={set.reps} onChange={(event) => onPatch(exercise.id, set.id, { reps: Number(event.target.value) })} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => onAddSet(exercise.id, "work")}>正式组</Button>
              <Button size="sm" variant="secondary" onClick={() => onAddSet(exercise.id, "warmup")}>热身</Button>
              <Button size="sm" variant="secondary" onClick={() => onAddSet(exercise.id, "cardio")}>组间有氧</Button>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function Summary({ log }: { log: WorkoutLog }) {
  const volume = logVolumeKg(log)
  const cardio = logCardioSeconds(log)
  const kcal = estimateKcal(volume, cardio, log.durationSec)
  const muscles = activeMuscles(log, (id) => findExercise(getTrainSnapshot(), id))
  return (
    <section className="ios-card p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_92px] items-center gap-2">
        <MuscleMap active={muscles} />
        <div className="space-y-4 text-right">
          <Stat label="消耗 (大卡)" value={String(kcal)} />
          <Stat label="总重量 (kg)" value={String(Math.round(volume))} />
          <Stat label="总耗时" value={formatDuration(log.durationSec)} />
        </div>
      </div>
      <div className="mt-2 space-y-4 border-t border-black/6 pt-4">
        {log.exercises.map((exercise) => (
          <div key={exercise.id}>
            <div className="flex items-center gap-2.5">
              <ExerciseIcon exerciseId={exercise.exerciseId} className="size-9" />
              <h3 className="t-headline">{exercise.name}</h3>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {exercise.sets.map((set, index) => (
                <span key={set.id} className="inline-flex items-baseline gap-1.5 t-sub text-[#3a3a3c]">
                  <span className="text-[#8e8e93] tabular-nums">{index + 1}</span>
                  <span>{formatLoad(set)}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="t-caption mt-4 leading-5 text-[color:var(--label-secondary)]">
        练到 {muscles.map((id: MuscleId) => muscleLabel[id]).join("、") || "还没有部位"}。热量是估算：容量×0.004 + 组间有氧秒×0.12 + 分钟×3.2，不是医学测量。热身不计入容量。
      </p>
      <Button
        variant="secondary"
        className="mt-3"
        onClick={() => {
          const svg = shareCardSvg({
            title: log.title,
            date: log.date,
            volumeKg: volume,
            kcal,
            durationSec: log.durationSec,
            muscles: muscles.map((id) => muscleLabel[id]),
          })
          const file = new File([svg], `pulsefit-${log.date}.svg`, { type: "image/svg+xml" })
          const share = navigator.share?.bind(navigator)
          if (share) {
            void share({ files: [file], title: log.title }).catch(() => download(svg, log.date))
            return
          }
          download(svg, log.date)
        }}
      >
        分享卡片
      </Button>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[28px] leading-8 font-semibold tracking-[-0.4px] tabular-nums">{value}</div>
      <div className="t-caption text-[color:var(--label-secondary)]">{label}</div>
    </div>
  )
}

function formatDay(day: string) {
  if (!day) return "今天"
  const date = new Date(`${day}T12:00:00`)
  const week = "日一二三四五六"[date.getDay()] ?? ""
  return `${day} 周${week}`
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

function download(svg: string, date: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
  const link = document.createElement("a")
  link.href = url
  link.download = `pulsefit-${date}.svg`
  link.click()
  URL.revokeObjectURL(url)
}
