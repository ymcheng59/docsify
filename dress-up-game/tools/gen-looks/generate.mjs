// 批量预生成「角色穿上每套衣服」的整身图(离线运行,不在网站里跑)
//
// 用法:
//   1. 在 https://aistudio.google.com/apikey 申请 Gemini API Key
//   2. 设环境变量:  export GEMINI_API_KEY=你的key
//   3. 在本目录运行:  node generate.mjs
//      - 只生成某几套:   node generate.mjs 碎花长裙 泡泡袖百褶裙
//      - 强制重新生成:   node generate.mjs --force
//   4. 生成的图片会写到 ../../assets/look-*.png,并更新 ../../assets/looks.json
//   5. git add/commit/push 到 main,GitHub Pages 自动部署后,在「整套相册」里就能看到
//
// 说明:Node 18+ 自带 fetch,无需安装依赖。模型默认 gemini-2.5-flash-image,
//      如报错可改环境变量 GEMINI_IMAGE_MODEL(例如带 -preview 后缀的版本)。

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dir, '..', '..', 'assets');
const ITEMS_DIR = join(ASSETS, 'items');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const BASE_IMG = join(ASSETS, '初始造型.png');

if (!API_KEY) {
  console.error('❌ 未设置 GEMINI_API_KEY。请先 export GEMINI_API_KEY=你的key');
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyNames = args.filter(a => !a.startsWith('--'));

const items = JSON.parse(readFileSync(join(ITEMS_DIR, 'items.json'), 'utf8'));
const byId = Object.fromEntries(items.map(it => [it.id, it]));
const outfits = JSON.parse(readFileSync(join(__dir, 'outfits.json'), 'utf8')).looks;

function toInlinePart(path) {
  const data = readFileSync(path).toString('base64');
  const mime = path.toLowerCase().endsWith('.jpg') || path.toLowerCase().endsWith('.jpeg')
    ? 'image/jpeg' : 'image/png';
  return { inlineData: { mimeType: mime, data } };
}

function buildPrompt(names) {
  const wearing = names.join('、');
  return [
    '这是同一个动漫女孩角色。第 1 张是她的基础立绘(只穿着粉色内搭),后面几张是要穿上的衣服单品。',
    `请重新绘制【同一个角色】,让她自然地穿上这套服装:${wearing}。`,
    '严格保持:同一张脸、发型、发色、身材比例、站姿、以及一致的柔和动漫水彩画风。',
    '要求:全身像、正面站立、纯白背景、只有这一个人物、不要文字或水印。',
    '衣服要自然贴合身体(有真实的褶皱、垂坠和遮挡),而不是平铺粘贴的感觉。',
  ].join('\n');
}

async function generateOne(outfit) {
  const parts = outfit.items.map(id => byId[id]).filter(Boolean);
  const names = parts.map(p => p.name);
  const promptText = buildPrompt(names);

  const contentParts = [{ text: promptText }, toInlinePart(BASE_IMG)];
  for (const it of parts) contentParts.push(toInlinePart(join(ITEMS_DIR, it.file)));

  const body = {
    contents: [{ role: 'user', parts: contentParts }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t.slice(0, 400)}`);
  }
  const json = await res.json();
  const cand = json.candidates?.[0];
  const imgPart = cand?.content?.parts?.find(p => p.inlineData?.data);
  if (!imgPart) throw new Error('返回里没有图片(可能被安全策略拦截): ' + JSON.stringify(json).slice(0, 300));
  return Buffer.from(imgPart.inlineData.data, 'base64');
}

async function main() {
  let list = outfits;
  if (onlyNames.length) list = outfits.filter(o => onlyNames.includes(o.name));
  if (!list.length) { console.error('没有匹配的造型。'); process.exit(1); }

  const looksManifest = [{ file: '初始造型.png', name: '基础' }];
  let idx = 0;
  for (const outfit of outfits) {
    idx++;
    const outFile = `look-${idx}.png`;
    const outPath = join(ASSETS, outFile);
    looksManifest.push({ file: outFile, name: outfit.name });

    if (!list.includes(outfit)) continue;          // 本次不生成,但仍登记进 manifest
    if (existsSync(outPath) && !force) { console.log(`⏭  跳过(已存在) ${outfit.name}`); continue; }

    process.stdout.write(`🎨 生成「${outfit.name}」… `);
    try {
      const buf = await generateOne(outfit);
      writeFileSync(outPath, buf);
      console.log(`✓ -> assets/${outFile} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.log('✗ 失败:', e.message);
    }
    await new Promise(r => setTimeout(r, 2500));    // 轻微限速
  }

  writeFileSync(join(ASSETS, 'looks.json'), JSON.stringify(looksManifest, null, 2));
  console.log(`\n✅ 完成。已更新 assets/looks.json(共 ${looksManifest.length} 项)。`);
  console.log('接着把 assets/ 下的新图片和 looks.json 提交到 main 即可。');
}

main();
