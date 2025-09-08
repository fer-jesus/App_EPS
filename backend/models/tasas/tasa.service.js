const sequelize = require("../../config/sequelize");
const defineTarifaModels = require("../tarifas");

const {
  Tasa,
  TasaTarifa,
  Tarifa,
  Propietario,
  Licencia,
  TasaTarifaVariosNiveles,
} = require(".");
const { TipoConstruccionTarifa, TarifaCostoDimension, TarifaCostoProyecto } =
  defineTarifaModels(sequelize);

const { Usuario, Rol, RolNombre } = require("../usuario");

const { setUsuarioId } = require("../../utils/historial");
const { Op, Sequelize } = require("sequelize");

const crearTasa = async (tasaData, tarifasData, id_usuario) => {
  console.log("Creando tasa:", tasaData);
  try {
    const result = await Tasa.sequelize.transaction(async (t) => {
      //console.log("Insertando tarifa:", tarifa);
      await setUsuarioId(Tasa.sequelize, id_usuario, t);
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
              activo: true,
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

const obtenerTasaEdicion = async (id_tasa) => {
  const tasa = await Tasa.findByPk(id_tasa, {
    include: [
      {
        model: Propietario,
        as: "propietario",
        attributes: ["cui", "nombre_propietario"],
      },
      {
        model: TasaTarifa,
        as: "detalles_tarifas",
        where: { activo: true },
        required: false,
        attributes: [
          "TARIFA_id_nombreTarifa",
          "dimension_construccion",
          "formula",
          "valor",
        ],
        include: [
          {
            model: Tarifa,
            as: "tarifa",
            attributes: ["id_nombreTarifa", "nombre_tarifa"],
            include: [
              {
                model: TipoConstruccionTarifa,
                attributes: ["id_tipoConstruccion", "tipo_construccion"],
              },
              {
                model: TarifaCostoDimension,
                attributes: ["costo_tarifa", "porcentaje", "unidad_medida"],
              },
              {
                model: TarifaCostoProyecto,
                attributes: ["porcentaje_costoProyecto", "porcentaje"],
              },
            ],
          },
          // {
          //   model: TasaTarifaVariosNiveles,
          //   as: "niveles",
          //   separate: true, // ⚡ trae los niveles en una consulta separada
          //   where: {
          //     TASAS_TARIFA_TASAS_id_tasa: Sequelize.col(
          //       "detalles_tarifas.TASAS_id_tasa"
          //     ),
          //     TASAS_TARIFA_tarifa_correlativo: Sequelize.col(
          //       "detalles_tarifas.tarifa_correlativo"
          //     ),
          //     TASAS_TARIFA_TARIFA_id_nombreTarifa: Sequelize.col(
          //       "detalles_tarifas.TARIFA_id_nombreTarifa"
          //     ),
          //   },
          //   required: false, // para no filtrar si no hay niveles
          // },
        ],
      },
    ],
  });

  if (!tasa) throw new Error("Tasa no encontrada");

  // Calcular valorPorcentaje dinámicamente
  const valorPorcentajeCalculado = (tasa.detalles_tarifas || []).reduce(
    (acc, detalle) => {
      // Aquí puedes aplicar la fórmula real si es más compleja
      return acc + Number(detalle.valor || 0);
    },
    0
  );

  return {
    id_tasa: tasa.id_tasa,
    fechaRegistro: tasa.fecha_emisionT || "",
    direccionExacta: tasa.direccion_propiedad || "",
    nombrePropietario: tasa.propietario?.nombre_propietario || "",
    dpi: tasa.propietario?.cui || "",
    latitud: tasa.latitud || "",
    longitud: tasa.longitud || "",
    tipoConstruccion: (tasa.detalles_tarifas || []).map((detalle) => ({
      TARIFA_id_nombreTarifa: detalle.TARIFA_id_nombreTarifa,
      nombre_tarifa: detalle.tarifa?.nombre_tarifa || "",
      dimension_construccion: detalle.dimension_construccion?.toString() || "",
      formula: detalle.formula || "",
      valor: detalle.valor || "",
      niveles: detalle.niveles || [],
      tipoConstruccionTarifa: detalle.tarifa?.TipoConstruccionTarifa || null,
      tarifaCostoDimension: detalle.tarifa?.TarifaCostoDimension || null,
      tarifaCostoProyecto: detalle.tarifa?.TarifaCostoProyecto || null,
    })),
    areaConstruccion:
      tasa.detalles_tarifas?.[0]?.dimension_construccion?.toString() || "",
    cuentaNoAlineacion: tasa.alineacion_urban || false,
    anotaciones: tasa.anotaciones || "",
    cantDemoMovi: tasa.cant_dem_movTierra || "",
    valorPorcentaje: valorPorcentajeCalculado,
    presupuestObra: tasa.presupuesto_obra || 0,
    cantidadCancelar: tasa.cantidad_cancelar || 0,
    LICENCIAS_id_licencia_original: tasa.LICENCIAS_id_licencia_original || null,
    LICENCIAS_fecha_emisionL_original:
      tasa.LICENCIAS_fecha_emisionL_original || null,
    latitud: tasa.latitud || "",
    longitud: tasa.longitud || "",
  };
};

const actualizarTasa = async (id_tasa, tasaData, tarifasData, id_usuario) => {
  try {
    const result = await Tasa.sequelize.transaction(async (t) => {
      await setUsuarioId(Tasa.sequelize, id_usuario, t);

      //Actualizar los datos principales de la tasa con nombres exactos de la BD
      await Tasa.update(
        {
          fecha_emisionT: tasaData.fechaRegistro,
          direccion_propiedad: tasaData.direccionExacta,
          alineacion_urban: tasaData.cuentaNoAlineacion || false,
          anotaciones: tasaData.anotaciones || null,
          cant_dem_movTierra: tasaData.cantDemoMovi || null,
          presupuesto_obra: tasaData.presupuestObra,
          cantidad_cancelar: tasaData.cantidadCancelar,
          latitud: tasaData.latitud || null,
          longitud: tasaData.longitud || null,
          PROPIETARIOS_cui: tasaData.dpi ? parseInt(tasaData.dpi) : null,
          LICENCIAS_id_licencia_original:
            tasaData.LICENCIAS_id_licencia_original || null,
          LICENCIAS_fecha_emisionL_original:
            tasaData.LICENCIAS_fecha_emisionL_original || null,
        },
        {
          where: { id_tasa },
          transaction: t,
        }
      );

      //Cargar las tarifas existentes
      const tarifasExistentes = await TasaTarifa.findAll({
        where: { TASAS_id_tasa: id_tasa },
        transaction: t,
      });

      // Construir IDs de tarifas nuevas (correlativo + idTarifa)
      const idsNuevos = tarifasData.map(
        (tarifa, i) => `${i + 1}-${tarifa.TARIFA_id_nombreTarifa}`
      );

      // 🔹 Eliminar tarifas que ya no están en el form
      for (const tarifaExistente of tarifasExistentes) {
        const idCompuesto = `${tarifaExistente.tarifa_correlativo}-${tarifaExistente.TARIFA_id_nombreTarifa}`;
        if (!idsNuevos.includes(idCompuesto)) {
          // Eliminar niveles asociados primero
          await TasaTarifaVariosNiveles.destroy({
            where: {
              TASAS_TARIFA_TASAS_id_tasa: id_tasa,
              TASAS_TARIFA_tarifa_correlativo:
                tarifaExistente.tarifa_correlativo,
              TASAS_TARIFA_TARIFA_id_nombreTarifa:
                tarifaExistente.TARIFA_id_nombreTarifa,
            },
            transaction: t,
          });

          // Luego eliminar la tarifa
         await tarifaExistente.update({ activo: false }, { transaction: t });
        }
      }

      //Recorrer tarifas nuevas y hacer UPSERT
      for (let i = 0; i < tarifasData.length; i++) {
        const tarifa = tarifasData[i];
        const correlativo = i + 1;

        // Buscar tarifa existente
        let tarifaExistente = await TasaTarifa.findOne({
          where: {
            TASAS_id_tasa: id_tasa,
            tarifa_correlativo: correlativo,
            TARIFA_id_nombreTarifa: tarifa.TARIFA_id_nombreTarifa,
          },
          transaction: t,
        });

        if (tarifaExistente) {
          // Actualizar tarifa existente
          await tarifaExistente.update(
            {
              dimension_construccion: tarifa.dimension_construccion,
              formula: tarifa.formula,
              valor: tarifa.valor,
              activo: true,
            },
            { transaction: t }
          );
        } else {
          // Crear nueva tarifa
          tarifaExistente = await TasaTarifa.create(
            {
              tarifa_correlativo: correlativo,
              TASAS_id_tasa: id_tasa,
              TARIFA_id_nombreTarifa: tarifa.TARIFA_id_nombreTarifa,
              dimension_construccion: tarifa.dimension_construccion,
              formula: tarifa.formula,
              valor: tarifa.valor,
            },
            { transaction: t }
          );
        }

        // Manejar niveles
        if (Array.isArray(tarifa.niveles)) {
          for (const nivel of tarifa.niveles) {
            // Buscar nivel existente
            const nivelExistente = await TasaTarifaVariosNiveles.findOne({
              where: {
                TASAS_TARIFA_TASAS_id_tasa: id_tasa,
                TASAS_TARIFA_tarifa_correlativo: correlativo,
                TASAS_TARIFA_TARIFA_id_nombreTarifa:
                  tarifa.TARIFA_id_nombreTarifa,
                nivel: nivel.nivel,
              },
              transaction: t,
            });

            if (nivelExistente) {
              // Actualizar nivel existente
              await nivelExistente.update(
                {
                  dimension_construccion: nivel.dimension_construccion || null,
                  formula: nivel.formula,
                  valor: nivel.valor,
                },
                { transaction: t }
              );
            } else {
              // Crear nivel nuevo
              await TasaTarifaVariosNiveles.create(
                {
                  TASAS_TARIFA_TASAS_id_tasa: id_tasa,
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

      return id_tasa;
    });

    return result;
  } catch (error) {
    console.error("Error al actualizar tasa:", error);
    throw new Error("No se pudo actualizar la tasa");
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

const obtenerDatosParaDocumentoPDF = async (idTasa) => {
  const tasa = await Tasa.findByPk(idTasa, {
    include: [
      {
        model: Propietario,
        as: "propietario",
        attributes: ["nombre_propietario"],
      },
      {
        model: Licencia,
        as: "licencia",
        attributes: ["fecha_emisionL"],
      },
      {
        model: TasaTarifa,
        as: "detalles_tarifas",
        where: { activo: true },
        required: false,  
        include: [
          {
            model: Tarifa,
            as: "tarifa",
            attributes: [
              "id_nombreTarifa",
              "nombre_tarifa",
              "TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion",
            ],
          },
        ],
      },
    ],
  });

  if (!tasa) {
    throw new Error("Tasa no encontrada");
  }

  //Consulta usuario firmante: coordinador o coordinador interino en funciones
  const usuarioFirmante = await Usuario.findOne({
    where: { en_funciones: 1 },
    include: [
      {
        model: Rol,
        as: "Rol",
        where: {
          id_rol: [3, 4], // IDs de coordinadores
        },
        required: true,
        include: [
          {
            model: RolNombre,
            as: "RolNombres",
            required: true,
            attributes: ["nombre_rol", "sexo"],
          },
        ],
      },
    ],
  });

  //FUNCIONES AUXILIARES
  const obtenerDescripcionTipoConstruccion = (tarifa) => {
    const idTarifa = tarifa?.id_nombreTarifa;
    const nombreTarifa = tarifa?.nombre_tarifa || "";
    const tipoConstruccionId =
      tarifa?.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion;

    if (!idTarifa || !tipoConstruccionId) return "";

    // Casos especiales

    if (idTarifa === 32) return "Cambio de uso o remodelaciones";
    if ([2, 3, 4, 5, 6].includes(idTarifa)) return "Vivienda techo de lamina";
    if ([7, 8, 9, 10, 11, 12].includes(idTarifa))
      return "Vivienda losa de concreto";
    if (idTarifa === 44) return nombreTarifa;

    // Mostrar solo nombre tarifa
    if ([4, 5, 6, 7].includes(tipoConstruccionId)) return nombreTarifa;

    // Mostrar tipo construcción / tarifa
    if ([8, 9].includes(tipoConstruccionId)) {
      let tipoConstruccionTexto = "";

      if (tipoConstruccionId === 8)
        tipoConstruccionTexto = "Trabajos de obra exterior";
      if (tipoConstruccionId === 9)
        tipoConstruccionTexto = "Otras actividades constructivas";

      return `${tipoConstruccionTexto} - ${nombreTarifa}`;
    }

    return nombreTarifa; // fallback
  };

  const formatoFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatearMoneda = (valor) => {
    const numero = Number(valor);
    return numero.toLocaleString("es-GT", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  //VARIABLES DE CÁLCULO

  // Suma total de las tarifas
  const valorTotal =
    tasa.detalles_tarifas?.reduce((acc, t) => acc + Number(t.valor), 0) || 0;

  let formulasTarifa = [];
  let formulasSegundoNivel = [];
  let areasConstruccion = [];
  let areaDemolicion = "";

  for (const detalle of tasa.detalles_tarifas || []) {
    const tarifa = detalle.tarifa;
    const nombre = tarifa?.nombre_tarifa?.toUpperCase() || "";
    const tipoConstruccionId =
      tarifa?.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion;
    const formula = detalle.formula?.toUpperCase();
    const dimension = detalle.dimension_construccion?.toString() || "";
    const idTarifa = tarifa?.id_nombreTarifa;

    if (!tarifa) continue;

    // Definir unidad (m² o m³)
    const unidad = [34, 35, 36].includes(idTarifa) ? " m³" : " m²";

    // Área de demolición (no debe mostrarse como área de construcción)
    const esDemolicion = ["DEMOLICIÓN", "MOVIMIENTO DE TIERRA"].includes(
      nombre
    );
    if (esDemolicion) {
      areaDemolicion = dimension ? `${dimension}${unidad}` : "";
    }

    let formulaFormateada = formula;
    if (formula?.includes("=")) {
      const partes = formula.split("=");
      const parteFinal = partes.pop().trim();
      const parteFinalFormateada = formatearMoneda(parteFinal);
      formulaFormateada = [...partes, parteFinalFormateada].join("=");
    }

    if ([2, 3].includes(tipoConstruccionId) && formula?.includes("X50%")) {
      formulasSegundoNivel.push(formulaFormateada);
    } else {
      formulasTarifa.push(formulaFormateada);
    }

    if (!esDemolicion && dimension) {
      areasConstruccion.push(`${dimension}${unidad}`);
    }
  }

  const tieneFirmante = Boolean(usuarioFirmante);

  return {
    fecha: formatoFecha(tasa.licencia?.fecha_emisionL || tasa.fecha_emisionT),
    direccion: tasa.direccion_propiedad || "",
    nombre_propietario: tasa.propietario?.nombre_propietario || "",
    tipo_construccion: (() => {
      const descripciones = tasa.detalles_tarifas
        ?.map((t) => {
          const tipoId = t.tarifa?.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion;
          const descripcion = obtenerDescripcionTipoConstruccion(t.tarifa);
          return { tipoId, descripcion };
        })
        .filter((t) => t.descripcion); // descartar nulos/vacíos

      const resultado = [];
      const encontradosTipo2o3 = new Set(); // Para evitar duplicados solo de tipo 2 y 3

      for (const t of descripciones) {
        if ([2, 3].includes(t.tipoId)) {
          if (!encontradosTipo2o3.has(t.descripcion)) {
            resultado.push(t.descripcion);
            encontradosTipo2o3.add(t.descripcion);
          }
        } else {
          resultado.push(t.descripcion); // otros tipos pueden repetirse
        }
      }

      return resultado.join(" / ");
    })(),

    alineacion: tasa.alineacion_urban
      ? "Sí CUENTA CON ALINEACIÓN"
      : "NO CUENTA CON ALINEACIÓN",

    anotaciones: tasa.anotaciones || "",
    area_construccion: areasConstruccion.join("\n") || "",
    area_demolicion: areaDemolicion || "",
    valor_m2_y_porcentaje: formulasTarifa.join("\n") || "",
    valor_segundo_nivel: formulasSegundoNivel.join("\n") || "",
    presupuesto_obra: formatearMoneda(tasa.presupuesto_obra) || "0.00",
    //cantidad_cancelar: formatearMoneda(tasa.cantidad_cancelar),
    cantidad_cancelar: (() => {
      const tieneExento = (tasa.detalles_tarifas || []).some(
        (t) => t.tarifa?.id_nombreTarifa === 1
      );
      return tieneExento
        ? "EXENTO"
        : `Q. ${formatearMoneda(tasa.cantidad_cancelar)}`;
    })(),
    usuario: tieneFirmante
      ? `${usuarioFirmante?.titulo || ""} ${
          usuarioFirmante?.nombre || ""
        }`.trim()
      : "",
    rol_nombre: tieneFirmante
      ? (usuarioFirmante?.Rol?.RolNombres || []).find(
          (rn) => rn.sexo === usuarioFirmante.sexo
        )?.nombre_rol || ""
      : "",
    institucion_firma: tieneFirmante ? "MUNICIPALIDAD DE JALAPA" : "",
    firmaUsuario: true,
  };
};

module.exports = {
  crearTasa,
  obtenerTasaEdicion,
  actualizarTasa,
  obtenerRegistros,
  obtenerDatosTasaPorId,
  obtenerDatosParaDocumentoPDF,
};
