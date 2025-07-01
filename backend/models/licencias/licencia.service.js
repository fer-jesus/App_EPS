const { Licencia } = require("./index");
const { Tasa } = require("../tasas");

const crearLicencia = async (licenciaData) => {
  try {
    //Esto envia el id_licencia
    //const { id_licencia, ...camposLicencia } = licenciaData;

    const nuevaLicencia = await Licencia.create({
      ...licenciaData,
    });

    //Consultar la licencia usando `TASAS_id_tasa` y `fecha_emisionL`
    const licenciaFinal = await Licencia.findOne({
      where: {
        TASAS_id_tasa: nuevaLicencia.TASAS_id_tasa,
        fecha_emisionL: nuevaLicencia.fecha_emisionL,
      },
    });

    if (!licenciaFinal) {
      throw new Error("No se pudo encontrar la licencia creada");
    }

    return licenciaFinal.get();
  } catch (error) {
    console.error("Error al crear licencia:", error);
    throw new Error("No se pudo crear la licencia.");
  }
};

const obtenerDatosTasaPorId = async (id_tasa) => {
  const tasa = await Tasa.findByPk(id_tasa, {
    include: [
      {
        association: "propietario",
        attributes: ["nombre_propietario"],
      },
      {
        association: "detalles_tarifas",
        attributes: ["dimension_construccion"],

        include: [
          {
            association: "tarifa",
            attributes: ["nombre_tarifa"],
          },
        ],
      },
    ],
  });

  if (!tasa) throw new Error("Tasa no encontrada");

  //Concatenación de las áreas de construcción si hay mas de una
  const areaConstruccion =
    tasa.detalles_tarifas
      ?.map((item) => parseFloat(item.dimension_construccion || 0))
      .join("/ ") || "0";

  // Obtener nombres de tarifas
  const tiposConstruccion =
    tasa.detalles_tarifas
      ?.map((item) => item.tarifa?.nombre_tarifa)
      .filter(Boolean)
      .join("/ ") || "No definido";

  return {
    solicitante: tasa.propietario?.nombre_propietario || "No definido",
    direccionConstruccion: tasa.direccion_propiedad,
    tiposConstruccion,
    cantidad: `Q. ${Number(tasa.cantidad_cancelar).toLocaleString("es-GT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    presupuestoObra: `Q. ${Number(tasa.presupuesto_obra).toLocaleString(
      "es-GT",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`,
    areaConstruccion,
  };
};

const obtenerLicenciaPorTasa = async (id_tasa) => {
  const licencia = await Licencia.findOne({
    where: { TASAS_id_tasa: id_tasa },
    attributes: [
      "id_licencia",
      "fecha_emisionL",
      "fecha_vencimiento",
      "rotulo",
    ],
  });

  if (!licencia) return null;

  return licencia.get();
};

module.exports = {
  crearLicencia,
  obtenerDatosTasaPorId,
  obtenerLicenciaPorTasa,
};
