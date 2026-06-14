import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { useDedupe } from "./hooks/useDedupe";
import SlotGrid from "./components/SlotGrid";
import StatsRow from "./components/StatsRow";
import EventFeed from "./components/EventFeed";
import OccupancyChart from "./components/OccupancyChart";
import PredictionPanel from "./components/PredictionPanel";

export default function App() {
  const [slots, setSlots] = useState({
    A1:"FREE", A2:"FREE", A3:"FREE", A4:"FREE", A5:"FREE"
  });
  const [gateStatus, setGateStatus] = useState("CLOSED");
  const [events, setEvents] = useState([]);
  const isDuplicate = useDedupe(800);

  function addEvent(type, text) {
    const key = `${type}:${text}`;
    if (isDuplicate(key)) return;
    setEvents((prev) => [
      { type, text, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 49),
    ]);
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/slots")
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        data.forEach((s) => (map[s.id] = s.status));
        setSlots(map);
      })
      .catch((e) => console.error("[App] Failed to load slots:", e));
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
      addEvent(
        "RFID",
        `Card ${data.uid.slice(0, 8)}... → ${data.result} (${data.label})`
      );
    }
  }, []);

  const connected = useWebSocket(handleMessage);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-400 tracking-tight">
            Urban Flow
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Smart Parking Management System
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
            connected
              ? "bg-green-950 border-green-700 text-green-400"
              : "bg-red-950 border-red-700 text-red-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              connected ? "bg-green-400 animate-pulse" : "bg-red-400"
            }`}/>
            {connected ? "LIVE" : "CONNECTING..."}
          </div>
          <div className="text-xs text-gray-600">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short", day: "numeric", month: "short"
            })}
          </div>
        </div>
      </div>

      <StatsRow slots={slots} gateStatus={gateStatus} />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <SlotGrid slots={slots} />
        </div>
        <div>
          <EventFeed events={events} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <OccupancyChart />
        <PredictionPanel slots={slots} />
      </div>
    </div>
  );
}
