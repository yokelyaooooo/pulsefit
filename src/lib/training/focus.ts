import type { WorkoutTag } from "@/lib/types"

export type FocusId = "push" | "pull" | "legs" | "shoulders" | "cardio" | "bench" | "squat" | "deadlift"

export interface TrainingFocus {
  id: FocusId
  name: string
  kind: "day" | "lift"
  accent: string
  accent2: string
  ink: string
  targetBpm: number
  intensity: number
  tags: WorkoutTag[]
  blurb: string
}

export const focuses: TrainingFocus[] = [
  {
    id: "push",
    name: "推日",
    kind: "day",
    accent: "#ff4d3a",
    accent2: "#ffb199",
    ink: "#2a0c08",
    targetBpm: 128,
    intensity: 0.75,
    tags: ["strength"],
    blurb: "卧推、肩推、三头。重拍落在推起的瞬间。",
  },
  {
    id: "pull",
    name: "拉日",
    kind: "day",
    accent: "#3d7eff",
    accent2: "#b7d0ff",
    ink: "#071226",
    targetBpm: 120,
    intensity: 0.7,
    tags: ["strength"],
    blurb: "划船、硬拉、弯举。把背阔收紧再放。",
  },
  {
    id: "legs",
    name: "腿臀日",
    kind: "day",
    accent: "#1f9d62",
    accent2: "#b6f0d2",
    ink: "#062015",
    targetBpm: 110,
    intensity: 0.8,
    tags: ["strength"],
    blurb: "深蹲、臀推、腿弯举。组间把气换完。",
  },
  {
    id: "shoulders",
    name: "肩日",
    kind: "day",
    accent: "#e2b043",
    accent2: "#ffe3a3",
    ink: "#241a06",
    targetBpm: 126,
    intensity: 0.65,
    tags: ["strength"],
    blurb: "推举、侧平举、面拉。肩胛先稳住。",
  },
  {
    id: "cardio",
    name: "有氧",
    kind: "day",
    accent: "#14c4c4",
    accent2: "#b8f6f6",
    ink: "#042222",
    targetBpm: 150,
    intensity: 0.85,
    tags: ["cardio", "hiit"],
    blurb: "跑步、划船、单车。步频跟住鼓点。",
  },
  {
    id: "bench",
    name: "卧推",
    kind: "lift",
    accent: "#ff6a3d",
    accent2: "#ffd0c2",
    ink: "#2a0c08",
    targetBpm: 102,
    intensity: 0.62,
    tags: ["strength"],
    blurb: "大重量用慢拍，顶峰组再把能量抬上去。",
  },
  {
    id: "squat",
    name: "深蹲",
    kind: "lift",
    accent: "#2fbe78",
    accent2: "#d2ffe8",
    ink: "#062015",
    targetBpm: 100,
    intensity: 0.78,
    tags: ["strength"],
    blurb: "离心放慢，站起时踩在重拍上。",
  },
  {
    id: "deadlift",
    name: "硬拉",
    kind: "lift",
    accent: "#5b6cff",
    accent2: "#d5dbff",
    ink: "#101426",
    targetBpm: 96,
    intensity: 0.8,
    tags: ["strength"],
    blurb: "离地前吸住，拉起的一瞬间对齐拍点。",
  },
]

export function getFocus(id: string) {
  return focuses.find((focus) => focus.id === id)
}
