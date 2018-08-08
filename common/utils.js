const path = require('path');
const fs = require('fs');
const { LOG_PREFIX } = require('./const')();

function getPackageJsonDirPath() {
    return path.resolve(__dirname, '..', '..', '..');
}

/**
 * 从指定目录位置开始递归向上搜索含".git"文件夹的git项目根目录路径
 * @param {String} currentPath 开始搜索的目录路径
 * @return {String|null} git根目录路径, 若未找到则返回null
 */
function getGitRootDirPath(currentPath) {
    currentPath = path.resolve(currentPath);

    let dotGitPath = path.join(currentPath, '.git');

    if (
        fs.existsSync(currentPath) &&
        fs.existsSync(dotGitPath) &&
        fs.lstatSync(dotGitPath).isDirectory()
    ) {
        return currentPath;
    } else {
        let parentPath = path.resolve(currentPath, '..');
        return parentPath === currentPath ? null : getGitRootDirPath(parentPath);
    }
}

/**
 * Write message to the terminal.
 * If exitCode is passed in, "process.exit(exitCode)" will be called.
 * @param {Array|String} lines The messages that need to be written.
 * @param {Number} exitCode Exit code for the process.exit.
 * @param {Object} opt Options for printing:
 *   noColor: if set as true, there will be no color under log prefix.
 */
function log(lines, exitCode, opt) {
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

    if (typeof exitCode === 'number') {
        process.exit(exitCode);
    }
}

module.exports = {
    getPackageJsonDirPath,
    getGitRootDirPath,
    log
};
