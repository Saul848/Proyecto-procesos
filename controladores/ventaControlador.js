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

        const { idEmpleado, idCaja, metodoPago, items } = req.body;

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
            idCaja: idCaja || "1",
            metodoPago: metodoPago || "Efectivo",
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

module.exports = {
    obtenerEstadoCaja,
    cambiarEstadoCaja,
    procesarVenta,
    obtenerProximoFolio
};