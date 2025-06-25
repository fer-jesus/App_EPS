const { ROL_NOMBRE, ROL } = require("../../config/sequelize");

const getRolesPorSexo = async (sexo) => {
  try {
    const roles = await ROL_NOMBRE.findAll({
      where: { sexo },
      include: {
        model: ROL,
        as: "rol", 
        attributes: ["id_rol"]
      },
      attributes: ["id_rol_nombre", "nombre"]
    });

    return roles.map((rolNombre) => ({
      id: rolNombre.rol.id_rol,
      nombre: rolNombre.nombre
    }));
  } catch (error) {
    console.error("Error al obtener roles por sexo:", error);
    throw error;
  }
};

module.exports = { getRolesPorSexo };
