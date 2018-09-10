/**
 * Regression testing in a real scene.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assume = require('assume');

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

    function prepare() {
        try {
            execSync([
                `cd ${TESTING_DIR_NAME}`,
                `node ./node_modules/pre-commit-enhanced/install.js`
            ].join(` && `));
        } catch (e) {
            ok = false;
        }
    }

    it('run install.js without errors', function () {
        prepare();
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
    let commited = 'commited';

    function prepare() {
        try {
            execSync([
                `cd ${TESTING_DIR_NAME}`,
                `echo foo >> ${commited}`,
                `git add ${commited}`,
                `git commit -m test`
            ].join(` && `));
        } catch (e) {
            ok = false;
        }
    }

    it('passed pre-commit hook and git commit successly', function () {
        prepare();
        assume(ok).true();
    });

    it('hook really is triggered and run successly', function () {
        assume(
            fs.existsSync(`./${TESTING_DIR_NAME}/hook_run_ok`)
        ).true();
    });

    // it('committing will fail if the hook exit with a non-zero code', function () {
    //     let lastJson;

    //     utils.modifyPackageJson(
    //         path.join(TESTING_DIR_PATH, 'package.json'),
    //         json => {
    //             lastJson = JSON.parse(JSON.stringify(json));
    //             json.scripts.markHookFail = 'touch hook_run_fail && exit 1';
    //             json['pre-commit'][0] = 'markHookFail';
    //             return json;
    //         }
    //     );

    //     let ok = true;

    //     try {
    //         execSync([
    //             `cd ${TESTING_DIR_NAME}`,
    //             `echo bar >> ${commited}`,
    //             `git add ${commited}`,
    //             `git commit -m test`
    //         ].join(` && `));
    //     } catch (e) {
    //         ok = false;
    //     }

    //     assume(ok).false();

    //     execSync([
    //         `cd ${TESTING_DIR_NAME}`,
    //         `git reset HEAD`
    //     ].join(` && `));

    //     reset package.json
    //     utils.modifyPackageJson(
    //         path.join(TESTING_DIR_PATH, 'package.json'),
    //         () => lastJson
    //     );
    // });
});

// run "pce-install-foreach".
describe('regression - install-foreach.js', function () {
    let ok = true;

    function prepare() {
        try {
            execSync([
                `cd ${TESTING_DIR_NAME}`,
                `npm run pce-install-foreach`
            ].join(` && `));
        } catch (e) {
            ok = false;
        }
    }

    it('run install-foreach.js without errors', function () {
        prepare();
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
describe('regression - foreach.js', function () {
    const nameList = ['foreach_commited_0', 'foreach_commited_1'];

    function prepare() {
        utils.modifyPackageJson(
            path.join(PCE_ROOT_DIR, `${TESTING_DIR_NAME}/package.json`),
            json => {
                json.scripts.markHookOk = 'touch hook_run_ok_in_foreach';
                json['pce-foreach-command'] = 'echo <filepath> >> foreach_run_ok';
                return json;
            }
        );

        try {
            execSync([
                `cd ${TESTING_DIR_NAME}`,
                `echo foo >> ${nameList[0]}`,
                `echo bar >> ${nameList[1]}`,
                `git add ${nameList[0]} ${nameList[1]}`,
                `git commit -m test`
            ].join(` && `));
        } catch (e) {
            ok = false;
        }
    }

    let ok = true;

    it('passed pre-commit hook and git commit successly', function () {
        prepare();
        assume(ok).true();
    });

    it('foreach.js really is triggered and run successly', function () {
        let markFilePath = `./${TESTING_DIR_NAME}/foreach_run_ok`;
        assume(
            fs.existsSync(markFilePath)
        ).true();

        let pathList = fs.readFileSync(markFilePath)
            .toString()
            .split(os.EOL)
            .filter(line => !!line);
        assume(pathList.length).equals(2);
        assume(pathList[0]).includes(nameList[0]);
        assume(pathList[1]).includes(nameList[1]);
    });
});

// TODO: Remove sandbox at a reasonable moment.
