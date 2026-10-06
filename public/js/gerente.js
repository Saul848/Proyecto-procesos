//Elementos DOM

//Paneles
const listaActDom = document.querySelector(".listaAct"); //Contenedor gris de lista
const seccionEmpDom = document.getElementById("seccionEmp") //Contenedor con scrollbar para la lista

//Dom de las secciones
const seccionOpcciones= document.getElementById("opcciones");
const seccionAgregar = document.getElementById("seccionAgregar");
const seccionMod = document.getElementById("seccionModificar");

//Botones de opcciones
const btnAgregarEmpDom = document.getElementById("btnAgregarEmpleado");
const btnModificarEmpDom = document.getElementById("btnModificarEmpleado");

//Inputs de seccion agregar estudiantes
const inpNombreDom = document.getElementById("inpNombre");
const selectPuestoDom = document.getElementById("selectPuesto");
const inpTelefonoDom = document.getElementById("inpTel");
const inpUsuarioDom = document.getElementById("inpUsuario");
const inpPasswordDom = document.getElementById("inpPassword");
const btnGuardarDatosDom= document.getElementById("btnGuardarDatos") 

//Inputs de seccion mod estudiantes
const inpNombreAct = document.getElementById("inpNombreAct");
const inpNuevoNombre = document.getElementById("inpNuevoNombre");
const inpPuestoAct = document.getElementById("inpPuestoAct");
const selectNuevoPuesto = document.getElementById("selectNuevoPuesto");
const inpTelefonoAct = document.getElementById("inpTelefonoAct");
const inpNuevoTelefono = document.getElementById("inpNuevoTelefono");
const inpUsuarioAct = document.getElementById("inpUsuarioAct");
const inpNuevoUsuario = document.getElementById("inpNuevoUsuario");
const inpPasswordAct = document.getElementById("inpPasswordAct");
const inpNuevoPassword = document.getElementById("inpNuevoPassword");
const btnActualizarDatosDom = document.getElementById("btnActualizarDatos");


//Listener de los botones regresar
// Se obtienen todos los botones de la clase btnRegresar 
const botonesRegresar = document.querySelectorAll('.btnRegresar');
//Se recorre una lista y se asigna un listener para habilitar la opccion de regresar
botonesRegresar.forEach(boton => {
    boton.addEventListener('click', function(){
        setEnModificacion(null);
    });
});

//Elementos bandera
let verificado=false; 
let enModificacion="";
//Arreglo para obtener los datos de los estudiantes
let datosEmp =null;
//Variable para almacenar el id de un empleado
let idEmp= null;

//Escondemos el boton btnModificarEmpleadoDom desde un inicio
btnModificarEmpDom.classList.add('escondido');
//Variable de gestion de paneles empleado
let ultimoPanelEmpSeleccionado=null;

//Patrones para validacion de campos
let patronNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\x20]+$/; //Patron que permite todo el abcdario, la ñ y espacios
let patronTel = /^[0-9]{10}$/;   //Patron que permite validar numeros enteros
let patronPassword = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ\x20]+$/; //Patron que permite todo el abcdario, la ñ, espacios y numeros positivos del 0-9

/**
 * 
 * Listener de tipo DOMContentLoaded
 * Cada vez que se inicia la pagina se obtiene la lista de empleados en el servidor
 * y la pagina carga paneles para cada empleado
 * 
 */
document.addEventListener("DOMContentLoaded", async function(){
    //Mostrar la seccion de opcciones unicamente
    setEnModificacion(null);
    //Limpiamos el contenido de la lista activa
    seccionEmpDom.innerHTML="" ;
    //Obtenemos los datos de los empleados
    datosEmp= await obtenerEmpleados();
    //Si los datos estan vacios entonces colocamos el mensaje, no hay empleados en el sistema
    if (!datosEmp){
        seccionEmpDom.innerHTML=`
    <label> No hay empleados en el sistema </label>
    `;
    //Si hay empleados en el sistema entonces generamos un recuadro para cada uno de ellos en la lista
    }else{
        for(let n=0; n<datosEmp.length; n++){
            let id = datosEmp[n].id;
            let nombre = datosEmp[n].nombre;
            //Se inyectan los datos en el panel
            seccionEmpDom.innerHTML+=`
                <div class="panelEmpleado" id="panelEmpleado${id}" onclick="iluminarEmpleado(${id})">
                    <div class="cajaTexto">
                        <div class="emp#">${"Empleado# "+id}</div>
                        <div class="nombreCompleto">${nombre}</div>
                    </div>
                    <button class="btnEliminar" onclick="eliminarEmpleado(${id})">E<img src="" alt=""></button>
                </div>`;
        }
    }
})

