'use strict';

console.log('start run foreach');

const spawn = require('cross-spawn');
const utils = require('../common/utils');

// TODO: 遍历执行命令
// 1. 获取到要commit的文件路径列表
//    使用cross-spawn, 调用spawnSync('git', ['status', '--porcelain'], {stdio: 'pipe'});
//    获取当前变化的文件, 要过滤出前缀为A或M的项
//    并将每项转为绝对路径, 并考虑路径中含空格的情况
// 2. 从package.json中的"pce-foreach-command"解析出要执行的命令
//    "cmd-name cmd-opt <filepath>"
//                   ↓
//    "cmd-name",  ["cmd-opt", "<filepath>"]
//                   ↓
// 3. 对文件路径列表遍历执行命令
//    "cmd-name",  ["cmd-opt", "绝对路径"]
//                   ↓
//    spawnSync("cmd-name", ["cmd-opt", "绝对路径"], {stdio: [0, 1, 2]})

function ForeachRunner() {
    if (!this) {
        return new ForeachRunner();
    }

    this.filePathList = [];
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

};

ForeachRunner.prototype.getGitStatus = function () {
    let status = '';
    try {
        status = spawn.sync('git', ['status', '--porcelain'], {
            stdio: 'pipe',
            cwd: utils.getPackageJsonDirPath()
        }).toString();

        return status;
    } catch (e) {
        utils.log([
            `Fail: run "git status --porcelain",`,
            `Skipping running foreach.`
        ], 0);
    }
};

ForeachRunner.prototype.getFilePathList = function (gitStatus) {
    let list = gitStatus.split('\n');

    // TODO: 过滤掉一些path
    // 1. "??"开头的过滤掉
    // 2. 使用fs.exists判定不存在的路径过滤掉
};
