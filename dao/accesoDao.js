const fs = require('fs');
const { XMLParser, XMLBuilder } = require("fast-xml-parser");
const path = require('path');

const archivo = path.join(__dirname, "../data/xml/accesos.xml");

/**
 * Registra un acceso (entrada/salida) en accesos.xml
 * @param {String} usuario - Usuario que entro o salio del sistema
 * @param {String} evento - "entrada" o "salida"
 * @returns {Object} Resultado de la operación {ok: true}
 */
function registrarAcceso(nombre, usuario, puesto, evento){
    try{
        const xml= fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['acceso'].includes(tagName)
        });

        const resultado = parser.parse(xml);

        if(!resultado.accesos){
            resultado.accesos = { acceso: [] };
        }

        const accesos = resultado.accesos?. acceso || [];

        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        const hora = ahora.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const nuevoAcceso = {
            fecha: fecha,
            hora: hora,
            nombre: nombre,
            usuario: usuario,
            puesto: puesto,
            evento: evento
        };

        accesos.push(nuevoAcceso);
        resultado.accesos.acceso = accesos;

        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false
        });

        const nuevoXml = builder.build(resultado);
        fs.writeFileSync(archivo, nuevoXml, "utf8");

        return {ok: true};
    } catch(error){
        console.error("Error al registrar acceso:", error);
        throw error;
    }
}
    
/**
 * Obtiene todos los accesos registrados en el archivo XML
 * @returns {Array<object>} Arreglo con los accesos registrados
 */
function obtenerAccesos(){
    try{
        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['acceso'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        return resultado.accesos?.acceso || [];
    } catch(error){
        console.error("Error al obtener los accesos", error);
        throw error;
    }
}

module.exports = {
    registrarAcceso,
    obtenerAccesos
};