/**
 * Obtiene un arreglo de empleados desde el servidor
 * @async
 * @function obtenerEmpleados Devuelve un arreglo con los empleados registrados en la base de datos
 * @returns {Promise <Array>} Arreglo con los empleados registrados
 */
async function obtenerEmpleados(){
    // Generamos la solicitud
    const respuesta = await fetch(`/api/empleados`, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    // Validamos si la respuesta del servidor fue exitosa, si no regresa un arreglo vacio
    if (!respuesta.ok) {
        alert("Ocurrió un error, datos no obtenidos");
        return [];
    }
    // Obtenemos los datos del JSON
    const datos = await respuesta.json();
    // Convertido a un array de matrículas
    const empleados = datos.data || [];
    //Regresa el arreglo con los datos de los empleados
    return empleados;
}  

/**
 * Funcion para construir la cadena del responsable
 * @returns {String}
 */
function obtenerResponsable(){
    //Se define la variable que contendra la cadena
    let cadenaResponsable
    //Se recuperan los datos de la sesion del usuario
    const nombre = sessionStorage.getItem("nombreUsuario");
    const usuario = sessionStorage.getItem("usuarioLogueado");
    //Si los datos existen se regresa una cadena con el nombre y el usuario
    if(nombre && usuario){
        return cadenaResponsable = "Accion realizada por: "+nombre+" | Usuario: "+usuario
    
    //Si los datos no existen entonces regresamos una cadena con datos desconocidos
    }
    return cadenaResponsable = "Accion realizada por: Desconocido | Usuario: Desconocido"
}

/**
 * Funcion para verificar los campos de la seccion agregar empleado
 * Si los inputs estan mal señala los errores
 * @function verificarCampos
 * @returns {Boolean} Una variable booleana que expresa dos significados
 * Si se regresa true, el contenido de los inputs es valido
 * Si se regresa false, el contenido de los inputs no es valido
 */
function verificarCamposAdd(){
    //Levantamos una bandera, si llega al final sin ningun cambio despues de realizar todas las verificaciones, entonces la informacion es valida.
    verificado=true;
    //Agrupo los inputs en un arreglo para recorrerlo
    let elementosDom = [inpNombreDom, inpTelefonoDom, inpUsuarioDom, inpPasswordDom]
    //Recorro los inputs y verifico si estan vacios.
    elementosDom.forEach(elemento =>{
        if(elemento.value.trim()===""){
            //En caso de estar vacios, se muestran sus bordes en rojo y se muestra el mensaje correspondiente
            elemento.style.border="2px solid red"
            elemento.placeholder="Error, rellena este campo";
            //Se baja la bandera y no se podran ingresar datos.
            verificado=false;
            //Si el input no esta vacio se hacen verificaciones sobre el contenido
        }else{
            //Se verifica la identidad de los inputs, si el input de turno es identificado, se aplicaran las verificaciones correspondientes del contenido
            //Nombre del empleado
            if(elemento===inpNombreDom){
                //Si mi patron no coincide con el contenido de mi input
                if(!patronNombre.test(elemento.value.trim())){
                    elemento.style.border="2px solid red"
                    elemento.value="";
                    elemento.placeholder="El nombre no debe llevar numeros o simbolos"
                    verificado=false;
                //Si el contenido del input esta bien se muestran sus bordes en azul
                }else{
                    elemento.style.border="2px solid blue"
                }
            }
            //Telefono
            if(elemento===inpTelefonoDom){
                if(!patronTel.test(elemento.value.trim())){
                    elemento.style.border="2px solid red"
                    elemento.value=""
                    elemento.placeholder="Se requiere un telefono valido"
                    verificado=false;
                }else{
                    //Si el contenido es valido verificamos que no sea igual a otro telefono
                    if(verificarTelUnico(elemento)){
                        elemento.style.border="2px solid blue"
                    }else{
                        verificado = false;
                    }
                }
            }
            //El usuario del empleado
            if(elemento===inpUsuarioDom){
                if(!patronPassword.test(elemento.value.trim())){
                    elemento.style.border="2px solid red"
                    elemento.value=""
                    elemento.placeholder="Ingrese un nuevo nombre de usuario"
                    verificado=false;
                }else{
                    //Si el contenido es valido verificamos que no sea igual a otro usuario
                    if(verificarUsuarioUnico(inpPasswordDom)){
                        elemento.style.border="2px solid blue"
                    }else{
                        verificado = false;
                    }
                }
            }
            //La contraseña del empleado
            if(elemento===inpPasswordDom){
                if(!patronPassword.test(elemento.value.trim())){
                    elemento.style.border="2px solid red"
                    elemento.value="";
                    elemento.placeholder="Ingrese numeros, simbolos y caracteres"
                    verificado=false;
                }else{
                    elemento.style.border="2px solid blue"
                }
            }
        }
    })
    //Regresa la bandera
    return verificado;
}

/**
 * Funcion para validar los campos de la seccion modificar empleado
 * @function verificarCampos
 * @returns {Boolean} Regresa una variable booleana con dos significados
 * Regresa true si el contenido de los inputs es valido
 * Regresa false si el contenido de los inputs no es valido
 */
function verificarCamposMod(){
    //Establecemos la bandera en true, si llega hasta el final despues de todas las verificaciones sin ningun cambio entonces el contenido es valido
    let verificado = true
    //Se crea un arreglo con los inputs a verificar
    const inputs = [inpNuevoNombre, inpNuevoTelefono, inpNuevoUsuario, inpNuevoPassword]
    //Se recorren cada uno de los inputs
    inputs.forEach(inp=>{
        //Si mi input esta lleno
        if(inp.value.trim()!==""){
            //Si mi input es identificado se aplican sus verificaciones correspondientes
            if(inp===inpNuevoNombre){
                if(!patronNombre.test(inp.value.trim())){
                    inp.style.border="2px solid red"
                    inp.value="";
                    inp.placeholder="El nombre no debe llevar numeros o simbolos"
                    verificado=false;
                }else{
                    inp.style.border="2px solid blue"
                }
            }
            if(inp===inpNuevoTelefono){
                if(!patronTel.test(inp.value.trim())){
                    inp.style.border="2px solid red"
                    inp.value="";
                    inp.placeholder="Se requiere un telefono valido"
                    verificado=false;
                }else{
                    //Si el contenido es valido verificamos que no sea igual a otro telefono
                    if(verificarTelUnico(inp)){
                        inp.style.border="2px solid blue"
                    }else{
                        verificado = false;
                    }
                }
            }
            if(inp===inpNuevoUsuario){
                if(!patronPassword.test(inp.value.trim())){
                    inp.style.border="2px solid red"
                    inp.value="";
                    inp.placeholder="Ingrese un nuevo nombre de usuario"
                    verificado=false;
                }else{
                    //Si el contenido es valido verificamos que no sea igual a otro usuario
                    if(verificarUsuarioUnico(inp)){
                        inp.style.border="2px solid blue"
                    }else{
                        verificado = false;
                    }
                }
            }
            if(inp===inpNuevoPassword){
                if(!patronPassword.test(inp.value.trim())){
                    inp.style.border="2px solid red"
                    inp.value="";
                    inp.placeholder="Ingrese numeros, simbolos y caracteres"
                    verificado=false;
                }else{
                    inp.style.border="2px solid blue"
                }
            }
        
        }
    })
    //Verificamos que los datos no sean iguales a los que ya se ingresaron
    if(!verificarCamposNuevos()){
        return verificado = false;
    }    
    return verificado;
}

/**
 * Funcion que verifica los campos de la seccion modificar no tengan los mismos valores 
 * Comprueba que el nuevo valor no sea igual que el antiguo valor
 * @returns {Boolean} Regresa una variable booleana con dos significados
 * Regresa true si no hay campos repetidos
 * Regresa false si hay campos repetidos
 */
function verificarCamposNuevos(){
    //Se declara una bandera como true y se aplican una serie de ifs, si esta
    // variable llega al final del metodo sin modificaciones entonces el contenido de los inputs es valido
    let datosNuevos= true
    //Se realizan las verificaciones y si se detecta una condicion invalida se modifica el input
    if(inpNuevoNombre.value.trim()===inpNombreAct.value){
        inpNuevoNombre.style.border="2px solid red"
        inpNuevoNombre.value="";
        inpNuevoNombre.placeholder="El valor es el mismo"
    //Regresamos el valor false y termina la ejecucion del metodo
        datosNuevos=false;
    }
    if(inpNuevoPassword.value.trim()===inpPasswordAct.value){
        inpNuevoPassword.style.border="2px solid red"
        inpNuevoPassword.value="";
        inpNuevoPassword.placeholder="El valor es el mismo"
        datosNuevos=false;
    }
    //Regresamos el valor de la variable
    return datosNuevos;
}

/**
 * Funcion para calcular el id
 * Se utiliza para construir los datos de un empleado
 * 
 * @async
 * @function calcularId
 * @returns {number} Obtiene el id mayor en el sistema y genera el numero siguiente
 */
function calcularId(){
    //Si no hay empleados en el sistema entonces regresa el id 1
    if(!datosEmp){
        return 1;
    //Si hay empleados en el sistema se determina cual es el valor mas alto del id.
    }else{
        //
        let valorMayor =datosEmp[0].id;
        let sigValor;
        for(let n=1;n<datosEmp.length;n++){
            sigValor=datosEmp[n].id;
            if(valorMayor<sigValor){
                valorMayor=sigValor;
            }
        }
        //Se regresa el valor siguiente al mayor.
        return (valorMayor+1);
    }
}

/**
 * Funcion que verifica si existe un empleado con el mismo usuario en el sistema
 * Si existe entonces señala el caso en el input
 * @async
 * @function verificarUsuarioIdentico
 * @returns {boolean} Una bandera para verificar esta situacion
 * Si regresa true, entonces el usuario ingresado es unico
 * Si regresa false, entonces el usuario ingresado ya existe en el sistema
 */
function verificarUsuarioUnico(inputDom){
    //Si no hay empleados en el sistema regresa true y marca bien la casilla
    if(!datosEmp){
        return true;
    //Si existen empleados ya registrados entonces verificamos sus usuarios
    }else{
        //Se itera sobre los empleados existentes
        for(let n=0;n<datosEmp.length;n++){
            //Recorremos todos los usuarios y verificamos si su usuario es igual al que estoy ingresando
            if(datosEmp[n].usuario===inputDom.value.trim()){
                inputDom.style.border="2px solid red"
                inputDom.value="";
                inputDom.placeholder="El usuario ya existe en el sistema"
                //Si hay coincidencia se regresa el valor false
                return false;
            }
        }
        //Regresar el valor true
        return true;
    }
}

/**
 * Funcion que verifica si existe un empleado con el telefono en el sistema
 * Si existe entonces señala el caso en el input
 * @async
 * @function verificarTelIdentico
 * @returns {boolean} Una bandera para verificar esta situacion
 * Si regresa true, entonces el telefono ingresado es unico
 * Si regresa false, entonces el telefono ingresado ya existe en el sistema 
*/
function verificarTelUnico(inputDom){
    //Si no hay empleados regresa true y marca el input como correcto
    if(!datosEmp){
        return true;
    //Si hay empleados registrados en el sistema
    }else{
        //Se recorren los datos de los empleados y se verifica si hay un telefono que coincida con el valor ingresado
        for(let n=0;n<datosEmp.length;n++){
            if(Number(datosEmp[n].telefono)===Number(inputDom.value.trim())){
                inputDom.style.border="2px solid red"
                inputDom.value="";
                inputDom.placeholder="El telefono ya existe en el sistema"
                //Si hay coincidencias se regresa el valor false
                return false;
            }
        }
        //Si no hay coincidencias se regresa el valor true
        return true;
    }
}

//Listener del boton "btnAgregarEmpDom" que al ser presionado muestra la seccion de agregar
btnAgregarEmpDom.addEventListener("click", function (){
    //Se muestra la seccion modificar
    setEnModificacion(false);
})

//Listener del boton "btnModificarEmpDom" que al ser presionado muestra la seccion de modificacion
btnModificarEmpDom.addEventListener("click", function (){
    //Preparamos la seccion de modificacion
    prepararSeccionMod(Number(ultimoPanelEmpSeleccionado.replace("panelEmpleado", "")))
})

/**
 * 
 * Listener del boton Agregar Empleado
 * Realiza las verificaciones del lado del cliente correspondiente
 * y si son superadas se procede a hacer la peticion al servidor
 *
 */
btnGuardarDatosDom.addEventListener("click", function(){
    //Se da de alta una bandera, si llega al final del metodo y pasa las verificaciones el empleado es valido.
    let empleadoValido=verificarCamposAdd();
    //Se verifican la informacion ingresada en los campos
    if(empleadoValido){
        guardarEmpleado()
    }
})

/**
 * 
 * Listener del boton Agregar Empleado
 * Realiza las verificaciones del lado del cliente correspondiente
 * y si son superadas se procede a hacer la peticion al servidor
 *
 */
btnActualizarDatosDom.addEventListener("click", function(){
    //Se da de alta una bandera, si llega al final del metodo y pasa las verificaciones el empleado es valido.
    let empleadoValido=verificarCamposMod();
    if(empleadoValido){
        modificarEmpleado(idEmp);
    }
})

//Solicitudes

/**
 * Funcion que construye los datos del empleado y realiza la peticion correspondiente
 * 
 * @async
 * @function guardarEmpleado
 * @returns {res} Respuesta del servidor
 */

async function guardarEmpleado() {
    //Calculamos el id y obtenemos toda la informacion del nuevo empleado
    let id=calcularId();
    let nombre= inpNombreDom.value.trim();
    let puesto= selectPuestoDom.value;
    let tel= inpTelefonoDom.value.trim();
    let usuario= inpUsuarioDom.value.trim();
    let password= inpPasswordDom.value.trim();
    //Ejecutamos la solicitud al servidor
    const respuesta= await fetch("/api/empleados", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON .stringify({
            id: id,
            nombre: nombre,
            puesto: puesto,
            telefono: tel,
            usuario: usuario,
            password: password,
            responsableAccion: obtenerResponsable()
        })
    });

    //Obtencion de la repuesta
    const resultado = await respuesta.json();

    // Validacion respuesta del servidor
    if(resultado.ok){
        alert(resultado.mensaje)
        //Disparamos el listener del DOMContentLoaded para actualizar la lista de empleados
        document.dispatchEvent(new Event("DOMContentLoaded"));
        //Se limpian los campos de la seccion agregar
        limpiarCamposAdd();
        //Se regresa a las opcciones principales
        setEnModificacion(null);
    }else{
        alert(resultado.mensaje);
    }
}

