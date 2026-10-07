/**
 * Módulo de Punto de Venta (POS) - Lógica de Cliente
 * 
 * Gestiona el catálogo de productos, promociones y ofertas dinámicas,
 * cálculo de subtotales, control de stock local, liquidación de tickets,
 * emisión de comprobantes fiscales (CFDI) y reimpresión de ventas previas.
 * 
 * @module public/js/venta
 */

// ============================================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ============================================================================

/** @type {Array<Object>} Catálogo original completo provisto por la API */
let todosLosProductos = [];

/** @type {Array<Object>} Catálogo filtrado según la búsqueda del usuario */
let catalogoProductos = [];

/** @type {Array<Object>} Artículos añadidos a la cuenta actual del cliente */
let itemsCuenta = [];

/** @type {Array<Object>} Ofertas comerciales activas registradas en el backend */
let ofertasActivas = [];

/** @type {Array<Object>} Caché local para consulta rápida de ventas previas */
let ventasHistorialCache = [];

/** @type {"Efectivo"|"Tarjeta"} Método de pago actualmente seleccionado */
let metodoPago = "Efectivo";

/** @type {boolean} Estado operativo de la caja registradora */
let cajaAbierta = true;

/** @type {string|null} Identificador o folio de la transacción activa */
let folioVentaActual = null;

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

const tablaProductosCuerpo = document.getElementById("tablaProductosCuerpo");
const inputBuscar = document.getElementById("inputBuscar");
const listaItemsTicket = document.getElementById("listaItemsTicket");
const lblSubtotal = document.getElementById("lblSubtotal");
const lblIva = document.getElementById("lblIva");
const lblTotal = document.getElementById("lblTotal");
const inputMontoRecibido = document.getElementById("inputMontoRecibido");
const inputCambio = document.getElementById("inputCambio");
const btnRegistrarPago = document.getElementById("btnRegistrarPago");
const btnEfectivo = document.getElementById("btnEfectivo");
const btnTarjeta = document.getElementById("btnTarjeta");
const cajaDot = document.getElementById("cajaDot");
const cajaTexto = document.getElementById("cajaTexto");
const btnToggleCaja = document.getElementById("btnToggleCaja");
const modalTicket = document.getElementById("modalTicket");
const reciboDetalle = document.getElementById("reciboDetalle");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const lblFolioVenta = document.getElementById("lblFolioVenta");
const btnTransacciones = document.getElementById("btnTransacciones");

// ============================================================================
// CICLO DE VIDA E INICIALIZACIÓN
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    verificarEstadoCaja();
    cargarFolioActual();
    cargarDatos();
    configurarEventos();
});

/**
 * Registra todos los escuchadores de eventos para controles e interactividad.
 */
function configurarEventos() {
    if (inputBuscar) {
        inputBuscar.addEventListener("input", (e) => filtrarProductos(e.target.value));
    }

    if (btnToggleCaja) {
        btnToggleCaja.addEventListener("click", alternarCaja);
    }

    if (btnEfectivo) {
        btnEfectivo.addEventListener("click", () => {
            metodoPago = "Efectivo";
            btnEfectivo.classList.add("active");
            btnTarjeta.classList.remove("active");
            inputMontoRecibido.disabled = false;
            calcularCambio();
        });
    }

    if (btnTarjeta) {
        btnTarjeta.addEventListener("click", () => {
            metodoPago = "Tarjeta";
            btnTarjeta.classList.add("active");
            btnEfectivo.classList.remove("active");
            inputMontoRecibido.disabled = true;
            const { total } = calcularTotales();
            inputMontoRecibido.value = total.toFixed(2);
            inputCambio.value = "$0.00";
            validarBotonCobro();
        });
    }

    if (inputMontoRecibido) {
        inputMontoRecibido.addEventListener("input", calcularCambio);
    }

    if (btnRegistrarPago) {
        btnRegistrarPago.addEventListener("click", procesarVenta);
    }

    if (btnCerrarModal) {
        btnCerrarModal.addEventListener("click", reiniciarVentaDespuesDeCobro);
    }

    if (btnTransacciones) {
        btnTransacciones.addEventListener("click", () => {
            window.location.href = "transacciones.html";
        });
    }

    // Controles de desplazamiento del carrusel de promociones
    const btnIzq = document.getElementById("btnCarruselIzq");
    const btnDer = document.getElementById("btnCarruselDer");

    if (btnIzq) {
        btnIzq.addEventListener("click", () => desplazarCarrusel(-1));
    }
    if (btnDer) {
        btnDer.addEventListener("click", () => desplazarCarrusel(1));
    }
}

