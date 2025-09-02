const path = require("path");
const fs = require("fs-extra");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const {
  obtenerDatosParaLicenciaPDF,
} = require("../models/licencias/licencia.service");

const generarPDFLicencia = async (req, res) => {
  try {
    const { id, fechaEmision } = req.params;

    const datosLicencia = await obtenerDatosParaLicenciaPDF(id, fechaEmision);

    const logoMuniPath = path.resolve(
      __dirname,
      "../templates/licenciaDoc/logoMuni.png"
    );
    const logoDOTPath = path.resolve(
      __dirname,
      "../templates/licenciaDoc/LogoDOT.png"
    );

    const logoMuniBase64 = (await fs.readFile(logoMuniPath)).toString("base64");
    const logoDOTBase64 = (await fs.readFile(logoDOTPath)).toString("base64");

    const mimeType = "image/png";
    datosLicencia.logoMuni = `data:${mimeType};base64,${logoMuniBase64}`;
    datosLicencia.logoDOT = `data:${mimeType};base64,${logoDOTBase64}`;

    //Leer y compilar la plantilla
    const templatePath = path.join(
      __dirname,
      "../templates/licenciaDoc/template.hbs"
    );
    const html = await fs.readFile(templatePath, "utf-8");

    handlebars.registerHelper(
      "mayusculas",
      (texto) => texto?.toString().toUpperCase() || ""
    );
    handlebars.registerHelper("formatUnidad", function (unidad) {
      if (!unidad) return "";

      return unidad.replace(/ Y /g, "\nY ");
    });

    const template = handlebars.compile(html);
    const content = template(datosLicencia);

    //Crear el PDF con Puppeteer (tamaño legal)
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(content, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });


    

    await browser.close();

    //Enviar PDF como respuesta
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=licencia_${id}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generando PDF de licencia:", error);
    res.status(500).json({ mensaje: "Error generando PDF de licencia" });
  }
};

module.exports = { generarPDFLicencia };
