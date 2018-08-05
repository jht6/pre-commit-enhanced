'use strict';

const fs = require('fs');
const path = require('path');
const exists = fs.existsSync || path.existsSync;
const utils = require('../common/utils');
const SCRIPT_PCE_FOREACH = 'pce-foreach';
const { FOREACH_COMMAND_TPL } = require('../common/const')();
const FOREACH_COMMAND_KEY = 'pce-foreach-command';

function ForeachInstaller() {
    if (!this) {
        return new ForeachInstaller();
    }

    this.packageJsonPath = path.join(
        utils.getPackageJsonDirPath(),
        'package.json'
    );
    if (!exists(this.packageJsonPath)) {
        utils.log(`There is no "package.json" file in path: ${this.packageJsonPath}`);
    }

    this.json = require(this.packageJsonPath);
    if (!this.json) {
        this.json = {};
    }
    if (!this.json.scripts) {
        this.json.scripts = {};
    }
}

ForeachInstaller.prototype.run = function () {
    this.json = this.addForeachInScripts(this.json);
    this.json = this.addForeachInPrecommit(this.json);
    this.json = this.addForeachCommand(this.json);
    this.json = this.addForeachCommand(this.json);
    this.writeJsonToFile(this.json);
};

ForeachInstaller.prototype.addForeachInScripts = function (json) {
    json.scripts[SCRIPT_PCE_FOREACH] = [
        'node ',
        './node_modules/pre-commit-enhanced/scripts/foreach.js'
    ].join('');

    return json;
};

ForeachInstaller.prototype.addForeachInPrecommit = function (json) {
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

    return json;
};

ForeachInstaller.prototype.addForeachCommand = function (json) {

    json[FOREACH_COMMAND_KEY] = FOREACH_COMMAND_TPL;

    return json;
};

ForeachInstaller.prototype.writeJsonToFile = function (json) {
    const spaceCount = 2;
    try {
        fs.writeFileSync(this.packageJsonPath, JSON.stringify(json, null, spaceCount));
        utils.log([
            `Success: Add "${SCRIPT_PCE_FOREACH}" in "scripts" of package.json`,
            `Success: Add "${SCRIPT_PCE_FOREACH}" in "pre-commit" of package.json`,
            `Success: Add "${FOREACH_COMMAND_KEY}" in package.json`,
            `    at ${this.packageJsonPath}`
        ]);
    } catch (e) {
        utils.log([
            `Fail: Add property related to "foreach" in package.json at ${this.packageJsonPath}`,
            `Error message is:`
        ]);
        console.log(e);
    }
};

// Expose the Hook instance so we can use it for testing purposes.
module.exports = Hook;

// Run only if this script is executed through CLI
if (require.main === module) {
    const installer = new ForeachInstaller();
    installer.run();
}