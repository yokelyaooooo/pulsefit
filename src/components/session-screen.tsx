"use client"

import { Activity, Dumbbell, Flame, Flower2, Moon, Square } from "lucide-react"
import { BeatRing } from "@/components/beat-ring"
import { usePlayer } from "@/components/player-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  const plan = player.workout ? getPlan(player.workout.planId) : null

  if (!player.workout || !plan) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">训练</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            做功段把鼓和贝斯推上去，休息段只留底。时钟和音乐一起走。
          </p>
        </header>
        <ul className="space-y-3">
          {plans.map((item) => {
            const Icon = icons[item.tag]
            return (
              <li key={item.id}>
                <Card>
                  <CardContent className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-5 text-ember" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-medium">{item.name}</h2>
                        <Badge variant="outline">{tagLabel[item.tag]}</Badge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.blurb}</p>
                      <p className="mt-2 text-xs text-gold tabular-nums">
                        {item.bpm} BPM · {formatClock(planDuration(item))}
                      </p>
                      <Button className="mt-3 h-10 rounded-full px-4" onClick={() => void player.startWorkout(item.id)}>
                        开始
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
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
          <p className="text-xs tracking-[0.22em] text-ember uppercase">{tagLabel[plan.tag]}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{plan.name}</h1>
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
