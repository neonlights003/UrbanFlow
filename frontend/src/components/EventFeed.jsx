export default function EventFeed({ events }) {
  const typeConfig = {
    SLOT:    { color:"#60a5fa", icon:"▣", bg:"rgba(96,165,250,0.08)"  },
    RFID:    { color:"#f59e0b", icon:"◈", bg:"rgba(245,158,11,0.08)"  },
    GATE:    { color:"#a78bfa", icon:"◉", bg:"rgba(167,139,250,0.08)" },
    ANOMALY: { color:"#f87171", icon:"⚠", bg:"rgba(248,113,113,0.08)" },
  };

  return (
    <div className="card" style={{ padding:"20px", display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
        <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em" }}>
          LIVE EVENT FEED
        </span>
        <span style={{
          fontSize:"10px", color:"var(--amber-light)", fontWeight:"600",
          padding:"2px 8px", borderRadius:"99px",
          background:"var(--amber-glow)", border:"1px solid rgba(217,119,6,0.2)"
        }}>
          {events.length} events
        </span>
      </div>

      <div className="event-scroll" style={{
        flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"6px",
        maxHeight:"320px"
      }}>
        {events.length === 0 ? (
          <div style={{ color:"var(--text-muted)", fontSize:"12px", textAlign:"center", padding:"32px 0" }}>
            Waiting for events…
          </div>
        ) : (
          events.map((e, i) => {
            const cfg = typeConfig[e.type] || typeConfig.SLOT;
            return (
              <div
                key={i}
                className="fade-up"
                style={{
                  display:"flex", alignItems:"flex-start", gap:"10px",
                  padding:"8px 10px", borderRadius:"10px",
                  background: i === 0 ? cfg.bg : "transparent",
                  transition:"background 0.3s"
                }}
              >
                <span style={{
                  width:"22px", height:"22px", borderRadius:"6px",
                  background: cfg.bg, color: cfg.color,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"11px", flexShrink:0, marginTop:"1px"
                }}>{cfg.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{
                    fontSize:"12px", color:"var(--text-primary)",
                    fontWeight:"500", lineHeight:"1.4",
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
                  }}>{e.text}</p>
                  <p style={{ fontSize:"10px", color:"var(--text-muted)", marginTop:"2px" }}>{e.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
