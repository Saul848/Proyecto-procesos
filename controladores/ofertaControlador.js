const ofertaDao = require ("../dao/ofertaDao");
const productoDao = require ("../dao/productoDao");
const Oferta = require ("../clases/ofertaClass");

function listarOfertas(req, res){
    try{
        //lee las ofertas del xml
        const ofertas = ofertaDao.obtenerOfertas();

        //vemos el nombre del producto
        const productos = productoDao.obtenerProductos();

        const ofertasCompletas = ofertas.map (o => {
            const oferta = new Oferta(o);
            const producto = productos.find(p => String(p.id) === String(o.idProducto));
            return{
                ...oferta.toJSON(),
                nombreProducto: producto ? producto.nombre : "Producto no encontrado"
            };
        });
        res.json(ofertasCompletas);
    } catch (error){
        res.status(500).json({ ok: false, mensaje: "Error al listar ofertas.", error: error.message });
    }
}

function crearOferta(req, res){
    try{
        const { idProducto, tipoProm, valorDesc, cantidadRecibe, cantidadPaga, fechaInicio, fechaFin } = req.body;

        const idProductoStr = String(idProducto);
        //valida que el producto exista
        const productos = productoDao.obtenerProductos();
        const productoExiste = productos.some(p => p.id === idProducto);
        if (!productoExiste){
            return res.status(400).json({ ok: false, mensaje: "El producto seleccionado no existe." });
        }

        //genera el siguiente id
        const ofertas = ofertaDao.obtenerOfertas();
        const siguienteNumero = ofertas.length + 1;
        const id = `OF-${String(siguienteNumero).padStart(2, "0")}`;

        //crea instancia de Oferta
        const oferta = new Oferta({
            id,
            idProducto: idProductoStr,
            tipoProm,
            valorDesc: tipoProm === 'porcentaje' ? valorDesc : 1,
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