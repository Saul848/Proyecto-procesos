export { inicializarModalProducto, abrirModalProducto };


// PREPARAR BOTONES E INPUTS DEL MODAL
function inicializarModalProducto() {

    const btnSalir = document.getElementById("boton-salir-agregar");
    const btnAgregar = document.getElementById("boton-agregar-producto");


    // Botón salir
    btnSalir.addEventListener("click", () => {
        cerrarModalProducto();
    });

    // Botón agregar
    btnAgregar.addEventListener("click", () => {
        agregarProducto();
    });

    const inputPrecio = document.getElementById("input-precio-producto");
    const inputStock = document.getElementById("input-stock-producto");

    if (inputPrecio) {

        // Bloquear teclas no deseadas (e, E, +, -, .)
        inputPrecio.addEventListener('keydown', (e) => {
            if (['e', 'E', '+', '-'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Controlar rangos al escribir
        inputPrecio.addEventListener('input', (e) => {
            const val = e.target.value;

            if (val !== '') {
                const num = Number(val);

                if (num < 0) {
                    e.target.value = 0;
                }

                if (num > 9999) {
                    e.target.value = 9999;
                }
            }
        });

        // Restaurar valor por defecto si se deja vacío
        inputPrecio.addEventListener('blur', (e) => {
            if (e.target.value === '') {
                e.target.value = 0;
            }
        });
    }

    if (inputStock) {

        // Bloquear teclas no deseadas (e, E, +, -, .)
        inputStock.addEventListener('keydown', (e) => {
            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                e.preventDefault();
            }
        });

        // Controlar rangos al escribir
        inputStock.addEventListener('input', (e) => {
            const val = e.target.value;

            if (val !== '') {
                const num = Number(val);

                if (num < 0) {
                    e.target.value = 0;
                }

                if (num > 9999) {
                    e.target.value = 9999;
                }
            }
        });

        // Restaurar valor por defecto si se deja vacío
        inputStock.addEventListener('blur', (e) => {
            if (e.target.value === '') {
                e.target.value = 0;
            }
        });
    }

}


function abrirModalProducto() {
    const modal = document.getElementById("modal-producto");
    modal.style.display = "flex";
}

function cerrarModalProducto() {
    document.getElementById("modal-producto").style.display = "none";
}

// Limpiar campos
function limpiarCamposProducto() {

    document.getElementById("input-nombre-producto").value = "";
    document.getElementById("input-descripcion-producto").value = "";
    document.getElementById("input-precio-producto").value = "";
    document.getElementById("input-stock-producto").value = "";
}


// Agregar producto
async function agregarProducto() {

    // Validacion
    if (!validarDatosProducto()) {
        return;
    }

    // 1. Obtener valores de los inputs
    let nombre = document.getElementById("input-nombre-producto").value.trim();
    let descripcion = document.getElementById("input-descripcion-producto").value.trim();
    let precio = document.getElementById("input-precio-producto").value;
    let stock = document.getElementById("input-stock-producto").value;

    // Transformación y sanitización de tipos
    nombre = nombre.toLowerCase();
    descripcion = descripcion.toLowerCase();
    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock, 10);

    // Enviar producto a Express
    const respuesta = await fetch("/api/productos", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            nombre: nombre,
            descripcion: descripcion,
            precio: precioNum,
            stock: stockNum
        })
    });


    // Obtencion resultado respuesta
    const resultado = await respuesta.json();

    // Validacion respuesta del servidor
    if (respuesta.ok) {
        limpiarCamposProducto();
        //cargar la tabla de productos del panel principal
        alert(resultado.mensaje);
    } else {
        alert(resultado.mensaje);
    }
}


function validarDatosProducto() {

    // Obtener valores de los inputs
    const nombre = document.getElementById("input-nombre-producto").value.trim();
    const descripcion = document.getElementById("input-descripcion-producto").value.trim();
    const precio = Number(document.getElementById("input-precio-producto").value);
    const stock = Number(document.getElementById("input-stock-producto").value);


    // Validar nombre
    if (nombre === "") {
        alert("El nombre del producto no puede estar vacío.");
        return false;
    }

    // Validar descripción
    if (descripcion === "") {
        alert("La descripción del producto no puede estar vacía.");
        return false;
    }

    // Validar precio
    if (!Number.isFinite(precio) || precio < 0 || precio > 9999) {
        alert("El precio debe ser un número entre 0 y 9999.");
        return false;
    }

    // Validar stock
    if (!Number.isInteger(stock) || stock < 0 || stock > 9999) {
        alert("El stock debe ser un número entero entre 0 y 9999.");
        return false;
    }

    // Todos los datos son válidos
    return true;
}