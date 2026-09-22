const productoDao = require("../dao/productoDao");
const categoriaDao = require("../dao/categoriaDao");

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
        const { nombre, descripcion, categoria, precio, stock, descuento } = req.body;

        // Validacion datos
        const validacion = await validarDatosAgregar(nombre, descripcion, categoria, precio, stock, descuento);

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

/**
 * Valida los datos de un producto antes de agregarlo a la base de datos.
 *
 * Realiza validaciones semánticas sobre el nombre, descripción, categoría,
 * precio, stock y descuento. También verifica en la base de datos que
 * la categoría especificada exista.
 *
 * @async
 * @param {string} nombre - Nombre del producto.
 * @param {string} descripcion - Descripción del producto.
 * @param {string} categoria - Categoría a la que pertenece el producto.
 * @param {number} precio - Precio del producto, entre 0 y 9999.
 * @param {number} stock - Cantidad disponible del producto, entre 0 y 9999.
 * @param {number} descuento - Descuento del producto, expresado como decimal entre 0 y 1.
 * @returns {Promise<{esValido: boolean, mensaje: string}>} Resultado de la validación.
 */
async function validarDatosAgregar(nombre, descripcion, categoria, precio, stock, descuento) {
    if (nombre.trim() === "") {
        return { esValido: false, mensaje: "El nombre del producto no puede estar vacío." };
    }

    if (descripcion.trim() === "") {
        return { esValido: false, mensaje: "La descripción del producto no puede estar vacía." };
    }

    if (categoria.trim() === "") {
        return { esValido: false, mensaje: "La categoria del producto no puede estar vacía." };
    }

    // Verificar si la categoría ya existe
    const categoriaExiste = await categoriaDao.existeCategoria(categoria.toLowerCase());

    // Si la categoría no existe, se regresa un false, pues no se puede agregar con una categoria fantasma
    if (!categoriaExiste) {
        return { esValido: false, mensaje: "No existe la categoria especificada" };
    }

    if (!Number.isFinite(precio) || precio < 0 || precio > 9999) {
        return { esValido: false, mensaje: "El precio debe ser un número entre 0 y 9999." };
    }

    if (!Number.isInteger(stock) || stock < 0 || stock > 9999) {
        return { esValido: false, mensaje: "El stock debe ser un número entero entre 0 y 9999." };
    }

    if (typeof descuento !== "number" || !Number.isFinite(descuento) || descuento < 0 || descuento > 1) {
        return { esValido: false, mensaje: "El descuento debe ser un número decimal entre 0 y 1." };
    }

    return { esValido: true, mensaje: "" };
}


/**
 * Consulta el catálogo de productos con opción de búsqueda y filtros.
 * @async
 * @function consultarCatalogo
 * @param {Object} req - Objeto de petición HTTP (puede recibir 'busqueda' por query params).
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Lista de productos filtrados o mensaje de error.
 */
const consultarCatalogo = async (req, res) => {
    try {

        const { busqueda } = req.query;

        const productos = await productoDao.obtenerProductos(busqueda || "");

        return res.status(200).json({
            ok: true,
            productos: productos,
            total: productos.length
        });

    } catch (error) {
        console.error("Error al consultar el catálogo en el controlador:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al consultar el catálogo de productos"
        });
    }
};

const consultarInventarioYReportes = (req, res) => {
    try {
        const reporte = productoDao.obtenerReporteInventario();
        return res.status(200).json({
            ok: true,
            totalExistencias: reporte.totalExistencias,
            productos: reporte.productos
        });
    } catch (error) {
        console.error("Error al generar reporte de inventario:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error al obtener el reporte de inventario"
        });
    }
};

module.exports = {
    agregarProducto,
    consultarCatalogo,
    consultarInventarioYReportes,
};
