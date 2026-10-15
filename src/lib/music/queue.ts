export type RepeatMode = "off" | "all" | "one"

export function nextQueueId(queue: string[], currentId: string, repeat: RepeatMode, automatic = false) {
  if (!queue.length) return null
  if (automatic && repeat === "one") return currentId
  const index = queue.indexOf(currentId)
  return queue[index + 1] ?? (repeat !== "off" ? queue[0] : null)
}

export function shuffleQueue(queue: string[], currentId?: string, random = Math.random) {
  const remaining = queue.filter((id) => id !== currentId)
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[remaining[i], remaining[j]] = [remaining[j], remaining[i]]
  }
  return currentId && queue.includes(currentId) ? [currentId, ...remaining] : remaining
}
