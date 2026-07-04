import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function formatTime(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel-raised)] px-2.5 py-1.5 font-[var(--font-mono)] text-xs text-[var(--color-text-primary)] shadow-lg">
      <p className="text-[var(--color-text-muted)]">{formatTime(label)}</p>
      <p>{payload[0].value}W</p>
    </div>
  )
}

export default function PowerChart({ history }) {
  const data = history.map(([t, w]) => ({ t, w }))

  if (data.length < 2) {
    return (
      <div className="flex h-28 items-center justify-center font-[var(--font-mono)] text-xs text-[var(--color-text-muted)]">
        Collecting samples…
      </div>
    )
  }

  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="powerFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4fd1c5" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4fd1c5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" tickFormatter={formatTime} hide />
          <YAxis hide domain={[0, 'dataMax + 100']} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="w"
            stroke="#4fd1c5"
            strokeWidth={2}
            fill="url(#powerFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
