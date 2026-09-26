/**
 * Representa una Oferta
 */
class Oferta{
    #id;
    #idProducto;
    #tipoProm;
    #valorDesc;
    #cantidadRecibe;
    #cantidadPaga;
    #fechaInicio;
    #fechaFin;

    constructor({ id = null, idProducto = "", tipoProm = "", valorDesc = 0, cantidadRecibe = 0, cantidadPaga = 0, fechaInicio = "", fechaFin = "" } = {}){
        this.id = id ? String(id) : null;
        this.idProducto = String(idProducto);
        this.tipoProm = tipoProm;
        this.valorDesc = valorDesc;
        this.cantidadRecibe = Number(cantidadRecibe);
        this.cantidadPaga = Number(cantidadPaga);
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
    }

    get id(){
        return this.#id;
    }

    get idProducto(){
        return this.#idProducto;
    }

    get tipoProm(){
        return this.#tipoProm;
    }

    get valorDesc(){
        return this.#valorDesc;
    }

    get fechaInicio(){
        return this.#fechaInicio;
    }

    get fechaFin(){
        return this.#fechaFin;
    }
    
    set id(id){
        this.#id = id ? String(id):null;
    }

    set idProducto(idProducto){ 
        this.#idProducto = String(idProducto); 
    }

    set tipoProm(tipo){
        const permitidos = ["porcentaje", "cantidad", "precioFijo"];
        if (!permitidos.includes(tipo)){
            throw new Error("Tipo de promoción no válido. Usa: porcentaje, cantidad o precio fijo.");
        }
        this.#tipoProm = tipo;
    }

    set valorDesc(valorDesc){
        const cant = Number(valorDesc);
        if (isNaN(cant) || cant <= 0 || cant > 100){
            throw new Error("El valor de descuento debe ser un número entre 0 y 100.")
        }
        this.#valorDesc = cant;
    }

    set cantidadRecibe(cant){
        const n = Number(cant);
        if (isNaN(n) || n <= 0){
            throw new Error("La cantidad que recibe debe ser un número mayor a 0.");
        }
        this.#cantidadRecibe = n;
    }

    set cantidadPaga(cant){
        const n = Number(cant);
        if (isNaN(n) || n <= 0){
            throw new Error("La cantidad que paga debe ser un número mayor a 0.");
        }

        this.#cantidadPaga = n;
    }

    set fechaInicio(fecha){
        const fechaI = String(fecha);
        if (!fechaI){
            throw new Error("La fecha de inicio es obligatoria.");
        }

        const hoy = new Date().toLocaleDateString('en-CA');
        if (fechaI < hoy){
            throw new Error("La fecha de inicio no puede ser anterior a la fecha actual.")
        }

        this.#fechaInicio = fechaI;
    }
    
    set fechaFin(fecha){
        const fechaF = String(fecha);
        if (!fechaF){
            throw new Error("La fecha de fin es obligatoria.");
        }
        if (this.#fechaInicio && fechaF < this.#fechaInicio){
            throw new Error("La fecha de fin no puede ser anterior a la de inicio.");
        }
        this.#fechaFin = fechaF;
    }

    /**
     * Calcula el estado de una oferta, si está disponible, caducada o próxima.
     * @returns Si la oferta está disponible.
     */
    estado(){
        const hoy = new Date().toLocaleDateString('en-CA');
        if (hoy > this.#fechaFin) return "caducada";
        if (hoy < this.#fechaInicio) return "proxima";
        return "disponible";
    }

    toJSON(){
        return{
            id: this.#id,
            idProducto: this.#idProducto,
            tipoProm: this.#tipoProm,
            valorDesc: this.#valorDesc,
            cantidadRecibe: this.#cantidadRecibe,
            cantidadPaga: this.#cantidadPaga,
            fechaInicio: this.#fechaInicio,
            fechaFin: this.#fechaFin,
            estado: this.estado()
        };
    }
}

module.exports = Oferta;