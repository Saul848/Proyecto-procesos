const fs = require("fs");
const path = require("path");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const archivo = path.join(__dirname, "../data/xml/categorias.xml");

/**
 * Agrega una nueva categoría a la base de datos.
 *
 * Convierte el contenido del archivo XML a un objeto de JavaScript,
 * agrega la nueva categoría y posteriormente vuelve a generar el XML.
 *
 * @function agregarCategoria
 * @param {Object} categoria - Objeto que contiene los datos de la categoría.
 * @param {string} categoria.nombre - Nombre de la categoría.
 * @returns {Object} Resultado de la operación.
 * @throws {Error} Si ocurre un error al leer, modificar o escribir el archivo XML.
 */
function agregarCategoria(categoria) {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            isArray: (tagName) => ["categoria"].includes(tagName)
        });

        // Convertir XML a objeto de JavaScript
        const resultado = parser.parse(xml);

        // Si el XML está vacío o no tiene la estructura,
        // crear la estructura inicial
        if (!resultado.categorias) {
            resultado.categorias = {
                categoria: []
            };
        }

        const categorias = resultado.categorias?.categoria || [];

        const nuevaCategoria = {
            nombre: String(categoria.nombre).trim().toLowerCase()
        };

        // Agregar al arreglo existente
        categorias.push(nuevaCategoria);
        resultado.categorias.categoria = categorias;

        // Convertir el objeto JS de vuelta a XML
        const builder = new XMLBuilder({
            format: true
        });

        const nuevoXml = builder.build(resultado);

        // Sobrescribir el archivo XML
        fs.writeFileSync(archivo, nuevoXml, "utf8");

        return { ok: true };

    } catch (error) {
        console.error("Error al agregar categoría BD:", error);
        throw error;
    }
}


/**
 * Verifica si ya existe una categoría registrada con el mismo nombre.
 *
 * @function existeCategoria
 * @param {string} nombre - Nombre de la categoría a verificar.
 * @returns {boolean} true si la categoría existe, false si no.
 * @throws {Error} Si ocurre un error al leer o procesar el archivo XML.
 */
function existeCategoria(nombre) {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            isArray: (tagName) => ["categoria"].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const categorias = resultado.categorias?.categoria || [];

        // Normalizar nombre para realizar una comparación limpia
        const nombreBusqueda = String(nombre).trim().toLowerCase();

        // Retorna true si encuentra una coincidencia
        return categorias.some((categoria) => {
            const nombreCategoria = categoria.nombre
                ? String(categoria.nombre).trim().toLowerCase()
                : "";

            return nombreCategoria === nombreBusqueda;
        });

    } catch (error) {
        console.error(
            "Error al verificar la existencia de la categoría:",
            error
        );
        throw error;
    }
}


/**
 * Obtiene todas las categorías registradas.
 *
 * @function obtenerCategorias
 * @returns {Array} Lista de categorías.
 * @throws {Error} Si ocurre un error al leer o procesar el archivo XML.
 */
function obtenerCategorias() {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            isArray: (tagName) => ["categoria"].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const categorias = resultado.categorias?.categoria || [];

        return categorias.map((categoria) => {
            return {
                nombre: categoria.nombre
            };
        });

    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        throw error;
    }
}


module.exports = {
    agregarCategoria,
    existeCategoria,
    obtenerCategorias
};
