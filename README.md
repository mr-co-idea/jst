# jst

##  指南
* variate
    * 变量
    * `<@variate = defaltValue@>`
    * variate变量名，大消息字母
    * defaltValue为变量的默认值
* map
    * `@map[link]<@variate@>< code @>`
    * 判断是否遍历生成代码块
    * link，连接符，默认为`,`
    * variate，数组
    * code，代码块，代码块中的变量取自数组中的单元
* if
    * `@if<@variate@>< code @>`
    * 判断是否生成代码块
    * variate为判断源

## 原理

* 先解析
    * 转化成结构化数据
* 后运行
