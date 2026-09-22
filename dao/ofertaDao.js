const Oferta = require("../clases/ofertaClass");

const fs = require('fs');
const {XMLParser, XMLBuilder } = require ("fast-xml-parser");
const path = require('path');

const archivo = path.join(__dirname, "../data/xml/ofertas.xml");

/**
 * Obtiene todas las ofertas del archivo XML.
 * @returns {Array} Arreglo con las ofertas.
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
 * @param {Object} oferta - Datos de la oferta
 * @returns {object} Resultado de la operación
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
 * @param {String} id - ID de la oferta 
 * @returns {Object|null} La oferta encontrada o null
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
 * @param {String} id - ID de la oferta a eliminar
 * @returns {object} Resultado de la operación
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

module.exports = {
    obtenerOfertas,
    agregarOferta,
    obtenerOferta,
    eliminarOferta
};