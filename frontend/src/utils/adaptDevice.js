// Translates the real backend's Device shape into the shape the rest of
// this frontend was already built around (see mock/simulator.js).
//
// Backend sends (snake_case, full room name, id like "WorkRoom1-fan1"):
//   { id: "WorkRoom1-fan1", name: "Fan 1", room: "Work Room 1",
//     type: "fan", status: "ON", power_w: 61.9,
//     last_changed: "2026-07-04T09:14:11.987230Z" }
//
// Frontend expects (camelCase, short room id, id like "work1-fan-1"):
//   { id: "work1-fan-1", name: "Fan 1", room: "work1",
//     type: "fan", status: "ON", power: 61.9,
//     lastChanged: "2026-07-04T09:14:11.987230Z" }
//
// The device id format matters beyond just naming — OfficeMap.jsx has a
// hardcoded DEVICE_POSITIONS map keyed by ids in the frontend's format
// ("work1-fan-1"), so devices must be translated to that exact pattern
// or the floor plan dots won't line up with any device.

const ROOM_NAME_TO_ID = {
  'Drawing Room': 'drawing',
  'Work Room 1': 'work1',
  'Work Room 2': 'work2',
}

/** Turns one backend Device into this app's internal Device shape. */
export function adaptBackendDevice(d) {
  const roomId = ROOM_NAME_TO_ID[d.room] ?? d.room

  // Backend ids end in a digit (e.g. "...fan1", "...light3") — reuse that
  // same index when rebuilding the frontend-style id.
  const indexMatch = d.id.match(/(\d+)$/)
  const index = indexMatch ? indexMatch[1] : '1'

  return {
    id: `${roomId}-${d.type}-${index}`,
    backendId: d.id, // kept in case anything ever needs to call the API for this device
    name: d.name,
    type: d.type,
    room: roomId,
    status: d.status,
    power: Math.round(d.power_w * 10) / 10,
    lastChanged: d.last_changed,
  }
}

/** Maps a whole backend Device[] response in one call. */
export function adaptBackendDevices(devices) {
  return devices.map(adaptBackendDevice)
}