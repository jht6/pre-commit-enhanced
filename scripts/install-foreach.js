'use strict';

const fs = require('fs');
const path = require('path');
const exists = fs.existsSync || path.existsSync;
const utils = require('../common/utils');
const SCRIPT_PCE_FOREACH = 'pce-foreach';

let packageJsonPath = path.join(utils.getPackageJsonDirPath(), 'package.json');
if (!exists(packageJsonPath)) {
    console.error('pre-commit:');
    console.error('pre-commit: There is no "package.json" file in path' + packageJsonPath);
    console.error('pre-commit:');
    return;
}

//
// add "pce-foreach" in "scripts" of package.json
//
let json = require(packageJsonPath);
if (!json) {
    json = {};
}
if (!json.scripts) {
    json.scripts = {};
}

json.scripts[SCRIPT_PCE_FOREACH] = [
    'node ',
    './node_modules/pre-commit-enhanced/scripts/foreach.js'
].join('');

//
// add "pce-foreach" in "pre-commit" of package.json
//
let preCommitKey,
    preCommit;
if (json['pre-commit']) {
    preCommitKey = 'pre-commit';
    preCommit = json[preCommitKey];
} else if (json['precommit']) {
    preCommitKey = 'precommit';
    preCommit = json[preCommitKey];
} else {
    preCommitKey = 'pre-commit';
    preCommit = null;
}

if (!preCommit) { // no "pre-commit" or "precommit" config now
    json[preCommitKey] = [SCRIPT_PCE_FOREACH];
} else if (typeof preCommit === 'object') {
    if (Array.isArray(json[preCommitKey].run)) { // for format of {run: ["a", "b", "c"]}
        json[preCommitKey].run.push(SCRIPT_PCE_FOREACH);
    } else if (typeof json[preCommitKey].run === 'string') { // for format of {run: "a, b, c"}
        json[preCommitKey].run = preCommit.split(/[, ]+/).push(SCRIPT_PCE_FOREACH).join(', ');
    } else {
        json[preCommitKey].run = [SCRIPT_PCE_FOREACH];
    }
} else if (typeof preCommit === 'string') { // for format of "a, b, c"
    json[preCommitKey] = preCommit.split(/[, ]+/).push(SCRIPT_PCE_FOREACH).join(', ');
} else if (Array.isArray(preCommit)) { // for format of ["a, b, c"]
    json[preCommitKey].push(SCRIPT_PCE_FOREACH);
}

//
// add "pce-foreach-command" property in package.json
//
const PCE_FOREACH_COMMAND = 'pce-foreach-command';
json[PCE_FOREACH_COMMAND] = 'command <filepath>';


const spaceCount = 2;
try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(json, null, spaceCount));
    console.error('pre-commit:');
    console.error(`pre-commit: Success: Add "${SCRIPT_PCE_FOREACH}" in "scripts" of package.json`);
    console.error(`pre-commit: Success: Add "${SCRIPT_PCE_FOREACH}" in "${preCommitKey}" of package.json`);
    console.error(`pre-commit: Success: Add "${PCE_FOREACH_COMMAND}" in package.json`);
    console.error(`pre-commit:            at ${packageJsonPath}`);
    console.error('pre-commit:');
} catch (e) {
    console.error('pre-commit:');
    console.error(`pre-commit: Fail: Add property related to "foreach" in package.json at ${packageJsonPath}`);
    console.error('pre-commit:');
}
