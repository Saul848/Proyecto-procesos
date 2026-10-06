/**
 * Controlador para la gestión de ventas, folios y estado de caja.
 * @module controladores/ventaControlador
 */

const ventaDao = require('../dao/VentaDao');
const path = require('path');
const fs = require("fs");

const xml2js = require('xml2js');
/**
 * Estado en memoria de la caja registradora.
 * @type {boolean}
 */
let cajaAbierta = true;

/**
 * Retorna el estado actual de la caja registradora.
 * 
 * @function obtenerEstadoCaja
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {void} JSON con la bandera `cajaAbierta`.
 */
function obtenerEstadoCaja(req, res) {
    res.json({ cajaAbierta });
}

/**
 * Modifica el estado de apertura/cierre de la caja registradora.
 * 
 * @function cambiarEstadoCaja
 * @param {import('express').Request} req - Petición con `{ abierta: boolean }` en el body.
 * @param {import('express').Response} res - Respuesta con mensaje confirmando el cambio.
 * @returns {void}
 */
function cambiarEstadoCaja(req, res) {
    const { abierta } = req.body;
    cajaAbierta = Boolean(abierta);
    res.json({
        mensaje: `El estado de la caja ha sido cambiado a ${cajaAbierta ? 'abierta' : 'cerrada'}.`,
        cajaAbierta
    });
}

/**
 * Procesa y registra una venta validando el estado de la caja y los productos recibidos.
 * 
 * @function procesarVenta
 * @param {import('express').Request} req - Objeto de petición que incluye `{ idEmpleado, items }`.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {void}
 */
function procesarVenta(req, res) {
    try {
        if (!cajaAbierta) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se puede procesar la venta porque la caja está cerrada.'
            });
        }

        const { idEmpleado, idCaja, metodoPago, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se proporcionaron items válidos para la venta.'
            });
        }

        // Validación estructural de cada ítem
        const itemsInvalidos = items.some(
            (it) => !it.idProducto || isNaN(Number(it.cantidad)) || Number(it.cantidad) <= 0
        );

        if (itemsInvalidos) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Todos los productos deben contener un idProducto válido y una cantidad mayor a 0.'
            });
        }

        const resultado = ventaDao.registrarVenta({
            idEmpleado: idEmpleado || "1",
            idCaja: idCaja || "1",
            metodoPago: metodoPago || "Efectivo",
            items
        });
        

        res.status(200).json({
            ok: true,
            mensaje: 'Venta procesada exitosamente.',
            ticket: resultado.ticket
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: 'Error al procesar la venta.',
            error: error.message
        });
    }
}

/**
 * Consulta y devuelve el próximo número de folio para la siguiente venta.
 * 
 * @function obtenerProximoFolio
 * @param {import('express').Request} req - Objeto de petición Express.
 * @param {import('express').Response} res - Objeto de respuesta Express con `{ siguienteFolio }`.
 * @returns {void}
 */
function obtenerProximoFolio(req, res) {
    try {
        const siguienteId = ventaDao.obtenerSiguienteIdVenta();
        res.json({ siguienteFolio: siguienteId });
    } catch (error) {
        res.status(500).json({ siguienteFolio: "1" });
    }
}
/**
 * Obtiene el historial de ventas filtrado por rango de fechas o empleado.
 * @param {Object} req  Objeto de petición HTTP (puede incluir query params: fechaInicio, fechaFin, idEmpleado).
 * @param {Object} res  Objeto de respuesta HTTP.
 */
function obtenerHistorialVentas(req, res) {
    try {
        const { fechaInicio, fechaFin, idEmpleado } = req.query;

        const filtros = {
            fechaInicio,
            fechaFin,
            idEmpleado
        };

        const ventasFiltradas = ventaDao.obtenerHistorialVentas(filtros);

        return res.status(200).json({
            ok: true,
            mensaje: "Historial de ventas obtenido correctamente",
            data: ventasFiltradas
        });
    } catch (error) {
        console.error("Error en el controlador al obtener historial de ventas:", error);
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al intentar obtener el historial de ventas"
        });
    }
}

/**
 * Consulta el historial completo de ventas registradas.
 * GET /api/ventas
 */
function listarVentas(req, res) {
    try {
        const ventas = ventaDao.obtenerVentas();
        res.json({ ok: true, ventas });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener historial de ventas.',
            error: error.message
        });
    }
}

/**
 * Consulta una venta específica por su identificador para reimpresión.
 * GET /api/ventas/:id
 */
