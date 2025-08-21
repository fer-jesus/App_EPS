const { Nomenclatura, Propietario, TipoNomenclatura } = require("./index");
const { Usuario, Rol, RolNombre } = require("../usuario");
const sequelize = require("../../config/sequelize");
const { Op, fn, col } = require("sequelize");

const crearNomenclatura = async (datos) => {
  const {
    PROPIETARIOS_cui,
    nombre_propietario,
    fecha_emisionN,
    ...restoDatos
  } = datos;

  // Calcular fecha de vencimiento
  let fechaVencimiento = null;
  if (fecha_emisionN) {
    const [year, month, day] = fecha_emisionN.split("-").map(Number);
    const fechaEmisionDate = new Date(year, month - 1, day);
    fechaVencimiento = new Date(fechaEmisionDate);
    fechaVencimiento.setFullYear(fechaEmisionDate.getFullYear() + 1);
  }

  return await sequelize.transaction(async (t) => {
    // Crear el id de la nomenclatura (id_nomenclatura vendrá desde el trigger)
    const nueva = await Nomenclatura.create(
      {
        id_nomenclatura: datos.id_nomenclatura, // <- temporal
        PROPIETARIOS_cui,
        USUARIOS_id_usuario_firma: datos.USUARIOS_id_usuario_firma,
        fecha_emisionN,
        fecha_vencimientoN: fechaVencimiento,
        ...restoDatos,
      },
      { transaction: t }
    );

    // Verificar si el propietario ya existe
    let propietario = await Propietario.findByPk(PROPIETARIOS_cui, {
      transaction: t,
    });

    // Si no existe, crearlo
    if (!propietario) {
      propietario = await Propietario.create(
        {
          cui: PROPIETARIOS_cui,
          nombre_propietario,
        },
        { transaction: t }
      );
    }

    // Construcción de registro_generalN
    const idStr = nueva.id_nomenclatura.toString().padStart(4, "0");

    const fecha = new Date(nueva.fecha_emisionN);

    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const yyyy = fecha.getFullYear();

    // Formato final(ID + día + mes + año)
    const registroGeneral = `${idStr}${dd}${mm}${yyyy}`;

    // Actualizar el campo registro_generalN
    await nueva.update(
      { registro_generalN: registroGeneral },
      { transaction: t }
    );

    return nueva;
  });
};

const listarNomenclaturas = async () => {
  const registros = await Nomenclatura.findAll({
    include: {
      model: Propietario,
      as: "propietario",
      attributes: ["nombre_propietario"],
    },
    order: [["id_nomenclatura", "ASC"]],
  });
  const datosConRegistro = registros.map((n) => {
    const nJson = n.toJSON();

    const id = nJson.id_nomenclatura?.toString().padStart(4, "0") || "0000";
    const fecha = new Date(nJson.fecha_emisionN + "T00:00:00");
    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const yyyy = fecha.getFullYear();

    return {
      ...nJson,
      registro_generalN: `${id}${dd}${mm}${yyyy}`,
    };
  });

  return datosConRegistro;
};

const obtenerDatosParaNomenclaturaPDF = async (idNomenclatura) => {
  try {
    // Buscar la nomenclatura con su propietario
    const nomenclatura = await Nomenclatura.findOne({
      where: { id_nomenclatura: idNomenclatura },
      attributes: ["id_nomenclatura", "fecha_emisionN", "direccion_solici"],
      include: [
        {
          model: Propietario,
          as: "propietario",
          attributes: ["nombre_propietario"],
        },
        {
          model: TipoNomenclatura,
          as: "tipoNomenclatura",
          attributes: ["tipo_nomenclatura"], // 👈 traemos el texto
        },
      ],
    });

    if (!nomenclatura) {
      throw new Error("Nomenclatura no encontrada");
    }

    //Consulta usuario firmante: coordinador o coordinador interino en funciones
    const usuarioFirmante = await Usuario.findOne({
      where: { en_funciones: 1 },
      include: [
        {
          model: Rol,
          as: "Rol",
          where: {
            id_rol: [1, 2], // IDs de coordinadores
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

    const tieneFirmante = Boolean(usuarioFirmante);

    const nJson = nomenclatura.toJSON();

    // Formatear id_nomenclatura con ceros a la izquierda (0001, 0002, etc.)
    const idFormateado = String(nJson.id_nomenclatura).padStart(4, "0");

    // Calcular registro_generalN
    const idStr = nJson.id_nomenclatura?.toString().padStart(4, "0") || "0000";
    const fecha = new Date(nJson.fecha_emisionN + "T00:00:00");
    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const yyyy = fecha.getFullYear();
    const registroGeneral = `${idStr}${dd}${mm}${yyyy}`;

    return {
      id_nomenclatura: idFormateado,
      registro_generalN: registroGeneral,
      solicitante: nJson.propietario?.nombre_propietario || "",
      direccion: nJson.direccion_solici || "",
      tipo_nomenclatura: nJson.tipoNomenclatura?.tipo_nomenclatura || "NORMAL",
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
      institucion_firma: tieneFirmante
        ? "DIRECCIÓN DE ORDENAMIENTO TERRITORIAL <br> Y DESARROLLO MUNICIPAL"
        : "",
      firmaUsuario: true,
    };
  } catch (error) {
    console.error("Error en obtenerDatosParaLicenciaPDF:", error.message);
    throw error;
  }
};

const obtenerReporteNomenclaturas = async (inicio, fin) => {
  let where = {};

  if (inicio && fin) {
    const inicioDate = new Date(inicio);
    const finDate = new Date(fin);

    if (
      inicioDate.getMonth() === finDate.getMonth() &&
      inicioDate.getFullYear() === finDate.getFullYear()
    ) {
      // Filtrar por mes exacto
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
        fecha_emisionN: {
          [Op.between]: [firstDay, endOfMonth],
        },
      };
    } else {
      // Rango normal de fechas
      where = {
        fecha_emisionN: {
          [Op.gte]: inicio,
          [Op.lte]: fin,
        },
      };
    }
  }

  const reporte = await Nomenclatura.findAll({
    attributes: [
      [fn("MONTH", col("fecha_emisionN")), "mes"],
      [fn("YEAR", col("fecha_emisionN")), "anio"],
      [fn("COUNT", col("id_nomenclatura")), "cantidad_nomenclaturas"],
    ],
    where,
    group: ["anio", "mes"],
    order: [
      ["anio", "ASC"],
      ["mes", "ASC"],
    ],
    raw: true,
  });

  return reporte;
};

module.exports = {
  crearNomenclatura,
  listarNomenclaturas,
  obtenerDatosParaNomenclaturaPDF,
  obtenerReporteNomenclaturas,
};
