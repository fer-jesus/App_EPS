module.exports = (sequelize, DataTypes) => {
  const Licencia = sequelize.define("Licencia", {
    id_licencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
     boleta_pago: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    fecha_emisionL: {
      type: DataTypes.DATEONLY,
      primaryKey: true,
      allowNull: false,
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("PENDIENTE", "ACTIVO", "VENCIDO"),
      allowNull: false,
    },
    rotulo: {
      type: DataTypes.ENUM("50", "100", "Razonado"),
      allowNull: false,
    },
    documento: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
    TASAS_id_tasa: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LICENCIAS_id_licencia_ampliacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    LICENCIAS_fecha_emisionL_ampliacion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: "LICENCIAS",
    timestamps: false,
  });

  return Licencia;
};
