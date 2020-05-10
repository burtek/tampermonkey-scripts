// ==UserScript==
// @name         Facebook untrack links
// @namespace    https://github.com/burtek/tampermonkey-scripts
// @version      1.0
// @description  Remove facebook tracking data from any link you open or copy through facebook.\n\nIf something doesn't work let me know, I'll fix it!
// @author       burtek
// @match        https://www.facebook.com/*
// @run-at       document-body
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
