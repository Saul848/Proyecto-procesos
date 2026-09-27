/**
 * Data Access Object (DAO) para la persistencia y gestión de ventas en XML,
 * sincronizando inventario de productos, ofertas activas y métricas de empleados.
 * @module dao/VentaDao
 */

const fs = require('fs');
const path = require('path');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const Venta = require('../clases/ventaClass'); 
const ofertaDao = require('./ofertaDao');
const Oferta = require('../clases/ofertaClass');

const archivoVentas = path.join(__dirname, '../data/xml/ventas.xml');
const archivoProductos = path.join(__dirname, '../data/xml/productos.xml');
const rutaEmpleados = path.join(__dirname, '../data/xml/empleados.xml');

const parserConfig = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (tagName) => ["venta", "producto", "item", "empleado"].includes(tagName),
};

const builderConfig = {
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
};

/**
 * Extrae de forma segura el identificador único de una entidad XML.
 * @param {Object} entidad - Objeto parseado de XML.
 * @returns {string} ID extraído o cadena vacía.
 */
function extraerId(entidad) {
    if (!entidad) return "";
    return String(entidad['@_id'] !== undefined ? entidad['@_id'] : (entidad.id !== undefined ? entidad.id : "")).trim();
}

/**
 * Calcula y retorna el siguiente folio autoincrementable para una nueva venta.
 * @function obtenerSiguienteIdVenta
 * @returns {string} Siguiente número de folio disponible.
 */
function obtenerSiguienteIdVenta() {
    if (!fs.existsSync(archivoVentas)) {
        return "1";
    }
    const xmlData = fs.readFileSync(archivoVentas, 'utf-8');
    const parser = new XMLParser(parserConfig);
    const resultado = parser.parse(xmlData);
    const ventas = resultado.ventas?.venta || [];
    
    const maxId = ventas.reduce((max, v) => {
        const idActual = parseInt(extraerId(v), 10) || 0;
        return idActual > max ? idActual : max;
    }, 0);

    return String(maxId + 1);
}

/**
 * Incrementa en 1 los contadores de ventas y transacciones del empleado responsable.
 * @function registrarVentaEmpleado
 * @param {string|number} idEmpleado - Identificador del empleado que procesó la venta.
 * @returns {void}
 */
function registrarVentaEmpleado(idEmpleado) {
    try {
        if (!fs.existsSync(rutaEmpleados)) return;

        const xml = fs.readFileSync(rutaEmpleados, 'utf-8');
        const parser = new XMLParser(parserConfig);
        const resultado = parser.parse(xml);
        const listaEmpleados = resultado.empleados?.empleado || [];

        const idBuscado = String(idEmpleado).trim();
        const emp = listaEmpleados.find(e => extraerId(e) === idBuscado || String(e.id).trim() === idBuscado);

        if (emp) {
            const ventasActuales = parseInt(emp.numVentas, 10) || 0;
            const transaccionesActuales = parseInt(emp.numTransacciones, 10) || 0;

            emp.numVentas = ventasActuales + 1;
            emp.numTransacciones = transaccionesActuales + 1;

            const builder = new XMLBuilder(builderConfig);
            const nuevoXml = builder.build(resultado);
            fs.writeFileSync(rutaEmpleados, nuevoXml, 'utf-8');
        } else {
            console.warn(`No se encontró el empleado con ID: ${idEmpleado} para actualizar estadísticas.`);
        }
    } catch (error) {
        console.error("Error al actualizar estadísticas del empleado:", error);
    }
}

/**
 * Procesa y liquida una venta:
 * 1. Verifica existencias y descuenta stock en `productos.xml`.
 * 2. Consulta y aplica ofertas vigentes desde `ofertaDao`.
 * 3. Registra la transacción en `ventas.xml`.
 * 4. Actualiza los contadores de ventas en `empleados.xml`.
 * 
 * @function registrarVenta
 * @param {Object} datosVenta - Parámetros de la venta.
 * @param {string|number} datosVenta.idEmpleado - ID del cajero/empleado.
 * @param {Array<{idProducto: string|number, cantidad: number}>} datosVenta.items - Productos a comprar.
 * @returns {Object} Confirmación `{ ok: true, ticket: Object }`.
 * @throws {Error} Si algún producto no existe o si no hay stock suficiente.
 */
