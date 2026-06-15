import { useState, useEffect } from "react";

export default function RfidManager({ isOpen, onClose }) {
  const [tags, setTags]     = useState([]);
  const [uid, setUid]       = useState("");
  const [label, setLabel]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const fetchTags = () => {
    fetch("http://localhost:8000/api/tags")
      .then((r) => r.json())
      .then(setTags)
      .catch(() => {});
  };

  useEffect(() => {
    if (isOpen) { fetchTags(); setUid(""); setLabel(""); setError(null); }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid.trim() || !label.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uid.trim(), label: label.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setUid(""); setLabel(""); fetchTags();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center"
    }}>
      <div style={{
        background:"var(--bg-surface)", border:"1px solid var(--border-strong)",
        borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"580px",
        boxShadow:"0 24px 64px rgba(0,0,0,0.6)"
      }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
              width:"34px", height:"34px", borderRadius:"10px",
              background:"var(--amber-glow)", border:"1px solid rgba(217,119,6,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px"
            }}>💳</div>
            <div>
              <h2 style={{ fontSize:"16px", fontWeight:"700", color:"var(--text-primary)", letterSpacing:"-0.01em" }}>
                RFID Management
              </h2>
              <p style={{ fontSize:"11px", color:"var(--text-muted)" }}>Manage authorised vehicle cards</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"var(--bg-elevated)", border:"1px solid var(--border)",
            color:"var(--text-secondary)", width:"30px", height:"30px",
            borderRadius:"8px", cursor:"pointer", fontSize:"14px"
          }}>✕</button>
        </div>

        {/* Add form */}
        <form onSubmit={handleSubmit} style={{
          background:"var(--bg-elevated)", borderRadius:"14px",
          padding:"16px", marginBottom:"20px",
          border:"1px solid var(--border)"
        }}>
          <p style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em", marginBottom:"12px" }}>
            REGISTER NEW CARD
          </p>
          <div style={{ display:"flex", gap:"10px" }}>
            <input
              className="input-field"
              placeholder="UID (e.g. 6ac1b7)"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              disabled={loading}
            />
            <input
              className="input-field"
              placeholder="Label (e.g. Toyota Camry)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !uid.trim() || !label.trim()}
              className="btn-amber"
              style={{
                padding:"10px 18px", borderRadius:"10px",
                fontSize:"12px", fontWeight:"600", cursor:"pointer",
                whiteSpace:"nowrap",
                opacity: (loading || !uid.trim() || !label.trim()) ? 0.5 : 1
              }}
            >
              {loading ? "Adding…" : "Add Tag"}
            </button>
          </div>
          {error && <p style={{ fontSize:"11px", color:"#f87171", marginTop:"8px" }}>{error}</p>}
        </form>

        {/* Tags table */}
        <p style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em", marginBottom:"10px" }}>
          REGISTERED CARDS
        </p>
        <div style={{ borderRadius:"12px", overflow:"hidden", border:"1px solid var(--border)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ background:"var(--bg-elevated)", borderBottom:"1px solid var(--border)" }}>
                {["UID","Label","Added"].map(h => (
                  <th key={h} style={{
                    padding:"10px 14px", textAlign: h === "Added" ? "right" : "left",
                    fontSize:"10px", color:"var(--text-muted)", fontWeight:"600",
                    letterSpacing:"0.08em"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tags.length === 0 ? (
                <tr><td colSpan="3" style={{ padding:"28px", textAlign:"center", color:"var(--text-muted)", fontSize:"12px" }}>
                  No cards registered yet
                </td></tr>
              ) : tags.map((tag) => (
                <tr key={tag.uid} style={{ borderTop:"1px solid var(--border)" }}>
                  <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:"12px", color:"#f59e0b" }}>
                    {tag.uid}
                  </td>
                  <td style={{ padding:"10px 14px", color:"var(--text-primary)", fontWeight:"500" }}>
                    {tag.label}
                  </td>
                  <td style={{ padding:"10px 14px", color:"var(--text-muted)", fontSize:"11px", textAlign:"right" }}>
                    {tag.created_at ? new Date(tag.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
