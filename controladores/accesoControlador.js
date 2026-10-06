const accesoDao = require("../dao/accesoDao");

/**
 * Registra un acceso (entrada o salida) de un empleado en la bitácora.
 * 
 * @async
 * @function registrarAcceso
 * @param {Object} req - Petición HTTP.
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} [req.body.nombre] - Nombre del empleado (opcional).
 * @param {string} req.body.usuario - Usuario del empleado (obligatorio).
 * @param {string} [req.body.puesto] - Puesto del empleado (opcional).
 * @param {string} req.body.evento - Tipo de evento: "entrada" o "salida" (obligatorio).
 * @param {Object} res - Respuesta HTTP.
 * @returns {Object} Respuesta JSON con el resultado de la operación.
 */
exports.registrarAcceso = async(req, res) => {
    try{
        const {nombre, usuario, puesto, evento} = req.body;

        if(!usuario || !evento){
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario y el evento son obligatorios"
            });
        }

        const resultado = await accesoDao.registrarAcceso(nombre, usuario, puesto, evento);

        if(resultado.ok){
            return res.status(200).json({
                ok: true,
                mensaje: "Acceso registrado correctamente"
            });
        }

    } catch(error){
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al registrar el acceso"
        });
    }
};

/**
 * Obtiene el historial de accesos registrados en la bitácora.
 * 
 * @async
 * @function obtenerAccesos
 * @param {Object} req - Petición HTTP.
 * @param {Object} res - Respuesta HTTP.
 * @returns {Object} Respuesta JSON con el arreglo de accesos en "data".
 */
exports.obtenerAccesos = async(req, res) => {
    try{
        const accesos = await accesoDao.obtenerAccesos();

        return res.status(200).json({
            ok: true,
            mensaje: "Accesos obtenidos correctamente",
            data: accesos
        });
    }catch(error){
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al obtener los accesos"
        });
    }
};