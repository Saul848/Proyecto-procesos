const Producto = require("../clases/producto");

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
 * @param {string} producto.precio - Precio del producto.
 * @param {string} producto.stock - Stock del producto.
 * @param {number} producto.descuento - Descuento del producto
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
        const nuevoId = obtenerSiguienteId();

        const nuevoProducto = {
            "@_id": nuevoId,
            nombre: producto.nombre.toLowerCase(),
            descripcion: producto.descripcion,
            precio: Number(producto.precio).toFixed(2),
            stock: Number(producto.stock),
            descuento: Number(producto.descuento)
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

// Busca el nuevo id disponible para asignar
function obtenerSiguienteId() {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['producto'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const productos = resultado.productos?.producto || [];

        // Calcular el ID numérico más alto y sumar 1
        const maxId = productos.reduce((max, prod) => {
            const idActual = parseInt(prod["@_id"], 10) || 0;
            return idActual > max ? idActual : max;
        }, 0);

        return String(maxId + 1);

    } catch (error) {
        console.error("Error al obtener el siguiente ID:", error);
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
                precio: prod.precio,
                stock: stockActual,
                descuento: prod.descuento,
                sinStock: stockActual <= 0 
            };
        });

    } catch (error) {
        console.error("Error al obtener el catálogo de productos:", error);
        throw error;
    }
}



module.exports = {
    agregarProducto,
    existeProducto,
    obtenerProductos,
};


