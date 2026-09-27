const ofertaDao = require ("../dao/ofertaDao");
const productoDao = require ("../dao/productoDao");
const Oferta = require ("../clases/ofertaClass");

function calcularEstado(fechaInicio, fechaFin){
    const hoy = new Date().toLocaleDateString('en-CA');
    if (hoy > fechaFin) return 'caducada';
    if (hoy < fechaInicio) return 'proxima';
    return 'disponible';
}

function listarOfertas(req, res){
    try{
        const ofertas = ofertaDao.obtenerOfertas();
        const productos = productoDao.obtenerProductos();

        const ofertasConProducto = ofertas.map(o => {
            const producto = productos.find(p => String(p.id) === String(o.idProducto));
            return {
                ...o,
                nombreProducto: producto ? producto.nombre : 'Producto no encontrado',
                estado: calcularEstado(o.fechaInicio, o.fechaFin)
            };
        });

        res.json(ofertasConProducto);
    } catch(error){
        res.status(500).json({ ok: false, mensaje: "Error al listar ofertas.", error: error.message });
    }
}

function crearOferta(req, res){
    try{
        const { idProducto, tipoProm, valorDesc, cantidadRecibe, cantidadPaga, fechaInicio, fechaFin } = req.body;

        const idProductoStr = String(idProducto);
        const productos = productoDao.obtenerProductos();
        const productoExiste = productos.some(p => String(p.id) === idProductoStr);
        if (!productoExiste){
            return res.status(400).json({ ok: false, mensaje: "El producto seleccionado no existe." });
        }

        if (tipoProm === 'porcentaje' && (Number(valorDesc) <= 0 || Number(valorDesc) > 100)){
            return res.status(400).json({ ok: false, mensaje: "El porcentaje debe estar entre 1 y 100." });
        }
        if ((tipoProm === 'precioFijo') && (isNaN(Number(valorDesc)) || Number(valorDesc) <= 0)){
            return res.status(400).json({ ok: false, mensaje: "El precio final debe ser un número mayor a 0." });
        }

        const ofertas = ofertaDao.obtenerOfertas();
        const yaTieneOferta = ofertas.some(o => String(o.idProducto) === idProductoStr);
        if (yaTieneOferta){
            return res.status(400).json({ ok: false, mensaje: "Este producto ya tiene una oferta asignada." });
        }

        const maxNumero = ofertas.reduce((max, o) => {
            const num = parseInt(o.id.replace('OF-', ''), 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        const id = `OF-${String(maxNumero + 1).padStart(2, "0")}`;

        //crea instancia de Oferta
        const oferta = new Oferta({
            id,
            idProducto: idProductoStr,
            tipoProm,
            valorDesc: tipoProm === 'porcentaje' || tipoProm === 'precioFijo' ? valorDesc : 1,
            cantidadRecibe: tipoProm === 'cantidad' ? cantidadRecibe : 1,
            cantidadPaga: tipoProm === 'cantidad' ? cantidadPaga : 1,
            fechaInicio,
            fechaFin
        });

        //guardamos en el xml
        ofertaDao.agregarOferta(oferta.toJSON());

        res.status(201).json({ ok: true, mensaje: "Oferta creada exitosamente.", oferta: oferta.toJSON() });
    } catch(error){
        res.status(400).json({ ok: false, mensaje: "Error al crear la oferta.", error: error.message });
    }
}

function eliminarOferta(req, res){
    try{
        const {id} = req.params;

        const resultado = ofertaDao.eliminarOferta(id);

        if(!resultado.encontrado){
            return res.status(404).json({ ok: false, mensaje: "Oferta no encontrada." });            
        }

        res.json({ ok: true, mensaje: `Oferta ${id} eliminada.` });
    } catch(error){
        res.status(500).json({ ok: false, mensaje: "Error al eliminar la oferta.", error: error.message });
    }
}

module.exports = {
    listarOfertas,
    crearOferta,
    eliminarOferta
};