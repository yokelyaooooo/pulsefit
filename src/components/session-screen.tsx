"use client"

import { Activity, Dumbbell, Flame, Flower2, Moon, Square } from "lucide-react"
import { Paint } from "@/components/artwork"
import { usePersistedStore } from "@/components/use-persisted-store"
import { BeatRing } from "@/components/beat-ring"
import { usePlayer } from "@/components/player-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getPlan, plans, tagLabel } from "@/lib/catalog"
import type { WorkoutTag } from "@/lib/types"
import { formatClock } from "@/lib/audio/clock"
import { phaseAt, planDuration } from "@/lib/workout"

const icons: Record<WorkoutTag, typeof Flame> = {
  hiit: Flame,
  strength: Dumbbell,
  cardio: Activity,
  yoga: Flower2,
  recover: Moon,
}

export function SessionScreen() {
  const player = usePlayer()
  usePersistedStore()
  const plan = player.workout ? getPlan(player.workout.planId) : null

  if (!player.workout || !plan) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="t-large">训练</h1>
          <p className="t-sub mt-1">做功段把鼓和贝斯推上去，休息段只留底。时钟和音乐一起走。</p>
        </header>
        <div className="grid grid-cols-2 gap-3">
          {plans.map((item) => {
            const Icon = icons[item.tag]
            return (
              <button key={item.id} type="button" className="text-left" onClick={() => void player.startWorkout(item.id)}>
                <Paint tone={item.tag} className="flex h-[148px] flex-col justify-end rounded-[18px] p-3.5 shadow-[0_12px_24px_rgba(28,28,30,0.12)]">
                  <Icon className="absolute top-3.5 left-3.5 size-7" />
                  <span className="t-caption relative text-white/80">{tagLabel[item.tag]}</span>
                  <span className="t-headline relative">{item.name}</span>
                  <span className="t-caption relative text-white/80">{item.bpm} BPM · {formatClock(planDuration(item))}</span>
                </Paint>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const phase = phaseAt(plan, player.workout.elapsedSec)
  const percent = phase.total > 0 ? Math.min(100, (phase.elapsed / phase.total) * 100) : 0
  const resting = phase.phase === "rest"

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="t-caption text-[#ff3b30]">{tagLabel[plan.tag]}</p>
          <h1 className="t-large mt-1">{plan.name}</h1>
        </div>
        <Badge variant={resting ? "secondary" : "default"}>{resting ? "休息" : "做功"}</Badge>
      </header>

      <BeatRing
        size={240}
        label={formatClock(phase.remaining)}
        caption={plan.rounds > 1 ? `第 ${phase.round} / ${plan.rounds} 轮` : "连续"}
      />

      <div className="space-y-2" aria-live="polite">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{player.workout.running ? "进行中" : "已暂停"}</span>
          <span className="tabular-nums">
            {formatClock(phase.elapsed)} / {formatClock(phase.total)}
          </span>
        </div>
        <Progress value={percent} aria-label="训练进度" />
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        {resting ? "鼓收掉了，把呼吸接上。下一段做功会自己加回来。" : plan.blurb}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="h-11" onClick={() => void player.toggle()}>
          {player.status === "playing" ? "暂停" : "继续"}
        </Button>
        <Button variant="outline" className="h-11" onClick={player.skipPhase} disabled={plan.rounds === 1 && plan.restSec === 0}>
          跳过本段
        </Button>
        <Button variant="destructive" className="col-span-2 h-11" onClick={player.endWorkout}>
          <Square />
          结束训练
        </Button>
      </div>
    </div>
  )
}
