export { inicializarModalProducto, abrirModalProducto };


// PREPARAR BOTONES E INPUTS DEL MODAL
/**
 * Inicializa los botones e inputs del modal de producto.
 *
 * Configura los eventos de los botones para cerrar y agregar productos,
 * carga las categorías disponibles y establece las restricciones de
 * entrada para precio, stock y descuento.
 *
 * @function inicializarModalProducto
 * @returns {void}
 */
function inicializarModalProducto() {

    const btnSalir = document.getElementById("boton-salir-agregar");
    const btnAgregar = document.getElementById("boton-agregar-producto");

    // Cargar categorías al iniciar el modal
    mostrarCategorias();

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
    const inputDescuento = document.getElementById("input-descuento-producto");


    // ------------------ PRECIO ------------------

    if (inputPrecio) {

        inputPrecio.addEventListener("keydown", (e) => {
            if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
            }
        });

        inputPrecio.addEventListener("input", (e) => {
            const val = e.target.value;

            if (val !== "") {
                const num = Number(val);

                if (num < 0) {
                    e.target.value = 0;
                }

                if (num > 9999) {
                    e.target.value = 9999;
                }
            }
        });

        inputPrecio.addEventListener("blur", (e) => {
            if (e.target.value === "") {
                e.target.value = 0;
            }
        });
    }


    // ------------------ STOCK ------------------

    if (inputStock) {

        inputStock.addEventListener("keydown", (e) => {
            if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
            }
        });

        inputStock.addEventListener("input", (e) => {
            const val = e.target.value;

            if (val !== "") {
                const num = Number(val);

                if (num < 0) {
                    e.target.value = 0;
                }

                if (num > 9999) {
                    e.target.value = 9999;
                }
            }
        });

        inputStock.addEventListener("blur", (e) => {
            if (e.target.value === "") {
                e.target.value = 0;
            }
        });
    }


    // ------------------ DESCUENTO ------------------

    if (inputDescuento) {

        inputDescuento.addEventListener("keydown", (e) => {
            if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
            }
        });

        inputDescuento.addEventListener("input", (e) => {
            const val = e.target.value;

            if (val !== "") {
                const num = Number(val);

                if (num < 0) {
                    e.target.value = 0;
                }

                if (num > 1) {
                    e.target.value = 1;
                }
            }
        });

        inputDescuento.addEventListener("blur", (e) => {
            if (e.target.value === "") {
                e.target.value = 0;
            }
        });
    }
}


// ------------------ MODAL ------------------

/**
 * Abre el modal utilizado para agregar un nuevo producto.
 *
 * También carga nuevamente las categorías disponibles cada vez
 * que se abre el modal.
 *
 * @function abrirModalProducto
 * @returns {void}
 */
function abrirModalProducto() {
    const modal = document.getElementById("modal-producto");

    // Cargar categorías cada vez que se abre el modal
    mostrarCategorias();

    modal.style.display = "flex";
}


/**
 * Cierra el modal de producto.
 *
 * @function cerrarModalProducto
 * @returns {void}
 */
function cerrarModalProducto() {
    document.getElementById("modal-producto").style.display = "none";
}


// ------------------ LIMPIAR CAMPOS ------------------

/**
 * Limpia todos los campos del modal de producto.
 *
 * @function limpiarCamposProducto
 * @returns {void}
 */
function limpiarCamposProducto() {

    document.getElementById("input-nombre-producto").value = "";
    document.getElementById("input-descripcion-producto").value = "";
    document.getElementById("select-categoria-producto").value = "";
    document.getElementById("input-precio-producto").value = "";
    document.getElementById("input-stock-producto").value = "";
    document.getElementById("input-descuento-producto").value = "";
}


// ------------------ AGREGAR PRODUCTO ------------------

/**
 * Valida los datos del producto, obtiene los valores de los campos
 * y los envía al servidor mediante una petición POST a la API
 * de productos.
 *
 * @async
 * @function agregarProducto
 * @returns {Promise<void>}
 */
