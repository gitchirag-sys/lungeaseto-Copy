import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const HistorySection = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const token = await window.localStorage.getItem('token');
        if (!token) throw new Error("No token found in localStorage");

        const response = await axios.get("/api/gethistory",
          {
            headers: {
            Authorization: `Bearer ${token}`,
            },
          }
        );


        console.log("🔁 History response:", response.data);

        const allData = response.data.history || [];
        const lastFive = allData.slice(-5).reverse(); // Show most recent first
        setHistory(lastFive);
      } catch (err) {
        console.error(" Failed to fetch history:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Loading history...</div>;
  }

  if (!user || history.length === 0) {
    return <div className="p-8 text-center">No history data available.</div>;
  }

  const tableHeaders = [
    'Prediction No',
    'Prediction Class',
    'Confidence(%)',
    'Baseline_FEV1_L',
    'Baseline_FVC_L',
    'Baseline_FEV1_FVC_Ratio',
  ];

  const barChartData = {
    labels: history.map((entry) => entry.predicted_class),
    datasets: [
      {
        label: 'Confidence (%)',
        data: history.map((entry) => entry.confidence),
        backgroundColor: ['#22c55e', '#facc15', '#ef4444', '#60a5fa', '#38bdf8'],
      },
    ],
  };

  const lineChartData = {
    labels: history.map((_, idx) => `Prediction ${idx + 1}`),
    datasets: [
      {
        label: 'FEV1 (L)',
        data: history.map((entry) => parseFloat(entry.Baseline_FEV1_L)),
        borderColor: '#60a5fa',
        backgroundColor: '#60a5fa',
        tension: 0.3,
      },
      {
        label: 'FVC (L)',
        data: history.map((entry) => parseFloat(entry.Baseline_FVC_L)),
        borderColor: '#38bdf8',
        backgroundColor: '#38bdf8',
        tension: 0.3,
      },
      {
        label: 'FEV1/FVC Ratio',
        data: history.map((entry) => parseFloat(entry.Baseline_FEV1_FVC_Ratio)),
        borderColor: '#f87171',
        backgroundColor: '#f87171',
        tension: 0.3,
      },
    ],
  };

  return (
    <section className="p-8 bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">Predictions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-center border-gray-300 mb-8">
          <thead className="bg-gray-100">
            <tr>
              {tableHeaders.map((header) => (
                <th key={header} className="px-4 py-2 border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((entry, idx) => (
              <tr key={idx} className="border">
                <td className="px-4 py-2 border">Prediction {idx + 1}</td>
                <td className="px-4 py-2 border">{entry.predicted_class}</td>
                <td className="px-4 py-2 border">{entry.confidence}</td>
                <td className="px-4 py-2 border">{entry.Baseline_FEV1_L}</td>
                <td className="px-4 py-2 border">{entry.Baseline_FVC_L}</td>
                <td className="px-4 py-2 border">{entry.Baseline_FEV1_FVC_Ratio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-center font-semibold mb-2">Prediction Class Confidence</h3>
          <Bar data={barChartData} options={{ responsive: true }} />
        </div>
        <div>
          <h3 className="text-center font-semibold mb-2">Baseline Feature Trends</h3>
          <Line data={lineChartData} options={{ responsive: true }} />
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
