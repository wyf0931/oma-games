# TANK COMMAND — 开发文档

> 经典坦克大战的单文件 HTML5 实现。本文记录其架构、核心技术、组件化与交互设计，
> 作为后续新增游戏时的参考蓝本。
>
> 源码：[`tank.html`](../tank.html)（约 1450 行，HTML/CSS/JS 全部内联）

---

## 0. TL;DR — 核心技术一览

| 维度 | 选择 | 备注 |
|---|---|---|
| 文件结构 | 单文件 HTML（内联 CSS/JS） | 零构建、零依赖、可直接 `file://` 打开 |
| 渲染 | Canvas 2D | 游戏世界（坦克/子弹/墙） |
| UI 层 | DOM + CSS | HUD、配置面板、菜单覆盖层 |
| 游戏循环 | `requestAnimationFrame` | update → draw 每帧调用 |
| 状态机 | 字段 `Game.state` + 分支 | `MENU / PLAYING / GAMEOVER / WIN` |
| NPC AI | 行为树（BT） | `Selector / Sequence / Leaf` 三类节点 |
| 碰撞 | AABB（轴对齐包围盒） | `rectIntersect(r1, r2)` |
| 国际化 | 双语字典 + `data-i18n` 属性 | 默认中文，键 `oma_games_lang` 持久化 |
| 主题 | `[data-theme]` + CSS 变量 | 暗色为默认 |

---

## 1. 设计目标

1. **零依赖单文件** — 不引入任何 npm 包、不依赖打包器，双击 HTML 即可玩
2. **可参数化** — NPC 数量、NPC 难度、玩家武器三轴独立配置
3. **可扩展** — BT、FSM、组件分层让后续新增单位/状态/规则改动局部化
4. **质感视觉** — 军事 HUD 美学（橄榄绿+琥珀黄+战术角标+扫描线）

---

## 2. 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                     tank.html (单文件)                   │
├──────────────────────┬──────────────────────────────────┤
│      DOM/CSS 层       │           Canvas 层              │
│  ┌────────────────┐  │   ┌──────────────────────────┐   │
│  │  #hud (状态栏) │  │   │  Game Loop (rAF)         │   │
│  │  #game-area    │  │   │   ↓                      │   │
│  │  #config-panel │  │   │  Game.update()           │   │
│  │   - mission    │  │   │   ├─ input               │   │
│  │   - npc count  │  │   │   ├─ player/npc AI (BT)  │   │
│  │   - difficulty │  │   │   ├─ bullets             │   │
│  │   - weapon     │  │   │   └─ collisions          │   │
│  │   - stats      │  │   │  Game.draw()             │   │
│  │   - controls   │  │   │   ├─ walls               │   │
│  └────────────────┘  │   │   ├─ tanks               │   │
│                      │   │   └─ bullets             │   │
└──────────────────────┴───┴──────────────────────────┴───┘
```

**关键约定**：DOM 负责"配置 + 状态显示"，Canvas 负责"游戏世界"。两者通过 `hpEl.textContent = ...` 这类 DOM 写入同步，状态读取则集中在 `Game` 控制器内。

---

## 3. 核心技术详解

### 3.1 游戏循环（Game Loop）

```js
const game = new Game();
function loop() {
    game.update();
    game.draw();
    requestAnimationFrame(loop);
}
loop();
```

- **rAF 驱动**：每帧调用 `update()` 后 `draw()`，浏览器自动同步刷新率（通常 60 fps，高刷屏会更快）
- **无固定 timestep**：所有速度以「像素/帧」表达（`tank.speed = 2`、`bullet.speed = 5`），冷却以「帧数」计数（`cooldown = 300`）
- **代价**：
  - 高刷屏（120/144Hz）下游戏会变快
  - 标签页失焦时 rAF 暂停（视为隐式 pause）
- **改进方向**（未实现）：改成 `deltaTime` 驱动 + 固定逻辑 tick + 插值渲染

### 3.2 有限状态机（FSM）

```js
this.state = 'MENU';  // 初始状态
```

| 当前状态 | 触发 | 下一状态 |
|---|---|---|
| `MENU` | Enter / 点击 Engage | `PLAYING` |
| `PLAYING` | `player.hp <= 0` | `GAMEOVER` |
| `PLAYING` | `npcs.length === 0` | `WIN` |
| `GAMEOVER` | R 键 | `PLAYING`（重新开始） |
| `WIN` | R 键 | `PLAYING`（重新开始） |

实现方式是 `update()` 和 `draw()` 内的 `if (state === ...)` 分支：
- 简单直观，状态少时最佳
- 状态超过 ~6 个或需要复杂的转换守卫时，建议升级为状态类（State Pattern）

### 3.3 行为树（Behavior Tree）— NPC AI 的核心

**节点类型**（标准 BT 三件套）：

```js
class Node { run(tick) {} }

