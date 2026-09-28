const cajaDao = require('../dao/cajaDao.js'); // Asegúrate de que la ruta sea correcta hacia tu archivo dao

function procesarMovimiento(req, res) {
    try {
        // Extraemos también el usuario y contraseña del gerente/admin que vienen del frontend
        const { tipoMovimiento, idCaja, monto, motivo, usuarioAutoriza, passwordAutoriza } = req.body;

        if (!monto || monto <= 0) {
            return res.status(400).json({ ok: false, mensaje: "Monto inválido." });
        }

        const resultado = cajaDao.registrarMovimientoCaja({
            tipoMovimiento,
            idCaja,
            monto: parseFloat(monto),
            motivo,
            usuarioAutoriza,
            passwordAutoriza
        });

        res.status(200).json({
            ok: true,
            mensaje: "Movimiento aplicado correctamente.",
            resultado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: error.message
        });
    }
}

module.exports = {
    procesarMovimiento
};