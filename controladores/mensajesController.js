const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const empleadoDao = require("../dao/empleadoDao");
const rutaXml = path.join(__dirname, '..', 'data', 'xml', 'mensajes.xml');


async function agregarMensaje(req, res) {
    const { destino, contenido } = req.body;

    if(!destino || !contenido){
        return res.status(400).json({
            ok: false,
            mensaje: "Todos los datos del formulario son obligatorios"
        });
    }

    const xmlContent = fs.readFileSync(rutaXml, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlContent);
    
    let mensajes = result.mensajes.mensaje || [];
    if (!Array.isArray(mensajes)) mensajes = [mensajes];

    // Verificaremos si el empleado a agregar ya existe en el sistema
    const empleadoExistente = await empleadoDao.obtenerEmpleadoPorUsuario(destino);
    if(!empleadoExistente){
        return res.status(404).json({
            ok: false,
            mensaje: "No se encontró al empleado en el sistema",
        });
    }

    const nuevoMensaje = {
        destino: destino,
        contenido: contenido
    };

    mensajes.push(nuevoMensaje);
    result.mensajes.mensaje = mensajes;

    const builder = new xml2js.Builder();
    const xmlFinal = builder.buildObject(result);
    fs.writeFileSync(rutaXml, xmlFinal, 'utf-8')


    res.json({ ok: true, mensaje: 'Mensaje enviado correctamente' });
}

function escaparHtml(texto) {
    return texto
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function leerMensajes(req, res) {
    const { usuario } = req.body;

    // 1. Validar primero, antes de leer el archivo
    if (!usuario) {
        return res.status(400).json({
        ok: false,
        mensaje: "No se detectó usuario en la sesión actual"
        });
    }

    const rutaXml = path.join(__dirname, '..', 'data', 'xml', 'mensajes.xml');
    const xmlContent = fs.readFileSync(rutaXml, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlContent);

    let mensajes = result.mensajes.mensaje || [];
    if (!Array.isArray(mensajes)) mensajes = [mensajes];

    const mensajesFiltrados = mensajes.filter(m => m.destino === usuario);

    // 2. Caso sin mensajes
    if (mensajesFiltrados.length === 0) {
        return res.send(`<div class="sin-mensajes">Ningún mensaje pendiente hoy :b</div>`);
    }

    // 3. Caso con mensajes: lista + panel de detalle
    const items = mensajesFiltrados.map((m, index) => `
        <div class="item-mensaje" data-contenido="${escaparHtml(m.contenido)}">
        ${m.remitente || `Mensaje #${index + 1}`}
        </div>
    `).join('');

    res.send(`
        <div class="lista-mensajes" id="listaMensajes">${items}</div>
        <div class="contenido-mensaje" id="contenidoMensaje">Haz click en un mensaje para verlo!</div>
    `);
}


function mensajeBajoStock(producto){
    const xmlContent = fs.readFileSync(rutaXml, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = parser.parseStringPromise(xmlContent);

    let mensajes = result.mensajes.mensaje || [];
    if (!Array.isArray(mensajes)) mensajes = [mensajes];

    const empleados = empleadoDao.obtenerEmpleados();

    for(const emp of empleados){
        if(emp.puesto = "administrador"){
            let destino = emp.usuario;
            let contenido = "Alerta de bajo Stock por producto:" + producto;
            const nuevoMensaje = {
                destino: destino,
                contenido: contenido
            };

            mensajes.push(nuevoMensaje);
        }
        
    }
    
    result.mensajes.mensaje = mensajes;

    const builder = new xml2js.Builder();
    const xmlFinal = builder.buildObject(result);
    fs.writeFileSync(rutaXml, xmlFinal, 'utf-8')
}


module.exports = { agregarMensaje, leerMensajes, mensajeBajoStock };