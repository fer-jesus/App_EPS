const pool = require("../config/database");

const Rol = {
  async obtenerPorSexo(sexo) {
    const [roles] = await pool.query(`
      SELECT ROL.id_rol, ROL_NOMBRE.nombre_rol
      FROM ROL
      JOIN ROL_NOMBRE ON ROL.id_rol = ROL_NOMBRE.ROL_id_rol
      WHERE ROL_NOMBRE.sexo = ?
    `, [sexo]);

    return roles;
  }
};

module.exports = Rol;
