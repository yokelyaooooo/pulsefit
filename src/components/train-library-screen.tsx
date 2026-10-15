"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUp, Copy, Dumbbell, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { MuscleMap } from "@/components/muscle-map"
import { ExerciseIcon } from "@/components/exercise-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { monogramGlyph } from "@/lib/trainlog/exercises"
import { allExercises, allPlans, getServerTrainSnapshot, getTrainSnapshot, hydrateTrain, subscribeTrain, updateTrain } from "@/lib/trainlog/store"
import { formatLoad } from "@/lib/trainlog/stats"
import { newId } from "@/lib/trainlog/workouts"
import { MUSCLES, muscleLabel, type Equipment, type ExerciseDef, type LoadMode, type MuscleId, type PlanDef, type TrainFocus } from "@/lib/trainlog/types"
import "@/components/train.css"

const focusName: Record<TrainFocus, string> = { push: "推日", pull: "拉日", legs: "腿臀", shoulders: "肩部", cardio: "有氧", core: "核心" }
const equipmentName: Record<Equipment, string> = { barbell: "杠铃", dumbbell: "哑铃", cable: "绳索", machine: "固定器械", bodyweight: "自重", cardio: "有氧器械" }
const modeForEquipment: Record<Equipment, LoadMode> = { barbell: "barbell", dumbbell: "dumbbell", cable: "machine", machine: "machine", bodyweight: "bodyweight", cardio: "bodyweight" }

