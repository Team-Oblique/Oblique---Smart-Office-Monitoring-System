import { config } from '../config.js'
import { groupByRoom, hoursSince, roomLabel } from './devices.js'

/**
 * Alert = { id, severity: "warning"|"critical", message, timestamp }
 *
 * Two conditions, per the brief:
 *  1. A device is ON outside office hours (9AM–5PM).
 *  2. A room where every device has been ON continuously for > 2 hours.
 *
 * `now` is injectable so this stays pure and unit-testable without
 * mocking the system clock.
 */
export function computeAlerts(devices, now = new Date()) {
  const alerts = []
  const hour = now.getHours()
  const isAfterHours = hour < config.officeHours.start || hour >= config.officeHours.end

  if (isAfterHours) {
    const onAfterHours = devices.filter((d) => d.status === 'ON')
    for (const d of onAfterHours) {
      alerts.push({
        id: `after-hours-${d.id}`,
        severity: 'warning',
        message: `${d.name} (${roomLabel(d.room)}) is still ON after office hours.`,
        timestamp: now.toISOString(),
      })
    }
  }

  const byRoom = groupByRoom(devices)
  for (const [roomId, roomDevices] of Object.entries(byRoom)) {
    if (roomDevices.length === 0) continue
    const allOn = roomDevices.every((d) => d.status === 'ON')
    const allOnLongEnough =
      allOn &&
      roomDevices.every(
        (d) => hoursSince(d.lastChanged, now) >= config.continuousOnAlertHours,
      )
    if (allOnLongEnough) {
      alerts.push({
        id: `continuous-on-${roomId}`,
        severity: 'critical',
        message: `${roomLabel(roomId)} has had every device ON for over ${config.continuousOnAlertHours} hours straight. Did someone forget to leave?`,
        timestamp: now.toISOString(),
      })
    }
  }

  return alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1))
}
