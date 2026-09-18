const express = require("express");
const router = express.Router();
const ventaControlador = require("../controladores/ventaControlador");

router.get("/caja/estado", ventaControlador.obtenerEstadoCaja);
router.post("/caja/estado", ventaControlador.cambiarEstadoCaja);
router.post("/confirmar", ventaControlador.procesarVenta);

module.exports = router;
