export default function AnomalyFeed({ anomalies }) {
  const configs = {
    critical: {
      border: "rgba(239,68,68,0.3)",
      bg:     "rgba(239,68,68,0.06)",
      badge:  { bg:"rgba(239,68,68,0.2)", color:"#f87171" },
      icon:   "🚨",
    },
    warning: {
      border: "rgba(245,158,11,0.25)",
      bg:     "rgba(245,158,11,0.05)",
      badge:  { bg:"rgba(245,158,11,0.15)", color:"#f59e0b" },
      icon:   "⚠️",
    },
  };

  const labels = {
    STUCK_SENSOR:    "Sensor Fault",
    LOT_FULL:        "Lot Full",
    REPEATED_DENIAL: "Intrusion Alert",
  };

  const hasCritical = anomalies.some(a => a.level === "critical");

  return (
    <div className="card" style={{ padding:"20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
        <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em" }}>
          ANOMALY DETECTION
        </span>
        <span style={{
          fontSize:"10px", fontWeight:"700",
          padding:"2px 8px", borderRadius:"99px",
          background: hasCritical ? "rgba(239,68,68,0.2)" : anomalies.length > 0 ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
          color: hasCritical ? "#f87171" : anomalies.length > 0 ? "#f59e0b" : "var(--text-muted)",
          border: `1px solid ${hasCritical ? "rgba(239,68,68,0.3)" : "transparent"}`,
        }} className={hasCritical ? "pulse-amber" : ""}>
          {anomalies.length === 0 ? "ALL CLEAR" : `${anomalies.length} ALERT${anomalies.length > 1 ? "S" : ""}`}
        </span>
      </div>

      <div className="event-scroll" style={{ display:"flex", flexDirection:"column", gap:"8px", maxHeight:"220px", overflowY:"auto" }}>
        {anomalies.length === 0 ? (
          <div style={{ textAlign:"center", padding:"28px 0", color:"var(--text-muted)", fontSize:"12px" }}>
            <div style={{ fontSize:"20px", marginBottom:"8px" }}>✓</div>
            No anomalies detected
          </div>
        ) : (
          anomalies.map((a, i) => {
            const cfg = configs[a.level] || configs.warning;
            return (
              <div key={i} style={{
                borderRadius:"10px", padding:"10px 12px",
                background: cfg.bg,
                border: `1px solid ${cfg.border}`
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px" }}>
                  <span style={{ fontSize:"13px" }}>{cfg.icon}</span>
                  <span style={{
                    fontSize:"10px", fontWeight:"700", padding:"1px 7px",
                    borderRadius:"99px", background: cfg.badge.bg, color: cfg.badge.color,
                    letterSpacing:"0.04em"
                  }}>
                    {labels[a.code] || a.code}
                  </span>
                  <span style={{ marginLeft:"auto", fontSize:"10px", color:"var(--text-muted)" }}>
                    {new Date(a.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{ fontSize:"11px", color:"var(--text-secondary)", lineHeight:"1.5" }}>
                  {a.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
