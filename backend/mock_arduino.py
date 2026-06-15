"""
Mock Arduino — simulates Yashika's Arduino output for demo/development.
Sends realistic parking events so the dashboard looks alive.
"""
import time
import random
import sys

# Realistic demo RFID UIDs (like what Arduino actually prints)
KNOWN_CARDS = [
    ("6ac1b7",  "Soham's Car"),
    ("3fe982",  "Yashika's Car"),
    ("ab12cd",  "Prof. Demo Car"),
]
UNKNOWN_CARD = "dead00ff"  # will be DENIED

available_slots = 4
TOTAL = 4

def emit(msg):
    print(msg, flush=True)

def set_slots(available):
    global available_slots
    available_slots = max(0, min(TOTAL, available))
    emit(f"Slots Left: {available_slots}")
    emit(f"Available Slots: {available_slots}")
    if available_slots == 0:
        emit("PARKING FULL")

def car_entry(uid, label):
    global available_slots
    emit(f"Card UID: {' '.join(uid[i:i+2] for i in range(0, len(uid), 2)).upper()}")
    time.sleep(0.3)
    if available_slots > 0:
        available_slots -= 1
        emit(f"Car {TOTAL - available_slots} Occupied")
        emit(f"Slots Left: {available_slots}")
        emit(f"Available Slots: {available_slots}")
        emit("Vehicle Entry")
        time.sleep(0.5)
        emit("Gate Opening")
        time.sleep(2.5)
        emit("Gate Closing")
        if available_slots == 0:
            emit("PARKING FULL")
    else:
        emit("Parking Full")
        emit("No Slots")

def car_exit(uid):
    global available_slots
    emit(f"Card UID: {' '.join(uid[i:i+2] for i in range(0, len(uid), 2)).upper()}")
    time.sleep(0.3)
    if available_slots < TOTAL:
        available_slots += 1
        emit(f"Slots Left: {available_slots}")
        emit(f"Available Slots: {available_slots}")
        emit("Vehicle Exit")
        time.sleep(0.5)
        emit("Thank You")
        time.sleep(2.5)

emit("[MOCK] Demo mode started")
time.sleep(1)

# ── Demo sequence ──────────────────────────────────────────
# Start with 1 car already parked to make it interesting
available_slots = 3
emit(f"Slots Left: {available_slots}")
emit(f"Available Slots: {available_slots}")

try:
    while True:
        delay = random.uniform(3, 6)
        time.sleep(delay)
        roll = random.random()

        if available_slots > 0 and roll < 0.45:
            # Car enters with known RFID
            uid, label = random.choice(KNOWN_CARDS)
            car_entry(uid, label)

        elif available_slots < TOTAL and roll < 0.75:
            # Car exits with known RFID
            uid, _ = random.choice(KNOWN_CARDS)
            car_exit(uid)

        elif roll < 0.88:
            # Unknown card denied at entry
            emit(f"Card UID: {' '.join(UNKNOWN_CARD[i:i+2] for i in range(0, len(UNKNOWN_CARD), 2)).upper()}")
            time.sleep(0.2)
            emit("Parking Full")   # repurposed as denied feedback
            time.sleep(1)

        else:
            # Repeat denied (intrusion attempt simulation)
            for _ in range(3):
                emit(f"Card UID: {' '.join(UNKNOWN_CARD[i:i+2] for i in range(0, len(UNKNOWN_CARD), 2)).upper()}")
                time.sleep(1.2)

except KeyboardInterrupt:
    print("\n[MOCK] Stopped", flush=True)
    sys.exit(0)
