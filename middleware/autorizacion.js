/**
 * Crea un middleware para verificar que el usuario tenga
 * uno de los puestos autorizados para acceder a una función.
 *
 * @param {...string} puestosPermitidos Puestos que tienen permiso para acceder.
 * @returns {Function} Middleware de autorización.
 */
const autorizar = (...puestosPermitidos) => {

    return (req, res, next) => {

        if (!req.usuario) {
            return res.status(401).json({
                ok: false,
                mensaje: "Usuario no autenticado."
            });
        }

        if (!puestosPermitidos.includes(req.usuario.puesto)) {
            return res.status(403).json({
                ok: false,
                mensaje: "No tienes permiso para realizar esta acción."
            });
        }

        next();
    };
};

module.exports = autorizar;