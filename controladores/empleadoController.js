/**
 * Realiza verificaciones del lado del servidor para
 * las operaciones relacionadas con los empleados
 * 
 * @module empleadoController
 */

//Patrones para verificar informacion enviada en forma de solicitud
    // Se establecen los patrones para validar la informacion mandada
    const patronId = /^[1-9][0-9]*$/;
    const patronNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\x20]+$/;
    const patronTel = /^[0-9]{10}$/;
    const patronPassword = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ\x20]+$/;
    const roles = ["empleado", "administrador", "gerente"];

const empleadoDao = require("../dao/empleadoDao");

/**
 * Funcion que verifica si se obtuvieron los datos de los empleados del lado del servidor
 * Regresa un arreglo de empleados con objetos js.
 * @param {Object} req - Objeto de petición HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {res} Respuesta con los datos de los empleados
 * @returns {error} Si no se pudieron recuperar los datos de los empleados
 */
exports.obtenerEmpleados = async (req, res) => {
    try {
        //Guardamos en un arreglo los datos de los empleados
        const empleados = await empleadoDao.obtenerEmpleados();

        //Verificar que se hayan recuperado estos datos correctamente
        if (!empleados) {
            return res.status(404).json({
                ok: false,
                mensaje: "No se encontraron empleados en el sistema",
            });
        }
        //Si hubo exito en la recuperacion se mandaran mediante una respuesta en formato json
        return res.status(200).json({
            ok: true,
            mensaje: "Datos encontrados",
            data: empleados
        });
    } catch (error) {
        //Resuelve ante cualquier error
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al intentar obtener los datos de los empleados"
        });
    }
};


/**
 * Funcion que verifica las altas de empleados en el sistema
 * Regresa una respuesta al cliente de exito o error
 * @param {Object} req - Objeto de petición HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {res} Respuesta con un mensaje de confirmacion
 * @returns {error} Si no pudo dar de alta a un empleado
 */
exports.agregarEmpleado = async (req, res) => {
    try {
        // Se obtienen los datos de la solicitud
        const { id, nombre, puesto, telefono, usuario, password } = req.body;

        // Se verifica que ninguno de los datos este vacio
        if (!id || !nombre || !puesto || !telefono || !usuario || !password) {
            return res.status(400).json({
                ok: false,
                mensaje: "Todos los datos del formulario son obligatorios"
            });
        }

        // Verificamos que el id sea correcto
        if (!patronId.test(id)) {
            return res.status(400).json({
                ok: false,
                mensaje: "El id no es valido, debe ser un numero entero positivo"
            });
        }

        // Si el nombre no respeta el patron se envia un mensaje de error
        if (!patronNombre.test(nombre)) {
            return res.status(400).json({
                ok: false,
                mensaje: "El nombre no debe llevar numeros o simbolos"
            });
        }

        // Si el rol de la solicitud no existe entonces se envia un mensaje de error
        if (!roles.includes(puesto)) {
            return res.status(400).json({
                ok: false,
                mensaje: "El rol solicitado no existe"
            });
        }

        // Si el telefono no respeta el patron se envia un mensaje de error
        if (!patronTel.test(telefono)) {
            return res.status(400).json({
                ok: false,
                mensaje: "El telefono debe llevar 10 digitos"
            });
        }

        // Si el usuario no respeta el patron se envia un mensaje de error
        if (!patronPassword.test(usuario)) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario no es valido"
            });
        }

        // Si la contraseña no respeta el patron se envia un mensaje de error
        if (!patronPassword.test(password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "La contraseña no es valida"
            });
        }

        // Verificaremos si el empleado a agregar ya existe en el sistema
        const empleadoExistente = await empleadoDao.obtenerEmpleado(id);
        // Si el empleado ya existe se envia un mensaje de error
        if (empleadoExistente) {
            return res.status(404).json({
                ok: false,
                mensaje: "Error el empleado ya existe dentro del sistema"
            });
        //Si el empleado no existe, se agrega a la base de datos
        } else {
            const empleadoCreado = await empleadoDao.agregarEmpleado(req.body);
            // Validamos que se haya creado el nuevo empleado
            if (empleadoCreado.ok) {
                return res.status(201).json({
                    ok: true,
                    mensaje: "Empleado agregado correctamente"
                });
            } else {
                return res.status(400).json({
                    ok: true,
                    mensaje: "El empleado no se pudo agregar"
                });
            }
        }
    } catch (error) {
        // Resolucion en caso de error
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al guardar los datos del empleado"
        });
    }
};

/**
 * Valida las credenciales de inicio de sesión de un empleado.
 * @param {Object} req - Objeto de petición HTTP con usuario y password en el body.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
exports.loginEmpleado = async (req, res) => {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({
                ok: false,
                mensaje: "Por favor, completa todos los campos."
            });
        }

        // Obtenemos los empleados desde el DAO (el servidor lee el XML de forma segura)
        const empleados = await empleadoDao.obtenerEmpleados();
        if (!Array.isArray(empleados)) empleados = [empleados];
        
        // Buscamos si coincide el usuario y la contraseña
        const empleadoEncontrado = empleados.find(
            e => String(e.usuario) === usuario && String(e.password) === password
        );
        

        if (!empleadoEncontrado) {
            return res.status(401).json({
                ok: false,
                mensaje: "Usuario o contraseña incorrectos."
            });
        }

        // Si coincide, regresamos los datos necesarios para la sesión
        return res.status(200).json({
            ok: true,
            mensaje: "Autenticación exitosa.",
            data: {
                nombre: empleadoEncontrado.nombre,
                puesto: empleadoEncontrado.puesto.toLowerCase(),
                usuario: empleadoEncontrado.usuario
            }
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: "Error al intentar iniciar sesión"
        })
    }
}

/*
 * 
 * Funcion que responde al cliente, valida el id enviado en el req
 * y regresa una respuesta cuando se elimina a un empleado
 * @param {Object} req - Objeto de petición HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {res} Respuesta
 * @returns {error} Si no se pudieron recuperar los datos de los empleados
 */
