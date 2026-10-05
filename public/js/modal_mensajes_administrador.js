export { inicializarModalMensajes, abrirModalMensajes };

/**
 * Inicializa los botones del modal de mensajes y asigna
 * los eventos correspondientes.
 *
 * @function inicializarModalMensajes
 * @returns {void}
 */
function inicializarModalMensajes() {

    // Botón para cerrar el modal
    const btnCerrar = document.getElementById("btnCerrarModalMensajes");

    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            cerrarModalMensajes();
        });
    }
}

/**
 * Abre y muestra el modal utilizado para consultar
 * los mensajes pendientes del usuario.
 *
 * @async
 * @function abrirModalMensajes
 * @returns {Promise<void>}
 */
async function abrirModalMensajes() {

    const modal = document.getElementById("modal-mensajes");

    if (!modal) {
        return;
    }

    const usuario = sessionStorage.getItem("usuarioLogueado");

    try {

        // Consultar mensajes al servidor
        const respuesta = await fetch("/api/mensajes/verMensajes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: usuario
            })
        });

        // Obtener el HTML de los mensajes
        const html = await respuesta.text();

        // Mostrar los mensajes
        const contenedorDetalles = document.getElementById("contenedorDetalles");

        if (contenedorDetalles) {
            contenedorDetalles.innerHTML = html;
        }

        // Mostrar modal
        modal.style.display = "flex";

    } catch (error) {

        console.error("Error al consultar los mensajes:", error);

        alert("Ocurrió un error al consultar los mensajes.");
    }
}

/**
 * Cierra el modal de mensajes.
 *
 * @function cerrarModalMensajes
 * @returns {void}
 */
function cerrarModalMensajes() {

    const modal = document.getElementById("modal-mensajes");

    if (modal) {
        modal.style.display = "none";
    }
}