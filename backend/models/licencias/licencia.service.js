const { Licencia } = require("./index");
const { Tasa } = require("../tasas");
const  sequelize  = require("../../config/sequelize");
const { setUsuarioId } = require("../../utils/historial");


const crearLicencia = async (licenciaData, id_usuario) => {
  try {
    //Esto envia el id_licencia
    const result = await sequelize.transaction(async (t) => {
      await setUsuarioId(sequelize, id_usuario, t);
      const nuevaLicencia = await Licencia.create(
        {
          //...licenciaData,
          boleta_pago: licenciaData.boleta_pago || null,
          id_licencia: licenciaData.id_licencia,
          fecha_emisionL: licenciaData.fecha_emisionL,
          fecha_vencimiento: licenciaData.fecha_vencimiento,
          estado: licenciaData.estado,
          rotulo: licenciaData.rotulo,
          TASAS_id_tasa: licenciaData.TASAS_id_tasa,
          LICENCIAS_id_licencia_ampliacion:
            licenciaData.LICENCIAS_id_licencia_ampliacion || null,
          LICENCIAS_fecha_emisionL_ampliacion:
            licenciaData.LICENCIAS_fecha_emisionL_ampliacion || null,
        },
        { transaction: t }
      );

      console.log("Nueva licencia creada:", nuevaLicencia);
      // Verificar si esta licencia es una ampliación (se enviaron los campos de referencia)
      if (
        licenciaData.LICENCIAS_id_licencia_original &&
        licenciaData.LICENCIAS_fecha_emisionL_original
      ) {
        // Actualizar la licencia original con los datos de ampliación

        console.log(
          "Actualizando licencia original con datos de ampliación:",
          nuevaLicencia.id_licencia,
          nuevaLicencia.fecha_emisionL
        );
        await Licencia.update(
          {
            LICENCIAS_id_licencia_ampliacion: nuevaLicencia.id_licencia,
            LICENCIAS_fecha_emisionL_ampliacion: nuevaLicencia.fecha_emisionL,
          },
          {
            where: {
              id_licencia: licenciaData.LICENCIAS_id_licencia_original,
              fecha_emisionL: new Date(
                licenciaData.LICENCIAS_fecha_emisionL_original
              ),
            },
            transaction: t,
          }
        );
        // **Actualizar la tasa para que tenga referencia a la licencia original**
        await Tasa.update(
          {
            LICENCIAS_id_licencia_original:
              licenciaData.LICENCIAS_id_licencia_original,
            LICENCIAS_fecha_emisionL_original:
              licenciaData.LICENCIAS_fecha_emisionL_original,
          },
          {
            where: { id_tasa: nuevaLicencia.TASAS_id_tasa },
            transaction: t,
          }
        );
      }

      //Consultar la licencia usando `TASAS_id_tasa` y `fecha_emisionL`
      const licenciaFinal = await Licencia.findOne({
        where: {
          TASAS_id_tasa: nuevaLicencia.TASAS_id_tasa,
          fecha_emisionL: nuevaLicencia.fecha_emisionL,
        },
        transaction: t,
      });

      if (!licenciaFinal) {
        throw new Error("No se pudo encontrar la licencia creada");
      }

      return licenciaFinal.get();
    });
    return result;
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
  try {
    const licencia = await Licencia.findOne({
      where: { TASAS_id_tasa: id_tasa },
      attributes: [
        "boleta_pago",
        "id_licencia",
        "fecha_emisionL",
        "fecha_vencimiento",
        "rotulo",
      ],
    });

    if (!licencia) return null;
    const { id_licencia, fecha_emisionL, ...resto } = licencia.get();

    // Construir el campo "registro_general"
    let registro_general = null;
    if (id_licencia && fecha_emisionL) {
      const idStr = id_licencia.toString().padStart(4, "0");

      const fecha = new Date(fecha_emisionL);
      if (!isNaN(fecha)) {
        const [year, month, day] = fecha.toISOString().split("T")[0].split("-");
        registro_general = `${idStr}${day}${month}${year}`;
      }
    }

    return {
      id_licencia,
      boleta_pago: resto.boleta_pago || "",
      fecha_emisionL,
      fecha_vencimiento: resto.fecha_vencimiento,
      rotulo: resto.rotulo,
      registro_general,
    };
  } catch (error) {
    console.error("Error en obtenerLicenciaPorTasa:", error);
    throw error;
  }
};

const actualizarRotulo = async (id_licencia, fecha_emisionL, nuevoRotulo, id_usuario) => {
  try {

    const result = await sequelize.transaction(async (t) => {
      // Establecer variable de sesión para trigger
      await setUsuarioId(sequelize, id_usuario, t);

    const [filasActualizadas] = await Licencia.update(
      { rotulo: nuevoRotulo },
      {
        where: {
          id_licencia,
          fecha_emisionL,
        },
        transaction: t,
      }
    );

    if (filasActualizadas === 0) {
      throw new Error("No se encontró la licencia para actualizar");
    }

    return { message: "Rótulo actualizado correctamente" };
  });
    return result;
  } catch (error) {
    console.error("Error al actualizar el rótulo:", error);
    throw error;
  }
};

module.exports = {
  crearLicencia,
  obtenerDatosTasaPorId,
  obtenerLicenciaPorTasa,
  actualizarRotulo,
};
