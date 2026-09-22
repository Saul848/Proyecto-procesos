/**
 * Express router para la gestion de alumnos y sus experiencias.
 * 
 * 
 */

const express = require("express");
const router = express.Router();

const empleadoController = require("../controladores/empleadoController");

/**
 * @name GET /
 * @description Obtiene la lista de empleados en el sistema
 */
router.get("/", empleadoController.obtenerEmpleados);

/**
 * @name POST /
 * @description Agrega o modifica datos de empleados en el sistema
 */
router.post("/", empleadoController.agregarEmpleado);


/**
 * @name DELETE /
 * @description Elimina a un empleados en el sistema
 */
router.delete("/", empleadoController.eliminarEmpleado);



module.exports = router;