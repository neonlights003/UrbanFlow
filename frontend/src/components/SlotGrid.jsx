export default function SlotGrid({ slots }) {
  const slotIds = ["A1", "A2", "A3", "A4"];

  return (
    <div className="card" style={{ padding: "20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em" }}>
          PARKING BAYS
        </span>
        <span style={{ fontSize:"11px", color:"var(--text-secondary)" }}>
          {Object.values(slots).filter(s => s === "FREE").length} of {slotIds.length} available
        </span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"12px" }}>
        {slotIds.map((id) => {
          const occupied = slots[id] === "OCCUPIED";
          return (
            <div
              key={id}
              className={`slot-card ${occupied ? "slot-occupied" : "slot-free"}`}
              style={{ borderRadius:"14px", padding:"20px 12px", textAlign:"center" }}
            >
              {/* Bay icon */}
              <div style={{
                width: "48px", height: "48px",
                borderRadius: "12px",
                margin: "0 auto 12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px",
                background: occupied
                  ? "rgba(239,68,68,0.12)"
                  : "rgba(16,185,129,0.08)",
              }}>
                {occupied ? "🚗" : "✦"}
              </div>

              {/* Slot ID */}
              <div style={{
                fontSize: "20px",
                fontWeight: "700",
                letterSpacing: "-0.02em",
                color: occupied ? "#f87171" : "#34d399",
                marginBottom: "6px"
              }}>{id}</div>

              {/* Status pill */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 10px",
                borderRadius: "99px",
                fontSize: "10px",
                fontWeight: "600",
                letterSpacing: "0.06em",
                background: occupied ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.12)",
                color: occupied ? "#f87171" : "#34d399",
              }}>
                <span style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: occupied ? "#f87171" : "#34d399",
                }} />
                {occupied ? "OCCUPIED" : "FREE"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lot occupancy bar */}
      <div style={{ marginTop: "16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
          <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>Lot occupancy</span>
          <span style={{ fontSize:"11px", color:"var(--text-secondary)", fontWeight:"600" }}>
            {Math.round((Object.values(slots).filter(s=>s==="OCCUPIED").length / slotIds.length)*100)}%
          </span>
        </div>
        <div className="progress-track" style={{ height:"4px" }}>
          <div
            className="progress-fill"
            style={{
              width: `${(Object.values(slots).filter(s=>s==="OCCUPIED").length / slotIds.length)*100}%`,
              background: Object.values(slots).filter(s=>s==="OCCUPIED").length >= slotIds.length
                ? "var(--red)"
                : Object.values(slots).filter(s=>s==="OCCUPIED").length >= 3
                ? "var(--amber)"
                : "var(--green)"
            }}
          />
        </div>
      </div>
    </div>
  );
}
