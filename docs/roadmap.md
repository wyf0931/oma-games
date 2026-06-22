# 游戏开发路线图

> 后续计划实现的游戏清单，每项列出技术亮点、推荐引擎与实现要点。
> 实现时优先复用 [`docs/tank.md`](./tank.md) 沉淀的模式（FSM、Canvas、i18n、单文件架构等）。

---

## 进行中 / 待实现

| # | 游戏 | 难度 | 推荐引擎 | 核心算法 |
|---|---|---|---|---|
| 1 | [太空侵略者 Space Invaders](#1-太空侵略者-space-invaders) | ⭐ | Canvas 2D | 矩阵阵列移动 + 难度递增 |
| 2 | [双人乒乓球 Pong](#2-双人乒乓球-pong) | ⭐ | Canvas 2D | AI Y 轴追踪 + 角度反射 |
| 3 | [Chrome 小恐龙 T-Rex Run](#3-chrome-小恐龙-t-rex-run) | ⭐ | Canvas 2D | 无限地形拼接 + 宽松碰撞箱 |
| 4 | [贪吃蛇 Snake](#4-贪吃蛇-snake) | ⭐⭐ | Canvas 2D | 链表队列 + 拒绝采样 |
| 5 | [扫雷 Minesweeper](#5-扫雷-minesweeper) | ⭐⭐ | DOM grid / Canvas | Flood Fill + 格子状态机 |
| 6 | [是男人就下100层 Tower Climb](#6-是男人就下100层-tower-climb) | ⭐⭐ | Canvas 2D | 视差滚动 + 平台生成 + 重力 |
| 7 | [打砖块 Breakout](#7-打砖块-breakout) | ⭐⭐⭐ | Canvas 2D | 向量反射 + 道具系统 |
| 8 | [2048](#8-2048) | ⭐⭐⭐ | DOM Grid / Canvas | 滑动合并 + 过渡动画 |
| 9 | [黄金矿工 Gold Miner](#9-黄金矿工-gold-miner) | ⭐⭐⭐ | Canvas 2D | 摆锤物理 + 蓄力机制 |
| 10 | [五子棋 Gomoku](#10-五子棋-gomoku) | ⭐⭐⭐ | Canvas 2D | 8 方向计数 + 估值函数 AI |
| 11 | [俄罗斯方块 Tetris](#11-俄罗斯方块-tetris) | ⭐⭐⭐⭐ | Canvas 2D | SRS 旋转 + 消行 + 7-bag |

---

## 1. 太空侵略者 Space Invaders

**目标**：经典 1978 玩法，敌方阵列整体移动 + 玩家底部射击。

### 技术亮点

- **敌方矩阵移动**
  - 整个阵列作为一组：每帧整体左右移动
  - 触碰边界 → 全体下移一格 + 反向水平速度
  - 阵列消灭越多 → 移速越快（剩余少时极快）

- **子弹时间差**
  - 玩家：单发，发射后冷却（避免无脑扫射）
  - 敌方：随机敌方按节奏发射（每 N 帧选一个底部敌人开火）

- **难度随分数递增**
  - 移速 = 基础速度 × (1 + (初始数量 - 当前数量) / 初始数量 × 加速因子)

### 关键设计

```
数据：
  enemies: [{x, y, alive}] 矩阵排列（如 5 行 × 11 列）
  bullets: [{x, y, dy, isPlayer}]
  dir: 'LEFT' | 'RIGHT'  阵列方向

循环（每帧）：
  - 阵列按 dir 整体移动速度 ×1
  - 任一列触碰边界 → 全阵列 y += step，dir 反向
  - 随机底部敌人射击（按节奏 + 概率）
  - 子弹移动 + 碰撞检测
```

### 与 TANK 的关系

- 渲染 / 输入 / BT 完全可复用 TANK 的架构
- 主要新增：**阵列整体移动**（vs TANK 的单兵自由移动）
- 适合作为**入门练手项目**（结构与 TANK 高度相似，但更简单）

---

## 2. 双人乒乓球 Pong

**目标**：双人或人机对战，左右球拍 + 一个球。

### 技术亮点

- **AI 追踪 Y 轴**
  - AI 球拍目标 Y = 球的 Y（用 Lerp 平滑跟随，避免完美防守）
  - 加上限速（追不上高速球）让 AI 有破绽

- **角度反射公式**
  - 球碰球拍时：vy = (ball.y - paddle.center) × 比例系数
  - 中央命中 → vy 接近 0（平射）
  - 边缘命中 → vy 最大（陡射）
  - 物理直觉：把球拍看成凸面，落点决定反射角

### 关键设计

```
数据：
  paddles = { left: {y}, right: {y} }
  ball = { x, y, vx, vy }

每帧：
  - 球移动 + 碰上下墙（vy 反向）
  - 球碰左/右拍：vx 反向，vy = (ball.y - paddle.centerY) × k
  - 球出左/右边界：对方得分，重置球到中央

输入：
  - 玩家 1（左）：W / S
  - 玩家 2（右）：↑ / ↓（或 AI 模式）
```

---

## 3. Chrome 小恐龙 T-Rex Run

**目标**：经典离线小恐龙，跳跃避障，距离递增得分。

### 技术亮点

- **无限跑酷地形拼接**
  - 障碍物数组：仙人掌 / 鸟
  - 离开屏幕左侧 → 从数组移除
  - 按节奏（或随机间隔）从右侧生成新障碍
  - 可选：地面用 repeating pattern 滚动

- **宽松碰撞箱（手感优化）**
  - 视觉碰撞箱：完整恐龙矩形
  - 逻辑碰撞箱：缩小 10-20%（让玩家"差点撞到"也算过）
  - 行业术语：**Coyote Time / Input Buffering** 可考虑（跳起后短时间内仍可跳）

### 关键设计

```
数据：
  dino = { y, vy, isJumping }
  obstacles = [{x, y, w, h, type}]
  speed = 起始速度，随时间递增

每帧：
  - dino 物理：重力 + 跳跃冲量
  - 障碍左移 speed
  - 碰撞检测（缩小判定箱）
  - 生成新障碍（基于上一个障碍的 x + 最小间距 + 随机）
```

**实现极简**，代码量可能 < 300 行，适合作为 Canvas 入门项目。

---

## 4. 贪吃蛇 Snake

**目标**：经典贪吃蛇，棋盘大小与速度可配置。

### 技术亮点

- **链表队列移动**
  - 蛇身用数组，`head` 在前 `tail` 在后
  - 每步：`unshift(newHead)` 推入新头；未吃食物则 `pop()` 删尾
  - JS 数组天然支持双端操作

- **食物不重叠算法**
  - 方案 A：拒绝采样（随机一个格子，撞蛇身就重试）
  - 方案 B：维护空格集合，随机选一个并删除（长蛇更稳）

### 关键设计

```
游戏循环：固定 tick（不同于 TANK 的每帧）
  - 每 N 帧推进一次蛇，N 由难度决定
  - 渲染仍然每帧 rAF（平滑）
  - frameCounter % N === 0 判断是否到 tick

数据：
  snake = [{x, y}, ...]   // head = snake[0]
  food = {x, y}
  dir, nextDir             // 缓存下一方向，避免连按反向死亡

碰撞：
  - 撞墙 / 撞自己（head vs snake[1..]）
```

### FSM

```
MENU → PLAYING ⇄ PAUSED (P/ESC)
              ↓
           GAMEOVER
```

### 难度参数化

```js
const TICK_INTERVALS = { beginner: 10, intermediate: 6, advanced: 4 };
const BOARD_SIZES    = { small: 15, medium: 20, large: 25 };
```

---

## 5. 扫雷 Minesweeper

**目标**：经典 Windows 扫雷，难度可选（初级 9×9/10 雷，中级 16×16/40 雷，高级 16×30/99 雷）。

### 技术亮点

- **Flood Fill 泛洪填充**
  - 点击 0 邻雷格子时，BFS/DFS 递归揭开所有连通的 0 格子 + 边界数字格
  - 用栈（DFS）或队列（BFS）避免递归爆栈
  - 起点为点击位置，向 8 邻域扩散

- **格子状态机**

  ```
  hidden ──[左键]──► revealed
     │
     ├──[右键]──► flagged ──[右键]──► question ──[右键]──► hidden
     │
     └──[首次左键] 保证不踩雷（雷分布延迟到首次点击后）
  ```

### 关键设计

```
数据：
  cells[r][c] = { mine: bool, adj: 0-8, state: 'hidden'|'revealed'|'flagged'|'question' }

雷的生成（首次点击安全）：
  1. 初始化空棋盘
  2. 玩家第一次点击时，记录该格 + 8 邻域
  3. 排除这些格子后随机撒 N 个雷
  4. 计算每个非雷格的 adj

胜负：
  - LOST：踩到雷
  - WIN：所有非雷格都被 revealed
```

### 渲染选择

- **DOM grid（推荐）** — 每格是 `<button>`，天然支持键盘/鼠标/ARIA；状态用 CSS class
- **Canvas** — 性能好但需手写交互；格子数不大，DOM 更合适

| 难度 | 尺寸 | 雷数 |
|---|---|---|
| 初级 | 9 × 9 | 10 |
| 中级 | 16 × 16 | 40 |
| 高级 | 30 × 16 | 99 |

---

## 6. 是男人就下100层 Tower Climb

**目标**：角色从顶部下落，穿越随机生成的平台层，避免被屏幕顶部追上。

### 技术亮点

- **视差滚动背景**
  - 多层背景以不同速度滚动（远慢、近快）
  - 制造深度感

- **平台随机生成**
  - 每行平台宽度 / 缺口位置随机
  - 难度递增：缺口变大、移动平台、尖刺陷阱

- **重力加速度**
  - `vy += g × dt` 每帧累加
  - 下落越久越快，但平台命中时归零

### 关键设计

```
数据：
  player = { x, y, vy }
  platforms = [{x, y, w, type}]  // type: normal/spike/moving
  camera_y                    // 摄像机跟随玩家下落

每帧：
  - player.vy += g
  - player.y += vy
  - 碰平台：vy = 0，站在平台上随平台移动
  - 摄像机跟随：camera_y 平滑跟随 player.y
  - 顶部死亡线：camera_y 上方有红线，碰到即 GAMEOVER
  - 新平台生成：随摄像机下移动态生成
```

---

## 7. 打砖块 Breakout

**目标**：经典 Breakout，球 + 球拍 + 砖块阵列。

### 技术亮点

- **向量反射物理**
  - 球速度向量 `(vx, vy)`
  - 碰墙：直接取反一个分量
  - 碰砖块：判断撞击面（上下 vs 左右），对应分量取反
  - 碰球拍：vy 取反 + 根据 hit position 调整 vx

- **道具系统**（可扩展）
  - 加宽球拍 / 粘性球（粘住再发射）/ 多球 / 激光 / 加速

### 关于引擎

用户原推荐 Phaser 3（内置 Arcade Physics），但本仓库约定**零依赖**。
推荐**原生 Canvas 实现**：物理足够简单，手写反射比引入 Phaser 更轻量。

### 关键设计

```
数据：
  paddle = { x, y, w, h }
  ball = { x, y, vx, vy, r }
  bricks = [{x, y, w, h, hp, alive}]

每帧：
  - paddle 跟随鼠标 / 方向键
  - ball 移动 + 反射
  - 碰砖块：砖块 hp--，对应方向反射
  - 球落底：丢一条命 / GAMEOVER
```

---

## 8. 2048

**目标**：经典 2048，4×4 网格滑动合并。

### 技术亮点

- **二维数组滑动合并算法**
  - 对一行：先压缩（去零）→ 相邻相同合并（得分+）→ 再补零
  - 4 个方向复用：左转置 → 用同一函数处理 → 转回
  - **算法经典**，理解后可一通百通

- **滑块动画过渡**
  - tile 移动到目标位置的过渡动画
  - 合并时的放大 / 颜色脉冲
  - 新生成的 tile 淡入

### 渲染选择

- **纯 DOM + CSS Grid（推荐）** — 动画用 CSS transition 最自然
- **Canvas** — 性能更好但动画手写复杂

### 关键设计

```
数据：
  grid[4][4]   // 0=空，其他=2^n

合并函数（处理单行向左）：
  function slideLeft(row) {
      let filtered = row.filter(v => v !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
          if (filtered[i] === filtered[i+1]) {
              filtered[i] *= 2;
              filtered[i+1] = 0;
              score += filtered[i];
          }
      }
      let result = filtered.filter(v => v !== 0);
      while (result.length < 4) result.push(0);
      return result;
  }

方向复用：
  - 向左：直接用 slideLeft
  - 向右：reverse → slideLeft → reverse
  - 向上：transpose → slideLeft → transpose
  - 向下：transpose → reverse → slideLeft → reverse → transpose

胜负：
  - WIN：出现 2048（可继续玩）
  - GAMEOVER：无空格且无可合并相邻对
```

### FSM

```
MENU → PLAYING → WIN (可选继续) / GAMEOVER
```

---

## 9. 黄金矿工 Gold Miner

**目标**：经典黄金矿工，钩爪摆动 + 抓取目标。

### 技术亮点

- **摆锤物理（绳子力学）**
  - 钩爪从顶部固定点摆动，单摆运动
  - 简化模型：`θ = θ_max × sin(ω × t)`
  - 真实物理：`d²θ/dt² = -(g/L) × sin(θ)`

- **抓取判定**
  - 钩爪发射后做直线运动
  - 碰到目标即触发抓取动画 + 拉回
  - 不同目标不同重量（金块大但慢，钻石小但快）

- **力量条蓄力机制**
  - 按住空格 → 力量条上升
  - 松开 → 按当前力量发射
  - 力量决定钩爪速度

### 关键设计

```
状态：
  HOOK_STATES: SWINGING | LAUNCHING | RETRACTING | CAUGHT

  swinging: θ = θ_max × sin(ω × t)
  launching: 钩爪按发射方向直线运动
  retracting: 拉回到固定点（速度受抓取物影响）
  caught: 抓到东西 → 计分 → 回 SWINGING

目标：
  items = [{x, y, r, weight, value, type}]
```

---

## 10. 五子棋 Gomoku

**目标**：15×15 棋盘，玩家黑子 vs 电脑白子（或双人）。

### 技术亮点

- **胜负判定 — 8 方向连续计数**
  - 实际是 4 对方向：水平 / 垂直 / 主对角线 / 副对角线
  - 落子后从该点沿 4 个方向各向两侧延伸数同色棋子，正反之和 +1 ≥ 5 即胜

- **估值函数 AI**
  - 评估每个空位的"价值"：扫描假想落子后形成的棋型
  - 棋型：连五 / 活四 / 冲四 / 活三 / 眠三 / 活二 ...
  - 简单：greedy 选最高分
  - 进阶：minimax + alpha-beta 剪枝（深度 2–4）

### 棋型估分参考

| 棋型 | 进攻分 | 防守分 |
|---|---|---|
| 连五 (XXXXX) | 100000 | — |
| 活四 (_XXXX_) | 10000 | 9000 |
| 冲四 (OXXXX_) | 1000 | 900 |
| 活三 (_XXX_) | 500 | 450 |
| 眠三 (OXXX_) | 100 | 90 |
| 活二 (_XX_) | 50 | 45 |

### 推荐实现

```
FSM: MENU → PLAYING → GAMEOVER
渲染: Canvas — 画线 + 圆形棋子（黑/白），hover 预览半透明子
交互: 鼠标点击落子；R 重开；ESC 回菜单
AI: 单线程同步计算（225 空位，深度 2 足够）
```

---

## 11. 俄罗斯方块 Tetris

**目标**：经典 Tetris，7 种 tetromino，消行得分，硬降软降。

### 技术亮点

- **7 种方块（七连方块）— SRS 旋转矩阵**
  - I, O, T, S, Z, J, L 七种形状
  - 每种方块 4 个旋转状态（O 型 1 个，I 型 2 个独立）
  - **SRS（Super Rotation System）** — 现代标准，定义旋转时的踢墙偏移

- **消行判定**
  - 方块落定后扫描所有行，满则消除
  - 上方行整体下移
  - 计分：1/2/3/4 行 = 100/300/500/800（经典）

- **硬降 / 软降**
  - 软降：↓ 加速下落
  - 硬降：Space 立刻落到底

### 关键设计

```
数据：
  board[20][10]   // 0=空，其他=颜色 ID
  current = { shape, x, y, rotation }
  bag = []        // 7-bag 队列

游戏循环：
  - 固定 tick 重力下降（速度随等级提升）
  - 软降按住时 tick 加速
  - 硬降：瞬移到底 + lock

7-bag 随机：
  - 7 种方块装入 bag，每次取出一个
  - bag 空了再洗一副新的
  - 比纯随机更公平

踢墙（wall kick）：
  - 旋转时若新位置被墙或已占格挡住
  - SRS 定义 5 个偏移位置依次尝试
  - 简化版：尝试左移/右移 1-2 格
```

### FSM

```
MENU → PLAYING ⇄ PAUSED
              ↓
           GAMEOVER (堆顶)
```

---

## 实现顺序建议

按"难度递进 + 模式复用"排序，前一个游戏的经验能直接用到下一个：

| 顺序 | 游戏 | 难度 | 学到的新东西 |
|---|---|---|---|
| 1 | **太空侵略者** | ⭐ | 入门：阵列移动 + 难度递增（与 TANK 最像） |
| 2 | **Pong** | ⭐ | 向量物理 + AI 追踪 |
| 3 | **Chrome 小恐龙** | ⭐ | 无限滚动 + 手感优化（碰撞箱） |
| 4 | **贪吃蛇** | ⭐⭐ | 固定 tick 节奏 + 链表队列 |
| 5 | **扫雷** | ⭐⭐ | DOM grid 模式 + Flood Fill |
| 6 | **是男人就下100层** | ⭐⭐ | 摄像机跟随 + 视差滚动 + 重力 |
| 7 | **打砖块** | ⭐⭐⭐ | 完整向量反射 + 道具 |
| 8 | **2048** | ⭐⭐⭐ | 经典滑动合并算法 + CSS 动画 |
| 9 | **黄金矿工** | ⭐⭐⭐ | 摆锤物理 + 蓄力机制 |
| 10 | **五子棋** | ⭐⭐⭐ | AI 估值函数 + minimax |
| 11 | **俄罗斯方块** | ⭐⭐⭐⭐ | SRS + 消行 + 7-bag 综合考验 |

每完成一个，回头补充对应 `docs/<game>.md`，逐步沉淀玩法分类的设计经验。

---

## 共性约定（所有新游戏必须遵守）

参考 [`AGENTS.md`](../AGENTS.md)：

- **单文件架构** — `<game>.html` 自包含
- **i18n** — 默认中文，支持 zh/en，读 `localStorage.omA_games_lang`
- **主题** — 默认暗色，读 `localStorage.omA_games_theme`（如适用）
- **入口** — 在 `index.html` 添加游戏卡片，复用 carousel 缩略图模式
- **零依赖** — 不引入 npm 包（如需库先讨论；用户原推荐的 Phaser 等暂不引入）
- **配置面板** — 难度三档（beginner/intermediate/advanced），按钮组 + `data-level` 模式
- **键位说明** — 在游戏内或配置面板可见
- **响应式** — 至少支持 desktop + tablet
