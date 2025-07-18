const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Nomenclatura = sequelize.define(
    "Nomenclatura",
    {
      id_nomenclatura: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      fecha_emisionN: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true,
      },
      fecha_vencimientoN: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      direccion_solici: {
        type: DataTypes.STRING(250),
        allowNull: false,
      },
      documento: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      PROPIETARIOS_cui: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      TIPO_NOMENCLATURA_id_tipoNomenclatura: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      USUARIOS_id_usuario_firma: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "USUARIOS",
          key: "id_usuario",
        },
      },
    },
    {
      tableName: "NOMENCLATURAS",
      timestamps: false,
    }
  );

  return Nomenclatura;
};
