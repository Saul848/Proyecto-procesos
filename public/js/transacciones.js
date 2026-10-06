/**
 * Lógica del frontend para el Módulo de Transacciones / Servicios.
 */

const OPCIONES_COMPANIAS = {
    RECARGA: ["Telcel", "Movistar", "AT&T", "Bait", "Unefon"],
    SERVICIO: ["CFE (Luz)", "Agua Potable", "Telmex (Internet)", "Totalplay", "Naturgy (Gas)"]
};

const COMISION_SERVICIO = 12.00;

let servicioSeleccionado = null;
let datosPendientes = null;

// Referencias a los elementos del DOM (se inicializan al cargar el modal)
let modalFormulario, modalConfirmar, modalExito;
let formOperacion, modalTitulo, lblCompania, selectCompania, lblReferencia, inputReferencia, inputCliente, inputMonto, btnCerrarFormulario;
let resumenDatos, btnCorregir, btnEjecutarTransaccion, detalleComprobante, btnFinalizar;

document.addEventListener("DOMContentLoaded", async () => {
    await cargarComponenteModales();
    obtenerReferenciasDOM();
    configurarEventos();
});

/**
 * Carga el archivo HTML externo que contiene la estructura de los modales
 */
async function cargarComponenteModales() {
    try {
        const respuesta = await fetch("modal_transaccion.html");
        if (!respuesta.ok) throw new Error("No se pudo cargar modal_transaccion.html");
        const html = await respuesta.text();
        document.getElementById("contenedorModales").innerHTML = html;
    } catch (error) {
        console.error("Error al cargar modales:", error);
    }
}

function obtenerReferenciasDOM() {
    modalFormulario = document.getElementById("modalFormulario");
    modalConfirmar = document.getElementById("modalConfirmar");
    modalExito = document.getElementById("modalExito");

    formOperacion = document.getElementById("formOperacion");
    modalTitulo = document.getElementById("modalTitulo");
    lblCompania = document.getElementById("lblCompania");
    selectCompania = document.getElementById("selectCompania");
    lblReferencia = document.getElementById("lblReferencia");
    inputReferencia = document.getElementById("inputReferencia");
    inputCliente = document.getElementById("inputCliente");
    inputMonto = document.getElementById("inputMonto");
    btnCerrarFormulario = document.getElementById("btnCerrarFormulario");

    resumenDatos = document.getElementById("resumenDatos");
    btnCorregir = document.getElementById("btnCorregir");
    btnEjecutarTransaccion = document.getElementById("btnEjecutarTransaccion");

    detalleComprobante = document.getElementById("detalleComprobante");
    btnFinalizar = document.getElementById("btnFinalizar");
}

function configurarEventos() {
    const cardRecarga = document.getElementById("cardRecarga");
    const cardServicio = document.getElementById("cardServicio");

    cardRecarga.addEventListener("click", () => abrirFormulario("RECARGA"));
    cardServicio.addEventListener("click", () => abrirFormulario("SERVICIO"));

    btnCerrarFormulario.addEventListener("click", () => {
        modalFormulario.style.display = "none";
        formOperacion.reset();
    });

    formOperacion.addEventListener("submit", (e) => {
        e.preventDefault();
        prepararConfirmacion();
    });

    btnCorregir.addEventListener("click", () => {
        modalConfirmar.style.display = "none";
        modalFormulario.style.display = "flex";
    });

    btnEjecutarTransaccion.addEventListener("click", registrarEnServidor);

    btnFinalizar.addEventListener("click", () => {
        modalExito.style.display = "none";
        formOperacion.reset();
        datosPendientes = null;
        servicioSeleccionado = null;
    });
}

function abrirFormulario(tipo) {
    servicioSeleccionado = tipo;
    formOperacion.reset();

    selectCompania.innerHTML = "";
    OPCIONES_COMPANIAS[tipo].forEach(comp => {
        const opt = document.createElement("option");
        opt.value = comp;
        opt.textContent = comp;
        selectCompania.appendChild(opt);
    });

    if (tipo === "RECARGA") {
        modalTitulo.textContent = "Nueva Recarga Telefónica";
        lblCompania.textContent = "Compañía telefónica:";
        lblReferencia.textContent = "Número de celular (10 dígitos):";
        inputReferencia.placeholder = "Ej. 2281234567";
        inputReferencia.maxLength = 10;
        inputMonto.step = "10";
        inputMonto.min = "10";
        inputMonto.placeholder = "Ej. 50, 100, 200";
    } else {
        modalTitulo.textContent = "Pago de Servicio";
        lblCompania.textContent = "Tipo de recibo / Empresa:";
        lblReferencia.textContent = "Número de servicio / Referencia:";
        inputReferencia.placeholder = "Ej. 01800123456789";
        inputReferencia.removeAttribute("maxlength");
        inputMonto.step = "any";
        inputMonto.min = "0.01";
        inputMonto.placeholder = "Ej. 289.50";
    }

    modalFormulario.style.display = "flex";
}

