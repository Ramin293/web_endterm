"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#recipe-search");
    const filter = document.querySelector("#recipe-filter");
    const query = document.querySelector("#recipe-query");
    const submit = form.querySelector("button");
    const spinner = document.querySelector("#recipe-spinner");
    const status = document.querySelector("#recipe-status");
    const retry = document.querySelector("#recipe-retry");
    const results = document.querySelector("#recipe-results");
    const api = new ApiClient("https://www.themealdb.com/api/json/v1/1/");
    const savedOnly = document.querySelector("#recipe-favorites");
    const savedCount = document.querySelector("#recipe-favorites-count");
    const pagination = document.querySelector("#recipe-pagination");
    const previous = document.querySelector("#recipe-prev");
    const next = document.querySelector("#recipe-next");
    const pageLabel = document.querySelector("#recipe-page");
    const modalElement = document.querySelector("#recipe-modal");
    const modal = new bootstrap.Modal(modalElement);
    const detailStatus = document.querySelector("#recipe-detail-status");
    const details = document.querySelector("#recipe-details");
    const storage = new StorageService(() => {
        document.querySelector("#recipe-storage-status").hidden = false;
    });
    const storageKey = "orbitfood.recipeFavorites.v1";
    const savedMeals = storage.read(storageKey, []);
    const favorites = new Map();
    if (Array.isArray(savedMeals)) {
        for (const meal of savedMeals) {
            if (meal && /^\d+$/.test(meal.idMeal) && typeof meal.strMeal === "string" &&
                typeof meal.strMealThumb === "string" && meal.strMealThumb.startsWith("https://www.themealdb.com/")) {
                favorites.set(meal.idMeal, meal);
            }
        }
    }
    const pageSize = 6;
    let searchResults = [];
    let page = 1;
    let detailRequest = 0;
    let searchMessage = "";
    let searchFailed = false;
    let lastSearch;
    let loading = false;

    function renderRecipes() {
        const meals = savedOnly.checked ? [...favorites.values()] : searchResults;
        const pageCount = Math.max(1, Math.ceil(meals.length / pageSize));
        page = Math.min(page, pageCount);
        const start = (page - 1) * pageSize;
        pagination.hidden = pageCount === 1;
        previous.disabled = page === 1;
        next.disabled = page === pageCount;
        pageLabel.textContent = `Page ${page} of ${pageCount}`;
        savedCount.textContent = favorites.size;
        status.textContent = savedOnly.checked
            ? (meals.length ? `Saved recipes: ${meals.length}.` : "No saved recipes yet.")
            : searchMessage;
        retry.hidden = savedOnly.checked || !searchFailed;
        const cards = document.createDocumentFragment();
        for (const meal of meals.slice(start, start + pageSize)) {
            const card = document.createElement("article");
            card.className = "food-card";

            const image = document.createElement("img");
            image.src = meal.strMealThumb;
            image.alt = "";
            image.loading = "lazy";

            const body = document.createElement("div");
            body.className = "food-info";
            const heading = document.createElement("h3");
            heading.className = "h5";
            const open = document.createElement("button");
            open.type = "button";
            open.className = "btn btn-link recipe-open text-start p-0 fw-bold";
            open.textContent = meal.strMeal;
            open.setAttribute("aria-haspopup", "dialog");
            open.addEventListener("click", () => showRecipe(meal, open));
            heading.append(open);

            const save = document.createElement("button");
            save.type = "button";
            save.className = "btn btn-outline-dark btn-sm";
            updateSaveButton(save, meal);
            save.addEventListener("click", () => {
                if (favorites.has(meal.idMeal)) favorites.delete(meal.idMeal);
                else favorites.set(meal.idMeal, meal);
                storage.write(storageKey, [...favorites.values()]);
                if (savedOnly.checked) {
                    renderRecipes();
                    savedOnly.focus();
                } else {
                    updateSaveButton(save, meal);
                    savedCount.textContent = favorites.size;
                }
            });
            body.append(heading, save);
            card.append(image, body);
            cards.append(card);
        }
        results.replaceChildren(cards);
    }

    function updateSaveButton(button, meal) {
        button.textContent = "Save recipe";
        button.setAttribute("aria-label", `Save recipe: ${meal.strMeal}`);
        button.setAttribute("aria-pressed", String(favorites.has(meal.idMeal)));
        button.classList.toggle("active", favorites.has(meal.idMeal));
    }

    async function showRecipe(meal, trigger) {
        const request = ++detailRequest;
        document.querySelector("#recipe-title").textContent = meal.strMeal;
        document.querySelector("#recipe-source").href = `https://www.themealdb.com/meal/${encodeURIComponent(meal.idMeal)}`;
        details.hidden = true;
        detailStatus.textContent = "Loading recipe…";
        modalElement.addEventListener("hidden.bs.modal", () => trigger.focus(), { once: true });
        modal.show();

        try {
            const data = await api.get("lookup.php", { i: meal.idMeal });
            if (request !== detailRequest) return;
            const recipe = data.meals?.[0];
            if (!recipe) throw new Error("Recipe not found");

            const ingredients = document.querySelector("#recipe-ingredients");
            ingredients.replaceChildren();
            for (let index = 1; index <= 20; index++) {
                const ingredient = recipe[`strIngredient${index}`]?.trim();
                if (!ingredient) continue;
                const measure = recipe[`strMeasure${index}`]?.trim();
                const item = document.createElement("li");
                item.textContent = [measure, ingredient].filter(Boolean).join(" ");
                ingredients.append(item);
            }
            if (!ingredients.children.length) {
                const item = document.createElement("li");
                item.textContent = "No ingredients listed.";
                ingredients.append(item);
            }
            document.querySelector("#recipe-instructions").textContent = recipe.strInstructions?.trim() || "No instructions available.";
            const video = document.querySelector("#recipe-video");
            const videoUrl = recipe.strYoutube?.trim() || "";
            video.hidden = !/^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(videoUrl);
            if (video.hidden) video.removeAttribute("href");
            else video.href = videoUrl;
            document.querySelector("#recipe-no-video").hidden = !video.hidden;
            detailStatus.textContent = "";
            details.hidden = false;
        } catch {
            if (request === detailRequest) {
                detailStatus.textContent = "Could not load recipe details. Close and reopen to try again.";
            }
        }
    }

    async function searchRecipes(search) {
        if (loading) return;

        loading = true;
        lastSearch = search;
        submit.disabled = true;
        retry.hidden = true;
        spinner.hidden = false;
        pagination.hidden = true;
        savedOnly.checked = false;
        savedOnly.disabled = true;
        searchResults = [];
        searchFailed = false;
        page = 1;
        results.replaceChildren();
        status.textContent = "Searching for recipes…";

        try {
            const data = await api.get("filter.php", { [search.filter]: search.term });
            const meals = data.meals === null ? [] : data.meals;
            if (!Array.isArray(meals)) throw new Error("Unexpected recipe data");

            searchResults = meals;
            searchMessage = meals.length
                ? `Recipes found: ${meals.length}.`
                : "No recipes found. Try another ingredient or cuisine.";
        } catch {
            searchMessage = "Could not load recipes. Check your connection and try again.";
            searchFailed = true;
        } finally {
            spinner.hidden = true;
            submit.disabled = false;
            savedOnly.disabled = false;
            loading = false;
            renderRecipes();
        }
    }

    query.addEventListener("input", () => query.setCustomValidity(""));
    form.addEventListener("submit", event => {
        event.preventDefault();
        let term = query.value.trim();
        if (!term) {
            query.setCustomValidity("Enter an ingredient or cuisine.");
            query.reportValidity();
            return;
        }

        term = term.replace(/\s+/g, " ");
        if (filter.value === "i") term = term.replace(/ /g, "_");
        searchRecipes({ filter: filter.value, term });
    });

    retry.addEventListener("click", () => {
        query.focus();
        searchRecipes(lastSearch);
    });
    modalElement.addEventListener("hide.bs.modal", () => { detailRequest++; });
    savedOnly.addEventListener("change", () => {
        page = 1;
        renderRecipes();
    });
    previous.addEventListener("click", () => {
        page--;
        renderRecipes();
        if (previous.disabled) next.focus();
    });
    next.addEventListener("click", () => {
        page++;
        renderRecipes();
        if (next.disabled) previous.focus();
    });
    renderRecipes();
    document.querySelector("#recipe-favorites-control").hidden = false;
    form.hidden = false;
});
