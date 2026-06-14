import threading
import time
from database import update_slot, log_rfid, log_gate, get_tag

# ------------------------------------------------------------------
# CONFIG — change these three lines only
# ------------------------------------------------------------------
DEMO = False   # True = scripted demo sequence (for presentation)
MOCK = True    # True = random mock, False = real Arduino
PORT = "/dev/tty.usbmodem1401"  # only used when MOCK=False, DEMO=False
BAUD = 115200
# ------------------------------------------------------------------

RFID_DEBOUNCE_SECONDS = 2
_last_rfid = {}


class SerialReader:
    def __init__(self, broadcast_fn):
        self.broadcast = broadcast_fn
        self.connected = False

    def start(self):
        if DEMO:
            target = self._demo_loop
            mode = "DEMO (scripted)"
        elif MOCK:
            target = self._mock_loop
            mode = "MOCK (random)"
        else:
            target = self._serial_loop
            mode = f"SERIAL ({PORT})"

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
                    print(f"[Serial] Connected to {PORT}")
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
    # ------------------------------------------------------------------
    def _process(self, message):
        print(f"[Serial] >> {message}")
        try:
            if message.startswith("SLOT:"):
                self._handle_slot(message)
            elif message.startswith("RFID:"):
                self._handle_rfid(message)
            elif message.startswith("GATE:"):
                self._handle_gate(message)
        except Exception as e:
            print(f"[Serial] Parse error on '{message}': {e}")

    def _handle_slot(self, message):
        parts = message.split(":")
        if len(parts) != 3:
            print(f"[Serial] Bad slot format: {message}")
            return

        slot_id = parts[1].strip().upper()
        status  = parts[2].strip().upper()

        if slot_id not in {"A1","A2","A3","A4","A5"}:
            print(f"[Serial] Unknown slot: {slot_id}")
            return
        if status not in {"OCCUPIED","FREE"}:
            print(f"[Serial] Unknown status: {status}")
            return

        update_slot(slot_id, status)
        self.broadcast("slot_update", {"slot": slot_id, "status": status})

    def _handle_rfid(self, message):
        parts = message.split(":")
        if len(parts) < 2:
            print(f"[Serial] Bad RFID format: {message}")
            return

        uid = parts[1].strip().lower()
        if not uid:
            print("[Serial] Empty RFID uid")
            return

        now = time.time()
        if uid in _last_rfid:
            if now - _last_rfid[uid] < RFID_DEBOUNCE_SECONDS:
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

    def _handle_gate(self, message):
        parts = message.split(":")
        if len(parts) < 2:
            print(f"[Serial] Bad gate format: {message}")
            return

        status = parts[1].strip().upper()
        if status not in {"OPENED","CLOSED"}:
            print(f"[Serial] Unknown gate status: {status}")
            return

        log_gate(status)
        self.broadcast("gate_update", {"status": status})
