document.addEventListener("DOMContentLoaded", () => {
    const puesto = sessionStorage.getItem("puestoLogueado");

    // Verificamos que sea gerente, de lo contrario se redirige
    if (puesto !== "gerente") {
        alert("No tienes permisos para ver esta sección.");
        window.location.href = "login.html";
        return;
    }

    cargarAccesos();
});

/**
 * Carga y muestra la bitácora de accesos en la tabla.
 * Aplica los filtros seleccionados (usuario, puesto, evento) 
 * y renderiza las filas en la tabla.
 * Los accesos se muestran del más reciente al más antiguo.
 * 
 * @async
 * @function cargarAccesos
 */
async function cargarAccesos(){
    try{
        const respuesta = await fetch("/api/accesos");
        const resultado = await respuesta.json();

        const cuerpo = document.getElementById("cuerpoTabla");
        cuerpo.innerHTML = "";

        if(!resultado.ok){
            cuerpo.innerHTML = '<tr><td>No se pudieron obtener los accesos.</td></tr>';
            return;
        }

        const filtroUsuario = document.getElementById("filtroUsuario").value.toLowerCase().trim();
        const filtroPuesto = document.getElementById("filtroPuesto").value;
        const filtroEvento = document.getElementById("filtroEvento").value;

        const accesos = resultado.data.reverse();

        const accesosFiltrados = accesos.filter(acceso => {
            const coincideUsuario = !filtroUsuario || acceso.usuario.toLowerCase().includes(filtroUsuario);
            const coincidePuesto = !filtroPuesto || acceso.puesto === filtroPuesto;
            const coincideEvento = !filtroEvento || acceso.evento === filtroEvento;
            return coincideUsuario && coincidePuesto && coincideEvento;
        });

        if(accesosFiltrados.length === 0){
            cuerpo.innerHTML = "<tr><td>No se encontraron accesos con esos filtros.</td></tr>";
            return;
        }

        accesosFiltrados.forEach(acceso => {
            const fila = document.createElement("tr");
            const claseEvento = acceso.evento === "entrada" ? "entrada" : "salida";

            fila.innerHTML = `
                <td>${acceso.nombre || "-"}</td>
                <td>${acceso.usuario}</td>
                <td>${acceso.puesto}</td>
                <td>${acceso.fecha}</td>
                <td>${acceso.hora}</td>
                <td class="${claseEvento}">${acceso.evento}</td>
            `;
            cuerpo.appendChild(fila);
        });
    } catch(error){
        console.error("Error al cargar los accesos:", error);
        const cuerpo = document.getElementById("cuerpoTabla");
        cuerpo.innerHTML = '<tr><td>Error al conectar con el servidor</td></tr>';
    }
}