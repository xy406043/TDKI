// 向页面注入JS
function injectCustomJs(jsPath) {
    jsPath = jsPath || "js/use/prefer/tdki.css"; // 直接插入脚本
    var temp = document.createElement("script");
    temp.setAttribute("type", "text/javascript");
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    // 看的教程使用的 chrome.extension 但是 chrome 官方文档 已更新成为使用chrome.runtime - 还是不晓得我使用存在什么问题
    temp.src = chrome.runtime.getURL(jsPath);
    temp.onload = function () {
      // 放在页面不好看，执行完后移除掉
      this.parentNode.removeChild(this);
    };
    // console.log("new",temp.src,document)
    document.body.appendChild(temp);
  }
  injectCustomJs();
  
  