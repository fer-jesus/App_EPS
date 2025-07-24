const {
  Tasa,
  TasaTarifa,
  Propietario,
  Licencia,
  TasaTarifaVariosNiveles,
} = require(".");

const crearTasa = async (tasaData, tarifasData) => {
  console.log("Creando tasa:", tasaData);
  try {
    const result = await Tasa.sequelize.transaction(async (t) => {
      //console.log("Insertando tarifa:", tarifa);
      const nuevaTasa = await Tasa.create(tasaData, { transaction: t });
      const idTasa = nuevaTasa.id_tasa;
      console.log("ID de nueva tasa:", nuevaTasa?.id_tasa);

      if (tarifasData && tarifasData.length > 0) {
        for (let i = 0; i < tarifasData.length; i++) {
          const tarifa = tarifasData[i];
          const correlativo = i + 1; // empieza en 1

          console.log("Insertando tarifa:", tarifa);

          await TasaTarifa.create(
            {
              tarifa_correlativo: correlativo,
              TASAS_id_tasa: nuevaTasa.id_tasa,
              TARIFA_id_nombreTarifa: tarifa.TARIFA_id_nombreTarifa,
              dimension_construccion: tarifa.dimension_construccion,
              formula: tarifa.formula,
              valor: tarifa.valor,
            },
            { transaction: t }
          );

          // Insertar niveles adicionales si existen
          if (Array.isArray(tarifa.niveles) && tarifa.niveles.length > 0) {
            for (const nivel of tarifa.niveles) {
              await TasaTarifaVariosNiveles.create(
                {
                  TASAS_TARIFA_TASAS_id_tasa: idTasa,
                  TASAS_TARIFA_tarifa_correlativo: correlativo,
                  TASAS_TARIFA_TARIFA_id_nombreTarifa:
                    tarifa.TARIFA_id_nombreTarifa,
                  nivel: nivel.nivel,
                  dimension_construccion: nivel.dimension_construccion || null,
                  formula: nivel.formula,
                  valor: nivel.valor,
                },
                { transaction: t }
              );
            }
          }
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
    attributes: [
      "id_tasa",
      "LICENCIAS_id_licencia_original",
      "LICENCIAS_fecha_emisionL_original",
      "latitud",
      "longitud",
      "direccion_propiedad",
    ],
  });

  // Identificar licencias que ya fueron ampliadas
  const licenciasAmpliadas = new Set(
    tasas
      .filter(
        (t) =>
          t.LICENCIAS_id_licencia_original &&
          t.LICENCIAS_fecha_emisionL_original
      )
      .map((t) => {
        const id = String(t.LICENCIAS_id_licencia_original).padStart(4, "0");
        let fechaStr = "";

        const fecha = t.LICENCIAS_fecha_emisionL_original;

        if (fecha instanceof Date) {
          fechaStr = fecha.toISOString().split("T")[0];
        } else if (typeof fecha === "string") {
          fechaStr = fecha;
        } else {
          return null; // se descarta si no es válido
        }

        const [anio, mes, dia] = fechaStr.split("-");
        return `${id}${dia}${mes}${anio}`;
      })
      .filter(Boolean)
  );

  //Campo registro_general
  const datos = tasas.map((tasa) => {
    const licencia = tasa.licencia;
    let registroGeneral = "En proceso";

    if (licencia?.id_licencia && licencia?.fecha_emisionL) {
      const id = String(licencia.id_licencia).padStart(4, "0");

      let fechaStr = "";
      if (licencia.fecha_emisionL instanceof Date) {
        fechaStr = licencia.fecha_emisionL.toISOString().split("T")[0];
      } else if (typeof licencia.fecha_emisionL === "string") {
        fechaStr = licencia.fecha_emisionL;
      }

      if (fechaStr) {
        const [anio, mes, dia] = fechaStr.split("-");
        const baseRegistro = `${id}${dia}${mes}${anio}`;
        registroGeneral = licenciasAmpliadas.has(baseRegistro)
          ? `AMP-${baseRegistro}`
          : baseRegistro;
      }
    }

    return {
      id: tasa.id_tasa,
      nombre_propietario: tasa.propietario?.nombre_propietario || "Desconocido",
      registro_general: registroGeneral,
      LICENCIAS_id_licencia_original:
        tasa.LICENCIAS_id_licencia_original || null,
      LICENCIAS_fecha_emisionL_original:
        tasa.LICENCIAS_fecha_emisionL_original || null,
      latitud: tasa.latitud || null,
      longitud: tasa.longitud || null,
      direccion_propiedad: tasa.direccion_propiedad || "",
    };
  });
  // Ordenar: "En proceso" primero, luego por registro_general
  datos.sort((a, b) => {
    if (a.registro_general === "En proceso") return -1;
    if (b.registro_general === "En proceso") return 1;
    // Quitar el prefijo AMP- si lo tiene para comparar la fecha base
    const cleanA = a.registro_general.replace("AMP-", "");
    const cleanB = b.registro_general.replace("AMP-", "");

    // Comparar por fecha (string en formato: id + ddmmaaaa)
    if (cleanA !== cleanB) {
      return cleanA.localeCompare(cleanB);
    }

    // Si son de la misma base, AMP va antes que el registro original
    const isAmpA = a.registro_general.startsWith("AMP-");
    const isAmpB = b.registro_general.startsWith("AMP-");

    if (isAmpA && !isAmpB) return -1;
    if (!isAmpA && isAmpB) return 1;
    return 0;
  });
  return datos;
};

//Obtiene datos necesarios para una ampliación
const obtenerDatosTasaPorId = async (idTasa) => {
  const tasa = await Tasa.findByPk(idTasa, {
    include: [
      {
        model: Propietario,
        as: "propietario",
        attributes: ["cui", "nombre_propietario"],
      },
      {
        model: Licencia,
        as: "licencia",
        attributes: ["id_licencia", "fecha_emisionL"],
      },
    ],
    attributes: ["direccion_propiedad", "latitud", "longitud"],
  });

  if (!tasa) {
    throw new Error("Tasa no encontrada");
  }

  return {
    direccionExacta: tasa.direccion_propiedad || "",
    nombrePropietario: tasa.propietario?.nombre_propietario || "",
    dpi: tasa.propietario?.cui || "",
    LICENCIAS_id_licencia_original: tasa.licencia?.id_licencia || null,
    LICENCIAS_fecha_emisionL_original: tasa.licencia?.fecha_emisionL || null,
    latitud: tasa.latitud || "",
    longitud: tasa.longitud || "",
  };
};

module.exports = {
  crearTasa,
  obtenerRegistros,
  obtenerDatosTasaPorId,
};
