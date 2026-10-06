const fs = require('fs');
const path = require('path');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

const ARCHIVO_XML = path.join(__dirname, '../data/xml/transacciones.xml');

// Opciones estándar para el parser
const parserConfig = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseNodeValue: true,
    trimValues: true
};

const builderConfig = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    format: true,
    indentBy: "  "
};

/**
 * Lee el archivo XML y devuelve el objeto analizado asegurando estructura de lista.
 */
function leerTransaccionesXML() {
    try {
        if (!fs.existsSync(ARCHIVO_XML)) {
            const inicial = { transacciones: { transaccion: [] } };
            const builder = new XMLBuilder(builderConfig);
            fs.writeFileSync(ARCHIVO_XML, builder.build(inicial), 'utf-8');
            return [];
        }

        const data = fs.readFileSync(ARCHIVO_XML, 'utf-8');
        if (!data.trim()) return [];

        const parser = new XMLParser(parserConfig);
        const resultado = parser.parse(data);

        if (!resultado.transacciones || !resultado.transacciones.transaccion) {
            return [];
        }

        const lista = resultado.transacciones.transaccion;
        return Array.isArray(lista) ? lista : [lista];
    } catch (error) {
        console.error("Error al leer transacciones.xml:", error);
        return [];
    }
}

/**
 * Registra una nueva transacción de servicio y la almacena en el archivo XML.
 * @param {Object} datos - Parámetros de la transacción
 * @param {string} datos.tipo - "RECARGA" o "SERVICIO"
 * @param {string} datos.companiaServicio - Nombre de la empresa o compañía (ej. CFE, Telcel)
 * @param {string} datos.referencia - Teléfono o número de servicio/referencia
 * @param {string} datos.cliente - Nombre del cliente o referencia del usuario
 * @param {number} datos.monto - Monto a cobrar
 * @param {string} datos.idEmpleado - Identificador del empleado en turno
 * @returns {Object} La transacción persistida con su folio asignado
 */
function registrarTransaccion({ tipo, companiaServicio, referencia, cliente, monto, idEmpleado }) {
    const listaExistente = leerTransaccionesXML();

    // Cálculo del siguiente ID correlativo
    let siguienteId = 1;
    if (listaExistente.length > 0) {
        const ultimosIds = listaExistente.map(t => Number(t["@_id"] || t.id || 0));
        siguienteId = Math.max(...ultimosIds) + 1;
    }

    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-MX");
    const hora = ahora.toLocaleTimeString("es-MX");

    const nuevaTransaccion = {
        "@_id": String(siguienteId),
        tipo: String(tipo).toUpperCase(),
        companiaServicio: String(companiaServicio || "N/A"),
        referencia: String(referencia || ""),
        cliente: String(cliente || "Público General"),
        monto: Number(monto).toFixed(2),
        idEmpleado: String(idEmpleado || "1"),
        fecha: fecha,
        hora: hora,
        estado: "EXITOSA"
    };

    listaExistente.push(nuevaTransaccion);

    const estructuraFinal = {
        transacciones: {
            transaccion: listaExistente
        }
    };

    const builder = new XMLBuilder(builderConfig);
    const xmlActualizado = builder.build(estructuraFinal);

    fs.writeFileSync(ARCHIVO_XML, xmlActualizado, 'utf-8');

    return nuevaTransaccion;
}

/**
 * Obtiene el listado completo de transacciones para consulta histórica.
 */
function obtenerTodasLasTransacciones() {
    return leerTransaccionesXML();
}

module.exports = {
    registrarTransaccion,
    obtenerTodasLasTransacciones
};