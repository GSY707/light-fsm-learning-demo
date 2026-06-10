/* =====================================================================
   光学FSM可视化 — 应用主逻辑
   FSM Engine + UI Renderer + Auto Demo Controller
   ===================================================================== */

// =====================================================================
// 1. STATE & TRANSITION DEFINITIONS
// =====================================================================

const STATES = {
  S0: {
    id: 'S0', index: 0,
    nameCn: '空间空闲', nameEn: 'Vacant', symbol: 'S₀',
    cct: 2700, lux: 10,
    channels: { ambient: 0.02, task: 0, facial: 0, accent: 0 },
    color: '#4a4a5e', glowColor: 'rgba(74,74,94,0.5)',
    desc: '系统待机休眠，全局照度 < 10 Lux。仅踢脚线微弱 2700K 暖琥珀色光维持空间轮廓可见度，最小化能耗。',
    // Room view config
    room: { ambient: 0, task: 0, facial: 0, accent1: 0, accent2: 0, accent3: 0, window: 0.3, blinds: 0.8, person: 0, ambientColor: '#ffd080' },
    // SVG position
    cx: 360, cy: 55,
    prompt: 'A photorealistic wide-angle architectural shot of a vacant modern home office in pitch darkness, illuminated only by a subtle ultra-low intensity 2700K warm amber night light emanating from a recessed floor baseboard. The room features a walnut smart desk, dark slate acoustic wall panels, and a sleek minimalist layout. Heavy blackout smart blinds cover the east-facing window. Extreme low light photography, cinematic deep shadows, faint specular highlights on a matte metallic desk lamp, moody atmosphere, highly detailed textures, shot on 24mm lens, 4k resolution, rendering physical accuracy and minimal bounce light.',
  },
  S1: {
    id: 'S1', index: 1,
    nameCn: '环境引入', nameEn: 'Entry', symbol: 'S₁',
    cct: 4000, lux: 250,
    channels: { ambient: 0.50, task: 0.05, facial: 0, accent: 0 },
    color: '#e8a840', glowColor: 'rgba(232,168,64,0.45)',
    desc: '人员进入空间，洗墙灯 50% 泛光亮起（3500-4000K），提供视觉缓冲，避免瞳孔急剧收缩。',
    room: { ambient: 0.8, task: 0, facial: 0, accent1: 0.1, accent2: 0.1, accent3: 0, window: 0.5, blinds: 0.4, person: 0.7, ambientColor: '#ffe0a0' },
    cx: 360, cy: 185,
    prompt: 'An interior design magazine style photograph of a modern home office space just as someone is about to enter. The room is evenly washed in a soft, diffused 4000K neutral light from perimeter ceiling cove lighting. The central walnut desk remains relatively dimly lit without harsh direct light. The eastern window shows early morning soft blue light peeking through partially open electric blinds. Realistic light gradients on the dark slate walls, balanced dynamic range, clear visibility of room geometry, gentle and welcoming mood. High-end architectural visualization, realistic PBR materials, smooth shadows, shot from a standard eye-level perspective.',
  },
  S2: {
    id: 'S2', index: 2,
    nameCn: '深度专注', nameEn: 'Focus', symbol: 'S₂',
    cct: 6500, lux: 1000,
    channels: { ambient: 0.15, task: 1.0, facial: 0, accent: 0 },
    color: '#4da6ff', glowColor: 'rgba(77,166,255,0.45)',
    desc: '6500K 冷白光聚焦桌面，抑制褪黑素分泌、刺激皮质醇上升，环境光压降至 100 Lux 形成"隧道视野"。',
    room: { ambient: 0.3, task: 0.95, facial: 0, accent1: 0, accent2: 0, accent3: 0, window: 0.4, blinds: 0.5, person: 1, ambientColor: '#c0d8ff' },
    cx: 360, cy: 320,
    prompt: 'A cinematic close-up shot of an organized walnut smart desk in a modern home office, optimized for intense productivity. A focused, high-intensity 6500K cool white beam from a sleek pendant task light directly illuminates an open notebook and a mechanical keyboard on the desk. The surrounding ambient room is darkened to minimize distractions, creating a stark contrast. Sharp and distinct micro-shadows cast by the keys and a glass paperweight, which exhibits highly accurate caustics and light refraction. Highly detailed macro textures on the paper and wood grain. Cold, clinical, and energetic lighting aesthetic, professional commercial style, ultra-crisp focus.',
  },
  S3: {
    id: 'S3', index: 3,
    nameCn: '数字展示', nameEn: 'Video', symbol: 'S₃',
    cct: 4000, lux: 500,
    channels: { ambient: 0.20, task: 0.10, facial: 0.85, accent: 0.40 },
    color: '#38c8b0', glowColor: 'rgba(56,200,176,0.45)',
    desc: '面部补光通道开启 4000K 柔光消除面部阴影，情境渲染光投射低饱和度冷青/暖金背景光，百叶窗遮蔽 70%。',
    room: { ambient: 0.4, task: 0.25, facial: 0.9, accent1: 0.7, accent2: 0.6, accent3: 0.1, window: 0.3, blinds: 0.7, person: 1, ambientColor: '#d0e8e0' },
    cx: 570, cy: 440,
    prompt: 'A professional lifestyle shot from the perspective of a webcam in a smart home office. The composition frames a clean workspace and an aesthetic background. The foreground features a perfectly balanced 4000K soft box effect, providing flat, flattering facial fill light that eliminates harsh shadows. Behind the invisible subject, the acoustic dark slate walls are illuminated by subtle, dynamic RGB-CW accent lights emitting a low-saturation teal and warm gold color palette. A sleek monitor screen displays the words "PROJECT NANO" in bold, crisp white sans-serif typography. Natural daylight from the window is 30% blocked by smart blinds. High-end documentary style, balanced exposure, perfect text rendering, depth of field with a slightly blurred background.',
  },
  S4: {
    id: 'S4', index: 4,
    nameCn: '节律恢复', nameEn: 'Relax', symbol: 'S₄',
    cct: 3000, lux: 80,
    channels: { ambient: 0.10, task: 0, facial: 0, accent: 0.25 },
    color: '#d07830', glowColor: 'rgba(208,120,48,0.45)',
    desc: '模拟黄昏光谱（2700-3000K），顶部强光关闭，仅低位暖光唤醒。触发副交感神经系统，实现非侵入式健康干预。',
    room: { ambient: 0.3, task: 0, facial: 0, accent1: 0.6, accent2: 0.7, accent3: 0.08, window: 0.2, blinds: 0.6, person: 0.8, ambientColor: '#ffc870' },
    cx: 150, cy: 440,
    prompt: 'A tranquil and cozy isometric 3D architectural rendering of a smart home office in a state of relaxation. Low-level floor lamps and a desk lamp cast a soothing, dim 3000K warm glow across the room. The harsh top lights are completely turned off. Faint glowing elements from a smart speaker and a humidifier mist catching the warm backlight. Comforting mood, soft gradients, cinematic color grading mimicking dusk.',
  },
};

const TRANSITIONS = [
  {
    id: 'T01', from: 'S0', to: 'S1',
    labelCn: '有人进入', labelEn: 'Entry Detected',
    fadeMs: 500,
    condition: (s) => (s.pir || s.door || s.radar) && s.posture !== 'seated' && s.posture !== 'reclined' && !s.videoApp,
    descCn: '检测到任意人员移动或开门信号，系统立刻淡入至“环境引入”',
  },
  {
    id: 'T02', from: 'S0', to: 'S2',
    labelCn: '直接就坐', labelEn: 'Direct Focus',
    fadeMs: 2000,
    condition: (s) => s.posture === 'seated' || s.voiceCmd === 'focus',
    descCn: '空闲状态下检测到直接就坐或收到专注指令，系统直切至“深度专注”',
  },
  {
    id: 'T03', from: 'S0', to: 'S3',
    labelCn: '直接视频', labelEn: 'Direct Video',
    fadeMs: 1500,
    condition: (s) => s.videoApp || s.voiceCmd === 'video',
    descCn: '空闲状态下直接打开视频会议，系统直切至“数字展示”面部补光',
  },
  {
    id: 'T04', from: 'S0', to: 'S4',
    labelCn: '直接恢复', labelEn: 'Direct Relax',
    fadeMs: 3000,
    condition: (s) => s.posture === 'reclined' || s.eeg >= 75,
    descCn: '空闲状态下检测到直接后仰休息或高度疲劳，直切至“节律恢复”',
  },
  {
    id: 'T12', from: 'S1', to: 'S2',
    labelCn: '就坐工作 / 语音', labelEn: 'Seated / Focus',
    fadeMs: 2000,
    condition: (s) => s.posture === 'seated' || s.voiceCmd === 'focus',
    descCn: '检测到就坐姿态或语音指令"开始工作"，色温渐变爬升至 6500K 专注白光',
  },
  {
    id: 'T13', from: 'S1', to: 'S3',
    labelCn: '视频激活 / 语音', labelEn: 'Video App Active',
    fadeMs: 1500,
    condition: (s) => s.videoApp || s.voiceCmd === 'video',
    descCn: '在引入状态下直接打开会议软件，淡入面部补光并拉下百叶窗',
  },
  {
    id: 'T14', from: 'S1', to: 'S4',
    labelCn: '生理疲劳 / 休息', labelEn: 'Fatigue Detected',
    fadeMs: 3000,
    condition: (s) => s.eeg >= 75 || s.posture === 'reclined',
    descCn: '脑波疲劳度偏高或检测到仰躺，淡出直射光，开启黄昏暖光干预',
  },
  {
    id: 'T21', from: 'S2', to: 'S1',
    labelCn: '站立离开', labelEn: 'Stand Up / Leave Desk',
    fadeMs: 2000,
    condition: (s) => (s.posture === 'standing' || s.posture === 'none') && !s.videoApp && s.eeg < 75 && (s.pir || s.radar),
    descCn: '专注状态下使用者站立或离开桌面，系统退回“环境引入”漫反射泛光',
  },
  {
    id: 'T23', from: 'S2', to: 'S3',
    labelCn: '视频软件 / 语音', labelEn: 'Video App Active',
    fadeMs: 1000,
    condition: (s) => s.videoApp || s.voiceCmd === 'video',
    descCn: '专注时前台激活视频应用或语音指令，开启面部补光消除阴影',
  },
  {
    id: 'T24', from: 'S2', to: 'S4',
    labelCn: 'EEG疲劳 / 仰躺', labelEn: 'EEG Fatigue',
    fadeMs: 4000,
    condition: (s) => s.eeg >= 75 || s.posture === 'reclined',
    descCn: 'EEG 疲劳度超过75%或姿态向后仰躺，触发 4s 柔和渐变至节律恢复',
  },
  {
    id: 'T31', from: 'S3', to: 'S1',
    labelCn: '关闭会议', labelEn: 'Video Closed',
    fadeMs: 1500,
    condition: (s) => !s.videoApp && (s.posture === 'standing' || s.posture === 'none') && (s.pir || s.radar),
    descCn: '会议关闭且使用者离开桌面站立，1.5s 柔和退回“环境引入”泛光',
  },
  {
    id: 'T32', from: 'S3', to: 'S2',
    labelCn: '会议结束保持就坐', labelEn: 'End Video (Seated)',
    fadeMs: 2000,
    condition: (s) => !s.videoApp && s.posture === 'seated',
    descCn: '会议关闭且使用者仍保持就坐，2s 平滑过渡回“深度专注”高色温光',
  },
  {
    id: 'T34', from: 'S3', to: 'S4',
    labelCn: '会议结束极度疲劳', labelEn: 'End Video (Fatigued)',
    fadeMs: 3000,
    condition: (s) => !s.videoApp && (s.eeg >= 75 || s.posture === 'reclined'),
    descCn: '会议结束且使用者已呈疲劳状态，系统智能直接切入“节律恢复”',
  },
  {
    id: 'T41', from: 'S4', to: 'S1',
    labelCn: '重新站立', labelEn: 'Resume Standing',
    fadeMs: 2000,
    condition: (s) => s.posture === 'standing' && s.eeg < 75 && (s.pir || s.radar),
    descCn: '使用者结束休息并站立活动，2s 渐变恢复至“环境引入”状态',
  },
  {
    id: 'T42', from: 'S4', to: 'S2',
    labelCn: '重新工作', labelEn: 'Resume Seated',
    fadeMs: 2500,
    condition: (s) => (s.posture === 'seated' || s.voiceCmd === 'focus') && s.eeg < 75,
    descCn: '重新坐正工作或下达专注指令，色温再次攀升至 6500K 专注光',
  },
];

