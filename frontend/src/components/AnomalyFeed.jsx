export default function AnomalyFeed({ anomalies }) {
  const configs = {
    critical: { border:"rgba(239,68,68,0.25)",  bg:"rgba(239,68,68,0.07)",  badge:{ bg:"rgba(239,68,68,0.18)",  color:"#f87171" }, icon:"🚨" },
    warning:  { border:"rgba(245,158,11,0.2)",  bg:"rgba(245,158,11,0.06)", badge:{ bg:"rgba(245,158,11,0.15)", color:"#f59e0b" }, icon:"⚠️" },
  };
  const labels = {
    STUCK_SENSOR:    "Sensor Fault",
    LOT_FULL:        "Lot Full",
    REPEATED_DENIAL: "Intrusion Alert",
  };

  const hasCritical = anomalies.some(a=>a.level==="critical");

  return (
    <div className="glass" style={{ padding:"20px 22px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
        <p className="label">ANOMALY DETECTION</p>
        <span style={{
          fontSize:"10px", fontWeight:"700",
          padding:"2px 10px", borderRadius:"99px",
          background: hasCritical ? "rgba(239,68,68,0.18)" : anomalies.length>0 ? "rgba(245,158,11,0.14)" : "rgba(255,255,255,0.04)",
          border:`1px solid ${hasCritical ? "rgba(239,68,68,0.3)" : "transparent"}`,
          color: hasCritical ? "#f87171" : anomalies.length>0 ? "#f59e0b" : "rgba(255,255,255,0.2)"
        }} className={hasCritical?"pulse-amber":""}>
          {anomalies.length===0 ? "ALL CLEAR" : `${anomalies.length} ALERT${anomalies.length>1?"S":""}`}
        </span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"8px", maxHeight:"200px", overflowY:"auto" }}>
        {anomalies.length===0 ? (
          <div style={{ textAlign:"center", padding:"28px 0" }}>
            <div style={{ fontSize:"22px", marginBottom:"8px" }}>✓</div>
            <p style={{ color:"rgba(255,255,255,0.2)", fontSize:"12px" }}>No anomalies detected</p>
          </div>
        ) : anomalies.map((a,i) => {
          const cfg = configs[a.level] || configs.warning;
          return (
            <div key={i} style={{
              borderRadius:"12px", padding:"10px 12px",
              background:cfg.bg, border:`1px solid ${cfg.border}`
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px" }}>
                <span style={{ fontSize:"12px" }}>{cfg.icon}</span>
                <span style={{
                  fontSize:"9px", fontWeight:"700", letterSpacing:"0.08em",
                  padding:"2px 8px", borderRadius:"99px",
                  background:cfg.badge.bg, color:cfg.badge.color
                }}>{labels[a.code]||a.code}</span>
                <span style={{ marginLeft:"auto", fontSize:"10px", color:"rgba(255,255,255,0.2)",fontFamily:"monospace" }}>
                  {new Date(a.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.45)", lineHeight:"1.5" }}>{a.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
