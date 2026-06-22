# 共享组件库 `shared/`

> 所有游戏的横切关注点（i18n / theme / input / loop / FSM / 难度常量）的统一实现。
> 每个游戏 HTML 仍然自包含其玩法、视觉、Canvas 逻辑；本库只提供基础设施。
>
> 文件：
> - [`shared/oma-games.js`](../shared/oma-games.js) — 工具函数 + 状态管理
> - [`shared/oma-games.css`](../shared/oma-games.css) — reset + theme tokens + UI 原子组件

---

## 1. 设计决策

### 为什么需要共享库

在 TANK 单文件实现中，i18n / theme / 键盘输入 / 游戏循环 / FSM 这些**横切关注点**都是内联代码。
做 6+ 个游戏时若全部内联，每个游戏会有约 200–400 行重复代码（累计 1200–2400 行）。
抽出来：

- ✅ DRY，bug 只需修一次
- ✅ 跨游戏 UX 一致（同样的难度切换器、键位提示、主题切换）
- ✅ 新游戏快速搭建（`<script src>` 一行接入）

### 为什么不做"单文件"了

TANK 时代的"单文件零依赖"约束在仓库只有 1 个游戏时合理；但 6+ 游戏时重复成本超过单文件带来的分发便利。
共享库仍然是：

- ✅ 零 npm 依赖
- ✅ 零构建工具
- ✅ 通过相对路径 `<script src="../shared/oma-games.js">` 引入
- ✅ Cloudflare Pages 直接分发，无需打包

### 不放什么进共享库

- ❌ 游戏特定玩法（坦克、贪吃蛇逻辑等）
- ❌ 视觉风格（每个游戏有自己的美学：军事 HUD、霓虹街机、复古终端…）
- ❌ 物理引擎、AI 算法（这些是游戏内的实现细节）

---

## 2. JS API

引入：
```html
<script src="../shared/oma-games.js"></script>
<script>
    const { i18n, theme, input, loop, fsm, DIFFICULTY, clamp, rectIntersect, randInt, pick } = OmaGames;
</script>
```

### `i18n` — 国际化

```js
// 1. 定义字典
const dict = {
    zh: { title: '坦克大战', play: '开始游戏' },
    en: { title: 'Tank Battle', play: 'Engage' }
};

// 2. 加载并应用到 DOM
i18n.load(dict);  // 自动读取 localStorage.omA_games_lang，应用到 [data-i18n] 元素

// 3. 在 JS 中使用
ctx.fillText(i18n.t('title'), x, y);

// 4. 切换语言（如 header 按钮）
btn.addEventListener('click', () => i18n.toggle());
```

**HTML 用法**：
```html
<span data-i18n="title">默认文本</span>
```

### `theme` — 主题切换

```js
theme.init();  // 自动读取 localStorage.omA_games_theme，应用到 <html data-theme="...">
theme.toggle();  // 切换
```

CSS 端用 `[data-theme='dark']` / `:root` 默认提供 token 切换。

### `input` — 键盘输入

```js
input.init();  // 一次即可，注册全局 keydown/keyup

// 在 update() 里查询
if (input.pressed('ArrowUp', 'w')) player.move('UP');
if (input.pressed(' ')) player.shoot();
```

`init()` 自动为方向键和空格 `preventDefault()`，避免页面滚动。窗口失焦时自动清空状态。

### `loop` — 游戏循环

**模式 A：每帧更新（适合动作游戏，如 TANK）**
```js
loop.start(
    (dt) => { game.update(dt); },   // update
    () => { game.draw(); }           // draw
);
```

**模式 B：固定 timestep（适合棋类 / 离散移动，如贪吃蛇）**
```js
loop.start(
    (dt) => { game.tick(); },
    () => { game.draw(); },
    { fixedStep: 100 }  // 每 100ms 推进一次逻辑，渲染每帧
);
```

### `fsm(states, initial)` — 状态机

```js
const states = {
    MENU:     { start: 'PLAYING' },
    PLAYING:  { lose: 'GAMEOVER', win: 'WIN' },
    GAMEOVER: { restart: 'PLAYING' },
    WIN:      { restart: 'PLAYING' }
};
const machine = fsm(states, 'MENU');

machine.transition('start');  // → 'PLAYING'
machine.is('PLAYING');         // → true
machine.transition('lose');   // → 'GAMEOVER'
```

### `DIFFICULTY` — 难度常量

```js
DIFFICULTY.LEVELS;  // ['beginner', 'intermediate', 'advanced']
DIFFICULTY.label('beginner');  // → '初级' 或 'Beginner'（按当前语言）
```

### 工具函数

| 函数 | 说明 |
|---|---|
| `clamp(v, min, max)` | 限幅 |
| `rectIntersect(a, b)` | AABB 碰撞检测，参数为 `{x, y, w, h}` |
| `randInt(min, max)` | 含端点的随机整数 |
| `pick(arr)` | 数组随机取一个 |

### `ui.header(opts)` — 统一游戏顶栏

一键插入固定顶栏：`[◄ oma-games]    [中/EN] [◐]`，自动 wire 好语言 / 主题切换。

