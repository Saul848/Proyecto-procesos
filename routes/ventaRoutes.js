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
 */
router.get("/caja/estado", ventaControlador.obtenerEstadoCaja);

/**
 * Cambia el estado de la caja registradora (abrir o cerrar).
 * @name POST /api/ventas/caja/estado
 */
router.post("/caja/estado", ventaControlador.cambiarEstadoCaja);

/**
 * Procesa y registra una venta, descuenta inventario, aplica promociones e incrementa métricas de empleados.
 * @name POST /api/ventas/confirmar
 */
router.post("/confirmar", ventaControlador.procesarVenta);

/**
 * Obtiene el próximo número de folio consecutivo disponible para registrar una venta.
 * @name GET /api/ventas/folio/siguiente
 */
router.get("/folio/siguiente", ventaControlador.obtenerProximoFolio);

/**
 * Consulta el listado completo de ventas registradas en el historial.
 * @name GET /api/ventas
 */
router.get("/", ventaControlador.listarVentas);

/**
 * Consulta el detalle de una venta específica por folio o ID para corroborar y reimprimir el ticket.
 * @name GET /api/ventas/:id
 */
router.get("/:id", ventaControlador.obtenerVentaPorId);
/**  
 * @name GET /historial
 * @description Obtiene el historial de ventas filtrado por rango de fechas o empleado
 */
router.get("/historial", ventaControlador.obtenerHistorialVentas);

router.post("/devolucion", ventaControlador.devolverProducto);

module.exports = router;