const productoDao = require("../dao/productoDao");

/**
 * Guarda los datos de un producto.
 *
 * @async
 * @function guardarAlumno
 * @param {Object} req - Objeto de petición HTTP con los datos del producto en el cuerpo.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Respuesta HTTP indicando si el producto fue creado o actualizado.
 */
agregarProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;

        // Validacion datos
        const validacion = validarDatosAgregar(nombre, descripcion, precio, stock);

        if (!validacion.esValido) {
            return res.status(500).json({
                ok: false,
                mensaje: validacion.mensaje
            });
        }
        
        const productoExiste = await productoDao.existeProducto(nombre.toLowerCase());

        // Si el producto existe con el mismo nombre, se regresa un error de duplicidad en el nombre
        if (productoExiste) {
            return res.status(500).json({
                ok: false,
                mensaje: "El nombre del producto ya existe"
            });
        }

        // Creacion de nuevo alumno
        const productoCreado = await productoDao.agregarProducto(req.body);

        // Validacion creacion de producto
        if (productoCreado.ok) {
            return res.status(201).json({
                ok: true,
                mensaje: "Producto agregado correctamente"
            });
        } else {
            // Devolucion de creacion fallida
            return res.status(201).json({
                ok: true,
                mensaje: "Producto no se pudo agregar"
            });
        }

    } catch (error) {
        // Resolucion en caso de error
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al agregar el producto"
        });
    }
};


function validarDatosAgregar(nombre, descripcion, precio, stock) {
    if (nombre.trim() === "") {
        return { esValido: false, mensaje: "El nombre del producto no puede estar vacío." };
    }

    if (descripcion.trim() === "") {
        return { esValido: false, mensaje: "La descripción del producto no puede estar vacía." };
    }

    if (!Number.isFinite(precio) || precio < 0 || precio > 9999) {
        return { esValido: false, mensaje: "El precio debe ser un número entre 0 y 9999." };
    }

    if (!Number.isInteger(stock) || stock < 0 || stock > 9999) {
        return { esValido: false, mensaje: "El stock debe ser un número entero entre 0 y 9999." };
    }

    return { esValido: true, mensaje: "" };
}


module.exports = {
    agregarProducto
};