// Global reset: any state → S0
const GLOBAL_RESET = {
  id: 'Treset', to: 'S0',
  labelCn: '全局复位', labelEn: 'Global Reset',
  fadeMs: 2000,
  hysteresisMs: 5000, // 5-minute in real, 5s in demo
  condition: (s) => !s.pir && !s.door && !s.radar && s.posture === 'none',
  descCn: '所有传感器归零 + 毫米波雷达无生命体征 + 5分钟滞后延时',
};

// =====================================================================
// 2. HELPER FUNCTIONS & DECISION INTERPRETER CONSTANTS
// =====================================================================

const STABLE_INTERP = {
  S0: {
    sensor: '所有传感器 (静默监控中)',
    state: '从传感器读到状态：空间完全无人，生命体征消失',
    decision: '我们想要打造的光照状态：极致节能待机，仅留地位轮廓防跌倒照明',
    output: '实际参数：2700K | 环境 0% | 任务 0% | 补光 0% | 情境 2% (已稳定达标)'
  },
  S1: {
    sensor: 'PIR人体感应 / 门窗传感器 / 毫米波雷达',
    state: '从传感器读到状态：有人新进入房间 (处于直立活动/刚进门)',
    decision: '我们想要打造的光照状态：洗墙环境照明，提供视觉缓冲，避免瞳孔骤缩',
    output: '实际参数：4000K | 环境 50% | 任务 5% | 补光 0% | 情境 0% (已稳定达标)'
  },
  S2: {
    sensor: 'ToF姿态传感器 / 语音指令',
    state: '从传感器读到状态：使用者已在工作台面就坐',
    decision: '我们想要打造的光照状态：高照度冷白聚光，抑制褪黑素分泌，打造专注隧道视野',
    output: '实际参数：6500K | 环境 15% | 任务 100% | 补光 0% | 情境 0% (已稳定达标)'
  },
  S3: {
    sensor: '前台应用监测 / 语音指令',
    state: '从传感器读到状态：视频会议软件在前台运行',
    decision: '我们想要打造的光照状态：水平面部补光消除阴影，背景低饱和度情境渲染',
    output: '实际参数：4000K | 环境 20% | 任务 10% | 补光 85% | 情境 40% (已稳定达标)'
  },
  S4: {
    sensor: 'EEG脑电波 / ToF姿态传感器',
    state: '从传感器读到状态：使用者后仰休息 且 脑波疲劳度 >=75%',
    decision: '我们想要打造的光照状态：黄昏节律柔和非直射暖光，平抚情绪，激活副交感神经',
    output: '实际参数：3000K | 环境 10% | 任务 0% | 补光 0% | 情境 25% (已稳定达标)'
  }
};

const TRANSITION_INTERP = {
  T01: {
    sensor: 'PIR人体感应 / 门窗传感器 / 毫米波雷达',
    state: '从传感器读到状态：检测到开门或人员走动信号',
    decision: '我们想要打造的光照状态：亮起 50% 亮度洗墙漫射灯照亮房间',
    output: '目标参数：4000K, 环境亮度 50%, 变化时间 0.5s'
  },
  T02: {
    sensor: 'ToF姿态传感器 / 语音控制',
    state: '从传感器读到状态：使用者直接在座位就坐 或 触发工作指令',
    decision: '我们想要打造的光照状态：快速亮起 6500K 高色温任务灯并压低背景环境',
    output: '目标参数：6500K, 任务亮度 100%, 变化时间 2.0s'
  },
  T03: {
    sensor: '前台应用检测 / 语音控制',
    state: '从传感器读到状态：视频应用前台加载 或 触发视频会议指令',
    decision: '我们想要打造的光照状态：开启挂灯/侧板灯以提供面部补光，拉下百叶窗',
    output: '目标参数：4000K, 补光亮度 85%, 变化时间 1.5s'
  },
  T04: {
    sensor: 'ToF姿态传感器 / EEG脑电波',
    state: '从传感器读到状态：直接靠椅仰躺 或 脑电波显示高度疲劳',
    decision: '我们想要打造的光照状态：关闭顶部直射，转为低位黄昏色温微光进行放松干预',
    output: '目标参数：3000K, 情境亮度 25%, 变化时间 3.0s'
  },
  T12: {
    sensor: 'ToF姿态传感器 / 语音控制',
    state: '从传感器读到状态：使用者从站立走动转为就坐工作',
    decision: '我们想要打造的光照状态：开启强冷白任务灯投射工作区，抑制褪黑素',
    output: '目标参数：6500K, 任务亮度 100%, 变化时间 2.0s'
  },
  T13: {
    sensor: '前台应用检测 / 语音控制',
    state: '从传感器读到状态：站立状态下打开视频软件 或 语音要求开会',
    decision: '我们想要打造的光照状态：开启正面面部漫射柔光，并开启背景氛围与遮光帘',
    output: '目标参数：4000K, 补光亮度 85%, 变化时间 1.5s'
  },
  T14: {
    sensor: 'EEG脑电波 / ToF姿态传感器',
    state: '从传感器读到状态：人员就坐但疲劳指数 >=75% 或 姿态变为仰躺',
    decision: '我们想要打造的光照状态：关闭天花板眩光源，提供低色温柔和琥珀光放松精神',
    output: '目标参数：3000K, 情境亮度 25%, 变化时间 3.0s'
  },
  T21: {
    sensor: 'ToF姿态传感器',
    state: '从传感器读到状态：就坐工作者站立离开办公桌',
    decision: '我们想要打造的光照状态：关闭桌面强聚光，亮起环境洗墙泛光以防视疲劳',
    output: '目标参数：4000K, 环境亮度 50%, 变化时间 2.0s'
  },
  T23: {
    sensor: '前台应用检测 / 语音控制',
    state: '从传感器读到状态：工作状态中开启视频会议软件',
    decision: '我们想要打造的光照状态：由桌面任务照明切换为垂直面部补光，拉下智能窗帘',
    output: '目标参数：4000K, 补光亮度 85%, 变化时间 1.0s'
  },
  T24: {
    sensor: 'EEG脑电波 / ToF姿态传感器',
    state: '从传感器读到状态：脑波疲劳度偏高 或 坐姿变为靠背仰躺',
    decision: '我们想要打造的光照状态：停止顶部专注强光射入，转为低位反射暖色光',
    output: '目标参数：3000K, 情境亮度 25%, 变化时间 4.0s'
  },
  T31: {
    sensor: '前台应用检测 / ToF姿态传感器',
    state: '从传感器读到状态：关闭会议软件 且 人员起立离开',
    decision: '我们想要打造的光照状态：退出补光与情境氛围，柔和恢复至普通活动泛光',
    output: '目标参数：4000K, 环境亮度 50%, 变化时间 1.5s'
  },
  T32: {
    sensor: '前台应用检测 / ToF姿态传感器',
    state: '从传感器读到状态：会议窗口已关闭，但人员依旧就坐',
    decision: '我们想要打造的光照状态：熄灭垂直补光，重新启动冷白任务灯以投射台面',
    output: '目标参数：6500K, 任务亮度 100%, 变化时间 2.0s'
  },
  T34: {
    sensor: '前台应用检测 / EEG脑电波',
    state: '从传感器读到状态：视频会议结束 且 脑波读数显示严重疲劳/坐姿靠背',
    decision: '我们想要打造的光照状态：彻底熄灭顶部直射强光，进入极舒缓的暖黄节律光照',
    output: '目标参数：3000K, 情境亮度 25%, 变化时间 3.0s'
  },
  T41: {
    sensor: 'ToF姿态传感器',
    state: '从传感器读到状态：使用者由仰躺休息转为站立行走',
    decision: '我们想要打造的光照状态：退出节律恢复，淡入基础泛光灯供正常活动使用',
    output: '目标参数：4000K, 环境亮度 50%, 变化时间 2.0s'
  },
  T42: {
    sensor: 'ToF姿态传感器 / 语音控制',
    state: '从传感器读到状态：人员从休息姿势重新坐正工作',
    decision: '我们想要打造的光照状态：压低背景漫射，重新将 6500K 冷白专注光投向书桌',
    output: '目标参数：6500K, 任务亮度 100%, 变化时间 2.5s'
  },
  Treset: {
    sensor: '所有感应信号归零 (毫米波雷达判定无人)',
    state: '从传感器读到状态：房间持续空置无任何生命体征',
    decision: '我们想要打造的光照状态：关闭所有主动通道以节能，仅保留踢脚线琥珀色脚灯',
    output: '目标参数：2700K, 脚灯亮度 2%, 变化时间 2.0s (滞后5.0s)'
  }
};

