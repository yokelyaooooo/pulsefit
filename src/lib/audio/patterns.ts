export interface Pattern {
  id: string
  swing: number
  root: number
  kick: number[]
  hat: number[]
  clap: number[]
  bass: number[]
  stab: number[]
  bassNotes: number[]
}

const house: Pattern = {
  id: "house",
  swing: 0,
  root: 55,
  kick: [2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0],
  hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 1],
  clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  bass: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
  stab: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  bassNotes: [0, -1, -1, 0, -1, -1, 3, -1, 7, -1, -1, 3, -1, 0, -1, -1],
}

const hiphop: Pattern = {
  id: "hiphop",
  swing: 0.14,
  root: 49,
  kick: [2, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  hat: [1, 0, 1, 1, 1, 0, 2, 0, 1, 0, 1, 1, 1, 0, 2, 1],
  clap: [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0],
  bass: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  stab: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  bassNotes: [0, -1, -1, -1, -1, -1, 0, -1, -2, -1, -1, 3, -1, -1, 5, -1],
}

const techno: Pattern = {
  id: "techno",
  swing: 0,
  root: 51.91,
  kick: [2, 0, 0, 1, 2, 0, 0, 1, 2, 0, 0, 1, 2, 0, 0, 1],
  hat: [0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 2, 0],
  clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  bass: [1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0],
  stab: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  bassNotes: [0, -1, 0, -1, 0, -1, -1, 0, 3, -1, 0, -1, 7, -1, 3, -1],
}

const dnb: Pattern = {
  id: "dnb",
  swing: 0.06,
  root: 46.25,
  kick: [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1, 0, 0, 0],
  hat: [2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1],
  clap: [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 2, 0, 1, 0],
  bass: [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
  stab: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  bassNotes: [0, -1, 0, -1, -1, 3, -1, -1, 7, -1, 10, 7, -1, 3, -1, -1],
}

const ambient: Pattern = {
  id: "ambient",
  swing: 0,
  root: 65.41,
  kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  hat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bass: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  stab: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  bassNotes: [0, -1, -1, -1, -1, -1, -1, -1, 7, -1, -1, -1, -1, -1, -1, -1],
}

export const patterns: Record<string, Pattern> = {
  house,
  hiphop,
  techno,
  dnb,
  ambient,
}

export const patternLaneKeys = [
  "kick",
  "hat",
  "clap",
  "bass",
  "stab",
  "bassNotes",
] as const

export function getPattern(id: string) {
  return patterns[id] ?? house
}
