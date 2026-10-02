const productoDao = require("../dao/productoDao");
const categoriaDao = require("../dao/categoriaDao");

/**
 * Guarda los datos de un producto.
 *
 * @async
 * @function agregarProducto
 * @param {Object} req - Objeto de petición HTTP con los datos del producto en el cuerpo.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Respuesta HTTP indicando si el producto fue creado o actualizado.
 */
const agregarProducto = async (req, res) => {
    try {
        const { nombre, descripcion, categoria, precio, stock } = req.body;

        // Validacion datos
        const validacion = await validarDatosAgregar(nombre, descripcion, categoria, precio, stock);

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
 * precio, stock. También verifica en la base de datos que
 * la categoría especificada exista.
 *
 * @async
 * @param {string} nombre - Nombre del producto.
 * @param {string} descripcion - Descripción del producto.
 * @param {string} categoria - Categoría a la que pertenece el producto.
 * @param {number} precio - Precio del producto, entre 0 y 9999.
 * @param {number} stock - Cantidad disponible del producto, entre 0 y 9999.
 * @returns {Promise<{esValido: boolean, mensaje: string}>} Resultado de la validación.
 */
async function validarDatosAgregar(nombre, descripcion, categoria, precio, stock) {
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

/**
 * Elimina un producto.
 *
 * @async
 * @function guardarAlumno
 * @param {Object} req - Objeto de petición HTTP con los datos del producto en el cuerpo.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Respuesta HTTP indicando si el producto fue eliminado.
 */
const eliminarProducto = async (req, res) => {
    try {
        const idProducto = req.params.id;

        if (!idProducto) {
            return res.status(500).json({
                ok: false,
                mensaje: "Ingrese un id valido"
            });
        }

        const productoExiste = await productoDao.existeProductoId(idProducto);

        // Si el producto no existe con el mismo id, se regresa un error de elemento no encontrado
        if (!productoExiste) {
            return res.status(500).json({
                ok: false,
                mensaje: "El id de producto no se encuentra registrado"
            });
        }

        // Creacion de nuevo alumno
        const productoEliminado = await productoDao.eliminarProducto(idProducto);

        // Validacion creacion de producto
        if (productoEliminado.ok) {
            return res.status(201).json({
                ok: true,
                mensaje: "Producto eliminado correctamente"
            });
        } else {
            // Devolucion de eliminacion fallida
            return res.status(201).json({
                ok: true,
                mensaje: "Producto no se pudo eliminar"
            });
        }

    } catch (error) {
        // Resolucion en caso de error
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al eliminar el producto"
        });
    }
};

/**
 * Realiza el ajuste de inventario por merma o daño de un producto.
 * 
 * @async
 * @function ajustarMerma
 * @param {Object} req - Objeto de petición HTTP con idProducto, cantidadAjustar y causa en el cuerpo.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} Respuesta HTTP indicando el resultado del ajuste.
 */
const ajustarMerma = async (req, res) => {
    try {
        const { idProducto, cantidadAjustar, causa } = req.body;

        if (!idProducto || !cantidadAjustar || !causa || causa.trim() === "") {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan datos obligatorios (idProducto, cantidadAjustar, causa)."
            });
        }

        // Verificar si el producto existe
        const productoExiste = await productoDao.existeProductoId(idProducto);
        if (!productoExiste) {
            return res.status(404).json({
                ok: false,
                mensaje: "El ID del producto no se encuentra registrado."
            });
        }

        // Ejecutar el ajuste en el DAO
        const resultadoAjuste = productoDao.ajustarInventarioMerma({
            idProducto,
            cantidadAjustar: Number(cantidadAjustar),
            causa: causa.trim(),
            gerente: req.body.gerente
        });

        if (resultadoAjuste.ok) {
            return res.status(200).json({
                ok: true,
                mensaje: resultadoAjuste.mensaje
            });
        } else {
            return res.status(400).json({
                ok: false,
                mensaje: resultadoAjuste.mensaje
            });
        }

    } catch (error) {
        console.error("Error en el servidor al ajustar inventario por merma:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al realizar el ajuste de inventario."
        });
    }
};
//Modifica la información y existencias de un producto específico en el inventario.
async function actualizarProducto(req, res) {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;

        const resultado = await productoDao.actualizarProducto(id, datosActualizados);

        if (!resultado || !resultado.ok) {
            return res.status(404).json({
                ok: false,
                mensaje: resultado?.mensaje || "Producto no encontrado."
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: "Producto modificado con éxito."
        });
    } catch (error) {
        console.error("Error en actualizarProducto:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error interno al actualizar el producto."
        });
    }
}

module.exports = {
    agregarProducto,
    consultarCatalogo,
    consultarInventarioYReportes,
    eliminarProducto,
    ajustarMerma,
    actualizarProducto
};
