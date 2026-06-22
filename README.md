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

## 路线图

后续计划实现的游戏 — **任务看板在 [GitHub Issues](https://github.com/wyf0931/oma-games/issues)**，详细技术方案见 [`docs/roadmap.md`](docs/roadmap.md)：

| 游戏 | 难度 | 核心算法 |
|------|------|---------|
| 太空侵略者 Space Invaders | ⭐ | 矩阵阵列移动 + 难度递增 |
| 双人乒乓球 Pong | ⭐ | AI Y 轴追踪 + 角度反射 |
| Chrome 小恐龙 T-Rex Run | ⭐ | 无限地形拼接 + 宽松碰撞箱 |
| 贪吃蛇 Snake | ⭐⭐ | 链表队列 + 食物不重叠采样 |
| 扫雷 Minesweeper | ⭐⭐ | Flood Fill + 格子状态机 |
| 是男人就下100层 Tower Climb | ⭐⭐ | 视差滚动 + 平台生成 + 重力 |
| 打砖块 Breakout | ⭐⭐⭐ | 向量反射 + 道具系统 |
| 2048 | ⭐⭐⭐ | 二维数组滑动合并 + 过渡动画 |
| 黄金矿工 Gold Miner | ⭐⭐⭐ | 摆锤物理 + 蓄力机制 |
| 五子棋 Gomoku | ⭐⭐⭐ | 8 方向连续计数 + 估值函数 AI |
| 俄罗斯方块 Tetris | ⭐⭐⭐⭐ | SRS 旋转矩阵 + 消行 + 7-bag |

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
