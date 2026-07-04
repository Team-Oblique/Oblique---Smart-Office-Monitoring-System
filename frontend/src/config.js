// Central place for environment-driven config. Keeping this in one file
// means swapping "mock mode" for "real backend mode" never touches
// component code — only these values (or a .env file) change.

// Vite statically provides import.meta.env in the browser build; guard
// against it being absent (e.g. when these pure modules are imported
// under plain Node for testing).
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

const truthy = (v, fallback) => {
  if (v === undefined || v === '') return fallback
  return v === 'true' || v === '1'
}

export const config = {
  // When true, the app never talks to a network backend — it generates
  // its own device feed in-browser. Useful for demoing the dashboard
  // standalone; defaults to false now that a real backend is available.
  useMock: truthy(env.VITE_USE_MOCK, false),

  // REST endpoint that returns the initial device list:
  //   GET {API_BASE_URL}/devices -> Device[]
  apiBaseUrl: env.VITE_API_BASE_URL || 'http://localhost:8000',

  // WebSocket endpoint. Backend broadcasts on manual overrides and alert
  // changes only (not on every simulator tick) — see src/hooks/useLiveDevices.js
  // for how this is combined with REST polling to stay actually live.
  wsUrl: env.VITE_WS_URL || 'ws://localhost:8000/ws',

  officeHours: { start: 9, end: 17 }, // 9AM–5PM, per the brief
  continuousOnAlertHours: 2, // "all devices on for more than 2 hours"

  rooms: [
    { id: 'drawing', name: 'Drawing Room', fans: 2, lights: 3 },
    { id: 'work1', name: 'Work Room 1', fans: 2, lights: 3 },
    { id: 'work2', name: 'Work Room 2', fans: 2, lights: 3 },
  ],

  wattage: { fan: 60, light: 15 }, // watts when ON
}