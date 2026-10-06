const express = require('express');
const router = express.Router();
const transaccionControlador = require('../controladores/transaccionControlador');

// Endpoint para procesar una nueva recarga o pago de servicio
router.post('/', transaccionControlador.registrarTransaccion);

// Endpoint para listar transacciones registradas (historial o consultas)
router.get('/', transaccionControlador.listarTransacciones);

module.exports = router;