import type { PlanDef } from "@/lib/trainlog/types"

export const builtinPlans: PlanDef[] = [
  {
    id: "plan-push",
    name: "推日",
    focus: "push",
    blurb: "胸和三头。先卧推，再夹胸，最后臂屈伸。",
    exerciseIds: ["bench-barbell", "incline-dumbbell", "cable-fly", "dip", "overhead-ext"],
    builtin: true,
  },
  {
    id: "plan-pull",
    name: "拉日",
    focus: "pull",
    blurb: "背和二头。硬拉放前面，弯举收尾。",
    exerciseIds: ["deadlift", "barbell-row", "pullup", "seated-row", "barbell-curl"],
    builtin: true,
  },
  {
    id: "plan-legs",
    name: "腿臀日",
    focus: "legs",
    blurb: "深蹲、髋铰链、臀推和提踵。",
    exerciseIds: ["squat", "rdl", "hip-thrust", "lunge", "calf-raise"],
    builtin: true,
  },
  {
    id: "plan-shoulders",
    name: "肩日",
    focus: "shoulders",
    blurb: "推举打底，侧平举和面拉把肩胛包住。",
    exerciseIds: ["ohp", "lateral", "rear-fly", "face-pull", "shrug"],
    builtin: true,
  },
  {
    id: "plan-cardio",
    name: "有氧",
    focus: "cardio",
    blurb: "跑步、划船机、单车，中间穿一组波比。",
    exerciseIds: ["run", "rower", "bike", "burpee", "jack"],
    builtin: true,
  },
]

export function getBuiltinPlan(id: string) {
  return builtinPlans.find((plan) => plan.id === id)
}
