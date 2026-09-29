const accesoDao = require("../dao/accesoDao");

exports.registrarAcceso = async(req, res) => {
    try{
        const {nombre, usuario, puesto, evento} = req.body;

        if(!usuario || !evento){
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario y el evento son obligatorios"
            });
        }

        const resultado = await accesoDao.registrarAcceso(nombre, usuario, puesto, evento);

        if(resultado.ok){
            return res.status(200).json({
                ok: true,
                mensaje: "Acceso registrado correctamente"
            });
        }

    } catch(error){
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al registrar el acceso"
        });
    }
};

exports.obtenerAccesos = async(req, res) => {
    try{
        const accesos = await accesoDao.obtenerAccesos();

        return res.status(200).json({
            ok: true,
            mensaje: "Accesos obtenidos correctamente",
            data: accesos
        });
    }catch(error){
        return res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor al obtener los accesos"
        });
    }
};