export default function StatsRow({ slots, gateStatus }) {
  const total    = 4;
  const occupied = Object.values(slots).filter((s) => s === "OCCUPIED").length;
  const available = total - occupied;
  const pct = Math.round((occupied / total) * 100);

  const gateOpen = gateStatus === "OPENED";

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>

      {/* Total */}
      <div className="card" style={{ padding:"16px 20px" }}>
        <p style={{ fontSize:"11px", color:"var(--text-muted)", letterSpacing:"0.08em", marginBottom:"8px" }}>
          CAPACITY
        </p>
        <p style={{ fontSize:"32px", fontWeight:"800", color:"var(--text-primary)", letterSpacing:"-0.03em", lineHeight:1 }}>
          {total}
        </p>
        <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"4px" }}>total bays</p>
      </div>

      {/* Occupied */}
      <div className="card" style={{ padding:"16px 20px", background: occupied > 0 ? "rgba(239,68,68,0.05)" : undefined, borderColor: occupied > 0 ? "rgba(239,68,68,0.2)" : undefined }}>
        <p style={{ fontSize:"11px", color:"var(--text-muted)", letterSpacing:"0.08em", marginBottom:"8px" }}>
          OCCUPIED
        </p>
        <p style={{ fontSize:"32px", fontWeight:"800", color: occupied > 0 ? "#f87171" : "var(--text-secondary)", letterSpacing:"-0.03em", lineHeight:1 }}>
          {occupied}
        </p>
        <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"4px" }}>{pct}% utilisation</p>
      </div>

      {/* Available */}
      <div className="card" style={{ padding:"16px 20px", background: available > 0 ? "rgba(16,185,129,0.05)" : undefined, borderColor: available > 0 ? "rgba(16,185,129,0.2)" : undefined }}>
        <p style={{ fontSize:"11px", color:"var(--text-muted)", letterSpacing:"0.08em", marginBottom:"8px" }}>
          AVAILABLE
        </p>
        <p style={{ fontSize:"32px", fontWeight:"800", color: available > 0 ? "#34d399" : "var(--text-secondary)", letterSpacing:"-0.03em", lineHeight:1 }}>
          {available}
        </p>
        <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"4px" }}>
          {available === 0 ? "lot full" : "open bays"}
        </p>
      </div>

      {/* Gate */}
      <div className="card" style={{
        padding:"16px 20px",
        background: gateOpen ? "rgba(16,185,129,0.05)" : "rgba(217,119,6,0.04)",
        borderColor: gateOpen ? "rgba(16,185,129,0.2)" : "rgba(217,119,6,0.15)"
      }}>
        <p style={{ fontSize:"11px", color:"var(--text-muted)", letterSpacing:"0.08em", marginBottom:"8px" }}>
          GATE
        </p>
        <p style={{ fontSize:"32px", fontWeight:"800", letterSpacing:"-0.03em", lineHeight:1,
          color: gateOpen ? "#34d399" : "#f59e0b"
        }}>
          {gateOpen ? "OPEN" : "CLOSED"}
        </p>
        <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"4px" }}>
          {gateOpen ? "vehicle in transit" : "barrier secured"}
        </p>
      </div>

    </div>
  );
}
