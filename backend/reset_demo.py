"""
Run once before demo to reset all slots to FREE
and clear test events while keeping historical seed data.
"""
import sqlite3
from datetime import datetime

conn = sqlite3.connect("urbanflow.db")

# Reset all slots to FREE
conn.execute("UPDATE slots SET status='FREE', updated_at=?",
             (datetime.now().isoformat(),))

# Delete only events from today that happened in the last 12 hours
# so the chart seed data (hour 08-18) is preserved
conn.execute("""
    DELETE FROM events
    WHERE id IN (
        SELECT id FROM events
        WHERE date(timestamp) = date('now', 'localtime')
        AND strftime('%H', timestamp, 'localtime') >= strftime('%H', 'now', 'localtime', '-12 hours')
        ORDER BY id DESC
    )
""")

conn.commit()
conn.close()
print("[Reset] All slots reset to FREE")
print("[Reset] Recent test events cleared")
print("[Reset] Historical seed data preserved")
print("[Reset] Ready for demo ✓")
