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

function leerArchivoCajas() {
    const ruta = path.join(__dirname, '../data/xml/cajas.xml');
    const contenido = fs.readFileSync(ruta, 'utf-8');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    return parser.parse(contenido);
}

function guardarArchivoCajas(jsonData) {
    const ruta = path.join(__dirname, '../data/xml/cajas.xml');
    const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_", format: true });
    const xmlContent = builder.build(jsonData);
    fs.writeFileSync(ruta, xmlContent, 'utf-8');
}

function verificarCredencialesPermitidas(user, pass) {
    const rutaXml = path.join(__dirname, '../data/xml/empleados.xml');
    if (!fs.existsSync(rutaXml)) return null;

    const contenidoXmlString = fs.readFileSync(rutaXml, 'utf-8');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const xmlEmpleados = parser.parse(contenidoXmlString);
    
    if (!xmlEmpleados.empleados || !xmlEmpleados.empleados.empleado) return null;

    const lista = xmlEmpleados.empleados.empleado; 
    const arrayEmpleados = Array.isArray(lista) ? lista : [lista];

    const encontrado = arrayEmpleados.find(emp => emp.usuario === user && emp.password === pass);
    return encontrado || null;
}

function guardarEnHistorialMovimientos(nuevoMovimiento) {
    const rutaHistorial = path.join(__dirname, '../data/xml/movimientosCaja.xml');
    let historialData = { movimientos: { movimiento: [] } };

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: "@_", format: true });

    if (fs.existsSync(rutaHistorial)) {
        const contenido = fs.readFileSync(rutaHistorial, 'utf-8');
        historialData = parser.parse(contenido) || historialData;
        if (!historialData.movimientos) {
            historialData.movimientos = { movimiento: [] };
        }
    }

    if (!historialData.movimientos.movimiento) {
        historialData.movimientos.movimiento = [];
    }

    if (!Array.isArray(historialData.movimientos.movimiento)) {
        historialData.movimientos.movimiento = [historialData.movimientos.movimiento];
    }

    historialData.movimientos.movimiento.push(nuevoMovimiento);
    
    const xmlContent = builder.build(historialData);
    fs.writeFileSync(rutaHistorial, xmlContent, 'utf-8');
}


function registrarMovimientoCaja(datos) {
    const { tipoMovimiento, idCaja, monto, motivo, usuarioAutoriza, passwordAutoriza } = datos;
    
    // Validar credenciales del gerente/admin
    const empleadoAutenticado = verificarCredencialesPermitidas(usuarioAutoriza, passwordAutoriza);
    
    if (!empleadoAutenticado) {
        throw new Error("Credenciales inválidas o usuario no encontrado.");
    }

    if (empleadoAutenticado.puesto !== 'gerente' && empleadoAutenticado.puesto !== 'administrador') {
        throw new Error("Acceso denegado: El usuario ingresado no cuenta con permisos de Gerente o Administrador.");
    }

    if (!motivo || motivo.trim() === "") {
        throw new Error("El motivo u observación es obligatorio.");
    }

    const xmlData = leerArchivoCajas(); 
    let cajaGeneral = parseFloat(xmlData.cajas.cajaGeneral || 0);
    const listaCajas = xmlData.cajas.detalleCajas.caja;
    
    const cajaEncontrada = listaCajas.find(c => c["@_id"] === idCaja);
    if (!cajaEncontrada) {
        throw new Error("La caja especificada no existe.");
    }

    let saldoCaja = parseFloat(
        typeof cajaEncontrada === 'object' && cajaEncontrada !== null 
            ? (cajaEncontrada["#text"] ?? 0) 
            : cajaEncontrada
    );
    if (isNaN(saldoCaja)) saldoCaja = 0;

    if (tipoMovimiento === "RETIRO") {
        if (monto > saldoCaja) {
            throw new Error("Fondos insuficientes en la caja para realizar este retiro.");
        }
        saldoCaja -= monto;
        cajaGeneral += monto;
    } else if (tipoMovimiento === "APORTACION") {
        saldoCaja += monto;
        cajaGeneral -= monto; 
    }

    if (typeof cajaEncontrada === 'object' && cajaEncontrada !== null) {
        cajaEncontrada["#text"] = saldoCaja.toFixed(2);
    }
    
    xmlData.cajas.cajaGeneral = cajaGeneral.toFixed(2);
    guardarArchivoCajas(xmlData);

    guardarEnHistorialMovimientos({
        fecha: new Date().toISOString(),
        tipoMovimiento,
        idCaja,
        monto: monto.toFixed(2),
        motivo,
        autorizadoPor: empleadoAutenticado.usuario,
        rol: empleadoAutenticado.puesto
    });

    return { ok: true, nuevoSaldoCaja: saldoCaja, nuevaCajaGeneral: cajaGeneral };
}

module.exports = {
    abonarACaja,
    registrarMovimientoCaja
};