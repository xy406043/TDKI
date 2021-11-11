// content-script 注入 inject-scripts
// content-script 无法调用 页面本身的变量 ，如需使用 需要注入ineject-scripts 的形式


let showIconsList = [];
let showImagesList = [];
const httpRegex = new RegExp(/http/);


// window.onload = () => {
//   loadScriprt();
// };

// 每个页面 新建 刷新时 都会触发一次content-scripts
loadScriprt();

// 接收消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(" direct  ---- 页面接收数据", request, sender);
  // Tab选项卡变化 则更新数据‘
  if (request.type === "tabUpdate") {
    loadScriprt(request?.tab?.id);
  }
  sendResponse("background你好，我收到了你的消息！");
});


// 更新页面数据重新发送给后台
function refreshIconImg() {}


async function loadScriprt(id) {
  showIconsList = [];
  showImagesList = [];
  let script = document.createElement("script");
  script.src = "https://cdn.bootcdn.net/ajax/libs/fetch/3.6.2/fetch.js";
  script.setAttribute("type", "text/javascript");

  // top Level 无法使用 async await
  // todo 修改为油猴插件 / chrome插件
  script.onload = function () {
    loadInfo(true);
  };
  // 引入 外部脚本 在某些网站比如 github 会因为其安全策略CSP 而载入失败  为了确保基本功能正常使用 - 需要在加载失败时 不调用 外部库方法
  script.onerror = function () {
    loadInfo(false);
  };

  function loadInfo(hasLoadFetch) {
    // ~~ 获取网页的 Icon
    function getIcons() {
      // 方式一 直接获取link属性 截取url。 shortcut icon 是过时的写法
      const textArr = [
        "shortcut icon",
        "icon",
        "alternate icon",
        "mask-icon",
        "apple-touch-icon",
      ];
      textArr.forEach((item) => {
        let checkHref = document.querySelector(`link[rel="${item}"]`)?.href;
        if (checkHref) showIconsList.push(checkHref);
      });

      // 方式二 PWA 应用可以获取根域名的manifest  有链接的返回链接 没有的直接进行拼接
      // 只有 fetch 引入成功时才可以使用
      if (hasLoadFetch) {
        let feil = document.querySelector('link[rel="manifest"]')?.href;
        // console.log("%c查找mainfest信息", "color:orange", feil);
        if (feil) {
          fetch(feil).then(async (res) => {
            let data = await res.json();

            if (!data.icons || !data.icons.length) return;

            data.icons.forEach((iconItem, iconIndex) => {
              let url = httpRegex.test(iconItem.src)
                ? iconItem.src
                : document.location.origin + "/" + iconItem.src;
              showIconsList.push(url);
            });

            // console.log(
            //   "%c预存-mainfest.json数据 ",
            //   "color:blue",
            //   data,
            //   showIconsList
            // );

            setTimeout(function () {
              refreshIconImg();
            }, 2000);
          });
        }
      }

      // 方式三 未设置 link rel=type,而是直接放到网站根目录下，浏览器会  直接获取 favicon.ico
      let img = new Image();
      img.src = document.location.origin + "/favicon.ico";
      img.onload = function () {
        showIconsList.push(img.src);

        // console.log("获取到favcion", img.src, showIconsList);
        setTimeout(function () {
          refreshIconImg();
        }, 2000);
      };
      img.onerror = function () {
        console.log("该链接无效");
      };
    }

    // 获取网页描述
    function getDesc() {
      const textArrDes = ["description", "twitter:description"];
      const richArrs = ["og:description", "twitter:description"];
      let metas = document.getElementsByTagName("meta");

      let subMetas = [];
      for (let i = 0; i < metas.length; i++) {
        if (textArrDes.includes(metas[i].getAttribute("name"))) {
          subMetas.push(metas[i].getAttribute("content"));
        }
        if (richArrs.includes(metas[i].getAttribute("property"))) {
          subMetas.push(metas[i].getAttribute("content"));
        }
      }
      // console.log("描述List", subMetas);
      return subMetas;
    }

    // ~~ 获取网页预览图
    function getImgs() {
      const textArrDes = ["image", "twitter:image", "twitter:image:src"];
      const richArrs = ["og:image"];
      const catchProperty = ["name", "property", "itemprop"];
      let metas = document.getElementsByTagName("meta");

      let subImgs = [];
      // 摆烂 - 没有的不会匹配到 - 就这样吧
      for (let i = 0; i < metas.length; i++) {
        catchProperty.forEach((y) => {
          if (textArrDes.includes(metas[i].getAttribute(y))) {
            subImgs.push(metas[i].getAttribute("content"));
          }
          if (richArrs.includes(metas[i].getAttribute(y))) {
            subImgs.push(metas[i].getAttribute("content"));
          }
        });
      }
      // console.log("预览图List", subImgs);
      showImagesList = subImgs;
    }

    // 获取网页title
    const titles = document.getElementsByTagName("title");
    const pageTitle = titles[0]?.innerText;

    // 获取网页链接
    const linkUrl = window.location.href;

    // descipiton
    const desc = getDesc()[0] || "";

    // 获取网页关键词
    const keywords =
      document.querySelector('meta[name="keywords"]')?.content || "";

    // 获取网页icon
    getIcons();

    // 获取网页预览图
    getImgs();

    // setInterval(() => {
    //   addContent();
    // }, 4000);

    addContent();

    // 将获取到的数据 传输给background.js 或者 popup.js
    function addContent() {
      let pageData = {
        tabId: id,
        pageTitle,
        linkUrl,
        desc,
        keywords,
        icons: showIconsList,
        imgs: showImagesList,
      };
      chrome.runtime.sendMessage(pageData, (res) => {
        // console.log("来自后台的回复数据", res);
      });
    }
  }
  document.body.appendChild(script);
}
