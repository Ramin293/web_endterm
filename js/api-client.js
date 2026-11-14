"use strict";

class ApiClient {
    constructor(baseUrl, timeout = 12000) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }

    async get(path, params) {
        const url = new URL(path, this.baseUrl);
        url.search = new URLSearchParams(params).toString();

        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(this.timeout) });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            throw new Error("Could not load API data", { cause: error });
        }
    }
}
