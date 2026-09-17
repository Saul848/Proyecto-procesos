
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