/**
 * Funcion que hace la solicitud para eliminar a un empleado 
 * @param {Number} El id del empleado a eliminar
 * @returns {res} Respuesta del servidor 
 */
async function eliminarEmpleado(id){
    const respuesta =await fetch(`/api/empleados`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON .stringify({
            id: id,
            responsableAccion: obtenerResponsable()
        })
    });

    //Obtencion de la respuesta
    const resultado = await respuesta.json();

    if(resultado.ok){
        alert(resultado.mensaje)
        //Disparamos el listener del DOMContentLoaded para actualizar la lista
        document.dispatchEvent(new Event("DOMContentLoaded"));
        //Se muestran las opcciones principales
        setEnModificacion(null);
    }else{
        alert(resultado.mensaje);
    }
}

/**
 * Funcion que recupera la informacion para modificar a un empleado
 * y realiza la solicitud al servidor
 * @param {Number} id 
 * @returns {res} Respuesta del servidor
 */
async function modificarEmpleado(id) {
    //Obtenemos toda la informacion del nuevo empleado
    let nombreP= inpNuevoNombre.value.trim();
    let puestoP= selectNuevoPuesto.value;
    let tel= inpNuevoTelefono.value.trim();
    let usuarioP= inpNuevoUsuario.value.trim();
    let passwordP= inpNuevoPassword.value.trim();
    //Ejecutamos la solicitud al servidor
    const respuesta= await fetch(`/api/empleados`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON .stringify({
            id: id,
            nombre: nombreP,
            puesto: puestoP,
            telefono: tel,
            usuario: usuarioP,
            password: passwordP,
            responsableAccion: obtenerResponsable()
        })
    });
    //Obtencion de la repuesta
    const resultado = await respuesta.json();

    // Validacion respuesta del servidor
    if(resultado.ok){
        alert(resultado.mensaje)
        //Disparamos el listener del DOMContentLoaded para actualizar la lista de empleados
        document.dispatchEvent(new Event("DOMContentLoaded"));
        //Se limpian los campos
        limpiarCamposMod();
        btnModificarEmpDom
        //Se muestran las opcciones principales
        setEnModificacion(null);
    }else{
        alert(resultado.mensaje);
    }
}


