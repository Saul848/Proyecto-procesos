/**
 * Controlador para la gestión de ventas, folios y estado de caja.
 * @module controladores/ventaControlador
 */

const ventaDao = require('../dao/ventaDao');

/**
 * Estado en memoria de la caja registradora.
 * @type {boolean}
 */
let cajaAbierta = true;

/**
 * Retorna el estado actual de la caja registradora.
 * 
 * @function obtenerEstadoCaja
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {void} JSON con la bandera `cajaAbierta`.
 */
function obtenerEstadoCaja(req, res) {
    res.json({ cajaAbierta });
}

/**
 * Modifica el estado de apertura/cierre de la caja registradora.
 * 
 * @function cambiarEstadoCaja
 * @param {import('express').Request} req - Petición con `{ abierta: boolean }` en el body.
 * @param {import('express').Response} res - Respuesta con mensaje confirmando el cambio.
 * @returns {void}
 */
function cambiarEstadoCaja(req, res) {
    const { abierta } = req.body;
    cajaAbierta = Boolean(abierta);
    res.json({
        mensaje: `El estado de la caja ha sido cambiado a ${cajaAbierta ? 'abierta' : 'cerrada'}.`,
        cajaAbierta
    });
}

/**
 * Procesa y registra una venta validando el estado de la caja y los productos recibidos.
 * 
 * @function procesarVenta
 * @param {import('express').Request} req - Objeto de petición que incluye `{ idEmpleado, items }`.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {void}
 */
function procesarVenta(req, res) {
    try {
        if (!cajaAbierta) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se puede procesar la venta porque la caja está cerrada.'
            });
        }

        const { idEmpleado, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se proporcionaron items válidos para la venta.'
            });
        }

        // Validación estructural de cada ítem
        const itemsInvalidos = items.some(
            (it) => !it.idProducto || isNaN(Number(it.cantidad)) || Number(it.cantidad) <= 0
        );

        if (itemsInvalidos) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Todos los productos deben contener un idProducto válido y una cantidad mayor a 0.'
            });
        }

        const resultado = ventaDao.registrarVenta({
            idEmpleado: idEmpleado || "1",
            items
        });
        

        res.status(200).json({
            ok: true,
            mensaje: 'Venta procesada exitosamente.',
            ticket: resultado.ticket
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al procesar la venta.',
            error: error.message
        });
    }
}

/**
 * Consulta y devuelve el próximo número de folio para la siguiente venta.
 * 
 * @function obtenerProximoFolio
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express con `{ siguienteFolio }`.
 * @returns {void}
 */
function obtenerProximoFolio(req, res) {
    try {
        const siguienteId = ventaDao.obtenerSiguienteIdVenta();
        res.json({ siguienteFolio: siguienteId });
    } catch (error) {
        res.status(500).json({ siguienteFolio: "1" });
    }
}
/**
 * Obtiene el historial de ventas filtrado por rango de fechas o empleado.
 * @param {Object} req  Objeto de petición HTTP (puede incluir query params: fechaInicio, fechaFin, idEmpleado).
 * @param {Object} res  Objeto de respuesta HTTP.
 */
function obtenerHistorialVentas(req, res) {
    try {
        const { fechaInicio, fechaFin, idEmpleado } = req.query;

        const filtros = {
            fechaInicio,
            fechaFin,
            idEmpleado
        };

        const ventasFiltradas = ventaDao.obtenerHistorialVentas(filtros);

        return res.status(200).json({
            ok: true,
            mensaje: "Historial de ventas obtenido correctamente",
            data: ventasFiltradas
        });
    } catch (error) {
        console.error("Error en el controlador al obtener historial de ventas:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al intentar obtener el historial de ventas"
        });
    }
}

/**
 * Consulta el historial completo de ventas registradas.
 * GET /api/ventas
 */
function listarVentas(req, res) {
    try {
        const ventas = ventaDao.obtenerVentas();
        res.json({ ok: true, ventas });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener historial de ventas.',
            error: error.message
        });
    }
}

/**
 * Consulta una venta específica por su identificador para reimpresión.
 * GET /api/ventas/:id
 */
function obtenerVentaPorId(req, res) {
    try {
        const { id } = req.params;
        const venta = ventaDao.obtenerVentaPorId(id);

        if (!venta) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Venta no encontrada.'
            });
        }

        res.json({ ok: true, venta });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener la venta.',
            error: error.message
        });
    }
}

module.exports = {
    obtenerEstadoCaja,
    cambiarEstadoCaja,
    procesarVenta,
    obtenerProximoFolio,
    listarVentas,
    obtenerVentaPorId,
    obtenerHistorialVentas
};