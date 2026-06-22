/**
 * oma-games — Shared utilities for all games in this repo.
 *
 * Usage:
 *   <script src="../shared/oma-games.js"></script>
 *   const { i18n, theme, input, loop, fsm, DIFFICULTY } = OmaGames;
 *
 * Design goals:
 *   - Zero dependencies, zero build step
 *   - Each game stays self-contained for its specific logic/visuals
 *   - This file only provides cross-cutting concerns
 *
 * See docs/component-library.md for API details.
 */
(function () {
    'use strict';

    // ===== i18n =====
    const i18n = {
        current: localStorage.getItem('oma_games_lang') || 'zh',
        dict: {
            zh: { back_to_games: '返回游戏中心', toggle_lang: '切换语言', toggle_theme: '切换主题' },
            en: { back_to_games: 'Back to games', toggle_lang: 'Toggle language', toggle_theme: 'Toggle theme' }
        },

        load(dict) {
            // Merge user dict with built-in defaults (user wins)
            this.dict = {
                zh: Object.assign({}, this.dict.zh, (dict && dict.zh) || {}),
                en: Object.assign({}, this.dict.en, (dict && dict.en) || {})
            };
            this.apply();
        },

        apply() {
            const t = this.dict[this.current] || {};
            document.querySelectorAll('[data-i18n]').forEach((el) => {
                const key = el.getAttribute('data-i18n');
                if (t[key] !== undefined) el.textContent = t[key];
            });
            document.querySelectorAll('[data-i18n-html]').forEach((el) => {
                const key = el.getAttribute('data-i18n-html');
                if (t[key] !== undefined) el.innerHTML = t[key];
            });
            document.documentElement.lang = this.current;
        },

        t(key) {
            return (this.dict[this.current] || {})[key] !== undefined
                ? this.dict[this.current][key]
                : key;
        },

        setLang(lang) {
            this.current = lang;
            localStorage.setItem('oma_games_lang', lang);
            this.apply();
        },

        toggle() {
            this.setLang(this.current === 'zh' ? 'en' : 'zh');
        }
    };

    // ===== Theme =====
    const theme = {
        current: localStorage.getItem('oma_games_theme') || 'dark',

        init() {
            this.apply();
        },

        apply() {
            document.documentElement.setAttribute('data-theme', this.current);
        },

        set(t) {
            this.current = t;
            localStorage.setItem('oma_games_theme', t);
            this.apply();
        },

        toggle() {
            this.set(this.current === 'dark' ? 'light' : 'dark');
        }
    };

    // ===== Input (keyboard state dictionary) =====
    const input = {
        keys: {},
        _initialized: false,

        init(opts = {}) {
            if (this._initialized) return;
            this._initialized = true;

            const preventKeys = opts.preventKeys || [
                'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '
            ];

            window.addEventListener('keydown', (e) => {
                this.keys[e.key] = true;
                if (preventKeys.includes(e.key)) e.preventDefault();
            });
            window.addEventListener('keyup', (e) => {
                this.keys[e.key] = false;
            });
            window.addEventListener('blur', () => {
                this.keys = {};
            });
        },

        pressed(...keys) {
            return keys.some((k) => this.keys[k]);
        },

        any(...keys) {
            return keys.some((k) => this.keys[k]);
        }
    };

    // ===== Game Loop =====
    const loop = {
        _rafId: null,
        _lastTs: 0,
        _accumulator: 0,
        _running: false,

        start(update, draw, opts = {}) {
            if (this._running) this.stop();
            this._running = true;
            this._lastTs = performance.now();

            const fixedStep = opts.fixedStep || 0;
            const step = (ts) => {
                if (!this._running) return;
                const dt = Math.min(ts - this._lastTs, 100);
                this._lastTs = ts;

                if (fixedStep > 0) {
                    this._accumulator += dt;
                    while (this._accumulator >= fixedStep) {
                        update(fixedStep);
                        this._accumulator -= fixedStep;
                    }
                } else {
                    update(dt);
                }
                draw();
                this._rafId = requestAnimationFrame(step);
            };
            this._rafId = requestAnimationFrame(step);
        },

        stop() {
            this._running = false;
            if (this._rafId) cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    };

    // ===== Minimal FSM =====
    function fsm(states, initial) {
        return {
            current: initial,
            states,
            transition(action) {
                const next = (this.states[this.current] || {})[action];
                if (next) this.current = next;
                return this.current;
            },
            is(state) {
                return this.current === state;
            },
            set(state) {
                if (this.states[state]) this.current = state;
            }
        };
    }

    // ===== Difficulty constants =====
    const DIFFICULTY = {
        labels: {
            zh: { beginner: '初级', intermediate: '中级', advanced: '高级' },
            en: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
        },

        label(level, lang) {
            const l = lang || i18n.current;
            return (this.labels[l] || {})[level] || level;
        },

        LEVELS: ['beginner', 'intermediate', 'advanced']
    };

    // ===== Utility: clamp =====
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    // ===== Utility: rectIntersect (AABB) =====
    function rectIntersect(r1, r2) {
        return r1.x < r2.x + r2.w
            && r1.x + r1.w > r2.x
            && r1.y < r2.y + r2.h
            && r1.y + r1.h > r2.y;
    }

    // ===== Utility: random int =====
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ===== Utility: pick random from array =====
    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // ===== UI: unified game header =====
    // Renders a fixed-position top bar with: [◄ oma-games]    [中/EN] [◐]
    // Uses currentColor inheritance so each game's body color drives the look.
    // Games can override via CSS variables:
    //   --oma-header-bg (default: rgba(0,0,0,0.45))
    //   --oma-header-fg (default: currentColor)
    //   --oma-header-border (default: currentColor)
    const ui = {
        header(opts = {}) {
            const back = opts.back || '/';
            const root = typeof opts.mount === 'string'
                ? document.querySelector(opts.mount)
                : (opts.mount || document.body);

            const langLabel = opts.langLabel || '中/EN';
            const themeIcon = opts.themeIcon || '◐';
            const backText = opts.backText || 'oma-games';

            const html = `
                <header class="oma-game-header">
                    <a href="${back}" class="oma-game-back" title="${i18n.t('back_to_games')}">
                        <span class="oma-game-back-arrow">◄</span>
                        <span class="oma-game-back-text">${backText}</span>
                    </a>
                    <div class="oma-game-controls">
                        <button class="oma-game-btn" data-oma-act="lang" title="${i18n.t('toggle_lang')}">${langLabel}</button>
                        <button class="oma-game-btn" data-oma-act="theme" title="${i18n.t('toggle_theme')}">${themeIcon}</button>
                    </div>
                </header>
            `;
            root.insertAdjacentHTML('afterbegin', html);
            const header = root.querySelector('.oma-game-header');
            header.querySelector('[data-oma-act="lang"]').addEventListener('click', () => i18n.toggle());
            header.querySelector('[data-oma-act="theme"]').addEventListener('click', () => theme.toggle());
            return header;
        }
    };

    window.OmaGames = {
        i18n,
        theme,
        input,
        loop,
        fsm,
        DIFFICULTY,
        clamp,
        rectIntersect,
        randInt,
        pick,
        ui
    };
})();
