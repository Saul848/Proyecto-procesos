import { inicializarModalProducto, abrirModalProducto } from './modal_agregar_producto.js';
import { inicializarModalCategoria, abrirModalCategoria } from './modal_agregar_categoria.js';
import { inicializarModalMensajes, abrirModalMensajes } from './modal_mensajes_administrador.js';
import { logout } from "./cerrar_sesion.js";

document.addEventListener("DOMContentLoaded", () => {

    const nombreEmpleado = sessionStorage.getItem("nombreUsuario");
    const puestoLogueado = sessionStorage.getItem("puestoLogueado");
    const token = sessionStorage.getItem("token");

    //saludo
    document.getElementById("titulo-menu").textContent =`Menu Administrador -- Bienvenid@ ${nombreEmpleado}`;

    // Verificamos que exista un token de sesión
    if (!token) {
        alert("No has iniciado sesión o la sesión ha expirado.");
        window.location.replace("login.html");
        return;
    }

    if (puestoLogueado !== "administrador") {
        alert("No tienes permiso para acceder a este panel.");
        window.location.replace("login.html");
        return;
    }

    const spanNombre = document.getElementById("saludo-nombre");

    if (spanNombre) {
        spanNombre.textContent = nombreEmpleado;
    }
});

const contenedorModal = document.getElementById("contenedor-modal");
const token = sessionStorage.getItem("token");

// Lista global de productos, para organización por categorías
let listaProductos = [];

// 1. CARGAR EL MODAL REGISTRAR PRODUCTO
fetch("../html/modal_agregar_producto.html")
    .then(respuesta => respuesta.text())
    .then(html => {
        contenedorModal.insertAdjacentHTML('beforeend', html);
        inicializarModalProducto(mostrarProductos);
    })
    .catch(error => console.error("Error al cargar modal producto:", error));

// 2. CARGAR EL MODAL AGREGAR CATEGORÍA
fetch("../html/modal_agregar_categoria.html")
    .then(respuesta => respuesta.text())
    .then(html => {
        contenedorModal.insertAdjacentHTML('beforeend', html);
        inicializarModalCategoria();
    })
    .catch(error => console.error("Error al cargar modal categoría:", error));

// 3. CARGAR EL MODAL DE MENSAJES
fetch("../html/modal_mensajes_administrador.html")
    .then(respuesta => respuesta.text())
    .then(html => {
        contenedorModal.insertAdjacentHTML('beforeend', html);
        inicializarModalMensajes();
    })
    .catch(error => console.error("Error al cargar modal mensajes:", error));

// --- EVENT LISTENERS PARA ABRIR LOS MODALES ---

const btnRegistrarProducto = document.getElementById("boton-registrar-producto");
if (btnRegistrarProducto) {
    btnRegistrarProducto.addEventListener("click", () => {
        abrirModalProducto();
    });
}

const btnRegistrarCategoria = document.getElementById("btn-registrar-categoria");
if (btnRegistrarCategoria) {
    btnRegistrarCategoria.addEventListener("click", () => {
        abrirModalCategoria();
    });
}

const btnVerMensajes = document.getElementById("btn-mensajes");
if (btnVerMensajes) {
    btnVerMensajes.addEventListener("click", () => {
        abrirModalMensajes();
    });
}

// Evento para filtrar por categoría
const selectCategoria = document.getElementById("selec-categoria-producto");
if (selectCategoria) {
    selectCategoria.addEventListener("change", (e) => {
        const categoriaSeleccionada = e.target.value;
        filtrarProductosPorCategoria(categoriaSeleccionada);
    });
}

const btnBuscarProducto = document.getElementById("btn-buscar-producto");
if (btnBuscarProducto) {
    btnBuscarProducto.addEventListener("click", () => {
        buscarProducto();
    });
}

const btnModificarProducto = document.getElementById("btn-guardar-modificacion");
if (btnModificarProducto) {
    btnModificarProducto.addEventListener("click", () => {
        guardarModificacionProducto();
    });
}

const btnLimpiarCamposMod = document.getElementById("btn-limpiar-campos-modificacion");
if (btnLimpiarCamposMod) {
    btnLimpiarCamposMod.addEventListener("click", () => {
        limpiarCamposModProducto();
    });
}

