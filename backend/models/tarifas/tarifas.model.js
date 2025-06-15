const { DataTypes } = require("sequelize");

function defineTarifaModels(sequelize) {
  const TipoConstruccionTarifa = sequelize.define("TipoConstruccionTarifa", {
    id_tipoConstruccion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    tipo_construccion: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
  }, {
    tableName: "TIPO_CONSTRUCCION_TARIFA",
    timestamps: false,
  });

  const Tarifa = sequelize.define("Tarifa", {
    id_nombreTarifa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    nombre_tarifa: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: "TARIFA",
    timestamps: false,
  });

  const TarifaCostoDimension = sequelize.define("TarifaCostoDimension", {
    TARIFA_id_nombreTarifa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    costo_tarifa: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    unidad_medida: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    porcentaje: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  }, {
    tableName: "TARIFA_COSTO_DIMENSION",
    timestamps: false,
  });

  const TarifaCostoProyecto = sequelize.define("TarifaCostoProyecto", {
  TARIFA_id_nombreTarifa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  porcentaje_costoProyecto: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  porcentaje: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
}, {
  tableName: "TARIFA_COSTO_PROYECTO",
  timestamps: false,
});

  // Relaciones
  Tarifa.belongsTo(TipoConstruccionTarifa, {
    foreignKey: "TIPO_CONSTRUCCION_TARIFA_id_tipoConstruccion",
  });

  TarifaCostoDimension.belongsTo(Tarifa, {
    foreignKey: "TARIFA_id_nombreTarifa",
  });

  Tarifa.hasOne(TarifaCostoDimension, {
    foreignKey: "TARIFA_id_nombreTarifa",
  });

  Tarifa.hasOne(TarifaCostoProyecto, {
  foreignKey: "TARIFA_id_nombreTarifa",
});

TarifaCostoProyecto.belongsTo(Tarifa, {
  foreignKey: "TARIFA_id_nombreTarifa",
});

  return {
    TipoConstruccionTarifa,
    Tarifa,
    TarifaCostoDimension,
    TarifaCostoProyecto,
  };
}

module.exports = defineTarifaModels;
