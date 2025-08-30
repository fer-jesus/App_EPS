const path = require("path");
const fs = require("fs-extra");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const {
  obtenerDatosParaDocumentoPDF,
} = require("../models/tasas/tasa.service");
const { Tasa } = require("../models/tasas");
const { setUsuarioId } = require("../utils/historial");

const generarPDFTasa = async (req, res) => {
  let browser;
  const t = await Tasa.sequelize.transaction();
  try {
    const { id } = req.params;
    const id_usuario = req.user?.id_usuario || req.body.id_usuario;
    if (!id_usuario) {
      return res
        .status(400)
        .json({ mensaje: "Falta id_usuario en la solicitud" });
    }

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
    browser = await puppeteer.launch({
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

    await setUsuarioId(Tasa.sequelize, id_usuario, t);

    //Guardar el PDF en la base de datos
    await Tasa.update(
      {
        documento: pdfBuffer, // Sequelize maneja automáticamente el buffer
      },
      {
        where: { id_tasa: id },  
        transaction: t
      }
    );
     await t.commit();

    console.log(`PDF guardado en la base de datos para la tasa ID: ${id}`);

    //Enviar el PDF como respuesta
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=tasa_${id}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ mensaje: "Error generando PDF de tasa" });
  } finally {
    // Cerrar el navegador de manera segura
    if (browser) {
      await browser.close();
    }
  }
};

// const obtenerPDFTasa = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const tasa = await Tasa.findByPk(id, {
//       attributes: ["documento"], // solo traemos el BLOB
//     });

//     if (!tasa || !tasa.documento) {
//       return res.status(404).json({ mensaje: "PDF no encontrado" });
//     }

//     const pdfBuffer = tasa.documento; // Sequelize ya devuelve un Buffer

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `inline; filename=tasa_${id}.pdf`,
//     });

//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error("Error al obtener PDF:", error);
//     res.status(500).json({ mensaje: "Error al obtener PDF de tasa" });
//   }
// };


module.exports = {
  generarPDFTasa,
  //obtenerPDFTasa,
};
