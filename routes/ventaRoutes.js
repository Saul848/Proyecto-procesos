/**
 * Enrutador para el módulo de ventas y operaciones de caja.
 * Define los endpoints para consultar el folio actual, gestionar el estado de la caja registradora
 * y procesar el cobro y liquidación de transacciones.
 * @module routes/ventaRoutes
 */

const express = require("express");
const router = express.Router();
const ventaControlador = require("../controladores/ventaControlador");

/**
 * Consulta el estado actual de la caja (abierta o cerrada).
 * @name GET /api/ventas/caja/estado
 * @function
 * @memberof module:routes/ventaRoutes
 * @returns {Object} 200 - { cajaAbierta: boolean }
 */
router.get("/caja/estado", ventaControlador.obtenerEstadoCaja);

/**
 * Cambia el estado de la caja registradora (abrir o cerrar).
 * @name POST /api/ventas/caja/estado
 * @function
 * @memberof module:routes/ventaRoutes
 * @param {boolean} req.body.abierta - Nuevo estado booleano para la caja.
 * @returns {Object} 200 - { mensaje: string, cajaAbierta: boolean }
 */
router.post("/caja/estado", ventaControlador.cambiarEstadoCaja);

/**
 * Procesa y registra una venta, descuenta inventario, aplica promociones e incrementa métricas de empleados.
 * @name POST /api/ventas/confirmar
 * @function
 * @memberof module:routes/ventaRoutes
 * @param {string|number} req.body.idEmpleado - Identificador del cajero o vendedor responsable.
 * @param {Array<{idProducto: string|number, cantidad: number}>} req.body.items - Productos a liquidar.
 * @returns {Object} 200 - { ok: true, mensaje: string, ticket: Object }
 * @returns {Object} 400 - { ok: false, mensaje: string, error?: string }
 */
router.post("/confirmar", ventaControlador.procesarVenta);

/**
 * Obtiene el próximo número de folio consecutivo disponible para registrar una venta.
 * @name GET /api/ventas/folio/siguiente
 * @function
 * @memberof module:routes/ventaRoutes
 * @returns {Object} 200 - { siguienteFolio: string }
 * @returns {Object} 500 - { siguienteFolio: "1" }
 */
router.get("/folio/siguiente", ventaControlador.obtenerProximoFolio);

/**
 * @name GET /historial
 * @description Obtiene el historial de ventas filtrado por rango de fechas o empleado
 */
router.get("/historial", ventaControlador.obtenerHistorialVentas);

module.exports = router;