async function agregarProducto() {

    // Validación
    if (!validarDatosProducto()) {
        return;
    }

    // Obtener valores de los inputs
    let nombre = document.getElementById("input-nombre-producto").value.trim();
    let descripcion = document.getElementById("input-descripcion-producto").value.trim();
    const categoria = document.getElementById("select-categoria-producto").value;
    let precio = document.getElementById("input-precio-producto").value;
    let stock = document.getElementById("input-stock-producto").value;
    let descuento = document.getElementById("input-descuento-producto").value;


    // Transformación y sanitización de tipos
    nombre = nombre.toLowerCase();
    descripcion = descripcion.toLowerCase();

    const categoriaNormalizada = categoria.trim().toLowerCase();

    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock, 10);
    const descuentoNum = parseFloat(descuento);


    // Enviar producto a Express
    const respuesta = await fetch("/api/productos", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            nombre: nombre,
            descripcion: descripcion,
            categoria: categoriaNormalizada,
            precio: precioNum,
            stock: stockNum,
            descuento: descuentoNum
        })
    });


    // Obtener resultado de la respuesta
    const resultado = await respuesta.json();


    // Validación de respuesta del servidor
    if (respuesta.ok) {

        limpiarCamposProducto();

        alert(resultado.mensaje);

        // Aquí posteriormente puedes actualizar
        // la lista de productos.

    } else {

        alert(resultado.mensaje);
    }
}


// ------------------ VALIDAR PRODUCTO ------------------

/**
 * Valida los datos ingresados del producto antes de enviarlos
 * al servidor.
 *
 * Verifica que el nombre, descripción y categoría no estén vacíos,
 * además de comprobar que el precio, stock y descuento se encuentren
 * dentro de los rangos permitidos.
 *
 * @function validarDatosProducto
 * @returns {boolean} true si todos los datos son válidos, false en caso contrario.
 */
function validarDatosProducto() {

    // Obtener valores
    const nombre = document.getElementById("input-nombre-producto").value.trim();
    const descripcion = document.getElementById("input-descripcion-producto").value.trim();
    const categoria = document.getElementById("select-categoria-producto").value;
    const precio = Number(document.getElementById("input-precio-producto").value);
    const stock = Number(document.getElementById("input-stock-producto").value);
    const descuento = Number(document.getElementById("input-descuento-producto").value);


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


    // Validar categoría
    if (categoria === "") {
        alert("Debes seleccionar una categoría.");
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


    // Validar descuento
    if (
        !Number.isFinite(descuento) ||
        descuento < 0 ||
        descuento > 1
    ) {
        alert("El descuento debe ser un número entre 0 y 1.");
        return false;
    }


    // Todos los datos son válidos
    return true;
}


// ------------------ CATEGORÍAS ------------------

/**
 * Obtiene las categorías disponibles desde la API de categorías.
 *
 * Realiza una petición al servidor y devuelve el arreglo de categorías
 * cuando la respuesta es correcta.
 *
 * @async
 * @function cargarCategorias
 * @returns {Promise<Array>} Lista de categorías disponibles.
 */
async function cargarCategorias() {

    try {

        const respuesta = await fetch("/api/categorias");
        const datos = await respuesta.json();

        if (datos.ok) {
            return datos.categorias;
        }

        return [];

    } catch (error) {

        console.error("Error de conexión:", error);

        return [];
    }
}


/**
 * Muestra las categorías disponibles dentro del elemento select
 * utilizado para seleccionar la categoría de un producto.
 *
 * @async
 * @function mostrarCategorias
 * @returns {Promise<void>}
 */
async function mostrarCategorias() {

    const selectCategorias = document.getElementById(
        "select-categoria-producto"
    );

    if (!selectCategorias) {
        console.error(
            "No se encontró el elemento #select-categoria-producto"
        );
        return;
    }


    const categorias = await cargarCategorias();


    // Opción inicial
    let cadenaHtml = `
        <option value="" disabled selected>
            Selecciona una categoría
        </option>
    `;


    if (!categorias || categorias.length === 0) {

        cadenaHtml += `
            <option value="" disabled>
                No hay categorías disponibles
            </option>
        `;

    } else {

        categorias.forEach((categoria) => {

            const nombreCategoria = String(categoria.nombre)
                .trim()
                .toLowerCase();

            cadenaHtml += `
                <option value="${nombreCategoria}">
                    ${categoria.nombre}
                </option>
            `;
        });
    }


    selectCategorias.innerHTML = cadenaHtml;
}
