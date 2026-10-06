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
                seccionProductos.innerHTML = `<tr><td colspan="6" style="text-align: center;">Error al cargar el catálogo.</td></tr>`;
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            seccionProductos.innerHTML = `<tr><td colspan="6" style="text-align: center;">No se pudo conectar con el servidor.</td></tr>`;
        }
    };

    const mostrarProductos = (productos) => {
        seccionProductos.innerHTML = ""; 

        if (productos.length === 0) {
            seccionProductos.innerHTML = `<tr><td colspan="6" style="text-align: center;">No se encontraron productos.</td></tr>`;
            return;
        }

        productos.forEach((prod) => {
            const fila = document.createElement("tr");

            // Si no hay stock, aplicamos la clase de desabasto (fondo rojo vino y texto blanco)
            if (prod.sinStock || prod.stock <= 0) {
                fila.classList.add("fila-desabasto");
            }

            fila.innerHTML = `
                <td>${prod.id}</td>
                <td><strong>${prod.nombre}</strong></td>
                <td>${prod.descripcion}</td>
                <td>$${prod.precio}</td>
                <td>${prod.stock}</td>
                <td>
                    ${prod.sinStock || prod.stock <= 0 
                        ? '<span style="color: #ff9999; font-weight: bold;">⚠️ Sin Stock</span>' 
                        : '<span style="color: #2ecc71; font-weight: bold;">Normal</span>'}
                </td>
            `;

            seccionProductos.appendChild(fila);
        });
    };

    btnBuscar.addEventListener("click", () => {
        cargarProductos(inputBuscar.value);
    });

    if (btnVolver) {
        btnVolver.addEventListener("click", () => {
            window.location.href = "/gerente"; 
        });
    }

    cargarProductos();
});