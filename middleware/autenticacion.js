const jwt = require("jsonwebtoken");

/**
 * Middleware para autenticar al usuario mediante un token JWT.
 *
 * @param {*} req Solicitud HTTP recibida.
 * @param {*} res Respuesta HTTP que se enviará al cliente.
 * @param {*} next Función que permite continuar con el siguiente middleware o ruta.
 * @returns Respuesta HTTP en caso de que el token no sea válido.
 */
const autenticar = (req, res, next) => {

    const encabezado = req.headers.authorization;

    // Verificamos que exista el encabezado
    if (!encabezado) {
        return res.status(401).json({
            ok: false,
            mensaje: "No se proporcionó un token."
        });
    }

    // Obtenemos el token después de "Bearer"
    const token = encabezado.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            ok: false,
            mensaje: "Token no proporcionado."
        });
    }

    try {

        // Verificamos que el token sea válido
        const datosUsuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Guardamos los datos del usuario para
        // que puedan ser utilizados posteriormente
        req.usuario = datosUsuario;

        next();

    } catch (error) {

        return res.status(401).json({
            ok: false,
            mensaje: "Token inválido o expirado."
        });
    }
};

module.exports = autenticar;