const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
//const { authenticate, requireRole } = require("../middleware/authMiddleware");
const { authenticate } = require("../middleware/authMiddleware");

// El usuario deben estar autenticado
router.use(authenticate);

router.get("/usuarios", userController.getAllUsers);
router.get("/usuarios/:id", userController.getUserById);
router.post("/crearusuarios", userController.createUser);
router.put("/usuarios/:id_usuario", userController.updateUser);
router.put("/usuarios/:id_usuario/en-funciones", userController.actualizarEstadoEnFuncion);
router.delete("/usuarios/:id", userController.deleteUser);

module.exports = router;


// router.get("/usuarios", authenticate, userController.getAllUsers);
// // Solo DIRECTOR o SUBDIRECTOR (id rol 1 o 2) pueden crear, editar y eliminar
// router.get("/usuarios/:id", authenticate, requireRole(["DIRECTOR", "SUBDIRECTOR", "DIRECTORA", "SUBDIRECTORA"]), userController.getUserById);
// router.post("/crearusuarios", requireRole(["DIRECTOR", "SUBDIRECTOR"]), userController.createUser);
// router.put("/usuarios/:id_usuario", requireRole(["DIRECTOR", "SUBDIRECTOR","DIRECTORA", "SUBDIRECTORA"]), userController.updateUser);
// router.put('/usuarios/:id_usuario/en-funciones', userController.actualizarEstadoEnFuncion);
// router.delete("/usuarios/:id", requireRole(["DIRECTOR", "SUBDIRECTOR"]), userController.deleteUser);
