// =============================================================================
// Tower Defense: Last Grid — Ultimate Tactical Cyber-Engine v3.0
// 10 Maps | 5 Towers (3 Tiers + 2 Branching Specializations) | 8 Enemies + 3 Bosses
// NEW: Controllable Field Hero Mech | Roguelike Augment Draft | Post-Match DPS Analytics
// =============================================================================

(function() {
  'use strict';

  // --- MULTILINGUAL LOCALIZATION (EN, UZ, RU) ---
  const I18N = {
    en: {
      title: "TOWER DEFENSE: LAST GRID",
      sub: "CYBERNETIC DEFENSE • 10 MAPS • 5 TOWERS • 8 ENEMIES • 3 BOSSES",
      campaign: "CAMPAIGN MISSIONS (10 MAPS)",
      sectorSelect: "SELECT SPECIFIC SECTOR",
      endless: "ENDLESS SURVIVAL MODE (∞ WAVES)",
      bossRush: "BOSS RUSH DUEL",
      mapEditor: "MAP EDITOR",
      leaderboard: "GLOBAL LEADERBOARD",
      fieldManual: "FIELD MANUAL / GUIDE",
      downloadOffline: "DOWNLOAD OFFLINE ZIP",
      core: "CORE HEALTH",
      wave: "WAVE",
      start: "START",
      inBattle: "IN BATTLE",
      upgrade: "UPGRADE",
      sell: "SELL",
      maxTier: "MAX TIER",
      notEnoughGold: "NOT ENOUGH GOLD!",
      waveCleared: "WAVE CLEARED!",
      sectorDefended: "SECTOR DEFENDED!",
      missionSuccess: "★★★ MISSION SUCCESS ★★★",
      gridOverrun: "GRID OVERRUN!",
      playAgain: "PLAY AGAIN",
      retry: "RETRY SECTOR",
      mainMenu: "MAIN MENU",
      emp: "EMP STORM",
      orbital: "ORBITAL BEAM",
      overclock: "OVERCLOCK",
      drone: "SUPPLY DRONE",
      heroUlt: "CYBER-SLASH (ULT)",
      analyticsTitle: "TACTICAL COMBAT ANALYTICS",
      draftTitle: "TACTICAL AUGMENT DRAFT",
      draftSub: "SELECT 1 PROTOCOL PERK TO ACTIVATE"
    },
    uz: {
      title: "TOWER DEFENSE: LAST GRID",
      sub: "KIBERNETIK HIMOYА • 10 XARITA • 5 MINORA • 8 DUSHMAN • 3 BOSS",
      campaign: "KAMPANIYA MISSIYALARI (10 XARITA)",
      sectorSelect: "XARITANI TANLASH",
      endless: "CHEKSIZ REJIM (∞ TO'LQIN)",
      bossRush: "BOSS RUSH DUEL",
      mapEditor: "XARITALAR MUHARRIRI",
      leaderboard: "GLOBAL REYTING",
      fieldManual: "QO'LLANMA / ENSIKLOPEDIYA",
      downloadOffline: "OFLAYN O'YINNI YUKLAB OLISH (ZIP)",
      core: "BAZA HOLATI",
      wave: "TO'LQIN",
      start: "BOSHLASH",
      inBattle: "JANG KETMOQDA",
      upgrade: "KUCHAYTIRISH",
      sell: "SOTISH",
      maxTier: "MAKSIMAL",
      notEnoughGold: "OLTIN YETARLI EMAS!",
      waveCleared: "TO'LQIN TOZALANDI!",
      sectorDefended: "SEKTOR HIMOYA QILINDI!",
      missionSuccess: "★★★ G'ALABA QOZONILDI ★★★",
      gridOverrun: "BAZA EGALLAB OLINDI!",
      playAgain: "QAYTA O'YNASH",
      retry: "QAYTA URINISH",
      mainMenu: "ASOSIY MENYU",
      emp: "EMP ZARBA",
      orbital: "ORBITAL LAZER",
      overclock: "OVERCLOCK",
      drone: "OLTIN DRONI",
      heroUlt: "QAHRAMON ZARBASI (ULT)",
      analyticsTitle: "JANG TAHLILI VA DPS GRAFIKLARI",
      draftTitle: "TAKTIK KARTA TANLOVI",
      draftSub: "FAOL QILISH UCHUN 1 TA PROTOKOLNI TANLANG"
    },
    ru: {
      title: "TOWER DEFENSE: LAST GRID",
      sub: "КИБЕР-ОБОРОНА • 10 КАРТ • 5 БАШЕН • 8 ВРАГОВ • 3 БОССА",
      campaign: "КАМПАНИЯ (10 КАРТ)",
      sectorSelect: "ВЫБОР СЕКТОРА",
      endless: "БЕСКОНЕЧНЫЙ РЕЖИМ (∞ ВОЛН)",
      bossRush: "БОСС РАШ ДУЭЛЬ",
      mapEditor: "РЕДАКТОР КАРТ",
      leaderboard: "ТАБЛИЦА ЛИДЕРОВ",
      fieldManual: "РУКОВОДСТВО / СПРАВКА",
      downloadOffline: "СКАЧАТЬ ОФЛАЙН ИГРУ (ZIP)",
      core: "ПРОЧНОСТЬ ЯДРА",
      wave: "ВОЛНА",
      start: "СТАРТ",
      inBattle: "В БОЮ",
      upgrade: "УЛУЧШИТЬ",
      sell: "ПРОДАТЬ",
      maxTier: "МАКС ТИР",
      notEnoughGold: "НЕДОСТАТОЧНО ЗОЛОТА!",
      waveCleared: "ВОЛНА ЗАЧИЩЕНА!",
      sectorDefended: "СЕКТОР ЗАЩИЩЁН!",
      missionSuccess: "★★★ ПОБЕДА ★★★",
      gridOverrun: "БАЗА ПАЛА!",
      playAgain: "ИГРАТЬ СНОВА",
      retry: "ПОВТОРИТЬ",
      mainMenu: "ГЛАВНОЕ МЕНЮ",
      emp: "ЭМИ БУРЯ",
      orbital: "ОРБИТАЛЬНЫЙ ЛУЧ",
      overclock: "РАЗГОН",
      drone: "ДРОН СНАБЖЕНИЯ",
      heroUlt: "СУПЕР УДАР ГЕРОЯ",
      analyticsTitle: "БОЕВАЯ АНАЛИТИКА И ГРАФИКИ DPS",
      draftTitle: "ВЫБОР ТАКТИЧЕСКИХ КАРТ",
      draftSub: "ВЫБЕРИТЕ 1 ПРОТОКОЛ ДЛЯ АКТИВАЦИИ"
    }
  };

  // --- AUDIO SYNTHESIZER ---
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.sfxMuted = false;
      this.bgmMuted = false;
      this.bgmPlaying = false;
      this.bgmTimer = null;
      this.step = 0;
      this.scale = [146.83, 164.81, 174.61, 196.00, 220.00, 261.63, 293.66, 329.63];
      this.bassNotes = [73.42, 73.42, 87.31, 98.00, 73.42, 73.42, 110.00, 98.00];
    }
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.bgmPlaying && !this.bgmMuted) this.startBGM();
    }
    toggleSFX() { this.sfxMuted = !this.sfxMuted; return !this.sfxMuted; }
    toggleBGM() {
      this.bgmMuted = !this.bgmMuted;
      if (this.bgmMuted) this.stopBGM();
      else this.startBGM();
      return !this.bgmMuted;
    }
    startBGM() {
      if (this.bgmTimer || !this.ctx || this.bgmMuted) return;
      this.bgmPlaying = true;
      const bpm = 124;
      const interval = (60 / bpm) / 4;
      this.bgmTimer = setInterval(() => this.bgmTick(), interval * 1000);
    }
    stopBGM() {
      if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
      this.bgmPlaying = false;
    }
    bgmTick() {
      if (this.bgmMuted || !this.ctx) return;
      const beat16 = this.step % 16;
      if (beat16 % 4 === 0) this.playDrum(150, 0.001, 0.12, 0.15, 30);
      if (beat16 === 4 || beat16 === 12) this.playSnare(0.08, 0.08);
      if (beat16 % 2 === 1) this.playHiHat(0.03, 0.03);

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
    playTone(freq, type, duration, gainVal = 0.1, slideTo = null) {
      if (this.sfxMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(10, slideTo), this.ctx.currentTime + duration);
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
    heroSlash() {
      this.playTone(400, 'sawtooth', 0.2, 0.15, 80);
      this.playTone(900, 'triangle', 0.25, 0.12, 200);
    }
    emp() {
      this.playTone(1200, 'sawtooth', 0.4, 0.2, 80);
      this.playTone(300, 'square', 0.5, 0.15, 60);
    }
    orbital() {
      this.playTone(80, 'sawtooth', 0.6, 0.25, 40);
      this.playTone(1500, 'sawtooth', 0.5, 0.2, 200);
    }
    victory() {
      [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.15), i * 120));
    }
    defeat() {
      [330, 293, 261, 196].forEach((f, i) => setTimeout(() => this.playTone(f, 'sawtooth', 0.35, 0.2, 80), i * 150));
    }
  }

  const audio = new SoundSynth();

  // --- MAP DEFINITIONS ---
  const MAPS = [
    {
      id: "training_grid", name: "Training Grid", desc: "Basic S-curve test field. Clean terrain with single lane.",
      wave_count: 10, gold: 250, hp: 20, modifier: "none",
      lanes: [ [ {x:64, y:192}, {x:384, y:192}, {x:384, y:448}, {x:896, y:448}, {x:896, y:256}, {x:1152, y:256} ] ]
    },
    {
      id: "crossroads", name: "Crossroads", desc: "Interconnected straight corridors with multiple defense pockets.",
      wave_count: 12, gold: 250, hp: 20, modifier: "none",
      lanes: [ [ {x:64, y:128}, {x:448, y:128}, {x:448, y:384}, {x:896, y:384}, {x:1152, y:384} ] ]
    },
    {
      id: "spiral_core", name: "Spiral Core", desc: "Concentric inward spiral. Optimal for Mortar and Cryo AoE setups.",
      wave_count: 15, gold: 250, hp: 20, modifier: "none",
      lanes: [ [ {x:64, y:64}, {x:1152, y:64}, {x:1152, y:576}, {x:192, y:576}, {x:192, y:192}, {x:960, y:192}, {x:960, y:448}, {x:384, y:448}, {x:384, y:320}, {x:640, y:320} ] ]
    },
    {
      id: "misty_pass", name: "Misty Pass", desc: "Dense electromagnetic fog reduces all tower ranges by -15%.",
      wave_count: 15, gold: 250, hp: 20, modifier: "fog",
      lanes: [ [ {x:64, y:320}, {x:256, y:128}, {x:512, y:512}, {x:768, y:128}, {x:1024, y:512}, {x:1152, y:320} ] ]
    },
    {
      id: "fast_track", name: "Fast Track", desc: "High-speed magnetic highway. All enemies move +15% faster!",
      wave_count: 20, gold: 260, hp: 20, modifier: "fast_lane",
      lanes: [ [ {x:64, y:256}, {x:1152, y:256} ] ]
    },
    {
      id: "scrap_yard", name: "Scrap Yard", desc: "Resource-starved industrial ruins. Enemy bounties reduced by -20%.",
      wave_count: 20, gold: 240, hp: 20, modifier: "scarce",
      lanes: [ [ {x:64, y:128}, {x:768, y:128}, {x:768, y:384}, {x:256, y:384}, {x:256, y:576}, {x:1152, y:576} ] ]
    },
    {
      id: "iron_wall", name: "Iron Wall", desc: "Fortified barrier zone. All enemy units gain +20% bonus armor.",
      wave_count: 25, gold: 280, hp: 20, modifier: "armored",
      lanes: [ [ {x:64, y:128}, {x:192, y:512}, {x:960, y:512}, {x:1152, y:128} ] ]
    },
    {
      id: "blackout_city", name: "Blackout City", desc: "Cybernetic metropolis with periodic EMP surges every 5 waves.",
      wave_count: 25, gold: 280, hp: 20, modifier: "blackout",
      lanes: [ [ {x:64, y:128}, {x:320, y:128}, {x:320, y:448}, {x:640, y:448}, {x:640, y:192}, {x:960, y:192}, {x:960, y:512}, {x:1152, y:512} ] ]
    },
    {
      id: "twin_gate", name: "Twin Gate", desc: "Dual converging vectors converging directly into the central core.",
      wave_count: 30, gold: 300, hp: 20, modifier: "double_lane",
      lanes: [
        [ {x:64, y:192}, {x:512, y:192}, {x:640, y:320}, {x:1152, y:320} ],
        [ {x:64, y:448}, {x:512, y:448}, {x:640, y:320}, {x:1152, y:320} ]
      ]
    },
    {
      id: "last_grid", name: "The Last Grid", desc: "Final endurance sector: full 30 waves with 3 Boss encounters!",
      wave_count: 30, gold: 350, hp: 25, modifier: "last_grid",
      lanes: [ [ {x:64, y:64}, {x:1152, y:64}, {x:1152, y:256}, {x:128, y:256}, {x:128, y:448}, {x:1152, y:448}, {x:1152, y:576}, {x:640, y:576} ] ]
    }
  ];

  // --- TOWER BLUEPRINTS & BRANCHING SPECIALIZATIONS (TIER 3) ---
  const TOWER_DEFS = {
    pulse: {
      id: "pulse", name: "Pulse Tower", type: "KINETIC", color: "#00e5ff", cost: 100, desc: "Rapid-fire kinetic tracer gun.",
      tiers: [
        { dmg: 12, rate: 4.0, range: 140, upCost: 120 },
        { dmg: 18, rate: 5.0, range: 155, upCost: 200 },
        { dmg: 26, rate: 6.0, range: 170, upCost: 0 }
      ],
      branches: {
        A: { name: "Gatling Shredder", dmg: 18, rate: 12.0, range: 165, color: "#00e5ff", perk: "shred", cost: 260, desc: "Fires 12 rps. Shreds 1 armor per hit." },
        B: { name: "Sniper Rail-Pulse", dmg: 320, rate: 0.6, range: 300, color: "#00b0ff", perk: "sniper", cost: 290, desc: "Extreme range sniper. 300% crit on bosses." }
      }
    },
    mortar: {
      id: "mortar", name: "Mortar Tower", type: "EXPLOSIVE", color: "#ff9100", cost: 150, desc: "Long-range explosive shell with area splash.",
      tiers: [
        { dmg: 45, rate: 0.8, range: 200, splash: 60, upCost: 150 },
        { dmg: 70, rate: 0.9, range: 215, splash: 75, upCost: 250 },
        { dmg: 105, rate: 1.0, range: 230, splash: 85, upCost: 0 }
      ],
      branches: {
        A: { name: "Cluster Bomb", dmg: 90, rate: 0.9, range: 225, splash: 80, color: "#ff9100", perk: "cluster", cost: 280, desc: "Detonates into 4 secondary cluster bomblets." },
        B: { name: "Napalm Cyber-Fire", dmg: 60, rate: 0.8, range: 215, splash: 90, color: "#ff3d00", perk: "napalm", cost: 290, desc: "Leaves cyber-fire pool on path (40 DoT)." }
      }
    },
    cryo: {
      id: "cryo", name: "Cryo Tower", type: "ENERGY", color: "#00f0ff", cost: 120, desc: "Cryogenic emitter that slows hostiles.",
      tiers: [
        { dmg: 4, rate: 1.5, range: 130, slow: 0.35, slowDur: 2.5, upCost: 140 },
        { dmg: 6, rate: 1.8, range: 145, slow: 0.45, slowDur: 3.0, upCost: 220 },
        { dmg: 9, rate: 2.0, range: 160, slow: 0.55, slowDur: 3.5, upCost: 0 }
      ],
      branches: {
        A: { name: "Blizzard Zero", dmg: 15, rate: 1.8, range: 165, slow: 1.0, slowDur: 2.0, color: "#00f0ff", perk: "freeze_solid", cost: 270, desc: "100% frozen solid stun + 50% shatter dmg." },
        B: { name: "Tesla Chain-Frost", dmg: 40, rate: 1.5, range: 175, slow: 0.5, slowDur: 3.0, color: "#76ff03", perk: "tesla_chain", cost: 300, desc: "Chains electric arc to 3 nearby targets." }
      }
    },
    railgun: {
      id: "railgun", name: "Railgun Tower", type: "PIERCE", color: "#ff007f", cost: 250, desc: "High-voltage magnetic beam piercing targets.",
      tiers: [
        { dmg: 140, rate: 0.5, range: 240, pierce: 1, upCost: 260 },
        { dmg: 220, rate: 0.6, range: 260, pierce: 2, upCost: 380 },
        { dmg: 340, rate: 0.7, range: 280, pierce: 3, upCost: 0 }
      ],
      branches: {
        A: { name: "Hyper Beam Laser", dmg: 600, rate: 0.9, range: 290, pierce: 4, color: "#ff007f", perk: "hyper_beam", cost: 420, desc: "Continuous sustained plasma beam laser." },
        B: { name: "Ion Disrupter", dmg: 420, rate: 0.7, range: 280, pierce: 99, color: "#d500f9", perk: "ion_strip", cost: 390, desc: "Instantly strips all enemy shields and pierces all." }
      }
    },
    beacon: {
      id: "beacon", name: "Beacon Tower", type: "SUPPORT", color: "#b388ff", cost: 180, desc: "Buff aura: +35% damage & +20% range to nearby towers.",
      tiers: [
        { dmgBuff: 0.35, rangeBuff: 0.20, range: 130, upCost: 200 },
        { dmgBuff: 0.45, rangeBuff: 0.25, range: 150, upCost: 320 },
        { dmgBuff: 0.55, rangeBuff: 0.30, range: 170, upCost: 0 }
      ],
      branches: {
        A: { name: "Overcharge Reactor", dmgBuff: 0.80, rangeBuff: 0.35, rateBuff: 0.20, range: 180, color: "#b388ff", perk: "overcharge", cost: 360, desc: "+80% dmg & +20% fire rate to nearby towers." },
        B: { name: "Tactical Radar", dmgBuff: 0.40, rangeBuff: 0.60, range: 220, color: "#e040fb", perk: "radar", cost: 340, desc: "+60% range and permanently reveals Phantoms." }
      }
    }
  };

  // --- ROGUELIKE AUGMENT POOL (DRAFT 1 OF 3 EVERY 5 WAVES) ---
  const AUGMENT_POOL = [
    { id: "bounty_hunter", title: "BOUNTY HUNTER", desc: "+30% Gold bounty from all kills, but enemies move +10% faster.", icon: "🪙", color: "#ffd600" },
    { id: "shatter_frost", title: "SHATTER FROST", desc: "All towers deal +80% bonus damage to slowed/frozen hostiles.", icon: "❄️", color: "#00f0ff" },
    { id: "titan_slayer", title: "TITAN SLAYER", desc: "All towers deal +45% extra damage to Bosses and heavy Brutes.", icon: "⚔️", color: "#ff1744" },
    { id: "overclock_matrix", title: "OVERCLOCK MATRIX", desc: "Permanently increases all friendly towers' fire rate by +20%.", icon: "⚡", color: "#00e5ff" },
    { id: "superconductors", title: "SUPERCONDUCTORS", desc: "Railgun and Pulse attacks chain electric sparks to 2 nearby targets.", icon: "⚡", color: "#76ff03" },
    { id: "reactive_core", title: "REACTIVE CORE", desc: "Base Core reflects 50% leak damage back as an area EMP stun.", icon: "🛡️", color: "#ff007f" },
    { id: "nanite_repair", title: "NANITE REPAIR", desc: "Base Core automatically repairs +2 HP at the end of each wave.", icon: "💚", color: "#00e676" },
    { id: "cluster_munitions", title: "CLUSTER MUNITIONS", desc: "Mortar splash explosion radius and damage increased by +35%.", icon: "💥", color: "#ff9100" },
    { id: "hero_overdrive", title: "HERO OVERDRIVE", desc: "Field Hero Champion gains +60% melee damage and moves +25% faster.", icon: "🤖", color: "#b388ff" }
  ];

  // --- ENEMY BLUEPRINTS ---
  const ENEMY_DEFS = {
    grunt:        { name: "Grunt",        hp: 100, shield: 0,   armor: 0,  spd: 60,  bounty: 5,  color: "#ff5252", size: 12, marker: "●" },
    sprinter:     { name: "Sprinter",     hp: 60,  shield: 0,   armor: 0,  spd: 110, bounty: 6,  color: "#ffd600", size: 10, marker: "▲" },
    brute:        { name: "Brute",        hp: 400, shield: 0,   armor: 8,  spd: 40,  bounty: 15, color: "#d50000", size: 17, marker: "■" },
    swarmling:    { name: "Swarmling",    hp: 25,  shield: 0,   armor: 0,  spd: 85,  bounty: 2,  color: "#ffab00", size: 7,  marker: "◆" },
    shieldbearer: { name: "Shieldbearer", hp: 200, shield: 150, armor: 2,  spd: 55,  bounty: 12, color: "#00b0ff", size: 15, marker: "🛡" },
    medic:        { name: "Medic",        hp: 150, shield: 0,   armor: 0,  spd: 50,  bounty: 14, color: "#00e676", size: 13, marker: "✚" },
    splitter:     { name: "Splitter",     hp: 250, shield: 0,   armor: 3,  spd: 55,  bounty: 10, color: "#e040fb", size: 15, marker: "✦" },
    phantom:      { name: "Phantom",      hp: 180, shield: 0,   armor: 0,  spd: 75,  bounty: 12, color: "#7c4dff", size: 14, marker: "★" },
    juggernaut:   { name: "BOSS: Juggernaut", hp: 6000,  shield: 0, armor: 20, spd: 32, bounty: 100, color: "#ff1744", size: 28, isBoss: true, marker: "☠" },
    overseer:     { name: "BOSS: Overseer",   hp: 9000,  shield: 0, armor: 10, spd: 35, bounty: 150, color: "#651fff", size: 30, isBoss: true, marker: "👁" },
    hive_titan:   { name: "BOSS: Hive Titan", hp: 20000, shield: 0, armor: 15, spd: 30, bounty: 250, color: "#f50057", size: 34, isBoss: true, marker: "☣" }
  };

  function getWaveConfig(waveNum, mode = 'CAMPAIGN') {
    if (mode === 'BOSS_RUSH') {
      if (waveNum === 1) return [{ type: "juggernaut", count: 1, interval: 2.0 }, { type: "brute", count: 8, interval: 1.0 }];
      if (waveNum === 2) return [{ type: "overseer", count: 1, interval: 2.0 }, { type: "phantom", count: 12, interval: 0.8 }];
      if (waveNum === 3) return [{ type: "hive_titan", count: 1, interval: 2.0 }, { type: "splitter", count: 15, interval: 0.7 }];
      return [{ type: "hive_titan", count: 2, interval: 3.0 }];
    }
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
    const groups = [ { type: mainType, count: count, interval: Math.max(0.3, 1.2 - waveNum * 0.02) } ];
    if (waveNum >= 4) {
      groups.push({ type: subType, count: Math.floor(count * 0.6), interval: 0.7 });
    }
    return groups;
  }

  // --- GAME ENGINE ---
  class LastGridEngine {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.width = 1280;
      this.height = 720;

      this.lang = localStorage.getItem('last_grid_lang') || 'uz';
      this.gameMode = 'CAMPAIGN';
      this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'VICTORY', 'DEFEAT', 'MAP_SELECT', 'EDITOR', 'LEADERBOARD', 'MANUAL', 'DRAFT', 'ANALYTICS'
      this.speed = 1;
      this.crtEnabled = false;
      this.colorblind = false;
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

      // Active Augments
      this.activeAugments = [];
      this.draftCards = [];

      // Combat Analytics Tracker
      this.analytics = {
        damageByTower: { pulse: 0, mortar: 0, cryo: 0, railgun: 0, beacon: 0, hero: 0, skills: 0 },
        totalKills: 0,
        totalGold: 0,
        mvpName: "Pulse Tower"
      };

      // Commander Skills
      this.skills = {
        emp:       { cost: 50,  cd: 25, currentCd: 0, key: "Z" },
        orbital:   { cost: 75,  cd: 30, currentCd: 0, key: "X" },
        overclock: { cost: 60,  cd: 35, currentCd: 0, key: "C", activeTime: 0 },
        drone:     { cost: 0,   cd: 40, currentCd: 0, key: "V" }
      };

      // Controllable Field Hero Mech (Apex-01)
      // Controllable Field Hero Mech (Apex-01)
      this.hero = {
        name: "Apex-01 Mech",
        x: 300, y: 350,
        targetX: 300, targetY: 350,
        hp: 400, maxHp: 400,
        level: 1, xp: 0, maxXp: 80,
        speed: 130,
        atkDmg: 80, atkRate: 1.3, atkCooldown: 0,
        ultCd: 22, currentUltCd: 0, ultActiveTime: 0,
        selected: false,
        angle: 0,
        walkAnim: 0,
        slashAnim: 0
      };

      // Touch Gesture & Sensor State (Mobile Optimization)
      this.touchState = {
        dragging: null, // null | 'HERO' | 'TOWER_HOTBAR'
        draggedTowerType: null,
        dragCurrent: { x: 0, y: 0 },
        lastTapTime: 0,
        lastTapPos: { x: 0, y: 0 }
      };
      this.radialBuildCell = null; // Mobile Radial Touch Quick-Build
      this.lastTouchActionTime = 0;
      this.isTouchDevice = (typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));

      this.towers = [];
      this.enemies = [];
      this.projectiles = [];
      this.particles = [];
      this.floatingTexts = [];
      this.groundHazards = []; // Napalm fire pools

      this.selectedBuildType = null;
      this.selectedTower = null;
      this.aimingSkill = null;
      this.mousePos = { x: -100, y: -100 };
      this.hoverCell = null;
      this.targetPriorities = ['FIRST', 'LAST', 'STRONGEST', 'NEAREST'];

      this.editorWaypoints = [ {x:64, y:256}, {x:512, y:256}, {x:512, y:448}, {x:1152, y:448} ];
      this.nextUid = 1;
      this.lastTimestamp = 0;
      this.playerName = localStorage.getItem('last_grid_player_name') || 'CyberCommander';

      this.saveData = this.loadSave();

      this.initEvents();
      this.setupCanvasScaling();
      this.fetchLiveScores();
      this.startLoop();
    }

    vibrate(pattern) {
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(pattern);
        }
      } catch (e) {}
    }

    t(key) {
      const dict = I18N[this.lang] || I18N.en;
      return dict[key] || key;
    }

    toggleLang() {
      const langs = ['uz', 'en', 'ru'];
      const idx = langs.indexOf(this.lang);
      this.lang = langs[(idx + 1) % langs.length];
      localStorage.setItem('last_grid_lang', this.lang);
      return this.lang.toUpperCase();
    }

    loadSave() {
      try {
        const d = localStorage.getItem('last_grid_save_v2');
        return d ? JSON.parse(d) : {
          stars: {},
          highScores: { campaign: 0, endless: 0, boss_rush: 0 },
          leaderboard: [
            { player_name: "NeonMaster", map_id: "last_grid", wave_reached: 30, score: 12450 },
            { player_name: "CyberGhost", map_id: "twin_gate", wave_reached: 29, score: 9820 },
            { player_name: "GridRunner_UZ", map_id: "iron_wall", wave_reached: 25, score: 7650 },
            { player_name: "TashkentPro", map_id: "training_grid", wave_reached: 10, score: 3400 }
          ]
        };
      } catch (e) {
        return { stars: {}, highScores: {}, leaderboard: [] };
      }
    }

    fetchLiveScores() {
      fetch('/api')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) this.saveData.leaderboard = data;
        })
        .catch(() => {});
    }

    saveProgress(mapId, stars, finalScore, waveReached) {
      if (!this.saveData.stars) this.saveData.stars = {};
      this.saveData.stars[mapId] = Math.max(this.saveData.stars[mapId] || 0, stars);

      const modeKey = this.gameMode.toLowerCase();
      this.saveData.highScores[modeKey] = Math.max(this.saveData.highScores[modeKey] || 0, finalScore);

      this.saveData.leaderboard.push({
        player_name: this.playerName,
        map_id: mapId,
        wave_reached: waveReached,
        score: finalScore,
        date: new Date().toLocaleDateString()
      });
      this.saveData.leaderboard.sort((a, b) => b.score - a.score);
      this.saveData.leaderboard = this.saveData.leaderboard.slice(0, 25);

      try {
        localStorage.setItem('last_grid_save_v2', JSON.stringify(this.saveData));
        localStorage.setItem('last_grid_player_name', this.playerName);
      } catch (e) {}

      fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: this.playerName,
          map_id: mapId,
          difficulty: "normal",
          wave_reached: waveReached,
          score: finalScore,
          seed: Math.floor(Math.random() * 1000000)
        })
      }).catch(() => {});
    }

    setupCanvasScaling() {
      window.addEventListener('resize', () => this.resizeCanvas());
      window.addEventListener('orientationchange', () => setTimeout(() => this.resizeCanvas(), 150));
      document.addEventListener('fullscreenchange', () => setTimeout(() => this.resizeCanvas(), 150));
      this.resizeCanvas();
    }

    resizeCanvas() {
      const container = document.getElementById('canvas-container') || document.body;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const aspect = 1280 / 720;
      let targetW = w;
      let targetH = w / aspect;
      if (targetH > h) {
        targetH = h;
        targetW = h * aspect;
      }
      this.canvas.style.width = `${Math.floor(targetW)}px`;
      this.canvas.style.height = `${Math.floor(targetH)}px`;
      this.canvas.style.display = 'block';
    }

    getCanvasPos(e) {
      const rect = this.canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (typeof e.clientX === 'number') {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const rw = rect.width || 1280;
      const rh = rect.height || 720;
      const scaleX = 1280 / rw;
      const scaleY = 720 / rh;
      const x = Math.max(0, Math.min(1280, (clientX - rect.left) * scaleX));
      const y = Math.max(0, Math.min(720, (clientY - rect.top) * scaleY));
      return { x, y };
    }

    initEvents() {
      // Desktop Mouse Move
      this.canvas.addEventListener('mousemove', (e) => {
        this.mousePos = this.getCanvasPos(e);
        this.updateHoverCell();
      });

      // Desktop Click (strictly ignores synthetic touch events)
      this.canvas.addEventListener('click', (e) => {
        if (Date.now() - this.lastTouchActionTime < 700) return;
        audio.init();
        if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
        const pos = this.getCanvasPos(e);
        this.handleCanvasClick(pos.x, pos.y, e.button === 2);
      });

      this.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const pos = this.getCanvasPos(e);
        this.handleCanvasClick(pos.x, pos.y, true);
      });

      // MOBILE TOUCH GESTURES & SENSORS
      this.canvas.addEventListener('touchstart', (e) => {
        this.isTouchDevice = true;
        audio.init();
        if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
        this.lastTouchActionTime = Date.now();
        const pos = this.getCanvasPos(e);
        this.mousePos = pos;
        this.updateHoverCell();

        const now = Date.now();
        const isDoubleTap = (now - this.touchState.lastTapTime < 350) &&
                            (Math.hypot(pos.x - this.touchState.lastTapPos.x, pos.y - this.touchState.lastTapPos.y) < 45);

        if (this.state === 'PLAYING') {
          // Floating Hero Ult Button (x: 1210, y: 540, radius: 45)
          if (Math.hypot(pos.x - 1210, pos.y - 540) <= 45) {
            e.preventDefault();
            this.triggerHeroUlt();
            this.vibrate([40, 25, 70]);
            this.touchState.lastTapTime = now;
            this.touchState.lastTapPos = pos;
            return;
          }
          // Floating Wave / Speed Button (x: 1210, y: 90, radius: 40)
          if (Math.hypot(pos.x - 1210, pos.y - 90) <= 40) {
            e.preventDefault();
            if (!this.waveActive) this.callNextWave();
            else this.cycleSpeed();
            this.vibrate(20);
            this.touchState.lastTapTime = now;
            this.touchState.lastTapPos = pos;
            return;
          }

          // Hero Double Tap
          const distToHero = Math.hypot(this.hero.x - pos.x, this.hero.y - pos.y);
          if (distToHero <= 45 && isDoubleTap) {
            e.preventDefault();
            this.triggerHeroUlt();
            this.vibrate([40, 25, 70]);
            this.touchState.lastTapTime = 0;
            return;
          }

          // Check Bottom Bar Tower Hotbar Drag
          if (pos.y >= 620 && !this.selectedTower) {
            const towerKeys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
            for (let i = 0; i < 5; i++) {
              const bx = 240 + i * 175;
              if (pos.x >= bx && pos.x <= bx + 160 && pos.y >= 630 && pos.y <= 710) {
                e.preventDefault();
                const key = towerKeys[i];
                this.touchState.dragging = 'TOWER_HOTBAR';
                this.touchState.draggedTowerType = key;
                this.touchState.dragCurrent = { x: pos.x, y: pos.y };
                this.selectedBuildType = key;
                this.vibrate(20);
                this.touchState.lastTapTime = now;
                this.touchState.lastTapPos = pos;
                return;
              }
            }
          }
        }

        this.touchState.lastTapTime = now;
        this.touchState.lastTapPos = pos;
      }, { passive: false });

      this.canvas.addEventListener('touchmove', (e) => {
        const pos = this.getCanvasPos(e);
        this.mousePos = pos;
        this.updateHoverCell();

        if (this.touchState.dragging) {
          e.preventDefault();
          this.touchState.dragCurrent = pos;
        }
      }, { passive: false });

      this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault(); // PREVENTS SYNTHETIC DUPLICATE CLICK!
        this.lastTouchActionTime = Date.now();
        const pos = this.getCanvasPos(e);

        if (this.touchState.dragging === 'HERO') {
          if (pos.y >= 60 && pos.y <= 620) {
            this.hero.targetX = pos.x;
            this.hero.targetY = pos.y;
            this.hero.selected = false;
            this.spawnShockwave(pos.x, pos.y, 35, "#ffd600");
            audio.upgrade();
            this.vibrate(25);
          }
          this.touchState.dragging = null;
          return;
        }

        if (this.touchState.dragging === 'TOWER_HOTBAR') {
          const gx = Math.floor(pos.x / 64);
          const gy = Math.floor(pos.y / 64);
          if (this.isValidBuildCell(gx, gy) && pos.y >= 60 && pos.y < 620) {
            this.buildTower(this.touchState.draggedTowerType, gx, gy);
            this.vibrate([25, 30, 25]);
          }
          this.touchState.dragging = null;
          this.selectedBuildType = null;
          return;
        }

        // Tap action
        this.vibrate(12);
        this.handleCanvasClick(pos.x, pos.y, false);
      }, { passive: false });

      window.addEventListener('keydown', (e) => {
        audio.init();
        const k = e.key.toLowerCase();
        if (e.key >= '1' && e.key <= '5') {
          const keys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
          this.selectBuildType(keys[parseInt(e.key) - 1]);
        } else if (e.code === 'Space') {
          e.preventDefault();
          if (this.state === 'PLAYING') this.triggerHeroUlt();
          else this.callNextWave();
        } else if (e.key === 'Escape') {
          if (this.aimingSkill) this.aimingSkill = null;
          else if (this.selectedTower) this.selectedTower = null;
          else if (this.selectedBuildType) this.selectedBuildType = null;
          else if (this.radialBuildCell) this.radialBuildCell = null;
          else if (this.hero.selected) this.hero.selected = false;
          else this.togglePause();
        } else if (k === 'u') this.upgradeSelectedTower();
        else if (k === 's') this.sellSelectedTower();
        else if (k === 't') this.cycleTargetPriority();
        else if (k === 'z') this.triggerSkill('emp');
        else if (k === 'x') this.triggerSkill('orbital');
        else if (k === 'c') this.triggerSkill('overclock');
        else if (k === 'v') this.triggerSkill('drone');
        else if (k === 'h') this.hero.selected = !this.hero.selected;
        else if (e.key === 'Tab') {
          e.preventDefault();
          this.cycleSpeed();
        }
      });
    }

    startMission(mapIdx = 0, mode = 'CAMPAIGN') {
      this.gameMode = mode;
      this.currentMapIndex = mapIdx;
      const map = (mode === 'CUSTOM') ? {
        id: "custom", name: "Custom Sector",
        gold: 300, hp: 20, wave_count: 20, modifier: "none",
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

      this.activeAugments = [];
      this.draftCards = [];
      this.analytics = {
        damageByTower: { pulse: 0, mortar: 0, cryo: 0, railgun: 0, beacon: 0, hero: 0, skills: 0 },
        totalKills: 0,
        totalGold: this.gold,
        mvpName: "Pulse Tower"
      };

      // Reset Hero Mech
      this.hero.x = map.lanes[0][0].x + 120;
      this.hero.y = map.lanes[0][0].y;
      this.hero.targetX = this.hero.x;
      this.hero.targetY = this.hero.y;
      this.hero.hp = 400;
      this.hero.level = 1;
      this.hero.xp = 0;
      this.hero.currentUltCd = 0;
      this.hero.selected = false;

      for (const k in this.skills) this.skills[k].currentCd = 0;
      this.skills.overclock.activeTime = 0;

      this.towers = [];
      this.enemies = [];
      this.projectiles = [];
      this.particles = [];
      this.floatingTexts = [];
      this.groundHazards = [];
      this.spawnQueue = [];

      this.selectedBuildType = null;
      this.selectedTower = null;
      this.aimingSkill = null;
      this.state = 'PLAYING';
      this.bakeMapLanes(map);
      this.addFloatingText(`${map.name.toUpperCase()}`, 640, 200, "#00e5ff", 22);
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

        isValidBuildCell(gx, gy) {
      if (gx < 0 || gx >= 20 || gy < 1 || gy >= 10) return false;
      const isPath = this.isPathCell(gx, gy);
      const hasTower = this.towers.some(t => t.cellX === gx && t.cellY === gy);
      return !isPath && !hasTower;
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

    handleCanvasClick(x, y, isRightClick = false) {
      if (this.state === 'MENU') {
        // Generous touch hitboxes for mobile screens
        if (y >= 310 && y <= 385 && x >= 380 && x <= 900) { this.startMission(0, 'CAMPAIGN'); return; }
        else if (y >= 386 && y <= 445 && x >= 380 && x <= 900) { this.state = 'MAP_SELECT'; return; }
        else if (y >= 446 && y <= 505 && x >= 380 && x <= 900) { this.startMission(9, 'ENDLESS'); return; }
        else if (y >= 506 && y <= 560 && x >= 380 && x <= 635) { this.startMission(0, 'BOSS_RUSH'); return; }
        else if (y >= 506 && y <= 560 && x >= 645 && x <= 900) { this.state = 'EDITOR'; return; }
        else if (y >= 561 && y <= 615 && x >= 380 && x <= 635) { this.state = 'LEADERBOARD'; return; }
        else if (y >= 561 && y <= 615 && x >= 645 && x <= 900) { this.state = 'MANUAL'; return; }
        else if (y >= 616 && y <= 675 && x >= 380 && x <= 900) { this.downloadOfflineZip(); return; }
        if (x > 1080 && x < 1260 && y > 10 && y < 65) this.toggleLang();
        return;
      }

      if (this.state === 'DRAFT') {
        for (let i = 0; i < this.draftCards.length; i++) {
          const cx = 180 + i * 320;
          if (x >= cx && x <= cx + 280 && y >= 200 && y <= 520) {
            this.selectAugment(this.draftCards[i]);
            return;
          }
        }
        return;
      }

      if (this.state === 'ANALYTICS') {
        if (x > 500 && x < 780 && y > 620 && y < 690) this.state = 'MENU';
        return;
      }

      if (this.state === 'MANUAL') {
        if (x > 1000 && x < 1200 && y > 30 && y < 75) this.state = 'MENU';
        return;
      }

      if (this.state === 'MAP_SELECT') {
        if (y > 25 && y < 65 && x > 50 && x < 150) { this.state = 'MENU'; return; }
        for (let i = 0; i < 10; i++) {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const mx = 60 + col * 235;
          const my = 85 + row * 240;
          if (x >= mx && x <= mx + 220 && y >= my && y <= my + 210) {
            this.startMission(i, 'CAMPAIGN');
            return;
          }
        }
        return;
      }

      if (this.state === 'LEADERBOARD') {
        if (y > 25 && y < 65 && x > 50 && x < 150) { this.state = 'MENU'; return; }
        if (x > 1050 && x < 1220 && y > 25 && y < 65) {
          const newName = prompt("Enter CyberCommander handle:", this.playerName);
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
        if (x > 360 && x < 540 && y > 450 && y < 530) this.startMission(this.currentMapIndex, this.gameMode);
        else if (x > 550 && x < 730 && y > 450 && y < 530) this.state = 'ANALYTICS';
        else if (x > 740 && x < 920 && y > 450 && y < 530) this.state = 'MENU';
        return;
      }

      // 1. Mobile Floating Thumb Buttons (⚡ ULT & ▶ WAVE/SPEED)
      if (Math.hypot(x - 1210, y - 540) <= 45) {
        this.triggerHeroUlt();
        this.vibrate([40, 25, 70]);
        return;
      }
      if (Math.hypot(x - 1210, y - 90) <= 40) {
        if (!this.waveActive) this.callNextWave();
        else this.cycleSpeed();
        this.vibrate(20);
        return;
      }

      // 2. Mobile Quick Radial Build Wheel Clicks
      if (this.radialBuildCell) {
        const rc = this.radialBuildCell;
        const options = [
          { key: 'pulse', ang: -Math.PI * 0.8 },
          { key: 'mortar', ang: -Math.PI * 0.5 },
          { key: 'cryo', ang: -Math.PI * 0.2 },
          { key: 'railgun', ang: Math.PI * 0.15 },
          { key: 'beacon', ang: Math.PI * 0.85 }
        ];
        let chosen = null;
        for (const opt of options) {
          const bx = rc.px + Math.cos(opt.ang) * 65;
          const by = rc.py + Math.sin(opt.ang) * 65;
          if (Math.hypot(x - bx, y - by) <= 28) {
            chosen = opt.key;
            break;
          }
        }
        if (chosen) {
          this.buildTower(chosen, rc.gx, rc.gy);
          this.radialBuildCell = null;
          this.vibrate([25, 30, 25]);
          return;
        } else {
          // Tapped outside radial buttons -> dismiss radial
          this.radialBuildCell = null;
        }
      }

      // 3. Hero Click or Move
      if (this.hero.selected) {
        if (y >= 60 && y <= 620) {
          this.hero.targetX = x;
          this.hero.targetY = y;
          this.hero.selected = false;
          this.spawnShockwave(x, y, 35, "#ffd600");
          audio.upgrade();
          this.vibrate(20);
          return;
        }
      }

      if (Math.hypot(this.hero.x - x, this.hero.y - y) <= 38) {
        this.hero.selected = !this.hero.selected;
        this.selectedTower = null;
        this.selectedBuildType = null;
        this.radialBuildCell = null;
        if (this.hero.selected) {
          this.addFloatingText("HERO SELECTED: TAP MAP TO MOVE", this.hero.x, this.hero.y - 30, "#ffd600", 14);
        }
        audio.hit();
        this.vibrate(15);
        return;
      }

      // 4. Top HUD Bar clicks
      if (y >= 0 && y <= 60) {
        if (x >= 450 && x <= 630) this.callNextWave();
        else if (x >= 790 && x <= 855) this.cycleSpeed();
        else if (x >= 856 && x <= 920) audio.toggleSFX();
        else if (x >= 921 && x <= 985) audio.toggleBGM();
        else if (x >= 986 && x <= 1050) this.crtEnabled = !this.crtEnabled;
        else if (x >= 1051 && x <= 1115) this.colorblind = !this.colorblind;
        else if (x >= 1116 && x <= 1175) this.toggleLang();
        else if (x >= 1176 && x <= 1250) this.togglePause();
        return;
      }

      if (this.aimingSkill) {
        this.executeSkill(this.aimingSkill, x, y);
        this.aimingSkill = null;
        return;
      }

      // 5. Bottom Bar actions
      if (y >= 620) {
        this.radialBuildCell = null;

        // Hero Ult button at x: 5 to 65
        if (x >= 5 && x <= 65) { this.triggerHeroUlt(); this.vibrate([40, 25, 70]); return; }

        // Skills at x: 65 to 225
        if (x >= 65 && x <= 100) this.triggerSkill('emp');
        else if (x >= 105 && x <= 140) this.triggerSkill('orbital');
        else if (x >= 145 && x <= 180) this.triggerSkill('overclock');
        else if (x >= 185 && x <= 220) this.triggerSkill('drone');

        if (this.selectedTower) {
          const t = this.selectedTower;
          const def = TOWER_DEFS[t.type];

          // Tier 3 Branch A and Branch B buttons
          if (t.tier === 2) {
            if (x >= 450 && x <= 590 && y >= 635 && y <= 695) { this.upgradeBranch('A'); this.vibrate([25, 30, 25]); return; }
            if (x >= 605 && x <= 745 && y >= 635 && y <= 695) { this.upgradeBranch('B'); this.vibrate([25, 30, 25]); return; }
          } else {
            // Normal Upgrade (Tier 1 -> Tier 2)
            if (x >= 480 && x <= 620 && y >= 640 && y <= 700) { this.upgradeSelectedTower(); this.vibrate([25, 30, 25]); return; }
          }

          // Sell button
          if (x >= 760 && x <= 870 && y >= 640 && y <= 700) { this.sellSelectedTower(); this.vibrate(20); return; }
          // Priority button
          if (x >= 885 && x <= 1000 && y >= 640 && y <= 700) { this.cycleTargetPriority(); this.vibrate(15); return; }
          // Close button
          if (x >= 1015 && x <= 1060 && y >= 640 && y <= 700) { this.selectedTower = null; return; }
        } else {
          // 5 Tower Hotbar
          const towerKeys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
          for (let i = 0; i < 5; i++) {
            const bx = 240 + i * 175;
            if (x >= bx && x <= bx + 160 && y >= 630 && y <= 710) {
              this.selectBuildType(towerKeys[i]);
              this.vibrate(15);
              return;
            }
          }
        }
        return;
      }

      // 6. Grid Cell Taps (Radial Quick-Build or Direct Build)
      const gx = Math.floor(x / 64);
      const gy = Math.floor(y / 64);
      const clickedTower = this.towers.find(t => t.cellX === gx && t.cellY === gy);

      if (clickedTower) {
        this.selectedTower = clickedTower;
        this.selectedBuildType = null;
        this.hero.selected = false;
        this.radialBuildCell = null;
        this.vibrate(15);
      } else if (this.selectedBuildType && this.isValidBuildCell(gx, gy)) {
        this.buildTower(this.selectedBuildType, gx, gy);
        this.selectedBuildType = null;
        this.radialBuildCell = null;
        this.vibrate([25, 30, 25]);
      } else if (y >= 60 && y <= 620 && this.isValidBuildCell(gx, gy)) {
        // Open Radial Quick Build on empty valid cell!
        this.radialBuildCell = { gx, gy, px: gx * 64 + 32, py: gy * 64 + 32 };
        this.selectedTower = null;
        this.selectedBuildType = null;
        this.vibrate(15);
      } else {
        this.selectedTower = null;
        this.radialBuildCell = null;
      }
    }

    downloadOfflineZip() {
      const a = document.createElement('a');
      a.href = 'last-grid-offline-v2.zip';
      a.download = 'last-grid-offline-v2.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    handleEditorClick(x, y) {
      if (y > 20 && y < 60) {
        if (x > 50 && x < 150) { this.state = 'MENU'; return; }
        if (x > 180 && x < 320) { this.startMission(0, 'CUSTOM'); return; }
        if (x > 340 && x < 460) { this.editorWaypoints = [ {x:64, y:320} ]; return; }
        if (x > 480 && x < 620) { prompt("Copy Map JSON:", JSON.stringify(this.editorWaypoints)); return; }
        if (x > 640 && x < 780) {
          const input = prompt("Paste Map JSON:");
          if (input) {
            try {
              const parsed = JSON.parse(input);
              if (Array.isArray(parsed) && parsed.length >= 2) this.editorWaypoints = parsed;
            } catch(e) {}
          }
          return;
        }
      }
      if (y >= 70 && y <= 650) {
        const gx = Math.floor(x / 64) * 64 + 32;
        const gy = Math.floor(y / 64) * 64 + 32;
        this.editorWaypoints.push({ x: gx, y: gy });
      }
    }

    // --- ROGUELIKE AUGMENT DRAFT ---
    triggerAugmentDraft() {
      this.state = 'DRAFT';
      const available = AUGMENT_POOL.filter(a => !this.activeAugments.includes(a.id));
      const shuffled = available.sort(() => 0.5 - Math.random());
      this.draftCards = shuffled.slice(0, 3);
      audio.upgrade();
    }

    selectAugment(card) {
      this.activeAugments.push(card.id);
      this.addFloatingText(`AUGMENT ACTIVATED: ${card.title}!`, 640, 200, card.color, 24);
      audio.victory();
      this.state = 'PLAYING';
      this.recalculateBeaconBuffs();
    }

    hasAugment(id) {
      return this.activeAugments.includes(id);
    }

    // --- FIELD HERO MECH ---
    triggerHeroUlt() {
      if (this.hero.currentUltCd > 0) {
        this.addFloatingText(`HERO ULT CHARGING (${Math.ceil(this.hero.currentUltCd)}s)`, this.hero.x, this.hero.y - 20, "#ff1744");
        return;
      }
      this.hero.currentUltCd = this.hero.ultCd;
      this.hero.ultActiveTime = 0.6;
      audio.heroSlash();
      this.screenShake = 9;
      this.spawnShockwave(this.hero.x, this.hero.y, 160, "#00e5ff");

      // 400 damage in 160px radius
      for (const e of this.enemies) {
        if (Math.hypot(e.x - this.hero.x, e.y - this.hero.y) <= 160) {
          this.applyDamage(e, 400, 'HERO');
        }
      }
      this.addFloatingText("CYBER-SLASH WAVE!", this.hero.x, this.hero.y - 28, "#00e5ff", 22);
    }

    // --- COMMANDER SKILLS ---
    triggerSkill(skillKey) {
      const s = this.skills[skillKey];
      if (s.currentCd > 0) return;
      if (this.gold < s.cost) {
        this.addFloatingText(this.t("notEnoughGold"), 640, 600, "#ff1744");
        return;
      }
      if (skillKey === 'overclock') {
        this.gold -= s.cost;
        s.currentCd = s.cd;
        s.activeTime = 6.0;
        audio.upgrade();
        this.screenShake = 4;
        this.analytics.damageByTower.skills += 50;
        this.addFloatingText("OVERCLOCK ACTIVE! (+60% ROF)", 640, 200, "#ffd600", 24);
      } else if (skillKey === 'drone') {
        this.gold += 75;
        this.analytics.totalGold += 75;
        s.currentCd = s.cd;
        audio.sell();
        this.addFloatingText("+75 GOLD DELIVERED!", 640, 200, "#00e676", 24);
      } else {
        this.aimingSkill = skillKey;
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
            e.slowRatio = 1.0;
            e.slowTimer = 3.5;
            this.applyDamage(e, 80, 'SKILL');
            this.addFloatingText("STUNNED!", e.x, e.y - 14, "#00e5ff", 14);
          }
        }
      } else if (skillKey === 'orbital') {
        audio.orbital();
        this.screenShake = 14;
        this.particles.push({ x: x, y: y, beam: true, life: 0.5, maxLife: 0.5 });
        this.spawnShockwave(x, y, 140, "#ff007f");
        for (const e of this.enemies) {
          if (Math.hypot(e.x - x, e.y - y) <= 140) {
            this.applyDamage(e, 500, 'SKILL');
          }
        }
      }
    }

    selectBuildType(type) {
      if (this.selectedBuildType === type) this.selectedBuildType = null;
      else {
        this.selectedBuildType = type;
        this.selectedTower = null;
        this.aimingSkill = null;
      }
    }

    buildTower(type, gx, gy) {
      const def = TOWER_DEFS[type];
      if (this.gold < def.cost) {
        this.addFloatingText(this.t("notEnoughGold"), gx * 64 + 32, gy * 64, "#ff1744");
        return;
      }
      this.gold -= def.cost;
      const tower = {
        uid: this.nextUid++,
        type: type,
        cellX: gx, cellY: gy,
        x: gx * 64 + 32, y: gy * 64 + 32,
        tier: 1,
        branch: null,
        totalInvested: def.cost,
        cooldown: 0,
        angle: 0,
        kills: 0,
        damageDealt: 0,
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
        this.addFloatingText(this.t("notEnoughGold"), t.x, t.y, "#ff1744");
        return;
      }
      this.gold -= cost;
      t.totalInvested += cost;
      t.tier++;
      audio.upgrade();
      this.addFloatingText(`TIER ${t.tier}!`, t.x, t.y, "#00e5ff");
      this.recalculateBeaconBuffs();
    }

    upgradeBranch(branchKey) {
      if (!this.selectedTower) return;
      const t = this.selectedTower;
      const def = TOWER_DEFS[t.type];
      const branch = def.branches[branchKey];
      if (this.gold < branch.cost) {
        this.addFloatingText(this.t("notEnoughGold"), t.x, t.y, "#ff1744");
        return;
      }
      this.gold -= branch.cost;
      t.totalInvested += branch.cost;
      t.tier = 3;
      t.branch = branchKey;
      audio.victory();
      this.spawnShockwave(t.x, t.y, 80, branch.color);
      this.addFloatingText(`${branch.name.toUpperCase()}!`, t.x, t.y, branch.color, 16);
      this.recalculateBeaconBuffs();
    }

    sellSelectedTower() {
      if (!this.selectedTower) return;
      const t = this.selectedTower;
      const refund = Math.floor(t.totalInvested * 0.70);
      this.gold += refund;
      this.analytics.totalGold += refund;
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
      const globalRof = this.hasAugment("overclock_matrix") ? 1.20 : 1.0;
      for (const t of this.towers) {
        t.buffDmg = 1.0;
        t.buffRange = 1.0;
        t.buffRate = globalRof;
      }
      for (const b of this.towers) {
        if (b.type !== 'beacon') continue;
        const bDef = (b.branch) ? TOWER_DEFS.beacon.branches[b.branch] : TOWER_DEFS.beacon.tiers[b.tier - 1];
        for (const t of this.towers) {
          if (t === b) continue;
          const dist = Math.hypot(t.x - b.x, t.y - b.y);
          if (dist <= bDef.range) {
            t.buffDmg = Math.max(t.buffDmg, 1.0 + bDef.dmgBuff);
            t.buffRange = Math.max(t.buffRange, 1.0 + bDef.rangeBuff);
            if (bDef.rateBuff) t.buffRate = Math.max(t.buffRate, (globalRof + bDef.rateBuff));
          }
        }
      }
    }

    callNextWave() {
      if (this.waveActive) {
        if (this.waveCountdown > 0) {
          const bonus = Math.floor(this.waveCountdown);
          this.gold += bonus;
          this.analytics.totalGold += bonus;
          this.score += bonus * 10;
          this.addFloatingText(`EARLY +${bonus}g!`, 640, 100, "#ffd600");
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
      this.addFloatingText(`${this.t("wave")} ${waveNum}!`, 640, 150, "#00e5ff", 28);
    }

    spawnEnemy(type, laneIdx) {
      const def = ENEMY_DEFS[type];
      const map = (this.gameMode === 'CUSTOM') ? { modifier: "none" } : MAPS[this.currentMapIndex];
      let spdMult = 1.0;
      let armorMult = 1.0;
      let hpMult = 1.0;

      if (this.hasAugment("bounty_hunter")) spdMult *= 1.10;
      if (this.gameMode === 'ENDLESS' && this.wave > 30) hpMult = Math.pow(1.08, this.wave - 30);
      if (map.modifier === 'fast_lane') spdMult = 1.15;
      if (map.modifier === 'armored') armorMult = 1.20;

      let bounty = def.bounty;
      if (map.modifier === 'scarce') bounty = Math.floor(bounty * 0.8);
      if (this.hasAugment("bounty_hunter")) bounty = Math.floor(bounty * 1.30);

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
        bounty: bounty,
        size: def.size,
        color: def.color,
        marker: def.marker,
        isBoss: !!def.isBoss,
        slowRatio: 0,
        slowTimer: 0,
        phaseTimer: 0,
        phased: false,
        healTimer: 0,
        shieldRegenTimer: 0,
        x: 0, y: 0, angle: 0
      };
      const pos = this.getPointAlongLane(laneIdx, 0);
      enemy.x = pos.x;
      enemy.y = pos.y;
      this.enemies.push(enemy);
    }

    startLoop() {
      const step = (timestamp) => {
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const dt = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000.0);
        this.lastTimestamp = timestamp;

        if (this.state === 'PLAYING') {
          for (let i = 0; i < this.speed; i++) this.update(dt);
        }
        this.render();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    update(dt) {
      if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - 20 * dt);

      for (const k in this.skills) {
        if (this.skills[k].currentCd > 0) this.skills[k].currentCd = Math.max(0, this.skills[k].currentCd - dt);
      }
      if (this.skills.overclock.activeTime > 0) {
        this.skills.overclock.activeTime = Math.max(0, this.skills.overclock.activeTime - dt);
      }

      // Hero Mech Update
      this.updateHero(dt);

      // Ground Hazards (Napalm Cyber-Fire)
      for (let i = this.groundHazards.length - 1; i >= 0; i--) {
        const h = this.groundHazards[i];
        h.life -= dt;
        h.tickTimer += dt;
        if (h.tickTimer >= 0.5) {
          h.tickTimer = 0;
          for (const e of this.enemies) {
            if (Math.hypot(e.x - h.x, e.y - h.y) <= h.radius) {
              this.applyDamage(e, 20, 'EXPLOSIVE', null, 'mortar');
            }
          }
        }
        if (h.life <= 0) this.groundHazards.splice(i, 1);
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
        if (this.waveCountdown <= 0) this.startWave(this.wave);
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
          // Radar beacon permanently reveals phantoms
          const hasRadar = this.towers.some(t => t.branch === 'B' && t.type === 'beacon');
          if (!hasRadar) {
            e.phaseTimer += dt;
            if (e.phaseTimer >= 4.0) {
              e.phased = true;
              if (e.phaseTimer >= 5.5) { e.phased = false; e.phaseTimer = 0; }
            }
          } else {
            e.phased = false;
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
          if (e.shieldRegenTimer > 3.0) e.shield = Math.min(e.maxShield, e.shield + 20 * dt);
        }

        const effSpeed = e.speed * (1.0 - Math.min(e.isBoss ? 0.5 : 1.0, e.slowRatio));
        e.progress += effSpeed * dt;
        e.walkAnim = (e.walkAnim || 0) + effSpeed * dt * 0.15;
        const lane = this.bakedLanes[e.laneIdx] || this.bakedLanes[0];
        const pt = this.getPointAlongLane(e.laneIdx, e.progress);
        e.x = pt.x;
        e.y = pt.y;
        e.angle = pt.angle;

        if (e.progress >= lane.totalLength) {
          this.baseHp = Math.max(0, this.baseHp - (e.isBoss ? 10 : 1));
          audio.leak();
          this.screenShake = 10;
          this.vibrate([80, 40, 80]);
          this.addFloatingText(e.isBoss ? "-10 HP!" : "-1 HP!", e.x, e.y, "#ff1744", 20);

          // Reactive Core augment perk
          if (this.hasAugment("reactive_core")) {
            this.spawnShockwave(e.x, e.y, 250, "#ff007f");
            for (const other of this.enemies) {
              other.slowRatio = 1.0;
              other.slowTimer = 3.0;
            }
          }

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
        const currentSpec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];
        const mapFog = (map.modifier === 'fog') ? 0.85 : 1.0;
        const effRange = currentSpec.range * (t.buffRange || 1.0) * mapFog;
        const effRate = currentSpec.rate * (t.buffRate || 1.0) * overclockMult;
        const effDmg = currentSpec.dmg * (t.buffDmg || 1.0);

        t.cooldown -= dt;
        if (t.laserTimer > 0) t.laserTimer -= dt;

        const targets = this.findTargets(t, effRange);
        if (targets.length > 0) {
          const primary = targets[0];
          t.angle = Math.atan2(primary.y - t.y, primary.x - t.x);
          if (t.cooldown <= 0) {
            t.cooldown = 1.0 / effRate;
            this.fireTower(t, targets, effDmg, currentSpec, effRange);
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
              this.applyDamage(p.target, p.damage, 'KINETIC', p.tower, 'pulse');
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
            this.detonateMortar(p.targetX, p.targetY, p.damage, p.splash, p.tower, p.branch);
            this.projectiles.splice(i, 1);
          }
        }
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        if (!pt.beam) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; }
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

    updateHero(dt) {
      const h = this.hero;
      if (h.currentUltCd > 0) h.currentUltCd = Math.max(0, h.currentUltCd - dt);
      if (h.ultActiveTime > 0) h.ultActiveTime = Math.max(0, h.ultActiveTime - dt);
      if (h.slashAnim > 0) h.slashAnim = Math.max(0, h.slashAnim - dt);

      // Hero Movement toward target
      const distToTarget = Math.hypot(h.targetX - h.x, h.targetY - h.y);
      if (distToTarget > 4) {
        const moveSpd = h.speed * (this.hasAugment("hero_overdrive") ? 1.25 : 1.0);
        h.angle = Math.atan2(h.targetY - h.y, h.targetX - h.x);
        h.x += Math.cos(h.angle) * moveSpd * dt;
        h.y += Math.sin(h.angle) * moveSpd * dt;
        h.walkAnim = (h.walkAnim || 0) + dt * 10;

        // Thruster sparks
        if (Math.random() < 0.35) {
          const backX = h.x - Math.cos(h.angle) * 16;
          const backY = h.y - Math.sin(h.angle) * 16;
          this.particles.push({
            x: backX + (Math.random() * 6 - 3),
            y: backY + (Math.random() * 6 - 3),
            vx: -Math.cos(h.angle) * 30 + (Math.random() * 10 - 5),
            vy: -Math.sin(h.angle) * 30 + (Math.random() * 10 - 5),
            color: "#00e5ff", size: 2.5, life: 0.25, maxLife: 0.25
          });
        }
      } else {
        h.walkAnim = (h.walkAnim || 0) + dt * 2;
      }

      // Hero In-Combat / Melee Attack
      h.atkCooldown -= dt;
      let inCombat = false;
      for (const e of this.enemies) {
        if (Math.hypot(e.x - h.x, e.y - h.y) <= 50) {
          inCombat = true;
          h.angle = Math.atan2(e.y - h.y, e.x - h.x);
          if (h.atkCooldown <= 0) {
            h.atkCooldown = 1.0 / h.atkRate;
            h.slashAnim = 0.22;
            audio.heroSlash();
            this.vibrate(18);
            const dmg = h.atkDmg * (this.hasAugment("hero_overdrive") ? 1.6 : 1.0);
            this.applyDamage(e, dmg, 'HERO', null, 'hero');
            this.particles.push({ x: e.x, y: e.y, vx: 0, vy: -30, color: "#ffd600", size: 5, life: 0.35, maxLife: 0.35 });
          }
          break;
        }
      }

      // Hero HP Regen out of combat
      if (!inCombat && h.hp < h.maxHp) {
        const regenRate = this.hasAugment("hero_overdrive") ? 30 : 15;
        h.hp = Math.min(h.maxHp, h.hp + regenRate * dt);
      }
    }

    findTargets(tower, range) {
      const candidates = [];
      for (const e of this.enemies) {
        if (e.phased) continue;
        const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
        if (dist <= range) candidates.push({ enemy: e, dist: dist });
      }
      if (candidates.length === 0) return [];
      candidates.sort((a, b) => {
        let diff = 0;
        if (tower.priority === 'FIRST') diff = b.enemy.progress - a.enemy.progress;
        else if (tower.priority === 'LAST') diff = a.enemy.progress - b.enemy.progress;
        else if (tower.priority === 'STRONGEST') diff = (b.enemy.hp + b.enemy.shield) - (a.enemy.hp + a.enemy.shield);
        else if (tower.priority === 'NEAREST') diff = a.dist - b.dist;
        return diff !== 0 ? diff : (a.enemy.uid - b.enemy.uid);
      });
      return candidates.map(c => c.enemy);
    }

    fireTower(tower, targets, dmg, spec, range) {
      const primary = targets[0];
      let finalDmg = dmg;

      // Specialization perks
      if (tower.branch === 'B' && tower.type === 'pulse') {
        // Sniper Rail-Pulse 300% crit on boss/brute
        if (primary.isBoss || primary.type === 'brute') finalDmg *= 3.0;
      }

      if (tower.type === 'pulse') {
        audio.shootPulse();
        this.projectiles.push({ type: 'pulse', x: tower.x, y: tower.y, speed: 650, target: primary, damage: finalDmg, tower: tower });
        if (tower.branch === 'A') primary.armor = Math.max(0, primary.armor - 1); // Gatling armor shred
      } else if (tower.type === 'mortar') {
        audio.shootMortar();
        this.projectiles.push({ type: 'mortar', startX: tower.x, startY: tower.y, targetX: primary.x, targetY: primary.y, x: tower.x, y: tower.y, t: 0, flightTime: 0.7, damage: finalDmg, splash: spec.splash, tower: tower, branch: tower.branch });
      } else if (tower.type === 'cryo') {
        audio.shootCryo();
        this.spawnShockwave(tower.x, tower.y, range, spec.color);
        for (const target of targets) {
          target.slowRatio = spec.slow || 0.45;
          target.slowTimer = spec.slowDur || 3.0;
          this.applyDamage(target, finalDmg, 'ENERGY', tower, 'cryo');
          // Tesla Chain Arc
          if (tower.branch === 'B') {
            const nearby = targets.filter(t => t !== target).slice(0, 3);
            for (const n of nearby) this.applyDamage(n, finalDmg * 0.7, 'ENERGY', tower, 'cryo');
          }
        }
      } else if (tower.type === 'railgun') {
        audio.shootRailgun();
        this.screenShake = 3;
        tower.laserTimer = 0.25;
        tower.targetPoint = { x: primary.x, y: primary.y };
        const pierceCount = spec.pierce || 2;
        const hitEnemies = targets.slice(0, pierceCount);
        for (const target of hitEnemies) {
          if (tower.branch === 'B') target.shield = 0; // Ion disrupter strips shields
          this.applyDamage(target, finalDmg, 'PIERCE', tower, 'railgun');
          // Superconductors augment spark
          if (this.hasAugment("superconductors")) {
            const extra = targets.find(e => !hitEnemies.includes(e));
            if (extra) this.applyDamage(extra, finalDmg * 0.5, 'ENERGY', tower, 'railgun');
          }
        }
      }
    }

    detonateMortar(x, y, dmg, splashRadius, tower, branch) {
      audio.hit();
      this.screenShake = 6;
      let finalRadius = splashRadius;
      if (this.hasAugment("cluster_munitions")) finalRadius *= 1.35;

      this.spawnShockwave(x, y, finalRadius, '#ff9100');
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d <= finalRadius) {
          const falloff = 1.0 - (d / finalRadius) * 0.6;
          this.applyDamage(e, dmg * falloff, 'EXPLOSIVE', tower, 'mortar');
        }
      }

      // Branch A: Cluster Bomb bomblets
      if (branch === 'A') {
        for (let i = 0; i < 4; i++) {
          const ang = (Math.PI / 2) * i;
          const bx = x + Math.cos(ang) * 50;
          const by = y + Math.sin(ang) * 50;
          setTimeout(() => {
            this.spawnShockwave(bx, by, 35, '#ffd600');
            for (const e of this.enemies) {
              if (Math.hypot(e.x - bx, e.y - by) <= 35) this.applyDamage(e, 40, 'EXPLOSIVE', tower, 'mortar');
            }
          }, 150);
        }
      }

      // Branch B: Napalm Fire pool
      if (branch === 'B') {
        this.groundHazards.push({ x: x, y: y, radius: 45, life: 4.0, tickTimer: 0 });
      }
    }

    applyDamage(enemy, rawDmg, dmgType, tower, category = 'pulse') {
      let finalDmg = rawDmg;

      // Augment perks
      if (this.hasAugment("titan_slayer") && (enemy.isBoss || enemy.type === 'brute')) finalDmg *= 1.45;
      if (this.hasAugment("shatter_frost") && enemy.slowTimer > 0) finalDmg *= 1.80;

      if (dmgType === 'KINETIC' || dmgType === 'PIERCE') finalDmg = Math.max(1.0, rawDmg - enemy.armor);

      // Track combat analytics
      if (this.analytics.damageByTower[category] !== undefined) {
        this.analytics.damageByTower[category] += Math.round(finalDmg);
      }
      if (tower) tower.damageDealt += Math.round(finalDmg);

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

      if (enemy.hp <= 0) this.killEnemy(enemy, tower);
    }

    killEnemy(enemy, tower) {
      if (tower) tower.kills++;
      this.analytics.totalKills++;
      this.gold += enemy.bounty;
      this.analytics.totalGold += enemy.bounty;
      this.score += enemy.bounty * 50;

      // Hero XP
      this.hero.xp += (enemy.isBoss ? 40 : 10);
      if (this.hero.xp >= this.hero.maxXp && this.hero.level < 10) {
        this.hero.level++;
        this.hero.xp = 0;
        this.hero.maxXp += 40;
        this.hero.maxHp += 50;
        this.hero.hp = this.hero.maxHp;
        this.hero.atkDmg += 15;
        audio.upgrade();
        this.addFloatingText(`HERO LEVEL UP! (LV ${this.hero.level})`, this.hero.x, this.hero.y - 30, "#ffd600", 20);
      }

      this.addFloatingText(`+${enemy.bounty}g`, enemy.x, enemy.y - 20, '#ffd600', 14);

      if (enemy.type === 'splitter') {
        for (let i = -1; i <= 1; i += 2) {
          this.enemies.push({
            uid: this.nextUid++,
            type: 'swarmling',
            laneIdx: enemy.laneIdx,
            progress: Math.max(0, enemy.progress + i * 20),
            hp: 25, maxHp: 25, shield: 0, maxShield: 0, armor: 0,
            speed: 85, bounty: 2, size: 7, color: '#ffab00', marker: '◆', isBoss: false,
            slowRatio: 0, slowTimer: 0, x: enemy.x, y: enemy.y, angle: enemy.angle
          });
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
      this.analytics.totalGold += bonus;
      this.score += bonus * 25;

      if (this.hasAugment("nanite_repair")) {
        this.baseHp = Math.min(this.maxBaseHp, this.baseHp + 2);
        this.addFloatingText("+2 BASE HP REPAIRED!", 640, 110, "#00e676", 18);
      }

      this.addFloatingText(`${this.t("waveCleared")} +${bonus}g`, 640, 150, '#00e676', 26);
      audio.upgrade();

      // Roguelike Draft at Wave 5, 10, 15, 20, 25
      if (this.wave % 5 === 0 && this.wave < this.maxWaves) {
        this.triggerAugmentDraft();
        this.wave++;
        this.waveCountdown = 8;
        return;
      }

      if (this.gameMode === 'CAMPAIGN' && this.wave >= this.maxWaves) this.onVictory();
      else if (this.gameMode === 'BOSS_RUSH' && this.wave >= 3) this.onVictory();
      else {
        this.wave++;
        this.waveCountdown = 8;
      }
    }

    onVictory() {
      this.state = 'VICTORY';
      audio.victory();
      this.calculateMVP();
      const stars = (this.baseHp === this.maxBaseHp) ? 3 : (this.baseHp >= this.maxBaseHp * 0.5 ? 2 : 1);
      const mapId = (this.gameMode === 'CUSTOM') ? 'custom' : MAPS[this.currentMapIndex].id;
      this.saveProgress(mapId, stars, this.score, this.wave);
    }

    onDefeat() {
      this.state = 'DEFEAT';
      audio.defeat();
      this.calculateMVP();
      const mapId = (this.gameMode === 'CUSTOM') ? 'custom' : MAPS[this.currentMapIndex].id;
      this.saveProgress(mapId, 0, this.score, this.wave);
    }

    calculateMVP() {
      let maxDmg = 0;
      let mvp = "Hero Apex-01";
      for (const t of this.towers) {
        if (t.damageDealt > maxDmg) {
          maxDmg = t.damageDealt;
          mvp = `${t.branch ? TOWER_DEFS[t.type].branches[t.branch].name : TOWER_DEFS[t.type].name} (#${t.uid})`;
        }
      }
      this.analytics.mvpName = mvp;
    }

    spawnShockwave(x, y, radius, color) {
      for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * 2 / 16) * i;
        this.particles.push({
          x: x, y: y,
          vx: Math.cos(ang) * radius * 2.2,
          vy: Math.sin(ang) * radius * 2.2,
          color: color,
          size: 3, life: 0.35, maxLife: 0.35
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
          life: 0.5, maxLife: 0.5
        });
      }
    }

    addFloatingText(text, x, y, color = '#ffffff', size = 13) {
      this.floatingTexts.push({ text, x, y, color, size, life: 1.0 });
    }

    // --- RENDERING PIPELINE ---
    render() {
      this.ctx.save();
      if (this.screenShake > 0) {
        const sx = (Math.random() * 2 - 1) * this.screenShake;
        const sy = (Math.random() * 2 - 1) * this.screenShake;
        this.ctx.translate(sx, sy);
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      if (this.state === 'MENU') this.renderMainMenu();
      else if (this.state === 'MAP_SELECT') this.renderMapSelect();
      else if (this.state === 'LEADERBOARD') this.renderLeaderboardModal();
      else if (this.state === 'MANUAL') this.renderFieldManual();
      else if (this.state === 'EDITOR') this.renderEditor();
      else if (this.state === 'DRAFT') this.renderDraftModal();
      else if (this.state === 'ANALYTICS') this.renderAnalyticsScreen();
      else {
        this.renderBackgroundGrid();
        this.renderLanes();
        this.renderGroundHazards();
        this.renderBaseCore();
        this.renderTowers();
        this.renderHero();
        this.renderEnemies();
        this.renderProjectiles();
        this.renderParticles();
        this.renderFloatingText();
        this.renderPlacementGhost();
        this.renderTacticalDragVector();
        this.renderRadialBuildWheel();
        this.renderTopHUD();
        this.renderBottomBar();
        this.renderMobileFloatingButtons();

        if (this.state === 'PAUSED') this.renderPauseModal();
        if (this.state === 'VICTORY') this.renderVictoryModal();
        if (this.state === 'DEFEAT') this.renderDefeatModal();
      }

      if (this.crtEnabled) this.renderCRTOverlay();
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
        this.ctx.beginPath(); this.ctx.moveTo(x, 60); this.ctx.lineTo(x, 620); this.ctx.stroke();
      }
      for (let y = 60; y <= 620; y += 64) {
        this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.width, y); this.ctx.stroke();
      }
    }

    renderLanes() {
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
      for (const lane of map.lanes) {
        if (!lane || lane.length < 2) continue;
        this.ctx.beginPath();
        this.ctx.moveTo(lane[0].x, lane[0].y);
        for (let i = 1; i < lane.length; i++) this.ctx.lineTo(lane[i].x, lane[i].y);
        this.ctx.strokeStyle = "#101b33";
        this.ctx.lineWidth = 44;
        this.ctx.lineCap = "round";
        this.ctx.stroke();

        this.ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

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

    renderGroundHazards() {
      for (const h of this.groundHazards) {
        this.ctx.fillStyle = "rgba(255, 61, 0, 0.35)";
        this.ctx.beginPath();
        this.ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = "#ff3d00";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }

    // --- HIGH-TECH PROCEDURAL SCI-FI RENDERING PIPELINE ---

    renderBaseCore() {
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
      const base = map.lanes[0][map.lanes[0].length - 1];
      const time = performance.now() * 0.002;
      const ctx = this.ctx;
      const hpPct = Math.max(0, this.baseHp / this.maxBaseHp);

      ctx.save();
      ctx.translate(base.x, base.y);

      // 1. Reinforced Hexagonal Platform
      ctx.fillStyle = "#0c1527";
      ctx.strokeStyle = hpPct < 0.3 ? "#ff1744" : "rgba(0, 229, 255, 0.6)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = Math.cos(a) * 36;
        const py = Math.sin(a) * 36;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Hazard chevrons on foundation
      ctx.fillStyle = hpPct < 0.3 ? "rgba(255, 23, 68, 0.3)" : "rgba(0, 229, 255, 0.15)";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        ctx.arc(Math.cos(a) * 28, Math.sin(a) * 28, 4, 0, Math.PI * 2);
      }
      ctx.fill();

      // 2. Counter-Rotating Gyro Containment Rings
      ctx.save();
      ctx.rotate(time * 0.8);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 1.6);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.rotate(-time * 1.2);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 1.4);
      ctx.stroke();
      ctx.restore();

      // 3. Central Quantum Plasma Reactor Core (Radial Glow)
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.4, hpPct < 0.3 ? "#ff1744" : "#00e5ff");
      grad.addColorStop(1, hpPct < 0.3 ? "rgba(255, 23, 68, 0)" : "rgba(0, 110, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 14 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
      ctx.fill();

      // Pulse Flare Ring
      ctx.strokeStyle = hpPct < 0.3 ? "rgba(255, 23, 68, 0.7)" : "rgba(0, 229, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 30 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Tactical Holographic Label
      ctx.fillStyle = hpPct < 0.3 ? "#ff1744" : "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(hpPct < 0.3 ? "CRITICAL" : "CORE", base.x, base.y + 4);
    }

    renderHero() {
      const h = this.hero;
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(h.x, h.y);

      // 1. Ult Holographic Mandala Blade Storm
      if (h.ultActiveTime > 0) {
        const ultProg = h.ultActiveTime / 0.6;
        ctx.save();
        ctx.rotate(performance.now() * 0.015);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.9)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, 80 * (1.1 - ultProg * 0.3), 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 214, 0, 0.8)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 120 * (1.0 - ultProg * 0.4), 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
          const ang = (Math.PI / 2) * i;
          ctx.beginPath();
          ctx.arc(0, 0, 70, ang, ang + Math.PI / 3);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Selection Halo (Dashed Holographic Target Ring)
      if (h.selected) {
        ctx.strokeStyle = "#ffd600";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Facing Orientation & Articulated Bipedal Mesh
      const ang = h.angle || 0;
      ctx.rotate(ang);

      const walkCycle = Math.sin(h.walkAnim || 0);

      // Bipedal Mechanical Legs
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 1.5;
      ctx.fillRect(-10 + walkCycle * 4, -14, 8, 5);
      ctx.strokeRect(-10 + walkCycle * 4, -14, 8, 5);
      ctx.fillRect(-10 - walkCycle * 4, 9, 8, 5);
      ctx.strokeRect(-10 - walkCycle * 4, 9, 8, 5);

      // Dual Ion Thruster Backpack
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-14, -8, 6, 16);
      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(-16, -6, 2, 4);
      ctx.fillRect(-16, 2, 2, 4);

      // Armored Carbon-Fiber Torso Chassis
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(8, -8);
      ctx.lineTo(12, 0);
      ctx.lineTo(8, 8);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing Arc-Reactor Core
      ctx.fillStyle = "#ffd600";
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Angular Cockpit / Helmet with Glowing Neon Cyan Visor
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(2, -5);
      ctx.lineTo(13, -3);
      ctx.lineTo(15, 0);
      ctx.lineTo(13, 3);
      ctx.lineTo(2, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(7, -3);
      ctx.lineTo(13, 0);
      ctx.lineTo(7, 3);
      ctx.stroke();

      // Tactical Left Arm Energy Buckler
      ctx.fillStyle = "#00b0ff";
      ctx.fillRect(0, -13, 6, 4);

      // High-Frequency Cyan Plasma Katana (Right Arm)
      const slashAngle = (h.slashAnim > 0) ? ((0.22 - h.slashAnim) / 0.22) * Math.PI : 0;
      ctx.save();
      ctx.translate(4, 10);
      ctx.rotate(slashAngle);

      // Katana Hilt
      ctx.fillStyle = "#475569";
      ctx.fillRect(-2, -2, 5, 4);
      // Outer Plasma Energy Bloom
      ctx.strokeStyle = "rgba(0, 229, 255, 0.75)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.lineTo(26, 0);
      ctx.stroke();
      // Inner White Hot Energy Core
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.lineTo(25, 0);
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // Floating Modern Health Bar & Level Badge
      const barW = 46;
      const bx = h.x - barW / 2;
      const by = h.y - 28;

      ctx.fillStyle = "#ffd600";
      ctx.beginPath();
      ctx.arc(bx - 8, by + 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${h.level}`, bx - 8, by + 5);

      ctx.fillStyle = "#090e17";
      ctx.fillRect(bx, by, barW, 5);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, barW, 5);

      const hpPct = Math.max(0, h.hp / h.maxHp);
      ctx.fillStyle = hpPct > 0.3 ? "#00e676" : "#ff1744";
      ctx.fillRect(bx, by, barW * hpPct, 5);
    }

    renderTowers() {
      const map = (this.gameMode === 'CUSTOM') ? { modifier: "none" } : MAPS[this.currentMapIndex];
      const ctx = this.ctx;

      for (const t of this.towers) {
        const def = TOWER_DEFS[t.type];
        const spec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];

        // 1. Selection Range Indicator
        if (this.selectedTower === t) {
          const mapFog = (map.modifier === 'fog') ? 0.85 : 1.0;
          const range = (spec.range || 130) * (t.buffRange || 1.0) * mapFog;
          ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
          ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(t.x, t.y, range, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Overclock Aura
        if (this.skills.overclock.activeTime > 0) {
          ctx.strokeStyle = "rgba(255, 214, 0, 0.6)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 28, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 2. High-Tech Octagonal Pedestal Base
        const color = t.branch ? spec.color : def.color;
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = color;
        ctx.lineWidth = t.branch ? 3 : 2;
        ctx.beginPath();
        const r = 24;
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          const px = t.x + Math.cos(a) * r;
          const py = t.y + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Corner Mounting Bolts
        ctx.fillStyle = "#475569";
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i + Math.PI / 4;
          ctx.fillRect(t.x + Math.cos(a) * 16 - 2, t.y + Math.sin(a) * 16 - 2, 4, 4);
        }

        // 3. Rotating Turret Head Assembly
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);

        ctx.fillStyle = color;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;

        if (t.type === 'pulse') {
          if (t.branch === 'A') {
            // Gatling Shredder: 6-barrel rotary minigun
            const spin = performance.now() * 0.02;
            ctx.fillStyle = "#334155";
            ctx.fillRect(0, -6, 26, 12);
            ctx.fillStyle = "#00e5ff";
            for (let b = 0; b < 6; b++) {
              const ba = spin + (Math.PI / 3) * b;
              ctx.fillRect(26, Math.sin(ba) * 5 - 1, 6, 2);
            }
          } else if (t.branch === 'B') {
            // Sniper Rail-Pulse: Ultra-long rifle with optic scope
            ctx.fillStyle = "#334155";
            ctx.fillRect(-6, -5, 14, 10);
            ctx.fillStyle = "#00b0ff";
            ctx.fillRect(8, -2, 32, 4);
            ctx.fillStyle = "#ffd600";
            ctx.fillRect(14, -5, 10, 3); // Scope
          } else {
            // Dual autocannon barrels
            ctx.fillStyle = color;
            ctx.fillRect(2, -7, 22, 5);
            ctx.fillRect(2, 2, 22, 5);
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(-8, -8, 16, 16);
          }
        } else if (t.type === 'mortar') {
          if (t.branch === 'A') {
            // Cluster Bomb: Quad rocket pod
            ctx.fillStyle = "#334155";
            ctx.fillRect(-8, -10, 24, 20);
            ctx.fillStyle = "#ff9100";
            ctx.fillRect(16, -8, 4, 6);
            ctx.fillRect(16, 2, 4, 6);
          } else if (t.branch === 'B') {
            // Napalm Cyber-Fire: Fuel tanks & flame igniter
            ctx.fillStyle = "#334155";
            ctx.fillRect(-6, -9, 22, 18);
            ctx.fillStyle = "#ff3d00";
            ctx.fillRect(-10, -7, 6, 14); // Fuel tank
            ctx.fillStyle = "#ffd600";
            ctx.fillRect(16, -2, 8, 4); // Igniter
          } else {
            // Heavy howitzer artillery barrel
            ctx.fillStyle = color;
            ctx.fillRect(-6, -7, 24, 14);
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(-10, -9, 14, 18);
          }
        } else if (t.type === 'cryo') {
          if (t.branch === 'A') {
            // Blizzard Zero: Crystalline spire with frost aura
            ctx.fillStyle = "#00f0ff";
            ctx.beginPath();
            ctx.moveTo(18, 0); ctx.lineTo(-8, -10); ctx.lineTo(-4, 0); ctx.lineTo(-8, 10);
            ctx.closePath();
            ctx.fill();
          } else if (t.branch === 'B') {
            // Tesla Chain-Frost: Dual lightning prongs
            ctx.fillStyle = "#334155";
            ctx.fillRect(-6, -8, 16, 16);
            ctx.strokeStyle = "#76ff03";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(10, -7); ctx.lineTo(24, -4);
            ctx.moveTo(10, 7); ctx.lineTo(24, 4);
            ctx.stroke();
          } else {
            // Cryogenic sphere with claws
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        } else if (t.type === 'railgun') {
          if (t.branch === 'A') {
            // Hyper Beam Laser: Optical prism array
            ctx.fillStyle = "#ff007f";
            ctx.fillRect(0, -4, 30, 8);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(28, -6, 6, 12);
          } else if (t.branch === 'B') {
            // Ion Disrupter: Magnetic disruptor rings
            ctx.fillStyle = "#d500f9";
            ctx.fillRect(0, -3, 28, 6);
            ctx.strokeStyle = "#e040fb";
            ctx.lineWidth = 2;
            for (let r = 8; r <= 24; r += 8) {
              ctx.strokeRect(r, -6, 3, 12);
            }
          } else {
            // Magnetic rails with induction coils
            ctx.fillStyle = color;
            ctx.fillRect(0, -3, 30, 6);
            ctx.fillStyle = "#334155";
            ctx.fillRect(-8, -7, 14, 14);
            ctx.fillStyle = "#ffd600";
            ctx.fillRect(10, -5, 4, 10);
            ctx.fillRect(20, -5, 4, 10);
          }
        } else if (t.type === 'beacon') {
          if (t.branch === 'A') {
            // Overcharge Reactor: Arcing lightning sphere
            ctx.fillStyle = "#b388ff";
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffd600";
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (t.branch === 'B') {
            // Tactical Radar: 360-degree radar dish
            ctx.fillStyle = "#e040fb";
            ctx.beginPath();
            ctx.arc(0, 0, 14, -Math.PI / 3, Math.PI / 3);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
          } else {
            // Satellite dish with glowing power crystal
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-2, -2, 4, 4);
          }
        }
        ctx.restore();

        // 4. Tier Markers (Stars)
        ctx.fillStyle = "#ffd600";
        for (let i = 0; i < t.tier; i++) {
          ctx.beginPath();
          ctx.arc(t.x - 12 + i * 12, t.y + 16, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Laser Beam FX
        if (t.laserTimer > 0 && t.targetPoint) {
          ctx.strokeStyle = (t.branch === 'A') ? "rgba(255, 0, 127, 0.9)" : `rgba(213, 0, 249, ${t.laserTimer / 0.25})`;
          ctx.lineWidth = (t.branch === 'A') ? 8 : 5;
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.targetPoint.x, t.targetPoint.y);
          ctx.stroke();
        }
      }
    }

    renderEnemies() {
      const ctx = this.ctx;

      for (const e of this.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);

        if (e.phased) ctx.globalAlpha = 0.25;

        // Slow Frost Field Aura
        if (e.slowTimer > 0) {
          ctx.strokeStyle = "#00f0ff";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, e.size + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Energy Shield Dome
        if (e.shield > 0) {
          ctx.strokeStyle = "rgba(0, 176, 255, 0.85)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, e.size + 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        // --- CONTEMPORARY PROCEDURAL CHARACTER DESIGNS ---
        if (e.type === 'grunt') {
          // Cyborg Mercenary Trooper
          const walk = Math.sin(e.walkAnim || 0) * 3;
          ctx.rotate(e.angle);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-7 + walk, -6, 5, 3);
          ctx.fillRect(-7 - walk, 3, 5, 3);
          ctx.fillStyle = "#334155";
          ctx.fillRect(-5, -5, 10, 10);
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-5, -5, 10, 10);
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.arc(3, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = e.color;
          ctx.fillRect(3, -2, 3, 4);
          ctx.fillStyle = "#475569";
          ctx.fillRect(4, 3, 9, 2);
        } else if (e.type === 'sprinter') {
          // Cyber-Hound / Stalker Mech
          const run = Math.sin(e.walkAnim || 0) * 5;
          ctx.rotate(e.angle);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-8 + run, -8, 4, 3);
          ctx.fillRect(-8 - run, 5, 4, 3);
          ctx.fillRect(4 - run, -9, 4, 3);
          ctx.fillRect(4 + run, 6, 4, 3);
          ctx.fillStyle = "#451a03";
          ctx.beginPath();
          ctx.moveTo(12, 0); ctx.lineTo(-10, -7); ctx.lineTo(-6, 0); ctx.lineTo(-10, 7);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "#ff1744";
          ctx.fillRect(6, -2, 3, 4);
          ctx.fillStyle = "#ff9100";
          ctx.fillRect(-12, -4, 3, 3);
          ctx.fillRect(-12, 1, 3, 3);
        } else if (e.type === 'brute') {
          // Goliath Heavy War-Mech
          const stomp = Math.sin(e.walkAnim || 0) * 3;
          ctx.rotate(e.angle);
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-14 + stomp, -16, 8, 6);
          ctx.fillRect(-14 - stomp, 10, 8, 6);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-12, -13, 22, 26);
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-12, -13, 22, 26);
          ctx.fillStyle = "#ffd600";
          ctx.fillRect(-10, -11, 4, 22);
          ctx.fillStyle = "#000";
          ctx.fillRect(-4, -11, 4, 22);
          ctx.fillStyle = "#475569";
          ctx.fillRect(6, -17, 14, 5);
          ctx.fillRect(6, 12, 14, 5);
          ctx.fillStyle = "#ff1744";
          ctx.fillRect(4, -3, 6, 6);
        } else if (e.type === 'swarmling') {
          // Nano-Drone Scarab
          ctx.rotate(e.angle);
          ctx.save();
          ctx.rotate(performance.now() * 0.02);
          ctx.strokeStyle = "rgba(255, 171, 0, 0.7)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.moveTo(8, 0); ctx.lineTo(0, -6); ctx.lineTo(-7, 0); ctx.lineTo(0, 6);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "#ffd600";
          ctx.fillRect(-1, -1, 3, 3);
        } else if (e.type === 'shieldbearer') {
          // Aegis Paladin Android
          ctx.rotate(e.angle);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-10, -9, 14, 18);
          ctx.strokeStyle = "#00b0ff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-10, -9, 14, 18);
          ctx.fillStyle = "#00e5ff";
          ctx.fillRect(0, -2, 4, 4);
          ctx.strokeStyle = "rgba(0, 176, 255, 0.9)";
          ctx.fillStyle = "rgba(0, 229, 255, 0.25)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(10, 0, 18, -Math.PI / 2.3, Math.PI / 2.3);
          ctx.stroke();
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(8, -2, 3, 4);
        } else if (e.type === 'medic') {
          // Nanite Bio-Synth Drone
          ctx.rotate(e.angle);
          ctx.fillStyle = "#064e3b";
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#00e676";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#00e676";
          ctx.fillRect(-2, -6, 4, 12);
          ctx.fillRect(-6, -2, 12, 4);
          const orbit = performance.now() * 0.004;
          for (let i = 0; i < 4; i++) {
            const a = orbit + (Math.PI / 2) * i;
            ctx.fillStyle = "#69f0ae";
            ctx.beginPath();
            ctx.arc(Math.cos(a) * 15, Math.sin(a) * 15, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (e.type === 'splitter') {
          // Fracture Crystal Core
          const pulse = Math.sin(performance.now() * 0.008) * 2;
          const spin = performance.now() * 0.003;
          ctx.fillStyle = "#1e1b4b";
          ctx.strokeStyle = "#e040fb";
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 4; i++) {
            const a = spin + (Math.PI / 2) * i;
            const cx = Math.cos(a) * 16;
            const cy = Math.sin(a) * 16;
            ctx.fillRect(cx - 3, cy - 3, 6, 6);
            ctx.strokeRect(cx - 3, cy - 3, 6, 6);
          }
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(0, 0, 8 + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffd600";
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'phantom') {
          // Stealth Ghost Assassin
          const shimmer = Math.sin(performance.now() * 0.01) * 3;
          ctx.rotate(e.angle);
          ctx.fillStyle = "rgba(255, 0, 127, 0.4)";
          ctx.fillRect(-8 + shimmer, -6, 14, 12);
          ctx.fillStyle = "rgba(0, 229, 255, 0.4)";
          ctx.fillRect(-8 - shimmer, -6, 14, 12);
          ctx.fillStyle = "rgba(124, 77, 255, 0.7)";
          ctx.beginPath();
          ctx.moveTo(10, 0); ctx.lineTo(-10, -7); ctx.lineTo(-6, 0); ctx.lineTo(-10, 7);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(8, -5); ctx.lineTo(16, -2);
          ctx.moveTo(8, 5); ctx.lineTo(16, 2);
          ctx.stroke();
        } else if (e.type === 'juggernaut') {
          // BOSS 1: Colossus MK-IV Siege Fortress
          const walkB = Math.sin(e.walkAnim || 0) * 4;
          ctx.rotate(e.angle);
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-22 + walkB, -24, 12, 10);
          ctx.fillRect(-22 - walkB, 14, 12, 10);
          ctx.fillRect(10 - walkB, -24, 12, 10);
          ctx.fillRect(10 + walkB, 14, 12, 10);
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-18, -18, 36, 36);
          ctx.strokeStyle = "#ff1744";
          ctx.lineWidth = 3;
          ctx.strokeRect(-18, -18, 36, 36);
          ctx.fillStyle = "#334155";
          ctx.fillRect(4, -22, 22, 6);
          ctx.fillRect(4, 16, 22, 6);
          ctx.strokeStyle = "rgba(255, 23, 68, 0.6)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(26, -19); ctx.lineTo(120, -19);
          ctx.moveTo(26, 19); ctx.lineTo(120, 19);
          ctx.stroke();
          ctx.fillStyle = "#ff1744";
          ctx.beginPath();
          ctx.arc(2, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffd600";
          ctx.beginPath();
          ctx.arc(2, 0, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'overseer') {
          // BOSS 2: Eye of Chronos Quantum AI
          const gyro1 = performance.now() * 0.002;
          const gyro2 = performance.now() * -0.003;
          ctx.strokeStyle = "rgba(101, 31, 255, 0.8)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 32, 14, gyro1, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = "rgba(224, 64, 251, 0.8)";
          ctx.beginPath();
          ctx.ellipse(0, 0, 26, 12, gyro2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#1e1b4b";
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#d500f9";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#00e5ff";
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(2, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'hive_titan') {
          // BOSS 3: Leviathan Core Bio-Mechanical Centipede
          ctx.rotate(e.angle);
          for (let s = 3; s >= 0; s--) {
            const sx = -s * 10;
            const segW = 26 - s * 3;
            const segH = 24 - s * 3;
            ctx.fillStyle = s % 2 === 0 ? "#1e293b" : "#374151";
            ctx.fillRect(sx - segW / 2, -segH / 2, segW, segH);
            ctx.strokeStyle = "#f50057";
            ctx.lineWidth = 2;
            ctx.strokeRect(sx - segW / 2, -segH / 2, segW, segH);
            ctx.fillStyle = "#ff1744";
            ctx.fillRect(sx - 2, -3, 4, 6);
          }
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.moveTo(14, 0); ctx.lineTo(4, -12); ctx.lineTo(4, 12);
          ctx.closePath();
          ctx.fill();
          const snap = Math.sin(performance.now() * 0.008) * 3;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(8, -10); ctx.lineTo(20 + snap, -5);
          ctx.moveTo(8, 10); ctx.lineTo(20 + snap, 5);
          ctx.stroke();
        } else {
          ctx.fillStyle = e.color;
          ctx.beginPath();
          ctx.arc(0, 0, e.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Colorblind Indicator Icon
        if (this.colorblind) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.fillText(e.marker, 0, 4);
        }

        ctx.restore();

        // Modern Floating Health Bar
        const barW = Math.max(30, e.size * 2.2);
        const barH = e.isBoss ? 6 : 4;
        const bx = e.x - barW / 2;
        const by = e.y - e.size - 12;

        ctx.fillStyle = "#0a0f1d";
        ctx.fillRect(bx, by, barW, barH);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barW, barH);

        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = e.isBoss ? "#ff1744" : "#00e676";
        ctx.fillRect(bx, by, barW * hpPct, barH);

        if (e.maxShield > 0) {
          const shPct = Math.max(0, e.shield / e.maxShield);
          ctx.fillStyle = "#00b0ff";
          ctx.fillRect(bx, by - 3, barW * shPct, 2);
        }
      }
    }

    // --- TACTICAL DRAG-AND-DROP & MOBILE TOUCH OVERLAYS ---

    renderTacticalDragVector() {
      const ctx = this.ctx;

      // 1. Hero Drag Tactical Vector Line
      if (this.touchState.dragging === 'HERO') {
        const cur = this.touchState.dragCurrent;
        ctx.strokeStyle = "#ffd600";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(this.hero.x, this.hero.y);
        ctx.lineTo(cur.x, cur.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated destination target reticle
        ctx.strokeStyle = "#ffd600";
        ctx.fillStyle = "rgba(255, 214, 0, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cur.x, cur.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffd600";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("TARGET", cur.x, cur.y + 4);
      }

      // 2. Tower Hotbar Drag-to-Build Ghost
      if (this.touchState.dragging === 'TOWER_HOTBAR' && this.touchState.draggedTowerType) {
        const cur = this.touchState.dragCurrent;
        const def = TOWER_DEFS[this.touchState.draggedTowerType];

        // Draw floating turret under finger
        ctx.save();
        ctx.translate(cur.x, cur.y);
        ctx.fillStyle = def.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // If hovering over grid, render placement range and tile box
        if (this.hoverCell && cur.y >= 60 && cur.y <= 620) {
          const px = this.hoverCell.gx * 64 + 32;
          const py = this.hoverCell.gy * 64 + 32;
          const valid = this.hoverCell.valid;

          ctx.strokeStyle = valid ? "rgba(0, 229, 255, 0.5)" : "rgba(255, 23, 68, 0.5)";
          ctx.fillStyle = valid ? "rgba(0, 229, 255, 0.1)" : "rgba(255, 23, 68, 0.1)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, def.tiers[0].range, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = valid ? "#00e676" : "#ff1744";
          ctx.fillStyle = valid ? "rgba(0, 230, 118, 0.3)" : "rgba(255, 23, 68, 0.3)";
          ctx.fillRect(this.hoverCell.gx * 64 + 2, this.hoverCell.gy * 64 + 2, 60, 60);
          ctx.strokeRect(this.hoverCell.gx * 64 + 2, this.hoverCell.gy * 64 + 2, 60, 60);
        }
      }
    }

    renderRadialBuildWheel() {
      if (!this.radialBuildCell) return;
      const ctx = this.ctx;
      const rc = this.radialBuildCell;

      // 1. Highlight selected cell
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2.5;
      ctx.fillStyle = "rgba(0, 229, 255, 0.2)";
      ctx.fillRect(rc.gx * 64 + 2, rc.gy * 64 + 2, 60, 60);
      ctx.strokeRect(rc.gx * 64 + 2, rc.gy * 64 + 2, 60, 60);

      // 2. Connecting dashed spokes
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      const options = [
        { key: 'pulse', ang: -Math.PI * 0.8, icon: "⚡", label: "PULSE" },
        { key: 'mortar', ang: -Math.PI * 0.5, icon: "💣", label: "MORTAR" },
        { key: 'cryo', ang: -Math.PI * 0.2, icon: "❄️", label: "CRYO" },
        { key: 'railgun', ang: Math.PI * 0.15, icon: "🎯", label: "RAILGUN" },
        { key: 'beacon', ang: Math.PI * 0.85, icon: "📡", label: "BEACON" }
      ];

      for (const opt of options) {
        const bx = rc.px + Math.cos(opt.ang) * 65;
        const by = rc.py + Math.sin(opt.ang) * 65;
        ctx.beginPath();
        ctx.moveTo(rc.px, rc.py);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 3. Five Big Glowing Touch Buttons
      for (const opt of options) {
        const def = TOWER_DEFS[opt.key];
        const canAfford = this.gold >= def.cost;
        const bx = rc.px + Math.cos(opt.ang) * 65;
        const by = rc.py + Math.sin(opt.ang) * 65;
        const br = 24;

        ctx.fillStyle = canAfford ? "#0f172a" : "#1e293b";
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = canAfford ? def.color : "#475569";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(opt.icon, bx, by - 2);

        ctx.fillStyle = canAfford ? "#ffd600" : "#ff1744";
        ctx.font = "bold 9px monospace";
        ctx.fillText(`${def.cost}g`, bx, by + 12);
      }
    }

    renderMobileFloatingButtons() {
      const ctx = this.ctx;

      // 1. Floating Hero Ult Thumb Action Button (Bottom Right)
      const isUltReady = this.hero.currentUltCd <= 0;
      const ux = 1210;
      const uy = 540;
      const ur = 36;

      ctx.save();
      ctx.fillStyle = isUltReady ? "#1c355e" : "#131a29";
      ctx.beginPath();
      ctx.arc(ux, uy, ur, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isUltReady ? "#ffd600" : "#455a64";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (isUltReady) {
        ctx.strokeStyle = "rgba(255, 214, 0, 0.4)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(ux, uy, ur + 4, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Cooldown sweep arc
        const pct = this.hero.currentUltCd / this.hero.ultCd;
        ctx.fillStyle = "rgba(255, 23, 68, 0.35)";
        ctx.beginPath();
        ctx.moveTo(ux, uy);
        ctx.arc(ux, uy, ur, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = isUltReady ? "#ffd600" : "#90a4ae";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚡ ULT", ux, uy + 4);
      if (!isUltReady) {
        ctx.fillStyle = "#ff1744";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`${Math.ceil(this.hero.currentUltCd)}s`, ux, uy + 17);
      }
      ctx.restore();

      // 2. Floating Wave / Speed Thumb Action Button (Top Right)
      const wx = 1210;
      const wy = 90;
      const wr = 30;

      ctx.save();
      ctx.fillStyle = this.waveActive ? "#162b47" : "#00e5ff";
      ctx.beginPath();
      ctx.arc(wx, wy, wr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = this.waveActive ? "#00e5ff" : "#05070d";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      if (!this.waveActive) {
        ctx.fillText("▶ START", wx, wy + 4);
      } else {
        ctx.fillText(`${this.speed}x SPD`, wx, wy + 4);
      }
      ctx.restore();
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

      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 13px 'Segoe UI', monospace";
      this.ctx.textAlign = "left";
      this.ctx.fillText(`${this.t("core")}: ${this.baseHp}/${this.maxBaseHp}`, 16, 24);
      const hpPct = Math.max(0, this.baseHp / this.maxBaseHp);
      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(16, 32, 120, 14);
      this.ctx.fillStyle = hpPct > 0.3 ? "#00e5ff" : "#ff1744";
      this.ctx.fillRect(16, 32, 120 * hpPct, 14);

      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 17px monospace";
      this.ctx.fillText(`⚡ ${this.gold}G`, 150, 36);

      this.ctx.fillStyle = "#b0bec5";
      this.ctx.font = "12px monospace";
      this.ctx.fillText(`PTS: ${this.score}`, 240, 36);

      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 15px monospace";
      const maxWStr = (this.maxWaves > 50) ? "∞" : this.maxWaves;
      this.ctx.fillText(`${this.t("wave")} ${this.wave}/${maxWStr}`, 390, 36);

      this.ctx.fillStyle = this.waveActive ? "#162b47" : "#00e5ff";
      this.ctx.fillRect(470, 10, 150, 40);
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.strokeRect(470, 10, 150, 40);
      this.ctx.fillStyle = this.waveActive ? "#00e5ff" : "#05070d";
      this.ctx.font = "bold 12px monospace";
      const waveLabel = this.waveActive ? `${this.t("inBattle")} (${this.enemies.length})` : `${this.t("start")} [${Math.ceil(this.waveCountdown)}s]`;
      this.ctx.fillText(waveLabel, 545, 35);

      this.ctx.fillStyle = "#78909c";
      this.ctx.font = "11px monospace";
      const mapName = (this.gameMode === 'CUSTOM') ? "CUSTOM MAP" : MAPS[this.currentMapIndex].name.toUpperCase();
      this.ctx.fillText(`[${this.gameMode}] ${mapName}`, 705, 35);

      this.renderMiniButton(800, 12, 50, 36, `${this.speed}x`);
      this.renderMiniButton(860, 12, 55, 36, audio.sfxMuted ? "SFX ✕" : "SFX ✓");
      this.renderMiniButton(925, 12, 55, 36, audio.bgmMuted ? "BGM ✕" : "BGM ✓");
      this.renderMiniButton(990, 12, 55, 36, this.crtEnabled ? "CRT ✓" : "CRT ✕");
      this.renderMiniButton(1055, 12, 55, 36, this.colorblind ? "CB ✓" : "CB ✕");
      this.renderMiniButton(1120, 12, 50, 36, this.lang.toUpperCase());
      this.renderMiniButton(1180, 12, 60, 36, this.state === 'PAUSED' ? "RESUME" : "PAUSE");
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

      // Hero Mech Button at far left
      const isHeroUltReady = this.hero.currentUltCd <= 0;
      this.ctx.fillStyle = isHeroUltReady ? "#1c355e" : "#131a29";
      this.ctx.fillRect(10, 630, 50, 75);
      this.ctx.strokeStyle = isHeroUltReady ? "#ffd600" : "#455a64";
      this.ctx.strokeRect(10, 630, 50, 75);
      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 11px monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText("HERO", 35, 650);
      this.ctx.font = "9px monospace";
      this.ctx.fillText("ULT", 35, 668);
      if (this.hero.currentUltCd > 0) {
        this.ctx.fillStyle = "#ff1744";
        this.ctx.fillText(`${Math.ceil(this.hero.currentUltCd)}s`, 35, 690);
      } else {
        this.ctx.fillStyle = "#00e676";
        this.ctx.fillText("READY", 35, 690);
      }

      // 4 Skills Panel (x: 65 to 220)
      const skillList = ['emp', 'orbital', 'overclock', 'drone'];
      for (let i = 0; i < 4; i++) {
        const k = skillList[i];
        const s = this.skills[k];
        const sx = 65 + i * 40;
        const isReady = s.currentCd <= 0 && this.gold >= s.cost;

        this.ctx.fillStyle = isReady ? "#1c2b45" : "#101624";
        this.ctx.fillRect(sx, 630, 36, 75);
        this.ctx.strokeStyle = isReady ? "#00e5ff" : "#37474f";
        this.ctx.strokeRect(sx, 630, 36, 75);

        this.ctx.fillStyle = isReady ? "#00e5ff" : "#546e7a";
        this.ctx.font = "bold 11px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`[${s.key}]`, sx + 18, 650);
        this.ctx.font = "8px monospace";
        this.ctx.fillText(this.t(k).split(' ')[0], sx + 18, 665);
        this.ctx.fillStyle = "#ffd600";
        this.ctx.fillText(`${s.cost}g`, sx + 18, 680);

        if (s.currentCd > 0) {
          this.ctx.fillStyle = "rgba(255, 23, 68, 0.6)";
          this.ctx.fillRect(sx, 630, 36, 75 * (s.currentCd / s.cd));
          this.ctx.fillStyle = "#fff";
          this.ctx.font = "bold 10px monospace";
          this.ctx.fillText(`${Math.ceil(s.currentCd)}`, sx + 18, 696);
        }
      }

      if (this.selectedTower) {
        const t = this.selectedTower;
        const def = TOWER_DEFS[t.type];
        const spec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];

        this.ctx.fillStyle = spec.color || def.color;
        this.ctx.font = "bold 14px monospace";
        this.ctx.textAlign = "left";
        const titleStr = t.branch ? spec.name.toUpperCase() : `${def.name.toUpperCase()} (T${t.tier})`;
        this.ctx.fillText(titleStr, 235, 652);

        this.ctx.fillStyle = "#cfd8dc";
        this.ctx.font = "11px monospace";
        const stats = t.type === 'beacon' ?
          `Aura: +${(spec.dmgBuff || 0.35) * 100}% Dmg | Range: ${spec.range}px` :
          `Dmg: ${spec.dmg} | Rate: ${spec.rate}/s | Kills: ${t.kills} | Dmg: ${t.damageDealt}`;
        this.ctx.fillText(stats, 235, 674);

        // Branching upgrade at Tier 2
        if (t.tier === 2) {
          const bA = def.branches.A;
          const bB = def.branches.B;
          // Branch A Button
          this.ctx.fillStyle = this.gold >= bA.cost ? "#1a3b5c" : "#212b38";
          this.ctx.fillRect(450, 635, 140, 65);
          this.ctx.strokeStyle = bA.color;
          this.ctx.strokeRect(450, 635, 140, 65);
          this.ctx.fillStyle = bA.color;
          this.ctx.font = "bold 10px monospace";
          this.ctx.textAlign = "center";
          this.ctx.fillText(`[A] ${bA.name}`, 520, 654);
          this.ctx.fillStyle = "#ffd600";
          this.ctx.fillText(`${bA.cost}g`, 520, 672);
          this.ctx.fillStyle = "#90a4ae";
          this.ctx.font = "8px monospace";
          this.ctx.fillText(bA.perk.toUpperCase(), 520, 688);

          // Branch B Button
          this.ctx.fillStyle = this.gold >= bB.cost ? "#2b1a4a" : "#212b38";
          this.ctx.fillRect(605, 635, 140, 65);
          this.ctx.strokeStyle = bB.color;
          this.ctx.strokeRect(605, 635, 140, 65);
          this.ctx.fillStyle = bB.color;
          this.ctx.font = "bold 10px monospace";
          this.ctx.fillText(`[B] ${bB.name}`, 675, 654);
          this.ctx.fillStyle = "#ffd600";
          this.ctx.fillText(`${bB.cost}g`, 675, 672);
          this.ctx.fillStyle = "#90a4ae";
          this.ctx.font = "8px monospace";
          this.ctx.fillText(bB.perk.toUpperCase(), 675, 688);
        } else if (t.tier === 1) {
          // Standard Tier 1 -> Tier 2 upgrade
          const upCost = spec.upCost;
          const canUpgrade = this.gold >= upCost;
          this.ctx.fillStyle = canUpgrade ? "#00e676" : "#37474f";
          this.ctx.fillRect(480, 640, 140, 50);
          this.ctx.fillStyle = "#000";
          this.ctx.font = "bold 12px monospace";
          this.ctx.textAlign = "center";
          this.ctx.fillText(`[U] ${this.t("upgrade")} (${upCost}g)`, 550, 670);
        } else {
          // Tier 3 Max
          this.ctx.fillStyle = "#263238";
          this.ctx.fillRect(480, 640, 140, 50);
          this.ctx.fillStyle = "#ffd600";
          this.ctx.font = "bold 12px monospace";
          this.ctx.textAlign = "center";
          this.ctx.fillText("★ MAX SPECIALIZED ★", 550, 670);
        }

        // Sell button
        const refund = Math.floor(t.totalInvested * 0.70);
        this.ctx.fillStyle = "#ff1744";
        this.ctx.fillRect(760, 640, 110, 50);
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "bold 12px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`[S] (+${refund}g)`, 815, 670);

        // Priority button
        this.ctx.fillStyle = "#1e3a5f";
        this.ctx.fillRect(885, 640, 115, 50);
        this.ctx.strokeStyle = "#00e5ff";
        this.ctx.strokeRect(885, 640, 115, 50);
        this.ctx.fillStyle = "#00e5ff";
        this.ctx.fillText(`[T] ${t.priority}`, 942, 670);

        // Close
        this.ctx.fillStyle = "#37474f";
        this.ctx.fillRect(1015, 640, 45, 50);
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("✕", 1037, 670);
      } else {
        // Tower Hotbar
        const towerKeys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
        for (let i = 0; i < 5; i++) {
          const key = towerKeys[i];
          const def = TOWER_DEFS[key];
          const bx = 240 + i * 175;
          const isSelected = this.selectedBuildType === key;

          this.ctx.fillStyle = isSelected ? "rgba(0, 229, 255, 0.2)" : "#131e33";
          this.ctx.fillRect(bx, 630, 160, 75);
          this.ctx.strokeStyle = isSelected ? "#00e5ff" : (this.gold >= def.cost ? def.color : "#37474f");
          this.ctx.lineWidth = isSelected ? 2 : 1;
          this.ctx.strokeRect(bx, 630, 160, 75);

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

    renderDraftModal() {
      this.ctx.fillStyle = "rgba(5, 7, 13, 0.95)";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 32px 'Segoe UI', monospace";
      this.ctx.fillText(this.t("draftTitle"), 640, 110);

      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 14px monospace";
      this.ctx.fillText(this.t("draftSub"), 640, 150);

      for (let i = 0; i < this.draftCards.length; i++) {
        const c = this.draftCards[i];
        const x = 180 + i * 320;
        const y = 200;

        this.ctx.fillStyle = "#0c1527";
        this.ctx.fillRect(x, y, 280, 320);
        this.ctx.strokeStyle = c.color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, 280, 320);

        this.ctx.font = "40px monospace";
        this.ctx.fillText(c.icon, x + 140, y + 60);

        this.ctx.fillStyle = c.color;
        this.ctx.font = "bold 16px monospace";
        this.ctx.fillText(c.title, x + 140, y + 110);

        this.ctx.fillStyle = "#cfd8dc";
        this.ctx.font = "12px monospace";
        this.wrapText(c.desc, x + 20, y + 155, 240, 18);

        this.ctx.fillStyle = c.color;
        this.ctx.fillRect(x + 20, y + 250, 240, 45);
        this.ctx.fillStyle = "#000";
        this.ctx.font = "bold 14px monospace";
        this.ctx.fillText("SELECT PERK", x + 140, y + 278);
      }
    }

    renderAnalyticsScreen() {
      this.ctx.fillStyle = "#05070d";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 30px 'Segoe UI', monospace";
      this.ctx.fillText(this.t("analyticsTitle"), 640, 80);

      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 16px monospace";
      this.ctx.fillText(`MVP UNIT: ${this.analytics.mvpName}`, 640, 120);

      // Bar Charts for Damage
      const dmg = this.analytics.damageByTower;
      const categories = [
        { label: "PULSE", val: dmg.pulse, color: "#00e5ff" },
        { label: "MORTAR", val: dmg.mortar, color: "#ff9100" },
        { label: "CRYO", val: dmg.cryo, color: "#00f0ff" },
        { label: "RAILGUN", val: dmg.railgun, color: "#ff007f" },
        { label: "HERO MECH", val: dmg.hero, color: "#ffd600" },
        { label: "COMMANDER", val: dmg.skills, color: "#76ff03" }
      ];

      const maxVal = Math.max(1, ...categories.map(c => c.val));
      for (let i = 0; i < categories.length; i++) {
        const c = categories[i];
        const y = 170 + i * 55;

        this.ctx.textAlign = "left";
        this.ctx.fillStyle = c.color;
        this.ctx.font = "bold 13px monospace";
        this.ctx.fillText(c.label, 120, y + 18);

        // Bar background
        this.ctx.fillStyle = "#101624";
        this.ctx.fillRect(260, y, 700, 26);

        // Bar fill
        const barW = (c.val / maxVal) * 696;
        this.ctx.fillStyle = c.color;
        this.ctx.fillRect(262, y + 2, barW, 22);

        this.ctx.fillStyle = "#fff";
        this.ctx.fillText(`${c.val.toLocaleString()} DMG`, 980, y + 18);
      }

      // Summary Stats
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#cfd8dc";
      this.ctx.font = "14px monospace";
      this.ctx.fillText(`Total Hostiles Defeated: ${this.analytics.totalKills} | Total Gold Processed: ${this.analytics.totalGold}g`, 640, 560);

      this.renderMenuButton(540, 630, 200, 50, "BACK TO MENU", "#00e5ff", "#000");
    }

    renderMainMenu() {
      this.ctx.fillStyle = "#05070d";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "800 46px 'Segoe UI', monospace";
      this.ctx.fillText(this.t("title"), 640, 150);

      this.ctx.fillStyle = "#ff007f";
      this.ctx.font = "bold 15px 'Segoe UI', monospace";
      this.ctx.fillText(this.t("sub"), 640, 190);

      this.ctx.fillStyle = "#78909c";
      this.ctx.font = "13px 'Segoe UI', monospace";
      this.ctx.fillText(`Commander: ${this.playerName} | Field Hero Mech Active | Roguelike Augments Ready`, 640, 220);

      this.renderMiniButton(1140, 20, 100, 36, `LANG: ${this.lang.toUpperCase()}`);

      this.renderMenuButton(440, 330, 400, 50, this.t("campaign"), "#00e5ff", "#05070d");
      this.renderMenuButton(440, 390, 400, 50, this.t("sectorSelect"), "#162238", "#00e5ff", "#00e5ff");
      this.renderMenuButton(440, 450, 400, 50, this.t("endless"), "#26133a", "#e040fb", "#e040fb");
      this.renderMenuButton(440, 510, 190, 45, this.t("bossRush"), "#33121d", "#ff1744", "#ff1744");
      this.renderMenuButton(650, 510, 190, 45, this.t("mapEditor"), "#132d2a", "#00e676", "#00e676");
      this.renderMenuButton(440, 565, 190, 45, this.t("leaderboard"), "#142038", "#ffd600", "#ffd600");
      this.renderMenuButton(650, 565, 190, 45, this.t("fieldManual"), "#182848", "#00e5ff", "#00e5ff");
      this.renderMenuButton(440, 620, 400, 45, `📥 ${this.t("downloadOffline")}`, "#122033", "#ffd600", "#ffd600");
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
      this.ctx.font = "bold 13px 'Segoe UI', monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText(text, x + w / 2, y + h / 2 + 5);
    }

    renderFieldManual() {
      this.ctx.fillStyle = "#05070d";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 24px 'Segoe UI', monospace";
      this.ctx.fillText(this.t("fieldManual"), 60, 50);

      this.renderMiniButton(60, 20, 90, 32, "← MENU");

      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 15px monospace";
      this.ctx.fillText("5 TOWERS + TIER 3 BRANCHING SPECIALIZATIONS (10 ULTIMATE BLUEPRINTS):", 60, 95);

      const towers = Object.values(TOWER_DEFS);
      for (let i = 0; i < towers.length; i++) {
        const t = towers[i];
        const x = 60 + i * 235;
        this.ctx.fillStyle = "#0c1527";
        this.ctx.fillRect(x, 110, 220, 185);
        this.ctx.strokeStyle = t.color;
        this.ctx.strokeRect(x, 110, 220, 185);

        this.ctx.fillStyle = t.color;
        this.ctx.font = "bold 13px monospace";
        this.ctx.fillText(t.name, x + 8, 132);

        this.ctx.fillStyle = "#cfd8dc";
        this.ctx.font = "10px monospace";
        this.ctx.fillText(`Cost: ${t.cost}g | ${t.type}`, x + 8, 150);

        this.ctx.fillStyle = t.branches.A.color;
        this.ctx.fillText(`[A] ${t.branches.A.name}`, x + 8, 180);
        this.ctx.fillStyle = "#90a4ae";
        this.ctx.font = "9px monospace";
        this.wrapText(t.branches.A.desc, x + 8, 195, 205, 13);

        this.ctx.fillStyle = t.branches.B.color;
        this.ctx.font = "10px monospace";
        this.ctx.fillText(`[B] ${t.branches.B.name}`, x + 8, 240);
        this.ctx.fillStyle = "#90a4ae";
        this.ctx.font = "9px monospace";
        this.wrapText(t.branches.B.desc, x + 8, 255, 205, 13);
      }

      this.ctx.fillStyle = "#ff1744";
      this.ctx.font = "bold 15px monospace";
      this.ctx.fillText("HERO MECH & HOSTILES:", 60, 330);

      const enemyList = [
        { name: "Apex-01 Hero Mech", desc: "Controllable unit. Melee attack + Cyber-Slash Ult [SPACE]." },
        { name: "Grunt / Sprinter", desc: "Standard and fast hostiles. Vulnerable to Pulse & Cryo." },
        { name: "Brute / Shieldbearer", desc: "Heavily armored and shield regenerating threats." },
        { name: "Medic / Splitter", desc: "Heals allies (+15 HP/s) / Splits into 2 Swarmlings on death." },
        { name: "Phantom", desc: "Phases out every 4s. Revealed by Radar Beacon." },
        { name: "Juggernaut (W10 Boss)", desc: "6000 HP, 20 armor, slow cap. Heavy defense." },
        { name: "Overseer (W20 Boss)", desc: "9000 HP, summons sprinter drones, energy burst." },
        { name: "Hive Titan (W30 Boss)", desc: "20000 HP, 3 phases, enrage speed buff (+40%)." }
      ];

      for (let i = 0; i < enemyList.length; i++) {
        const e = enemyList[i];
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 60 + col * 295;
        const y = 350 + row * 90;

        this.ctx.fillStyle = "#10192e";
        this.ctx.fillRect(x, y, 280, 80);
        this.ctx.strokeStyle = i === 0 ? "#ffd600" : "#ff007f";
        this.ctx.strokeRect(x, y, 280, 80);

        this.ctx.fillStyle = i === 0 ? "#ffd600" : "#ff1744";
        this.ctx.font = "bold 12px monospace";
        this.ctx.fillText(e.name, x + 10, y + 24);

        this.ctx.fillStyle = "#b0bec5";
        this.ctx.font = "10px monospace";
        this.wrapText(e.desc, x + 10, y + 44, 260, 15);
      }

      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 13px monospace";
      this.ctx.fillText("ROGUELIKE DRAFTS OCCUR EVERY 5 WAVES (WAVE 5, 10, 15, 20, 25). CHOOSE 1 OF 3 CARDS TO STACK!", 60, 680);
    }

    renderMapSelect() {
      this.ctx.fillStyle = "#05070d";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#00e5ff";
      this.ctx.font = "bold 24px 'Segoe UI', monospace";
      this.ctx.fillText(this.t("sectorSelect"), 60, 55);

      this.renderMiniButton(60, 20, 90, 30, "← MENU");

      for (let i = 0; i < MAPS.length; i++) {
        const m = MAPS[i];
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 60 + col * 235;
        const y = 85 + row * 240;

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

      this.ctx.fillStyle = "#0c1527";
      this.ctx.fillRect(0, 0, this.width, 65);
      this.ctx.strokeStyle = "#00e5ff";
      this.ctx.strokeRect(0, 0, this.width, 65);

      this.renderMiniButton(50, 16, 90, 34, "← MENU");
      this.renderMiniButton(160, 16, 120, 34, "▶ TEST PLAY");
      this.renderMiniButton(295, 16, 90, 34, "CLEAR");
      this.renderMiniButton(400, 16, 120, 34, "EXPORT JSON");
      this.renderMiniButton(535, 16, 120, 34, "IMPORT JSON");

      this.ctx.fillStyle = "#78909c";
      this.ctx.font = "11px monospace";
      this.ctx.textAlign = "left";
      this.ctx.fillText("Click grid to add lane waypoints from SPAWN to BASE CORE.", 680, 38);

      this.ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
      for (let x = 0; x <= this.width; x += 64) {
        this.ctx.beginPath(); this.ctx.moveTo(x, 65); this.ctx.lineTo(x, 650); this.ctx.stroke();
      }
      for (let y = 65; y <= 650; y += 64) {
        this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.width, y); this.ctx.stroke();
      }

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
      this.ctx.fillText(this.t("leaderboard"), 60, 55);

      this.renderMiniButton(60, 20, 90, 32, "← MENU");
      this.renderMiniButton(1050, 20, 170, 32, `HANDLE: ${this.playerName}`);

      this.ctx.fillStyle = "#162238";
      this.ctx.fillRect(60, 90, 1160, 40);
      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 14px monospace";
      this.ctx.fillText("RANK", 80, 115);
      this.ctx.fillText("COMMANDER", 180, 115);
      this.ctx.fillText("SECTOR", 460, 115);
      this.ctx.fillText("WAVE REACHED", 760, 115);
      this.ctx.fillText("TACTICAL SCORE", 1000, 115);

      const rows = this.saveData.leaderboard.slice(0, 11);
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const y = 150 + i * 44;
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
      this.ctx.fillText(this.t("sectorDefended"), 640, 230);

      this.ctx.fillStyle = "#ffd600";
      this.ctx.font = "bold 28px monospace";
      this.ctx.fillText(this.t("missionSuccess"), 640, 290);

      this.ctx.fillStyle = "#cfd8dc";
      this.ctx.font = "16px monospace";
      this.ctx.fillText(`Tactical Score: ${this.score} PTS | MVP: ${this.analytics.mvpName}`, 640, 340);

      this.renderMenuButton(380, 460, 160, 50, this.t("playAgain"), "#00e5ff", "#000");
      this.renderMenuButton(560, 460, 160, 50, "📊 ANALYTICS", "#162238", "#ffd600", "#ffd600");
      this.renderMenuButton(740, 460, 160, 50, this.t("mainMenu"), "#162238", "#00e5ff", "#00e5ff");
    }

    renderDefeatModal() {
      this.ctx.fillStyle = "rgba(5, 7, 13, 0.9)";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = "#ff1744";
      this.ctx.font = "bold 44px 'Segoe UI', monospace";
      this.ctx.textAlign = "center";
      this.ctx.fillText(this.t("gridOverrun"), 640, 230);

      this.ctx.fillStyle = "#cfd8dc";
      this.ctx.font = "18px monospace";
      this.ctx.fillText(`Breached at Wave ${this.wave}. Score: ${this.score} PTS`, 640, 300);

      this.renderMenuButton(380, 460, 160, 50, this.t("retry"), "#ff1744", "#fff");
      this.renderMenuButton(560, 460, 160, 50, "📊 ANALYTICS", "#162238", "#ffd600", "#ffd600");
      this.renderMenuButton(740, 460, 160, 50, this.t("mainMenu"), "#162238", "#ff1744", "#ff1744");
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.lastGridEngine = new LastGridEngine();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  });

})();