function lerp(a, b, t) { return a + (b - a) * t; }

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function cctToColor(cct) {
  const stops = [
    { cct: 2700, r: 255, g: 169, b: 87 },
    { cct: 3000, r: 255, g: 190, b: 120 },
    { cct: 3500, r: 255, g: 210, b: 155 },
    { cct: 4000, r: 255, g: 228, b: 185 },
    { cct: 5000, r: 240, g: 238, b: 230 },
    { cct: 6500, r: 180, g: 210, b: 255 },
  ];
  if (cct <= stops[0].cct) return `rgb(${stops[0].r},${stops[0].g},${stops[0].b})`;
  if (cct >= stops[stops.length - 1].cct) {
    const s = stops[stops.length - 1];
    return `rgb(${s.r},${s.g},${s.b})`;
  }
  for (let i = 0; i < stops.length - 1; i++) {
    if (cct >= stops[i].cct && cct <= stops[i + 1].cct) {
      const t = (cct - stops[i].cct) / (stops[i + 1].cct - stops[i].cct);
      const r = Math.round(lerp(stops[i].r, stops[i + 1].r, t));
      const g = Math.round(lerp(stops[i].g, stops[i + 1].g, t));
      const b = Math.round(lerp(stops[i].b, stops[i + 1].b, t));
      return `rgb(${r},${g},${b})`;
    }
  }
  return '#fff';
}

