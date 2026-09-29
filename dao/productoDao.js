const Producto = require("../clases/producto");
const idProductoDao = require("./idProductoDao");
const movimientoProdDao = require("./movimientoProdDao");


const fs = require("fs");
const path = require('path');
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const archivo = path.join(__dirname, "../data/xml/productos.xml");

/**
 * Agrega un nuevo producto a la base de datos.
 *
 * Convierte el contenido del archivo XML a un objeto de JavaScript,
 * agrega el nuevo producto y posteriormente vuelve a generar el XML.
 *
 * @function agregarProducto
 * @param {Object} producto - Objeto que contiene los datos del alumno.
 * @param {string} producto.nombre - Nombre del producto.
 * @param {string} producto.descripcion - Descripcion del producto.
 * @param {string} producto.categoria - Categoria del producto.
 * @param {number} producto.precio - Precio del producto.
 * @param {number} producto.stock - Stock del producto.
 * @returns {Object} Resultado de la operación.
 * @throws {Error} Si ocurre un error al leer, modificar o escribir el archivo XML.
 */
function agregarProducto(producto) {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['producto'].includes(tagName)
        });

        // Convertir XML a Objeto de JS
        const resultado = parser.parse(xml);

        // Si el XML está vacío o no tiene la estructura,
        // crear la estructura inicial
        if (!resultado.productos) {
            resultado.productos = {
                producto: []
            };
        }

        const productos = resultado.productos?.producto || [];
        
        // Obtener el ID
        const nuevoId = idProductoDao.obtenerIdDisponible();

        const nuevoProducto = {
            "@_id": nuevoId,
            nombre: producto.nombre.toLowerCase().trim(),
            descripcion: producto.descripcion,
            categoria: producto.categoria.toLowerCase().trim(),
            precio: Number(producto.precio).toFixed(2),
            stock: Number(producto.stock)
        };

        // Agregar al arreglo existente
        productos.push(nuevoProducto);
        resultado.productos.producto = productos;

        // Convertir el objeto JS de vuelta a formato XML
        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });

        const nuevoXml = builder.build(resultado);

        // Sobrescribir el archivo XML en disco
        fs.writeFileSync(archivo, nuevoXml, "utf8");

        // Actualiza el siguiente id
        idProductoDao.guardarSiguienteId();

        // Registra el movimiento
        const date = new Date;
        const movimientoProd = {
            fecha: date.toLocaleDateString(),
            hora: date.toLocaleTimeString(),
            id_producto: nuevoProducto["@_id"],
            nombre_producto: nuevoProducto.nombre,
            tipo: "ALTA"
        }

        movimientoProdDao.agregarMovimiento(movimientoProd);

        return { ok: true };

    // Resolucion en caso de error
    } catch (error) {
        console.error("Error al agregar producto BD:", error);
        throw error;
    }
}

/**
 * Verifica si ya existe un producto registrado con el mismo nombre.
 * @param {string} nombre - Nombre del producto a verificar.
 * @returns {boolean} true si el producto existe, false si no.
 */
function existeProducto(nombre) {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['producto'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const productos = resultado.productos?.producto || [];

        // Normalizar nombre a buscar para comparación limpia
        const nombreBusqueda = nombre.trim().toLowerCase();

        // Retorna true tan pronto encuentra la primera coincidencia
        return productos.some((prod) => {
            const nombreProd = prod.nombre ? String(prod.nombre).trim().toLowerCase() : "";
            return nombreProd === nombreBusqueda;
        });

    } catch (error) {
        console.error("Error al verificar la existencia del producto:", error);
        throw error;
    }
}

/**
 * Verifica si ya existe un producto registrado con el mismo nombre.
 * @param {Number} idProducto - Id del producto a verificar.
 * @returns {boolean} true si el producto existe, false si no.
 */
function existeProductoId(idProducto) {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['producto'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const productos = resultado.productos?.producto || [];

        // Normalizar id a buscar para comparación limpia
        const idBusqueda = Number(idProducto);

        // Retorna true tan pronto encuentra la primera coincidencia
        return productos.some((prod) => {
            const idProd = prod["@_id"] ? String(prod["@_id"]).toLowerCase() : "";
            return Number(idProd) === idBusqueda;
        });

    } catch (error) {
        console.error("Error al verificar la existencia del producto:", error);
        throw error;
    }
}

