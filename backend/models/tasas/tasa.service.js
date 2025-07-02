const { Tasa, TasaTarifa, Propietario, Licencia } = require(".");
//const { TasaTarifa } = require("./tasaTarifa.model");

const crearTasa = async (tasaData, tarifasData) => {
  console.log("Creando tasa:", tasaData);
  try {
    const result = await Tasa.sequelize.transaction(async (t) => {
      //console.log("Insertando tarifa:", tarifa);
      const nuevaTasa = await Tasa.create(tasaData, { transaction: t });
      console.log("ID de nueva tasa:", nuevaTasa?.id_tasa);

      if (tarifasData && tarifasData.length > 0) {
        for (const tarifa of tarifasData) {
          console.log("Insertando tarifa:", tarifa);
          await TasaTarifa.create(
            {
              TASAS_id_tasa: nuevaTasa.id_tasa,
              dimension_construccion: tarifa.dimension_construccion,
              formula: tarifa.formula,
              valor: tarifa.valor,
              TARIFA_id_nombreTarifa: tarifa.TARIFA_id_nombreTarifa,
            },
            { transaction: t }
          );
        }
      }

      return nuevaTasa;
    });

    return result;
  } catch (error) {
    console.error("Error al crear tasa:", error);
    throw new Error("No se pudo crear la tasa");
  }
};

const obtenerRegistros = async () => {
  const tasas = await Tasa.findAll({
    include: [
      {
        model: Propietario,
        as: "propietario",
        attributes: ["nombre_propietario"],
      },
      {
        model: Licencia,
        as: "licencia",
        attributes: ["id_licencia", "fecha_emisionL"],
      },
    ],
    attributes: ["id_tasa"],
    order: [
      [{ model: Licencia, as: "licencia" }, "fecha_emisionL", "ASC"],
      ["id_tasa", "ASC"],
    ],
  });

  //Campo registro_general
  return tasas.map((tasa) => {
    const licencia = tasa.licencia;
    let registroGeneral = "En proceso";

    if (licencia?.id_licencia && licencia?.fecha_emisionL) {
      const id = String(licencia.id_licencia).padStart(4, "0");
      const fechaStr =
        licencia.fecha_emisionL instanceof Date
          ? licencia.fecha_emisionL.toISOString().split("T")[0]
          : licencia.fecha_emisionL;
      const [anio, mes, dia] = fechaStr.split("-");
      registroGeneral = `${id}${dia}${mes}${anio}`;
    }

    return {
      id: tasa.id_tasa,
      nombre_propietario: tasa.propietario?.nombre_propietario || "Desconocido",
      registro_general: registroGeneral,
    };
  });
};

module.exports = {
  crearTasa,
  obtenerRegistros,
};
