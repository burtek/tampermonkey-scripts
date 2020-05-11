#!/usr/bin/node

const { promises: fs, Dirent } = require('fs');
const { resolve } = require('path');

const NAME_REGEXP = /^\/\/ @name +([^ ].+)$/m;
const DESC_REGEXP = /^\/\/ @description +([^ ].+)$/m;
const VERSION_REGEXP = /^\/\/ @version +([^ ].+)$/m;

const USERSCRIPT_REGEXP = /\.user\.js$/;

const README_TPL = `<!-- File auto-generated, do not edit manually! -->
# tampermonkey-scripts
![](https://github.com/burtek/tampermonkey-scripts/workflows/edit-readme/badge.svg)

My TamperMonkey Scripts:

 **Name**<br />Description<br /> | source & install | ver. 
 :------------------------------ | :--------------: | :-----: `;

run();

async function run() {
    const dir = await fs.readdir(fileName('..'), {
        withFileTypes: true
    });

    const jobs = dir.filter(filterDirEnts).map(createJob);
    
    const outputs = await Promise.all(jobs);

    const output = `${README_TPL}\n${outputs.join('\n')}`;

    await fs.writeFile(fileName('../README.md'), output, {
        encoding: 'utf8',
        flag: 'w'
    })
}

/**
 * @param {Dirent} dirEnt
 */
function filterDirEnts(dirEnt) {
    return dirEnt.isFile() && USERSCRIPT_REGEXP.test(dirEnt.name);
}

/**
 * @param {Dirent} dirEnt
 */
async function createJob(fileDirEnt) {
    const content = await fs.readFile(fileName(`../${fileDirEnt.name}`), { encoding: 'utf8' });
    
    const name = content.match(NAME_REGEXP)[1];
    const description = content.match(DESC_REGEXP)[1].split('.')[0];
    const version = content.match(VERSION_REGEXP)[1];

    return createEntry(name, description, fileDirEnt.name, version);
}

/**
 * @param {string} name
 * @param {string} [description = '']
 * @param {string} filename
 */
function createEntry(name, description = '', filename, version) {
    return `**${name}**<br />${description} | [_${filename}_](./${filename})<br />[[install](https://github.com/burtek/tampermonkey-scripts/raw/master/${filename})] | ${version}`
}

/**
 * @param {string} name 
 */
function fileName(name) {
    return resolve(__dirname, name);
}