function prepararConfirmacion() {
    const compania = selectCompania.value;
    const referencia = inputReferencia.value.trim();
    const cliente = inputCliente.value.trim() || "Público General";
    const monto = parseFloat(inputMonto.value);

    if (servicioSeleccionado === "RECARGA") {
        const soloDigitos = referencia.replace(/\D/g, "");
        if (soloDigitos.length !== 10) {
            alert("El número de teléfono debe tener exactamente 10 dígitos numéricos.");
            return;
        }
    } else if (servicioSeleccionado === "SERVICIO") {
        const soloDigitos = referencia.replace(/\D/g, "");
        if (soloDigitos.length < 4) {
            alert("La referencia debe tener al menos 4 dígitos.");
            return;
        }
    }

    if (isNaN(monto) || monto <= 0) {
        alert("El monto debe ser mayor a $0.00.");
        return;
    }

    const comisionAplicable = servicioSeleccionado === "SERVICIO" ? COMISION_SERVICIO : 0.00;
    const totalFinal = monto + comisionAplicable;

    datosPendientes = {
        tipo: servicioSeleccionado,
        companiaServicio: compania,
        referencia: referencia,
        cliente: cliente,
        monto: totalFinal,
        idEmpleado: sessionStorage.getItem("idEmpleado") || sessionStorage.getItem("idUsuario") || "1"
    };

    resumenDatos.innerHTML = `
        <p><strong>Servicio:</strong> ${servicioSeleccionado === "RECARGA" ? "Recarga de Tiempo Aire" : "Pago de Recibo / Servicio"}</p>
        <p><strong>Empresa / Convenio:</strong> ${compania}</p>
        <p><strong>${servicioSeleccionado === "RECARGA" ? "Número de Celular:" : "Referencia:"}</strong> ${referencia}</p>
        <p><strong>Cliente:</strong> ${cliente}</p>
        ${servicioSeleccionado === "SERVICIO" ? `
            <div style="background: #eef2f7; padding: 8px; border-radius: 4px; margin: 8px 0; font-size: 13px;">
                <span>Importe del recibo: $${monto.toFixed(2)} MXN</span><br>                 <span>Comisión por pago en caja: $${comisionAplicable.toFixed(2)} MXN</span>
            </div>
        ` : ""}
        <p style="font-size: 16px; color: #27ae60; font-weight: bold; margin-top: 8px;">
            Total a cobrar: $${totalFinal.toFixed(2)} MXN
        </p>
    `;

    modalFormulario.style.display = "none";
    modalConfirmar.style.display = "flex";
}

async function registrarEnServidor() {
    if (!datosPendientes) return;

    btnEjecutarTransaccion.disabled = true;
    btnEjecutarTransaccion.textContent = "Procesando...";

    try {
        const respuesta = await fetch("/api/transacciones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosPendientes)
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.mensaje || "Error al procesar la transacción.");
        }

        mostrarComprobanteExito(data.transaccion);
    } catch (error) {
        alert("Ocurrió un error: " + error.message);
    } finally {
        btnEjecutarTransaccion.disabled = false;
        btnEjecutarTransaccion.textContent = "Confirmar y Registrar";
    }
}

function mostrarComprobanteExito(tx) {
    modalConfirmar.style.display = "none";

    detalleComprobante.innerHTML = `
        <div style="text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 8px; margin-bottom: 8px;">
            <strong>CADENA COMERCIAL OXXO</strong><br>
            <span>Folio Transacción: #${tx["@_id"] || tx.id}</span><br>
            <small>${tx.fecha} - ${tx.hora}</small>
        </div>
        <p><strong>Operación:</strong> ${tx.tipo}</p>
        <p><strong>Empresa:</strong> ${tx.companiaServicio}</p>
        <p><strong>Referencia:</strong> ${tx.referencia}</p>
        <p><strong>Cliente:</strong> ${tx.cliente}</p>
        <p style="font-size: 15px; font-weight: bold; color: #27ae60; margin-top: 8px;">
            Monto Pagado: $${Number(tx.monto).toFixed(2)} MXN
        </p>
        <div style="text-align: center; margin-top: 10px; font-size: 12px; color: #777;">
            Estado: <strong>AUTORIZADA</strong>
        </div>
    `;

    modalExito.style.display = "flex";
}