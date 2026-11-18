"use strict";

function astanaDateAndTime(value = new Date()) {
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
    for (const part of formatter.formatToParts(value)) {
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

function scheduleErrors(date, time) {
    const now = astanaDateAndTime();
    date.min = now.date;
    const dateError = date.valueAsNumber >= Date.parse(now.date) ? "" : "Choose today or a future date.";
    let timeError = "";

    if (!hasSelectedOption(time)) {
        timeError = "Choose a time from the list.";
    } else if (date.value === now.date && time.value <= now.time) {
        timeError = "Choose a time later than the current time in Astana.";
    }
    return { dateError, timeError };
}

function setupValidation(form, checkFields, onValid) {
    const success = form.querySelector(".form-success");
    const alert = form.querySelector(".form-alert");
    let submitted = false;
    form.noValidate = true;

    function validate(showErrors = true) {
        let firstInvalid = null;
        for (const [fields, errorId, error] of checkFields()) {
            const message = showErrors ? error : "";
            const feedback = document.getElementById(errorId);
            feedback.textContent = message;
            feedback.hidden = !message;
            for (const field of fields) {
                field.classList.toggle("is-invalid", Boolean(message));
                if (message) field.setAttribute("aria-invalid", "true");
                else field.removeAttribute("aria-invalid");
            }
            if (message && !firstInvalid) firstInvalid = { field: fields[0], message };
        }
        return firstInvalid;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitted = true;
        success.hidden = true;
        const firstInvalid = validate();
        if (firstInvalid) {
            alert.textContent = firstInvalid.message;
            firstInvalid.field.focus();
            return;
        }
        if (onValid && onValid() === false) return;
        success.hidden = false;
        success.focus();
    });

    form.addEventListener("input", function () {
        success.hidden = true;
        alert.textContent = "";
        if (submitted) validate();
    });

    return function clearValidation() {
        submitted = false;
        success.hidden = true;
        alert.textContent = "";
        validate(false);
    };
}
