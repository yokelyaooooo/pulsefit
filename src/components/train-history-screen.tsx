"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Download, Dumbbell, Pencil, Repeat2, Trash2, TrendingUp } from "lucide-react"
import { ExerciseIcon } from "@/components/exercise-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { downloadBlob, saveWorkout, useTrainClock, WorkoutEditor, WorkoutSummary } from "@/components/train-workout"
import { logVolumeKg } from "@/lib/trainlog/stats"
import { getServerTrainSnapshot, getTrainSnapshot, hydrateTrain, subscribeTrain, updateTrain } from "@/lib/trainlog/store"
import { completedSets, localDay, repeatWorkout } from "@/lib/trainlog/workouts"
import type { WorkoutLog } from "@/lib/trainlog/types"
import "@/components/train.css"

export function TrainHistoryScreen() {
  const train = useSyncExternalStore(subscribeTrain, getTrainSnapshot, getServerTrainSnapshot)
  const now = useTrainClock()
  const router = useRouter()
  const [month, setMonth] = useState("")
  const [selected, setSelected] = useState("")
  const [detail, setDetail] = useState<WorkoutLog | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<WorkoutLog | null>(null)
  const today = now ? localDay(new Date(now)) : ""
  const currentMonth = month || today.slice(0, 7)
  const logs = train.logs.filter((log) => log.endedAt).sort((a, b) => b.date.localeCompare(a.date))
  const monthLogs = logs.filter((log) => log.date.startsWith(currentMonth))
  const shown = selected ? monthLogs.filter((log) => log.date === selected) : monthLogs
  const firstDay = new Date(`${currentMonth || "2026-01"}-01T12:00:00`)
  const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7
  const weekVolume = Array.from({ length: 5 }, (_, index) => monthLogs.filter((log) => Math.floor((Number(log.date.slice(-2)) - 1) / 7) === index).reduce((sum, log) => sum + logVolumeKg(log), 0))
  const bestVolume = Math.max(1, ...weekVolume)

  useEffect(() => { queueMicrotask(() => { hydrateTrain(); const date = new URLSearchParams(window.location.search).get("date"); if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) { setSelected(date); setMonth(date.slice(0, 7)) } }) }, [])

  function shiftMonth(direction: number) {
    const date = new Date(firstDay)
    date.setMonth(date.getMonth() + direction)
    setMonth(localDay(date).slice(0, 7)); setSelected("")
  }

  return <div className="train-page">
    <Link href="/train" className="train-back-link"><ArrowLeft size={14} />返回训练</Link>
    <header className="train-page-header"><div><p className="train-eyebrow">EVERY REP, REMEMBERED</p><h1>历史与统计<span className="train-heading-dot">.</span></h1><p>把坚持，变成看得见的进步。</p></div><button className="train-round-link" aria-label="导出全部训练数据" title="导出全部训练数据" onClick={() => downloadBlob(new Blob([JSON.stringify(train, null, 2)], { type: "application/json" }), `PulseFit-backup-${today}.json`)}><Download size={20} /></button></header>
    <nav className="train-section-nav" aria-label="训练导航"><Link href="/train">训练</Link><Link href="/train/history" aria-current="page">历史与统计</Link><Link href="/train/library">动作与计划</Link></nav>
    <div className="train-month-stats"><div><span><CalendarDays size={15} />本月训练</span><strong>{monthLogs.length}<small>次</small></strong></div><div><span><Dumbbell size={15} />训练容量</span><strong>{(monthLogs.reduce((sum, log) => sum + logVolumeKg(log), 0) / 1000).toFixed(1)}<small>吨</small></strong></div><div><span><TrendingUp size={15} />训练时长</span><strong>{Math.round(monthLogs.reduce((sum, log) => sum + log.durationSec, 0) / 60)}<small>分</small></strong></div></div>
    <section className="train-calendar"><div className="train-calendar-header"><button onClick={() => shiftMonth(-1)} aria-label="上个月"><ChevronLeft size={19} /></button><h2>{currentMonth ? `${firstDay.getFullYear()} 年 ${firstDay.getMonth() + 1} 月` : "训练日历"}</h2><button onClick={() => shiftMonth(1)} aria-label="下个月"><ChevronRight size={19} /></button></div><div className="train-calendar-grid">{[..."一二三四五六日"].map((name) => <span key={name}>{name}</span>)}{Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />)}{Array.from({ length: daysInMonth }, (_, index) => { const date = `${currentMonth}-${String(index + 1).padStart(2, "0")}`; const done = monthLogs.some((log) => log.date === date); return <button key={date} aria-label={`${date}${done ? " 有训练记录" : ""}`} aria-pressed={selected === date} className={`${done ? "has-log" : ""} ${selected === date ? "is-selected" : ""} ${date === today ? "is-today" : ""}`} onClick={() => setSelected(selected === date ? "" : date)}>{index + 1}{done && <i />}</button> })}</div></section>
    {monthLogs.length > 0 && <section className="train-calendar"><div className="train-section-heading"><h2>容量趋势</h2><span className="train-small">本月每周 · kg</span></div><div className="train-chart" role="img" aria-label={weekVolume.map((value, i) => `第${i + 1}周${Math.round(value)}公斤`).join("，")}>{weekVolume.map((value, index) => <div key={index} title={`${Math.round(value)} kg`}><small className="train-small">{Math.round(value).toLocaleString()}</small><i style={{ height: `${Math.max(3, value / bestVolume * 74)}%` }} /><span>第 {index + 1} 周</span></div>)}</div></section>}
    <section><div className="train-section-heading"><h2>{selected ? `${Number(selected.slice(5, 7))} 月 ${Number(selected.slice(-2))} 日` : "训练足迹"}</h2>{selected ? <button className="train-text-button" onClick={() => setSelected("")}>查看整月</button> : <span className="train-small">{shown.length} 次记录</span>}</div>{shown.length ? <div className="train-history-list">{shown.map((log) => <button className="train-history-item" key={log.id} onClick={() => { setDetail(log); setEditing(false); setDraft(null) }}><ExerciseIcon exerciseId={log.exercises[0]?.exerciseId ?? "squat"} className="size-11" /><span><strong>{log.title}</strong><small>{log.date} · {completedSets(log)} 组 · {Math.round(logVolumeKg(log)).toLocaleString()} kg · {Math.max(1, Math.round(log.durationSec / 60))} 分钟</small></span><ChevronRight size={18} /></button>)}</div> : <div className="train-empty">{selected ? "这一天还没有训练记录。" : "这个月的训练故事，等你来写。"}<br /><Link className="train-text-button" href="/train">开始一次训练 →</Link></div>}</section>
    <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) { setDetail(null); setDraft(null); setEditing(false) } }}><DialogContent className="train-dialog" style={{ width: "calc(100% - 32px)", maxWidth: 640 }}><DialogHeader><DialogTitle>{editing ? "编辑训练记录" : detail?.title}</DialogTitle><DialogDescription>{editing ? "修改动作组、日期、时长或训练心得，保存后更新统计。" : `${detail?.date ?? ""} · 每一次努力都被记住`}</DialogDescription></DialogHeader>{detail && <>{editing && draft ? <><div className="grid grid-cols-2 gap-3"><label><span className="train-form-label">训练日期</span><Input aria-label="训练日期" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label><label><span className="train-form-label">训练时长（分钟）</span><Input aria-label="训练时长分钟" type="number" min={1} max={1440} value={Math.round(draft.durationSec / 60)} onChange={(event) => setDraft({ ...draft, durationSec: Math.max(60, Math.min(86400, Number(event.target.value) * 60)) })} /></label></div><WorkoutEditor log={draft} onChange={setDraft} history /><div className="train-dialog-actions"><Button variant="secondary" onClick={() => setEditing(false)}>取消</Button><Button className="train-primary" disabled={!draft.title.trim() || !draft.date || completedSets(draft) === 0} onClick={() => { saveWorkout(draft); setDetail(draft); setEditing(false); setMonth(draft.date.slice(0, 7)); setSelected("") }}>保存修改</Button></div></> : <><WorkoutSummary log={detail} /><div className="train-dialog-actions"><Button variant="secondary" onClick={() => { setDraft(structuredClone(detail)); setEditing(true) }}><Pencil size={14} />编辑</Button><Button variant="secondary" disabled={train.logs.some((log) => !log.endedAt)} onClick={() => { if (getTrainSnapshot().logs.some((log) => !log.endedAt)) return; saveWorkout(repeatWorkout(detail)); setDetail(null); router.push("/train") }}><Repeat2 size={14} />再练一次</Button><Button variant="ghost" className="text-red-400" onClick={() => { if (window.confirm("删除这条训练记录？此操作无法撤销。")) { updateTrain({ logs: getTrainSnapshot().logs.filter((log) => log.id !== detail.id) }); setDetail(null) } }}><Trash2 size={14} />删除</Button></div>{train.logs.some((log) => !log.endedAt) && <p className="train-small">请先完成当前训练，再开始另一场训练。</p>}</>}</>}</DialogContent></Dialog>
  </div>
}
