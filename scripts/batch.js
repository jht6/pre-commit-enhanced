'use strict';

const {
    getGitStatus,
    getFilePathList,
    getPackageJsonDirPath
} = require('../common/utils/index');

const PKG_JSON_DIR_PATH = getPackageJsonDirPath();

let pathList = getFilePathList(getGitStatus());

pathList = pathList
    .filter(item => /\.js$/.test(item)) // only remain "*.js" path
    .map(
        item => item
            .replace(PKG_JSON_DIR_PATH, '.')
            .replace(/\\\\/g, '/')
    );

console.log(`+++++++++++++++++++++++++++++++++`);
console.log(pathList);
console.log(`+++++++++++++++++++++++++++++++++`);
