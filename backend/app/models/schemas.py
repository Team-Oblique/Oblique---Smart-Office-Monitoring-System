from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime, timezone


class Device(BaseModel):
    id: str
    name: str
    room: str
    type: Literal["fan", "light"]
    status: Literal["ON", "OFF"] = "OFF"
    power_w: float = 0.0
    last_changed: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DeviceUpdate(BaseModel):
    """Request body for PATCH /devices/{id} (manual override)."""
    status: Literal["ON", "OFF"]
    power_w: Optional[float] = None


class Alert(BaseModel):
    id: str
    device_id: Optional[str] = None  # set for per-device alerts (e.g. after_hours)
    room: Optional[str] = None       # set for per-room alerts (e.g. stuck_on)
    kind: Literal["after_hours", "stuck_on"]
    message: str
    severity: Literal["info", "warning", "critical"] = "warning"
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UsageSnapshot(BaseModel):
    total_power_w: float
    estimated_daily_kwh: float
    room_breakdown: dict[str, float]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))