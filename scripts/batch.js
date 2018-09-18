'use strict';

const { execSync } = require('child_process');

const callbacks = require('./batch-callback');
const {
    getGitStatus,
    getFilePathList,
    getPackageJsonDirPath,
    transPathWinToUnix,
    log
} = require('../common/utils/index');

const PKG_JSON_DIR_PATH_UNIX = transPathWinToUnix(getPackageJsonDirPath());

let pathList = getFilePathList(getGitStatus());

if (!pathList.length) {
    log('There is no file to be commited, skip hook.', 0);
}

// Transform all paths to Unix format.
// For example: 'C:\\a\\b' -> '/C/a/b'.
pathList = pathList.map(transPathWinToUnix);

// Filter paths by "filter" callback function.
if (typeof callbacks.filter === 'function') {
    pathList = pathList.filter(callbacks.filter);
}

if (!pathList.length) {
    log('There is no file path after filtering, skip hook.', 0);
}

// If useRelativePath() return true, transform absolute paths to relative paths.
if (typeof callbacks.useRelativePath === 'function') {
    if (callbacks.useRelativePath()) {
        pathList = pathList.map(
            item => item.replace(PKG_JSON_DIR_PATH_UNIX, '.')
        );
    }
}

let cmd = callbacks.command();
cmd = cmd.replace('<paths>', pathList.join(' '));

let isPassed = true;
try {
    execSync(cmd);
} catch (e) {
    isPassed = false;
}

if (!isPassed) {
    process.exit(1);
}