class Sequence extends Node {  // AND：任一失败即整体失败
    run(tick) {
        for (let child of this.children) {
            if (child.run(tick) !== 'SUCCESS') return 'FAILURE';
        }
        return 'SUCCESS';
    }
}

class Selector extends Node {  // OR：任一成功即整体成功
    run(tick) {
        for (let child of this.children) {
            if (child.run(tick) !== 'FAILURE') return 'SUCCESS';
        }
        return 'FAILURE';
    }
}
```

**叶子节点**（条件 + 动作）：

| 节点 | 类型 | 行为 |
|---|---|---|
| `CanSeePlayer` | 条件 | 距离 < 400 且 Manhattan 轴向对齐 < 24 → SUCCESS |
| `AttackPlayer` | 动作 | 朝玩家转向并射击 |
| `Patrol` | 动作 | 阻塞或 2.5% 随机换方向，然后移动 |

**NPC 的 BT 结构**：

```
Selector                          ← 优先尝试攻击，否则巡逻
├─ Sequence                       ← 条件 + 动作组合
│   ├─ CanSeePlayer
│   └─ AttackPlayer
└─ Patrol
```

**Blackboard 模式** — 上下文传递：

```js
this.blackboard = { npc: this };
// 每帧 update 时：
this.blackboard.game = game;
this.bt.run({ blackboard: this.blackboard });
```

节点通过 `tick.blackboard.npc` / `tick.blackboard.game` 取上下文，避免全局变量，便于将来支持多个独立 BT 实例。

> 💡 **关于 tick**：BT 术语里的 "tick" 指一次从根到叶子的执行调用，**不是**固定时间步。本游戏的 tick 由游戏循环每帧触发一次。

### 3.4 碰撞检测 — AABB

```js
function rectIntersect(r1, r2) {
    return r1.x < r2.x + r2.w
        && r1.x + r1.w > r2.x
        && r1.y < r2.y + r2.h
        && r1.y + r1.h > r2.y;
}
```

- 所有可碰撞实体共享 `{x, y, w, h}` 形状约定
- 应用于：坦克 vs 墙、坦克 vs 坦克、子弹 vs 墙、子弹 vs 坦克
- **不做空间分区** — 实体数 < 100 时直接 O(n²) 完全够用；实体增多需引入四叉树/网格哈希

### 3.5 子弹分组与连线特效

```js
class Bullet {
    constructor(x, y, angle, speed, isNPC, groupId) {
        // ...
        this.groupId = groupId;  // 同一次射击的子弹共享 groupId
    }
}
```

- 玩家发射多发弹幕时，所有子弹 `groupId` 相同
- `drawBulletConnections()` 按 groupId 聚合，沿发射角度投影排序后画虚线
- 视觉效果：弹幕看起来像一束「激光武器」而非散弹

---

## 4. 类设计 / 代码组织

```
Game (控制器)
 ├─ state: FSM 状态
 ├─ keys: {} 键盘按下状态（按下为 true）
 ├─ player: Tank
 ├─ npcs: Tank[]
 ├─ bullets: Bullet[]
 ├─ walls: {x,y,w,h,hp}[]
 ├─ start()           初始化关卡 + 生成地图 + 撒 NPC
 ├─ generateMap()     按概率随机布墙（玩家起点保留空地）
 ├─ update()          推进一帧：输入 → AI → 子弹 → 碰撞 → 清理尸体
 └─ draw()            按 state 分支渲染

