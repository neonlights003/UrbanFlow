# 🚗 Urban Flow — Smart Parking Management System

A real-time IoT parking management system built for smart cities. Tracks slot occupancy via IR sensors, validates access via RFID cards, controls a gate servo, and streams everything live to a web dashboard over WebSocket.

---

## 🏗️ Architecture

```
Arduino (IR + RFID + Servo)
        │ USB Serial (115200 baud)
        ▼
FastAPI Backend (Python)
  ├── serial_reader.py  ← parses hardware messages
  ├── database.py       ← SQLite persistence
  └── main.py           ← REST + WebSocket server
        │ ws://localhost:8000/ws
        ▼
React Dashboard (Vite + Tailwind CSS)
  ├── Slot Grid         ← live red/green per bay
  ├── Stats Row         ← occupancy bar + gate status
  ├── Event Feed        ← scrolling live log
  ├── Peak Hour Chart   ← Chart.js bar graph
  └── AI Prediction     ← next-30-min forecast
```

---

## 🚀 Quick Start

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn pyserial
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## ⚙️ Mode Switcher

Edit the top of `backend/serial_reader.py`:

| Mode | `DEMO` | `MOCK` | When to use |
|------|--------|--------|-------------|
| Development | `False` | `True` | Random mock data |
| Presentation | `True` | `True` | Scripted sequence |
| Real Hardware | `False` | `False` | Arduino connected |

For real hardware, also set `PORT = "/dev/tty.usbmodemXXXX"` — find it with:
```bash
ls /dev/tty.*
```

---

## 📡 Arduino Message Protocol

The backend expects plain-text lines over serial (115200 baud):

| Message | Example | Meaning |
|---------|---------|---------|
| `SLOT:<id>:<status>` | `SLOT:A2:OCCUPIED` | IR sensor triggered |
| `RFID:<uid>` | `RFID:a1b2c3d4` | Card scanned |
| `GATE:<status>` | `GATE:OPENED` | Gate servo moved |

Slot IDs: `A1`–`A5` · Statuses: `OCCUPIED` / `FREE` · Gate: `OPENED` / `CLOSED`

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/slots` | Current slot statuses |
| `GET` | `/api/events` | Recent event log |
| `GET` | `/api/analytics/peak-hours` | Hourly entry counts |
| `GET` | `/api/tags` | Registered RFID cards |
| `POST` | `/api/tags` | Register a new card `{uid, label}` |
| `GET` | `/api/health` | Backend status + current mode |
| `WS` | `/ws` | Live event stream |

---

## 🎬 Demo Day Checklist

```bash
cd backend && source venv/bin/activate
python3 reset_demo.py          # clear test noise, keep chart data
# set DEMO=True in serial_reader.py
uvicorn main:app --reload --port 8000
# in another terminal:
cd frontend && npm run dev
curl localhost:8000/api/health  # confirm {"mode":"demo"}
```

---

## 📁 Project Structure

```
urbanflow/
├── backend/
│   ├── main.py            # FastAPI app + WebSocket
│   ├── serial_reader.py   # Hardware/mock message parser
│   ├── database.py        # SQLite schema + queries
│   ├── mock_arduino.py    # Random dev simulator
│   ├── demo_mode.py       # Scripted demo sequence
│   └── reset_demo.py      # Pre-demo cleanup script
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── hooks/
    │   │   ├── useWebSocket.js
    │   │   └── useDedupe.js
    │   └── components/
    │       ├── SlotGrid.jsx
    │       ├── StatsRow.jsx
    │       ├── EventFeed.jsx
    │       ├── OccupancyChart.jsx
    │       └── PredictionPanel.jsx
    └── vite.config.js
```

---

## 👥 Team

Built for smart city hackathon — Urban Flow team.
