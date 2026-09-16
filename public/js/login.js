/**
 * Evento que se ejecuta al hacer clic en el botón de inicio de sesión.
 * Valida las credenciales ingresadas comparándolas con un archivo XML de empleados
 * y redirige al usuario según su puesto o rol correspondiente.
 * 
 * @async
 * @function
 * @throws {Error} Lanza un error si falla la carga o el parseo del archivo XML.
 * @returns {Promise<void>} No retorna ningún valor, maneja la redirección o alertas en pantalla.
 */
document.getElementById("boton-login").addEventListener('click', async () => {

    /** @type {string} Contraseña ingresada por el usuario (sin espacios sobrantes). */
    const contra = document.getElementById("input-contra").value.trim();
    
    /** @type {string} Nombre de usuario ingresado (sin espacios sobrantes). */
    const user = document.getElementById("input-user").value.trim();

    //validamos campos vacíos 
    if (!user || !contra) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {

        /** 
         * Carga el archivo XML de empleados mediante una petición HTTP asíncrona.
         * @type {Response} 
         */
        const respuesta = await fetch("/data/xml/empleados.xml");
        console.log("Estado de la petición:", respuesta.status);

        /** @type {string} Contenido en texto plano del XML. */
        const textoXml = await respuesta.text();
        console.log("Contenido del XML:", textoXml);

        // parseo del xml a un objeto DOM para poder manipularlo
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textoXml, "application/xml");

        /** @type {HTMLCollectionOf<Element>} Colección de elementos <empleado> encontrados en el XML. */
        // obtenemos los elementos de empleado en xml 
        const listaEmpleados = xmlDoc.getElementsByTagName("empleado");

        /** 
         * Objeto para almacenar la información del empleado autenticado.
         * @type {{user: string, puesto: string} | null} 
         */
        let empleadoEncontrado = null;
        
        // iteración en la lista de empleados para encontrar coincidencias
        for (let i = 0; i < listaEmpleados.length; i++) {
            const usuarioXML = listaEmpleados[i].getElementsByTagName("usuario")[0].textContent.trim();
            const contraXML = listaEmpleados[i].getElementsByTagName("password")[0].textContent.trim();
            const puestoXML = listaEmpleados[i].getElementsByTagName("puesto")[0].textContent.trim();

            if (usuarioXML === user && contraXML === contra) {
                empleadoEncontrado = {
                    user: usuarioXML,
                    puesto: puestoXML.toLowerCase()
                };
                break;
            }
        }

        //redirección a la página correspondiente 
        if (empleadoEncontrado) {
            alert(`¡Bienvenid@, ${empleadoEncontrado.user}! `);

            switch (empleadoEncontrado.puesto) {
                case "administrador":
                    window.location.href = "admin.html"; //página pendiente
                    break;
                case "gerente":
                    window.location.href = "gerente.html";
                    break;
                case "empleado":
                    window.location.href = "empleado.html"; //página pendiente
                    break;
                default:
                    alert("Puesto no reconocido en el sistema.");
            }
        } else {
            alert("Usuario o contraseña incorrectos.");
        }

    } catch (error) {
        console.error("Error al leer el archivo XML:", error);
        alert("Ocurrió un error al intentar iniciar sesión. Por favor, inténtalo de nuevo.");
    }
});