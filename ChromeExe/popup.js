// popup.js 只有当 点击icon打开图标时才能接收到来此content-scrips 的数据 ，而且会与 background.js 互斥，同时只会有一方可以接收到
// content-scipts 可以将数据传递给 background.js 而 popup.js =可以访问backgorund.js 内部的属性
// 打开popup-show.js 时 页面显示 此数据即可

// 如何 在点击的时候 popup.js 获取数据
// 后续 -- 状态存续

const excludePages = [
  "chrome://newtab/",
  "chrome://extensions/",
  "chrome://bookmarks",
  "chrome-extension://"
];
const httpRegex = new RegExp(/http/);

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// !! chrome.runtime.getBackgroundPage() 返回null 上述的则会显示  no background page
// chrome.runtime.getBackgroundPage((window) => {
//   console.log("获取到background.window", window);
//   if (window) {
//     addContent(bg.LocalPageData);
//   }
// });

// ~~ 因此切换思路 使用 storage 获取数据
chrome.storage.sync.get(["LocalPageData"], async function (result) {
  let tab = await getCurrentTab();
  console.log("获取链接",tab.url)


  // 特殊页面时 不展示
  if (excludePages.some(x => tab.url.includes(x))) {
    noneContent();
    return;
  }

  console.log("获取存储数据", result, result["LocalPageData"][0]);
  let content = result["LocalPageData"][0];
  if (content) {
    // 当前页面只展示当前页面的内容
    if (content.tabId && content.tabId != tab.id) {
      doRefreshContent();
      return;
    }
    addContent(content);
  }
});

function doRefreshContent() {
  document.body.innerHTML = "";
  let div = document.createElement("div");
  div.className = "xy-none-info";
  div.innerText = "正在刷新内容，请重试！";

  document.body.appendChild(div);
}

function noneContent() {
  document.body.innerHTML = "";
  let div = document.createElement("div");
  div.className = "xy-none-info";
  div.innerText = "该页面无法获取网页信息";

  document.body.appendChild(div);
}

function addContent(pageData) {
  document.body.innerHTML = "";
  let div = document.createElement("div");
  div.id = "xy-auto-webs-panel";
  div.className = "xy-auto-webs-panel xy-none";

  const {
    pageTitle,
    linkUrl,
    desc,
    keywords,
    icons: showIconsList,
    imgs: showImagesList,
  } = pageData;

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
    item.content = [...new Set(item.content)];
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