function formatTime() {
  const now = new Date();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${m}:${s}`;
}

// =====================================================================
// 3. FSM ENGINE
// =====================================================================

class FSMEngine {
  constructor() {
    this.currentState = 'S0';
    this.transitioning = false;
    this.transitionFrom = null;
    this.transitionTo = null;
    this.transitionProgress = 0;
    this.transitionStartTime = 0;
    this.transitionDuration = 0;
    this.resetTimer = null;
    this.resetCountdown = 0;
    this.paused = false;
    this.transitionElapsed = 0;
    this.lastTickTime = 0;

    this.sensors = {
      pir: false,
      door: false,
      radar: false,
      posture: 'none',
      voiceCmd: null,
      eeg: 0,
      videoApp: false,
    };

    this.listeners = {};
    this._animFrame = null;
  }

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(fn => fn(data));
  }

  setSensor(key, value) {
    this.sensors[key] = value;
    this.emit('sensor-change', { key, value, sensors: { ...this.sensors } });

    // Clear voice command after a delay (it's a one-shot event)
    if (key === 'voiceCmd' && value) {
      // Evaluate immediately, then clear
      this.evaluate();
      setTimeout(() => {
        this.sensors.voiceCmd = null;
      }, 500);
      return;
    }

    this.evaluate();
  }

  evaluate() {
    if (this.transitioning) return;

    const current = this.currentState;

    // Check global reset first
    if (current !== 'S0' && GLOBAL_RESET.condition(this.sensors)) {
      if (!this.resetTimer) {
        this.resetCountdown = GLOBAL_RESET.hysteresisMs;
        this.emit('reset-countdown-start', { ms: this.resetCountdown });
        this.resetTimer = setTimeout(() => {
          // Re-check condition after hysteresis
          if (GLOBAL_RESET.condition(this.sensors)) {
            this.startTransition(current, 'S0', GLOBAL_RESET.fadeMs, GLOBAL_RESET.descCn);
          }
          this.resetTimer = null;
          this.emit('reset-countdown-end', {});
        }, this.resetCountdown);
      }
    } else if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
      this.emit('reset-countdown-end', {});
    }

    // Check normal transitions from current state
    for (const t of TRANSITIONS) {
      if (t.from === current && t.condition(this.sensors)) {
        this.startTransition(t.from, t.to, t.fadeMs, t.descCn);
        return;
      }
    }
  }

  forceTransition(targetState) {
    if (this.transitioning || targetState === this.currentState) return;
    const fadeMs = 1500;
    this.startTransition(this.currentState, targetState, fadeMs, '手动切换');
  }

  startTransition(from, to, durationMs, triggerDesc) {
    if (this.transitioning) return;
    this.transitioning = true;
    this.transitionFrom = from;
    this.transitionTo = to;
    this.transitionDuration = durationMs;
    this.transitionProgress = 0;
    this.transitionStartTime = performance.now();
    this.transitionElapsed = 0;
    this.lastTickTime = performance.now();
    this.paused = false;

    // Clear reset timer
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }

    this.emit('transition-start', {
      from, to, durationMs, triggerDesc,
      fromState: STATES[from],
      toState: STATES[to],
    });

    const tick = (now) => {
      if (this.paused) {
        this.lastTickTime = now;
        this._animFrame = requestAnimationFrame(tick);
        return;
      }
      const delta = now - this.lastTickTime;
      this.lastTickTime = now;
      this.transitionElapsed += delta;
      this.transitionProgress = Math.min(this.transitionElapsed / durationMs, 1);
      const eased = easeInOutCubic(this.transitionProgress);

      const fromS = STATES[from];
      const toS = STATES[to];

      // Interpolate parameters
      const currentCCT = Math.round(lerp(fromS.cct, toS.cct, eased));
      const currentLux = Math.round(lerp(fromS.lux, toS.lux, eased));
      const channels = {};
      for (const ch of ['ambient', 'task', 'facial', 'accent']) {
        channels[ch] = lerp(fromS.channels[ch], toS.channels[ch], eased);
      }

      this.emit('transition-tick', {
        progress: this.transitionProgress,
        eased,
        cct: currentCCT,
        lux: currentLux,
        channels,
        from, to,
      });

      if (this.transitionProgress < 1) {
        this._animFrame = requestAnimationFrame(tick);
      } else {
        this.transitioning = false;
        this.currentState = to;
        this.transitionFrom = null;
        this.transitionTo = null;
        this.emit('transition-end', { newState: to, state: STATES[to] });
        // Re-evaluate after transition completes
        setTimeout(() => this.evaluate(), 100);
      }
    };

    this._animFrame = requestAnimationFrame(tick);
  }

  reset() {
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    if (this.resetTimer) clearTimeout(this.resetTimer);
    this.transitioning = false;
    this.currentState = 'S0';
    this.transitionProgress = 0;
    this.sensors = {
      pir: false, door: false, radar: false,
      posture: 'none', voiceCmd: null, eeg: 0, videoApp: false,
    };
    this.emit('reset', {});
  }
}

// =====================================================================
// 4. UI RENDERER
// =====================================================================

class UIRenderer {
  constructor(engine) {
    this.engine = engine;
    this.activeEdgeId = null;
    this.flowAnimFrames = {};
  }

  init() {
    this.buildDiagram();
    this.bindEngineEvents();
    this.updateStateUI(STATES.S0);
    this.updateChannelGauges(STATES.S0.channels);
    this.updateRoomView(STATES.S0);
    this.updateDashboard(STATES.S0.cct, STATES.S0.lux, 0);
    this.updateAvailableTransitions('S0');
    this.updateInterpreter('S0', this.engine.sensors, false);
  }

  // ----- Build SVG Diagram -----
  buildDiagram() {
    const edgesG = document.getElementById('edges-group');
    const nodesG = document.getElementById('nodes-group');
    const dotsG = document.getElementById('flow-dots-group');

    // Draw edges
    const edgePaths = this.computeEdgePaths();
    for (const t of TRANSITIONS) {
      const pathData = edgePaths[t.id];
      if (!pathData) continue;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-edge', t.id);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.classList.add('fsm-edge-path');
      path.setAttribute('marker-end', 'url(#arrowhead)');
      path.id = `edge-path-${t.id}`;
      g.appendChild(path);

      // Label
      const fromS = STATES[t.from];
      const toS = STATES[t.to];
      const mx = (fromS.cx + toS.cx) / 2;
      const my = (fromS.cy + toS.cy) / 2;
      const labelOffset = this.getLabelOffset(t.id);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.classList.add('edge-label');
      label.setAttribute('x', mx + labelOffset.x);
      label.setAttribute('y', my + labelOffset.y);
      label.id = `edge-label-${t.id}`;
      label.textContent = t.labelCn;
      g.appendChild(label);

      edgesG.appendChild(g);

      // Flow dots (3 per edge)
      for (let i = 0; i < 3; i++) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.classList.add('flow-dot');
        dot.setAttribute('r', '3');
        dot.setAttribute('cx', '0');
        dot.setAttribute('cy', '0');
        dot.id = `flow-${t.id}-${i}`;
        dotsG.appendChild(dot);
      }
    }

    // Draw global reset edges (dashed, from each non-S0 state back to S0)
    for (const sId of ['S1', 'S2', 'S3', 'S4']) {
      const s = STATES[sId];
      const s0 = STATES.S0;
      const pathData = this.computeResetPath(s, s0, sId);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.classList.add('fsm-edge-path', 'reset-edge');
      path.setAttribute('marker-end', 'url(#arrowhead-reset)');
      edgesG.appendChild(path);
    }

    // Reset label
    const resetLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    resetLabel.classList.add('edge-label');
    resetLabel.setAttribute('x', 640);
    resetLabel.setAttribute('y', 55);
    resetLabel.setAttribute('font-size', '8');
    resetLabel.textContent = '全局复位 (T*→₀)';
    edgesG.appendChild(resetLabel);

    // Draw nodes
    for (const [id, s] of Object.entries(STATES)) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('fsm-node');
      g.setAttribute('data-state', id);
      g.style.transformOrigin = `${s.cx}px ${s.cy}px`;

      // Glow ring
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.classList.add('node-glow');
      glow.setAttribute('cx', s.cx);
      glow.setAttribute('cy', s.cy);
      glow.setAttribute('r', '48');
      glow.setAttribute('fill', 'none');
      glow.setAttribute('stroke', s.color);
      glow.setAttribute('stroke-width', '3');
      glow.setAttribute('filter', `url(#glow-${id.toLowerCase()})`);
      glow.id = `glow-${id}`;
      if (id === 'S0') glow.classList.add('active');
      g.appendChild(glow);

      // Main circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.classList.add('node-circle');
      circle.setAttribute('cx', s.cx);
      circle.setAttribute('cy', s.cy);
      circle.setAttribute('r', '38');
      circle.setAttribute('fill', `url(#grad-${id.toLowerCase()})`);
      if (id === 'S0') circle.classList.add('active');
      circle.id = `circle-${id}`;
      g.appendChild(circle);

      // State ID text
      const idText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      idText.classList.add('node-state-id');
      idText.setAttribute('x', s.cx);
      idText.setAttribute('y', s.cy - 14);
      idText.textContent = s.symbol;
      g.appendChild(idText);

      // Chinese label
      const labelCn = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelCn.classList.add('node-label-cn');
      labelCn.setAttribute('x', s.cx);
      labelCn.setAttribute('y', s.cy + 4);
      labelCn.textContent = s.nameCn;
      g.appendChild(labelCn);

      // English label
      const labelEn = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      labelEn.classList.add('node-label-en');
      labelEn.setAttribute('x', s.cx);
      labelEn.setAttribute('y', s.cy + 18);
      labelEn.textContent = s.nameEn;
      g.appendChild(labelEn);

      // Click handler
      g.addEventListener('click', () => {
        this.engine.forceTransition(id);
      });

      nodesG.appendChild(g);
    }
  }

  computeEdgePaths() {
    const paths = {};
    const S = STATES;
    const nr = 38; // node radius (using exact 38)

    // T01 (S0 -> S1, straight down)
    paths['T01'] = `M ${S.S0.cx} ${S.S0.cy + nr} L ${S.S1.cx} ${S.S1.cy - nr}`;
    // T02 (S0 -> S2, curve left)
    paths['T02'] = `M ${S.S0.cx - 26} ${S.S0.cy + 26} Q ${S.S0.cx - 90} ${(S.S0.cy + S.S2.cy)/2} ${S.S2.cx - 26} ${S.S2.cy - 26}`;
    // T03 (S0 -> S3, curve right)
    paths['T03'] = `M ${S.S0.cx + 26} ${S.S0.cy + 26} Q ${S.S3.cx} ${(S.S0.cy + S.S3.cy)/2 - 40} ${S.S3.cx} ${S.S3.cy - nr}`;
    // T04 (S0 -> S4, curve left)
    paths['T04'] = `M ${S.S0.cx - 30} ${S.S0.cy + 20} Q ${S.S4.cx} ${(S.S0.cy + S.S4.cy)/2 - 40} ${S.S4.cx} ${S.S4.cy - nr}`;

    // T12 (S1 -> S2, straight down)
    paths['T12'] = `M ${S.S1.cx} ${S.S1.cy + nr} L ${S.S2.cx} ${S.S2.cy - nr}`;
    // T13 (S1 -> S3, curve right)
    paths['T13'] = `M ${S.S1.cx + 30} ${S.S1.cy + 20} Q ${S.S1.cx + 140} ${(S.S1.cy + S.S3.cy)/2} ${S.S3.cx - 15} ${S.S3.cy - 35}`;
    // T14 (S1 -> S4, curve left)
    paths['T14'] = `M ${S.S1.cx - 30} ${S.S1.cy + 20} Q ${S.S1.cx - 140} ${(S.S1.cy + S.S4.cy)/2} ${S.S4.cx + 15} ${S.S4.cy - 35}`;

    // T21 (S2 -> S1, curve back up offset)
    paths['T21'] = `M ${S.S2.cx - 15} ${S.S2.cy - nr} Q ${S.S2.cx - 40} ${(S.S2.cy + S.S1.cy)/2} ${S.S1.cx - 15} ${S.S1.cy + nr}`;
    // T23 (S2 -> S3, curve right)
    paths['T23'] = `M ${S.S2.cx + 30} ${S.S2.cy + 26} Q ${S.S2.cx + 120} ${(S.S2.cy + S.S3.cy) / 2} ${S.S3.cx - 28} ${S.S3.cy - 22}`;
    // T24 (S2 -> S4, curve left)
    paths['T24'] = `M ${S.S2.cx - 30} ${S.S2.cy + 26} Q ${S.S2.cx - 120} ${(S.S2.cy + S.S4.cy) / 2} ${S.S4.cx + 28} ${S.S4.cy - 22}`;

    // T31 (S3 -> S1, curve right up)
    paths['T31'] = `M ${S.S3.cx + 20} ${S.S3.cy - 30} Q ${S.S3.cx + 80} ${(S.S1.cy + S.S3.cy) / 2 - 20} ${S.S1.cx + 36} ${S.S1.cy + 14}`;
    // T32 (S3 -> S2, curve inner)
    paths['T32'] = `M ${S.S3.cx - 32} ${S.S3.cy - 20} Q ${S.S2.cx + 60} ${S.S3.cy - 30} ${S.S2.cx + 30} ${S.S2.cy + 20}`;
    // T34 (S3 -> S4, horizontal bottom curve)
    paths['T34'] = `M ${S.S3.cx - 32} ${S.S3.cy + 20} Q ${(S.S3.cx + S.S4.cx)/2} ${S.S3.cy + 55} ${S.S4.cx + 32} ${S.S4.cy + 20}`;

    // T41 (S4 -> S1, curve left up)
    paths['T41'] = `M ${S.S4.cx - 20} ${S.S4.cy - 30} Q ${S.S4.cx - 80} ${(S.S1.cy + S.S4.cy) / 2 - 20} ${S.S1.cx - 36} ${S.S1.cy + 14}`;
    // T42 (S4 -> S2, curve inner)
    paths['T42'] = `M ${S.S4.cx + 32} ${S.S4.cy - 20} Q ${S.S2.cx - 60} ${S.S4.cy - 30} ${S.S2.cx - 30} ${S.S2.cy + 20}`;

    return paths;
  }

  computeResetPath(from, to, fromId) {
    // Simple curved dashed paths back to S0
    const offsets = {
      S1: { cpx: 80, cpy: 0 },
      S2: { cpx: 160, cpy: -40 },
      S3: { cpx: 180, cpy: -80 },
      S4: { cpx: -160, cpy: -80 },
    };
    const off = offsets[fromId] || { cpx: 100, cpy: 0 };
    // Go via right side for S1-S3, left side for S4
    const cpx = from.cx + off.cpx;
    const cpy = (from.cy + to.cy) / 2 + off.cpy;
    return `M ${from.cx + (fromId === 'S4' ? -30 : 30)} ${from.cy - 20} Q ${cpx} ${cpy} ${to.cx + (fromId === 'S4' ? -30 : 30)} ${to.cy + 10}`;
  }

  getLabelOffset(edgeId) {
    const offsets = {
      T01: { x: 40, y: 0 },
      T02: { x: -65, y: -15 },
      T03: { x: 90, y: -40 },
      T04: { x: -90, y: -40 },
      T12: { x: 40, y: 0 },
      T13: { x: 80, y: -10 },
      T14: { x: -80, y: -10 },
      T21: { x: -45, y: 0 },
      T23: { x: 30, y: -20 },
      T24: { x: -30, y: -20 },
      T31: { x: 70, y: -10 },
      T32: { x: 45, y: 20 },
      T34: { x: 0, y: 35 },
      T41: { x: -70, y: -10 },
      T42: { x: -45, y: 20 },
    };
    return offsets[edgeId] || { x: 0, y: 0 };
  }

  // ----- Engine Event Binding -----
  bindEngineEvents() {
    this.engine.on('transition-start', (data) => {
      this.onTransitionStart(data);
    });

    this.engine.on('transition-tick', (data) => {
      this.onTransitionTick(data);
    });

    this.engine.on('transition-end', (data) => {
      this.onTransitionEnd(data);
    });

    this.engine.on('reset', () => {
      this.onReset();
    });

    this.engine.on('sensor-change', (data) => {
      this.onSensorChange(data);
    });
  }

  // ----- Transition Handlers -----
  onSensorChange(data) {
    if (!this.engine.transitioning) {
      this.updateInterpreter(this.engine.currentState, data.sensors, false);
    } else {
      const detectEl = document.getElementById('interp-detect');
      if (detectEl) {
        detectEl.innerHTML = this.formatDetectText(data.sensors);
      }
    }
  }

  onTransitionStart(data) {
    const { from, to, durationMs, triggerDesc } = data;

    // Deactivate from node glow
    const fromGlow = document.getElementById(`glow-${from}`);
    const fromCircle = document.getElementById(`circle-${from}`);
    if (fromGlow) fromGlow.classList.remove('active');
    if (fromCircle) fromCircle.classList.remove('active');

    // Find the edge and activate
    const edge = TRANSITIONS.find(t => t.from === from && t.to === to);
    if (edge) {
      this.activeEdgeId = edge.id;
      const path = document.getElementById(`edge-path-${edge.id}`);
      const label = document.getElementById(`edge-label-${edge.id}`);
      if (path) {
        path.classList.add('active');
        path.setAttribute('marker-end', 'url(#arrowhead-active)');
      }
      if (label) label.classList.add('active');
      this.startFlowDots(edge.id);
    }

    // Update transition info
    document.getElementById('transition-info').textContent = `${STATES[from].symbol} → ${STATES[to].symbol}`;
    document.getElementById('status-text').textContent = '转换中…';

    const btnPause = document.getElementById('btn-pause-transition');
    if (btnPause) {
      btnPause.disabled = false;
      btnPause.textContent = '⏸';
      btnPause.classList.remove('active');
      btnPause.title = '暂停当前转换';
    }

    // Update param cards
    document.getElementById('param-fade').innerHTML = `${(durationMs / 1000).toFixed(1)}<span class="param-card-unit">s</span>`;
    document.getElementById('param-fade').style.color = '#a0c4ff';

    // Update AI image for target state
    const nextState = STATES[to];
    const img = document.getElementById('ai-render-img');
    if (img) {
      img.src = `images/${to.toLowerCase()}.png`;
      img.style.opacity = '0';
    }
    const promptText = document.getElementById('ai-prompt-text');
    if (promptText) {
      promptText.textContent = nextState.prompt || '';
    }

    // Sync AI room overlay badges immediately
    const roomStateTextAi = document.getElementById('room-state-text-ai');
    const roomStateDotAi = document.getElementById('room-state-dot-ai');
    const roomStateBadgeAi = document.getElementById('room-state-badge-ai');
    if (roomStateTextAi) roomStateTextAi.textContent = `${nextState.symbol} ${nextState.nameCn}`;
    if (roomStateDotAi) {
      roomStateDotAi.style.background = nextState.color;
      roomStateDotAi.style.boxShadow = `0 0 8px ${nextState.glowColor}`;
    }
    if (roomStateBadgeAi) roomStateBadgeAi.style.borderColor = nextState.color + '40';

    // Update FSM Interpreter
    this.updateInterpreter(from, this.engine.sensors, true, to);

    // Add timeline event
    this.addTimelineEvent(from, to, triggerDesc);
  }

  onTransitionTick(data) {
    const { progress, cct, lux, channels } = data;

    // Update dashboard
    this.updateDashboard(cct, lux, progress);

    // Update channel gauges
    this.updateChannelGauges(channels);

    // Fade in AI render image
    const img = document.getElementById('ai-render-img');
    if (img) {
      img.style.opacity = progress;
    }

    // Update room view interpolated
    if (data.from && data.to) {
      this.updateRoomViewInterpolated(data.from, data.to, data.eased);
    }

    // Update CCT color of background glow
    document.documentElement.style.setProperty('--current-cct-color', cctToColor(cct));

    // Update FSM Interpreter dynamically
    this.updateInterpreter(data.from, this.engine.sensors, true, data.to, data);
  }

  onTransitionEnd(data) {
    const { newState, state } = data;

    // Activate new node
    const glow = document.getElementById(`glow-${newState}`);
    const circle = document.getElementById(`circle-${newState}`);
    if (glow) glow.classList.add('active');
    if (circle) circle.classList.add('active');

    // Deactivate edge
    if (this.activeEdgeId) {
      const path = document.getElementById(`edge-path-${this.activeEdgeId}`);
      const label = document.getElementById(`edge-label-${this.activeEdgeId}`);
      if (path) {
        path.classList.remove('active');
        path.setAttribute('marker-end', 'url(#arrowhead)');
      }
      if (label) label.classList.remove('active');
      this.stopFlowDots(this.activeEdgeId);
      this.activeEdgeId = null;
    }

    // Update state detail panel
    this.updateStateUI(state);
    this.updateRoomView(state);
    this.updateAvailableTransitions(newState);

    // Update FSM Interpreter to stable state
    this.updateInterpreter(newState, this.engine.sensors, false);

    // Reset transition bar
    document.getElementById('transition-bar-fill').style.width = '0%';
    document.getElementById('transition-info').textContent = '';
    document.getElementById('status-text').textContent = `${state.symbol} ${state.nameCn}`;
    document.getElementById('param-fade').innerHTML = `—<span class="param-card-unit"></span>`;
    document.getElementById('param-fade').style.color = '';

    // Disable pause button
    const btnPause = document.getElementById('btn-pause-transition');
    if (btnPause) {
      btnPause.disabled = true;
      btnPause.textContent = '⏸';
      btnPause.classList.remove('active');
      btnPause.title = '当前无转换进行';
    }
  }

  onReset() {
    // Reset all nodes
    for (const id of Object.keys(STATES)) {
      const glow = document.getElementById(`glow-${id}`);
      const circle = document.getElementById(`circle-${id}`);
      if (glow) glow.classList.remove('active');
      if (circle) circle.classList.remove('active');
    }
    // Activate S0
    document.getElementById('glow-S0').classList.add('active');
    document.getElementById('circle-S0').classList.add('active');

    // Deactivate any active edge
    if (this.activeEdgeId) {
      this.stopFlowDots(this.activeEdgeId);
      const path = document.getElementById(`edge-path-${this.activeEdgeId}`);
      const label = document.getElementById(`edge-label-${this.activeEdgeId}`);
      if (path) {
        path.classList.remove('active');
        path.setAttribute('marker-end', 'url(#arrowhead)');
      }
      if (label) label.classList.remove('active');
      this.activeEdgeId = null;
    }

    // Reset all UI
    this.updateStateUI(STATES.S0);
    this.updateChannelGauges(STATES.S0.channels);
    this.updateRoomView(STATES.S0);
    this.updateDashboard(STATES.S0.cct, STATES.S0.lux, 0);
    this.updateAvailableTransitions('S0');
    this.updateInterpreter('S0', this.engine.sensors, false);
    document.getElementById('transition-info').textContent = '';
    document.getElementById('status-text').textContent = '就绪';

    // Disable pause button
    const btnPause = document.getElementById('btn-pause-transition');
    if (btnPause) {
      btnPause.disabled = true;
      btnPause.textContent = '⏸';
      btnPause.classList.remove('active');
      btnPause.title = '当前无转换进行';
    }

    // Reset sensor controls UI
    document.getElementById('input-pir').checked = false;
    document.getElementById('input-door').checked = false;
    document.getElementById('input-radar').checked = false;
    document.getElementById('input-posture').value = 'none';
    document.getElementById('input-eeg').value = 0;
    document.getElementById('eeg-value').textContent = '0%';
    document.getElementById('input-videoapp').checked = false;
    document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sensor-item').forEach(si => si.classList.remove('triggered'));
  }

  getTriggeringSensorInfo(edgeId, sensors) {
    if (edgeId === 'Treset') {
      return '所有感应信号归零';
    }
    const activeSensors = [];
    if (sensors.pir) activeSensors.push('🚶 PIR人体感应');
    if (sensors.door) activeSensors.push('🚪 门窗传感器');
    if (sensors.radar) activeSensors.push('📡 毫米波雷达');
    if (sensors.posture && sensors.posture !== 'none') {
      const postMap = { standing: '🚶 ToF姿态(站立)', seated: '🧘 ToF姿态(就坐)', reclined: '🛌 ToF姿态(仰躺)' };
      if (postMap[sensors.posture]) activeSensors.push(postMap[sensors.posture]);
    }
    if (sensors.videoApp) activeSensors.push('💻 视频应用前台');
    if (sensors.eeg >= 75) activeSensors.push(`🧠 EEG脑电波 (${sensors.eeg}% 疲劳)`);
    if (sensors.voiceCmd) {
      const cmdMap = { focus: '开始工作', video: '视频会议', endvideo: '结束会议' };
      activeSensors.push(`🎤 语音指令: "${cmdMap[sensors.voiceCmd] || sensors.voiceCmd}"`);
    }
    
    if (activeSensors.length > 0) {
      return activeSensors.join(' + ');
    }
    const fallbackMap = {
      T01: '🚶 移动传感器',
      T02: '🧘 ToF姿态传感器',
      T03: '💻 视频前台软件 / 🎤 语音',
      T04: '🧠 EEG脑电波 / 🧘 ToF姿态',
      T12: '🧘 ToF姿态 / 🎤 语音',
      T13: '💻 视频前台软件 / 🎤 语音',
      T14: '🧠 EEG脑电波 / 🧘 ToF姿态',
      T21: '🧘 ToF姿态传感器',
      T23: '💻 视频前台软件 / 🎤 语音',
      T24: '🧠 EEG脑电波 / 🧘 ToF姿态',
      T31: '💻 视频前台软件 / 🧘 ToF姿态',
      T32: '💻 视频前台软件 / 🧘 ToF姿态',
      T34: '💻 视频前台软件 / 🧠 EEG脑电波',
      T41: '🧘 ToF姿态传感器',
      T42: '🧘 ToF姿态 / 🎤 语音',
    };
    return fallbackMap[edgeId] || '📡 传感器感应系统';
  }

  updateInterpreter(stateId, sensors, isTransitioning, nextStateId = null, tickData = null) {
    const detectEl = document.getElementById('interp-detect');
    const implicationEl = document.getElementById('interp-implication');
    const decisionEl = document.getElementById('interp-decision');
    const changesEl = document.getElementById('interp-changes');

    if (!detectEl || !implicationEl || !decisionEl || !changesEl) return;

    // Active step highlights
    const steps = [
      document.getElementById('interp-step-1'),
      document.getElementById('interp-step-2'),
      document.getElementById('interp-step-3'),
      document.getElementById('interp-step-4')
    ];

    // Highlight all steps during state tracking
    steps.forEach(s => s && s.classList.add('active'));

    if (isTransitioning && nextStateId) {
      // Find active edge
      let activeEdge = this.activeEdgeId;
      if (!activeEdge) {
        const edge = TRANSITIONS.find(t => t.from === stateId && t.to === nextStateId);
        activeEdge = edge ? edge.id : (nextStateId === 'S0' ? 'Treset' : null);
      }

      const interp = TRANSITION_INTERP[activeEdge] || {
        sensor: '传感器检测中',
        state: '从传感器读到状态：状态切换中',
        decision: '我们想要打造的光照状态：调节光环境',
        output: '渐变过渡中...'
      };

      const sensorLabel = this.getTriggeringSensorInfo(activeEdge, sensors);
      detectEl.innerHTML = `<span style="color:var(--accent-blue); font-weight: 600;">[触发]</span> ${sensorLabel}`;
      implicationEl.innerHTML = interp.state;
      decisionEl.innerHTML = interp.decision;

      if (tickData) {
        const progressPercent = Math.round(tickData.progress * 100);
        changesEl.innerHTML = `<span style="color:var(--accent-amber); font-weight: 600;">[渐变中 ${progressPercent}%]</span> ${interp.output}`;
      } else {
        changesEl.innerHTML = interp.output;
      }
    } else {
      const interp = STABLE_INTERP[stateId];
      if (interp) {
        detectEl.innerHTML = `<span style="color:var(--text-secondary);">[监测中]</span> ${interp.sensor}`;
        implicationEl.innerHTML = interp.state;
        decisionEl.innerHTML = interp.decision;
        changesEl.innerHTML = interp.output;
      }
    }
  }

  formatDetectText(sensors) {
    let active = [];
    if (sensors.pir) active.push('<span style="color:#4da6ff; font-weight:500;">🚶人感(PIR)</span>');
    if (sensors.door) active.push('<span style="color:#e8a840; font-weight:500;">🚪门开</span>');
    if (sensors.radar) active.push('<span style="color:#38c8b0; font-weight:500;">📡雷达有生</span>');
    if (sensors.posture && sensors.posture !== 'none') {
      const postMap = { standing: '🚶立姿', seated: '🧘就坐', reclined: '🛌仰躺' };
      active.push(`<span style="color:#a0b8e0; font-weight:500;">${postMap[sensors.posture]}</span>`);
    }
    if (sensors.videoApp) active.push('<span style="color:#ff8484; font-weight:500;">💻视频前台</span>');
    if (sensors.eeg > 0) {
      const color = sensors.eeg >= 75 ? '#ff8484' : '#a0b8e0';
      active.push(`<span style="color:${color}; font-weight:500;">🧠疲劳度 ${sensors.eeg}%</span>`);
    }
    if (sensors.voiceCmd) active.push(`<span style="color:#e8a840; font-weight:500;">🎤语音: "${sensors.voiceCmd}"</span>`);

    return active.length > 0 ? active.join(' <span style="color:var(--text-muted)">|</span> ') : '<span style="color:var(--text-muted)">无激活信号 (系统静默待机)</span>';
  }

  // ----- Flow Dots Animation -----
  startFlowDots(edgeId) {
    const pathEl = document.getElementById(`edge-path-${edgeId}`);
    if (!pathEl) return;
    const totalLen = pathEl.getTotalLength();
    const dotCount = 3;
    const speed = 0.15; // pixels per ms

    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      for (let i = 0; i < dotCount; i++) {
        const dot = document.getElementById(`flow-${edgeId}-${i}`);
        if (!dot) continue;
        const offset = (i / dotCount) * totalLen;
        const pos = (elapsed * speed + offset) % totalLen;
        const pt = pathEl.getPointAtLength(pos);
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
        dot.classList.add('visible');
      }
      this.flowAnimFrames[edgeId] = requestAnimationFrame(animate);
    };
    this.flowAnimFrames[edgeId] = requestAnimationFrame(animate);
  }

  stopFlowDots(edgeId) {
    if (this.flowAnimFrames[edgeId]) {
      cancelAnimationFrame(this.flowAnimFrames[edgeId]);
      delete this.flowAnimFrames[edgeId];
    }
    for (let i = 0; i < 3; i++) {
      const dot = document.getElementById(`flow-${edgeId}-${i}`);
      if (dot) dot.classList.remove('visible');
    }
  }

  // ----- State Detail Panel -----
  updateStateUI(state) {
    document.getElementById('state-name-text').textContent = `${state.symbol} ${state.nameCn}`;
    document.getElementById('state-dot').style.background = state.color;
    document.getElementById('state-dot').style.boxShadow = `0 0 8px ${state.glowColor}`;
    document.getElementById('state-badge').style.borderColor = state.color + '40';
    document.getElementById('state-desc').textContent = state.desc;

    // Room view state badge sync
    const roomStateText = document.getElementById('room-state-text');
    const roomStateDot = document.getElementById('room-state-dot');
    const roomStateBadge = document.getElementById('room-state-badge');
    if (roomStateText) roomStateText.textContent = `${state.symbol} ${state.nameCn}`;
    if (roomStateDot) {
      roomStateDot.style.background = state.color;
      roomStateDot.style.boxShadow = `0 0 8px ${state.glowColor}`;
    }
    if (roomStateBadge) roomStateBadge.style.borderColor = state.color + '40';

    const cctColor = cctToColor(state.cct);
    document.getElementById('param-cct').innerHTML = `${state.cct}<span class="param-card-unit">K</span>`;
    document.getElementById('param-cct').style.color = cctColor;
    document.getElementById('param-lux').innerHTML = `${state.lux}<span class="param-card-unit">Lx</span>`;
    document.getElementById('param-lux').style.color = state.lux > 500 ? '#a0c4ff' : state.lux > 100 ? '#e0d8c0' : '#8a8070';

    document.documentElement.style.setProperty('--current-cct-color', cctColor);
  }

  // ----- Channel Gauges -----
  updateChannelGauges(channels) {
    const circumference = 2 * Math.PI * 20; // r=20
    const chMap = {
      ambient: { el: '#ch-ambient', color: '#e8a840', roomTag: '#room-ch-ambient' },
      task: { el: '#ch-task', color: '#4da6ff', roomTag: '#room-ch-task' },
      facial: { el: '#ch-facial', color: '#a0b8e0', roomTag: '#room-ch-facial' },
      accent: { el: '#ch-accent', color: '#38c8b0', roomTag: '#room-ch-accent' },
    };

    for (const [key, conf] of Object.entries(chMap)) {
      const val = channels[key] || 0;
      const container = document.querySelector(conf.el);
      if (!container) continue;
      const ring = container.querySelector('.channel-ring-fill');
      const valueEl = container.querySelector('.channel-value');
      if (ring) {
        ring.style.strokeDashoffset = circumference * (1 - val);
      }
      if (valueEl) {
        valueEl.textContent = `${Math.round(val * 100)}%`;
      }

      // Sync room view channel tags
      const roomTag = document.querySelector(conf.roomTag);
      if (roomTag) {
        roomTag.classList.toggle('active', val > 0.01);
      }
    }
  }

  // ----- Room View -----
  updateRoomView(state) {
    const r = state.room;
    // Calculate baseboard value (only S0 space vacant has baseboard light active)
    const baseboardVal = state.id === 'S0' ? 1.0 : 0;

    // Set CSS variables on the document element for dynamic SVG lighting
    const root = document.documentElement;
    root.style.setProperty('--light-baseboard-op', baseboardVal);
    root.style.setProperty('--light-ambient-op', r.ambient);
    root.style.setProperty('--light-task-op', r.task);
    root.style.setProperty('--light-facial-op', r.facial);
    root.style.setProperty('--light-accent1-op', r.accent1);
    root.style.setProperty('--light-accent2-op', r.accent2);
    root.style.setProperty('--light-window-op', r.window);
    root.style.setProperty('--light-blinds-op', r.blinds);
    root.style.setProperty('--room-person-opacity', r.person);

    // Dynamically calculate and apply architectural surface reflections (wall, floor, desk, person)
    this.updateRoomColors(state.cct, r.ambient, r.task, r.accent1, r.accent2, r.facial);

    // Toggle fixture classes for visual status (using correct SVG element IDs)
    const cove = document.getElementById('svg-light-ambient');
    if (cove) cove.classList.toggle('on', r.ambient > 0.05);

    const pendant = document.getElementById('svg-pendant-head');
    if (pendant) pendant.classList.toggle('on', r.task > 0.05);

    const desk = document.getElementById('svg-desk-surface');
    if (desk) desk.classList.toggle('lit', r.task > 0.05 || r.ambient > 0.1);

    const desklamp = document.getElementById('svg-desklamp-head');
    if (desklamp) desklamp.classList.toggle('on', r.accent1 > 0.05 || r.accent2 > 0.05);

    const monitor = document.getElementById('svg-monitor-screen');
    if (monitor) {
      monitor.classList.toggle('glow-video', this.engine.sensors.videoApp);
      monitor.classList.toggle('glow-facial', r.facial > 0.1 && !this.engine.sensors.videoApp);
    }

    // Ensure AI image is fully visible and has correct content
    const img = document.getElementById('ai-render-img');
    if (img) {
      img.src = `images/${state.id.toLowerCase()}.png`;
      img.style.opacity = '1';
    }
    const promptText = document.getElementById('ai-prompt-text');
    if (promptText) {
      promptText.textContent = state.prompt || '';
    }

    // Sync AI room overlay badges
    const roomStateTextAi = document.getElementById('room-state-text-ai');
    const roomStateDotAi = document.getElementById('room-state-dot-ai');
    const roomStateBadgeAi = document.getElementById('room-state-badge-ai');
    const roomCctBadgeAi = document.getElementById('room-cct-badge-ai');
    if (roomStateTextAi) roomStateTextAi.textContent = `${state.symbol} ${state.nameCn}`;
    if (roomStateDotAi) {
      roomStateDotAi.style.background = state.color;
      roomStateDotAi.style.boxShadow = `0 0 8px ${state.glowColor}`;
    }
    if (roomStateBadgeAi) roomStateBadgeAi.style.borderColor = state.color + '40';
    if (roomCctBadgeAi) {
      roomCctBadgeAi.textContent = `${state.cct}K`;
      roomCctBadgeAi.style.color = cctToColor(state.cct);
    }
  }

  updateRoomViewInterpolated(fromId, toId, t) {
    const fromR = STATES[fromId].room;
    const toR = STATES[toId].room;

    const fromBaseboard = fromId === 'S0' ? 1.0 : 0;
    const toBaseboard = toId === 'S0' ? 1.0 : 0;
    const baseboardVal = lerp(fromBaseboard, toBaseboard, t);

    // Interpolate light channel opacities
    const ambientVal = lerp(fromR.ambient, toR.ambient, t);
    const taskVal = lerp(fromR.task, toR.task, t);
    const facialVal = lerp(fromR.facial, toR.facial, t);
    const accent1Val = lerp(fromR.accent1, toR.accent1, t);
    const accent2Val = lerp(fromR.accent2, toR.accent2, t);
    const windowVal = lerp(fromR.window, toR.window, t);
    const blindsVal = lerp(fromR.blinds, toR.blinds, t);
    const personVal = lerp(fromR.person, toR.person, t);

    // Apply interpolated values to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--light-baseboard-op', baseboardVal);
    root.style.setProperty('--light-ambient-op', ambientVal);
    root.style.setProperty('--light-task-op', taskVal);
    root.style.setProperty('--light-facial-op', facialVal);
    root.style.setProperty('--light-accent1-op', accent1Val);
    root.style.setProperty('--light-accent2-op', accent2Val);
    root.style.setProperty('--light-window-op', windowVal);
    root.style.setProperty('--light-blinds-op', blindsVal);
    root.style.setProperty('--room-person-opacity', personVal);

    // Interpolate color temperature and calculate dynamic surface shading
    const fromCCT = STATES[fromId].cct;
    const toCCT = STATES[toId].cct;
    const currentCCT = lerp(fromCCT, toCCT, t);
    this.updateRoomColors(currentCCT, ambientVal, taskVal, accent1Val, accent2Val, facialVal);

    // Toggle fixture classes based on interpolated values
    const cove = document.getElementById('svg-light-ambient');
    if (cove) cove.classList.toggle('on', ambientVal > 0.05);

    const pendant = document.getElementById('svg-pendant-head');
    if (pendant) pendant.classList.toggle('on', taskVal > 0.05);

    const desk = document.getElementById('svg-desk-surface');
    if (desk) desk.classList.toggle('lit', taskVal > 0.05 || ambientVal > 0.1);

    const desklamp = document.getElementById('svg-desklamp-head');
    if (desklamp) desklamp.classList.toggle('on', accent1Val > 0.05 || accent2Val > 0.05);

    const monitor = document.getElementById('svg-monitor-screen');
    if (monitor) {
      monitor.classList.toggle('glow-video', this.engine.sensors.videoApp);
      monitor.classList.toggle('glow-facial', facialVal > 0.1 && !this.engine.sensors.videoApp);
    }
  }

  // Calculate and apply dynamic color changes of walls, floor, walnut desk, and person silhouette
  updateRoomColors(cct, ambient, task, accent1, accent2, facial) {
    const root = document.documentElement;
    const ambientColor = cctToColor(cct);
    
    // Parse color strings into RGB components
    const rgbAmbient = this.parseRgb(ambientColor) || { r: 255, g: 255, b: 255 };
    const rgbAccent1 = this.parseRgb('#3cdcb2'); // teal
    const rgbAccent2 = this.parseRgb('#e6a03c'); // warm gold
    const rgbTask = this.parseRgb(cctToColor(cct)) || { r: 255, g: 255, b: 255 };
    
    // 1. Back Wall Color (Base slate: #08080f / rgb(8, 8, 15))
    let wr = 8, wg = 8, wb = 15;
    
    // Add ambient cove wash contribution (up to +35 brightness, CCT-tinted)
    wr += rgbAmbient.r * 0.15 * ambient;
    wg += rgbAmbient.g * 0.13 * ambient;
    wb += rgbAmbient.b * 0.11 * ambient;
    
    // Add accent lights wash contribution (up to +30 brightness, teal & gold)
    wr += rgbAccent1.r * 0.08 * accent1 + rgbAccent2.r * 0.08 * accent2;
    wg += rgbAccent1.g * 0.08 * accent1 + rgbAccent2.g * 0.08 * accent2;
    wb += rgbAccent1.b * 0.08 * accent1 + rgbAccent2.b * 0.08 * accent2;
    
    wr = Math.min(Math.round(wr), 75);
    wg = Math.min(Math.round(wg), 75);
    wb = Math.min(Math.round(wb), 85);
    root.style.setProperty('--room-wall-bg', `rgb(${wr},${wg},${wb})`);
    
    // 2. Floor Color (Base水磨石: #0c0c12 / rgb(12, 12, 18))
    let fr = 12, fg = 12, fb = 18;
    
    // Ambient cove wash (up to +20 brightness)
    fr += rgbAmbient.r * 0.08 * ambient;
    fg += rgbAmbient.g * 0.08 * ambient;
    fb += rgbAmbient.b * 0.08 * ambient;
    
    // Task spotlight bounce on floor (up to +15 brightness)
    fr += rgbTask.r * 0.06 * task;
    fg += rgbTask.g * 0.05 * task;
    fb += rgbTask.b * 0.04 * task;
    
    fr = Math.min(Math.round(fr), 80);
    fg = Math.min(Math.round(fg), 80);
    fb = Math.min(Math.round(fb), 90);
    root.style.setProperty('--room-floor-bg', `rgb(${fr},${fg},${fb})`);
    
    // 3. Walnut Desk Surface Color (Base: #2d2015 / rgb(45, 32, 21))
    let dr = 45, dg = 32, db = 21;
    
    // Task spotlight shines directly on desk (up to +80 brightness, matching CCT!)
    dr += rgbTask.r * 0.35 * task;
    dg += rgbTask.g * 0.28 * task;
    db += rgbTask.b * 0.20 * task;
    
    // Ambient light wash (up to +15 brightness)
    dr += rgbAmbient.r * 0.06 * ambient;
    dg += rgbAmbient.g * 0.06 * ambient;
    db += rgbAmbient.b * 0.06 * ambient;
    
    dr = Math.min(Math.round(dr), 150);
    dg = Math.min(Math.round(dg), 115);
    db = Math.min(Math.round(db), 85);
    root.style.setProperty('--room-desk-bg', `rgb(${dr},${dg},${db})`);
    root.style.setProperty('--room-desk-stroke', `rgb(${Math.round(dr*1.15)},${Math.round(dg*1.15)},${Math.round(db*1.15)})`);
    
    // 4. Person Silhouette Rim Highlight (Base: #181c2b / rgb(24, 28, 43))
    let pr = 24, pg = 28, pb = 43;
    
    // Screen facial fill light illuminates person's torso and head (up to +35 brightness, cool white tint)
    const rgbFacial = { r: 215, g: 230, b: 255 };
    pr += rgbFacial.r * 0.15 * facial;
    pg += rgbFacial.g * 0.15 * facial;
    pb += rgbFacial.b * 0.15 * facial;
    
    pr = Math.min(Math.round(pr), 95);
    pg = Math.min(Math.round(pg), 95);
    pb = Math.min(Math.round(pb), 115);
    root.style.setProperty('--room-person-color', `rgb(${pr},${pg},${pb})`);
  }

  // Parse color string (hex or rgb) into components
  parseRgb(colorStr) {
    if (!colorStr) return null;
    if (colorStr.startsWith('rgb')) {
      const match = colorStr.match(/\d+/g);
      if (match) {
        return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
      }
    }
    if (colorStr.startsWith('#')) {
      const hex = colorStr.substring(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return { r, g, b };
    }
    return null;
  }

  // ----- Dashboard -----
  updateDashboard(cct, lux, transitionProgress) {
    // CCT gauge
    const cctRange = 6500 - 2700;
    const cctNorm = (cct - 2700) / cctRange; // 0 to 1
    const arcLen = 157; // approximate half-circle path length
    const dashOffset = arcLen * (1 - cctNorm);
    document.getElementById('cct-arc').setAttribute('stroke-dashoffset', dashOffset);

    // CCT needle position on arc
    const angle = Math.PI * (1 - cctNorm); // π to 0
    const nx = 65 + 50 * Math.cos(angle);
    const ny = 68 - 50 * Math.sin(angle);
    const needle = document.getElementById('cct-needle');
    needle.setAttribute('cx', nx);
    needle.setAttribute('cy', ny);
    const cctColor = cctToColor(cct);
    needle.setAttribute('fill', cctColor);

    // CCT value text
    document.getElementById('cct-value-text').textContent = cct;
    document.getElementById('cct-value-text').setAttribute('fill', cctColor);

    // Sync room CCT badge
    const roomCctBadge = document.getElementById('room-cct-badge');
    if (roomCctBadge) {
      roomCctBadge.textContent = `${cct}K`;
      roomCctBadge.style.color = cctColor;
    }

    // Lux
    document.getElementById('lux-value-text').textContent = lux;
    const luxPercent = Math.min(lux / 1500 * 100, 100);
    document.getElementById('lux-bar').style.width = luxPercent + '%';
    document.getElementById('lux-bar').style.background = cctColor;

    // Transition bar
    document.getElementById('transition-bar-fill').style.width = (transitionProgress * 100) + '%';
  }

  // ----- Available Transitions -----
  updateAvailableTransitions(currentState) {
    const container = document.getElementById('available-transitions');
    const available = TRANSITIONS.filter(t => t.from === currentState);
    let html = '';
    for (const t of available) {
      html += `<div style="margin-bottom:6px;">
        <span style="color:${STATES[t.to].color};font-weight:600;">→ ${STATES[t.to].symbol} ${STATES[t.to].nameCn}</span><br>
        <span style="font-size:0.7rem;color:var(--text-muted);">${t.descCn}</span>
      </div>`;
    }
    // Global reset
    if (currentState !== 'S0') {
      html += `<div style="margin-bottom:6px;opacity:0.6;">
        <span style="color:${STATES.S0.color};font-weight:600;">→ ${STATES.S0.symbol} 全局复位</span><br>
        <span style="font-size:0.7rem;color:var(--text-muted);">${GLOBAL_RESET.descCn}</span>
      </div>`;
    }
    if (!html) {
      html = '<span style="color:var(--text-muted);">当前为初始状态，等待传感器输入…</span>';
    }
    container.innerHTML = html;
  }

  // ----- Timeline -----
  addTimelineEvent(from, to, desc) {
    const container = document.getElementById('timeline-scroll');
    const event = document.createElement('div');
    event.classList.add('timeline-event');
    event.innerHTML = `
      <span class="timeline-time">${formatTime()}</span>
      <span class="timeline-dot" style="background:${STATES[from].color}"></span>
      <span class="timeline-arrow">→</span>
      <span class="timeline-dot" style="background:${STATES[to].color}"></span>
      <span class="timeline-text">${STATES[from].symbol}→${STATES[to].symbol} ${desc}</span>
    `;
    container.appendChild(event);
    container.scrollTop = container.scrollHeight;
  }
}

