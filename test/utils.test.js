'use strict';

const assume = require('assume');
const path = require('path');
const fs = require('fs');
const utils = require('../common/utils');

describe('common/utils', function () {

    describe('#getGitRootDirPath', function () {
        it('correctly find the this Git project\'s root dir', function () {
            let gitRootPath = utils.getGitRootDirPath(
                path.resolve(__dirname),
                true
            );
            let dotGitPath = path.join(gitRootPath, '.git');
            assume(fs.lstatSync(dotGitPath).isDirectory()).true();

            let myPath = path.join(gitRootPath, 'test/utils.test.js');
            assume(fs.existsSync(myPath)).true();
        });

        it('return "null" if it cannot find Git project\'s root dir', function () {
            // Start searching from the parent dir of Git project root dir
            let expectNull = utils.getGitRootDirPath(
                path.resolve('..'),
                true
            );
            assume(expectNull).equals(null);
        });
    });

    describe('#log', function () {
        it('correctly handle a string', function () {
            let ret = utils.log('test', null, null, true);
            assume(ret).is.a('object');
            assume(ret.lines).is.a('array');
            assume(ret.lines.length).equals(3);
            assume(/test$/.test(ret.lines[1])).true();
        });

        it('correctly handle a string with "\\n"', function () {
            let ret = utils.log('a\nb\nc', null, null, true);
            assume(ret).is.a('object');
            assume(ret.lines).is.a('array');
            assume(ret.lines.length).equals(5);
            assume(/a$/.test(ret.lines[1])).true();
            assume(/c$/.test(ret.lines[3])).true();
        });

        it('correctly handle an array', function () {
            let ret = utils.log(['a', 'b', 'c'], null, null, true);
            assume(ret).is.a('object');
            assume(ret.lines).is.a('array');
            assume(ret.lines.length).equals(5);
            assume(/a$/.test(ret.lines[1])).true();
            assume(/c$/.test(ret.lines[3])).true();
        });

        it('default has color', function () {
            let ret = utils.log('test', null, null, true);
            assume(ret.lines[0]).contains('\u001b');
        });

        it('can remove color when "noColor" is set', function () {
            let ret = utils.log('test', null, {
                noColor: true
            }, true);
            assume(ret.lines[0].indexOf('\u001b')).equals(-1);
        });
    });
});
