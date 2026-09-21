const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function agregarMensaje(req, res) {
    const { destino, contenido } = req.body;

    const rutaXml = path.join(__dirname, '..', 'mensajes.xml');

    if(!destino || !contenido){
        return res.status(400).json({
            ok: false,
            mensaje: "Todos los datos del formulario son obligatorios"
        });
    }

    // Verificaremos si el empleado a agregar ya existe en el sistema
    const empleadoExistente = await empleadoDao.obtenerEmpleadoPorUsuario(destino);
}