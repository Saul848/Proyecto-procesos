const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const empleadoDao = require("../dao/empleadoDao");
const rutaXml = path.join(__dirname, '..', 'data', 'xml', 'mensajes.xml');


async function agregarMensaje(req, res) {
    const { destino, contenido } = req.body;

    const xmlContent = fs.readFileSync(rutaXml, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlContent);

    let mensajes = result.mensajes.mensaje || [];
    if (!Array.isArray(mensajes)) mensajes = [mensajes];

    if(!destino || !contenido){
        return res.status(400).json({
            ok: false,
            mensaje: "Todos los datos del formulario son obligatorios"
        });
    }

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

async function leerMensajes(req, res) {
    const { usuario } = req.body;

    const xmlContent = fs.readFileSync(rutaXml, 'utf-8');
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlContent);

    let mensajes = result.mensajes.mensaje || [];
    if (!Array.isArray(mensajes)) mensajes = [mensajes];

    if(!usuario){
        return res.status(400).json({
            ok: false,
            mensaje: "No se detectó usuario en la sesión actual"
        });
    }

    let filas = '';
    let msjTotal = 0;

    for(const mensaje of mensajes){
        if(mensaje.destino === usuario){
            msjTotal += 1;
            filas +=`
                <tr>
                    <td>${mensaje.destino}</td>
                    <td>${mensaje.contenido}</td>
                </tr>
            `;
        }
    }


    let tabla = `
        <table id="tabla_mensajes" border="1">
            <thead>
                <tr>
                    <th>Destino:</th>
                    <th>Mensaje:</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
    `
    
    
    if(msjTotal <= 0){
        tabla = `
            <div>
                <h3 id="label_cero_mensajes">No hay mensajes para ti hoy :)<h3>
            </div>
        `
    }

    res.send(tabla);
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