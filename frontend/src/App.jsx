import { useMemo, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import RoomPanel from './components/RoomPanel.jsx'
import PowerUsagePanel from './components/PowerUsagePanel.jsx'
import AlertsPanel from './components/AlertsPanel.jsx'
import OfficeMap from './components/OfficeMap.jsx'
import { useLiveDevices } from './hooks/useLiveDevices.js'
import { config } from './config.js'
import { groupByRoom, roomLabel } from './utils/devices.js'
import { totalPower, powerByRoom } from './utils/power.js'
import { computeAlerts } from './utils/alerts.js'

export default function App() {

const {
  devices,
  connectionStatus,
  history,
} = useLiveDevices()
const [selectedDeviceId, setSelectedDeviceId] = useState(null)

const selectedDevice =
  devices.find((d) => d.id === selectedDeviceId)
const byRoom = useMemo(() => groupByRoom(devices), [devices])
  const watts = useMemo(() => totalPower(devices), [devices])
  const roomWatts = useMemo(() => powerByRoom(devices), [devices])
  // Recompute alerts once a minute rather than every render — office-hours
  // and continuous-on checks don't need second-level precision.
  const alerts = useMemo(() => computeAlerts(devices), [devices])

  return (
    <div className="min-h-screen">
      <Navbar connectionStatus={connectionStatus} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <OfficeMap
    devicesByRoom={byRoom}
    onDeviceClick={(device) => {
        setSelectedDeviceId(device.id)
    }}
/>
        </div>

        {selectedDevice && (
  <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 mb-6">
    <h2 className="text-lg font-bold">{selectedDevice.name}</h2>

    <p>Room: {selectedDevice.room}</p>

    <p>Type: {selectedDevice.type}</p>

    <p>Status: {selectedDevice.status}</p>
  </div>
)}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {config.rooms.map((room) => (
              <RoomPanel key={room.id} roomName={roomLabel(room.id)} devices={byRoom[room.id] ?? []} />
            ))}
          </div>

          <div className="space-y-6">
            <PowerUsagePanel totalWatts={watts} byRoom={roomWatts} history={history} />
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  )
}