
> chrome 插件创建 Study研究
> 参考 [sxei/chrome-plugin-demo: 《Chrome插件开发全攻略》配套完整Demo，欢迎clone体验](https://github.com/sxei/chrome-plugin-demo/blob/master/README.md)

####  注意点
* 更改脚本之后，需要在chrome浏览器点击本地扩展进行更新
* icon图标 16 32 64 都要有 可以同源张

####  使用
TDKI 的使用场景要么 是直接通过 content-scripts 直接注入 要么是通过 popup进行显示 。
只是popup无法获取到 所处页面的DOM 而如果只是content-scripts 的话 其实和油猴脚本类似了。只是油猴使用Es5的方式会稍微麻烦一些

#### background.js
> background 会一直存在 且横跨选项卡  对于不同的页面需要处理不同的数据


#### popupjs

#### content-scripts
