export default function AccessAlert({ alert, onDismiss }) {
  if (!alert) return null;
  const granted = alert.type === "GRANTED";

  return (
    <div className="alert-enter" style={{
      position:"fixed", top:0, left:0, right:0, zIndex:200,
      backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      background: granted
        ? "linear-gradient(90deg,rgba(6,78,59,0.95),rgba(5,46,22,0.95))"
        : "linear-gradient(90deg,rgba(127,29,29,0.95),rgba(69,10,10,0.95))",
      borderBottom:`1px solid ${granted ? "rgba(52,211,153,0.2)" : "rgba(252,165,165,0.2)"}`,
      padding:"14px 28px",
      display:"flex", alignItems:"center", gap:"16px"
    }}>

      {/* Icon */}
      <div style={{
        width:"40px", height:"40px", borderRadius:"14px", flexShrink:0,
        background: granted ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
        border:`1px solid ${granted ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"18px", fontWeight:"700",
        color: granted ? "#34d399" : "#f87171",
        boxShadow: granted ? "0 0 20px rgba(52,211,153,0.2)" : "0 0 20px rgba(248,113,113,0.2)"
      }}>
        {granted ? "✓" : "✕"}
      </div>

      {/* Text */}
      <div style={{ flex:1 }}>
        <p style={{ fontWeight:"800", fontSize:"15px", color:"#fff", letterSpacing:"-0.02em" }}>
          Access {granted ? "Granted" : "Denied"}
        </p>
        <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.55)", marginTop:"2px" }}>
          {granted
            ? `${alert.label} — gate opening now`
            : `Unknown card ${alert.uid?.slice(0,12)} — access blocked`}
        </p>
      </div>

      {/* Auto-dismiss bar */}
      <div style={{ width:"60px", height:"2px", background:"rgba(255,255,255,0.12)", borderRadius:"99px", overflow:"hidden" }}>
        <div className="shrink-bar" style={{ height:"100%", background:"rgba(255,255,255,0.5)", borderRadius:"99px" }} />
      </div>

      <button onClick={onDismiss} style={{
        background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
        cursor:"pointer", color:"rgba(255,255,255,0.7)",
        width:"30px", height:"30px", borderRadius:"10px",
        fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0, transition:"all 0.2s"
      }}>✕</button>
    </div>
  );
}
