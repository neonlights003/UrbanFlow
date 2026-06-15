import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { useDedupe } from "./hooks/useDedupe";
import AccessAlert from "./components/AccessAlert";
import RfidManager from "./components/RfidManager";

const TOTAL_SLOTS = 4;

export default function App() {
  const [slotsLeft, setSlotsLeft]   = useState(TOTAL_SLOTS);
  const [gateStatus, setGateStatus] = useState("CLOSED");
  const [lastCard, setLastCard]     = useState(null); // { uid, result, label }
  const [events, setEvents]         = useState([]);
  const [alert, setAlert]           = useState(null);
  const [showRfidManager, setShowRfidManager] = useState(false);

  const isDuplicate = useDedupe(800);

  function addEvent(type, text) {
    const key = `${type}:${text}`;
    if (isDuplicate(key)) return;
    setEvents(prev => [
      { type, text, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 49),
    ]);
  }

  function triggerAlert(type, uid, label) {
    setAlert({ type, uid, label });
    setTimeout(() => setAlert(null), 4000);
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/slots")
      .then(r => r.json())
      .then(data => {
        const occupied = data.filter(s => s.status === "OCCUPIED").length;
        setSlotsLeft(TOTAL_SLOTS - occupied);
      })
      .catch(() => {});
  }, []);

  const handleMessage = useCallback((type, data) => {
    if (type === "init") {
      const occupied = data.slots.filter(s => s.status === "OCCUPIED").length;
      setSlotsLeft(TOTAL_SLOTS - occupied);
      return;
    }
    if (type === "slot_update") {
      // Recount available from all current slots
      // Backend will broadcast each slot; we just track occupied count
      setSlotsLeft(prev => {
        if (data.status === "OCCUPIED") return Math.max(0, prev - 1);
        if (data.status === "FREE")     return Math.min(TOTAL_SLOTS, prev + 1);
        return prev;
      });
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
    if (type === "anomaly") {
      addEvent("ANOMALY", data.message?.slice(0, 50));
    }
  }, []);

  const connected = useWebSocket(handleMessage);
  const occupied  = TOTAL_SLOTS - slotsLeft;
  const full      = slotsLeft === 0;
  const gateOpen  = gateStatus === "OPENED";

  const eventConfig = {
    SLOT:    { icon: "▣", color: "#60a5fa" },
    RFID:    { icon: "◈", color: "#f59e0b" },
    GATE:    { icon: "◉", color: "#a78bfa" },
    ANOMALY: { icon: "⚠", color: "#f87171" },
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      padding: "28px 32px",
      fontFamily: "Inter, sans-serif",
    }}>
      <AccessAlert alert={alert} onDismiss={() => setAlert(null)} />
      <RfidManager isOpen={showRfidManager} onClose={() => setShowRfidManager(false)} />

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{
            width:"40px", height:"40px", borderRadius:"10px",
            background:"linear-gradient(135deg,#d97706,#92400e)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"20px"
          }}>🅿</div>
          <div>
            <h1 style={{ fontSize:"20px", fontWeight:"800", color:"var(--text-primary)", letterSpacing:"-0.03em", lineHeight:1 }}>
              Urban Flow
            </h1>
            <p style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"2px" }}>Smart Parking · Live Dashboard</p>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <button
            onClick={() => setShowRfidManager(true)}
            className="btn-amber"
            style={{ padding:"8px 14px", borderRadius:"10px", fontSize:"12px", fontWeight:"600", cursor:"pointer" }}
          >
            💳 Manage RFIDs
          </button>
          <div style={{
            display:"flex", alignItems:"center", gap:"6px",
            padding:"8px 14px", borderRadius:"10px", fontSize:"11px", fontWeight:"700",
            background: connected ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${connected ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            color: connected ? "var(--green)" : "var(--red)",
            letterSpacing:"0.08em"
          }}>
            <span style={{
              width:"6px", height:"6px", borderRadius:"50%",
              background: connected ? "var(--green)" : "var(--red)"
            }} className={connected ? "pulse-green" : ""} />
            {connected ? "LIVE" : "OFFLINE"}
          </div>
        </div>
      </div>

      {/* ── 3 Hero Cards ───────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px", marginBottom:"20px" }}>

        {/* Slots Left */}
        <div className="card" style={{
          padding:"32px 28px",
          background: full ? "rgba(239,68,68,0.06)" : "var(--bg-surface)",
          borderColor: full ? "rgba(239,68,68,0.25)" : "var(--border)",
        }}>
          <p style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em", marginBottom:"16px" }}>
            SLOTS AVAILABLE
          </p>
          <p style={{
            fontSize:"80px", fontWeight:"900", lineHeight:1, letterSpacing:"-0.05em",
            color: full ? "#f87171" : slotsLeft === 1 ? "#f59e0b" : "#34d399",
          }}>
            {slotsLeft}
          </p>
          <p style={{ fontSize:"13px", color:"var(--text-muted)", marginTop:"8px" }}>
            {full ? "🔴 Parking full" : `of ${TOTAL_SLOTS} total · ${occupied} occupied`}
          </p>
          {/* Mini bay visual */}
          <div style={{ display:"flex", gap:"6px", marginTop:"16px" }}>
            {Array.from({length: TOTAL_SLOTS}).map((_, i) => (
              <div key={i} style={{
                flex:1, height:"6px", borderRadius:"99px",
                background: i < occupied ? "#f87171" : "rgba(52,211,153,0.3)",
                transition:"background 0.4s"
              }} />
            ))}
          </div>
        </div>

        {/* Gate Status */}
        <div className="card" style={{
          padding:"32px 28px",
          background: gateOpen ? "rgba(16,185,129,0.06)" : "rgba(217,119,6,0.04)",
          borderColor: gateOpen ? "rgba(16,185,129,0.25)" : "rgba(217,119,6,0.15)",
        }}>
          <p style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em", marginBottom:"16px" }}>
            GATE STATUS
          </p>
          <div style={{ fontSize:"52px", marginBottom:"8px" }}>
            {gateOpen ? "🔓" : "🔒"}
          </div>
          <p style={{
            fontSize:"36px", fontWeight:"900", lineHeight:1, letterSpacing:"-0.04em",
            color: gateOpen ? "#34d399" : "#f59e0b",
          }}>
            {gateOpen ? "OPEN" : "CLOSED"}
          </p>
          <p style={{ fontSize:"13px", color:"var(--text-muted)", marginTop:"8px" }}>
            {gateOpen ? "Vehicle in transit" : "Barrier secured"}
          </p>
        </div>

        {/* Last RFID Card */}
        <div className="card" style={{
          padding:"32px 28px",
          background: lastCard?.result === "GRANTED"
            ? "rgba(16,185,129,0.06)"
            : lastCard?.result === "DENIED"
            ? "rgba(239,68,68,0.06)"
            : "var(--bg-surface)",
          borderColor: lastCard?.result === "GRANTED"
            ? "rgba(16,185,129,0.25)"
            : lastCard?.result === "DENIED"
            ? "rgba(239,68,68,0.25)"
            : "var(--border)",
        }}>
          <p style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em", marginBottom:"16px" }}>
            LAST RFID SCAN
          </p>
          {lastCard ? (
            <>
              <p style={{
                fontSize:"28px", fontWeight:"900", letterSpacing:"0.05em",
                fontFamily:"monospace", color:"var(--amber-light)", lineHeight:1, marginBottom:"8px",
                wordBreak:"break-all"
              }}>
                {lastCard.uid}
              </p>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:"6px",
                padding:"4px 12px", borderRadius:"99px", fontSize:"12px", fontWeight:"700",
                background: lastCard.result === "GRANTED" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: lastCard.result === "GRANTED" ? "#34d399" : "#f87171",
                letterSpacing:"0.05em"
              }}>
                {lastCard.result === "GRANTED" ? "✓" : "✕"} {lastCard.result}
              </div>
              <p style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"8px" }}>{lastCard.label}</p>
            </>
          ) : (
            <>
              <p style={{ fontSize:"28px", color:"var(--text-muted)", letterSpacing:"0.1em", fontFamily:"monospace", marginBottom:"8px" }}>
                — — — —
              </p>
              <p style={{ fontSize:"12px", color:"var(--text-muted)" }}>Waiting for card scan…</p>
            </>
          )}
        </div>

      </div>

      {/* ── Event Feed ──────────────────────────────────────── */}
      <div className="card" style={{ padding:"20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
          <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em" }}>
            LIVE EVENT LOG
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
          display:"flex", flexDirection:"column", gap:"4px",
          maxHeight:"220px", overflowY:"auto"
        }}>
          {events.length === 0 ? (
            <p style={{ color:"var(--text-muted)", fontSize:"12px", textAlign:"center", padding:"24px 0" }}>
              Waiting for events…
            </p>
          ) : events.map((e, i) => {
            const cfg = eventConfig[e.type] || eventConfig.SLOT;
            return (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:"12px",
                padding:"8px 10px", borderRadius:"8px",
                background: i === 0 ? `${cfg.color}12` : "transparent",
              }}>
                <span style={{
                  width:"24px", height:"24px", borderRadius:"6px",
                  background:`${cfg.color}14`, color:cfg.color,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"11px", flexShrink:0
                }}>{cfg.icon}</span>
                <span style={{ flex:1, fontSize:"13px", color:"var(--text-primary)", fontWeight:"500" }}>
                  {e.text}
                </span>
                <span style={{ fontSize:"10px", color:"var(--text-muted)", flexShrink:0 }}>{e.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
