import { useState, useEffect } from "react";

export default function RfidManager({ isOpen, onClose }) {
  const [tags,    setTags]    = useState([]);
  const [uid,     setUid]     = useState("");
  const [label,   setLabel]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchTags = () => {
    fetch("http://localhost:8000/api/tags").then(r=>r.json()).then(setTags).catch(()=>{});
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
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ uid:uid.trim(), label:label.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setUid(""); setLabel(""); fetchTags();
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:300,
      background:"rgba(0,0,0,0.75)",
      backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
      display:"flex", alignItems:"center", justifyContent:"center"
    }}>
      <div style={{
        background:"rgba(10,10,12,0.9)",
        border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:"24px", padding:"32px",
        width:"100%", maxWidth:"560px",
        boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
        backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
        position:"relative", overflow:"hidden"
      }}>
        {/* Top shimmer */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, height:"1px",
          background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.4),transparent)"
        }} />
        {/* Ambient orb */}
        <div style={{
          position:"absolute", top:"-60px", right:"-40px",
          width:"200px", height:"200px", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 70%)",
          pointerEvents:"none"
        }} />

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{
              width:"40px", height:"40px", borderRadius:"14px",
              background:"rgba(245,158,11,0.1)",
              border:"1px solid rgba(245,158,11,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"18px", boxShadow:"0 0 20px rgba(245,158,11,0.1)"
            }}>💳</div>
            <div>
              <h2 style={{ fontSize:"17px", fontWeight:"800", color:"rgba(255,255,255,0.9)", letterSpacing:"-0.02em" }}>
                RFID Management
              </h2>
              <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"2px" }}>
                Manage authorised vehicle cards
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,255,255,0.08)",
            color:"rgba(255,255,255,0.5)",
            width:"32px", height:"32px", borderRadius:"10px",
            cursor:"pointer", fontSize:"14px", display:"flex",
            alignItems:"center", justifyContent:"center", flexShrink:0
          }}>✕</button>
        </div>

        {/* Form */}
        <div style={{
          background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:"16px", padding:"18px", marginBottom:"20px"
        }}>
          <p style={{ fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", color:"rgba(255,255,255,0.25)", marginBottom:"14px" }}>
            REGISTER NEW CARD
          </p>
          <form onSubmit={handleSubmit} style={{ display:"flex", gap:"10px" }}>
            <input className="input-field" placeholder="UID (e.g. 6ac1b7)" value={uid}
              onChange={e=>setUid(e.target.value)} disabled={loading} />
            <input className="input-field" placeholder="Label (e.g. Toyota)" value={label}
              onChange={e=>setLabel(e.target.value)} disabled={loading} />
            <button type="submit" className="btn-amber"
              disabled={loading||!uid.trim()||!label.trim()}
              style={{
                padding:"10px 18px", borderRadius:"12px",
                fontSize:"12px", whiteSpace:"nowrap",
                opacity:(loading||!uid.trim()||!label.trim())?0.4:1
              }}>
              {loading ? "…" : "Add"}
            </button>
          </form>
          {error && <p style={{ fontSize:"11px", color:"#f87171", marginTop:"8px" }}>{error}</p>}
        </div>

        {/* Tags */}
        <p style={{ fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", color:"rgba(255,255,255,0.25)", marginBottom:"10px" }}>
          REGISTERED CARDS
        </p>
        <div style={{
          borderRadius:"14px", overflow:"hidden",
          border:"1px solid rgba(255,255,255,0.06)"
        }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["UID","Label","Added"].map(h => (
                  <th key={h} style={{
                    padding:"10px 14px",
                    textAlign:h==="Added"?"right":"left",
                    fontSize:"10px", color:"rgba(255,255,255,0.25)",
                    fontWeight:"700", letterSpacing:"0.08em"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tags.length === 0 ? (
                <tr><td colSpan="3" style={{ padding:"28px", textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:"12px" }}>
                  No cards registered
                </td></tr>
              ) : tags.map(tag => (
                <tr key={tag.uid} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"11px 14px", fontFamily:"monospace", fontSize:"12px", color:"#f59e0b" }}>
                    {tag.uid}
                  </td>
                  <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.8)", fontWeight:"500" }}>
                    {tag.label}
                  </td>
                  <td style={{ padding:"11px 14px", color:"rgba(255,255,255,0.25)", fontSize:"11px", textAlign:"right" }}>
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
