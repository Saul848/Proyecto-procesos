// Este mensaje es para comprobar que el archivo se cargó en la consola
console.log("¡El archivo movimientoCaja.js se cargó correctamente!");

document.addEventListener("DOMContentLoaded", () => {
    // 1. Referencias a los elementos del DOM
    const btnMovimiento = document.getElementById("btnMovimientoCaja");
    const modalMovimiento = document.getElementById("modalMovimientoCaja");
    const btnCerrarModal = document.getElementById("btnCerrarModalMov");
    const formMovimiento = document.getElementById("formMovimientoCaja");

    // 2. Abrir el modal al hacer clic en el botón
    if (btnMovimiento && modalMovimiento) {
        btnMovimiento.addEventListener("click", () => {
            console.log("¡Hiciste clic en el botón de Retiro / Aportación!");
            modalMovimiento.style.setProperty("display", "block", "important");
        });
    }

    // 3. Cerrar el modal con el botón "Cancelar"
    if (btnCerrarModal && modalMovimiento && formMovimiento) {
        btnCerrarModal.addEventListener("click", () => {
            modalMovimiento.style.display = "none";
            formMovimiento.reset();
        });
    }

    // 4. Cerrar el modal si hacen clic fuera de la ventanita blanca
    window.addEventListener("click", (event) => {
        if (modalMovimiento && event.target === modalMovimiento) {
            modalMovimiento.style.display = "none";
            if (formMovimiento) formMovimiento.reset();
        }
    });

    // 5. Enviar los datos del formulario al backend mediante fetch
    if (formMovimiento) {
        formMovimiento.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Dentro del evento submit de formMovimiento:
            const tipoMovimiento = document.getElementById("tipoMovimiento").value;
            const idCaja = document.getElementById("selectCajaDestino").value;
            const monto = parseFloat(document.getElementById("montoMovimiento").value);
            const motivo = document.getElementById("motivoMovimiento").value.trim();

            // NUEVOS CAMPOS DE AUTORIZACIÓN
            const usuarioAutoriza = document.getElementById("userAutoriza").value.trim();
            const passwordAutoriza = document.getElementById("passAutoriza").value.trim();

            if (!motivo) {
                alert("Por favor, ingresa un motivo.");
                return;
            }

            if (!usuarioAutoriza || !passwordAutoriza) {
                alert("Se requiere usuario y contraseña de un Gerente o Administrador para autorizar.");
                return;
            }

            const payload = {
                tipoMovimiento,
                idCaja,
                monto,
                motivo,
                usuarioAutoriza,
                passwordAutoriza
            };
            
            try {
                const res = await fetch("/api/cajas/movimientoCaja", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.mensaje || "Error al registrar el movimiento");
                }

                alert("¡Movimiento registrado con éxito!");
                modalMovimiento.style.display = "none";
                formMovimiento.reset();

                // Opcional: si quieres que la página se recargue para ver el saldo actualizado en pantalla
                // location.reload();

            } catch (err) {
                alert("Error: " + err.message);
            }
        });
    }
});