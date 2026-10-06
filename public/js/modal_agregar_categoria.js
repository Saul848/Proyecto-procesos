export { inicializarModalCategoria, abrirModalCategoria };

/**
 * Inicializa los botones del modal de categoría y asigna
 * los eventos correspondientes a cada botón.
 *
 * @function inicializarModalCategoria
 * @returns {void}
 */

// PREPARAR BOTONES DEL MODAL DE CATEGORÍA
function inicializarModalCategoria() {
    // botones
    const btnSalir = document.getElementById("boton-salir-agregar-categoria");
    const btnAgregar = document.getElementById("boton-agregar-categoria");

    // Botón salir / cancelar
    if (btnSalir) {
        btnSalir.addEventListener("click", () => {
            cerrarModalCategoria();
        });
    }

    // Botón agregar / guardar
    if (btnAgregar) {
        btnAgregar.addEventListener("click", () => {
            agregarCategoria();
        });
    }
}

/**
 * Abre y muestra el modal utilizado para agregar una nueva categoría.
 *
 * @function abrirModalCategoria
 * @returns {void}
 */
function abrirModalCategoria() {
    const modal = document.getElementById("modal-categoria");
    if (modal) {
        modal.style.display = "flex";
    }
}

/**
 * Cierra el modal de categoría y limpia los campos de entrada.
 *
 * @function cerrarModalCategoria
 * @returns {void}
 */
function cerrarModalCategoria() {
    const modal = document.getElementById("modal-categoria");
    if (modal) {
        modal.style.display = "none";
        limpiarCamposCategoria();
    }
}

// Limpiar campos
/**
 * Limpia los campos de entrada del modal de categoría.
 *
 * @function limpiarCamposCategoria
 * @returns {void}
 */
function limpiarCamposCategoria() {
    const inputNombre = document.getElementById("input-nombre-nueva-categoria");
    if (inputNombre) {
        inputNombre.value = "";
    }
}

// Agregar categoría
/**
 * Valida los datos de la categoría, obtiene su nombre y lo envía
 * al servidor mediante una petición POST a la API de categorías.
 *
 * @async
 * @function agregarCategoria
 * @returns {Promise<void>}
 */
async function agregarCategoria() {
    // Validación
    if (!validarDatosCategoria()) {
        return;
    }

    // 1. Obtener valores de los inputs
    let nombre = document.getElementById("input-nombre-nueva-categoria").value.trim();

    // Transformación y sanitización de tipos
    nombre = nombre.toLowerCase();

    try {
        // Enviar categoría a Express
        const respuesta = await fetch("/api/categorias", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre: nombre
            })
        });

        // Obtención resultado respuesta
        const resultado = await respuesta.json();

        // Validación respuesta del servidor
        if (respuesta.ok) {
            limpiarCamposCategoria();
            cerrarModalCategoria();
            alert(resultado.mensaje || "Categoría agregada correctamente.");
        } else {
            alert(resultado.mensaje || "Error al agregar la categoría.");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Ocurrió un error al conectar con el servidor.");
    }
}

// Validar entrada
/**
 * Valida que el nombre de la categoría cumpla con los requisitos
 * establecidos antes de enviarlo al servidor.
 *
 * Verifica que el nombre no esté vacío y que tenga al menos
 * tres caracteres.
 *
 * @function validarDatosCategoria
 * @returns {boolean} true si los datos son válidos, false en caso contrario.
 */
function validarDatosCategoria() {
    const inputNombre = document.getElementById("input-nombre-nueva-categoria");
    const nombre = inputNombre ? inputNombre.value.trim() : "";

    // Validar nombre de la categoría
    if (nombre === "") {
        alert("El nombre de la categoría no puede estar vacío.");
        return false;
    }

    if (nombre.length < 3) {
        alert("El nombre de la categoría debe tener al menos 3 caracteres.");
        return false;
    }

    // Todos los datos son válidos
    return true;
}
