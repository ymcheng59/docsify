/* ===== 我的换装屋 · 造型相册版 =====
   把整身立绘图片放到 assets/ 目录,游戏会自动识别并显示。
   两种配置方式:
   1) 放一个 assets/looks.json (推荐,可自定义名字):
      [{ "file": "base.png", "name": "基础" }, { "file": "look-1.png", "name": "碎花裙" }]
   2) 或直接命名上传,自动识别:
      assets/base.png(默认形象) + assets/look-1.png ~ look-24.png
   支持 .png / .jpg / .jpeg / .webp。 */

const ASSETS = 'assets/';
const EXTS = ['png', 'jpg', 'webp'];
const MAX_LOOKS = 20;

const stageImg = document.getElementById('look');
const looksEl = document.getElementById('looks');
const placeholder = document.getElementById('placeholder');
const loadingTip = document.getElementById('loadingTip');

let looks = [];
let current = 0;

function imageExists(src) {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => res(true);
    im.onerror = () => res(false);
    im.src = src + '?t=' + Date.now();
  });
}

// 在多个候选扩展名里找到第一个真实存在的
async function resolve(baseName) {
  const tries = await Promise.all(EXTS.map((e) => imageExists(ASSETS + baseName + '.' + e)));
  const idx = tries.findIndex(Boolean);
  return idx >= 0 ? ASSETS + baseName + '.' + EXTS[idx] : null;
}

async function loadManifest() {
  // 1) 优先 looks.json
  try {
    const r = await fetch(ASSETS + 'looks.json', { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j) && j.length) {
        return j.map((x, i) => ({ src: ASSETS + x.file, name: x.name || ('造型 ' + (i + 1)) }));
      }
    }
  } catch (e) { /* 忽略,改用自动识别 */ }

  // 2) 自动识别 base + look-1..N
  const found = [];
  const baseSrc = await resolve('base');
  if (baseSrc) found.push({ src: baseSrc, name: '基础' });
  const lookSrcs = await Promise.all(
    Array.from({ length: MAX_LOOKS }, (_, i) => resolve('look-' + (i + 1)))
  );
  lookSrcs.forEach((s, i) => { if (s) found.push({ src: s, name: '造型 ' + (i + 1) }); });
  return found;
}

function showLook(i) {
  current = (i + looks.length) % looks.length;
  stageImg.src = looks[current].src;
  stageImg.hidden = false;
  looksEl.querySelectorAll('.look-thumb').forEach((el, idx) =>
    el.classList.toggle('selected', idx === current));
}

function buildThumbs() {
  looksEl.innerHTML = looks.map((l, i) =>
    `<button class="look-thumb" data-i="${i}" title="${l.name}">
       <img src="${l.src}" alt="${l.name}" loading="lazy" />
       <span class="look-name">${l.name}</span>
     </button>`).join('');
  looksEl.querySelectorAll('.look-thumb').forEach((el) =>
    el.addEventListener('click', () => showLook(Number(el.dataset.i))));
}

document.getElementById('randomBtn').addEventListener('click', () => {
  if (looks.length < 2) return;
  let n = current;
  while (n === current) n = Math.floor(Math.random() * looks.length);
  showLook(n);
});

document.getElementById('saveBtn').addEventListener('click', () => {
  if (!looks.length) return;
  const a = document.createElement('a');
  a.href = looks[current].src;
  a.download = (looks[current].name || 'look') + '.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
});

(async function init() {
  looks = await loadManifest();
  loadingTip.hidden = true;
  if (!looks.length) {
    stageImg.hidden = true;
    placeholder.hidden = false;
    return;
  }
  buildThumbs();
  showLook(0);
})();
