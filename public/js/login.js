/**
 * @file login.js
 * @description Script encargado de gestionar el evento de inicio de sesión del usuario,
 * realizando una petición asíncrona al servidor para validar credenciales y gestionar roles.
 */

/**
 * Evento que se ejecuta al hacer clic en el botón de inicio de sesión.
 * Envía las credenciales ingresadas al servidor, valida la respuesta y redirige 
 * al usuario según el puesto o rol correspondiente.
 * 
 * @async
 * @function
 * @throws {Error} Lanza un error si falla la comunicación de red con el servidor.
 * @returns {Promise<void>} No retorna ningún valor, maneja la redirección o alertas en pantalla.
 */
document.getElementById("boton-login").addEventListener('click', async () => {

    /** @type {string} Contraseña ingresada por el usuario. */
    const password = document.getElementById("input-contra").value.trim();
    
    /** @type {string} Nombre de usuario ingresado. */
    const usuario = document.getElementById("input-user").value.trim();

    // Validamos que no existan campos vacíos antes de enviar la petición
    if (!usuario || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        /** 
         * Petición HTTP POST asíncrona hacia la API del servidor para validar el acceso.
         * @type {Response} 
         */
        const respuesta = await fetch("/api/empleados/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario: usuario, password: password })
        });

        /** 
         * Objeto JSON con la respuesta obtenida del controlador en el servidor.
         * @type {{ok: boolean, mensaje: string, data?: {nombre: string, puesto: string}}} 
         */
        const resultado = await respuesta.json();

        // Verificamos si la autenticación fue exitosa
        if (resultado.ok) {
            // Guardamos la información limpia de la sesión en el almacenamiento del navegador 
            sessionStorage.setItem("nombreUsuario", resultado.data.nombre);
            sessionStorage.setItem("puestoLogueado", resultado.data.puesto);
            sessionStorage.setItem("usuarioLogueado", empleadoEncontrado.user);

            alert(`¡Bienvenid@, ${resultado.data.nombre}!`);

            // Redirección dinámica según el puesto obtenido desde el servidor
            switch (resultado.data.puesto) {
                case "administrador":
                    window.location.href = "administrador.html";
                    break;
                case "gerente":
                    window.location.href = "gerente.html";
                    break;
                case "empleado":
                    window.location.href = "empleado.html";
                    break;
                default:
                    alert("Puesto no reconocido en el sistema.");
            }
        } else {
            // Mostramos el mensaje de error enviado por el servidor (ej. credenciales inválidas)
            alert(resultado.mensaje);
        }

    } catch (error) {
        console.error("Error en la petición de inicio de sesión:", error);
        alert("Ocurrió un error al intentar conectar con el servidor. Por favor, inténtalo de nuevo.");
    }
});