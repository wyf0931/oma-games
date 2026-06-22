# oma-games — Agent 协作指南

## localStorage 全局 Key（所有游戏共用）

| Key | Values | Default | 用途 |
|-----|--------|---------|------|
| `oma_games_lang` | `zh` / `en` | `zh` | 界面语言，中/英文切换 |
| `oma_games_theme` | `dark` / `light` | `dark` | 暗色/亮色主题 |

## 规范

- 所有游戏 HTML 页面启动时读取 `oma_games_lang`，根据值显示对应语言
- 如无值，默认 `zh`（中文）
- 新增游戏必须支持中英双语，并遵循上述 localStorage key
- index.html 为游戏入口，负责语言/主题切换按钮，各游戏页面只读取不写入切换逻辑（但游戏内操作可触发语言切换，写入 key 后刷新页面）
- 技术标签（HTML5 Canvas 等）不在游戏卡片中展示

## 共享组件库（`shared/`）

**所有新游戏必须通过 `shared/oma-games.js` + `shared/oma-games.css` 接入横切关注点**，不再内联实现 i18n / theme / input / loop / FSM。

- 引入方式：`<script src="../shared/oma-games.js"></script>` + `<link rel="stylesheet" href="../shared/oma-games.css">`
- 详细 API 见 [`docs/component-library.md`](docs/component-library.md)
- 跨游戏 UX 一致性约定（顶栏 / 难度三档 / 配置面板 / 键位说明）见该文档第 5 节

> 注：`tank.html` 是单文件时代的产物，暂不强制重构；新游戏一律走共享库。

## 测试 / 浏览器自动化

## 测试 / 浏览器自动化

仓库是**纯静态站点**（HTML/CSS/JS + 图片），**运行时零依赖**，因此不绑定任何测试框架或浏览器自动化库（不引入 `playwright`、`puppeteer` 等）。

如需对游戏做端到端验证或截图，开发者**临时**自选工具即可，不要把依赖写进仓库：

- **Chrome DevTools MCP** — 在 Claude Code / Cursor 中通过 MCP 直接驱动本机 Chrome（推荐，无安装成本）
- **playwright-cli（一次性）** — `npx playwright@latest screenshot <url> out.png`，跑完用 `rm -rf ~/Library/Caches/ms-playwright` 清理浏览器二进制
- **人工浏览器测试** — 直接打开 HTML 文件或本地静态服务器

临时脚本与产物（`pw-shot*.js`、`pw-shot*.png`、`helper.html`、`tank-auto.html`）已在 `.gitignore` 中过滤，**不要提交**。

## 文件结构约定

```
oma-games/
├── index.html              首页（游戏中心）
├── tank.html               既有游戏（单文件时代）
├── <game>.html             新游戏（使用 shared/）
├── shared/
│   ├── oma-games.js        横切关注点：i18n / theme / input / loop / fsm
│   └── oma-games.css       reset + theme tokens + UI 原子组件
├── docs/
│   ├── tank.md             TANK 开发经验
│   ├── component-library.md 共享库 API
│   └── roadmap.md          游戏路线图
├── AGENTS.md               本文件
└── README.md
```