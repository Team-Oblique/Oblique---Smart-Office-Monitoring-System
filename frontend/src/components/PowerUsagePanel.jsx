import { config } from '../config.js'
import { roomLabel } from '../utils/devices.js'
import PowerChart from './PowerChart.jsx'

export default function PowerUsagePanel({ totalWatts, byRoom, history }) {
  const maxRoomWatts = Math.max(1, ...Object.values(byRoom))

  return (
    <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <h3 className="mb-1 font-[var(--font-display)] text-base font-semibold text-[var(--color-text-primary)]">
        Power draw
      </h3>

      <div className="mb-4 flex items-baseline gap-2">
        <span className="font-[var(--font-mono)] text-4xl font-semibold text-[var(--color-amber)] tabular-nums">
          {totalWatts}
        </span>
        <span className="font-[var(--font-mono)] text-sm text-[var(--color-text-secondary)]">W total</span>
      </div>

      <PowerChart history={history} />

      <div className="mt-4 space-y-2.5">
        {config.rooms.map((room) => {
          const watts = byRoom[room.id] ?? 0
          const pct = Math.round((watts / maxRoomWatts) * 100)
          return (
            <div key={room.id}>
              <div className="mb-1 flex items-center justify-between font-[var(--font-mono)] text-xs">
                <span className="text-[var(--color-text-secondary)]">{roomLabel(room.id)}</span>
                <span className="text-[var(--color-text-primary)] tabular-nums">{watts}W</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-[var(--color-teal)] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
