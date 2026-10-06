/**
 * Express router para la gestion de alumnos y sus experiencias.
 * 
 * 
 */

const express = require("express");
const router = express.Router();

const empleadoController = require("../controladores/empleadoController");
/**
 * @name GET /reporte-desempeno
 * @description Obtiene el reporte de desempeño y candidatos a promoción de los empleados
 */
router.get("/reporte-desempeno", empleadoController.getReporteDesempeno);

/**
 * @name GET /historial
 * @description Obtiene el historial de registros de los empleados
 */
router.get("/historial", empleadoController.enviarHistorial);

/**
 * @name POST /login
 * @description Valida las credenciales de acceso para iniciar sesión en el sistema
 */
router.post("/login", empleadoController.loginEmpleado);

/**
 * @name GET /
 * @description Obtiene la lista de empleados en el sistema
 */
router.get("/", empleadoController.obtenerEmpleados);

/**
 * @name POST /
 * @description Agrega datos de empleados en el sistema
 */
router.post("/", empleadoController.agregarEmpleado);


/**
 * @name DELETE /
 * @description Elimina a un empleados en el sistema
 */
router.delete("/", empleadoController.eliminarEmpleado);

/**
 * @name PUT /
 * @description Modifica a un empleados en el sistema
 */
router.put("/", empleadoController.modificarEmpleado);

module.exports = router;