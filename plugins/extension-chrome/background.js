// Background Service Worker for DesignBridge Chrome Extension
const SERVER_URL = 'http://127.0.0.1:23851';

// Ensure offscreen document exists for privileged clipboard access
async function ensureOffscreenDocument() {
  const existing = await chrome.offscreen.hasDocument();
  if (existing) return;

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['CLIPBOARD'],
    justification: 'Read clipboard image and vectors to push to local AI server',
  });
}

// Read clipboard via offscreen document
async function readClipboard() {
  await ensureOffscreenDocument();
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { target: 'offscreen', type: 'read-clipboard' },
      (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve({ success: false, error: chrome.runtime.lastError?.message || 'Empty response' });
        } else {
          resolve(response);
        }
      }
    );
  });
}

// Perform clipboard push to DesignBridge server
async function handlePushClipboard(tab, sourceName = 'extension') {
  if (!tab || !tab.id) return;

  try {
    const clipResult = await readClipboard();
    let imageBase64 = clipResult?.imageBase64 || '';
    const svgRaw = clipResult?.svgRaw || '';
    const plainText = clipResult?.plainText || '';

    // If no image in clipboard, capture current visible tab
    if (!imageBase64) {
      try {
        const tabScreenshot = await new Promise((resolve) => {
          chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, resolve);
        });
        if (tabScreenshot) {
          imageBase64 = tabScreenshot;
        }
      } catch {
        // ignore capture tab failure
      }
    }

    if (!imageBase64 && !svgRaw) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'show-toast',
        message: '⚠️ 未获取到真实图层！请右键图层点击【复制为 PNG】(Ctrl+Shift+C) 或导入【MasterGo 原生插件】',
        type: 'error',
      });
      return;
    }

    const isMasterGo = tab.url?.includes('mastergo.com');
    const isFigma = tab.url?.includes('figma.com');

    const payload = {
      source: isMasterGo ? 'mastergo' : isFigma ? 'figma' : sourceName,
      meta: {
        name: tab.title || '设计图层',
        url: tab.url,
      },
      image: {
        base64: imageBase64 || '',
      },
      vector: { svgRaw: svgRaw },
      userNotes: plainText && !svgRaw ? `剪贴板文本：${plainText.slice(0, 300)}` : '',
    };

    const res = await fetch(`${SERVER_URL}/api/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'show-toast',
        message: `⚡ 已成功推入设计待办池 #${data.index}！可在 AI 聊天中直接调用。`,
        type: 'success',
      });
    } else {
      chrome.tabs.sendMessage(tab.id, {
        action: 'show-toast',
        message: `推送失败: ${data.error || '未知错误'}`,
        type: 'error',
      });
    }
  } catch (err) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'show-toast',
      message: `无法连接到本地服务 (23851): ${err.message}`,
      type: 'error',
    });
  }
}

// Extension install context menus
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'db-inspect-element',
    title: '🎯 开启元素点选直推 (Alt+X)',
    contexts: ['page', 'frame'],
  });

  chrome.contextMenus.create({
    id: 'db-push-clipboard',
    title: '⚡ 剪贴板一键推送 (Alt+S)',
    contexts: ['page', 'frame'],
  });

  chrome.contextMenus.create({
    id: 'db-push-selection',
    title: '⚡ 推送选中文本/代码到待办池',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'db-push-image',
    title: '⚡ 推送当前图片到设计待办池',
    contexts: ['image'],
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'db-inspect-element') {
    chrome.tabs.sendMessage(tab.id, { action: 'start-inspect' });
  } else if (info.menuItemId === 'db-push-clipboard') {
    handlePushClipboard(tab, 'context-menu');
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
            userNotes: `图片来源: ${srcUrl}`,
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
    handlePushClipboard(tab, 'hotkey-command');
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'trigger-clipboard-push') {
    const tab = sender.tab;
    if (tab) {
      handlePushClipboard(tab, msg.source || 'content-script').then(() => {
        sendResponse({ success: true });
      });
      return true; // async
    }
  } else if (msg.action === 'capture-visible-tab') {
    const windowId = sender.tab ? sender.tab.windowId : null;
    chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
      sendResponse({ dataUrl: dataUrl });
    });
    return true; // async
  } else if (msg.action === 'read-clipboard-data') {
    readClipboard().then((clipResult) => {
      sendResponse(clipResult || {});
    }).catch((err) => {
      sendResponse({ error: err.message });
    });
    return true; // async
  }
});

