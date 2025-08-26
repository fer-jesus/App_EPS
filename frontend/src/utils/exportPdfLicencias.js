import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportChartsToPDFLicencias = async (lineChartId, barChartId) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yOffset = 10; // margen superior inicial

  const logo = new Image();
  logo.src = "/DOT.png";
  await new Promise((resolve) => {
    logo.onload = resolve;
  });
  pdf.addImage(logo, "PNG", 10, 8, 30, 25);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Reporte de Licencias de Construccion", pageWidth / 2, 20, {
    align: "center",
  });
  yOffset = 45;

  // Capturar LineChart
  const lineChart = document.getElementById(lineChartId);
  if (lineChart) {
    const canvasLine = await html2canvas(lineChart, { scale: 2 });
    const imgDataLine = canvasLine.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgDataLine);
    const pdfWidth = pageWidth - 20; // margen 10mm
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgDataLine, "PNG", 10, yOffset, pdfWidth, pdfHeight);
    yOffset += pdfHeight + 50; // espacio entre gráficas
  }

  // Capturar BarChart
  const barChart = document.getElementById(barChartId);
  if (barChart) {
    const canvasBar = await html2canvas(barChart, { scale: 2 });
    const imgDataBar = canvasBar.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgDataBar);
    const pdfWidth = pageWidth - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (yOffset + pdfHeight > pdf.internal.pageSize.getHeight() - 10) {
      pdf.addPage();
      yOffset = 10;
    }

    pdf.addImage(imgDataBar, "PNG", 10, yOffset, pdfWidth, pdfHeight);
  }

  // Generar Blob y abrir en nueva pestaña
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
};
