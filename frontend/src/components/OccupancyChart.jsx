import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function OccupancyChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/analytics/peak-hours")
      .then((r) => r.json())
      .then((data) => {
        // Fill all 24 hours, default 0
        const hours = Array.from({ length: 24 }, (_, i) =>
          String(i).padStart(2, "0")
        );
        const counts = hours.map((h) => {
          const found = data.find((d) => d.hour === h);
          return found ? found.count : 0;
        });

        setChartData({
          labels: hours.map((h) => `${h}:00`),
          datasets: [
            {
              label: "Entries",
              data: counts,
              backgroundColor: counts.map((c) =>
                c > 5 ? "#ef4444" : c > 2 ? "#eab308" : "#22c55e"
              ),
              borderRadius: 4,
            },
          ],
        });
      })
      .catch((e) => console.error("[Chart] Failed to load:", e));
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Entries by Hour (Today)",
        color: "#9ca3af",
        font: { size: 12 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", font: { size: 10 } },
        grid: { color: "#1f2937" },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { color: "#1f2937" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <h2 className="text-xs text-gray-400 font-semibold tracking-widest mb-4">
        PEAK HOUR ANALYTICS
      </h2>
      {chartData ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p className="text-gray-600 text-sm">Loading chart...</p>
      )}
    </div>
  );
}
