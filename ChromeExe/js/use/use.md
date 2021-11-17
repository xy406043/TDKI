#### 此目录下

在其他地方使用 或者 备份方案

prefer 下是 User Javascript and Css 插件使用的 直接注入网页的代码
popup.js  是原本 作为插件的 popup.js ，在点击右上图标时 向页面动态注入 js 代码，而在此种方式也无法访问页面js，因此在其中。  插入inject-scirpts ，只是 inject-scrpts 的使用其实只是因为 content-scipts无法 访问原页面的 变量，而本插件无需使用 inject-scipts 。因此直接在mainfest.json 使用 content-scripts 。 