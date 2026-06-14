export default function SlotGrid({ slots }) {
  const slotIds = ["A1", "A2", "A3", "A4", "A5"];

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <h2 className="text-xs text-gray-400 font-semibold tracking-widest mb-4">
        PARKING SLOTS
      </h2>
      <div className="grid grid-cols-5 gap-3">
        {slotIds.map((id) => {
          const occupied = slots[id] === "OCCUPIED";
          return (
            <div
              key={id}
              className={`slot-card rounded-xl p-4 text-center border-2 ${
                occupied
                  ? "bg-red-950 border-red-500"
                  : "bg-green-950 border-green-500"
              }`}
            >
              <div className="text-xl mb-1">{occupied ? "🚗" : "✓"}</div>
              <div className={`text-lg font-bold ${
                occupied ? "text-red-300" : "text-green-300"
              }`}>
                {id}
              </div>
              <div className={`text-xs mt-1 ${
                occupied ? "text-red-400" : "text-green-400"
              }`}>
                {occupied ? "Occupied" : "Free"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
