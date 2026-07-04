import asyncio
import random
from datetime import datetime, timezone

from ..services.store import store


# Realistic wattage ranges per device type, used when a device turns ON
# or when it's first seeded without an explicit power_w.
POWER_RANGES = {
    "fan": (40.0, 75.0),
    "light": (8.0, 20.0),
}


def random_power_for(device_type: str) -> float:
    """
    Module-level helper (not just a method on SimulatorWorker) so routes.py
    can reuse the same realistic wattage ranges when a device is manually
    turned ON via /api/override without an explicit power_w.
    """
    low, high = POWER_RANGES.get(device_type, (20.0, 100.0))
    return round(random.uniform(low, high), 1)


class SimulatorWorker:
    """
    Background task that periodically mutates device state to mimic
    a live office: devices randomly turn on/off, and power draw jitters
    a bit while a device is ON.
    """

    def __init__(self, interval_seconds: float = 2.0, flip_probability: float = 0.15):
        self.interval_seconds = interval_seconds
        self.flip_probability = flip_probability
        self._running = False
        self._recently_overridden: set[str] = set()

    def mark_overridden(self, device_id: str) -> None:
        """
        Call this when a user manually changes a device (e.g. via /api/override
        or a Discord command) so the simulator skips it for one cycle instead
        of immediately overwriting the user's action.
        """
        self._recently_overridden.add(device_id)

    def _random_power_for(self, device_type: str) -> float:
        return random_power_for(device_type)

    async def _tick(self) -> None:
        devices = store.get_all_devices()

        for device in devices:
            if device.id in self._recently_overridden:
                self._recently_overridden.discard(device.id)
                continue

            if random.random() < self.flip_probability:
                new_status = "OFF" if device.status == "ON" else "ON"
                if new_status == "ON":
                    new_power = self._random_power_for(device.type)
                    store.update_status(device.id, "ON", power_w=new_power)
                else:
                    store.update_status(device.id, "OFF")
            elif device.status == "ON":
                # jitter power draw slightly while ON, but stay within
                # a realistic band for the device type
                low, high = POWER_RANGES.get(device.type, (20.0, 100.0))
                jitter = device.power_w * random.uniform(-0.05, 0.05)
                new_power = min(high, max(low, round(device.power_w + jitter, 1)))
                store.update_power(device.id, new_power)

    async def run(self) -> None:
        self._running = True
        while self._running:
            await self._tick()
            await asyncio.sleep(self.interval_seconds)

    def stop(self) -> None:
        self._running = False


worker = SimulatorWorker()


async def run_simulator_loop() -> None:
    """
    Entry point expected by app/main.py's lifespan handler.
    Thin wrapper around worker.run() so main.py doesn't need to know
    about the SimulatorWorker class directly.
    """
    await worker.run()