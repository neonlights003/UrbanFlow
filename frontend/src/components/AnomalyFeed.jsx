import { useState, useEffect } from "react";

export default function AnomalyFeed({ anomalies }) {
  const levelConfig = {
    critical: {
      bg: "bg-red-950",
      border: "border-red-700",
      badge: "bg-red-600 text-white",
      icon: "🚨",
      text: "text-red-300"
    },
    warning: {
      bg: "bg-yellow-950",
      border: "border-yellow-700",
      badge: "bg-yellow-600 text-white",
      icon: "⚠️",
      text: "text-yellow-300"
    }
  };

  const codeLabels = {
    STUCK_SENSOR:     "Sensor Fault",
    LOT_FULL:         "Lot Full",
    REPEATED_DENIAL:  "Intrusion Alert"
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs text-gray-400 font-semibold tracking-widest">
          ANOMALY DETECTION
        </h2>
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
          anomalies.some(a => a.level === "critical")
            ? "bg-red-600 text-white animate-pulse"
            : anomalies.length > 0
            ? "bg-yellow-600 text-white"
            : "bg-gray-700 text-gray-400"
        }`}>
          {anomalies.length === 0
            ? "ALL CLEAR"
            : `${anomalies.length} ALERT${anomalies.length > 1 ? "S" : ""}`
          }
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto event-scroll max-h-48">
        {anomalies.length === 0 && (
          <div className="flex items-center gap-2 text-gray-600 text-sm py-4 justify-center">
            <span>✓</span>
            <span>No anomalies detected</span>
          </div>
        )}

        {anomalies.map((a, i) => {
          const cfg = levelConfig[a.level] || levelConfig.warning;
          return (
            <div key={i} className={`
              rounded-lg p-3 border ${cfg.bg} ${cfg.border}
            `}>
              <div className="flex items-center gap-2 mb-1">
                <span>{cfg.icon}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cfg.badge}`}>
                  {codeLabels[a.code] || a.code}
                </span>
                <span className="text-gray-500 text-xs ml-auto">
                  {new Date(a.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className={`text-xs ${cfg.text} leading-relaxed`}>
                {a.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
