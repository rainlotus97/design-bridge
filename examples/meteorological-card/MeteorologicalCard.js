/**
 * MeteorologicalCard.js
 * 
 * 气象信息卡片组件 (Meteorological Information Card)
 * 遵循标准 CSS 设计规范与独立矢量资源引用体系
 * 
 * 规范原则：
 * 1. 自适应弹性容器：w-full max-w-[388px]，拒绝固定死高度
 * 2. 独立静态资源：通过 ./icons/*.svg 引用矢量图标，杜绝内联 SVG 代码污染
 * 3. 盒模型分列：使用 Flexbox 和标准边框分割，杜绝绝对定位
 * 4. 跨平台标准：语义可 1:1 映射到 HarmonyOS ArkUI 与 Qt QML
 */

export const DEFAULT_WEATHER_DATA = {
  title: '气象信息',
  windSpeed: '4.5',
  windSpeedUnit: 'm/s',
  sigWaveHeight: '0.2',
  sigWaveHeightUnit: 'm',
  waveHeight: '0.2',
  waveHeightUnit: 'm',
  wavePeriod: '3.0',
  wavePeriodUnit: 's',
  swellHeight: '0.1',
  swellHeightUnit: 'm',
  swellDirection: 'ENE',
  swellPeriod: '3.5',
  swellPeriodUnit: 's',
  currentSpeed: '0.2',
  currentSpeedUnit: 'kn',
  currentDirection: 'NE',
  iconsBasePath: './icons'
};

/**
 * 渲染卡片 HTML 模板
 */
