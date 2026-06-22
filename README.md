# oma-games

OhMyAgent 游戏合集 — Vibe Coding 驱动的轻量游戏 Demo。

## 在线访问

🚀 **[games.ohmyagent.ai](https://games.ohmyagent.ai)** (Cloudflare Pages)

## 功能特性

- **🌗 深色/浅色模式** — 自动记住用户偏好，默认深色主题
- **🌐 中英文切换** — i18n 支持，默认中文
- **🎮 游戏卡片轮播** — 纯 CSS 动画，3 秒自动旋转截图，零 JavaScript 依赖

## 游戏列表

| 游戏 | 文件 | 说明 |
|------|------|------|
| TANK COMMAND | `tank.html` | 经典坦克大战，军事 HUD 风格，可自定义敌机数量、难度和弹幕模式 |

## 技术栈

- 纯 HTML5 + CSS3 + JavaScript (ES6+)
- Canvas 2D（游戏世界渲染）
- Lucide Icons (CDN)
- 单文件架构，零构建工具

### 核心技术

- **游戏循环** — `requestAnimationFrame` + update/draw 分离
- **有限状态机（FSM）** — `MENU / PLAYING / GAMEOVER / WIN` 状态流转
- **行为树（BT）** — `Selector / Sequence` + 条件/动作节点，驱动 NPC AI
- **AABB 碰撞** — 轴对齐包围盒 + 拒绝采样生成单位
- **CSS 变量主题** — 暗色为默认，`[data-theme]` 切换
- **i18n** — 双语字典 + `data-i18n` 属性，`localStorage` 持久化偏好

> 详细架构、代码组织、组件化、交互设计请见 [`docs/tank.md`](docs/tank.md)

## 部署

- Cloudflare Pages
- 自动部署，分支推送即生效

## 关于

OhMyAgent 项目的子板块，持续更新和添加新的游戏 Demo。
