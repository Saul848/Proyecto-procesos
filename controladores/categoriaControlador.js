const categoriaDao = require("../dao/categoriaDao");

/**
 * Guarda los datos de una categoría.
 *
 * @async
 * @function agregarCategoria
 * @param {Object} req - Objeto de petición HTTP con los datos de la categoría en el cuerpo.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Respuesta HTTP indicando si la categoría fue creada.
 */
const agregarCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;

        // Validación de datos
        const validacion = validarDatosAgregar(nombre);

        if (!validacion.esValido) {
            return res.status(400).json({
                ok: false,
                mensaje: validacion.mensaje
            });
        }

        // Verificar si la categoría ya existe
        const categoriaExiste = await categoriaDao.existeCategoria(
            nombre.toLowerCase()
        );

        // Si la categoría existe, se regresa un error de duplicidad
        if (categoriaExiste) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre de la categoría ya existe"
            });
        }

        // Creación de la nueva categoría
        const categoriaCreada = await categoriaDao.agregarCategoria(req.body);

        // Validación de creación de categoría
        if (categoriaCreada.ok) {
            return res.status(201).json({
                ok: true,
                mensaje: "Categoría agregada correctamente"
            });
        } else {
            return res.status(500).json({
                ok: false,
                mensaje: "La categoría no se pudo agregar"
            });
        }

    } catch (error) {
        console.error("Error al agregar la categoría:", error);

        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al agregar la categoría"
        });
    }
};


/**
 * Valida los datos necesarios para agregar una categoría.
 *
 * @param {string} nombre - Nombre de la categoría.
 * @returns {Object} Resultado de la validación.
 */
function validarDatosAgregar(nombre) {

    if (typeof nombre !== "string" || nombre.trim() === "") {
        return {
            esValido: false,
            mensaje: "El nombre de la categoría no puede estar vacío."
        };
    }

    return {
        esValido: true,
        mensaje: ""
    };
}


/**
 * Obtiene las categorías disponibles.
 *
 * @async
 * @function obtenerCategorias
 * @param {Object} req - Objeto de petición HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Lista de categorías disponibles.
 */
const obtenerCategorias = async (req, res) => {
    try {

        const categorias = await categoriaDao.obtenerCategorias();

        return res.status(200).json({
            ok: true,
            categorias: categorias
        });

    } catch (error) {
        console.error(
            "Error al consultar las categorías en el controlador:",
            error
        );

        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al consultar las categorías"
        });
    }
};


module.exports = {
    agregarCategoria,
    obtenerCategorias
};