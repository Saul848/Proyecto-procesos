const movimientoProdDao = require("../dao/movimientoProdDao");

/**
 * Consulta el historial de movimientos sobre el inventario de productos (altas, bajas, cambios)
 * @async
 * @function consultarMovimientos
 * @param {Object} req - Objeto de petición HTTP (puede recibir 'busqueda' por query params).
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Lista de productos filtrados o mensaje de error.
 */
const consultarMovimientos = async (req, res) => {
    try {
        const movimientos = await movimientoProdDao.obtenerMovimientos();

        if (!movimientos || movimientos.length === 0) {
            console.log("no hay");

            return res.status(200).json({
                ok: false,
                movimientos: [],
                mensaje: "No se encontraron movimientos registrados"
            });
        }

        return res.status(200).json({
            ok: true,
            movimientos: movimientos,
            mensaje: "Movimientos encontrados"
        });
    } catch (error) {
        console.error("Error al consultar el historial de movimientos sobre productos:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al consultar el historial de movimientos sobre productos"
        });
    }
};

module.exports = {
    consultarMovimientos
};