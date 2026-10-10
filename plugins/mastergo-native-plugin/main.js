// MasterGo Native Plugin Main Script
// Direct access to MasterGo's graphics engine & scene graph

mg.showUI(__html__, { width: 340, height: 480 });

async function processSelection() {
  const selection = mg.currentPage.selection;
  if (!selection || selection.length === 0) {
    mg.ui.postMessage({ type: 'selection', data: null });
    return;
  }

  const node = selection[0];

  try {
    // 1. Export crystal-clear 2x PNG from MasterGo graphics pipeline
    const pngBytes = await node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 },
    });

    // 2. Export vector SVG for precise color/gradient/radii token extraction
    let svgString = '';
    try {
      const svgBytes = await node.exportAsync({ format: 'SVG' });
      if (typeof svgBytes === 'string') {
        svgString = svgBytes;
      } else if (svgBytes instanceof Uint8Array) {
        svgString = new TextDecoder('utf-8').decode(svgBytes);
      }
    } catch (err) {
      console.warn('SVG export fallback:', err);
    }

    // 3. Extract native CSS properties if supported
    let cssCode = '';
    try {
      if (typeof node.getCSSAsync === 'function') {
        const cssObj = await node.getCSSAsync();
        if (cssObj && typeof cssObj === 'object') {
          cssCode = Object.entries(cssObj)
            .map(([k, v]) => `${k}: ${v};`)
            .join('\n');
        }
      }
    } catch (err) {
      console.warn('CSS extraction fallback:', err);
    }

    // Send high-fidelity payload to plugin UI
    mg.ui.postMessage({
      type: 'selection',
      data: {
        name: node.name || 'MasterGo 图层',
        width: Math.round(node.width || 0),
        height: Math.round(node.height || 0),
        pngBytes: Array.from(pngBytes),
        svgString: svgString,
        cssCode: cssCode,
      },
    });
  } catch (err) {
    mg.ui.postMessage({
      type: 'error',
      message: '导出图层失败: ' + (err.message || String(err)),
    });
  }
}

// Listen to selection changes on MasterGo canvas
mg.on('selectionchange', () => {
  processSelection();
});

// Listen to messages from UI
mg.ui.onmessage = (msg) => {
  if (msg.type === 'refresh') {
    processSelection();
  } else if (msg.type === 'close') {
    mg.closePlugin();
  }
};

// Initial run
processSelection();