// ============================================================================
// CONSULTAS AL SERVIDOR Y CONTROL DE CAJA
// ============================================================================

/**
 * Consulta y actualiza el consecutivo del siguiente folio de venta.
 * @async
 */
async function cargarFolioActual() {
    try {
        const res = await fetch("/api/ventas/folio/siguiente");
        if (res.ok) {
            const data = await res.json();
            if (lblFolioVenta && data.siguienteFolio) {
                folioVentaActual = String(data.siguienteFolio);
                lblFolioVenta.textContent = `Venta numero ${data.siguienteFolio}`;
            }
        }
    } catch (e) {
        console.warn("No fue posible consultar el folio consecutivo:", e);
    }
}

/**
 * Consulta el estado de apertura/cierre de la caja en el servidor.
 * @async
 */
async function verificarEstadoCaja() {
    try {
        const res = await fetch("/api/ventas/caja/estado");
        const data = await res.json();
        cajaAbierta = Boolean(data.cajaAbierta);
        actualizarVistaCaja();
    } catch (err) {
        console.error("Error al consultar el estado de caja:", err);
    }
}

/**
 * Modifica el estado de apertura o cierre de la caja.
 * @async
 */
async function alternarCaja() {
    try {
        const res = await fetch("/api/ventas/caja/estado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ abierta: !cajaAbierta })
        });
        const data = await res.json();
        cajaAbierta = Boolean(data.cajaAbierta);
        actualizarVistaCaja();
    } catch (err) {
        alert("Error al cambiar el estado de la caja.");
    }
}

/**
 * Sincroniza las etiquetas e indicadores visuales según el estado de la caja.
 */
function actualizarVistaCaja() {
    if (cajaDot && cajaTexto && btnToggleCaja) {
        if (cajaAbierta) {
            cajaDot.classList.remove("dot-cerrado");
            cajaDot.classList.add("dot-abierto");
            cajaTexto.textContent = "Caja abierta";
            btnToggleCaja.textContent = "Cerrar caja";
        } else {
            cajaDot.classList.remove("dot-abierto");
            cajaDot.classList.add("dot-cerrado");
            cajaTexto.textContent = "Caja cerrada";
            btnToggleCaja.textContent = "Abrir caja";
        }
    }
    validarBotonCobro();
}

/**
 * Descarga simultáneamente el catálogo de existencias y las ofertas activas.
 * @async
 */
async function cargarDatos() {
    try {
        const [resProd, resOf] = await Promise.all([
            fetch("/api/productos", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                }
            }),
            fetch("/api/ofertas")
        ]);

        const dataProd = await resProd.json();
        todosLosProductos = dataProd.productos || (Array.isArray(dataProd) ? dataProd : []);
        catalogoProductos = [...todosLosProductos];

        if (resOf.ok) {
            const dataOfertas = await resOf.json();
            const listado = Array.isArray(dataOfertas) ? dataOfertas : (dataOfertas.ofertas || []);
            ofertasActivas = listado.filter(o => o.estado === "disponible");
            renderizarCarruselOfertas();
        } else {
            ofertasActivas = [];
        }

        if (inputBuscar && inputBuscar.value.trim() !== "") {
            filtrarProductos(inputBuscar.value);
        } else {
            renderizarTabla();
        }
    } catch (err) {
        console.error("Error al cargar productos u ofertas:", err);
    }
}

// ============================================================================
// RENDERIZADO DEL CATÁLOGO Y FILTRADO
// ============================================================================

/**
 * Filtra los productos visibles por nombre o clave de identificación.
 * @param {string} termino - Criterio de búsqueda ingresado.
 */
