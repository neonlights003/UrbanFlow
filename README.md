<div align="center">

```
██╗   ██╗██████╗ ██████╗  █████╗ ███╗   ██╗    ███████╗██╗      ██████╗ ██╗    ██╗
██║   ██║██╔══██╗██╔══██╗██╔══██╗████╗  ██║    ██╔════╝██║     ██╔═══██╗██║    ██║
██║   ██║██████╔╝██████╔╝███████║██╔██╗ ██║    █████╗  ██║     ██║   ██║██║ █╗ ██║
██║   ██║██╔══██╗██╔══██╗██╔══██║██║╚██╗██║    ██╔══╝  ██║     ██║   ██║██║███╗██║
╚██████╔╝██║  ██║██████╔╝██║  ██║██║ ╚████║    ██║     ███████╗╚██████╔╝╚███╔███╔╝
 ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ 
```

**Smart Parking Management System — IoT + Real-Time Dashboard**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-FF6B35?style=for-the-badge&logo=socket.io&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![Arduino](https://img.shields.io/badge/Arduino-Compatible-00979D?style=for-the-badge&logo=arduino&logoColor=white)](https://arduino.cc)

> **Urban Flow** transforms conventional parking lots into intelligent, connected infrastructure.
> IR sensors detect vehicles in real-time, RFID cards authenticate entry, and a servo-controlled gate responds — all streamed live to a premium web dashboard.

</div>

---

## 📋 Table of Contents

- [Live Demo Features](#-live-demo-features)
- [System Architecture](#-system-architecture)
- [Data Flow Diagram](#-data-flow-diagram)
- [Hardware Network Diagram](#-hardware-network-diagram)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [WebSocket Event Protocol](#-websocket-event-protocol)
- [Anomaly Detection Engine](#-anomaly-detection-engine)
- [Frontend Component Tree](#-frontend-component-tree)
- [Deployment Modes](#-deployment-modes)
- [Quick Start](#-quick-start)
- [Demo Day Checklist](#-demo-day-checklist)
- [File Structure](#-file-structure)

---

## ✨ Live Demo Features

| Feature | Description | Technology |
|---------|-------------|------------|
| 🚗 **Live Slot Monitoring** | Each parking bay shows real-time OCCUPIED/FREE state with car animation | IR Sensor + WebSocket |
| 🔐 **RFID Access Control** | Cards authenticated against DB; gate servo opens/closes on result | RC522 + SQLite |
| 🚨 **Visual Access Alerts** | Full-screen banner + ambient background colour shift on every scan | React State + CSS |
| 📊 **Peak Hour Analytics** | Bar chart of vehicle entries per hour, seeded with historical data | Chart.js + SQLite |
| 🤖 **AI Prediction Panel** | Predicts occupancy for the next 30 minutes using trend analysis | Python heuristics |
| ⚠️ **Anomaly Detection** | Detects sensor faults, lot saturation, and intrusion attempts in real-time | Rule Engine + WebSocket |
| 💳 **RFID Management UI** | Web modal to register and view authorised vehicles without touching DB | REST API + React |
| 🎬 **Demo Mode** | Scripted presentation sequence for flawless hackathon delivery | `serial_reader.py` |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         URBAN FLOW SYSTEM OVERVIEW                         │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │            HARDWARE LAYER            │
  │                                      │
  │  ┌──────────┐  ┌──────────────────┐  │
  │  │ IR Sensor│  │  RC522 RFID      │  │
  │  │ × 5 bays │  │  Reader + Cards  │  │
  │  └────┬─────┘  └────────┬─────────┘  │
  │       │                 │            │
  │       └────────┬────────┘            │
  │                │                     │
  │         ┌──────▼──────┐              │
  │         │   Arduino   │              │
  │         │  Uno/Mega   │◄────────────►│──── Servo Motor (Gate)
  │         │   Sketch    │              │
  │         └──────┬──────┘              │
  └────────────────┼────────────────────┘
                   │ USB Serial (115200 baud)
  ┌────────────────▼────────────────────┐
  │           BACKEND LAYER             │
  │            (Python)                 │
  │                                     │
  │  ┌─────────────────────────────┐    │
  │  │      serial_reader.py       │    │
  │  │  • Reads serial lines       │    │
  │  │  • Parses SLOT/RFID/GATE    │    │
  │  │  • Calls anomaly engine     │    │
  │  └──────────────┬──────────────┘    │
  │                 │                   │
  │  ┌──────────────▼──────────────┐    │
  │  │         anomaly.py          │    │
  │  │  • Stuck sensor detection   │    │
  │  │  • Lot full alert           │    │
  │  │  • Intrusion detection      │    │
  │  └──────────────┬──────────────┘    │
  │                 │                   │
  │  ┌──────────────▼──────────────┐    │
  │  │          main.py            │    │
  │  │       (FastAPI App)         │    │
  │  │  • REST Endpoints           │    │
  │  │  • WebSocket Manager        │    │
  │  │  • CORS Middleware          │    │
  │  └──────┬────────────┬─────────┘    │
  │         │            │              │
  │  ┌──────▼──┐  ┌──────▼──────────┐  │
  │  │database │  │  urbanflow.db   │  │
  │  │  .py    │◄►│    (SQLite)     │  │
  │  │         │  │                 │  │
  │  └─────────┘  └─────────────────┘  │
  └──────────────────┬──────────────────┘
                     │ ws://localhost:8000/ws
                     │ http://localhost:8000/api/*
  ┌──────────────────▼──────────────────┐
  │           FRONTEND LAYER            │
  │       (React + Vite + Tailwind)     │
  │                                     │
  │  ┌──────────┐  ┌────────────────┐   │
  │  │ SlotGrid │  │   EventFeed    │   │
  │  └──────────┘  └────────────────┘   │
  │  ┌──────────┐  ┌────────────────┐   │
  │  │StatsRow  │  │OccupancyChart  │   │
  │  └──────────┘  └────────────────┘   │
  │  ┌──────────┐  ┌────────────────┐   │
  │  │AccessAlert│ │ AnomalyFeed    │   │
  │  └──────────┘  └────────────────┘   │
  │  ┌──────────┐  ┌────────────────┐   │
  │  │Prediction│  │  RfidManager   │   │
  │  └──────────┘  └────────────────┘   │
  └─────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```mermaid
flowchart TB
    subgraph HW["🔧 Hardware"]
        IR[IR Sensor Triggered]
        RFID[RFID Card Scanned]
        GATE[Servo Gate]
    end

    subgraph ARD["⚡ Arduino"]
        SKETCH[Arduino Sketch]
        MSG["Serial Message\nSLOT:A1:OCCUPIED\nRFID:a1b2c3d4\nGATE:OPENED"]
    end

    subgraph BE["🐍 Backend"]
        SR[serial_reader.py]
        AN[anomaly.py]
        DB[(SQLite DB)]
        API[FastAPI]
        WS[WebSocket Manager]
    end

    subgraph FE["⚛️ Frontend"]
        APP[App.jsx]
        SLOTS[SlotGrid]
        FEED[EventFeed]
        ALERT[AccessAlert]
        ANPANEL[AnomalyFeed]
        CHART[OccupancyChart]
        PRED[PredictionPanel]
    end

    IR --> SKETCH
    RFID --> SKETCH
    SKETCH --> MSG
    MSG -->|115200 baud USB| SR

    SR -->|slot_update| WS
    SR -->|rfid_event| WS
    SR -->|gate_update| WS
    SR --> AN
    AN -->|anomaly| WS
    SR --> DB
    AN --> DB

    WS -->|JSON over ws://| APP

    APP --> SLOTS
    APP --> FEED
    APP --> ALERT
    APP --> ANPANEL
    APP --> CHART
    APP --> PRED

    WS -.->|controls| GATE
    DB -.->|REST /api/*| API
    API -.->|initial state| APP

    style HW fill:#1a1a2e,stroke:#e94560,color:#fff
    style ARD fill:#1a2744,stroke:#4a9eff,color:#fff
    style BE fill:#1a2a1a,stroke:#4caf50,color:#fff
    style FE fill:#2a1a2a,stroke:#9c27b0,color:#fff
```

---

## 🌐 Hardware Network Diagram

```
                    ┌──────────────────────────────────────────────┐
                    │            PARKING LOT LAYOUT                │
                    │                                              │
                    │   [A1]    [A2]    [A3]    [A4]    [A5]       │
                    │    🚗      🅿️      🚗      🅿️      🚗         │
                    │    │       │       │       │       │          │
                    │   IR1     IR2     IR3     IR4     IR5         │
                    │    │       │       │       │       │          │
                    │    └───────┴───────┴───────┴───────┘          │
                    │                    │                          │
                    │             ┌──────▼──────┐                   │
   RFID Reader ────►│             │   ARDUINO   │◄──── 5V Power     │
   (RC522)          │             │  UNO / MEGA │                   │
   RFID Cards ─────►│             │             ├──── Gate Servo    │
                    │             └──────┬──────┘      (PWM Pin 9)  │
                    │                    │                          │
                    └────────────────────┼─────────────────────────┘
                                         │
                                  USB-A to USB-B
                                  Serial (115200)
                                         │
                    ┌────────────────────▼─────────────────────────┐
                    │              LAPTOP / SERVER                  │
                    │                                              │
                    │   ┌─────────────────────────────────────┐    │
                    │   │     Python FastAPI Backend          │    │
                    │   │     http://localhost:8000           │    │
                    │   │                                     │    │
                    │   │  ┌──────────┐    ┌──────────────┐  │    │
                    │   │  │ Serial   │    │  WebSocket   │  │    │
                    │   │  │ Reader   │───►│  Broadcaster │  │    │
                    │   │  └──────────┘    └──────┬───────┘  │    │
                    │   │                         │          │    │
                    │   │  ┌──────────────────────▼───────┐  │    │
                    │   │  │       SQLite Database        │  │    │
                    │   │  │       urbanflow.db            │  │    │
                    │   │  └──────────────────────────────┘  │    │
                    │   └─────────────────────────────────────┘    │
                    │                    │                          │
                    │   ┌────────────────▼────────────────────┐    │
                    │   │     React Dashboard (Vite)          │    │
                    │   │     http://localhost:5173           │    │
                    │   └─────────────────────────────────────┘    │
                    └──────────────────────────────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │   Browser / Judges  │
                              │   (Any Device on    │
                              │    Local Network)   │
                              └─────────────────────┘
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    SLOTS {
        TEXT id PK "A1, A2, A3, A4, A5"
        TEXT status "FREE | OCCUPIED"
        TIMESTAMP updated_at
    }

    RFID_TAGS {
        TEXT uid PK "e.g. a1b2c3d4"
        TEXT label "e.g. Demo Vehicle"
        INTEGER is_active "1 = active, 0 = revoked"
        TIMESTAMP created_at
    }

    EVENTS {
        INTEGER id PK
        TEXT type "SLOT_UPDATE | RFID_SCAN | GATE_STATUS | ANOMALY"
        TEXT slot_id FK
        TEXT rfid_uid FK
        TEXT data "status / result / anomaly message"
        TIMESTAMP timestamp
    }

    SLOTS ||--o{ EVENTS : "triggers"
    RFID_TAGS ||--o{ EVENTS : "logged_in"
```

### Tables at a glance

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `slots` | Current state of each parking bay | `id`, `status`, `updated_at` |
| `rfid_tags` | Allowlist of authorised RFID cards | `uid`, `label`, `is_active` |
| `events` | Full historical audit log | `type`, `slot_id`, `rfid_uid`, `data`, `timestamp` |

---

## 📡 API Reference

### REST Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/` | Health ping | `{"status": "Urban Flow backend running"}` |
| `GET` | `/api/health` | Status + active mode + WS clients | `{"status","mode","connected_clients"}` |
| `GET` | `/api/slots` | Current status of all 5 bays | `[{id, status, updated_at}]` |
| `GET` | `/api/events` | Recent event log (default 50) | `[{type, slot_id, data, timestamp}]` |
| `GET` | `/api/analytics/peak-hours` | Entries by hour for chart | `[{hour, count}]` |
| `GET` | `/api/tags` | All registered RFID cards | `[{uid, label, is_active, created_at}]` |
| `POST` | `/api/tags` | Register a new card | `{success, uid, label}` |
| `GET` | `/api/anomalies` | Recent anomaly events (default 20) | `[{id, level, code, message, timestamp}]` |
| `WS` | `/ws` | Persistent real-time event stream | JSON frames |

### POST `/api/tags` Body

```json
{
  "uid": "deadbeef",
  "label": "Security Rover 1"
}
```

---

## 🔌 WebSocket Event Protocol

All WebSocket messages are JSON with a `type` field and a `data` payload.

```
Client ──── ws://localhost:8000/ws ────► Server
              (keep-alive loop)

Server ─────────────────────────────────► Client
```

### Inbound Event Types (Server → Client)

```mermaid
sequenceDiagram
    participant HW as Arduino Hardware
    participant BE as FastAPI Backend
    participant FE as React Frontend

    Note over HW,FE: INIT — On WebSocket connect
    BE->>FE: {"type":"init","data":{"slots":[...]}}

    Note over HW,FE: SLOT UPDATE — IR sensor triggers
    HW->>BE: SLOT:A3:OCCUPIED (serial)
    BE->>FE: {"type":"slot_update","data":{"slot":"A3","status":"OCCUPIED"}}

    Note over HW,FE: RFID SCAN — Card presented
    HW->>BE: RFID:a1b2c3d4 (serial)
    BE->>FE: {"type":"rfid_event","data":{"uid":"a1b2c3d4","result":"GRANTED","label":"Demo Vehicle"}}

    Note over HW,FE: GATE — Servo movement
    HW->>BE: GATE:OPENED (serial)
    BE->>FE: {"type":"gate_update","data":{"status":"OPENED"}}

    Note over HW,FE: ANOMALY — Rule engine fires
    BE->>FE: {"type":"anomaly","data":{"level":"critical","code":"REPEATED_DENIAL","message":"..."}}
```

### Serial Message Format (Arduino → Backend)

```
┌──────────────────┬──────────────────────────────────────────────────────────┐
│  Message Format  │  Example                  │  Meaning                     │
├──────────────────┼───────────────────────────┼──────────────────────────────┤
│ SLOT:<id>:<state>│  SLOT:A2:OCCUPIED         │  IR sensor triggered bay A2  │
│                  │  SLOT:A2:FREE             │  Vehicle left bay A2         │
├──────────────────┼───────────────────────────┼──────────────────────────────┤
│ RFID:<uid>       │  RFID:a1b2c3d4            │  Card with UID scanned       │
├──────────────────┼───────────────────────────┼──────────────────────────────┤
│ GATE:<state>     │  GATE:OPENED              │  Servo rotated to open       │
│                  │  GATE:CLOSED              │  Servo returned to closed    │
└──────────────────┴───────────────────────────┴──────────────────────────────┘
```

---

## ⚠️ Anomaly Detection Engine

The anomaly engine (`anomaly.py`) runs three independent rule checks on every incoming event.

```mermaid
flowchart LR
    subgraph IN["Incoming Event"]
        SE[Slot Event]
        RE[RFID Event]
    end

    subgraph RULES["Rule Engine"]
        R1["Rule 1\n🔴 STUCK_SENSOR\nSame slot OCCUPIED\n3× without FREE"]
        R2["Rule 2\n🟡 LOT_FULL\nAll 5 slots OCCUPIED\nsimultaneously"]
        R3["Rule 3\n🔴 REPEATED_DENIAL\nSame UID denied\n3× in 60 seconds"]
    end

    subgraph OUT["Output"]
        DB2[(SQLite\nEvents Log)]
        WS2[WebSocket\nBroadcast]
        PANEL[AnomalyFeed\nPanel in UI]
    end

    SE --> R1
    SE --> R2
    RE --> R3

    R1 -->|"level: warning"| DB2
    R2 -->|"level: warning"| DB2
    R3 -->|"level: critical"| DB2

    DB2 --> WS2
    WS2 --> PANEL

    style IN fill:#1a1a2e,stroke:#e94560,color:#fff
    style RULES fill:#1a2744,stroke:#4a9eff,color:#fff
    style OUT fill:#1a2a1a,stroke:#4caf50,color:#fff
```

### Rule Descriptions

```
┌─────────────────────┬───────────────────────────────────────────────────────┐
│  Anomaly Code       │  Trigger Condition + Response                         │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ STUCK_SENSOR        │  Slot reports OCCUPIED 3+ times without a FREE event  │
│  ⚠️  WARNING        │  → Resets counter, fires "possible sensor fault" alert│
├─────────────────────┼───────────────────────────────────────────────────────┤
│ LOT_FULL            │  All 5 slots OCCUPIED at same time                    │
│  ⚠️  WARNING        │  → Fires once; resets when any slot goes FREE         │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ REPEATED_DENIAL     │  Same unknown UID denied 3× within 60-second window   │
│  🚨 CRITICAL        │  → Fires at count=3; escalates every 2 attempts after │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

---

## ⚛️ Frontend Component Tree

```
App.jsx
│
├── <AccessAlert>          ← Full-screen RFID banner (fixed, z-50)
├── <RfidManager>          ← Modal overlay for tag management
│
├── <Header>               ← (inline) title + LIVE badge + Manage RFIDs button
│
├── <StatsRow>
│     ├── Total Capacity card
│     ├── Occupied count card
│     ├── Available count card
│     ├── Gate Status card
│     └── Occupancy progress bar
│
├── Grid (3-col)
│     ├── <SlotGrid> (col-span-2)
│     │     └── SlotCard × 5 (A1–A5)
│     │           ├── Icon: ✔ (free) or 🚗 (occupied)
│     │           ├── Status colour: green / red
│     │           └── Pulse animation on state change
│     │
│     └── <EventFeed>
│           └── Scrollable log of SLOT / RFID / GATE / ANOMALY events
│
└── Grid (3-col)
      ├── <OccupancyChart>        ← Chart.js bar graph (entries/hour)
      ├── <PredictionPanel>       ← Next 30-min occupancy forecast
      └── <AnomalyFeed>           ← Live anomaly cards with level badges
```

### Key Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useWebSocket` | `hooks/useWebSocket.js` | Persistent WS connection with auto-reconnect |
| `useDedupe` | `hooks/useDedupe.js` | 800ms window deduplication for serial noise |

---

## 🎛️ Deployment Modes

```mermaid
stateDiagram-v2
    [*] --> MockMode: Default

    MockMode: 🤖 MOCK Mode
    MockMode: DEMO=False, MOCK=True
    MockMode: Random slot/RFID events
    MockMode: Used during development

    MockMode --> DemoMode: Set DEMO=True
    MockMode --> HardwareMode: Set MOCK=False

    DemoMode: 🎬 DEMO Mode
    DemoMode: DEMO=True, MOCK=True
    DemoMode: Scripted scene sequence
    DemoMode: Used during presentation

    HardwareMode: ⚡ HARDWARE Mode
    HardwareMode: DEMO=False, MOCK=False
    HardwareMode: Real Arduino over USB serial
    HardwareMode: Used at full deployment

    DemoMode --> MockMode: Set DEMO=False
    HardwareMode --> MockMode: Set MOCK=True
```

### Mode Switch — `serial_reader.py` (top of file)

```python
# ──────────────────────────────────────────────
#  CONFIG — change only these three lines
# ──────────────────────────────────────────────
DEMO = False   # True → scripted presentation sequence
MOCK = True    # True → random mock data (no hardware)
PORT = "/dev/tty.usbmodem1401"  # USB port for real Arduino
BAUD = 115200
```

---

## 🚀 Quick Start

### Prerequisites

```
Python 3.10+    https://python.org
Node.js 18+     https://nodejs.org
```

### 1. Clone & Set Up Backend

```bash
git clone https://github.com/neonlights003/UrbanFlow.git
cd UrbanFlow/backend

python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install fastapi uvicorn pyserial
uvicorn main:app --reload --port 8000
```

### 2. Set Up Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 3. Open Dashboard

```
http://localhost:5173
```

The dashboard connects automatically. You should see the `LIVE` badge pulse green.

### 4. Verify Backend

```bash
curl http://localhost:8000/api/health
# → {"status":"ok","mode":"mock","connected_clients":1}
```

---

## 🎬 Demo Day Checklist

```
Pre-demo (5 minutes before presenting)
─────────────────────────────────────────────────────────────────
 □  cd backend && source venv/bin/activate
 □  python3 reset_demo.py            ← clears test noise, keeps chart data
 □  Set DEMO = True in serial_reader.py
 □  uvicorn main:app --reload --port 8000
 □  cd ../frontend && npm run dev
 □  curl localhost:8000/api/health   ← confirm {"mode":"demo"}
 □  Open localhost:5173 → LIVE badge is green ✓
 □  Test: wait for ACCESS GRANTED banner to fire ✓

During demo
─────────────────────────────────────────────────────────────────
 → Show slot grid going OCCUPIED (slots turn red with car emoji)
 → Show RFID scan → ACCESS GRANTED (green banner, background shift)
 → Show unknown card → ACCESS DENIED (red banner, bg shift)
 → Show anomaly feed: REPEATED_DENIAL → CRITICAL badge pulses
 → Open RFID Manager modal, add a new card live
 → Show AI prediction panel updating in real time

Switch to real hardware (when Arduino is connected)
─────────────────────────────────────────────────────────────────
 □  ls /dev/tty.*                    ← find the Arduino port
 □  Update PORT = "/dev/tty.usbmodemXXXX" in serial_reader.py
 □  Set DEMO = False, MOCK = False
 □  Restart uvicorn
```

---

## 📁 File Structure

```
UrbanFlow/
│
├── README.md
├── .gitignore
│
├── backend/
│   ├── main.py              ← FastAPI app, WebSocket manager, REST endpoints
│   ├── serial_reader.py     ← Hardware/mock/demo message parser (tri-mode)
│   ├── database.py          ← SQLite schema, queries, connection helpers
│   ├── anomaly.py           ← Rule-based anomaly detection engine
│   ├── mock_arduino.py      ← Random dev simulator (no hardware needed)
│   ├── demo_mode.py         ← Scripted demo sequence for presentation
│   └── reset_demo.py        ← Pre-demo cleanup script
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    │
    └── src/
        ├── main.jsx
        ├── App.jsx            ← Root component, state, WebSocket handling
        ├── index.css          ← Tailwind base + custom animations
        │
        ├── hooks/
        │   ├── useWebSocket.js  ← Persistent WS connection with reconnect
        │   └── useDedupe.js     ← 800ms event deduplication
        │
        └── components/
            ├── SlotGrid.jsx       ← 5-bay parking grid (live colour states)
            ├── StatsRow.jsx       ← Capacity / occupied / gate status row
            ├── EventFeed.jsx      ← Scrolling live event log
            ├── OccupancyChart.jsx ← Chart.js entries-per-hour bar graph
            ├── PredictionPanel.jsx← 30-min AI occupancy forecast
            ├── AccessAlert.jsx    ← Full-screen RFID result banner
            ├── AnomalyFeed.jsx    ← Real-time anomaly panel
            └── RfidManager.jsx    ← Modal for RFID tag management
```

---

## 🙌 Team

Built for **Smart City Hackathon** by the Urban Flow team.

---

<div align="center">

*Made with ❤️ for smarter cities*

</div>
