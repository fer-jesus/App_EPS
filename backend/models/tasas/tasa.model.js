module.exports = (sequelize, DataTypes) => {
  const Tasa = sequelize.define("Tasa", {
    id_tasa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    fecha_emisionT: {
      type: DataTypes.DATE,
      allowNull: false
     
    },
    direccion_propiedad: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    alineacion_urban: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    anotaciones: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    cant_dem_movTierra: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    presupuesto_obra: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    cantidad_cancelar: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    documento: {
      type: DataTypes.BLOB('long'),
      allowNull: true
    },
    PROPIETARIOS_cui: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    LICENCIAS_id_licencia_original: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    LICENCIAS_fecha_emisionL_original: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: "TASAS",
    timestamps: false
  });

  return Tasa;
};
