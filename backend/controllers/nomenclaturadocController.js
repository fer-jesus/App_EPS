const path = require("path");
const fs = require("fs-extra");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const {
  obtenerDatosParaNomenclaturaPDF,
} = require("../models/nomenclaturas/nomenclatura.service");
const { Nomenclatura } = require("../models/nomenclaturas");

const generarPDFNomenclatura = async (req, res) => {
  let browser;
  try {
    const { id } = req.params;

    //Obtener los datos de la Nomenclatura
    const datosNomenclatura = await obtenerDatosParaNomenclaturaPDF(id);
    if (!datosNomenclatura) {
      return res.status(404).json({ mensaje: "Nomenclatura no encontrada" });
    }

    //Fondo base
    const fondoPath = path.resolve(
      __dirname,
      "../templates/nomenclaturaDoc/fondo_nomen.png"
    );
    const fondoBuffer = await fs.readFile(fondoPath);
    datosNomenclatura.imagenFondo = `data:image/png;base64,${fondoBuffer.toString(
      "base64"
    )}`;

    //Overlay según tipo_nomenclatura
    const overlayMap = {
      IUSI: "IUSI.png",
      JALAPAGUA: "JALAPAGUA.png",
      "EMPRESA ELECTRICA": "Elec.png",
    };

    if (overlayMap[datosNomenclatura.tipo_nomenclatura]) {
      const overlayPath = path.resolve(
        __dirname,
        `../templates/nomenclaturaDoc/${
          overlayMap[datosNomenclatura.tipo_nomenclatura]
        }`
      );
      const overlayBuffer = await fs.readFile(overlayPath);
      datosNomenclatura.imagenOverlay = `data:image/png;base64,${overlayBuffer.toString(
        "base64"
      )}`;
    }

    //Leer y compilar la plantilla
    const templatePath = path.join(
      __dirname,
      "../templates/nomenclaturaDoc/template.hbs"
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

    const content = template(datosNomenclatura);

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

    //Ruta de fondo relativo al HTML (usando Data URI si deseas evitar rutas relativas)
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    //Guardar el PDF en la base de datos
    await Nomenclatura.update(
      {
        documento: pdfBuffer, //Sequelize maneja automáticamente el buffer
      },
      {
        where: { id_nomenclatura: id },
      }
    );
  
    //Enviar el PDF como respuesta
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=nomenclatura_${id}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ mensaje: "Error generando PDF de nomenclatura" });
  } finally {
    //Cerrar el navegador de manera segura
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  generarPDFNomenclatura,
};
