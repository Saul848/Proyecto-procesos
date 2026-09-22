const express = require("express");
const router = express.Router();

const ofertaControlador = require("../controladores/ofertaControlador");

router.get("/", ofertaControlador.listarOfertas);
router.post("/", ofertaControlador.crearOferta);
router.delete("/:id", ofertaControlador.eliminarOferta);

module.exports = router;