import { useEffect, useRef, useState } from 'react'
import { config } from '../config.js'
import { fetchDevices } from '../services/api.js'
import { connectDeviceSocket } from '../services/socket.js'
import { generateInitialDevices, startMockFeed } from '../mock/simulator.js'
import { adaptBackendDevices } from '../utils/adaptDevice.js'
import { totalPower } from '../utils/power.js'

const HISTORY_LENGTH = 60 // samples kept for the power chart

// The backend's simulator flips devices roughly every 2s (see
// backend/app/simulator/worker.py), but it only writes to its in-memory
// store — it does NOT broadcast those ambient changes over the WebSocket
// (the WebSocket only fires on manual overrides and alert state changes).
// So REST polling, not the WebSocket, is what actually keeps this
// dashboard "live". The WebSocket is still used below, just as a nice
// bonus: an instant trigger to refresh right away instead of waiting for
// the next poll tick, plus it drives the "Live" connection indicator.
const POLL_INTERVAL_MS = 2000

/**
 * Single source of truth for device state on the frontend. Read-only by
 * design — this dashboard reflects backend state, it doesn't control
 * devices (that happens elsewhere, e.g. the Discord bot or the simulator
 * itself).
 *
 * Returns:
 *   devices          Device[]
 *   connectionStatus 'connecting' | 'connected' | 'disconnected' | 'mock'
 *   history           Array<[epochMs, totalWatts]> for charting
 *   lastEventAt       Date | null — timestamp of the most recent update
 */
export function useLiveDevices() {
  const [devices, setDevices] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const [history, setHistory] = useState([])
  const [lastEventAt, setLastEventAt] = useState(null)

  const devicesRef = useRef(devices)
  devicesRef.current = devices

  useEffect(() => {
    let stopFeed = () => {}
    let socketHandle = null
    let pollTimer = null
    let cancelled = false

    async function refreshFromBackend() {
      try {
        const raw = await fetchDevices()
        if (cancelled) return
        setDevices(adaptBackendDevices(raw))
        setLastEventAt(new Date())
      } catch (err) {
        console.error('Failed to refresh devices from backend:', err)
      }
    }

    async function bootstrap() {
      if (config.useMock) {
        const initial = generateInitialDevices()
        setDevices(initial)
        setConnectionStatus('mock')
        stopFeed = startMockFeed(initial, (update) => {
          setDevices((prev) =>
            prev.map((d) => (d.id === update.id ? { ...d, ...update } : d)),
          )
          setLastEventAt(new Date())
        })
        return
      }

      setConnectionStatus('connecting')
      await refreshFromBackend()

      // Real source of truth: poll on a fixed cadence.
      pollTimer = setInterval(refreshFromBackend, POLL_INTERVAL_MS)

      // Bonus: refresh immediately whenever the backend pushes something
      // (a manual override or an alert), rather than waiting up to
      // POLL_INTERVAL_MS. We don't bother parsing the WS payload itself —
      // its shape differs per message type — a full refetch is simpler
      // and just as correct.
      socketHandle = connectDeviceSocket(config.wsUrl, {
        onMessage: () => {
          refreshFromBackend()
        },
        onStatusChange: setConnectionStatus,
      })
    }

    bootstrap()

    return () => {
      cancelled = true
      stopFeed()
      socketHandle?.close()
      if (pollTimer) clearInterval(pollTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sample total wattage on a fixed cadence so the chart has a smooth
  // timeline independent of how often individual devices flip.
  useEffect(() => {
    const sample = () => {
      const watts = totalPower(devicesRef.current)
      setHistory((prev) => [...prev.slice(-(HISTORY_LENGTH - 1)), [Date.now(), watts]])
    }
    sample()
    const timer = setInterval(sample, 5000)
    return () => clearInterval(timer)
  }, [])

  return {
    devices,
    connectionStatus,
    history,
    lastEventAt,
  }
}