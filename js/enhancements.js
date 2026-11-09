"use strict";

$(document).ready(function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const questions = $(".faq-toggle");
    const noteHelp = $("#note-help");

    $(".faq-answer").hide();
    questions.prop("disabled", false).attr("aria-expanded", "false");

    questions.on("click", function () {
        const button = $(this);
        const isOpen = button.attr("aria-expanded") === "true";
        const duration = reduceMotion.matches ? 0 : 180;
        //тут closest находит нужный блок и find берет ответ внутри него
        const answer = button.closest(".faq-item").find(".faq-answer");

        button.attr("aria-expanded", String(!isOpen));
        answer.stop(true, true);
        if (isOpen) answer.slideUp(duration);
        else answer.slideDown(duration);
    });

    //тут подсказка остается видимой если jQuery не загрузился
    noteHelp.hide();
    $("#note").on("focusin", function () {
        noteHelp.stop(true, true).fadeIn(reduceMotion.matches ? 0 : 140);
    });
    $("#note").on("focusout", function () {
        noteHelp.stop(true, true).fadeOut(reduceMotion.matches ? 0 : 140);
    });
    if ($("#note").is(":focus")) $("#note").trigger("focusin");
});
