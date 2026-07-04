// Self-contained mock device feed.
//
// This exists so the dashboard is fully demoable with zero backend running
// (the brief: "no real hardware needed... generate dummy data... should be
// dynamic"). It mimics exactly the two things a real backend would provide:
//   1. an initial device snapshot (like a GET /api/devices response)
//   2. a stream of update events (like WebSocket frames)
//
// Swapping this out for src/services/api.js + src/services/socket.js is a
// one-line change in src/hooks/useLiveDevices.js (toggle config.useMock).

import { config } from '../config.js'
import { buildDeviceId } from '../utils/devices.js'

function makeDevice(roomId, type, index, overrides = {}) {
  const now = new Date()
  return {
    id: buildDeviceId(roomId, type, index),
    name: `${type === 'fan' ? 'Fan' : 'Light'} ${index}`,
    type,
    room: roomId,
    status: 'OFF',
    power: config.wattage[type],
    lastChanged: now.toISOString(),
    ...overrides,
  }
}

/**
 * Builds the fixed office: 3 rooms x (2 fans + 3 lights) = 15 devices.
 * NOTE: the brief's prose repeats "18 devices" in several places, but its
 * own numbers (2 fans + 3 lights per room, 3 rooms) and its device-summary
 * graphic ("Total Fans: 6, Total Lights: 9") both total 15, not 18. This
 * builds to the explicit per-room counts. See README "A note on device
 * count" if you want to reconcile this to literally 18.
 */
export function generateInitialDevices() {
  const devices = []
  for (const room of config.rooms) {
    for (let i = 1; i <= room.fans; i++) devices.push(makeDevice(room.id, 'fan', i))
    for (let i = 1; i <= room.lights; i++) devices.push(makeDevice(room.id, 'light', i))
  }

  // Seed a few realistic starting states so the dashboard isn't a wall of
  // "OFF" on first load, and so the Alerts Panel has something to show
  // immediately without waiting for real wall-clock time to pass:
  const seed = (id, patch) => {
    const d = devices.find((x) => x.id === id)
    if (d) Object.assign(d, patch)
  }
  const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()

  // Work Room 1: everyone's at their desk — on for a normal 40 minutes.
  seed('work1-light-1', { status: 'ON', lastChanged: hoursAgo(0.7) })
  seed('work1-light-2', { status: 'ON', lastChanged: hoursAgo(0.7) })
  seed('work1-fan-1', { status: 'ON', lastChanged: hoursAgo(0.7) })

  // Work Room 2: left running unattended for 3+ hours -> should trip the
  // "continuous ON" alert on load, demonstrating that logic works.
  seed('work2-fan-1', { status: 'ON', lastChanged: hoursAgo(3.2) })
  seed('work2-fan-2', { status: 'ON', lastChanged: hoursAgo(3.2) })
  seed('work2-light-1', { status: 'ON', lastChanged: hoursAgo(3.2) })
  seed('work2-light-2', { status: 'ON', lastChanged: hoursAgo(3.2) })
  seed('work2-light-3', { status: 'ON', lastChanged: hoursAgo(3.2) })

  // Drawing Room: one lamp on for someone waiting.
  seed('drawing-light-1', { status: 'ON', lastChanged: hoursAgo(0.2) })

  return devices
}

/**
 * Starts an interval that randomly flips one device's status every
 * `intervalMs` and reports it through `onUpdate`, in the same shape a real
 * WebSocket message would use. Returns a `stop()` function for cleanup.
 */
export function startMockFeed(devices, onUpdate, intervalMs = 4000) {
  let cancelled = false

  const timer = setInterval(() => {
    if (cancelled || devices.length === 0) return
    const target = devices[Math.floor(Math.random() * devices.length)]
    const nextStatus = target.status === 'ON' ? 'OFF' : 'ON'
    const lastChanged = new Date().toISOString()

    onUpdate({
      id: target.id,
      room: target.room,
      device: target.name,
      status: nextStatus,
      power: target.power,
      lastChanged,
    })
  }, intervalMs)

  return function stop() {
    cancelled = true
    clearInterval(timer)
  }
}
