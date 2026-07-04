import { config } from '../config.js'

/** Total watts currently being drawn across all devices that are ON. */
export function totalPower(devices) {
  return devices.reduce((sum, d) => sum + (d.status === 'ON' ? d.power : 0), 0)
}

/** { roomId: watts } for every configured room, including rooms at 0W. */
export function powerByRoom(devices) {
  const totals = Object.fromEntries(config.rooms.map((r) => [r.id, 0]))
  for (const d of devices) {
    if (d.status === 'ON') totals[d.room] = (totals[d.room] ?? 0) + d.power
  }
  return totals
}

/**
 * Rough running kWh estimate for "today", integrated from a history of
 * {timestamp, watts} samples using the trapezoidal rule. This is a display
 * estimate, not a billing-grade meter — see README for the accuracy caveat.
 */
export function estimateKwhToday(history) {
  if (history.length < 2) return 0
  let kwh = 0
  for (let i = 1; i < history.length; i++) {
    const [tPrev, wPrev] = history[i - 1]
    const [tNow, wNow] = history[i]
    const hours = (tNow - tPrev) / (1000 * 60 * 60)
    kwh += ((wPrev + wNow) / 2) * hours
  }
  return kwh / 1000
}
