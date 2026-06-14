"""
Anomaly Detection Engine
Runs rule-based checks on incoming events.
Lightweight, no ML required — rules are transparent and explainable.
"""
import time
from datetime import datetime
import sqlite3

DB_PATH = "urbanflow.db"

# ------------------------------------------------------------------
# In-memory state for anomaly tracking
# (resets on backend restart — acceptable for prototype)
# ------------------------------------------------------------------

# Track consecutive OCCUPIED events per slot without FREE in between
_slot_consecutive_occupied = {
    "A1": 0, "A2": 0, "A3": 0, "A4": 0, "A5": 0
}

# Track denied RFID attempts: uid -> list of timestamps
_denied_attempts = {}

# Track whether lot-full alert has been sent (avoid repeat alerts)
_lot_full_alerted = False

# Stored anomalies list (last 50)
_anomalies = []


def _store_anomaly(level, code, message):
    """Save anomaly to memory + database."""
    global _anomalies

    anomaly = {
        "id": len(_anomalies) + 1,
        "level": level,        # "warning" | "critical"
        "code": code,          # short machine-readable code
        "message": message,
        "timestamp": datetime.now().isoformat()
    }

    _anomalies = [anomaly] + _anomalies[:49]  # keep last 50

    # Persist to DB
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            "INSERT INTO events (type, data) VALUES (?,?)",
            ("ANOMALY", f"{code}: {message}")
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Anomaly] DB write failed: {e}")

    print(f"[Anomaly] [{level.upper()}] {code}: {message}")
    return anomaly


def get_recent_anomalies(limit=20):
    return _anomalies[:limit]


# ------------------------------------------------------------------
# Rule 1 — Stuck / glitching slot sensor
# ------------------------------------------------------------------
def check_slot_anomaly(slot_id, status, broadcast_fn=None):
    global _slot_consecutive_occupied

    if status == "OCCUPIED":
        _slot_consecutive_occupied[slot_id] += 1

        if _slot_consecutive_occupied[slot_id] >= 3:
            anomaly = _store_anomaly(
                level="warning",
                code="STUCK_SENSOR",
                message=f"Slot {slot_id} reported OCCUPIED "
                        f"{_slot_consecutive_occupied[slot_id]} times "
                        f"without going FREE — possible sensor fault"
            )
            if broadcast_fn:
                broadcast_fn("anomaly", anomaly)
            # Reset counter to avoid spamming
            _slot_consecutive_occupied[slot_id] = 0

    elif status == "FREE":
        # Reset on FREE — normal behaviour
        _slot_consecutive_occupied[slot_id] = 0


# ------------------------------------------------------------------
# Rule 2 — Lot full
# ------------------------------------------------------------------
def check_lot_full(all_slots, broadcast_fn=None):
    global _lot_full_alerted

    occupied_count = sum(1 for s in all_slots.values() if s == "OCCUPIED")

    if occupied_count >= 5 and not _lot_full_alerted:
        _lot_full_alerted = True
        anomaly = _store_anomaly(
            level="warning",
            code="LOT_FULL",
            message="All 5 parking slots are occupied — lot at 100% capacity"
        )
        if broadcast_fn:
            broadcast_fn("anomaly", anomaly)

    elif occupied_count < 5:
        _lot_full_alerted = False  # Reset so alert fires again next time


# ------------------------------------------------------------------
# Rule 3 — Repeated denied access (potential intrusion)
# ------------------------------------------------------------------
def check_repeated_denial(uid, result, broadcast_fn=None):
    if result != "DENIED":
        # Clear history on successful access (different card)
        return

    now = time.time()
    window = 60  # seconds

    if uid not in _denied_attempts:
        _denied_attempts[uid] = []

    # Keep only attempts within the window
    _denied_attempts[uid] = [
        t for t in _denied_attempts[uid]
        if now - t < window
    ]
    _denied_attempts[uid].append(now)

    count = len(_denied_attempts[uid])

    if count == 3:
        anomaly = _store_anomaly(
            level="critical",
            code="REPEATED_DENIAL",
            message=f"Card {uid[:8]}... denied {count} times in 60s "
                    f"— possible unauthorised access attempt"
        )
        if broadcast_fn:
            broadcast_fn("anomaly", anomaly)

    elif count > 3 and count % 2 == 0:
        # Alert every 2 additional attempts after the first alert
        anomaly = _store_anomaly(
            level="critical",
            code="REPEATED_DENIAL",
            message=f"Card {uid[:8]}... now denied {count} times in 60s "
                    f"— escalating alert"
        )
        if broadcast_fn:
            broadcast_fn("anomaly", anomaly)
