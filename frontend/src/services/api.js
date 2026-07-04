import { config } from '../config.js'

/**
 * GET {apiBaseUrl}/devices
 * Returns the backend's raw Device[] shape (snake_case fields, full room
 * name strings) — see src/utils/adaptDevice.js for the translation into
 * this app's internal Device shape.
 */
export async function fetchDevices() {
  const res = await fetch(`${config.apiBaseUrl}/devices`)
  if (!res.ok) {
    throw new Error(`GET /devices failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}