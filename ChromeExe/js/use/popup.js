/**
 * 原本作为 popup.js使用
 */


let injectFile = document.getElementById('inject-file');
let injectFunction = document.getElementById('inject-function');

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

injectFile.addEventListener('click', async () => {
  let tab = await getCurrentTab();

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    // files: ['js/new/test.js']
    // files: ['js/use/tdki.js']
    files:['js/content/default.js']
  });
});

function showAlert(givenName) {
  alert(`Hello, ${givenName}`);
}

injectFunction.addEventListener('click', async () => {
  let tab = await getCurrentTab();

  let name = 'World';
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: showAlert,
    args: [name]
  });
});

