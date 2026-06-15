export default function AccessAlert({ alert, onDismiss }) {
  if (!alert) return null;

  const granted = alert.type === "GRANTED";

  return (
    <div className="alert-enter" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "16px 24px",
      background: granted
        ? "linear-gradient(90deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))"
        : "linear-gradient(90deg, rgba(220,38,38,0.95), rgba(185,28,28,0.95))",
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${granted ? "rgba(52,211,153,0.3)" : "rgba(252,165,165,0.3)"}`,
      display: "flex", alignItems: "center", gap: "16px"
    }}>

      <div style={{
        width:"40px", height:"40px", borderRadius:"12px",
        background:"rgba(255,255,255,0.15)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"20px", flexShrink:0
      }}>
        {granted ? "✓" : "✕"}
      </div>

      <div style={{ flex:1 }}>
        <p style={{ fontWeight:"700", fontSize:"15px", color:"#fff", letterSpacing:"-0.01em" }}>
          Access {granted ? "Granted" : "Denied"}
        </p>
        <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.7)", marginTop:"1px" }}>
          {granted ? `${alert.label} — gate opening` : `Unknown card ${alert.uid?.slice(0,8)}… — access blocked`}
        </p>
      </div>

      {/* Auto-dismiss bar */}
      <div style={{ width:"80px", height:"3px", borderRadius:"99px", background:"rgba(255,255,255,0.2)", overflow:"hidden" }}>
        <div className="shrink-bar" style={{ height:"100%", background:"rgba(255,255,255,0.7)", borderRadius:"99px" }} />
      </div>

      <button onClick={onDismiss} style={{
        background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer",
        color:"#fff", width:"28px", height:"28px", borderRadius:"8px",
        fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center"
      }}>✕</button>
    </div>
  );
}
