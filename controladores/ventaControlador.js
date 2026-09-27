const ventaDao = require('../dao/ventaDao');
let cajaAbierta = true;

function obtenerEstadoCaja(req, res) {
    res.json({ cajaAbierta });
}

function cambiarEstadoCaja(req, res) {
    const { abierta } = req.body;
    cajaAbierta = Boolean(abierta);
    res.json({
        mensaje: `El estado de la caja ha sido cambiado a ${cajaAbierta ? 'abierta' : 'cerrada'}.`,
        cajaAbierta
    });
}

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