Tank (玩家 + NPC 共用)
 ├─ isNPC: boolean
 ├─ dir / speed / hp / cooldown
 ├─ bt: 行为树（仅 NPC）
 ├─ blackboard: BT 上下文
 ├─ move(game)        单步推进 + 碰撞响应
 ├─ shoot(count, id)  按 dir 生成子弹，维护冷却
 └─ draw()            车身/血条/炮管/履带

Bullet
 ├─ angle / dx / dy   速度向量（极坐标转笛卡尔）
 ├─ groupId           用于连线特效
 ├─ update(game)      移动 + 出界判定 + 撞墙减血
 └─ draw()            圆形 + shadowBlur 发光

BT 节点
 ├─ Node / Sequence / Selector
 └─ CanSeePlayer / AttackPlayer / Patrol
```

**为什么 Tank 类同时表示玩家和 NPC？**
- 共享渲染、移动、射击逻辑，避免重复
- 通过 `isNPC` 字段切换差异（BT、颜色、冷却来源）
- 当差异多到 5+ 处时考虑拆分为 `PlayerTank` / `NPCTank` 继承

**为什么 Wall 不做成类？**
- 只有数据 `{x, y, w, h, hp}`，无行为
- 用普通对象 + 直接字段访问最简洁
- 经验：**类用于"有行为的实体"，POJO 用于"纯数据"**

---

## 5. 组件化设计（DOM 层）

### 5.1 主布局

```
#container (flex row)
├─ #game-area
│   ├─ #hud           (HP / 敌机数 / 难度等级)
│   └─ canvas-wrapper
│       └─ <canvas>   (960 × 640)
└─ #config-panel      (290px 侧栏)
```

**响应式**：`@media (max-width: 1320px)` 下变 column 布局，配置面板降为水平排列。

### 5.2 配置面板的组件分解

| 子组件 | DOM 结构 | 状态绑定 |
|---|---|---|
| Mission Title | `.panel-title` | 静态 |
| Hostile Units | `.count-control` (− / input / +) | `config.npcCount` (1–30) |
| Threat Level | `.difficulty-btns` × 3 | `config.npcDifficulty` (beginner/intermediate/advanced) |
| Weapon System | `.difficulty-btns` × 3 | `config.playerDifficulty` |
| Engage 按钮 | `#btn-start` | 触发 `game.start()` |
| Game Stats | `#game-stats` stat-row × 4 | 装甲 / 敌机装甲 / 工事 / 敌机数 |
| Controls Help | `#controls-help` | 静态（i18n 切换文案） |

**配置组件的通用模式**：

```js
// 数量加减组件（input + ±button）
btnNpcMinus.addEventListener('click', () => {
    let v = parseInt(npcCountInput.value) || 10;
    v = Math.max(1, v - 1);
    npcCountInput.value = v;
    config.npcCount = v;              // 写状态
    statNpcCount.textContent = v;     // 同步显示
});

// 互斥选择组件（active class 切换）
document.querySelectorAll('#npc-difficulty-group button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#npc-difficulty-group button')
            .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.npcDifficulty = btn.dataset.level;
    });
});
```

**提取要点**：
- 数量类：input + 步进按钮，clamp 到合法范围
- 枚举类：button group + `active` 类 + `data-level` 属性
- 即时反馈：每次变更立刻写 `config` + 更新相关显示

### 5.3 HUD 组件

固定显示 4 项：`SYS / HP / HOSTILES / CLASS`，配合 `hud-dot` 心跳动画表示「游戏运行中」。值由 `update()` 每帧同步：

