class Producto {
    // Atributos privados
    #id;
    #nombre;
    #descripcion;
    #precio;
    #stock;

    constructor({ id = null, nombre = "", descripcion = "", precio = 0, stock = 0 } = {}) {
        this.#id = id ? String(id) : null;
        this.#nombre = String(nombre);
        this.#descripcion = String(descripcion);
        this.#precio = Number(precio);
        this.#stock = Number(stock);
    }

    // Getters
    get id() {
        return this.#id;
    }

    get nombre() {
        return this.#nombre;
    }

    get descripcion() {
        return this.#descripcion;
    }

    get precio() {
        return this.#precio;
    }

    get stock() {
        return this.#stock;
    }

    // Setters
    set id(id) {
        this.#id = id ? String(id) : null;
    }

    set nombre(nombre) {
        this.#nombre = String(nombre);
    }

    set descripcion(descripcion) {
        this.#descripcion = String(descripcion);
    }

    set precio(precio) {
        const valor = Number(precio);
        if (isNaN(valor) || valor < 0) {
            throw new Error("El precio debe ser un número válido mayor o igual a 0.");
        }
        this.#precio = valor;
    }

    set stock(stock) {
        const valor = Number(stock);
        if (!Number.isInteger(valor) || valor < 0) {
            throw new Error("El stock debe ser un número entero mayor o igual a 0.");
        }
        this.#stock = valor;
    }

    // Método toJSON
    toJSON() {
        return {
            id: this.#id,
            nombre: this.#nombre,
            descripcion: this.#descripcion,
            precio: Number(this.#precio.toFixed(2)),
            stock: this.#stock
        };
    }
}

module.exports = Producto;