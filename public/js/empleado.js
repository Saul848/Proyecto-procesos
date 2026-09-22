document.addEventListener("DOMContentLoaded", () => {

    /** 
     * Nombre completo del empleado recuperado del almacenamiento de sesión.
     * @type {string|null} 
     */
    const nombreEmpleado = sessionStorage.getItem("nombreUsuario");

    /** 
     * Puesto o rol del empleado recuperado del almacenamiento de sesión.
     * @type {string|null} 
     */
    const puestoLogueado = sessionStorage.getItem("puestoLogueado");

    // validamos que haya iniciado sesion, de lo contrario se redirige al login
    if (!nombreEmpleado) {
        alert("No has iniciado sesión o la sesión ha expirado.");
        window.location.href = "login.html";
        return;
    }

    /**
     * Elemento del DOM donde se plasmará el saludo personalizado con el nombre del usuario.
     * @type {HTMLElement|null}
     */
    const spanNombre = document.getElementById("saludo-nombre");
    
    if (spanNombre) {
        spanNombre.textContent = nombreEmpleado;
    }
});

/**
 * Referencia al botón de cerrar sesión en la interfaz del panel.
 * @type {HTMLElement|null}
 */
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {

    /**
     * Evento de escucha para el botón de salida, limpia el almacenamiento 
     * local de la sesión y redirige al usuario al login.
     * @listens click
     */
    btnLogout.addEventListener("click", () => {
        
        // Limpiamos los datos guardados en la sesión del navegador
        sessionStorage.clear();
        
        // redirigimos a la página de inicio de sesión
        alert("Se ha cerrado la sesión correctamente.");
        window.location.href = "login.html";
    });
}

/**
 * Gestión de cierre de sesión automático por inactividad (10 minutos).
 * Definimos el tiempo límite en milisegundos (10 minutos = 10 * 60 * 1000)
 */
const TIEMPO_INACTIVIDAD = 10 * 60 * 1000; 

let temporizadorInactividad;

/**
 * Función que ejecuta el cierre de sesión al cumplirse el tiempo límite
 */
function cerrarSesionPorInactividad() {
    // limpia datos de la sesión en el navegador
    sessionStorage.clear();
    
    // alerta al usuario y redirige al login
    alert("Tu sesión ha expirado por inactividad.");
    window.location.href = "login.html";
}

/**
 * Reinicia el temporizador cada que detecta actividad del usuario
 */
function reiniciarTemporizador() {
    // Limpiamos el temporizador anterior para que no se acumule
    clearTimeout(temporizadorInactividad);
    
    // Iniciamos un nuevo conteo de 10 minutos
    temporizadorInactividad = setTimeout(cerrarSesionPorInactividad, TIEMPO_INACTIVIDAD);
}

// mover mouse, presionar teclas, hacer clic, desplazarse o tocar la pantalla reinicia el temporizador
const eventosUsuario = ["mousemove", "keydown", "click", "scroll", "touchstart"];

// agregamos los eventos de usuario para reiniciar el temporizador
eventosUsuario.forEach(evento => {
    document.addEventListener(evento, reiniciarTemporizador);
});

// Iniciamos el temporizador por primera vez al cargar la página
reiniciarTemporizador();


/**
 * Listener para el botón que habilita el modal para ver los mensajes
 */
document.getElementById("btnMensajes").addEventListener('click', ()=> {
    const usuario = sessionStorage.getItem('usuarioLogueado');

    fetch('/api/mensajes/verMensajes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario })
    })
    .then(res => res.text())
    .then(html => {
        document.getElementById('contenedorDetalles').innerHTML = html;
    })
    .catch(err => console.error('Error: ', err));

    
    document.getElementById('checkMensajes').style.display = 'flex';
});

/**
 * Listener para ocultar el modal
 */
document.getElementById('btnCerrarModal').addEventListener('click', () => {
    document.getElementById('checkMensajes').style.display = 'none';
});