```js
hpEl.textContent = this.player.hp;
enemiesEl.textContent = this.npcs.length;
```

---

## 6. 交互设计

### 6.1 键位映射

| 操作 | 按键 | 备注 |
|---|---|---|
| 移动 | `↑↓←→` 或 `WASD` | 两套同时支持 |
| 开火 | `Space` | 按住连续发射（受冷却限制） |
| 开始 | `Enter` | MENU 状态触发 |
| 重玩 | `R` | GAMEOVER/WIN 状态触发 |

### 6.2 输入处理的关键设计

**键盘状态字典而非事件回调**：

```js
this.keys = {};
window.addEventListener('keydown', e => { this.keys[e.key] = true; });
window.addEventListener('keyup',   e => { this.keys[e.key] = false; });

// 在 update() 中查询：
if (this.keys['ArrowUp'] || this.keys['w']) { ... }
```

**优点**：
- 多键同时按下自然支持（移动 + 开火并行）
- 逻辑集中在 `update()` 里，时序清晰
- 避免事件驱动的状态混乱

**注意**：方向键和 Space 需 `preventDefault()` 防止页面滚动。

### 6.3 难度参数化

```js
const NPC_COOLDOWNS  = { beginner: 300, intermediate: 180, advanced: 60 };  // 帧
const PLAYER_BULLETS = { beginner: 1,   intermediate: 3,   advanced: 5 };   // 发
```

- 玩家武器与 NPC 难度**独立配置**，可组合出 9 种玩法
- 配置在 `start()` 时读取，整个一局内固定；改了需要重开才生效（清晰可预期）

### 6.4 NPC 出生算法

```js
while (this.npcs.length < npcCount && attempts < maxAttempts) {
    // 随机位置 + 检测：不压墙、不压玩家、不压其他 NPC、与玩家距离 > 80
}
```

- 拒绝采样（rejection sampling）：随机撒点 → 检测合法性 → 接受/重试
- `maxAttempts = npcCount * 120` 防止死循环
- 与玩家最小距离保证出生不立刻开打

---

## 7. 视觉设计要点

### 7.1 军事 HUD 美学

- **配色**：橄榄绿（#3a4f28）背景 + 琥珀黄（#d4a017）主色 + 战术绿（#2ecc40）NPC + 危险红（#cc3a2f）玩家
- **字体**：`Black Ops One`（标题）+ `Share Tech Mono`（数据）
- **发光**：所有关键元素配 `box-shadow` / `text-shadow` 同色 glow

### 7.2 CSS 变量主题化

```css
:root {
    --bg-deep: #0b1007;
    --olive: #3a4f28;
    --amber: #d4a017;
    --tactical-green: #2ecc40;
    /* ... */
}
```

TANK 是单主题（暗色）；`index.html` 用 `[data-theme="dark|light"]` + 变量切换实现亮/暗双主题。**新游戏建议从一开始就用变量+主题切换**，比事后改造容易。

### 7.3 质感叠层

- **扫描线**：`repeating-linear-gradient` 半透明黑线（每 4px 一条）
- **噪点**：内联 SVG `feTurbulence` 生成，`opacity: 0.03`
- **战术角标**：`::before / ::after` 画 18×18 的 L 形边角
- **Canvas glow**：`ctx.shadowColor + ctx.shadowBlur`，画完记得置零

### 7.4 入场动画

- `@keyframes containerEntry` — 容器淡入上滑
- `@keyframes panelSlide` — 配置面板右滑入场
- `@keyframes hudBlink` — HUD 状态点心跳
- 错峰：`animation-delay` 让面板比容器晚 0.15s

---

## 8. 国际化（i18n）

```js
const translations = {
    en: { panel_title: '⚙ Mission Config', ... },
    zh: { panel_title: '⚙ 任务配置',       ... }
};
const currentLang = localStorage.getItem('oma_games_lang') || 'zh';
const t = translations[currentLang];
```

