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