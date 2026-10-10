import { CapturedDesignPayload } from '@design-bridge/core';

export async function sendPayloadToBridge(payload: CapturedDesignPayload, bridgeUrl = 'http://127.0.0.1:23851/api/capture'): Promise<boolean> {
  try {
    const res = await fetch(bridgeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to send payload to DesignBridge:', err);
    return false;
  }
}
