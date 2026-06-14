import { useRef } from "react";

// Returns a function that returns true if this event is a duplicate
// within the given time window (ms)
export function useDedupe(windowMs = 500) {
  const recent = useRef([]);

  return function isDuplicate(key) {
    const now = Date.now();
    // Clean old entries
    recent.current = recent.current.filter((e) => now - e.time < windowMs);
    // Check if key exists
    if (recent.current.find((e) => e.key === key)) return true;
    // Add new entry
    recent.current.push({ key, time: now });
    return false;
  };
}
