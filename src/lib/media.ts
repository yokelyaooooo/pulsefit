/** Photographic plates for cards and album covers. Licenses: public/photos/ATTRIBUTION.md */

export const plate: Record<string, string> = {
  push: "/photos/gym-dark.jpg",
  pull: "/photos/rowing.jpg",
  legs: "/photos/woman-lift.jpg",
  shoulders: "/photos/dumbbell-lift.jpg",
  cardio: "/photos/runner.jpg",
  bench: "/photos/bench-pexels.jpg",
  squat: "/photos/squat-room.jpg",
  deadlift: "/photos/barbell-floor.jpg",
  hiit: "/photos/battle.jpg",
  strength: "/photos/plates.jpg",
  yoga: "/photos/yoga-pexels.jpg",
  recover: "/photos/stretch.jpg",
  core: "/photos/lat.jpg",
  local: "/photos/studio.jpg",
  netease: "/photos/vinyl.jpg",
  qq: "/photos/city-night.jpg",
  apple: "/photos/headphones.jpg",
  search: "/photos/gym-bright.jpg",
}

export const trackPlate: Record<string, string> = {
  meltdown: "/photos/battle.jpg",
  burst: "/photos/ropes.jpg",
  "iron-law": "/photos/gym-dark.jpg",
  barbell: "/photos/barbells.jpg",
  core: "/photos/dumbbells.jpg",
  cruise: "/photos/bike-pexels.jpg",
  ramp: "/photos/runner.jpg",
  "night-run": "/photos/night.jpg",
  tide: "/photos/waves.jpg",
  flow: "/photos/yoga-pexels.jpg",
  embers: "/photos/sunset.jpg",
  landing: "/photos/spin-bike.jpg",
}

export function plateFor(key: string) {
  return plate[key] ?? trackPlate[key] ?? "/photos/gym-bright.jpg"
}
