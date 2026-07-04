from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .alerts.engine import run_alert_loop
from .api.routes import router
from .config import CORS_ALLOW_ORIGINS
from .services.store import seed_initial_devices, store
from .simulator.worker import run_simulator_loop
from .websocket.manager import manager

_background_tasks: list[asyncio.Task] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    store.seed(seed_initial_devices())
    _background_tasks.append(asyncio.create_task(run_simulator_loop()))
    _background_tasks.append(asyncio.create_task(run_alert_loop()))
    yield
    for task in _background_tasks:
        task.cancel()
    await asyncio.gather(*_background_tasks, return_exceptions=True)


app = FastAPI(title="Office Device Monitor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            # Client isn't expected to send anything; just keep the
            # connection open and detect disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
