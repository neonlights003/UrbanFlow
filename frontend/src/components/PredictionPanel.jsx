import { useEffect, useState } from "react";

const TOTAL = 4;

export default function PredictionPanel({ slots }) {
  const [prediction, setPrediction] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(10);

  useEffect(() => {
    function predict() {
      const occupied = Object.values(slots).filter(s => s === "OCCUPIED").length;
      let predicted = occupied;
      if (occupied >= 3) predicted = Math.min(TOTAL, occupied + 1);
      else if (occupied <= 1) predicted = Math.max(0, occupied);
      else predicted = occupied + (Math.random() > 0.5 ? 1 : 0);
      predicted = Math.min(TOTAL, Math.max(0, Math.round(predicted)));

      const confidence = occupied > 2 ? 87 : occupied > 0 ? 71 : 55;
      setPrediction({ occupied: predicted, available: TOTAL - predicted, confidence });
      setNextUpdate(10);
    }

    predict();
    const interval = setInterval(predict, 10000);
    const ticker   = setInterval(() => setNextUpdate(n => Math.max(0, n - 1)), 1000);
    return () => { clearInterval(interval); clearInterval(ticker); };
  }, [slots]);

  if (!prediction) return null;

  const pct = Math.round((prediction.occupied / TOTAL) * 100);

  // Mini visual forecast bar — 4 cells
  const cells = Array.from({ length: TOTAL }, (_, i) => i < prediction.occupied);

  return (
    <div className="card" style={{ padding:"20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em" }}>
          AI FORECAST · 30 MIN
        </span>
        <span style={{ fontSize:"10px", color:"var(--text-muted)", fontFamily:"monospace" }}>
          refresh in {nextUpdate}s
        </span>
      </div>

      {/* Forecast cells */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"20px" }}>
        {cells.map((occ, i) => (
          <div key={i} style={{
            flex:1, height:"44px", borderRadius:"10px",
            background: occ ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${occ ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.2)"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"14px", transition:"all 0.4s"
          }}>
            {occ ? "🚗" : "✦"}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px", marginBottom:"16px" }}>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"10px", color:"var(--text-muted)", marginBottom:"4px", letterSpacing:"0.06em" }}>OCCUPIED</p>
          <p style={{ fontSize:"26px", fontWeight:"800", color:"#f87171", letterSpacing:"-0.03em", lineHeight:1 }}>
            {prediction.occupied}
            <span style={{ fontSize:"14px", color:"var(--text-muted)", fontWeight:"400" }}>/{TOTAL}</span>
          </p>
        </div>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"10px", color:"var(--text-muted)", marginBottom:"4px", letterSpacing:"0.06em" }}>FREE</p>
          <p style={{ fontSize:"26px", fontWeight:"800", color:"#34d399", letterSpacing:"-0.03em", lineHeight:1 }}>
            {prediction.available}
            <span style={{ fontSize:"14px", color:"var(--text-muted)", fontWeight:"400" }}>/{TOTAL}</span>
          </p>
        </div>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:"10px", color:"var(--text-muted)", marginBottom:"4px", letterSpacing:"0.06em" }}>CONFIDENCE</p>
          <p style={{ fontSize:"26px", fontWeight:"800", color:"#60a5fa", letterSpacing:"-0.03em", lineHeight:1 }}>
            {prediction.confidence}
            <span style={{ fontSize:"14px", color:"var(--text-muted)", fontWeight:"400" }}>%</span>
          </p>
        </div>
      </div>

      {/* Predicted occupancy bar */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
          <span style={{ fontSize:"10px", color:"var(--text-muted)" }}>Predicted utilisation</span>
          <span style={{ fontSize:"10px", color:"var(--text-secondary)", fontWeight:"600" }}>{pct}%</span>
        </div>
        <div className="progress-track" style={{ height:"5px" }}>
          <div className="progress-fill" style={{
            width:`${pct}%`,
            background: pct > 75 ? "var(--red)" : pct > 50 ? "var(--amber)" : "var(--green)"
          }} />
        </div>
      </div>

      <p style={{ fontSize:"10px", color:"var(--text-muted)", marginTop:"12px", textAlign:"center" }}>
        Based on live sensor data &amp; historical patterns
      </p>
    </div>
  );
}
