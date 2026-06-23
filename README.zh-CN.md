# OMA GAMES · 街机游戏中心

**用现代 Web 美学重做的街机游戏合集。** 11 款经典玩法以单文件 HTML5 形式重制 — 零安装、零广告、无需登录，浏览器打开即玩。

[![Live](https://img.shields.io/badge/在线-games.ohmyagent.ai-00f0ff?style=flat-square)](https://games.ohmyagent.ai/)
[![Games](https://img.shields.io/badge/游戏-11-ff2bd1?style=flat-square)](#-游戏清单)
[![License](https://img.shields.io/badge/协议-MIT-a78bfa?style=flat-square)](LICENSE)

🌐 **多语言**: [English](README.md) · [简体中文](README.zh-CN.md)

🚀 **立即游玩**: <https://games.ohmyagent.ai>

---

## 🎮 游戏清单

11 款游戏全部上线。每个游戏是自包含的单文件 HTML — 零依赖、零构建。

| # | 游戏 | 难度 | 核心技术 | 进入 |
|---|---|---|---|---|
| 1 | **TANK COMMAND** | ★★★ | 行为树 + AABB 碰撞 + FSM | [▶](https://games.ohmyagent.ai/tank) |
| 2 | **SPACE INVADERS** | ★ | 矩阵阵列移动 + 难度递增 | [▶](https://games.ohmyagent.ai/space-invaders) |
| 3 | **PONG** | ★ | AI Lerp 追踪 + 角度反射 | [▶](https://games.ohmyagent.ai/pong) |
| 4 | **T-REX RUN** | ★ | 无限滚动 + 宽松碰撞箱 | [▶](https://games.ohmyagent.ai/dino) |
| 5 | **SNAKE** | ★★ | 链表队列 + 固定 timestep | [▶](https://games.ohmyagent.ai/snake) |
| 6 | **MINESWEEPER** | ★★ | Flood Fill (BFS) + 格子状态机 | [▶](https://games.ohmyagent.ai/minesweeper) |
| 7 | **TOWER CLIMB** | ★★ | 摄像机跟随 + 平台生成 + 重力 | [▶](https://games.ohmyagent.ai/tower-climb) |
| 8 | **BREAKOUT** | ★★★ | 向量反射 + 5 种道具 + 粒子 | [▶](https://games.ohmyagent.ai/breakout) |
| 9 | **2048** | ★★★ | 二维数组滑动合并 + 过渡动画 | [▶](https://games.ohmyagent.ai/2048) |
| 10 | **GOLD MINER** | ★★★ | 摆锤物理 + 6 种物品 + 关卡 | [▶](https://games.ohmyagent.ai/gold-miner) |
| 11 | **GOMOKU** | ★★★ | 8 方向胜负 + 估值函数 AI | [▶](https://games.ohmyagent.ai/gomoku) |

**即将到来**: TETRIS (★★★★) — SRS 旋转矩阵 + 7-bag 随机

## 🛠 技术栈

- **纯 HTML5 + CSS3 + ES6+ JavaScript** — 无框架、无构建工具
- **Canvas 2D** 渲染游戏世界，**DOM** 负责 UI
- **共享组件库**（[`shared/`](shared/)）统一 i18n / 主题 / 输入 / 游戏循环 / FSM
- **Cloudflare Pages** 部署 — 零后端
- **Google Fonts** 字体（Audiowide / Orbitron / Rajdhani 等）

### 用到的核心算法

- **游戏循环** — `requestAnimationFrame` + update/draw 分离
- **有限状态机（FSM）** — MENU / PLAYING / GAMEOVER / WIN 状态流转
- **行为树** — `Selector / Sequence` + 条件/动作节点驱动 NPC AI
- **AABB 碰撞** — 轴对齐包围盒 + 拒绝采样
- **Flood Fill** — 扫雷的迭代式 BFS
- **Minimax + alpha-beta 剪枝** — 五子棋 AI
- **摆锤物理** — 黄金矿工钩爪
- **向量反射** — 乒乓球 + 打砖块

## 🔧 开发工具与方法

| 工具 | 角色 |
|---|---|
| [**Claude Code**](https://claude.com/claude-code) | AI 编码 agent — 用自然语言指令实现游戏 |
| [**GLM 5.2**](https://chatglm.cn) | 本项目 Claude Code 背后的推理模型 |
| [**Chrome DevTools MCP**](https://github.com/ChromeDevTools/chrome-devtools-mcp) | 浏览器自动化测试 |
| [**Cloudflare Wrangler**](https://developers.cloudflare.com/workers/wrangler/) | 部署到 Cloudflare Pages |

**方法**：**Vibe Coding**（氛围编程） — 自然语言驱动的开发。人类给出意图与审美方向，AI 实现代码。这个仓库就是这种协作的产物：11 款游戏在约 2 天内完成，没有任何逐行手写。

如果想了解这个工作流，每个 commit message 都记录了"AI 被指示做什么 vs 它产出了什么"，见 [`git log`](https://github.com/wyf0931/oma-games/commits/main)。

## 📁 项目结构

```
oma-games/
├── index.html              首页（街机风游戏中心）
├── tank.html               TANK（单文件时代的产物）
├── <game>.html             每个游戏一个文件
├── shared/
│   ├── oma-games.js        共享库：i18n / theme / input / loop / fsm / ui.header()
│   └── oma-games.css       reset + 主题变量 + UI 原子组件
├── screenshots/            游戏截图（首页 + SEO 使用）
├── docs/
│   ├── tank.md             TANK 开发案例
│   ├── component-library.md  共享库 API 文档
│   └── roadmap.md          12 款游戏的设计规格
├── llms.txt                给大模型的站点摘要（llmstxt.org）
├── robots.txt              爬虫指令
├── sitemap.xml             SEO 站点地图
├── AGENTS.md               AI agent 协作指南
└── README.md               英文版
```

## 📚 文档

- [`docs/tank.md`](docs/tank.md) — TANK 实现详解：FSM / 行为树 / AABB / i18n
- [`docs/component-library.md`](docs/component-library.md) — `OmaGames.*` 共享库 API
- [`docs/roadmap.md`](docs/roadmap.md) — 12 款游戏的设计规格
- [`AGENTS.md`](AGENTS.md) — AI agent 协作约定
- [`llms.txt`](llms.txt) — 给大模型爬虫的简洁摘要

## 🎨 功能特性

- **🌗 暗色 / 亮色主题** — 自动记忆偏好
- **🌐 中文 / 英文** — 完整 i18n，`localStorage` 持久化
- **🎯 每游戏难度三档** — 初级 / 中级 / 高级
- **📱 PC 优先布局** — 键鼠操作，平板适配
- **🚫 无广告、无追踪、无登录** — 纯游戏体验

## 🚀 部署

部署在 **Cloudflare Pages**：<https://games.ohmyagent.ai>。

部署自己的 fork：

```bash
# 克隆
git clone https://github.com/wyf0931/oma-games.git
cd oma-games

# 方式 A：把仓库连接到 Cloudflare Pages 控制台
# 方式 B：用 Wrangler CLI 直接部署
npx wrangler pages deploy . --project-name=oma-games
```

无环境变量，无构建命令，只推静态文件。

## 🤝 贡献

这是一个 Vibe Coding 的展示项目 — 欢迎贡献！两种方式：

1. **玩并反馈 bug** — 提 [issue](https://github.com/wyf0931/oma-games/issues)
2. **实现下一个游戏** — 认领一个 open issue（如 TETRIS #11），按照 `docs/` 中的模式实现

## 📄 协议

MIT — 详见 [LICENSE](LICENSE)。

## 🙏 致谢

- **游戏设计** — 致敬街机经典（Atari / Namco / Taito / Nintendo 等）
- **开发栈** — Claude Code、GLM、Cloudflare、Google Fonts
- **Vibe Coding** — 让这一切成为可能的开发方法论

---

<p align="center">用 <a href="https://claude.com/claude-code">Claude Code</a> + <strong>Vibe Coding</strong> 构建</p>
