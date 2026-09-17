//por el momento este archivo no lo ocupo
document.addEventListener("DOMContentLoaded", () => {
    cargarReporteInventario();
});

async function cargarReporteInventario() {
    try {
        const respuesta = await fetch("/api/productos/inventario-reportes");
        const datos = await respuesta.json();

        if (datos.ok) {
            // Mostrar el total de existencias
            document.getElementById("totalExistencias").textContent = datos.totalExistencias;

            //Obtener el cuerpo de la tabla
            const cuerpoTabla = document.getElementById("cuerpoTablaReporte");
            cuerpoTabla.innerHTML = "";

            //Recorrer los productos y agregarlos a la tabla
            datos.productos.forEach(prod => {
                const fila = document.createElement("tr");

                // Si está en desabasto aplique un estilo visual de alerta
                if (prod.esDesabasto) {
                    fila.style.backgroundColor = "#ffdddd";
                }

                fila.innerHTML = `
                    <td>${prod.id}</td>
                    <td>${prod.nombre}</td>
                    <td>${prod.descripcion}</td>
                    <td>$${prod.precio}</td>
                    <td>${prod.stock}</td>
                    <td>
                        ${prod.esDesabasto ? '<span style="color: red; font-weight: bold;"> Desabasto / Stock Bajo</span>' : '<span style="color: green;">Normal</span>'}
                    </td>
                `;

                cuerpoTabla.appendChild(fila);
            });
        } else {
            alert("No se pudo cargar el reporte de inventario.");
        }
    } catch (error) {
        console.error("Error al obtener el reporte:", error);
        alert("Error de conexión con el servidor.");
    }
}