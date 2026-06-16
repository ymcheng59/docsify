# 造型批量预生成工具（AI 自然换装）

用图像模型把「角色穿上每套衣服」提前渲染成自然的整身图，喂给**整套造型相册版**（`gallery.html`）。
离线运行一次，之后浏览免费、秒开。

## 为什么是这种方式
平铺单品直接叠加会"贴不服帖"。让 AI 把衣服真正"穿"到身上重画，才自然。
因为站点是 GitHub Pages 纯静态、且 API 密钥不能放前端，所以采用**离线预生成**：
在你自己电脑上跑脚本生成图片 → 提交到仓库 → 网站直接展示。

## 准备
- Node 18+（你本机有就行）
- 一个 **Gemini API Key**：https://aistudio.google.com/apikey
  - Gemini 2.5 Flash Image（nano-banana）擅长多图融合 + 保持角色一致，且适合动漫画风。
  - 费用：按张计费，约**几美分/张**（以 Google 官方价格为准）。10 套≈很少的钱。

## 运行
```bash
cd dress-up-game/tools/gen-looks
export GEMINI_API_KEY=你的key          # Windows PowerShell: $env:GEMINI_API_KEY="你的key"

node generate.mjs                       # 生成 outfits.json 里的全部造型
node generate.mjs 碎花长裙              # 只生成某一套(先试一套看效果)
node generate.mjs --force               # 覆盖已生成的
```
生成结果：
- 图片写到 `../../assets/look-1.png … look-N.png`
- 清单写到 `../../assets/looks.json`（相册版会自动读取）

## 上线
```bash
git add dress-up-game/assets
git commit -m "feat: AI 预生成造型图"
git push                                # 推到 main，GitHub Pages 自动部署
```
然后打开 `gallery.html`（首页底部有「整套造型相册」入口）即可看到自然换装效果。

## 自定义
- 改 `outfits.json`：增删造型、改名字、调搭配（`items` 用 `assets/items/items.json` 里的 id）。
- 换模型：`export GEMINI_IMAGE_MODEL=gemini-2.5-flash-image-preview`（或其它兼容模型）。
- 想换成 Flux Kontext / 可灵 / Replicate 试衣模型：把 `generate.mjs` 里 `generateOne()` 的
  请求部分换成对应 API 即可，其余流程(读单品、写 looks.json)不变。

## 提示词
`generate.mjs` 里的 `buildPrompt()` 控制风格。要更像你的设定稿，可以在提示里补充
画风/光线/背景等描述，或把设定稿也作为参考图加进 `contentParts`。
