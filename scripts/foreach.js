'use strict';

console.log('start run foreach');

const spawn = require('cross-spawn');
const utils = require('../common/utils');
const exists = require('fs').existsSync;

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
    this.gitRootDirPath = process.cwd();
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
            cwd: this.gitRootDirPath
        }).toString();

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
    let list = gitStatusStr.split('\n');

    // Exclude strings which start with "??" (Untraced paths)
    list = list.filter(path => !/^\?\?/.test(path));

    list = list.map(path => path.substring(startIndex));

    list = list.filter(path => exists(path));

    return list;
};
