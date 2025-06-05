const { getRolesPorSexo } = require("../models/rol/rol.service");

const getRolesBySexo = async (req, res) => {
  const { sexo } = req.query;

  if (!sexo || !["M", "F"].includes(sexo)) {
    return res.status(400).json({ error: "Sexo inválido (debe ser 'M' o 'F')" });
  }

  try {
    const roles = await getRolesPorSexo(sexo);
    res.json(roles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = { getRolesBySexo };
