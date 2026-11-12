"use strict";

class StorageService {
    constructor(onUnavailable) {
        this.onUnavailable = onUnavailable;
    }

    read(key, fallback) {
        let value;
        try {
            value = localStorage.getItem(key);
        } catch {
            this.onUnavailable();
            return fallback;
        }

        try {
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            this.onUnavailable();
        }
    }
}
