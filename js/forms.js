"use strict";

const reservationForm = document.querySelector("#reservation-form");
const orderForm = document.querySelector("#order-form");

function astanaDateAndTime() {
    //тут берем дату и время ресторана чтобы проверка не зависела от часового пояса гостя
    const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Almaty",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    });
    const parts = {};
    for (const part of formatter.formatToParts(new Date())) {
        parts[part.type] = part.value;
    }
    return {
        date: `${parts.year}-${parts.month}-${parts.day}`,
        time: `${parts.hour}:${parts.minute}`
    };
}

function hasSelectedOption(select) {
    return select.value !== "" && Array.from(select.options).some(option =>
        option.value === select.value && !option.disabled
    );
}

function validPortions(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 && number <= 6;
}

function setupValidation(form, checkFields) {
    const success = form.querySelector(".form-success");
    let submitted = false;
    form.noValidate = true;

    function validate() {
        let firstInvalid = null;
        for (const [fields, errorId, message] of checkFields()) {
            const feedback = document.getElementById(errorId);
            feedback.textContent = message;
            feedback.hidden = !message;
            for (const field of fields) {
                field.classList.toggle("is-invalid", Boolean(message));
                if (message) field.setAttribute("aria-invalid", "true");
                else field.removeAttribute("aria-invalid");
            }
            if (message && !firstInvalid) firstInvalid = fields[0];
        }
        return firstInvalid;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitted = true;
        success.hidden = true;
        const firstInvalid = validate();
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }
        success.hidden = false;
        success.focus();
    });

    form.addEventListener("input", function () {
        success.hidden = true;
        if (submitted) validate();
    });
}

if (reservationForm) {
    const date = document.getElementById("date");
    const time = document.getElementById("time");
    const guests = document.getElementById("guests");
    const name = document.getElementById("name");
    const note = document.getElementById("note");
    date.min = astanaDateAndTime().date;

    setupValidation(reservationForm, function () {
        const now = astanaDateAndTime();
        const nameLength = name.value.trim().length;
        const validDate = date.valueAsNumber >= Date.parse(now.date);
        date.min = now.date;
        let timeError = "";

        if (!hasSelectedOption(time)) {
            timeError = "Choose a reservation time.";
        } else if (date.value === now.date && time.value <= now.time) {
            timeError = "Choose a time later than the current time in Astana.";
        }

        return [
            [[date], "date-error", validDate ? "" : "Choose today or a future date."],
            [[time], "time-error", timeError],
            [[guests], "guests-error", validPortions(guests.value) ? "" : "Choose 1 to 6 guests."],
            [[name], "name-error", nameLength >= 2 && nameLength <= 60 ? "" : "Enter a name with 2 to 60 characters."],
            [[note], "note-error", note.value.length <= 300 ? "" : "Keep the note to 300 characters or fewer."]
        ];
    });
}

if (orderForm) {
    const radios = orderForm.querySelectorAll('input[name="dish"]');
    const quantity = document.getElementById("quantity");
    const pickup = document.getElementById("pickup");
    const total = document.getElementById("order-total");

    function selectedDish() {
        const selected = orderForm.querySelector('input[name="dish"]:checked');
        if (!selected) return null;
        return window.OrbitFood.dishes.find(dish => dish.id === selected.value);
    }

    function updateTotal() {
        //тут берем цену из общего массива блюд
        const dish = selectedDish();
        total.textContent = dish && validPortions(quantity.value)
            ? `Estimated total: $${dish.price * Number(quantity.value)}`
            : "Select a dish and 1 to 6 portions to see the total.";
    }

    setupValidation(orderForm, function () {
        return [
            [radios, "dish-error", selectedDish() ? "" : "Select a dish from the list."],
            [[quantity], "quantity-error", validPortions(quantity.value) ? "" : "Enter a whole number from 1 to 6."],
            [[pickup], "pickup-error", hasSelectedOption(pickup) ? "" : "Choose a pickup time."]
        ];
    });

    orderForm.addEventListener("input", updateTotal);
    total.hidden = false;
    updateTotal();
}