//Listener para la bandera "enModificacion" oyendo a evento personalizado
window.addEventListener('modificandoDatos', (evento)=>{
    const estadoActual = evento.detail.activo;
    //Si la bandera "enModificacion" es true entonces se activan los botones
    if(estadoActual){
        seccionOpcciones.classList.add('escondido')
        seccionAgregar.classList.add('escondido')
        seccionMod.classList.remove('escondido')
        alert("Ingrese los campos que desea modificar");
    //Si la bandera "enModificacion" es null entonces no se muestra ninguna seccion        
    }else if(estadoActual===null){
        seccionOpcciones.classList.remove('escondido')
        btnModificarEmpDom.classList.add('escondido');
        seccionAgregar.classList.add('escondido')
        seccionMod.classList.add('escondido')
    }else{
        seccionOpcciones.classList.add('escondido')
        seccionAgregar.classList.remove('escondido')
        seccionMod.classList.add('escondido')
        alert("Ingrese los campos del nuevo empleado");

    }
});

/**
 * Funcion que cambia la bandera y dispara mi evento personalizado el cual es cambiar el estado de la bandera "enRegistro"
 * @param {Boolean or null} nuevoValor que puede ser true, false o null
 * @returns {event} Dispara un evento personalizado que se trata del cambio de valor en la bandera "enModificacion"
 */
