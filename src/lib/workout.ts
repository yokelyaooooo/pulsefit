import type { PhaseSnapshot, WorkoutPlan } from "@/lib/types"

export function planDuration(plan: Pick<WorkoutPlan, "rounds" | "workSec" | "restSec">) {
  const rounds = Math.max(1, plan.rounds)
  const work = Math.max(0, plan.workSec)
  const rest = Math.max(0, plan.restSec)
  return rounds * work + Math.max(0, rounds - 1) * rest
}

export function phaseAt(
  plan: Pick<WorkoutPlan, "rounds" | "workSec" | "restSec">,
  elapsedSec: number
): PhaseSnapshot {
  const total = planDuration(plan)
  const elapsed = Math.max(0, elapsedSec)
  if (elapsed >= total) {
    return {
      round: plan.rounds,
      phase: "work",
      remaining: 0,
      elapsed: total,
      total,
      done: true,
    }
  }

  let cursor = 0
  for (let round = 1; round <= plan.rounds; round += 1) {
    const workEnd = cursor + plan.workSec
    if (elapsed < workEnd) {
      return {
        round,
        phase: "work",
        remaining: workEnd - elapsed,
        elapsed,
        total,
        done: false,
      }
    }
    cursor = workEnd
    if (round < plan.rounds && plan.restSec > 0) {
      const restEnd = cursor + plan.restSec
      if (elapsed < restEnd) {
        return {
          round,
          phase: "rest",
          remaining: restEnd - elapsed,
          elapsed,
          total,
          done: false,
        }
      }
      cursor = restEnd
    }
  }

  return {
    round: plan.rounds,
    phase: "work",
    remaining: 0,
    elapsed: total,
    total,
    done: true,
  }
}
