import React from 'react';

/**
 * 气象信息卡片组件 (React + Tailwind CSS)
 * 
 * 遵循现代 CSS 标准规范：
 * 1. 容器自适应弹性约束 (w-full max-w-[388px])，拒绝固定死高度
 * 2. 静态图标资产独立解耦，使用相对路径或统一资源引入，杜绝内联 SVG 污染
 * 3. 盒模型分列与标准边框，彻底弃用绝对定位分割线
 * 4. 属性完整对外暴露，支持可变插槽与主题拓展
 */
export function MeteorologicalCard({
  title = '气象信息',
  windSpeed = '4.5',
  windSpeedUnit = 'm/s',
  sigWaveHeight = '0.2',
  sigWaveHeightUnit = 'm',
  waveHeight = '0.2',
  waveHeightUnit = 'm',
  wavePeriod = '3.0',
  wavePeriodUnit = 's',
  swellHeight = '0.1',
  swellHeightUnit = 'm',
  swellDirection = 'ENE',
  swellPeriod = '3.5',
  swellPeriodUnit = 's',
  currentSpeed = '0.2',
  currentSpeedUnit = 'kn',
  currentDirection = 'NE',
  iconsBasePath = './icons',
  onClose,
  className = ''
}) {
  return (
    <div
      className={`w-full max-w-[388px] min-h-[360px] rounded-[20px] overflow-hidden text-white select-none border border-[#6C6F7F]/40 shadow-2xl flex flex-col justify-between ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(32, 37, 54, 0.95) 0%, rgba(14, 16, 25, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* Header 标题栏 (弹性高度 ~70px) */}
      <div className="h-[70px] px-6 flex items-center justify-between border-b border-white/[0.08] shrink-0">
        <span className="text-[20px] font-semibold text-white tracking-normal leading-none font-sans">
          {title}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[#BBC3C9] hover:text-white transition cursor-pointer"
            aria-label="关闭"
          >
            <img src={`${iconsBasePath}/close.svg`} className="w-3.5 h-3.5" alt="close" />
          </button>
        )}
      </div>

      {/* Row 1: 风向风速 */}
      <div className="h-[40px] px-6 flex items-center justify-between border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-2.5">
          <img src={`${iconsBasePath}/wind.svg`} className="w-3.5 h-3.5 shrink-0" alt="风向风速" />
          <span className="text-[14px] text-white/90">风向风速</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-[20px] font-bold text-white tracking-tight">{windSpeed}</span>
          <span className="text-[14px] text-[#BBC3C9] ml-1.5 font-normal">{windSpeedUnit}</span>
        </div>
      </div>

      {/* Row 2: 有效波高 (与 Row 3 同属波浪组，无底边框) */}
      <div className="h-[40px] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <img src={`${iconsBasePath}/wave.svg`} className="w-3.5 h-3.5 shrink-0" alt="有效波高" />
          <span className="text-[14px] text-white/90">有效波高</span>
        </div>
        <div className="flex items-baseline">
          <span className="text-[20px] font-bold text-white tracking-tight">{sigWaveHeight}</span>
          <span className="text-[14px] text-[#BBC3C9] ml-1.5 font-normal">{sigWaveHeightUnit}</span>
        </div>
      </div>

      {/* Row 3: 双列网格 (风浪高度 / 平均周期) - 标准 Flex 分列与边框 */}
      <div className="h-[69px] px-6 flex items-center border-b border-white/[0.08] shrink-0">
        <div className="flex-1 flex flex-col justify-center pr-4 border-r border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <img src={`${iconsBasePath}/wave.svg`} className="w-3.5 h-3.5 shrink-0" alt="风浪高度" />
            <span className="text-[14px] text-white/90">风浪高度</span>
          </div>
          <div className="flex items-baseline mt-1 pl-[22px]">
            <span className="text-[20px] font-bold text-white leading-none">{waveHeight}</span>
            <span className="text-[14px] text-[#BBC3C9] ml-1 font-normal">{waveHeightUnit}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center pl-6">
          <div className="flex items-center gap-2.5">
            <img src={`${iconsBasePath}/calendar.svg`} className="w-3.5 h-3.5 shrink-0" alt="平均周期" />
            <span className="text-[14px] text-white/90">平均周期</span>
          </div>
          <div className="flex items-baseline mt-1 pl-[22px]">
            <span className="text-[20px] font-bold text-white leading-none">{wavePeriod}</span>
            <span className="text-[14px] text-[#BBC3C9] ml-1 font-normal">{wavePeriodUnit}</span>
          </div>
        </div>
      </div>

      {/* Row 4: 三列网格 (涌高 / 涌向 / 平均周期) - 弹性自适应列宽与边框 */}
      <div className="h-[68px] px-6 flex items-center border-b border-white/[0.08] shrink-0">
        <div className="w-[104px] shrink-0 flex flex-col justify-center pr-2 border-r border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <img src={`${iconsBasePath}/wave.svg`} className="w-3.5 h-3.5 shrink-0" alt="涌高" />
            <span className="text-[14px] text-white/90">涌高</span>
          </div>
          <div className="flex items-baseline mt-1 pl-[20px]">
            <span className="text-[20px] font-bold text-white leading-none">{swellHeight}</span>
            <span className="text-[14px] text-[#BBC3C9] ml-1 font-normal">{swellHeightUnit}</span>
          </div>
        </div>
        <div className="w-[120px] shrink-0 flex flex-col justify-center px-4 border-r border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <img src={`${iconsBasePath}/arrow.svg`} className="w-3.5 h-3.5 shrink-0" alt="涌向" />
            <span className="text-[14px] text-white/90">涌向</span>
          </div>
          <div className="mt-1 pl-[20px]">
            <span className="text-[20px] font-bold text-white leading-none tracking-normal font-sans">{swellDirection}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center pl-4">
          <div className="flex items-center gap-1.5">
            <img src={`${iconsBasePath}/calendar.svg`} className="w-3.5 h-3.5 shrink-0" alt="平均周期" />
            <span className="text-[14px] text-white/90 whitespace-nowrap">平均周期</span>
          </div>
          <div className="flex items-baseline mt-1 pl-[20px]">
            <span className="text-[20px] font-bold text-white leading-none">{swellPeriod}</span>
            <span className="text-[14px] text-[#BBC3C9] ml-1 font-normal">{swellPeriodUnit}</span>
          </div>
        </div>
      </div>

      {/* Row 5: 双列网格 (流速 / 流向) */}
      <div className="h-[73px] px-6 flex items-center shrink-0">
        <div className="flex-1 flex flex-col justify-center pr-4 border-r border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <img src={`${iconsBasePath}/flow.svg`} className="w-3.5 h-3.5 shrink-0" alt="流速" />
            <span className="text-[14px] text-white/90">流速</span>
          </div>
          <div className="flex items-baseline mt-1 pl-[22px]">
            <span className="text-[20px] font-bold text-white leading-none">{currentSpeed}</span>
            <span className="text-[14px] text-[#BBC3C9] ml-1 font-normal">{currentSpeedUnit}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center pl-6">
          <div className="flex items-center gap-2.5">
            <img src={`${iconsBasePath}/arrow.svg`} className="w-3.5 h-3.5 shrink-0" alt="流向" />
            <span className="text-[14px] text-white/90">流向</span>
          </div>
          <div className="mt-1 pl-[22px]">
            <span className="text-[20px] font-bold text-white leading-none tracking-normal font-sans">{currentDirection}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeteorologicalCard;