function setEnModificacion(nuevoValor){
    if(enModificacion !== nuevoValor){
        enModificacion= nuevoValor;

        //Emitir el evento personalizado pasando el nuevo valor en "detail"
        const evento = new CustomEvent('modificandoDatos', {
            detail: { activo: enModificacion}
        });
        window.dispatchEvent(evento);
    }
};

/**
 * Funcion que le asigna el valor true a la bandera "enModificacion" 
 * y gestiona los campos inpAct en la seccion modificar empleado
 * con la intencion de mostrar los datos actuales del empleado
 * @param {Number} El id del empleado a modificar
 *  
 */
function prepararSeccionMod(id){
    //Se le da el valor true a la bandera "enModificacion" y se muestra la seccion modificar empleado
    setEnModificacion(true);
    //Se hace un recorrido para obtener los datos del empleado a modificar
    datosEmp.forEach(empleado =>{
        if(empleado.id === id){
            //Se actualiza la variable auxiliar idEmp con el id del empleado
            idEmp=id;
            //Se le asigna el valor al campo correspondiente
            inpNombreAct.value = empleado.nombre;
            //Se bloquea el contenido para que no pueda se borrado por el usuario
            inpNombreAct.readOnly=true;
            selectNuevoPuesto.value=empleado.puesto;
            inpPuestoAct.value = empleado.puesto;
            inpPuestoAct.readOnly=true;
            inpTelefonoAct.value = empleado.telefono;
            inpTelefonoAct.readOnly=true;
            inpUsuarioAct.value = empleado.usuario;
            inpUsuarioAct.readOnly=true;
            inpPasswordAct.value = empleado.password;
            inpPasswordAct.readOnly=true;
        }    
    }
    )
}


