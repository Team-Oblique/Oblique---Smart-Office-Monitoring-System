import httpx
from config import BACKEND_URL

class APIClient:
    @staticmethod
    async def get_devices():
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{BACKEND_URL}/devices")
                return response.json() if response.status_code == 200 else None
            except Exception:
                return None

    @staticmethod
    async def get_room_status(room_name: str):
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{BACKEND_URL}/devices")
                if response.status_code != 200:
                    return None
                
                room_map = {
                    "drawing": "Drawing Room",
                    "drawing_room": "Drawing Room",
                    "drawingroom": "Drawing Room",
                    "work1": "Work Room 1",
                    "work_room_1": "Work Room 1",
                    "workroom1": "Work Room 1",
                    "work2": "Work Room 2",
                    "work_room_2": "Work Room 2",
                    "workroom2": "Work Room 2",
                }
                target = room_map.get(room_name.lower().strip())
                if not target:
                    return None
                    
                devices = response.json()
                return [d for d in devices if d.get("room") == target]
            except Exception:
                return None

    @staticmethod
    async def get_usage():
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{BACKEND_URL}/usage")
                return response.json() if response.status_code == 200 else None
            except Exception:
                return None

    @staticmethod
    async def toggle_device(device_id: str, status: str):
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{BACKEND_URL}/devices")
                if response.status_code != 200:
                    return False
                    
                devices = response.json()
                target_device = None
                for d in devices:
                    if d["id"] == device_id or d["name"].lower() == device_id.lower():
                        target_device = d
                        break
                
                if not target_device:
                    return False
                    
                patch_resp = await client.patch(
                    f"{BACKEND_URL}/devices/{target_device['id']}", 
                    json={"status": status.upper()}
                )
                return patch_resp.status_code == 200
            except Exception:
                return False

    @staticmethod
    async def get_alerts():
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{BACKEND_URL}/alerts")
                return response.json() if response.status_code == 200 else []
            except Exception:
                return []
