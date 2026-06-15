import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function OccupancyChart() {
  const [chartData, setChartData] = useState(null);
  const [peak, setPeak] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/analytics/peak-hours")
      .then(r => r.json())
      .then(data => {
        const hours  = Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
        const counts = hours.map(h => {
          const f = data.find(d => d.hour===h);
          return f ? f.count : 0;
        });
        const maxVal  = Math.max(...counts, 1);
        const peakIdx = counts.indexOf(maxVal);
        setPeak({ hour:`${hours[peakIdx]}:00`, count:maxVal });

        setChartData({
          labels: hours.map(h=>`${h}h`),
          datasets:[{
            data: counts,
            backgroundColor: counts.map(c =>
              c===maxVal       ? "rgba(245,158,11,0.85)" :
              c>maxVal*0.6     ? "rgba(245,158,11,0.45)" :
              c>maxVal*0.25    ? "rgba(245,158,11,0.22)" :
                                 "rgba(255,255,255,0.05)"
            ),
            borderRadius: 5,
            borderSkipped: false,
          }],
        });
      }).catch(()=>{});
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display:false },
      tooltip: {
        backgroundColor:"rgba(10,10,12,0.95)",
        borderColor:"rgba(255,255,255,0.08)",
        borderWidth:1,
        titleColor:"rgba(255,255,255,0.9)",
        bodyColor:"rgba(255,255,255,0.45)",
        padding:10,
        callbacks: { label: ctx=>`  ${ctx.raw} entries` }
      }
    },
    scales: {
      x: {
        ticks:  { color:"rgba(255,255,255,0.2)", font:{size:9}, maxTicksLimit:12 },
        grid:   { color:"rgba(255,255,255,0.03)" },
        border: { color:"rgba(255,255,255,0.05)" },
      },
      y: {
        ticks:  { color:"rgba(255,255,255,0.2)", font:{size:9} },
        grid:   { color:"rgba(255,255,255,0.03)" },
        border: { color:"rgba(255,255,255,0.05)" },
        beginAtZero: true,
      }
    }
  };

  return (
    <div className="glass" style={{ padding:"20px 22px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <p className="label">PEAK HOUR ANALYTICS</p>
        {peak && peak.count > 0 && (
          <span style={{
            fontSize:"10px", fontWeight:"700",
            padding:"2px 10px", borderRadius:"99px",
            background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)",
            color:"var(--amber)"
          }}>Peak {peak.hour} · {peak.count} entries</span>
        )}
      </div>
      <div style={{ height:"160px" }}>
        {chartData
          ? <Bar data={chartData} options={options} />
          : <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center",
              color:"rgba(255,255,255,0.15)", fontSize:"12px" }}>Loading…</div>
        }
      </div>
      <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", marginTop:"10px" }}>
        Vehicle entries per hour — today
      </p>
    </div>
  );
}
