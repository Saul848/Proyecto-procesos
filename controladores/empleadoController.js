/**
 * Realiza verificaciones del lado del servidor para
 * las operaciones relacionadas con los empleados
 * 
 * @module empleadoController
 */

const empleadoDao = require("../dao/empleadoDao");
/**
 * Funcion que verifica si se obtuvieron los datos de los empleados del lado del servidor
 * Regresa un arreglo de empleados con objetos js.
 * @param {Object} req - Objeto de petición HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {res} Respuesta con los datos de los empleados
 * @returns {error} Si no se pudieron recuperar los datos de los empleados
 */
exports.obtenerEmpleado = async (req, res) => {
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

        // Se establecen los patrones para validar la informacion mandada
        let patronId = /^[1-9][0-9]*$/;
        let patronNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\x20]+$/;
        let patronTel = /^[0-9]{10}$/;
        let patronContraseña = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúñÑ\x20]+$/;
        let roles = ["empleado", "administrador", "gerente"];

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
        if (!patronContraseña.test(usuario)) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario no es valido"
            });
        }

        // Si la contraseña no respeta el patron se envia un mensaje de error
        if (!patronContraseña.test(password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "La contraseña no es valida"
            });
        }

        // Verificaremos si el empleado a agregar ya existe en el sistema
        const empleadoExistente = await empleadoDao.obtenerEmpleado(id);

        // Si el empleado ya existe, se sobreescriben sus datos
        if (empleadoExistente) {
            const empleadoActualizado = await empleadoDao.actualizarDatos(req.body);
            // Validamos que se hayan modificado los datos del empleado
            if (empleadoActualizado.ok) {
                return res.status(201).json({
                    ok: true,
                    mensaje: "Empleado modificado correctamente"
                });
            } else {
                return res.status(500).json({
                    ok: false,
                    mensaje: "No se pudo actualizar el empleado"
                });
            }
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

        // Buscamos si coincide el usuario y la contraseña
        const empleadoEncontrado = empleados.find(
            e => e.usuario === usuario && e.password === password
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
                puesto: empleadoEncontrado.puesto.toLowerCase()
            }
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: "Error al intentar iniciar sesión"
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
