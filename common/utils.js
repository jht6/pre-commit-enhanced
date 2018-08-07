let path = require('path');
const { LOG_PREFIX } = require('./const')();

function getPackageJsonDirPath() {
    return path.resolve(__dirname, '..', '..', '..');
}

// TODO: 需增加一个函数, 通过传入路径逐层向上寻找含.git文件夹的目录路径作为git根目录

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
    log
};
