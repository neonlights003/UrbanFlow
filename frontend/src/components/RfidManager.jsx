import { useState, useEffect } from "react";

export default function RfidManager({ isOpen, onClose }) {
  const [tags, setTags] = useState([]);
  const [uid, setUid] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tags
  const fetchTags = () => {
    fetch("http://localhost:8000/api/tags")
      .then((res) => res.json())
      .then(setTags)
      .catch((err) => console.error("Failed to fetch tags:", err));
  };

  useEffect(() => {
    if (isOpen) {
      fetchTags();
      setUid("");
      setLabel("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid.trim() || !label.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uid.trim(), label: label.trim() }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register tag");
      }
      
      // Success
      setUid("");
      setLabel("");
      fetchTags();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">💳</span> RFID Management
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Add New Tag Form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">REGISTER NEW CARD</h3>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="UID (e.g. deadbeef)"
              className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Vehicle Label (e.g. Delivery Van)"
              className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !uid.trim() || !label.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
            >
              {loading ? "Adding..." : "Add Tag"}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </form>

        {/* Registered Tags List */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">REGISTERED CARDS</h3>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/50 text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">UID</th>
                  <th className="px-4 py-3 font-medium">Label</th>
                  <th className="px-4 py-3 font-medium text-right">Added At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {tags.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      No tags registered yet.
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.uid} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-300">{tag.uid}</td>
                      <td className="px-4 py-3 font-medium text-gray-200">{tag.label}</td>
                      <td className="px-4 py-3 text-gray-500 text-right">
                        {new Date(tag.created_at).toLocaleDateString()} {new Date(tag.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}