const inputModPrecio = document.getElementById("input-mod-precio-producto");
const inputModStock = document.getElementById("input-mod-stock-producto");


// ------------------ PRECIO ------------------

if (inputModPrecio) {
    inputModPrecio.addEventListener("keydown", (e) => {
        if (["e", "E", "+", "-"].includes(e.key)) {
            e.preventDefault();
        }
    });

    inputModPrecio.addEventListener("input", (e) => {
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

    inputModPrecio.addEventListener("blur", (e) => {
        if (e.target.value === "") {
            e.target.value = 0;
        }
    });
}


// ------------------ STOCK ------------------

if (inputModStock) {
    inputModStock.addEventListener("keydown", (e) => {
        if (["e", "E", "+", "-", "."].includes(e.key)) {
            e.preventDefault();
        }
    });
    inputModStock.addEventListener("input", (e) => {
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

    inputModStock.addEventListener("blur", (e) => {
        if (e.target.value === "") {
            e.target.value = 0;
        }
    });
}


// Manejador de eventos delegado para la lista interactiva de productos.

document.querySelector(".product-list").addEventListener("click", (event) => {
    // 1. Eliminar
    const botonEliminar = event.target.closest(".btn-eliminar");
    if (botonEliminar) {
        const idProducto = Number(botonEliminar.dataset.id);
        const confirmar = confirm("¿Estás seguro de que deseas eliminar este producto?");
        if (confirmar) {
            eliminarProducto(idProducto);
        }
        return;
    }

    // 2. Editar / Seleccionar Producto (al dar clic en la tarjeta completa)
    const tarjetaProducto = event.target.closest(".product-item");
    if (tarjetaProducto) {
        // Obtenemos el ID del dataset o buscando el id dentro del span
        const idBuscado = tarjetaProducto.querySelector(".product-id")?.textContent.replace('#', '').trim();

        const productoSeleccionado = listaProductos.find(productoAux => {
            const idActual = Number(productoAux.id !== undefined ? productoAux.id : productoAux['@_id']);
            return idActual === Number(idBuscado);
        });

        if (productoSeleccionado) {
            // Cargar datos en el formulario lateral
            cargarDatosFormularioModificacion(productoSeleccionado);
        } else {
            alert(`No se encontró el producto con ID: ${idBuscado}`);
        }
    }
});


/**
 * Carga todos los productos desde la API y los almacena
 * en la lista global de productos.
 *
 * @async
 * @function cargarProductos
 * @returns {Promise<Array>} Lista de productos obtenidos.
 */
async function cargarProductos() {
    try {
        const respuesta = await fetch("/api/productos", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const resultado = await respuesta.json();

        if (resultado.ok) {
            listaProductos = resultado.productos || [];
            return listaProductos;
        } else {
            listaProductos = [];
            return [];
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        listaProductos = [];
        return [];
    }
}

/**
 * Muestra los productos recibidos dentro del contenedor
 * correspondiente en el DOM.
 *
 * Si no se proporciona una lista de productos, se cargan
 * automáticamente desde la API.
 *
 * @async
 * @function mostrarProductos
 * @param {Array|null} listaCategoria - Lista de productos que se desea mostrar.
 * Si es null, se cargan todos los productos desde la API.
 * @returns {Promise<void>}
 */
async function mostrarProductos(listaCategoria = null) {
    const seccionProductos = document.querySelector(".product-list");
    if (!seccionProductos) return;

    seccionProductos.innerHTML = "<p>Cargando productos...</p>";

    // Si no se pasa lista filtrada, nos aseguramos de cargar de la API
    const productos = listaCategoria !== null ? listaCategoria : await cargarProductos();

    if (!productos || productos.length === 0) {
        seccionProductos.innerHTML = `<p>No se encontraron productos.</p>`;
        return;
    }

    // LOS PRODUCTOS CON STOCK POR DEBAJO SERAN MARCADOS EN ALERTA
    const limiteStock = 20;
    let cadenaHtml = "<p>*Los productos con bajo stock(menor a 20) son resaltados en color rojo</p>";

    productos.forEach((prod) => {
        // Evaluamos si requiere la clase de alerta
        const esAlerta = Number(prod.stock) < limiteStock;
        const claseAlerta = esAlerta ? "alert-product" : "";

        cadenaHtml += `
            <div class="product-item ${esAlerta ? 'alert-product' : ''}">
                <div class="product-info">
                    <span class="product-id">#${prod.id}</span>
                    <span class="product-name">${prod.nombre}</span>
                </div>

                <div class="product-meta">
                    <span class="stock-badge ${esAlerta ? 'stock-low' : 'stock-ok'}">
                        ${esAlerta ? '⚠️ ' : ''}Stock: ${prod.stock}
                    </span>

                    <div class="product-actions">
                        <button class="icon-btn btn-eliminar" title="Eliminar" data-id="${prod.id}">
                            <img src="/img/icon-eliminar.svg" alt="Eliminar">
                        </button>
                    </div>
                </div>
            </div>`;
    });

    seccionProductos.innerHTML = cadenaHtml;
}

/**
 * Carga todas las categorías disponibles desde la API
 * de categorías.
 *
 * @async
 * @function cargarCategorias
 * @returns {Promise<Array>} Lista de categorías obtenidas.
 */
async function cargarCategorias() {
    try {
        const respuesta = await fetch("/api/categorias", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const resultado = await respuesta.json();

        if (resultado.ok) {
            return resultado.categorias;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        return [];
    }
}

/**
 * Muestra las categorías disponibles dentro del select
 * utilizado para filtrar los productos.
 *
 * La primera opción permite mostrar los productos de todas
 * las categorías.
 *
 * @async
 * @function mostrarCategorias
 * @returns {Promise<void>}
 */
async function mostrarCategorias() {
    const selectCategorias = document.getElementById("selec-categoria-producto");

    if (!selectCategorias) {
        console.error("No se encontró el elemento #selec-categoria-producto");
        return;
    }

    const categorias = await cargarCategorias();

    // Opción predeterminada para ver todos los productos
    let cadenaHtml = `<option value = "todos" selected > Todas las categorías</option> `;

    if (categorias && categorias.length > 0) {
        categorias.forEach((categoria) => {
            cadenaHtml += `<option value = "${categoria.nombre}" > ${categoria.nombre}</option> `;
        });
    }

    selectCategorias.innerHTML = cadenaHtml;
}

/**
 * Filtra localmente los productos de acuerdo con la categoría
 * seleccionada y muestra únicamente los productos correspondientes.
 *
 * Si la lista global de productos está vacía, primero carga
 * los productos desde la API.
 *
 * @async
 * @function filtrarProductosPorCategoria
 * @param {string} categoria - Categoría seleccionada para realizar el filtro.
 * @returns {Promise<void>}
 */
async function filtrarProductosPorCategoria(categoria) {
    // Si la lista global aún no tiene datos, los traemos primero
    if (listaProductos.length === 0) {
        await cargarProductos();
    }

    if (!categoria || categoria === "" || categoria === "todos") {
        await mostrarProductos(listaProductos);
        return;
    }

    // Filtrar asegurando coincidencia en minúsculas y eliminando espacios
    const productosFiltrados = listaProductos.filter(
        prod => prod.categoria && prod.categoria.trim().toLowerCase() === categoria.trim().toLowerCase()
    );

    await mostrarProductos(productosFiltrados);
}


/**
 * Realiza la búsqueda de productos dentro del listado en memoria.
 * 
 * Evalúa el término ingresado en el input `#info_busqueda`:
 * - Si es numérico (`/^\d+$/`), realiza una búsqueda exacta por `id`.
 * - Si es texto, realiza una búsqueda parcial insensible a mayúsculas/minúsculas por `nombre`.
 * - Si está vacío, restablece la vista a la lista completa de productos.
 *
 * @async
 * @function buscarProducto
 * @returns {Promise<void>} No retorna valor; actualiza directamente el DOM mediante `mostrarProductos()`.
 */
async function buscarProducto() {
    const inputElement = document.getElementById("info_busqueda");
    if (!inputElement) return;

    const input = inputElement.value.trim();

    // Si no hay lista en memoria, nos aseguramos de cargarla
    if (listaProductos.length === 0) {
        await cargarProductos();
    }

    // Si el campo de búsqueda está vacío, restablece a la lista completa
    if (!input) {
        mostrarProductos(listaProductos);
        return;
    }

    // Evalúa si el valor es puramente numérico
    const esNumero = /^\d+$/.test(input);
    let resultado = [];

    if (esNumero) {
        const idBuscar = Number(input);
        resultado = listaProductos.filter(producto => Number(producto.id) === idBuscar);
    } else {
        const termino = input.toLowerCase();
        resultado = listaProductos.filter(producto =>
            producto.nombre && producto.nombre.toLowerCase().includes(termino)
        );
    }

    mostrarProductos(resultado);
}

/**
 * Llenar el formulario de modificación a la derecha con los datos del producto
 * y poblar el select de categorías.
 */
async function cargarDatosFormularioModificacion(producto) {
    // 1. Asignar ID
    const labelId = document.getElementById("label-mod-id-producto");
    const inputId = document.getElementById("input-mod-id-producto");
    if (labelId) labelId.textContent = producto.id;
    if (inputId) inputId.value = producto.id;

    // 2. Asignar los campos de texto/número
    const inputNombre = document.getElementById("input-mod-nombre-producto");
    const inputDesc = document.getElementById("input-mod-descripcion-producto");
    const inputPrecio = document.getElementById("input-mod-precio-producto");
    const inputStock = document.getElementById("input-mod-stock-producto");

    if (inputNombre) inputNombre.value = producto.nombre || "";
    if (inputDesc) inputDesc.value = producto.descripcion || "";
    if (inputPrecio) inputPrecio.value = producto.precio || 0;
    if (inputStock) inputStock.value = producto.stock || 0;

    // 3. Cargar las categorías en el select de modificación
    const selectModCategoria = document.getElementById("select-mod-categoria-producto");
    if (selectModCategoria) {
        const categorias = await cargarCategorias();
        let html = `<option value="">Seleccione una categoría</option>`;
        categorias.forEach(cat => {
            const selected = (cat.nombre === producto.categoria) ? "selected" : "";
            html += `<option value="${cat.nombre}" ${selected}>${cat.nombre}</option>`;
        });
        selectModCategoria.innerHTML = html;
    }
}

/**
 * Valida los inputs del formulario de modificación.
 * @returns {boolean} `true` si todos los campos son válidos, `false` en caso contrario.
 */
function verificarModificacion() {
    const id = document.getElementById("input-mod-id-producto")?.value.trim();
    if (!id) {
        alert("Por favor selecciona un producto de la lista primero.");
        return false;
    }

    const nombre = document.getElementById("input-mod-nombre-producto")?.value.trim();
    const descripcion = document.getElementById("input-mod-descripcion-producto")?.value.trim();
    const categoria = document.getElementById("select-mod-categoria-producto")?.value.trim();
    const precioInput = document.getElementById("input-mod-precio-producto")?.value.trim();
    const stockInput = document.getElementById("input-mod-stock-producto")?.value.trim();

    // 1. Validar campos vacíos
    if (!nombre) {
        alert("El nombre del producto no puede estar vacío.");
        return false;
    }

    if (!descripcion) {
        alert("La descripción del producto no puede estar vacía.");
        return false;
    }

    if (!categoria) {
        alert("Por favor selecciona una categoría.");
        return false;
    }

    // 2. Validar precio (número positivo)
    const precio = Number(precioInput);
    if (precioInput === "" || isNaN(precio) || precio < 0) {
        alert("Ingresa un precio válido (mayor o igual a 0).");
        return false;
    }

    // 3. Validar stock (entero positivo)
    const stock = Number(stockInput);
    if (stockInput === "" || isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        alert("Ingresa un número entero válido para el stock (mayor o igual a 0).");
        return false;
    }

    return true;
}

/**
 * Comprueba si al menos un campo del formulario cambió respecto al producto original en `listaProductos`.
 * @returns {boolean} `true` si hay modificaciones, `false` si todo está idéntico o no se encontró el producto.
 */
function verificarHayModificacion() {
    const idInput = document.getElementById("input-mod-id-producto")?.value.trim();
    if (!idInput) {
        alert("Por favor selecciona un producto de la lista primero.");
        return false;
    }

    // Buscamos el producto original comparando ambos IDs convertidos a String
    const productoOriginal = listaProductos.find(p => {
        const pId = String(p.id !== undefined ? p.id : p['@_id']).trim();
        return pId === idInput;
    });

    if (!productoOriginal) {
        console.warn("No se encontró el producto original en listaProductos con ID:", idInput);
        return false;
    }

    // Leemos los valores actuales del formulario
    const nombreActual = document.getElementById("input-mod-nombre-producto")?.value.trim() || "";
    const descActual = document.getElementById("input-mod-descripcion-producto")?.value.trim() || "";
    const catActual = document.getElementById("select-mod-categoria-producto")?.value.trim() || "";
    const precioActual = Number(document.getElementById("input-mod-precio-producto")?.value) || 0;
    const stockActual = Number(document.getElementById("input-mod-stock-producto")?.value) || 0;

    // Normalizamos valores del producto original (previniendo undefined / nulos / atributos de XML)
    const nombreOrig = (productoOriginal.nombre || "").trim();
    const descOrig = (productoOriginal.descripcion || "").trim();
    const catOrig = (productoOriginal.categoria || "").trim();
    const precioOrig = Number(productoOriginal.precio) || 0;
    const stockOrig = Number(productoOriginal.stock) || 0;

    // Comparamos campo por campo
    const hayCambios = (
        nombreActual !== nombreOrig ||
        descActual !== descOrig ||
        catActual !== catOrig ||
        precioActual !== precioOrig ||
        stockActual !== stockOrig
    );

    return hayCambios;
}

/**
 * Procesa la actualización del producto si la verificación es exitosa.
 */
async function guardarModificacionProducto() {
    // 1. Validar sintaxis y formato numérico de los inputs
    if (!verificarModificacion()) {
        return;
    }

    // 2. Verificar si realmente cambió algún dato respecto a listaProductos
    if (!verificarHayModificacion()) {
        alert("No se ha realizado ninguna modificación en los campos.");
        return;
    }

    const id = document.getElementById("input-mod-id-producto").value.trim();
    const nombre = document.getElementById("input-mod-nombre-producto").value.trim();
    const descripcion = document.getElementById("input-mod-descripcion-producto").value.trim();
    const categoria = document.getElementById("select-mod-categoria-producto").value.trim();
    const precio = Number(document.getElementById("input-mod-precio-producto").value);
    const stock = Number(document.getElementById("input-mod-stock-producto").value);

    try {
        const respuesta = await fetch(`/api/productos/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({
                nombre,
                descripcion,
                categoria,
                precio,
                stock
            })
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            alert(resultado.mensaje || "Producto actualizado con éxito");
            await mostrarProductos(); // Recargar la lista
        } else {
            alert(resultado.mensaje || "Error al actualizar el producto");
        }
    } catch (error) {
        console.error("Error al guardar modificaciones:", error);
        alert("Error de conexión al guardar cambios.");
    }
}

function limpiarCamposModProducto() {
    document.getElementById("label-mod-id-producto").textContent = "--";
    document.getElementById("input-mod-id-producto").value = "";
    document.getElementById("input-mod-nombre-producto").value = "";
    document.getElementById("input-mod-descripcion-producto").value = "";
    document.getElementById("select-mod-categoria-producto").value = "";
    document.getElementById("input-mod-precio-producto").value = "";
    document.getElementById("input-mod-stock-producto").value = "";
}

async function eliminarProducto(id) {
    // Enviar solicitud eliminacion a Express
    const respuesta = await fetch(`/api/productos/${id}`, {
        method: "DELETE",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });


    // Obtener resultado de la respuesta
    const resultado = await respuesta.json();


    // Validación de respuesta del servidor
    if (respuesta.ok) {
        alert(resultado.mensaje);
        mostrarProductos();
    } else {
        alert(resultado.mensaje);
    }
}


/**
 * Inicializa la página cargando primero los productos
 * y posteriormente las categorías disponibles.
 *
 * @async
 * @function inicializarPagina
 * @returns {Promise<void>}
 */
async function inicializarPagina() {
    await mostrarProductos(); // Carga API y llena `listaProductos`
    await mostrarCategorias(); // Carga las opciones del select
    logout(); // Funcion para el cierre de sesion y registro de este
}

inicializarPagina();
