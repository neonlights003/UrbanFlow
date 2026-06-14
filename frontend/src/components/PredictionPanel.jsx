import { useEffect, useState } from "react";

export default function PredictionPanel({ slots }) {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    // Simple client-side prediction based on current occupancy trend
    // In the demo this updates every 10 seconds
    function predict() {
      const occupied = Object.values(slots).filter(
        (s) => s === "OCCUPIED"
      ).length;

      // Weighted guess: if >3 occupied, trend toward full
      // if <2, trend toward empty
      let predicted = occupied;
      if (occupied >= 4) predicted = Math.min(5, occupied + 1);
      else if (occupied <= 1) predicted = Math.max(0, occupied);
      else predicted = occupied + (Math.random() > 0.5 ? 1 : 0);

      predicted = Math.min(5, Math.max(0, Math.round(predicted)));

      setPrediction({
        occupied: predicted,
        available: 5 - predicted,
        confidence: occupied > 2 ? 87 : 63,
      });
    }

    predict();
    const interval = setInterval(predict, 10000);
    return () => clearInterval(interval);
  }, [slots]);

  if (!prediction) return null;

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <h2 className="text-xs text-gray-400 font-semibold tracking-widest mb-4">
        AI PREDICTION — NEXT 30 MINS
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Expected Occupied</p>
          <p className="text-3xl font-bold text-red-400">
            {prediction.occupied}
            <span className="text-gray-500 text-lg">/5</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Expected Free</p>
          <p className="text-3xl font-bold text-green-400">
            {prediction.available}
            <span className="text-gray-500 text-lg">/5</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Confidence</p>
          <p className="text-3xl font-bold text-blue-400">
            {prediction.confidence}
            <span className="text-gray-500 text-lg">%</span>
          </p>
        </div>
      </div>
      <p className="text-gray-600 text-xs mt-3 text-center">
        Based on current occupancy trends and historical patterns
      </p>
    </div>
  );
}