export function renderMeteorologicalCardHtml(data = {}) {
  const d = { ...DEFAULT_WEATHER_DATA, ...data };
  const p = d.iconsBasePath;

  return `
  <div 
    id="meteorological-card"
    class="w-full max-w-[388px] min-h-[360px] rounded-[20px] overflow-hidden text-white select-none border border-[#6C6F7F]/40 shadow-2xl flex flex-col justify-between"
    style="background: linear-gradient(135deg, rgba(32, 37, 54, 0.95) 0%, rgba(14, 16, 25, 0.98) 100%); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);"
  >
    <!-- Header 标题栏 (弹性高度 ~70px) -->
    <div class="h-[70px] px-6 flex items-center justify-between border-b border-white/[0.08] shrink-0">
      <span class="text-[20px] font-semibold text-white tracking-normal leading-none font-sans">${d.title}</span>
      <button 
        id="card-close-btn"
        type="button"
        class="w-6 h-6 flex items-center justify-center text-[#BBC3C9] hover:text-white transition cursor-pointer"
        aria-label="关闭"
      >
        <img src="${p}/close.svg" class="w-3.5 h-3.5" alt="close" />
      </button>
    </div>

    <!-- Row 1: 风向风速 (弹性行高 ~40px) -->
    <div class="h-[40px] px-6 flex items-center justify-between border-b border-white/[0.08] shrink-0">
      <div class="flex items-center gap-2.5">
        <img src="${p}/wind.svg" class="w-3.5 h-3.5 shrink-0" alt="风向风速" />
        <span class="text-[14px] text-white/90">风向风速</span>
      </div>
      <div class="flex items-baseline">
        <span data-key="windSpeed" class="text-[20px] font-bold text-white tracking-tight">${d.windSpeed}</span>
        <span class="text-[14px] text-[#BBC3C9] ml-1.5 font-normal">${d.windSpeedUnit}</span>
      </div>
    </div>

    <!-- Row 2: 有效波高 (与 Row 3 同组，底部无横线) -->
    <div class="h-[40px] px-6 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2.5">
        <img src="${p}/wave.svg" class="w-3.5 h-3.5 shrink-0" alt="有效波高" />
        <span class="text-[14px] text-white/90">有效波高</span>
      </div>
      <div class="flex items-baseline">
        <span data-key="sigWaveHeight" class="text-[20px] font-bold text-white tracking-tight">${d.sigWaveHeight}</span>
        <span class="text-[14px] text-[#BBC3C9] ml-1.5 font-normal">${d.sigWaveHeightUnit}</span>
      </div>
    </div>

    <!-- Row 3: 双列网格 (风浪高度 / 平均周期) - 标准 Flex 分列与边框 -->
    <div class="h-[69px] px-6 flex items-center border-b border-white/[0.08] shrink-0">
      <div class="flex-1 flex flex-col justify-center pr-4 border-r border-white/[0.08]">
        <div class="flex items-center gap-2.5">
          <img src="${p}/wave.svg" class="w-3.5 h-3.5 shrink-0" alt="风浪高度" />
          <span class="text-[14px] text-white/90">风浪高度</span>
        </div>
        <div class="flex items-baseline mt-1 pl-[22px]">
          <span data-key="waveHeight" class="text-[20px] font-bold text-white leading-none">${d.waveHeight}</span>
          <span class="text-[14px] text-[#BBC3C9] ml-1 font-normal">${d.waveHeightUnit}</span>
        </div>
      </div>
      <div class="flex-1 flex flex-col justify-center pl-6">
        <div class="flex items-center gap-2.5">
          <img src="${p}/calendar.svg" class="w-3.5 h-3.5 shrink-0" alt="平均周期" />
          <span class="text-[14px] text-white/90">平均周期</span>
        </div>
        <div class="flex items-baseline mt-1 pl-[22px]">
          <span data-key="wavePeriod" class="text-[20px] font-bold text-white leading-none">${d.wavePeriod}</span>
          <span class="text-[14px] text-[#BBC3C9] ml-1 font-normal">${d.wavePeriodUnit}</span>
        </div>
      </div>
    </div>

    <!-- Row 4: 三列网格 (涌高 / 涌向 / 平均周期) - 弹性比例与分割线 -->
    <div class="h-[68px] px-6 flex items-center border-b border-white/[0.08] shrink-0">
      <div class="w-[104px] shrink-0 flex flex-col justify-center pr-2 border-r border-white/[0.08]">
        <div class="flex items-center gap-1.5">
          <img src="${p}/wave.svg" class="w-3.5 h-3.5 shrink-0" alt="涌高" />
          <span class="text-[14px] text-white/90">涌高</span>
        </div>
        <div class="flex items-baseline mt-1 pl-[20px]">
          <span data-key="swellHeight" class="text-[20px] font-bold text-white leading-none">${d.swellHeight}</span>
          <span class="text-[14px] text-[#BBC3C9] ml-1 font-normal">${d.swellHeightUnit}</span>
        </div>
      </div>
      <div class="w-[120px] shrink-0 flex flex-col justify-center px-4 border-r border-white/[0.08]">
        <div class="flex items-center gap-1.5">
          <img src="${p}/arrow.svg" class="w-3.5 h-3.5 shrink-0" alt="涌向" />
          <span class="text-[14px] text-white/90">涌向</span>
        </div>
        <div class="mt-1 pl-[20px]">
          <span data-key="swellDirection" class="text-[20px] font-bold text-white leading-none tracking-normal font-sans">${d.swellDirection}</span>
        </div>
      </div>
      <div class="flex-1 flex flex-col justify-center pl-4">
        <div class="flex items-center gap-1.5">
          <img src="${p}/calendar.svg" class="w-3.5 h-3.5 shrink-0" alt="平均周期" />
          <span class="text-[14px] text-white/90 whitespace-nowrap">平均周期</span>
        </div>
        <div class="flex items-baseline mt-1 pl-[20px]">
          <span data-key="swellPeriod" class="text-[20px] font-bold text-white leading-none">${d.swellPeriod}</span>
          <span class="text-[14px] text-[#BBC3C9] ml-1 font-normal">${d.swellPeriodUnit}</span>
        </div>
      </div>
    </div>

    <!-- Row 5: 双列网格 (流速 / 流向) -->
    <div class="h-[73px] px-6 flex items-center shrink-0">
      <div class="flex-1 flex flex-col justify-center pr-4 border-r border-white/[0.08]">
        <div class="flex items-center gap-2.5">
          <img src="${p}/flow.svg" class="w-3.5 h-3.5 shrink-0" alt="流速" />
          <span class="text-[14px] text-white/90">流速</span>
        </div>
        <div class="flex items-baseline mt-1 pl-[22px]">
          <span data-key="currentSpeed" class="text-[20px] font-bold text-white leading-none">${d.currentSpeed}</span>
          <span class="text-[14px] text-[#BBC3C9] ml-1 font-normal">${d.currentSpeedUnit}</span>
        </div>
      </div>
      <div class="flex-1 flex flex-col justify-center pl-6">
        <div class="flex items-center gap-2.5">
          <img src="${p}/arrow.svg" class="w-3.5 h-3.5 shrink-0" alt="流向" />
          <span class="text-[14px] text-white/90">流向</span>
        </div>
        <div class="mt-1 pl-[22px]">
          <span data-key="currentDirection" class="text-[20px] font-bold text-white leading-none tracking-normal font-sans">${d.currentDirection}</span>
        </div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 挂载交互式气象卡片实例
 */
export function createMeteorologicalCard(target, initialData = {}, options = {}) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) throw new Error('Target container not found');

  let currentData = { ...DEFAULT_WEATHER_DATA, ...initialData };

  function render() {
    container.innerHTML = renderMeteorologicalCardHtml(currentData);
    
    const closeBtn = container.querySelector('#card-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof options.onClose === 'function') {
          options.onClose();
        } else {
          const card = container.querySelector('#meteorological-card');
          if (card) {
            card.style.transition = 'all 0.2s ease-out';
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 200);
          }
        }
      });
    }
  }

  render();

  return {
    update(newData) {
      currentData = { ...currentData, ...newData };
      Object.entries(newData).forEach(([key, val]) => {
        const el = container.querySelector(`[data-key="${key}"]`);
        if (el) {
          el.textContent = val;
        }
      });
    },
    getData: () => ({ ...currentData }),
    show() {
      const card = container.querySelector('#meteorological-card');
      if (card) {
        card.style.display = 'flex';
        setTimeout(() => {
          card.style.opacity = '1';
        }, 10);
      }
    }
  };
}
