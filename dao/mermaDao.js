const fs = require("fs");
const path = require("path");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const archivo = path.join(__dirname, "../data/xml/mermas.xml");

/**
 * Registra una nueva merma o daño en el archivo mermas.xml.
 * @param {Object} datosMerma - Datos de la merma a registrar.
 * @returns {Object} Resultado de la operación.
 */
function registrarMerma(datosMerma) {
    try {
        let xml = "";
        
        // Si el archivo no existe, creamos una estructura inicial vacía
        if (!fs.existsSync(archivo)) {
            xml = '<?xml version="1.0" encoding="UTF-8"?><mermas></mermas>';
            fs.writeFileSync(archivo, xml, "utf8");
        } else {
            xml = fs.readFileSync(archivo, "utf8");
        }

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['merma'].includes(tagName)
        });

        const resultado = parser.parse(xml);

        if (!resultado.mermas) {
            resultado.mermas = { merma: [] };
        }

        const mermas = resultado.mermas?.merma || [];

        // Generar un ID incremental básico basado en la cantidad de registros
        const nuevoId = mermas.length + 1;

        const nuevaMerma = {
            "@_id": nuevoId,
            id_producto: datosMerma.idProducto,
            nombre_producto: datosMerma.nombreProducto,
            cantidad: datosMerma.cantidadAjustar,
            precio_unitario: datosMerma.precioUnitario || 0,
            perdida_total: (Number(datosMerma.cantidadAjustar) * Number(datosMerma.precioUnitario || 0)).toFixed(2),
            causa: datosMerma.causa,
            gerente: datosMerma.gerente,
            fecha: datosMerma.fecha,
            hora: datosMerma.hora
           
        };

        mermas.push(nuevaMerma);
        resultado.mermas.merma = mermas;

        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });

        const nuevoXml = builder.build(resultado);
        fs.writeFileSync(archivo, nuevoXml, "utf8");

        return { ok: true };

    } catch (error) {
        console.error("Error al registrar merma en el DAO:", error);
        throw error;
    }
}

/**
 * Obtiene todas las mermas registradas para reportes o consultas.
 * @returns {Array} Lista de mermas.
 */
function obtenerMermas() {
    try {
        if (!fs.existsSync(archivo)) {
            return [];
        }

        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['merma'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        return resultado.mermas?.merma || [];

    } catch (error) {
        console.error("Error al obtener las mermas:", error);
        throw error;
    }
}

module.exports = {
    registrarMerma,
    obtenerMermas
};