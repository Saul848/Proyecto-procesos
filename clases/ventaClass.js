class Venta {
    constructor(id, idEmpleado, items = [], total = 0, fecha = new Date()) {
        this.id = id;
        this.idEmpleado = idEmpleado;
        this.items = items;
        this.total = total;
        this.fecha = fecha;
        
    }
}

module.exports = Venta;