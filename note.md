TODO:

1. 增加对运行命令的计时功能, 输出内容包括: 各命令所用时间, 所有命令消耗的总时间 (index.js中已支持, foreach中尚未支持))
2. 对所提交的文件路径集合进行处理的代码模板pce-batch.js, 提供可编程支持, 能够灵活处理所有场景
    1) 所有要提交的文件路径组成路径列表, 在pce-batch.js可通过标志位控制处理绝对路径还是相对路径
    2) 判断路径是否符合自定义的限定规则, 不符合规则的路径过滤掉, 从而不进行处理
    3) 使用支持多参数的命令处理路径列表, 例如"eslint path1 path2"

    一个使用eslint的完整场景为:
    0) 首先执行"npm run pce-install-batch", 自动在pre-commit数组中增加"pce-batch", 而scripts中"pce-batch"为"node ./pce-batch.js"
    1) git commit
    2) 触发pre-commit钩子, 调用"pce-batch", 继而执行pce-batch.js
    3) 拿到commit的文件列表, 转为字符串
    4) 拼凑成形如"eslint path1 path2"的命令, 使用child_process.execSync执行


3. other
    已完成  1) 获取提交文件列表的功能抽出到common作为公共函数, 相应的单元测试也需要转移
    2) 安装本包时, 需在package.json中添加install-pce-batch, 功能是将scripts/pce-batch.js复制到package.json所在目录, 同时自动在pre-commit和scripts中添加相应的命令
    3) pce-batch.js中有关功能的标志位都提到顶部, 方便使用者自行配置

4. 完整场景的回归测试:
    0) 提前预设好测试的目录结构(含.gitignore, package.json), 主要含两种:
        一是: 普通场景, 即单纯的前端项目, package.json就在git仓库根目录
        .
        └── root
            ├── .git
            ├── node_modules
            └── package.json

        二是: 复杂场景, 即前端代码不在git仓库根目录, 而在子目录中, 例如:
        .
        └── root
            ├── .git
            └── ui
                ├── node_modules
                │   └── xxx
                ├── src
                │   └── xxx
                └── package.json
    
    普通场景的已完成, 复杂场景的后面处理.

5. install-batch.js的所需执行的过程和install-foreach的几乎完全一样.
    1. 要先调整common内的结构
    2. 将install-foreach内的方法抽出作为公共函数, 并重构install-foreach


