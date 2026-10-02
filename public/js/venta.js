/**
 * Lógica del lado del cliente para el Punto de Venta.
 * Gestiona el catálogo, cálculo de ofertas y descuentos dinámicos,
 * control de stock, gestión del ticket de venta y confirmación de transacciones.
 * @module public/js/venta
 */

let todosLosProductos = []; // Catálogo original completo cargado de la API
let catalogoProductos = []; // Catálogo filtrado en la vista
let itemsCuenta = [];       // Productos seleccionados en el carrito 
let ofertasActivas = [];    // Ofertas vigentes obtenidas de /api/ofertas
let metodoPago = "Efectivo";
let cajaAbierta = true;

// Referencias del DOM
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
const idCajaSeleccionada = document.getElementById('selectCaja').value; // Tomará "1" o "2"

document.addEventListener("DOMContentLoaded", () => {
    verificarEstadoCaja();
    cargarFolioActual();
    cargarDatos();
    configurarEventos();
});

/**
 * Configura los escuchadores de eventos para la interfaz de usuario.
 */
function configurarEventos() {
    inputBuscar.addEventListener("input", (e) => {
        filtrarProductos(e.target.value);
    });

    btnToggleCaja.addEventListener("click", alternarCaja);

    btnEfectivo.addEventListener("click", () => {
        metodoPago = "Efectivo";
        btnEfectivo.classList.add("active");
        btnTarjeta.classList.remove("active");
        inputMontoRecibido.disabled = false;
        calcularCambio();
    });

    btnTarjeta.addEventListener("click", () => {
        metodoPago = "Tarjeta";
        btnTarjeta.classList.add("active");
        btnEfectivo.classList.remove("active");
        inputMontoRecibido.disabled = true;
        const total = calcularTotales().total;
        inputMontoRecibido.value = total.toFixed(2);
        inputCambio.value = "$0.00";
        validarBotonCobro();
    });

    inputMontoRecibido.addEventListener("input", calcularCambio);
    btnRegistrarPago.addEventListener("click", () => {

        // 1. Obtenemos la caja seleccionada del menú desplegable
        const idCajaSeleccionada = document.getElementById('selectCaja').value;
        
        // 2. Armamos el objeto con todos los datos incluyendo el método de pago
        const datosVenta = {
            idEmpleado: "1",               // O tu variable dinámica de empleado
            idCaja: idCajaSeleccionada,    // "1" o "2" según el menú
            metodoPago: metodoPago,        // <--- Aquí viaja "Efectivo" o "Tarjeta"
            items: itemsCuenta.map((i) => ({
                idProducto: i.id,
                cantidad: i.cantidad
        }))
        };

        // 3. Enviamos los datos al servidor
        fetch('/api/ventas/confirmar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosVenta)
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                console.log(`Venta registrada con éxito con tarjeta/efectivo en la Caja ${idCajaSeleccionada}`);
                // Aquí muestras tu ticket o modal de éxito
            } else {
                alert(data.mensaje);
            }
        })
        .catch(err => console.error("Error:", err));
    });
        btnCerrarModal.addEventListener("click", () => {
            modalTicket.style.display = "none";
            itemsCuenta = [];
            inputMontoRecibido.value = "";
            inputCambio.value = "$0.00";
            actualizarTicket();
            cargarFolioActual();
            cargarProductos();
        });
    }

/**
 * Obtiene del servidor el siguiente número de folio para mostrarlo en pantalla.
 * @async
 */
async function cargarFolioActual() {
    try {
        const res = await fetch("/api/ventas/folio/siguiente");
        if (res.ok) {
            const data = await res.json();
            if (lblFolioVenta && data.siguienteFolio) {
                lblFolioVenta.textContent = `Venta numero ${data.siguienteFolio}`;
            }
        }
    } catch (e) {
        console.warn("No se pudo obtener el folio actual:", e);
    }
}

/**
 * Consulta el estado actual de la caja registradora en el servidor.
 * @async
 */
async function verificarEstadoCaja() {
    try {
        const res = await fetch("/api/ventas/caja/estado");
        const data = await res.json();
        cajaAbierta = data.cajaAbierta;
        actualizarVistaCaja();
    } catch (err) {
        console.error("Error al consultar caja:", err);
    }
}

