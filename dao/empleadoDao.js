
/**
 * Maneja la extraccion de datos desde el xml de empleados
 * 
 * @module empleadoDao
 */

const Empleado = require("../clases/empleadoClass");

const fs = require('fs');

const {XMLParser, XMLBuilder } = require ("fast-xml-parser");

const path = require('path');

const archivo = path.join(__dirname, "../data/xml/empleados.xml");

/**
 * Obtener un arreglo con todos los empleados en el archivo xml
 * @function obtenerEmpleados
 * @returns {Array<Empleado>} Arreglo con los datos de los empleados.
 * @throws {Error} Si ocurre un error al leer o procesar el archivo XML.
 */
function obtenerEmpleados() {
    try {
        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['empleado'].includes(tagName)
        });

        // Convertir XML a Objeto de JS
        const resultado = parser.parse(xml);
        const empleados = resultado.empleados?.empleado || [];
        //Devolvemos el arreglo de empleados
        return empleados

    // Resolucion en caso de error
    } catch (error) {
        console.error("Error al obtener los datos de los empleados:", error);
        throw error;
    }
}

function obtenerEmpleado(id){
    try {
        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['empleado'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const empleados = resultado.empleados?.empleado || [];
        empleados.forEach(empleado => {
            if(empleado.id === id){
                return element;
            }
        return null;
        });

    } catch (error) {
        console.error("Error al obtener los datos de los empleados:", error);
        throw error;
    }
}


/**
 * Agrega un nuevo empleado a la base de datos.
 * 
 * Convierte el contenido del archivo XML a un objeto de JavaScript,
 * Agrega el nuevo empleado y luego vuelve a generar el XML.
 * 
 * @function agregarEmpleado
 * @param {Object} empleado - Objeto que contiene los datos del empleado.
 * @param {number} empleado.id.
 * @param {string} empleado.nombre.
 * @param {string} empleado.puesto.
 * @param {number} empleado.telefono.
 * @param {string} empleado.usuario.
 * @param {string} empleado.password.
 * @param {number} empleado.numVentas.
 * @param {number} empleado.numTransacciones.
 * @returns {res} Respuesta del servidor
 * @throws {Error} Si ocurre un error al leer, modificar o escribir el archivoXML
 */
function agregarEmpleado(empleado){
    try {
        const xml = fs.readFileSync(archivo, "utf8");
         const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['empleado'].includes(tagName)
        });

        //Convertir XML a Objeto de JS
        const resultado = parser.parse(xml);
        
        // Si el XML está vacío o no tiene la estructura,
        // crear la estructura inicial
        if (!resultado.empleados) {
            resultado.empleados = {
                empleado: []
            };
        }

        const empleados = resultado.empleados?.empleado || [];

    //Creamos al nuevo empleado utilizando los datos del parametro
        const nuevoEmpleado = {
            id: empleado.id,
            nombre: empleado.nombre,
            puesto: empleado.puesto,
            telefono: empleado.tel,
            usuario: empleado.usuario,
            password: empleado.password,
            numVentas: 0,
            numTransacciones: 0
        }

        //Agregar al arreglo existente
        empleados.push(nuevoEmpleado);
        //Agregamos el nuevo contenido a resultado
        resultado.empleados.empleado = empleados;

        // Convertir el objeto JS de vuelta a formato XML
        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false
        });

        const nuevoXml = builder.build(resultado);

        //Sobrescriir el archivo XML en disco
        fs.writeFileSync(archivo, nuevoXml, "utf8");

        return { ok:true };

    //Resolucion en caso de error
    } catch (error) {
        console.error("Error al agregar empleado BD:", error);
        throw error;
    }
}

/**
 * Modifica los datos de un empleado a la base de datos.
 * 
 * Convierte el contenido del archivo XML a un objeto de JavaScript,
 * Modifica los datos del empleado y luego vuelve a generar el XML.
 * 
 * @function actualizarDatos
 * @param {Object} empleado - Objeto que contiene los nuevos datos del empleado.
 * @param {number} empleado.id - Id del empleado 
 * @param {string} empleado.nombre - Nombre del empleado
 * @param {string} empleado.puesto - Puesto del empleado
 * @param {number} empleado.telefono - Telefono del empleado
 * @param {string} empleado.usuario - Usuario del empleado
 * @param {string} empleado.password - Contraseña del empleado
 * @returns {res} Resultado de la operacion.
 * @throws {Error} Si ocurre un error al leer, modificar o escribir el archivoXML
 */
function actualizarDatos(empleado) {
    try {
        const xml = fs.readFileSync(archivo, "utf8");

        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['empleado'].includes(tagName)
        });

        // Convertir XML a Objeto de JS
        const resultado = parser.parse(xml);

        // Si el XML está vacío o no tiene la estructura,
        // crear la estructura inicial
        if (!resultado.empleados) {
            resultado.empleados = {
                empleado: []
            };
        }

        // Obtencion array de Empleados
        const empleados = resultado.empleados?.empleado || [];

        // Buscar al empleado
        const empleadoExistente = empleados.find(
            empleadoIt => empleadoIt.id === empleado.id
        );

        // Actualizacion datos
        empleadoExistente.nombre = empleado.nombre;
        empleadoExistente.puesto = empleado.puesto;
        empleadoExistente.telefono = empleado.telefono;
        empleadoExistente.usuario = empleado.usuario;
        empleadoExistente.password = empleado.password;

        // Guarda a los empleados excepto al que se quiere actualizar
        const nuevosEmpleados = empleados.filter(
            empleadoIt => empleadoIt.id !== empleado.id
        );

        // Se pushea el empleado existente
        nuevosEmpleados.push(empleadoExistente);

        //Ordenamos el arreglo de empleados en base al id.
        nuevosEmpleados.sort((a,b) => a.id -b.id);

        // Se convierte el arreglo a una variable leible por xml.
        resultado.empleados.empleado = nuevosEmpleados;

        // Convertir el objeto JS de vuelta a formato XML
        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false
        });

        const nuevoXml = builder.build(resultado);

        // Sobrescribir el archivo XML en disco
        fs.writeFileSync(archivo, nuevoXml, "utf8");

        return {
            ok: true,
            encontrado: true
        };

    // Resolucion en caso de error
    } catch (error) {
        console.error("Error al actualizar datos empleado BD:", error);
        throw error;
    }
}

module.exports = {
    obtenerEmpleados,
    obtenerEmpleado,
    agregarEmpleado,
    actualizarDatos
    
};