"use client"

import { useEffect, useSyncExternalStore } from "react"
import Link from "next/link"
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
      <Link href="/train" className="text-xs text-muted-foreground">
        返回训记
      </Link>
      <h1 className="text-4xl font-semibold">历史</h1>
      {logs.length === 0 ? <p className="text-sm text-muted-foreground">完成一天训练后，会出现在这里。</p> : null}
      <ul className="space-y-2">
        {logs.map((log) => {
          const volume = Math.round(logVolumeKg(log))
          const kcal = estimateKcal(volume, logCardioSeconds(log), log.durationSec)
          return (
            <li key={log.id} className="rounded-2xl bg-white/5 px-3 py-3">
              <div className="font-medium">{log.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {log.date} · {volume} kg · {kcal} kcal · {Math.max(1, Math.round(log.durationSec / 60))} 分钟
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
