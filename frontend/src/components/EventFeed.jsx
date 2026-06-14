export default function EventFeed({ events }) {
  const iconMap = {
    SLOT: "🅿️",
    GATE: "🚧",
    RFID: "📡",
  };

  const colorMap = {
    GRANTED: "text-green-400",
    DENIED: "text-red-400",
    OCCUPIED: "text-red-300",
    FREE: "text-green-300",
    OPENED: "text-green-300",
    CLOSED: "text-yellow-300",
  };

  function getColor(event) {
    for (const [key, cls] of Object.entries(colorMap)) {
      if (event.text.includes(key)) return cls;
    }
    return "text-gray-300";
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 h-full">
      <h2 className="text-xs text-gray-400 font-semibold tracking-widest mb-4">
        LIVE EVENT FEED
      </h2>
      <div className="space-y-2 overflow-y-auto event-scroll max-h-72">
        {events.length === 0 && (
          <p className="text-gray-600 text-sm">Waiting for events...</p>
        )}
        {events.map((e, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-sm py-1 border-b border-gray-800"
          >
            <span className="text-lg leading-none mt-0.5">
              {iconMap[e.type] || "•"}
            </span>
            <div className="flex-1 min-w-0">
              <span className={`font-medium ${getColor(e)}`}>{e.text}</span>
              <span className="text-gray-600 text-xs ml-2">{e.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
