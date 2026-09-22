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

    let cadenaHtml = "";
    productos.forEach((prod) => {
        cadenaHtml += `
        <div class="product-item">
            <span class="product-name">Producto ${prod.id} (${prod.nombre})</span>
            <div class="product-actions">
              <button class="icon-btn" title="Más información"><i class="fa-regular fa-circle-plus"></i></button>
              <button class="icon-btn" title="Eliminar"><i class="fa-solid fa-basket-shopping"></i></button>
              <button class="icon-btn" title="Editar"><i class="fa-solid fa-pen"></i></button>
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
    let cadenaHtml = `<option value="todos" selected>Todas las categorías</option>`;

    if (categorias && categorias.length > 0) {
        categorias.forEach((categoria) => {
            cadenaHtml += `<option value="${categoria.nombre}">${categoria.nombre}</option>`;
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
