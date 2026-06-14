"""
Mock Arduino — simulates serial messages for development.
Run this in a separate terminal when real hardware isn't connected.
Your backend will read from this instead of real Arduino.
"""
import time
import random
import sys

slots = ["A1", "A2", "A3", "A4", "A5"]
slot_states = {s: "FREE" for s in slots}

def emit(msg):
    print(msg, flush=True)

emit("GATE:CLOSED")
emit("[MOCK] Arduino simulator started")

try:
    while True:
        time.sleep(random.uniform(2, 4))

        roll = random.random()

        if roll < 0.6:
            # slot change
            slot = random.choice(slots)
            new_state = "FREE" if slot_states[slot] == "OCCUPIED" else "OCCUPIED"
            slot_states[slot] = new_state
            emit(f"SLOT:{slot}:{new_state}")

        elif roll < 0.85:
            # RFID scan — known card
            emit("RFID:a1b2c3d4")
            time.sleep(0.5)
            emit("GATE:OPENED")
            time.sleep(2)
            emit("GATE:CLOSED")

        else:
            # RFID scan — unknown card (denied scenario)
            emit("RFID:deadbeef")

except KeyboardInterrupt:
    print("\n[MOCK] Stopped", flush=True)
    sys.exit(0)
