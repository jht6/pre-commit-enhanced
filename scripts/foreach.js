'use strict';

console.log('test foreach');

// TODO: 遍历执行命令
// 1. 获取到要commit的文件路径列表
//    使用cross-spawn, 调用spawnSync('git', ['status', '--porcelain'], {stdio: 'pipe'});
//    获取当前变化的文件, 要过滤出前缀为A或M的项
// 2. 从package.json中的"pce-foreach-command"解析出要执行的命令
// 3. 对文件路径列表遍历执行命令
