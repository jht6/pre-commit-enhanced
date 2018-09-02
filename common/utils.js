const path = require('path');
const fs = require('fs');
const spawn = require('cross-spawn');
const exists = require('fs').existsSync;
const { LOG_PREFIX } = require('./const')();

function getPackageJsonDirPath() {
    return path.resolve(__dirname, '..', '..', '..');
}

/**
 * Search the root dir of Git project recursively from appointed dir path.
 * @param {String} currentPath The dir path where start to search.
 * @return {String|null} the root dir path of Git project. If not found, return null.
 */
function getGitRootDirPath(currentPath, needLog) {
    currentPath = path.resolve(currentPath);

    let dotGitPath = path.join(currentPath, '.git');

    if (
        fs.existsSync(currentPath) &&
        fs.existsSync(dotGitPath) &&
        fs.lstatSync(dotGitPath).isDirectory()
    ) {
        if (needLog) {
            log(`Success: Found ".git" folder in ${currentPath}`);
        }
        return currentPath;
    } else {
        let parentPath = path.resolve(currentPath, '..');

        // Stop if we are on top folder
        if (parentPath === currentPath) {
            if (needLog) {
                log(`Not found any ".git" folder, stop searching.`);
            }
            return null;
        } else {
            // Continue to search from parent folder.
            if (needLog) {
                log(`Not found ".git" folder in ${currentPath}, continue...`);
            }
            return getGitRootDirPath(parentPath, !!needLog);
        }
    }
}

/**
 * Write message to the terminal.
 * If exitCode is passed in, "process.exit(exitCode)" will be called.
 * @param {Array|String} lines The messages that need to be written.
 * @param {Number} exitCode Exit code for the process.exit.
 * @param {Object} opt Options for printing:
 *   noColor: if set as true, there will be no color under log prefix.
 * @param {Boolean} isTesting Options for unit testing, you shouldn't use it.
 */
function log(lines, exitCode, opt, isTesting) {
    opt = opt || {};

    if (!Array.isArray(lines)) {
        lines = lines.split('\n');
    }

    let prefix = opt.noColor ?
        `${LOG_PREFIX} ` :
        `\u001b[38;5;166m${LOG_PREFIX}\u001b[39;49m `;

    lines.push(''); // Whitespace at the end of the log.
    lines.unshift(''); // Whitespace at the beginning.

    lines = lines.map(line => prefix + line);

    lines.forEach(line => {
        if (typeof exitCode === 'number' && exitCode > 0) {
            console.error(line);
        } else {
            console.log(line);
        }
    });

    if (isTesting) {
        return {
            lines,
            exitCode
        };
    } else if (typeof exitCode === 'number') {
        process.exit(exitCode);
    }
}

/**
 * Execute "git status --porcelain" in Git project root folder,
 * and get a status string that can be parsed simply.
 * @return {String} string of git status
 */
function getGitStatus() {
    let status = '';
    try {
        status = spawn.sync('git', ['status', '--porcelain'], {
            stdio: 'pipe',
            cwd: getGitRootDirPath(process.cwd())
        }).stdout.toString();

        return status;
    } catch (e) {
        log([
            `Fail: run "git status --porcelain",`,
            `Skipping running foreach.`
        ], 0);
    }
}

/**
 * Get list of absolute file paths from string of git status, only retaining
 * paths of new and modified file.
 * @param {String} gitStatusStr output of running "git status --porcelain"
 * @param {Object} testFlag just for testing.
 * @return {Array} list of paths
 */
function getFilePathList(gitStatusStr, testFlag) {
    testFlag = testFlag || {};
    const startIndex = 3;
    const gitRoot = testFlag.isTesting && testFlag.gitRoot ?
        testFlag.gitRoot : getGitRootDirPath(process.cwd());

    let pathList = gitStatusStr.split('\n')
        // Exclude empty string and which starts with "??"(Untraced paths)
        .filter(item => !!item && !/^\?\?/.test(item));

    // Transform to absolute path
    if (!(testFlag.isTesting && testFlag.skipMapToAbsPath)) {
        pathList = pathList.map(item => path.join(gitRoot ,item.substring(startIndex)));
    }

    // Confirm the path exists
    if (!(testFlag.isTesting && testFlag.skipFilterNotExist)) {
        pathList = pathList.filter(item => exists(item));
    }

    return pathList;
}

module.exports = {
    getPackageJsonDirPath,
    getGitRootDirPath,
    log,
    getGitStatus,
    getFilePathList
};
