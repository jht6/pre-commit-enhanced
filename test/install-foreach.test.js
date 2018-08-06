'use strict';

const assume = require('assume');
const Installer = require('../scripts/install-foreach');
const SCRIPT_PCE_FOREACH = 'pce-foreach';
const FOREACH_COMMAND_KEY = 'pce-foreach-command';
const { FOREACH_COMMAND_TPL } = require('../common/const')();

describe('install-foreach', function () {

    it('is exported as a function', function () {
        assume(Installer).is.a('function');;
    });

    it('can be initialized without a `new` keyword', function () {
        let installer = Installer();
        assume(installer).is.instanceOf(Installer);
        assume(installer.init).is.a('function');
    });

    describe('#addForeachInScripts', function () {
        it('correctly add "pce-foreach" in "scripts" of json', function () {
            let installer = new Installer();
            let json = installer.addForeachInScripts({
                scripts: {}
            });
            let pceForeach = json.scripts['pce-foreach'];
            assume(pceForeach).is.a('string');
            assume(pceForeach).is.ok();
            assume(pceForeach).startWith('node ');
            assume(pceForeach).endsWith('foreach.js');
        });
    });

    describe('#addForeachInPrecommit', function () {
        let installer;

        beforeEach(function () {
            installer = new Installer();
        });

        it('correctly add config when no "pre-commit" or "precommit"', function () {
            let json = installer.addForeachInPrecommit({});
            let preCommit = json['pre-commit'];
            assume(preCommit).is.a('array');
            assume(preCommit[0]).equals(SCRIPT_PCE_FOREACH);
        });

        ['pre-commit', 'precommit'].forEach(function (preCommitKey) {
            it(`correctly add config when it exists "${preCommitKey}":{run:["a"]}`, function () {
                let json = installer.addForeachInPrecommit({
                    [preCommitKey]: {
                        run: ['a']
                    }
                });
                let preCommit = json[preCommitKey];
                assume(preCommit).is.a('object');
                assume(preCommit.run).is.a('array');
                assume(preCommit.run[0]).equals('a');
                assume(preCommit.run[1]).equals(SCRIPT_PCE_FOREACH);
            });

            it(`correctly add config when it exists "${preCommitKey}":{run:""}`, function () {
                let json = installer.addForeachInPrecommit({
                    [preCommitKey]: {
                        run: ''
                    }
                });
                let preCommit = json[preCommitKey];
                assume(preCommit).is.a('object');
                assume(preCommit.run).is.a('string');
                assume(preCommit.run).equals(SCRIPT_PCE_FOREACH);
            });

            it(`correctly add config when it exists "${preCommitKey}":{run:"a"}`, function () {
                let json = installer.addForeachInPrecommit({
                    [preCommitKey]: {
                        run: 'a'
                    }
                });
                let preCommit = json[preCommitKey];
                assume(preCommit).is.a('object');
                assume(preCommit.run).is.a('string');
                assume(preCommit.run).equals(`a, ${SCRIPT_PCE_FOREACH}`);
            });

            it(`correctly add config when it exists "${preCommitKey}":{run:"a,b"}`, function () {
                let json = installer.addForeachInPrecommit({
                    [preCommitKey]: {
                        run: 'a,b'
                    }
                });
                let preCommit = json[preCommitKey];
                assume(preCommit).is.a('object');
                assume(preCommit.run).is.a('string');
                assume(preCommit.run).equals(`a, b, ${SCRIPT_PCE_FOREACH}`);
            });

            it(`correctly add config when it exists "${preCommitKey}":{run:" a  , b-b  ,  c "}`, function () {
                let json = installer.addForeachInPrecommit({
                    [preCommitKey]: {
                        run: ' a  , b-b,  c '
                    }
                });
                let preCommit = json[preCommitKey];
                assume(preCommit).is.a('object');
                assume(preCommit.run).is.a('string');
                assume(preCommit.run).equals(`a, b-b, c, ${SCRIPT_PCE_FOREACH}`);
            });

            it(`correctly add config when it exists "${preCommitKey}":{}`, function () {
                let json = installer.addForeachInPrecommit({
                    [preCommitKey]: {}
                });
                let preCommit = json[preCommitKey];
                assume(preCommit).is.a('object');
                assume(preCommit.run).is.a('array');
                assume(preCommit.run).is.size(1);
                assume(preCommit.run[0]).equals(SCRIPT_PCE_FOREACH);
            });

            it(`correctly add config when it exists "${preCommitKey}":"a,b"`, function () {
                let json = installer.addForeachInPrecommit({
                    [preCommitKey]: 'a,b'
                });
                let preCommit = json[preCommitKey];
                assume(preCommit).is.a('string');
                assume(preCommit).equals(`a, b, ${SCRIPT_PCE_FOREACH}`);
            });

            it(`correctly add config when it exists "${preCommitKey}":["a"]`, function () {
                let json = installer.addForeachInPrecommit({
                    [preCommitKey]: ['a']
                });
                let preCommit = json[preCommitKey];
                assume(preCommit).is.a('array');
                assume(preCommit).is.size(2);
                assume(preCommit[0]).equals('a');
                assume(preCommit[1]).equals(SCRIPT_PCE_FOREACH);
            });
        });

    });

    describe('#addForeachCommand', function () {
        it(`correctly add "${FOREACH_COMMAND_KEY}" in json`, function () {
            let installer = new Installer();
            let json = installer.addForeachCommand({});
            assume(json[FOREACH_COMMAND_KEY]).equals(FOREACH_COMMAND_TPL);
        });
    });
});