/**
 * Alterna entre abrir y cerrar la caja en el servidor.
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
        cajaAbierta = data.cajaAbierta;
        actualizarVistaCaja();
    } catch (err) {
        alert("Error al cambiar estado de caja");
    }
}

/**
 * Actualiza los elementos visuales que representan el estado de la caja.
 */
function actualizarVistaCaja() {
    if (cajaAbierta) {
        cajaDot.style.backgroundColor = "#2ecc71";
        cajaTexto.textContent = "Caja Abierta";
        btnToggleCaja.textContent = "Cerrar Caja";
    } else {
        cajaDot.style.backgroundColor = "#e74c3c";
        cajaTexto.textContent = "Caja Cerrada";
        btnToggleCaja.textContent = "Abrir Caja";
    }
    validarBotonCobro();
}

/**
 * Carga los productos y las ofertas activas en paralelo desde la API.
 * @async
 */
async function cargarDatos() {
    try {
        const [resProd, resOf] = await Promise.all([
            fetch("/api/productos"),
            fetch("/api/ofertas")
        ]);

        const dataProd = await resProd.json();
        todosLosProductos = dataProd.productos || (Array.isArray(dataProd) ? dataProd : []);
        catalogoProductos = [...todosLosProductos];

        if (resOf.ok) {
            const dataOfertas = await resOf.json();
            const listado = Array.isArray(dataOfertas) ? dataOfertas : (dataOfertas.ofertas || []);
            // Filtra únicamente las ofertas vigentes
            ofertasActivas = listado.filter(o => o.estado === "disponible");
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

/**
 * Filtra los productos en memoria según el término ingresado por ID o nombre.
 * @param {string} termino - Texto a buscar.
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
 * Dibuja las filas de la tabla de productos vinculando las promociones correspondientes.
 */
function renderizarTabla() {
    tablaProductosCuerpo.innerHTML = "";

    if (catalogoProductos.length === 0) {
        tablaProductosCuerpo.innerHTML = `<tr><td colspan="6" style="color:#888; padding:15px;">No hay productos que coincidan</td></tr>`;
        return;
    }

    catalogoProductos.forEach((prod) => {
        const idProd = String(prod.id !== undefined ? prod.id : prod["@_id"]);
        const estaMarcado = itemsCuenta.some((i) => String(i.id) === idProd);
        const stockActual = Number(prod.stock) || 0;
        const precioActual = Number(prod.precio) || 0;

        // Empatar con ofertas del módulo de ofertas
        const oferta = ofertasActivas.find(o => String(o.idProducto) === idProd);
        let textoOferta = "-";
        let claseOferta = "sin-oferta";

        if (oferta) {
            claseOferta = "badge-oferta";
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
            <td style="text-transform: capitalize; text-align: left; padding-left: 10px;">${prod.nombre}</td>
            <td>$${precioActual.toFixed(0)}</td>
            <td><span class="${claseOferta}">${textoOferta}</span></td>
            <td><span class="badge-stock">${stockActual}</span></td>
            <td><span class="badge-id">${idProd}</span></td>
        `;

        tablaProductosCuerpo.appendChild(tr);
    });
}

/**
 * Agrega o quita un producto del carrito según el estado del checkbox.
 * @param {string} idProducto - ID del producto seleccionado.
 * @param {boolean} checked - Indica si el checkbox fue marcado o desmarcado.
 */
window.toggleSeleccion = function(idProducto, checked) {
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
 * Modifica la cantidad de unidades de un producto en el carrito (+1 o -1).
 * @param {string} idProducto - ID del producto a modificar.
 * @param {number} delta - Variación en la cantidad (+1 o -1).
 */
window.cambiarCantidadTicket = function(idProducto, delta) {
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
 * Calcula el subtotal monetario de una línea del ticket aplicando la promoción correspondiente.
 * @param {Object} item - Elemento de la cuenta con datos de precio, cantidad y oferta.
 * @returns {number} Subtotal de la línea.
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
 * Calcula los totales acumulados del ticket de venta.
 * @returns {{subtotal: number, iva: number, total: number}}
 */
function calcularTotales() {
    const subtotal = itemsCuenta.reduce((acc, i) => acc + calcularSubtotalItem(i), 0);
    const total = subtotal;
    const iva = total * 0.16;
    return { subtotal, iva, total };
}

/**
 * Calcula el cambio a devolver al cliente cuando el método de pago es efectivo.
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
 * Valida si el botón de registrar pago debe habilitarse según el estado de la caja y el pago.
 */
function validarBotonCobro() {
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
 * Actualiza la lista visual del ticket de venta con los productos y totales actuales.
 */
function actualizarTicket() {
    if (itemsCuenta.length === 0) {
        listaItemsTicket.innerHTML = `<p style="text-align:center; color:#999; font-size:12px; margin-top:35px;">No hay productos en la cuenta</p>`;
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
        itemLine.style.display = "flex";
        itemLine.style.justifyContent = "space-between";
        itemLine.style.alignItems = "center";
        itemLine.style.margin = "6px 0";

        const subtotalFila = calcularSubtotalItem(item);

        itemLine.innerHTML = `
            <div style="display: flex; flex-direction: column; text-align: left;">
                <span style="font-weight: 600; font-size: 13px;">${item.nombre}</span>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                    <button type="button" onclick="cambiarCantidadTicket('${item.id}', -1)" style="padding: 1px 7px; border: 1px solid #ccc; background: #eee; border-radius: 3px; cursor: pointer; font-weight: bold;">-</button>
                    <span style="font-size: 12px; font-weight: bold;">${item.cantidad}</span>
                    <button type="button" onclick="cambiarCantidadTicket('${item.id}', 1)" style="padding: 1px 7px; border: 1px solid #ccc; background: #eee; border-radius: 3px; cursor: pointer; font-weight: bold;">+</button>
                    <span style="font-size: 11px; color: #777;">($${item.precioOriginal.toFixed(2)} c/u)</span>
                </div>
            </div>
            <span style="font-weight: 700; font-size: 13px;">$${subtotalFila.toFixed(2)}</span>
        `;
        listaItemsTicket.appendChild(itemLine);
    });

    const { subtotal, iva, total } = calcularTotales();
    lblSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    lblIva.textContent = `$${iva.toFixed(2)}`;
    lblTotal.textContent = `$${total.toFixed(2)}`;

    calcularCambio();
}

/**
 * Envía la venta confirmada al servidor para registrarla en XML y actualizar existencias.
 * @async
 */
async function procesarVenta() {
    if (!cajaAbierta) {
        alert("La caja está cerrada.");
        return;
    }

    const idEmpleadoActivo = sessionStorage.getItem("idEmpleado") 
                          || sessionStorage.getItem("idUsuario") 
                          || "1";

                          
    // capturamos la caja del menú y el método de pago activo
    const idCajaSeleccionada = document.getElementById("selectCaja") ? document.getElementById("selectCaja").value : "1";
    const metodoPagoActual = typeof metodoPago !== 'undefined' ? metodoPago : "Efectivo";

    const payload = {
        idEmpleado: idEmpleadoActivo, // Asigna el empleado real de la sesión activa
        idCaja: idCajaSeleccionada,   // <--- Enviamos la caja dinámicamente
        metodoPago: metodoPagoActual, // <--- Enviamos Efectivo o Tarjeta
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
 * Muestra el modal con el desglose del comprobante de venta emitido por el backend.
 * @param {Object} ticket - Datos de la venta devueltos por el servidor.
 */
function mostrarTicketModal(ticket) {
    const fecha = new Date(ticket.fecha).toLocaleString();
    const items = Array.isArray(ticket.items.item) ? ticket.items.item : [ticket.items.item];

    let itemsHtml = items.map((it) => `
        <div style="display:flex; justify-content:space-between; margin:3px 0;">
            <span>${it.nombre} (x${it.cantidad})</span>
            <span>$${Number(it.subtotal).toFixed(2)}</span>
        </div>
    `).join("");

    reciboDetalle.innerHTML = `
        <div style="text-align: center; margin-bottom: 6px;">
            <strong>TIENDA / COMPROBANTE</strong><br>
            Folio: #${ticket["@_id"]}<br>
            ${fecha}
        </div>
        <hr style="border:none; border-top:1px dashed #aaa; margin:6px 0;">
        ${itemsHtml}
        <hr style="border:none; border-top:1px dashed #aaa; margin:6px 0;">
        <div style="display:flex; justify-content:space-between; font-weight:bold;">
            <span>TOTAL:</span>
            <span>$${Number(ticket.total).toFixed(2)}</span>
        </div>
        <div style="font-size:11px; margin-top:4px; color:#666;">
            Método: ${metodoPago}
        </div>
    `;

    modalTicket.style.display = "flex";
}
/* HISTORIAL Y REIMPRESIÓN DE TICKETS */

let ventasHistorialCache = [];

async function abrirHistorialVentas() {
    try {
        const res = await fetch("/api/ventas");
        const data = await res.json();
        ventasHistorialCache = data.ventas || [];
        renderizarHistorial(ventasHistorialCache);
        document.getElementById("modalHistorialVentas").style.display = "flex";
    } catch (e) {
        alert("Error al cargar el historial de ventas.");
    }
}

function cerrarModalHistorial() {
    document.getElementById("modalHistorialVentas").style.display = "none";
}

function renderizarHistorial(lista) {
    const tbody = document.getElementById("tablaHistorialCuerpo");
    if (!tbody) return;

    tbody.innerHTML = lista.length ? "" : `<tr><td colspan="4" style="text-align:center; padding:15px; color:#888;">Sin ventas registradas</td></tr>`;

    [...lista].reverse().forEach((v) => {
        const id = v["@_id"] || v.id || v.folio;
        const fecha = v.fecha ? new Date(v.fecha).toLocaleString() : "N/D";
        const total = Number(v.total || 0).toFixed(2);

        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td><strong>#${id}</strong></td>
                <td>${fecha}</td>
                <td style="color:#27ae60; font-weight:bold;">$${total}</td>
                <td style="text-align:center;">
                    <button type="button" class="btn-toggle-caja" style="background:#3498db; padding:4px 8px; font-size:12px;" onclick="seleccionarVentaParaReimpresion('${id}')">
                        <i class="fa-solid fa-eye"></i> Ver / Reimprimir
                    </button>
                </td>
            </tr>
        `;
    });
}

function filtrarHistorialVentas() {
    const filtro = document.getElementById("filtroHistorial").value.trim().toLowerCase();
    const filtradas = ventasHistorialCache.filter(v => String(v["@_id"] || v.id || "").toLowerCase().includes(filtro));
    renderizarHistorial(filtradas);
}

function seleccionarVentaParaReimpresion(idVenta) {
    const venta = ventasHistorialCache.find(v => String(v["@_id"] || v.id) === String(idVenta));
    if (!venta) return alert("Venta no encontrada.");

    const itemsRaw = venta.items?.item || venta.productos?.producto || [];
    const items = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

    const filas = items.map(it => `
        <div style="display:flex; justify-content:space-between; margin:2px 0;">
            <span>${it.cantidad || 1}x ${it.nombre || "Prod"}</span>
            <span>$${Number(it.subtotal || it.precioUnitario || 0).toFixed(2)}</span>
        </div>
    `).join("");

    document.getElementById("detalleTicketReimpresion").innerHTML = `
        <p style="margin:2px 0;"><strong>Folio:</strong> #${venta["@_id"] || venta.id}</p>
        <p style="margin:2px 0;"><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString()}</p>
        <hr style="border:none; border-top:1px dashed #000; margin:6px 0;">
        ${filas}
        <hr style="border:none; border-top:1px dashed #000; margin:6px 0;">
        <div style="display:flex; justify-content:space-between; font-weight:bold;">
            <span>TOTAL:</span>
            <span>$${Number(venta.total).toFixed(2)}</span>
        </div>
    `;

    document.getElementById("modalCorroborarTicket").style.display = "flex";
}

function cerrarModalCorroborar() {
    document.getElementById("modalCorroborarTicket").style.display = "none";
}

function ejecutarReimpresionTicket() {
    const area = document.getElementById("areaTicketReimpresion");
    if (!area) return;

    const ventana = window.open("", "_blank", "width=320,height=500");
    if (!ventana) return alert("Habilite las ventanas emergentes en el navegador.");

    ventana.document.body.innerHTML = area.innerHTML;
    ventana.document.body.style.fontFamily = "monospace";
    ventana.document.body.style.padding = "10px";

    ventana.focus();
    ventana.print();
    ventana.close();
}