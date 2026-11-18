// =============================================================================
// Tower Defense: Last Grid — HTML5 Canvas 2D Tactical Engine
// 10 Maps | 5 Towers (3 Tiers, 70% Refund) | 8 Enemies + 3 Bosses | 30 Waves
// =============================================================================

(function() {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }
    playTone(freq, type, duration, gainVal = 0.1, slideTo = null) {
      if (this.muted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slideTo) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(10, slideTo), this.ctx.currentTime + duration);
        }
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }
    shootPulse() { this.playTone(850, 'sawtooth', 0.08, 0.06, 200); }
    shootMortar() { this.playTone(180, 'triangle', 0.35, 0.15, 35); }
    shootCryo() { this.playTone(650, 'sine', 0.22, 0.08, 1100); }
    shootRailgun() {
      this.playTone(120, 'sawtooth', 0.3, 0.18, 40);
      this.playTone(1200, 'square', 0.15, 0.08, 300);
    }
    upgrade() {
      this.playTone(440, 'triangle', 0.1, 0.1, 660);
      setTimeout(() => this.playTone(660, 'triangle', 0.15, 0.1, 880), 80);
    }
    sell() {
      this.playTone(700, 'sine', 0.08, 0.1, 950);
      setTimeout(() => this.playTone(950, 'sine', 0.12, 0.1, 1200), 70);
    }
    hit() { this.playTone(140, 'square', 0.05, 0.04, 60); }
    leak() { this.playTone(220, 'sawtooth', 0.3, 0.2, 90); }
    victory() {
      [440, 554, 659, 880].forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.15), i * 120);
      });
    }
    defeat() {
      [330, 293, 261, 196].forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'sawtooth', 0.35, 0.2, 80), i * 150);
      });
    }
  }

  const audio = new SoundSynth();

  // --- MAP DEFINITIONS (10 MAPS) ---
  const MAPS = [
    {
      id: "training_grid",
      name: "Training Grid",
      desc: "Basic S-curve test field. Clean terrain with single lane.",
      wave_count: 10,
      gold: 250,
      hp: 20,
      modifier: "none",
      lanes: [
        [ {x:64, y:192}, {x:384, y:192}, {x:384, y:448}, {x:896, y:448}, {x:896, y:256}, {x:1152, y:256} ]
      ]
    },
    {
      id: "crossroads",
      name: "Crossroads",
      desc: "Interconnected straight corridors with multiple defense pockets.",
      wave_count: 12,
      gold: 250,
      hp: 20,
      modifier: "none",
      lanes: [
        [ {x:64, y:128}, {x:448, y:128}, {x:448, y:384}, {x:896, y:384}, {x:1152, y:384} ]
      ]
    },
    {
      id: "spiral_core",
      name: "Spiral Core",
      desc: "Concentric inward spiral. Optimal for Mortar and Cryo AoE setups.",
      wave_count: 15,
      gold: 250,
      hp: 20,
      modifier: "none",
      lanes: [
        [ {x:64, y:64}, {x:1152, y:64}, {x:1152, y:576}, {x:192, y:576}, {x:192, y:192}, {x:960, y:192}, {x:960, y:448}, {x:384, y:448}, {x:384, y:320}, {x:640, y:320} ]
      ]
    },
    {
      id: "misty_pass",
      name: "Misty Pass",
      desc: "Dense electromagnetic fog reduces all tower ranges by -15%.",
      wave_count: 15,
      gold: 250,
      hp: 20,
      modifier: "fog",
      lanes: [
        [ {x:64, y:320}, {x:256, y:128}, {x:512, y:512}, {x:768, y:128}, {x:1024, y:512}, {x:1152, y:320} ]
      ]
    },
    {
      id: "fast_track",
      name: "Fast Track",
      desc: "High-speed magnetic highway. All enemies move +15% faster!",
      wave_count: 20,
      gold: 260,
      hp: 20,
      modifier: "fast_lane",
      lanes: [
        [ {x:64, y:256}, {x:1152, y:256} ]
      ]
    },
    {
      id: "scrap_yard",
      name: "Scrap Yard",
      desc: "Resource-starved industrial ruins. Enemy bounties reduced by -20%.",
      wave_count: 20,
      gold: 240,
      hp: 20,
      modifier: "scarce",
      lanes: [
        [ {x:64, y:128}, {x:768, y:128}, {x:768, y:384}, {x:256, y:384}, {x:256, y:576}, {x:1152, y:576} ]
      ]
    },
    {
      id: "iron_wall",
      name: "Iron Wall",
      desc: "Fortified barrier zone. All enemy units gain +20% bonus armor.",
      wave_count: 25,
      gold: 280,
      hp: 20,
      modifier: "armored",
      lanes: [
        [ {x:64, y:128}, {x:192, y:512}, {x:960, y:512}, {x:1152, y:128} ]
      ]
    },
    {
      id: "blackout_city",
      name: "Blackout City",
      desc: "Cybernetic metropolis with periodic EMP surges every 5 waves.",
      wave_count: 25,
      gold: 280,
      hp: 20,
      modifier: "blackout",
      lanes: [
        [ {x:64, y:128}, {x:320, y:128}, {x:320, y:448}, {x:640, y:448}, {x:640, y:192}, {x:960, y:192}, {x:960, y:512}, {x:1152, y:512} ]
      ]
    },
    {
      id: "twin_gate",
      name: "Twin Gate",
      desc: "Dual converging vectors converging directly into the central core.",
      wave_count: 30,
      gold: 300,
      hp: 20,
      modifier: "double_lane",
      lanes: [
        [ {x:64, y:192}, {x:512, y:192}, {x:640, y:320}, {x:1152, y:320} ],
        [ {x:64, y:448}, {x:512, y:448}, {x:640, y:320}, {x:1152, y:320} ]
      ]
    },
    {
      id: "last_grid",
      name: "The Last Grid",
      desc: "Final endurance sector: full 30 waves with 3 Boss encounters!",
      wave_count: 30,
      gold: 350,
      hp: 25,
      modifier: "last_grid",
      lanes: [
        [ {x:64, y:64}, {x:1152, y:64}, {x:1152, y:256}, {x:128, y:256}, {x:128, y:448}, {x:1152, y:448}, {x:1152, y:576}, {x:640, y:576} ]
      ]
    }
  ];

  // --- TOWER BLUEPRINTS (5 TOWERS, 3 TIERS, 70% REFUND) ---
  const TOWER_DEFS = {
    pulse: {
      id: "pulse",
      name: "Pulse Tower",
      type: "KINETIC",
      color: "#00e5ff",
      cost: 100,
      desc: "Rapid-fire kinetic tracer gun.",
      tiers: [
        { dmg: 12, rate: 4.0, range: 140, upCost: 120 },
        { dmg: 18, rate: 5.0, range: 155, upCost: 200 },
        { dmg: 26, rate: 6.0, range: 170, upCost: 0 }
      ]
    },
    mortar: {
      id: "mortar",
      name: "Mortar Tower",
      type: "EXPLOSIVE",
      color: "#ff9100",
      cost: 150,
      desc: "Long-range explosive shell with area splash.",
      tiers: [
        { dmg: 45, rate: 0.8, range: 200, splash: 60, upCost: 150 },
        { dmg: 70, rate: 0.9, range: 215, splash: 75, upCost: 250 },
        { dmg: 105, rate: 1.0, range: 230, splash: 85, upCost: 0 }
      ]
    },
    cryo: {
      id: "cryo",
      name: "Cryo Tower",
      type: "ENERGY",
      color: "#00f0ff",
      cost: 120,
      desc: "Cryogenic emitter that slows hostiles.",
      tiers: [
        { dmg: 4, rate: 1.5, range: 130, slow: 0.35, slowDur: 2.5, upCost: 140 },
        { dmg: 6, rate: 1.8, range: 145, slow: 0.45, slowDur: 3.0, upCost: 220 },
        { dmg: 9, rate: 2.0, range: 160, slow: 0.55, slowDur: 3.5, upCost: 0 }
      ]
    },
    railgun: {
      id: "railgun",
      name: "Railgun Tower",
      type: "PIERCE",
      color: "#ff007f",
      cost: 250,
      desc: "High-voltage magnetic beam piercing targets.",
      tiers: [
        { dmg: 140, rate: 0.5, range: 240, pierce: 1, upCost: 260 },
        { dmg: 220, rate: 0.6, range: 260, pierce: 2, upCost: 380 },
        { dmg: 340, rate: 0.7, range: 280, pierce: 3, upCost: 0 }
      ]
    },
    beacon: {
      id: "beacon",
      name: "Beacon Tower",
      type: "SUPPORT",
      color: "#b388ff",
      cost: 180,
      desc: "Buff aura: +35% damage & +20% range to nearby towers.",
      tiers: [
        { dmgBuff: 0.35, rangeBuff: 0.20, range: 130, upCost: 200 },
        { dmgBuff: 0.45, rangeBuff: 0.25, range: 150, upCost: 320 },
        { dmgBuff: 0.55, rangeBuff: 0.30, range: 170, upCost: 0 }
      ]
    }
  };

  // --- ENEMY BLUEPRINTS (8 REGULAR + 3 BOSSES) ---
  const ENEMY_DEFS = {
    grunt:        { name: "Grunt",        hp: 100, shield: 0,   armor: 0,  spd: 60,  bounty: 5,  color: "#ff5252", size: 12 },
    sprinter:     { name: "Sprinter",     hp: 60,  shield: 0,   armor: 0,  spd: 110, bounty: 6,  color: "#ffd600", size: 10 },
    brute:        { name: "Brute",        hp: 400, shield: 0,   armor: 8,  spd: 40,  bounty: 15, color: "#d50000", size: 17 },
    swarmling:    { name: "Swarmling",    hp: 25,  shield: 0,   armor: 0,  spd: 85,  bounty: 2,  color: "#ffab00", size: 7 },
    shieldbearer: { name: "Shieldbearer", hp: 200, shield: 150, armor: 2,  spd: 55,  bounty: 12, color: "#00b0ff", size: 15 },
    medic:        { name: "Medic",        hp: 150, shield: 0,   armor: 0,  spd: 50,  bounty: 14, color: "#00e676", size: 13 },
    splitter:     { name: "Splitter",     hp: 250, shield: 0,   armor: 3,  spd: 55,  bounty: 10, color: "#e040fb", size: 15 },
    phantom:      { name: "Phantom",      hp: 180, shield: 0,   armor: 0,  spd: 75,  bounty: 12, color: "#7c4dff", size: 14 },
    // Bosses
    juggernaut:   { name: "BOSS: Juggernaut", hp: 6000,  shield: 0, armor: 20, spd: 32, bounty: 100, color: "#ff1744", size: 28, isBoss: true },
    overseer:     { name: "BOSS: Overseer",   hp: 9000,  shield: 0, armor: 10, spd: 35, bounty: 150, color: "#651fff", size: 30, isBoss: true },
    hive_titan:   { name: "BOSS: Hive Titan", hp: 20000, shield: 0, armor: 15, spd: 30, bounty: 250, color: "#f50057", size: 34, isBoss: true }
  };

  // Generate 30 Wave configurations dynamically matching spec
  function getWaveConfig(waveNum) {
    if (waveNum === 10) {
      return [ { type: "juggernaut", count: 1, interval: 2.0 }, { type: "grunt", count: 12, interval: 0.8 } ];
    }
    if (waveNum === 20) {
      return [ { type: "overseer", count: 1, interval: 2.0 }, { type: "phantom", count: 10, interval: 0.7 } ];
    }
    if (waveNum === 30) {
      return [ { type: "hive_titan", count: 1, interval: 2.0 }, { type: "splitter", count: 12, interval: 0.8 } ];
    }
    // Normal waves progression
    const groups = [];
    const pool = ["grunt", "sprinter", "brute", "swarmling", "shieldbearer", "medic", "splitter", "phantom"];
    const maxIndex = Math.min(pool.length - 1, Math.floor((waveNum - 1) / 3));
    const mainType = pool[maxIndex];
    const subType = pool[Math.max(0, maxIndex - 1)];

    const count = 6 + Math.floor(waveNum * 1.5);
    groups.push({ type: mainType, count: count, interval: Math.max(0.4, 1.2 - waveNum * 0.02) });
    if (waveNum >= 4) {
      groups.push({ type: subType, count: Math.floor(count * 0.6), interval: 0.8 });
    }
    return groups;
  }

  // --- GAME ENGINE CORE ---
  class LastGridEngine {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.width = 1280;
      this.height = 720;

      this.currentMapIndex = 0;
      this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'VICTORY', 'DEFEAT', 'MAP_SELECT'
      this.speed = 1;
      this.gold = 250;
      this.baseHp = 20;
      this.maxBaseHp = 20;
      this.wave = 1;
      this.maxWaves = 10;
      this.waveActive = false;
      this.waveCountdown = 10;
      this.spawnQueue = [];
      this.spawnTimer = 0;

      this.towers = [];
      this.enemies = [];
      this.projectiles = [];
      this.particles = [];
      this.floatingTexts = [];

      this.selectedBuildType = null;
      this.selectedTower = null;
      this.mousePos = { x: -100, y: -100 };
      this.hoverCell = null;
      this.targetPriorities = ['FIRST', 'LAST', 'STRONGEST', 'NEAREST'];

      this.nextUid = 1;
      this.lastTimestamp = 0;

      // Persistence
      this.saveData = this.loadSave();

      this.initEvents();
      this.setupCanvasScaling();
      this.startLoop();
    }

    loadSave() {
      try {
        const d = localStorage.getItem('last_grid_save');
        return d ? JSON.parse(d) : { unlockedMaps: 10, stars: {} };
      } catch (e) {
        return { unlockedMaps: 10, stars: {} };
      }
    }

    saveProgress(mapId, stars) {
      this.saveData.stars[mapId] = Math.max(this.saveData.stars[mapId] || 0, stars);
      try {
        localStorage.setItem('last_grid_save', JSON.stringify(this.saveData));
      } catch (e) {}
    }

    setupCanvasScaling() {
      window.addEventListener('resize', () => this.resizeCanvas());
      this.resizeCanvas();
    }

    resizeCanvas() {
      const wrapper = document.getElementById('canvas-container');
      if (!wrapper) return;
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      const aspect = 1280 / 720;
      let targetW = w;
      let targetH = w / aspect;
      if (targetH > h) {
        targetH = h;
        targetW = h * aspect;
      }
      this.canvas.style.width = `${targetW}px`;
      this.canvas.style.height = `${targetH}px`;
    }

    getCanvasPos(e) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = 1280 / rect.width;
      const scaleY = 720 / rect.height;
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    initEvents() {
      const handleMove = (e) => {
        this.mousePos = this.getCanvasPos(e);
        this.updateHoverCell();
      };
      this.canvas.addEventListener('mousemove', handleMove);
      this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(e); }, { passive: false });

      const handleClick = (e) => {
        audio.init();
        const pos = this.getCanvasPos(e);
        this.handleCanvasClick(pos.x, pos.y);
      };
      this.canvas.addEventListener('click', handleClick);
      this.canvas.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          audio.init();
          const rect = this.canvas.getBoundingClientRect();
          const scaleX = 1280 / rect.width;
          const scaleY = 720 / rect.height;
          const x = (e.changedTouches[0].clientX - rect.left) * scaleX;
          const y = (e.changedTouches[0].clientY - rect.top) * scaleY;
          this.handleCanvasClick(x, y);
        }
      });

      window.addEventListener('keydown', (e) => {
        audio.init();
        if (e.key >= '1' && e.key <= '5') {
          const keys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
          this.selectBuildType(keys[parseInt(e.key) - 1]);
        } else if (e.code === 'Space') {
          e.preventDefault();
          this.callNextWave();
        } else if (e.key === 'Escape') {
          if (this.selectedTower) this.selectedTower = null;
          else if (this.selectedBuildType) this.selectedBuildType = null;
          else this.togglePause();
        } else if (e.key === 'u' || e.key === 'U') {
          this.upgradeSelectedTower();
        } else if (e.key === 's' || e.key === 'S') {
          this.sellSelectedTower();
        } else if (e.key === 't' || e.key === 'T') {
          this.cycleTargetPriority();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          this.cycleSpeed();
        }
      });
    }

    startMission(mapIdx = 0) {
      this.currentMapIndex = mapIdx;
      const map = MAPS[mapIdx];
      this.gold = map.gold;
      this.baseHp = map.hp;
      this.maxBaseHp = map.hp;
      this.wave = 1;
      this.maxWaves = map.wave_count;
      this.waveActive = false;
      this.waveCountdown = 8;
      this.speed = 1;

      this.towers = [];
      this.enemies = [];
      this.projectiles = [];
      this.particles = [];
      this.floatingTexts = [];
      this.spawnQueue = [];

      this.selectedBuildType = null;
      this.selectedTower = null;
      this.state = 'PLAYING';
      this.bakeMapLanes();
      this.updateHud();
    }

    bakeMapLanes() {
      const map = MAPS[this.currentMapIndex];
      this.bakedLanes = map.lanes.map(lane => {
        let total = 0;
        const segments = [];
        for (let i = 0; i < lane.length - 1; i++) {
          const p1 = lane[i];
          const p2 = lane[i + 1];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          segments.push({ p1, p2, start: total, length: dist });
          total += dist;
        }
        return { totalLength: total, segments, waypoints: lane };
      });
    }

    getPointAlongLane(laneIdx, px) {
      const lane = this.bakedLanes[laneIdx] || this.bakedLanes[0];
      if (px <= 0) return { x: lane.segments[0].p1.x, y: lane.segments[0].p1.y, angle: 0 };
      if (px >= lane.totalLength) {
        const last = lane.segments[lane.segments.length - 1];
        return { x: last.p2.x, y: last.p2.y, angle: 0 };
      }
      for (const seg of lane.segments) {
        if (px >= seg.start && px <= seg.start + seg.length) {
          const t = (px - seg.start) / seg.length;
          const x = seg.p1.x + (seg.p2.x - seg.p1.x) * t;
          const y = seg.p1.y + (seg.p2.y - seg.p1.y) * t;
          const angle = Math.atan2(seg.p2.y - seg.p1.y, seg.p2.x - seg.p1.x);
          return { x, y, angle };
        }
      }
      const last = lane.segments[lane.segments.length - 1];
      return { x: last.p2.x, y: last.p2.y, angle: 0 };
    }

    isPathCell(cellX, cellY) {
      const cx = cellX * 64 + 32;
      const cy = cellY * 64 + 32;
      const map = MAPS[this.currentMapIndex];
      for (const lane of map.lanes) {
        for (let i = 0; i < lane.length - 1; i++) {
          const p1 = lane[i];
          const p2 = lane[i + 1];
          const dist = this.distToSegment({ x: cx, y: cy }, p1, p2);
          if (dist < 46) return true;
        }
      }
      return false;
    }

    distToSegment(p, v, w) {
      const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
      if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
      let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }

    updateHoverCell() {
      if (this.mousePos.y < 60 || this.mousePos.y > 620) {
        this.hoverCell = null;
        return;
      }
      const gx = Math.floor(this.mousePos.x / 64);
      const gy = Math.floor(this.mousePos.y / 64);
      if (gx >= 0 && gx < 20 && gy >= 1 && gy < 10) {
        const isPath = this.isPathCell(gx, gy);
        const hasTower = this.towers.some(t => t.cellX === gx && t.cellY === gy);
        this.hoverCell = { gx, gy, valid: !isPath && !hasTower };
      } else {
        this.hoverCell = null;
      }
    }

    handleCanvasClick(x, y) {
      if (this.state === 'MENU') {
        if (y > 440 && y < 510 && x > 480 && x < 800) this.startMission(0);
        else if (y > 530 && y < 590 && x > 480 && x < 800) this.state = 'MAP_SELECT';
        return;
      }

      if (this.state === 'MAP_SELECT') {
        if (y > 40 && y < 90 && x > 50 && x < 150) {
          this.state = 'MENU';
          return;
        }
        // Map cards grid: 2 rows of 5 cards
        for (let i = 0; i < MAPS.length; i++) {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const mx = 60 + col * 235;
          const my = 140 + row * 240;
          if (x >= mx && x <= mx + 220 && y >= my && y <= my + 210) {
            this.startMission(i);
            return;
          }
        }
        return;
      }

      if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
        if (x > 460 && x < 620 && y > 460 && y < 520) {
          this.startMission(this.currentMapIndex);
        } else if (x > 660 && x < 820 && y > 460 && y < 520) {
          this.state = 'MAP_SELECT';
        }
        return;
      }

      // In-game Top HUD actions
      if (y >= 0 && y <= 60) {
        // Next Wave button
        if (x >= 530 && x <= 710) this.callNextWave();
        // Speed button
        else if (x >= 1010 && x <= 1070) this.cycleSpeed();
        // Audio button
        else if (x >= 1085 && x <= 1145) audio.toggleMute();
        // Pause button
        else if (x >= 1160 && x <= 1220) this.togglePause();
        return;
      }

      // Bottom Bar actions (Towers Hotbar / Inspector)
      if (y >= 620) {
        if (this.selectedTower) {
          // Upgrade button (x: 480 to 620)
          if (x >= 480 && x <= 620 && y >= 640 && y <= 700) {
            this.upgradeSelectedTower();
            return;
          }
          // Sell button (x: 640 to 760)
          if (x >= 640 && x <= 760 && y >= 640 && y <= 700) {
            this.sellSelectedTower();
            return;
          }
          // Priority button (x: 780 to 920)
          if (x >= 780 && x <= 920 && y >= 640 && y <= 700) {
            this.cycleTargetPriority();
            return;
          }
          // Close button (x: 940 to 990)
          if (x >= 940 && x <= 990 && y >= 640 && y <= 700) {
            this.selectedTower = null;
            return;
          }
        } else {
          // 5 Tower build cards
          const towerKeys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
          for (let i = 0; i < 5; i++) {
            const bx = 180 + i * 185;
            if (x >= bx && x <= bx + 170 && y >= 630 && y <= 710) {
              this.selectBuildType(towerKeys[i]);
              return;
            }
          }
        }
        return;
      }

      // Playfield clicks: Build or Select
      const gx = Math.floor(x / 64);
      const gy = Math.floor(y / 64);
      const clickedTower = this.towers.find(t => t.cellX === gx && t.cellY === gy);

      if (clickedTower) {
        this.selectedTower = clickedTower;
        this.selectedBuildType = null;
      } else if (this.selectedBuildType && this.hoverCell && this.hoverCell.valid) {
        this.buildTower(this.selectedBuildType, this.hoverCell.gx, this.hoverCell.gy);
      } else {
        this.selectedTower = null;
      }
    }

    selectBuildType(type) {
      if (this.selectedBuildType === type) {
        this.selectedBuildType = null;
      } else {
        this.selectedBuildType = type;
        this.selectedTower = null;
      }
    }

    buildTower(type, gx, gy) {
      const def = TOWER_DEFS[type];
      if (this.gold < def.cost) {
        this.addFloatingText("NOT ENOUGH GOLD!", gx * 64 + 32, gy * 64, "#ff1744");
        return;
      }
      this.gold -= def.cost;
      const tower = {
        uid: this.nextUid++,
        type: type,
        cellX: gx,
        cellY: gy,
        x: gx * 64 + 32,
        y: gy * 64 + 32,
        tier: 1,
        totalInvested: def.cost,
        cooldown: 0,
        angle: 0,
        kills: 0,
        priority: 'FIRST',
        laserTimer: 0,
        targetPoint: null
      };
      this.towers.push(tower);
      audio.upgrade();
      this.addFloatingText(`-${def.cost}g`, tower.x, tower.y, "#ffd600");
      this.selectedTower = tower;
      this.selectedBuildType = null;
      this.recalculateBeaconBuffs();
    }

    upgradeSelectedTower() {
      if (!this.selectedTower) return;
      const t = this.selectedTower;
      const def = TOWER_DEFS[t.type];
      if (t.tier >= 3) return;
      const cost = def.tiers[t.tier - 1].upCost;
      if (this.gold < cost) {
        this.addFloatingText("NOT ENOUGH GOLD!", t.x, t.y, "#ff1744");
        return;
      }
      this.gold -= cost;
      t.totalInvested += cost;
      t.tier++;
      audio.upgrade();
      this.addFloatingText(`TIER ${t.tier}!`, t.x, t.y, "#00e5ff");
      this.recalculateBeaconBuffs();
    }

    sellSelectedTower() {
      if (!this.selectedTower) return;
      const t = this.selectedTower;
      const refund = Math.floor(t.totalInvested * 0.70);
      this.gold += refund;
      this.towers = this.towers.filter(item => item !== t);
      audio.sell();
      this.addFloatingText(`+${refund}g (70%)`, t.x, t.y, "#00e676");
      this.selectedTower = null;
      this.recalculateBeaconBuffs();
    }

    cycleTargetPriority() {
      if (!this.selectedTower) return;
      const idx = this.targetPriorities.indexOf(this.selectedTower.priority);
      this.selectedTower.priority = this.targetPriorities[(idx + 1) % this.targetPriorities.length];
      this.addFloatingText(this.selectedTower.priority, this.selectedTower.x, this.selectedTower.y - 20, "#00e5ff");
    }

    cycleSpeed() {
      this.speed = this.speed === 1 ? 2 : (this.speed === 2 ? 3 : 1);
    }

    togglePause() {
      if (this.state === 'PLAYING') this.state = 'PAUSED';
      else if (this.state === 'PAUSED') this.state = 'PLAYING';
    }

    recalculateBeaconBuffs() {
      // Clear buffs
      for (const t of this.towers) {
        t.buffDmg = 1.0;
        t.buffRange = 1.0;
        t.buffRate = 1.0;
      }
      // Apply beacon auras
      for (const b of this.towers) {
        if (b.type !== 'beacon') continue;
        const bDef = TOWER_DEFS.beacon.tiers[b.tier - 1];
        for (const t of this.towers) {
          if (t === b) continue;
          const dist = Math.hypot(t.x - b.x, t.y - b.y);
          if (dist <= bDef.range) {
            t.buffDmg = Math.max(t.buffDmg, 1.0 + bDef.dmgBuff);
            t.buffRange = Math.max(t.buffRange, 1.0 + bDef.rangeBuff);
            if (bDef.rateBuff) t.buffRate = Math.max(t.buffRate, 1.0 + bDef.rateBuff);
          }
        }
      }
    }

    callNextWave() {
      if (this.waveActive) {
        // Early call bonus gold
        if (this.waveCountdown > 0) {
          const bonus = Math.floor(this.waveCountdown);
          this.gold += bonus;
          this.addFloatingText(`EARLY BONUS +${bonus}g!`, 640, 100, "#ffd600");
          this.waveCountdown = 0;
        }
        return;
      }
      this.startWave(this.wave);
    }

    startWave(waveNum) {
      this.wave = waveNum;
      this.waveActive = true;
      this.waveCountdown = 0;
      const groups = getWaveConfig(waveNum);
      this.spawnQueue = [];
      let delay = 0;
      for (const g of groups) {
        for (let i = 0; i < g.count; i++) {
          this.spawnQueue.push({
            type: g.type,
            time: delay,
            laneIdx: Math.floor(Math.random() * this.bakedLanes.length)
          });
          delay += g.interval;
        }
      }
      this.spawnTimer = 0;
      this.addFloatingText(`WAVE ${waveNum} ENGAGED!`, 640, 150, "#00e5ff", 28);
    }

    spawnEnemy(type, laneIdx) {
      const def = ENEMY_DEFS[type];
      const map = MAPS[this.currentMapIndex];
      let spdMult = 1.0;
      let armorMult = 1.0;
      if (map.modifier === 'fast_lane') spdMult = 1.15;
      if (map.modifier === 'armored') armorMult = 1.20;

      const enemy = {
        uid: this.nextUid++,
        type: type,
        laneIdx: laneIdx,
        progress: 0,
        hp: def.hp,
        maxHp: def.hp,
        shield: def.shield,
        maxShield: def.shield,
        armor: def.armor * armorMult,
        speed: def.spd * spdMult,
        bounty: map.modifier === 'scarce' ? Math.floor(def.bounty * 0.8) : def.bounty,
        size: def.size,
        color: def.color,
        isBoss: !!def.isBoss,
        slowRatio: 0,
        slowTimer: 0,
        phaseTimer: 0,
        phased: false,
        healTimer: 0,
        shieldRegenTimer: 0,
        x: 0,
        y: 0,
        angle: 0
      };
      const pos = this.getPointAlongLane(laneIdx, 0);
      enemy.x = pos.x;
      enemy.y = pos.y;
      this.enemies.push(enemy);
    }

    // --- GAME LOOP & UPDATES ---
    startLoop() {
      const step = (timestamp) => {
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const dt = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000.0);
        this.lastTimestamp = timestamp;

        if (this.state === 'PLAYING') {
          for (let i = 0; i < this.speed; i++) {
            this.update(dt);
          }
        }
        this.render();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    update(dt) {
      // 1. Wave Spawning
      if (this.waveActive) {
        this.spawnTimer += dt;
        while (this.spawnQueue.length > 0 && this.spawnTimer >= this.spawnQueue[0].time) {
          const item = this.spawnQueue.shift();
          this.spawnEnemy(item.type, item.laneIdx);
        }
        if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
          this.onWaveCleared();
        }
      } else {
        this.waveCountdown -= dt;
        if (this.waveCountdown <= 0) {
          this.startWave(this.wave);
        }
      }

      // 2. Enemies Update
      const map = MAPS[this.currentMapIndex];
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];

        // Status effects (Slow)
        if (e.slowTimer > 0) {
          e.slowTimer -= dt;
          if (e.slowTimer <= 0) e.slowRatio = 0;
        }

        // Special Trait: Phantom Phase
        if (e.type === 'phantom') {
          e.phaseTimer += dt;
          if (e.phaseTimer >= 4.0) {
            e.phased = true;
            if (e.phaseTimer >= 5.5) {
              e.phased = false;
              e.phaseTimer = 0;
            }
          }
        }

        // Special Trait: Medic Heal Aura
        if (e.type === 'medic') {
          e.healTimer += dt;
          if (e.healTimer >= 1.0) {
            e.healTimer = 0;
            for (const other of this.enemies) {
              if (other !== e && Math.hypot(other.x - e.x, other.y - e.y) <= 96) {
                other.hp = Math.min(other.maxHp, other.hp + 15);
                this.addFloatingText("+15", other.x, other.y - 10, "#00e676", 11);
              }
            }
          }
        }

        // Special Trait: Shieldbearer Shield Regen
        if (e.type === 'shieldbearer' && e.shield < e.maxShield) {
          e.shieldRegenTimer += dt;
          if (e.shieldRegenTimer > 3.0) {
            e.shield = Math.min(e.maxShield, e.shield + 20 * dt);
          }
        }

        // Movement
        const effSpeed = e.speed * (1.0 - Math.min(e.isBoss ? 0.5 : 0.8, e.slowRatio));
        e.progress += effSpeed * dt;
        const lane = this.bakedLanes[e.laneIdx] || this.bakedLanes[0];
        const pt = this.getPointAlongLane(e.laneIdx, e.progress);
        e.x = pt.x;
        e.y = pt.y;
        e.angle = pt.angle;

        // Base Core Breach
        if (e.progress >= lane.totalLength) {
          this.baseHp = Math.max(0, this.baseHp - (e.isBoss ? 10 : 1));
          audio.leak();
          this.addFloatingText(e.isBoss ? "-10 HP!" : "-1 HP!", e.x, e.y, "#ff1744", 20);
          this.enemies.splice(i, 1);
          if (this.baseHp <= 0) {
            this.onDefeat();
            return;
          }
        }
      }

      // 3. Towers Combat
      for (const t of this.towers) {
        if (t.type === 'beacon') continue;
        const def = TOWER_DEFS[t.type];
        const tier = def.tiers[t.tier - 1];
        const mapFog = (map.modifier === 'fog') ? 0.85 : 1.0;
        const effRange = tier.range * (t.buffRange || 1.0) * mapFog;
        const effRate = tier.rate * (t.buffRate || 1.0);
        const effDmg = tier.dmg * (t.buffDmg || 1.0);

        t.cooldown -= dt;
        if (t.laserTimer > 0) t.laserTimer -= dt;

        // Target acquisition
        const targets = this.findTargets(t, effRange);
        if (targets.length > 0) {
          const primary = targets[0];
          t.angle = Math.atan2(primary.y - t.y, primary.x - t.x);

          if (t.cooldown <= 0) {
            t.cooldown = 1.0 / effRate;
            this.fireTower(t, targets, effDmg, tier, effRange);
          }
        }
      }

      // 4. Projectiles Update
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        if (p.type === 'pulse') {
          // Homing
          if (p.target && this.enemies.includes(p.target)) {
            const angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
            p.x += Math.cos(angle) * p.speed * dt;
            p.y += Math.sin(angle) * p.speed * dt;
            if (Math.hypot(p.target.x - p.x, p.target.y - p.y) < 14) {
              this.applyDamage(p.target, p.damage, 'KINETIC', p.tower);
              this.projectiles.splice(i, 1);
            }
          } else {
            this.projectiles.splice(i, 1);
          }
        } else if (p.type === 'mortar') {
          // Ballistic Arc
          p.t += dt / p.flightTime;
          p.x = p.startX + (p.targetX - p.startX) * p.t;
          p.y = p.startY + (p.targetY - p.startY) * p.t - Math.sin(p.t * Math.PI) * 90;
          if (p.t >= 1.0) {
            // Detonate
            this.detonateMortar(p.targetX, p.targetY, p.damage, p.splash, p.tower);
            this.projectiles.splice(i, 1);
          }
        }
      }

      // 5. Particles & Floating Text
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= 25 * dt;
        ft.life -= dt;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }
    }

    findTargets(tower, range) {
      const candidates = [];
      for (const e of this.enemies) {
        if (e.phased) continue; // Phantoms in phase are untargetable
        const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
        if (dist <= range) {
          candidates.push({ enemy: e, dist: dist });
        }
      }
      if (candidates.length === 0) return [];

      // Priority sort + UID deterministic tie-break
      candidates.sort((a, b) => {
        let diff = 0;
        if (tower.priority === 'FIRST') {
          diff = b.enemy.progress - a.enemy.progress;
        } else if (tower.priority === 'LAST') {
          diff = a.enemy.progress - b.enemy.progress;
        } else if (tower.priority === 'STRONGEST') {
          diff = (b.enemy.hp + b.enemy.shield) - (a.enemy.hp + a.enemy.shield);
        } else if (tower.priority === 'NEAREST') {
          diff = a.dist - b.dist;
        }
        return diff !== 0 ? diff : (a.enemy.uid - b.enemy.uid);
      });

      return candidates.map(c => c.enemy);
    }

    fireTower(tower, targets, dmg, tier, range) {
      const primary = targets[0];
      if (tower.type === 'pulse') {
        audio.shootPulse();
        this.projectiles.push({
          type: 'pulse',
          x: tower.x,
          y: tower.y,
          speed: 600,
          target: primary,
          damage: dmg,
          tower: tower
        });
      } else if (tower.type === 'mortar') {
        audio.shootMortar();
        this.projectiles.push({
          type: 'mortar',
          startX: tower.x,
          startY: tower.y,
          targetX: primary.x,
          targetY: primary.y,
          x: tower.x,
          y: tower.y,
          t: 0,
          flightTime: 0.7,
          damage: dmg,
          splash: tier.splash,
          tower: tower
        });
      } else if (tower.type === 'cryo') {
        audio.shootCryo();
        // Area pulse
        this.spawnShockwave(tower.x, tower.y, range, '#00f0ff');
        for (const target of targets) {
          target.slowRatio = tier.slow;
          target.slowTimer = tier.slowDur;
          this.applyDamage(target, dmg, 'ENERGY', tower);
        }
      } else if (tower.type === 'railgun') {
        audio.shootRailgun();
        tower.laserTimer = 0.25;
        tower.targetPoint = { x: primary.x, y: primary.y };
        const pierceCount = tier.pierce || 1;
        const hitEnemies = targets.slice(0, pierceCount);
        for (const target of hitEnemies) {
          this.applyDamage(target, dmg, 'PIERCE', tower);
        }
      }
    }

    detonateMortar(x, y, dmg, splashRadius, tower) {
      audio.hit();
      this.spawnShockwave(x, y, splashRadius, '#ff9100');
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d <= splashRadius) {
          const falloff = 1.0 - (d / splashRadius) * 0.6; // 40% at edge
          this.applyDamage(e, dmg * falloff, 'EXPLOSIVE', tower);
        }
      }
    }

    applyDamage(enemy, rawDmg, dmgType, tower) {
      let finalDmg = rawDmg;
      if (dmgType === 'KINETIC' || dmgType === 'PIERCE') {
        finalDmg = Math.max(1.0, rawDmg - enemy.armor);
      }

      // Shield absorbs first
      if (enemy.shield > 0) {
        enemy.shieldRegenTimer = 0;
        if (enemy.shield >= finalDmg) {
          enemy.shield -= finalDmg;
          this.addFloatingText(`${Math.round(finalDmg)}`, enemy.x, enemy.y - 12, '#00b0ff', 12);
          finalDmg = 0;
        } else {
          finalDmg -= enemy.shield;
          enemy.shield = 0;
        }
      }

      if (finalDmg > 0) {
        enemy.hp -= finalDmg;
        const color = dmgType === 'EXPLOSIVE' ? '#ff9100' : (dmgType === 'PIERCE' ? '#ff007f' : '#ffd600');
        this.addFloatingText(`${Math.round(finalDmg)}`, enemy.x, enemy.y - 12, color, 13);
      }

      // Enemy defeated
      if (enemy.hp <= 0) {
        this.killEnemy(enemy, tower);
      }
    }

    killEnemy(enemy, tower) {
      if (tower) tower.kills++;
      this.gold += enemy.bounty;
      this.addFloatingText(`+${enemy.bounty}g`, enemy.x, enemy.y - 20, '#ffd600', 14);

      // Trait: Splitter splits into 2 Swarmlings
      if (enemy.type === 'splitter') {
        for (let i = -1; i <= 1; i += 2) {
          const sw = {
            uid: this.nextUid++,
            type: 'swarmling',
            laneIdx: enemy.laneIdx,
            progress: Math.max(0, enemy.progress + i * 20),
            hp: 25,
            maxHp: 25,
            shield: 0,
            maxShield: 0,
            armor: 0,
            speed: 85,
            bounty: 2,
            size: 7,
            color: '#ffab00',
            isBoss: false,
            slowRatio: 0,
            slowTimer: 0,
            x: enemy.x,
            y: enemy.y,
            angle: enemy.angle
          };
          this.enemies.push(sw);
        }
      }

      // Trait: Hive Titan Enrage / Boss phase spawns
      if (enemy.type === 'hive_titan' && enemy.hp <= 0) {
        audio.victory();
      }

      this.spawnDeathParticles(enemy.x, enemy.y, enemy.color);
      this.enemies = this.enemies.filter(item => item !== enemy);
    }

    onWaveCleared() {
      this.waveActive = false;
      const map = MAPS[this.currentMapIndex];
      const bonus = 20 + this.wave * 5;
      this.gold += bonus;
      this.addFloatingText(`WAVE CLEARED! +${bonus}g`, 640, 150, '#00e676', 26);
      audio.upgrade();

      if (this.wave >= this.maxWaves) {
        this.onVictory();
      } else {
        this.wave++;
        this.waveCountdown = 10;
      }
    }

    onVictory() {
      this.state = 'VICTORY';
      audio.victory();
      const stars = (this.baseHp === this.maxBaseHp) ? 3 : (this.baseHp >= this.maxBaseHp * 0.5 ? 2 : 1);
      this.saveProgress(MAPS[this.currentMapIndex].id, stars);
    }

    onDefeat() {
      this.state = 'DEFEAT';
      audio.defeat();
    }

    // --- VISUAL FX HELPERS ---
    spawnShockwave(x, y, radius, color) {
      for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * 2 / 16) * i;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * radius * 2.2,
          vy: Math.sin(ang) * radius * 2.2,
          color: color,
          size: 3,
          life: 0.35,
          maxLife: 0.35
        });
      }
    }

    spawnDeathParticles(x, y, color) {
      for (let i = 0; i < 12; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 40 + Math.random() * 90;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          color: color,
          size: 3 + Math.random() * 3,
          life: 0.5,
          maxLife: 0.5
        });
      }
    }

    addFloatingText(text, x, y, color = '#ffffff', size = 13) {
      this.floatingTexts.push({ text, x, y, color, size, life: 1.0 });
    }

    // --- RENDERING PIPELINE ---
    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      if (this.state === 'MENU') {
        this.renderMainMenu();
        return;
      }
      if (this.state === 'MAP_SELECT') {
        this.renderMapSelect();
        return;
      }

      // In Game
      this.renderBackgroundGrid();
      this.renderLanes();
      this.renderBaseCore();
      this.renderTowers();
      this.renderEnemies();
      this.renderProjectiles();
      this.renderParticles();
      this.renderFloatingText();
      this.renderPlacementGhost();
      this.renderTopHUD();
      this.renderBottomBar();

      if (this.state === 'PAUSED') this.renderPauseModal();
      if (this.state === 'VICTORY') this.renderVictoryModal();
      if (this.state === 'DEFEAT') this.renderDefeatModal();
    }

    renderBackgroundGrid() {
      this.ctx.fillStyle = "#070b14";
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Cyber Grid Lines
      this.ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      this.ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 64) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 60);
        this.ctx.lineTo(x, 620);
        this.ctx.stroke();
      }
      for (let y = 60; y <= 620; y += 64) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.width, y);
        this.ctx.stroke();
      }
    }

    renderLanes() {
      const map = MAPS[this.currentMapIndex];
      // Path background glow
      for (const lane of map.lanes) {
        this.ctx.beginPath();
        this.ctx.moveTo(lane[0].x, lane[0].y);
        for (let i = 1; i < lane.length; i++) {
          this.ctx.lineTo(lane[i].x, lane[i].y);
        }
        this.ctx.strokeStyle = "#101b33";
        this.ctx.lineWidth = 44;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.stroke();

        this.ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      // Spawn Portal
      for (const lane of map.lanes) {
        const sp = lane[0];
        this.ctx.fillStyle = "rgba(255, 23, 68, 0.8)";
        this.ctx.beginPath();
        this.ctx.arc(sp.x, sp.y, 22, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "bold 10px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("SPAWN", sp.x, sp.y + 4);
      }
    }

    renderBaseCore() {
      const map = MAPS[this.currentMapIndex];
      const base = map.lanes[0][map.lanes[0].length - 1];
      const time = performance.now() / 600;

      // Forcefield pulse
      this.ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(base.x, base.y, 30 + Math.sin(time) * 4, 0, Math.PI * 2);
      this.ctx.stroke();

      // Reactor Core Hexagon
      this.ctx.save();
      this.ctx.translate(base.x, base.y);
      this.ctx.rotate(time * 0.5);
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const rx = Math.cos(a) * 20;
        const ry = Math.sin(a) * 20;
        if (i === 0) this.ctx.moveTo(rx, ry);
        else this.ctx.lineTo(rx, ry);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();

      // Label
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 10px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("CORE", base.x, base.y + 4);
    }

    renderTowers() {
      for (const t of this.towers) {
        const def = TOWER_DEFS[t.type];
        // Selection highlight & Range ring
        if (this.selectedTower === t) {
          const tier = def.tiers[t.tier - 1];
          const mapFog = (MAPS[this.currentMapIndex].modifier === 'fog') ? 0.85 : 1.0;
          const range = (tier.range || 130) * (t.buffRange || 1.0) * mapFog;
          this.ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
          this.ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
          this.ctx.lineWidth = 1.5;
          this.ctx.beginPath();
          this.ctx.arc(t.x, t.y, range, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();
        }

        // Beacon connection beam
        if (t.buffDmg && t.buffDmg > 1.0) {
          this.ctx.strokeStyle = "rgba(179, 136, 255, 0.3)";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(t.x, t.y, 26, 0, Math.PI * 2);
          this.ctx.stroke();
        }

        // Tower Base Pedestal
        this.ctx.fillStyle = "#162238";
        this.ctx.strokeStyle = def.color;
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(t.x - 22, t.y - 22, 44, 44);
        this.ctx.strokeRect(t.x - 22, t.y - 22, 44, 44);

        // Turret Barrel (Rotated)
        this.ctx.save();
        this.ctx.translate(t.x, t.y);
        this.ctx.rotate(t.angle);

        this.ctx.fillStyle = def.color;
        if (t.type === 'pulse') {
          this.ctx.fillRect(0, -5, 20, 10);
        } else if (t.type === 'mortar') {
          this.ctx.fillRect(-6, -8, 22, 16);
        } else if (t.type === 'cryo') {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (t.type === 'railgun') {
          this.ctx.fillRect(0, -3, 26, 6);
        } else if (t.type === 'beacon') {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 14, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();

        // Tier Star pips
        this.ctx.fillStyle = "#ffd600";
        for (let i = 0; i < t.tier; i++) {
          this.ctx.beginPath();
          this.ctx.arc(t.x - 12 + i * 12, t.y + 16, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }

        // Laser beam visual
        if (t.laserTimer > 0 && t.targetPoint) {
          this.ctx.strokeStyle = `rgba(255, 0, 127, ${t.laserTimer / 0.25})`;
          this.ctx.lineWidth = 5;
          this.ctx.beginPath();
          this.ctx.moveTo(t.x, t.y);
          this.ctx.lineTo(t.targetPoint.x, t.targetPoint.y);
          this.ctx.stroke();
        }
      }
    }

    renderEnemies() {
      for (const e of this.enemies) {
        this.ctx.save();
        this.ctx.translate(e.x, e.y);
        if (e.phased) this.ctx.globalAlpha = 0.25;

        // Status effect: Frozen tint
        if (e.slowTimer > 0) {
          this.ctx.strokeStyle = "#00f0ff";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, e.size + 4, 0, Math.PI * 2);
          this.ctx.stroke();
        }

        // Enemy Shape
        this.ctx.fillStyle = e.color;
        this.ctx.beginPath();
        if (e.type === 'brute' || e.isBoss) {
          this.ctx.fillRect(-e.size, -e.size, e.size * 2, e.size * 2);
        } else if (e.type === 'sprinter') {
          this.ctx.rotate(e.angle);
          this.ctx.moveTo(e.size * 1.5, 0);
          this.ctx.lineTo(-e.size, -e.size);
          this.ctx.lineTo(-e.size, e.size);
          this.ctx.closePath();
          this.ctx.fill();
        } else {
          this.ctx.arc(0, 0, e.size, 0, Math.PI * 2);
          this.ctx.fill();
        }

        // Shield Dome
        if (e.shield > 0) {
          this.ctx.strokeStyle = "rgba(0, 176, 255, 0.8)";
          this.ctx.lineWidth = 2.5;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, e.size + 6, 0, Math.PI * 2);
          this.ctx.stroke();
        }

        this.ctx.restore();

        // HP / Shield Bar above enemy
        const barW = Math.max(26, e.size * 2);
        const barH = 4;
        const bx = e.x - barW / 2;
        const by = e.y - e.size - 10;

        // Background
        this.ctx.fillStyle = "#0a0f1d";
        this.ctx.fillRect(bx, by, barW, barH);

        // HP fill
        const hpPct = Math.max(0, e.hp / e.maxHp);
        this.ctx.fillStyle = e.isBoss ? "#ff1744" : "#00e676";
        this.ctx.fillRect(bx, by, barW * hpPct, barH);

        // Shield fill (above HP)
        if (e.maxShield > 0) {
          const shPct = Math.max(0, e.shield / e.maxShield);
          this.ctx.fillStyle = "#00b0ff";
          this.ctx.fillRect(bx, by - 3, barW * shPct, 2);
        }
      }
    }

    renderProjectiles() {
      for (const p of this.projectiles) {
        if (p.type === 'pulse') {
          this.ctx.fillStyle = "#ffd600";
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (p.type === 'mortar') {
          // Shadow on ground
          const shadowY = p.startY + (p.targetY - p.startY) * p.t;
          this.ctx.fillStyle = "rgba(0,0,0,0.4)";
          this.ctx.beginPath();
          this.ctx.arc(p.x, shadowY, 6, 0, Math.PI * 2);
          this.ctx.fill();

          // Shell
          this.ctx.fillStyle = "#ff9100";
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    renderParticles() {
      for (const pt of this.particles) {
        this.ctx.fillStyle = pt.color;
        this.ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1.0;
    }

    renderFloatingText() {
      for (const ft of this.floatingTexts) {
        this.ctx.fillStyle = ft.color;
        this.ctx.font = `bold ${ft.size}px monospace`;
        this.ctx.textAlign = "center";
        this.ctx.globalAlpha = Math.max(0, ft.life);
        this.ctx.fillText(ft.text, ft.x, ft.y);
      }
      this.ctx.globalAlpha = 1.0;
    }

    renderPlacementGhost() {
      if (!this.selectedBuildType || !this.hoverCell) return;
      const def = TOWER_DEFS[this.selectedBuildType];
      const gx = this.hoverCell.gx;
      const gy = this.hoverCell.gy;
      const px = gx * 64 + 32;
      const py = gy * 64 + 32;

      // Range Preview
      this.ctx.strokeStyle = this.hoverCell.valid ? "rgba(0, 229, 255, 0.4)" : "rgba(255, 23, 68, 0.4)";
      this.ctx.fillStyle = this.hoverCell.valid ? "rgba(0, 229, 255, 0.08)" : "rgba(255, 23, 68, 0.08)";
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(px, py, def.tiers[0].range || 130, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Cell Ghost Box
      this.ctx.fillStyle = this.hoverCell.valid ? "rgba(0, 230, 118, 0.3)" : "rgba(255, 23, 68, 0.3)";
      this.ctx.strokeStyle = this.hoverCell.valid ? "#00e676" : "#ff1744";
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(gx * 64 + 2, gy * 64 + 2, 60, 60);
      this.ctx.strokeRect(gx * 64 + 2, gy * 64 + 2, 60, 60);
    }

    renderTopHUD() {
      // Top HUD Bar background
      this.ctx.fillStyle = "#0c1424";
      this.ctx.fillRect(0, 0, this.width, 60);
      this.ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 60);
      this.ctx.lineTo(this.width, 60);
      this.ctx.stroke();

      // Base HP
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 14px 'Segoe UI', monospace";
      this.ctx.textAlign = "left";
      this.ctx.fillText(`CORE HEALTH: ${this.baseHp} / ${this.maxBaseHp}`, 24, 25);
      const hpPct = Math.max(0, this.baseHp / this.maxBaseHp);
      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(24, 32, 160, 14);
      this.ctx.fillStyle = hpPct > 0.3 ? "#00e5ff" : "#ff1744";
      this.ctx.fillRect(24, 32, 160 * hpPct, 14);

      // Gold
      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 20px 'Segoe UI', monospace";
      this.ctx.fillText(`⚡ ${this.gold} G`, 230, 38);

      // Wave Tracker
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 16px 'Segoe UI', monospace";
      this.ctx.fillText(`WAVE ${this.wave} / ${this.maxWaves}`, 440, 37);

      // Call Wave / Countdown Button
      this.ctx.fillStyle = this.waveActive ? "#162b47" : "#00e5ff";
      this.ctx.fillRect(530, 10, 180, 40);
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.strokeRect(530, 10, 180, 40);
      this.ctx.fillStyle = this.waveActive ? "#00e5ff" : "#05070d";
      this.ctx.font = "bold 13px 'Segoe UI', monospace";
      const waveLabel = this.waveActive ? `IN BATTLE (${this.enemies.length})` : `START [${Math.ceil(this.waveCountdown)}s]`;
      this.ctx.fillText(waveLabel, 620, 35);

      // Map Name
      this.ctx.fillStyle = "#78909c";
      this.ctx.font = "12px 'Segoe UI', monospace";
      this.ctx.fillText(`SECTOR: ${MAPS[this.currentMapIndex].name.toUpperCase()}`, 860, 35);

      // Buttons: Speed, Mute, Pause
      this.renderMiniButton(1010, 12, 60, 36, `${this.speed}x`);
      this.renderMiniButton(1085, 12, 60, 36, audio.muted ? "MUTED" : "SFX");
      this.renderMiniButton(1160, 12, 60, 36, this.state === 'PAUSED' ? "RESUME" : "PAUSE");
    }

    renderMiniButton(x, y, w, h, text) {
      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(x, y, w, h);
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, w, h);
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 12px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText(text, x + w / 2, y + h / 2 + 4);
    }

    renderBottomBar() {
      // Bottom Panel
      this.ctx.fillStyle = "#0c1424";
      this.ctx.fillRect(0, 620, this.width, 100);
      this.ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 620);
      this.ctx.lineTo(this.width, 620);
      this.ctx.stroke();

      if (this.selectedTower) {
        // Selected Tower Inspector
        const t = this.selectedTower;
        const def = TOWER_DEFS[t.type];
        const tier = def.tiers[t.tier - 1];

        this.ctx.fillStyle = def.color;
        this.ctx.font = "bold 16px monospace";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`${def.name.toUpperCase()} (T${t.tier})`, 30, 655);

        this.ctx.fillStyle = "#cfd8dc";
        this.ctx.font = "12px monospace";
        const stats = t.type === 'beacon' ?
          `Aura: +${tier.dmgBuff * 100}% Dmg | Range: ${tier.range}px` :
          `Dmg: ${tier.dmg} | Rate: ${tier.rate}/s | Range: ${tier.range}px | Kills: ${t.kills}`;
        this.ctx.fillText(stats, 30, 680);

        // Upgrade button
        const upCost = tier.upCost;
        const canUpgrade = t.tier < 3 && this.gold >= upCost;
        this.ctx.fillStyle = t.tier < 3 ? (canUpgrade ? "#00e676" : "#37474f") : "#263238";
        this.ctx.fillRect(480, 640, 140, 50);
        this.ctx.fillStyle = "#000";
        this.ctx.font = "bold 12px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(t.tier < 3 ? `[U] UPGRADE (${upCost}g)` : "MAX TIER", 550, 670);

        // Sell button
        const refund = Math.floor(t.totalInvested * 0.70);
        this.ctx.fillStyle = "#ff1744";
        this.ctx.fillRect(640, 640, 120, 50);
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText(`[S] SELL (+${refund}g)`, 700, 670);

        // Target Priority button
        this.ctx.fillStyle = "#1e3a5f";
        this.ctx.fillRect(780, 640, 140, 50);
        this.ctx.strokeStyle = "#00e5ff";
        this.ctx.strokeRect(780, 640, 140, 50);
        this.ctx.fillStyle = "#00e5ff";
        this.ctx.fillText(`[T] ${t.priority}`, 850, 670);

        // Deselect [X]
        this.ctx.fillStyle = "#37474f";
        this.ctx.fillRect(940, 640, 50, 50);
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("✕", 965, 670);
      } else {
        // Tower Hotbar (5 towers)
        const towerKeys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
        this.ctx.fillStyle = "#78909c";
        this.ctx.font = "bold 12px monospace";
        this.ctx.textAlign = "left";
        this.ctx.fillText("SELECT TOWER TO DEPLOY:", 20, 670);

        for (let i = 0; i < 5; i++) {
          const key = towerKeys[i];
          const def = TOWER_DEFS[key];
          const bx = 180 + i * 185;
          const isSelected = this.selectedBuildType === key;

          this.ctx.fillStyle = isSelected ? "rgba(0, 229, 255, 0.2)" : "#131e33";
          this.ctx.fillRect(bx, 630, 170, 75);
          this.ctx.strokeStyle = isSelected ? "#00e5ff" : (this.gold >= def.cost ? def.color : "#37474f");
          this.ctx.lineWidth = isSelected ? 2 : 1;
          this.ctx.strokeRect(bx, 630, 170, 75);

          this.ctx.fillStyle = def.color;
          this.ctx.font = "bold 13px monospace";
          this.ctx.textAlign = "left";
          this.ctx.fillText(`[${i + 1}] ${def.name.split(' ')[0]}`, bx + 10, 652);

          this.ctx.fillStyle = "#ffd600";
          this.ctx.font = "bold 12px monospace";
          this.ctx.fillText(`🪙 ${def.cost}g`, bx + 10, 674);

          this.ctx.fillStyle = "#78909c";
          this.ctx.font = "10px monospace";
          this.ctx.fillText(def.type, bx + 10, 693);
        }
      }
    }

    renderMainMenu() {
      this.ctx.fillStyle = "#05070d";
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Title
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "800 48px 'Segoe UI', monospace";
      this.ctx.fillText("TOWER DEFENSE: LAST GRID", 640, 240);

      this.ctx.fillStyle = "#ff007f";
      this.ctx.font = "bold 18px 'Segoe UI', monospace";
      this.ctx.fillText("10 MAPS • 5 TOWERS • 8 ENEMIES • 3 BOSSES • 30 WAVES", 640, 290);

      this.ctx.fillStyle = "#78909c";
      this.ctx.font = "14px 'Segoe UI', monospace";
      this.ctx.fillText("Full Godot 4.3 Architecture • Real-time Canvas 2D Engine", 640, 330);

      // Launch Button
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.fillRect(480, 440, 320, 60);
      this.ctx.fillStyle = "#05070d";
      this.ctx.font = "bold 20px 'Segoe UI', monospace";
      this.ctx.fillText("DEPLOY MISSION 1", 640, 477);

      // Map Select Button
      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(480, 520, 320, 50);
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.strokeRect(480, 520, 320, 50);
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 16px 'Segoe UI', monospace";
      this.ctx.fillText("SECTOR MAP SELECT", 640, 552);
    }

    renderMapSelect() {
      this.ctx.fillStyle = "#05070d";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 24px 'Segoe UI', monospace";
      this.ctx.fillText("SELECT TACTICAL SECTOR", 60, 80);

      // Back Button
      this.renderMiniButton(60, 35, 100, 30, "← BACK");

      // Grid of 10 maps
      for (let i = 0; i < MAPS.length; i++) {
        const m = MAPS[i];
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 60 + col * 235;
        const y = 140 + row * 240;

        this.ctx.fillStyle = "#0c1527";
        this.ctx.fillRect(x, y, 220, 210);
        this.ctx.strokeStyle = "#00e5ff";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, 220, 210);

        this.ctx.fillStyle = "#00e5ff";
        this.ctx.font = "bold 15px monospace";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`0${i + 1}. ${m.name}`, x + 12, y + 30);

        this.ctx.fillStyle = "#cfd8dc";
        this.ctx.font = "11px monospace";
        this.wrapText(m.desc, x + 12, y + 60, 195, 16);

        this.ctx.fillStyle = "#ffd600";
        this.ctx.font = "11px monospace";
        this.ctx.fillText(`WAVES: ${m.wave_count} | GOLD: ${m.gold}`, x + 12, y + 150);

        // Play Button inside card
        this.ctx.fillStyle = "#00e5ff";
        this.ctx.fillRect(x + 12, y + 165, 196, 32);
        this.ctx.fillStyle = "#05070d";
        this.ctx.font = "bold 13px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("DEPLOY HERE", x + 110, y + 186);
      }
    }

    wrapText(text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = this.ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          this.ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      this.ctx.fillText(line, x, y);
    }

    renderPauseModal() {
      this.ctx.fillStyle = "rgba(5, 7, 13, 0.85)";
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 36px 'Segoe UI', monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("TACTICAL PAUSE", 640, 320);
      this.ctx.fillStyle = "#cfd8dc";
      this.ctx.font = "16px 'Segoe UI', monospace";
      this.ctx.fillText("Press [ESC] or click RESUME to return to combat.", 640, 365);
    }

    renderVictoryModal() {
      this.ctx.fillStyle = "rgba(5, 7, 13, 0.9)";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = "#00e676";
      this.ctx.font = "bold 44px 'Segoe UI', monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("SECTOR DEFENDED!", 640, 260);

      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 28px monospace";
      this.ctx.fillText("★★★ MISSION SUCCESS ★★★", 640, 320);

      this.ctx.fillStyle = "#cfd8dc";
      this.ctx.font = "16px monospace";
      this.ctx.fillText(`Core HP preserved: ${this.baseHp} / ${this.maxBaseHp}`, 640, 370);

      // Buttons
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.fillRect(460, 460, 160, 50);
      this.ctx.fillStyle = "#000";
      this.ctx.font = "bold 16px monospace";
      this.ctx.fillText("PLAY AGAIN", 540, 492);

      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(660, 460, 160, 50);
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.strokeRect(660, 460, 160, 50);
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.fillText("MAP SELECT", 740, 492);
    }

    renderDefeatModal() {
      this.ctx.fillStyle = "rgba(5, 7, 13, 0.9)";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = "#ff1744";
      this.ctx.font = "bold 44px 'Segoe UI', monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("GRID OVERRUN!", 640, 260);

      this.ctx.fillStyle = "#cfd8dc";
      this.ctx.font = "18px monospace";
      this.ctx.fillText(`Base core breached at Wave ${this.wave}.`, 640, 330);

      // Buttons
      this.ctx.fillStyle = "#ff1744";
      this.ctx.fillRect(460, 460, 160, 50);
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "bold 16px monospace";
      this.ctx.fillText("RETRY SECTOR", 540, 492);

      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(660, 460, 160, 50);
      this.ctx.strokeStyle = "#ff1744";
      this.ctx.strokeRect(660, 460, 160, 50);
      this.ctx.fillStyle = "#ff1744";
      this.ctx.fillText("MAP SELECT", 740, 492);
    }
  }

  // Auto-launch engine when DOM ready
  window.addEventListener('DOMContentLoaded', () => {
    window.lastGridEngine = new LastGridEngine();
  });

})();
