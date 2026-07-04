"""
REST API routes.

  GET   /devices              - list all, optional ?room= filter
  GET   /devices/{id}         - single device
  PATCH /devices/{id}         - manual on/off override
  GET   /usage                - live power usage snapshot
  GET   /alerts                - active (or all) alerts

All three route groups live in one file per the team's chosen layout;
they're separated below by comment headers for readability. Each group
could be split into its own module later without changing behavior.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from ..alerts.engine import engine
from ..models.schemas import Alert, Device, DeviceUpdate, UsageSnapshot
from ..services.store import store
from ..simulator.worker import random_power_for, worker
from ..websocket.manager import manager

router = APIRouter()


# ---------------------------------------------------------------------------
# /devices
# ---------------------------------------------------------------------------

@router.get("/devices", response_model=list[Device], tags=["devices"])
async def list_devices(room: Optional[str] = Query(default=None)) -> list[Device]:
    devices = store.get_all_devices()
    if room:
        devices = [d for d in devices if d.room == room]
    return devices


@router.get("/devices/{device_id}", response_model=Device, tags=["devices"])
async def get_device(device_id: str) -> Device:
    device = store.get_device(device_id)
    if device is None:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found")
    return device


@router.patch("/devices/{device_id}", response_model=Device, tags=["devices"])
async def update_device(device_id: str, update: DeviceUpdate) -> Device:
    """
    Manual override (e.g. a dashboard toggle or a Discord !toggle command).
    Broadcasts the change over the WebSocket same as the simulator does,
    so every connected client stays in sync regardless of who caused it.
    """
    existing = store.get_device(device_id)
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found")

    power_w = update.power_w
    if update.status == "ON" and power_w is None:
        # No explicit wattage given -- assign a realistic value for the
        # device type, same ranges the simulator itself uses.
        power_w = random_power_for(existing.type)

    device = store.update_status(device_id, update.status, power_w=power_w)

    # Tell the simulator not to immediately flip this device back within
    # its next tick, so the user's manual action isn't undone.
    worker.mark_overridden(device_id)

    snapshot = store.get_usage_snapshot()
    await manager.broadcast(
        {
            "type": "device_update",
            "device": device.model_dump(mode="json"),
            "usage": snapshot.model_dump(mode="json"),
        }
    )
    return device


# ---------------------------------------------------------------------------
# /usage
# ---------------------------------------------------------------------------

@router.get("/usage", response_model=UsageSnapshot, tags=["usage"])
async def get_usage() -> UsageSnapshot:
    return store.get_usage_snapshot()


# ---------------------------------------------------------------------------
# /alerts
# ---------------------------------------------------------------------------

@router.get("/alerts", response_model=list[Alert], tags=["alerts"])
async def list_alerts(active_only: bool = Query(default=True)) -> list[Alert]:
    alerts = await engine.list_alerts()
    if active_only:
        alerts = [a for a in alerts if a.active]
    return alerts