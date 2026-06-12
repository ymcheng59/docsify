/* ===== 梦幻换装屋 ===== */
/* 所有服装/发型/配饰都是内联 SVG 片段，按图层叠加渲染。 */

// 当前造型状态
const outfit = {
  hair: 'long',
  hairColor: '#6b4a3a',
  top: 'tee',
  topColor: '#ff7eb3',
  bottom: 'skirt',
  bottomColor: '#a86cff',
  shoes: 'sneaker',
  shoesColor: '#ffffff',
  acc: 'none',
  bg: 'pink',
};

/* ---------- 各类素材定义 ----------
   每个素材含: id, name, 以及 draw(color) 返回 SVG 字符串。
   预览图 preview(color) 用于面板缩略图。 */

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
};

const TOP = {
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
};

const BOTTOM = {
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
};

const SHOES = {
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
};

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
};

const BG = {
  pink: { name: '粉色', color: '#fde7f3' },
  sky: { name: '天空', color: '#dff1ff' },
  mint: { name: '薄荷', color: '#dcf7ec' },
  sunset: { name: '黄昏', color: '#ffe8d6' },
  purple: { name: '紫梦', color: '#ece1ff' },
  star: { name: '星空', color: '#2b2350' },
};

/* 调色板（用于上装/下装/头发/鞋的颜色选择） */
const PALETTE = ['#ff7eb3', '#ff5d8f', '#a86cff', '#6c8cff', '#43c6ac',
  '#ffd54a', '#ff9f68', '#ffffff', '#3a3a4a', '#6b4a3a'];
const HAIR_PALETTE = ['#6b4a3a', '#2b2b2b', '#c9913f', '#ff7eb3', '#a86cff',
  '#7a4a2a', '#d94f4f', '#5a5a6a'];

/* ---------- 渲染 ---------- */
function render() {
  document.getElementById('bg-layer').setAttribute('fill', BG[outfit.bg].color);
  document.getElementById('hair-layer').innerHTML = HAIR[outfit.hair].draw(outfit.hairColor);
  document.getElementById('top-layer').innerHTML = TOP[outfit.top].draw(outfit.topColor);
  document.getElementById('bottom-layer').innerHTML = BOTTOM[outfit.bottom].draw(outfit.bottomColor);
  document.getElementById('shoes-layer').innerHTML = SHOES[outfit.shoes].draw(outfit.shoesColor);
  document.getElementById('acc-layer').innerHTML = ACC[outfit.acc].draw();

  // 星空背景加点星星
  if (outfit.bg === 'star') {
    const stars = Array.from({ length: 18 }, () => {
      const x = (Math.random() * 300).toFixed(0);
      const y = (Math.random() * 200).toFixed(0);
      const r = (Math.random() * 1.6 + 0.6).toFixed(1);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="0.85"/>`;
    }).join('');
    document.getElementById('bg-layer').insertAdjacentHTML('afterend', `<g id="stars">${stars}</g>`);
  } else {
    const s = document.getElementById('stars');
    if (s) s.remove();
  }
}

/* ---------- 面板配置 ---------- */
const TABS = [
  { key: 'hair', label: '💇 发型', type: 'item', data: HAIR, colorKey: 'hairColor', palette: HAIR_PALETTE },
  { key: 'top', label: '👚 上装', type: 'item', data: TOP, colorKey: 'topColor', palette: PALETTE },
  { key: 'bottom', label: '👗 下装', type: 'item', data: BOTTOM, colorKey: 'bottomColor', palette: PALETTE },
  { key: 'shoes', label: '👟 鞋子', type: 'item', data: SHOES, colorKey: 'shoesColor', palette: PALETTE },
  { key: 'acc', label: '🎀 配饰', type: 'item', data: ACC, palette: null },
  { key: 'bg', label: '🌈 背景', type: 'bg', data: BG },
];

let activeTab = 'hair';

function buildTabs() {
  const tabsEl = document.getElementById('tabs');
  tabsEl.innerHTML = TABS.map(t =>
    `<button class="tab ${t.key === activeTab ? 'active' : ''}" data-tab="${t.key}">${t.label}</button>`
  ).join('');
  tabsEl.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => { activeTab = btn.dataset.tab; buildTabs(); buildOptions(); });
  });
}

// 给缩略图用的迷你 SVG（只画该部件，居中显示）
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
  } else {
    // 款式选择
    html = Object.entries(tab.data).map(([k, v]) => {
      const color = tab.colorKey ? outfit[tab.colorKey] : (tab.key === 'acc' ? '#ff7eb3' : '#ff7eb3');
      const inner = k === 'none' ? '<text x="150" y="250" font-size="40" text-anchor="middle">🚫</text>' : v.draw(color);
      return `<div class="swatch ${outfit[tab.key] === k ? 'selected' : ''}" data-pick="${k}">
         ${thumb(inner)}
         <span class="label">${v.name}</span>
       </div>`;
    }).join('');

    // 颜色选择
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
  optEl.querySelectorAll('[data-color]').forEach(el => {
    el.addEventListener('click', () => { outfit[tab.colorKey] = el.dataset.color; render(); buildOptions(); });
  });
}

/* ---------- 操作按钮 ---------- */
function randomPick(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}
function randomColor(p) { return p[Math.floor(Math.random() * p.length)]; }

document.getElementById('randomBtn').addEventListener('click', () => {
  outfit.hair = randomPick(HAIR);
  outfit.hairColor = randomColor(HAIR_PALETTE);
  outfit.top = randomPick(TOP);
  outfit.topColor = randomColor(PALETTE);
  outfit.bottom = randomPick(BOTTOM);
  outfit.bottomColor = randomColor(PALETTE);
  outfit.shoes = randomPick(SHOES);
  outfit.shoesColor = randomColor(PALETTE);
  outfit.acc = randomPick(ACC);
  outfit.bg = randomPick(BG);
  render();
  buildOptions();
});

const DEFAULT = JSON.parse(JSON.stringify(outfit));
document.getElementById('resetBtn').addEventListener('click', () => {
  Object.assign(outfit, JSON.parse(JSON.stringify(DEFAULT)));
  render();
  buildOptions();
});

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
render();
