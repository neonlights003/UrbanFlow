import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function OccupancyChart() {
  const [chartData, setChartData] = useState(null);
  const [peak, setPeak]           = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/analytics/peak-hours")
      .then((r) => r.json())
      .then((data) => {
        const hours  = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
        const counts = hours.map(h => {
          const found = data.find(d => d.hour === h);
          return found ? found.count : 0;
        });

        const maxVal = Math.max(...counts, 1);
        const peakHour = hours[counts.indexOf(maxVal)];
        setPeak({ hour: `${peakHour}:00`, count: maxVal });

        setChartData({
          labels: hours.map(h => `${h}h`),
          datasets: [{
            data: counts,
            // Amber gradient — brightest at peak
            backgroundColor: counts.map(c =>
              c === maxVal      ? "#d97706" :
              c > maxVal * 0.6  ? "#f59e0b" :
              c > maxVal * 0.3  ? "#92400e" :
                                  "#1c1008"
            ),
            borderRadius: 5,
            borderSkipped: false,
          }],
        });
      })
      .catch(() => {});
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a1a",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        titleColor: "#f5f0e8",
        bodyColor: "#9d9080",
        callbacks: {
          label: ctx => `  ${ctx.raw} entries`,
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#5c5248", font: { size: 9 }, maxTicksLimit: 12 },
        grid:  { color: "rgba(255,255,255,0.03)" },
        border: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "#5c5248", font: { size: 9 } },
        grid:  { color: "rgba(255,255,255,0.03)" },
        border: { color: "rgba(255,255,255,0.05)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="card" style={{ padding:"20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:"600", letterSpacing:"0.1em" }}>
          PEAK HOUR ANALYTICS
        </span>
        {peak && peak.count > 0 && (
          <span style={{
            fontSize:"10px", fontWeight:"600",
            padding:"2px 10px", borderRadius:"99px",
            background:"var(--amber-glow)",
            border:"1px solid rgba(217,119,6,0.25)",
            color:"var(--amber-light)"
          }}>
            Peak: {peak.hour} · {peak.count} entries
          </span>
        )}
      </div>

      <div style={{ height:"180px" }}>
        {chartData ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div style={{
            height:"100%", display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-muted)", fontSize:"12px"
          }}>
            Loading chart…
          </div>
        )}
      </div>

      <p style={{ fontSize:"10px", color:"var(--text-muted)", marginTop:"10px" }}>
        Vehicle entries per hour — today
      </p>
    </div>
  );
}
