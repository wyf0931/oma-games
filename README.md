# OMA GAMES

**An arcade game collection reborn in modern web aesthetics.** 11 classic titles rebuilt as single-file HTML5 games — no install, no ads, no login. Browser open and play.

[![Live](https://img.shields.io/badge/live-games.ohmyagent.ai-00f0ff?style=flat-square)](https://games.ohmyagent.ai/)
[![Games](https://img.shields.io/badge/games-11-ff2bd1?style=flat-square)](#-game-list)
[![License](https://img.shields.io/badge/license-MIT-a78bfa?style=flat-square)](LICENSE)

🌐 **多语言**: [English](README.md) · [简体中文](README.zh-CN.md)

🚀 **Play now**: <https://games.ohmyagent.ai>

---

## 🎮 Game List

All 11 games are live. Each is a self-contained HTML file — zero dependencies, zero build step.

| # | Title | Difficulty | Core Tech | Play |
|---|---|---|---|---|
| 1 | **TANK COMMAND** | ★★★ | Behavior Tree + AABB collision + FSM | [▶](https://games.ohmyagent.ai/tank) |
| 2 | **SPACE INVADERS** | ★ | Matrix formation movement | [▶](https://games.ohmyagent.ai/space-invaders) |
| 3 | **PONG** | ★ | AI Lerp tracking + angle reflection | [▶](https://games.ohmyagent.ai/pong) |
| 4 | **T-REX RUN** | ★ | Infinite scroll + lenient hitbox | [▶](https://games.ohmyagent.ai/dino) |
| 5 | **SNAKE** | ★★ | Linked-list queue + fixed timestep | [▶](https://games.ohmyagent.ai/snake) |
| 6 | **MINESWEEPER** | ★★ | Flood Fill (BFS) + cell state machine | [▶](https://games.ohmyagent.ai/minesweeper) |
| 7 | **TOWER CLIMB** | ★★ | Camera follow + procedural platforms + gravity | [▶](https://games.ohmyagent.ai/tower-climb) |
| 8 | **BREAKOUT** | ★★★ | Vector reflection + 5 power-ups + particles | [▶](https://games.ohmyagent.ai/breakout) |
| 9 | **2048** | ★★★ | 2D array slide-merge + tile transitions | [▶](https://games.ohmyagent.ai/2048) |
| 10 | **GOLD MINER** | ★★★ | Pendulum physics + 6 item types + levels | [▶](https://games.ohmyagent.ai/gold-miner) |
| 11 | **GOMOKU** | ★★★ | 8-direction win detection + eval-function AI | [▶](https://games.ohmyagent.ai/gomoku) |

**Coming next**: TETRIS (★★★★) — SRS rotation matrix + 7-bag randomizer

## 🛠 Tech Stack

- **Pure HTML5 + CSS3 + ES6+ JavaScript** — no framework, no build tool
- **Canvas 2D** for game worlds, **DOM** for UI
- **Shared component library** ([`shared/`](shared/)) for i18n / theme / input / game loop / FSM
- **Cloudflare Pages** deployment — zero backend
- **Google Fonts** for typography (Audiowide, Orbitron, Rajdhani, etc.)

### Core algorithms in use

- **Game loop** — `requestAnimationFrame` + update/draw separation
- **Finite State Machine (FSM)** — MENU / PLAYING / GAMEOVER / WIN state transitions
- **Behavior Tree** — `Selector / Sequence` + condition/action nodes for NPC AI
- **AABB collision** — axis-aligned bounding boxes + rejection sampling
- **Flood Fill** — iterative BFS for Minesweeper
- **Minimax + alpha-beta pruning** — Gomoku AI
- **Pendulum physics** — Gold Miner hook
- **Vector reflection** — Pong + Breakout

## 🔧 Development Tools & Method

| Tool | Role |
|---|---|
| [**Claude Code**](https://claude.com/claude-code) | AI coding agent — implements games from natural-language specs |
| [**GLM 5.2**](https://chatglm.cn) | Reasoning model behind Claude Code in this project |
| [**Chrome DevTools MCP**](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Browser automation for testing |
| [**Cloudflare Wrangler**](https://developers.cloudflare.com/workers/wrangler/) | Deploy to Cloudflare Pages |

**Method**: **Vibe Coding** — natural-language-driven development. Human directs with intent and aesthetic choices; AI implements the code. The repo is the artifact of this collaboration: 11 games shipped in ~2 days with no manual line-by-line coding.

If you're curious about the workflow, every commit message in [`git log`](https://github.com/wyf0931/oma-games/commits/main) shows what AI was instructed vs. what it produced.

## 📁 Project Structure

```
oma-games/
├── index.html              Homepage (arcade-style game center)
├── tank.html               TANK (single-file era)
├── <game>.html             Each game in its own file
├── shared/
│   ├── oma-games.js        Shared library: i18n / theme / input / loop / fsm / ui.header()
│   └── oma-games.css       Reset + theme tokens + UI primitives
├── screenshots/            Game thumbnails (used by homepage + SEO)
├── docs/
│   ├── tank.md             TANK development case study
│   ├── component-library.md  Shared library API docs
│   └── roadmap.md          Game design specs (all 12 titles)
├── llms.txt                Site summary for LLMs (https://llmstxt.org)
├── robots.txt              Crawler directives
├── sitemap.xml             SEO sitemap
├── AGENTS.md               Collaboration guide for AI agents
└── README.md               This file (English)
```

## 📚 Documentation

- [`docs/tank.md`](docs/tank.md) — How TANK is built: FSM / behavior tree / AABB / i18n
- [`docs/component-library.md`](docs/component-library.md) — `OmaGames.*` shared library API
- [`docs/roadmap.md`](docs/roadmap.md) — Design specs for all 12 games
- [`AGENTS.md`](AGENTS.md) — Conventions for AI agents working on this repo
- [`llms.txt`](llms.txt) — Concise summary for LLM crawlers

## 🎨 Features

- **🌗 Dark / light theme** — remembers your preference
- **🌐 Chinese / English** — full i18n with `localStorage` persistence
- **🎯 Per-game difficulty** — beginner / intermediate / advanced
- **📱 PC-first layout** — keyboard + mouse, responsive on tablet
- **🚫 No ads, no tracking, no login** — pure gaming

## 🚀 Deployment

Deployed on **Cloudflare Pages** at <https://games.ohmyagent.ai>.

To deploy your own fork:

```bash
# Clone
git clone https://github.com/wyf0931/oma-games.git
cd oma-games

# Option A: Connect the repo to Cloudflare Pages dashboard
# Option B: Deploy via Wrangler CLI
npx wrangler pages deploy . --project-name=oma-games
```

No environment variables. No build commands. Just push static files.

## 🤝 Contributing

This is a Vibe Coding showcase — contributions welcome! Two ways to help:

1. **Play & report bugs** — open an [issue](https://github.com/wyf0931/oma-games/issues)
2. **Implement the next game** — claim an open issue (e.g. TETRIS #11) and ship it following the patterns in `docs/`

## 📄 License

MIT — see [LICENSE](LICENSE).

## 🙏 Credits

- **Game designs** — Inspired by arcade classics (Atari, Namco, Taito, Nintendo, etc.)
- **Dev stack** — Claude Code, GLM, Cloudflare, Google Fonts
- **Vibe Coding** — The methodology that made this possible

---

<p align="center">Built with <a href="https://claude.com/claude-code">Claude Code</a> + <strong>Vibe Coding</strong></p>
