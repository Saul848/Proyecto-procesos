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
