 function ensureDocumentAccessible() {
        return new Promise((resolve) => {
            const checkHead = setInterval(() => {
                if (document && document.head) {
                    clearInterval(checkHead);
                    resolve();
                }
            }, 50);
        });
    }

    async function waitForElement(selector, duration = 800, maxTries = 20, multiple = false) {
        await ensureDocumentAccessible(); // Ensure document is ready
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const intervalId = setInterval(() => {
                const elements = multiple ? document.querySelectorAll(selector) : document.querySelector(selector);
                if ((multiple && elements.length > 0) || (!multiple && elements)) {
                    clearInterval(intervalId);
                    resolve(elements);
                } else if (++attempts > maxTries) {
                    clearInterval(intervalId);
                    reject(`Timeout: Unable to find element(s) for selector "${selector}" after ${maxTries} tries.`);
                }
            }, duration);
        });
    }

    async function waitForPageLoad() {
        await ensureDocumentAccessible();
        return new Promise((resolve) => {
            if (document.readyState === "complete" || document.readyState === "interactive") {
                resolve();
            } else {
                document.addEventListener("DOMContentLoaded", resolve, { once: true });
            }
        });
    }
