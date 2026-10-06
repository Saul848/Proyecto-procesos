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

/**
 * Llena el select de productos con las opciones recibidas.
 * 
 * @param {Array} productos - Arreglo de productos a mostrar.
 */
function llenarSelect(productos){
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
        
        if(p.sinStock || Number(p.stock) <= 0){
            opcion.disabled = true;
            opcion.textContent += '(sin stock)';
        }
        select.appendChild(opcion);
    });
}
    
/**
 * Filtra los productos según el texto buscado (por nombre o ID).
 */
function filtrarProductos(){
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

/**
 * Actualiza el formulario según el tipo de promoción seleccionado.
 * Sea porcentaje, cantidad o precio fijo.
 */
function actualizarFormulario(){
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

/**
 * Abre el modal de historial y carga sus datos.
 */
function verHistorial(){
    cargarHistorial();
    document.getElementById('modalHistorial').style.display = 'flex';
}

/**
 * Cierra el modal de historial.
 */
function cerrarHistorial(){
    document.getElementById('modalHistorial').style.display = 'none';
}

/**
 * Carga el historial de acciones y lo muestra en la tabla. 
 * Traduce los tipos de promoción y el beneficio a texto legible.
 */
function cargarHistorial(){
    fetch('/api/ofertas/historial')
        .then(r => r.json())
        .then(registros => {
            const tbody = document.getElementById('tablaHistorial');
            tbody.innerHTML = '';

            registros.forEach(r => {
                const tipoTexto = {
                    'porcentaje': 'Porcentaje',
                    'cantidad': 'Volumen (2 x 1)',
                    'precioFijo': 'Precio Especial'
                }[r.tipoProm] || r.tipoProm || '-';

                const fila = document.createElement('tr');

                let beneficioTexto;
                if (r.tipoProm === 'porcentaje'){
                    beneficioTexto = r.valorDesc + '%';
                } else if (r.tipoProm === 'cantidad'){
                    beneficioTexto = r.cantidadRecibe + ' x ' + r.cantidadPaga;
                } else if (r.tipoProm === 'precioFijo'){
                    beneficioTexto = '$' + r.valorDesc;
                } else {
                    beneficioTexto = r.valorDesc || '-';
                }

                fila.innerHTML = `
                    <td>${r.accion === 'crear' ? 'Creación' : 'Eliminación'}</td>
                    <td>${r.nombreProducto || r.idProducto || '-'}</td>
                    <td>${tipoTexto}</td>
                    <td>${beneficioTexto}</td>
                    <td>${r.fechaHora || '-'}</td>
                `;
                tbody.appendChild(fila);
            });

            if (registros.length === 0){
                tbody.innerHTML = '<tr><td colspan="5">No hay registros</td></tr>';
            }
        })
        .catch(() => {
            document.getElementById('tablaHistorial').innerHTML = '<tr><td colspan="5">Error al cargar historial</td></tr>';
        });
}

/**
 * Carga las ofertas y las muestra en la tabla.
 * Traduce tipo de promoción, formatea el beneficio y las fechas.
 */
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

/**
 * Convierte una fecha en formato ISO (aaaa-mm-dd) a formato mexicano (dd/mm/aaaa).
 * @param {string} fecha - Fecha en formato aaaa-mm-dd.
 * @returns {string} Fecha en formato dd/mm/aaaa, o "-" si no hay fecha.
 */
function formatearFecha(fecha){
    if (!fecha) return '-';
    const [anio, mes, dia] = fecha.split('-');
    return dia + '/' + mes + '/' + anio;
}

/**
 * Envía una nueva oferta al servidor.
 * Construye el cuerpo según el tipo de promoción:
 * - "cantidad": envía cantidadRecibe y cantidadPaga.
 * - Otros: envía valorDesc.
 * Muestra un mensaje de éxito o error según la respuesta.
 */
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

/**
 * Elimina una oferta por su ID tras confirmación del usuario.
 * 
 * @param {string} id - ID de la oferta a eliminar (ej. "OF-01").
 */
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

/**
 * Limpia todos los campos del formulario y restaura el estado inicial.
 */
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

/**
 * Muestra un mensaje de retroalimentación al usuario con estilo
 * de éxito (verde) o error (rojo).
 * 
 * @param {string} texto - Mensaje a mostrar.
 * @param {boolean} esExito - true para estilo de éxito, false para error.
 */
function mostrarMensaje(texto, esExito) {
    const div = document.getElementById('mensaje');
    div.textContent = texto;
    div.className = 'mensaje ' + (esExito ? 'ok' : 'error');
}

cargarOfertas();
