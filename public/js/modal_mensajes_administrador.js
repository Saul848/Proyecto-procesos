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

    const btnMostrarMensajes = document.getElementById("btn-mensajes");

    if(btnMostrarMensajes) {
        btnMostrarMensajes.addEventListener('click', ()=>{
            abrirModalMensajes();
        })
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

    const modal = document.getElementById("checkMensajes");
    if (!modal) return;

    const usuario = sessionStorage.getItem("usuarioLogueado");

    try {
        const respuesta = await fetch('/api/mensajes/verMensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario })
        });

        const html = await respuesta.text();

        const panelMensajes = document.getElementById("panelMensajes");
        if (panelMensajes) {
        panelMensajes.innerHTML = html;
        }

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

    const modal = document.getElementById("checkMensajes");

    if (modal) {
        modal.style.display = "none";
    }
}

// Delegación de eventos — selección de mensaje Y botón de eliminar
document.addEventListener("click", async (e) => {
    const btnEliminar = e.target.closest(".btn-eliminar-mensaje");
    if (btnEliminar) {
        e.stopPropagation();
        const id = btnEliminar.getAttribute("data-id");

        if (!confirm("¿Seguro que quieres eliminar este mensaje?")) return;

        try {
        const respuesta = await fetch(`/api/mensajes/${id}`, { method: "DELETE" });
        const data = await respuesta.json();

        if (data.ok) {
            btnEliminar.closest(".item-mensaje").remove();
        } else {
            alert(data.mensaje);
        }
        } catch (error) {
        console.error("Error al eliminar mensaje:", error);
        }
        return;
    }

    const item = e.target.closest(".item-mensaje");
    if (!item) return;

    document.querySelectorAll(".item-mensaje").forEach(i => i.classList.remove("activo"));
    item.classList.add("activo");

    document.getElementById("contenidoMensaje").textContent = item.getAttribute("data-contenido");
});

inicializarModalMensajes();