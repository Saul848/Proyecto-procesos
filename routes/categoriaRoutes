const express = require("express");
const router = express.Router();

const categoriaControlador = require("../controladores/categoriaControlador");

//definir rutas sobre productos

/**
 * @name POST /
 * @description Registra una nueva categoria.
 */
router.post("/", categoriaControlador.agregarCategoria);

/**
 * @name GET /
 * @description Consulta las categorias disponibles.
 */
router.get("/", categoriaControlador.obtenerCategorias);

module.exports = router;