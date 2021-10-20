#!/usr/bin/env node
"use strict";

// @ts-check

const path = require('path');
const childProcess = require('child_process');

const root = path.dirname(path.dirname(__dirname));
const args = process.argv.slice(2);

/** @type { { folder: string; scripts: string[] }[] } */
const folders = [
    { folder: 'client', scripts: ['install', 'lint'] },
    { folder: 'server', scripts: ['install', 'lint'] }
];

const script = args[0] === 'run' ? args[1] : args[0];

for (const elem of folders.map(item => { return { folder: item.folder, scripts: new Set(item.scripts) }; })) {
    if (elem.scripts.has(script)) {
        console.log(path.join(root, elem.folder));
        childProcess.spawnSync(`npm ${args.join(' ')}`, {
            cwd: path.join(root, elem.folder),
            shell: true,
            stdio: 'inherit'
        });
    }
}