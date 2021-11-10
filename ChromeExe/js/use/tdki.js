// User Javascript and Css 插件脚本 运行机制 应该是在 DOM 渲染完毕之后
// 部分网站 比如掘金的 TDK 信息渲染 使用Vue 在 类似 created 的钩子里 ，DOM渲染完毕之后 通过接口获取数据并重置 TDK 信息
// 本脚本需要在页面内容全部加载完毕之后才能执行，否则无法获取到 重新渲染后的TDK信息

let showIconsList = [];
let showImagesList = [];
const httpRegex = new RegExp(/http/);

window.onload = () => {
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
        console.log("%c查找mainfest信息", "color:orange", feil);
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

            console.log(
              "%c预存-mainfest.json数据 ",
              "color:blue",
              data,
              showIconsList
            );

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

        console.log("获取到favcion", img.src, showIconsList);
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
      console.log("描述List", subMetas);
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
      console.log("预览图List", subImgs);
      showImagesList = subImgs;
    }

    // 获取网页title
    const titles = document.getElementsByTagName("title");
    const pageTitle = titles[0]?.innerText;

    // 获取网页链接
    const linkUrl = window.location.href;

    // descipiton
    const desc = getDesc()[0];

    // 获取网页关键词
    const keywords = document.querySelector('meta[name="keywords"]')?.content;

    // 获取网页icon
    getIcons();

    // 获取网页预览图
    getImgs();

    console.log("%c获取网页title", "color:skyblue", pageTitle);
    console.log("%c获取网页description", "color:skyblue", desc);
    console.log("%c获取网页关键词", "color:skyblue", keywords);
    console.log("%c获取网页图标", "color:green", showIconsList);
    console.log("%c获取网页预览图", "color:green", showImagesList);
    addContent();

    // 获取之后 添加 遮罩面板到项目内部
    function addContent() {
      let div = document.createElement("div");
      div.id = "xy-auto-webs-panel";
      div.className = "xy-auto-webs-panel xy-none";

      // 添加文字
      let topTags = [
        { name: "标题", key: "title", content: pageTitle },
        { name: "链接", key: "link", content: linkUrl },
        { name: "描述", key: "description", content: desc },
        { name: "关键词", key: "keywords", content: keywords },
      ];
      topTags.forEach((item) => {
        let itemDiv = document.createElement("div");
        itemDiv.name = itemDiv.key;
        itemDiv.className = "xy-auto-webs-panel-item";

        let p = document.createElement("div");
        p.innerText = item.name;
        p.className = "xy-auto-webs-panel-item-title";

        let content = document.createElement("div");
        content.innerText = item.content || "";
        content.className = "xy-auto-webs-panel-item-content xy-select-all";
        content.onmousedown = () => {
          navigator.clipboard.writeText(item.content);
        };

        itemDiv.appendChild(p);
        itemDiv.appendChild(content);
        div.appendChild(itemDiv);
      });

      // 添加 图标
      let imgTags = [
        { name: "图标", key: "icon", content: showIconsList },
        { name: "预览图", key: "image", content: showImagesList },
      ];

      imgTags.forEach((item, index) => {
        let itemDiv = document.createElement("div");
        itemDiv.name = itemDiv.key;
        itemDiv.className = "xy-auto-webs-panel-item";

        let p = document.createElement("div");
        p.innerText = item.name;
        p.className = "xy-auto-webs-panel-item-title";

        let content = document.createElement("div");
        content.className = "xy-auto-webs-panel-item-content";
        content.id = `xy-auto-webs-panel-item-content-${index + 1}`;

        // content 下 添加自定义数量的节点
        item.content = [...new Set(item.content)]
        item.content.forEach((imgItem, imgIndex) => {
          let imgOuter = document.createElement("div");
          imgOuter.className = "xy-auto-webs-panel-item-img-outer";

          let imgTitle = document.createElement("div");
          imgTitle.className = "xy-auto-webs-panel-item-img-url";
          if (!httpRegex.test(imgItem)) {
            imgTitle.className = "xy-auto-webs-panel-item-img-url xy-ells-2";
          }
          imgTitle.innerText = imgItem;
          imgTitle.onmousedown = () => {
            navigator.clipboard.writeText(imgItem);
          };

          let img = document.createElement("img");
          img.className = "xy-auto-webs-panel-item-img";
          img.alt = "（无图片）";
          img.src = imgItem || "";

          imgOuter.appendChild(imgTitle);
          imgOuter.appendChild(img);

          content.appendChild(imgOuter);
        });

        itemDiv.appendChild(p);
        itemDiv.appendChild(content);
        div.appendChild(itemDiv);
      });

      // 框外跟随滚动

      document.body.appendChild(div);
    }
  }
  document.body.appendChild(script);

  //  添加按钮 控制 框的展示 与 隐藏
  var canXyPanelShow = false;
  let button = document.createElement("div");
  button.className = "xy-auto-webs-panel-btn";
  button.innerText = "网页信息 开/关";
  button.onmousedown = (e) => {
    let webSiteInfoPanel = document.getElementById("xy-auto-webs-panel");
    if (!webSiteInfoPanel) return;

    if (canXyPanelShow) {
      canXyPanelShow = false;
      // 或者使用 webSiteInfoPanel.setAttribute("class", xxx)
      webSiteInfoPanel.className = "xy-auto-webs-panel xy-none";
    } else {
      canXyPanelShow = true;
      webSiteInfoPanel.className = "xy-auto-webs-panel xy-show";
    }
  };
  document.body.appendChild(button);
};

// 更新展示 Icon
// 清空原有节点 - 重新
// 或者 内部添加新增内容
function refreshIconImg() {
  let iconContent = document.getElementById(
    "xy-auto-webs-panel-item-content-1"
  );
  if (!iconContent) {
    setTimeout(() => {
      refreshIconImg();
    }, 300);
    return;
  }
  iconContent.innerHTML = "";
  showIconsList = [...new Set(showIconsList)];

  showIconsList.forEach((imgItem, imgIndex) => {
    let imgOuter = document.createElement("div");
    imgOuter.className = "xy-auto-webs-panel-item-img-outer";

    let imgTitle = document.createElement("div");
    imgTitle.className = "xy-auto-webs-panel-item-img-url";
    if (!httpRegex.test(imgItem)) {
      imgTitle.className = "xy-auto-webs-panel-item-img-url xy-ells-2";
    }
    imgTitle.innerText = imgItem;
    imgTitle.onmousedown = () => {
      navigator.clipboard.writeText(imgItem);
    };

    let img = document.createElement("img");
    img.className = "xy-auto-webs-panel-item-img";
    img.alt = "（无图片）";
    img.src = imgItem || "";

    imgOuter.appendChild(imgTitle);
    imgOuter.appendChild(img);

    iconContent.appendChild(imgOuter);
  });
}
