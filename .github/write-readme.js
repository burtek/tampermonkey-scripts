#!/usr/bin/node

const { promises: fs, Dirent } = require('fs');
const { resolve } = require('path');

const NAME_REGEXP = /^\/\/ @name +([^ ].+)$/m;
const DESC_REGEXP = /^\/\/ @description +([^ ].+)$/m;
const USERSCRIPT_REGEXP = /\.user\.js$/;

const README_TPL = `# tampermonkey-scripts
My TamperMonkey Scripts

 **Name**<br />Description<br /> | source & install
 :------------------------------ | :--------------:`;

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

    return createEntry(name, description, fileDirEnt.name);
}

/**
 * @param {string} name
 * @param {string} [description = '']
 * @param {string} filename
 */
function createEntry(name, description = '', filename) {
    return `**${name}**<br />${description} | [_${filename}_](./${filename})<br />[[install](https://github.com/burtek/tampermonkey-scripts/raw/master/${filename})]`
}

/**
 * @param {string} name 
 */
function fileName(name) {
    return resolve(__dirname, name);
}