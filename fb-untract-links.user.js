// ==UserScript==
// @name         Facebook untrack links
// @namespace    https://github.com/burtek/tampermonkey-scripts
// @version      1.0.1
// @description  Remove facebook tracking data from any link you open or copy through facebook. If something doesn't work let me know and I'll fix it!
// @author       burtek <burtekdotryw@gmail.com>
// @match        https://www.facebook.com/*
// @run-at       document-body
// @supportURL   https://github.com/burtek/tampermonkey-scripts/issues
// ==/UserScript==

(function(TRACKING_KEYS) {
    function onClick(event) {
        console.log(event);
        if ([0, 1, 2].includes(event.button)) {
            var aParent = event.target.closest('a[href]');

            if (!aParent) {
                return;
            }

            var url = new URL(aParent.href);
            var keysToRemove = [];
            url.searchParams.forEach(function(value, key) {
                function doesKeyPatternTest(keyPattern) {
                    return keyPattern.test(key);
                };

                if (TRACKING_KEYS.some(doesKeyPatternTest)) {
                    console.log('Removed key', key, 'with value', value, 'from element', aParent);
                    keysToRemove.push(key);
                }
            });
            keysToRemove.forEach(function(key) {
                url.searchParams.delete(key);
            });

            aParent.href = url.toString();
        }
    }

    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onClick, true);
})([
    /^__xts__/,
    /^__tn__$/,
    /^fbclid$/
]);
