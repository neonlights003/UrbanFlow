import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { useDedupe } from "./hooks/useDedupe";
import SlotGrid from "./components/SlotGrid";
import StatsRow from "./components/StatsRow";
import EventFeed from "./components/EventFeed";
import OccupancyChart from "./components/OccupancyChart";
import PredictionPanel from "./components/PredictionPanel";
import AccessAlert from "./components/AccessAlert";
import AnomalyFeed from "./components/AnomalyFeed";
import RfidManager from "./components/RfidManager";

export default function App() {
  const [slots, setSlots] = useState({
    A1:"FREE", A2:"FREE", A3:"FREE", A4:"FREE"
  });
  const [gateStatus, setGateStatus] = useState("CLOSED");
  const [events, setEvents]         = useState([]);
  const [alert, setAlert]           = useState(null);
  const [anomalies, setAnomalies]   = useState([]);
  const [showRfidManager, setShowRfidManager] = useState(false);

  const isDuplicate = useDedupe(800);

  function addEvent(type, text) {
    const key = `${type}:${text}`;
    if (isDuplicate(key)) return;
    setEvents((prev) => [
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
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        data.forEach((s) => (map[s.id] = s.status));
        setSlots(map);
      })
      .catch(() => {});

    fetch("http://localhost:8000/api/anomalies")
      .then((r) => r.json())
      .then(setAnomalies)
      .catch(() => {});
  }, []);

  const handleMessage = useCallback((type, data) => {
    if (type === "init") {
      const map = {};
      data.slots.forEach((s) => (map[s.id] = s.status));
      setSlots(map);
      return;
    }
    if (type === "slot_update") {
      setSlots((prev) => ({ ...prev, [data.slot]: data.status }));
      addEvent("SLOT", `${data.slot} → ${data.status}`);
    }
    if (type === "gate_update") {
      setGateStatus(data.status);
      addEvent("GATE", `Gate ${data.status}`);
    }
    if (type === "rfid_event") {
      addEvent("RFID", `${data.uid.slice(0,8)}… → ${data.result} (${data.label})`);
      triggerAlert(data.result, data.uid, data.label);
    }
    if (type === "anomaly") {
      setAnomalies((prev) => [data, ...prev.slice(0, 19)]);
      addEvent("ANOMALY", `${data.code}: ${data.message.slice(0, 38)}…`);
    }
  }, []);

  const connected = useWebSocket(handleMessage);
  const now = new Date();

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", padding: "24px" }}>
      <AccessAlert alert={alert} onDismiss={() => setAlert(null)} />
      <RfidManager isOpen={showRfidManager} onClose={() => setShowRfidManager(false)} />

      {/* ── Header ─────────────────────────────── */}
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
            <div style={{
              width:"32px", height:"32px", borderRadius:"8px",
              background:"linear-gradient(135deg,#d97706,#92400e)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"16px"
            }}>🅿</div>
            <h1 style={{ fontSize:"22px", fontWeight:"700", color:"var(--text-primary)", letterSpacing:"-0.02em" }}>
              Urban Flow
            </h1>
          </div>
          <p style={{ fontSize:"12px", color:"var(--text-muted)", marginLeft:"42px" }}>
            Smart Parking Management System
          </p>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          {/* Date */}
          <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>
            {now.toLocaleDateString("en-IN",{ weekday:"short", day:"numeric", month:"short" })}
          </span>

          {/* Manage RFID */}
          <button
            onClick={() => setShowRfidManager(true)}
            className="btn-amber"
            style={{ padding:"7px 14px", borderRadius:"10px", fontSize:"12px", fontWeight:"500", cursor:"pointer" }}
          >
            💳 Manage RFIDs
          </button>

          {/* Live badge */}
          <div style={{
            display:"flex", alignItems:"center", gap:"6px",
            padding:"7px 12px", borderRadius:"10px", fontSize:"11px", fontWeight:"600",
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
      </header>

      {/* ── Stats Row ──────────────────────────── */}
      <div style={{ marginBottom:"20px" }}>
        <StatsRow slots={slots} gateStatus={gateStatus} />
      </div>

      {/* ── Main Grid ──────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"16px", marginBottom:"16px" }}>
        <SlotGrid slots={slots} />
        <EventFeed events={events} />
      </div>

      {/* ── Bottom Grid ────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 340px", gap:"16px" }}>
        <OccupancyChart />
        <PredictionPanel slots={slots} />
        <AnomalyFeed anomalies={anomalies} />
      </div>
    </div>
  );
}
