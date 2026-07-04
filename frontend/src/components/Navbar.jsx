import { Radio } from 'lucide-react'

const STATUS_COPY = {
  connected: { label: 'Live', dot: 'bg-teal-400', text: 'text-[var(--color-teal)]' },
  mock: { label: 'Live (simulated)', dot: 'bg-teal-400', text: 'text-[var(--color-teal)]' },
  connecting: { label: 'Connecting…', dot: 'bg-amber-400', text: 'text-[var(--color-amber)]' },
  disconnected: { label: 'Reconnecting…', dot: 'bg-red-400', text: 'text-[var(--color-red)]' },
}

export default function Navbar({ connectionStatus }) {
  const status = STATUS_COPY[connectionStatus] ?? STATUS_COPY.connecting

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-line)] bg-[var(--color-panel)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Radio className="h-5 w-5 text-[var(--color-amber)]" strokeWidth={2.25} />
          <span className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
            Office Watch
          </span>
          <span className="hidden font-[var(--font-mono)] text-xs text-[var(--color-text-muted)] sm:inline">
            / control panel
          </span>
        </div>

        <div className="flex items-center gap-2 font-[var(--font-mono)] text-xs">
          <span className={`relative flex h-2 w-2`}>
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full ${status.dot} opacity-60`}
            />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${status.dot}`} />
          </span>
          <span className={status.text}>{status.label}</span>
        </div>
      </div>
    </header>
  )
}
