// Thin WebSocket wrapper: JSON-parses incoming frames and auto-reconnects
// with capped exponential backoff so a dropped connection (backend restart,
// wifi hiccup) doesn't require a page reload to recover.
//
// Expected inbound frame (one device change per message):
//   { id: "work1-fan-1", room: "work1", device: "Fan 1",
//     status: "ON" | "OFF", power: 60, lastChanged: "2026-07-04T09:12:00Z" }
//
// If your backend instead sends the raw `{ device: "Light 1", status: "ON" }`
// shape from the brief's example, you'll need to add `room`/`id` server-side
// — "Light 1" alone is ambiguous across 3 rooms. See README "Backend contract".

export function connectDeviceSocket(url, { onMessage, onStatusChange }) {
  let socket = null
  let closedByCaller = false
  let attempt = 0
  let reconnectTimer = null

  const scheduleReconnect = () => {
    if (closedByCaller) return
    const delay = Math.min(1000 * 2 ** attempt, 15000)
    attempt += 1
    reconnectTimer = setTimeout(open, delay)
  }

  function open() {
    onStatusChange?.('connecting')
    socket = new WebSocket(url)

    socket.onopen = () => {
      attempt = 0
      onStatusChange?.('connected')
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (err) {
        console.error('Malformed WS frame, ignoring:', event.data, err)
      }
    }

    socket.onclose = () => {
      if (closedByCaller) return
      onStatusChange?.('disconnected')
      scheduleReconnect()
    }

    socket.onerror = () => {
      socket?.close()
    }
  }

  open()

  return {
    close() {
      closedByCaller = true
      clearTimeout(reconnectTimer)
      socket?.close()
    },
  }
}
