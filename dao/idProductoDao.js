const fs = require("fs");
const path = require('path');
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const archivo = path.join(__dirname, "../data/xml/idProducto.xml");

/**
 * Lee el archivo idProducto.xml y calcula el siguiente ID disponible
 * sin modificar el archivo en disco.
 *
 * @function obtenerIdDisponible
 * @returns {number} El ID disponoble que se puede asignar.
 * @throws {Error} Si el archivo no existe o falla la lectura/parseo.
 */
function obtenerIdDisponible() {
    try {
        if (!fs.existsSync(archivo)) {
            throw new Error(`El archivo no existe en la ruta: ${archivo}`);
        }

        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            parseNodeValue: true
        });

        const resultado = parser.parse(xml);
        const idDisponible = Number(resultado.idProducto?.id) || 0;

        return idDisponible;

    } catch (error) {
        console.error("Error al obtener el ID disponible:", error);
        throw error;
    }
}

/**
 * Actualiza y guarda en el archivo idProducto.xml el nuevo ID del contador.
 *
 * @function guardarSiguienteId
 * @param {number|string} nuevoId - El nuevo ID que se va a persistir en el XML.
 * @returns {{ok: boolean, idGuardado: number}} Confirmación de guardado y el ID registrado.
 * @throws {Error} Si falla la reescritura del archivo XML.
 */
function guardarSiguienteId() {
    try {
        const idNumero = obtenerIdDisponible();

        const estructuraXml = {
            idProducto: {
                id: (idNumero + 1)
            }
        };

        const builder = new XMLBuilder({
            format: true
        });

        const nuevoXml = builder.build(estructuraXml);

        // Sobrescribe el archivo XML con el nuevo consecutivo
        fs.writeFileSync(archivo, nuevoXml, "utf8");

    } catch (error) {
        console.error("Error al guardar el siguiente ID:", error);
        throw error;
    }
}

module.exports = {
    obtenerIdDisponible,
    guardarSiguienteId
};