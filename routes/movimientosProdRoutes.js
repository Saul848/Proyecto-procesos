const express = require("express");
const router = express.Router();

const movimientoProdControlador = require("../controladores/movimientoProdControlador");

//definir rutas sobre productos

/**
 * @name GET /
 * @description Consulta el historial de movimientos en el inventario
 */
router.get("/", movimientoProdControlador.consultarMovimientos);

module.exports = router;