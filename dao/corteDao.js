const fs = require("fs");
const path = require("path"); 
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const archivoCortes = path.join(__dirname, "../data/xml/cortesCaja.xml");

// Asegurar que el archivo XML exista con una estructura básica
if (!fs.existsSync(archivoCortes)) {
    const xmlInicial = '<?xml version="1.0" encoding="UTF-8"?>\n<cortes></cortes>';
    // Asegurar que la carpeta exista antes de escribir
    fs.mkdirSync(path.dirname(archivoCortes), { recursive: true });
    fs.writeFileSync(archivoCortes, xmlInicial, "utf8");
}

/**
 * Registra un nuevo corte de caja en el XML
 */
exports.registrarCorte = (datosCorte) => {
    try {
        const xml = fs.readFileSync(archivoCortes, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['corte'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const cortes = resultado.cortes?.corte || [];

        // Calcular nuevo ID basado en los cortes existentes
        const nuevoId = cortes.length > 0 ? Math.max(...cortes.map(c => Number(c["@_id"]) || 0)) + 1 : 1;

        const nuevoCorte = {
            "@_id": nuevoId,
            fecha: datosCorte.fecha,
            hora: datosCorte.hora,
            gerente: datosCorte.gerente,
            ventasEsperadas: datosCorte.ventasEsperadas,
            efectivoFisico: datosCorte.efectivoFisico,
            diferencia: datosCorte.diferencia,
            tipoDiferencia: datosCorte.tipoDiferencia
        };

        cortes.push(nuevoCorte);
        resultado.cortes = { corte: cortes };

        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });

        fs.writeFileSync(archivoCortes, builder.build(resultado), "utf8");
        return { ok: true, mensaje: "Corte de caja registrado con éxito." };
    } catch (error) {
        console.error("Error al registrar el corte en el XML:", error);
        return { ok: false, mensaje: "Error al guardar el corte." };
    }
};

/**
 * Obtiene el historial de cortes de caja
 */
exports.obtenerCortes = () => {
    try {
        if (!fs.existsSync(archivoCortes)) return [];
        const xml = fs.readFileSync(archivoCortes, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (tagName) => ['corte'].includes(tagName)
        });
        const resultado = parser.parse(xml);
        return resultado.cortes?.corte || [];
    } catch (error) {
        console.error("Error al obtener los cortes:", error);
        return [];
    }
};
