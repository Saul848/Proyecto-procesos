const Oferta = require("../clases/ofertaClass");

const fs = require('fs');
const {XMLParser, XMLBuilder } = require ("fast-xml-parser");
const path = require('path');

const archivo = path.join(__dirname, "../data/xml/ofertas.xml");
const archivoHistorial = path.join(__dirname, "../data/xml/historialOfertas.xml");

/**
 * Obtiene todas las ofertas del archivo XML. 
 * 
 * @function obtenerOfertas
 * @returns {Array} Arreglo con las ofertas (objetos planos del XML).
 * @throws {Error} Si ocurre un error al leer o procesar el archivo XML.
 */
function obtenerOfertas(){
    try{
        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({ 
            ignoreAttributes: false, 
            isArray: (t) => ['oferta'].includes(t)
        });
        const resultado = parser.parse(xml);
        return resultado.ofertas?.oferta || [];
    }catch (error){
        console.error("Error al obtener ofertas: ", error);
        throw error;
    }
}

/**
 * Agrega una nueva oferta al XML
 * 
 * @function agregarOferta
 * @param {Object} oferta - Datos de la oferta a guardar (objeto serializable).
 * @returns {Object} Resultado de la operación: { ok: true }.
 * @throws {Error} Si ocurre un error al leer, modificar o escribir el archivo.
 */
function agregarOferta(oferta){
    try{
        if (!fs.existsSync(archivo) || fs.readFileSync(archivo, "utf8").trim() === "") {
            fs.writeFileSync(archivo, '<?xml version="1.0" encoding="UTF-8"?>\n<ofertas>\n</ofertas>', "utf8");
        }

        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (t) => ['oferta'].includes(t)
        });
        const resultado = parser.parse(xml);

        if (!resultado.ofertas){
            resultado.ofertas = { oferta: []};
        }

        const ofertas = resultado.ofertas?.oferta || [];

        ofertas.push(oferta);
        resultado.ofertas.oferta = ofertas;

        const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
        const nuevoXml = builder.build(resultado);
        fs.writeFileSync(archivo, nuevoXml, "utf8");

        return { ok: true};
    }catch (error){
        console.error("Error al agregar oferta:", error);
        throw error;
    }
}

/**
 * Obtiene una oferta por su id.
 * 
 * @function obtenerOferta
 * @param {string} id - ID de la oferta (ej. "OF-01").
 * @returns {Object|null} La oferta encontrada, o null si no existe.
 * @throws {Error} Si ocurre un error al leer el archivo.
 */
function obtenerOferta(id){
    try{
        const ofertas = obtenerOfertas();
        const oferta = ofertas.find (o => o.id === id);
        return oferta || null;
    } catch (error){
        console.error("Error al obtener la oferta:", error);
        throw error;
    }
}

/**
 * Elimina una oferta por su id.
 * 
 * @function eliminarOferta
 * @param {string} id - ID de la oferta a eliminar (ej. "OF-01").
 * @returns {Object} Resultado de la operación:
 *   - { ok: true, encontrado: true } si se eliminó.
 *   - { ok: false, encontrado: false } si no se encontró.
 * @throws {Error} Si ocurre un error al leer, modificar o escribir el archivo.
 */
function eliminarOferta(id) {
    try {
        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (t) => ['oferta'].includes(t)
        });
        const resultado = parser.parse(xml);

        if (!resultado.ofertas) {
            return { ok: false, encontrado: false };
        }

        const ofertas = resultado.ofertas?.oferta || [];
        const nuevasOfertas = ofertas.filter(o => o.id !== id);

        // Si no cambió la longitud, no se encontró
        if (nuevasOfertas.length === ofertas.length) {
            return { ok: false, encontrado: false };
        }

        resultado.ofertas.oferta = nuevasOfertas;

        const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
        const nuevoXml = builder.build(resultado);
        fs.writeFileSync(archivo, nuevoXml, "utf8");

        return { ok: true, encontrado: true };
    } catch (error) {
        console.error("Error al eliminar la oferta:", error);
        throw error;
    }
}

/**
 * Obtiene todos los registros del historial de acciones sobre ofertas.
 * Lee historialOfertas.xml y devuelve el arreglo de registros
 * (acciones de crear/eliminar ofertas).
 * 
 * @function obtenerHistorial
 * @returns {Array} Arreglo con los registros del historial.
 * @throws {Error} Si ocurre un error al leer el archivo.
 */
function obtenerHistorial(){
    try{
        const xml = fs.readFileSync(archivoHistorial, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['registro'].includes(tagName)
        });
        const resultado = parser.parse(xml);
        return resultado.historial?.registro || [];
    }catch (error){
        console.error("Error al leer historial: ", error);
        throw error;
    }
}

/**
 * Agrega un nuevo registro al historial de acciones sobre ofertas.
 * 
 * @function agregarRegistroHistorial
 * @param {Object} registro - Datos del registro a guardar: id, accion, idOferta, idProducto,
 * tipoProm, valorDesc, cantidadRecibe, cantidadPaga, fechaHora
 * @returns {Object} Resultado de la operación: { ok: true }.
 * @throws {Error} Si ocurre un error al leer, modificar o escribir el archivo.
 */
function agregarRegistroHistorial(registro){
    try{
        if (!fs.existsSync(archivoHistorial) || fs.readFileSync(archivoHistorial, "utf8").trim() === "") {
            fs.writeFileSync(archivoHistorial, '<?xml version="1.0" encoding="UTF-8"?>\n<historial>\n</historial>', "utf8");
        }

        const xml = fs.readFileSync(archivoHistorial, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['registro'].includes(tagName)
        });
        const resultado = parser.parse(xml);
        if(!resultado.historial){
            resultado.historial = { registro: []};
        }
        const registros = resultado.historial?.registro || [];
        registros.push(registro);
        resultado.historial.registro = registros;

        const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
        fs.writeFileSync(archivoHistorial, builder.build(resultado), "utf8");
        return { ok: true };
    } catch (error){
        console.error("Error al guardar registro: ", error);
        throw error;
    }
}

module.exports = {
    obtenerOfertas,
    agregarOferta,
    obtenerOferta,
    eliminarOferta,
    obtenerHistorial,
    agregarRegistroHistorial
};