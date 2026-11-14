"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const { dishes, categories } = window.OrbitFood;
    const storage = new StorageService();
    const key = "orbitfood.recentDishes.v1";
    const limit = 4;
    const details = document.querySelector("#dish-details");
    const recent = document.querySelector("#recent-dishes");

    function readHistory() {
        const saved = storage.read(key, []);
        if (!Array.isArray(saved)) return [];
        return [...new Set(saved.filter(id => dishes.some(dish => dish.id === id)))].slice(0, limit);
    }

    function renderCards(list, items) {
        for (const dish of items) {
            const card = document.createElement("article");
            card.className = "food-card";
            const image = document.createElement("img");
            image.src = `images/${dish.image}.jpg`;
            image.alt = dish.alt;
            image.width = 600;
            image.height = 400;
            image.loading = "lazy";

            const info = document.createElement("div");
            info.className = "food-info";
            const heading = document.createElement("h3");
            const link = document.createElement("a");
            link.href = dish.href;
            link.textContent = dish.name;
            const price = document.createElement("span");
            price.className = "price";
            price.textContent = dish.formatPrice();

            heading.append(link);
            info.append(heading, price);
            card.append(image, info);
            list.append(card);
        }
    }

    if (details) {
        const id = new URLSearchParams(location.search).get("id") ?? "risotto";
        const dish = dishes.find(item => item.id === id);
        if (!dish) {
            document.querySelector("#dish-name").textContent = "Dish not found";
            document.querySelector("#dish-missing").hidden = false;
            return;
        }

        document.title = `${dish.name} | OrbitFood`;
        document.querySelector("#dish-name").textContent = dish.name;
        document.querySelector("#dish-price").textContent = dish.formatPrice();
        document.querySelector("#dish-description").textContent = dish.description;
        document.querySelector("#dish-category").textContent = categories.find(category => category.id === dish.category).label;
        document.querySelector("#dish-order").href = dish.orderHref;

        const image = document.querySelector("#dish-image");
        image.src = `images/${dish.image}.jpg`;
        image.alt = dish.alt;
        const ingredients = document.querySelector("#dish-ingredients");
        for (const ingredient of dish.ingredients) {
            const item = document.createElement("li");
            item.textContent = ingredient;
            ingredients.append(item);
        }
        details.hidden = false;
        renderCards(document.querySelector("#related-list"), dishes.filter(item => item.id !== id));
        document.querySelector("#related-dishes").hidden = false;

        const history = readHistory().filter(savedId => savedId !== id);
        storage.write(key, [id, ...history].slice(0, limit));
    }

    if (recent) {
        const list = document.querySelector("#recent-list");
        const status = document.querySelector("#recent-status");

        function renderHistory() {
            const history = readHistory();
            list.replaceChildren();
            renderCards(list, history.map(id => dishes.find(dish => dish.id === id)));
            recent.hidden = history.length === 0;
        }

        document.querySelector("#clear-recent").addEventListener("click", () => {
            if (storage.remove(key)) {
                renderHistory();
                document.querySelector("#featured .section-head a").focus();
                status.textContent = "Recently viewed dishes cleared.";
            } else {
                status.classList.remove("visually-hidden");
                status.classList.add("container");
                status.textContent = "Could not clear the history. Browser storage is unavailable.";
            }
        });
        window.addEventListener("pageshow", renderHistory);
        window.addEventListener("storage", event => {
            if (event.key === key || event.key === null) renderHistory();
        });
        renderHistory();
    }
});