function filtrarProductos(termino) {
    const busqueda = String(termino || "").trim().toLowerCase();

    if (!busqueda) {
        catalogoProductos = [...todosLosProductos];
    } else {
        catalogoProductos = todosLosProductos.filter((prod) => {
            const idVal = prod.id !== undefined ? String(prod.id) : (prod["@_id"] !== undefined ? String(prod["@_id"]) : "");
            const nombreVal = prod.nombre ? String(prod.nombre).toLowerCase() : "";
            return idVal.trim() === busqueda || idVal.includes(busqueda) || nombreVal.includes(busqueda);
        });
    }

    renderizarTabla();
}

/**
 * Dibuja las filas del catálogo de artículos sin estilos inline.
 */
function renderizarTabla() {
    if (!tablaProductosCuerpo) return;
    tablaProductosCuerpo.innerHTML = "";

    if (catalogoProductos.length === 0) {
        tablaProductosCuerpo.innerHTML = `
            <tr>
                <td colspan="6" class="tabla-sin-datos">No hay productos que coincidan</td>
            </tr>`;
        return;
    }

    catalogoProductos.forEach((prod) => {
        const idProd = String(prod.id !== undefined ? prod.id : prod["@_id"]);
        const estaMarcado = itemsCuenta.some((i) => String(i.id) === idProd);
        const stockActual = Number(prod.stock) || 0;
        const precioActual = Number(prod.precio) || 0;

        const oferta = ofertasActivas.find(o => String(o.idProducto) === idProd);
        let textoOferta = "-";

        if (oferta) {
            if (oferta.tipoProm === "porcentaje") {
                textoOferta = `${oferta.valorDesc}%`;
            } else if (oferta.tipoProm === "cantidad") {
                textoOferta = `${oferta.cantidadRecibe}x${oferta.cantidadPaga}`;
            } else if (oferta.tipoProm === "precioFijo") {
                textoOferta = `$${oferta.valorDesc}`;
            } else {
                textoOferta = "Oferta";
            }
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <input type="checkbox" 
                       ${estaMarcado ? "checked" : ""} 
                       ${stockActual <= 0 ? "disabled" : ""} 
                       onchange="toggleSeleccion('${idProd}', this.checked)">
            </td>
            <td class="col-prod-nombre">${prod.nombre}</td>
            <td class="col-prod-precio">$${precioActual.toFixed(2)}</td>
            <td><span class="badge-pildora">${textoOferta}</span></td>
            <td><span class="badge-pildora">${stockActual}</span></td>
            <td class="col-prod-id">${idProd}</td>
        `;

        tablaProductosCuerpo.appendChild(tr);
    });
}

// ============================================================================
// GESTIÓN DEL CARRITO / TICKET DE VENTA
// ============================================================================

/**
 * Agrega o remueve un producto de la cuenta activa al alternar su casilla.
 * @param {string} idProducto - Identificador del artículo.
 * @param {boolean} checked - Estado de la casilla de selección.
 */
window.toggleSeleccion = function (idProducto, checked) {
    const prod = todosLosProductos.find((p) => {
        const idVal = String(p.id !== undefined ? p.id : p["@_id"]);
        return idVal === String(idProducto);
    });
    if (!prod) return;

    if (checked) {
        const oferta = ofertasActivas.find(o => String(o.idProducto) === String(idProducto));
        itemsCuenta.push({
            id: prod.id !== undefined ? prod.id : prod["@_id"],
            nombre: prod.nombre,
            precioOriginal: Number(prod.precio) || 0,
            oferta: oferta || null,
            cantidad: 1,
            stockMax: Number(prod.stock) || 0
        });
    } else {
        itemsCuenta = itemsCuenta.filter((item) => String(item.id) !== String(idProducto));
    }

    actualizarTicket();
};

/**
 * Modifica la cantidad adquirida de un artículo asegurando el límite de stock.
 * @param {string} idProducto - Identificador del producto.
 * @param {number} delta - Variación unitaria (+1 o -1).
 */
window.cambiarCantidadTicket = function (idProducto, delta) {
    const item = itemsCuenta.find(i => String(i.id) === String(idProducto));
    if (!item) return;

    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad <= 0) {
        itemsCuenta = itemsCuenta.filter(i => String(i.id) !== String(idProducto));
        renderizarTabla();
    } else if (nuevaCantidad > item.stockMax) {
        alert(`Stock insuficiente. Solo quedan ${item.stockMax} unidades disponibles.`);
        return;
    } else {
        item.cantidad = nuevaCantidad;
    }

    actualizarTicket();
};

/**
 * Aplica las reglas comerciales sobre un artículo para determinar su subtotal.
 * @param {Object} item - Producto en ticket con precio, cantidad y oferta asociada.
 * @returns {number} Subtotal con descuentos calculados.
 */
function calcularSubtotalItem(item) {
    const base = item.precioOriginal;
    const cant = item.cantidad;
    const of = item.oferta;

    if (!of) return base * cant;

    if (of.tipoProm === "porcentaje") {
        const factor = Number(of.valorDesc) / 100;
        return (base * (1 - factor)) * cant;
    }

    if (of.tipoProm === "precioFijo") {
        return Number(of.valorDesc) * cant;
    }

    if (of.tipoProm === "cantidad") {
        const recibe = Number(of.cantidadRecibe) || 1;
        const paga = Number(of.cantidadPaga) || 1;
        if (recibe > 0 && paga > 0) {
            const paquetes = Math.floor(cant / recibe);
            const sobrantes = cant % recibe;
            return ((paquetes * paga) + sobrantes) * base;
        }
    }

    return base * cant;
}

/**
 * Realiza el cálculo global de subtotal, IVA y monto total.
 * @returns {{subtotal: number, iva: number, total: number}}
 */
function calcularTotales() {
    const total = itemsCuenta.reduce((acc, i) => acc + calcularSubtotalItem(i), 0);
    const subtotal = total / 1.16;
    const iva = total - subtotal;
    return { subtotal, iva, total };
}

/**
 * Calcula el importe de cambio en pagos con efectivo y valida la transacción.
 */
function calcularCambio() {
    const { total } = calcularTotales();
    const recibido = parseFloat(inputMontoRecibido.value) || 0;

    if (itemsCuenta.length === 0 || total === 0) {
        inputCambio.value = "$0.00";
        validarBotonCobro();
        return;
    }

    if (metodoPago === "Efectivo") {
        if (recibido >= total) {
            const cambio = recibido - total;
            inputCambio.value = `$${cambio.toFixed(2)}`;
        } else {
            inputCambio.value = "Faltante";
        }
    } else {
        inputCambio.value = "$0.00";
    }
    validarBotonCobro();
}

/**
 * Habilita o restringe el botón de confirmación de cobro según las reglas operativas.
 */
function validarBotonCobro() {
    if (!btnRegistrarPago) return;

    const { total } = calcularTotales();
    const recibido = parseFloat(inputMontoRecibido.value) || 0;

    if (!cajaAbierta || itemsCuenta.length === 0) {
        btnRegistrarPago.disabled = true;
        return;
    }

    if (metodoPago === "Efectivo") {
        btnRegistrarPago.disabled = (recibido < total);
    } else {
        btnRegistrarPago.disabled = false;
    }
}

/**
 * Actualiza la vista detallada de la cuenta en el panel derecho.
 */
function actualizarTicket() {
    if (!listaItemsTicket) return;

    if (itemsCuenta.length === 0) {
        listaItemsTicket.innerHTML = `<p class="ticket-sin-items">No hay productos en la cuenta</p>`;
        lblSubtotal.textContent = "$0.00";
        lblIva.textContent = "$0.00";
        lblTotal.textContent = "$0.00";
        inputCambio.value = "$0.00";
        validarBotonCobro();
        return;
    }

    listaItemsTicket.innerHTML = "";

    itemsCuenta.forEach((item) => {
        const itemLine = document.createElement("div");
        itemLine.className = "ticket-item-row";

        const subtotalFila = calcularSubtotalItem(item);

        itemLine.innerHTML = `
            <div class="ticket-item-info">
                <span class="ticket-item-nombre">${item.nombre}</span>
                <div class="ticket-item-controles">
                    <button type="button" class="btn-cant" onclick="cambiarCantidadTicket('${item.id}', -1)">-</button>
                    <span class="ticket-item-cant">${item.cantidad}</span>
                    <button type="button" class="btn-cant" onclick="cambiarCantidadTicket('${item.id}', 1)">+</button>
                    <span class="ticket-item-unitario">($${item.precioOriginal.toFixed(2)} c/u)</span>
                </div>
            </div>
            <span class="ticket-item-subtotal">$${subtotalFila.toFixed(2)}</span>
        `;
        listaItemsTicket.appendChild(itemLine);
    });

    const { subtotal, iva, total } = calcularTotales();
    lblSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    lblIva.textContent = `$${iva.toFixed(2)}`;
    lblTotal.textContent = `$${total.toFixed(2)}`;

    calcularCambio();
}

// ============================================================================
// PROCESAMIENTO Y CONFIRMACIÓN DE VENTA
// ============================================================================

/**
 * Envía la venta confirmada al backend para su almacenamiento XML y actualización de stock.
 * @async
 */
async function procesarVenta() {
    if (!cajaAbierta) {
        alert("La caja se encuentra cerrada.");
        return;
    }

    const idEmpleadoActivo = sessionStorage.getItem("idEmpleado")
        || sessionStorage.getItem("idUsuario")
        || "1";

    const selectCaja = document.getElementById("selectCaja");
    const idCajaSeleccionada = selectCaja ? selectCaja.value : "1";

    const payload = {
        idEmpleado: idEmpleadoActivo,
        idCaja: idCajaSeleccionada,
        metodoPago,
        items: itemsCuenta.map((i) => ({
            idProducto: i.id,
            cantidad: i.cantidad
        }))
    };

    try {
        btnRegistrarPago.disabled = true;
        btnRegistrarPago.textContent = "Procesando...";

        const res = await fetch("/api/ventas/confirmar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || "Error al procesar la venta");
        }

        mostrarTicketModal(data.ticket);

    } catch (err) {
        alert(err.message);
    } finally {
        btnRegistrarPago.textContent = "Registrar pago";
    }
}

/**
 * Despliega el modal emergente con el comprobante de compra recién emitido.
 * @param {Object} ticket - Estructura de venta retornada por el servidor.
 */
function mostrarTicketModal(ticket) {
    if (!ticket || !reciboDetalle || !modalTicket) return;

    const fecha = ticket.fecha ? new Date(ticket.fecha).toLocaleString() : new Date().toLocaleString();
    const itemsRaw = ticket.items?.item || ticket.items || [];
    const items = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

    const itemsHtml = items.map((it) => `
        <div class="ticket-linea-item">
            <span>${it.nombre || 'Producto'} (x${it.cantidad || 1})</span>
            <span>$${Number(it.subtotal || 0).toFixed(2)}</span>
        </div>
    `).join("");

    reciboDetalle.innerHTML = `
        <div class="ticket-encabezado">
            <strong>CADENA COMERCIAL OXXO</strong>
            <span>Folio: #${ticket["@_id"] || ticket.id || ticket.folio || '0'}</span>
            <small>${fecha}</small>
        </div>
        <hr class="ticket-separador">
        <div class="ticket-cuerpo-items">
            ${itemsHtml}
        </div>
        <hr class="ticket-separador">
        <div class="ticket-linea-total">
            <span>TOTAL:</span>
            <span>$${Number(ticket.total || 0).toFixed(2)} MXN</span>
        </div>
        <div class="ticket-pie-metodo">
            Método de pago: ${metodoPago}
        </div>
    `;

    modalTicket.style.display = "flex";
}

/**
 * Restaura el panel de cobro tras completar una venta y cerrar el ticket.
 */
function reiniciarVentaDespuesDeCobro() {
    if (modalTicket) modalTicket.style.display = "none";
    itemsCuenta = [];
    if (inputMontoRecibido) inputMontoRecibido.value = "";
    if (inputCambio) inputCambio.value = "$0.00";
    actualizarTicket();
    cargarFolioActual();
    cargarDatos();
}

// ============================================================================
// HISTORIAL DE TRANSACCIONES Y REIMPRESIÓN
// ============================================================================

/**
 * Consulta el historial general de tickets y abre el modal correspondiente.
 * @async
 */
window.abrirHistorialVentas = async function () {
    try {
        const res = await fetch("/api/ventas");
        const data = await res.json();
        ventasHistorialCache = data.ventas || [];
        renderizarHistorial(ventasHistorialCache);
        
        const modal = document.getElementById("modalHistorialVentas");
        if (modal) modal.style.display = "flex";
    } catch (e) {
        alert("Error al cargar el historial de ventas.");
    }
};

/**
 * Oculta la ventana modal del historial de ventas.
 */
window.cerrarModalHistorial = function () {
    const modal = document.getElementById("modalHistorialVentas");
    if (modal) modal.style.display = "none";
};

/**
 * Genera dinámicamente las filas de la tabla de historial sin estilos inline.
 * @param {Array<Object>} lista - Listado de tickets devueltos por el backend.
 */
function renderizarHistorial(lista) {
    const tbody = document.getElementById("tablaHistorialCuerpo");
    if (!tbody) return;

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="historial-sin-datos">Sin ventas registradas</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    [...lista].reverse().forEach((v) => {
        const id = v["@_id"] || v.id || v.folio;
        const fecha = v.fecha ? new Date(v.fecha).toLocaleString() : "N/D";
        const total = Number(v.total || 0).toFixed(2);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${id}</td>
            <td>${fecha}</td>
            <td>$${total}</td>
            <td>
                <button type="button" onclick="seleccionarVentaParaReimpresion('${id}')">
                    <i class="fa-solid fa-eye"></i> Ver/reimprimir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Filtra el listado de ventas históricas por número de folio en memoria.
 */
window.filtrarHistorialVentas = function () {
    const inputFiltro = document.getElementById("filtroHistorial");
    const filtro = inputFiltro ? inputFiltro.value.trim().toLowerCase() : "";
    const filtradas = ventasHistorialCache.filter(v => String(v["@_id"] || v.id || "").toLowerCase().includes(filtro));
    renderizarHistorial(filtradas);
};

/**
 * Carga un ticket en el modal de corroboración y oculta temporalmente la lista.
 * @param {string} idVenta - Folio de la venta seleccionada.
 */
window.seleccionarVentaParaReimpresion = function (idVenta) {
    const venta = ventasHistorialCache.find(v => String(v["@_id"] || v.id) === String(idVenta));
    if (!venta) return alert("Venta no encontrada.");

    const itemsRaw = venta.items?.item || venta.productos?.producto || [];
    const items = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

    const filasProductos = items.map(it => `
        <div class="ticket-reimpresion-fila">
            <span>${it.nombre || "Producto"}</span>
            <span>$${Number(it.subtotal || it.precioUnitario || 0).toFixed(2)}</span>
        </div>
    `).join("");

    const contenedor = document.getElementById("detalleTicketReimpresion");
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="ticket-metadatos">
                <div>Folio: #${venta["@_id"] || venta.id}</div>
                <div>Fecha: ${new Date(venta.fecha).toLocaleString()}</div>
            </div>
            <hr class="ticket-separador-figma">
            <div class="ticket-items-desglose">
                ${filasProductos}
            </div>
            <hr class="ticket-separador-figma">
            <div class="ticket-reimpresion-total">
                <span>Total:</span>
                <span>$${Number(venta.total).toFixed(2)}</span>
            </div>
        `;
    }

    const modalHistorial = document.getElementById("modalHistorialVentas");
    const modalCorroborar = document.getElementById("modalCorroborarTicket");

    if (modalHistorial) modalHistorial.style.display = "none";
    if (modalCorroborar) modalCorroborar.style.display = "flex";
};

/**
 * Cierra la vista previa de reimpresión y restituye el modal de historial.
 */
window.cerrarModalCorroborar = function () {
    const modalCorroborar = document.getElementById("modalCorroborarTicket");
    const modalHistorial = document.getElementById("modalHistorialVentas");

    if (modalCorroborar) modalCorroborar.style.display = "none";
    if (modalHistorial) modalHistorial.style.display = "flex";
};

/**
 * Dispara la orden de impresión térmica nativa sobre el recibo seleccionado.
 */
window.ejecutarReimpresionTicket = function () {
    const area = document.getElementById("areaTicketReimpresion");
    if (!area) return;

    const ventana = window.open("", "_blank", "width=320,height=500");
    if (!ventana) return alert("Habilite las ventanas emergentes en su navegador.");

    ventana.document.write(`
        <html>
            <head>
                <title>Impresión de Ticket</title>
                <style>
                    body { font-family: monospace; padding: 12px; margin: 0; font-size: 13px; }
                    .ticket-reimpresion-fila, .ticket-reimpresion-total { display: flex; justify-content: space-between; }
                    hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
                </style>
            </head>
            <body>${area.innerHTML}</body>
        </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
};

// ============================================================================
// CARRUSEL SUPERIOR DE OFERTAS
// ============================================================================

/**
 * Construye dinámicamente las tarjetas de ofertas en el carrusel superior.
 */
function renderizarCarruselOfertas() {
    const pista = document.getElementById("carrusel-pista");
    const vacio = document.getElementById("carrusel-vacio");
    if (!pista) return;

    pista.innerHTML = "";

    if (!ofertasActivas || ofertasActivas.length === 0) {
        if (vacio) vacio.style.display = "block";
        return;
    }
    if (vacio) vacio.style.display = "none";

    ofertasActivas.forEach((oferta) => {
        const idProd = String(oferta.idProducto);
        const producto = todosLosProductos.find((p) => {
            const idVal = String(p.id !== undefined ? p.id : p["@_id"]);
            return idVal === idProd;
        });

        let textoOferta;
        if (oferta.tipoProm === "porcentaje") {
            textoOferta = `-${oferta.valorDesc}%`;
        } else if (oferta.tipoProm === "cantidad") {
            textoOferta = `${oferta.cantidadRecibe}x${oferta.cantidadPaga}`;
        } else if (oferta.tipoProm === "precioFijo") {
            textoOferta = `$${oferta.valorDesc}`;
        } else {
            textoOferta = "Oferta";
        }

        const nombre = producto ? producto.nombre : `Producto ${idProd}`;
        const precio = producto ? (Number(producto.precio) || 0).toFixed(0) : "-";

        const card = document.createElement("div");
        card.className = "card-oferta";
        card.innerHTML = `
            <div class="oferta-nombre">${nombre}</div>
            <div class="oferta-tipo">${textoOferta}</div>
            <div class="oferta-precio">Precio Original: $${precio}</div>
        `;
        pista.appendChild(card);
    });
}

/**
 * Desplaza horizontalmente la pista del carrusel de promociones.
 * @param {number} direccion - Dirección del desplazamiento (-1 izquierda, 1 derecha).
 */
function desplazarCarrusel(direccion) {
    const pista = document.getElementById("carrusel-pista");
    if (!pista) return;

    const tarjeta = pista.querySelector(".card-oferta");
    const paso = tarjeta ? tarjeta.offsetWidth + 12 : 180;

    if (direccion === -1) {
        if (pista.scrollLeft <= 0) {
            pista.scrollTo({ left: pista.scrollWidth, behavior: "smooth" });
        } else {
            pista.scrollBy({ left: -paso * 2, behavior: "smooth" });
        }
    } else {
        if (pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 1) {
            pista.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            pista.scrollBy({ left: paso * 2, behavior: "smooth" });
        }
    }
}

// ============================================================================
// EMISIÓN Y CONSULTA DE FACTURACIÓN (CFDI)
// ============================================================================

/**
 * Abre el modal centrado para capturar los datos fiscales de facturación.
 */
window.abrirModalFactura = function () {
    const folioTexto = document.getElementById("lblFolioVenta")?.textContent || "";
    folioVentaActual = folioTexto.replace(/\D/g, "");

    const modal = document.getElementById("modalFactura");
    if (modal) {
        modal.style.display = "flex";
    }
};

/**
 * Oculta el modal de registro de datos fiscales.
 */
window.cerrarModalFactura = function () {
    const modal = document.getElementById("modalFactura");
    if (modal) {
        modal.style.display = "none";
    }
};

/**
 * Recopila la información fiscal capturada y la remite al servidor.
 * @async
 */
window.generarFactura = async function () {
    const nombre = document.getElementById("facturaNombre")?.value.trim();
    const rfc = document.getElementById("facturaRfc")?.value.trim();
    const cp = document.getElementById("facturaCp")?.value.trim();
    const correo = document.getElementById("facturaCorreo")?.value.trim();
    const regimen = document.getElementById("facturaRegimen")?.value.trim();
    const usoCfdi = document.getElementById("facturaUsoCfdi")?.value.trim();

    if (!nombre || !rfc || !correo) {
        alert("Por favor complete al menos Nombre, RFC y Correo Electrónico.");
        return;
    }

    const payload = {
        folio: folioVentaActual,
        nombre,
        rfc,
        cp,
        correo,
        regimen,
        usoCfdi
    };

    try {
        const res = await fetch("/api/ventas/factura", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const respuesta = await res.json();

        if (respuesta.ok) {
            mostrarFactura(respuesta.factura);
            cerrarModalFactura();
        } else {
            alert(respuesta.mensaje || "Error al emitir la factura comercial.");
        }
    } catch (e) {
        alert("Error de conexión con el servidor al facturar.");
    }
};

/**
 * Renderiza el formato impreso de factura en el contenedor designado.
 * @param {Object} f - Factura fiscal devuelta por el servidor.
 */
function mostrarFactura(f) {
    const contenedor = document.getElementById("contenedorFactura");
    if (!contenedor || !f) return;

    const filasItems = (f.items || []).map(it => `
        <tr>
            <td>${it.nombre}</td>
            <td class="text-center">${it.cantidad}</td>
            <td class="text-right">$${Number(it.precio || 0).toFixed(2)}</td>
            <td class="text-right">$${Number(it.iva || 0).toFixed(2)}</td>
            <td class="text-right">$${Number(it.totalLinea || 0).toFixed(2)}</td>
        </tr>
    `).join("");

    contenedor.innerHTML = `
        <div class="comprobante-factura-card">
            <h2 class="comprobante-factura-titulo">FACTURA COMERCIAL</h2>
            <p><strong>FECHA:</strong> ${f.fechaEmision || new Date().toLocaleString()}</p>
            <hr class="ticket-separador-figma">
            <div class="comprobante-factura-datos">
                <p><strong>RAZÓN SOCIAL:</strong> ${f.cliente?.nombre || "—"}</p>
                <p><strong>RFC:</strong> ${f.cliente?.rfc || "—"}</p>
                <p><strong>C.P.:</strong> ${f.cliente?.cp || "—"}</p>
                <p><strong>CORREO:</strong> ${f.cliente?.correo || "—"}</p>
                <p><strong>RÉGIMEN FISCAL:</strong> ${f.cliente?.regimen || "—"}</p>
                <p><strong>USO CFDI:</strong> ${f.cliente?.usoCfdi || "—"}</p>
            </div>
            <hr class="ticket-separador-figma">
            <table class="comprobante-factura-tabla">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cant</th>
                        <th>Precio</th>
                        <th>IVA</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>${filasItems}</tbody>
            </table>
            <div class="comprobante-factura-totales">
                <p>Base imponible: $${Number(f.baseImponible || 0).toFixed(2)}</p>
                <p>IVA (16%): $${Number(f.ivaTotal || 0).toFixed(2)}</p>
                <p class="factura-gran-total">TOTAL: $${Number(f.total || 0).toFixed(2)}</p>
            </div>
            <hr class="ticket-separador-figma">
            <div class="comprobante-factura-emisor">
                <p><strong>SUCURSAL:</strong> ${f.tienda?.nombre || "CADENA COMERCIAL OXXO"}</p>
                <p><strong>DIRECCIÓN:</strong> ${f.tienda?.direccion || "Matriz Principal"}</p>
            </div>
            <button type="button" class="btn-imprimir-ticket mt-3" onclick="window.print()">
                <i class="fa-solid fa-print"></i> Imprimir factura fiscal
            </button>
        </div>
    `;
}
