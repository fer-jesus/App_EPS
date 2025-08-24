const { Licencia } = require("./index");
const { Tasa } = require("../tasas");
const { Usuario, RolNombre, Rol, UsuarioFirma } = require("../usuario");
//const { RolNombre } = require("../rol");
const sequelize = require("../../config/sequelize");
const { setUsuarioId } = require("../../utils/historial");
const { Op, fn, col } = require("sequelize");

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

const actualizarRotulo = async (
  id_licencia,
  fecha_emisionL,
  nuevoRotulo,
  id_usuario
) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      //Variable de sesión para trigger
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

const obtenerDatosParaLicenciaPDF = async (idLicencia) => {
  try {
    const licencia = await Licencia.findOne({
      where: {
        id_licencia: idLicencia,
      },
      include: [
        {
          model: Tasa,
          as: "tasa",
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
                  attributes: [
                    "id_nombreTarifa",
                    "nombre_tarifa",
                    "TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion",
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!licencia) throw new Error("Licencia no encontrada");

    const tasa = licencia.tasa;

    // Registro general actual
    let registro_general = null;
    if (licencia.id_licencia && licencia.fecha_emisionL) {
      const idStr = licencia.id_licencia.toString().padStart(4, "0");
      const fecha = new Date(licencia.fecha_emisionL);
      if (!isNaN(fecha)) {
        const [year, month, day] = fecha.toISOString().split("T")[0].split("-");
        registro_general = `${idStr}${day}${month}${year}`;
      }
    }

    // Función para obtener ancestros (ampliaciones previas)
    async function obtenerAncestros(idLicenciaActual) {
      const ancestros = [];

      let licenciaActual = await Licencia.findOne({
        where: { id_licencia: idLicenciaActual },
        attributes: [
          "id_licencia",
          "fecha_emisionL",
          "LICENCIAS_id_licencia_ampliacion",
        ],
      });

      while (
        licenciaActual &&
        licenciaActual.LICENCIAS_id_licencia_ampliacion // mientras exista ampliación anterior
      ) {
        const idAmpliacionAnterior =
          licenciaActual.LICENCIAS_id_licencia_ampliacion;

        const licenciaAnterior = await Licencia.findOne({
          where: { id_licencia: idAmpliacionAnterior },
          attributes: [
            "id_licencia",
            "fecha_emisionL",
            "LICENCIAS_id_licencia_ampliacion",
          ],
        });

        if (!licenciaAnterior) break;

        ancestros.push(licenciaAnterior);
        licenciaActual = licenciaAnterior;
      }

      return ancestros;
    }

    let registroGeneral = registro_general;

    // Solo si hay ampliaciones previas se muestra la cadena completa
    if (licencia.LICENCIAS_id_licencia_ampliacion) {
      const ancestros = await obtenerAncestros(licencia.id_licencia);

      const registros_ampliacion = ancestros
        .map((lic) => {
          const idStr = lic.id_licencia.toString().padStart(4, "0");
          const fecha = new Date(lic.fecha_emisionL);
          if (isNaN(fecha)) return null;
          const [year, month, day] = fecha
            .toISOString()
            .split("T")[0]
            .split("-");
          return `AMP-${idStr}${day}${month}${year}`;
        })
        .filter(Boolean);

      registroGeneral = [registro_general, ...registros_ampliacion].join("\n");
    }

    // Formatear fechas
    const formatearFecha = (fecha) => {
      if (!fecha) return null;
      const [year, month, day] = fecha.split("-");
      return `${day}/${month}/${year}`;
    };

    const obtenerDescripcionTipoConstruccion = (tarifa) => {
      const idTarifa = tarifa?.id_nombreTarifa;
      const nombreTarifa = tarifa?.nombre_tarifa || "";
      const tipoConstruccionId =
        tarifa?.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion;

      if (!idTarifa || !tipoConstruccionId) return "";

      if (idTarifa === 32) return "Cambio de uso o remodelaciones";
      if ([2, 3, 4, 5, 6].includes(idTarifa)) return "Vivienda techo de lamina";
      if ([7, 8, 9, 10, 11, 12].includes(idTarifa))
        return "Vivienda losa de concreto";
      if (idTarifa === 44) return nombreTarifa;
      if ([4, 5, 6, 7].includes(tipoConstruccionId)) return nombreTarifa;

      if ([8, 9].includes(tipoConstruccionId)) {
        let tipoConstruccionTexto = "";
        if (tipoConstruccionId === 8)
          tipoConstruccionTexto = "Trabajos de obra exterior";
        if (tipoConstruccionId === 9)
          tipoConstruccionTexto = "Otras actividades constructivas";

        return `${tipoConstruccionTexto} - ${nombreTarifa}`;
      }

      return nombreTarifa;
    };

    // Tipos de construcción
    const tiposConstruccion =
      tasa.detalles_tarifas
        ?.reduce((acc, item) => {
          const desc = obtenerDescripcionTipoConstruccion(item.tarifa);
          const idTipo =
            item.tarifa?.TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion;

          if (!desc) return acc;

          if ((idTipo === 2 || idTipo === 3) && acc.includes(desc)) {
            return acc; //Evita duplicados solo para id tipo de construcción 2 y 3
          }

          acc.push(desc);
          return acc;
        }, [])
        .join(" / ") || "No definido";

    // Área de construcción
    const areaConstruccion =
      tasa.detalles_tarifas
        ?.map((item) => {
          const idTarifa = parseInt(item.tarifa.id_nombreTarifa, 10);
          const unidad = [34, 35, 36].includes(idTarifa) ? "m³" : "m²";
          return `${parseFloat(item.dimension_construccion || 0)} ${unidad}`;
        })
        .join(" / ") || "0 m²";

    // Función para obtener los firmantes de una licencia
    const firmantes = await (async function obtenerFirmantes(idLicencia) {
      // Buscar firmas de la licencia
      let firmaData = await UsuarioFirma.findAll({
        where: { LICENCIAS_id_licencia: idLicencia },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: [
              "id_usuario",
              "sexo",
              "nombre",
              "ROL_id_rol",
              "en_funciones",
              "titulo",
            ],
            include: [
              {
                model: Rol,
                as: "Rol",
                include: [
                  {
                    model: RolNombre,
                    as: "RolNombres",
                    attributes: ["nombre_rol", "sexo"],
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      });

      // Si no hay datos en UsuarioFirma, buscar directamente usuarios en funciones
      if (!firmaData.length) {
        const usuariosEnFunciones = await Usuario.findAll({
          where: { en_funciones: 1 },
          include: [
            {
              model: Rol,
              as: "Rol",
              include: [
                {
                  model: RolNombre,
                  as: "RolNombres",
                  attributes: ["nombre_rol", "sexo"],
                  required: false,
                },
              ],
            },
          ],
        });

        // Transformar para mantener misma estructura
        firmaData = usuariosEnFunciones.map((u) => ({ usuario: u }));
      }

      const rolesRequeridos = [
        { id: 3, interino: 4 }, // COORDINADOR
        { id: 2, interino: 6 }, // SUBDIRECTOR
        { id: 1, interino: 5 }, // DIRECTOR
      ];

      const firmantes = [];

      for (const rol of rolesRequeridos) {
        // Buscar usuario principal o interino
        let usuario = firmaData
          .map((f) => f.usuario)
          .find(
            (u) =>
              (u.ROL_id_rol === rol.id || u.ROL_id_rol === rol.interino) &&
              u.en_funciones
          );

        if (!usuario) {
          //Si no hay usuario en funciones se pasa al siguiente rol
          continue;
        }

        // if (!usuario) {
        //   // fallback manual si no hay usuario
        //   firmantes.push({
        //     nombre: "",
        //     rol:
        //       rol.id === 3
        //         ? "COORDINADOR INTERINO"
        //         : rol.id === 2
        //         ? "SUBDIRECTORA"
        //         : "DIRECTOR",
        //     unidad:
        //       rol.id === 3
        //         ? "PROYECTOS URBANOS - LICENCIAS DE CONSTRUCCIÓN"
        //         : "DIRECCIÓN DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL",
        //   });
        //   continue;
        // }

        // Determinar el nombre del rol según sexo
        let nombreRol = "";
        if (usuario?.Rol?.RolNombres) {
          nombreRol =
            usuario.Rol.RolNombres.find((r) => r.sexo === usuario.sexo)
              ?.nombre_rol || "";
        }

        firmantes.push({
          nombre: `${usuario.titulo ? usuario.titulo + " " : ""}${
            usuario.nombre
          }`,
          rol: nombreRol || "",
          unidad:
            rol.id === 3
              ? "PROYECTOS URBANOS - LICENCIAS DE CONSTRUCCIÓN"
              : "DIRECCIÓN DE ORDENAMIENTO TERRITORIAL Y DESARROLLO MUNICIPAL",
        });
      }

      return firmantes;
    })(licencia.id_licencia);

    const tieneTarifaExento = tasa.detalles_tarifas?.some(
      (item) => item.tarifa?.id_nombreTarifa === 1
    );

    return {
      numeroLicencia: licencia.id_licencia.toString().padStart(4, "0"),
      registroGeneral,
      fechaEmision: formatearFecha(licencia.fecha_emisionL),
      fechaVencimiento: formatearFecha(licencia.fecha_vencimiento),
      solicitante: tasa.propietario?.nombre_propietario || "No definido",
      direccionConstruccion: tasa.direccion_propiedad || "No definida",
      tipoConstruccion: tiposConstruccion,
      cantidadCancelada: tieneTarifaExento
        ? "EXENTO"
        : `Q. ${Number(tasa.cantidad_cancelar).toLocaleString("es-GT", {
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
      rotulo: isNaN(Number(licencia.rotulo))
        ? licencia.rotulo
        : `Q. ${Number(licencia.rotulo).toLocaleString("es-GT", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      areaConstruccion,
      firmantes,
    };
  } catch (error) {
    console.error("Error en obtenerDatosParaLicenciaPDF:", error);
    throw error;
  }
};

const obtenerReporteLicencias = async (inicio, fin) => {
  let where = {};

  if (inicio && fin) {
    const inicioDate = new Date(inicio);
    const finDate = new Date(fin);

    if (
      inicioDate.getMonth() === finDate.getMonth() &&
      inicioDate.getFullYear() === finDate.getFullYear()
    ) {
      // Filtrar directamente por mes y año exactos
      const firstDay = `${inicioDate.getFullYear()}-${String(
        inicioDate.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const lastDay = new Date(
        inicioDate.getFullYear(),
        inicioDate.getMonth() + 1,
        0
      ).getDate();

      const endOfMonth = `${inicioDate.getFullYear()}-${String(
        inicioDate.getMonth() + 1
      ).padStart(2, "0")}-${lastDay}`;

      where = {
        fecha_emisionL: {
          [Op.between]: [firstDay, endOfMonth],
        },
      };
    } else {
      // Rango normal de fechas
      where = {
        fecha_emisionL: {
          [Op.gte]: inicio,
          [Op.lte]: fin,
        },
      };
    }
  }

  const reporte = await Licencia.findAll({
    attributes: [
      [fn("MONTH", col("fecha_emisionL")), "mes"],
      [fn("YEAR", col("fecha_emisionL")), "anio"],
      [fn("COUNT", col("id_licencia")), "cantidad_licencias"],
    ],
    include: [
      {
        model: Tasa,
        as: "tasa",
        attributes: [[fn("SUM", col("cantidad_cancelar")), "monto_total"]],
      },
    ],
    where,
    group: ["anio", "mes"],
    order: [
      ["anio", "ASC"],
      ["mes", "ASC"],
    ],
    raw: true,
    nest: true,
  });

  return reporte;
};

module.exports = {
  crearLicencia,
  obtenerDatosTasaPorId,
  obtenerLicenciaPorTasa,
  actualizarRotulo,
  obtenerDatosParaLicenciaPDF,
  obtenerReporteLicencias,
};
