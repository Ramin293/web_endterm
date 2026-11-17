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
const continueOrder = orderForm.querySelector('[type="submit"]');

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

pickupDate.min = astanaDateAndTime().date;
pickupDate.value = pickupDate.min;

setupValidation(orderForm, () => {
    const { dateError, timeError } = scheduleErrors(pickupDate, pickup);
    return [
        [[pickupDate], "pickup-date-error", dateError],
        [[pickup], "pickup-error", timeError]
    ];
});

renderCart();
