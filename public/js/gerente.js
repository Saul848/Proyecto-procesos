//Elementos DOM

//Paneles
const listaActDom = document.querySelector(".listaAct"); //Contenedor gris de lista
const seccionEmpDom = document.getElementById("seccionEmp") //Contenedor con scrollbar para la lista

//Dom de las secciones
const seccionAgregar = document.getElementById("seccionAgregar");
const seccionMod = document.getElementById("seccionModificar");

//Inputs de seccion agregar estudiantes
const inpNombreDom = document.getElementById("inpNombre");
const selectPuestoDom = document.getElementById("selectPuesto");
const inpTelefonoDom = document.getElementById("inpTel");
const inpUsuarioDom = document.getElementById("inpUsuario");
const inpPasswordDom = document.getElementById("inpPassword");
const btnAgregarEmpDom= document.getElementById("btnAgregarEmp") 

//Inputs de seccion mod estudiantes
const inpNombreAct = document.getElementById("inpNombreAct");
const inpNuevoNombre = document.getElementById("inpNuevoNombre");
const inpPuestoAct = document.getElementById("inpPuestoAct");
const selectNuevoPuesto = document.getElementById("selectNuevoPuesto");
const inpTelefonoAct = document.getElementById("inpTelefonoAct");
const inpNuevoTelefono = document.getElementById("inpNuevoTelefono");
const inpUsuarioAct = document.getElementById("inpUsuarioAct");
const inpNuevoUsuario = document.getElementById("inpNuevoUsuario");
const inpContraseñaAct = document.getElementById("inpContraseñaAct");
const inpNuevaContraseña = document.getElementById("inpNuevaContraseña");
const btnModificarEmpDom = document.getElementById("btnModificarEmp");

//Elementos bandera
let verificado=false;
let enModificacion=false;
//Arreglo para obtener los datos de los estudiantes
let datosEmp =null;

//Patrones para validacion de campos
let patronNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\x20]+$/; //Patron que permite todo el abcdario, la ñ y espacios
let patronTel = /^[0-9]{10}$/;   //Patron que permite validar numeros enteros
let patronContraseña = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ\x20]+$/; //Patron que permite todo el abcdario, la ñ, espacios y numeros positivos del 0-9


/**
 * 
 * Listener de tipo DOMContentLoaded
 * Cada vez que se inicia la pagina se obtiene la lista de empleados en el servidor
 * y la pagina carga recuadros para cada empleado
 * 
 */
