
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

const empleado = require('../clases/empleadoClass');

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

/**
 * Funcion para obtener a un objeto js empleado desde la base de datos.
 * @param {} id 
 */
function obtenerEmpleado(id){
    try {
        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['empleado'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const empleados = resultado.empleados?.empleado || [];
        for(let n=0; n<empleados.length;n++){
            if(Number(empleados[n].id)=== Number(id)){
                return empleados[n];
            }
        }
        return null;

    } catch (error) {
        console.error("Error al obtener los datos de los empleados:", error);
        throw error;
    }
}

/**
 * Realiza la busqueda en la base de datos de usuarios buscando en base al
 * atributo 'usuario'
 * 
 * @param {string} usuario Nombre de usuario buscado
 * @returns 
 */
function obtenerEmpleadoPorUsuario(usuario) {
    try {
        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['empleado'].includes(tagName)
        });

        const resultado = parser.parse(xml);
        const empleados = resultado.empleados?.empleado || [];

        const encontrado = empleados.find(empleado => empleado.usuario === usuario);
        return encontrado || null;

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
 * Funcion para eliminar a un empleado del archivo xml
 * @param {*} id 
 * @returns 
 */
function eliminarEmpleado(id){
    try {
        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['empleado'].includes(tagName)
        });

        //Convertir el xml a un arreglo de objetos js
        const resultado = parser.parse(xml);

        //Si mi xml no tiene la estructura se agrega y se manda una variable que indica que no hay una estructura en el sistema.
        if(!resultado.empleados){
            return{
                ok: false,
                errorXml: true
            }
        }
        
        //Simplificamos el arreglo de empleados
        const empleados = resultado.empleados?.empleado || [];

        // Buscar al empleado, recorro el arreglo empleados y busco al empleado a eliminar mediante su id, cuando se encuentra se elimina del arreglo.
        for(n=0;n<empleados.length;n++){
            if(empleados[n].id===id){
                empleados.splice(n,1);
            }
        }

        //Agregamos el nuevo contenido a resultado
        resultado.empleados.empleado = empleados;

        // Crear una instancia XMLBuilder
        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false
        });

        //Creamos un nuevo archivo xml con la estructura de la variable resultado
        const nuevoXml = builder.build(resultado);

        // Sobrescribir el archivo XML en disco
        fs.writeFileSync(archivo, nuevoXml, "utf8");
        return {
            ok: true,
            eliminado: true
        };
    } catch (error) {
        console.error("Error al eliminar al empleado de la BD:", error);
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
function actualizarEmpleado(id , datosEmpleado) {
    try {
        //Obtenemos el xml en una cadena de texto
        const xml = fs.readFileSync(archivo, "utf8");
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['empleado'].includes(tagName)
        })

        // Convertir XML a Objeto de JS
        const resultado = parser.parse(xml);

        // Si el XML está vacío o no tiene la estructura,
        // crear la estructura inicial
        if (!resultado.empleados) {
            resultado.empleados = {
                empleado: []
            }
        }
        // Obtencion array de Empleados
        const empleados = resultado.empleados?.empleado || [];

        // Buscar al empleado a modificar
        let empleadoExistente = empleados.find(
            empleadoIt => Number(empleadoIt.id) === Number(id)
        )
        // Actualizacion datos
        for(let n=0;n<datosEmpleado.length;n++){
            //Identifico el campo del objeto js iterado
            if(datosEmpleado[n].campo==='nombre'){
                empleadoExistente.nombre = datosEmpleado[n].valor
            }
            if(datosEmpleado[n].campo==='puesto'){
                empleadoExistente.puesto = datosEmpleado[n].valor
            }
            if(datosEmpleado[n].campo==='telefono'){
                empleadoExistente.telefono = datosEmpleado[n].valor
            }
            if(datosEmpleado[n].campo==='usuario'){
                empleadoExistente.usuario = datosEmpleado[n].valor
            }
            if(datosEmpleado[n].campo==='password'){
                empleadoExistente.password = datosEmpleado[n].valor
            }
        }
        // Guarda a los empleados excepto al que se quiere actualizar
        const nuevosEmpleados = empleados.filter(
            empleadoIt => empleadoIt.id !== id
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
        //Generar el nuevo xml
        const nuevoXml = builder.build(resultado);

        // Sobrescribir el archivo XML en disco
        fs.writeFileSync(archivo, nuevoXml, "utf8");
        //Regresar una respuesta
        return {
            ok: true,
            actualizado: true
        };

    // Resolucion en caso de error
    } catch (error) {
        console.error("Error al actualizar datos empleado BD:", error);
        throw error;
    }
}
/**
 * Obtiene el reporte de desempeño y evalúa candidatos a promoción.
 * @function obtenerReporteDesempeno
 * @returns {Object} Objeto con el estatus y la lista de empleados evaluados.
 */
function obtenerReporteDesempeno(){
    try{
        const empleados = obtenerEmpleados();

        //aqui vamos a mapear y evaluar métricas para cada empleado
        const reporteEmpleados = empleados.map(emp =>{
            const numVentas = parseInt(emp.numVentas) || 0;
            const numTransacciones = parseInt(emp.numTransacciones) || 0;

            //la regla para poder promocionarlo
            const esCandidatoPromocion= numVentas >=5;

            return {
                id: emp.id,
                nombre: emp.puesto,
                puesto: emp.puesto,
                usuario: emp.usuario,
                numVentas: numVentas,
                numTransacciones: numTransacciones,
                esCandidatoPromocion: esCandidatoPromocion

            };


        });

        return {
            ok: true,
            empleados: reporteEmpleados
        };
    }catch(error){
        console.error("Error al generar reporte de desempeño:", error);
        throw error;
    }

}



module.exports = {
    obtenerEmpleados,
    obtenerEmpleado,
    agregarEmpleado,
    obtenerReporteDesempeno,
    obtenerEmpleadoPorUsuario,
    actualizarEmpleado,
    eliminarEmpleado
};