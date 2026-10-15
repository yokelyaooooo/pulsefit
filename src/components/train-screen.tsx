"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays, Check, ChevronRight, Dumbbell, Flame, Plus, Search, Sparkles, Trophy } from "lucide-react"
import { MuscleMap } from "@/components/muscle-map"
import { ExerciseIcon } from "@/components/exercise-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WorkoutEditor, WorkoutSummary, saveWorkout, useTrainClock } from "@/components/train-workout"
import { allExercises, allPlans, findExercise, getServerTrainSnapshot, getTrainSnapshot, hydrateTrain, subscribeTrain } from "@/lib/trainlog/store"
import { logVolumeKg } from "@/lib/trainlog/stats"
import { completedSets, createEntry, finishWorkout, localDay, newId } from "@/lib/trainlog/workouts"
import { muscleLabel, type MuscleId, type WorkoutLog } from "@/lib/trainlog/types"
import "@/components/train.css"

const focusLabels: Record<string, string> = { push: "胸 · 肩 · 三头", pull: "背 · 二头", legs: "腿 · 臀", shoulders: "肩部专项", cardio: "心肺 · 耐力", core: "核心稳定" }

export function TrainScreen() {
  const train = useSyncExternalStore(subscribeTrain, getTrainSnapshot, getServerTrainSnapshot)
  const now = useTrainClock()
  const [picker, setPicker] = useState(false)
  const [query, setQuery] = useState("")
  const [muscle, setMuscle] = useState<MuscleId | "">("")
  const [finishOpen, setFinishOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("plan-shoulders")
  const day = now ? localDay(new Date(now)) : ""
  const active = train.logs.find((log) => !log.endedAt) ?? null
  const finished = train.logs.filter((log) => log.endedAt)
  const todayDone = finished.filter((log) => log.date === day)
  const plans = allPlans(train)
  const plan = plans.find((item) => item.id === selectedPlan) ?? plans[0]
  const all = allExercises(train)
  const muscles = [...new Set(plan?.exerciseIds.flatMap((id) => findExercise(train, id)?.muscles ?? []) ?? [])]
  const thisMonth = finished.filter((log) => log.date.startsWith(day.slice(0, 7)))
  const week = Array.from({ length: 7 }, (_, index) => { const date = new Date(now || "2026-01-01T12:00:00"); date.setDate(date.getDate() - (date.getDay() + 6) % 7 + index); return localDay(date) })

  useEffect(() => { queueMicrotask(hydrateTrain) }, [])

  function start(planId?: string) {
    if (!day || getTrainSnapshot().logs.some((log) => !log.endedAt)) return
    const selected = plans.find((item) => item.id === planId)
    const log: WorkoutLog = { id: newId(), date: day, title: selected?.name ?? "自由训练", planId: selected?.id ?? null, focusId: selected?.focus ?? null, startedAt: new Date().toISOString(), endedAt: null, durationSec: 0, restSeconds: 90, exercises: selected?.exerciseIds.flatMap((id) => { const exercise = findExercise(train, id); return exercise ? [createEntry(exercise, train.logs)] : [] }) ?? [] }
    saveWorkout(log)
  }

  return <div className="train-page">
    <header className="train-page-header"><div><p className="train-eyebrow">YOUR DAILY PROGRESS</p><h1>训练记录<span className="train-heading-dot">.</span></h1><p>{day ? new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date(now)) : "记录每一次进步"}</p></div><Link className="train-round-link" href="/train/history" aria-label="训练日历"><CalendarDays size={21} /></Link></header>
    <nav className="train-section-nav" aria-label="训练导航"><Link href="/train" aria-current="page">训练</Link><Link href="/train/history">历史与统计</Link><Link href="/train/library">动作与计划</Link></nav>
    {active ? <>
      <div className="train-section-heading"><div><span className="train-status"><span />正在训练</span><h2>{active.title}</h2></div><span className="train-small">实时保存</span></div>
      {active.date !== day && <p className="train-small">继续 {active.date} 开始的训练。完成后可在历史记录里调整时长。</p>}
      <WorkoutEditor log={active} onChange={saveWorkout} />
      <div className="train-editor-actions"><Button variant="secondary" onClick={() => setPicker(true)}><Plus size={17} />添加动作</Button><Button className="train-primary" disabled={completedSets(active) === 0} onClick={() => setFinishOpen(true)}><Check size={17} />完成训练</Button></div>
      <button className="train-text-button" onClick={() => { if (window.confirm("放弃这次训练？当前未完成记录将被移除。")) { const state = getTrainSnapshot(); import("@/lib/trainlog/store").then(({ updateTrain }) => updateTrain({ logs: state.logs.filter((log) => log.id !== active.id) })) } }}>放弃本次训练</button>
    </> : <>
      <div className="train-month-stats"><div><span><Flame size={15} />本月训练</span><strong>{thisMonth.length}<small>次</small></strong></div><div><span><Dumbbell size={15} />累计容量</span><strong>{(thisMonth.reduce((sum, log) => sum + logVolumeKg(log), 0) / 1000).toFixed(1)}<small>吨</small></strong></div><div><span><Trophy size={15} />累计坚持</span><strong>{new Set(finished.map((log) => log.date)).size}<small>天</small></strong></div></div>
      <div className="train-week"><div><strong>这一周，保持节奏</strong><Link href="/train/history">训练日历<ChevronRight size={13} /></Link></div><div className="train-week-days">{week.map((date, i) => { const done = finished.some((log) => log.date === date); return <Link key={date} href={`/train/history?date=${date}`} className={`${date === day ? "is-today" : ""} ${done ? "is-done" : ""}`}><span>{"一二三四五六日"[i]}</span><strong>{done ? <Check size={17} /> : Number(date.slice(-2))}</strong><i /></Link> })}</div></div>
      {todayDone.length > 0 && <section><div className="train-section-heading"><h2>今天的进步</h2><span className="train-small">{todayDone.length} 次训练</span></div>{todayDone.map((log) => <WorkoutSummary log={log} key={log.id} />)}</section>}
      <section><div className="train-section-heading"><div><p className="train-eyebrow">LET’S GET STRONGER</p><h2>{todayDone.length ? "再出发" : "今天，练出好状态"}</h2></div><Link href="/train/library">管理计划<ChevronRight size={15} /></Link></div>
        {plan && <article className="train-plan-hero"><div className="train-plan-copy"><span className="train-plan-kicker"><Sparkles size={13} />你的训练计划</span><h3>{plan.name}</h3><p>{focusLabels[plan.focus]}</p><span>{plan.exerciseIds.length} 个动作 · 约 {plan.exerciseIds.length * 8} 分钟</span><Button className="train-primary" disabled={!day} onClick={() => start(plan.id)}>开始训练<ArrowRight size={17} /></Button></div><div className="train-plan-anatomy"><MuscleMap active={muscles} /></div></article>}
        <div className="train-plan-options">{plans.map((item) => <button type="button" key={item.id} aria-pressed={plan?.id === item.id} onClick={() => setSelectedPlan(item.id)}><Dumbbell size={16} /><span>{item.name}</span><small>{item.exerciseIds.length} 动作</small>{plan?.id === item.id && <Check size={14} />}</button>)}</div>
        <button className="train-free-start" disabled={!day} onClick={() => start()}><span><Plus size={20} /><span><strong>自由训练</strong><small>按自己的节奏，随时添加动作</small></span></span><ArrowRight size={18} /></button>
      </section>
      {finished.length > 0 && <Link href="/train/history" className="train-recent-link"><CalendarDays size={20} /><div><strong>上一次 · {finished[0].title}</strong><span>{finished[0].date} · {finished[0].exercises.length} 个动作 · {Math.round(logVolumeKg(finished[0])).toLocaleString()} kg</span></div><ChevronRight size={18} /></Link>}
      <p className="train-bottom-note">每一组，每一次，都是向前。<span>MAKE EVERY REP COUNT</span></p>
    </>}
    <Dialog open={picker} onOpenChange={setPicker}><DialogContent className="train-dialog"><DialogHeader><DialogTitle>添加训练动作</DialogTitle><DialogDescription>选择部位，找到今天想练的动作。</DialogDescription></DialogHeader><div className="train-search-field"><Search size={17} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索动作名称" aria-label="搜索动作名称" /></div><div className="train-filter-chips"><button className={!muscle ? "active" : ""} onClick={() => setMuscle("")}>全部</button>{(["chest", "lats", "side-delt", "biceps", "triceps", "quads", "glutes", "abs"] as MuscleId[]).map((id) => <button key={id} className={muscle === id ? "active" : ""} onClick={() => setMuscle(id)}>{muscleLabel[id]}</button>)}</div><ul className="train-picker-list">{all.filter((exercise) => exercise.name.includes(query.trim()) && (!muscle || exercise.muscles.includes(muscle))).map((exercise) => <li key={exercise.id}><button onClick={() => { if (active) saveWorkout({ ...active, exercises: [...active.exercises, createEntry(exercise, train.logs)] }); setPicker(false) }}><ExerciseIcon exerciseId={exercise.id} className="size-10" /><span><strong>{exercise.name}</strong><small>{exercise.muscles.map((id) => muscleLabel[id]).join(" · ")}</small></span><Plus size={18} /></button></li>)}</ul></DialogContent></Dialog>
    <Dialog open={finishOpen} onOpenChange={setFinishOpen}><DialogContent><DialogHeader><DialogTitle>今天练得很棒</DialogTitle><DialogDescription>已完成 {active ? completedSets(active) : 0} 组。保存后可以查看训练总结、导出记录卡。未勾选的组不会计入记录。</DialogDescription></DialogHeader><Button className="train-primary" onClick={() => { if (active) saveWorkout(finishWorkout(active)); setFinishOpen(false) }}>保存训练记录</Button></DialogContent></Dialog>
  </div>
}
