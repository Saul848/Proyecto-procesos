const express = require('express');
const router = express.Router();
const mensajesController = require('../controladores/mensajesController');

router.post('/', mensajesController.agregarMensaje);

router.post('/verMensajes', mensajesController.leerMensajes);

module.exports = router;