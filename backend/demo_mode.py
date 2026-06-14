"""
Demo mode — runs a scripted, predictable sequence instead of random mock.
Use this for the actual presentation for maximum control.
"""
import time, sys

def emit(msg):
    print(msg, flush=True)

print("[DEMO] Starting scripted demo sequence", flush=True)

# Opening state — 2 cars already parked
emit("SLOT:A1:OCCUPIED")
time.sleep(0.3)
emit("SLOT:A3:OCCUPIED")
time.sleep(0.3)
emit("GATE:CLOSED")

time.sleep(3)

while True:
    # === Scene 1: New car arrives, scans RFID, gate opens ===
    print("\n[DEMO] Scene: RFID scan - access granted", flush=True)
    emit("RFID:a1b2c3d4")
    time.sleep(1)
    emit("GATE:OPENED")
    time.sleep(2)
    emit("GATE:CLOSED")
    time.sleep(1)
    emit("SLOT:A2:OCCUPIED")   # car parked

    time.sleep(5)

    # === Scene 2: Unknown card - access denied ===
    print("\n[DEMO] Scene: Unknown RFID - access denied", flush=True)
    emit("RFID:deadbeef")
    # Gate stays closed — no GATE:OPENED

    time.sleep(5)

    # === Scene 3: Car leaves ===
    print("\n[DEMO] Scene: Car exits", flush=True)
    emit("SLOT:A1:FREE")

    time.sleep(5)

    # === Scene 4: Peak scenario - lot filling up ===
    print("\n[DEMO] Scene: Lot filling", flush=True)
    emit("SLOT:A4:OCCUPIED")
    time.sleep(1)
    emit("SLOT:A5:OCCUPIED")
    time.sleep(1)
    emit("RFID:a1b2c3d4")
    time.sleep(0.5)
    emit("GATE:OPENED")
    time.sleep(2)
    emit("GATE:CLOSED")
    time.sleep(1)
    emit("SLOT:A1:OCCUPIED")   # lot now full

    time.sleep(8)

    # === Reset for next loop ===
    print("\n[DEMO] Resetting...", flush=True)
    for slot in ["A2","A4","A5","A1"]:
        emit(f"SLOT:{slot}:FREE")
        time.sleep(0.5)
