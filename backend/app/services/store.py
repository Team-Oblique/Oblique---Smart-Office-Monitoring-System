import threading
from typing import Optional
from datetime import datetime, timezone

from ..models.schemas import Device, UsageSnapshot


class DeviceStore:
    """
    In-memory store for all devices.
    Uses a lock so the simulator (background task) and API routes
    can safely read/write from different async contexts.
    """

    def __init__(self):
        self._devices: dict[str, Device] = {}
        self._lock = threading.Lock()

    # ---- seeding / setup ----

    def add_device(self, device: Device) -> None:
        with self._lock:
            self._devices[device.id] = device

    def seed(self, devices: list[Device]) -> None:
        with self._lock:
            for d in devices:
                self._devices[d.id] = d

    # ---- reads ----

    def get_device(self, device_id: str) -> Optional[Device]:
        with self._lock:
            return self._devices.get(device_id)

    def get_all_devices(self) -> list[Device]:
        with self._lock:
            return list(self._devices.values())

    # ---- writes ----

    def update_status(self, device_id: str, status: str, power_w: Optional[float] = None) -> Optional[Device]:
        """
        Flip a device ON/OFF. If power_w isn't given, ON keeps its last power
        draw, OFF forces power to 0.
        """
        with self._lock:
            device = self._devices.get(device_id)
            if device is None:
                return None

            device.status = status
            if power_w is not None:
                device.power_w = power_w
            elif status == "OFF":
                device.power_w = 0.0

            device.last_changed = datetime.now(timezone.utc)
            return device

    def update_power(self, device_id: str, power_w: float) -> Optional[Device]:
        with self._lock:
            device = self._devices.get(device_id)
            if device is None:
                return None
            device.power_w = power_w
            device.last_changed = datetime.now(timezone.utc)
            return device

    # ---- aggregation ----

    def get_usage_snapshot(self) -> UsageSnapshot:
        with self._lock:
            devices = list(self._devices.values())

        total_power_w = sum(d.power_w for d in devices)
        room_breakdown: dict[str, float] = {}
        for d in devices:
            room_breakdown[d.room] = room_breakdown.get(d.room, 0.0) + d.power_w

        # rough daily estimate assuming current draw holds for 24h
        estimated_daily_kwh = (total_power_w * 24) / 1000

        return UsageSnapshot(
            total_power_w=total_power_w,
            estimated_daily_kwh=estimated_daily_kwh,
            room_breakdown=room_breakdown,
        )

def seed_initial_devices() -> list[Device]:
    """
    Builds the fixed office layout defined by the hackathon spec:
    3 rooms x (2 fans + 3 lights) = 15 devices total.
    Returns the list so callers can inspect it if needed, but does NOT
    call store.seed() itself — the caller decides when to seed.
    """
    rooms = ["Drawing Room", "Work Room 1", "Work Room 2"]
    devices: list[Device] = []

    for room in rooms:
        room_key = room.replace(" ", "")
        for i in range(1, 3):  # 2 fans per room
            devices.append(Device(
                id=f"{room_key}-fan{i}",
                name=f"Fan {i}",
                room=room,
                type="fan",
                status="OFF",
                power_w=0.0,
            ))
        for i in range(1, 4):  # 3 lights per room
            devices.append(Device(
                id=f"{room_key}-light{i}",
                name=f"Light {i}",
                room=room,
                type="light",
                status="OFF",
                power_w=0.0,
            ))

    return devices

# Singleton instance — everyone (routes, simulator, worker) imports THIS.
store = DeviceStore()