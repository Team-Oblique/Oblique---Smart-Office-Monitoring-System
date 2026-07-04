# Office Watch — Web Dashboard

React + Vite + Tailwind frontend for deliverable **4. The Web Dashboard**. It
renders live device state, a per-room power meter, and an alerts panel, and
is built to run standalone (self-generated dummy data) or against a real
backend with a one-line config flip.

## Quick start

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. By default `VITE_USE_MOCK=true`, so the
dashboard runs with zero backend — it generates 15 devices in-browser and
flips a random one every ~4s, exactly like the brief's "dynamic dummy data"
requirement, just running client-side instead of on a server.

## Switching to a real backend

Copy `.env.example` to `.env.local` and set:

```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
```

No component code changes — `src/hooks/useLiveDevices.js` is the only place
that branches on `config.useMock`, and it swaps the in-browser simulator
(`src/mock/simulator.js`) for the real REST + WebSocket clients
(`src/services/api.js`, `src/services/socket.js`).

### Backend contract this frontend expects

**`GET {API_BASE_URL}/api/devices`** → initial snapshot:

```json
[
  {
    "id": "work1-fan-1",
    "name": "Fan 1",
    "type": "fan",
    "room": "work1",
    "status": "OFF",
    "power": 60,
    "lastChanged": "2026-07-04T09:12:00Z"
  }
]
```

**WebSocket `{WS_URL}`** → one JSON frame per device change:

```json
{ "id": "work1-fan-1", "room": "work1", "device": "Fan 1", "status": "ON", "power": 60, "lastChanged": "2026-07-04T10:03:00Z" }
```

`id` is required and must match an id from the initial snapshot. The brief's
example frame (`{"device": "Light 1", "status": "ON"}`) is ambiguous on its
own — "Light 1" exists in all three rooms — so the frontend needs `id` (or at
minimum `room` + `device`) to know which of the three it means. If your
backend team wants to keep sending the bare `{device, status}` shape, add a
mapping step server-side, or tell me and I'll adjust `applyUpdate` in
`useLiveDevices.js` to resolve `room+device → id` instead.

## A note on device count

The brief's prose says "18 devices" in several places (deliverable 3, the
Live Device Status Panel spec), but its own numbers don't reach 18: 2 fans +
3 lights per room × 3 rooms = **15**, and page 1 states "15 devices total"
explicitly. The office-layout graphic's own subtotals agree (`Total Fans: 6,
Total Lights: 9` → 15) even though its "Total Devices" line says 18. This
build uses 15, matching the explicit per-room counts.

If you want to literally hit 18 (e.g. a 3rd fan or an extra device type per
room), it's a one-line change in `src/config.js`:

```js
rooms: [
  { id: 'drawing', name: 'Drawing Room', fans: 2, lights: 3 },
  // ...
]
```

Worth confirming with whoever wrote the brief before deciding what the extra
3 devices should be.

## Architecture

```
src/
  config.js            Single source of config: mock vs real, office hours,
                        alert thresholds, room/device definitions.
  mock/simulator.js     Self-contained dummy device feed (18/15-device
                        generator + randomized status-flip interval).
  services/api.js       REST client (fetchDevices) for real-backend mode.
  services/socket.js    WebSocket client w/ auto-reconnect for real-backend mode.
  hooks/useLiveDevices.js
                        The one hook that owns device state. Everything else
                        is a pure function of its output — this is the
                        "single source of truth on the frontend" mirroring
                        the backend's shared-source-of-truth requirement.
  utils/devices.js      Device-shape helpers (grouping, ids, relative time).
  utils/power.js        Wattage aggregation (total, per-room, kWh estimate).
  utils/alerts.js       Alert rules (after-hours, continuous-on-2h+).
  components/           Presentational only — no component talks to the
                        network or mock feed directly, they all just receive
                        props computed in App.jsx from useLiveDevices().
```

Data flow: `useLiveDevices()` → `App.jsx` computes `byRoom` / `totalWatts` /
`alerts` with the `utils/*` pure functions → passed down as props to
`OfficeMap`, `RoomPanel`, `PowerUsagePanel`, `AlertsPanel`. No component
re-implements the same aggregation twice, and the aggregation functions are
plain functions you can unit test without React at all (see "Validation"
below).

**Real-time without a page refresh:** state updates flow through React state
via the WebSocket `onmessage` (or the mock interval) triggering `setDevices`,
which re-renders only the affected `DeviceCard`. No polling, no manual
refresh, per the brief's clarification #3.

## Validation approach

Two things worth checking before you build on top of this:

1. **Syntax/type sanity** — every file was passed through esbuild's
   transform in isolation (`node --check`-style, no bundler needed) to catch
   typos and malformed JSX.
2. **Logic correctness** — `utils/power.js`, `utils/alerts.js`,
   `utils/devices.js`, and `mock/simulator.js` are plain functions with no
   DOM dependency, so they were exercised directly under Node with
   assertions covering: device count/uniqueness, per-room wattage math, the
   "all clear during office hours" case, the seeded continuous-on alert, the
   after-hours alert, and the kWh trapezoidal estimate. Consider turning
   that script into a real `vitest` suite (`npm i -D vitest`) — the pure
   `utils/` functions are already structured for it.

Not yet validated: an actual browser render (this environment can't run a
dev server against a browser), and the real-backend path (no live
REST/WebSocket server to point it at yet). Both are the natural next steps
once your backend deliverable exists — `npm run dev` locally is the fastest
way to confirm the browser render.

## Trade-offs

- **In-browser mock vs. a real mock backend service**: generating dummy data
  client-side (rather than a tiny Express/FastAPI mock server) means this
  repo has zero backend dependency and is demoable instantly, at the cost of
  not exercising the real WebSocket/REST code paths until a backend exists.
  `services/api.js` and `services/socket.js` are written and ready either way.
- **kWh estimate**: `estimateKwhToday` integrates only from samples taken
  since the page loaded (5s cadence, 60-sample window ≈ 5 min of history) —
  it is a live trend indicator, not a billing-accurate daily total. A real
  daily total needs the backend to persist and sum wattage-over-time
  server-side; the frontend isn't the right place to own that number long-term.
- **Tailwind v4 + CSS custom properties for the palette** (`src/index.css`
  `@theme` block) instead of hardcoding hex values in every component: keeps
  the "control room" palette (amber = energized, teal = live/data, red =
  alert) themeable from one file.

## Bonus implemented

- `OfficeMap.jsx` — SVG top-view floor plan; lights glow amber and pulse when
  ON, fans visually rotate when ON, all driven from the same device state as
  the rest of the dashboard (no separate data source to keep in sync).
