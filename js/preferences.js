"use strict";

(() => {
    const storage = new StorageService();
    const key = "orbitfood.preferences.v1";
    const sizes = [87.5, 100, 112.5, 125];
    const saved = storage.read(key, null);
    let theme = saved?.theme === "dark" ? "dark" : "light";
    let size = sizes.includes(saved?.size) ? saved.size : 100;
    const root = document.documentElement;

    function applyPreferences() {
        root.dataset.bsTheme = theme;
        root.style.fontSize = `${size}%`;
    }

    applyPreferences();

    document.addEventListener("DOMContentLoaded", () => {
        const controls = document.querySelector("#display-preferences");
        const toggle = document.querySelector("#theme-toggle");
        const decrease = document.querySelector("#font-decrease");
        const increase = document.querySelector("#font-increase");
        const status = document.querySelector("#font-status");

        function updateControls() {
            toggle.setAttribute("aria-pressed", String(theme === "dark"));
            decrease.setAttribute("aria-disabled", String(size === sizes[0]));
            increase.setAttribute("aria-disabled", String(size === sizes[sizes.length - 1]));
            status.textContent = `Text size: ${size}%`;
        }

        function savePreferences() {
            applyPreferences();
            updateControls();
            storage.write(key, { theme, size });
        }

        function changeSize(step) {
            const nextSize = sizes[sizes.indexOf(size) + step];
            if (nextSize === undefined) return;
            size = nextSize;
            savePreferences();
        }

        toggle.addEventListener("click", () => {
            theme = theme === "dark" ? "light" : "dark";
            savePreferences();
        });
        decrease.addEventListener("click", () => changeSize(-1));
        increase.addEventListener("click", () => changeSize(1));
        updateControls();
        controls.hidden = false;
    });
})();
