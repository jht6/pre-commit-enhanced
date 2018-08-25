# pre-commit-enhanced

[![Version npm][version]](http://browsenpm.org/package/pre-commit-enhanced)

[version]: https://img.shields.io/npm/v/pre-commit-enhanced.svg?style=flat-square

**pre-commit-enhanced**是基于[pre-commit](https://github.com/observing/pre-commit)开发的一款Git pre-commit钩子安装器. 它用于保证在你提交更改之前要先通过 `npm test` 或者其他自定义的脚本检验. 这些功能都可以方便的在你项目的 `package.json` 文件中配置.

但是别担心, 你仍然可以在提交文件时使用 `--no-verify` 或 `-n` 跳过 `pre-commit` 钩子, 从而进行强制提交.

### 安装

建议将 **pre-commit-enhanced** 作为 `package.json` 的 `devDependencies` 项来安装, 因为一般只需要在开发阶段才会用到本模块. 执行以下命令进行安装:

```
npm install --save-dev pre-commit-enhanced
```

若你的 `.git/hooks` 目录内已经存在 `pre-commit` 文件, 那么在本模块安装完后会用新的 `pre-commit` 文件覆盖它, 并且将原有的 `pre-commit` 重命名为 `pre-commit.old`.

### 配置

默认情况下, `pre-commit-enhanced` 会在含 `package.json` 文件的目录内执行 `npm test` 命令. 但如果 `package.json` 文件的 `test` 命令内容是执行 `npm init` 时所填充的初始值, 就不会执行它.

