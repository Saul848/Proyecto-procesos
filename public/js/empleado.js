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
 * Listener para el botón que habilita el modal para ver los mensajes
 */
document.getElementById("btnMensajes").addEventListener('click', () => {
    const usuario = sessionStorage.getItem('usuarioLogueado');

    fetch('/api/mensajes/verMensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario })
    })
    .then(res => res.text())
    .then(html => {
        document.getElementById('panelMensajes').innerHTML = html;
    })
    .catch(err => console.error('Error:', err));

    document.getElementById('checkMensajes').style.display = 'flex';
});

// Delegación de eventos — se registra UNA sola vez, fuera del listener de arriba
document.getElementById('panelMensajes').addEventListener('click', (e) => {
    const item = e.target.closest('.item-mensaje');
    if (!item) return; // el click no fue sobre un mensaje (o no hay mensajes)

    document.querySelectorAll('.item-mensaje').forEach(i => i.classList.remove('activo'));
    item.classList.add('activo');

    const contenido = item.getAttribute('data-contenido');
    document.getElementById('contenidoMensaje').textContent = contenido;
});

/**
 * Listener para ocultar el modal de mensajes
 */
document.getElementById("btnCerrarModalMensajes").addEventListener('click', ()=> {
    document.getElementById('checkMensajes').style.display = 'none';
})