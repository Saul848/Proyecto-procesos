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
 * @name POST /login
 * @description Valida las credenciales de acceso para iniciar sesión en el sistema
 */
router.post("/login", empleadoController.loginEmpleado);

/**
 * @name GET /
 * @description Obtiene la lista de empleados en el sistema
 */
router.get("/", empleadoController.obtenerEmpleado);

/**
 * @name POST /
 * @description Agrega o modifica datos de empleados en el sistema
 */
router.post("/", empleadoController.agregarEmpleado);

module.exports = router;