// =====================================================================
// 5. AUTO DEMO CONTROLLER
// =====================================================================

class AutoDemo {
  constructor(engine, renderer) {
    this.engine = engine;
    this.renderer = renderer;
    this.running = false;
    this.stepIndex = 0;
    this.timer = null;
    this.narrationEl = document.getElementById('narration-bar');

    this.steps = [
      { delay: 2500, narration: '🏠 空间空闲 — 系统待机，仅踢脚线微光', action: () => {} },
      { delay: 2000, narration: '🚶 有人进入空间 — PIR + 门窗传感器触发',
        action: () => { this.setSensors({ pir: true, door: true, radar: true }); }
      },
      { delay: 4000, narration: '💡 环境引入 — 洗墙灯柔和亮起', action: () => {} },
      { delay: 2000, narration: '🧘 使用者在办公桌前就坐 — ToF 识别姿态变化',
        action: () => { this.setSensors({ posture: 'seated' }); }
      },
      { delay: 5000, narration: '🔬 深度专注 — 6500K 冷白光聚焦桌面', action: () => {} },
      { delay: 2000, narration: '📹 视频会议应用启动 — 系统检测到前台应用',
        action: () => { this.setSensors({ videoApp: true }); this.engine.setSensor('voiceCmd', 'video'); }
      },
      { delay: 5000, narration: '🎥 数字展示 — 面部补光+情境渲染光开启', action: () => {} },
      { delay: 2000, narration: '❌ 会议结束 — 视频应用关闭',
        action: () => { this.setSensors({ videoApp: false }); this.engine.setSensor('voiceCmd', 'endvideo'); }
      },
      { delay: 4000, narration: '💡 回到环境引入状态', action: () => {} },
      { delay: 2000, narration: '🧘 重新就坐工作',
        action: () => { this.setSensors({ posture: 'seated' }); this.engine.setSensor('voiceCmd', 'focus'); }
      },
      { delay: 4000, narration: '🔬 再次进入深度专注', action: () => {} },
      { delay: 2000, narration: '🧠 EEG 检测到疲劳 — 脑波疲劳指数上升至 80%',
        action: () => { this.setSensors({ eeg: 80, posture: 'reclined' }); }
      },
      { delay: 6000, narration: '🌅 节律恢复 — 模拟黄昏光谱，健康干预启动', action: () => {} },
      { delay: 3000, narration: '🚪 使用者离开 — 所有传感器归零，进入复位延时',
        action: () => { this.setSensors({ pir: false, door: false, radar: false, posture: 'none', eeg: 0, videoApp: false }); }
      },
      { delay: 7000, narration: '🏠 全局复位完成 — 系统回到空闲状态', action: () => {} },
      { delay: 3000, narration: '🔄 演示循环即将重新开始…', action: () => {} },
    ];
  }

