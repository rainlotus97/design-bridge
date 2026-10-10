import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractTokensFromSvg,
  compressSvgForAi,
  buildAiDesignPrompt,
  parseCssString,
} from '../packages/core/dist/index.js';
import { CacheManager } from '../packages/mcp-server/dist/cache/cache-manager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runVerification() {
  console.log('🧪 Starting DesignBridge End-to-End Verification Test...\n');

  // 1. Read sample SVG fixture
  const svgPath = path.join(__dirname, 'fixtures', 'sample-mastergo.svg');
  const svgRaw = fs.readFileSync(svgPath, 'utf8');

  // 2. Test Token Extractor
  console.log('1️⃣ Testing SVG Token Extractor...');
  const tokens = extractTokensFromSvg(svgRaw);
  console.log('   - Dimensions:', tokens.dimensions);
  console.log('   - Gradients:', tokens.gradients.map((g) => g.cssString));
  console.log('   - Backdrop Filters:', tokens.backdropFilters);
  console.log('   - Radii:', tokens.radii);
  console.log('   - Borders:', tokens.borders);
  console.log('   - Extracted Icons count:', tokens.icons.length);

  if (tokens.dimensions?.width !== 400 || tokens.dimensions?.height !== 381) {
    throw new Error(`Dimensions mismatch: expected 400x381, got ${JSON.stringify(tokens.dimensions)}`);
  }
  if (!tokens.backdropFilters.includes('blur(5px)')) {
    throw new Error(`Backdrop filter missing blur(5px)`);
  }
  console.log('   ✅ SVG Token Extractor test passed!\n');

  // 3. Test SVG Compressor Summary
  console.log('2️⃣ Testing SVG Compressor Summary...');
  const { summary } = compressSvgForAi(svgRaw);
  console.log(summary);
  console.log('   ✅ Compressor summary test passed!\n');

  // 4. Test CSS Normalizer
  console.log('3️⃣ Testing CSS Normalizer...');
  const sampleCss = `
    display: flex;
    flex-direction: row;
    gap: 16px;
    padding: 24px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  `;
  const normalizedCss = parseCssString(sampleCss);
  console.log('   - Normalized Layout:', normalizedCss.layout);
  console.log('   - Normalized Typography:', normalizedCss.typography);
  if (normalizedCss.layout.gap !== '16px' || normalizedCss.typography.fontSize !== '14px') {
    throw new Error('CSS normalization failed');
  }
  console.log('   ✅ CSS Normalizer test passed!\n');

  // 5. Test Cache Manager
  console.log('4️⃣ Testing CacheManager...');
  const testCacheDir = path.join(__dirname, '..', '.test-cache');
  const cacheManager = new CacheManager(testCacheDir);
  const stored = cacheManager.saveCapture(
    {
      source: 'mastergo',
      timestamp: Date.now(),
      meta: { name: '招商001船舶监控卡片', width: 400, height: 381 },
      image: {
        base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        mimeType: 'image/png',
      },
      vector: { svgRaw },
      userNotes: '采用 React + Tailwind 实现，经纬度和航速航向为可变数据插槽',
    },
    tokens
  );
  console.log('   - Stored ID:', stored.id);
  console.log('   - Saved Image Path:', stored.imagePath);
  if (!fs.existsSync(stored.imagePath)) {
    throw new Error('Image file was not written to disk');
  }
  console.log('   ✅ CacheManager test passed!\n');

  // 6. Test AI Design Prompt Generator
  console.log('5️⃣ Testing AI Design Prompt Generator...');
  const prompt = buildAiDesignPrompt({
    imagePath: stored.imagePath,
    tokens,
    cssStyles: normalizedCss,
    userNotes: stored.userNotes,
    techStack: 'React + Tailwind CSS',
  });

  console.log('-------------------- Generated AI Prompt Preview --------------------');
  console.log(prompt);
  console.log('---------------------------------------------------------------------');

  // 6. Test Design Inbox features
  console.log('5️⃣ Testing Design Inbox (Query #1, Delete, Clear)...');
  const foundByIndex = cacheManager.getByIdOrIndex(1);
  if (!foundByIndex || foundByIndex.id !== stored.id) {
    throw new Error('Inbox failed to find capture by index 1');
  }
  console.log('   - Found by index #1:', foundByIndex.meta.name);

  const foundByTitle = cacheManager.getByIdOrIndex('船舶监控');
  if (!foundByTitle || foundByTitle.id !== stored.id) {
    throw new Error('Inbox failed to find capture by title keyword');
  }
  console.log('   - Found by keyword "船舶监控":', foundByTitle.id);

  // Test delete
  const deleted = cacheManager.deleteCapture(stored.id);
  if (!deleted || cacheManager.getHistory().length !== 0) {
    throw new Error('Inbox delete failed');
  }
  console.log('   - Successfully deleted item');
  console.log('   ✅ Design Inbox test passed!\n');

  // Clean up test cache
  fs.rmSync(testCacheDir, { recursive: true, force: true });

  console.log('\n🎉 All DesignBridge Verification Tests Passed Successfully!');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
