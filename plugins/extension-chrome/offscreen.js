// Offscreen document script running in extension origin
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  if (message.type === 'read-clipboard') {
    handleReadClipboard()
      .then(sendResponse)
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // Async
  }
});

async function handleReadClipboard() {
  let imageBase64 = '';
  let svgRaw = '';
  let plainText = '';

  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          imageBase64 = await blobToBase64(blob);
        } else if (type === 'text/html' || type === 'image/svg+xml') {
          const blob = await item.getType(type);
          const text = await blob.text();
          if (text.includes('<svg') || type === 'image/svg+xml') {
            svgRaw = text;
          }
        } else if (type === 'text/plain') {
          const blob = await item.getType(type);
          const text = await blob.text();
          if (text.trim().startsWith('<svg')) {
            svgRaw = text.trim();
          } else {
            plainText = text;
          }
        }
      }
    }
  } catch (err) {
    // Fallback: readText
    try {
      plainText = await navigator.clipboard.readText();
      if (plainText.trim().startsWith('<svg')) {
        svgRaw = plainText.trim();
      }
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    imageBase64,
    svgRaw,
    plainText,
  };
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
