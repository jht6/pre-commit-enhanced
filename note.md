新增需求:  
每次commit时执行eslint校验所有代码, 速度可能比较慢.  
希望提供一种方式, 可以只校验本次commit的文件.

方案:
1. 安装本包之前, 在package.json设定一个flag, 安装过程中检测flag, 若为真, 则将一份模板代码pre-commit-traverse.js到packageJsonDir中
2. 在package.json中, 自动生成相关scripts命令

pre-commit-traverse.js:
1. 取到要commit的文件路径列表
2. 对路径列表进行遍历
3. 遍历的具体操作留白, 供使用者填入要执行的代码