import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { useDedupe } from "./hooks/useDedupe";
import AccessAlert from "./components/AccessAlert";
import RfidManager from "./components/RfidManager";

const TOTAL = 4;

export default function App() {
  const [slotsLeft,  setSlotsLeft]  = useState(TOTAL);
  const [gateStatus, setGateStatus] = useState("CLOSED");
  const [lastCard,   setLastCard]   = useState(null);
  const [events,     setEvents]     = useState([]);
  const [alert,      setAlert]      = useState(null);
  const [showRfid,   setShowRfid]   = useState(false);

  const isDuplicate = useDedupe(800);

  function addEvent(type, text) {
    if (isDuplicate(`${type}:${text}`)) return;
    setEvents(prev => [{ type, text, time: new Date().toLocaleTimeString() }, ...prev.slice(0,49)]);
  }

  function triggerAlert(type, uid, label) {
    setAlert({ type, uid, label });
    setTimeout(() => setAlert(null), 4000);
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/slots").then(r => r.json()).then(data => {
      const occ = data.filter(s => s.status === "OCCUPIED").length;
      setSlotsLeft(TOTAL - occ);
    }).catch(() => {});
  }, []);

  const handleMessage = useCallback((type, data) => {
    if (type === "init") {
      setSlotsLeft(TOTAL - data.slots.filter(s => s.status === "OCCUPIED").length);
      return;
    }
    if (type === "slot_update") {
      setSlotsLeft(prev =>
        data.status === "OCCUPIED" ? Math.max(0, prev - 1) :
        data.status === "FREE"     ? Math.min(TOTAL, prev + 1) : prev
      );
      addEvent("SLOT", data.status === "OCCUPIED" ? "Vehicle entered — slot taken" : "Vehicle exited — slot freed");
    }
    if (type === "gate_update") {
      setGateStatus(data.status);
      addEvent("GATE", `Gate ${data.status === "OPENED" ? "opened" : "closed"}`);
    }
    if (type === "rfid_event") {
      setLastCard({ uid: data.uid, result: data.result, label: data.label });
      addEvent("RFID", `Card ${data.uid} — ${data.result}`);
      triggerAlert(data.result, data.uid, data.label);
    }
    if (type === "anomaly") addEvent("ANOMALY", data.message?.slice(0, 50));
  }, []);

  const connected = useWebSocket(handleMessage);
  const occupied  = TOTAL - slotsLeft;
  const full      = slotsLeft === 0;
  const gateOpen  = gateStatus === "OPENED";

  const eventIcons = {
    SLOT:    { icon: "▣", color: "#60a5fa" },
    RFID:    { icon: "◈", color: "#f59e0b" },
    GATE:    { icon: "◉", color: "#a78bfa" },
    ANOMALY: { icon: "⚠", color: "#f87171" },
  };

  return (
    <>
      {/* Ambient background */}
      <div className="bg-scene">
        <div className="bg-grid" />
        <div className="bg-orb-mid" />
      </div>

      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", padding:"28px 32px" }}>
        <AccessAlert alert={alert} onDismiss={() => setAlert(null)} />
        <RfidManager isOpen={showRfid} onClose={() => setShowRfid(false)} />

        {/* ── Header ─────────────────────────────────── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            {/* Logo badge */}
            <div style={{
              width:"44px", height:"44px", borderRadius:"14px",
              background:"linear-gradient(135deg,rgba(217,119,6,0.9),rgba(146,64,14,0.9))",
              border:"1px solid rgba(245,158,11,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"22px", boxShadow:"0 4px 20px rgba(217,119,6,0.25)",
              backdropFilter:"blur(10px)"
            }}>🅿</div>
            <div>
              <h1 style={{
                fontSize:"22px", fontWeight:"900", letterSpacing:"-0.04em", lineHeight:1,
                background:"linear-gradient(135deg,#fff 40%,rgba(255,255,255,0.55))",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
              }}>Urban Flow</h1>
              <p style={{ fontSize:"11px", color:"var(--text-3)", marginTop:"3px", letterSpacing:"0.04em" }}>
                Smart Parking Management System
              </p>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <button onClick={() => setShowRfid(true)} className="btn-amber"
              style={{ padding:"9px 16px", borderRadius:"12px", fontSize:"12px" }}>
              💳 Manage RFIDs
            </button>
            <div style={{
              display:"flex", alignItems:"center", gap:"7px",
              padding:"9px 16px", borderRadius:"12px", fontSize:"11px", fontWeight:"700",
              background: connected ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${connected ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
              color: connected ? "#34d399" : "#f87171",
              backdropFilter:"blur(12px)", letterSpacing:"0.08em"
            }}>
              <span style={{
                width:"6px", height:"6px", borderRadius:"50%",
                background: connected ? "#34d399" : "#f87171"
              }} className={connected ? "pulse-green" : ""} />
              {connected ? "LIVE" : "OFFLINE"}
            </div>
          </div>
        </div>

        {/* ── 3 Hero Cards ───────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px", marginBottom:"16px" }}>

          {/* — Slots Left — */}
          <div className={`glass-hero ${full ? "glow-red" : ""}`}
            style={{ padding:"32px 28px" }}>
            {/* Inner glow */}
            <div style={{
              position:"absolute", top:"-40px", right:"-20px",
              width:"160px", height:"160px", borderRadius:"50%",
              background: full
                ? "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
              pointerEvents:"none"
            }} />

            <p className="label" style={{ marginBottom:"20px" }}>SLOTS AVAILABLE</p>

            <p style={{
              fontSize:"88px", fontWeight:"900", lineHeight:1, letterSpacing:"-0.05em",
            }} className={full ? "num-red" : slotsLeft === 1 ? "num-amber" : "num-green"}>
              {slotsLeft}
            </p>

            <p style={{ fontSize:"13px", color:"var(--text-2)", marginTop:"10px" }}>
              {full ? "🔴 Parking lot full" : `of ${TOTAL} bays · ${occupied} occupied`}
            </p>

            {/* Mini bay strip */}
            <div style={{ display:"flex", gap:"6px", marginTop:"20px" }}>
              {Array.from({length:TOTAL}).map((_,i) => (
                <div key={i} style={{
                  flex:1, height:"4px", borderRadius:"99px",
                  background: i < occupied
                    ? "linear-gradient(90deg,#f87171,#ef4444)"
                    : "rgba(52,211,153,0.2)",
                  transition:"background 0.5s",
                  boxShadow: i < occupied ? "0 0 6px rgba(239,68,68,0.4)" : "none"
                }} />
              ))}
            </div>
          </div>

          {/* — Gate — */}
          <div className={`glass-hero ${gateOpen ? "glow-green" : ""}`}
            style={{ padding:"32px 28px" }}>
            <div style={{
              position:"absolute", bottom:"-30px", left:"50%", transform:"translateX(-50%)",
              width:"200px", height:"120px", borderRadius:"50%",
              background: gateOpen
                ? "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
              pointerEvents:"none"
            }} />

            <p className="label" style={{ marginBottom:"20px" }}>GATE STATUS</p>

            <div style={{
              width:"60px", height:"60px", borderRadius:"18px",
              background: gateOpen ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.1)",
              border: `1px solid ${gateOpen ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.2)"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"26px", marginBottom:"16px",
              boxShadow: gateOpen ? "0 0 20px rgba(16,185,129,0.15)" : "none"
            }}>
              {gateOpen ? "🔓" : "🔒"}
            </div>

            <p style={{
              fontSize:"44px", fontWeight:"900", lineHeight:1, letterSpacing:"-0.04em",
            }} className={gateOpen ? "num-green" : "num-amber"}>
              {gateOpen ? "OPEN" : "CLOSED"}
            </p>

            <p style={{ fontSize:"13px", color:"var(--text-2)", marginTop:"10px" }}>
              {gateOpen ? "Vehicle in transit" : "Barrier secured"}
            </p>
          </div>

          {/* — Last RFID — */}
          <div className={`glass-hero ${
            lastCard?.result === "GRANTED" ? "glow-green" :
            lastCard?.result === "DENIED"  ? "glow-red"   : ""
          }`} style={{ padding:"32px 28px" }}>
            <div style={{
              position:"absolute", top:"-20px", left:"-20px",
              width:"180px", height:"180px", borderRadius:"50%",
              background:"radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
              pointerEvents:"none"
            }} />

            <p className="label" style={{ marginBottom:"20px" }}>LAST RFID SCAN</p>

            {lastCard ? (
              <>
                <p style={{
                  fontSize:"32px", fontWeight:"900", letterSpacing:"0.06em",
                  fontFamily:"'Courier New', monospace", lineHeight:1, marginBottom:"14px",
                  wordBreak:"break-all"
                }} className="num-mono">{lastCard.uid}</p>

                <div style={{
                  display:"inline-flex", alignItems:"center", gap:"7px",
                  padding:"6px 14px", borderRadius:"99px", fontSize:"12px", fontWeight:"700",
                  background: lastCard.result==="GRANTED"
                    ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${lastCard.result==="GRANTED"
                    ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: lastCard.result==="GRANTED" ? "#34d399" : "#f87171",
                  boxShadow: lastCard.result==="GRANTED"
                    ? "0 0 16px rgba(16,185,129,0.15)" : "0 0 16px rgba(239,68,68,0.15)",
                  letterSpacing:"0.04em", marginBottom:"10px"
                }}>
                  {lastCard.result==="GRANTED" ? "✓" : "✕"} {lastCard.result}
                </div>

                <p style={{ fontSize:"12px", color:"var(--text-2)", marginTop:"6px" }}>
                  {lastCard.label}
                </p>
              </>
            ) : (
              <>
                <p style={{
                  fontSize:"32px", letterSpacing:"0.15em", fontFamily:"monospace",
                  color:"var(--text-3)", marginBottom:"14px"
                }}>— — — —</p>
                <p style={{ fontSize:"12px", color:"var(--text-3)" }}>Awaiting card scan…</p>
              </>
            )}
          </div>
        </div>

        {/* ── Event Feed ────────────────────────────── */}
        <div className="glass" style={{ padding:"22px 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
            <p className="label">LIVE EVENT LOG</p>
            <span style={{
              fontSize:"10px", fontWeight:"700",
              padding:"3px 10px", borderRadius:"99px",
              background:"rgba(245,158,11,0.1)",
              border:"1px solid rgba(245,158,11,0.2)",
              color:"var(--amber)"
            }}>{events.length} events</span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"2px", maxHeight:"240px", overflowY:"auto" }}>
            {events.length === 0 ? (
              <p style={{ textAlign:"center", color:"var(--text-3)", fontSize:"13px", padding:"32px 0" }}>
                Waiting for events…
              </p>
            ) : events.map((e, i) => {
              const cfg = eventIcons[e.type] || eventIcons.SLOT;
              return (
                <div key={i} className={i===0?"fade-up":""} style={{
                  display:"flex", alignItems:"center", gap:"12px",
                  padding:"9px 12px", borderRadius:"12px",
                  background: i===0 ? `${cfg.color}0d` : "transparent",
                  transition:"background 0.3s"
                }}>
                  <div style={{
                    width:"28px", height:"28px", borderRadius:"8px", flexShrink:0,
                    background:`${cfg.color}12`,
                    border:`1px solid ${cfg.color}25`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"12px", color:cfg.color
                  }}>{cfg.icon}</div>
                  <span style={{ flex:1, fontSize:"13px", color:"var(--text-1)", fontWeight:"500" }}>
                    {e.text}
                  </span>
                  <span style={{ fontSize:"10px", color:"var(--text-3)", flexShrink:0, fontFamily:"monospace" }}>
                    {e.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign:"center", fontSize:"10px", color:"var(--text-3)", marginTop:"20px", letterSpacing:"0.08em" }}>
          URBAN FLOW · SMART PARKING MANAGEMENT · {new Date().getFullYear()}
        </p>
      </div>
    </>
  );
}
