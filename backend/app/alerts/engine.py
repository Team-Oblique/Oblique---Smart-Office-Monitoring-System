"""
Alert engine. Periodically evaluates device state against two rules:

  - after_hours: a device is ON outside office hours (per-device alert).
  - stuck_on: every device in a room has been ON continuously for more
    than STUCK_ON_THRESHOLD_HOURS (per-room alert).

De-dup strategy: alerts are keyed by (kind, id) so a condition that's
still true doesn't spam new alert rows every tick -- we only add a new
one when a previously-cleared condition re-triggers, and we flip
`active=False` once the condition resolves.

Reads device state directly from the store (no special hook into the
simulator needed) on its own schedule, per the handoff spec.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

from ..config import (
    ALERT_CHECK_INTERVAL_SECONDS,
    OFFICE_HOURS_END,
    OFFICE_HOURS_START,
    STUCK_ON_THRESHOLD_HOURS,
)
from ..models.schemas import Alert
from ..services.store import store
from ..websocket.manager import manager


class AlertEngine:
    def __init__(self) -> None:
        self._active: dict[str, Alert] = {}
        self._lock = asyncio.Lock()
        # Hook for the Discord bot's proactive-post bonus feature, or any
        # other consumer that wants a callback whenever a new alert fires.
        self.on_new_alert = None  # type: ignore[assignment]

    async def list_alerts(self) -> list[Alert]:
        async with self._lock:
            return sorted(self._active.values(), key=lambda a: a.created_at, reverse=True)

    async def _upsert(
        self,
        key: str,
        kind: str,
        message: str,
        *,
        device_id: str | None = None,
        room: str | None = None,
        severity: str = "warning",
    ) -> None:
        async with self._lock:
            existing = self._active.get(key)
            if existing and existing.active:
                return  # still firing, already recorded
            alert = Alert(
                id=key,
                device_id=device_id,
                room=room,
                kind=kind,
                message=message,
                severity=severity,
                active=True,
            )
            self._active[key] = alert
        if self.on_new_alert:
            await self.on_new_alert(alert)
        await manager.broadcast({"type": "alert", "alert": alert.model_dump(mode="json")})

    async def _clear(self, key: str) -> None:
        async with self._lock:
            existing = self._active.get(key)
            if existing and existing.active:
                existing.active = False

    async def evaluate(self) -> None:
        now = datetime.now(timezone.utc)
        in_office_hours = OFFICE_HOURS_START <= now.hour < OFFICE_HOURS_END
        devices = store.get_all_devices()

        # --- after_hours rule (per-device) ---
        for d in devices:
            key = f"after_hours::{d.id}"
            if d.status == "ON" and not in_office_hours:
                await self._upsert(
                    key, "after_hours",
                    f"{d.name} in {d.room} is still ON after office hours.",
                    device_id=d.id, room=d.room,
                )
            else:
                await self._clear(key)

        # --- stuck_on rule (per-room) ---
        by_room: dict[str, list] = {}
        for d in devices:
            by_room.setdefault(d.room, []).append(d)

        threshold = timedelta(hours=STUCK_ON_THRESHOLD_HOURS)
        for room, room_devices in by_room.items():
            key = f"stuck_on::{room}"
            all_on = all(d.status == "ON" for d in room_devices)
            all_stuck = all_on and all(
                (now - d.last_changed) >= threshold for d in room_devices
            )
            if all_stuck:
                await self._upsert(
                    key, "stuck_on",
                    f"All devices in {room} have been ON for over "
                    f"{STUCK_ON_THRESHOLD_HOURS} hours straight. Did someone forget to leave?",
                    room=room, severity="critical",
                )
            else:
                await self._clear(key)


engine = AlertEngine()


async def run_alert_loop() -> None:
    while True:
        try:
            await engine.evaluate()
        except Exception as exc:  # noqa: BLE001
            print(f"[alerts] evaluation error: {exc}")
        await asyncio.sleep(ALERT_CHECK_INTERVAL_SECONDS)