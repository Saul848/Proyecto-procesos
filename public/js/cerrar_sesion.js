
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
 * Listener para ocultar el modal
 */
document.getElementById('btnCerrarModal').addEventListener('click', () => {
    document.getElementById('checkMensajes').style.display = 'none';
});
