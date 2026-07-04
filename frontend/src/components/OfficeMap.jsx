import { config } from '../config.js'

// Three room slots laid out left-to-right, matching the office layout
// diagram in the brief. Each slot defines the rect it occupies in the
// 900x300 viewBox; device dot/blade positions are derived from it below.


const DEVICE_POSITIONS = {
  "drawing-light-1": { left: "11%", top: "13%" },
  "drawing-light-2": { left: "20%", top: "69%" },
  "drawing-light-3": { left: "29%", top: "13%" },

  "drawing-fan-1": { left: "20%", top: "14.5%" },
  "drawing-fan-2": { left: "20%", top: "57%" },

  "work1-light-1": { left: "43%", top: "13%" },
  "work1-light-2": { left: "60%", top: "13%" },
  "work1-light-3": { left: "51.5%", top: "69%" },

  "work1-fan-1": { left: "51%", top: "14.5%" },
  "work1-fan-2": { left: "51%", top: "50%" },

  "work2-light-1": { left: "74.5%", top: "13%" },
  "work2-light-2": { left: "83%", top: "69%" },
  "work2-light-3": { left: "91.5%", top: "13%" },

  "work2-fan-1": { left: "82.5%", top: "14.5%" },
  "work2-fan-2": { left: "82.5%", top: "50%" },
};

function LightIcon({ isOn, selected }) {
  return (
    <div
      className={`
        w-5 h-5 rounded-full
        transition-all duration-300
        cursor-pointer
        hover:scale-125
        ${
          isOn
            ? "bg-yellow-400 shadow-[0_0_18px_8px_rgba(255,220,0,0.8)]"
            : "bg-gray-500"
        }
        ${
          selected
            ? "ring-4 ring-cyan-400"
            : ""
        }
      `}
    />
  );
}function FanIcon({ isOn, selected }) {
  return (
    <div
      className={`
        w-8 h-8
        rounded-full
        bg-white/80
        flex
        items-center
        justify-center
        cursor-pointer
        hover:scale-110
        transition-all
        ${
          isOn
            ? "animate-spin-slow"
            : ""
        }
        ${
          selected
            ? "ring-4 ring-cyan-400"
            : ""
        }
      `}
    >
      🌀
    </div>
  );
}

export default function OfficeMap({ devicesByRoom,onDeviceClick }) {
  return (
    <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-[var(--font-display)] text-base font-semibold text-[var(--color-text-primary)]">
          Floor plan
        </h3>
        <div className="flex items-center gap-3 font-[var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--color-amber)]" /> energized
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--color-text-muted)]" /> off
          </span>
        </div>
      </div>
      <div className="relative">
    <img
        src="/office-layout.png"
        alt="Office Layout"
        className="w-full rounded-lg"
    />
    {Object.values(devicesByRoom)
  .flat()
  .map((device) => {

    const pos = DEVICE_POSITIONS[device.id];

    if (!pos) return null;

    return (
      <div
        key={device.id}
        className="absolute"
        style={{
          left: pos.left,
          top: pos.top,
          transform: "translate(-50%, -50%)",
        }}
        onClick={() => onDeviceClick(device)}
      >
        {device.type === "light" ? (
          <LightIcon
            isOn={device.status === "ON"}
          />
        ) : (
          <FanIcon
            isOn={device.status === "ON"}
          />
        )}
      </div>
    );
  })}
</div>

    </section>
  )
}
