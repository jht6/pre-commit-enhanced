const assume = require('assume');
const { addPreCommitItem } = require('../../common/utils');

const SCRIPT_PCE_FOREACH = 'pce-foreach';

describe('#addPreCommitItem', function () {

    it('correctly add config when no "pre-commit" or "precommit"', function () {
        let json = addPreCommitItem({}, SCRIPT_PCE_FOREACH);
        let preCommit = json['pre-commit'];
        assume(preCommit).is.a('array');
        assume(preCommit[0]).equals(SCRIPT_PCE_FOREACH);
    });

    ['pre-commit', 'precommit'].forEach(function (preCommitKey) {
        it(`correctly add config when it exists "${preCommitKey}":{run:["a"]}`, function () {
            let json = addPreCommitItem({
                [preCommitKey]: {
                    run: ['a']
                }
            }, SCRIPT_PCE_FOREACH);
            let preCommit = json[preCommitKey];
            assume(preCommit).is.a('object');
            assume(preCommit.run).is.a('array');
            assume(preCommit.run[0]).equals('a');
            assume(preCommit.run[1]).equals(SCRIPT_PCE_FOREACH);
        });

        it(`correctly add config when it exists "${preCommitKey}":{run:""}`, function () {
            let json = addPreCommitItem({
                [preCommitKey]: {
                    run: ''
                }
            }, SCRIPT_PCE_FOREACH);
            let preCommit = json[preCommitKey];
            assume(preCommit).is.a('object');
            assume(preCommit.run).is.a('string');
            assume(preCommit.run).equals(SCRIPT_PCE_FOREACH);
        });

        it(`correctly add config when it exists "${preCommitKey}":{run:"a"}`, function () {
            let json = addPreCommitItem({
                [preCommitKey]: {
                    run: 'a'
                }
            }, SCRIPT_PCE_FOREACH);
            let preCommit = json[preCommitKey];
            assume(preCommit).is.a('object');
            assume(preCommit.run).is.a('string');
            assume(preCommit.run).equals(`a, ${SCRIPT_PCE_FOREACH}`);
        });

        it(`correctly add config when it exists "${preCommitKey}":{run:"a,b"}`, function () {
            let json = addPreCommitItem({
                [preCommitKey]: {
                    run: 'a,b'
                }
            }, SCRIPT_PCE_FOREACH);
            let preCommit = json[preCommitKey];
            assume(preCommit).is.a('object');
            assume(preCommit.run).is.a('string');
            assume(preCommit.run).equals(`a, b, ${SCRIPT_PCE_FOREACH}`);
        });

        it(`correctly add config when it exists "${preCommitKey}":{run:" a  , b-b  ,  c "}`, function () {
            let json = addPreCommitItem({
                [preCommitKey]: {
                    run: ' a  , b-b,  c '
                }
            }, SCRIPT_PCE_FOREACH);
            let preCommit = json[preCommitKey];
            assume(preCommit).is.a('object');
            assume(preCommit.run).is.a('string');
            assume(preCommit.run).equals(`a, b-b, c, ${SCRIPT_PCE_FOREACH}`);
        });

        it(`correctly add config when it exists "${preCommitKey}":{}`, function () {
            let json = addPreCommitItem({
                [preCommitKey]: {}
            }, SCRIPT_PCE_FOREACH);
            let preCommit = json[preCommitKey];
            assume(preCommit).is.a('object');
            assume(preCommit.run).is.a('array');
            assume(preCommit.run).is.size(1);
            assume(preCommit.run[0]).equals(SCRIPT_PCE_FOREACH);
        });

        it(`correctly add config when it exists "${preCommitKey}":"a,b"`, function () {
            let json = addPreCommitItem({
                [preCommitKey]: 'a,b'
            }, SCRIPT_PCE_FOREACH);
            let preCommit = json[preCommitKey];
            assume(preCommit).is.a('string');
            assume(preCommit).equals(`a, b, ${SCRIPT_PCE_FOREACH}`);
        });

        it(`correctly add config when it exists "${preCommitKey}":["a"]`, function () {
            let json = addPreCommitItem({
                [preCommitKey]: ['a']
            }, SCRIPT_PCE_FOREACH);
            let preCommit = json[preCommitKey];
            assume(preCommit).is.a('array');
            assume(preCommit).is.size(2);
            assume(preCommit[0]).equals('a');
            assume(preCommit[1]).equals(SCRIPT_PCE_FOREACH);
        });
    });

});
