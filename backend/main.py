import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import (
    init_db, get_all_slots, get_recent_events,
    get_peak_hours, get_all_tags, add_tag
)
from serial_reader import SerialReader

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ------------------------------------------------------------------
# WebSocket connection manager
# ------------------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        print(f"[WS] Client connected. Total: {len(self.active)}")

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
        print(f"[WS] Client disconnected. Total: {len(self.active)}")

    async def broadcast(self, event_type: str, data: dict):
        message = json.dumps({"type": event_type, "data": data})
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)

manager = ConnectionManager()
_loop: asyncio.AbstractEventLoop = None

# Bridge: serial reader runs in a thread, needs to
# schedule async broadcasts onto the main event loop
def broadcast_bridge(event_type: str, data: dict):
    if _loop:
        asyncio.run_coroutine_threadsafe(
            manager.broadcast(event_type, data), _loop
        )

# ------------------------------------------------------------------
# Startup
# ------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    global _loop
    _loop = asyncio.get_event_loop()
    init_db()
    reader = SerialReader(broadcast_fn=broadcast_bridge)
    reader.start()
    print("[App] Urban Flow backend ready")

# ------------------------------------------------------------------
# WebSocket endpoint
# ------------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)

    # Send current state immediately on connect
    # so dashboard isn't blank until next event
    slots = get_all_slots()
    await ws.send_text(json.dumps({
        "type": "init",
        "data": {"slots": slots}
    }))

    try:
        while True:
            await ws.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(ws)

# ------------------------------------------------------------------
# REST endpoints
# ------------------------------------------------------------------
@app.get("/")
def root():
    return {"status": "Urban Flow backend running"}

@app.get("/api/slots")
def get_slots():
    return get_all_slots()

@app.get("/api/events")
def get_events(limit: int = 50):
    return get_recent_events(limit)

@app.get("/api/analytics/peak-hours")
def peak_hours():
    return get_peak_hours()

@app.get("/api/tags")
def list_tags():
    return get_all_tags()

@app.post("/api/tags")
def register_tag(body: dict):
    uid = body.get("uid", "").strip().lower()
    label = body.get("label", "Unknown").strip()

    if not uid:
        return {"error": "uid is required"}, 400
    if len(uid) > 50:
        return {"error": "uid too long"}, 400

    add_tag(uid, label)
    return {"success": True, "uid": uid, "label": label}

@app.get("/api/health")
def health():
    from serial_reader import DEMO, MOCK, PORT
    mode = "demo" if DEMO else ("mock" if MOCK else f"serial:{PORT}")
    return {
        "status": "ok",
        "mode": mode,
        "connected_clients": len(manager.active)
    }

@app.get("/api/anomalies")
def get_anomalies(limit: int = 20):
    from anomaly import get_recent_anomalies
    return get_recent_anomalies(limit)
