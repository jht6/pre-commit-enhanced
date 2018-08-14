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

    describe('#validateCommand & #parseCommand', function () {
        let runner;

        this.beforeEach(function () {
            runner = new ForeachRunner({
                isTesting: true
            });
        });

        it('correctly handle "cmd <filepath>"', function () {
            const command = 'cmd <filepath>';
            assume(runner.validateCommand(command)).true();

            const parsed = runner.parseCommand(command);
            assume(parsed.cmd).equals('cmd');
            assume(parsed.args.length).equals(1);
            assume(parsed.args[0]).equals('<filepath>');
            assume(parsed.paramIndex).equals(0);
        });

        it('correctly handle "cmd2 subcmd <filepath>"', function () {
            const command = 'cmd2 subcmd <filepath>';
            assume(runner.validateCommand(command)).true();

            const parsed = runner.parseCommand(command);
            assume(parsed.cmd).equals('cmd2');
            assume(parsed.args.length).equals(2);
            assume(parsed.args[0]).equals('subcmd');
            assume(parsed.args[1]).equals('<filepath>');
            assume(parsed.paramIndex).equals(1);
        });

        it('correctly handle "cmd -f <filepath>"', function () {
            const command = '  cmd   -f   <filepath>  ';
            assume(runner.validateCommand(command)).true();

            const parsed = runner.parseCommand(command);
            assume(parsed.cmd).equals('cmd');
            assume(parsed.args.length).equals(2);
            assume(parsed.args[0]).equals('-f');
            assume(parsed.args[1]).equals('<filepath>');
            assume(parsed.paramIndex).equals(1);
        });

        it('correctly handle "cmd3 subcmd -a -b <filepath> -c -d"', function () {
            const command = 'cmd3 subcmd -a -b <filepath> -c -d';
            assume(runner.validateCommand(command)).true();

            const parsed = runner.parseCommand(command);
            assume(parsed.cmd).equals('cmd3');
            assume(parsed.args.length).equals(6);
            assume(parsed.args[0]).equals('subcmd');
            assume(parsed.args[1]).equals('-a');
            assume(parsed.args[2]).equals('-b');
            assume(parsed.args[3]).equals('<filepath>');
            assume(parsed.args[4]).equals('-c');
            assume(parsed.args[5]).equals('-d');
            assume(parsed.paramIndex).equals(3);
        });

        it('correctly handle "  cmd  -a <filepath>    -c -d   "', function () {
            const command = '  cmd  -a <filepath>    -c -d   ';
            assume(runner.validateCommand(command)).true();

            const parsed = runner.parseCommand(command);
            assume(parsed.cmd).equals('cmd');
            assume(parsed.args.length).equals(4);
            assume(parsed.args[0]).equals('-a');
            assume(parsed.args[1]).equals('<filepath>');
            assume(parsed.args[2]).equals('-c');
            assume(parsed.args[3]).equals('-d');
            assume(parsed.paramIndex).equals(1);
        });

        it('correctly handle "cmd filepath"', function () {
            const command = 'cmd filepath';
            assume(runner.validateCommand(command)).false();
            assume(runner.parseCommand(command)).equals(null);
        });

        it('correctly handle "<filepath>"', function () {
            const command = '<filepath>';
            assume(runner.validateCommand(command)).false();
            assume(runner.parseCommand(command)).equals(null);
        });

        it('correctly handle "cmd<filepath> -a"', function () {
            const command = 'cmd<filepath> -a';
            assume(runner.validateCommand(command)).false();
            assume(runner.parseCommand(command)).equals(null);
        });

        it('correctly handle "cmd <filepath>-a"', function () {
            const command = 'cmd <filepath>-a';
            assume(runner.validateCommand(command)).false();
            assume(runner.parseCommand(command)).equals(null);
        });

        it('correctly handle "cmd <errorparam>"', function () {
            const command = 'cmd <errorparam>';
            assume(runner.validateCommand(command)).false();
            assume(runner.parseCommand(command)).equals(null);
        });

    });
});


// validateCommand的各种输入测试

// parseCommand的各种输入测试

// traverse的各种输入测试
