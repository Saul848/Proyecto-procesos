const express = require("express");
const router = express.Router();

const ofertaControlador = require("../controladores/ofertaControlador");

router.get("/", ofertaControlador.listarOfertas);
router.get("/historial", ofertaControlador.obtenerHistorial);
router.post("/", ofertaControlador.crearOferta);
router.delete("/:id", ofertaControlador.eliminarOferta);

module.exports = router;