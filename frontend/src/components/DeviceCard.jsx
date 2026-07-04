import { Fan, Lightbulb } from 'lucide-react'
import { relativeTime } from '../utils/devices.js'

export default function DeviceCard({ device }) {
  const isOn = device.status === 'ON'
  const Icon = device.type === 'fan' ? Fan : Lightbulb

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
        isOn
          ? 'border-[var(--color-amber)]/40 bg-[var(--color-amber)]/[0.07]'
          : 'border-[var(--color-line)] bg-[var(--color-panel-raised)]'
      }`}
    >
      <Icon
        className={[
          'h-4 w-4 shrink-0',
          isOn ? 'text-[var(--color-amber)]' : 'text-[var(--color-text-muted)]',
          isOn && device.type === 'fan' ? 'animate-spin-slow' : '',
          isOn && device.type === 'light' ? 'animate-glow-pulse' : '',
        ].join(' ')}
        strokeWidth={2}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{device.name}</p>
        <p className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
          {relativeTime(device.lastChanged)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-wide ${
            isOn
              ? 'bg-[var(--color-amber)]/15 text-[var(--color-amber)]'
              : 'bg-white/5 text-[var(--color-text-muted)]'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isOn ? 'bg-[var(--color-amber)]' : 'bg-[var(--color-text-muted)]'}`} />
          {device.status}
        </span>
        <span className="font-[var(--font-mono)] text-[11px] text-[var(--color-text-secondary)]">
          {isOn ? `${device.power}W` : '—'}
        </span>
      </div>
    </div>
  )
}
