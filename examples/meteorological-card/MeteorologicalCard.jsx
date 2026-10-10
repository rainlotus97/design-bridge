import React from 'react';

/**
 * MasterGo 矢量图标映射集
 */
const ICONS = {
  wind: (
    <svg className="w-3.5 h-3.5 shrink-0 text-white" viewBox="24 84 14 14" fill="currentColor">
      <path d="M34.043,91.067L26.334,91.067L26.334,90.484L34.043,90.484C34.752,90.45 35.31,89.865 35.31,89.155C35.31,88.445 34.752,87.86 34.043,87.826L34.043,87.243C35.07,87.283 35.881,88.127 35.881,89.155C35.881,90.183 35.07,91.027 34.043,91.067Z"/>
      <path d="M31.079,88.548L26.334,88.548L26.334,87.964L31.079,87.964C31.486,87.99 31.831,87.668 31.831,87.26C31.831,86.852 31.486,86.529 31.079,86.556L31.079,85.972C31.815,85.937 32.43,86.524 32.43,87.26C32.43,87.996 31.815,88.583 31.079,88.548Z"/>
      <path d="M32.141,96.029L32.141,95.445C32.653,95.445 33.069,95.03 33.069,94.518C33.069,94.005 32.653,93.59 32.141,93.59L26.334,93.59L26.334,93.007L32.141,93.007C32.975,93.007 33.652,93.683 33.652,94.518C33.652,95.352 32.975,96.029 32.141,96.029Z"/>
    </svg>
  ),
  wave: (
    <svg className="w-3.5 h-3.5 shrink-0 text-white" viewBox="24 125 14 14" fill="currentColor">
      <path d="M30.005,133.066C30.005,133.389 29.743,133.651 29.421,133.651C29.098,133.651 28.836,133.389 28.836,133.066C28.836,132.743 29.098,132.481 29.421,132.481C29.743,132.481 30.005,132.743 30.005,133.066ZM37.334,137.994L24.667,137.994C24.667,135.54 26.472,133.513 28.836,133.153C28.848,134.184 29.689,135.016 30.72,135.016C31.528,135.016 32.223,134.417 32.379,133.626C34.484,133.726 36.231,135.204 36.566,137.241L31.85,137.241C31.642,137.241 31.473,137.409 31.473,137.617C31.473,137.825 31.642,137.993 31.85,137.993L37.334,137.994ZM25.435,137.241C25.793,135.501 27.185,134.18 28.933,133.939C29.359,134.502 30.039,134.862 30.72,134.862C31.402,134.862 32.082,134.502 32.508,133.939C32.785,134.306 33.151,134.577 33.58,134.757L33.883,134.021C33.561,133.886 33.284,133.679 33.077,133.404C32.792,133.026 32.351,132.806 31.881,132.806C31.574,132.806 31.272,132.906 31.026,133.091C30.687,132.611 30.083,132.328 29.421,132.328C28.49,132.328 27.703,132.955 27.47,133.805C25.864,134.426 24.811,135.793 24.677,137.241L25.435,137.241Z"/>
    </svg>
  ),
  calendar: (
    <svg className="w-3.5 h-3.5 shrink-0 text-white" viewBox="216 164 14 14" fill="currentColor">
      <path d="M227.432,177.088L218.595,177.088C217.902,177.088 217.337,176.581 217.337,175.959L217.337,167.277C217.337,166.654 217.902,166.148 218.595,166.148L227.434,166.148C228.127,166.148 228.691,166.655 228.691,167.277L228.691,175.959C228.69,176.581 228.127,177.088 227.432,177.088ZM218.595,166.933C218.384,166.933 218.212,167.087 218.212,167.276L218.212,175.957C218.212,176.147 218.384,176.301 218.595,176.301L227.434,176.301C227.644,176.301 227.816,176.146 227.816,175.957L227.816,167.276C227.816,167.086 227.644,166.933 227.434,166.933L218.595,166.933Z"/>
      <path d="M219.933,167.898C219.691,167.898 219.496,167.702 219.496,167.46L219.496,165.601C219.496,165.359 219.691,165.163 219.933,165.163C220.175,165.163 220.371,165.359 220.371,165.601L220.371,167.46C220.371,167.702 220.175,167.898 219.933,167.898Z"/>
      <path d="M226.064,167.855C225.822,167.855 225.626,167.66 225.626,167.418L225.626,165.559C225.626,165.317 225.822,165.121 226.064,165.121C226.306,165.121 226.501,165.317 226.501,165.559L226.501,167.418C226.501,167.66 226.306,167.855 226.064,167.855Z"/>
      <path d="M228.196,169.242L217.784,169.242C217.545,169.242 217.351,169.048 217.351,168.809C217.351,168.569 217.545,168.375 217.784,168.375L228.196,168.375C228.436,168.375 228.63,168.569 228.63,168.809C228.63,169.048 228.436,169.242 228.196,169.242Z"/>
    </svg>
  ),
  arrow: (
    <svg className="w-3.5 h-3.5 shrink-0 text-white" viewBox="154 232 14 14" fill="currentColor">
      <g transform="matrix(0.7071 0.7071 -0.7071 0.7071 210.518 -48.235)">
        <path d="M172.098,241.273L168.424,239.347L164.88,241.25L163.484,242L164.094,240.538L167.943,231.3L168.484,230L169.026,231.3L172.882,240.555L173.484,242L172.098,241.273ZM168.418,238.215L165.489,239.788L168.484,232.6L171.496,239.829L168.418,238.215Z" fillRule="evenodd"/>
      </g>
    </svg>
  ),
  flow: (
    <svg className="w-3.5 h-3.5 shrink-0 text-white" viewBox="24 300 14 14" fill="currentColor">
      <path d="M48.541,319.483Q46.867,320.448 44.952,320.196Q43.037,319.944 41.671,318.579Q40.304,317.214 40.052,315.299Q39.8,313.385 40.766,311.713Q41.732,310.041 43.517,309.302Q45.302,308.563 47.168,309.063Q49.034,309.563 50.21,311.094Q51.386,312.626 51.386,314.557L50.511,314.557Q50.511,312.924 49.515,311.628Q48.52,310.332 46.941,309.909Q45.362,309.486 43.852,310.111Q42.342,310.736 41.524,312.151Q40.707,313.566 40.921,315.185Q41.134,316.804 42.29,317.959Q43.446,319.115 45.066,319.328Q46.687,319.541 48.103,318.724L48.541,319.483Z" fillRule="evenodd" transform="matrix(-0.866 0.5 -0.5 -0.866 229.07 556.34)"/>
      <path d="M34.438,303.774C34.297,303.778 34.163,303.838 34.065,303.939L32.37,305.634C32.279,305.609 32.184,305.595 32.089,305.595C31.488,305.595 31,306.083 31,306.684C31,307.286 31.488,307.773 32.089,307.773C32.805,307.773 33.326,307.093 33.141,306.402L34.834,304.71C34.995,304.553 35.045,304.314 34.957,304.107C34.87,303.9 34.664,303.767 34.439,303.774L34.438,303.774Z"/>
      <path d="M29.32,304.862Q29.175,304.671 28.974,304.583Q28.785,304.5 28.52,304.5Q28.372,304.5 28.264,304.542Q28.186,304.574 28.029,304.677Q27.806,304.824 27.647,304.886Q27.359,305 27,305Q26.641,305 26.353,304.886Q26.194,304.824 25.971,304.677Q25.814,304.574 25.736,304.542Q25.628,304.5 25.48,304.5Q25.215,304.5 25.026,304.583Q24.825,304.671 24.68,304.862L24,304.638Q24.235,304.329 24.604,304.167Q24.985,304 25.48,304Q25.839,304 26.127,304.114Q26.286,304.176 26.509,304.323Q26.666,304.426 26.744,304.458Q26.852,304.5 27,304.5Q27.148,304.5 27.256,304.458Q27.334,304.426 27.491,304.323Q27.714,304.176 27.873,304.114Q28.161,304 28.52,304Q29.015,304 29.396,304.167Q29.765,304.329 30,304.638L29.32,304.862Z" fillRule="evenodd"/>
      <path d="M29.32,306.862Q29.175,306.671 28.974,306.583Q28.785,306.5 28.52,306.5Q28.372,306.5 28.264,306.542Q28.186,306.574 28.029,306.677Q27.806,306.824 27.647,306.886Q27.359,307 27,307Q26.641,307 26.353,306.886Q26.194,306.824 25.971,306.677Q25.814,306.574 25.736,306.542Q25.628,306.5 25.48,306.5Q25.215,306.5 25.026,306.583Q24.825,306.671 24.68,306.862L24,306.638Q24.235,306.329 24.604,306.167Q24.985,306 25.48,306Q25.839,306 26.127,306.114Q26.286,306.176 26.509,306.323Q26.666,306.426 26.744,306.458Q26.852,306.5 27,306.5Q27.148,306.5 27.256,306.458Q27.334,306.426 27.491,306.323Q27.714,306.176 27.873,306.114Q28.161,306 28.52,306Q29.015,306 29.396,306.167Q29.765,306.329 30,306.638L29.32,306.862Z" fillRule="evenodd"/>
      <path d="M29.32,308.862Q29.175,308.671 28.974,308.583Q28.785,308.5 28.52,308.5Q28.372,308.5 28.264,308.542Q28.186,308.574 28.029,308.677Q27.806,308.824 27.647,308.886Q27.359,309 27,309Q26.641,309 26.353,308.886Q26.194,308.824 25.971,308.677Q25.814,308.574 25.736,308.542Q25.628,308.5 25.48,308.5Q25.215,308.5 25.026,308.583Q24.825,306.671 24.68,308.862L24,308.638Q24.235,308.329 24.604,308.167Q24.985,308 25.48,308Q25.839,308 26.127,308.114Q26.286,308.176 26.509,308.323Q26.666,308.426 26.744,308.458Q26.852,308.5 27,308.5Q27.148,308.5 27.256,308.458Q27.334,308.426 27.491,308.323Q27.714,308.176 27.873,308.114Q28.161,308 28.52,308Q29.015,308 29.396,308.167Q29.765,308.329 30,308.638L29.32,308.862Z" fillRule="evenodd"/>
    </svg>
  ),
  close: (
    <svg className="w-4 h-4 text-[#BBC3C9] group-hover:text-white transition-colors" viewBox="344 26 16 16" fill="currentColor">
      <path d="M353.606,34.789L359.062,29.333C359.439,28.956 359.439,28.392 359.062,28.016C358.686,27.639 358.122,27.639 357.745,28.016L352.289,33.472L346.833,28.016C346.456,27.639 345.892,27.639 345.516,28.016C345.139,28.392 345.139,28.956 345.516,29.333L350.972,34.789L345.516,40.245C345.139,40.622 345.139,41.186 345.516,41.562C345.704,41.75 345.986,41.844 346.174,41.844C346.362,41.844 346.645,41.75 346.833,41.562L352.289,36.106L357.745,41.562C357.934,41.75 358.216,41.844 358.404,41.844C358.592,41.844 358.874,41.75 359.062,41.562C359.439,41.186 359.439,40.622 359.062,40.245L353.606,34.789Z"/>
    </svg>
  )
};

