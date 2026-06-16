/* ===== 梦幻换装屋 ===== */
/* 所有服装/发型/配饰都是内联 SVG 片段，按图层叠加渲染。 */

// 当前造型状态
const DEFAULT_OUTFIT = {
  skin: '#f8ddcb',
  expression: 'smile',
  hair: 'longcenter',
  hairColor: '#2B211D',
  top: 'chiffon',
  topColor: '#F2C9CC',
  bottom: 'none',
  bottomColor: '#E49BA2',
  shoes: 'none',
  shoesColor: '#f0d9c8',
  acc: 'none',
  acc2: 'none',
  bg: 'cream',
};
const outfit = JSON.parse(JSON.stringify(DEFAULT_OUTFIT));

/* ---------- 各类素材定义 ----------
   每个素材含: name 与 draw(color) 返回 SVG 字符串。 */

const SKIN = {
  porcelain: { name: '瓷白', color: '#f8ddcb' },
  light: { name: '白皙', color: '#ffe0c2' },
  fair: { name: '自然', color: '#f6c9a0' },
  tan: { name: '小麦', color: '#d8a373' },
  deep: { name: '深棕', color: '#a06b45' },
  rosy: { name: '红润', color: '#f7c4b0' },
  fantasy: { name: '梦幻紫', color: '#d9c0ff' },
};

/* ---- 表情系统(眉/眼/嘴/腮红),配色取自设定稿 ---- */
const EYE_IRIS = '#5A4338';
const EYE_PUPIL = '#2B211D';
const BLUSH_C = '#E49BA2';
const LIP_C = '#d97a8a';

