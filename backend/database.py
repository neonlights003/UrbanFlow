import sqlite3
from datetime import datetime

DB_PATH = "urbanflow.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # lets you access columns by name
    return conn

def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS slots (
            id TEXT PRIMARY KEY,
            status TEXT DEFAULT 'FREE',
            updated_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS rfid_tags (
            uid TEXT PRIMARY KEY,
            label TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            slot_id TEXT,
            rfid_uid TEXT,
            data TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO slots (id, status) VALUES
            ('A1','FREE'),
            ('A2','FREE'),
            ('A3','FREE'),
            ('A4','FREE'),
            ('A5','FREE');

        INSERT OR IGNORE INTO rfid_tags (uid, label, is_active)
            VALUES ('a1b2c3d4', 'Demo Vehicle', 1);
    """)
    conn.commit()
    conn.close()
    print("[DB] Initialized successfully")

def get_all_slots():
    conn = get_conn()
    rows = conn.execute("SELECT id, status, updated_at FROM slots").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_slot(slot_id, status):
    conn = get_conn()
    conn.execute(
        "UPDATE slots SET status=?, updated_at=? WHERE id=?",
        (status, datetime.now().isoformat(), slot_id)
    )
    conn.execute(
        "INSERT INTO events (type, slot_id, data) VALUES (?,?,?)",
        ("SLOT_UPDATE", slot_id, status)
    )
    conn.commit()
    conn.close()

def log_rfid(uid, result):
    conn = get_conn()
    conn.execute(
        "INSERT INTO events (type, rfid_uid, data) VALUES (?,?,?)",
        ("RFID_SCAN", uid, result)
    )
    conn.commit()
    conn.close()

def log_gate(status):
    conn = get_conn()
    conn.execute(
        "INSERT INTO events (type, data) VALUES (?,?)",
        ("GATE_STATUS", status)
    )
    conn.commit()
    conn.close()

def get_tag(uid):
    conn = get_conn()
    row = conn.execute(
        "SELECT uid, label, is_active FROM rfid_tags WHERE uid=?",
        (uid,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None

def get_recent_events(limit=50):
    conn = get_conn()
    rows = conn.execute(
        """SELECT type, slot_id, rfid_uid, data, timestamp 
           FROM events ORDER BY id DESC LIMIT ?""",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_peak_hours():
    conn = get_conn()
    rows = conn.execute("""
        SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
        FROM events
        WHERE type='SLOT_UPDATE' AND data='OCCUPIED'
        GROUP BY hour
        ORDER BY hour
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_tags():
    conn = get_conn()
    rows = conn.execute(
        "SELECT uid, label, is_active, created_at FROM rfid_tags ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_tag(uid, label):
    conn = get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO rfid_tags (uid, label, is_active) VALUES (?,?,1)",
        (uid, label)
    )
    conn.commit()
    conn.close()
