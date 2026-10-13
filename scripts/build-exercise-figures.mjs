/**
 * Original anonymous exercise silhouettes for PulseFit.
 * Smooth oval head, no eyes, nose, or mouth. Not traced from photos or Everkinetic.
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../public/exercises")
mkdirSync(outDir, { recursive: true })

const INK = "#1c1c1e"
const FAR = "#1c1c1e"
const GEAR = "#1c1c1e"
const PAD = "#c7c7cc"

function polar(origin, length, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: origin.x + Math.cos(rad) * length, y: origin.y + Math.sin(rad) * length }
}

function tapered(a, b, r1, r2) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const px = -dy / len
  const py = dx / len
  const p = (pt, r, sign) => `${(pt.x + px * r * sign).toFixed(1)} ${(pt.y + py * r * sign).toFixed(1)}`
  return `<path d="M ${p(a, r1, 1)} L ${p(b, r2, 1)} A ${r2} ${r2} 0 0 1 ${p(b, r2, -1)} L ${p(a, r1, -1)} A ${r1} ${r1} 0 0 1 ${p(a, r1, 1)} Z"/>`
}

function dot(p, r) {
  return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}"/>`
}

function sideSkeleton(spec) {
  const hip = { x: spec.hx ?? 100, y: spec.hy ?? 126 }
  const shoulder = polar(hip, spec.torso ?? 52, spec.torsoDeg ?? -98)
  const head = polar(shoulder, 28, spec.headDeg ?? spec.torsoDeg ?? -98)
  const elbow = polar(shoulder, 32, spec.upper ?? 80)
  const wrist = polar(elbow, 28, spec.fore ?? 90)
  const knee = polar(hip, 42, spec.thigh ?? 100)
  const ankle = polar(knee, 40, spec.shin ?? 92)
  const hip2 = { x: hip.x + (spec.off ?? -7), y: hip.y + 2 }
  const elbow2 = polar(shoulder, 32, spec.upper2 ?? spec.upper ?? 80)
  const wrist2 = polar(elbow2, 28, spec.fore2 ?? spec.fore ?? 90)
  const knee2 = polar(hip2, 42, spec.thigh2 ?? spec.thigh ?? 100)
  const ankle2 = polar(knee2, 40, spec.shin2 ?? spec.shin ?? 92)
  return { hip, shoulder, head, elbow, wrist, knee, ankle, hip2, elbow2, wrist2, knee2, ankle2 }
}

function frontSkeleton(spec) {
  const hip = { x: 100, y: spec.hy ?? 128 }
  const shoulderY = hip.y - (spec.torso ?? 50)
  const shoulderL = { x: 78, y: shoulderY }
  const shoulderR = { x: 122, y: shoulderY }
  const head = { x: 100, y: shoulderY - 30 }
  const elbowL = polar(shoulderL, 32, spec.upperL ?? 100)
  const wristL = polar(elbowL, 28, spec.foreL ?? 100)
  const elbowR = polar(shoulderR, 32, spec.upperR ?? 80)
  const wristR = polar(elbowR, 28, spec.foreR ?? 80)
  const kneeL = polar({ x: 84, y: hip.y }, 42, spec.thighL ?? 98)
  const ankleL = polar(kneeL, 40, spec.shinL ?? 92)
  const kneeR = polar({ x: 116, y: hip.y }, 42, spec.thighR ?? 82)
  const ankleR = polar(kneeR, 40, spec.shinR ?? 88)
  return { hip, shoulderL, shoulderR, head, elbowL, wristL, elbowR, wristR, kneeL, ankleL, kneeR, ankleR, shoulderY }
}

function drawSide(m) {
  return `<g fill="${INK}">
    ${tapered(m.hip2, m.knee2, 13, 10)}
    ${tapered(m.knee2, m.ankle2, 10, 7)}
    ${tapered(m.shoulder, m.elbow2, 9, 7)}
    ${tapered(m.elbow2, m.wrist2, 7, 5.5)}
    ${tapered(m.hip, m.shoulder, 20, 18)}
    ${tapered(m.shoulder, m.head, 8, 6)}
    <ellipse cx="${m.head.x.toFixed(1)}" cy="${m.head.y.toFixed(1)}" rx="16" ry="18"/>
    ${tapered(m.hip, m.knee, 15, 11)}
    ${tapered(m.knee, m.ankle, 11, 7.5)}
    ${tapered(m.shoulder, m.elbow, 10, 7.5)}
    ${tapered(m.elbow, m.wrist, 7.5, 6)}
    ${dot(m.wrist, 6)}
    ${dot(m.ankle, 7)}
  </g>`
}

function drawFront(m) {
  const chest = { x: 100, y: m.shoulderY + 18 }
  return `<g fill="${INK}">
    ${tapered(m.hip, chest, 20, 26)}
    ${tapered(chest, { x: 100, y: m.shoulderY }, 24, 18)}
    ${tapered({ x: 100, y: m.shoulderY }, m.head, 8, 6)}
    <ellipse cx="${m.head.x.toFixed(1)}" cy="${m.head.y.toFixed(1)}" rx="17" ry="19"/>
    ${tapered({ x: 84, y: m.hip.y }, m.kneeL, 13, 10)}
    ${tapered(m.kneeL, m.ankleL, 10, 7)}
    ${tapered({ x: 116, y: m.hip.y }, m.kneeR, 13, 10)}
    ${tapered(m.kneeR, m.ankleR, 10, 7)}
    ${tapered(m.shoulderL, m.elbowL, 9.5, 7)}
    ${tapered(m.elbowL, m.wristL, 7, 5.4)}
    ${tapered(m.shoulderR, m.elbowR, 9.5, 7)}
    ${tapered(m.elbowR, m.wristR, 7, 5.4)}
    ${dot(m.wristL, 5.4)}
    ${dot(m.wristR, 5.4)}
    ${dot(m.ankleL, 6)}
    ${dot(m.ankleR, 6)}
  </g>`
}

function line(a, b, width = 3.4) {
  return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${GEAR}" stroke-width="${width}" stroke-linecap="round"/>`
}

function barbell(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const extend = (p, d) => ({ x: p.x + ux * d, y: p.y + uy * d })
  const start = extend(a, -18)
  const end = extend(b, 18)
  const plateAt = (p, h) => {
    const px = -uy
    const py = ux
    const w = 3.6
    const q = (sx, sy) => `${(p.x + ux * sx + px * sy).toFixed(1)},${(p.y + uy * sx + py * sy).toFixed(1)}`
    return `<polygon points="${q(-w, -h)} ${q(w, -h)} ${q(w, h)} ${q(-w, h)}"/>`
  }
  return `<g fill="${GEAR}">${line(start, end, 3.6)}${plateAt(extend(a, -6), 13)}${plateAt(extend(b, 6), 13)}${plateAt(extend(a, -12), 9)}${plateAt(extend(b, 12), 9)}</g>`
}

function dumbbell(p, deg = 90) {
  const a = polar(p, -12, deg)
  const b = polar(p, 12, deg)
  return `${line(a, b, 3.2)}${dot(a, 6).replace("<circle", `<circle fill="${GEAR}"`)}${dot(b, 6).replace("<circle", `<circle fill="${GEAR}"`)}`
}

function bench(x, y, w) {
  return `<g fill="${PAD}"><rect x="${x}" y="${y}" width="${w}" height="12" rx="3"/><rect x="${x + 10}" y="${y + 12}" width="5" height="14" rx="1.5"/><rect x="${x + w - 16}" y="${y + 12}" width="5" height="14" rx="1.5"/></g>`
}

function pointsOf(model) {
  return Object.values(model).filter((value) => value && typeof value.x === "number")
}

function frame(body, model) {
  const pts = pointsOf(model)
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of pts) {
    minX = Math.min(minX, p.x - 22)
    minY = Math.min(minY, p.y - 24)
    maxX = Math.max(maxX, p.x + 22)
    maxY = Math.max(maxY, p.y + 24)
  }
  const pad = 14
  const scale = Math.min((200 - pad * 2) / (maxX - minX), (240 - pad * 2) / (maxY - minY))
  const tx = (200 - (maxX - minX) * scale) / 2 - minX * scale
  const ty = (240 - (maxY - minY) * scale) / 2 - minY * scale
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240"><g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(3)})">${body}</g></svg>\n`
}

function side(spec, props = {}) {
  const m = sideSkeleton(spec)
  const behind = props.behind ? props.behind(m) : ""
  const ahead = props.ahead ? props.ahead(m) : ""
  return frame(`${behind}${drawSide(m)}${ahead}`, m)
}

function front(spec, props = {}) {
  const m = frontSkeleton(spec)
  const behind = props.behind ? props.behind(m) : ""
  const ahead = props.ahead ? props.ahead(m) : ""
  return frame(`${behind}${drawFront(m)}${ahead}`, m)
}

const handsBar = (m) => barbell({ x: m.wrist.x - 28, y: m.wrist.y }, { x: m.wrist.x + 28, y: m.wrist.y })
const frontBar = (m) => barbell(m.wristL, m.wristR)

const figures = {
  "bench-barbell": side(
    { hx: 128, hy: 138, torso: 56, torsoDeg: 180, headDeg: 168, upper: -90, fore: -90, upper2: -90, fore2: -90, thigh: 8, shin: 6, thigh2: 8, shin2: 6, off: 0 },
    { behind: () => bench(34, 150, 132), ahead: (m) => barbell({ x: m.wrist.x - 36, y: m.wrist.y }, { x: m.wrist.x + 8, y: m.wrist.y }) }
  ),
  "incline-barbell": side(
    { hx: 136, hy: 150, torso: 54, torsoDeg: 155, upper: -70, fore: -80, thigh: 24, shin: 78, thigh2: 30, shin2: 86 },
    {
      behind: () => `<polygon points="46,156 140,124 150,138 56,170" fill="${PAD}"/>`,
      ahead: (m) => barbell({ x: m.wrist.x - 20, y: m.wrist.y }, { x: m.wrist.x + 36, y: m.wrist.y + 8 }),
    }
  ),
  "incline-dumbbell": side(
    { hx: 136, hy: 150, torso: 54, torsoDeg: 155, upper: -68, fore: -84, thigh: 24, shin: 78 },
    { behind: () => `<polygon points="46,156 140,124 150,138 56,170" fill="${PAD}"/>`, ahead: (m) => dumbbell(m.wrist, -30) }
  ),
  "decline-bench": side(
    { hx: 78, hy: 122, torso: 56, torsoDeg: 205, upper: -80, fore: -92, thigh: -6, shin: 24 },
    {
      behind: () => `<polygon points="36,112 148,154 156,166 44,124" fill="${PAD}"/>`,
      ahead: (m) => barbell({ x: m.wrist.x - 30, y: m.wrist.y }, { x: m.wrist.x + 24, y: m.wrist.y }),
    }
  ),
  "db-bench": side(
    { hx: 128, hy: 138, torso: 56, torsoDeg: 180, upper: -80, fore: -100, upper2: -70, fore2: -110, thigh: 8, shin: 6 },
    { behind: () => bench(34, 150, 132), ahead: (m) => `${dumbbell(m.wrist, 70)}${dumbbell({ x: m.wrist.x + 8, y: m.wrist.y + 14 }, 80)}` }
  ),
  dip: front(
    { hy: 126, upperL: 112, foreL: 68, upperR: 68, foreR: 112, thighL: 94, thighR: 86 },
    { behind: () => `${line({ x: 52, y: 86 }, { x: 52, y: 188 }, 6)}${line({ x: 148, y: 86 }, { x: 148, y: 188 }, 6)}` }
  ),
  "cable-fly": front(
    { upperL: 160, foreL: 30, upperR: 20, foreR: 150 },
    {
      behind: (m) =>
        `${line({ x: 22, y: 64 }, { x: 22, y: 196 }, 5)}${line({ x: 178, y: 64 }, { x: 178, y: 196 }, 5)}${line({ x: 22, y: 90 }, m.wristL, 2)}${line({ x: 178, y: 90 }, m.wristR, 2)}`,
    }
  ),
  "machine-press": side(
    { hx: 112, hy: 146, torsoDeg: -70, upper: -16, fore: -8, thigh: 12, shin: 8 },
    { behind: () => `<rect x="146" y="100" width="26" height="86" rx="6" fill="${PAD}"/>`, ahead: (m) => line(m.wrist, { x: m.wrist.x + 22, y: m.wrist.y }, 5) }
  ),
  "close-grip": side(
    { hx: 128, hy: 138, torso: 56, torsoDeg: 180, upper: -88, fore: -92, thigh: 8, shin: 6, upper2: -88, fore2: -92, off: 0 },
    { behind: () => bench(34, 150, 132), ahead: (m) => barbell({ x: m.wrist.x - 24, y: m.wrist.y }, { x: m.wrist.x + 16, y: m.wrist.y }) }
  ),
  "overhead-ext": side(
    { torsoDeg: -102, upper: -120, fore: -30, thigh: 96, shin: 90 },
    { ahead: (m) => dumbbell(m.wrist, 70) }
  ),
  deadlift: side(
    { hx: 104, hy: 132, torsoDeg: -42, upper: 72, fore: 78, thigh: 62, shin: 100, thigh2: 70, shin2: 104, upper2: 80, fore2: 86 },
    { ahead: handsBar }
  ),
  "sumo-deadlift": front(
    { hy: 140, torso: 44, upperL: 96, foreL: 100, upperR: 84, foreR: 80, thighL: 124, shinL: 100, thighR: 56, shinR: 80 },
    { ahead: frontBar }
  ),
  "barbell-row": side(
    { hx: 92, hy: 122, torsoDeg: -16, upper: 28, fore: 150, thigh: 72, shin: 100 },
    { ahead: handsBar }
  ),
  "db-row": side(
    { hx: 108, hy: 128, torsoDeg: -12, upper: 16, fore: 120, thigh: 76, shin: 100 },
    { behind: () => bench(24, 156, 64), ahead: (m) => dumbbell(m.wrist, 80) }
  ),
  pullup: front(
    { hy: 148, upperL: -100, foreL: -80, upperR: -80, foreR: -100, thighL: 100, thighR: 80, shinL: 110, shinR: 70 },
    { behind: (m) => line({ x: 34, y: m.wristL.y }, { x: 166, y: m.wristR.y }, 6) }
  ),
  "lat-pulldown": front(
    { hy: 156, upperL: -110, foreL: -40, upperR: -70, foreR: -140, thighL: 92, thighR: 88, shinL: 90, shinR: 90 },
    { behind: (m) => `${line({ x: 100, y: 24 }, { x: 100, y: 58 }, 3.5)}${barbell(m.wristL, m.wristR)}` }
  ),
  "seated-row": side(
    { hx: 78, hy: 156, torsoDeg: -62, upper: -8, fore: 168, thigh: 8, shin: 4 },
    { behind: (m) => `<rect x="156" y="124" width="16" height="58" rx="4" fill="${PAD}"/>${line({ x: 160, y: 140 }, m.wrist, 2)}` }
  ),
  "face-pull": side(
    { torsoDeg: -90, upper: -16, fore: 160, thigh: 96, shin: 90 },
    { behind: (m) => `${line({ x: 178, y: 36 }, { x: 178, y: 190 }, 5)}${line({ x: 178, y: 108 }, m.wrist, 2)}` }
  ),
  "barbell-curl": side(
    { torsoDeg: -98, upper: 78, fore: -16, thigh: 96, shin: 90 },
    { ahead: handsBar }
  ),
  "db-curl": side(
    { torsoDeg: -98, upper: 76, fore: -24, upper2: 92, fore2: 8, thigh: 96, shin: 90 },
    { ahead: (m) => `${dumbbell(m.wrist, -16)}${dumbbell(m.wrist2, 10)}` }
  ),
  "hammer-curl": side(
    { torsoDeg: -98, upper: 82, fore: 8, thigh: 96, shin: 90 },
    { ahead: (m) => dumbbell(m.wrist, 90) }
  ),
  squat: side(
    { hx: 108, hy: 146, torsoDeg: -72, upper: 200, fore: 160, thigh: 18, shin: 108, thigh2: 26, shin2: 112, upper2: 190, fore2: 150 },
    { ahead: (m) => barbell({ x: m.shoulder.x - 34, y: m.shoulder.y - 6 }, { x: m.shoulder.x + 28, y: m.shoulder.y - 2 }) }
  ),
  "front-squat": side(
    { hx: 112, hy: 148, torsoDeg: -68, upper: -130, fore: -10, thigh: 16, shin: 108 },
    { ahead: (m) => barbell({ x: m.shoulder.x - 8, y: m.shoulder.y + 6 }, { x: m.shoulder.x + 36, y: m.shoulder.y + 10 }) }
  ),
  bulgarian: side(
    { hx: 122, hy: 138, torsoDeg: -90, upper: 74, fore: 82, thigh: 24, shin: 108, thigh2: 170, shin2: 16, off: -10 },
    { behind: () => bench(22, 176, 48), ahead: (m) => dumbbell(m.wrist, 90) }
  ),
  "leg-press": side(
    { hx: 64, hy: 156, torsoDeg: 16, upper: 24, fore: 4, thigh: -36, shin: -6 },
    { behind: (m) => `${bench(24, 162, 64)}<rect x="${(m.ankle.x - 8).toFixed(0)}" y="${(m.ankle.y - 16).toFixed(0)}" width="42" height="14" rx="3" fill="${PAD}"/>` }
  ),
  rdl: side(
    { hx: 100, hy: 124, torsoDeg: -24, upper: 58, fore: 64, thigh: 78, shin: 98 },
    { ahead: handsBar }
  ),
  "hip-thrust": side(
    { hx: 112, hy: 132, torsoDeg: 6, upper: 36, fore: 16, thigh: 6, shin: 100 },
    { behind: () => bench(24, 138, 44), ahead: (m) => barbell({ x: m.hip.x - 20, y: m.hip.y - 4 }, { x: m.hip.x + 36, y: m.hip.y - 2 }) }
  ),
  "leg-curl": side(
    { hx: 100, hy: 136, torso: 58, torsoDeg: 178, upper: 160, fore: 174, thigh: 2, shin: -62 },
    { behind: () => bench(36, 146, 118), ahead: (m) => `<rect x="${(m.ankle.x - 6).toFixed(0)}" y="${(m.ankle.y - 8).toFixed(0)}" width="26" height="10" rx="3" fill="${GEAR}"/>` }
  ),
  "leg-ext": side(
    { hx: 84, hy: 146, torsoDeg: -58, upper: 28, fore: 8, thigh: 18, shin: -8 },
    { behind: () => `<rect x="36" y="156" width="84" height="12" rx="3" fill="${PAD}"/>`, ahead: (m) => `<rect x="${(m.ankle.x - 4).toFixed(0)}" y="${(m.ankle.y - 8).toFixed(0)}" width="30" height="10" rx="3" fill="${GEAR}"/>` }
  ),
  "calf-raise": side(
    { torsoDeg: -100, upper: 72, fore: 78, thigh: 90, shin: 72 },
    { behind: (m) => `<rect x="${(m.ankle.x - 18).toFixed(0)}" y="198" width="40" height="8" rx="2" fill="${PAD}"/>`, ahead: (m) => dumbbell(m.wrist, 90) }
  ),
  lunge: side(
    { hx: 112, hy: 136, torsoDeg: -94, upper: 74, fore: 80, thigh: 26, shin: 108, thigh2: 154, shin2: 98, off: -6 },
    { ahead: (m) => dumbbell(m.wrist, 90) }
  ),
  ohp: front(
    { hy: 146, upperL: -108, foreL: -88, upperR: -72, foreR: -92, thighL: 96, thighR: 84 },
    { ahead: frontBar }
  ),
  arnold: front(
    { hy: 146, upperL: -36, foreL: 24, upperR: -144, foreR: 156 },
    { ahead: (m) => `${dumbbell(m.wristL, 10)}${dumbbell(m.wristR, 170)}` }
  ),
  lateral: front(
    { upperL: 188, foreL: 184, upperR: -8, foreR: -4 },
    { ahead: (m) => `${dumbbell(m.wristL, 0)}${dumbbell(m.wristR, 0)}` }
  ),
  "front-raise": side(
    { torsoDeg: -98, upper: -8, fore: -4, thigh: 96, shin: 90 },
    { ahead: (m) => dumbbell(m.wrist, 0) }
  ),
  "rear-fly": side(
    { hx: 96, hy: 126, torsoDeg: -18, upper: 6, fore: -8, thigh: 76, shin: 98 },
    { ahead: (m) => dumbbell(m.wrist, -6) }
  ),
  "upright-row": front(
    { upperL: 210, foreL: 150, upperR: -30, foreR: 30 },
    { ahead: frontBar }
  ),
  shrug: front(
    { hy: 132, torso: 42, upperL: 102, foreL: 96, upperR: 78, foreR: 84 },
    { ahead: frontBar }
  ),
  run: side({
    hx: 102,
    hy: 122,
    torsoDeg: -68,
    upper: -150,
    fore: -40,
    upper2: 36,
    fore2: 130,
    thigh: -18,
    shin: 36,
    thigh2: 146,
    shin2: 104,
  }),
  rower: side(
    { hx: 84, hy: 156, torsoDeg: -48, upper: -14, fore: 156, thigh: 14, shin: 8 },
    { behind: () => `<rect x="36" y="174" width="136" height="7" rx="3" fill="${PAD}"/>${line({ x: 172, y: 156 }, { x: 172, y: 180 }, 4)}` }
  ),
  bike: side(
    { hx: 112, hy: 136, torsoDeg: -58, upper: -16, fore: -8, thigh: 36, shin: 112, thigh2: 128, shin2: 64 },
    {
      behind: () =>
        `${dot({ x: 68, y: 182 }, 16).replace("<circle", `<circle fill="none" stroke="${GEAR}" stroke-width="3.2"`)}${dot({ x: 154, y: 182 }, 16).replace("<circle", `<circle fill="none" stroke="${GEAR}" stroke-width="3.2"`)}${line({ x: 68, y: 182 }, { x: 112, y: 154 }, 2.2)}${line({ x: 154, y: 182 }, { x: 124, y: 136 }, 2.2)}`,
    }
  ),
  burpee: side({ hx: 120, hy: 132, torso: 58, torsoDeg: 186, upper: 100, fore: 96, thigh: 6, shin: 4, upper2: 100, fore2: 96, off: 0 }),
  jack: front({
    upperL: 224,
    foreL: 232,
    upperR: -44,
    foreR: -52,
    thighL: 132,
    shinL: 122,
    thighR: 48,
    shinR: 58,
  }),
  mountain: side({ hx: 122, hy: 136, torso: 58, torsoDeg: 184, upper: 98, fore: 96, thigh: 18, shin: 118, thigh2: 2, shin2: 4 }),
  crunch: side({ hx: 124, hy: 158, torsoDeg: -36, upper: 16, fore: 150, thigh: 36, shin: 8, thigh2: 48, shin2: 14 }),
  "hanging-leg": front(
    { hy: 118, upperL: -108, foreL: -86, upperR: -72, foreR: -94, thighL: 42, shinL: 8, thighR: 138, shinR: 168 },
    { behind: (m) => line({ x: 36, y: m.wristL.y - 2 }, { x: 164, y: m.wristR.y - 2 }, 6) }
  ),
  plank: side({ hx: 124, hy: 146, torso: 60, torsoDeg: 182, upper: 112, fore: 160, thigh: 2, shin: 0 }),
  russian: side(
    { hx: 96, hy: 164, torsoDeg: -36, upper: -14, fore: -6, thigh: 16, shin: 156 },
    { ahead: (m) => dot(m.wrist, 7).replace("<circle", `<circle fill="${GEAR}"`) }
  ),
  generic: side({ torsoDeg: -98, upper: 74, fore: 84, thigh: 96, shin: 90 }),
}

for (const [id, svg] of Object.entries(figures)) writeFileSync(join(outDir, `${id}.svg`), svg)
console.log(`wrote ${Object.keys(figures).length}`)