```js
OmaGames.ui.header();
// 或带选项
OmaGames.ui.header({
    back: '/',                // 返回链接，默认 '/'
    mount: document.body,     // 挂载点，默认 body
    backText: 'oma-games',    // 返回按钮文案
    langLabel: '中/EN',
    themeIcon: '◐'
});
```

CSS 端用 `currentColor` 继承 + CSS 变量主题化，让每个游戏保留自己的视觉个性：

```css
:root {
    --oma-header-bg: rgba(0, 20, 0, 0.6);     /* 半透明背景 */
    --oma-header-fg: currentColor;            /* 默认继承 body color */
    --oma-header-border: var(--phosphor-dim); /* 边框色 */
    --oma-header-hover-bg: var(--phosphor);   /* hover 时背景 */
    --oma-header-hover-fg: var(--crt-bg);     /* hover 时文字 */
    --oma-header-glow: rgba(0, 255, 65, 0.3); /* hover 辉光 */
}
.oma-game-header { font-family: 'Share Tech Mono', monospace; }
```

**设计原则**：header 的颜色默认继承 body 的 `color`，所以 phosphor-green 的 Space Invaders 自然得到绿色顶栏，黑白 Pong 自然得到白色顶栏。游戏只需覆盖背景与 hover 色来匹配自己的色板。

---

## 3. CSS 设计

### Theme tokens

提供一组 CSS 变量，每个游戏可直接用：

```css
background: var(--bg-primary);
color: var(--text-primary);
border: 1px solid var(--border);
```

游戏可覆盖 token 来塑造独特氛围（如 TANK 的橄榄绿+琥珀黄）：
```css
:root {
    --bg-primary: #0b1007;  /* 覆盖为深橄榄 */
    --accent: #d4a017;      /* 覆盖为琥珀 */
}
```

### UI 原子组件

预制的几个小工具，避免每个游戏都重写：

| 类名 | 用途 |
|---|---|
| `.oma-container` | 内容居中容器 |
| `.oma-diff-group` + `.oma-diff-btn` | 难度三档按钮组（互斥选择，配 `.active`） |
| `.oma-count` + `.oma-count-btn` + `.oma-count-input` | 数量步进器（− input +） |
| `.oma-panel` + `.oma-panel-title` + `.oma-field` | 配置面板骨架 |
| `.oma-label` + `.oma-hint` | 表单标签与提示 |
| `.oma-btn-primary` | 主操作按钮 |
| `.oma-key` | 键盘按键样式（控制说明里用） |
| `.oma-header` + `.oma-logo` + `.oma-icon-btn` | 顶栏（含 logo + 主题/语言切换按钮位） |

### 不提供什么

- ❌ Hero section / 复杂布局（每个游戏自己定）
- ❌ 配色方案（默认中性，游戏覆盖）
- ❌ 字体（除非需要等宽字体提示）

---

## 4. 新游戏的脚手架模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GAME NAME</title>
    <link rel="stylesheet" href="../shared/oma-games.css">
    <style>
        /* 游戏专属样式 — 覆盖 tokens 来定义视觉身份 */
        :root {
            --bg-primary: #0a0e1a;
            --accent: #00ff9f;
            /* ... */
        }
        /* 游戏专属布局、Canvas、动画 */
    </style>
</head>
<body>
    <header class="oma-header">
        <a href="../index.html" class="oma-logo">← oma-games</a>
        <div class="oma-header-controls">
            <button class="oma-icon-btn" id="lang-btn">中/EN</button>
            <button class="oma-icon-btn" id="theme-btn">◐</button>
        </div>
    </header>

    <main>
        <!-- 游戏区 + 配置面板 -->
    </main>

    <script src="../shared/oma-games.js"></script>
    <script>
        const { i18n, theme, input, loop, fsm, DIFFICULTY } = OmaGames;

        i18n.load({
            zh: { /* ... */ },
            en: { /* ... */ }
        });
        theme.init();
        input.init();

        // 游戏代码...
    </script>
</body>
</html>
```

---

## 5. 跨游戏 UX 一致性约定

所有新游戏必须实现：

1. **顶栏**：调用 `OmaGames.ui.header()` — 自动渲染 `[◄ oma-games] [中/EN] [◐]` 并 wire 好切换逻辑（旧版手动写 `.oma-header` 的方式已弃用，仅 TANK 因历史原因保留手写实现）
2. **难度三档**：beginner / intermediate / advanced（用 `.oma-diff-group`）
3. **配置面板**：右侧或顶部（用 `.oma-panel`）
4. **键位说明**：在配置面板内可见（用 `.oma-key`）
5. **i18n 全覆盖**：所有可见文案都有 `data-i18n` 属性
6. **暗色默认**：读 `localStorage.omA_games_theme`

---

## 6. 已知限制 / 未来扩展

- **无 ES module** — 用全局 `window.OmaGames`，因为 `file://` 协议下 ES module 受 CORS 限制
- **无 TypeScript** — 保持纯 JS，避免构建步骤
- **未来若需要**：可拆分为多个文件（`oma-i18n.js` / `oma-input.js` 等）按需引入
