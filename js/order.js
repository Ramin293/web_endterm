"use strict";

const orderForm = document.getElementById("order-form");
const cartItems = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartStatus = document.getElementById("cart-status");
const cartError = document.getElementById("cart-error");
const orderTotal = document.getElementById("order-total");
const pickupDate = document.getElementById("pickup-date");
const pickup = document.getElementById("pickup");
const addButtons = orderForm.querySelectorAll("[data-add-dish]");
const continueOrder = document.getElementById("continue-order");

const orderStorage = new StorageService(() => {
    document.getElementById("order-storage-warning").hidden = false;
});
const cart = new PickupCart(window.OrbitFood.dishes, orderStorage);

function renderCart() {
    const items = cart.items();
    cartItems.replaceChildren();
    cartEmpty.hidden = items.length > 0;
    orderTotal.textContent = `Total: $${cart.total()}`;
    continueOrder.disabled = items.length === 0;

    for (const item of items) {
        const row = document.createElement("li");
        row.className = "border-bottom pb-2 mb-2";
        const name = document.createElement("strong");
        name.textContent = item.name;
        const controls = document.createElement("div");
        controls.className = "d-flex align-items-center flex-wrap gap-2 mt-1";

        const portions = document.createElement("select");
        portions.className = "form-select form-select-sm w-auto";
        portions.setAttribute("aria-label", `Portions of ${item.name}`);
        for (let number = 1; number <= 6; number++) {
            portions.add(new Option(number, number));
        }
        portions.value = item.quantity;
        const subtotal = document.createElement("span");
        subtotal.textContent = `$${item.price * item.quantity}`;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "btn btn-outline-dark btn-sm";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${item.name}`);
        portions.addEventListener("change", () => {
            cart.setQuantity(item.id, portions.value);
            subtotal.textContent = `$${item.price * portions.value}`;
            orderTotal.textContent = `Total: $${cart.total()}`;
            sayCart(`Portions updated for ${item.name}.`);
        });
        remove.addEventListener("click", () => {
            cart.setQuantity(item.id, 0);
            renderCart();
            sayCart(`Removed ${item.name}.`);
            orderForm.querySelector(`[data-add-dish="${item.id}"]`).focus();
        });
        controls.append(portions, subtotal, remove);
        row.append(name, controls);
        cartItems.append(row);
    }
}

function sayCart(message) {
    cartStatus.textContent = `${message} ${orderTotal.textContent}`;
    cartError.hidden = true;
    orderForm.querySelector(".form-success").hidden = true;
}

for (const button of addButtons) {
    button.disabled = false;
    button.addEventListener("click", () => {
        const id = button.dataset.addDish;
        const dish = window.OrbitFood.dishes.find(item => item.id === id);
        const quantity = cart.quantities[id] || 0;
        if (quantity >= 6) {
            cartError.textContent = "You can add up to 6 portions of each dish.";
            cartError.hidden = false;
            cartStatus.textContent = cartError.textContent;
            return;
        }
        cart.setQuantity(id, quantity + 1);
        renderCart();
        sayCart(`Added ${dish.name}.`);
    });
}

const ordersKey = "orbitfood.orders.v1";
const savedOrders = orderStorage.read(ordersKey, []);
const orders = Array.isArray(savedOrders) ? savedOrders.filter(isSavedOrder) : [];
const steps = [
    document.getElementById("cart-step"),
    document.getElementById("schedule-step"),
    document.getElementById("review-step")
];
const stepHeadings = ["cart-heading", "schedule-heading", "review-heading"];
const stepNames = ["Cart", "Pickup time", "Review"];
let step = 0;

function isSavedOrder(order) {
    return typeof order?.createdAt === "string"
        && Number.isFinite(Date.parse(order.createdAt))
        && Array.isArray(order.items)
        && order.items.length > 0
        && order.items.every(item => typeof item?.id === "string"
            && typeof item.name === "string"
            && Number.isFinite(item.price) && item.price >= 0
            && Number.isInteger(item.quantity) && validPortions(item.quantity))
        && Number.isFinite(order.total) && order.total >= 0;
}

function showOrderStep(nextStep, focus = true) {
    step = nextStep;
    steps.forEach((section, index) => {
        section.hidden = index !== step;
    });
    document.getElementById("pickup-step").textContent = `Step ${step + 1} of 3 · ${stepNames[step]}`;
    if (focus) document.getElementById(stepHeadings[step]).focus();
}

function pickupLabel() {
    return `${pickupDate.value} at ${pickup.value} (Astana time)`;
}

function renderReview() {
    const list = document.getElementById("pickup-review-items");
    list.replaceChildren();
    for (const item of cart.items()) {
        const row = document.createElement("li");
        row.textContent = `${item.quantity} × ${item.name} — $${item.price * item.quantity}`;
        list.append(row);
    }
    document.getElementById("pickup-review-time").textContent = `Pickup: ${pickupLabel()}`;
    document.getElementById("pickup-review-total").textContent = `Total: $${cart.total()}`;
}

pickupDate.min = astanaDateAndTime().date;
pickupDate.value = pickupDate.min;

for (const button of orderForm.querySelectorAll("[data-back]")) {
    button.addEventListener("click", () => showOrderStep(step - 1));
}

setupValidation(orderForm, () => {
    if (step === 0) return [];
    const { dateError, timeError } = scheduleErrors(pickupDate, pickup);
    if (step === 2 && (dateError || timeError)) showOrderStep(1, false);
    return [
        [[pickupDate], "pickup-date-error", dateError],
        [[pickup], "pickup-error", timeError]
    ];
}, () => {
    if (step === 0) {
        if (cart.items().length > 0) showOrderStep(1);
        return false;
    }

    if (step === 1) {
        renderReview();
        showOrderStep(2);
        return false;
    }

    const order = {
        createdAt: new Date().toISOString(),
        date: pickupDate.value,
        time: pickup.value,
        total: cart.total(),
        items: cart.items()
    };
    orders.push(order);
    const saved = orderStorage.write(ordersKey, orders);
    cart.clear(saved);
    renderOrderStats();
    renderCart();
    orderForm.querySelector(".form-success").textContent =
        `Demo order recorded · ${pickupLabel()} · $${order.total}`;
    pickupDate.value = astanaDateAndTime().date;
    pickup.value = "";
    showOrderStep(0, false);
});

renderCart();
showOrderStep(0, false);

const statsPeriod = document.getElementById("stats-period");

function renderOrderStats() {
    const today = astanaDateAndTime().date;
    const weekStart = new Date(Date.parse(today) - 6 * 86400000).toISOString().slice(0, 10);
    const filteredOrders = orders.filter(order => {
        if (statsPeriod.value === "all") return true;
        const orderDay = astanaDateAndTime(new Date(order.createdAt)).date;
        const start = statsPeriod.value === "today" ? today : weekStart;
        return orderDay >= start && orderDay <= today;
    });

    document.getElementById("stats-count").textContent = filteredOrders.length;
    const total = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById("stats-total").textContent = `$${total}`;

    const dishCounts = new Map();
    for (const order of filteredOrders) {
        for (const item of order.items) {
            if (!dishCounts.has(item.id)) {
                dishCounts.set(item.id, { name: item.name, quantity: 0 });
            }
            dishCounts.get(item.id).quantity += item.quantity;
        }
    }

    const popular = Array.from(dishCounts.values())
        .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
        .slice(0, 3);
    const list = document.getElementById("stats-popular");
    list.replaceChildren();
    for (const dish of popular) {
        const row = document.createElement("li");
        row.textContent = `${dish.name} · ${dish.quantity} ${dish.quantity === 1 ? "portion" : "portions"}`;
        list.append(row);
    }
    document.getElementById("stats-empty").hidden = popular.length > 0;
}

statsPeriod.addEventListener("change", renderOrderStats);
renderOrderStats();
document.getElementById("order-stats").hidden = false;
