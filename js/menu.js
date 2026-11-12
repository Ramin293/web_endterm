"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const { dishes, categories } = window.OrbitFood;
    const results = document.querySelector("#menu-results");
    const search = document.querySelector("#menu-search");
    const sort = document.querySelector("#menu-sort");
    const favoritesOnly = document.querySelector("#favorites-only");
    const categoryControls = document.querySelector("#menu-categories");
    const storageKey = "orbitfood.favorites.v1";
    let activeCategory = "all";
    let favorites = readFavorites();

    function storageNotice() {
        const notice = document.querySelector("#storage-status");
        notice.hidden = false;
        notice.textContent = "Favorites work for this visit, but browser storage is unavailable.";
    }

    function readFavorites() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
            return Array.isArray(saved) ? [...new Set(saved.filter(id => dishes.some(dish => dish.id === id)))] : [];
        } catch {
            storageNotice();
            return [];
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(favorites));
        } catch {
            storageNotice();
        }
    }

    function getVisibleDishes() {
        const query = search.value.trim().toLowerCase();
        const visible = dishes.filter(dish =>
            (activeCategory === "all" || dish.category === activeCategory) &&
            (!favoritesOnly.checked || favorites.includes(dish.id)) &&
            `${dish.name} ${dish.description}`.toLowerCase().includes(query)
        );
        if (sort.value === "price-asc") visible.sort((a, b) => a.price - b.price);
        if (sort.value === "price-desc") visible.sort((a, b) => b.price - a.price);
        if (sort.value === "name") visible.sort((a, b) => a.name.localeCompare(b.name));
        return visible;
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function createCard(dish) {
        const card = createElement("article", "food-card");
        card.id = dish.id;
        const image = createElement("img");
        image.src = `images/${dish.image}.jpg`;
        image.alt = dish.alt;
        image.width = 600;
        image.height = 400;
        image.loading = "lazy";
        const info = createElement("div", "food-info");
        const heading = createElement("h3");
        const link = createElement("a", "", dish.name);
        link.href = dish.href;
        heading.append(link);
        const bottom = createElement("div", "food-bottom");
        const action = createElement("a", "text-link", dish.id === "risotto" ? "View dish →" : "Order dish →");
        action.href = dish.href;
        bottom.append(createElement("span", "price", `$${dish.price}`), action);
        const favorite = createElement("button", "btn btn-outline-dark favorite-button", favorites.includes(dish.id) ? "Remove favorite" : "Save favorite");
        favorite.type = "button";
        favorite.dataset.favorite = dish.id;
        favorite.setAttribute("aria-label", `${favorite.textContent}: ${dish.name}`);
        favorite.setAttribute("aria-pressed", String(favorites.includes(dish.id)));
        info.append(heading, createElement("p", "", dish.description), bottom, favorite);
        card.append(image, info);
        return card;
    }

    function renderMenu() {
        const visible = getVisibleDishes();
        const fragment = document.createDocumentFragment();
        // Keep category and dish anchors used by existing pages working.
        for (const category of categories) {
            const items = visible.filter(dish => dish.category === category.id);
            if (!items.length) continue;
            const section = createElement("section", "menu-section");
            section.id = category.id;
            const grid = createElement("div", "food-grid");
            items.forEach(dish => grid.append(createCard(dish)));
            section.append(createElement("h2", "", category.heading), grid);
            fragment.append(section);
        }
        if (!visible.length) fragment.append(createElement("p", "panel", "No dishes match. Try another search or reset the filters."));
        results.replaceChildren(fragment);
        document.querySelector("#menu-status").textContent = `${visible.length} of ${dishes.length} dishes shown. ${favorites.length} favorites saved.`;
        document.querySelector("#favorites-count").textContent = favorites.length;
        document.querySelector("#clear-favorites").disabled = favorites.length === 0;
        categoryControls.querySelectorAll("button").forEach(button => {
            const selected = button.dataset.category === activeCategory;
            button.setAttribute("aria-pressed", String(selected));
            button.classList.toggle("btn-dark", selected);
            button.classList.toggle("btn-outline-dark", !selected);
        });
    }

    [{ id: "all", label: "All dishes" }, ...categories].forEach(category => {
        const button = createElement("button", "btn", category.label);
        button.type = "button";
        button.dataset.category = category.id;
        categoryControls.append(button);
    });
    categoryControls.addEventListener("click", event => {
        const button = event.target.closest("button[data-category]");
        if (!button) return;
        activeCategory = button.dataset.category;
        renderMenu();
    });
    results.addEventListener("click", event => {
        const button = event.target.closest("button[data-favorite]");
        if (!button) return;
        const id = button.dataset.favorite;
        const previousButtons = [...results.querySelectorAll("button[data-favorite]")];
        const previousIndex = previousButtons.indexOf(button);
        favorites = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
        saveFavorites();
        renderMenu();
        // Restore keyboard focus after replacing the cards, including removal in favorites view.
        const buttons = [...results.querySelectorAll("button[data-favorite]")];
        const target = buttons.find(item => item.dataset.favorite === id) || buttons[Math.min(previousIndex, buttons.length - 1)] || document.querySelector("#reset-menu");
        target.focus({ preventScroll: true });
    });
    search.addEventListener("input", renderMenu);
    sort.addEventListener("change", renderMenu);
    favoritesOnly.addEventListener("change", renderMenu);
    document.querySelector("#reset-menu").addEventListener("click", () => {
        search.value = "";
        sort.value = "default";
        favoritesOnly.checked = false;
        activeCategory = "all";
        renderMenu();
    });
    document.querySelector("#clear-favorites").addEventListener("click", () => {
        favorites = [];
        saveFavorites();
        renderMenu();
    });
    document.querySelector(".menu-tools").hidden = false;
    renderMenu();
    // Only known ASCII anchors are used by the existing site.
    const anchor = document.getElementById(location.hash.slice(1));
    if (anchor) anchor.scrollIntoView();
});
