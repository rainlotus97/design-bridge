// Background Service Worker for DesignBridge Chrome Extension
const SERVER_URL = 'http://127.0.0.1:23851';

chrome.runtime.onInstalled.addListener(() => {
  // Create Context Menus
  chrome.contextMenus.create({
    id: 'db-inspect-element',
    title: '🎯 开启元素点选直推 (Alt+X)',
    contexts: ['page', 'frame'],
  });

  chrome.contextMenus.create({
    id: 'db-push-selection',
    title: '⚡ 推送选中文本/代码到设计待办池',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'db-push-image',
    title: '⚡ 推送当前图片到设计待办池',
    contexts: ['image'],
  });

  chrome.contextMenus.create({
    id: 'db-push-clipboard',
    title: '📋 剪贴板一键推送 (Alt+D)',
    contexts: ['page'],
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'db-inspect-element') {
    chrome.tabs.sendMessage(tab.id, { action: 'start-inspect' });
  } else if (info.menuItemId === 'db-push-clipboard') {
    chrome.tabs.sendMessage(tab.id, { action: 'push-clipboard' });
  } else if (info.menuItemId === 'db-push-selection') {
    const selectedText = info.selectionText || '';
    if (!selectedText) return;

    try {
      const res = await fetch(`${SERVER_URL}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'web-selection',
          meta: {
            name: `${tab.title || '网页'} - 选中文本`,
            url: tab.url,
          },
          image: {
            base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          },
          vector: { svgRaw: '' },
          styles: { cssRaw: '' },
          userNotes: `选中内容：\n${selectedText}`,
        }),
      });
      const data = await res.json();
      chrome.tabs.sendMessage(tab.id, {
        action: 'show-toast',
        message: `⚡ 选中文本已成功推入待办池 #${data.index || ''}！`,
      });
    } catch (err) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'show-toast',
        message: `推送失败: ${err.message}`,
        type: 'error',
      });
    }
  } else if (info.menuItemId === 'db-push-image') {
    const srcUrl = info.srcUrl;
    if (!srcUrl) return;

    try {
      // Fetch image and convert to base64
      const imgRes = await fetch(srcUrl);
      const blob = await imgRes.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        const res = await fetch(`${SERVER_URL}/api/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'web-image',
            meta: {
              name: `${tab.title || '网页'} - 图片`,
              url: tab.url,
            },
            image: { base64: base64 },
            vector: { svgRaw: '' },
            userNotes: `来源图片地址: ${srcUrl}`,
          }),
        });
        const data = await res.json();
        chrome.tabs.sendMessage(tab.id, {
          action: 'show-toast',
          message: `🖼️ 图片已成功推入待办池 #${data.index || ''}！`,
        });
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'show-toast',
        message: `图片推送失败: ${err.message}`,
        type: 'error',
      });
    }
  }
});

// Handle Hotkey Commands
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  if (command === 'inspect-element') {
    chrome.tabs.sendMessage(tab.id, { action: 'start-inspect' });
  } else if (command === 'push-clipboard') {
    chrome.tabs.sendMessage(tab.id, { action: 'push-clipboard' });
  }
});

// Handle screenshot capture message from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'capture-visible-tab') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      sendResponse({ dataUrl: dataUrl });
    });
    return true; // asynchronous response
  }
});
