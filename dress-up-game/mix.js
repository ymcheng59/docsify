/* ===== 我的换装屋 · 叠加换装版 =====
   底图 assets/初始造型.png + assets/items/ 里的单品图层叠加。
   单品位置/大小由 assets/items/items.json 控制(x,y 为中心点百分比,w 为宽度百分比)。 */

const BASE_SRC = 'assets/初始造型.png';
const ITEMS_DIR = 'assets/items/';
const CANVAS_W = 1024, CANVAS_H = 1536;

// 类别(部位)定义,顺序即标签顺序
const CATS = [
  { key: 'top', label: '👚 上装' },
  { key: 'dress', label: '👗 连衣裙' },
  { key: 'bottom', label: '👖 下装' },
  { key: 'shoes', label: '👟 鞋子' },
  { key: 'bag', label: '🎒 包包' },
  { key: 'hat', label: '👒 帽子' },
];

let ITEMS = [];          // 全部单品
const byCat = {};        // cat -> [items]
const byId = {};         // id -> item
const state = { top: null, dress: null, bottom: null, shoes: null, bag: null, hat: null };
let activeTab = 'top';

function layerEl(cat) { return document.getElementById('layer-' + cat); }

function applyLayer(cat) {
  const el = layerEl(cat);
  const id = state[cat];
  // 连衣裙与 上装/下装 互斥显示
  if ((cat === 'top' || cat === 'bottom') && state.dress) { el.style.display = 'none'; return; }
  if (!id) { el.style.display = 'none'; el.removeAttribute('src'); return; }
  const it = byId[id];
  if (!it) { el.style.display = 'none'; return; }
  el.src = ITEMS_DIR + it.file;
  el.style.display = 'block';
  el.style.left = it.x + '%';
  el.style.top = it.y + '%';
  el.style.width = it.w + '%';
  el.style.zIndex = it.z;
}

function render() {
  CATS.forEach(c => applyLayer(c.key));
}

function buildTabs() {
  const el = document.getElementById('tabs');
  el.innerHTML = CATS.map(c =>
    `<button class="tab ${c.key === activeTab ? 'active' : ''}" data-tab="${c.key}">${c.label}</button>`).join('');
  el.querySelectorAll('.tab').forEach(b =>
    b.addEventListener('click', () => { activeTab = b.dataset.tab; buildTabs(); buildOptions(); }));
}

function buildOptions() {
  const el = document.getElementById('options');
  const list = byCat[activeTab] || [];
  let html = `<div class="swatch ${!state[activeTab] ? 'selected' : ''}" data-pick="">
       <div class="none-box">🚫<span>不穿</span></div>
     </div>`;
  html += list.map(it =>
    `<div class="swatch ${state[activeTab] === it.id ? 'selected' : ''}" data-pick="${it.id}">
       <img src="${ITEMS_DIR + it.file}" alt="${it.name}" loading="lazy" />
       <span class="label">${it.name}</span>
     </div>`).join('');
  el.innerHTML = html;
  el.querySelectorAll('[data-pick]').forEach(s =>
    s.addEventListener('click', () => choose(activeTab, s.dataset.pick)));
}

function choose(cat, id) {
  state[cat] = id || null;
  // 互斥:选连衣裙 -> 清上装/下装;选上装或下装 -> 清连衣裙
  if (cat === 'dress' && id) { state.top = null; state.bottom = null; }
  if ((cat === 'top' || cat === 'bottom') && id) { state.dress = null; }
  render();
  buildOptions();
}

document.getElementById('randomBtn').addEventListener('click', () => {
  const pick = (cat) => { const l = byCat[cat] || []; return l.length ? l[Math.floor(Math.random() * l.length)].id : null; };
  // 50% 穿连衣裙,否则 上装+下装
  state.top = state.bottom = state.dress = null;
  if (Math.random() < 0.5 && byCat.dress?.length) {
    state.dress = pick('dress');
  } else {
    state.top = pick('top');
    state.bottom = pick('bottom');
  }
  state.shoes = pick('shoes');
  state.hat = Math.random() < 0.4 ? pick('hat') : null;
  state.bag = Math.random() < 0.4 ? pick('bag') : null;
  render(); buildOptions();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  Object.keys(state).forEach(k => state[k] = null);
  render(); buildOptions();
});

// 合成导出 PNG(原生 1024x1536)
document.getElementById('saveBtn').addEventListener('click', async () => {
  const cv = document.createElement('canvas');
  cv.width = CANVAS_W; cv.height = CANVAS_H;
  const ctx = cv.getContext('2d');
  const load = (src) => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
  try {
    const base = await load(BASE_SRC);
    ctx.drawImage(base, 0, 0, CANVAS_W, CANVAS_H);
    // 按 z 排序绘制当前可见图层
    const visible = CATS.map(c => c.key)
      .filter(cat => layerEl(cat).style.display === 'block' && state[cat])
      .map(cat => byId[state[cat]])
      .sort((a, b) => a.z - b.z);
    for (const it of visible) {
      const img = await load(ITEMS_DIR + it.file);
      const w = it.w / 100 * CANVAS_W;
      const h = w * (img.naturalHeight / img.naturalWidth);
      const left = it.x / 100 * CANVAS_W - w / 2;
      const top = it.y / 100 * CANVAS_H - h / 2;
      ctx.drawImage(img, left, top, w, h);
    }
    const a = document.createElement('a');
    a.download = '我的造型.png';
    a.href = cv.toDataURL('image/png');
    a.click();
  } catch (e) {
    alert('保存失败:图片可能还没加载完,或浏览器限制。请稍后再试。');
  }
});

(async function init() {
  try {
    const r = await fetch(ITEMS_DIR + 'items.json', { cache: 'no-store' });
    ITEMS = await r.json();
  } catch (e) { ITEMS = []; }
  CATS.forEach(c => (byCat[c.key] = []));
  ITEMS.forEach(it => { byId[it.id] = it; (byCat[it.cat] = byCat[it.cat] || []).push(it); });
  buildTabs();
  buildOptions();
  render();
  window.__game = { state, render, byId, byCat, applyLayer }; // 便于调试/校准
})();