function brows(dy = 0) {
  return `<path d="M123 ${133 + dy} Q133 ${128 + dy} 144 ${132 + dy}" stroke="#6b4a3a" stroke-width="1.7" fill="none" stroke-linecap="round"/>
          <path d="M156 ${132 + dy} Q167 ${128 + dy} 177 ${133 + dy}" stroke="#6b4a3a" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
}
function blush(op = 0.5) {
  return `<ellipse cx="125" cy="167" rx="9" ry="6" fill="${BLUSH_C}" opacity="${op}"/>
          <ellipse cx="175" cy="167" rx="9" ry="6" fill="${BLUSH_C}" opacity="${op}"/>`;
}
function blushStrong() {
  return `<ellipse cx="123" cy="168" rx="12" ry="7.5" fill="${BLUSH_C}" opacity="0.7"/>
          <ellipse cx="177" cy="168" rx="12" ry="7.5" fill="${BLUSH_C}" opacity="0.7"/>
          <g stroke="#cf6f7e" stroke-width="1.1" opacity="0.75" stroke-linecap="round">
            <line x1="118" y1="165" x2="118" y2="172"/><line x1="124" y1="164" x2="124" y2="173"/><line x1="130" y1="165" x2="130" y2="172"/>
            <line x1="170" y1="165" x2="170" y2="172"/><line x1="176" y1="164" x2="176" y2="173"/><line x1="182" y1="165" x2="182" y2="172"/>
          </g>`;
}
// 睁眼(大眼,带高光)
function eyeOpen(cx) {
  return `<ellipse cx="${cx}" cy="151" rx="9.5" ry="11.5" fill="#fff"/>
          <ellipse cx="${cx}" cy="152" rx="7.5" ry="9.5" fill="${EYE_IRIS}"/>
          <circle cx="${cx}" cy="153" r="4" fill="${EYE_PUPIL}"/>
          <circle cx="${cx + 2.5}" cy="148" r="2.6" fill="#fff"/>
          <circle cx="${cx - 2}" cy="156" r="1.3" fill="#fff" opacity="0.7"/>
          <path d="M${cx - 10} 143 Q${cx} 137 ${cx + 10} 143" stroke="${EYE_PUPIL}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <path d="M${cx + 10} 143 L${cx + 13} 141" stroke="${EYE_PUPIL}" stroke-width="1.6" stroke-linecap="round"/>`;
}
// 惊讶大圆眼
function eyeWide(cx) {
  return `<ellipse cx="${cx}" cy="151" rx="9" ry="12.5" fill="#fff"/>
          <circle cx="${cx}" cy="151" r="7" fill="${EYE_IRIS}"/>
          <circle cx="${cx}" cy="151" r="3.6" fill="${EYE_PUPIL}"/>
          <circle cx="${cx + 2.5}" cy="147" r="2.6" fill="#fff"/>
          <path d="M${cx - 10} 141 Q${cx} 135 ${cx + 10} 141" stroke="${EYE_PUPIL}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
}
// 弯弯笑眼(闭)
function eyeArc(cx) {
  return `<path d="M${cx - 9} 152 Q${cx} 143 ${cx + 9} 152" stroke="${EYE_PUPIL}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
          <path d="M${cx - 9} 152 L${cx - 12} 150 M${cx + 9} 152 L${cx + 12} 150" stroke="${EYE_PUPIL}" stroke-width="1.5" stroke-linecap="round"/>`;
}
const mouthSmile = `<path d="M142 176 Q150 183 158 176 Q150 180 142 176 Z" fill="${LIP_C}"/>
                    <path d="M142 176 Q150 181 158 176" stroke="#c44d68" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
const mouthOpen = `<path d="M140 175 Q150 189 160 175 Q150 181 140 175 Z" fill="#c84d63"/>
                   <path d="M145 178 Q150 182 155 178" stroke="#fff" stroke-width="2" fill="none"/>`;
const mouthO = `<ellipse cx="150" cy="180" rx="4.5" ry="6" fill="#c84d63"/>
                <ellipse cx="150" cy="179" rx="2.4" ry="3" fill="#8a2f3f"/>`;
const mouthShy = `<path d="M144 178 Q150 182 156 178" stroke="#c44d68" stroke-width="2" fill="none" stroke-linecap="round"/>`;

const EXPRESSIONS = {
  smile: { name: '微笑', draw: () => brows() + eyeOpen(133) + eyeOpen(167) + blush(0.5) + mouthSmile },
  happy: { name: '开心', draw: () => brows(-2) + eyeArc(133) + eyeArc(167) + blush(0.6) + mouthOpen },
  surprised: { name: '惊讶', draw: () => brows(-4) + eyeWide(133) + eyeWide(167) + blush(0.45) + mouthO },
  shy: { name: '害羞', draw: () => brows(2) + eyeOpen(133) + eyeOpen(167) + blushStrong() + mouthShy },
  wink: { name: '眨眼', draw: () => brows() + eyeArc(133) + eyeOpen(167) + blush(0.55) + mouthSmile },
};

/* ---- 内搭基础层(粉色吊带背心 + 短裤,始终穿着,贴合底图) ---- */
const INNER_TOP = `
  <path d="M132 213 L131 200" stroke="#F2C9CC" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M168 213 L169 200" stroke="#F2C9CC" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M123 214 Q150 226 177 214 L178 304 Q150 312 122 304 Z" fill="#F2C9CC"/>
  <path d="M132 215 Q150 223 168 215" stroke="#E49BA2" stroke-width="1.4" fill="none" opacity="0.5"/>
  <path d="M150 226 L150 304" stroke="#E49BA2" stroke-width="1" fill="none" opacity="0.22"/>`;
const INNER_BOTTOM = `
  <path d="M122 300 Q150 309 178 300 L176 340 L158 340 L150 324 L142 340 L124 340 Z" fill="#F2C9CC"/>
  <path d="M124 304 Q150 312 176 304" stroke="#E49BA2" stroke-width="1.4" fill="none" opacity="0.5"/>`;

const HAIR = {
  short: {
    name: '短发',
    draw: (c) => `
      <path d="M104 150 Q100 90 150 88 Q200 90 196 150 Q188 120 150 118 Q112 120 104 150 Z" fill="${c}"/>
      <path d="M104 150 Q104 175 112 188 L120 150 Z" fill="${c}"/>
      <path d="M196 150 Q196 175 188 188 L180 150 Z" fill="${c}"/>`,
  },
  long: {
    name: '长发',
    draw: (c) => `
      <path d="M100 150 Q96 92 150 86 Q204 92 200 150 Q210 260 184 280 Q196 200 182 150 Q150 122 118 150 Q104 200 116 280 Q90 260 100 150 Z" fill="${c}"/>
      <path d="M108 100 Q150 78 192 100 Q150 110 108 100 Z" fill="${c}" opacity="0.85"/>`,
  },
  longcenter: {
    name: '中分黑长直',
    draw: (c) => `
      <path d="M99 152 Q95 96 120 82 Q150 70 180 82 Q205 96 201 152 Q214 300 188 330 Q200 230 184 156 Q150 132 148 96 Q146 132 116 156 Q100 230 112 330 Q86 300 99 152 Z" fill="${c}"/>
      <path d="M148 96 Q150 90 152 96 L150 150 Z" fill="#000" opacity="0.18"/>
      <path d="M118 110 Q150 88 182 110" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.18"/>
      <path d="M104 200 Q108 260 116 320" stroke="#fff" stroke-width="3" fill="none" opacity="0.14"/>
      <path d="M196 200 Q192 260 184 320" stroke="#fff" stroke-width="3" fill="none" opacity="0.14"/>`,
  },
  twin: {
    name: '双马尾',
    draw: (c) => `
      <path d="M104 150 Q100 90 150 88 Q200 90 196 150 Q188 120 150 118 Q112 120 104 150 Z" fill="${c}"/>
      <ellipse cx="96" cy="200" rx="20" ry="46" fill="${c}"/>
      <ellipse cx="204" cy="200" rx="20" ry="46" fill="${c}"/>
      <circle cx="104" cy="150" r="9" fill="#ff7eb3"/>
      <circle cx="196" cy="150" r="9" fill="#ff7eb3"/>`,
  },
  bun: {
    name: '丸子头',
    draw: (c) => `
      <circle cx="150" cy="86" r="22" fill="${c}"/>
      <path d="M106 148 Q102 96 150 96 Q198 96 194 148 Q186 120 150 118 Q114 120 106 148 Z" fill="${c}"/>`,
  },
  wavy: {
    name: '波浪卷',
    draw: (c) => `
      <path d="M100 150 Q96 90 150 86 Q204 90 200 150 Q214 200 196 230 Q200 250 184 270 Q196 210 180 160 Q150 124 120 160 Q104 210 116 270 Q100 250 104 230 Q86 200 100 150 Z" fill="${c}"/>`,
  },
  ponytail: {
    name: '高马尾',
    draw: (c) => `
      <path d="M104 150 Q100 88 150 86 Q200 88 196 150 Q188 118 150 116 Q112 118 104 150 Z" fill="${c}"/>
      <path d="M186 100 Q230 110 222 180 Q214 220 196 240 Q214 180 200 140 Q194 116 186 100 Z" fill="${c}"/>
      <circle cx="186" cy="100" r="8" fill="#ff7eb3"/>`,
  },
  pixie: {
    name: '俏皮短',
    draw: (c) => `
      <path d="M106 148 Q100 92 150 90 Q200 92 194 148 Q200 120 168 110 Q150 130 132 110 Q104 120 106 148 Z" fill="${c}"/>
      <path d="M150 92 Q170 96 176 84 Q160 86 150 92 Z" fill="${c}"/>`,
  },
  braids: {
    name: '麻花辫',
    draw: (c) => `
      <path d="M104 150 Q100 90 150 88 Q200 90 196 150 Q188 120 150 118 Q112 120 104 150 Z" fill="${c}"/>
      <path d="M100 156 Q88 210 96 270 Q104 220 110 170 Z" fill="${c}"/>
      <path d="M200 156 Q212 210 204 270 Q196 220 190 170 Z" fill="${c}"/>
      <circle cx="95" cy="270" r="6" fill="#ff7eb3"/>
      <circle cx="205" cy="270" r="6" fill="#ff7eb3"/>`,
  },
};

const TOP = {
  none: { name: '不穿', draw: () => '' },
  tee: {
    name: 'T恤',
    draw: (c) => `
      <path d="M116 206 Q150 196 184 206 L196 240 L180 248 L180 312 L120 312 L120 248 L104 240 Z" fill="${c}"/>`,
  },
  hoodie: {
    name: '卫衣',
    draw: (c) => `
      <path d="M112 206 Q150 194 188 206 L200 246 L182 252 L182 316 L118 316 L118 252 L100 246 Z" fill="${c}"/>
      <path d="M132 200 Q150 218 168 200 L162 196 Q150 206 138 196 Z" fill="${c}" opacity="0.7"/>
      <line x1="144" y1="214" x2="144" y2="236" stroke="#fff" stroke-width="2"/>
      <line x1="156" y1="214" x2="156" y2="236" stroke="#fff" stroke-width="2"/>`,
  },
  dress: {
    name: '连衣裙',
    draw: (c) => `
      <path d="M116 206 Q150 196 184 206 L194 240 L178 246 Q186 300 200 360 L100 360 Q114 300 122 246 L106 240 Z" fill="${c}"/>
      <path d="M122 246 L178 246 L176 262 L124 262 Z" fill="#fff" opacity="0.3"/>`,
  },
  tank: {
    name: '吊带',
    draw: (c) => `
      <path d="M128 204 L138 230 L138 312 L162 312 L162 230 L172 204 Q150 214 128 204 Z" fill="${c}"/>
      <path d="M138 230 Q150 222 162 230 L162 240 Q150 232 138 240 Z" fill="#fff" opacity="0.25"/>`,
  },
  jacket: {
    name: '外套',
    draw: (c) => `
      <path d="M110 206 Q150 196 190 206 L202 248 L184 254 L184 318 L116 318 L116 254 L98 248 Z" fill="${c}"/>
      <path d="M150 202 L150 318" stroke="#fff" stroke-width="2" opacity="0.6"/>
      <path d="M150 206 L130 248 L150 250 Z" fill="#000" opacity="0.08"/>
      <path d="M150 206 L170 248 L150 250 Z" fill="#fff" opacity="0.12"/>`,
  },
  sweater: {
    name: '毛衣',
    draw: (c) => `
      <path d="M114 206 Q150 196 186 206 L198 244 L182 250 L182 314 L118 314 L118 250 L102 244 Z" fill="${c}"/>
      <line x1="118" y1="260" x2="182" y2="260" stroke="#000" stroke-width="1" opacity="0.12"/>
      <line x1="118" y1="278" x2="182" y2="278" stroke="#000" stroke-width="1" opacity="0.12"/>
      <line x1="118" y1="296" x2="182" y2="296" stroke="#000" stroke-width="1" opacity="0.12"/>`,
  },
  gown: {
    name: '礼服',
    draw: (c) => `
      <path d="M126 204 Q150 214 174 204 L182 246 Q200 320 214 400 L86 400 Q100 320 118 246 Z" fill="${c}"/>
      <path d="M126 204 L150 230 L174 204 Q150 216 126 204 Z" fill="#fff" opacity="0.25"/>
      <path d="M150 250 L150 400" stroke="#fff" stroke-width="1.5" opacity="0.2"/>`,
  },
  sailor: {
    name: '水手服',
    draw: (c) => `
      <path d="M116 206 Q150 196 184 206 L196 240 L180 248 L180 312 L120 312 L120 248 L104 240 Z" fill="${c}"/>
      <path d="M132 202 L150 240 L168 202 Q150 212 132 202 Z" fill="#3a5a9a"/>
      <rect x="142" y="232" width="16" height="14" fill="#ff5d8f"/>`,
  },
  chiffon: {
    name: '雪纺吊带裙',
    draw: (c) => `
      <!-- 细吊带 -->
      <path d="M131 207 L129 186" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M169 207 L171 186" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
      <!-- 侧裙摆(高低裙:两侧及后摆较长) -->
      <path d="M121 240 L101 408 Q116 386 132 352 Z" fill="${c}" opacity="0.95"/>
      <path d="M179 240 L199 408 Q184 386 168 352 Z" fill="${c}" opacity="0.95"/>
      <!-- 抹胸 V 领(收褶) -->
      <path d="M126 205 Q150 217 174 205 L179 241 Q150 253 121 241 Z" fill="${c}"/>
      <!-- 前短裙摆(手帕褶,露出小腿与赤脚) -->
      <path d="M123 240 Q150 253 177 240 L172 350 L160 330 L150 356 L140 330 L128 350 Z" fill="${c}"/>
      <!-- 胸前收褶 + 褶皱高光 -->
      <path d="M140 220 L150 240 L160 220" stroke="#E49BA2" stroke-width="1.5" fill="none" opacity="0.55"/>
      <path d="M150 218 L150 352" stroke="#E49BA2" stroke-width="1.2" fill="none" opacity="0.4"/>
      <path d="M137 246 Q132 320 126 352" stroke="#fff" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M163 246 Q168 320 174 352" stroke="#fff" stroke-width="2" fill="none" opacity="0.3"/>
      <path d="M108 400 Q120 384 130 360" stroke="#fff" stroke-width="2" fill="none" opacity="0.25"/>
      <path d="M192 400 Q180 384 170 360" stroke="#fff" stroke-width="2" fill="none" opacity="0.25"/>`,
  },
};

const BOTTOM = {
  none: { name: '不穿', draw: () => '' },
  skirt: {
    name: '半身裙',
    draw: (c) => `<path d="M122 300 L178 300 Q192 350 198 372 L102 372 Q108 350 122 300 Z" fill="${c}"/>`,
  },
  jeans: {
    name: '牛仔裤',
    draw: (c) => `
      <path d="M122 300 L178 300 L176 410 L156 410 L150 330 L144 410 L124 410 Z" fill="${c}"/>
      <line x1="150" y1="305" x2="150" y2="408" stroke="#000" stroke-width="1.5" opacity="0.2"/>`,
  },
  shorts: {
    name: '短裤',
    draw: (c) => `
      <path d="M122 300 L178 300 L176 348 L156 348 L150 326 L144 348 L124 348 Z" fill="${c}"/>`,
  },
  longskirt: {
    name: '长裙',
    draw: (c) => `<path d="M122 300 L178 300 Q200 380 206 412 L94 412 Q100 380 122 300 Z" fill="${c}"/>`,
  },
  pleated: {
    name: '百褶裙',
    draw: (c) => `
      <path d="M122 300 L178 300 Q190 348 196 372 L104 372 Q110 348 122 300 Z" fill="${c}"/>
      <line x1="134" y1="306" x2="128" y2="370" stroke="#000" stroke-width="1.2" opacity="0.18"/>
      <line x1="150" y1="306" x2="150" y2="372" stroke="#000" stroke-width="1.2" opacity="0.18"/>
      <line x1="166" y1="306" x2="172" y2="370" stroke="#000" stroke-width="1.2" opacity="0.18"/>`,
  },
  overalls: {
    name: '背带裤',
    draw: (c) => `
      <path d="M124 300 L176 300 L174 408 L156 408 L150 332 L144 408 L126 408 Z" fill="${c}"/>
      <rect x="128" y="250" width="8" height="56" fill="${c}"/>
      <rect x="164" y="250" width="8" height="56" fill="${c}"/>
      <rect x="130" y="296" width="40" height="20" rx="3" fill="${c}"/>`,
  },
};

const SHOES = {
  none: { name: '光脚', draw: () => '' },
  sneaker: {
    name: '运动鞋',
    draw: (c) => `
      <path d="M122 406 L150 406 L150 422 L120 422 Q116 414 122 406 Z" fill="${c}"/>
      <path d="M152 406 L180 406 Q186 414 182 422 L152 422 Z" fill="${c}"/>
      <rect x="118" y="420" width="34" height="6" rx="3" fill="#ccc"/>
      <rect x="150" y="420" width="34" height="6" rx="3" fill="#ccc"/>`,
  },
  boots: {
    name: '靴子',
    draw: (c) => `
      <path d="M124 380 L146 380 L146 424 L116 424 L116 410 Q120 392 124 380 Z" fill="${c}"/>
      <path d="M154 380 L176 380 Q180 392 184 410 L184 424 L154 424 Z" fill="${c}"/>`,
  },
  heels: {
    name: '高跟鞋',
    draw: (c) => `
      <path d="M124 406 L150 406 L148 418 L122 426 Q118 416 124 406 Z" fill="${c}"/>
      <path d="M152 418 L150 406 L176 406 Q182 414 178 422 L176 426 Z" fill="${c}"/>
      <rect x="122" y="424" width="5" height="10" fill="${c}"/>
      <rect x="173" y="424" width="5" height="10" fill="${c}"/>`,
  },
  flats: {
    name: '平底鞋',
    draw: (c) => `
      <path d="M120 414 L150 414 Q150 424 138 426 L120 426 Q116 420 120 414 Z" fill="${c}"/>
      <path d="M152 414 L182 414 Q186 420 182 426 L164 426 Q152 424 152 414 Z" fill="${c}"/>`,
  },
  mary: {
    name: '玛丽珍',
    draw: (c) => `
      <path d="M120 412 L150 412 Q150 424 138 426 L120 426 Q116 419 120 412 Z" fill="${c}"/>
      <path d="M152 412 L182 412 Q186 419 182 426 L164 426 Q152 424 152 412 Z" fill="${c}"/>
      <rect x="132" y="416" width="6" height="3" fill="#fff" opacity="0.7"/>
      <rect x="164" y="416" width="6" height="3" fill="#fff" opacity="0.7"/>`,
  },
};

// 头部/脸部配饰
const ACC = {
  none: { name: '无', draw: () => '' },
  bow: {
    name: '蝴蝶结',
    draw: () => `
      <path d="M150 92 L132 82 L132 102 Z" fill="#ff5d8f"/>
      <path d="M150 92 L168 82 L168 102 Z" fill="#ff5d8f"/>
      <circle cx="150" cy="92" r="5" fill="#ff3d75"/>`,
  },
  glasses: {
    name: '眼镜',
    draw: () => `
      <circle cx="133" cy="148" r="13" fill="none" stroke="#3a2b2b" stroke-width="3"/>
      <circle cx="167" cy="148" r="13" fill="none" stroke="#3a2b2b" stroke-width="3"/>
      <line x1="146" y1="148" x2="154" y2="148" stroke="#3a2b2b" stroke-width="3"/>`,
  },
  crown: {
    name: '皇冠',
    draw: () => `
      <path d="M124 96 L132 74 L150 90 L168 74 L176 96 Z" fill="#ffd54a" stroke="#e8b400" stroke-width="1.5"/>
      <circle cx="150" cy="86" r="3" fill="#ff5d8f"/>`,
  },
  hat: {
    name: '帽子',
    draw: () => `
      <ellipse cx="150" cy="104" rx="56" ry="12" fill="#ffb86b"/>
      <path d="M120 104 Q124 70 150 68 Q176 70 180 104 Z" fill="#ffc987"/>
      <rect x="120" y="96" width="60" height="8" fill="#ff7eb3"/>`,
  },
  earrings: {
    name: '耳环',
    draw: () => `
      <circle cx="106" cy="162" r="5" fill="#ffd54a"/>
      <circle cx="194" cy="162" r="5" fill="#ffd54a"/>`,
  },
  catears: {
    name: '猫耳',
    draw: () => `
      <path d="M118 108 L110 78 L138 96 Z" fill="#3a2b2b"/>
      <path d="M182 108 L190 78 L162 96 Z" fill="#3a2b2b"/>
      <path d="M120 102 L116 86 L130 96 Z" fill="#ff9fc0"/>
      <path d="M180 102 L184 86 L170 96 Z" fill="#ff9fc0"/>`,
  },
  mask: {
    name: '面罩',
    draw: () => `
      <path d="M114 144 Q150 138 186 144 L182 156 Q150 150 118 156 Z" fill="#7a4aff" opacity="0.85"/>
      <circle cx="133" cy="148" r="6" fill="#fff"/>
      <circle cx="167" cy="148" r="6" fill="#fff"/>`,
  },
  flower: {
    name: '花环',
    draw: () => `
      <circle cx="116" cy="106" r="7" fill="#ff7eb3"/>
      <circle cx="138" cy="96" r="7" fill="#ffd54a"/>
      <circle cx="162" cy="96" r="7" fill="#a86cff"/>
      <circle cx="184" cy="106" r="7" fill="#43c6ac"/>`,
  },
  bougainvillea: {
    name: '三角梅发饰',
    draw: () => `
      <g transform="translate(186 118)">
        <path d="M0 -10 L8 4 L-8 4 Z" fill="#ff5d8f"/>
        <path d="M-10 6 L4 -3 L4 14 Z" fill="#ff7eb3"/>
        <path d="M10 6 L-4 -3 L-4 14 Z" fill="#ff89b6"/>
        <circle cx="0" cy="3" r="2.6" fill="#fff3a0"/>
      </g>
      <path d="M170 116 Q176 108 184 110" stroke="#5a9a4a" stroke-width="2.5" fill="none"/>
      <path d="M168 112 Q172 106 178 108 Q172 112 168 112 Z" fill="#5a9a4a"/>`,
  },
};

// 身体/背后配饰（独立图层，可与头部配饰叠加）
const ACC2 = {
  none: { name: '无', behind: '', front: '' },
  necklace: {
    name: '项链',
    behind: '',
    front: `<path d="M138 200 Q150 214 162 200" stroke="#ffd54a" stroke-width="2.5" fill="none"/>
            <circle cx="150" cy="210" r="4" fill="#ff5d8f"/>`,
  },
  wings: {
    name: '翅膀',
    behind: `
      <path d="M120 220 Q70 200 60 250 Q90 248 100 268 Q80 270 84 296 Q116 270 124 240 Z" fill="#fff" opacity="0.92"/>
      <path d="M180 220 Q230 200 240 250 Q210 248 200 268 Q220 270 216 296 Q184 270 176 240 Z" fill="#fff" opacity="0.92"/>`,
    front: '',
  },
  scarf: {
    name: '围巾',
    behind: '',
    front: `<path d="M126 198 Q150 210 174 198 L172 212 Q150 222 128 212 Z" fill="#ff5d8f"/>
            <path d="M168 210 L176 250 L164 250 L162 212 Z" fill="#ff5d8f"/>`,
  },
  bag: {
    name: '小挎包',
    behind: '',
    front: `<path d="M112 230 Q150 222 188 230" stroke="#a86cff" stroke-width="2.5" fill="none"/>
            <rect x="176" y="244" width="26" height="22" rx="4" fill="#a86cff"/>
            <rect x="182" y="250" width="14" height="4" rx="2" fill="#fff" opacity="0.6"/>`,
  },
  cape: {
    name: '披风',
    behind: `<path d="M120 206 Q150 200 180 206 L196 360 Q150 348 104 360 Z" fill="#7a4aff" opacity="0.9"/>`,
    front: '',
  },
};

const BG = {
  cream: { name: '暖白', color: '#F7E9E6' },
  pink: { name: '粉色', color: '#fde7f3' },
  sky: { name: '天空', color: '#dff1ff' },
  mint: { name: '薄荷', color: '#dcf7ec' },
  sunset: { name: '黄昏', color: '#ffe8d6' },
  purple: { name: '紫梦', color: '#ece1ff' },
  star: { name: '星空', color: '#2b2350' },
  beach: { name: '沙滩', color: '#fde6b8' },
  forest: { name: '森林', color: '#cdeacb' },
  garden: { name: '花园三角梅', color: '#e9f3e0' },
};

// 花园背景的装饰图层（绿叶 + 三角梅），叠在底色之上
function gardenDecor() {
  const leaf = (x, y, s, rot, op = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity="${op}">
       <path d="M0 0 Q14 -10 28 0 Q14 10 0 0 Z" fill="#5a9a4a"/>
       <path d="M2 0 L26 0" stroke="#3f7a34" stroke-width="1"/></g>`;
  const flower = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})">
       <path d="M0 -9 L7 4 L-7 4 Z" fill="#ff5d8f"/>
       <path d="M-9 6 L4 -3 L4 13 Z" fill="#ff7eb3"/>
       <path d="M9 6 L-4 -3 L-4 13 Z" fill="#ff89b6"/>
       <circle cx="0" cy="3" r="2.4" fill="#fff3a0"/></g>`;
  // 顶部藤蔓垂下的绿叶与花
  let top = '';
  const leaves = [[20, 30, 1.0, 20], [60, 18, 1.2, -10], [110, 34, 1.0, 35],
    [170, 16, 1.3, -25], [230, 30, 1.1, 15], [275, 20, 1.0, -35],
    [40, 60, 0.9, 60], [200, 56, 0.9, -55], [255, 64, 1.0, 30]];
  leaves.forEach(l => top += leaf(l[0], l[1], l[2], l[3]));
  const flowers = [[50, 40, 1.1], [150, 30, 1.3], [240, 48, 1.1], [95, 58, 0.9], [285, 38, 1.0]];
  flowers.forEach(f => top += flower(f[0], f[1], f[2]));
  // 底部盆栽绿植
  let bottom = '';
  for (let i = 0; i < 7; i++) {
    bottom += leaf(15 + i * 45, 430 + (i % 2) * 8, 1.4, -90 + (i % 3) * 25, 0.95);
    bottom += leaf(30 + i * 45, 446, 1.2, -70 - (i % 3) * 20, 0.95);
  }
  return `<g id="garden-decor">${top}${bottom}</g>`;
}

/* 调色板 */
const PALETTE = ['#F2C9CC', '#E49BA2', '#ff7eb3', '#ff5d8f', '#a86cff', '#6c8cff',
  '#43c6ac', '#ffd54a', '#ff9f68', '#ffffff', '#8A6B5D', '#5A4338'];
const HAIR_PALETTE = ['#2B211D', '#5A4338', '#8A6B5D', '#6b4a3a', '#c9913f',
  '#ff7eb3', '#a86cff', '#d94f4f', '#5a5a6a', '#ffffff'];

/* ---------- 渲染 ---------- */
function render() {
  // 肤色
  document.querySelectorAll('#doll .skin').forEach(el => el.setAttribute('fill', outfit.skin));
  // 表情
  document.getElementById('face-layer').innerHTML = EXPRESSIONS[outfit.expression].draw();

  document.getElementById('bg-layer').setAttribute('fill', BG[outfit.bg].color);
  document.getElementById('hair-layer').innerHTML = HAIR[outfit.hair].draw(outfit.hairColor);
  document.getElementById('inner-top-layer').innerHTML = INNER_TOP;
  document.getElementById('inner-bottom-layer').innerHTML = INNER_BOTTOM;
  document.getElementById('top-layer').innerHTML = TOP[outfit.top].draw(outfit.topColor);
  document.getElementById('bottom-layer').innerHTML = BOTTOM[outfit.bottom].draw(outfit.bottomColor);
  document.getElementById('shoes-layer').innerHTML = SHOES[outfit.shoes].draw(outfit.shoesColor);
  document.getElementById('acc-layer').innerHTML = ACC[outfit.acc].draw();
  document.getElementById('behind-layer').innerHTML = ACC2[outfit.acc2].behind;
  // 身体配饰的前置部分追加到上装图层之上
  document.getElementById('acc-layer').innerHTML += ACC2[outfit.acc2].front;

  // 背景装饰层（星空 / 花园），先清掉旧的
  ['stars', 'garden-decor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  const bgLayer = document.getElementById('bg-layer');
  if (outfit.bg === 'star') {
    const stars = Array.from({ length: 18 }, () => {
      const x = (Math.random() * 300).toFixed(0);
      const y = (Math.random() * 200).toFixed(0);
      const r = (Math.random() * 1.6 + 0.6).toFixed(1);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.85"/>`;
    }).join('');
    bgLayer.insertAdjacentHTML('afterend', `<g id="stars">${stars}</g>`);
  } else if (outfit.bg === 'garden') {
    bgLayer.insertAdjacentHTML('afterend', gardenDecor());
  }
}

/* ---------- 面板配置 ---------- */
const TABS = [
  { key: 'skin', label: '🧍 角色', type: 'swatch', data: SKIN },
  { key: 'expression', label: '😊 表情', type: 'item', data: EXPRESSIONS, palette: null },
  { key: 'hair', label: '💇 发型', type: 'item', data: HAIR, colorKey: 'hairColor', palette: HAIR_PALETTE },
  { key: 'top', label: '👚 上装', type: 'item', data: TOP, colorKey: 'topColor', palette: PALETTE },
  { key: 'bottom', label: '👗 下装', type: 'item', data: BOTTOM, colorKey: 'bottomColor', palette: PALETTE },
  { key: 'shoes', label: '👟 鞋子', type: 'item', data: SHOES, colorKey: 'shoesColor', palette: PALETTE },
  { key: 'acc', label: '🎀 头饰', type: 'item', data: ACC, palette: null },
  { key: 'acc2', label: '🧣 装饰', type: 'acc2', data: ACC2, palette: null },
  { key: 'bg', label: '🌈 背景', type: 'bg', data: BG },
];

let activeTab = 'skin';

function buildTabs() {
  const tabsEl = document.getElementById('tabs');
  tabsEl.innerHTML = TABS.map(t =>
    `<button class="tab ${t.key === activeTab ? 'active' : ''}" data-tab="${t.key}">${t.label}</button>`
  ).join('');
  tabsEl.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => { activeTab = btn.dataset.tab; buildTabs(); buildOptions(); });
  });
}

