'use strict';

const path = require('path');
const assume = require('assume');
const ForeachRunner = require('../scripts/foreach');

describe('foreach', function () {

    it('is exported as a function', function () {
        assume(ForeachRunner).is.a('function');;
    });

    it('can be initialized without a `new` keyword', function () {
        let runner = ForeachRunner();
        assume(runner).is.instanceOf(ForeachRunner);
        assume(runner.run).is.a('function');
    });

    describe('#getFilePathList', function () {
        describe('can correctly execute the first filtering', function () {
            let runner;

            beforeEach(function () {
                runner = new ForeachRunner({
                    isTesting: true,
                    skipMapToAbsPath: true,
                    skipFilterNotExist: true
                });
            });

            it('can correctly filter empty string', function () {
                const gitStatus = [
                    `MM a.js\n`,
                    `A  b.js\n`,
                    `?? c.js\n`,
                    ` A d.js\n`,
                    ` D e.js\n`
                ].join('');

                const list = runner.getFilePathList(gitStatus);
                assume(list.length).is.above(0);

                const emptyList = list.filter(item => !item);
                assume(emptyList.length).equals(0);
            });

            it('can correctly filter string starts with "??"', function () {
                let gitStatus = `?? a.js\n?? b.js\n`;
                let list = runner.getFilePathList(gitStatus);
                assume(list.length).equals(0);

                gitStatus = `M  a.js\n?? b.js\n`;
                list = runner.getFilePathList(gitStatus);
                assume(list.length).equals(1);
                assume(list[0]).equals('M  a.js');
            });
        });

        it('can correctly map path to absolute path', function () {
            const gitRoot = '/test/gitroot/';
            const runner = new ForeachRunner({
                isTesting: true,
                gitRoot,
                skipFilterNotExist: true
            });
            const gitStatus = 'M  a.js\n A b.js\n';
            const list = runner.getFilePathList(gitStatus);
            assume(list.length).equals(2);
            assume(list[0]).equals(path.join(gitRoot, `a.js`));
            assume(list[1]).equals(path.join(gitRoot, `b.js`));
        });

    });
});

// getFilePathList的各种输入测试

// validateCommand的各种输入测试

// parseCommand的各种输入测试

// traverse的各种输入测试
