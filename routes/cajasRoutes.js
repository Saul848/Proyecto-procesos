const express = require("express");
const router = express.Router();
const cajaControlador = require("../controladores/cajaControlador");

router.post("/movimientoCaja", cajaControlador.procesarMovimiento);

module.exports = router;