/**
 * 气象信息卡片组件 (React + Tailwind CSS)
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
  onClose,
  className = ''
}) {
  return (
    <div
      className={`relative w-[388px] max-w-full rounded-[20px] p-6 text-white select-none transition-all duration-300 shadow-2xl border border-[#6C6F7F]/30 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(32, 37, 54, 0.88) 0%, rgba(14, 16, 25, 0.95) 99.43%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* 标题 & 关闭按钮 */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <h2 className="text-[20px] font-bold tracking-wide text-white leading-tight font-sans">
          {title}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="group p-1 -mr-1 rounded-full hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus:outline-none"
            aria-label="关闭"
          >
            {ICONS.close}
          </button>
        )}
      </div>

      <div className="mt-1 divide-y divide-white/[0.08]">
        {/* Row 1: 风向风速 */}
        <div className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-2.5">
            {ICONS.wind}
            <span className="text-[14px] text-white/90 font-medium">风向风速</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-[22px] font-bold text-white tracking-tight leading-none">{windSpeed}</span>
            <span className="text-[13px] text-[#BBC3C9] ml-1.5 font-normal">{windSpeedUnit}</span>
          </div>
        </div>

        {/* Row 2: 有效波高 */}
        <div className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-2.5">
            {ICONS.wave}
            <span className="text-[14px] text-white/90 font-medium">有效波高</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-[22px] font-bold text-white tracking-tight leading-none">{sigWaveHeight}</span>
            <span className="text-[13px] text-[#BBC3C9] ml-1.5 font-normal">{sigWaveHeightUnit}</span>
          </div>
        </div>

        {/* Row 3: 双列网格 (风浪高度 / 平均周期) */}
        <div className="grid grid-cols-2 divide-x divide-white/[0.08] py-3.5">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              {ICONS.wave}
              <span className="text-[14px] text-white/90 font-medium">风浪高度</span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="text-[22px] font-bold text-white tracking-tight leading-none">{waveHeight}</span>
              <span className="text-[13px] text-[#BBC3C9] ml-1.5 font-normal">{waveHeightUnit}</span>
            </div>
          </div>
          <div className="pl-5">
            <div className="flex items-center gap-2">
              {ICONS.calendar}
              <span className="text-[14px] text-white/90 font-medium">平均周期</span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="text-[22px] font-bold text-white tracking-tight leading-none">{wavePeriod}</span>
              <span className="text-[13px] text-[#BBC3C9] ml-1.5 font-normal">{wavePeriodUnit}</span>
            </div>
          </div>
        </div>

        {/* Row 4: 三列网格 (涌高 / 涌向 / 平均周期) */}
        <div className="grid grid-cols-3 divide-x divide-white/[0.08] py-3.5">
          <div className="pr-2">
            <div className="flex items-center gap-1.5">
              {ICONS.wave}
              <span className="text-[14px] text-white/90 font-medium">涌高</span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="text-[22px] font-bold text-white tracking-tight leading-none">{swellHeight}</span>
              <span className="text-[13px] text-[#BBC3C9] ml-1 font-normal">{swellHeightUnit}</span>
            </div>
          </div>
          <div className="px-3">
            <div className="flex items-center gap-1.5">
              {ICONS.arrow}
              <span className="text-[14px] text-white/90 font-medium">涌向</span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="text-[22px] font-bold text-white tracking-wide leading-none">{swellDirection}</span>
            </div>
          </div>
          <div className="pl-3">
            <div className="flex items-center gap-1.5">
              {ICONS.calendar}
              <span className="text-[14px] text-white/90 font-medium whitespace-nowrap">平均周期</span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="text-[22px] font-bold text-white tracking-tight leading-none">{swellPeriod}</span>
              <span className="text-[13px] text-[#BBC3C9] ml-1 font-normal">{swellPeriodUnit}</span>
            </div>
          </div>
        </div>

        {/* Row 5: 双列网格 (流速 / 流向) */}
        <div className="grid grid-cols-2 divide-x divide-white/[0.08] pt-3.5">
          <div className="pr-4">
            <div className="flex items-center gap-2">
              {ICONS.flow}
              <span className="text-[14px] text-white/90 font-medium">流速</span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="text-[22px] font-bold text-white tracking-tight leading-none">{currentSpeed}</span>
              <span className="text-[13px] text-[#BBC3C9] ml-1.5 font-normal">{currentSpeedUnit}</span>
            </div>
          </div>
          <div className="pl-5">
            <div className="flex items-center gap-2">
              {ICONS.arrow}
              <span className="text-[14px] text-white/90 font-medium">流向</span>
            </div>
            <div className="mt-2.5 flex items-baseline">
              <span className="text-[22px] font-bold text-white tracking-wide leading-none">{currentDirection}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeteorologicalCard;
