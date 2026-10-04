const tipoSelect = document.getElementById('tipo');
const campoValor = document.getElementById('campoValor');
const campoRecibe = document.getElementById('campoRecibe');
const campoPaga = document.getElementById('campoPaga');
const labelValor = document.getElementById('labelValor');

let todosProductos = [];

//carga productos-desplegable
fetch("/api/productos", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
    }
})
    .then(r => r.json())
    .then(data => {
        todosProductos = data.productos;
        llenarSelect(todosProductos);
    });

function llenarSelect(productos) {
    const select = document.getElementById('producto');
    select.innerHTML = '';
    if (productos.length === 0) {
        select.innerHTML = '<option value="">Sin resultados</option>';
        return;
    }
    productos.forEach(p => {
        const opcion = document.createElement('option');
        opcion.value = p.id;
        opcion.textContent = p.id + ' - ' + p.nombre + ' ($' + Number(p.precio).toFixed(2) + ')';
        select.appendChild(opcion);
    });
}

function filtrarProductos() {
    const texto = document.getElementById('buscarProducto').value.toLowerCase();
    if (!texto) {
        llenarSelect(todosProductos);
        return;
    }
    const filtrados = todosProductos.filter(p =>
        p.nombre.toLowerCase().startsWith(texto) ||
        String(p.id) === texto
    );
    llenarSelect(filtrados);
}

function actualizarFormulario() {
    const tipo = tipoSelect.value;

    campoValor.style.display = 'none';
    campoRecibe.style.display = 'none';
    campoPaga.style.display = 'none';

    if (tipo === 'porcentaje') {
        labelValor.textContent = 'Valor (introduce el % del descuento, ej. 15):';
        document.getElementById('valor').placeholder = 'Ej. 15';
        campoValor.style.display = 'block';
    } else if (tipo === 'cantidad') {
        campoRecibe.style.display = 'block';
        campoPaga.style.display = 'block';
    } else if (tipo === 'precioFijo') {
        labelValor.textContent = 'Precio final (en pesos, ej. 99.99):';
        document.getElementById('valor').placeholder = 'Ej. 99.99';
        campoValor.style.display = 'block';
    }
}

tipoSelect.addEventListener('change', actualizarFormulario);
actualizarFormulario();

//muestra ofertas
function cargarOfertas() {
    fetch('/api/ofertas')
        .then(r => r.json())
        .then(ofertas => {
            const tbody = document.getElementById('tablaOfertas');
            tbody.innerHTML = '';

            ofertas.forEach(o => {
                const fila = document.createElement('tr');

                const tipoTexto = {
                    'porcentaje': 'Porcentaje',
                    'cantidad': 'Volumen (2 x 1)',
                    'precioFijo': 'Precio especial'
                }[o.tipoProm] || o.tipoProm;

                let descuentoTexto;
                if (o.tipoProm === 'porcentaje') {
                    descuentoTexto = o.valorDesc + '%';
                } else if (o.tipoProm === 'cantidad') {
                    descuentoTexto = o.cantidadRecibe + 'x' + o.cantidadPaga + ' (llevas ' + o.cantidadRecibe + ' pagas ' + o.cantidadPaga + ')';
                } else if (o.tipoProm === 'precioFijo') {
                    descuentoTexto = 'Precio final: $' + o.valorDesc;
                } else {
                    descuentoTexto = o.valorDesc;
                }

                fila.innerHTML = `
                    <td>${o.id}</td>
                    <td>${o.nombreProducto || o.idProducto}</td>
                    <td>${tipoTexto}</td>
                    <td>${descuentoTexto}</td>
                    <td>${formatearFecha(o.fechaInicio)} - ${formatearFecha(o.fechaFin)}</td>
                    <td>${o.estado}</td>
                    <td><button class="btn-eliminar" onclick="eliminarOferta('${o.id}')">Eliminar</button></td>
                `;
                tbody.appendChild(fila);
            });
        })
        .catch(() => {
            document.getElementById('tablaOfertas').innerHTML = '<tr><td colspan="7">Error al cargar ofertas</td></tr>';
        });
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    const [anio, mes, dia] = fecha.split('-');
    return dia + '/' + mes + '/' + anio;
}

//guarda una oferta
function guardarOferta() {
    const tipo = tipoSelect.value;
    let body;

    if (tipo === 'cantidad') {
        body = {
            idProducto: document.getElementById('producto').value,
            tipoProm: tipo,
            cantidadRecibe: document.getElementById('recibe').value,
            cantidadPaga: document.getElementById('paga').value,
            fechaInicio: document.getElementById('inicio').value,
            fechaFin: document.getElementById('fin').value
        };
    } else {
        body = {
            idProducto: document.getElementById('producto').value,
            tipoProm: tipo,
            valorDesc: document.getElementById('valor').value,
            fechaInicio: document.getElementById('inicio').value,
            fechaFin: document.getElementById('fin').value
        };
    }

    fetch('/api/ofertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(r => r.json())
        .then(respuesta => {
            if (respuesta.ok) {
                mostrarMensaje('Oferta creada exitosamente.', true);
                cancelar();
                cargarOfertas();
            } else {
                mostrarMensaje(respuesta.mensaje || 'Error al crear la oferta.', false);
            }
        })
        .catch(() => mostrarMensaje('Error de conexión con el servidor.', false));
}

//elimina una oferta
function eliminarOferta(id) {
    if (!confirm(`¿Seguro que quieres eliminar la oferta ${id}?`)) return;

    fetch(`/api/ofertas/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(respuesta => {
            if (respuesta.ok) {
                cargarOfertas();
            } else {
                mostrarMensaje(respuesta.mensaje || 'Error al eliminar.');
            }
        })
        .catch(() => mostrarMensaje('Error de conexión con el servidor.'));
}

//limpiar formulario
function cancelar() {
    document.getElementById('producto').value = '';
    document.getElementById('buscarProducto').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('inicio').value = '';
    document.getElementById('fin').value = '';
    document.getElementById('mensaje').className = 'mensaje';
    document.getElementById('mensaje').textContent = '';
    document.getElementById('recibe').value = '';
    document.getElementById('paga').value = '';
    llenarSelect(todosProductos);
    actualizarFormulario();
}

//mensajes
function mostrarMensaje(texto, esExito) {
    const div = document.getElementById('mensaje');
    div.textContent = texto;
    div.className = 'mensaje ' + (esExito ? 'ok' : 'error');
}

cargarOfertas();
