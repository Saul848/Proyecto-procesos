
/**
 * Maneja la extraccion de datos desde el xml de empleados
 * 
 * @module empleadoDao
 */

const Empleado = require("../clases/empleadoClass");

const fs = require('fs');

const {XMLParser, XMLBuilder } = require ("fast-xml-parser");

const path = require('path');

const archivoEmp = path.join(__dirname, "../data/xml/empleados.xml");
const archivoReg = path.join(__dirname, "../data/xml/registrosEmpleado.xml");

const empleado = require('../clases/empleadoClass');

/**
 * Obtener un arreglo con todos los empleados en el archivo xml
 * @function obtenerEmpleados
 * @returns {Array<Empleado>} Arreglo con los datos de los empleados.
 * @throws {Error} Si ocurre un error al leer o procesar el archivo XML.
 */
function obtenerEmpleados() {
    try {
        //Obtenemos el contenido del xml en una linea de texto
        const xml = fs.readFileSync(archivoEmp, "utf8");
        // Se valida que la linea obtenida no este vacia, en ese caso regresamos un arreglo vacio
        if (!xml || xml.trim() === "") {
            return [];
        }
        // Se construye el parser
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['empleado'].includes(tagName)
        });

        // Convertir XML a Objeto de JS
        const resultado = parser.parse(xml);
        
        // Se valida que el resultado del parseo sea un objeto válido
        if (!resultado || typeof resultado !== 'object') {
            return [];
        }

        // Se valida que exista el objeto raíz 'empleados'
        const raiz = resultado.empleados;
        if (!raiz || typeof raiz !== 'object') {
            return [];
        }

        // Se obtiene la propiedad 'empleado' y verificamos que sea un arreglo
        const empleadosCrudos = raiz.empleado;
        const arregloEmpleados = Array.isArray(empleadosCrudos) 
            ? empleadosCrudos 
            : (empleadosCrudos ? [empleadosCrudos] : []);
        
        // Se filtran elementos internos: eliminar nulos, indefinidos, strings vacíos u objetos vacíos
        const empleadosValidos = arregloEmpleados.filter(emp => {
            return emp !== null && 
                   emp !== undefined && 
                   typeof emp === 'object' && 
                   Object.keys(emp).length > 0;
        }); 

        return empleadosValidos;

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
        const xml = fs.readFileSync(archivoEmp, "utf8");
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
        const xml = fs.readFileSync(archivoEmp, "utf8");
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
        const xml = fs.readFileSync(archivoEmp, "utf8");
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
            telefono: empleado.telefono,
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
        fs.writeFileSync(archivoEmp, nuevoXml, "utf8");

        //Regresamos una respuesta
        return { 
            ok:true,
            agregado:true
        };

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
        const xml = fs.readFileSync(archivoEmp, "utf8");
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

        let empleadoEliminado;
        // Buscar al empleado, recorro el arreglo empleados y busco al empleado a eliminar mediante su id, cuando se encuentra se elimina del arreglo.
        for(n=0;n<empleados.length;n++){
            if(empleados[n].id===id){
                empleadoEliminado=empleados[n];
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
        fs.writeFileSync(archivoEmp, nuevoXml, "utf8");

        //Regresamos una respuesta
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
        const xml = fs.readFileSync(archivoEmp, "utf8");
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
        fs.writeFileSync(archivoEmp, nuevoXml, "utf8");
        
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

        // Mapeamos y evaluamos métricas para cada empleado
        let reporteEmpleados = empleados.filter(emp => emp.puesto === "empleado")
        .map(emp =>{
            const numVentas = parseInt(emp.numVentas) || 0;
            const numTransacciones = parseInt(emp.numTransacciones) || 0;
            
            // Regla para poder promocionarlo
            let candidato = (numVentas >= 10 && numTransacciones >= 10);

            return {
                id: emp.id,
                nombre: emp.nombre,
                puesto: emp.puesto,
                numVentas: numVentas,
                numTransacciones: numTransacciones,
                esCandidatoPromocion: candidato
            };
        });

        // Se valida si no hay empleados para evitar errores fatales
        if (reporteEmpleados.length === 0) {
            return {
                ok: true,
                empleados: [],
                mvp: null
            };
        }

        // Se inicializa correctamente con el primer empleado del reporte
        let empleadoDelMes = reporteEmpleados[0].id;        
        let valorMayor = reporteEmpleados[0].numVentas + reporteEmpleados[0].numTransacciones;

        // Se recorre a partir del segundo elemento
        for(let n = 1; n < reporteEmpleados.length; n++){
            let sigValor = reporteEmpleados[n].numVentas + reporteEmpleados[n].numTransacciones;
            
            // Usamos '<=' si quieres que en caso de empate se quede con el último, 
            // o '<' si prefieres que se quede con el primero que alcanzó el récord.
            if(valorMayor < sigValor){
                valorMayor = sigValor;
                empleadoDelMes = reporteEmpleados[n].id;
            }
        }

        return {
            ok: true,
            empleados: reporteEmpleados,
            mvp: empleadoDelMes
        };
    }catch(error){
        console.error("Error al generar reporte de desempeño:", error);
        throw error;
    }
}

