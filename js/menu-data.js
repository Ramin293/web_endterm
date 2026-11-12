"use strict";

class Dish {
    constructor({ id, category, name, price, description, image, alt, href }) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.price = price;
        this.description = description;
        this.image = image;
        this.alt = alt;
        this.href = href;
    }

    formatPrice() {
        return `$${this.price}`;
    }

    matches(query) {
        return `${this.name} ${this.description}`.toLowerCase().includes(query.trim().toLowerCase());
    }
}

// Shared catalog: the order page can reuse these IDs and numeric prices.
window.OrbitFood = {
    dishes: [
        new Dish({ id: "toast", category: "starters", name: "Wild mushroom toast", price: 14, description: "Sourdough, thyme and a generous serving of mushrooms.", image: "toast", alt: "Toast topped with golden mushrooms and herbs", href: "order.html#toast-choice" }),
        new Dish({ id: "risotto", category: "mains", name: "Roasted pumpkin risotto", price: 18, description: "Creamy arborio rice, roasted pumpkin, sage and parmesan.", image: "risotto", alt: "Creamy risotto served on a white plate", href: "dish.html" }),
        new Dish({ id: "fish", category: "mains", name: "Charred sea bass", price: 26, description: "Roasted vegetables, fresh herbs and a crisp golden skin.", image: "fish", alt: "Sea bass with roasted vegetables on a grey plate", href: "order.html#fish-choice" }),
        new Dish({ id: "tart", category: "desserts", name: "Pear & almond tart", price: 10, description: "Pear, almond cream and a buttery pastry crust.", image: "tart", alt: "Fruit tart served with sliced pear and fresh mint", href: "order.html#tart-choice" })
    ],
    categories: [
        { id: "starters", label: "Starters", heading: "Start with something good" },
        { id: "mains", label: "Mains", heading: "The main event" },
        { id: "desserts", label: "Desserts", heading: "A sweet finish" }
    ]
};