exports.eliminarEmpleado = async (req, res) => {
    try {
        //Obtenemos el id
        const { id } = req.body;

        //Si mi id no tiene valor o si no es un entero
        if(!id || !Number.isInteger(id)){
            return res.status(404).json({
                ok: false,
                mensaje: "Error el id del usuario no es valido"
            })
        }

        const empleadoEliminado = await empleadoDao.eliminarEmpleado(id);
        if(empleadoEliminado.ok){
            return res.status(201).json({
                ok: true,
                mensaje: "Empleado eliminado correctamente"
            })
        }else{
            return res.status(400).json({
                ok: false,
                mensaje: "No existen empleados para eliminar"
            })
        }
    } catch (error) {
        //Resuelve ante cualquier error
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al intentar eliminar los datos del empleado"
        });
    }
};

exports.getReporteDesempeno = async (req, res) =>{
    try{
        const resultado = empleadoDao.obtenerReporteDesempeno();
        res.json(resultado);

    }catch(error){
        res.status(500).json({ok: false, mensaje: "error al obtener el reporte de desempeño"});

    }
};
/**
 * Funcion que responde ante una solicitud de modificacion
 * Verifica la informacion enviada por el cliente
 * Regresa una respuesta al cliente de exito o error
 * @param {Object} req - Objeto de petición HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {res} Respuesta con un mensaje de confirmacion
 * @returns {error} Si no pudo modificar a un empleado a un empleado
 */
exports.modificarEmpleado = async (req, res) => {
    try {
        // Se obtienen los datos de la solicitud
        const { id, nombre, puesto, telefono, usuario, password } = req.body;
        //Se verifica que el cliente haya enviado un id
        if(id===""){
            return res.status(404).json({
                ok: false,
                mensaje: "El id enviado esta vacio o es indefindo"
            })
        }
        //Se verifica que el empleado exista en la bd
        if(!(await empleadoDao.obtenerEmpleado(id))){
            return res.status(404).json({
                ok: false,
                mensaje: "El empleado no existe en la bd"
            })
        }
        //Si existe mi empleado entonces se crea un arreglo para guardar los datos recuperados con contenido
        let datosNuevos = [];

        //Verificamos que los datos recuperados tengan un valor y lo agregamos a un arreglo "Datos nuevos"

        if (nombre !== "") datosNuevos.push({ campo: 'nombre', valor: nombre });
        if (puesto !== "") datosNuevos.push({ campo: 'puesto', valor: puesto });
        if (telefono !== "") datosNuevos.push({ campo: 'telefono', valor: telefono });
        if (usuario !== "") datosNuevos.push({ campo: 'usuario', valor: usuario });
        if (password !== "") datosNuevos.push({ campo: 'password', valor: password });

        //Se verifica la informacion del empleado, esto recorriendo el arreglo datosNuevos he identificando los valores, 
        for(let m=0;m<datosNuevos.length;m++){
            //Identificamos los campos de los objetos js y verificamos su valor
            if(datosNuevos[m].campo==='nombre'){
                //Si el nuevo nombre no es valido entonces se envia un mensaje de error
                if(!patronNombre.test(datosNuevos[m].valor)){
                    return res.status(404).json({
                        ok: false,
                        mensaje: "El nuevo nombre no es valido"
                    })
                }
            }
            if(datosNuevos[m].campo==='puesto'){
                //Si el nuevo puesto no es alguno de los existentes entonces se envia un mensaje de error
                if(!roles.includes(datosNuevos[m].valor)){
                    return res.status(404).json({
                        ok: false,
                        mensaje: "El nuevo puesto no es valido"
                    })
                }
            }
            if(datosNuevos[m].campo==='telefono'){
                //Si el nuevo telefono no es valido entonces se envia un mensaje de error 
                if(!patronTel.test(datosNuevos[m].valor)){
                    return res.status(404).json({
                        ok: false,
                        mensaje: "El nuevo telefono no es valido"
                    })
                }
            }
            if(datosNuevos[m].campo==='usuario'){
                //Si la nueva contraseña no es valida entonces se envia un mensaje de error 
                if(!patronPassword.test(datosNuevos[m].valor)){
                    return res.status(404).json({
                        ok: false,
                        mensaje: "El nuevo usuario no es valido"
                    })
                }
            }
            if(datosNuevos[m].campo==='password'){
                //Si la nueva no es valido entonces se envia un mensaje de error 
                if(!patronPassword.test(datosNuevos[m].valor)){
                    return res.status(404).json({
                        ok: false,
                        mensaje: "La nueva contraseña no es valida"
                    })
                }
            }
        }
        //Se actualiza al empleado, utilizando el arreglo de datosNuevos que tiene toda la informacion necesaria para actualizar al empleado
        const empleadoActualizado= await empleadoDao.actualizarEmpleado(id, datosNuevos);
            // Validamos que se hayan modificado los datos del empleado
            if (empleadoActualizado.ok) {
                return res.status(201).json({
                    ok: true,
                    mensaje: "Empleado modificado correctamente"
                });
            } else {
                return res.status(500).json({
                    ok: false,
                    mensaje: "No se pudo actualizar al empleado"
                });
            }
    } catch (error) {
        // Resolucion en caso de error
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al modificar los datos del empleado"
        });
    }
};
