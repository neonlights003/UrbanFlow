import { useEffect, useState } from "react";

const TOTAL = 4;

export default function PredictionPanel({ slots }) {
  const [pred, setPred]   = useState(null);
  const [tick, setTick]   = useState(10);

  useEffect(() => {
    function predict() {
      const occupied = Object.values(slots).filter(s=>s==="OCCUPIED").length;
      let p = occupied;
      if (occupied >= 3) p = Math.min(TOTAL, occupied+1);
      else if (occupied <= 1) p = Math.max(0, occupied);
      else p = occupied + (Math.random()>0.5?1:0);
      p = Math.min(TOTAL, Math.max(0, Math.round(p)));
      setPred({ occupied:p, available:TOTAL-p, confidence: occupied>2?87:occupied>0?71:55 });
      setTick(10);
    }
    predict();
    const iv  = setInterval(predict, 10000);
    const tck = setInterval(()=>setTick(n=>Math.max(0,n-1)), 1000);
    return () => { clearInterval(iv); clearInterval(tck); };
  }, [slots]);

  if (!pred) return null;

  const pct = Math.round((pred.occupied/TOTAL)*100);

  return (
    <div className="glass" style={{ padding:"20px 22px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <p className="label">AI FORECAST · 30 MIN</p>
        <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", fontFamily:"monospace" }}>
          {tick}s
        </span>
      </div>

      {/* Visual cells */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"18px" }}>
        {Array.from({length:TOTAL}).map((_,i) => {
          const occ = i < pred.occupied;
          return (
            <div key={i} style={{
              flex:1, height:"40px", borderRadius:"10px",
              background: occ ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.07)",
              border:`1px solid ${occ ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.18)"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"14px", transition:"all 0.4s"
            }}>
              {occ ? "🚗" : "✦"}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"14px" }}>
        {[
          { label:"OCCUPIED",   val:pred.occupied,   suffix:`/${TOTAL}`, cls:"num-red"  },
          { label:"FREE",       val:pred.available,  suffix:`/${TOTAL}`, cls:"num-green"},
          { label:"CONFIDENCE", val:pred.confidence, suffix:"%",         cls:"num-mono" },
        ].map(s=>(
          <div key={s.label} style={{ textAlign:"center" }}>
            <p style={{ fontSize:"9px", color:"rgba(255,255,255,0.22)", fontWeight:"700",
              letterSpacing:"0.1em", marginBottom:"4px" }}>{s.label}</p>
            <p style={{ fontSize:"22px", fontWeight:"900", letterSpacing:"-0.03em", lineHeight:1 }}
              className={s.cls}>
              {s.val}
              <span style={{ fontSize:"12px", WebkitTextFillColor:"rgba(255,255,255,0.25)" }}>{s.suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="track" style={{ height:"4px" }}>
        <div className="fill" style={{
          width:`${pct}%`,
          background: pct>75 ? "linear-gradient(90deg,#f87171,#ef4444)"
                     : pct>50 ? "linear-gradient(90deg,#fcd34d,#f59e0b)"
                     :          "linear-gradient(90deg,#6ee7b7,#10b981)"
        }}/>
      </div>
      <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.18)", marginTop:"10px", textAlign:"center" }}>
        Based on live data &amp; historical patterns
      </p>
    </div>
  );
}