/**
 * Listener que detecta los clicks en pantalla para realizar acciones
 * y que devuelve los estados de los inputs a la normalidad cuando se da click sobre ellos.
 * 
 */
document.addEventListener("click", function(event){
    let empleadoSeleccionado= event.target.closest('.panelEmpleado')
    if(empleadoSeleccionado){
        //Si el click fue en un boton del panel esconde el boton "btnModificarEmpDom" 
        if(event.target.closest('button')){
            btnModificarEmpDom.classList.add('escondido')
            return
        //Si se hizo en el panel entonces muestra el boton
        }else{
            btnModificarEmpDom.classList.remove('escondido') 
        }
    //Si el click se hizo fuera del panel panelEmpleado
    }else{
        //Si no se esta en proceso de modificacion entonces se realizan las siguientes opcciones
        if(enModificacion!==true){
            //Se limpia el ultimo panel de empleado seleccionado
            let ultimoPanel=document.getElementById(ultimoPanelEmpSeleccionado)
            if(ultimoPanel!==null){
                ultimoPanel.style.backgroundColor="";
            }
            //Se oculta el boton
            btnModificarEmpDom.classList.add('escondido')
        }
        //Evalua si se hizo sobre un input y regresa su estado a la normalidad
        if(event.target.tagName === "INPUT"){
            event.target.style.border = "";
        }
    }
});

