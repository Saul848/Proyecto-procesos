const express = require("express");
const router = express.Router();

const ofertaControlador = require("../controladores/ofertaControlador");

/**
 * Obtiene la lista de ofertas vigentes (disponibles o próximas).
 * @name GET /api/ofertas
 */
router.get("/", ofertaControlador.listarOfertas);

/**
 * Obtiene el historial de acciones sobre ofertas (crear/eliminar).
 * @name GET /api/ofertas/historial
 */
router.get("/historial", ofertaControlador.obtenerHistorial);

/**
 * Crea una nueva oferta.
 * @name POST /api/ofertas
 */
router.post("/", ofertaControlador.crearOferta);

/**
 * Elimina una oferta por su ID.
 * @name DELETE /api/ofertas/:id
 */
router.delete("/:id", ofertaControlador.eliminarOferta);

module.exports = router;