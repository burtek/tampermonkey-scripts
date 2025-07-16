// ==UserScript==
// @name         G..noWArchiwach
// @namespace    https://github.com/burtek/tampermonkey-scripts
// @version      0.1.1
// @description  try to take over the world!
// @author       burtek <burtekdotryw@gmail.com>
// @match        https://www.genealogiawarchiwach.pl/*
// @match        https://genealogiawarchiwach.pl/*
// @grant        unsafeWindow
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const origShowThumb = unsafeWindow.showThumb;
    const kidnapUrlShowThumb = (url, config) => {
        const newUrl = url.replace('/,896/','/,6000/').replace('/0/','/1/');
        console.log(`
Kidnapped URL\t: ${url}
Replaced URL\t: ${newUrl}
`.trim());
        GM.setValue('current-url', newUrl);
        console.log(url, newUrl);
        return origShowThumb(url, config);
    };

    unsafeWindow.showThumb = kidnapUrlShowThumb;

    const toolbox = document.createElement('div');
    document.body.appendChild(toolbox);
    Object.assign(toolbox.style, {
        display: 'flex',
        gap: '1rem',
        position: 'fixed',
        top: '40px',
        right: '20px',
        'z-index': 20000,
    });

    function getValue(label) {
        return Array.from(document.querySelectorAll('#info-tabs div.v-slot-scan-info-panel > div > div.v-panel-content table.v-table-table tbody tr'))
            .find(tr => tr.children[0].innerText.includes(label)).querySelector('div:nth-child(3)').innerText;
    }

    async function downloadCurrentImage() {
        const a = document.createElement('a');
        const zespol = getValue('Zespół');
        const dataDlaKsiegi = getValue('Data dla księgi');
        const dataDlaSkanu = getValue('Data dla skanu');
        const strona = /\((\d+)\)$/.exec(getValue('Nazwa'))[1];
        a.download = `${zespol} ${dataDlaKsiegi} ${dataDlaSkanu} ${strona}`;
        a.href = await GM.getValue('current-url');
        document.body.appendChild(a);
        a.addEventListener('error', event => {
            event.stopPropagation();
            event.preventDefault();
            console.error('error', event);
            return false;
        });
        a.click();
        setTimeout(() => { document.body.removeChild(a); }, 1000);
    }

    const download = document.createElement('a');
    download.innerText = 'Pobierz';
    download.href='#';
    toolbox.appendChild(download);
    download.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();
        downloadCurrentImage();
        return false;
    });

    const dowloadAll = document.createElement('a');
    dowloadAll.innerText = 'Pobierz wszystkie';
    dowloadAll.href='#';
    toolbox.appendChild(dowloadAll);
    dowloadAll.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();

        function downloadAndGoNext() {
            downloadCurrentImage();
            setTimeout(() => {
                const right = document.querySelector('div.right-nav');
                if (right.classList.contains('v-disabled')) {
                    unsafeWindow.showThumb = kidnapUrlShowThumb;
                } else {
                    right.click();
                }
            }, 2000);
        }

        unsafeWindow.showThumb = (url, config) => {
            setTimeout(downloadAndGoNext, 2000);
            return kidnapUrlShowThumb(url, config);
        };

        downloadAndGoNext();

        return false;
    });

    const copyMkdir = document.createElement('a');
    copyMkdir.innerText = 'mkdir';
    copyMkdir.href ='#';
    toolbox.appendChild(copyMkdir);
    copyMkdir.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();

        const [range1, range2] = getValue('Data dla księgi').split(' - ').map(Number);
        const range = range2 ? `{${Array.from({ length: range2 - range1 + 1 }, (e, i) => i + range1).join(',')}}` : range1;
        const dirname = `${getValue('Sygnatura')}. ${range} ${getValue('Pełna nazwa jednostki')}`.replaceAll(' ', '\\ ');
        GM_setClipboard(`mkdir ${dirname}`);

        return false;
    });
})();
