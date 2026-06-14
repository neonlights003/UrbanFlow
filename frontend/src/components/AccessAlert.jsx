import { useEffect, useState } from "react";

export default function AccessAlert({ alert, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [alert]);

  if (!alert) return null;

  const granted = alert.type === "GRANTED";

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-50
      transform transition-all duration-500 ease-out
      ${visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
    `}>
      <div className={`
        w-full px-6 py-4 flex items-center justify-between
        ${granted
          ? "bg-green-500 text-white"
          : "bg-red-500 text-white"
        }
      `}>
        {/* Left: icon + message */}
        <div className="flex items-center gap-4">
          <span className="text-4xl">
            {granted ? "✅" : "🚫"}
          </span>
          <div>
            <p className="text-xl font-bold tracking-wide">
              {granted ? "ACCESS GRANTED" : "ACCESS DENIED"}
            </p>
            <p className="text-sm opacity-90">
              {granted
                ? `Vehicle "${alert.label}" authenticated — gate opening`
                : `Unregistered card ${alert.uid.slice(0,8)}... — entry blocked`
              }
            </p>
          </div>
        </div>

        {/* Right: auto-dismiss bar + close */}
        <div className="flex items-center gap-4">
          <div className="w-32 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                animation: "shrink 4s linear forwards"
              }}
            />
          </div>
          <button
            onClick={onDismiss}
            className="text-white/70 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