/**
 * Funcion para registrar una accion realizada por el gerente (Alta, baja o cambio)
 * @param {*} tipoAccion Tipo de accion en texto (Alta, Baja y Cambio)
 * @param {*} datosEmp Objeto javascript del empleado
 */
function registrarAccion(tipoAccion, datosEmp, responsable){
    try {
        //Obtenemos el xml en una cadena de texto
        const xml = fs.readFileSync(archivoReg, "utf8");
        //Creamos y configuramos el parser
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['registro'].includes(tagName)
        })
        // Convertir XML a Objeto de JS
        const resultado = parser.parse(xml);
        // Si el XML está vacío o no tiene la estructura,
        // crear la estructura inicial
        if (!resultado.registros) {
            resultado.registros = {
                registro: []
            }
        }

        // Obtencion array de registros
        const registros = resultado.registros?.registro || [];    
        const fechaLocal = new Date().toLocaleDateString('es-MX');
        const horaLocal= new Date().toLocaleTimeString('es-MX')
        //Creamos al nuevo registro utilizando los datos del parametro
        const nuevoReg = {
            idRegistro: calcularId(registros),
            fecha: fechaLocal,
            hora: horaLocal,
            tipoMovimiento: tipoAccion,
            estadoEmpleado: obtenerEstado(datosEmp),
            responsable: responsable
        }

        //Agregamos el nuevo registro al conjunto de registros
        registros.push(nuevoReg)
        //Actualizamos el arreglo registro dentro de resultado;
        resultado.registros.registro = registros;

        // Convertir el objeto JS de vuelta a formato XML
        const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false
        });

        const nuevoXml = builder.build(resultado);
        //Sobrescribir el archivo XML en disco
        fs.writeFileSync(archivoReg, nuevoXml, "utf8");

        //Regresamos una respuesta
        return { 
            ok:true,
            registrado:true
         };
    } catch (error) {
        console.error("Error al agregar un empleado a la BD:", error);
        throw error;
    }
}

/**
 * Funcion que devuelve una cadena de texto con el estado de un empleado
 * @param {*} empleado El empleado con los datos necesarios para construir el estado
 * @returns {String} Cadena de texto
 */
function obtenerEstado(empleado){
    if(empleado){
        //Inicializamos la variable que contendra el campo y se le asigna su contenido
        let estado= 
        "ID: "+empleado.id+" | "+
        "Nombre: "+empleado.nombre+" | "+
        "Puesto: "+empleado.puesto+" | "+
        "Telefono: "+empleado.telefono+" | "+
        "Usuario: "+empleado.usuario+" | "+
        "Contraseña: "+empleado.password
        return estado;
    }else{
        return null
    }
}

/**
 * Funcion para calcular el id del registro
 * Se utiliza para construir los datos de un empleado
 * @function calcularId
 * @returns {number} Obtiene el id mayor en el sistema y genera el numero siguiente
 */
function calcularId(registros){
    //Si no hay empleados en el sistema entonces regresa el id 1
    if(!registros || registros.length===0){
        return Number(1);
    //Si hay registros en el sistema se determina cual es el valor mas alto del id.
    }else{
        //
        let valorMayor =registros[0].idRegistro;
        let sigValor;
        for(let n=1;n<registros.length;n++){
            sigValor=registros[n].idRegistro;
            if(valorMayor<sigValor){
                valorMayor=sigValor;
            }
        }
        //Se regresa el valor siguiente al mayor.
        return (Number(valorMayor)+1);
    }
}

/**
 * Esta funcion permite obtener el historial de registros en el xml de registrosEmpleado
 * @returns {Array<registro>} Arreglo de registros
 */
function obtenerHistorial(){
    try {
        const xml = fs.readFileSync(archivoReg, "utf8");
        // Se valida que la linea obtenida no este vacia, en ese caso regresamos un arreglo vacio
        if (!xml || xml.trim() === "") {
            return [];
        }
        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (tagName) => ['registro'].includes(tagName)
        });

        // Convertir XML a Objeto de JS
        const resultado = parser.parse(xml);

        // Se valida que el resultado del parseo sea un objeto válido
        if (!resultado || typeof resultado !== 'object') {
            return [];
        }

        // Se valida que exista el objeto raíz 'registros'
        const raiz = resultado.registros;
        if (!raiz || typeof raiz !== 'object') {
            return [];
        }

        // Se obtiene la propiedad 'registro' y verificamos que sea un arreglo
        const registrosCrudos = raiz.registro;
        const arregloRegistros = Array.isArray(registrosCrudos) 
            ? registrosCrudos 
            : (registrosCrudos ? [registrosCrudos] : []);
        
        // Se filtran elementos internos: eliminar nulos, indefinidos, strings vacíos u objetos vacíos
        const registrosValidos = arregloRegistros.filter(reg => {
            return reg !== null && 
                   reg !== undefined && 
                   typeof reg === 'object' && 
                   Object.keys(reg).length > 0;
        }); 

        //Devolvemos el arreglo de registros
        return registrosValidos

    // Resolucion en caso de error
    } catch (error) {
        console.error("Error al obtener el historial de registros de empleados:", error);
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
    eliminarEmpleado,
    registrarAccion,
    obtenerHistorial
};