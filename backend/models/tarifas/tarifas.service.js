const { Tarifa, TipoConstruccionTarifa, TarifaCostoDimension, TarifaCostoProyecto } =
  require("./index")(require("../../config/sequelize"));

async function obtenerTarifas() {
  try {
    const tarifas = await Tarifa.findAll({
      include: [
        {
          model: TipoConstruccionTarifa,
          attributes: ["id_tipoConstruccion", "tipo_construccion"],
        },
        {
          model: TarifaCostoDimension,
          attributes: ["costo_tarifa", "unidad_medida", "porcentaje"],
        },
        {
          model: TarifaCostoProyecto,
          attributes: ["porcentaje_costoProyecto", "porcentaje"],
        },
      ],
    });
    return tarifas;
  } catch (error) {
    console.error("Error al obtener tarifas:", error);
    throw error;
  }
}

async function actualizarTarifa(id, datosActualizados) {
  try {
    const tarifa = await Tarifa.findByPk(id);
    if (!tarifa) {
      throw new Error("Tarifa no encontrada.");
    }

    // Actualiza nombre_tarifa y tipo de construcción
    await tarifa.update({
      nombre_tarifa: datosActualizados.nombre_tarifa,
      TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion:
        datosActualizados.id_tipoConstruccion,
    });

    if (datosActualizados.tipo_construccion) {
      const tipoConstruccion = await TipoConstruccionTarifa.findByPk(
        datosActualizados.id_tipoConstruccion
      );

      if (tipoConstruccion) {
        await tipoConstruccion.update({
          tipo_construccion: datosActualizados.tipo_construccion,
        });
      }
    }

    // Actualiza el costo y porcentaje si existen
    const costo = await TarifaCostoDimension.findOne({
      where: { TARIFA_id_nombreTarifa: id },
    });

    if (costo) {
      await costo.update({
        costo_tarifa: datosActualizados.costo_tarifa,
        porcentaje: datosActualizados.porcentaje,
      });
    }

    return { tarifa, costo };
  } catch (error) {
    console.error("Error actualizando tarifa:", error);
    throw error;
  }
}

module.exports = {
  obtenerTarifas,
  actualizarTarifa,
};