export function TrainLibraryScreen() {
  const train = useSyncExternalStore(subscribeTrain, getTrainSnapshot, getServerTrainSnapshot)
  const [query, setQuery] = useState("")
  const [muscleFilter, setMuscleFilter] = useState<MuscleId | "">("")
  const [equipmentFilter, setEquipmentFilter] = useState<Equipment | "">("")
  const [planDraft, setPlanDraft] = useState<PlanDef | null>(null)
  const [planQuery, setPlanQuery] = useState("")
  const [exerciseDraft, setExerciseDraft] = useState<ExerciseDef | null>(null)
  const [exerciseDetail, setExerciseDetail] = useState<ExerciseDef | null>(null)
  const [notice, setNotice] = useState("")
  const exercises = allExercises(train)
  const plans = allPlans(train)
  const filtered = exercises.filter((exercise) => exercise.name.includes(query.trim()) && (!muscleFilter || exercise.muscles.includes(muscleFilter)) && (!equipmentFilter || exercise.equipment === equipmentFilter))
  const performance = exerciseDetail ? train.logs.filter((log) => log.endedAt).sort((a, b) => b.date.localeCompare(a.date)).flatMap((log) => log.exercises.filter((entry) => entry.exerciseId === exerciseDetail.id).map((entry) => ({ log, entry }))) : []
  const recorded = performance.flatMap(({ entry }) => entry.sets).filter((set) => set.completed !== false && set.kind !== "warmup" && set.kind !== "cardio")
  const maxWeight = Math.max(0, ...recorded.map((set) => set.kg + (set.mode === "dumbbell" ? set.kgRight ?? set.kg : 0)))

  useEffect(() => { queueMicrotask(hydrateTrain) }, [])

  function newPlan() {
    setPlanQuery("")
    setPlanDraft({ id: `custom-plan-${newId()}`, name: "", focus: "push", blurb: "", exerciseIds: [], builtin: false })
  }
  function newExercise() {
    setExerciseDraft({ id: `custom-${newId()}`, name: "", muscles: ["chest"], equipment: "barbell", focus: ["push"], defaultMode: "barbell", glyph: "", builtin: false })
  }
  function savePlan() {
    if (!planDraft) return
    const plan = { ...planDraft, name: planDraft.name.trim(), blurb: planDraft.blurb.trim() || `${planDraft.exerciseIds.length} 个动作 · 自定义计划` }
    updateTrain({ customPlans: [...getTrainSnapshot().customPlans.filter((item) => item.id !== plan.id), plan] })
    setPlanDraft(null)
  }

  return <div className="train-page">
    <Link href="/train" className="train-back-link"><ArrowLeft size={14} />返回训练</Link>
    <header className="train-page-header"><div><p className="train-eyebrow">BUILD YOUR OWN RHYTHM</p><h1>动作与计划<span className="train-heading-dot">.</span></h1><p>适合你的节奏，由你来安排。</p></div><span className="train-round-link"><Dumbbell size={20} /></span></header>
    <nav className="train-section-nav" aria-label="训练导航"><Link href="/train">训练</Link><Link href="/train/history">历史与统计</Link><Link href="/train/library" aria-current="page">动作与计划</Link></nav>
    {notice && <p className="train-small" role="status">{notice}</p>}
    <section><div className="train-section-heading"><h2>我的训练计划</h2><button className="train-text-button flex items-center gap-1" onClick={newPlan}><Plus size={15} />新建计划</button></div><div className="train-library-grid">{plans.map((plan) => <article className="train-library-plan" key={plan.id}><h3>{plan.name}</h3><p>{focusName[plan.focus]} · {plan.exerciseIds.length} 个动作</p><div className="train-plan-icons">{plan.exerciseIds.slice(0, 4).map((id) => <ExerciseIcon key={id} exerciseId={id} className="size-7" />)}</div><div><button onClick={() => { setPlanQuery(""); setPlanDraft(plan.builtin ? { ...plan, id: `custom-plan-${newId()}`, builtin: false, name: `${plan.name} · 自定义` } : structuredClone(plan)) }}>{plan.builtin ? <Copy size={11} /> : <Pencil size={11} />}{plan.builtin ? "复制编辑" : "编辑"}</button>{!plan.builtin && <button aria-label={`删除计划${plan.name}`} onClick={() => { if (window.confirm(`删除「${plan.name}」计划？已有训练记录会保留。`)) updateTrain({ customPlans: getTrainSnapshot().customPlans.filter((item) => item.id !== plan.id) }) }}><Trash2 size={12} /></button>}</div></article>)}</div></section>
    <section><div className="train-section-heading"><h2>动作库<span className="train-small ml-2">{exercises.length}</span></h2><button className="train-text-button flex items-center gap-1" onClick={newExercise}><Plus size={15} />自定义动作</button></div><div className="train-search-field"><Search size={16} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索动作" aria-label="搜索动作" /></div><div className="grid grid-cols-2 gap-2 my-3"><select className="train-form-select" aria-label="按肌群筛选" value={muscleFilter} onChange={(event) => setMuscleFilter(event.target.value as MuscleId | "")}><option value="">全部肌群</option>{MUSCLES.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select><select className="train-form-select" aria-label="按器械筛选" value={equipmentFilter} onChange={(event) => setEquipmentFilter(event.target.value as Equipment | "")}><option value="">全部器械</option>{Object.entries(equipmentName).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div><div className="train-exercise-library">{filtered.map((exercise) => <button key={exercise.id} onClick={() => setExerciseDetail(exercise)}><ExerciseIcon exerciseId={exercise.id} className="size-10 shrink-0" /><span><strong>{exercise.name}</strong><small>{equipmentName[exercise.equipment]} · {exercise.muscles.slice(0, 2).map((id) => muscleLabel[id]).join(" / ")}</small></span></button>)}</div>{!filtered.length && <p className="train-empty">没有找到匹配的动作，试试其他部位或器械。</p>}</section>
    <Dialog open={Boolean(planDraft)} onOpenChange={(open) => { if (!open) setPlanDraft(null) }}><DialogContent className="train-dialog" style={{ maxWidth: 520 }}><DialogHeader><DialogTitle>{train.customPlans.some((item) => item.id === planDraft?.id) ? "编辑训练计划" : "新建训练计划"}</DialogTitle><DialogDescription>选择动作并安排顺序，开始训练时会带入上次的重量和次数。</DialogDescription></DialogHeader>{planDraft && <><Input aria-label="计划名称" placeholder="例如：我的肩部训练" value={planDraft.name} onChange={(event) => setPlanDraft({ ...planDraft, name: event.target.value })} /><select className="train-form-select" aria-label="训练重点" value={planDraft.focus} onChange={(event) => setPlanDraft({ ...planDraft, focus: event.target.value as TrainFocus })}>{Object.entries(focusName).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select><Input aria-label="计划说明" placeholder="计划说明（选填）" value={planDraft.blurb} onChange={(event) => setPlanDraft({ ...planDraft, blurb: event.target.value })} />{planDraft.exerciseIds.length > 0 && <div className="train-selected-order">{planDraft.exerciseIds.map((id, index) => <span key={id}>{index + 1}. {exercises.find((item) => item.id === id)?.name}<button disabled={index === 0} aria-label={`上移动作${index + 1}`} onClick={() => { const order = [...planDraft.exerciseIds]; if (index > 0) { [order[index - 1], order[index]] = [order[index], order[index - 1]]; setPlanDraft({ ...planDraft, exerciseIds: order }) } }}><ArrowUp size={12} /></button><button aria-label={`移除动作${index + 1}`} onClick={() => setPlanDraft({ ...planDraft, exerciseIds: planDraft.exerciseIds.filter((item) => item !== id) })}><X size={12} /></button></span>)}</div>}<Input aria-label="计划中搜索动作" placeholder="搜索要加入的动作" value={planQuery} onChange={(event) => setPlanQuery(event.target.value)} /><div className="train-plan-selection">{exercises.filter((exercise) => exercise.name.includes(planQuery.trim())).map((exercise) => <label key={exercise.id}><input type="checkbox" checked={planDraft.exerciseIds.includes(exercise.id)} onChange={(event) => setPlanDraft({ ...planDraft, exerciseIds: event.target.checked ? [...planDraft.exerciseIds, exercise.id] : planDraft.exerciseIds.filter((id) => id !== exercise.id) })} /><ExerciseIcon exerciseId={exercise.id} className="size-7" />{exercise.name}</label>)}</div><Button className="train-primary" disabled={!planDraft.name.trim() || !planDraft.exerciseIds.length} onClick={savePlan}>保存计划 · {planDraft.exerciseIds.length} 个动作</Button></>}</DialogContent></Dialog>
    <Dialog open={Boolean(exerciseDraft)} onOpenChange={(open) => { if (!open) setExerciseDraft(null) }}><DialogContent className="train-dialog"><DialogHeader><DialogTitle>自定义训练动作</DialogTitle><DialogDescription>指定器械和目标肌群，以便正确记录负重与训练部位。</DialogDescription></DialogHeader>{exerciseDraft && <><Input aria-label="动作名称" placeholder="动作名称" value={exerciseDraft.name} onChange={(event) => setExerciseDraft({ ...exerciseDraft, name: event.target.value })} /><label><span className="train-form-label">器械类型</span><select className="train-form-select" aria-label="器械类型" value={exerciseDraft.equipment} onChange={(event) => { const equipment = event.target.value as Equipment; setExerciseDraft({ ...exerciseDraft, equipment, defaultMode: modeForEquipment[equipment] }) }}>{Object.entries(equipmentName).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><span className="train-form-label">目标肌群（可多选）</span><div className="train-filter-chips">{MUSCLES.map(([id, label]) => <button key={id} aria-pressed={exerciseDraft.muscles.includes(id)} className={exerciseDraft.muscles.includes(id) ? "active" : ""} onClick={() => setExerciseDraft({ ...exerciseDraft, muscles: exerciseDraft.muscles.includes(id) ? exerciseDraft.muscles.filter((muscle) => muscle !== id) : [...exerciseDraft.muscles, id] })}>{label}</button>)}</div><Button className="train-primary" disabled={!exerciseDraft.name.trim() || !exerciseDraft.muscles.length} onClick={() => { const exercise = { ...exerciseDraft, name: exerciseDraft.name.trim(), glyph: monogramGlyph(exerciseDraft.name.trim()) }; updateTrain({ customExercises: [...getTrainSnapshot().customExercises.filter((item) => item.id !== exercise.id), exercise] }); setExerciseDraft(null) }}>保存动作</Button></>}</DialogContent></Dialog>
    <Dialog open={Boolean(exerciseDetail)} onOpenChange={(open) => { if (!open) setExerciseDetail(null) }}><DialogContent className="train-dialog"><DialogHeader><DialogTitle>{exerciseDetail?.name}</DialogTitle><DialogDescription>{exerciseDetail && `${equipmentName[exerciseDetail.equipment]} · ${exerciseDetail.muscles.map((id) => muscleLabel[id]).join(" · ")}`}</DialogDescription></DialogHeader>{exerciseDetail && <><MuscleMap active={exerciseDetail.muscles} /><div className="train-month-stats"><div><span>训练次数</span><strong>{performance.length}</strong></div><div><span>最高负重</span><strong>{maxWeight}<small>kg</small></strong></div><div><span>累计组数</span><strong>{recorded.length}</strong></div></div><p className="train-small">哑铃负重按左右合计，热身组不计入纪录。</p>{performance.length ? <div className="train-history-list">{performance.slice(0, 5).map(({ log, entry }) => <div className="train-history-item" key={`${log.id}-${entry.id}`}><span><strong>{log.date}</strong><small>{entry.sets.filter((set) => set.completed !== false).map(formatLoad).join(" · ")}</small></span></div>)}</div> : <p className="train-empty">完成包含这个动作的训练后，可在这里查看进步。</p>}{!exerciseDetail.builtin && <div className="train-dialog-actions"><Button variant="secondary" onClick={() => { setExerciseDraft(structuredClone(exerciseDetail)); setExerciseDetail(null) }}><Pencil size={13} />编辑动作</Button><Button variant="ghost" onClick={() => { if (plans.some((plan) => plan.exerciseIds.includes(exerciseDetail.id)) || performance.length) { setNotice("这个动作已用于计划或训练记录，请保留以确保历史数据完整。"); setExerciseDetail(null); return } if (window.confirm(`删除「${exerciseDetail.name}」？`)) { updateTrain({ customExercises: getTrainSnapshot().customExercises.filter((item) => item.id !== exerciseDetail.id) }); setExerciseDetail(null) } }}><Trash2 size={13} />删除动作</Button></div>}</>}</DialogContent></Dialog>
  </div>
}
