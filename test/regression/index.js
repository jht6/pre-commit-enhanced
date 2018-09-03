/**
 * Regression testing in a real scene.
 */

const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const utils = require('../../common/utils');

const PCE_ROOT_DIR = process.cwd(); // This module's git reposition root dir path.
const TESTING_DIR_NAME = 'sandbox';
const TESTING_DIR_PATH = path.join(PCE_ROOT_DIR, TESTING_DIR_NAME);

// If there is an exsiting "sandbox" dir, remove it.
if (fs.existsSync(TESTING_DIR_PATH)) {
    let ret = spawn.sync(`rm -rf ${TESTING_DIR_PATH}`);
    if (ret.status) {
        utils.log(`Can't remove the existing "${TESTING_DIR_NAME}" directory, skip testing.`);
        return;
    }
}

fs.mkdirSync(`${TESTING_DIR_PATH}`);


