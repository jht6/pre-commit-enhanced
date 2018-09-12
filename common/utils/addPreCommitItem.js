/**
 * Append a script to "pre-commit" of an object.
 * @param {Object} json an object
 * @param {String} scriptName the name will be appended to "pre-commit" of json
 */
function addPreCommitItem(json, scriptName) {
    if (Object.prototype.toString.call(json) !== '[object Object]') {
        throw Error('argument "json" must be an object.');
    }

    if (typeof scriptName !== 'string' || !scriptName) {
        throw Error('argument "json" must be a non-empty string.');
    }

    let preCommitKey,
        preCommit;
    if (json['pre-commit']) {
        preCommitKey = 'pre-commit';
        preCommit = json[preCommitKey];
    } else if (json['precommit']) {
        preCommitKey = 'precommit';
        preCommit = json[preCommitKey];
    } else {
        preCommitKey = 'pre-commit';
        preCommit = null;
    }

    if (!preCommit) { // no "pre-commit" or "precommit" config now
        json[preCommitKey] = [scriptName];
    } else if (Object.prototype.toString.call(preCommit) === '[object Object]') {
        if (Array.isArray(json[preCommitKey].run)) { // for format of {run: ["a", "b", "c"]}
            json[preCommitKey].run.push(scriptName);
        } else if (typeof json[preCommitKey].run === 'string') { // for format of {run: "a, b, c"}
            json[preCommitKey].run = preCommit.run
                .split(/[, ]+/)
                .filter(cmd => !!cmd)
                .concat(scriptName)
                .join(', ');
        } else {
            json[preCommitKey].run = [scriptName];
        }
    } else if (typeof preCommit === 'string') { // for format of "a, b, c"
        json[preCommitKey] = preCommit
            .split(/[, ]+/)
            .filter(cmd => !!cmd)
            .concat(scriptName)
            .join(', ');
    } else if (Array.isArray(preCommit)) { // for format of ["a, b, c"]
        json[preCommitKey].push(scriptName);
    }

    return json;
}

module.exports = addPreCommitItem;
