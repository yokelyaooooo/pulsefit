export interface LyricLine {
  time: number
  text: string
}

export function parseLrc(input: string): LyricLine[] {
  const lines: LyricLine[] = []
  const stamp = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g
  for (const raw of input.split(/\r?\n/)) {
    const times: number[] = []
    stamp.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = stamp.exec(raw))) {
      const minutes = Number(match[1])
      const seconds = Number(match[2])
      const fraction = match[3] ? Number(match[3].padEnd(3, "0").slice(0, 3)) / 1000 : 0
      times.push(minutes * 60 + seconds + fraction)
    }
    const text = raw.replace(/\[[^\]]+\]/g, "").trim()
    if (!text || times.length === 0) continue
    for (const time of times) lines.push({ time, text })
  }
  lines.sort((left, right) => left.time - right.time)
  return lines
}

export function lyricIndexAt(lines: LyricLine[], time: number) {
  let index = -1
  for (let cursor = 0; cursor < lines.length; cursor += 1) {
    if (lines[cursor].time <= time + 0.05) index = cursor
    else break
  }
  return index
}
