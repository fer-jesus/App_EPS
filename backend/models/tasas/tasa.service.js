const { Tasa, TasaTarifa, Propietario } = require(".");
//const { TasaTarifa } = require("./tasaTarifa.model"); 

const crearTasa = async (tasaData, tarifasData) => {
    console.log("Creando tasa:", tasaData);

  const result = await Tasa.sequelize.transaction(async (t) => {
    //console.log("Insertando tarifa:", tarifa);
    const nuevaTasa = await Tasa.create(tasaData, { transaction: t });
    console.log("ID de nueva tasa:", nuevaTasa?.id_tasa);

    if (tarifasData && tarifasData.length > 0) {
      for (const tarifa of tarifasData) {
         console.log("Insertando tarifa:", tarifa);
        await TasaTarifa.create({
          TASAS_id_tasa: nuevaTasa.id_tasa,
          dimension_construccion: tarifa.dimension_construccion,
          formula: tarifa.formula,
          valor: tarifa.valor,
          TARIFA_id_nombreTarifa: tarifa.TARIFA_id_nombreTarifa
        }, { transaction: t });
      }
    }

    return nuevaTasa;
  });

  return result;
};

const obtenerRegistros = async () => {
  return await Tasa.findAll({
    include: {
      model: Propietario,
      as: "propietario",
      attributes: ["nombre_propietario"]
    },
    attributes: ["id_tasa"],
     order: [["id_tasa", "ASC"]] 
  });
};



module.exports = {
  crearTasa,
  obtenerRegistros
};