/**
 * Listener para el botón que habilita el modal para enviar un mensaje
 */
document.getElementById("btnMensajes").addEventListener('click', ()=> {
    document.getElementById('formMensaje').style.display = 'flex';
});

/**
 * Listener para ocultar el modal
 */
document.getElementById('btnCerrarModal').addEventListener('click', () => {
    document.getElementById('formMensaje').style.display = 'none';
});


/**
 * Lógica detrás del envio de mensajes
 */
document.getElementById('btnEnviarMensaje').addEventListener('click', () => {
    const destino = document.getElementById("inputDestinatario").value.trim();
    const contenido = document.getElementById("inputContenido").value.trim();
    const estado = document.getElementById('estadoMsjs');

    if (!destino || !contenido) {
        estado.textContent = 'Por favor completa todos los campos.';
        estado.style.color = 'red';
        return; // detiene aquí, no manda el fetch
    }

    fetch('/api/mensajes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destino, contenido })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        if (body.ok) {
        estado.textContent = body.mensaje; // "Mensaje enviado correctamente"
        estado.style.color = 'green';

        // Limpia el formulario y cierra el modal tras un momento
        document.getElementById('inputDestinatario').value = '';
        document.getElementById('inputContenido').value = '';

        setTimeout(() => {
            document.getElementById('formMensaje').style.display = 'none';
            estado.textContent = ''; // limpia el mensaje para la próxima vez
        }, 2000);
        } else {
        estado.textContent = body.mensaje; // "No se encontró al empleado...", etc.
        estado.style.color = 'red';
        }
    })
    .catch(err => {
        estado.textContent = 'Error de conexión con el servidor.';
        estado.style.color = 'red';
        console.error('Error:', err);
    });
});

/*
 * Funcion para iluminar al empleado seleccionado
 * @param {Number} El id del empleado
 * @returns {void} Se utiliza un return para cortar la ejecucion del metodo
 */
function iluminarEmpleado(id){
    if(enModificacion!==true){
        //Si hay un panel de empleado seleccionado anteriormente se devuelve a la normalidad
        if(ultimoPanelEmpSeleccionado!==null){
            let ultimoPanel= document.getElementById(ultimoPanelEmpSeleccionado)
            if(ultimoPanel){
                ultimoPanel.style.backgroundColor="";
            }    
        }
        //Construimos el id del ultimo panel seleccionado y lo guardamos en una variable
        ultimoPanelEmpSeleccionado=("panelEmpleado"+id);
        //Iluminamos el panel actual
        document.getElementById(ultimoPanelEmpSeleccionado).style.setProperty('background-color', 'blue', 'important');
    }else{
        return
    }
}

