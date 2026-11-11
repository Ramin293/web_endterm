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
    let lastSearch;
    let loading = false;

    function renderRecipes(meals) {
        const cards = document.createDocumentFragment();
        for (const meal of meals) {
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
            const link = document.createElement("a");
            link.href = `https://www.themealdb.com/meal/${encodeURIComponent(meal.idMeal)}`;
            link.textContent = meal.strMeal;
            heading.append(link);
            body.append(heading);
            card.append(image, body);
            cards.append(card);
        }
        results.replaceChildren(cards);
    }

    async function searchRecipes(search) {
        if (loading) return;

        loading = true;
        lastSearch = search;
        submit.disabled = true;
        retry.hidden = true;
        spinner.hidden = false;
        results.replaceChildren();
        status.textContent = "Searching for recipes…";

        const url = new URL("https://www.themealdb.com/api/json/v1/1/filter.php");
        url.searchParams.set(search.filter, search.term);

        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
            if (!response.ok) throw new Error("Recipe request failed");

            const data = await response.json();
            const meals = data.meals === null ? [] : data.meals;
            if (!Array.isArray(meals)) throw new Error("Unexpected recipe data");

            renderRecipes(meals);
            status.textContent = meals.length
                ? `Recipes found: ${meals.length}.`
                : "No recipes found. Try another ingredient or cuisine.";
        } catch {
            status.textContent = "Could not load recipes. Check your connection and try again.";
            retry.hidden = false;
        } finally {
            spinner.hidden = true;
            submit.disabled = false;
            loading = false;
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
    form.hidden = false;
});
