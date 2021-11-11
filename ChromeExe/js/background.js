// manifest_version v3 版本
// background 会一直存在 且横跨选项卡  对于不同的页面需要处理不同的数据

let LocalPageData = {};
const excludePages = [
  "chrome://newtab/",
  "chrome://extensions/",
  "chrome://bookmarks",
];

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// 监听来自 content-scritps 的数据 - 需要区分Tab
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  LocalPageData = request;
  console.log(
    "已接受到来自content-script的回复",
    request,
    sender,
    sendResponse
  );

  chrome.storage.sync.get(["LocalPageData"], function (result) {
    chrome.storage.sync.set({ LocalPageData: [LocalPageData] }, function () {
      console.log("设置数据成功");
    });
  });

  sendResponse("我是后台接受到你的数据");
});

// ~~ 监听页面Tab 变化 - 传递给 popup.js 进行数据更新

//  监听tab页面变化 - 切换路由、状态变更等
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log("页面发生变化 刷新 or 新建", tabId, changeInfo,tab);
  if (excludePages.includes(changeInfo.url)) {
    return;
  }
  if (changeInfo.status === "loading" || !changeInfo.url) {
    return;
  }
  // 通知对应的tab页面url变化了,需要优化为离开立即移除，进入则加载完毕再添加
  SendMessage({
    tabId,
    message: { type: "tabUpdate", tab },
  });
});

// 切换选项卡时
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  let tab = await getCurrentTab();
  console.log("选项卡发生变化", activeInfo, tab);
  if (excludePages.includes(tab.url)) {
    return;
  }

  SendMessage({
    tabId: activeInfo.tabId,
    message: { type: "tabUpdate", tab },
  });
});

function SendMessage(options) {
  chrome.tabs.sendMessage(options.tabId, options.message, function (response) {
    console.log("来自content-script: direct.js的回复：" + response);
  });
}
