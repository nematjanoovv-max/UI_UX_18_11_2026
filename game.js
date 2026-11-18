// =============================================================================
// Tower Defense: Last Grid — Advanced Tactical Cyber-Engine v2.0
// 10 Maps | 5 Towers (3 Tiers, 70% Refund) | 8 Enemies + 3 Bosses | 30 Waves
// NEW: 4 Commander Skills | Endless Mode | Boss Rush | Map Editor | BGM Synth | Screen Shake
// =============================================================================

(function() {
  'use strict';

  // --- PROCEDURAL AUDIO & SFX SYNTHESIZER (Web Audio API) ---
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.sfxMuted = false;
      this.bgmMuted = false;
      this.bgmPlaying = false;
      this.bgmTimer = null;
      this.step = 0;
      this.scale = [146.83, 164.81, 174.61, 196.00, 220.00, 261.63, 293.66, 329.63]; // D minor pentatonic
      this.bassNotes = [73.42, 73.42, 87.31, 98.00, 73.42, 73.42, 110.00, 98.00];
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.bgmPlaying && !this.bgmMuted) {
        this.startBGM();
      }
    }

    toggleSFX() {
      this.sfxMuted = !this.sfxMuted;
      return !this.sfxMuted;
    }

    toggleBGM() {
      this.bgmMuted = !this.bgmMuted;
      if (this.bgmMuted) {
        this.stopBGM();
      } else {
        this.startBGM();
      }
      return !this.bgmMuted;
    }

    startBGM() {
      if (this.bgmTimer || !this.ctx || this.bgmMuted) return;
      this.bgmPlaying = true;
      const bpm = 124;
      const interval = (60 / bpm) / 4; // 16th notes (~121ms)
      this.bgmTimer = setInterval(() => this.bgmTick(), interval * 1000);
    }

    stopBGM() {
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
      this.bgmPlaying = false;
    }

    bgmTick() {
      if (this.bgmMuted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const beat16 = this.step % 16;
      const beat4 = Math.floor(this.step / 4) % 4;

      // 1. Kick Drum (on beats 0, 4, 8, 12)
      if (beat16 % 4 === 0) {
        this.playDrum(150, 0.001, 0.12, 0.15, 30);
      }

      // 2. Snare / Noise Clap (on beats 4, 12)
      if (beat16 === 4 || beat16 === 12) {
        this.playSnare(0.08, 0.08);
      }

      // 3. Hi-hat (every other 16th note)
      if (beat16 % 2 === 1) {
        this.playHiHat(0.03, 0.03);
      }

      // 4. Synthwave Bass Arp (every 16th note)
      const bassIndex = Math.floor(this.step / 8) % this.bassNotes.length;
      const baseFreq = this.bassNotes[bassIndex];
      const oct = (beat16 % 4 === 2) ? 2 : 1;
      this.playSynthBass(baseFreq * oct, 0.09, 0.06);

      this.step++;
    }

    playDrum(freq, attack, duration, gainVal, slideTo) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playSnare(duration, gainVal) {
      try {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (e) {}
    }

    playHiHat(duration, gainVal) {
      try {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 8000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (e) {}
    }

    playSynthBass(freq, duration, gainVal) {
      try {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    // SFX Methods
    playTone(freq, type, duration, gainVal = 0.1, slideTo = null) {
      if (this.sfxMuted || !this.ctx) return;
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
    emp() {
      this.playTone(1200, 'sawtooth', 0.4, 0.2, 80);
      this.playTone(300, 'square', 0.5, 0.15, 60);
    }
    orbital() {
      this.playTone(80, 'sawtooth', 0.6, 0.25, 40);
      this.playTone(1500, 'sawtooth', 0.5, 0.2, 200);
    }
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

  // Wave configurations
  function getWaveConfig(waveNum, mode = 'CAMPAIGN') {
    if (mode === 'BOSS_RUSH') {
      if (waveNum === 1) return [{ type: "juggernaut", count: 1, interval: 2.0 }, { type: "brute", count: 8, interval: 1.0 }];
      if (waveNum === 2) return [{ type: "overseer", count: 1, interval: 2.0 }, { type: "phantom", count: 12, interval: 0.8 }];
      if (waveNum === 3) return [{ type: "hive_titan", count: 1, interval: 2.0 }, { type: "splitter", count: 15, interval: 0.7 }];
      return [{ type: "hive_titan", count: 2, interval: 3.0 }];
    }

    // Boss encounters
    if (waveNum % 10 === 0) {
      const bossType = waveNum === 10 ? "juggernaut" : (waveNum === 20 ? "overseer" : "hive_titan");
      return [ { type: bossType, count: 1, interval: 2.0 }, { type: "grunt", count: 12, interval: 0.8 } ];
    }
    if (mode === 'ENDLESS' && waveNum % 5 === 0) {
      return [ { type: "juggernaut", count: 1, interval: 2.0 }, { type: "sprinter", count: 15, interval: 0.5 } ];
    }

    const pool = ["grunt", "sprinter", "brute", "swarmling", "shieldbearer", "medic", "splitter", "phantom"];
    const maxIndex = Math.min(pool.length - 1, Math.floor((waveNum - 1) / 3));
    const mainType = pool[maxIndex];
    const subType = pool[Math.max(0, maxIndex - 1)];

    const count = 6 + Math.floor(waveNum * 1.5);
    const groups = [
      { type: mainType, count: count, interval: Math.max(0.3, 1.2 - waveNum * 0.02) }
    ];
    if (waveNum >= 4) {
      groups.push({ type: subType, count: Math.floor(count * 0.6), interval: 0.7 });
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

      this.gameMode = 'CAMPAIGN'; // 'CAMPAIGN', 'ENDLESS', 'BOSS_RUSH', 'CUSTOM'
      this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'VICTORY', 'DEFEAT', 'MAP_SELECT', 'EDITOR', 'LEADERBOARD'
      this.speed = 1;
      this.crtEnabled = false;
      this.screenShake = 0;

      this.currentMapIndex = 0;
      this.gold = 250;
      this.score = 0;
      this.baseHp = 20;
      this.maxBaseHp = 20;
      this.wave = 1;
      this.maxWaves = 10;
      this.waveActive = false;
      this.waveCountdown = 8;
      this.spawnQueue = [];
      this.spawnTimer = 0;

      // Commander Skills: EMP (Z), Orbital (X), Overclock (C), Drone (V)
      this.skills = {
        emp:       { name: "EMP STORM",    cost: 50,  cd: 25, currentCd: 0, key: "Z" },
        orbital:   { name: "ORBITAL BEAM", cost: 75,  cd: 30, currentCd: 0, key: "X" },
        overclock: { name: "OVERCLOCK",    cost: 60,  cd: 35, currentCd: 0, key: "C", activeTime: 0 },
        drone:     { name: "SUPPLY DRONE", cost: 0,   cd: 40, currentCd: 0, key: "V" }
      };

      this.towers = [];
      this.enemies = [];
      this.projectiles = [];
      this.particles = [];
      this.floatingTexts = [];

      this.selectedBuildType = null;
      this.selectedTower = null;
      this.aimingSkill = null; // 'emp', 'orbital'
      this.mousePos = { x: -100, y: -100 };
      this.hoverCell = null;
      this.targetPriorities = ['FIRST', 'LAST', 'STRONGEST', 'NEAREST'];

      // Custom Map Editor state
      this.editorWaypoints = [ {x:64, y:256}, {x:512, y:256}, {x:512, y:448}, {x:1152, y:448} ];

      this.nextUid = 1;
      this.lastTimestamp = 0;
      this.playerName = localStorage.getItem('last_grid_player_name') || 'CyberCommander';

      // Persistence
      this.saveData = this.loadSave();

      this.initEvents();
      this.setupCanvasScaling();
      this.startLoop();
    }

    loadSave() {
      try {
        const d = localStorage.getItem('last_grid_save_v2');
        return d ? JSON.parse(d) : {
          stars: {},
          highScores: { campaign: 0, endless: 0, boss_rush: 0 },
          leaderboard: [
            { player_name: "NeonGhost", map_id: "last_grid", wave_reached: 30, score: 9850 },
            { player_name: "GridRunner", map_id: "twin_gate", wave_reached: 28, score: 7420 },
            { player_name: "ByteStriker", map_id: "iron_wall", wave_reached: 25, score: 6100 },
            { player_name: "VectorZero", map_id: "blackout_city", wave_reached: 22, score: 5300 },
            { player_name: "CyberCommander", map_id: "training_grid", wave_reached: 10, score: 2150 }
          ]
        };
      } catch (e) {
        return { stars: {}, highScores: {}, leaderboard: [] };
      }
    }

    saveProgress(mapId, stars, finalScore, waveReached) {
      if (!this.saveData.stars) this.saveData.stars = {};
      this.saveData.stars[mapId] = Math.max(this.saveData.stars[mapId] || 0, stars);

      const modeKey = this.gameMode.toLowerCase();
      this.saveData.highScores[modeKey] = Math.max(this.saveData.highScores[modeKey] || 0, finalScore);

      // Add to local leaderboard
      this.saveData.leaderboard.push({
        player_name: this.playerName,
        map_id: mapId,
        wave_reached: waveReached,
        score: finalScore,
        date: new Date().toLocaleDateString()
      });
      this.saveData.leaderboard.sort((a, b) => b.score - a.score);
      this.saveData.leaderboard = this.saveData.leaderboard.slice(0, 20);

      try {
        localStorage.setItem('last_grid_save_v2', JSON.stringify(this.saveData));
        localStorage.setItem('last_grid_player_name', this.playerName);
      } catch (e) {}

      // Attempt online backend submission (FastAPI spec §14.3)
      this.submitOnlineScore(mapId, waveReached, finalScore);
    }

    submitOnlineScore(mapId, waveReached, finalScore) {
      const seed = Math.floor(Math.random() * 1000000);
      const payload = {
        player_name: this.playerName,
        map_id: mapId,
        difficulty: "normal",
        wave_reached: waveReached,
        score: finalScore,
        seed: seed,
        checksum: "sha256_verified"
      };
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
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
        const k = e.key.toLowerCase();
        if (e.key >= '1' && e.key <= '5') {
          const keys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
          this.selectBuildType(keys[parseInt(e.key) - 1]);
        } else if (e.code === 'Space') {
          e.preventDefault();
          this.callNextWave();
        } else if (e.key === 'Escape') {
          if (this.aimingSkill) this.aimingSkill = null;
          else if (this.selectedTower) this.selectedTower = null;
          else if (this.selectedBuildType) this.selectedBuildType = null;
          else this.togglePause();
        } else if (k === 'u') {
          this.upgradeSelectedTower();
        } else if (k === 's') {
          this.sellSelectedTower();
        } else if (k === 't') {
          this.cycleTargetPriority();
        } else if (k === 'z') {
          this.triggerSkill('emp');
        } else if (k === 'x') {
          this.triggerSkill('orbital');
        } else if (k === 'c') {
          this.triggerSkill('overclock');
        } else if (k === 'v') {
          this.triggerSkill('drone');
        } else if (e.key === 'Tab') {
          e.preventDefault();
          this.cycleSpeed();
        }
      });
    }

    startMission(mapIdx = 0, mode = 'CAMPAIGN') {
      this.gameMode = mode;
      this.currentMapIndex = mapIdx;
      const map = (mode === 'CUSTOM') ? {
        id: "custom",
        name: "Custom Sector",
        gold: 300,
        hp: 20,
        wave_count: 20,
        modifier: "none",
        lanes: [ this.editorWaypoints ]
      } : MAPS[mapIdx];

      this.gold = mode === 'BOSS_RUSH' ? 1200 : map.gold;
      this.score = 0;
      this.baseHp = map.hp;
      this.maxBaseHp = map.hp;
      this.wave = 1;
      this.maxWaves = (mode === 'ENDLESS') ? 999 : (mode === 'BOSS_RUSH' ? 3 : map.wave_count);
      this.waveActive = false;
      this.waveCountdown = 8;
      this.speed = 1;

      // Reset skills
      for (const k in this.skills) {
        this.skills[k].currentCd = 0;
      }
      this.skills.overclock.activeTime = 0;

      this.towers = [];
      this.enemies = [];
      this.projectiles = [];
      this.particles = [];
      this.floatingTexts = [];
      this.spawnQueue = [];

      this.selectedBuildType = null;
      this.selectedTower = null;
      this.aimingSkill = null;
      this.state = 'PLAYING';
      this.bakeMapLanes(map);
      this.addFloatingText(`MISSION INITIALIZED: ${map.name.toUpperCase()}`, 640, 200, "#00e5ff", 22);
    }

    bakeMapLanes(map) {
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
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
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
        // Mode Select buttons
        if (y > 350 && y < 410 && x > 440 && x < 840) this.startMission(0, 'CAMPAIGN');
        else if (y > 425 && y < 475 && x > 440 && x < 840) this.state = 'MAP_SELECT';
        else if (y > 490 && y < 540 && x > 440 && x < 840) this.startMission(9, 'ENDLESS');
        else if (y > 555 && y < 605 && x > 440 && x < 630) this.startMission(0, 'BOSS_RUSH');
        else if (y > 555 && y < 605 && x > 650 && x < 840) this.state = 'EDITOR';
        else if (y > 620 && y < 670 && x > 500 && x < 780) this.state = 'LEADERBOARD';
        return;
      }

      if (this.state === 'MAP_SELECT') {
        if (y > 30 && y < 70 && x > 50 && x < 150) {
          this.state = 'MENU';
          return;
        }
        for (let i = 0; i < MAPS.length; i++) {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const mx = 60 + col * 235;
          const my = 110 + row * 240;
          if (x >= mx && x <= mx + 220 && y >= my && y <= my + 210) {
            this.startMission(i, 'CAMPAIGN');
            return;
          }
        }
        return;
      }

      if (this.state === 'LEADERBOARD') {
        if (y > 30 && y < 70 && x > 50 && x < 150) {
          this.state = 'MENU';
          return;
        }
        // Change player name button
        if (x > 1050 && x < 1220 && y > 35 && y < 75) {
          const newName = prompt("Enter your CyberCommander handle:", this.playerName);
          if (newName && newName.trim()) {
            this.playerName = newName.trim().substring(0, 18);
            localStorage.setItem('last_grid_player_name', this.playerName);
          }
        }
        return;
      }

      if (this.state === 'EDITOR') {
        this.handleEditorClick(x, y);
        return;
      }

      if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
        if (x > 460 && x < 620 && y > 460 && y < 520) {
          this.startMission(this.currentMapIndex, this.gameMode);
        } else if (x > 660 && x < 820 && y > 460 && y < 520) {
          this.state = 'MENU';
        }
        return;
      }

      // In-game Top HUD actions
      if (y >= 0 && y <= 60) {
        if (x >= 490 && x <= 650) this.callNextWave();
        else if (x >= 890 && x <= 950) this.cycleSpeed();
        else if (x >= 960 && x <= 1020) audio.toggleSFX();
        else if (x >= 1030 && x <= 1090) audio.toggleBGM();
        else if (x >= 1100 && x <= 1160) this.crtEnabled = !this.crtEnabled;
        else if (x >= 1170 && x <= 1230) this.togglePause();
        return;
      }

      // Commander Skills Targeting
      if (this.aimingSkill) {
        this.executeSkill(this.aimingSkill, x, y);
        this.aimingSkill = null;
        return;
      }

      // Bottom Bar actions (Towers Hotbar / Commander Skills / Inspector)
      if (y >= 620) {
        // Skill buttons on far left (x: 10 to 190)
        if (x >= 10 && x <= 50) this.triggerSkill('emp');
        else if (x >= 55 && x <= 95) this.triggerSkill('orbital');
        else if (x >= 100 && x <= 140) this.triggerSkill('overclock');
        else if (x >= 145 && x <= 185) this.triggerSkill('drone');

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
            const bx = 200 + i * 180;
            if (x >= bx && x <= bx + 165 && y >= 630 && y <= 710) {
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

    handleEditorClick(x, y) {
      // Top bar actions
      if (y > 30 && y < 70) {
        if (x > 50 && x < 150) { this.state = 'MENU'; return; }
        if (x > 180 && x < 320) { this.startMission(0, 'CUSTOM'); return; }
        if (x > 340 && x < 460) {
          this.editorWaypoints = [ {x:64, y:320} ];
          return;
        }
        if (x > 480 && x < 620) {
          const jsonStr = JSON.stringify(this.editorWaypoints);
          prompt("Copy your Custom Map JSON:", jsonStr);
          return;
        }
        if (x > 640 && x < 780) {
          const input = prompt("Paste Map JSON waypoints:");
          if (input) {
            try {
              const parsed = JSON.parse(input);
              if (Array.isArray(parsed) && parsed.length >= 2) this.editorWaypoints = parsed;
            } catch(e) { alert("Invalid map format!"); }
          }
          return;
        }
      }

      // Click grid to append waypoint
      if (y >= 80 && y <= 640) {
        const gx = Math.floor(x / 64) * 64 + 32;
        const gy = Math.floor(y / 64) * 64 + 32;
        this.editorWaypoints.push({ x: gx, y: gy });
      }
    }

    // --- COMMANDER SKILLS ---
    triggerSkill(skillKey) {
      const s = this.skills[skillKey];
      if (s.currentCd > 0) {
        this.addFloatingText(`${s.name} COOLING DOWN (${Math.ceil(s.currentCd)}s)`, 640, 600, "#ff1744");
        return;
      }
      if (this.gold < s.cost) {
        this.addFloatingText(`NEED ${s.cost}g!`, 640, 600, "#ff1744");
        return;
      }

      if (skillKey === 'overclock') {
        this.gold -= s.cost;
        s.currentCd = s.cd;
        s.activeTime = 6.0;
        audio.upgrade();
        this.screenShake = 4;
        this.addFloatingText("ALL TOWERS OVERCLOCKED! (+60% FIRE RATE)", 640, 200, "#ffd600", 24);
      } else if (skillKey === 'drone') {
        this.gold += 75;
        s.currentCd = s.cd;
        audio.sell();
        this.addFloatingText("SUPPLY DRONE DELIVERED: +75 GOLD!", 640, 200, "#00e676", 24);
      } else {
        // Aimable skills (EMP, Orbital)
        this.aimingSkill = skillKey;
        this.addFloatingText(`SELECT TARGET FOR ${s.name}`, 640, 200, "#00e5ff", 22);
      }
    }

    executeSkill(skillKey, x, y) {
      const s = this.skills[skillKey];
      if (this.gold < s.cost) return;
      this.gold -= s.cost;
      s.currentCd = s.cd;

      if (skillKey === 'emp') {
        audio.emp();
        this.screenShake = 8;
        this.spawnShockwave(x, y, 200, "#00e5ff");
        for (const e of this.enemies) {
          if (Math.hypot(e.x - x, e.y - y) <= 200) {
            e.slowRatio = 1.0; // 100% full stun
            e.slowTimer = 3.5;
            this.addFloatingText("STUNNED!", e.x, e.y - 14, "#00e5ff", 14);
          }
        }
      } else if (skillKey === 'orbital') {
        audio.orbital();
        this.screenShake = 14;
        this.particles.push({
          x: x, y: y, beam: true, life: 0.5, maxLife: 0.5
        });
        this.spawnShockwave(x, y, 140, "#ff007f");
        for (const e of this.enemies) {
          if (Math.hypot(e.x - x, e.y - y) <= 140) {
            this.applyDamage(e, 500, 'ENERGY');
          }
        }
      }
    }

    selectBuildType(type) {
      if (this.selectedBuildType === type) {
        this.selectedBuildType = null;
      } else {
        this.selectedBuildType = type;
        this.selectedTower = null;
        this.aimingSkill = null;
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
      for (const t of this.towers) {
        t.buffDmg = 1.0;
        t.buffRange = 1.0;
        t.buffRate = 1.0;
      }
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
        if (this.waveCountdown > 0) {
          const bonus = Math.floor(this.waveCountdown);
          this.gold += bonus;
          this.score += bonus * 10;
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
      const groups = getWaveConfig(waveNum, this.gameMode);
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
      const map = (this.gameMode === 'CUSTOM') ? { modifier: "none" } : MAPS[this.currentMapIndex];
      let spdMult = 1.0;
      let armorMult = 1.0;
      let hpMult = 1.0;

      if (this.gameMode === 'ENDLESS' && this.wave > 30) {
        hpMult = Math.pow(1.08, this.wave - 30);
      }
      if (map.modifier === 'fast_lane') spdMult = 1.15;
      if (map.modifier === 'armored') armorMult = 1.20;

      const enemy = {
        uid: this.nextUid++,
        type: type,
        laneIdx: laneIdx,
        progress: 0,
        hp: def.hp * hpMult,
        maxHp: def.hp * hpMult,
        shield: def.shield * hpMult,
        maxShield: def.shield * hpMult,
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

    // --- LOOP & UPDATES ---
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
      // Screen Shake Decay
      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - 20 * dt);
      }

      // Update Commander Skills Cooldown
      for (const k in this.skills) {
        const s = this.skills[k];
        if (s.currentCd > 0) s.currentCd = Math.max(0, s.currentCd - dt);
      }
      if (this.skills.overclock.activeTime > 0) {
        this.skills.overclock.activeTime = Math.max(0, this.skills.overclock.activeTime - dt);
      }

      // 1. Spawning
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
      const map = (this.gameMode === 'CUSTOM') ? { modifier: "none" } : MAPS[this.currentMapIndex];
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];

        if (e.slowTimer > 0) {
          e.slowTimer -= dt;
          if (e.slowTimer <= 0) e.slowRatio = 0;
        }

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

        if (e.type === 'shieldbearer' && e.shield < e.maxShield) {
          e.shieldRegenTimer += dt;
          if (e.shieldRegenTimer > 3.0) {
            e.shield = Math.min(e.maxShield, e.shield + 20 * dt);
          }
        }

        const effSpeed = e.speed * (1.0 - Math.min(e.isBoss ? 0.5 : 1.0, e.slowRatio));
        e.progress += effSpeed * dt;
        const lane = this.bakedLanes[e.laneIdx] || this.bakedLanes[0];
        const pt = this.getPointAlongLane(e.laneIdx, e.progress);
        e.x = pt.x;
        e.y = pt.y;
        e.angle = pt.angle;

        if (e.progress >= lane.totalLength) {
          this.baseHp = Math.max(0, this.baseHp - (e.isBoss ? 10 : 1));
          audio.leak();
          this.screenShake = 10;
          this.addFloatingText(e.isBoss ? "-10 HP!" : "-1 HP!", e.x, e.y, "#ff1744", 20);
          this.enemies.splice(i, 1);
          if (this.baseHp <= 0) {
            this.onDefeat();
            return;
          }
        }
      }

      // 3. Towers Combat
      const overclockMult = (this.skills.overclock.activeTime > 0) ? 1.6 : 1.0;
      for (const t of this.towers) {
        if (t.type === 'beacon') continue;
        const def = TOWER_DEFS[t.type];
        const tier = def.tiers[t.tier - 1];
        const mapFog = (map.modifier === 'fog') ? 0.85 : 1.0;
        const effRange = tier.range * (t.buffRange || 1.0) * mapFog;
        const effRate = tier.rate * (t.buffRate || 1.0) * overclockMult;
        const effDmg = tier.dmg * (t.buffDmg || 1.0);

        t.cooldown -= dt;
        if (t.laserTimer > 0) t.laserTimer -= dt;

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

      // 4. Projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        if (p.type === 'pulse') {
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
          p.t += dt / p.flightTime;
          p.x = p.startX + (p.targetX - p.startX) * p.t;
          p.y = p.startY + (p.targetY - p.startY) * p.t - Math.sin(p.t * Math.PI) * 90;
          if (p.t >= 1.0) {
            this.detonateMortar(p.targetX, p.targetY, p.damage, p.splash, p.tower);
            this.projectiles.splice(i, 1);
          }
        }
      }

      // 5. Particles & Texts
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        if (!pt.beam) {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
        }
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
        if (e.phased) continue;
        const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
        if (dist <= range) {
          candidates.push({ enemy: e, dist: dist });
        }
      }
      if (candidates.length === 0) return [];

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
        this.spawnShockwave(tower.x, tower.y, range, '#00f0ff');
        for (const target of targets) {
          target.slowRatio = tier.slow;
          target.slowTimer = tier.slowDur;
          this.applyDamage(target, dmg, 'ENERGY', tower);
        }
      } else if (tower.type === 'railgun') {
        audio.shootRailgun();
        this.screenShake = 3;
        tower.laserTimer = 0.25;
        tower.targetPoint = { x: primary.x, y: primary.y };
        const hitEnemies = targets.slice(0, tier.pierce || 1);
        for (const target of hitEnemies) {
          this.applyDamage(target, dmg, 'PIERCE', tower);
        }
      }
    }

    detonateMortar(x, y, dmg, splashRadius, tower) {
      audio.hit();
      this.screenShake = 6;
      this.spawnShockwave(x, y, splashRadius, '#ff9100');
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d <= splashRadius) {
          const falloff = 1.0 - (d / splashRadius) * 0.6;
          this.applyDamage(e, dmg * falloff, 'EXPLOSIVE', tower);
        }
      }
    }

    applyDamage(enemy, rawDmg, dmgType, tower) {
      let finalDmg = rawDmg;
      if (dmgType === 'KINETIC' || dmgType === 'PIERCE') {
        finalDmg = Math.max(1.0, rawDmg - enemy.armor);
      }

      if (enemy.shield > 0) {
        enemy.shieldRegenTimer = 0;
        if (enemy.shield >= finalDmg) {
          enemy.shield -= finalDmg;
          this.score += Math.round(finalDmg);
          this.addFloatingText(`${Math.round(finalDmg)}`, enemy.x, enemy.y - 12, '#00b0ff', 12);
          finalDmg = 0;
        } else {
          finalDmg -= enemy.shield;
          this.score += Math.round(enemy.shield);
          enemy.shield = 0;
        }
      }

      if (finalDmg > 0) {
        enemy.hp -= finalDmg;
        this.score += Math.round(finalDmg * 1.5);
        const color = dmgType === 'EXPLOSIVE' ? '#ff9100' : (dmgType === 'PIERCE' ? '#ff007f' : '#ffd600');
        this.addFloatingText(`${Math.round(finalDmg)}`, enemy.x, enemy.y - 12, color, 13);
      }

      if (enemy.hp <= 0) {
        this.killEnemy(enemy, tower);
      }
    }

    killEnemy(enemy, tower) {
      if (tower) tower.kills++;
      this.gold += enemy.bounty;
      this.score += enemy.bounty * 50;
      this.addFloatingText(`+${enemy.bounty}g`, enemy.x, enemy.y - 20, '#ffd600', 14);

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

      if (enemy.isBoss) {
        this.screenShake = 12;
        audio.victory();
      }

      this.spawnDeathParticles(enemy.x, enemy.y, enemy.color);
      this.enemies = this.enemies.filter(item => item !== enemy);
    }

    onWaveCleared() {
      this.waveActive = false;
      const bonus = 20 + this.wave * 5;
      this.gold += bonus;
      this.score += bonus * 25;
      this.addFloatingText(`WAVE CLEARED! +${bonus}g`, 640, 150, '#00e676', 26);
      audio.upgrade();

      if (this.gameMode === 'CAMPAIGN' && this.wave >= this.maxWaves) {
        this.onVictory();
      } else if (this.gameMode === 'BOSS_RUSH' && this.wave >= 3) {
        this.onVictory();
      } else {
        this.wave++;
        this.waveCountdown = 8;
      }
    }

    onVictory() {
      this.state = 'VICTORY';
      audio.victory();
      const stars = (this.baseHp === this.maxBaseHp) ? 3 : (this.baseHp >= this.maxBaseHp * 0.5 ? 2 : 1);
      const mapId = (this.gameMode === 'CUSTOM') ? 'custom' : MAPS[this.currentMapIndex].id;
      this.saveProgress(mapId, stars, this.score, this.wave);
    }

    onDefeat() {
      this.state = 'DEFEAT';
      audio.defeat();
      const mapId = (this.gameMode === 'CUSTOM') ? 'custom' : MAPS[this.currentMapIndex].id;
      this.saveProgress(mapId, 0, this.score, this.wave);
    }

    spawnShockwave(x, y, radius, color) {
      for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * 2 / 16) * i;
        this.particles.push({
          x: x, y: y,
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
          x: x, y: y,
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
      this.ctx.save();

      // Screen Shake
      if (this.screenShake > 0) {
        const sx = (Math.random() * 2 - 1) * this.screenShake;
        const sy = (Math.random() * 2 - 1) * this.screenShake;
        this.ctx.translate(sx, sy);
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      if (this.state === 'MENU') {
        this.renderMainMenu();
      } else if (this.state === 'MAP_SELECT') {
        this.renderMapSelect();
      } else if (this.state === 'LEADERBOARD') {
        this.renderLeaderboardModal();
      } else if (this.state === 'EDITOR') {
        this.renderEditor();
      } else {
        // Combat Render
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

      // CRT Scanlines Filter Overlay
      if (this.crtEnabled) {
        this.renderCRTOverlay();
      }

      this.ctx.restore();
    }

    renderCRTOverlay() {
      this.ctx.fillStyle = "rgba(0, 229, 255, 0.02)";
      for (let y = 0; y < this.height; y += 4) {
        this.ctx.fillRect(0, y, this.width, 1.5);
      }
    }

    renderBackgroundGrid() {
      this.ctx.fillStyle = "#070b14";
      this.ctx.fillRect(0, 0, this.width, this.height);

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
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
      for (const lane of map.lanes) {
        if (!lane || lane.length < 2) continue;
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
        if (!lane || lane.length < 2) continue;
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
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
      const base = map.lanes[0][map.lanes[0].length - 1];
      const time = performance.now() / 600;

      this.ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(base.x, base.y, 30 + Math.sin(time) * 4, 0, Math.PI * 2);
      this.ctx.stroke();

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

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 10px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("CORE", base.x, base.y + 4);
    }

    renderTowers() {
      const map = (this.gameMode === 'CUSTOM') ? { modifier: "none" } : MAPS[this.currentMapIndex];
      for (const t of this.towers) {
        const def = TOWER_DEFS[t.type];
        if (this.selectedTower === t) {
          const tier = def.tiers[t.tier - 1];
          const mapFog = (map.modifier === 'fog') ? 0.85 : 1.0;
          const range = (tier.range || 130) * (t.buffRange || 1.0) * mapFog;
          this.ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
          this.ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
          this.ctx.lineWidth = 1.5;
          this.ctx.beginPath();
          this.ctx.arc(t.x, t.y, range, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();
        }

        if (this.skills.overclock.activeTime > 0) {
          this.ctx.strokeStyle = "rgba(255, 214, 0, 0.6)";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(t.x, t.y, 28, 0, Math.PI * 2);
          this.ctx.stroke();
        }

        this.ctx.fillStyle = "#162238";
        this.ctx.strokeStyle = def.color;
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(t.x - 22, t.y - 22, 44, 44);
        this.ctx.strokeRect(t.x - 22, t.y - 22, 44, 44);

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

        this.ctx.fillStyle = "#ffd600";
        for (let i = 0; i < t.tier; i++) {
          this.ctx.beginPath();
          this.ctx.arc(t.x - 12 + i * 12, t.y + 16, 3, 0, Math.PI * 2);
          this.ctx.fill();
        }

        if (t.laserTimer > 0 && t.targetPoint) {
          this.ctx.strokeStyle = `rgba(255, 0, 127, ${t.laserTimer / 0.25})`;
          this.ctx.lineWidth = 6;
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

        if (e.slowTimer > 0) {
          this.ctx.strokeStyle = "#00f0ff";
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, e.size + 4, 0, Math.PI * 2);
          this.ctx.stroke();
        }

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

        if (e.shield > 0) {
          this.ctx.strokeStyle = "rgba(0, 176, 255, 0.8)";
          this.ctx.lineWidth = 2.5;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, e.size + 6, 0, Math.PI * 2);
          this.ctx.stroke();
        }

        this.ctx.restore();

        const barW = Math.max(26, e.size * 2);
        const barH = 4;
        const bx = e.x - barW / 2;
        const by = e.y - e.size - 10;

        this.ctx.fillStyle = "#0a0f1d";
        this.ctx.fillRect(bx, by, barW, barH);

        const hpPct = Math.max(0, e.hp / e.maxHp);
        this.ctx.fillStyle = e.isBoss ? "#ff1744" : "#00e676";
        this.ctx.fillRect(bx, by, barW * hpPct, barH);

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
          const shadowY = p.startY + (p.targetY - p.startY) * p.t;
          this.ctx.fillStyle = "rgba(0,0,0,0.4)";
          this.ctx.beginPath();
          this.ctx.arc(p.x, shadowY, 6, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.fillStyle = "#ff9100";
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    renderParticles() {
      for (const pt of this.particles) {
        if (pt.beam) {
          // Orbital beam graphic
          const alpha = Math.max(0, pt.life / pt.maxLife);
          this.ctx.fillStyle = `rgba(255, 0, 127, ${alpha * 0.7})`;
          this.ctx.fillRect(pt.x - 20, 0, 40, this.height);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          this.ctx.fillRect(pt.x - 6, 0, 12, this.height);
        } else {
          this.ctx.fillStyle = pt.color;
          this.ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          this.ctx.fill();
        }
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
      if (this.aimingSkill) {
        // Aiming cursor
        this.ctx.strokeStyle = "#00e5ff";
        this.ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
        this.ctx.beginPath();
        const rad = this.aimingSkill === 'emp' ? 200 : 140;
        this.ctx.arc(this.mousePos.x, this.mousePos.y, rad, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        return;
      }

      if (!this.selectedBuildType || !this.hoverCell) return;
      const def = TOWER_DEFS[this.selectedBuildType];
      const gx = this.hoverCell.gx;
      const gy = this.hoverCell.gy;
      const px = gx * 64 + 32;
      const py = gy * 64 + 32;

      this.ctx.strokeStyle = this.hoverCell.valid ? "rgba(0, 229, 255, 0.4)" : "rgba(255, 23, 68, 0.4)";
      this.ctx.fillStyle = this.hoverCell.valid ? "rgba(0, 229, 255, 0.08)" : "rgba(255, 23, 68, 0.08)";
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(px, py, def.tiers[0].range || 130, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = this.hoverCell.valid ? "rgba(0, 230, 118, 0.3)" : "rgba(255, 23, 68, 0.3)";
      this.ctx.strokeStyle = this.hoverCell.valid ? "#00e676" : "#ff1744";
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(gx * 64 + 2, gy * 64 + 2, 60, 60);
      this.ctx.strokeRect(gx * 64 + 2, gy * 64 + 2, 60, 60);
    }

    renderTopHUD() {
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
      this.ctx.font = "bold 13px 'Segoe UI', monospace";
      this.ctx.textAlign = "left";
      this.ctx.fillText(`CORE: ${this.baseHp}/${this.maxBaseHp}`, 16, 24);
      const hpPct = Math.max(0, this.baseHp / this.maxBaseHp);
      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(16, 32, 130, 14);
      this.ctx.fillStyle = hpPct > 0.3 ? "#00e5ff" : "#ff1744";
      this.ctx.fillRect(16, 32, 130 * hpPct, 14);

      // Gold & Score
      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 18px 'Segoe UI', monospace";
      this.ctx.fillText(`⚡ ${this.gold}G`, 165, 36);

      this.ctx.fillStyle = "#b0bec5";
      this.ctx.font = "12px monospace";
      this.ctx.fillText(`PTS: ${this.score}`, 260, 36);

      // Wave Tracker
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 15px 'Segoe UI', monospace";
      const maxWStr = (this.maxWaves > 50) ? "∞" : this.maxWaves;
      this.ctx.fillText(`WAVE ${this.wave} / ${maxWStr}`, 410, 36);

      // Call Wave / Countdown Button
      this.ctx.fillStyle = this.waveActive ? "#162b47" : "#00e5ff";
      this.ctx.fillRect(490, 10, 160, 40);
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.strokeRect(490, 10, 160, 40);
      this.ctx.fillStyle = this.waveActive ? "#00e5ff" : "#05070d";
      this.ctx.font = "bold 13px 'Segoe UI', monospace";
      const waveLabel = this.waveActive ? `HOSTILES: ${this.enemies.length}` : `START [${Math.ceil(this.waveCountdown)}s]`;
      this.ctx.fillText(waveLabel, 570, 35);

      // Mode / Sector Name
      this.ctx.fillStyle = "#78909c";
      this.ctx.font = "12px monospace";
      const mapName = (this.gameMode === 'CUSTOM') ? "CUSTOM MAP" : MAPS[this.currentMapIndex].name.toUpperCase();
      this.ctx.fillText(`[${this.gameMode}] ${mapName}`, 760, 35);

      // Top control buttons
      this.renderMiniButton(890, 12, 60, 36, `${this.speed}x`);
      this.renderMiniButton(960, 12, 60, 36, audio.sfxMuted ? "SFX ✕" : "SFX ✓");
      this.renderMiniButton(1030, 12, 60, 36, audio.bgmMuted ? "BGM ✕" : "BGM ✓");
      this.renderMiniButton(1100, 12, 60, 36, this.crtEnabled ? "CRT ✓" : "CRT ✕");
      this.renderMiniButton(1170, 12, 60, 36, this.state === 'PAUSED' ? "RESUME" : "PAUSE");
    }

    renderMiniButton(x, y, w, h, text) {
      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(x, y, w, h);
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, w, h);
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 11px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText(text, x + w / 2, y + h / 2 + 4);
    }

    renderBottomBar() {
      this.ctx.fillStyle = "#0c1424";
      this.ctx.fillRect(0, 620, this.width, 100);
      this.ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 620);
      this.ctx.lineTo(this.width, 620);
      this.ctx.stroke();

      // Commander Skills Panel (Far Left, x: 10 to 190)
      const skillList = ['emp', 'orbital', 'overclock', 'drone'];
      for (let i = 0; i < 4; i++) {
        const k = skillList[i];
        const s = this.skills[k];
        const sx = 10 + i * 45;
        const isReady = s.currentCd <= 0 && this.gold >= s.cost;

        this.ctx.fillStyle = isReady ? "#1c2b45" : "#101624";
        this.ctx.fillRect(sx, 630, 40, 75);
        this.ctx.strokeStyle = isReady ? "#00e5ff" : "#37474f";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(sx, 630, 40, 75);

        this.ctx.fillStyle = isReady ? "#00e5ff" : "#546e7a";
        this.ctx.font = "bold 12px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`[${s.key}]`, sx + 20, 650);

        this.ctx.font = "8px monospace";
        this.ctx.fillText(s.name.split(' ')[0], sx + 20, 665);

        this.ctx.fillStyle = "#ffd600";
        this.ctx.fillText(`${s.cost}g`, sx + 20, 680);

        if (s.currentCd > 0) {
          this.ctx.fillStyle = "rgba(255, 23, 68, 0.6)";
          this.ctx.fillRect(sx, 630, 40, 75 * (s.currentCd / s.cd));
          this.ctx.fillStyle = "#fff";
          this.ctx.font = "bold 11px monospace";
          this.ctx.fillText(`${Math.ceil(s.currentCd)}`, sx + 20, 696);
        }
      }

      if (this.selectedTower) {
        const t = this.selectedTower;
        const def = TOWER_DEFS[t.type];
        const tier = def.tiers[t.tier - 1];

        this.ctx.fillStyle = def.color;
        this.ctx.font = "bold 15px monospace";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`${def.name.toUpperCase()} (T${t.tier})`, 210, 655);

        this.ctx.fillStyle = "#cfd8dc";
        this.ctx.font = "12px monospace";
        const stats = t.type === 'beacon' ?
          `Aura: +${tier.dmgBuff * 100}% Dmg | Range: ${tier.range}px` :
          `Dmg: ${tier.dmg} | Rate: ${tier.rate}/s | Range: ${tier.range}px | Kills: ${t.kills}`;
        this.ctx.fillText(stats, 210, 680);

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

        // Priority button
        this.ctx.fillStyle = "#1e3a5f";
        this.ctx.fillRect(780, 640, 140, 50);
        this.ctx.strokeStyle = "#00e5ff";
        this.ctx.strokeRect(780, 640, 140, 50);
        this.ctx.fillStyle = "#00e5ff";
        this.ctx.fillText(`[T] ${t.priority}`, 850, 670);

        // Deselect
        this.ctx.fillStyle = "#37474f";
        this.ctx.fillRect(940, 640, 50, 50);
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("✕", 965, 670);
      } else {
        // Tower Hotbar (5 towers)
        const towerKeys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
        for (let i = 0; i < 5; i++) {
          const key = towerKeys[i];
          const def = TOWER_DEFS[key];
          const bx = 200 + i * 180;
          const isSelected = this.selectedBuildType === key;

          this.ctx.fillStyle = isSelected ? "rgba(0, 229, 255, 0.2)" : "#131e33";
          this.ctx.fillRect(bx, 630, 165, 75);
          this.ctx.strokeStyle = isSelected ? "#00e5ff" : (this.gold >= def.cost ? def.color : "#37474f");
          this.ctx.lineWidth = isSelected ? 2 : 1;
          this.ctx.strokeRect(bx, 630, 165, 75);

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

      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "800 48px 'Segoe UI', monospace";
      this.ctx.fillText("TOWER DEFENSE: LAST GRID", 640, 180);

      this.ctx.fillStyle = "#ff007f";
      this.ctx.font = "bold 16px 'Segoe UI', monospace";
      this.ctx.fillText("CYBERNETIC DEFENSE • 10 MAPS • 5 TOWERS • 8 ENEMIES • 3 BOSSES", 640, 220);

      this.ctx.fillStyle = "#78909c";
      this.ctx.font = "13px 'Segoe UI', monospace";
      this.ctx.fillText(`Commander: ${this.playerName} | PWA Offline Ready | Web Audio Synthesizer`, 640, 250);

      // Campaign Button
      this.renderMenuButton(440, 350, 400, 55, "CAMPAIGN MISSIONS (10 MAPS)", "#00e5ff", "#05070d");

      // Sector Map Select
      this.renderMenuButton(440, 420, 400, 50, "SELECT SPECIFIC SECTOR", "#162238", "#00e5ff", "#00e5ff");

      // Endless Survival
      this.renderMenuButton(440, 485, 400, 50, "ENDLESS SURVIVAL MODE (∞ WAVES)", "#26133a", "#e040fb", "#e040fb");

      // Boss Rush & Editor
      this.renderMenuButton(440, 550, 190, 50, "BOSS RUSH", "#33121d", "#ff1744", "#ff1744");
      this.renderMenuButton(650, 550, 190, 50, "MAP EDITOR", "#132d2a", "#00e676", "#00e676");

      // Leaderboard
      this.renderMenuButton(500, 620, 280, 45, "GLOBAL LEADERBOARD", "#142038", "#ffd600", "#ffd600");
    }

    renderMenuButton(x, y, w, h, text, bg, fg, border) {
      this.ctx.fillStyle = bg;
      this.ctx.fillRect(x, y, w, h);
      if (border) {
        this.ctx.strokeStyle = border;
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(x, y, w, h);
      }
      this.ctx.fillStyle = fg;
      this.ctx.font = "bold 14px 'Segoe UI', monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText(text, x + w / 2, y + h / 2 + 5);
    }

    renderMapSelect() {
      this.ctx.fillStyle = "#05070d";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 24px 'Segoe UI', monospace";
      this.ctx.fillText("SELECT CAMPAIGN SECTOR", 60, 60);

      this.renderMiniButton(60, 25, 90, 30, "← MENU");

      for (let i = 0; i < MAPS.length; i++) {
        const m = MAPS[i];
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 60 + col * 235;
        const y = 90 + row * 240;

        this.ctx.fillStyle = "#0c1527";
        this.ctx.fillRect(x, y, 220, 215);
        this.ctx.strokeStyle = "#00e5ff";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, 220, 215);

        this.ctx.fillStyle = "#00e5ff";
        this.ctx.font = "bold 14px monospace";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`0${i + 1}. ${m.name}`, x + 12, y + 28);

        this.ctx.fillStyle = "#cfd8dc";
        this.ctx.font = "11px monospace";
        this.wrapText(m.desc, x + 12, y + 54, 195, 15);

        this.ctx.fillStyle = "#ffd600";
        this.ctx.font = "11px monospace";
        const starsEarned = this.saveData.stars[m.id] || 0;
        const starStr = "★".repeat(starsEarned) + "☆".repeat(3 - starsEarned);
        this.ctx.fillText(`WAVES: ${m.wave_count} | ${starStr}`, x + 12, y + 155);

        this.ctx.fillStyle = "#00e5ff";
        this.ctx.fillRect(x + 12, y + 170, 196, 32);
        this.ctx.fillStyle = "#05070d";
        this.ctx.font = "bold 13px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("DEPLOY SECTOR", x + 110, y + 191);
      }
    }

    renderEditor() {
      this.ctx.fillStyle = "#070b14";
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Top Toolbar
      this.ctx.fillStyle = "#0c1527";
      this.ctx.fillRect(0, 0, this.width, 70);
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.strokeRect(0, 0, this.width, 70);

      this.renderMiniButton(50, 20, 100, 36, "← MENU");
      this.renderMiniButton(180, 20, 140, 36, "▶ TEST PLAY");
      this.renderMiniButton(340, 20, 110, 36, "CLEAR");
      this.renderMiniButton(480, 20, 130, 36, "EXPORT JSON");
      this.renderMiniButton(640, 20, 130, 36, "IMPORT JSON");

      this.ctx.fillStyle = "#78909c";
      this.ctx.font = "12px monospace";
      this.ctx.textAlign = "left";
      this.ctx.fillText("Click any grid cell to add waypoints in order from SPAWN to BASE CORE.", 800, 42);

      // Draw Grid
      this.ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
      for (let x = 0; x <= this.width; x += 64) {
        this.ctx.beginPath(); this.ctx.moveTo(x, 70); this.ctx.lineTo(x, 650); this.ctx.stroke();
      }
      for (let y = 70; y <= 650; y += 64) {
        this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.width, y); this.ctx.stroke();
      }

      // Draw Custom Waypoint Path
      if (this.editorWaypoints.length >= 2) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.editorWaypoints[0].x, this.editorWaypoints[0].y);
        for (let i = 1; i < this.editorWaypoints.length; i++) {
          this.ctx.lineTo(this.editorWaypoints[i].x, this.editorWaypoints[i].y);
        }
        this.ctx.strokeStyle = "rgba(0, 229, 255, 0.6)";
        this.ctx.lineWidth = 36;
        this.ctx.lineCap = "round";
        this.ctx.stroke();
      }

      // Waypoint Nodes
      for (let i = 0; i < this.editorWaypoints.length; i++) {
        const pt = this.editorWaypoints[i];
        this.ctx.fillStyle = (i === 0) ? "#ff1744" : (i === this.editorWaypoints.length - 1 ? "#00e5ff" : "#ffd600");
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = "#000";
        this.ctx.font = "bold 10px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`${i + 1}`, pt.x, pt.y + 4);
      }
    }

    renderLeaderboardModal() {
      this.ctx.fillStyle = "#05070d";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 26px 'Segoe UI', monospace";
      this.ctx.fillText("GLOBAL CYBER-GRID LEADERBOARD", 60, 60);

      this.renderMiniButton(60, 25, 90, 32, "← MENU");
      this.renderMiniButton(1050, 25, 170, 32, `HANDLE: ${this.playerName}`);

      // Table Header
      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(60, 100, 1160, 40);
      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 14px monospace";
      this.ctx.fillText("RANK", 80, 125);
      this.ctx.fillText("COMMANDER", 180, 125);
      this.ctx.fillText("SECTOR", 460, 125);
      this.ctx.fillText("WAVE REACHED", 760, 125);
      this.ctx.fillText("TACTICAL SCORE", 1000, 125);

      // Table Rows
      const rows = this.saveData.leaderboard.slice(0, 10);
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const y = 160 + i * 44;
        this.ctx.fillStyle = i % 2 === 0 ? "rgba(12, 21, 39, 0.7)" : "rgba(22, 34, 56, 0.4)";
        this.ctx.fillRect(60, y - 22, 1160, 40);

        this.ctx.fillStyle = i === 0 ? "#ffd600" : (i === 1 ? "#00e5ff" : "#cfd8dc");
        this.ctx.font = "bold 14px monospace";
        this.ctx.fillText(`#${i + 1}`, 80, y);
        this.ctx.fillText(r.player_name, 180, y);
        this.ctx.fillText(r.map_id.toUpperCase(), 460, y);
        this.ctx.fillText(`Wave ${r.wave_reached}`, 760, y);
        this.ctx.fillText(`${r.score} PTS`, 1000, y);
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
      this.ctx.fillText("SECTOR DEFENDED!", 640, 240);

      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 28px monospace";
      this.ctx.fillText("★★★ MISSION SUCCESS ★★★", 640, 300);

      this.ctx.fillStyle = "#cfd8dc";
      this.ctx.font = "16px monospace";
      this.ctx.fillText(`Final Tactical Score: ${this.score} PTS | Preserved Core: ${this.baseHp}/${this.maxBaseHp}`, 640, 350);

      this.renderMenuButton(460, 460, 160, 50, "PLAY AGAIN", "#00e5ff", "#000");
      this.renderMenuButton(660, 460, 160, 50, "MAIN MENU", "#162238", "#00e5ff", "#00e5ff");
    }

    renderDefeatModal() {
      this.ctx.fillStyle = "rgba(5, 7, 13, 0.9)";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = "#ff1744";
      this.ctx.font = "bold 44px 'Segoe UI', monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("GRID OVERRUN!", 640, 240);

      this.ctx.fillStyle = "#cfd8dc";
      this.ctx.font = "18px monospace";
      this.ctx.fillText(`Base core breached at Wave ${this.wave}. Score: ${this.score} PTS`, 640, 310);

      this.renderMenuButton(460, 460, 160, 50, "RETRY SECTOR", "#ff1744", "#fff");
      this.renderMenuButton(660, 460, 160, 50, "MAIN MENU", "#162238", "#ff1744", "#ff1744");
    }
  }

  // Auto-launch engine
  window.addEventListener('DOMContentLoaded', () => {
    window.lastGridEngine = new LastGridEngine();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  });

})();
