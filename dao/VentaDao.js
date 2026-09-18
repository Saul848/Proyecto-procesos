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

// esta funcion obtiene el siguiente id autoincrementable para una venta
function obtenerSiguienteIdVenta() {
    if (!fs.existsSync(archivoVentas)) {
        return 1;
    }
    const xmlData = fs.readFileSync(archivoVentas, 'utf-8');
    const parser = new XMLParser(parserConfig);
    const resultodo = parser.parse(xmlData);
    const ventas = resultodo.ventas?.venta || [];
    const maxId = ventas.reduce((max, v) => {
        const idActual = parseInt(v['@_id'], 10) || 0;
        return idActual > max ? idActual : max;
    }, 0);
    return String(maxId + 1);
}
//funcion para procesar la venbta
function registrarVenta(datosVenta) {
    try {
        const parser = new XMLParser(parserConfig);
        const builder = new XMLBuilder(builderConfig);
        const xmlProductos = fs.readFileSync(archivoProductos, 'utf-8');
        const resProuctos = parser.parse(xmlProductos);
        const listaProductos = resProuctos.productos?.producto || [];
       // Funcion para validar stock 
        const itemsParaTicket = [];
        let totalVenta = 0;

        for (const item of datosVenta.items) {
            const producto = listaProductos.find((p) => String(p['@_id']) === String(item.idProducto));
            if (!producto) {
                throw new Error(`Producto con ID ${item.idProducto} no encontrado.`);
            }
            const stockActual = parseInt(producto.stock) || 0;
            const cantidadSolicitada = Number(item.cantidad);
            if (stockActual < cantidadSolicitada) {
                throw new Error(`Stock insuficiente para el producto ${producto.nombre}. Stock actual: ${stockActual}, cantidad solicitada: ${cantidadSolicitada}`);
            }

            const precioUnitario = Number(producto.precio) || 0;
            const descuento = Number(producto.descuento) || 0;
            const precioFinal = descuento > 0 ? precioUnitario * (1 - descuento) : precioUnitario;
            const subtotal = precioFinal * cantidadSolicitada;
            totalVenta += subtotal;

            itemsParaTicket.push({
                "@_idProducto": String(producto['@_id']),
                nombre: producto.nombre,
                precioUnitario: precioUnitario.toFixed(2),
                descuento: descuento,
                cantidad: cantidadSolicitada,
                subtotal: subtotal.toFixed(2),
            });
        }
        //descontar stock de los productos
        for (const item of datosVenta.items) {
            const producto = listaProductos.find((p) => String(p['@_id']) === String(item.idProducto));
            producto.stock = Number(producto.stock) - Number(item.cantidad);
        }

        // guardar inventario actualizado en productos.xml
        resProuctos.productos.producto = listaProductos;
        fs.writeFileSync(archivoProductos, builder.build(resProuctos), 'utf-8');

        //leer y registrar en ventas.xml
        let xmlVentas = "<ventas></ventas>";
        if (fs.existsSync(archivoVentas)) {
            const contenido = fs.readFileSync(archivoVentas, 'utf-8').trim();
            if (contenido.lenght > 0) xmlVentas = contenido;
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
    registrarVenta
        

    };
