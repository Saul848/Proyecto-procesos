document.addEventListener("DOMContentLoaded", () => {
    const inputBuscar = document.getElementById("inpBuscar");
    const btnBuscar = document.getElementById("btnBuscar");
    const btnVolver = document.getElementById("btnVolver");
    const seccionProductos = document.getElementById("seccionProductos");

    
    const cargarProductos = async (termino = "") => {
        try {
            
            const respuesta = await fetch(`/api/productos?busqueda=${encodeURIComponent(termino)}`);
            const datos = await respuesta.json();

            if (datos.ok) {
                mostrarProductos(datos.productos);
            } else {
                seccionProductos.innerHTML = `<p>Error al cargar el catálogo.</p>`;
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            seccionProductos.innerHTML = `<p>No se pudo conectar con el servidor.</p>`;
        }
    };

    const mostrarProductos = (productos) => {
        seccionProductos.innerHTML = ""; 

        if (productos.length === 0) {
            seccionProductos.innerHTML = `<p>No se encontraron productos.</p>`;
            return;
        }

        productos.forEach((prod) => {
            const divProducto = document.createElement("div");
            divProducto.className = "item-producto"; // Clase útil para estilos futuros

            divProducto.innerHTML = `
                <h3>${prod.nombre}</h3>
                <p><strong>ID:</strong> ${prod.id}</p>
                <p><strong>Descripción:</strong> ${prod.descripcion}</p>
                <p><strong>Precio:</strong> $${prod.precio}</p>
                <p><strong>Existencia actual:</strong> ${prod.stock}</p>
                ${prod.sinStock ? `<p class="aviso-sin-stock" style="color: red; font-weight: bold;">¡Aviso: No hay stock disponible!</p>` : ""}
            `;

            seccionProductos.appendChild(divProducto);
        });
    };

    
    btnBuscar.addEventListener("click", () => {
        cargarProductos(inputBuscar.value);
    });
/*
    inputBuscar.addEventListener("input", () => {
        cargarProductos(inputBuscar.value);
    });
*/
    if (btnVolver) {
    btnVolver.addEventListener("click", () => {
        window.location.href = "../index.html"; 
    });
}
    cargarProductos();
});