let todosLosProductos = []; // Catálogo original completo
let catalogoProductos = []; // Catálogo visible/filtrado
let itemsCuenta = [];       // Productos seleccionados en el ticket { id, nombre, precio, cantidad, stockMax }
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

document.addEventListener("DOMContentLoaded", () => {
    verificarEstadoCaja();
    cargarFolioActual();
    cargarProductos();
    configurarEventos();
});

function configurarEventos() {
    // Búsqueda instantánea en tiempo real por ID o por nombre
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
    btnRegistrarPago.addEventListener("click", procesarVenta);

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

// 1. Folio de la siguiente venta
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

// 2. Control de estado de caja
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

async function cargarProductos() {
    try {
        const res = await fetch("/api/productos");
        const data = await res.json();
        
        // Extraemos el arreglo de data.productos
        const lista = data.productos || (Array.isArray(data) ? data : []);
        
        todosLosProductos = lista;
        catalogoProductos = [...todosLosProductos];
        
        if (inputBuscar && inputBuscar.value.trim() !== "") {
            filtrarProductos(inputBuscar.value);
        } else {
            renderizarTabla();
        }
    } catch (err) {
        console.error("Error al obtener catálogo:", err);
    }
}

function filtrarProductos(termino) {
    const busqueda = String(termino || "").trim().toLowerCase();

    if (!busqueda) {
        catalogoProductos = [...todosLosProductos];
    } else {
        catalogoProductos = todosLosProductos.filter((prod) => {
            // Maneja id normal o @_id por si viene directo del parser XML
            const idVal = prod.id !== undefined ? String(prod.id) : (prod["@_id"] !== undefined ? String(prod["@_id"]) : "");
            const nombreVal = prod.nombre ? String(prod.nombre).toLowerCase() : "";

            return idVal.trim() === busqueda || idVal.includes(busqueda) || nombreVal.includes(busqueda);
        });
    }

    renderizarTabla();
}

function renderizarTabla() {
    tablaProductosCuerpo.innerHTML = "";

    if (catalogoProductos.length === 0) {
        tablaProductosCuerpo.innerHTML = `<tr><td colspan="5" style="color:#888; padding:15px;">No hay productos que coincidan</td></tr>`;
        return;
    }

    catalogoProductos.forEach((prod) => {
        const idProd = prod.id !== undefined ? prod.id : prod["@_id"];
        const estaMarcado = itemsCuenta.some((i) => String(i.id) === String(idProd));
        const stockActual = Number(prod.stock) || 0;
        const precioActual = Number(prod.precio) || 0;

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
            <td><span class="badge-stock">${stockActual}</span></td>
            <td><span class="badge-id">${idProd}</span></td>
        `;

        tablaProductosCuerpo.appendChild(tr);
    });
}

// 4. Carrito / Cuenta actual
window.toggleSeleccion = function(idProducto, checked) {
    const prod = todosLosProductos.find((p) => String(p.id) === String(idProducto));
    if (!prod) return;

    if (checked) {
        itemsCuenta.push({
            id: prod.id,
            nombre: prod.nombre,
            precio: Number(prod.precio),
            cantidad: 1,
            stockMax: Number(prod.stock)
        });
    } else {
        itemsCuenta = itemsCuenta.filter((item) => String(item.id) !== String(idProducto));
    }

    actualizarTicket();
};

function calcularTotales() {
    const subtotal = itemsCuenta.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { subtotal, iva, total };
}

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

function actualizarTicket() {
    if (itemsCuenta.length === 0) {
        listaItemsTicket.innerHTML = `<p style="text-align:center; color:#999; font-size:12px; margin-top:35px;">No hay productos en la cuenta</p>`;
        lblSubtotal.textContent = "$0";
        lblIva.textContent = "$0";
        lblTotal.textContent = "$0";
        inputCambio.value = "$0.00";
        validarBotonCobro();
        return;
    }

    listaItemsTicket.innerHTML = "";

    itemsCuenta.forEach((item) => {
        const itemLine = document.createElement("div");
        itemLine.className = "ticket-item-row";
        itemLine.innerHTML = `
            <span>${item.nombre} x${item.cantidad}</span>
            <span>$${(item.precio * item.cantidad).toFixed(0)}</span>
        `;
        listaItemsTicket.appendChild(itemLine);
    });

    const { subtotal, iva, total } = calcularTotales();
    lblSubtotal.textContent = `$${subtotal.toFixed(0)}`;
    lblIva.textContent = `$${iva.toFixed(0)}`;
    lblTotal.textContent = `$${total.toFixed(0)}`;

    calcularCambio();
}

// 5. Procesar compra y emitir ticket
async function procesarVenta() {
    if (!cajaAbierta) {
        alert("La caja está cerrada.");
        return;
    }

    const payload = {
        idEmpleado: "1",
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
            throw new Error(data.mensaje || "Error al procesar");
        }

        mostrarTicketModal(data.ticket);

    } catch (err) {
        alert(err.message);
    } finally {
        btnRegistrarPago.textContent = "Registrar pago";
    }
}

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