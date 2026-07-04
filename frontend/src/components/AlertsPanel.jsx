import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function AlertsPanel({ alerts }) {
  return (
    <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-base font-semibold text-[var(--color-text-primary)]">
          Alerts
        </h3>
        {alerts.length > 0 && (
          <span className="rounded-full bg-[var(--color-red)]/15 px-2 py-0.5 font-[var(--font-mono)] text-[11px] font-semibold text-[var(--color-red)]">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel-raised)] px-3 py-3 text-sm text-[var(--color-text-secondary)]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-teal)]" />
          All clear — nothing unusual right now.
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${
                alert.severity === 'critical'
                  ? 'border-[var(--color-red)]/40 bg-[var(--color-red)]/[0.08]'
                  : 'border-[var(--color-amber)]/40 bg-[var(--color-amber)]/[0.08]'
              }`}
            >
              <AlertTriangle
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  alert.severity === 'critical' ? 'text-[var(--color-red)]' : 'text-[var(--color-amber)]'
                }`}
              />
              <div className="min-w-0">
                <p className="text-[var(--color-text-primary)]">{alert.message}</p>
                <p className="mt-0.5 font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
