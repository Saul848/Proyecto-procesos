import { inicializarModalProducto, abrirModalProducto} from './modal_agregar_producto.js';

// CARGAR EL MODAL
fetch("componentes/modal_agregar_producto.html")
    .then(respuesta => respuesta.text())
    .then(html => {

        document.getElementById("contenedor-modal").innerHTML = html;

        // Le avisamos al JS del modal
        // que ya puede preparar sus botones
        inicializarModalProducto();

    });

//Despliega el modal en pantalla para agregar un nuevo producto
document.getElementById("boton-registrar-producto").addEventListener("click", () => {
    abrirModalProducto();
});

