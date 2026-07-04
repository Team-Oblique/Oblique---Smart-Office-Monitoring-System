import DeviceCard from './DeviceCard.jsx'
import { totalPower } from '../utils/power.js'

export default function RoomPanel({ roomName, devices }) {
  const onCount = devices.filter((d) => d.status === 'ON').length
  const watts = totalPower(devices)

  return (
    <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-[var(--font-display)] text-base font-semibold text-[var(--color-text-primary)]">
          {roomName}
        </h3>
        <p className="font-[var(--font-mono)] text-xs text-[var(--color-text-secondary)]">
          {onCount}/{devices.length} on · {watts}W
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </section>
  )
}
