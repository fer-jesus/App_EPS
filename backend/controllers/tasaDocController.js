const path = require("path");
const fs = require("fs-extra");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const {
  obtenerDatosParaDocumentoPDF,
} = require("../models/tasas/tasa.service");

const generarPDFTasa = async (req, res) => {
  try {
    const { id } = req.params;

    //Obtener los datos de la Tasa
    const datosTasa = await obtenerDatosParaDocumentoPDF(id);
    if (!datosTasa) {
      return res.status(404).json({ mensaje: "Tasa no encontrada" });
    }

    //Convertir la imagen a base64
    const imagePath = path.resolve(
      __dirname,
      "../templates/tasaDoc/fondo_tasa.png"
    );
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = "image/png";

    //Agregar como Data URI
    datosTasa.imagenFondo = `data:${mimeType};base64,${base64Image}`;

    //Leer y compilar la plantilla
    const templatePath = path.join(
      __dirname,
      "../templates/tasaDoc/templates.hbs"
    );

    const html = await fs.readFile(templatePath, "utf-8");

    handlebars.registerHelper("mayusculas", function (texto) {
      return texto?.toString().toUpperCase() || "";
    });

    handlebars.registerHelper("breaklines", function (texto) {
      if (!texto) return "";
      const escaped = handlebars.escapeExpression(texto);
      return new handlebars.SafeString(escaped.replace(/\n/g, "<br/>"));
    });

    const template = handlebars.compile(html);

    const content = template(datosTasa);

    //Crear el PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    //Cargar el contenido HTML en la página
    await page.setContent(content, {
      waitUntil: "networkidle0",
    });

    // Ruta de fondo relativo al HTML 
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();



    //Enviar el PDF como respuesta
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
