"use strict";

class PickupCart {
    constructor(dishes, storage) {
        this.dishes = dishes;
        this.storage = storage;
        this.key = "orbitfood.cart.v1";
        const saved = storage.read(this.key, {});
        this.quantities = {};

        for (const dish of dishes) {
            if (Number.isInteger(saved?.[dish.id]) && validPortions(saved[dish.id])) {
                this.quantities[dish.id] = saved[dish.id];
            }
        }
    }

    setQuantity(id, quantity) {
        if (!this.dishes.some(dish => dish.id === id)) return;
        if (validPortions(quantity)) this.quantities[id] = Number(quantity);
        else delete this.quantities[id];
        this.storage.write(this.key, this.quantities);
    }

    items() {
        return this.dishes
            .filter(dish => this.quantities[dish.id])
            .map(dish => ({
                id: dish.id,
                name: dish.name,
                price: dish.price,
                quantity: this.quantities[dish.id]
            }));
    }

    total() {
        return this.items().reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
}
