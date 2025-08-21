import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ labels, dataMonto }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        title: { display: true, text: "Monto total (Q)" },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Monto total",
        data: dataMonto,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        fill: true,
        tension: 0.3,
        datalabels: {
          anchor: "end",
          align: "top",
          color: "#000",
          font: { weight: "bold", size: 14 },
          formatter: (value) => `Q${value.toLocaleString()}`,
        },
      },
    ],
  };

  return <Line data={chartData} options={options} plugins={[ChartDataLabels]}/>;
};

export default LineChart;
