const fs = require('fs');
const path = require('path');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

const archivoVentas = path.join(__dirname, '../data/xml/ventas.xml');
const archivoProductos = path.join(__dirname, '../data/xml/productos.xml');

const parserConfig = {
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (tagName) => ["venta", "producto", "item"].includes(tagName),
};

const builderConfig = {
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
};

// Función auxiliar para obtener el ID sin importar si viene como atributo o etiqueta
function extraerId(entidad) {
    if (!entidad) return "";
    return String(entidad['@_id'] !== undefined ? entidad['@_id'] : (entidad.id !== undefined ? entidad.id : "")).trim();
}

// Obtiene el siguiente ID autoincrementable para una venta
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

// Procesa la venta, descuenta stock y guarda en disco
function registrarVenta(datosVenta) {
    try {
        const parser = new XMLParser(parserConfig);
        const builder = new XMLBuilder(builderConfig);

        // 1. Leer inventario actual
        const xmlProductos = fs.readFileSync(archivoProductos, 'utf-8');
        const resProductos = parser.parse(xmlProductos);
        const listaProductos = resProductos.productos?.producto || [];

        const itemsParaTicket = [];
        let totalVenta = 0;

        // 2. Validar existencias y calcular subtotales
        for (const item of datosVenta.items) {
            const producto = listaProductos.find((p) => extraerId(p) === String(item.idProducto).trim());
            if (!producto) {
                throw new Error(`Producto con ID ${item.idProducto} no encontrado.`);
            }

            const stockActual = parseInt(producto.stock, 10) || 0;
            const cantidadSolicitada = Number(item.cantidad);
            if (stockActual < cantidadSolicitada) {
                throw new Error(`Stock insuficiente para ${producto.nombre}. Stock actual: ${stockActual}, solicitado: ${cantidadSolicitada}`);
            }

            const precioUnitario = Number(producto.precio) || 0;
            const descuento = Number(producto.descuento) || 0;
            const precioFinal = descuento > 0 ? precioUnitario * (1 - descuento) : precioUnitario;
            const subtotal = precioFinal * cantidadSolicitada;
            totalVenta += subtotal;

            itemsParaTicket.push({
                "@_idProducto": extraerId(producto),
                nombre: producto.nombre,
                precioUnitario: precioUnitario.toFixed(2),
                descuento: descuento,
                cantidad: cantidadSolicitada,
                subtotal: subtotal.toFixed(2),
            });
        }

        // 3. Descontar stock en memoria
        for (const item of datosVenta.items) {
            const producto = listaProductos.find((p) => extraerId(p) === String(item.idProducto).trim());
            producto.stock = (parseInt(producto.stock, 10) || 0) - Number(item.cantidad);
        }

        // 4. Guardar inventario actualizado en data/xml/productos.xml
        resProductos.productos.producto = listaProductos;
        fs.writeFileSync(archivoProductos, builder.build(resProductos), 'utf-8');

        // 5. Leer historial y registrar la nueva venta en data/xml/ventas.xml
        let xmlVentas = "<ventas></ventas>";
        if (fs.existsSync(archivoVentas)) {
            const contenido = fs.readFileSync(archivoVentas, 'utf-8').trim();
            if (contenido.length > 0) { // Corregido el error tipográfico .length
                xmlVentas = contenido;
            }
        }

        const resVentas = parser.parse(xmlVentas);
        if (!resVentas.ventas) {
            resVentas.ventas = { venta: [] };
        }
        if (!resVentas.ventas.venta) {
            resVentas.ventas.venta = [];
        }

        const nuevaVenta = {
            "@_id": obtenerSiguienteIdVenta(),
            fecha: new Date().toISOString(),
            idEmpleado: datosVenta.idEmpleado || "1",
            total: totalVenta.toFixed(2),
            items: {
                item: itemsParaTicket
            }
        };

        resVentas.ventas.venta.push(nuevaVenta);
        fs.writeFileSync(archivoVentas, builder.build(resVentas), 'utf-8');

        return {
            ok: true,
            ticket: nuevaVenta,
        };
    } catch (error) {
        console.error("Error al registrar la venta en DAO:", error);
        throw error;
    }
}

module.exports = {
    registrarVenta,
    obtenerSiguienteIdVenta
};