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

//Componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const legendSpacingPlugin = {
  id: "legendSpacing",
  beforeInit(chart) {
    const originalFit = chart.legend.fit;
    chart.legend.fit = function fit() {
      originalFit.bind(this)();
      this.height += 20;
    };
  },
};

const LineChart = ({ labels, dataMonto }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 12,
          font: {
            size: 20,
            weight: "bold",
          },
        },
      },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        offset: true,
      },
      y: {
        title: { display: true, text: "Monto Total (Q)" },
        beginAtZero: true,
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Monto Total",
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

  return (
    <Line
      data={chartData}
      options={options}
      plugins={[ChartDataLabels, legendSpacingPlugin]}
    />
  );
};

export default LineChart;
