// 后台脚本
chrome.runtime.onInstalled.addListener(() => {
  console.log('今日清单插件已安装');
});

// 监听图标点击事件，打开全屏页面
chrome.action.onClicked.addListener(() => {
  // 创建一个新标签页并加载index.html
  chrome.tabs.create({ url: 'index.html' }, (tab) => {
    // 监听标签页加载完成事件
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      // 确保是我们创建的标签页且已完成加载
      if (tabId === tab.id && changeInfo.status === 'complete') {
        // 移除监听器，避免重复执行
        chrome.tabs.onUpdated.removeListener(listener);
        
        // 向页面发送消息，请求进入全屏模式
        chrome.tabs.sendMessage(tab.id, { action: 'enterFullscreen' });
      }
    });
  });
});

// 处理来自页面的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getData') {
    chrome.storage.local.get(message.key, (result) => {
      sendResponse({ data: result[message.key] });
    });
    return true; // 表示异步响应
  }
});