/**
 * Funcion que limpia los campos de la seccion agregar empleado
 */
function limpiarCamposAdd(){
    //Se agrupan todos los inputs de la seccion correspondiente
    const inputs =[inpNombreDom, selectPuestoDom, inpTelefonoDom, inpUsuarioDom, inpPasswordDom]
    //Se itera sobre cada uno de estos
    inputs.forEach(iter=>{
        //Se borra su contenido
        iter.value=""
        //Se devuelve su aspecto a la normalidad
        iter.style.border=""
        //Se identifica el inp de la iteracion y se le asigna su placeholder correspondiente
        if(iter===inpNombreDom){
            iter.placeholder="Escribe el nombre del empleado"
        }
        if(iter===selectPuestoDom){
            iter.value="empleado"
        }
        if(iter===inpTelefonoDom){
            iter.placeholder="Escribe el telefono del empleado"
        }
        if(iter===inpUsuarioDom){
            iter.placeholder="Escribe el usuario del empleado"
        }
        if(iter===inpPasswordDom){
            iter.placeholder="Escribe la contraseña del usuario"
        }
    });
}

/**
 * Funcion que limpia los campos de la seccion agregar empleado
 */
function limpiarCamposMod(){
    //Se agrupan todos los inputs de la seccion correspondiente
    const inputs =[inpNuevoNombre, selectNuevoPuesto, inpNuevoTelefono, inpNuevoUsuario, inpNuevoPassword]
    //Se itera sobre cada uno de estos
    inputs.forEach(iter=>{
        //Se borra su contenido
        iter.value=""
        //Se devuelve su aspecto a la normalidad
        iter.style.border=""
        //Se identifica el inp de la iteracion y se le asigna su placeholder correspondiente
        if(iter===inpNuevoNombre){
            iter.placeholder="Escribe el nombre del empleado"
        }
        if(iter===selectNuevoPuesto){
            iter.value="empleado"
        }
        if(iter===inpNuevoTelefono){
            iter.placeholder="Escribe el telefono del empleado"
        }
        if(iter===inpNuevoUsuario){
            iter.placeholder="Escribe el usuario del empleado"
        }
        if(iter===inpNuevoPassword){
            iter.placeholder="Escribe la contraseña del usuario"
        }
    });
}


/**
 * Listener para el botón que habilita el modal para realizar una devolución
 */
document.getElementById("btnDevo").addEventListener('click', ()=> {
    document.getElementById('formDevolucion').style.display = 'flex';
});

/**
 * Listener para ocultar el modal de devolucion
 */
document.getElementById('cancelarDevolucion').addEventListener('click', () => {
    document.getElementById('formDevolucion').style.display = 'none';
});


/**
 * Lógica detrás del envio de mensajes
 */
document.getElementById('confirmarDevolucion').addEventListener('click', () => {
    const motivo = document.getElementById("inpMotivoDevo").value;
    const id = document.getElementById("inpIdProducto").value;
    const cantidad = document.getElementById("inpCantidadProducto").value;
    const estado = document.getElementById('estadoDevo');

    if(!motivo || !id || !cantidad){
        estado.textContent = 'Por favor completa todos los campos.';
        estado.style.color = 'red';
        return; // detiene aquí, no manda el fetch
    }

    fetch('/api/ventas/devolucion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motivo, id, cantidad })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        if (body.ok) {
        estado.textContent = body.mensaje; // "Mensaje enviado correctamente"
        estado.style.color = 'green';

        // Limpia el formulario y cierra el modal tras un momento
        document.getElementById('inpMotivoDevo').value = '';
        document.getElementById('inpIdProducto').value = '';
        document.getElementById('inpCantidadProducto').value = '';

        setTimeout(() => {
            document.getElementById('formDevolucion').style.display = 'none';
            estado.textContent = ''; // limpia el mensaje para la próxima vez
        }, 2000);
        } else {
        estado.textContent = body.mensaje; // "No se encontró al empleado...", etc.
        estado.style.color = 'red';
        }
    })
    .catch(err => {
        estado.textContent = 'Error de conexión con el servidor.';
        estado.style.color = 'red';
        console.error('Error:', err);
    });
});