  setSensors(updates) {
    for (const [key, val] of Object.entries(updates)) {
      this.engine.sensors[key] = val;
      // Update UI controls
      switch (key) {
        case 'pir': document.getElementById('input-pir').checked = val; break;
        case 'door': document.getElementById('input-door').checked = val; break;
        case 'radar': document.getElementById('input-radar').checked = val; break;
        case 'posture': document.getElementById('input-posture').value = val; break;
        case 'eeg':
          document.getElementById('input-eeg').value = val;
          document.getElementById('eeg-value').textContent = val + '%';
          break;
        case 'videoApp': document.getElementById('input-videoapp').checked = val; break;
      }
      // Highlight triggered sensors
      this.updateSensorHighlight(key, val);
    }
    this.engine.emit('sensor-change', { sensors: { ...this.engine.sensors } });
    this.engine.evaluate();
  }

  updateSensorHighlight(key, val) {
    const map = {
      pir: 'sensor-pir', door: 'sensor-door', radar: 'sensor-radar',
      posture: 'sensor-posture', eeg: 'sensor-eeg', videoApp: 'sensor-videoapp',
    };
    const el = document.getElementById(map[key]);
    if (!el) return;
    if (key === 'posture') {
      el.classList.toggle('triggered', val !== 'none');
    } else if (key === 'eeg') {
      el.classList.toggle('triggered', val >= 50);
    } else {
      el.classList.toggle('triggered', !!val);
    }
  }

