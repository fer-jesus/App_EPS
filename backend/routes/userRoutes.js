const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireRole } = require("../middleware/authMiddleware");

router.get("/usuarios", userController.getAllUsers);
// Solo DIRECTOR o SUBDIRECTOR (id rol 1 o 2) pueden crear, editar y eliminar
router.get("/usuarios/:id", requireRole(["DIRECTOR", "SUBDIRECTOR", "DIRECTORA", "SUBDIRECTORA"]), userController.getUserById);
router.post("/crearusuarios", requireRole(["DIRECTOR", "SUBDIRECTOR"]), userController.createUser);
router.put("/usuarios/:id_usuario", requireRole(["DIRECTOR", "SUBDIRECTOR","DIRECTORA", "SUBDIRECTORA"]), userController.updateUser);
router.put('/usuarios/:id_usuario/en-funciones', userController.actualizarEstadoEnFuncion);
router.delete("/usuarios/:id", requireRole(["DIRECTOR", "SUBDIRECTOR"]), userController.deleteUser);

module.exports = router;
