const express = require("express");
const router = express.Router();

const productoControlador = require("../controladores/productoControlador");

//definir rutas sobre productos

/**
 * @name POST /
 * @description Registra un nuevo producto.
 */
router.post("/", productoControlador.agregarProducto);

/**
 * @name GET /
 * @description Consulta el catálogo de productos con opciones de búsqueda y filtro.
 */
router.get("/", productoControlador.consultarCatalogo);

router.get("/inventario-reportes", productoControlador.consultarInventarioYReportes);

module.exports = router;