/**
 * Regression testing in a real scene.
 */

const fs = require('fs');
const path = require('path');
const assume = require('assume');

// const spawn = require('cross-spawn');
const utils = require('../../common/utils');
const { execSync } = require('child_process');
const {
    FOREACH_COMMAND_TPL,
    FOREACH_COMMAND_KEY
} = require('../../common/const')();

const PCE_ROOT_DIR = process.cwd(); // This module's git reposition root dir path.
const TESTING_DIR_NAME = 'sandbox';
const TESTING_DIR_PATH = path.join(PCE_ROOT_DIR, TESTING_DIR_NAME);

// If there is an exsiting "sandbox" dir, remove it.
if (fs.existsSync(TESTING_DIR_PATH)) {
    try {
        execSync(`rm -rf ./${TESTING_DIR_NAME}`);
    } catch (e) {
        utils.log(`Can't remove the existing "${TESTING_DIR_NAME}" directory, skip testing.`);
        return;
    }
}

// Create "sandbox" directory and some files and directory in sandbox.
try {
    execSync([
        `mkdir ${TESTING_DIR_NAME}`,
        `cd ${TESTING_DIR_NAME}`,
        `mkdir node_modules`,
        `cd node_modules`,
        `mkdir pre-commit-enhanced`,
        `cd ..`,
        `echo node_modules > .gitignore`,
        `echo {"pre-commit":["markHookOk"],"scripts":{"markHookOk":"touch hook_run_ok"}} > package.json`,
        `echo init > commited`,
        `git init`
    ].join(` && `));
} catch (e) {
    utils.log(`Can't create file construct in "sandbox" directory, skip testing.`);
    return;
}

// Copy code file.
try {
    [
        'common',
        'scripts',
        'hook',
        'index.js',
        'install.js',
        'uninstall.js',
        'package.json'
    ].forEach(name => {
        execSync(`cp -a ./${name} ./${TESTING_DIR_NAME}/node_modules/pre-commit-enhanced`);
    });
} catch (e) {
    utils.log(`Error occured when copy code file to sandbox, skip testing.`);
    return;
}

// Install dependence for copied code.
try {
    execSync([
        `cd ${TESTING_DIR_NAME}/node_modules/pre-commit-enhanced`,
        `npm install --production`
    ].join(` && `));
} catch (e) {
    utils.log(`Error occured when install dependence for copied code in sandbox, skip testing.`);
    return;
}

// Run install.js.
describe('regression - install.js', function () {
    let ok = true;
    try {
        execSync([
            `cd ${TESTING_DIR_NAME}`,
            `node ./node_modules/pre-commit-enhanced/install.js`
        ].join(` && `));
    } catch (e) {
        ok = false;
    }

    it('run install.js without errors', function () {
        assume(ok).true();
    });

    it('install "pre-commit" hook file in .git/hooks', function () {
        assume(
            fs.existsSync(`./${TESTING_DIR_NAME}/.git/hooks/pre-commit`)
        ).true();
    });
});

// Git commit and trigger hook.
describe('regression - index.js(common hook)', function () {
    let ok = true;
    try {
        execSync([
            `cd ${TESTING_DIR_NAME}`,
            `echo foo >> commited`,
            `git add commited`,
            `git commit -m test`
        ].join(` && `));
    } catch (e) {
        ok = false;
    }

    it('passed pre-commit hook and git commit successly', function () {
        assume(ok).true();
    });

    it('hook really is triggered and run successly', function () {
        assume(
            fs.existsSync(`./${TESTING_DIR_NAME}/hook_run_ok`)
        ).true();
    });
});

// run "pce-install-foreach".
describe('regression - install-foreach.js', function () {
    let ok = true;
    try {
        execSync([
            `cd ${TESTING_DIR_NAME}`,
            `npm run pce-install-foreach`
        ].join(` && `));
    } catch (e) {
        ok = false;
    }

    it('run install-foreach.js without errors', function () {
        assume(ok).true();
    });

    it('add config about "foreach" in package.json successly', function () {
        let json = require(path.join(PCE_ROOT_DIR, `${TESTING_DIR_NAME}/package.json`));
        assume(json.scripts['pce-foreach']).equals(
            'node ./node_modules/pre-commit-enhanced/scripts/foreach.js'
        );
        assume(json[FOREACH_COMMAND_KEY]).equals(FOREACH_COMMAND_TPL);
        assume(json['pre-commit']).contains('pce-foreach');
    });
});

// Git commit and trigger hook to run pce-foreach.
// 修改package.json中"scripts"的"markHookOk"为"touch hook_run_ok_2"
// 修改package.json中"pce-foreach-command"内容为"echo <fliename> >> foreach_run_ok"
// 修改俩文件, git commit触发钩子
// 判断hook_run_ok是否存在
// 判断foreach_run_ok是否存在, 且内容为所提交两个文件的path


// TODO: Remove sandbox at a reasonable moment.
