import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportChartsToPDFNomenclaturas = async (chartIds = []) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yOffset = 10;

  const logo = new Image();
  logo.src = "/DOT.png"; 
  await new Promise((resolve) => {
    logo.onload = resolve;
  });
  pdf.addImage(logo, "PNG", 10, 8, 30, 22); 
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Reportes de Nomenclaturas", pageWidth / 2, 20, {
    align: "center",
  });
  yOffset = 45;

  for (let i = 0; i < chartIds.length; i++) {
    const chart = document.getElementById(chartIds[i]);
    if (chart) {
      const canvas = await html2canvas(chart, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Agregar nueva página si se sale del margen
      if (yOffset + pdfHeight > pdf.internal.pageSize.getHeight() - 10) {
        pdf.addPage();
        yOffset = 10;
      }

      pdf.addImage(imgData, "PNG", 10, yOffset, pdfWidth, pdfHeight);
      yOffset += pdfHeight + 10;
    }
  }
  
  const now = new Date();
  const fechaHora = now.toLocaleString("es-GT", {
    dateStyle: "short",
    timeStyle: "short",
  });

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Generado: ${fechaHora}`, pageWidth - 10, pageHeight - 10, {
    align: "right",
  });

  // Abrir en nueva pestaña
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
};