  start(resume = false) {
    if (this.running) return;
    this.running = true;
    if (!resume) {
      this.stepIndex = 0;
      this.engine.reset();
    }
    this.runStep();
  }

  stop() {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.narrationEl.classList.remove('visible');
  }

  runStep() {
    if (!this.running) return;
    if (this.engine.paused) {
      this.timer = setTimeout(() => this.runStep(), 500);
      return;
    }
    if (this.stepIndex >= this.steps.length) {
      // Loop
      this.stepIndex = 0;
      this.engine.reset();
      setTimeout(() => this.runStep(), 1000);
      return;
    }

    const step = this.steps[this.stepIndex];

    // Show narration
    this.narrationEl.textContent = step.narration;
    this.narrationEl.classList.add('visible');

    // Execute action
    step.action();

    this.stepIndex++;
    this.timer = setTimeout(() => this.runStep(), step.delay);
  }
}

// =====================================================================
// 6. INITIALIZATION
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
  const engine = new FSMEngine();
  const renderer = new UIRenderer(engine);
  const demo = new AutoDemo(engine, renderer);

  renderer.init();

  // ----- Sensor Control Bindings -----
  const sensorBindings = [
    { inputId: 'input-pir', key: 'pir', type: 'checkbox', sensorItem: 'sensor-pir' },
    { inputId: 'input-door', key: 'door', type: 'checkbox', sensorItem: 'sensor-door' },
    { inputId: 'input-radar', key: 'radar', type: 'checkbox', sensorItem: 'sensor-radar' },
    { inputId: 'input-videoapp', key: 'videoApp', type: 'checkbox', sensorItem: 'sensor-videoapp' },
  ];

  for (const b of sensorBindings) {
    const input = document.getElementById(b.inputId);
    input.addEventListener('change', () => {
      engine.setSensor(b.key, input.checked);
      document.getElementById(b.sensorItem).classList.toggle('triggered', input.checked);
    });
  }

  // Posture select
  document.getElementById('input-posture').addEventListener('change', (e) => {
    engine.setSensor('posture', e.target.value);
    document.getElementById('sensor-posture').classList.toggle('triggered', e.target.value !== 'none');
  });

  // EEG slider
  document.getElementById('input-eeg').addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    document.getElementById('eeg-value').textContent = val + '%';
    engine.setSensor('eeg', val);
    document.getElementById('sensor-eeg').classList.toggle('triggered', val >= 50);
  });

  // Voice buttons
  document.querySelectorAll('.voice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      // Toggle active class
      document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      engine.setSensor('voiceCmd', cmd);
      // Reset visual after a moment
      setTimeout(() => btn.classList.remove('active'), 1500);
    });
  });

  // ----- Header Buttons -----
  const btnAutoDemo = document.getElementById('btn-auto-demo');
  const btnAutoResume = document.getElementById('btn-auto-resume');
  const btnReset = document.getElementById('btn-reset');

  function updateDemoButtons() {
    if (demo.running) {
      btnAutoDemo.innerHTML = '<span class="btn-icon">⏸</span> 暂停演示';
      btnAutoDemo.classList.add('active');
      if (btnAutoResume) btnAutoResume.style.display = 'none';
    } else {
      btnAutoDemo.classList.remove('active');
      if (demo.stepIndex > 0 && demo.stepIndex < demo.steps.length) {
        btnAutoDemo.innerHTML = '<span class="btn-icon">▶</span> 重新演示';
        if (btnAutoResume) btnAutoResume.style.display = 'inline-flex';
      } else {
        btnAutoDemo.innerHTML = '<span class="btn-icon">▶</span> 自动演示';
        if (btnAutoResume) btnAutoResume.style.display = 'none';
      }
    }
  }

  btnAutoDemo.addEventListener('click', () => {
    if (demo.running) {
      demo.stop();
    } else {
      demo.start(false); // Restart from 0
    }
    updateDemoButtons();
  });

  if (btnAutoResume) {
    btnAutoResume.addEventListener('click', () => {
      if (!demo.running) {
        demo.start(true); // Resume from stepIndex
        updateDemoButtons();
      }
    });
  }

  btnReset.addEventListener('click', () => {
    demo.stop();
    demo.stepIndex = 0;
    updateDemoButtons();
    engine.reset();
  });

  // ----- Keyboard Shortcuts -----
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      btnAutoDemo.click();
    }
    if (e.key === 'r' || e.key === 'R') {
      document.getElementById('btn-reset').click();
    }
    // Number keys for direct state switch
    if (e.key >= '0' && e.key <= '4') {
      engine.forceTransition('S' + e.key);
    }
  });

  // ----- Tab Switching -----
  const tabBtnSim = document.getElementById('tab-btn-sim');
  const tabBtnFix = document.getElementById('tab-btn-fix');
  const tabContentSim = document.getElementById('tab-content-sim');
  const tabContentFix = document.getElementById('tab-content-fix');

  function clearFixtureHighlights() {
    document.querySelectorAll('.lamp-highlight-pulse').forEach(el => {
      el.classList.remove('lamp-highlight-pulse');
    });
    document.querySelectorAll('.fixture-item-card').forEach(el => {
      el.classList.remove('active');
    });
  }

  function highlightChannelLamps(channel, highlight) {
    let selectors = [];
    if (channel === 'ambient') {
      selectors = ['#svg-light-ambient', '#svg-window-glass'];
    } else if (channel === 'task') {
      selectors = [
        '#svg-pendant-head', '#svg-pendant-bulb', '#svg-light-task',
        '#svg-desklamp-head', '#svg-light-desklamp', '#svg-desk-surface'
      ];
    } else if (channel === 'facial') {
      selectors = ['#svg-monitor-screen', '#svg-light-facial'];
    } else if (channel === 'accent') {
      selectors = [
        '#svg-light-baseboard', '#svg-light-accent1', '#svg-light-accent2'
      ];
    }

    selectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) {
        if (highlight) {
          el.classList.add('lamp-highlight-pulse');
        } else {
          el.classList.remove('lamp-highlight-pulse');
        }
      }
    });
  }

  if (tabBtnSim && tabBtnFix && tabContentSim && tabContentFix) {
    tabBtnSim.addEventListener('click', () => {
      tabBtnSim.classList.add('active');
      tabBtnFix.classList.remove('active');
      tabContentSim.style.display = 'block';
      tabContentFix.style.display = 'none';
      clearFixtureHighlights();
    });

    tabBtnFix.addEventListener('click', () => {
      tabBtnFix.classList.add('active');
      tabBtnSim.classList.remove('active');
      tabContentFix.style.display = 'block';
      tabContentSim.style.display = 'none';
    });
  }

  // ----- Fixture Cards Highlighting Events -----
  document.querySelectorAll('.fixture-item-card').forEach(card => {
    const channel = card.dataset.channel;

    card.addEventListener('mouseenter', () => {
      clearFixtureHighlights();
      card.classList.add('active');
      highlightChannelLamps(channel, true);
    });

    card.addEventListener('mouseleave', () => {
      clearFixtureHighlights();
      highlightChannelLamps(channel, false);
    });

    card.addEventListener('click', () => {
      clearFixtureHighlights();
      card.classList.add('active');
      highlightChannelLamps(channel, true);
    });
  });

  // ----- Interactive Channel Details Click -----
  const channelsTexts = {
    ambient: {
      title: '💡 环境光通道设计与人因工程学意义',
      text: '<b>对应灯具：</b>吊顶回型反光暗槽双色温LED灯带、背景墙洗墙射灯。<br><b>人因意义：</b>负责空间的基础亮度与漫反射洗墙，提供开阔、柔和的视觉背景。在人员进出或状态过渡时，其亮度柔性缓变（3500K-4000K），避免眼部瞳孔急剧收缩，起到关键的视觉缓冲与防疲劳保护作用。'
    },
    task: {
      title: '💡 任务光通道设计与人因工程学意义',
      text: '<b>对应灯具：</b>桌面正上方悬挂式线性办公吊灯、工作区双臂防眩台灯。<br><b>人因意义：</b>聚焦纸张与屏幕键盘等任务核心区域。利用 6500K 强冷白光和高达 1000 Lux 的照度，快速抑制松果体分泌褪黑素并激发皮质醇，提神醒脑。同时将背景环境光压低至15%，通过显著明暗对比营造“隧道专注视野”以提高效率。'
    },
    facial: {
      title: '💡 面部补光通道设计与人因工程学意义',
      text: '<b>对应灯具：</b>显示器非对称重力挂灯、屏幕隐藏式两侧水平柔光板。<br><b>人因意义：</b>专为高频音视频会议与数字人交互而设计。采用 4000K 中性温和色温与高达 Ra>95 的高显色指数，通过水平正面补光，完美消除由吊顶顶光带来的眼袋、鼻影等人脸垂直阴影，在视频画面中塑造饱满、气色健康的真实面部细节。'
    },
    accent: {
      title: '💡 情境光通道设计与人因工程学意义',
      text: '<b>对应灯具：</b>低位踢脚线微光灯带、墙角立式 RGB-CW 动态氛围地灯、装饰柜内嵌层板灯。<br><b>人因意义：</b>提供低流明高动态范围的空间轮廓修饰。空闲状态下提供极低亮度暖光指引；视频状态下输出低饱和度冷青/暖金背景色，丰富画面层次；生理疲劳时转为唯一的 3000K 暖黄黄昏光源，诱导副交感神经活跃，平抚情绪、助眠干预。'
    }
  };

  document.querySelectorAll('.channel-item').forEach(item => {
    const id = item.id;
    const channelKey = id.replace('ch-', '');

    item.addEventListener('click', () => {
      // Mark selected
      document.querySelectorAll('.channel-item').forEach(c => c.classList.remove('selected'));
      item.classList.add('selected');

      // Update desc box
      const descBoxTitle = document.getElementById('channel-desc-title');
      const descBoxText = document.getElementById('channel-desc-text');
      if (descBoxTitle && descBoxText && channelsTexts[channelKey]) {
        descBoxTitle.innerHTML = channelsTexts[channelKey].title;
        descBoxText.innerHTML = channelsTexts[channelKey].text;
      }
    });
  });

  // ----- Copy Prompt -----
  const btnCopyPrompt = document.getElementById('btn-copy-prompt');
  if (btnCopyPrompt) {
    btnCopyPrompt.addEventListener('click', () => {
      const promptText = document.getElementById('ai-prompt-text').textContent;
      navigator.clipboard.writeText(promptText).then(() => {
        const originalHtml = btnCopyPrompt.innerHTML;
        btnCopyPrompt.innerHTML = '✅ 已复制!';
        setTimeout(() => {
          btnCopyPrompt.innerHTML = originalHtml;
        }, 1500);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  }

  // ----- Pause Transition Button -----
  const btnPauseTrans = document.getElementById('btn-pause-transition');
  if (btnPauseTrans) {
    btnPauseTrans.addEventListener('click', () => {
      engine.paused = !engine.paused;
      if (engine.paused) {
        btnPauseTrans.textContent = '▶';
        btnPauseTrans.classList.add('active');
        btnPauseTrans.title = '继续当前转换';
      } else {
        btnPauseTrans.textContent = '⏸';
        btnPauseTrans.classList.remove('active');
        btnPauseTrans.title = '暂停当前转换';
      }
    });
  }

  // Set initial status
  document.getElementById('status-text').textContent = 'S₀ 空间空闲';
});
