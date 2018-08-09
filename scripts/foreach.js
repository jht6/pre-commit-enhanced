'use strict';

const path = require('path');
const spawn = require('cross-spawn');
const utils = require('../common/utils');
const exists = require('fs').existsSync;
const {
    FOREACH_COMMAND_KEY
} = require('../common/const')();
const GIT_ROOT = utils.getGitRootDirPath(process.cwd());

// TODO: 遍历执行命令
// 1. 获取到要commit的文件路径列表
//    使用cross-spawn, 调用spawnSync('git', ['status', '--porcelain'], {stdio: 'pipe'});
//    获取当前变化的文件, 要过滤出前缀为A或M的项
//    并将每项转为绝对路径, 并考虑路径中含空格的情况
// 2. 从package.json中的"pce-foreach-command"解析出要执行的命令
//    "cmd-name cmd-opt <filepath>"
//                   ↓ 1. trim()
//                   ↓ 2. split(/\s+/)
//                   ↓ 3. 取第0项做命令名, 取.slice(1)做参数
//    "cmd-name",  ["cmd-opt", "<filepath>"]
//                   ↓
// 3. 对文件路径列表遍历执行命令
//    "cmd-name",  ["cmd-opt", "绝对路径"]
//                   ↓
//    spawnSync("cmd-name", ["cmd-opt", "绝对路径"], {stdio: [0, 1, 2]})

function ForeachRunner() {
    if (!new.targe) {
        return new ForeachRunner();
    }

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
    // TODO: 解析this.command, 并遍历this.filePathList, 执行命令
};

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

ForeachRunner.prototype.getFilePathList = function (gitStatusStr) {
    const startIndex = 3;
    let pathList = gitStatusStr.split('\n')
        // Exclude empty string and which starts with "??"(Untraced paths)
        .filter(item => !!item && !/^\?\?/.test(item))
        // Transform to absolute path
        .map(item => path.join(GIT_ROOT ,item.substring(startIndex)))
        // Confirm the path exists
        .filter(item => exists(item));

    return pathList;
};

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

// Expose the Hook instance so we can use it for testing purposes.
module.exports = ForeachRunner;

// Run only if this script is executed through CLI
if (require.main === module) {
    const foreachRunner = new ForeachRunner();
    foreachRunner.run();
}
