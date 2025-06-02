
const pool = require('../config/database');

const Usuario = {

   async verificarCredenciales(correo, contrasena) {
    const [rows] = await pool.query(
      `SELECT u.*, r.nombre_rol 
       FROM USUARIOS u 
       JOIN ROL_NOMBRE r ON u.ROL_id_rol = r.ROL_id_rol AND u.sexo = r.sexo 
       WHERE u.correo = ? AND u.contrasena = ?`,
      [correo, contrasena]
    );
    return rows[0] || null;
  },


  async obtenerTodos() {
    const [rows] = await pool.query(`
      SELECT u.id_usuario, u.nombre, r.nombre_rol AS rol, u.en_funciones
      FROM USUARIOS u
      JOIN ROL_NOMBRE r ON u.ROL_id_rol = r.ROL_id_rol AND u.sexo = r.sexo
        where u.fecha_de_baja IS NULL
    `);
    return rows;
  },

  async obtenerPorId(id_usuario) {
  const [rows] = await pool.query(`
    SELECT 
      u.id_usuario, 
      u.nombre, 
      u.titulo, 
      u.fecha_nacimiento, 
      u.correo, 
      u.unidad, 
      u.sexo, 
      u.ROL_id_rol, 
      u.fecha_registro,
      u.fecha_de_baja, 
     CAST(u.en_funciones AS UNSIGNED) as en_funciones,
      r.nombre_rol AS rol
    FROM USUARIOS u
    JOIN ROL_NOMBRE r ON u.ROL_id_rol = r.ROL_id_rol AND u.sexo = r.sexo
    WHERE u.id_usuario = ?
  `, [id_usuario]);
  return rows[0] || null;
},

  async crear(data) {
    const { nombre, titulo, fecha_nacimiento, correo, contrasena, unidad,  sexo, ROL_id_rol, en_funciones = 1} = data;
    const [result] = await pool.query(
      `INSERT INTO USUARIOS (nombre, titulo, fecha_nacimiento, correo, contrasena, fecha_registro, unidad, sexo, ROL_id_rol, en_funciones)
       VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [nombre, titulo, fecha_nacimiento,  correo, contrasena, unidad, sexo, ROL_id_rol, en_funciones]
    );
    return result.insertId;
  },

 async actualizar(id, data) {
  const { 
    nombre, 
    titulo = null, 
    fecha_nacimiento, 
    fecha_registro,
    fecha_de_baja = null, 
    correo, 
    unidad, 
    sexo,
    ROL_id_rol,
    en_funciones = 1 
  } = data;

  const [result] = await pool.query(
    `UPDATE USUARIOS 
     SET nombre = ?, titulo = ?, fecha_nacimiento = ?, fecha_registro = ?, fecha_de_baja = ?,
         correo = ?, unidad = ?, sexo = ?, ROL_id_rol = ?, en_funciones = ?
     WHERE id_usuario = ?`,
    [nombre, titulo, fecha_nacimiento, fecha_registro, fecha_de_baja, correo, unidad, sexo, ROL_id_rol, en_funciones, id]
  );

  if (result.affectedRows === 0) {
    throw new Error('Usuario no encontrado o no se realizaron cambios');
  }

  return result;
},

  async actualizarEstadoFuncion(id_usuario, en_funciones) {
    try {
      await pool.query(
        "UPDATE USUARIOS SET en_funciones = ? WHERE id_usuario = ?",
        [en_funciones, id_usuario]
      );
    } catch (error) {
      throw error;
    }
  },


 async eliminar(id) {
  // Verificamos si es DIRECTOR o SUBDIRECTOR
  const [rows] = await pool.query(
    `SELECT r.nombre_rol 
     FROM USUARIOS u
     JOIN ROL_NOMBRE r ON u.ROL_id_rol = r.ROL_id_rol AND u.sexo = r.sexo
     WHERE u.id_usuario = ?`,
    [id]
  );

  const rolUsuario = rows[0]?.nombre_rol;

  if (rolUsuario === "DIRECTOR" || rolUsuario === "SUBDIRECTOR") {
    const err = new Error("No se puede eliminar al usuario DIRECTOR o SUBDIRECTOR");
    err.code = "NO_DELETE_PRIVILEGED_ROLE";
    throw err;
  }

  // Eliminación lógica
  await pool.query(
    `UPDATE USUARIOS SET fecha_de_baja = NOW() WHERE id_usuario = ?`,
    [id]
  );

  return { success: true };
}


};
module.exports = Usuario;