// 缩略图：把部件画在迷你舞台上
function thumb(inner, bg = '#fff7fb') {
  return `<svg viewBox="0 0 300 460" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="460" fill="${bg}"/>${inner}</svg>`;
}

function buildOptions() {
  const tab = TABS.find(t => t.key === activeTab);
  const optEl = document.getElementById('options');
  let html = '';

  if (tab.type === 'bg') {
    html = Object.entries(tab.data).map(([k, v]) =>
      `<div class="swatch ${outfit.bg === k ? 'selected' : ''}" data-pick="${k}">
         <div class="color-dot" style="background:${v.color}"></div>
         <span class="label">${v.name}</span>
       </div>`).join('');
  } else if (tab.type === 'swatch') {
    // 肤色等：纯色块
    html = Object.entries(tab.data).map(([k, v]) =>
      `<div class="swatch ${outfit[tab.key] === v.color ? 'selected' : ''}" data-pickval="${v.color}">
         <div class="color-dot" style="background:${v.color}"></div>
         <span class="label">${v.name}</span>
       </div>`).join('');
  } else {
    // 款式选择（item / acc2）
    html = Object.entries(tab.data).map(([k, v]) => {
      let inner;
      if (k === 'none') {
        inner = '<text x="150" y="250" font-size="40" text-anchor="middle">🚫</text>';
      } else if (tab.key === 'expression') {
        inner = `<ellipse cx="150" cy="152" rx="45" ry="50" fill="${outfit.skin}"/>${v.draw()}`;
      } else if (tab.type === 'acc2') {
        inner = (v.behind || '') + (v.front || '');
      } else {
        const color = tab.colorKey ? outfit[tab.colorKey] : '#ff7eb3';
        inner = v.draw(color);
      }
      return `<div class="swatch ${outfit[tab.key] === k ? 'selected' : ''}" data-pick="${k}">
         ${thumb(inner)}
         <span class="label">${v.name}</span>
       </div>`;
    }).join('');

    if (tab.palette) {
      html += `<div style="grid-column:1/-1;height:1px;background:#f0e0ea;margin:4px 0;"></div>`;
      html += tab.palette.map(c =>
        `<div class="swatch ${outfit[tab.colorKey] === c ? 'selected' : ''}" data-color="${c}">
           <div class="color-dot" style="background:${c};border:1px solid #eee"></div>
         </div>`).join('');
    }
  }

  optEl.innerHTML = html;

  optEl.querySelectorAll('[data-pick]').forEach(el => {
    el.addEventListener('click', () => { outfit[tab.key] = el.dataset.pick; render(); buildOptions(); });
  });
  optEl.querySelectorAll('[data-pickval]').forEach(el => {
    el.addEventListener('click', () => { outfit[tab.key] = el.dataset.pickval; render(); buildOptions(); });
  });
  optEl.querySelectorAll('[data-color]').forEach(el => {
    el.addEventListener('click', () => { outfit[tab.colorKey] = el.dataset.color; render(); buildOptions(); });
  });
}

