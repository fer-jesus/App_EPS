module.exports = (sequelize, DataTypes) => {
  const UsuarioFirma = sequelize.define(
    "UsuarioFirma",
    {
      USUARIOS_id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "USUARIOS",
          key: "id_usuario",
        },
      },
      LICENCIAS_id_licencia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "LICENCIAS",
          key: "id_licencia",
        },
      },
      LICENCIAS_fecha_emisionL: {
        type: DataTypes.DATEONLY,
        primaryKey: true,
        allowNull: false,
        references: {
          model: "LICENCIAS",
          key: "fecha_emisionL",
        },
      },
    },
    {
      tableName: "USUARIO_FIRMA",
      timestamps: false,
    }
  );

  return UsuarioFirma;
};
