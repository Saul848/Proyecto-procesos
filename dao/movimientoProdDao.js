const fs = require("fs");
const path = require('path');
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const archivo = path.join(__dirname, "../data/xml/movimientos.xml");

/**
 * Agrega un nuevo movimiento sobre los productos al historial.
 *
 * Convierte el contenido del archivo XML a un objeto de JavaScript,
 * agrega el nuevo producto y posteriormente vuelve a generar el XML.
 *
 * @function agregarMovimiento
 * @param {Object} movimiento - Objeto que contiene los datos del alumno.
 * @param {string} movimiento.fecha - Fecha en que se registro el movimiento.
 * @param {string} movimiento.hora - Hora en que se registro el movimiento.
 * @param {string} movimiento.id_producto - Id de producto sobre el cual se efectuo el movimiento.
 * @param {number} movimiento.nombre_producto - Nombre actual de producto sobre el cual se efectuo el movimiento.
 * @param {number} movimiento.tipo - Tipo de movimiento realizado.
 * @returns {Object} Resultado de la operación.
 * @throws {Error} Si ocurre un error al leer, modificar o escribir el archivo XML.
 */
function agregarMovimiento(movimiento) {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['movimiento'].includes(tagName)
        });

        // Convertir XML a Objeto de JS
        const resultado = parser.parse(xml);

        // Si el XML está vacío o no tiene la estructura,
        // crear la estructura inicial
        if (!resultado.movimientos) {
            resultado.movimientos = {
                movimiento: []
            };
        }

        const movimientos = resultado.movimientos?.movimiento || [];
        
        // Obtener el ID
        const nuevoId = obtenerIdDisponible();

        const nuevoMovimiento = {
            "@_id": nuevoId,
            fecha: movimiento.fecha,
            hora: movimiento.hora,
            id_producto: Number(movimiento.id_producto),
            nombre_producto: movimiento.nombre_producto.toLowerCase().trim(),
            tipo: movimiento.tipo.toUpperCase().trim()
        };

        // Agregar al arreglo existente
        movimientos.push(nuevoMovimiento);
        resultado.movimientos.movimiento = movimientos;

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
        console.error("Error al agregar el movimiento BD:", error);
        throw error;
    }
}

/**
 * Obtiene el historial de movimientos realizados sobre el inventario.
 * 
 * @returns {Array} Historial de movimientos.
 */
function obtenerMovimientos() {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['producto'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        let movimientos = resultado.movimientos?.movimiento || [];


       
        return movimientos.map((movimi) => {
            return {
                id: movimi["@_id"],
                fecha: movimi.fecha,
                hora: movimi.hora,
                id_producto: movimi.id_producto,
                nombre_producto: movimi.nombre_producto,
                tipo: movimi.tipo
            };
        });

    } catch (error) {
        console.error("Error al obtener el historial de movimientos:", error);
        throw error;
    }
}

// Busca el nuevo id disponible para asignar
function obtenerIdDisponible() {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['movimiento'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const movimientos = resultado.movimientos?.movimiento || [];

        // Calcular el ID numérico más alto y sumar 1
        const maxId = movimientos.reduce((max, prod) => {
            const idActual = parseInt(prod["@_id"], 10) || 0;
            return idActual > max ? idActual : max;
        }, 0);

        return String(maxId + 1);

    } catch (error) {
        console.error("Error al obtener el siguiente ID movimiento:", error);
        throw error;
    }
}

module.exports = {
    agregarMovimiento,
    obtenerMovimientos
};