document.addEventListener("DOMContentLoaded", async function(){
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
                <div class="panelEmpleado">
                    <div class="cajaTexto">
                        <div class="emp#">${"Empleado# "+id}</div>
                        <div class="nombreCompleto">${nombre}</div>
                    </div>
                    <button class="btnInfo">Info<img src="" alt=""></button>
                    <button class="btnEliminar" onclick="eliminarEmpleado(${id})">E<img src="" alt=""></button>
                    <button class="btnModificar" onclick="prepararSeccionMod(${id})">M<img src="" alt=""></button>
                </div>`;
        }
    }
})

/**
 * Obtiene un arreglo de empleados desde el servidor
 * 
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
 * Funcion para verificar los campos de cada input
 * Si los inputs estan mal señala los errores
 * @async
 * @function verificarCampos
 * @returns {void} Cambios visuales en los inputs
 */
function verificarCampos(){
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
                    elemento.style.border="2px solid blue"
                }
            }
            //El usuario del empleado
            if(elemento===inpUsuarioDom){
                if(!patronContraseña.test(elemento.value.trim())){
                    elemento.style.border="2px solid red"
                    elemento.value=""
                    elemento.placeholder=""
                    verificado=false;
                }else{
                    elemento.style.border="2px solid blue"
                }
            }
            //La contraseña del empleado
            if(elemento===inpPasswordDom){
                if(!patronContraseña.test(elemento.value.trim())){
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
 */
function verificarUsuarioIdentico(){
    //Si no hay empleados en el sistema regresa true y marca bien la casilla
    if(!datosEmp){
        inpUsuarioDom.style.border="2px solid blue"
        return true;
    //Si existen empleados ya registrados entonces verificamos sus usuarios
    }else{
        datosEmp.forEach(empleado =>{
            //Recorremos todos los usuarios y verificamos si su usuario es igual al que estoy ingresando
            if(empleado.usuario===inpUsuarioDom.value.trim()){
                inpUsuarioDom.style.border="2px solid red"
                inpUsuarioDom.value="";
                inpUsuarioDom.placeholder="El usuario ya existe en el sistema"
            }
        })
        return true;
    }
}

/**
 * Funcion que verifica si existe un empleado con el telefono en el sistema
 * Si existe entonces señala el caso en el input
 * @async
 * @function verificarTelIdentico
 * @returns {boolean} Una bandera para verificar esta situacion
 */
function verificarTelIdentico(){
    //Si no hay empleados regresa true y marca el input como correcto
    if(!datosEmp){
        inpTelefonoDom.style.border="2px solid blue"
        return true;
    //Si hay empleados registrados en el sistema
    }else{
        datosEmp.forEach(empleado =>{
            if(empleado.telefono===inpTelefonoDom.value.trim()){
                inpTelefonoDom.style.border="2px solid red"
                inpTelefonoDom.value="";
                inpTelefonoDom.placeholder="El telefono ya existe en el sistema"
                return false;
            }
        })
        return true;
    }
}

/**
 * 
 * Listener del boton Agregar Empleado
 * Realiza las verificaciones del lado del cliente correspondiente
 * y si son superadas se procede a hacer la peticion al servidor
 *
 */
btnAgregarEmpDom.addEventListener("click", function(){
    //Se da de alta una bandera, si llega al final del metodo y pasa las verificaciones el empleado es valido.
    let empleadoValido=verificarCampos();
    //Se verifican la informacion ingresada en los campos
    if(!verificarTelIdentico() | !verificarUsuarioIdentico()){
        empleadoValido=false;
    }
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
btnModificarEmpDom.addEventListener("click", function(){
    //Se da de alta una bandera, si llega al final del metodo y pasa las verificaciones el empleado es valido.
    let empleadoValido=verificarCampos();
    //Se verifican la informacion ingresada en los campos
    if(!verificarTelIdentico() | !verificarUsuarioIdentico()){
        empleadoValido=false;
    }
    if(empleadoValido){
        guardarEmpleado()
    }
})

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
            password: password
        })
    });

    //Obtencion de la repuesta
    const resultado = await respuesta.json();

    // Validacion respuesta del servidor
    if(resultado.ok){
        alert(resultado.mensaje)
        //Disparamos el listener del DOMContentLoaded para actualizar la lista de empleados
        document.dispatchEvent(new Event("DOMContentLoaded"));
    }else{
        alert(resultado.mensaje);
    }
}

/**
 * 
 * Listener que devuelve los estados de los inputs a la normalidad cuando se da click sobre ellos.
 * 
 */
//Listener para reiniciar la apariencia de los inputs despues de hacer click sobre ellos
document.addEventListener("click", function(event){
    if(event.target.tagName === "INPUT"){
        event.target.style.border = "";
    }
});

async function eliminarEmpleado(id){
    const respuesta =await fetch("/api/empleados", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON .stringify({
            id: id
        })
    });

    //Obtencion de la respuesta
    const resultado = await respuesta.json();

    if(resultado.ok){
        alert(resultado.mensaje)
        //Disparamos el listener del DOMContentLoaded para actualizar la lista
        document.dispatchEvent(new Event("DOMContentLoaded"));
    }else{
        alert(resultado.mensaje);
    }
}

//Listener para la bandera "enModificacion" oyendo a evento personalizado
window.addEventListener('modificandoDatos', (evento)=>{
    const estadoActual = evento.detail.activo;

    //Si la bandera "enRegistro" es true entonces se activan los botones
    if(estadoActual){
        seccionAgregar.classList.add('escondido')
        seccionMod.classList.remove('escondido')
        alert("Ingrese los campos que desea modificar");
    }else{
        seccionAgregar.classList.remove('escondido')
        seccionMod.classList.add('escondido')
    }
});

//Funcion que cambia la bandera y dispara mi evento personalizado el cual es cambiar el estado de la bandera "enRegistro"
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

async function prepararSeccionMod(id){
    setEnModificacion(true);
    datosEmp.forEach(empleado =>{
        if(empleado.id === id){
            inpNombreAct.value = empleado.nombre;
            inpNombreAct.readOnly=true;
            inpPuestoAct.value = empleado.puesto;
            inpPuestoAct.readOnly=true;
            inpTelefonoAct.value = empleado.telefono;
            inpTelefonoAct.readOnly=true;
            inpUsuarioAct.value = empleado.usuario;
            inpUsuarioAct.readOnly=true;
            inpContraseñaAct.value = empleado.password;
            inpContraseñaAct.readOnly=true;
        }    
    }
    )
}
