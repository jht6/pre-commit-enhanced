let path = require('path');

function getPackageJsonDirPath() {
    return path.resolve(__dirname, '..', '..', '..');
}

module.exports = {
    getPackageJsonDirPath
};
