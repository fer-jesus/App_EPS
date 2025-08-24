import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

//Componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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

const BarChart = ({ labels, dataCantidad, label = "Cantidad" }) => {
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
      title: { display: false },
    },
    scales: {
      y: {
        title: { display: true, text: label },
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data: dataCantidad,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        datalabels: {
          anchor: "center",
          align: "center",
          color: "#000",
          font: { weight: "bold", size: 14 },
        },
      },
    ],
  };

  return (
    <Bar
      data={chartData}
      options={options}
      plugins={[ChartDataLabels, legendSpacingPlugin]}
    />
  );
};

export default BarChart;
