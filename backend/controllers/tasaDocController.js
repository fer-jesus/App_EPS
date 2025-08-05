const path = require("path");
const fs = require("fs-extra");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const { obtenerTasaPorId } = require("../models/tasas/tasa.service");
datosTasa.imagenFondo = path.resolve(__dirname, "../templates/tasaDoc/fondo_tasa.png");

const generarPDFTasa = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Obtener los datos de la Tasa
    const datosTasa = await obtenerTasaPorId(id);
    if (!datosTasa) {
      return res.status(404).json({ mensaje: "Tasa no encontrada" });
    }

    // 2. Leer y compilar la plantilla
    const templatePath = path.join(__dirname, "../templates/tasaDoc/template.hbs");
    const html = await fs.readFile(templatePath, "utf-8");
    const template = handlebars.compile(html);
    const content = template(datosTasa);

    // 3. Crear el PDF con Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // 4. Cargar el contenido HTML en la página
    await page.setContent(content, {
      waitUntil: "networkidle0",
    });

    // 5. Ruta de fondo relativo al HTML (usando Data URI si deseas evitar rutas relativas)
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // 6. Enviar el PDF como respuesta
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=tasa_${id}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ mensaje: "Error generando PDF de tasa" });
  }
};

module.exports = {
  generarPDFTasa,
};
