const transaccionDao = require('../dao/transaccionDao');

/**
 * Procesa y registra una nueva transacción de cliente (recarga o pago de servicio).
 */
function registrarTransaccion(req, res) {
    try {
        const { tipo, companiaServicio, referencia, cliente, monto, idEmpleado } = req.body;

        // 1. Validaciones básicas de entrada
        if (!tipo || !referencia || monto === undefined || monto === null) {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan campos obligatorios (tipo, referencia o monto)."
            });
        }

        const montoNumerico = parseFloat(monto);
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El monto debe ser un valor numérico mayor a cero."
            });
        }

        // 2. Validación específica por tipo de transacción
        const tipoNormalizado = String(tipo).toUpperCase();

        if (tipoNormalizado === "RECARGA") {
            const soloDigitos = String(referencia).trim().replace(/\D/g, "");
            if (soloDigitos.length !== 10) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Para recargas telefónicas, el número debe ser de exactamente 10 dígitos."
                });
            }
        } else if (tipoNormalizado === "SERVICIO") {
            if (String(referencia).trim().length < 4) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La referencia del servicio debe tener al menos 4 caracteres."
                });
            }
        } else {
            return res.status(400).json({
                ok: false,
                mensaje: "Tipo de transacción no válido. Debe ser RECARGA o SERVICIO."
            });
        }

        // 3. Persistir usando el DAO
        const nuevaTransaccion = transaccionDao.registrarTransaccion({
            tipo: tipoNormalizado,
            companiaServicio: companiaServicio || "N/A",
            referencia: String(referencia).trim(),
            cliente: cliente ? String(cliente).trim() : "Público General",
            monto: montoNumerico,
            idEmpleado: idEmpleado || "1"
        });

        return res.status(201).json({
            ok: true,
            mensaje: "Transacción registrada exitosamente.",
            transaccion: nuevaTransaccion
        });

    } catch (error) {
        console.error("Error en transaccionControlador.registrarTransaccion:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error interno del servidor al procesar la transacción."
        });
    }
}

/**
 * Consulta el histórico de todas las transacciones registradas.
 */
function listarTransacciones(req, res) {
    try {
        const transacciones = transaccionDao.obtenerTodasLasTransacciones();
        return res.status(200).json({
            ok: true,
            transacciones
        });
    } catch (error) {
        console.error("Error en transaccionControlador.listarTransacciones:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error al recuperar las transacciones."
        });
    }
}

module.exports = {
    registrarTransaccion,
    listarTransacciones
};