function obtenerVentaPorId(req, res) {
    try {
        const { id } = req.params;
        const venta = ventaDao.obtenerVentaPorId(id);

        if (!venta) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Venta no encontrada.'
            });
        }

        res.json({ ok: true, venta });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener la venta.',
            error: error.message
        });
    }
}


let contadorFacturas = 0;

/**
 * Genera una factura comercial a partir de una venta ya registrada.
 */
function generarFactura(req, res){
    try{
        //datos enviados por el cliente
        const { folio, nombre, direccion, correo, telefono } = req.body;

        if (!folio) return res.status(400).json({ ok: false, mensaje: "El folio de la venta es obligatorio." });
        if (!nombre) return res.status(400).json({ ok: false, mensaje: "El nombre es obligatorio." });

        //buscamos la venta por su folio
        const venta = ventaDao.obtenerVentaPorFolio(folio);
        if (!venta) return res.status(404).json({ ok: false, mensaje: "Venta no encontrada." });

        contadorFacturas++;

        //datos de la tienda
        const tienda = {
            nombre: "OXXO",
            direccion: "Calle Cualquiera 123, Xalapa, Ver. CP 91000",
            correo: "tiendaOxxo@oxxo.com",
            telefono: "(55) 1234-5678"
        };

        const itemsVenta = venta.items?.item || [];
        const items = (Array.isArray(itemsVenta) ? itemsVenta : [itemsVenta]).map(it => {
            const precio = Number(it.precioUnitario || it.precio) || 0;
            const cantidad = Number(it.cantidad) || 1;
            const iva = precio * 0.16;
            return {
                nombre: it.nombre || "Producto",
                cantidad,
                precio: Number(precio.toFixed(2)),
                iva: Number(iva.toFixed(2)),
                totalLinea: Number(((precio + iva) * cantidad).toFixed(2))
            };
        });

        const baseImponible = items.reduce((sum, it) => sum + (it.precio * it.cantidad), 0);
        const ivaTotal = items.reduce((sum, it) => sum + (it.iva * it.cantidad), 0);
        const total = baseImponible + 0.16 * baseImponible;

        //construimos factura
        const factura = {
            numeroFactura: contadorFacturas,
            folioVenta: folio,
            fechaEmision: new Date().toLocaleDateString('es-MX'),
            cliente: { nombre, direccion: direccion || "", correo: correo || "", telefono: telefono || "" },
            items,
            baseImponible: Number(baseImponible.toFixed(2)),
            ivaTotal: Number(ivaTotal.toFixed(2)),
            total: Number(total.toFixed(2)),
            tienda
        };

        res.json({ ok: true, factura });
    } catch(error){
        res.status(500).json({ ok: false, mensaje: "Error al generar factura.", error: error.message });
    }
  
async function devolverProducto(req, res) {
    const { id, cantidad, motivo } = req.body;
    if (!id || !cantidad || !motivo) {
        return res.status(400).json({
        ok: false,
        mensaje: "El ID y la cantidad son obligatorios"
        });
    }
    const cantidadNum = Number(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
        return res.status(400).json({
        ok: false,
        mensaje: "La cantidad debe ser un número mayor a 0"
        });
    }
    const rutaXml = path.join(__dirname, '..', 'data', 'xml', 'productos.xml');
    const xmlContent = fs.readFileSync(rutaXml, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlContent);
    let productos = result.productos.producto;
    if (!Array.isArray(productos)) productos = [productos];
    const producto = productos.find(p => p.$.id === id);
    if (!producto) {
        return res.status(404).json({
        ok: false,
        mensaje: "No se encontró el producto"
        });
    }
    // Suma la cantidad devuelta al stock actual
    const stockActual = Number(producto.stock);
    producto.stock = String(stockActual + cantidadNum);
    result.productos.producto = productos;
    const builder = new xml2js.Builder();
    const xmlFinal = builder.buildObject(result);
    fs.writeFileSync(rutaXml, xmlFinal, 'utf-8');
    res.json({
        ok: true,
        mensaje: `Se devolvieron ${cantidadNum} unidades. Stock actual: ${stockActual + cantidadNum}`
    });
}

module.exports = {
    obtenerEstadoCaja,
    cambiarEstadoCaja,
    procesarVenta,
    obtenerProximoFolio,
    listarVentas,
    obtenerVentaPorId,
    obtenerHistorialVentas,
    generarFactura,
    devolverProducto
};