"use client"

import { useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
import { Paint } from "@/components/artwork"
import { ExerciseIcon } from "@/components/exercise-icon"
import { getBuiltinExercise } from "@/lib/trainlog/exercises"
import { estimateKcal, logCardioSeconds, logVolumeKg } from "@/lib/trainlog/stats"
import { getServerTrainSnapshot, getTrainSnapshot, hydrateTrain, subscribeTrain } from "@/lib/trainlog/store"

export function TrainHistoryScreen() {
  const train = useSyncExternalStore(subscribeTrain, getTrainSnapshot, getServerTrainSnapshot)

  useEffect(() => {
    queueMicrotask(hydrateTrain)
  }, [])

  const logs = train.logs.filter((log) => log.endedAt)

  return (
    <div className="space-y-4">
      <Link href="/train" className="ios-link t-sub">
        返回训记
      </Link>
      <h1 className="t-large">历史</h1>
      {logs.length === 0 ? (
        <Paint tone="shoulders" className="grid h-40 place-items-center rounded-[22px]">
          <p className="t-headline relative">完成一天训练后，会出现在这里。</p>
        </Paint>
      ) : null}
      <ul className="space-y-2">
        {logs.map((log) => {
          const volume = Math.round(logVolumeKg(log))
          const kcal = estimateKcal(volume, logCardioSeconds(log), log.durationSec)
          const glyph = getBuiltinExercise(log.exercises[0]?.exerciseId ?? "")?.glyph
          return (
            <li key={log.id} className="ios-row flex items-center gap-3 px-2.5 py-2.5">
              <Paint tone={log.focusId ?? "strength"} className="grid size-14 shrink-0 place-items-center rounded-[14px]">
                {glyph ? <ExerciseIcon glyph={glyph} className="relative size-9 bg-white/80" /> : null}
              </Paint>
              <div className="min-w-0">
                <div className="t-headline truncate">{log.title}</div>
                <div className="t-caption mt-0.5 text-[color:var(--label-secondary)]">
                  {log.date} · {volume} kg · {kcal} kcal · {Math.max(1, Math.round(log.durationSec / 60))} 分钟
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