/**
 * Obtiene la lista de productos, permitiendo filtrar por nombre, ID o categoría,
 * y verificando el estado del stock.
 * @param {string} [busqueda] Texto opcional para buscar por nombre o ID.
 * @returns {Array} Lista de productos filtrados.
 */
function obtenerProductos(busqueda = "") {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['producto'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        let productos = resultado.productos?.producto || [];

       
        if (busqueda && busqueda.trim() !== "") {
            const termino = busqueda.trim().toLowerCase();
            productos = productos.filter((prod) => {
                const idProd = prod["@_id"] ? String(prod["@_id"]).toLowerCase() : "";
                const nombreProd = prod.nombre ? String(prod.nombre).toLowerCase() : "";
                
                return idProd.includes(termino) || nombreProd.includes(termino);
            });
        }

       
        return productos.map((prod) => {
            const stockActual = Number(prod.stock) || 0;
            return {
                id: prod["@_id"],
                nombre: prod.nombre,
                descripcion: prod.descripcion,
                categoria: prod.categoria,
                precio: prod.precio,
                stock: stockActual,
                sinStock: stockActual <= 0 
            };
        });

    } catch (error) {
        console.error("Error al obtener el catálogo de productos:", error);
        throw error;
    }
}

const obtenerReporteInventario = () => {
    // se lee el archivo xml
    // y calcula existencias totales o etiquetas de desabasto
    const productos = obtenerProductos(); 
    
    let totalExistencias = 0;
    const productosConAlerta = productos.map(prod => {
        const stockNum = parseInt(prod.stock) || 0;
        totalExistencias += stockNum;
        return {
            ...prod,
            esDesabasto: stockNum <= 5 // límite de stock mínimo aquí
        };
    });

    return {
        totalExistencias,
        productos: productosConAlerta
    };
};

/**
 * Elimina un producto del archivo XML mediante su ID y actualiza el almacenamiento en disco.
 *
 * @param {number|string} id - Identificador único del producto a eliminar.
 * @returns {{ok: boolean, eliminado: boolean, mensaje?: string}} Objeto indicando el resultado de la operación.
 * @throws {Error} Lanza un error si ocurre un fallo al leer o escribir el archivo XML.
 */
function eliminarProducto(id) {
    try {
        const idNumero = Number(id);

        if (isNaN(idNumero)) {
            return { ok: false, eliminado: false, mensaje: "El ID proporcionado no es un número válido." };
        }

        // Verificar si el archivo existe antes de leerlo
        if (!fs.existsSync(archivo)) {
            return { ok: false, eliminado: false, mensaje: "El archivo XML no existe." };
        }

        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['producto'].includes(tagName)
        });

        // Convertir XML a Objeto JS
        const resultado = parser.parse(xml);

        // Si el XML está vacío o no tiene la estructura
        if (!resultado.productos) {
            resultado.productos = { producto: [] };
        }

        const productos = resultado.productos.producto || [];

        // Constante usada para datos del producto a eliminar
        const productoAEliminar = productos.find(prod => Number(prod["@_id"]) === idNumero);

        // Filtrar excluyendo el ID indicado
        const productosFiltrados = productos.filter(prod => Number(prod["@_id"]) !== idNumero);

        // Asignar el nuevo arreglo filtrado
        resultado.productos.producto = productosFiltrados;

        // Reconstruir el formato XML
        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });

        const nuevoXml = builder.build(resultado);

        // Guardar cambios en disco
        fs.writeFileSync(archivo, nuevoXml, "utf8");

        // Registra el movimiento
        const date = new Date;
        const movimientoProd = {
            fecha: date.toLocaleDateString(),
            hora: date.toLocaleTimeString(),
            id_producto: idNumero,
            nombre_producto: productoAEliminar.nombre,
            tipo: "BAJA"
        }

        movimientoProdDao.agregarMovimiento(movimientoProd);

        return { ok: true, eliminado: true };

    } catch (error) {
        console.error("Error al eliminar producto BD:", error);
        throw error;
    }
}


module.exports = {
    agregarProducto,
    existeProducto,
    existeProductoId,
    obtenerProductos,
    obtenerReporteInventario,
    eliminarProducto
};


