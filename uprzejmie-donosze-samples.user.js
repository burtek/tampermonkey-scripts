// ==UserScript==
// @name         Uprzejmie Donoszę
// @namespace    https://github.com/burtek/tampermonkey-scripts
// @version      1.0
// @description  Podpowiadacz opisów do Uprzejmie Donoszę!
// @author       burtek <burtekdotryw@gmail.com>
// @match        https://uprzejmiedonosze.net/nowe-zgloszenie.html
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js
// @grant        none
// ==/UserScript==

(function() {
    const options = [
        'Parkowanie mniej niż 10m od przejścia dla pieszych i skrzyżowania',
        'Znak B-36'
    ];

    const SIDEBAR_ID = 'options-sidebar';
    const OPTION_CLASSNAME = 'option';
    const OPTION_BUTTON_CLASSNAME = 'option-button';
    const DESCRIPTION_SELECTOR = '#comment';

    const ATTRIB_DATA_TEXT = 'data-text';
    const ATTRIB_DATA_ACTION = 'data-action';

    const OPTION_BUTTON_ENUM = {
        PREPEND: 'prepend',
        SET: 'set',
        APPEND: 'append'
    };

    function createButton(text, data) {
        const optionButton = document.createElement('button');
        optionButton.classList.add(OPTION_BUTTON_CLASSNAME);
        optionButton.setAttribute(ATTRIB_DATA_ACTION, data);
        optionButton.innerText = text;
        return optionButton;
    }

    function createSidebar() {
        const main = document.createElement('div');
        main.id = SIDEBAR_ID;
        const list = document.createElement('ol');
        main.appendChild(list);

        options.forEach(optionText => {
            const option = document.createElement('li');
            option.classList.add(OPTION_CLASSNAME);
            option.setAttribute(ATTRIB_DATA_TEXT, optionText);
            option.innerText = optionText;
            list.appendChild(option);

            option.appendChild(document.createElement('br'));

            option.appendChild(createButton('Prepend', OPTION_BUTTON_ENUM.PREPEND));
            option.appendChild(createButton('Set', OPTION_BUTTON_ENUM.SET));
            option.appendChild(createButton('Append', OPTION_BUTTON_ENUM.APPEND));
        });

        return main;
    }

    function mapSingleRule(value, property) {
        if (typeof value === 'number' && value !== 0) {
            value = `${value}px`;
        }
        return `${_.kebabCase(property)}:${value}`;
    }

    function mapRule({atSelector = null, selector, rules}) {
        const singleRule = _.map(rules, mapSingleRule).join(';');
        const rule = `${selector}{${singleRule}}`;
        if(atSelector) {
            return `${atSelector}{${rule}}`;
        }
        return rule;
    }

    function addStylesheetRules(rules) {
        const styleElement = document.createElement('style');
        document.head.appendChild(styleElement);
        const styleSheet = styleElement.sheet;

        rules.forEach(rule => {
            styleSheet.insertRule(mapRule(rule), styleSheet.cssRules.length);
        });

        return styleElement;
    }

    function createStyles() {
        const styleElement = addStylesheetRules([
            {
                selector: `#${SIDEBAR_ID}`,
                rules: {
                    width: 'calc( calc(100vw - 800px) / 2 - 150px )',
                    position: 'fixed',
                    top: '50%',
                    right: 0,
                    border: '1px solid grey',
                    borderRight: 'none',
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                    transform: 'translateY(-50%)'
                }
            },
            {
                selector: `#${SIDEBAR_ID} .${OPTION_BUTTON_CLASSNAME} + .${OPTION_BUTTON_CLASSNAME}`,
                rules: {
                    marginLeft: 10
                }
            }
        ]);
        return styleElement;
    }

    function showSidebar() {
        const sidebar = createSidebar();
        document.body.appendChild(sidebar);
        const styles = createStyles();
        // document.head.appendChild(styles);

        sidebar.addEventListener('click', event => {
            if(event.target.className !== OPTION_BUTTON_CLASSNAME) {
                return;
            }

            const commentTextarea = document.querySelector(DESCRIPTION_SELECTOR);
            const text = event.target.closest(`.${OPTION_CLASSNAME}`).getAttribute(ATTRIB_DATA_TEXT);
            const action = event.target.getAttribute(ATTRIB_DATA_ACTION);

            switch(action) {
                case OPTION_BUTTON_ENUM.PREPEND:
                    commentTextarea.value = commentTextarea.value.trim() ? `${text}\n${commentTextarea.value}` : text;
                    break;
                case OPTION_BUTTON_ENUM.SET:
                    commentTextarea.value = text;
                    break;
                case OPTION_BUTTON_ENUM.APPEND:
                    commentTextarea.value = commentTextarea.value.trim() ? `${commentTextarea.value}\n${text}` : text;
                    break;
            }
        });
    }

    window.addEventListener('load', showSidebar);
})();
