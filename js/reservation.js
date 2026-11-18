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

reservationForm.addEventListener("submit", refreshSlots);

const clearBookingValidation = setupValidation(reservationForm, function () {
    const { dateError, timeError } = scheduleErrors(date, time);
    const nameLength = guestName.value.trim().length;

    return [
        [[date], "date-error", dateError],
        [[guests], "guests-error", validPortions(guests.value) ? "" : "Choose 1 to 6 guests."],
        [[time], "time-error", timeError],
        [[guestName], "name-error", nameLength >= 2 && nameLength <= 60 ? "" : "Enter a name with 2 to 60 characters."],
        [[note], "note-error", note.value.length <= 300 ? "" : "Keep the note to 300 characters or fewer."]
    ];
}, saveBooking);

const bookingsKey = "orbitfood.bookings.v1";
const bookingList = document.getElementById("booking-list");
const bookingHeading = document.getElementById("booking-form-title");
const saveButton = document.getElementById("save-booking");
const stopEditing = document.getElementById("stop-editing");
const bookingSuccess = reservationForm.querySelector(".form-success");
const bookingStorage = new StorageService(() => {
    document.getElementById("booking-storage-warning").hidden = false;
});
const savedBookings = bookingStorage.read(bookingsKey, []);
let bookings = Array.isArray(savedBookings) ? savedBookings.filter(isSavedBooking) : [];
let editingId = null;
let nextBookingId = bookings.reduce((max, booking) => Math.max(max, booking.id), 0) + 1;

function isSavedBooking(booking) {
    return Number.isSafeInteger(booking?.id) && booking.id > 0
        && typeof booking.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(booking.date)
        && Number.isFinite(Date.parse(booking.date))
        && Number.isInteger(booking.guests) && validPortions(booking.guests)
        && slots.some(slot => slot.time === booking.time && slot.capacity >= booking.guests)
        && typeof booking.name === "string" && booking.name.trim().length >= 2 && booking.name.length <= 60
        && typeof booking.note === "string" && booking.note.length <= 300;
}

function renderBookings() {
    bookingList.replaceChildren();
    document.getElementById("bookings-empty").hidden = bookings.length > 0;

    for (const booking of bookings) {
        const details = document.createElement("details");
        details.className = "border-top py-2";
        const summary = document.createElement("summary");
        summary.textContent = `${booking.date} at ${booking.time} · ${booking.guests} ${booking.guests === 1 ? "guest" : "guests"}`;
        const name = document.createElement("p");
        name.className = "mt-2 mb-1 text-break";
        name.textContent = `Name: ${booking.name}`;
        details.append(summary, name);

        if (booking.note) {
            const bookingNote = document.createElement("p");
            bookingNote.className = "mb-1 text-break";
            bookingNote.textContent = booking.note;
            details.append(bookingNote);
        }

        const actions = document.createElement("div");
        actions.className = "d-flex flex-wrap gap-2 mt-2";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "btn btn-outline-dark btn-sm";
        edit.textContent = "Edit";
        edit.addEventListener("click", () => editBooking(booking));
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "btn btn-outline-dark btn-sm";
        cancel.textContent = "Cancel booking";
        cancel.addEventListener("click", () => cancelBooking(booking.id));
        actions.append(edit, cancel);
        details.append(actions);
        bookingList.append(details);
    }
}

function editBooking(booking) {
    editingId = booking.id;
    date.value = booking.date;
    guests.value = booking.guests;
    refreshSlots();
    time.value = Array.from(time.options).some(option => option.value === booking.time) ? booking.time : "";
    guestName.value = booking.name;
    note.value = booking.note;
    bookingHeading.textContent = "Edit booking";
    saveButton.textContent = "Save changes";
    stopEditing.hidden = false;
    clearBookingValidation();
    bookingHeading.focus();
}

function resetBookingForm() {
    editingId = null;
    reservationForm.reset();
    refreshSlots();
    clearBookingValidation();
    bookingHeading.textContent = "Your reservation";
    saveButton.textContent = "Save demo booking";
    stopEditing.hidden = true;
}

function saveBooking() {
    const isEditing = editingId !== null;
    const booking = {
        id: isEditing ? editingId : nextBookingId++,
        date: date.value,
        time: time.value,
        guests: Number(guests.value),
        name: guestName.value.trim(),
        note: note.value.trim()
    };
    if (isEditing) {
        bookings = bookings.map(item => item.id === editingId ? booking : item);
    } else {
        bookings.push(booking);
    }
    bookingStorage.write(bookingsKey, bookings);
    renderBookings();
    resetBookingForm();
    bookingSuccess.textContent = isEditing ? "Demo booking updated." : "Demo booking added to My bookings.";
}

function cancelBooking(id) {
    bookings = bookings.filter(booking => booking.id !== id);
    bookingStorage.write(bookingsKey, bookings);
    if (editingId === id) resetBookingForm();
    bookingSuccess.hidden = true;
    renderBookings();
    document.getElementById("bookings-status").textContent = "Demo booking cancelled.";
    document.getElementById("bookings-heading").focus();
}

stopEditing.addEventListener("click", () => {
    resetBookingForm();
    document.getElementById("bookings-heading").focus();
});

renderBookings();
