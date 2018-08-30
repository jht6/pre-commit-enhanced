'use strict';

const path = require('path');
const spawn = require('cross-spawn');
const utils = require('../common/utils');
const exists = require('fs').existsSync;

const GIT_ROOT = utils.getGitRootDirPath(process.cwd());
const {
    FOREACH_COMMAND_KEY,
    FOREACH_COMMAND_PARAM
} = require('../common/const')();

/**
 * Foreach runner constructor.
 * @param {Object} options Optional configuration, primarily used for testing.
 */
function ForeachRunner(options) {
    if (!new.target) {
        return new ForeachRunner();
    }

    this._OPT_ = options || {};
    this.filePathList = [];
    this.packageJsonDirPath = process.cwd();
    this.command = '';
}

ForeachRunner.prototype.run = function () {
    let gitStatus = this.getGitStatus();
    if (!gitStatus) {
        utils.log([
            `There is nothing to commit,`,
            `Skipping running foreach.`
        ], 0);
    }

    this.filePathList = this.getFilePathList(gitStatus);
    if (!this.filePathList.length) {
        utils.log([
            `There is nothing to traverse,`,
            `Skipping running foreach.`
        ], 0);
    }

    this.command = this.getCommandFromPackageJson();
    this.parsedCommand = this.parseCommand(this.command);
    this.traverse(this.filePathList, this.parsedCommand);
};

/**
 * Execute "git status --porcelain" in Git project root folder,
 * and get a status string that can be parsed simply.
 * @return {String} string of git status
 */
ForeachRunner.prototype.getGitStatus = function () {
    let status = '';
    try {
        status = spawn.sync('git', ['status', '--porcelain'], {
            stdio: 'pipe',
            cwd: GIT_ROOT
        }).stdout.toString();

        return status;
    } catch (e) {
        utils.log([
            `Fail: run "git status --porcelain",`,
            `Skipping running foreach.`
        ], 0);
    }
};

/**
 * Get list of absolute file paths from string of git status, only retaining
 * paths of new and modified file.
 * @param {String} gitStatusStr output of running "git status --porcelain"
 * @return {Array} list of paths
 */
ForeachRunner.prototype.getFilePathList = function (gitStatusStr) {
    const startIndex = 3;
    const testFlag = this._OPT_;
    const gitRoot = testFlag.isTesting && testFlag.gitRoot ?
        testFlag.gitRoot : GIT_ROOT;

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
};

/**
 * Get the value of "pce-foreach-command" property from package.json.
 * @return {String} the value of "pce-foreach-command"
 */
ForeachRunner.prototype.getCommandFromPackageJson = function () {
    let json = null,
        command = '';
    try {
        json = require(path.join(
            utils.getPackageJsonDirPath(),
            'package.json'
        ));
    } catch (e) {
        utils.log([
            `Fail: Require json from package.json at ${this.packageJsonPath}`,
            `Skipping the hook, process will exit..`,
            `Error message is:`
        ]);
        console.log(e);
        process.exit(0);
    }

    if (json && json[FOREACH_COMMAND_KEY]) {
        command = json[FOREACH_COMMAND_KEY];
    }

    return command;
};

/**
 * Validate if the passed command is like "command-name [...] <filepath> [...]".
 * @param {String} command string of command
 * @return {Boolean} if the command is legal
 */
ForeachRunner.prototype.validateCommand = function (command) {
    const re = new RegExp(`^.*[\\w]+\\s+${FOREACH_COMMAND_PARAM}(\\s+.*)*$`);
    return re.test(command);
};

/**
 * Get parsed command from original command string.
 * @param {String} command original command string
 * @return {Object} an object contains info of command
 */
ForeachRunner.prototype.parseCommand = function (command) {
    if (!this.validateCommand(command)) {
        if (this._OPT_.isTesting) {
            return null;
        } else {
            utils.log([
                `Your "pce-foreach-command" value is "${command}"`,
                `It's format is incorrect, please modify it in package.json. For example:`,
                `"echo ${FOREACH_COMMAND_PARAM}"`
            ], 1);
        }
    }

    command = command.trim().split(/\s+/);

    let args = command.slice(1);
    let ret = {
        cmd: command[0],
        args: args,
        paramIndex: args.indexOf(FOREACH_COMMAND_PARAM)
    };

    return ret;
};

/**
 * Traverse list of paths and execute command for each path.
 * @param {Array} pathList list of file paths
 * @param {Object} parsedCommand result of "parseCommand" method
 */
ForeachRunner.prototype.traverse = function (pathList, parsedCommand) {
    const { cmd, paramIndex } = parsedCommand;
    let args = parsedCommand.args.slice(0);
    let isPassed = true;
    pathList.forEach(filePath => {
        args[paramIndex] = filePath;
        let ret = spawn.sync(cmd, args, {
            stdio: [0, 1, 2]
        });

        if (ret.status && isPassed) {
            isPassed = false;
        }
    });

    if (!isPassed) {
        process.exit(1);
    }
};

// Expose the Hook instance so we can use it for testing purposes.
module.exports = ForeachRunner;

// Run only if this script is executed through CLI
if (require.main === module) {
    const foreachRunner = new ForeachRunner();
    foreachRunner.run();
}
