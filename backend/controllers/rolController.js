const db = require("../config/database.js");

 const getRolesBySexo = async (req, res) => {
  const { sexo } = req.query;

  if (!sexo || !["M", "F"].includes(sexo)) {
    return res.status(400).json({ error: "Sexo inválido (debe ser 'M' o 'F')" });
  }

  try {
    const [roles] = await db.query(`
      SELECT ROL.id_rol, ROL_NOMBRE.nombre_rol
      FROM ROL
      JOIN ROL_NOMBRE ON ROL.id_rol = ROL_NOMBRE.ROL_id_rol
      WHERE ROL_NOMBRE.sexo = ?
    `, [sexo]);

    res.json(roles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { getRolesBySexo };