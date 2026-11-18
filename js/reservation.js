"use strict";

const reservationForm = document.getElementById("reservation-form");
const date = document.getElementById("date");
const time = document.getElementById("time");
const guests = document.getElementById("guests");
const guestName = document.getElementById("name");
const note = document.getElementById("note");
const slotHint = document.getElementById("slot-hint");
const slots = Array.from(time.options).filter(option => option.value).map(option => ({
    time: option.value,
    capacity: Number(option.dataset.capacity)
}));

function refreshSlots() {
    const now = astanaDateAndTime();
    const selectedTime = time.value;
    date.min = now.date;
    const ready = date.value >= now.date && validPortions(guests.value);
    time.replaceChildren(new Option("Choose a time", ""));
    time.disabled = !ready;

    if (!ready) {
        slotHint.textContent = "Choose a date and guest count to see times.";
        return;
    }

    const available = slots.filter(slot => slot.capacity >= Number(guests.value)
        && (date.value !== now.date || slot.time > now.time));
    for (const slot of available) {
        time.add(new Option(slot.time, slot.time));
    }

    const hint = date.value === now.date
        ? "No times left today for this group. Choose another date."
        : "No times for this group. Choose another date or guest count.";
    slotHint.textContent = available.length ? "" : hint;

    if (available.some(slot => slot.time === selectedTime)) {
        time.value = selectedTime;
    }
}

date.addEventListener("input", refreshSlots);
guests.addEventListener("input", refreshSlots);
time.addEventListener("focus", refreshSlots);
refreshSlots();

setupValidation(reservationForm, function () {
    refreshSlots();
    const { dateError, timeError } = scheduleErrors(date, time);
    const nameLength = guestName.value.trim().length;

    return [
        [[date], "date-error", dateError],
        [[guests], "guests-error", validPortions(guests.value) ? "" : "Choose 1 to 6 guests."],
        [[time], "time-error", timeError],
        [[guestName], "name-error", nameLength >= 2 && nameLength <= 60 ? "" : "Enter a name with 2 to 60 characters."],
        [[note], "note-error", note.value.length <= 300 ? "" : "Keep the note to 300 characters or fewer."]
    ];
});
