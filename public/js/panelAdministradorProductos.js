import { inicializarModalProducto, abrirModalProducto } from './modal_agregar_producto.js';
import { inicializarModalCategoria, abrirModalCategoria } from './modal_agregar_categoria.js';

const contenedorModal = document.getElementById("contenedor-modal");

// Lista global de productos, para organización por categorías
let listaProductos = [];

// 1. CARGAR EL MODAL REGISTRAR PRODUCTO
fetch("../html/modal_agregar_producto.html")
    .then(respuesta => respuesta.text())
    .then(html => {
        contenedorModal.insertAdjacentHTML('beforeend', html);
        inicializarModalProducto();
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

document.querySelector(".product-list").addEventListener("click", (event) => {
    const boton = event.target.closest(".btn-eliminar");

    if (!boton) return;

    const idProducto = Number(boton.dataset.id);

    const confirmar = confirm("¿Estás seguro de que deseas eliminar este producto?");

    if (!confirmar) return;

    eliminarProducto(idProducto);
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
                "Content-Type": "application/json"
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
                        <button class="icon-btn btn-editar" title="Editar" data-id="${prod.id}">
                            <img src="/img/icon-editar.svg" alt="Editar">
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
                "Content-Type": "application/json"
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

async function eliminarProducto(id) {
    console.log("en cliente eliminar");
    // Enviar solicitud eliminacion a Express
    const respuesta = await fetch(`/api/productos/${id}`, {
        method: "DELETE",

        headers: {
            "Content-Type": "application/json"
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
}

inicializarPagina();
