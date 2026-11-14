"use strict";

class Dish {
    constructor({ id, category, name, price, description, image, alt, ingredients }) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.price = price;
        this.description = description;
        this.image = image;
        this.alt = alt;
        this.ingredients = ingredients;
        this.href = `dish.html?id=${id}`;
        this.orderHref = `order.html#${id}-choice`;
    }

    formatPrice() {
        return `$${this.price}`;
    }

    matches(query) {
        return `${this.name} ${this.description} ${this.ingredients.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase());
    }
}

// Shared catalog: the order page can reuse these IDs and numeric prices.
window.OrbitFood = {
    dishes: [
        new Dish({
            id: "toast", category: "starters", name: "Wild mushroom toast", price: 14,
            description: "Sourdough, thyme and a generous serving of mushrooms.",
            image: "toast", alt: "Toast topped with golden mushrooms and herbs",
            ingredients: ["Sourdough", "Wild mushrooms", "Thyme"]
        }),
        new Dish({
            id: "risotto", category: "mains", name: "Roasted pumpkin risotto", price: 18,
            description: "Creamy arborio rice, roasted pumpkin, sage and parmesan.",
            image: "risotto", alt: "Creamy risotto served on a white plate",
            ingredients: ["Arborio rice and vegetable stock", "Roasted pumpkin and fresh sage", "Butter and parmesan-style cheese"]
        }),
        new Dish({
            id: "fish", category: "mains", name: "Charred sea bass", price: 26,
            description: "Roasted vegetables, fresh herbs and a crisp golden skin.",
            image: "fish", alt: "Sea bass with roasted vegetables on a grey plate",
            ingredients: ["Sea bass", "Roasted vegetables", "Fresh herbs"]
        }),
        new Dish({
            id: "tart", category: "desserts", name: "Pear & almond tart", price: 10,
            description: "Pear, almond cream and a buttery pastry crust.",
            image: "tart", alt: "Fruit tart served with sliced pear and fresh mint",
            ingredients: ["Pear", "Almond cream", "Butter pastry"]
        })
    ],
    categories: [
        { id: "starters", label: "Starters", heading: "Start with something good" },
        { id: "mains", label: "Mains", heading: "The main event" },
        { id: "desserts", label: "Desserts", heading: "A sweet finish" }
    ]
};
