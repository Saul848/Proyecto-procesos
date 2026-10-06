const express = require("express");
const router = express.Router();
const corteController = require("../controladores/corteControlador");

// Ruta para realizar el cierre de caja y arqueo
router.post("/realizar-corte", corteController.realizarCorteCaja);

module.exports = router;