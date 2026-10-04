const express = require("express");
const router = express.Router();

const productoControlador = require("../controladores/productoControlador");

const autenticar = require("../middleware/autenticacion");
const autorizar = require("../middleware/autorizacion");

//definir rutas sobre productos

/**
 * @name POST /
 * @description Registra un nuevo producto.
 */
router.post("/", autenticar, autorizar("administrador"), productoControlador.agregarProducto);

/**
 * @name GET /
 * @description Consulta el catálogo de productos con opciones de búsqueda y filtro.
 */
router.get("/", autenticar, autorizar("administrador"), productoControlador.consultarCatalogo);

/**
 * @name DELETE /
 * @description Elimina un producto por su id.
 */
router.delete("/:id", autenticar, autorizar("administrador"), productoControlador.eliminarProducto);

router.get("/inventario-reportes", productoControlador.consultarInventarioYReportes);
/**
 * @name POST /merma
 * @description Realiza un ajuste de inventario por merma o daño especificando la causa.
 */
router.post("/merma", productoControlador.ajustarMerma);

/** 
 * @name PUT
 * Modifica los datos de un producto existente.
 */
router.put('/:id', autenticar, autorizar("administrador"), productoControlador.actualizarProducto);

module.exports = router;