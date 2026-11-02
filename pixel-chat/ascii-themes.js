/*
 * ASCII Themes — animated pixel/ASCII wallpapers drawn on a <canvas>.
 * Usage:
 *   const scene = AsciiThemes.mount(canvas, { theme: 'moonlit', cell: 14 });
 *   scene.setTheme('koi');  scene.destroy();
 */
(function (root) {
  'use strict';

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  // Small bitmap sprites: '#' = filled cell, ' ' = empty.
  const SPRITES = {
    crab: [
      '  #     #  ',
      '   #   #   ',
      '  #######  ',
      ' ## ### ## ',
      '###########',
      '# ####### #',
      '# #     # #',
      '   ## ##   ',
    ],
    moon: [
      '   ####  ',
      '  ####   ',
      ' ####    ',
      '####     ',
      '####     ',
      '####     ',
      ' ####    ',
      '  ####   ',
      '   ##### ',
      '    #### ',
    ],
    cloud: [
      '     ####        ',
      '   ########  ##  ',
      ' ################',
      '#################',
      ' ############### ',
    ],
    turtle: [
      '   ####    ',
      ' ######## #',
      '###########',
      ' ######## #',
      '  #    #   ',
    ],
    koi: [
      '  ####   ##',
      '#########  ',
      '  ####   ##',
    ],
    boat: [
      '    #    ',
      '   ##    ',
      '  ###    ',
      '#########',
      ' ####### ',
    ],
    jelly: [
      ' ##### ',
      '#######',
      '#######',
      '# # # #',
      '# # # #',
      ' # # # ',
      ' #   # ',
    ],
    pad: [
      ' #### ',
      '######',
      '### ##',
      ' #### ',
    ],
  };

  function sprite(grid, name, x, y, chars, color, flip) {
    const rows = SPRITES[name];
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const ch = flip ? row[row.length - 1 - c] : row[c];
        if (ch === '#') grid.put(Math.round(x) + c, Math.round(y) + r, chars, color);
      }
    }
  }

  // ---------- THEMES ----------
  // Each theme: { name, bg:[top,bottom], init(s) -> state, draw(g, st, t, dt) }
  const THEMES = {
    claude: {
      name: 'Claude Code',
      bg: ['#1a1310', '#0d0907'],
      init(g) {
        return { bursts: [], stars: Array.from({ length: 60 }, () => ({ x: rnd(0, g.cols), y: rnd(0, g.rows), p: rnd(0, 6) })) };
      },
      draw(g, st, t) {
        st.stars.forEach((s) => g.put(s.x | 0, s.y | 0, '.', `rgba(217,119,87,${0.15 + 0.15 * Math.sin(t * 2 + s.p)})`));
        if (Math.random() < 0.035) st.bursts.push({ x: rnd(4, g.cols - 4), y: rnd(2, g.rows * 0.6), t0: t, hue: pick([18, 28, 40]) });
        st.bursts = st.bursts.filter((b) => t - b.t0 < 2.2);
        st.bursts.forEach((b) => {
          const age = t - b.t0, r = age * 7, a = 1 - age / 2.2;
          for (let i = 0; i < 16; i++) {
            const ang = (i / 16) * Math.PI * 2;
            g.put(b.x + Math.cos(ang) * r * 1.8, b.y + Math.sin(ang) * r + age * age, i % 2 ? '*' : '+', `hsla(${b.hue},85%,62%,${a})`);
          }
        });
      },
    },

    cloud: {
      name: 'Cloud Drift',
      bg: ['#6fb3ea', '#cfe7fa'],
      init(g) {
        return { clouds: Array.from({ length: 7 }, () => ({ x: rnd(-20, g.cols), y: rnd(0, g.rows * 0.75), v: rnd(1, 3) })) };
      },
      draw(g, st, t, dt) {
        st.clouds.forEach((c) => {
          c.x += c.v * dt;
          if (c.x > g.cols + 2) { c.x = -20; c.y = rnd(0, g.rows * 0.75); }
          sprite(g, 'cloud', c.x, c.y, '#', 'rgba(255,255,255,0.92)');
        });
      },
    },

    honu: {
      name: 'Honu Lagoon',
      bg: ['#3fc4c9', '#0f5c6e'],
      init(g) {
        return {
          turtles: Array.from({ length: 3 }, () => ({ x: rnd(0, g.cols), y: rnd(3, g.rows - 8), v: rnd(1.5, 3), p: rnd(0, 6) })),
          bubbles: [],
        };
      },
      draw(g, st, t, dt) {
        for (let x = 0; x < g.cols; x += 3) g.put(x + ((t * 2) % 3), 1 + Math.sin(x * 0.3 + t) * 0.6, '~', 'rgba(255,255,255,0.35)');
        st.turtles.forEach((tu) => {
          tu.x += tu.v * dt;
          if (tu.x > g.cols + 2) { tu.x = -12; tu.y = rnd(3, g.rows - 8); }
          sprite(g, 'turtle', tu.x, tu.y + Math.sin(t + tu.p) * 1.2, '@', 'rgba(60,140,80,0.95)');
          if (Math.random() < 0.03) st.bubbles.push({ x: tu.x + 10, y: tu.y });
        });
        st.bubbles = st.bubbles.filter((b) => (b.y -= 4 * dt) > 0);
        st.bubbles.forEach((b) => g.put(b.x + Math.sin(b.y) * 0.5, b.y, 'o', 'rgba(220,255,255,0.7)'));
      },
    },

    koi: {
      name: 'Koi Pond',
      bg: ['#2d8a6a', '#11493b'],
      init(g) {
        return {
          pads: Array.from({ length: 8 }, () => ({ x: rnd(0, g.cols - 6), y: rnd(0, g.rows - 4) })),
          fish: Array.from({ length: 4 }, (_, i) => ({ a: rnd(0, 6), r: rnd(6, 14), cx: rnd(15, g.cols - 15), cy: rnd(6, g.rows - 6), s: rnd(0.2, 0.45) * (i % 2 ? 1 : -1), c: pick(['#ff7b3a', '#ffffff', '#ffb000', '#e8443a']) })),
        };
      },
      draw(g, st, t, dt) {
        st.fish.forEach((f) => {
          f.a += f.s * dt;
          const x = f.cx + Math.cos(f.a) * f.r * 2, y = f.cy + Math.sin(f.a) * f.r;
          sprite(g, 'koi', x, y, '%', f.c, Math.sin(f.a) * f.s > 0);
        });
        st.pads.forEach((p) => sprite(g, 'pad', p.x, p.y, '@', 'rgba(110,200,90,0.9)'));
      },
    },

    jellyfish: {
      name: 'Jellyfish',
      bg: ['#0b1e4a', '#040a1c'],
      init(g) {
        return { j: Array.from({ length: 6 }, () => ({ x: rnd(0, g.cols - 7), y: rnd(0, g.rows), v: rnd(1, 2.5), h: pick([280, 300, 190, 330]) })) };
      },
      draw(g, st, t, dt) {
        st.j.forEach((j, i) => {
          j.y -= j.v * dt * (0.6 + 0.4 * Math.sin(t * 2 + i));
          if (j.y < -8) { j.y = g.rows + 2; j.x = rnd(0, g.cols - 7); }
          sprite(g, 'jelly', j.x + Math.sin(t + i) * 1.5, j.y, '*', `hsla(${j.h},80%,72%,${0.6 + 0.3 * Math.sin(t * 3 + i)})`);
        });
      },
    },

    boats: {
      name: 'Paper Boats',
      bg: ['#58b8c2', '#1d6f80'],
      init(g) {
        return { b: Array.from({ length: 5 }, () => ({ x: rnd(0, g.cols), y: rnd(2, g.rows - 6), v: rnd(0.8, 2) })) };
      },
      draw(g, st, t, dt) {
        for (let y = 2; y < g.rows; y += 4)
          for (let x = (y * 3) % 7; x < g.cols; x += 7) g.put(x + Math.sin(t + y) * 1.5, y, '~', 'rgba(255,255,255,0.22)');
        st.b.forEach((b, i) => {
          b.x += b.v * dt;
          if (b.x > g.cols + 2) { b.x = -10; b.y = rnd(2, g.rows - 6); }
          sprite(g, 'boat', b.x, b.y + Math.sin(t * 1.5 + i) * 0.7, '^', 'rgba(255,255,255,0.95)');
        });
      },
    },

    fireflies: {
      name: 'Fireflies',
      bg: ['#0c1a12', '#050b07'],
      init(g) {
        return {
          f: Array.from({ length: 45 }, () => ({ x: rnd(0, g.cols), y: rnd(0, g.rows), p: rnd(0, 6), vx: rnd(-1, 1), vy: rnd(-0.6, 0.6) })),
          grass: Array.from({ length: g.cols }, () => rnd(1, 5) | 0),
        };
      },
      draw(g, st, t, dt) {
        st.grass.forEach((h, x) => { for (let k = 0; k < h; k++) g.put(x, g.rows - 1 - k, k === h - 1 ? '\'' : '|', 'rgba(60,120,60,0.6)'); });
        st.f.forEach((f) => {
          f.x = (f.x + f.vx * dt + g.cols) % g.cols; f.y = (f.y + f.vy * dt + g.rows) % g.rows;
          const a = Math.max(0, Math.sin(t * 1.8 + f.p));
          if (a > 0.05) {
            g.put(f.x, f.y, a > 0.7 ? '*' : '.', `rgba(240,255,120,${a})`);
            g.glow(f.x, f.y, `rgba(220,255,90,${a * 0.35})`);
          }
        });
      },
    },

    moonlit: {
      name: 'Moonlit',
      bg: ['#0e1640', '#060a20'],
      init(g) {
        return {
          stars: Array.from({ length: 80 }, () => ({ x: rnd(0, g.cols), y: rnd(0, g.rows), p: rnd(0, 6) })),
          clouds: Array.from({ length: 4 }, () => ({ x: rnd(0, g.cols), y: rnd(3, g.rows * 0.6), v: rnd(0.4, 1.2) })),
        };
      },
      draw(g, st, t, dt) {
        st.stars.forEach((s) => g.put(s.x, s.y, '.', `rgba(255,255,255,${0.2 + 0.5 * Math.abs(Math.sin(t + s.p))})`));
        sprite(g, 'moon', g.cols * 0.68, 2, '#', 'rgba(230,220,170,0.9)');
        st.clouds.forEach((c) => {
          c.x += c.v * dt;
          if (c.x > g.cols + 2) c.x = -20;
          sprite(g, 'cloud', c.x, c.y, '=', 'rgba(110,130,210,0.55)');
        });
      },
    },
  };

  // ---------- ENGINE ----------
  function mount(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext('2d');
    const cell = opts.cell || 14;
    const mascot = opts.mascot !== false;
    let theme = THEMES[opts.theme] ? opts.theme : 'claude';
    let st, raf, last = 0, cols = 0, rows = 0, dpr = 1, crabX = 0, crabDir = 1;
    const reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const grid = {
      get cols() { return cols; }, get rows() { return rows; },
      put(x, y, ch, color) {
        x = Math.round(x); y = Math.round(y);
        if (x < 0 || y < 0 || x >= cols || y >= rows) return;
        ctx.fillStyle = color;
        ctx.fillText(ch, x * cell + cell / 2, y * cell + cell / 2);
      },
      glow(x, y, color) {
        const px = x * cell + cell / 2, py = y * cell + cell / 2;
        const gr = ctx.createRadialGradient(px, py, 0, px, py, cell * 2.5);
        gr.addColorStop(0, color); gr.addColorStop(1, 'transparent');
        ctx.fillStyle = gr; ctx.fillRect(px - cell * 3, py - cell * 3, cell * 6, cell * 6);
      },
    };

    function resize() {
      dpr = Math.min(root.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell); rows = Math.ceil(h / cell);
      ctx.font = `bold ${cell}px ui-monospace, Menlo, Consolas, monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      st = THEMES[theme].init(grid);
    }

    function frame(ms) {
      const t = ms / 1000, dt = Math.min(0.05, last ? t - last : 0.016);
      last = t;
      const th = THEMES[theme], h = rows * cell;
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, th.bg[0]); bg.addColorStop(1, th.bg[1]);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, cols * cell, h);
      th.draw(grid, st, t, dt);
      if (mascot) {
        crabX += crabDir * 2 * dt;
        if (crabX > cols - 12) crabDir = -1; else if (crabX < 1) crabDir = 1;
        const hop = Math.abs(Math.sin(t * 6)) > 0.8 ? -1 : 0;
        sprite(grid, 'crab', crabX, rows - 10 + hop, '#', '#e07a5f');
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    const ro = root.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(canvas); else root.addEventListener('resize', resize);
    resize();
    raf = requestAnimationFrame(frame);

    return {
      setTheme(name) { if (!THEMES[name]) return; theme = name; st = THEMES[name].init(grid); if (reduce) requestAnimationFrame(frame); },
      get theme() { return theme; },
      destroy() { cancelAnimationFrame(raf); if (ro) ro.disconnect(); },
    };
  }

  root.AsciiThemes = {
    mount,
    list: () => Object.keys(THEMES).map((id) => ({ id, name: THEMES[id].name, bg: THEMES[id].bg })),
  };
})(typeof window !== 'undefined' ? window : this);
