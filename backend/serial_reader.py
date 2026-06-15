import threading
import time
from database import update_slot, log_rfid, log_gate, get_tag
from anomaly import check_slot_anomaly, check_lot_full, check_repeated_denial

# ------------------------------------------------------------------
# CONFIG — change these three lines only
# ------------------------------------------------------------------
DEMO = False   # True = scripted demo sequence (for presentation)
MOCK = True    # ← DEMO MODE: set False to use real Arduino on COM3
PORT = "COM3"  # Windows COM port for Arduino
BAUD = 9600    # Matches Arduino Serial.begin(9600)
TOTAL_SLOTS = 4  # Yashika's hardware has 4 physical bays
# ------------------------------------------------------------------

RFID_DEBOUNCE_SECONDS = 2
_last_rfid = {}

# Tracks which slots are occupied (A1..A4 — 4 total slots on this hardware)
# We simulate individual slot state from the Arduino's running count
TOTAL_SLOTS = 4
ALL_SLOT_IDS = ["A1", "A2", "A3", "A4"]


class SerialReader:
    def __init__(self, broadcast_fn):
        self.broadcast = broadcast_fn
        self.connected = False
        # Local mirror of slot states so we can diff on count changes
        self._occupied_count = 0

    def start(self):
        if DEMO:
            target = self._demo_loop
            mode = "DEMO (scripted)"
        elif MOCK:
            target = self._mock_loop
            mode = "MOCK (random)"
        else:
            target = self._serial_loop
            mode = f"SERIAL ({PORT} @ {BAUD})"

        t = threading.Thread(target=target, daemon=True)
        t.start()
        print(f"[Serial] Started in {mode} mode")

    # ------------------------------------------------------------------
    # DEMO MODE — scripted, predictable sequence for presentation
    # ------------------------------------------------------------------
    def _demo_loop(self):
        import subprocess, sys
        while True:
            try:
                proc = subprocess.Popen(
                    [sys.executable, "demo_mode.py"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.DEVNULL,
                    text=True
                )
                self.connected = True
                for line in proc.stdout:
                    line = line.strip()
                    if line and not line.startswith("["):
                        self._process(line)
                proc.wait()
            except Exception as e:
                print(f"[Serial] Demo error: {e}")
            self.connected = False
            print("[Serial] Demo restarting in 2s...")
            time.sleep(2)

    # ------------------------------------------------------------------
    # MOCK MODE — random simulation for development
    # ------------------------------------------------------------------
    def _mock_loop(self):
        import subprocess, sys
        while True:
            try:
                proc = subprocess.Popen(
                    [sys.executable, "mock_arduino.py"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.DEVNULL,
                    text=True
                )
                self.connected = True
                for line in proc.stdout:
                    line = line.strip()
                    if line and not line.startswith("["):
                        self._process(line)
                proc.wait()
            except Exception as e:
                print(f"[Serial] Mock error: {e}")
            self.connected = False
            print("[Serial] Mock restarting in 2s...")
            time.sleep(2)

    # ------------------------------------------------------------------
    # REAL SERIAL MODE — actual Arduino over USB
    # ------------------------------------------------------------------
    def _serial_loop(self):
        import serial
        while True:
            try:
                with serial.Serial(PORT, BAUD, timeout=1) as ser:
                    self.connected = True
                    print(f"[Serial] Connected to {PORT} @ {BAUD} baud")
                    while True:
                        raw = ser.readline()
                        line = raw.decode("utf-8", errors="ignore").strip()
                        if line:
                            self._process(line)
            except Exception as e:
                self.connected = False
                print(f"[Serial] Disconnected: {e}. Retrying in 3s...")
                time.sleep(3)

    # ------------------------------------------------------------------
    # MESSAGE PROCESSOR
    # Handles Yashika's Arduino output format:
    #   "Slots Left: 3"
    #   "Car 1 Occupied"
    #   "Available Slots: 3"
    #   "PARKING FULL"
    #   "Card UID: A1 B2 C3 D4 "    ← space-separated hex bytes
    #   "Vehicle Entry" / "Vehicle Exit"
    # ------------------------------------------------------------------
    def _process(self, message):
        print(f"[Serial] >> {message}")
        msg_upper = message.upper().strip()
        try:
            # ── RFID card scanned ──────────────────────────────────────
            # Format: "Card UID: A1 B2 C3 D4 "
            if msg_upper.startswith("CARD UID:"):
                uid_part = message.split(":", 1)[1].strip()
                # Remove spaces and lowercase → "a1b2c3d4"
                uid = uid_part.replace(" ", "").lower()
                if uid:
                    self._handle_rfid_uid(uid)

            # ── Slot count update from Arduino ─────────────────────────
            # Format: "Slots Left: 3"  or  "Available Slots: 3"
            elif msg_upper.startswith("SLOTS LEFT:") or msg_upper.startswith("AVAILABLE SLOTS:"):
                count_str = message.split(":")[1].strip()
                try:
                    available = int(count_str)
                    occupied = TOTAL_SLOTS - available
                    self._sync_slots_from_count(occupied)
                except ValueError:
                    pass

            # ── Parking full ───────────────────────────────────────────
            elif "PARKING FULL" in msg_upper:
                self._sync_slots_from_count(TOTAL_SLOTS)
                # Force lot-full anomaly
                all_slots = {s: "OCCUPIED" for s in ALL_SLOT_IDS}
                check_lot_full(all_slots, self.broadcast)

            # ── Gate events (entry / exit) ─────────────────────────────
            elif "VEHICLE ENTRY" in msg_upper or "GATE OPEN" in msg_upper:
                log_gate("OPENED")
                self.broadcast("gate_update", {"status": "OPENED"})

            elif "VEHICLE EXIT" in msg_upper or "THANK YOU" in msg_upper or "GATE CLOS" in msg_upper:
                log_gate("CLOSED")
                self.broadcast("gate_update", {"status": "CLOSED"})

            # ── Our own protocol (still works if someone uses it) ──────
            elif message.startswith("SLOT:"):
                self._handle_slot(message)
            elif message.startswith("RFID:"):
                self._handle_rfid(message)
            elif message.startswith("GATE:"):
                self._handle_gate(message)

        except Exception as e:
            print(f"[Serial] Parse error on '{message}': {e}")

    # ------------------------------------------------------------------
    # Sync slot A1..A4 states based on how many are occupied.
    # Cars fill A1 first, vacate A4 last (FIFO simulation).
    # ------------------------------------------------------------------
    def _sync_slots_from_count(self, occupied_count):
        occupied_count = max(0, min(occupied_count, TOTAL_SLOTS))
        if occupied_count == self._occupied_count:
            return  # No change — skip DB/WS update

        self._occupied_count = occupied_count

        from database import update_slot, get_all_slots
        for i, slot_id in enumerate(ALL_SLOT_IDS):
            status = "OCCUPIED" if i < occupied_count else "FREE"
            update_slot(slot_id, status)
            self.broadcast("slot_update", {"slot": slot_id, "status": status})
            check_slot_anomaly(slot_id, status, self.broadcast)

        # Check lot full anomaly
        all_slots = {s: ("OCCUPIED" if i < occupied_count else "FREE")
                     for i, s in enumerate(ALL_SLOT_IDS)}
        check_lot_full(all_slots, self.broadcast)
        print(f"[Serial] Slots synced: {occupied_count}/{TOTAL_SLOTS} occupied")

    # ------------------------------------------------------------------
    # RFID handler — uid already cleaned to "a1b2c3d4" format
    # ------------------------------------------------------------------
    def _handle_rfid_uid(self, uid):
        now = time.time()
        if uid in _last_rfid and now - _last_rfid[uid] < RFID_DEBOUNCE_SECONDS:
            print(f"[Serial] RFID debounced: {uid}")
            return
        _last_rfid[uid] = now

        tag = get_tag(uid)
        if tag and tag["is_active"]:
            result = "GRANTED"
            label  = tag["label"]
        else:
            result = "DENIED"
            label  = "Unknown"

        log_rfid(uid, result)
        self.broadcast("rfid_event", {
            "uid": uid,
            "result": result,
            "label": label
        })
        check_repeated_denial(uid, result, self.broadcast)

    # ------------------------------------------------------------------
    # Legacy handlers (our own protocol — kept for mock/demo modes)
    # ------------------------------------------------------------------
    def _handle_slot(self, message):
        parts = message.split(":")
        if len(parts) != 3:
            return
        slot_id = parts[1].strip().upper()
        status  = parts[2].strip().upper()
        if slot_id not in {"A1","A2","A3","A4","A5"}:
            return
        if status not in {"OCCUPIED","FREE"}:
            return
        update_slot(slot_id, status)
        self.broadcast("slot_update", {"slot": slot_id, "status": status})
        check_slot_anomaly(slot_id, status, self.broadcast)
        from database import get_all_slots
        all_slots = {s["id"]: s["status"] for s in get_all_slots()}
        check_lot_full(all_slots, self.broadcast)

    def _handle_rfid(self, message):
        parts = message.split(":")
        if len(parts) < 2:
            return
        uid = parts[1].strip().lower()
        if uid:
            self._handle_rfid_uid(uid)

    def _handle_gate(self, message):
        parts = message.split(":")
        if len(parts) < 2:
            return
        status = parts[1].strip().upper()
        if status in {"OPENED","CLOSED"}:
            log_gate(status)
            self.broadcast("gate_update", {"status": status})
