新增需求:  
每次commit时执行eslint校验所有代码, 速度可能比较慢.  
希望提供一种方式, 可以只校验本次commit的文件.

方案:
1. install.js执行时, 给package.json中加一条"scripts":{
    "install-pce-foreach": "执行 install-foreach"
}

2. install-foreach.js执行时, 给package.json中加一条
"scripts":{
    "pce-foreach": "执行 foreach.js"
},
并添加:
"pce-foreach-command": "command <filepath>",
"pre-commit": ["pce-foreach"]

3. foreach.js执行时:
    1. 拿到要commit的文件路径列表
    2. 解析出package.json中的"pre-foreach-command"命令
    3. 遍历执行