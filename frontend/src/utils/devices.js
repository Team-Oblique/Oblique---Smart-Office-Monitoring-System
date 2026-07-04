// Shared helpers for working with the Device shape used across the app:
//
//   Device = {
//     id: string          e.g. "work1-fan-1"   (stable, unique — disambiguates
//                                                "Fan 1" existing in 3 rooms)
//     name: string         e.g. "Fan 1"         (display label, per-room scoped)
//     type: "fan" | "light"
//     room: string          one of config.rooms[].id
//     status: "ON" | "OFF"
//     power: number         watts drawn while ON
//     lastChanged: string   ISO 8601 timestamp of the last status flip
//   }
//
// Keeping these pure/stateless makes them trivially unit-testable and
// reusable by both the mock simulator and (later) real API response mapping.

import { config } from '../config.js'

export function buildDeviceId(roomId, type, index) {
  return `${roomId}-${type}-${index}`
}

export function groupByRoom(devices) {
  const byRoom = Object.fromEntries(config.rooms.map((r) => [r.id, []]))
  for (const d of devices) {
    if (!byRoom[d.room]) byRoom[d.room] = []
    byRoom[d.room].push(d)
  }
  return byRoom
}

export function roomLabel(roomId) {
  return config.rooms.find((r) => r.id === roomId)?.name ?? roomId
}

export function hoursSince(isoTimestamp, now = new Date()) {
  return (now.getTime() - new Date(isoTimestamp).getTime()) / (1000 * 60 * 60)
}

export function relativeTime(isoTimestamp, now = new Date()) {
  const diffMs = now.getTime() - new Date(isoTimestamp).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
