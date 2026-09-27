const fs = require('fs');
const path = require('path');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

const archivoCajas = path.join(__dirname, '../data/xml/cajas.xml');

const parserConfig = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (tagName) => ["caja"].includes(tagName),
};

const builderConfig = {
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
};

// Función para sumar dinero a la caja general y a una caja específica
function abonarACaja(montoVenta, idCaja = "1") {
    try {
        const parser = new XMLParser(parserConfig);
        const builder = new XMLBuilder(builderConfig);

        let xmlData = "<cajas><cajaGeneral>0.00</cajaGeneral><detalleCajas></detalleCajas></cajas>";
        if (fs.existsSync(archivoCajas)) {
            const contenido = fs.readFileSync(archivoCajas, 'utf-8').trim();
            if (contenido.length > 0) {
                xmlData = contenido;
            }
        }

        const resultado = parser.parse(xmlData);
        
        if (!resultado.cajas) {
            resultado.cajas = { cajaGeneral: "0.00", detalleCajas: { caja: [] } };
        }
        if (!resultado.cajas.detalleCajas) {
            resultado.cajas.detalleCajas = { caja: [] };
        }
        if (!resultado.cajas.detalleCajas.caja) {
            resultado.cajas.detalleCajas.caja = [];
        }

        // 1. Actualizar caja general
        let generalActual = parseFloat(resultado.cajas.cajaGeneral) || 0;
        let nuevoGeneral = generalActual + parseFloat(montoVenta);
        resultado.cajas.cajaGeneral = nuevoGeneral.toFixed(2);

        // 2. Actualizar la caja específica
        let listaCajas = resultado.cajas.detalleCajas.caja;
        let cajaEncontrada = listaCajas.find(c => String(c['@_id']) === String(idCaja));

        if (cajaEncontrada) {
            let montoCajaActual = parseFloat(cajaEncontrada['#text'] !== undefined ? cajaEncontrada['#text'] : cajaEncontrada) || 0;
            // Si la estructura usa texto interno o valor directo
            if (typeof cajaEncontrada === 'object') {
                cajaEncontrada['#text'] = (montoCajaActual + parseFloat(montoVenta)).toFixed(2);
            }
        } else {
            // Si no existe la caja en el XML, la agregamos
            listaCajas.push({
                '@_id': idCaja,
                '#text': parseFloat(montoVenta).toFixed(2)
            });
        }

        // Guardar cambios en el XML
        fs.writeFileSync(archivoCajas, builder.build(resultado), 'utf-8');
        return { ok: true, nuevoGeneral: resultado.cajas.cajaGeneral };
    } catch (error) {
        console.error("Error al actualizar la caja:", error);
        throw error;
    }
}

module.exports = {
    abonarACaja
};