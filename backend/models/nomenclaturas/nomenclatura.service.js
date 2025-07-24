const { Nomenclatura, Propietario } = require("./index");
const sequelize = require("../../config/sequelize");

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

module.exports = {
  crearNomenclatura,
  listarNomenclaturas,
};