/* ---------- 操作按钮 ---------- */
function randomKey(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}
function randomColor(p) { return p[Math.floor(Math.random() * p.length)]; }

document.getElementById('randomBtn').addEventListener('click', () => {
  outfit.skin = SKIN[randomKey(SKIN)].color;
  outfit.expression = randomKey(EXPRESSIONS);
  outfit.hair = randomKey(HAIR);
  outfit.hairColor = randomColor(HAIR_PALETTE);
  outfit.top = randomKey(TOP);
  outfit.topColor = randomColor(PALETTE);
  outfit.bottom = randomKey(BOTTOM);
  outfit.bottomColor = randomColor(PALETTE);
  outfit.shoes = randomKey(SHOES);
  outfit.shoesColor = randomColor(PALETTE);
  outfit.acc = randomKey(ACC);
  outfit.acc2 = randomKey(ACC2);
  outfit.bg = randomKey(BG);
  render();
  buildOptions();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  Object.assign(outfit, JSON.parse(JSON.stringify(DEFAULT_OUTFIT)));
  render();
  buildOptions();
});

// 收藏槽：localStorage 保存/读取造型
function refreshSlots() {
  const wrap = document.getElementById('slots');
  if (!wrap) return;
  wrap.innerHTML = [1, 2, 3].map(i => {
    const has = localStorage.getItem('outfit-slot-' + i);
    return `<button class="btn slot ${has ? 'has' : ''}" data-slot="${i}">
      ${has ? '👗' : '＋'} 槽${i}</button>`;
  }).join('');
  wrap.querySelectorAll('.slot').forEach(btn => {
    const i = btn.dataset.slot;
    btn.addEventListener('click', () => {
      const saved = localStorage.getItem('outfit-slot-' + i);
      if (saved) {
        // 已有：读取
        Object.assign(outfit, JSON.parse(saved));
        render(); buildOptions();
      } else {
        // 空槽：保存
        localStorage.setItem('outfit-slot-' + i, JSON.stringify(outfit));
        refreshSlots();
      }
    });
    // 右键清空
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      localStorage.removeItem('outfit-slot-' + i);
      refreshSlots();
    });
  });
}

// 保存为 PNG 图片
document.getElementById('saveBtn').addEventListener('click', () => {
  const svg = document.getElementById('doll');
  const data = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 920;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 600, 920);
    URL.revokeObjectURL(url);
    const a = document.createElement('a');
    a.download = '我的换装造型.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = url;
});

/* ---------- 启动 ---------- */
buildTabs();
buildOptions();
refreshSlots();
render();