**两层应用**：
1. **DOM 文本**：在 `DOMContentLoaded` 里遍历元素按 i18n key 替换 `textContent`
2. **Canvas 文本**：直接用 `t.mission_failed` 等读取

**全局 key 约定**（见 [AGENTS.md](../AGENTS.md)）：`oma_games_lang` / `oma_games_theme` 跨游戏共享。

> ⚠️ 当前 TANK 没接 `oma_games_theme`（只有暗色），新增亮色主题时需把所有颜色抽成变量。

---

## 9. 复用经验 — 设计下一个游戏时参考

### 决策树

```
新游戏要不要用 FSM？
 ├─ 状态 ≤ 4    → 字段 + if 分支（如 TANK）
 ├─ 状态 5–10   → 状态模式（每状态一个类）
 └─ 状态 > 10 / 嵌套 → 引入状态机库或层级 FSM

NPC AI 怎么选？
 ├─ 反射式（看到玩家就追）→ 直接 if/else
 ├─ 多优先级行为 → 行为树（如 TANK）
 └─ 长期目标 / 协作 → GOAP / HTN / Utility AI

渲染层怎么选？
 ├─ 网格/像素艺术 → Canvas 2D（如 TANK）
 ├─ 复杂 UI / 动画 → DOM + CSS
 └─ 3D / 大量精灵 → WebGL（Three.js / PixiJS）
```

### 通用模式（推荐直接复用）

1. **单文件架构** — Demo / 玩具级游戏直接单文件，省去构建工具复杂度
2. **键盘状态字典** — `keys = {}` 配合 `update()` 查询，处理多键并发最简
3. **AABB + POJO 数据** — 实体少于 100 时不需要空间分区
4. **配置即数据** — 难度/参数用 `{ beginner, intermediate, advanced }` 字典 + 互斥按钮组
5. **CSS 变量主题** — 从第一天就引入，比后期补主题容易 10 倍
6. **`oma_games_lang` / `oma_games_theme`** — 跨游戏共用 localStorage key，避免每个游戏各搞一套
7. **rAF 循环 + update/draw 分离** — 标准结构，便于插桩调试

### 何时跳出单文件

- JS 超过 2000 行 → 拆模块（ES module 或 bundle）
- 多人协作 → 拆文件 + lint + 构建管线
- 需要 npm 依赖（物理引擎、音效、UI 库）→ 引入构建工具
- **当前阶段：纯静态站点，单文件最优**

---

## 10. 已知限制 & 改进方向

| 问题 | 当前状态 | 改进建议 |
|---|---|---|
| 帧率敏感 | 速度以「像素/帧」计 | 改 `deltaTime`，或固定 timestep + 插值 |
| 标签页失焦暂停 | rAF 自动暂停 | 显式 `visibilitychange` 处理 pause |
| NPC AI 同步执行 | 所有 NPC 在同一帧 tick | 可错峰 / 多帧分摊（数量大时） |
| 无空间分区 | O(n²) 碰撞 | 实体 > 100 时引入网格哈希 |
| BT 无记忆 | 每帧从根重新评估 | 复杂行为需要时序记忆时引入 Running 状态 |
| 无音效 | 静默游戏 | `AudioContext` 程序化生成或 CDN 音效 |
| 无移动端触控 | 仅键盘 | 加虚拟摇杆 + 开火按钮 |

---

## 11. 文件参考速查

| 关注点 | 位置 |
|---|---|
| 游戏循环 | `tank.html:1442-1447` |
| FSM 状态分支 | `tank.html:1223-1234`（update）、`tank.html:1319-1390`（draw） |
| 行为树节点 | `tank.html:902-958` |
| NPC BT 装配 | `tank.html:1018-1024` |
| 碰撞函数 | `tank.html:889-891` |
| 子弹连线特效 | `tank.html:1289-1314` |
| 配置面板事件 | `tank.html:844-881` |
| i18n 字典 | `tank.html:674-745` |
| NPC 出生采样 | `tank.html:1182-1200` |
| 视觉变量定义 | `tank.html:11-29` |
