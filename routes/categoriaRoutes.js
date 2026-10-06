const express = require("express");
const router = express.Router();

const categoriaControlador = require("../controladores/categoriaControlador");

const autenticar = require("../middleware/autenticacion");
const autorizar = require("../middleware/autorizacion");

//definir rutas sobre productos

/**
 * @name POST /
 * @description Registra una nueva categoria.
 */
router.post("/", autenticar, autorizar("administrador"), categoriaControlador.agregarCategoria);

/**
 * @name GET /
 * @description Consulta las categorias disponibles.
 */
router.get("/", autenticar, autorizar("administrador"), categoriaControlador.obtenerCategorias);

module.exports = router;