function registrarVenta(datosVenta) {
    try {
        const parser = new XMLParser(parserConfig);
        const builder = new XMLBuilder(builderConfig);

        // 1. Obtener catálogo actual de productos
        const xmlProductos = fs.readFileSync(archivoProductos, 'utf-8');
        const resProductos = parser.parse(xmlProductos);
        const listaProductos = resProductos.productos?.producto || [];

        // 2. Obtener ofertas activas mediante el DAO y la clase Oferta
        let ofertasActivas = [];
        try {
            const rawOfertas = ofertaDao.obtenerOfertas ? ofertaDao.obtenerOfertas() : [];
            ofertasActivas = rawOfertas
                .map(o => new Oferta(o))
                .filter(o => o.estado() === "disponible");
        } catch (e) {
            console.warn("No se pudieron cargar ofertas desde ofertaDao, procesando precio base:", e.message);
        }

        const itemsParaTicket = [];
        let totalVenta = 0;

        // 3. Validar stock y calcular precios aplicando promociones vigentes
        for (const item of datosVenta.items) {
            const idBuscado = String(item.idProducto).trim();
            const producto = listaProductos.find((p) => extraerId(p) === idBuscado);

            if (!producto) {
                throw new Error(`Producto con ID ${item.idProducto} no encontrado.`);
            }

            const stockActual = parseInt(producto.stock, 10) || 0;
            const cantidadSolicitada = Number(item.cantidad);

            if (stockActual < cantidadSolicitada) {
                throw new Error(`Stock insuficiente para ${producto.nombre}. Stock actual: ${stockActual}, solicitado: ${cantidadSolicitada}`);
            }

            const precioBase = Number(producto.precio) || 0;
            const oferta = ofertasActivas.find(o => String(o.idProducto).trim() === idBuscado);

            let precioFinal = precioBase;
            let porcentajeDescuento = 0;

            if (oferta) {
                if (oferta.tipoProm === "porcentaje") {
                    porcentajeDescuento = Number(oferta.valorDesc);
                    precioFinal = precioBase * (1 - (porcentajeDescuento / 100));
                } else if (oferta.tipoProm === "precioFijo") {
                    precioFinal = Number(oferta.valorDesc);
                } else if (oferta.tipoProm === "cantidad") {
                    const recibe = Number(oferta.cantidadRecibe) || 1;
                    const paga = Number(oferta.cantidadPaga) || 1;
                    if (recibe > 0 && paga > 0) {
                        const paquetes = Math.floor(cantidadSolicitada / recibe);
                        const sobrantes = cantidadSolicitada % recibe;
                        const unidadesCobradas = (paquetes * paga) + sobrantes;
                        precioFinal = (unidadesCobradas * precioBase) / cantidadSolicitada;
                    }
                }
            }

            const subtotal = Number((precioFinal * cantidadSolicitada).toFixed(2));
            totalVenta += subtotal;

            itemsParaTicket.push({
                "@_idProducto": extraerId(producto),
                nombre: producto.nombre,
                precioUnitario: precioBase.toFixed(2),
                descuento: porcentajeDescuento > 0 ? `${porcentajeDescuento}%` : "0%",
                cantidad: cantidadSolicitada,
                subtotal: subtotal.toFixed(2),
            });
        }

        // 4. Descontar stock del inventario
        for (const item of datosVenta.items) {
            const idBuscado = String(item.idProducto).trim();
            const producto = listaProductos.find((p) => extraerId(p) === idBuscado);
            producto.stock = (parseInt(producto.stock, 10) || 0) - Number(item.cantidad);
        }

        // Guardar nuevo stock en productos.xml
        resProductos.productos.producto = listaProductos;
        fs.writeFileSync(archivoProductos, builder.build(resProductos), 'utf-8');

        // 5. Instanciar la Venta con la clase modelo
        const nuevoFolio = obtenerSiguienteIdVenta();
        const ventaInstancia = new Venta({
            id: nuevoFolio,
            idEmpleado: datosVenta.idEmpleado || "1",
            items: itemsParaTicket,
            total: totalVenta,
            fecha: new Date()
        });

        // 6. Preparar y guardar la venta en ventas.xml
        let xmlVentas = "<ventas></ventas>";
        if (fs.existsSync(archivoVentas)) {
            const contenido = fs.readFileSync(archivoVentas, 'utf-8').trim();
            if (contenido.length > 0) {
                xmlVentas = contenido;
            }
        }

        const resVentas = parser.parse(xmlVentas);
        if (!resVentas.ventas) resVentas.ventas = { venta: [] };
        if (!resVentas.ventas.venta) resVentas.ventas.venta = [];

        const ventaData = ventaInstancia.toJSON();
        const nuevaVentaXML = {
            "@_id": ventaData.id,
            fecha: ventaData.fecha,
            idEmpleado: ventaData.idEmpleado,
            total: ventaData.total.toFixed(2),
            items: {
                item: ventaData.items
            }
        };

        resVentas.ventas.venta.push(nuevaVentaXML);
        fs.writeFileSync(archivoVentas, builder.build(resVentas), 'utf-8');

        // 7. Incrementar contadores del empleado
        registrarVentaEmpleado(datosVenta.idEmpleado);

        return {
            ok: true,
            ticket: nuevaVentaXML,
        };
    } catch (error) {
        console.error("Error al registrar la venta en DAO:", error);
        throw error;
    }
}

module.exports = {
    registrarVenta,
    obtenerSiguienteIdVenta,
    registrarVentaEmpleado
};