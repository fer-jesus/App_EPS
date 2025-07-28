async function setUsuarioId(sequelize, usuarioId, transaction = null) {
if (!usuarioId) throw new Error("usuarioId es requerido para setUsuarioId");

    await sequelize.query("SET @usuario_id = :id_usuario", {
    replacements: { id_usuario: usuarioId },
    transaction,
  });
}

module.exports = { setUsuarioId };