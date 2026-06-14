export default function StatsRow({ slots, gateStatus }) {
  const total = 5;
  const occupied = Object.values(slots).filter((s) => s === "OCCUPIED").length;
  const available = total - occupied;
  const occupancyPct = Math.round((occupied / total) * 100);

  const stats = [
    { label: "Total Capacity", value: total, color: "text-white" },
    { label: "Occupied", value: occupied, color: "text-red-400" },
    { label: "Available", value: available, color: "text-green-400" },
    {
      label: "Gate Status",
      value: gateStatus,
      color: gateStatus === "OPENED" ? "text-green-400" : "text-yellow-400",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-gray-900 rounded-2xl p-4 border border-gray-800"
        >
          <p className="text-gray-400 text-xs tracking-wider">{s.label}</p>
          <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
        </div>
      ))}

      {/* Occupancy bar — spans full width */}
      <div className="col-span-4 bg-gray-900 rounded-2xl p-4 border border-gray-800">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Occupancy</span>
          <span>{occupancyPct}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              occupancyPct > 80
                ? "bg-red-500"
                : occupancyPct > 50
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${occupancyPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
