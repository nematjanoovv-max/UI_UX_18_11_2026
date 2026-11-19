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
      this.samplesLoaded = false;
      this.sampleBuffers = {};
    }
    loadSamples() {
      if (this.samplesLoaded) return;
      this.samplesLoaded = true;
      const sfxList = {
        click: 'assets/audio/sfx/click.mp3',
        laser: 'assets/audio/sfx/laser.mp3',
        explosion: 'assets/audio/sfx/explosion.mp3',
        zap: 'assets/audio/sfx/zap.mp3',
        wave_clear: 'assets/audio/sfx/wave_clear.mp3',
        cannon: 'assets/audio/sfx/cannon.mp3',
        modal: 'assets/audio/sfx/modal.mp3',
        build: 'assets/audio/sfx/build.mp3'
      };
      for (const [key, path] of Object.entries(sfxList)) {
        try {
          if (typeof fetch === 'function' && this.ctx) {
            fetch(path)
              .then(res => { if (!res.ok) throw new Error(); return res.arrayBuffer(); })
              .then(buf => this.ctx ? this.ctx.decodeAudioData(buf) : null)
              .then(decoded => { if (decoded) this.sampleBuffers[key] = decoded; })
              .catch(() => {
                try {
                  const a = new Audio(path);
                  a.preload = 'auto';
                  this.sampleBuffers[key] = a;
                } catch(e) {}
              });
          } else {
            const a = new Audio(path);
            a.preload = 'auto';
            this.sampleBuffers[key] = a;
          }
        } catch(e) {}
      }
    }
    playSample(key, vol = 0.5) {
      if (this.sfxMuted) return false;
      const sfxVol = (window.lastGridEngine && window.lastGridEngine.settings) ? window.lastGridEngine.settings.sfxVol : 1.0;
      if (sfxVol <= 0) return true;
      const finalVol = Math.max(0, Math.min(1, vol * sfxVol));

      const s = this.sampleBuffers && this.sampleBuffers[key];
      if (!s) return false;
      try {
        if (s instanceof AudioBuffer && this.ctx) {
          const src = this.ctx.createBufferSource();
          src.buffer = s;
          const gain = this.ctx.createGain();
          gain.gain.value = finalVol;
          src.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(0);
          return true;
        } else if (s instanceof Audio) {
          const clone = s.cloneNode();
          clone.volume = finalVol;
          clone.play().catch(() => {});
          return true;
        }
      } catch(e) {}
      return false;
    }
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      this.loadSamples();
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
    click() {
      if (!this.playSample('click', 0.5)) this.playTone(900, 'triangle', 0.04, 0.06, 600);
    }
    modal() {
      if (!this.playSample('modal', 0.55)) this.playTone(520, 'sine', 0.12, 0.09, 780);
    }
    waveClear() {
      if (!this.playSample('wave_clear', 0.7)) this.victory();
    }
    build() {
      if (!this.playSample('build', 0.6)) this.upgrade();
    }
    shootPulse() {
      if (!this.playSample('laser', 0.35)) this.playTone(850, 'sawtooth', 0.08, 0.06, 200);
    }
    shootMortar() {
      if (!this.playSample('cannon', 0.55)) this.playTone(180, 'triangle', 0.35, 0.15, 35);
    }
    shootCryo() {
      if (!this.playSample('zap', 0.45)) this.playTone(650, 'sine', 0.22, 0.08, 1100);
    }
    shootRailgun() {
      if (!this.playSample('laser', 0.65)) {
        this.playTone(120, 'sawtooth', 0.3, 0.18, 40);
        this.playTone(1200, 'square', 0.15, 0.08, 300);
      }
    }
    upgrade() {
      if (!this.playSample('build', 0.55)) {
        this.playTone(440, 'triangle', 0.1, 0.1, 660);
        setTimeout(() => this.playTone(660, 'triangle', 0.15, 0.1, 880), 80);
      }
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
      if (!this.playSample('wave_clear', 0.75)) {
        [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.15), i * 120));
      }
    }
    airdropFlyby() {
      this.playTone(90, 'triangle', 0.8, 0.12, 160);
      setTimeout(() => this.playTone(160, 'triangle', 0.8, 0.1, 80), 300);
    }
    airdropLoot() {
      [523, 659, 783, 1046].forEach((f, i) => setTimeout(() => this.playTone(f, 'square', 0.18, 0.12), i * 70));
    }
    bossSiren() {
      // 2-tone cycling high-urgency emergency tactical alert siren
      [580, 880, 580, 880, 520, 780].forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'sawtooth', 0.28, 0.25, f * 0.8), i * 250);
      });
    }
    redZoneSiren() {
      this.playTone(600, 'sawtooth', 0.35, 0.18, 300);
      setTimeout(() => this.playTone(750, 'sawtooth', 0.35, 0.18, 400), 200);
    }
    artilleryBlast() {
      if (!this.playSample('explosion', 0.7)) {
        this.playTone(70, 'sawtooth', 0.45, 0.25, 30);
        this.playTone(140, 'triangle', 0.3, 0.2, 40);
      }
    }
    barricadeHit() {
      this.playTone(110, 'square', 0.08, 0.12, 50);
    }
    barricadeBreak() {
      this.playTone(180, 'sawtooth', 0.4, 0.25, 45);
      this.playTone(90, 'square', 0.5, 0.2, 30);
    }
    radioBeep() {
      this.playTone(880, 'sine', 0.05, 0.08);
      setTimeout(() => this.playTone(1174, 'sine', 0.07, 0.08), 60);
    }
    defeat() {
      [330, 293, 261, 196].forEach((f, i) => setTimeout(() => this.playTone(f, 'sawtooth', 0.35, 0.2, 80), i * 150));
    }
  }

  const audio = new SoundSynth();

  // --- MAP DEFINITIONS ---
  // --- 10 CAMPAIGN MAPS: TACTICAL DESTRUCTIBLE BARRICADES ---
  const MAP_BARRICADES = [
    // Map 0: Training Grid
    [ { x: 384, y: 320, hp: 350, maxHp: 350, type: 'reinforced' }, { x: 896, y: 352, hp: 350, maxHp: 350, type: 'reinforced' } ],
    // Map 1: Crossroads
    [ { x: 448, y: 256, hp: 350, maxHp: 350, type: 'reinforced' }, { x: 700, y: 384, hp: 350, maxHp: 350, type: 'reinforced' } ],
    // Map 2: Spiral Core
    [ { x: 550, y: 64, hp: 350, maxHp: 350, type: 'reinforced' }, { x: 192, y: 380, hp: 350, maxHp: 350, type: 'reinforced' }, { x: 640, y: 448, hp: 350, maxHp: 350, type: 'reinforced' } ],
    // Map 3: Misty Pass
    [ { x: 384, y: 320, hp: 350, maxHp: 350, type: 'reinforced' }, { x: 640, y: 320, hp: 350, maxHp: 350, type: 'reinforced' }, { x: 896, y: 320, hp: 350, maxHp: 350, type: 'reinforced' } ],
    // Map 4: Fast Track
    [ { x: 400, y: 256, hp: 400, maxHp: 400, type: 'reinforced' }, { x: 750, y: 256, hp: 400, maxHp: 400, type: 'reinforced' } ],
    // Map 5: Scrap Yard
    [ { x: 450, y: 128, hp: 350, maxHp: 350, type: 'reinforced' }, { x: 480, y: 384, hp: 350, maxHp: 350, type: 'reinforced' }, { x: 700, y: 576, hp: 350, maxHp: 350, type: 'reinforced' } ],
    // Map 6: Iron Wall (Heavy Fortified)
    [ { x: 130, y: 320, hp: 550, maxHp: 550, type: 'fortified' }, { x: 576, y: 512, hp: 550, maxHp: 550, type: 'fortified' }, { x: 1056, y: 320, hp: 550, maxHp: 550, type: 'fortified' } ],
    // Map 7: Blackout City
    [ { x: 320, y: 288, hp: 380, maxHp: 380, type: 'reinforced' }, { x: 640, y: 320, hp: 380, maxHp: 380, type: 'reinforced' }, { x: 960, y: 352, hp: 380, maxHp: 380, type: 'reinforced' } ],
    // Map 8: Twin Gate (Dual Choke Points)
    [ { x: 350, y: 192, hp: 400, maxHp: 400, type: 'reinforced' }, { x: 350, y: 448, hp: 400, maxHp: 400, type: 'reinforced' }, { x: 850, y: 320, hp: 400, maxHp: 400, type: 'reinforced' } ],
    // Map 9: The Last Grid (Ultimate 4 Fortified Barricades)
    [ { x: 600, y: 64, hp: 500, maxHp: 500, type: 'fortified' }, { x: 600, y: 256, hp: 500, maxHp: 500, type: 'fortified' }, { x: 600, y: 448, hp: 500, maxHp: 500, type: 'fortified' }, { x: 850, y: 576, hp: 500, maxHp: 500, type: 'fortified' } ]
  ];

  const RADIO_BRIEFINGS = {
    uz: [
      "Operatsiya: Training Grid! Minora va to'siqlarni sinovdan o'tkazamiz.",
      "Operatsiya: Crossroads! Dushmanlar to'g'ri chiziqda, to'siqlarni mustahkamlang!",
      "Operatsiya: Spiral Core! Girdob markaziga Mortar va Cryo joylashtiring!",
      "Operatsiya: Misty Pass! Tumanli dovonda dushman ko'rinishi past, ehtiyot bo'ling!",
      "Operatsiya: Fast Track! Tezyurar yo'l! Dushmanlar +15% tezroq yuguradi!",
      "Operatsiya: Scrap Yard! Resurslar taqchil! Har bir o'qni hisoblab tejang!",
      "Operatsiya: Iron Wall! Og'ir himoyalangan devor! Railgun lazerlarini tayyorlang!",
      "Operatsiya: Blackout City! Kiber-shahar! Davriy EMP to'lqinlari kutilmoqda!",
      "Operatsiya: Twin Gate! Ikki tomondan parallel hujum! Kuchlarni teng taqsimlang!",
      "Operatsiya: The Last Grid! So'nggi istehkom! 3 ta Titan Boss kutmoqda. Baza himoyasi sizga omonat!"
    ],
    en: [
      "Operation: Training Grid! Calibrate all defense turrets and barricades.",
      "Operation: Crossroads! Enemies advancing along straight vectors. Hold the barriers!",
      "Operation: Spiral Core! Dense inward spiral. Optimal for Mortar and Cryo AoE.",
      "Operation: Misty Pass! Dense fog detected. Sensor range reduced by 15%.",
      "Operation: Fast Track! Magnetic highway. Enemy speed increased by 15%!",
      "Operation: Scrap Yard! Scarce resources. Conserve gold and fortify barricades.",
      "Operation: Iron Wall! Heavily fortified enemy zone. Deploy armor-piercing Railguns!",
      "Operation: Blackout City! Cyber-metropolis. Beware periodic EMP power surges!",
      "Operation: Twin Gate! Converging dual vector assault. Split defensive coverage!",
      "Operation: The Last Grid! Final endurance sector. 3 Titan Bosses incoming. Defend the Core!"
    ],
    ru: [
      "Операция: Training Grid! Калибровка башен и тактических баррикад.",
      "Операция: Crossroads! Враги наступают по прямым коридорам. Удерживайте заслоны!",
      "Операция: Spiral Core! Спиральный сектор. Оптимально для мортир и заморозки.",
      "Операция: Misty Pass! Электромагнитный туман снижает радиус огня на 15%.",
      "Операция: Fast Track! Магнитное шоссе. Враги двигаются на 15% быстрее!",
      "Операция: Scrap Yard! Дефицит ресурсов. Экономьте золото и чините баррикады.",
      "Операция: Iron Wall! Бронированная зона. Применяйте рельсотроны с пробитием!",
      "Операция: Blackout City! Кибер-мегаполис. Остерегайтесь периодических ЭМИ-вспышек!",
      "Операция: Twin Gate! Сходящиеся векторы атаки. Распределяйте турели равномерно!",
      "Операция: The Last Grid! Финальный сектор. 3 Титана. Защитите Ядро любой ценой!"
    ]
  };

  const MAPS = [
    {
      id: "training_grid", name: "Training Grid", desc: "Basic S-curve test field. Clean terrain with single lane.",
      wave_count: 10, gold: 250, hp: 20, modifier: "none", biome: "cyber",
      lanes: [ [ {x:64, y:192}, {x:384, y:192}, {x:384, y:448}, {x:896, y:448}, {x:896, y:256}, {x:1152, y:256} ] ]
    },
    {
      id: "crossroads", name: "Crossroads", desc: "Interconnected straight corridors with multiple defense pockets.",
      wave_count: 12, gold: 250, hp: 20, modifier: "none", biome: "cyber",
      lanes: [ [ {x:64, y:128}, {x:448, y:128}, {x:448, y:384}, {x:896, y:384}, {x:1152, y:384} ] ]
    },
    {
      id: "spiral_core", name: "Spiral Core", desc: "Concentric inward spiral. Optimal for Mortar and Cryo AoE setups.",
      wave_count: 15, gold: 250, hp: 20, modifier: "none", biome: "lava",
      lanes: [ [ {x:64, y:64}, {x:1152, y:64}, {x:1152, y:576}, {x:192, y:576}, {x:192, y:192}, {x:960, y:192}, {x:960, y:448}, {x:384, y:448}, {x:384, y:320}, {x:640, y:320} ] ]
    },
    {
      id: "misty_pass", name: "Misty Pass", desc: "Dense electromagnetic fog reduces all tower ranges by -15%.",
      wave_count: 15, gold: 250, hp: 20, modifier: "fog", biome: "cryo",
      lanes: [ [ {x:64, y:320}, {x:256, y:128}, {x:512, y:512}, {x:768, y:128}, {x:1024, y:512}, {x:1152, y:320} ] ]
    },
    {
      id: "fast_track", name: "Fast Track", desc: "High-speed magnetic highway. All enemies move +15% faster!",
      wave_count: 20, gold: 260, hp: 20, modifier: "fast_lane", biome: "cyber",
      lanes: [ [ {x:64, y:256}, {x:1152, y:256} ] ]
    },
    {
      id: "scrap_yard", name: "Scrap Yard", desc: "Resource-starved industrial ruins. Enemy bounties reduced by -20%.",
      wave_count: 20, gold: 240, hp: 20, modifier: "scarce", biome: "lava",
      lanes: [ [ {x:64, y:128}, {x:768, y:128}, {x:768, y:384}, {x:256, y:384}, {x:256, y:576}, {x:1152, y:576} ] ]
    },
    {
      id: "iron_wall", name: "Iron Wall", desc: "Fortified barrier zone. All enemy units gain +20% bonus armor.",
      wave_count: 25, gold: 280, hp: 20, modifier: "armored", biome: "cyber",
      lanes: [ [ {x:64, y:128}, {x:192, y:512}, {x:960, y:512}, {x:1152, y:128} ] ]
    },
    {
      id: "blackout_city", name: "Blackout City", desc: "Cybernetic metropolis with periodic EMP surges every 5 waves.",
      wave_count: 25, gold: 280, hp: 20, modifier: "blackout", biome: "cryo",
      lanes: [ [ {x:64, y:128}, {x:320, y:128}, {x:320, y:448}, {x:640, y:448}, {x:640, y:192}, {x:960, y:192}, {x:960, y:512}, {x:1152, y:512} ] ]
    },
    {
      id: "twin_gate", name: "Twin Gate", desc: "Dual converging vectors converging directly into the central core.",
      wave_count: 30, gold: 300, hp: 20, modifier: "double_lane", biome: "lava",
      lanes: [
        [ {x:64, y:192}, {x:512, y:192}, {x:640, y:320}, {x:1152, y:320} ],
        [ {x:64, y:448}, {x:512, y:448}, {x:640, y:320}, {x:1152, y:320} ]
      ]
    },
    {
      id: "last_grid", name: "The Last Grid", desc: "Final endurance sector: full 30 waves with 3 Boss encounters!",
      wave_count: 30, gold: 350, hp: 25, modifier: "last_grid", biome: "cyber",
      lanes: [ [ {x:64, y:64}, {x:1152, y:64}, {x:1152, y:256}, {x:128, y:256}, {x:128, y:448}, {x:1152, y:448}, {x:1152, y:576}, {x:640, y:576} ] ]
    }
  ];

  // --- TOWER BLUEPRINTS & BRANCHING SPECIALIZATIONS (TIER 3) ---
  // Calibrated with Cyberpunk 2077 & Valorant Weapon Statistics
  const TOWER_DEFS = {
    pulse: {
      id: "pulse", name: "Pulse Tower", type: "KINETIC", color: "#00e5ff", cost: 100, desc: "Rapid-fire kinetic tracer gun.",
      tiers: [
        { dmg: 14, rate: 4.8, range: 145, upCost: 120 },
        { dmg: 22, rate: 6.2, range: 160, upCost: 200 },
        { dmg: 32, rate: 8.0, range: 175, upCost: 0 }
      ],
      branches: {
        A: { name: "Gatling Shredder", dmg: 24, rate: 12.0, range: 170, color: "#00e5ff", perk: "shred", cost: 260, desc: "Fires 12 rps (CP77 SMG archetype). Shreds 1 armor per hit." },
        B: { name: "Sniper Rail-Pulse", dmg: 340, rate: 1.15, range: 320, color: "#00b0ff", perk: "sniper", cost: 290, desc: "Extreme range (CP77 Tech Sniper archetype). 300% crit on bosses." }
      }
    },
    mortar: {
      id: "mortar", name: "Mortar Tower", type: "EXPLOSIVE", color: "#ff9100", cost: 150, desc: "Long-range explosive shell with area splash.",
      tiers: [
        { dmg: 55, rate: 0.85, range: 210, splash: 65, upCost: 150 },
        { dmg: 85, rate: 0.95, range: 225, splash: 80, upCost: 250 },
        { dmg: 130, rate: 1.05, range: 240, splash: 95, upCost: 0 }
      ],
      branches: {
        A: { name: "Cluster Bomb", dmg: 110, rate: 1.0, range: 235, splash: 85, color: "#ff9100", perk: "cluster", cost: 280, desc: "Detonates into 4 secondary cluster bomblets." },
        B: { name: "Napalm Cyber-Fire", dmg: 75, rate: 0.9, range: 225, splash: 100, color: "#ff3d00", perk: "napalm", cost: 290, desc: "Leaves cyber-fire pool on path (50 DoT)." }
      }
    },
    cryo: {
      id: "cryo", name: "Cryo Tower", type: "ENERGY", color: "#00f0ff", cost: 120, desc: "Cryogenic emitter that slows hostiles.",
      tiers: [
        { dmg: 6, rate: 1.8, range: 140, slow: 0.35, slowDur: 2.5, upCost: 140 },
        { dmg: 10, rate: 2.0, range: 155, slow: 0.45, slowDur: 3.0, upCost: 220 },
        { dmg: 16, rate: 2.2, range: 170, slow: 0.55, slowDur: 3.5, upCost: 0 }
      ],
      branches: {
        A: { name: "Blizzard Zero", dmg: 25, rate: 2.0, range: 175, slow: 1.0, slowDur: 2.0, color: "#00f0ff", perk: "freeze_solid", cost: 270, desc: "100% frozen solid stun + 50% shatter dmg." },
        B: { name: "Tesla Chain-Frost", dmg: 55, rate: 1.8, range: 185, slow: 0.5, slowDur: 3.0, color: "#76ff03", perk: "tesla_chain", cost: 300, desc: "Chains electric arc to 3 nearby targets with EMP zap." }
      }
    },
    railgun: {
      id: "railgun", name: "Railgun Tower", type: "PIERCE", color: "#ff007f", cost: 250, desc: "High-voltage magnetic beam piercing targets.",
      tiers: [
        { dmg: 160, rate: 0.65, range: 250, pierce: 1, upCost: 260 },
        { dmg: 260, rate: 0.75, range: 275, pierce: 2, upCost: 380 },
        { dmg: 400, rate: 0.85, range: 300, pierce: 3, upCost: 0 }
      ],
      branches: {
        A: { name: "Hyper Beam Laser", dmg: 650, rate: 1.2, range: 310, pierce: 5, color: "#ff007f", perk: "hyper_beam", cost: 420, desc: "Continuous sustained plasma beam laser." },
        B: { name: "Ion Disrupter", dmg: 460, rate: 0.8, range: 290, pierce: 99, color: "#d500f9", perk: "ion_strip", cost: 390, desc: "Instantly strips all enemy shields and pierces all." }
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

  // --- BTD6-POWERED WAVE PROGRESSION & CHOREOGRAPHY ---
  // Calibrated with Bloons TD 6 Round Balance Dataset (brandonconrady/bloons-tower-defense-6-rounds-1140)
  const CAMPAIGN_WAVES_BTD6 = [
    // W1 - W5: Early Recon & Sprinter Rush
    [ { type: "grunt", count: 15, interval: 0.9 } ],
    [ { type: "grunt", count: 25, interval: 0.75 } ],
    [ { type: "grunt", count: 18, interval: 0.7 }, { type: "sprinter", count: 8, interval: 0.6 } ],
    [ { type: "sprinter", count: 22, interval: 0.45 } ],
    [ { type: "grunt", count: 15, interval: 0.6 }, { type: "sprinter", count: 18, interval: 0.5 } ],

    // W6 - W10: Swarm Vanguard & Heavy Armor Wall & Boss 1
    [ { type: "swarmling", count: 35, interval: 0.28 } ],
    [ { type: "grunt", count: 15, interval: 0.6 }, { type: "swarmling", count: 28, interval: 0.3 } ],
    [ { type: "brute", count: 6, interval: 1.2 }, { type: "grunt", count: 14, interval: 0.7 } ],
    [ { type: "brute", count: 10, interval: 1.0 }, { type: "sprinter", count: 16, interval: 0.5 } ],
    [ { type: "juggernaut", count: 1, interval: 2.5 }, { type: "grunt", count: 18, interval: 0.65 } ],

    // W11 - W15: Energy Shields, Medics & Stealth Phantoms
    [ { type: "shieldbearer", count: 8, interval: 0.8 }, { type: "sprinter", count: 15, interval: 0.5 } ],
    [ { type: "shieldbearer", count: 12, interval: 0.7 }, { type: "swarmling", count: 30, interval: 0.3 } ],
    [ { type: "medic", count: 8, interval: 0.8 }, { type: "grunt", count: 22, interval: 0.6 } ],
    [ { type: "medic", count: 10, interval: 0.7 }, { type: "shieldbearer", count: 14, interval: 0.7 } ],
    [ { type: "phantom", count: 14, interval: 0.65 }, { type: "sprinter", count: 16, interval: 0.5 } ],

    // W16 - W20: Splitters & Combined Arms & Boss 2
    [ { type: "phantom", count: 18, interval: 0.6 }, { type: "brute", count: 8, interval: 1.1 } ],
    [ { type: "splitter", count: 12, interval: 0.9 }, { type: "shieldbearer", count: 10, interval: 0.7 } ],
    [ { type: "splitter", count: 16, interval: 0.8 }, { type: "medic", count: 10, interval: 0.7 } ],
    [ { type: "phantom", count: 15, interval: 0.6 }, { type: "brute", count: 10, interval: 0.9 }, { type: "shieldbearer", count: 12, interval: 0.7 } ],
    [ { type: "overseer", count: 1, interval: 2.5 }, { type: "phantom", count: 16, interval: 0.6 }, { type: "shieldbearer", count: 12, interval: 0.65 } ],

    // W21 - W25: High-Voltage Swarms & Mini-Boss Surge
    [ { type: "splitter", count: 20, interval: 0.75 }, { type: "swarmling", count: 35, interval: 0.25 } ],
    [ { type: "brute", count: 14, interval: 0.9 }, { type: "medic", count: 12, interval: 0.7 }, { type: "sprinter", count: 22, interval: 0.45 } ],
    [ { type: "phantom", count: 20, interval: 0.55 }, { type: "shieldbearer", count: 18, interval: 0.65 } ],
    [ { type: "brute", count: 14, interval: 0.85 }, { type: "splitter", count: 15, interval: 0.7 }, { type: "phantom", count: 15, interval: 0.6 } ],
    [ { type: "juggernaut", count: 1, interval: 2.0 }, { type: "splitter", count: 24, interval: 0.65 }, { type: "sprinter", count: 20, interval: 0.4 } ],

    // W26 - W30: Grand Apocalypse & Hive Titan Finale
    [ { type: "shieldbearer", count: 22, interval: 0.6 }, { type: "phantom", count: 20, interval: 0.55 }, { type: "medic", count: 15, interval: 0.6 } ],
    [ { type: "grunt", count: 35, interval: 0.4 }, { type: "sprinter", count: 25, interval: 0.35 }, { type: "brute", count: 16, interval: 0.8 } ],
    [ { type: "overseer", count: 1, interval: 2.5 }, { type: "phantom", count: 20, interval: 0.5 }, { type: "brute", count: 18, interval: 0.75 } ],
    [ { type: "splitter", count: 28, interval: 0.6 }, { type: "shieldbearer", count: 22, interval: 0.6 }, { type: "sprinter", count: 25, interval: 0.35 } ],
    [ { type: "hive_titan", count: 1, interval: 3.0 }, { type: "brute", count: 20, interval: 0.7 }, { type: "phantom", count: 25, interval: 0.5 } ]
  ];

  function getWaveConfig(waveNum, mode = 'CAMPAIGN') {
    if (mode === 'BOSS_RUSH') {
      if (waveNum === 1) return [{ type: "juggernaut", count: 1, interval: 2.0 }, { type: "brute", count: 8, interval: 1.0 }];
      if (waveNum === 2) return [{ type: "overseer", count: 1, interval: 2.0 }, { type: "phantom", count: 12, interval: 0.8 }];
      if (waveNum === 3) return [{ type: "hive_titan", count: 1, interval: 2.0 }, { type: "splitter", count: 15, interval: 0.7 }];
      return [{ type: "hive_titan", count: 2, interval: 3.0 }];
    }
    if (mode === 'CAMPAIGN' && waveNum >= 1 && waveNum <= 30) {
      return CAMPAIGN_WAVES_BTD6[waveNum - 1];
    }
    // Endless mode: fitted BTD6 power curve: RBE = 21.24 * wave^0.66
    const pool = ["grunt", "sprinter", "brute", "swarmling", "shieldbearer", "medic", "splitter", "phantom"];
    const baseCount = Math.floor(15 + Math.pow(waveNum, 0.75) * 3);
    const primary = pool[waveNum % pool.length];
    const secondary = pool[(waveNum + 3) % pool.length];
    const groups = [
      { type: primary, count: baseCount, interval: Math.max(0.25, 0.9 - waveNum * 0.01) },
      { type: secondary, count: Math.floor(baseCount * 0.7), interval: 0.5 }
    ];
    if (waveNum % 10 === 0) {
      const bossType = (waveNum % 30 === 0) ? "hive_titan" : (waveNum % 20 === 0 ? "overseer" : "juggernaut");
      groups.unshift({ type: bossType, count: Math.floor(waveNum / 30) + 1, interval: 2.5 });
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
      this.crtEnabled = localStorage.getItem('lg_crt') === 'true';
      this.colorblind = false;
      this.screenShake = 0;

      // Mobile Ergonomics & Dedicated Settings
      this.settings = {
        sfxVol: parseFloat(localStorage.getItem('lg_sfx_vol') || '1.0'),
        bgmVol: parseFloat(localStorage.getItem('lg_bgm_vol') || '0.7'),
        haptics: localStorage.getItem('lg_haptics') !== 'false',
        screenFit: localStorage.getItem('lg_screen_fit') || 'FIT',
        fpsLimit: parseInt(localStorage.getItem('lg_fps_limit') || '60'),
        lang: localStorage.getItem('last_grid_lang') || 'uz'
      };
      this.showSettingsModal = false;
      this.settingsReturnState = 'MENU';
      this.exitToastTimer = 0;
      this.lastBackTapTime = 0;

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
      this.casings = []; // Spent brass shell casings with physics
      this.scorchMarks = []; // Ground blast craters
      this.muzzleFlashes = []; // Dynamic weapon muzzle flashes
      this.footprints = []; // Mech / titan tread marks

      // Battlefield Dynamics v3.8.0
      this.airdrops = [];
      this.redZones = [];
      this.barricades = [];
      this.airdropCooldown = 22.0;
      this.redZoneCooldown = 38.0;
      this.radioComm = null;

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
      if (this.settings && this.settings.haptics === false) return;
      try {
        if (typeof window !== 'undefined' && window.AndroidBridge && window.AndroidBridge.vibrate) {
          const val = Array.isArray(pattern) ? JSON.stringify(pattern) : String(pattern);
          window.AndroidBridge.vibrate(val);
          return;
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(pattern);
        }
      } catch (e) {}
    }

    getApiUrl() {
      const isWebHttp = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http'));
      return isWebHttp ? '/api' : 'https://last-grid-td.vercel.app/api';
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
      fetch(this.getApiUrl())
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

      fetch(this.getApiUrl(), {
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

    handleBackAction() {
      // 1. If Settings modal is open -> close it
      if (this.showSettingsModal) {
        this.showSettingsModal = false;
        audio.click();
        return;
      }
      // 2. If Radial quick-build wheel is open -> close it
      if (this.radialBuildCell) {
        this.radialBuildCell = null;
        audio.click();
        return;
      }
      // 3. If Tower is selected -> deselect
      if (this.selectedTower) {
        this.selectedTower = null;
        audio.click();
        return;
      }
      // 4. If Build type is selected -> deselect
      if (this.selectedBuildType) {
        this.selectedBuildType = null;
        audio.click();
        return;
      }
      // 5. If Hero is selected -> deselect
      if (this.hero && this.hero.selected) {
        this.hero.selected = false;
        audio.click();
        return;
      }
      // 6. If in sub-screens -> return to MENU
      if (['MAP_SELECT', 'MANUAL', 'LEADERBOARD', 'EDITOR', 'ANALYTICS'].includes(this.state)) {
        this.state = 'MENU';
        audio.click();
        return;
      }
      // 7. If in 3D TPS arena -> return to MENU
      if (this.state === 'TPS_3D') {
        this.state = 'MENU';
        audio.sell();
        return;
      }
      // 8. If in PLAYING state -> toggle PAUSE (Never abruptly lose progress!)
      if (this.state === 'PLAYING') {
        this.togglePause();
        audio.modal();
        return;
      }
      // 9. If in PAUSED state -> unpause
      if (this.state === 'PAUSED') {
        if (x >= 420 && x <= 860 && y >= 335 && y <= 395) { this.togglePause(); return; }
        if (x >= 420 && x <= 860 && y >= 400 && y <= 460) { this.showSettingsModal = true; this.settingsReturnState = 'PAUSED'; return; }
        if (x >= 420 && x <= 860 && y >= 465 && y <= 525) { this.state = 'MENU'; this.selectedTower = null; return; }
        return;
      }
      // 10. If in MENU -> double tap back to exit application
      if (this.state === 'MENU') {
        const now = Date.now();
        if (now - this.lastBackTapTime < 2400) {
          if (typeof window !== 'undefined' && window.AndroidBridge && window.AndroidBridge.exitApp) {
            window.AndroidBridge.exitApp();
          }
        } else {
          this.lastBackTapTime = now;
          this.exitToastTimer = 2.4;
          this.vibrate(25);
          if (audio) audio.click();
        }
      }
    }

    renderExitToast() {
      const ctx = this.ctx;
      ctx.save();
      const alpha = Math.min(1.0, this.exitToastTimer / 0.5);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(10, 18, 32, 0.96)";
      ctx.fillRect(360, 645, 560, 48);
      ctx.strokeStyle = "#ffd600";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(360, 645, 560, 48);
      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("CHIQISH UCHUN YANA BIR BOR BOSING (PRESS BACK AGAIN TO EXIT)", 640, 674);
      ctx.restore();
    }

    renderSettingsModal() {
      const ctx = this.ctx;
      ctx.save();
      // Backdrop dimmer
      ctx.fillStyle = "rgba(4, 7, 14, 0.90)";
      ctx.fillRect(0, 0, this.width, this.height);

      const mx = 240;
      const my = 40;
      const mw = 800;
      const mh = 640;
      const cut = 12;

      // Modal Background Frame
      ctx.beginPath();
      ctx.moveTo(mx + cut, my);
      ctx.lineTo(mx + mw - cut, my);
      ctx.lineTo(mx + mw, my + cut);
      ctx.lineTo(mx + mw, my + mh - cut);
      ctx.lineTo(mx + mw - cut, my + mh);
      ctx.lineTo(mx + cut, my + mh);
      ctx.lineTo(mx, my + mh - cut);
      ctx.lineTo(mx, my + cut);
      ctx.closePath();

      const bgGrad = ctx.createLinearGradient(mx, my, mx, my + mh);
      bgGrad.addColorStop(0, "rgba(16, 26, 46, 0.99)");
      bgGrad.addColorStop(1, "rgba(8, 14, 25, 0.99)");
      ctx.fillStyle = bgGrad;
      ctx.fill();

      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top Header
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 24px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚙️ TIZIM VA O'YIN SOZLAMALARI (SETTINGS)", 640, my + 42);

      ctx.fillStyle = "#78909c";
      ctx.font = "bold 12px monospace";
      ctx.fillText("BOSHQARUV • OVOZ • GRAFIKA • EKRAN MOSLASHUVI", 640, my + 66);

      // Section 1: SFX Volume
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText("🔊 SFX OVOZLAR:", mx + 40, my + 115);
      const sfxLevels = [ { l: "100%", v: 1.0 }, { l: "70%", v: 0.7 }, { l: "30%", v: 0.3 }, { l: "O'CHIQ", v: 0.0 } ];
      for (let i = 0; i < 4; i++) {
        const bx = mx + 240 + i * 125;
        const sel = Math.abs(this.settings.sfxVol - sfxLevels[i].v) < 0.05;
        this.drawCyberButton(bx, my + 92, 115, 36, sfxLevels[i].l, sel ? "#00e676" : "#455a64", "", "", sel);
      }

      // Section 2: BGM Volume
      ctx.fillStyle = "#ffffff";
      ctx.fillText("🎵 MUSIQA (BGM):", mx + 40, my + 175);
      const bgmLevels = [ { l: "100%", v: 1.0 }, { l: "70%", v: 0.7 }, { l: "30%", v: 0.3 }, { l: "O'CHIQ", v: 0.0 } ];
      for (let i = 0; i < 4; i++) {
        const bx = mx + 240 + i * 125;
        const sel = Math.abs(this.settings.bgmVol - bgmLevels[i].v) < 0.05;
        this.drawCyberButton(bx, my + 152, 115, 36, bgmLevels[i].l, sel ? "#00e676" : "#455a64", "", "", sel);
      }

      // Section 3: Haptic Feedback
      ctx.fillStyle = "#ffffff";
      ctx.fillText("📳 TEBRANISH:", mx + 40, my + 235);
      this.drawCyberButton(mx + 240, my + 212, 240, 36, "YONIQ 🟢 (HAPTICS ON)", this.settings.haptics ? "#00e676" : "#455a64", "", "", this.settings.haptics);
      this.drawCyberButton(mx + 500, my + 212, 240, 36, "O'CHIQ 🔴 (OFF)", !this.settings.haptics ? "#ff1744" : "#455a64", "", "", !this.settings.haptics);

      // Section 4: Screen Fit Mode
      ctx.fillStyle = "#ffffff";
      ctx.fillText("📱 EKRAN REJIMI:", mx + 40, my + 295);
      const isFit = this.settings.screenFit === 'FIT';
      this.drawCyberButton(mx + 240, my + 272, 240, 36, "FIT (16:9 NISBAT)", isFit ? "#00e5ff" : "#455a64", "ORIGINAL PROPORTION", "", isFit);
      this.drawCyberButton(mx + 500, my + 272, 240, 36, "FILL (TO'LIQ CHEKKAGACHA)", !isFit ? "#00e5ff" : "#455a64", "EDGE-TO-EDGE 20:9", "", !isFit);

      // Section 5: FPS Mode
      ctx.fillStyle = "#ffffff";
      ctx.fillText("⚡ FPS REJIMI:", mx + 40, my + 355);
      const is60 = this.settings.fpsLimit === 60;
      this.drawCyberButton(mx + 240, my + 332, 240, 36, "60 FPS (SILLIQ ULTRA)", is60 ? "#ffd600" : "#455a64", "SMOOTH COMBAT", "", is60);
      this.drawCyberButton(mx + 500, my + 332, 240, 36, "30 FPS (BATAREYA TEJASH)", !is60 ? "#ffd600" : "#455a64", "BATTERY SAVER", "", !is60);

      // Section 6: Language
      ctx.fillStyle = "#ffffff";
      ctx.fillText("🌐 TIL (LANG):", mx + 40, my + 415);
      this.drawCyberButton(mx + 240, my + 392, 160, 36, "🇺🇿 O'ZBEK", this.lang === 'uz' ? "#00e5ff" : "#455a64", "", "", this.lang === 'uz');
      this.drawCyberButton(mx + 410, my + 392, 160, 36, "🇬🇧 ENGLISH", this.lang === 'en' ? "#00e5ff" : "#455a64", "", "", this.lang === 'en');
      this.drawCyberButton(mx + 580, my + 392, 160, 36, "🇷🇺 РУССКИЙ", this.lang === 'ru' ? "#00e5ff" : "#455a64", "", "", this.lang === 'ru');

      // Section 7: Retro CRT
      ctx.fillStyle = "#ffffff";
      ctx.fillText("📺 CRT SKAN-LINIYA:", mx + 40, my + 475);
      this.drawCyberButton(mx + 240, my + 452, 240, 36, "YONIQ (CRT ON)", this.crtEnabled ? "#00e5ff" : "#455a64", "", "", this.crtEnabled);
      this.drawCyberButton(mx + 500, my + 452, 240, 36, "O'CHIQ (CLEAN)", !this.crtEnabled ? "#00e5ff" : "#455a64", "", "", !this.crtEnabled);

      // Bottom Row: Close/Save & Main Menu
      this.drawCyberButton(mx + 60, my + 540, 320, 50, "← SAQLASH VA YOPISH", "#00e676", "APPLY & RESUME", "✔", true);
      const isIngame = (this.settingsReturnState === 'PLAYING' || this.settingsReturnState === 'PAUSED');
      this.drawCyberButton(mx + 420, my + 540, 320, 50, isIngame ? "🚪 ASOSIY MENYUGA QAYTISH" : "ASOSIY MENYUDA QOLISH", "#ff1744", isIngame ? "QUIT COMBAT" : "BACK", "←", false);

      ctx.restore();
    }

    handleSettingsClick(x, y) {
      const mx = 240;
      const my = 40;

      // Section 1: SFX
      if (y >= my + 92 && y <= my + 128) {
        const sfxLevels = [1.0, 0.7, 0.3, 0.0];
        for (let i = 0; i < 4; i++) {
          const bx = mx + 240 + i * 125;
          if (x >= bx && x <= bx + 115) {
            this.settings.sfxVol = sfxLevels[i];
            localStorage.setItem('lg_sfx_vol', sfxLevels[i].toString());
            audio.sfxMuted = (sfxLevels[i] === 0.0);
            audio.click();
            this.vibrate(15);
            return;
          }
        }
      }

      // Section 2: BGM
      if (y >= my + 152 && y <= my + 188) {
        const bgmLevels = [1.0, 0.7, 0.3, 0.0];
        for (let i = 0; i < 4; i++) {
          const bx = mx + 240 + i * 125;
          if (x >= bx && x <= bx + 115) {
            this.settings.bgmVol = bgmLevels[i];
            localStorage.setItem('lg_bgm_vol', bgmLevels[i].toString());
            audio.bgmMuted = (bgmLevels[i] === 0.0);
            if (audio.bgmMuted) audio.stopBGM(); else audio.startBGM();
            audio.click();
            this.vibrate(15);
            return;
          }
        }
      }

      // Section 3: Haptics
      if (y >= my + 212 && y <= my + 248) {
        if (x >= mx + 240 && x <= mx + 480) {
          this.settings.haptics = true;
          localStorage.setItem('lg_haptics', 'true');
          this.vibrate(35);
          audio.click();
          return;
        } else if (x >= mx + 500 && x <= mx + 740) {
          this.settings.haptics = false;
          localStorage.setItem('lg_haptics', 'false');
          audio.click();
          return;
        }
      }

      // Section 4: Screen Fit
      if (y >= my + 272 && y <= my + 308) {
        if (x >= mx + 240 && x <= mx + 480) {
          this.settings.screenFit = 'FIT';
          localStorage.setItem('lg_screen_fit', 'FIT');
          this.resizeCanvas();
          audio.click();
          this.vibrate(15);
          return;
        } else if (x >= mx + 500 && x <= mx + 740) {
          this.settings.screenFit = 'FILL';
          localStorage.setItem('lg_screen_fit', 'FILL');
          this.resizeCanvas();
          audio.click();
          this.vibrate(15);
          return;
        }
      }

      // Section 5: FPS Mode
      if (y >= my + 332 && y <= my + 368) {
        if (x >= mx + 240 && x <= mx + 480) {
          this.settings.fpsLimit = 60;
          localStorage.setItem('lg_fps_limit', '60');
          audio.click();
          this.vibrate(15);
          return;
        } else if (x >= mx + 500 && x <= mx + 740) {
          this.settings.fpsLimit = 30;
          localStorage.setItem('lg_fps_limit', '30');
          audio.click();
          this.vibrate(15);
          return;
        }
      }

      // Section 6: Language
      if (y >= my + 392 && y <= my + 428) {
        const langs = ['uz', 'en', 'ru'];
        for (let i = 0; i < 3; i++) {
          const bx = mx + 240 + i * 170;
          if (x >= bx && x <= bx + 160) {
            this.lang = langs[i];
            this.settings.lang = langs[i];
            localStorage.setItem('last_grid_lang', langs[i]);
            audio.click();
            this.vibrate(15);
            return;
          }
        }
      }

      // Section 7: CRT
      if (y >= my + 452 && y <= my + 488) {
        if (x >= mx + 240 && x <= mx + 480) {
          this.crtEnabled = true;
          localStorage.setItem('lg_crt', 'true');
          audio.click();
          this.vibrate(15);
          return;
        } else if (x >= mx + 500 && x <= mx + 740) {
          this.crtEnabled = false;
          localStorage.setItem('lg_crt', 'false');
          audio.click();
          this.vibrate(15);
          return;
        }
      }

      // Bottom Row: Close/Save
      if (y >= my + 540 && y <= my + 590) {
        if (x >= mx + 60 && x <= mx + 380) {
          this.showSettingsModal = false;
          audio.click();
          this.vibrate(20);
          return;
        } else if (x >= mx + 420 && x <= mx + 740) {
          this.showSettingsModal = false;
          this.state = 'MENU';
          this.selectedTower = null;
          audio.sell();
          this.vibrate(25);
          return;
        }
      }
    }

    resizeCanvas() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const screenFit = (this.settings && this.settings.screenFit) || localStorage.getItem('lg_screen_fit') || 'FIT';

      if (screenFit === 'FILL') {
        // True Edge-to-Edge full stretch for modern 19.5:9 & 20:9 Android screens
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
      } else {
        // Proportional 16:9 aspect preservation with centered cyber frame
        const aspect = 1280 / 720;
        let targetW = w;
        let targetH = w / aspect;
        if (targetH > h) {
          targetH = h;
          targetW = h * aspect;
        }
        this.canvas.style.width = `${Math.floor(targetW)}px`;
        this.canvas.style.height = `${Math.floor(targetH)}px`;
      }
      this.canvas.style.display = 'block';

      // HiDPI / Retina Crispness for Android AMOLED & High-Res displays
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetBufferW = Math.round(1280 * dpr);
      const targetBufferH = Math.round(720 * dpr);
      if (this.canvas.width !== targetBufferW || this.canvas.height !== targetBufferH) {
        this.canvas.width = targetBufferW;
        this.canvas.height = targetBufferH;
      }
      this.dpr = dpr;
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
        if (this.state === 'TPS_3D' && this.tps3D) {
          const t = this.tps3D;
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const rect = this.canvas.getBoundingClientRect();
            const tx = (touch.clientX - rect.left) * (1280 / rect.width);
            const ty = (touch.clientY - rect.top) * (720 / rect.height);

            if (tx < 160 && ty < 70) {
              this.state = 'MENU';
              audio.sell();
              return;
            }
            if (Math.hypot(tx - 1200, ty - 620) <= 52) {
              if (t.isBuilding) this.place3DTower(); else this.shoot3DTPS();
              this.vibrate(22);
              return;
            }
            if (Math.hypot(tx - 1080, ty - 640) <= 40) {
              t.player.isAiming = !t.player.isAiming;
              return;
            }
            if (Math.hypot(tx - 1200, ty - 500) <= 40) {
              t.isBuilding = !t.isBuilding;
              audio.upgrade();
              return;
            }
            if (Math.hypot(tx - 1080, ty - 540) <= 35) {
              this.reload3DTPS();
              return;
            }

            if (tx < 500 && t.touch.moveId === null) {
              t.touch.moveId = touch.identifier;
              t.touch.moveStart = { x: tx, y: ty };
              t.touch.moveVec = { x: 0, y: 0 };
            } else if (tx >= 500 && t.touch.lookId === null) {
              t.touch.lookId = touch.identifier;
              t.touch.lookLast = { x: tx, y: ty };
            }
          }
          return;
        }
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

        if (this.state === 'TPS_3D' && this.tps3D) {
          e.preventDefault();
          const t = this.tps3D;
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const rect = this.canvas.getBoundingClientRect();
            const tx = (touch.clientX - rect.left) * (1280 / rect.width);
            const ty = (touch.clientY - rect.top) * (720 / rect.height);

            if (touch.identifier === t.touch.moveId) {
              const dx = tx - t.touch.moveStart.x;
              const dy = ty - t.touch.moveStart.y;
              const dist = Math.hypot(dx, dy);
              const maxR = 60;
              t.touch.moveVec = {
                x: (dist > 0 ? (dx / dist) * Math.min(1.0, dist / maxR) : 0),
                y: (dist > 0 ? (dy / dist) * Math.min(1.0, dist / maxR) : 0)
              };
            } else if (touch.identifier === t.touch.lookId) {
              const dx = tx - t.touch.lookLast.x;
              const dy = ty - t.touch.lookLast.y;
              t.player.yaw -= dx * 0.005;
              t.player.pitch = Math.max(-0.4, Math.min(0.5, t.player.pitch + dy * 0.004));
              t.touch.lookLast = { x: tx, y: ty };
            }
          }
          return;
        }

        if (this.touchState.dragging) {
          e.preventDefault();
          this.touchState.dragCurrent = pos;
        }
      }, { passive: false });

      this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault(); // PREVENTS SYNTHETIC DUPLICATE CLICK!
        this.lastTouchActionTime = Date.now();
        const pos = this.getCanvasPos(e);

        if (this.state === 'TPS_3D' && this.tps3D) {
          const t = this.tps3D;
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === t.touch.moveId) {
              t.touch.moveId = null;
              t.touch.moveVec = { x: 0, y: 0 };
            } else if (touch.identifier === t.touch.lookId) {
              t.touch.lookId = null;
            }
          }
          return;
        }

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

      window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (this.state === 'TPS_3D' && this.tps3D) {
          if (k === 'w') this.tps3D.keys.w = false;
          if (k === 's') this.tps3D.keys.s = false;
          if (k === 'a') this.tps3D.keys.a = false;
          if (k === 'd') this.tps3D.keys.d = false;
          if (k === 'shift') this.tps3D.keys.shift = false;
        }
      });

      window.addEventListener('keydown', (e) => {
        audio.init();
        const k = e.key.toLowerCase();
        if (this.state === 'TPS_3D' && this.tps3D) {
          if (k === 'w') { this.tps3D.keys.w = true; return; }
          if (k === 's') { this.tps3D.keys.s = true; return; }
          if (k === 'a') { this.tps3D.keys.a = true; return; }
          if (k === 'd') { this.tps3D.keys.d = true; return; }
          if (k === 'shift') { this.tps3D.keys.shift = true; return; }
          if (k === 'r') { this.reload3DTPS(); return; }
          if (k === 'b') { this.tps3D.isBuilding = !this.tps3D.isBuilding; audio.upgrade(); return; }
          if (e.code === 'Space') { e.preventDefault(); this.shoot3DTPS(); return; }
          if (e.key === 'Escape') { this.state = 'MENU'; return; }
        }
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
      this.casings = [];
      this.scorchMarks = [];
      this.muzzleFlashes = [];
      this.footprints = [];
      this.spawnQueue = [];

      this.selectedBuildType = null;
      this.selectedTower = null;
      this.aimingSkill = null;
      this.state = 'PLAYING';
      this.bakeMapLanes(map);
      this.addFloatingText(`${map.name.toUpperCase()}`, 640, 200, "#00e5ff", 22);

      // Initialize Battlefield Dynamics (Barricades, Airdrops, Red Zones, Radio Comms)
      const baseBars = (mode === 'CUSTOM') ? [] : (MAP_BARRICADES[mapIdx] || []);
      this.barricades = baseBars.map(b => ({
        id: this.nextUid++,
        x: b.x, y: b.y,
        hp: b.hp, maxHp: b.maxHp,
        type: b.type,
        broken: false
      }));
      this.airdrops = [];
      this.redZones = [];
      this.airdropCooldown = 20.0;
      this.redZoneCooldown = 35.0;
      const briefingList = RADIO_BRIEFINGS[this.lang] || RADIO_BRIEFINGS.uz;
      this.triggerRadioComm("HQ COMMANDER", briefingList[mapIdx] || briefingList[0], 5.5);
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
      if (this.state !== 'TPS_3D') {
        audio.click();
        this.vibrate(10);
      }
      // If Settings Modal is open -> handle settings interactions
      if (this.showSettingsModal) {
        this.handleSettingsClick(x, y);
        return;
      }
      if (this.state === 'TPS_3D') {
        if (x >= 20 && x <= 160 && y >= 15 && y <= 65) {
          this.state = 'MENU';
          audio.sell();
          return;
        }
        if (Math.hypot(x - 1200, y - 620) <= 52) {
          if (this.tps3D.isBuilding) this.place3DTower();
          else this.shoot3DTPS();
          this.vibrate(22);
          return;
        }
        if (Math.hypot(x - 1080, y - 640) <= 40) {
          this.tps3D.player.isAiming = !this.tps3D.player.isAiming;
          return;
        }
        if (Math.hypot(x - 1200, y - 500) <= 40) {
          this.tps3D.isBuilding = !this.tps3D.isBuilding;
          audio.upgrade();
          return;
        }
        if (Math.hypot(x - 1080, y - 540) <= 35) {
          this.reload3DTPS();
          return;
        }
        if (x > 350) {
          if (this.tps3D.isBuilding) this.place3DTower();
          else this.shoot3DTPS();
          return;
        }
        return;
      }
      if (this.state === 'MENU') {
        // Generous touch hitboxes for mobile screens
        if (y >= 255 && y <= 308 && x >= 380 && x <= 900) { this.start3DTPSMode(); return; }
        else if (y >= 309 && y <= 362 && x >= 380 && x <= 900) { this.startMission(0, 'CAMPAIGN'); return; }
        else if (y >= 363 && y <= 415 && x >= 380 && x <= 900) { this.state = 'MAP_SELECT'; return; }
        else if (y >= 416 && y <= 468 && x >= 380 && x <= 900) { this.startMission(9, 'ENDLESS'); return; }
        else if (y >= 469 && y <= 518 && x >= 380 && x <= 635) { this.startMission(0, 'BOSS_RUSH'); return; }
        else if (y >= 469 && y <= 518 && x >= 645 && x <= 900) { this.state = 'EDITOR'; return; }
        else if (y >= 519 && y <= 568 && x >= 380 && x <= 635) { this.state = 'LEADERBOARD'; return; }
        else if (y >= 519 && y <= 568 && x >= 645 && x <= 900) { this.state = 'MANUAL'; return; }
        else if (y >= 569 && y <= 618 && x >= 380 && x <= 635) { this.showSettingsModal = true; this.settingsReturnState = 'MENU'; return; }
        else if (y >= 569 && y <= 618 && x >= 645 && x <= 900) { this.downloadApk(); return; }
        else if (y >= 619 && y <= 675 && x >= 380 && x <= 900) { this.downloadOfflineZip(); return; }
        if (x > 1080 && x < 1260 && y > 10 && y < 65) { this.showSettingsModal = true; this.settingsReturnState = 'MENU'; }
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
        if (x >= 450 && x <= 830 && y >= 615 && y <= 695) this.state = 'MENU';
        return;
      }

      if (this.state === 'MANUAL') {
        if (x >= 20 && x <= 180 && y >= 10 && y <= 65) this.state = 'MENU';
        return;
      }

      if (this.state === 'MAP_SELECT') {
        if (y >= 10 && y <= 65 && x >= 20 && x <= 180) { this.state = 'MENU'; return; }
        for (let i = 0; i < 10; i++) {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const mx = 40 + col * 242;
          const my = 75 + row * 245;
          if (x >= mx && x <= mx + 230 && y >= my && y <= my + 230) {
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
        if (this.state === 'VICTORY' && x >= 340 && x <= 940 && y >= 475 && y <= 540) {
          // Continue Endless Survival Mode!
          this.gameMode = 'ENDLESS';
          this.maxWaves = 999;
          this.wave = 31;
          this.waveActive = false;
          this.waveCountdown = 8;
          this.state = 'PLAYING';
          audio.upgrade();
          this.vibrate([30, 40, 60]);
          this.triggerRadioComm("HQ OVERWATCH", "⚠️ CHEKSIZ REJIM FAOL! Barcha mudofaa minoralari saqlandi. Omon qoling, Komandir!", 5.0);
          return;
        }
        if (x >= 330 && x <= 530 && y >= 405 && y <= 470) this.startMission(this.currentMapIndex, this.gameMode);
        else if (x >= 540 && x <= 740 && y >= 405 && y <= 470) this.state = 'ANALYTICS';
        else if (x >= 750 && x <= 950 && y >= 405 && y <= 470) this.state = 'MENU';
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

      // 3. Hero Click or Move with Kinetic Booster Dash
      if (this.hero.selected) {
        if (y >= 60 && y <= 620) {
          this.hero.targetX = x;
          this.hero.targetY = y;
          this.hero.selected = false;
          // Trigger Kinetic Booster Rocket Dash
          this.hero.dashSpeedBoost = 2.4;
          this.hero.dashTimer = 0.45;
          this.spawnShockwave(this.hero.x, this.hero.y, 45, "#00e5ff");
          this.spawnShockwave(x, y, 35, "#ffd600");
          this.addFloatingText("⚡ KINETIC DASH!", this.hero.x, this.hero.y - 25, "#00e5ff", 16);
          if (audio) audio.shootPulse();
          this.vibrate([20, 20, 35]);
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
        if (x >= 440 && x <= 618) this.callNextWave();
        else if (x >= 620 && x <= 718) this.cycleSpeed();
        else if (x >= 720 && x <= 852) { this.showSettingsModal = true; this.settingsReturnState = 'PLAYING'; }
        else if (x >= 855 && x <= 968) this.togglePause();
        else if (x >= 970 && x <= 1090) { this.togglePause(); } // opens pause dialog safely
        return;
      }

      if (this.aimingSkill) {
        this.executeSkill(this.aimingSkill, x, y);
        this.aimingSkill = null;
        return;
      }

      // Airdrop Crate Tap / Click Looting
      if (this.airdrops && this.airdrops.length > 0) {
        for (const ad of this.airdrops) {
          if (ad.landed && !ad.looted && Math.hypot(x - ad.crateX, y - ad.crateY) <= 45) {
            this.lootAirdrop(ad);
            return;
          }
        }
      }

      // Barricade Tap: Repair or Rebuild
      if (this.barricades && this.barricades.length > 0) {
        for (const b of this.barricades) {
          if (Math.hypot(x - b.x, y - b.y) <= 35) {
            if (b.broken) {
              if (this.gold >= 45) {
                this.gold -= 45;
                b.broken = false;
                b.hp = b.maxHp;
                audio.upgrade();
                this.spawnShockwave(b.x, b.y, 60, "#00e676");
                this.addFloatingText("🏗️ QAYTA QURILDI (-45g)", b.x, b.y - 20, "#00e676", 16);
                this.triggerRadioComm("HQ OVERWATCH", "HQ: Himoya to'sig'i qayta tiklandi!", 3.5);
                this.vibrate([30, 40, 50]);
              } else {
                this.addFloatingText(this.t("notEnoughGold") + " (45g)", b.x, b.y - 20, "#ff1744", 15);
              }
              return;
            } else if (b.hp < b.maxHp) {
              if (this.gold >= 20) {
                this.gold -= 20;
                b.hp = Math.min(b.maxHp, b.hp + 120);
                audio.upgrade();
                this.addFloatingText("🔧 +120 HP (-20g)", b.x, b.y - 20, "#00e5ff", 16);
                this.vibrate(20);
              } else {
                this.addFloatingText(this.t("notEnoughGold") + " (20g)", b.x, b.y - 20, "#ff1744", 15);
              }
              return;
            }
          }
        }
      }

      // 5. Bottom Bar actions
      if (y >= 620) {
        // [6] Barricade Hotbar selection
        if (!this.selectedTower && x >= 1100 && x <= 1275 && y >= 625 && y <= 715) {
          this.selectedBuildType = (this.selectedBuildType === 'barricade') ? null : 'barricade';
          this.vibrate(15);
          return;
        }
        this.radialBuildCell = null;

        // Hero Mech Ult button at x: 5 to 53
        if (x >= 5 && x <= 53) { this.triggerHeroUlt(); this.vibrate([40, 25, 70]); return; }

        // Commander Super Skills Mobile Buttons (x: 56, 100, 144, 188; each w: 42)
        if (x >= 54 && x <= 97) { this.triggerSkill('emp'); this.vibrate(20); return; }
        else if (x >= 98 && x <= 141) { this.triggerSkill('orbital'); this.vibrate(20); return; }
        else if (x >= 142 && x <= 185) { this.triggerSkill('overclock'); this.vibrate(20); return; }
        else if (x >= 186 && x <= 234) { this.triggerSkill('drone'); this.vibrate(20); return; }

        if (this.selectedTower) {
          const t = this.selectedTower;
          const def = TOWER_DEFS[t.type];

          // Tier 3 Branch A and Branch B buttons
          if (t.tier === 2) {
            if (x >= 445 && x <= 595 && y >= 630 && y <= 705) { this.upgradeBranch('A'); this.vibrate([25, 30, 25]); return; }
            if (x >= 600 && x <= 750 && y >= 630 && y <= 705) { this.upgradeBranch('B'); this.vibrate([25, 30, 25]); return; }
          } else {
            // Normal Upgrade (Tier 1 -> Tier 2)
            if (x >= 475 && x <= 625 && y >= 630 && y <= 705) { this.upgradeSelectedTower(); this.vibrate([25, 30, 25]); return; }
          }

          // Sell button
          if (x >= 755 && x <= 875 && y >= 630 && y <= 705) { this.sellSelectedTower(); this.vibrate(20); return; }
          // Priority button
          if (x >= 880 && x <= 1005 && y >= 630 && y <= 705) { this.cycleTargetPriority(); this.vibrate(15); return; }
          // Close button
          if (x >= 1010 && x <= 1070 && y >= 630 && y <= 705) { this.selectedTower = null; return; }
        } else {
          // 5 Tower Hotbar
          const towerKeys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
          for (let i = 0; i < 5; i++) {
            const bx = 236 + i * 175;
            if (x >= bx && x <= bx + 168 && y >= 625 && y <= 715) {
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

    // --- BATTLEFIELD DYNAMICS METHODS (v3.8.0) ---
    triggerRadioComm(speaker, text, duration = 4.5) {
      this.radioComm = {
        speaker: speaker || "HQ COMMANDER",
        text: text || "",
        maxTimer: duration,
        timer: duration,
        anim: 0
      };
      audio.radioBeep();
    }

    updateRadioComms(dt) {
      if (this.radioComm) {
        this.radioComm.timer -= dt;
        this.radioComm.anim += dt * 32;
        if (this.radioComm.timer <= 0) this.radioComm = null;
      }
    }

    updateBiomeParticles(dt) {
      if (!this.biomeParticles) this.biomeParticles = [];
      const map = (this.gameMode === 'CUSTOM') ? { biome: "cyber" } : MAPS[this.currentMapIndex];
      const biome = (map && map.biome) ? map.biome : "cyber";

      if (this.biomeParticles.length < 28) {
        if (biome === 'lava') {
          this.biomeParticles.push({
            x: Math.random() * this.width,
            y: 620 + Math.random() * 20,
            vx: (Math.random() - 0.5) * 20,
            vy: -30 - Math.random() * 40,
            size: 1.5 + Math.random() * 2.5,
            life: 2.0 + Math.random() * 2.0,
            maxLife: 4.0,
            color: Math.random() > 0.4 ? "#ff3d00" : "#ff9100"
          });
        } else if (biome === 'cryo') {
          this.biomeParticles.push({
            x: Math.random() * this.width,
            y: 50 + Math.random() * 30,
            vx: 15 + Math.random() * 25,
            vy: 20 + Math.random() * 30,
            size: 1.2 + Math.random() * 2.2,
            life: 3.0 + Math.random() * 3.0,
            maxLife: 6.0,
            color: Math.random() > 0.3 ? "#80deea" : "#ffffff"
          });
        }
      }

      for (let i = this.biomeParticles.length - 1; i >= 0; i--) {
        const p = this.biomeParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0 || p.x < 0 || p.x > this.width || p.y < 55 || p.y > 625) {
          this.biomeParticles.splice(i, 1);
        }
      }
    }

    renderBiomeParticles(ctx, biome) {
      if (!this.biomeParticles || biome === 'cyber') return;
      ctx.save();
      for (const p of this.biomeParticles) {
        const alpha = Math.max(0, p.life / p.maxLife) * 0.7;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    renderBossAlert() {
      if (!this.bossAlert || this.bossAlert.timer <= 0) return;
      const ctx = this.ctx;
      const b = this.bossAlert;
      const alpha = Math.min(1.0, b.timer, (b.maxTimer - b.timer) * 2.5);
      const pulse = (Math.sin(performance.now() * 0.012) + 1) * 0.5;

      ctx.save();
      // 1. Screen Edge Threat Pulsing
      ctx.strokeStyle = `rgba(255, 23, 68, ${0.25 + pulse * 0.45 * alpha})`;
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 63, this.width - 6, 554);

      // 2. Center Cinematic Holographic Banner
      const bw = 680;
      const bh = 95;
      const bx = (this.width - bw) / 2;
      const by = 85;

      ctx.fillStyle = `rgba(10, 2, 6, ${0.90 * alpha})`;
      ctx.fillRect(bx, by, bw, bh);

      ctx.strokeStyle = `rgba(255, 23, 68, ${0.9 * alpha})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      ctx.fillStyle = `rgba(255, 23, 68, ${alpha})`;
      ctx.font = "bold 13px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚠️ TIKLANISH REJIMI: RED ALERT • TITAN BOSS ANIQLANDI ⚠️", 640, by + 22);

      ctx.font = "900 24px 'Segoe UI', monospace";
      ctx.fillStyle = b.color || "#ff1744";
      ctx.fillText(`${b.marker} ${b.name}`, 640, by + 52);

      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#cfd8dc";
      ctx.fillText(`HP: ${b.hp}  |  ARMOR: ${b.armor}  |  ${b.desc || "CRITICAL SECTOR THREAT"}`, 640, by + 76);

      ctx.restore();
    }

    renderRadioComms() {
      if (!this.radioComm) return;
      const ctx = this.ctx;
      const rc = this.radioComm;
      const bx = 16, by = 68, bw = 460, bh = 70;

      ctx.save();
      // Cyber Glassmorphism Box
      ctx.fillStyle = "rgba(7, 12, 24, 0.92)";
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, bh);

      // Top Header
      ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
      ctx.fillRect(bx, by, bw, 20);
      ctx.fillStyle = "#ff1744";
      ctx.beginPath();
      ctx.arc(bx + 12, by + 10, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "left";
      ctx.fillText("LIVE COMMS // CH-01 SEC-NET", bx + 22, by + 14);

      // Audio waveform animation
      const now = performance.now() * 0.01;
      for (let i = 0; i < 6; i++) {
        const barH = 3 + Math.abs(Math.sin(now + i * 0.8)) * 10;
        ctx.fillStyle = "#ffd600";
        ctx.fillRect(bx + bw - 60 + i * 8, by + 16 - barH, 4, barH);
      }

      // Speaker & Message
      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 11px monospace";
      ctx.fillText(rc.speaker, bx + 12, by + 36);

      ctx.fillStyle = "#ffffff";
      ctx.font = "11px monospace";
      const charCount = Math.floor(rc.anim);
      const visibleText = rc.text.substring(0, charCount);
      ctx.fillText(visibleText, bx + 12, by + 54);

      ctx.restore();
    }

    spawnAirdrop() {
      const tx = 260 + Math.random() * 740;
      const ty = 140 + Math.random() * 420;
      this.airdrops.push({
        id: this.nextUid++,
        planeX: -120,
        planeY: 52,
        planeSpeed: 380,
        targetX: tx,
        targetY: ty,
        cargoDropped: false,
        crateX: tx,
        crateY: 52,
        crateVy: 65,
        landed: false,
        looted: false,
        smokeFlareTimer: 25.0,
        swingAnim: 0
      });
      audio.airdropFlyby();
      this.triggerRadioComm("HQ OVERWATCH", "📦 Taktik Kiber-Airdrop havoda! Koordinataga yuk tashlanmoqda!", 4.0);
    }

    updateAirdrops(dt) {
      for (let i = this.airdrops.length - 1; i >= 0; i--) {
        const ad = this.airdrops[i];
        if (!ad.cargoDropped) {
          ad.planeX += ad.planeSpeed * dt;
          if (Math.random() < 0.45) {
            this.particles.push({
              x: ad.planeX - 35, y: ad.planeY,
              vx: -40, vy: (Math.random() * 6 - 3),
              color: "rgba(200, 230, 255, 0.4)", size: 3, growth: 8, life: 0.4, maxLife: 0.4
            });
          }
          if (ad.planeX >= ad.targetX) {
            ad.cargoDropped = true;
            ad.crateX = ad.targetX;
            ad.crateY = ad.planeY;
          }
        }
        if (ad.cargoDropped && !ad.landed) {
          ad.crateY += ad.crateVy * dt;
          ad.swingAnim += dt * 4.0;
          if (ad.crateY >= ad.targetY) {
            ad.crateY = ad.targetY;
            ad.landed = true;
            this.screenShake = 5;
            audio.hit();
            for (let k = 0; k < 10; k++) {
              this.particles.push({
                x: ad.crateX, y: ad.crateY,
                vx: (Math.random() * 80 - 40),
                vy: (Math.random() * 40 - 20),
                color: "#e2e8f0", size: 3, life: 0.4, maxLife: 0.4
              });
            }
            this.addFloatingText("📦 AIRDROP YERGA TUSHDI!", ad.crateX, ad.crateY - 20, "#ffd600", 15);
          }
        }
        if (ad.landed && !ad.looted) {
          ad.smokeFlareTimer -= dt;
          if (Math.random() < 0.5) {
            this.particles.push({
              x: ad.crateX + (Math.random() * 8 - 4),
              y: ad.crateY - 14,
              vx: (Math.random() * 14 - 7),
              vy: -55 - Math.random() * 30,
              color: "rgba(255, 23, 68, 0.75)", size: 4, growth: 14, life: 0.8, maxLife: 0.8
            });
          }
          // Auto-pickup by Hero Mech
          if (Math.hypot(this.hero.x - ad.crateX, this.hero.y - ad.crateY) <= 46) {
            this.lootAirdrop(ad);
          }
        }
        if (ad.looted && ad.smokeFlareTimer <= 0) {
          this.airdrops.splice(i, 1);
        }
      }
    }

    lootAirdrop(ad) {
      if (ad.looted) return;
      ad.looted = true;
      ad.smokeFlareTimer = 2.0;
      const rewardGold = 250;
      this.gold += rewardGold;
      this.score += 500;
      this.skills.overclock.activeTime = 12.0; // 12s Double Fire Rate Overclock Matrix!
      audio.airdropLoot();
      this.vibrate([50, 40, 100, 50, 150]);
      this.spawnShockwave(ad.crateX, ad.crateY, 140, "#ffd600");
      this.addFloatingText(`+${rewardGold} OLTIN! OVERCLOCK MATRIX FAOL!`, ad.crateX, ad.crateY - 25, "#ffd600", 20);
      this.triggerRadioComm("HQ COMMANDER", "📦 Airdrop ochildi! +250 Oltin olindi va barcha minoralarga Overclock kuchaytirish berildi!", 4.5);
    }

    renderAirdrops() {
      const ctx = this.ctx;
      for (const ad of this.airdrops) {
        // 1. Cargo Transport Aircraft
        if (ad.planeX < this.width + 120) {
          ctx.save();
          ctx.translate(ad.planeX, ad.planeY);
          ctx.fillStyle = "#1e293b";
          ctx.beginPath();
          ctx.moveTo(35, 0);
          ctx.lineTo(-30, -18);
          ctx.lineTo(-20, 0);
          ctx.lineTo(-30, 18);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Navigation lights
          ctx.fillStyle = "#00e676";
          ctx.beginPath(); ctx.arc(-25, -16, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ff1744";
          ctx.beginPath(); ctx.arc(-25, 16, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }

        // 2. Parachute & Crate descending
        if (ad.cargoDropped && !ad.landed) {
          ctx.save();
          ctx.translate(ad.crateX, ad.crateY);
          const sway = Math.sin(ad.swingAnim) * 0.15;
          ctx.rotate(sway);

          // Parachute Canopy
          ctx.beginPath();
          ctx.arc(0, -32, 28, Math.PI, 0, false);
          ctx.closePath();
          ctx.fillStyle = "#ff1744";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          // White center gore
          ctx.beginPath();
          ctx.arc(0, -32, 14, Math.PI, 0, false);
          ctx.closePath();
          ctx.fillStyle = "#ffffff";
          ctx.fill();

          // Suspension cords
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-26, -32); ctx.lineTo(-8, -6);
          ctx.moveTo(26, -32); ctx.lineTo(8, -6);
          ctx.moveTo(0, -32); ctx.lineTo(0, -6);
          ctx.stroke();

          // Supply Crate
          ctx.fillStyle = "#d32f2f";
          ctx.fillRect(-12, -8, 24, 20);
          ctx.strokeStyle = "#ffd600";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-12, -8, 24, 20);
          ctx.restore();
        }

        // 3. Landed Crate with Red Smoke Signal Flare
        if (ad.landed && !ad.looted) {
          ctx.save();
          ctx.translate(ad.crateX, ad.crateY);

          // Pulsing Beacon Ring
          const pulse = (Math.sin(performance.now() * 0.006) + 1) * 0.5;
          ctx.strokeStyle = `rgba(255, 23, 68, ${0.4 + pulse * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 26 + pulse * 10, 0, Math.PI * 2);
          ctx.stroke();

          // Dropped parachute fabric on ground
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.beginPath();
          ctx.ellipse(-16, 6, 12, 6, -0.2, 0, Math.PI * 2);
          ctx.fill();

          // Crate body
          ctx.fillStyle = "#b71c1c";
          ctx.fillRect(-14, -14, 28, 24);
          ctx.strokeStyle = "#ffd600";
          ctx.lineWidth = 2;
          ctx.strokeRect(-14, -14, 28, 24);

          // Stencil mark
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.fillText("AIRDROP", 0, 1);

          // Beacon Strobe
          ctx.fillStyle = pulse > 0.5 ? "#ffd600" : "#ff1744";
          ctx.beginPath();
          ctx.arc(0, -15, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffd600";
          ctx.font = "bold 10px monospace";
          ctx.fillText("📦 TEGING!", 0, -26);
          ctx.restore();
        }
      }
    }

    triggerRedZone() {
      let rx = 640, ry = 360;
      if (this.enemies.length > 0) {
        const e = this.enemies[Math.floor(Math.random() * this.enemies.length)];
        rx = e.x; ry = e.y;
      } else {
        rx = 320 + Math.random() * 640;
        ry = 180 + Math.random() * 320;
      }
      audio.redZoneSiren();
      this.triggerRadioComm("HQ OVERWATCH", "🚨 XAVF: Red Zone artilleriya zarbasi! 4 soniyada zonani tark eting!", 4.5);
      this.redZones.push({
        id: this.nextUid++,
        x: rx, y: ry,
        radius: 135,
        warningTimer: 4.5,
        activeTimer: 5.0,
        shellsToFire: 9,
        shellInterval: 0.45,
        shellCooldown: 0,
        shells: []
      });
    }

    updateRedZones(dt) {
      for (let i = this.redZones.length - 1; i >= 0; i--) {
        const rz = this.redZones[i];
        if (rz.warningTimer > 0) {
          rz.warningTimer -= dt;
        } else if (rz.activeTimer > 0) {
          rz.activeTimer -= dt;
          rz.shellCooldown -= dt;
          if (rz.shellsToFire > 0 && rz.shellCooldown <= 0) {
            rz.shellCooldown = rz.shellInterval;
            rz.shellsToFire--;
            const targetX = rz.x + (Math.random() * (rz.radius * 1.5) - rz.radius * 0.75);
            const targetY = rz.y + (Math.random() * (rz.radius * 1.5) - rz.radius * 0.75);
            const startX = targetX - 160;
            const startY = -40;
            rz.shells.push({
              startX, startY, targetX, targetY,
              x: startX, y: startY,
              flightTime: 0.32, t: 0
            });
          }
        }
        // Update shells
        for (let j = rz.shells.length - 1; j >= 0; j--) {
          const sh = rz.shells[j];
          sh.t += dt / sh.flightTime;
          sh.x = sh.startX + (sh.targetX - sh.startX) * sh.t;
          sh.y = sh.startY + (sh.targetY - sh.startY) * sh.t;
          if (Math.random() < 0.6) {
            this.particles.push({
              x: sh.x, y: sh.y,
              vx: (Math.random() * 20 - 10), vy: (Math.random() * 20 - 10),
              color: "#ff9100", size: 2.5, life: 0.2, maxLife: 0.2
            });
          }
          if (sh.t >= 1.0) {
            // Detonation!
            audio.artilleryBlast();
            this.screenShake = 14;
            this.spawnShockwave(sh.targetX, sh.targetY, 95, "#ff1744");
            this.scorchMarks.push({ x: sh.targetX, y: sh.targetY, radius: 24, life: 12.0, maxLife: 12.0 });
            for (let k = 0; k < 16; k++) {
              this.particles.push({
                x: sh.targetX, y: sh.targetY,
                vx: (Math.random() * 180 - 90),
                vy: (Math.random() * 180 - 90),
                color: Math.random() < 0.5 ? "#ff3d00" : "#ff9100",
                size: 3 + Math.random() * 4, growth: 8, life: 0.5, maxLife: 0.5
              });
            }
            // Damage enemies in 85px radius
            for (const e of this.enemies) {
              if (Math.hypot(e.x - sh.targetX, e.y - sh.targetY) <= 85) {
                this.applyDamage(e, 420, 'EXPLOSIVE', null, 'mortar');
              }
            }
            // Damage Hero Mech if inside
            if (Math.hypot(this.hero.x - sh.targetX, this.hero.y - sh.targetY) <= 85) {
              this.hero.hp = Math.max(0, this.hero.hp - 35);
              this.addFloatingText("⚠️ MECH -35 HP!", this.hero.x, this.hero.y - 20, "#ff1744", 16);
              this.vibrate([60, 40, 60]);
            }
            rz.shells.splice(j, 1);
          }
        }
        if (rz.warningTimer <= 0 && rz.activeTimer <= 0 && rz.shells.length === 0 && rz.shellsToFire === 0) {
          this.redZones.splice(i, 1);
          this.triggerRadioComm("HQ OVERWATCH", "💥 Red Zone zarbasi tugadi. Sektor xavfsiz!", 3.5);
        }
      }
    }

    renderRedZones() {
      const ctx = this.ctx;
      for (const rz of this.redZones) {
        ctx.save();
        const pulse = (Math.sin(performance.now() * 0.008) + 1) * 0.5;

        // Danger Circle
        ctx.fillStyle = `rgba(255, 23, 68, ${0.12 + pulse * 0.1})`;
        ctx.beginPath();
        ctx.arc(rz.x, rz.y, rz.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff1744";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Crosshairs
        ctx.strokeStyle = "rgba(255, 23, 68, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rz.x - rz.radius, rz.y); ctx.lineTo(rz.x + rz.radius, rz.y);
        ctx.moveTo(rz.x, rz.y - rz.radius); ctx.lineTo(rz.x, rz.y + rz.radius);
        ctx.stroke();

        // Warning Label
        ctx.fillStyle = "#ff1744";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        if (rz.warningTimer > 0) {
          ctx.fillText(`⚠️ RED ZONE: ${rz.warningTimer.toFixed(1)}s`, rz.x, rz.y - rz.radius - 8);
        } else {
          ctx.fillText("💥 ARTILLERIYA ZARBASI! 💥", rz.x, rz.y - rz.radius - 8);
        }

        // Falling artillery shells
        for (const sh of rz.shells) {
          ctx.fillStyle = "#ffd600";
          ctx.beginPath();
          ctx.arc(sh.x, sh.y, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#ff3d00";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sh.x - 18, sh.y - 18);
          ctx.lineTo(sh.x, sh.y);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    renderBarricades() {
      const ctx = this.ctx;
      for (const b of this.barricades) {
        ctx.save();
        ctx.translate(b.x, b.y);

        if (b.broken) {
          // Shattered Debris Rubble
          ctx.fillStyle = "#334155";
          ctx.fillRect(-18, -10, 36, 20);
          ctx.fillStyle = "#1e293b";
          ctx.beginPath();
          ctx.moveTo(-18, -10); ctx.lineTo(-6, -18); ctx.lineTo(8, -8); ctx.lineTo(18, -10);
          ctx.fill();

          ctx.strokeStyle = "#ff1744";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-18, -10, 36, 20);

          ctx.fillStyle = "#ff1744";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.fillText("BUZILGAN", 0, -2);
          ctx.fillStyle = "#ffd600";
          ctx.font = "bold 8px monospace";
          ctx.fillText("[QURISH 45g]", 0, 7);
        } else {
          // Reinforced Concrete Bunker Barricade
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-20, -14, 40, 28);

          // Yellow/Black Hazard Stripes
          ctx.fillStyle = "#eab308";
          ctx.fillRect(-18, -12, 36, 6);
          ctx.fillStyle = "#0f172a";
          for (let s = -18; s < 18; s += 8) {
            ctx.beginPath();
            ctx.moveTo(s, -12); ctx.lineTo(s + 4, -12); ctx.lineTo(s + 2, -6); ctx.lineTo(s - 2, -6);
            ctx.fill();
          }

          // Concrete Face
          ctx.fillStyle = "#475569";
          ctx.fillRect(-18, -5, 36, 17);

          // Structural Border
          ctx.strokeStyle = b.type === 'fortified' ? "#00e5ff" : "#94a3b8";
          ctx.lineWidth = 2;
          ctx.strokeRect(-20, -14, 40, 28);

          // Cracks when damaged
          const hpPct = b.hp / b.maxHp;
          if (hpPct < 0.75) {
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-10, 4); ctx.lineTo(-2, -2); ctx.lineTo(4, 3);
            ctx.stroke();
          }
          if (hpPct < 0.40) {
            ctx.strokeStyle = "#ff1744";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(6, -4); ctx.lineTo(12, 6);
            ctx.moveTo(-14, -2); ctx.lineTo(-8, 8);
            ctx.stroke();
          }

          // HP Bar
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(-18, -22, 36, 5);
          ctx.fillStyle = hpPct > 0.5 ? "#00e676" : (hpPct > 0.25 ? "#ffd600" : "#ff1744");
          ctx.fillRect(-18, -22, 36 * hpPct, 5);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(-18, -22, 36, 5);

          // Label
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`${Math.ceil(b.hp)}HP`, 0, 7);
        }
        ctx.restore();
      }
    }

    downloadApk() {
      if (typeof window !== 'undefined' && window.AndroidBridge) {
        if (this.addFloatingText) this.addFloatingText(640, 360, "Siz Android APK dasiz (v3.8.0)!", "#00e676");
        return;
      }
      const a = document.createElement('a');
      a.href = 'TowerDefense_LastGrid_v3.8.0.apk';
      a.download = 'TowerDefense_LastGrid_v3.8.0.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
        targetPoint: null,
        recoil: 0,
        barrelSpin: 0,
        heat: 0
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

      if (def.isBoss) {
        this.triggerRadioComm("HQ OVERWATCH", `☠️ DIQQAT: ${def.name.toUpperCase()} JANG MAYDONIGA KIRDI! Barcha olovni jamlang!`, 5.0);
        this.screenShake = 20;
        audio.bossSiren();
        this.vibrate([150, 80, 150, 80, 350]);
        this.bossAlert = {
          name: def.name.toUpperCase(),
          hp: Math.round(def.hp * hpMult),
          armor: Math.round(def.armor * armorMult),
          marker: def.marker || "☠",
          color: def.color || "#ff1744",
          timer: 4.8,
          maxTimer: 4.8,
          desc: (type === 'juggernaut') ? "OG'IR ZIRHLI TANK • 50% HP ENRAGE REJIMI" :
                (type === 'overseer') ? "ENERGIYA QALQONI GENERATORI • DRON SUMMONER" :
                "BIO-MEXANIK TITAN • 3 FAZALI APOLISIS GIGANTI"
        };
      }

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
        } else if (this.state === 'TPS_3D') {
          this.update3DTPS(dt);
        }
        this.render();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    update(dt) {
      if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - 20 * dt);

      if (this.bossAlert && this.bossAlert.timer > 0) {
        this.bossAlert.timer = Math.max(0, this.bossAlert.timer - dt);
      }
      this.updateBiomeParticles(dt);

      // Radio Comms & Battlefield Events
      this.updateRadioComms(dt);
      this.updateAirdrops(dt);
      this.updateRedZones(dt);

      if (this.waveActive) {
        this.airdropCooldown -= dt;
        if (this.airdropCooldown <= 0) {
          this.airdropCooldown = 45.0 + Math.random() * 25.0;
          this.spawnAirdrop();
        }

        if (this.wave >= 2) {
          this.redZoneCooldown -= dt;
          if (this.redZoneCooldown <= 0) {
            this.redZoneCooldown = 50.0 + Math.random() * 25.0;
            this.triggerRedZone();
          }
        }
      }

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

        // Advanced Boss AI Behavior Modeling
        if (e.isBoss) {
          e.abilityTimer = (e.abilityTimer || 0) + dt;

          // 1. Juggernaut Enrage (Phase 2 at 50% HP)
          if (e.type === 'juggernaut' && !e.enraged && e.hp <= e.maxHp * 0.5) {
            e.enraged = true;
            e.speed *= 1.35;
            this.screenShake = 18;
            this.addFloatingText("☠️ JUGGERNAUT ENRAGED!", e.x, e.y - 35, "#ff1744", 24);
            this.triggerRadioComm("HQ OVERWATCH", "⚠️ DIQQAT: Juggernaut 50% HP! Enrage rejimi: tezlik va zarba oshdi!", 4.0);
            this.spawnShockwave(e.x, e.y, 90, "#ff1744");
            if (audio) audio.artilleryBlast();
          }

          // 2. Overseer Energy Shield Pulse (Every 6.5s)
          if (e.type === 'overseer' && e.abilityTimer >= 6.5) {
            e.abilityTimer = 0;
            this.spawnShockwave(e.x, e.y, 140, "#651fff");
            this.addFloatingText("🛡️ SHIELD PULSE AURA!", e.x, e.y - 32, "#00b0ff", 18);
            if (audio) audio.shootCryo();
            for (const other of this.enemies) {
              if (Math.hypot(other.x - e.x, other.y - e.y) <= 140) {
                other.shield = Math.min(other.maxShield || 150, (other.shield || 0) + 75);
                other.maxShield = Math.max(other.maxShield || 0, other.shield);
              }
            }
          }

          // 3. Hive Titan Swarm Deployment (Every 5.5s)
          if (e.type === 'hive_titan' && e.abilityTimer >= 5.5) {
            e.abilityTimer = 0;
            this.spawnShockwave(e.x, e.y, 80, "#f50057");
            this.addFloatingText("☣️ SWARM DEPLOYED!", e.x, e.y - 35, "#ffab00", 18);
            for (let k = -1; k <= 1; k += 2) {
              this.enemies.push({
                uid: this.nextUid++,
                type: 'swarmling',
                laneIdx: e.laneIdx,
                progress: Math.max(0, e.progress + k * 18),
                hp: 35, maxHp: 35, shield: 0, maxShield: 0, armor: 0,
                speed: 95, bounty: 2, size: 7, color: '#ffab00', marker: '◆', isBoss: false,
                slowRatio: 0, slowTimer: 0, x: e.x, y: e.y, angle: e.angle
              });
            }
          }
        }

        const effSpeed = e.speed * (1.0 - Math.min(e.isBoss ? 0.5 : 1.0, e.slowRatio));

        // Battlefield Destructible Barricade blocking & attack
        let isBlocked = false;
        if (this.barricades && this.barricades.length > 0) {
          for (const b of this.barricades) {
            if (!b.broken && Math.hypot(e.x - b.x, e.y - b.y) <= 32) {
              isBlocked = true;
              e.attackTimer = (e.attackTimer || 0) + dt;
              if (e.attackTimer >= 0.7) {
                e.attackTimer = 0;
                const bDmg = e.isBoss ? 55 : (e.type === 'brute' ? 32 : (e.type === 'shieldbearer' ? 22 : 12));
                b.hp = Math.max(0, b.hp - bDmg);
                this.addFloatingText(`-${bDmg}`, b.x + (Math.random() * 16 - 8), b.y - 12, "#ff5252", 12);
                audio.barricadeHit();
                this.particles.push({
                  x: b.x + (Math.random() * 20 - 10),
                  y: b.y + (Math.random() * 20 - 10),
                  vx: (Math.random() * 40 - 20),
                  vy: (Math.random() * 40 - 20),
                  color: "#94a3b8", size: 3, life: 0.35, maxLife: 0.35
                });
                if (b.hp <= 0) {
                  b.broken = true;
                  this.screenShake = 12;
                  audio.barricadeBreak();
                  for (let k = 0; k < 12; k++) {
                    this.particles.push({
                      x: b.x, y: b.y,
                      vx: (Math.random() * 120 - 60),
                      vy: (Math.random() * 120 - 60),
                      color: "#64748b", size: 4 + Math.random() * 4, life: 0.7, maxLife: 0.7
                    });
                  }
                  this.addFloatingText("💥 TO'SIQ BUZILDI!", b.x, b.y - 25, "#ff1744", 18);
                  this.triggerRadioComm("HQ OVERWATCH", "⚠️ DIQQAT: Himoya to'sig'i dushmanlar tomonidan buzib tashlandi!", 4.5);
                }
              }
              break;
            }
          }
        }

        if (!isBlocked) {
          e.progress += effSpeed * dt;
        }
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
        if (t.recoil > 0) t.recoil = Math.max(0, t.recoil - dt * 6.5);
        if (t.heat > 0) t.heat = Math.max(0, t.heat - dt * 0.7);
        if (t.branch === 'A' && t.type === 'pulse') t.barrelSpin = (t.barrelSpin || 0) + dt * 14;

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
        if (!pt.beam) {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          if (pt.growth) pt.size += pt.growth * dt;
        }
        pt.life -= dt;
        if (pt.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.casings.length - 1; i >= 0; i--) {
        const c = this.casings[i];
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += c.rotSpd * dt;
        c.vx *= 0.91;
        c.vy *= 0.91;
        c.rotSpd *= 0.91;
        c.life -= dt;
        if (c.life <= 0) this.casings.splice(i, 1);
      }
      for (let i = this.scorchMarks.length - 1; i >= 0; i--) {
        const sm = this.scorchMarks[i];
        sm.life -= dt;
        if (sm.life <= 0) this.scorchMarks.splice(i, 1);
      }
      for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
        const mf = this.muzzleFlashes[i];
        mf.life -= dt;
        if (mf.life <= 0) this.muzzleFlashes.splice(i, 1);
      }
      for (let i = this.footprints.length - 1; i >= 0; i--) {
        const fp = this.footprints[i];
        fp.life -= dt;
        if (fp.life <= 0) this.footprints.splice(i, 1);
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
      if (h.dashTimer > 0) h.dashTimer = Math.max(0, h.dashTimer - dt);

      // Hero Movement toward target
      const distToTarget = Math.hypot(h.targetX - h.x, h.targetY - h.y);
      if (distToTarget > 4) {
        const dashMult = (h.dashTimer > 0) ? 2.4 : 1.0;
        const moveSpd = h.speed * (this.hasAugment("hero_overdrive") ? 1.25 : 1.0) * dashMult;
        h.angle = Math.atan2(h.targetY - h.y, h.targetX - h.x);
        h.x += Math.cos(h.angle) * moveSpd * dt;
        h.y += Math.sin(h.angle) * moveSpd * dt;
        h.walkAnim = (h.walkAnim || 0) + dt * (h.dashTimer > 0 ? 20 : 10);

        // Footstep dust & imprints
        if (Math.random() < 0.22) {
          this.spawnFootprint(h.x, h.y, h.angle, false);
          this.particles.push({
            x: h.x + (Math.random() * 8 - 4),
            y: h.y + (Math.random() * 8 - 4),
            vx: -Math.cos(h.angle) * 15 + (Math.random() * 6 - 3),
            vy: -Math.sin(h.angle) * 15 + (Math.random() * 6 - 3),
            color: "rgba(100, 116, 139, 0.35)", size: 3, growth: 7, life: 0.35, maxLife: 0.35
          });
        }

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


    spawnSpentCasing(x, y, barrelAngle) {
      if (this.casings.length > 90) this.casings.shift();
      const side = Math.random() > 0.5 ? 1 : -1;
      const ejectAngle = barrelAngle + (Math.PI / 2) * side + (Math.random() * 0.4 - 0.2);
      const speed = 75 + Math.random() * 55;
      this.casings.push({
        x: x + Math.cos(barrelAngle) * 8,
        y: y + Math.sin(barrelAngle) * 8,
        vx: Math.cos(ejectAngle) * speed,
        vy: Math.sin(ejectAngle) * speed,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() * 20 - 10),
        life: 4.5,
        maxLife: 4.5,
        len: 6,
        thick: 2.2
      });
    }

    spawnMuzzleSmoke(x, y, angle, color = "rgba(180, 195, 210, 0.45)") {
      for (let i = 0; i < 3; i++) {
        const speed = 25 + Math.random() * 35;
        const spread = angle + (Math.random() * 0.6 - 0.3);
        this.particles.push({
          x: x + Math.cos(angle) * 16,
          y: y + Math.sin(angle) * 16,
          vx: Math.cos(spread) * speed,
          vy: Math.sin(spread) * speed,
          color: color,
          size: 4 + Math.random() * 3,
          growth: 12,
          life: 0.35 + Math.random() * 0.2,
          maxLife: 0.55
        });
      }
    }

    spawnMuzzleFlash(x, y, angle, radius = 24, color = "#ffd600") {
      this.muzzleFlashes.push({
        x: x + Math.cos(angle) * 18,
        y: y + Math.sin(angle) * 18,
        radius: radius,
        color: color,
        life: 0.08,
        maxLife: 0.08
      });
    }

    spawnScorchMark(x, y, radius = 32) {
      if (this.scorchMarks.length > 45) this.scorchMarks.shift();
      this.scorchMarks.push({
        x: x,
        y: y,
        radius: radius,
        life: 8.0,
        maxLife: 8.0
      });
    }

    spawnFootprint(x, y, angle, isHeavy = false) {
      if (this.footprints.length > 60) this.footprints.shift();
      this.footprints.push({
        x: x,
        y: y,
        angle: angle,
        isHeavy: isHeavy,
        life: 3.5,
        maxLife: 3.5
      });
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

      tower.recoil = 1.0;
      tower.heat = Math.min(1.0, (tower.heat || 0) + 0.25);

      if (tower.type === 'pulse') {
        audio.shootPulse();
        this.spawnSpentCasing(tower.x, tower.y, tower.angle);
        this.spawnMuzzleFlash(tower.x, tower.y, tower.angle, tower.branch === 'B' ? 32 : 22, "#ffd600");
        this.spawnMuzzleSmoke(tower.x, tower.y, tower.angle);
        this.projectiles.push({ type: 'pulse', x: tower.x, y: tower.y, speed: 700, target: primary, damage: finalDmg, tower: tower, branch: tower.branch });
        if (tower.branch === 'A') primary.armor = Math.max(0, primary.armor - 1); // Gatling armor shred
      } else if (tower.type === 'mortar') {
        audio.shootMortar();
        this.spawnMuzzleFlash(tower.x, tower.y, tower.angle, 38, "#ff9100");
        this.spawnMuzzleSmoke(tower.x, tower.y, tower.angle, "rgba(120, 120, 120, 0.55)");
        this.projectiles.push({ type: 'mortar', startX: tower.x, startY: tower.y, targetX: primary.x, targetY: primary.y, x: tower.x, y: tower.y, t: 0, flightTime: 0.7, damage: finalDmg, splash: spec.splash, tower: tower, branch: tower.branch });
      } else if (tower.type === 'cryo') {
        audio.shootCryo();
        this.spawnShockwave(tower.x, tower.y, range, spec.color);
        this.spawnMuzzleSmoke(tower.x, tower.y, tower.angle, "rgba(0, 240, 255, 0.45)");
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
        this.spawnMuzzleFlash(tower.x, tower.y, tower.angle, 42, "#e040fb");
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
      this.spawnScorchMark(x, y, finalRadius * 0.75);
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
      // Clear entire backing buffer at full physical resolution
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.save();
      if (this.dpr && this.dpr !== 1) {
        this.ctx.scale(this.dpr, this.dpr);
      }
      if (this.screenShake > 0) {
        const sx = (Math.random() * 2 - 1) * this.screenShake;
        const sy = (Math.random() * 2 - 1) * this.screenShake;
        this.ctx.translate(sx, sy);
      }

      if (this.state === 'MENU') this.renderMainMenu();
      else if (this.state === 'MAP_SELECT') this.renderMapSelect();
      else if (this.state === 'LEADERBOARD') this.renderLeaderboardModal();
      else if (this.state === 'MANUAL') this.renderFieldManual();
      else if (this.state === 'EDITOR') this.renderEditor();
      else if (this.state === 'DRAFT') this.renderDraftModal();
      else if (this.state === 'ANALYTICS') this.renderAnalyticsScreen();
      else if (this.state === 'TPS_3D') this.render3DTPS();
      else {
        this.renderBackgroundGrid();
        this.renderLanes();
        this.renderGroundDecals();
        this.renderGroundHazards();
        this.renderRedZones();
        this.renderBarricades();
        this.renderUnitShadows();
        this.renderBaseCore();
        this.renderTowers();
        this.renderAirdrops();
        this.renderHero();
        this.renderEnemies();
        this.renderProjectiles();
        this.renderParticles();
        this.renderDynamicLightingLayer();
        this.renderFloatingText();
        this.renderPlacementGhost();
        this.renderTacticalDragVector();
        this.renderRadialBuildWheel();
        this.renderRadioComms();
        this.renderBossAlert();
        this.renderTopHUD();
        this.renderBottomBar();
        this.renderMobileFloatingButtons();

        if (this.state === 'PAUSED') this.renderPauseModal();
        if (this.state === 'VICTORY') this.renderVictoryModal();
        if (this.state === 'DEFEAT') this.renderDefeatModal();
      }

      if (this.showSettingsModal) this.renderSettingsModal();
      if (this.exitToastTimer > 0) this.renderExitToast();
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
      const ctx = this.ctx;
      const map = (this.gameMode === 'CUSTOM') ? { biome: "cyber" } : MAPS[this.currentMapIndex];
      const biome = (map && map.biome) ? map.biome : "cyber";

      // Background gradient based on biome
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      if (biome === 'lava') {
        bgGrad.addColorStop(0, "#150403");
        bgGrad.addColorStop(0.5, "#220805");
        bgGrad.addColorStop(1, "#100202");
      } else if (biome === 'cryo') {
        bgGrad.addColorStop(0, "#030c18");
        bgGrad.addColorStop(0.5, "#07182c");
        bgGrad.addColorStop(1, "#020812");
      } else {
        bgGrad.addColorStop(0, "#050812");
        bgGrad.addColorStop(0.5, "#080e1e");
        bgGrad.addColorStop(1, "#04060d");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Grid Lines
      const gridStroke = (biome === 'lava') ? "rgba(255, 87, 34, 0.12)" :
                         (biome === 'cryo') ? "rgba(128, 222, 234, 0.14)" :
                         "rgba(0, 229, 255, 0.08)";
      ctx.strokeStyle = gridStroke;
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 64) {
        ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 620); ctx.stroke();
      }
      for (let y = 60; y <= 620; y += 64) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // Tech Junction Crosshairs
      ctx.fillStyle = (biome === 'lava') ? "rgba(255, 112, 67, 0.35)" :
                      (biome === 'cryo') ? "rgba(0, 229, 255, 0.40)" :
                      "rgba(0, 229, 255, 0.25)";
      for (let x = 64; x < this.width; x += 128) {
        for (let y = 124; y < 620; y += 128) {
          ctx.fillRect(x - 3, y - 0.5, 6, 1);
          ctx.fillRect(x - 0.5, y - 3, 1, 6);
        }
      }

      // Outer Perimeter Defense Hazard Border
      ctx.strokeStyle = (biome === 'lava') ? "rgba(255, 61, 0, 0.45)" :
                        (biome === 'cryo') ? "rgba(0, 229, 255, 0.40)" :
                        "rgba(0, 229, 255, 0.30)";
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 62, this.width - 4, 556);

      // Atmospheric Biome Floating Particles
      this.renderBiomeParticles(ctx, biome);
    }

    renderLanes() {
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
      const ctx = this.ctx;
      const time = performance.now() * 0.003;

      for (const lane of map.lanes) {
        if (!lane || lane.length < 2) continue;

        // 1. Reinforced Trench Roadway (Dark Heavy Composite Base)
        ctx.beginPath();
        ctx.moveTo(lane[0].x, lane[0].y);
        for (let i = 1; i < lane.length; i++) ctx.lineTo(lane[i].x, lane[i].y);
        ctx.strokeStyle = "#0d1629";
        ctx.lineWidth = 48;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // 2. Concrete Curb Edge Lines
        ctx.strokeStyle = "rgba(0, 229, 255, 0.28)";
        ctx.lineWidth = 44;
        ctx.stroke();

        // 3. Inner Dark Pavement
        ctx.strokeStyle = "#0a1120";
        ctx.lineWidth = 38;
        ctx.stroke();

        // 4. Animated Tactical Guidance Dashed Centerline
        ctx.save();
        ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.lineDashOffset = -time * 28;
        ctx.setLineDash([14, 12]);
        ctx.beginPath();
        ctx.moveTo(lane[0].x, lane[0].y);
        for (let i = 1; i < lane.length; i++) ctx.lineTo(lane[i].x, lane[i].y);
        ctx.stroke();
        ctx.restore();
      }

      // Holographic Quantum Warp Gate at Spawn
      for (const lane of map.lanes) {
        if (!lane || lane.length < 2) continue;
        const sp = lane[0];
        ctx.save();
        ctx.translate(sp.x, sp.y);

        // Rotating hazard ring
        ctx.rotate(time * 1.6);
        ctx.strokeStyle = "#ff1744";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing hazard arcs
        ctx.strokeStyle = "rgba(255, 23, 68, 0.7)";
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 3; i++) {
          const a = (Math.PI * 2 / 3) * i;
          ctx.beginPath();
          ctx.arc(0, 0, 30, a, a + Math.PI / 4);
          ctx.stroke();
        }
        ctx.restore();

        // Spawn Gate Core
        ctx.fillStyle = "rgba(255, 23, 68, 0.9)";
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("WARP", sp.x, sp.y + 3);
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

    renderGroundDecals() {
      const ctx = this.ctx;

      // 1. Blast Scorch Marks
      for (const sm of this.scorchMarks) {
        const alpha = Math.max(0, sm.life / sm.maxLife) * 0.65;
        const grad = ctx.createRadialGradient(sm.x, sm.y, sm.radius * 0.15, sm.x, sm.y, sm.radius);
        grad.addColorStop(0, `rgba(15, 23, 42, ${alpha})`);
        grad.addColorStop(0.5, `rgba(25, 12, 12, ${alpha * 0.7})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sm.x, sm.y, sm.radius, 0, Math.PI * 2);
        ctx.fill();

        // Cracked pavement fracture lines
        ctx.strokeStyle = `rgba(5, 5, 12, ${alpha * 0.85})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i + 0.35;
          ctx.moveTo(sm.x, sm.y);
          ctx.lineTo(sm.x + Math.cos(a) * sm.radius * 0.8, sm.y + Math.sin(a) * sm.radius * 0.8);
        }
        ctx.stroke();
      }

      // 2. Footprints & Tread Marks
      for (const fp of this.footprints) {
        const alpha = Math.max(0, fp.life / fp.maxLife) * (fp.isHeavy ? 0.35 : 0.2);
        ctx.save();
        ctx.translate(fp.x, fp.y);
        ctx.rotate(fp.angle);
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        if (fp.isHeavy) {
          ctx.fillRect(-8, -12, 16, 5);
          ctx.fillRect(-8, 7, 16, 5);
        } else {
          ctx.fillRect(-4, -6, 8, 4);
          ctx.fillRect(-4, 2, 8, 4);
        }
        ctx.restore();
      }

      // 3. Spent Brass Shell Casings (Physics bounce & spin)
      for (const c of this.casings) {
        const alpha = Math.min(1.0, c.life / 0.5);
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.globalAlpha = alpha;

        // Drop shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(-c.len / 2 + 1, -c.thick / 2 + 1, c.len, c.thick);

        // Metallic Brass Gradient
        const brassGrad = ctx.createLinearGradient(0, -c.thick / 2, 0, c.thick / 2);
        brassGrad.addColorStop(0, "#ffe082"); // specular top highlight
        brassGrad.addColorStop(0.35, "#ffd54f"); // polished yellow brass
        brassGrad.addColorStop(0.8, "#ffb300"); // dark copper
        brassGrad.addColorStop(1, "#6d4c41"); // shadow bevel
        ctx.fillStyle = brassGrad;
        ctx.fillRect(-c.len / 2, -c.thick / 2, c.len, c.thick);

        // Primer rim cap
        ctx.fillStyle = "#ff8f00";
        ctx.fillRect(-c.len / 2, -c.thick / 2, 1.2, c.thick);

        ctx.restore();
      }
      ctx.globalAlpha = 1.0;
    }

    renderUnitShadows() {
      const ctx = this.ctx;
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
      const base = map.lanes[0][map.lanes[0].length - 1];

      // 1. Base Core Heavy Contact Shadow
      const baseShadowGrad = ctx.createRadialGradient(base.x + 4, base.y + 8, 10, base.x + 4, base.y + 8, 48);
      baseShadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.75)");
      baseShadowGrad.addColorStop(0.65, "rgba(0, 0, 0, 0.35)");
      baseShadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = baseShadowGrad;
      ctx.beginPath();
      ctx.ellipse(base.x + 4, base.y + 8, 48, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Towers Ambient Occlusion & Barrel Shadows
      for (const t of this.towers) {
        const shadowGrad = ctx.createRadialGradient(t.x + 3, t.y + 7, 6, t.x + 3, t.y + 7, 34);
        shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.8)");
        shadowGrad.addColorStop(0.65, "rgba(0, 0, 0, 0.4)");
        shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(t.x + 3, t.y + 7, 34, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Directional Barrel Cast Shadow
        ctx.save();
        ctx.translate(t.x + 2, t.y + 6);
        ctx.rotate(t.angle);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, -4, 28, 8);
        ctx.restore();
      }

      // 3. Hero Mech Ground Contact Shadow
      const h = this.hero;
      const heroShadowGrad = ctx.createRadialGradient(h.x + 3, h.y + 7, 4, h.x + 3, h.y + 7, 24);
      heroShadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.75)");
      heroShadowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.35)");
      heroShadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = heroShadowGrad;
      ctx.beginPath();
      ctx.ellipse(h.x + 3, h.y + 7, 24, 14, h.angle * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // 4. Enemies Ground Contact Shadows
      for (const e of this.enemies) {
        if (e.phased) continue;
        const radX = e.size * 1.35;
        const radY = e.size * 0.75;
        const sGrad = ctx.createRadialGradient(e.x + 3, e.y + 5, radX * 0.2, e.x + 3, e.y + 5, radX);
        const shadowAlpha = e.isBoss ? 0.75 : 0.55;
        sGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`);
        sGrad.addColorStop(0.6, `rgba(0, 0, 0, ${shadowAlpha * 0.5})`);
        sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.ellipse(e.x + 3, e.y + 5, radX, radY, e.angle * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    renderBaseCore() {
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
      const base = map.lanes[0][map.lanes[0].length - 1];
      const time = performance.now() * 0.002;
      const ctx = this.ctx;
      const hpPct = Math.max(0, this.baseHp / this.maxBaseHp);

      ctx.save();
      ctx.translate(base.x, base.y);

      // 1. Reinforced Hexagonal Heavy Cast-Titanium Platform
      const plinthGrad = ctx.createLinearGradient(-36, -36, 36, 36);
      plinthGrad.addColorStop(0, "#334155"); // specular top edge
      plinthGrad.addColorStop(0.5, "#1e293b"); // gunmetal body
      plinthGrad.addColorStop(1, "#0f172a"); // dark shadow bevel
      ctx.fillStyle = plinthGrad;
      ctx.strokeStyle = hpPct < 0.3 ? "#ff1744" : "rgba(0, 229, 255, 0.8)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = Math.cos(a) * 38;
        const py = Math.sin(a) * 38;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner 3D Chamfer Rim
      ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = Math.cos(a) * 32;
        const py = Math.sin(a) * 32;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Corner Stainless Steel Bolts
      ctx.fillStyle = "#94a3b8";
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6;
        const bx = Math.cos(a) * 30;
        const by = Math.sin(a) * 30;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bx - 1, by - 1, 1.5, 1.5);
        ctx.fillStyle = "#94a3b8";
      }

      // 2. Counter-Rotating Gyro Containment Rings
      ctx.save();
      ctx.rotate(time * 0.8);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 1.6);
      ctx.stroke();
      // Counter-weight nodules
      ctx.fillStyle = "#ffd600";
      ctx.fillRect(23, -3, 5, 6);
      ctx.fillRect(-27, -3, 5, 6);
      ctx.restore();

      ctx.save();
      ctx.rotate(-time * 1.2);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.65)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 1.4);
      ctx.stroke();
      ctx.restore();

      // 3. Central Quantum Plasma Reactor Core
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 15);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.35, hpPct < 0.3 ? "#ff1744" : "#00e5ff");
      grad.addColorStop(0.8, hpPct < 0.3 ? "#d50000" : "#0091ea");
      grad.addColorStop(1, hpPct < 0.3 ? "rgba(255, 23, 68, 0)" : "rgba(0, 110, 255, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 15 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
      ctx.fill();

      // Magnetic Flare Corona
      ctx.strokeStyle = hpPct < 0.3 ? "rgba(255, 23, 68, 0.7)" : "rgba(0, 229, 255, 0.6)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 31 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Holographic Status Display
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

      // 1. Ultimate Holographic Mandala Blade Storm
      if (h.ultActiveTime > 0) {
        const ultProg = h.ultActiveTime / 0.6;
        ctx.save();
        ctx.rotate(performance.now() * 0.015);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.9)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, 85 * (1.1 - ultProg * 0.3), 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 214, 0, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 125 * (1.0 - ultProg * 0.4), 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
          const ang = (Math.PI / 2) * i;
          ctx.beginPath();
          ctx.arc(0, 0, 75, ang, ang + Math.PI / 3);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Selection Halo (Tactical Reticle)
      if (h.selected) {
        ctx.strokeStyle = "#ffd600";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Facing Orientation & Articulated Bipedal Mech
      const ang = h.angle || 0;
      ctx.rotate(ang);

      const walkCycle = Math.sin(h.walkAnim || 0);

      // Articulated Hydraulic Legs with Knee Actuators & Footplates
      const legL_X = -10 + walkCycle * 4;
      const legR_X = -10 - walkCycle * 4;

      // Left Leg
      const legGrad = ctx.createLinearGradient(-12, -15, 0, -10);
      legGrad.addColorStop(0, "#334155");
      legGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = legGrad;
      ctx.fillRect(legL_X, -15, 9, 6);
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(legL_X, -15, 9, 6);
      // Piston rod
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(legL_X + 2, -13, 5, 2);

      // Right Leg
      ctx.fillStyle = legGrad;
      ctx.fillRect(legR_X, 9, 9, 6);
      ctx.strokeRect(legR_X, 9, 9, 6);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(legR_X + 2, 11, 5, 2);

      // Dual Ion Thruster Backpack
      const thrusterGrad = ctx.createLinearGradient(-16, -9, -10, 9);
      thrusterGrad.addColorStop(0, "#1e293b");
      thrusterGrad.addColorStop(1, "#090d16");
      ctx.fillStyle = thrusterGrad;
      ctx.fillRect(-15, -9, 7, 18);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.strokeRect(-15, -9, 7, 18);

      // Exhaust Nozzles & Blue Ion Flare
      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(-17, -7, 2, 4);
      ctx.fillRect(-17, 3, 2, 4);

      // Armored Titanium Torso Chassis (Multi-Stop Gradient & Bevels)
      const torsoGrad = ctx.createLinearGradient(-12, -12, 14, 12);
      torsoGrad.addColorStop(0, "#475569"); // top-left specular highlight
      torsoGrad.addColorStop(0.4, "#1e293b"); // gunmetal armor plate
      torsoGrad.addColorStop(1, "#0f172a"); // shadow chamfer
      ctx.fillStyle = torsoGrad;
      ctx.beginPath();
      ctx.moveTo(-11, -11);
      ctx.lineTo(9, -9);
      ctx.lineTo(14, 0);
      ctx.lineTo(9, 9);
      ctx.lineTo(-11, 11);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shoulder Pauldrons with Unit Marking
      ctx.fillStyle = "#334155";
      ctx.fillRect(-6, -15, 7, 5);
      ctx.fillRect(-6, 10, 7, 5);

      // Glowing Quantum Arc-Reactor Core
      const reactorGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 5.5);
      reactorGrad.addColorStop(0, "#ffffff");
      reactorGrad.addColorStop(0.4, "#ffd600");
      reactorGrad.addColorStop(1, "#ff6d00");
      ctx.fillStyle = reactorGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Rotating Brass Magnetic Confinement Ring
      ctx.save();
      ctx.rotate(performance.now() * 0.005);
      ctx.strokeStyle = "#ffd54f";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();

      // Angular Cockpit / Helmet with Neon Cyan Glass Visor & Specular Glint
      ctx.fillStyle = "#090d16";
      ctx.beginPath();
      ctx.moveTo(3, -5);
      ctx.lineTo(14, -3);
      ctx.lineTo(16, 0);
      ctx.lineTo(14, 3);
      ctx.lineTo(3, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Visor Glass Specular Glint
      const visorGrad = ctx.createLinearGradient(6, -3, 14, 0);
      visorGrad.addColorStop(0, "#ffffff");
      visorGrad.addColorStop(0.6, "#00e5ff");
      visorGrad.addColorStop(1, "#0091ea");
      ctx.strokeStyle = visorGrad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(6, -3);
      ctx.lineTo(14, 0);
      ctx.lineTo(6, 3);
      ctx.stroke();

      // Tactical Left Arm Energy Buckler
      ctx.fillStyle = "#00b0ff";
      ctx.fillRect(0, -14, 7, 4);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, -14, 7, 4);

      // High-Frequency Plasma Katana (Right Arm)
      const slashAngle = (h.slashAnim > 0) ? ((0.22 - h.slashAnim) / 0.22) * Math.PI : 0;
      ctx.save();
      ctx.translate(4, 10);
      ctx.rotate(slashAngle);

      // Katana Hilt
      ctx.fillStyle = "#475569";
      ctx.fillRect(-3, -2.5, 6, 5);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(2, -4, 2, 8); // Tsuba guard

      // Curved Energy Wake Ribbon Trail when slashing
      if (h.slashAnim > 0) {
        ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(-4, 0, 26, -0.6, 0.6);
        ctx.stroke();
      }

      // Outer Ionized Plasma Envelope
      ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(28, 0);
      ctx.stroke();

      // Inner White-Hot Tungsten Cutting Edge
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(27, 0);
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // Floating Tactical Health Bar & Level Badge
      const barW = 48;
      const bx = h.x - barW / 2;
      const by = h.y - 30;

      // Level Badge Hexagon
      ctx.fillStyle = "#ffd600";
      ctx.beginPath();
      ctx.arc(bx - 9, by + 3, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${h.level}`, bx - 9, by + 6);

      // Health Bar Chassis
      ctx.fillStyle = "#090e17";
      ctx.fillRect(bx, by, barW, 6);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, barW, 6);

      const hpPct = Math.max(0, h.hp / h.maxHp);
      ctx.fillStyle = hpPct > 0.3 ? "#00e676" : "#ff1744";
      ctx.fillRect(bx, by, barW * hpPct, 6);
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
          ctx.strokeStyle = "rgba(255, 214, 0, 0.65)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 28, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 2. Heavy Cast-Titanium Octagonal Pedestal Base
        const color = t.branch ? spec.color : def.color;
        const baseGrad = ctx.createLinearGradient(t.x - 24, t.y - 24, t.x + 24, t.y + 24);
        baseGrad.addColorStop(0, "#334155"); // specular top edge
        baseGrad.addColorStop(0.4, "#1e293b"); // gunmetal body
        baseGrad.addColorStop(1, "#090d16"); // dark shadow edge
        ctx.fillStyle = baseGrad;
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

        // 45-degree Inner Bevel Ring
        ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          const px = t.x + Math.cos(a) * 19;
          const py = t.y + Math.sin(a) * 19;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // Stainless Steel Mounting Hex Bolts
        ctx.fillStyle = "#cbd5e1";
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i + Math.PI / 4;
          const bx = t.x + Math.cos(a) * 16;
          const by = t.y + Math.sin(a) * 16;
          ctx.fillRect(bx - 2, by - 2, 4, 4);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(bx - 1, by - 1, 1.5, 1.5);
          ctx.fillStyle = "#cbd5e1";
        }

        // Turret Mounting Collar Ring
        ctx.fillStyle = "#090d16";
        ctx.beginPath();
        ctx.arc(t.x, t.y, 11, 0, Math.PI * 2);
        ctx.fill();

        // 3. Rotating Turret Head Assembly with Physical Recoil Kickback
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);

        // Apply physical barrel recoil kickback
        const recoilKick = (t.recoil || 0) * 6;
        ctx.translate(-recoilKick, 0);

        ctx.fillStyle = color;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;

        if (t.type === 'pulse') {
          if (t.branch === 'A') {
            // Gatling Shredder: 6-Barrel Rotary Minigun with Heat Glow
            const spin = t.barrelSpin || 0;
            ctx.fillStyle = "#334155";
            ctx.fillRect(0, -7, 24, 14);
            ctx.strokeStyle = "#64748b";
            ctx.strokeRect(0, -7, 24, 14);

            // Brass ammunition feed chute
            ctx.fillStyle = "#ffd54f";
            ctx.fillRect(-6, -4, 6, 8);

            // 6 Rotating Fluted Barrels
            ctx.fillStyle = "#0f172a";
            for (let b = 0; b < 6; b++) {
              const ba = spin + (Math.PI / 3) * b;
              const by = Math.sin(ba) * 5;
              ctx.fillRect(24, by - 1.2, 8, 2.4);
              // Barrel tip heat glow
              if (t.heat > 0) {
                ctx.fillStyle = `rgba(255, 109, 0, ${t.heat})`;
                ctx.fillRect(30, by - 1.2, 2.5, 2.4);
                ctx.fillStyle = "#0f172a";
              }
            }
          } else if (t.branch === 'B') {
            // Sniper Rail-Pulse: Ultra-Long Anti-Materiel Rifle
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(-7, -6, 16, 12);
            ctx.strokeRect(-7, -6, 16, 12);

            // Long fluted barrel
            ctx.fillStyle = "#00b0ff";
            ctx.fillRect(9, -2.5, 34, 5);
            // Heavy muzzle compensator
            ctx.fillStyle = "#334155";
            ctx.fillRect(40, -4, 5, 8);

            // Holographic Optic Scope with Specular Lens Glint
            ctx.fillStyle = "#ffd600";
            ctx.fillRect(14, -6, 12, 3.5);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(24, -6, 2, 3.5);
          } else {
            // Dual Autocannon Barrels with Slotted Muzzle Brakes
            ctx.fillStyle = color;
            ctx.fillRect(2, -7, 22, 5);
            ctx.fillRect(2, 2, 22, 5);
            // Slotted muzzle brakes
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(20, -8, 3, 7);
            ctx.fillRect(20, 1, 3, 7);

            // Receiver chassis
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(-8, -8, 16, 16);
            ctx.strokeStyle = "#475569";
            ctx.strokeRect(-8, -8, 16, 16);
          }
        } else if (t.type === 'mortar') {
          if (t.branch === 'A') {
            // Cluster Bomb: Quad Rocket Pod with Warheads
            ctx.fillStyle = "#334155";
            ctx.fillRect(-8, -11, 24, 22);
            ctx.strokeStyle = "#ff9100";
            ctx.strokeRect(-8, -11, 24, 22);

            // 4 Armed Missile Cells with Red Warheads
            ctx.fillStyle = "#ff1744";
            ctx.fillRect(16, -9, 4, 5);
            ctx.fillRect(16, -2, 4, 5);
            ctx.fillRect(16, 5, 4, 5);
          } else if (t.branch === 'B') {
            // Napalm Cyber-Fire: Heavy Fuel Tanks & Pilot Flame Igniter
            ctx.fillStyle = "#334155";
            ctx.fillRect(-6, -10, 22, 20);
            // Pressurized dual fuel tanks
            ctx.fillStyle = "#ff3d00";
            ctx.fillRect(-11, -8, 6, 16);
            ctx.strokeStyle = "#ffd600";
            ctx.lineWidth = 1;
            ctx.strokeRect(-11, -8, 6, 16);

            // Pilot Igniter Nozzle
            ctx.fillStyle = "#ffd600";
            ctx.fillRect(16, -2.5, 9, 5);
          } else {
            // Heavy Howitzer Artillery Cannon with Hydraulic Recoil Dampers
            ctx.fillStyle = color;
            ctx.fillRect(-5, -8, 25, 16);
            // Bore cavity
            ctx.fillStyle = "#0a0a0f";
            ctx.fillRect(18, -6, 3, 12);

            // Hydraulic dampener cylinders
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(-10, -10, 14, 20);
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(-2, -11, 8, 2);
            ctx.fillRect(-2, 9, 8, 2);
          }
        } else if (t.type === 'cryo') {
          if (t.branch === 'A') {
            // Blizzard Zero: Crystalline Faceted Spire
            const cryoGrad = ctx.createLinearGradient(18, 0, -8, 0);
            cryoGrad.addColorStop(0, "#ffffff");
            cryoGrad.addColorStop(0.5, "#00f0ff");
            cryoGrad.addColorStop(1, "#0066cc");
            ctx.fillStyle = cryoGrad;
            ctx.beginPath();
            ctx.moveTo(20, 0); ctx.lineTo(-8, -11); ctx.lineTo(-3, 0); ctx.lineTo(-8, 11);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.2;
            ctx.stroke();
          } else if (t.branch === 'B') {
            // Tesla Chain-Frost: Dual Copper Inductor Prongs
            ctx.fillStyle = "#334155";
            ctx.fillRect(-6, -9, 16, 18);
            ctx.strokeStyle = "#76ff03";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(10, -7); ctx.lineTo(25, -4);
            ctx.moveTo(10, 7); ctx.lineTo(25, 4);
            ctx.stroke();
            // Ceramic insulators
            ctx.fillStyle = "#ffd600";
            ctx.fillRect(12, -8, 3, 3);
            ctx.fillRect(12, 5, 3, 3);
          } else {
            // Cryogenic Sphere with Liquid Nitrogen Core
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(-3, -3, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (t.type === 'railgun') {
          if (t.branch === 'A') {
            // Hyper Beam Laser: Optical Prism Array
            ctx.fillStyle = "#ff007f";
            ctx.fillRect(0, -4, 32, 8);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(30, -6, 6, 12);
            ctx.strokeStyle = "#ff4081";
            ctx.strokeRect(0, -4, 32, 8);
          } else if (t.branch === 'B') {
            // Ion Disrupter: Triple Toroidal Rings
            ctx.fillStyle = "#d500f9";
            ctx.fillRect(0, -3, 28, 6);
            ctx.strokeStyle = "#e040fb";
            ctx.lineWidth = 2;
            for (let r = 8; r <= 24; r += 8) {
              ctx.strokeRect(r, -6, 3, 12);
            }
          } else {
            // Parallel Magnetic Acceleration Rails
            ctx.fillStyle = color;
            ctx.fillRect(0, -3.5, 32, 7);
            ctx.fillStyle = "#334155";
            ctx.fillRect(-8, -8, 14, 16);
            // Electromagnetic Induction Coils
            ctx.fillStyle = "#ffd600";
            ctx.fillRect(10, -6, 4, 12);
            ctx.fillRect(20, -6, 4, 12);
          }
        } else if (t.type === 'beacon') {
          if (t.branch === 'A') {
            // Overcharge Reactor: Arcing Lightning Sphere
            const spGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 15);
            spGrad.addColorStop(0, "#ffffff");
            spGrad.addColorStop(0.5, "#b388ff");
            spGrad.addColorStop(1, "#651fff");
            ctx.fillStyle = spGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffd600";
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (t.branch === 'B') {
            // Tactical Radar: 360-Degree Rotating Dish
            ctx.fillStyle = "#e040fb";
            ctx.beginPath();
            ctx.arc(0, 0, 15, -Math.PI / 3, Math.PI / 3);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
          } else {
            // Satellite Power Crystal
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

        // --- HIGH-FIDELITY PROCEDURAL CHARACTER DESIGNS ---
        if (e.type === 'grunt') {
          // Cyborg Mercenary Infantry Trooper
          const walk = Math.sin(e.walkAnim || 0) * 3.5;
          ctx.rotate(e.angle);

          // Articulated combat boots
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-8 + walk, -7, 6, 4);
          ctx.fillRect(-8 - walk, 3, 6, 4);

          // Ballistic Kevlar Chest Rig
          const chestGrad = ctx.createLinearGradient(-6, -6, 6, 6);
          chestGrad.addColorStop(0, "#475569");
          chestGrad.addColorStop(1, "#1e293b");
          ctx.fillStyle = chestGrad;
          ctx.fillRect(-6, -6, 12, 12);
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 1.8;
          ctx.strokeRect(-6, -6, 12, 12);

          // Tactical Helmet with Glowing Night-Vision Visor
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.arc(4, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#00e5ff"; // glowing cyan NVG visor
          ctx.fillRect(4, -2.5, 3, 5);

          // Assault Carbine with Muzzle Compensator
          ctx.fillStyle = "#334155";
          ctx.fillRect(5, 3, 11, 2.5);
          ctx.fillStyle = "#64748b";
          ctx.fillRect(14, 2, 3, 4.5);
        } else if (e.type === 'sprinter') {
          // Cyber-Hound / Predatory Stalker Mech
          const run = Math.sin(e.walkAnim || 0) * 5.5;
          ctx.rotate(e.angle);

          // 4 Articulated Digitigrade Legs with Titanium Talons
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-9 + run, -9, 5, 3.5);
          ctx.fillRect(-9 - run, 6, 5, 3.5);
          ctx.fillRect(5 - run, -10, 5, 3.5);
          ctx.fillRect(5 + run, 7, 5, 3.5);

          // Sleek Aerodynamic Carbon-Fiber Hull
          const stalkerGrad = ctx.createLinearGradient(-11, -8, 14, 8);
          stalkerGrad.addColorStop(0, "#451a03");
          stalkerGrad.addColorStop(1, "#1c1917");
          ctx.fillStyle = stalkerGrad;
          ctx.beginPath();
          ctx.moveTo(14, 0); ctx.lineTo(-11, -8); ctx.lineTo(-7, 0); ctx.lineTo(-11, 8);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Triple Glowing Crimson Sensor Cluster
          ctx.fillStyle = "#ff1744";
          ctx.fillRect(7, -2.5, 4, 5);

          // Dorsal Thruster Heat Vents
          ctx.fillStyle = "#ff9100";
          ctx.fillRect(-13, -5, 3, 3);
          ctx.fillRect(-13, 2, 3, 3);
        } else if (e.type === 'brute') {
          // Goliath Heavy War-Mech
          const stomp = Math.sin(e.walkAnim || 0) * 3.5;
          ctx.rotate(e.angle);

          // Heavy Hydraulic Stomping Legs
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-15 + stomp, -17, 9, 7);
          ctx.fillRect(-15 - stomp, 11, 9, 7);

          // Heavy Bolted Frontal Glacis Armor
          const bruteGrad = ctx.createLinearGradient(-13, -14, 13, 14);
          bruteGrad.addColorStop(0, "#334155");
          bruteGrad.addColorStop(0.5, "#1e293b");
          bruteGrad.addColorStop(1, "#090d16");
          ctx.fillStyle = bruteGrad;
          ctx.fillRect(-13, -14, 24, 28);
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 2.8;
          ctx.strokeRect(-13, -14, 24, 28);

          // Yellow/Black Hazard Warning Chevron Stripes
          ctx.fillStyle = "#ffd600";
          ctx.fillRect(-11, -12, 4, 24);
          ctx.fillStyle = "#000000";
          ctx.fillRect(-5, -12, 4, 24);

          // Dual Vertical Exhaust Smokestacks
          ctx.fillStyle = "#475569";
          ctx.fillRect(-15, -13, 4, 6);
          ctx.fillRect(-15, 7, 4, 6);

          // Heavy Pneumatic Ram Arms
          ctx.fillStyle = "#64748b";
          ctx.fillRect(7, -18, 15, 6);
          ctx.fillRect(7, 13, 15, 6);

          // Glowing Thermal Intake Grille
          ctx.fillStyle = "#ff1744";
          ctx.fillRect(5, -3.5, 7, 7);
        } else if (e.type === 'swarmling') {
          // Nano-Drone Cyber-Arachnid
          ctx.rotate(e.angle);
          const walkS = Math.sin(performance.now() * 0.02) * 3;

          // 6 Articulated Chitinous Legs
          ctx.strokeStyle = "#ffab00";
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 3; i++) {
            const legY = -7 + i * 7;
            ctx.beginPath();
            ctx.moveTo(-2, legY); ctx.lineTo(-8, legY + (i % 2 === 0 ? walkS : -walkS)); ctx.lineTo(-12, legY + (i % 2 === 0 ? walkS * 1.5 : -walkS * 1.5));
            ctx.moveTo(2, legY); ctx.lineTo(8, legY + (i % 2 === 0 ? -walkS : walkS)); ctx.lineTo(12, legY + (i % 2 === 0 ? -walkS * 1.5 : walkS * 1.5));
            ctx.stroke();
          }

          // Armored Chitin Carapace
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.moveTo(9, 0); ctx.lineTo(0, -7); ctx.lineTo(-8, 0); ctx.lineTo(0, 7);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Compound Crimson Eyes & Titanium Mandibles
          ctx.fillStyle = "#ff1744";
          ctx.fillRect(1, -2, 3.5, 4);
        } else if (e.type === 'shieldbearer') {
          // Aegis Paladin Android with Holographic Hex-Pavise Shield
          ctx.rotate(e.angle);

          // Heavy Titanium Android Chassis
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-11, -10, 15, 20);
          ctx.strokeStyle = "#00b0ff";
          ctx.lineWidth = 1.8;
          ctx.strokeRect(-11, -10, 15, 20);

          // Core Conduit
          ctx.fillStyle = "#00e5ff";
          ctx.fillRect(0, -2.5, 4, 5);

          // Massive Curved Holographic Hexagonal Shield Barrier
          ctx.strokeStyle = "rgba(0, 176, 255, 0.95)";
          ctx.fillStyle = "rgba(0, 229, 255, 0.28)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(11, 0, 20, -Math.PI / 2.2, Math.PI / 2.2);
          ctx.stroke();
          ctx.fill();

          // Titanium Shield Emitter Node
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(9, -2.5, 4, 5);
        } else if (e.type === 'medic') {
          // Nanite Bio-Synth Medical Drone
          ctx.rotate(e.angle);
          const bob = Math.sin(performance.now() * 0.005) * 2;

          // Composite Aerodynamic Hull
          ctx.fillStyle = "#064e3b";
          ctx.beginPath();
          ctx.arc(0, bob, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#00e676";
          ctx.lineWidth = 2.2;
          ctx.stroke();

          // Illuminated Medical Cross Insignia
          ctx.fillStyle = "#00e676";
          ctx.fillRect(-2.5, bob - 7, 5, 14);
          ctx.fillRect(-7, bob - 2.5, 14, 5);

          // Orbiting Repair Nanite Spheres
          const orbit = performance.now() * 0.004;
          for (let i = 0; i < 4; i++) {
            const a = orbit + (Math.PI / 2) * i;
            ctx.fillStyle = "#69f0ae";
            ctx.beginPath();
            ctx.arc(Math.cos(a) * 16, Math.sin(a) * 16 + bob, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (e.type === 'splitter') {
          // Fracture Crystal Incubator
          const pulse = Math.sin(performance.now() * 0.008) * 2;
          const spin = performance.now() * 0.003;

          // 4 Orbiting Crystalline Magnetic Shards
          ctx.fillStyle = "#1e1b4b";
          ctx.strokeStyle = "#e040fb";
          ctx.lineWidth = 1.8;
          for (let i = 0; i < 4; i++) {
            const a = spin + (Math.PI / 2) * i;
            const cx = Math.cos(a) * 17;
            const cy = Math.sin(a) * 17;
            ctx.fillRect(cx - 3.5, cy - 3.5, 7, 7);
            ctx.strokeRect(cx - 3.5, cy - 3.5, 7, 7);
          }

          // Glowing Volatile Core
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(0, 0, 9 + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffd600";
          ctx.beginPath();
          ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'phantom') {
          // Stealth Ghost Infiltrator with Optical Camouflage
          const shimmer = Math.sin(performance.now() * 0.01) * 3;
          ctx.rotate(e.angle);

          // Chromatic Aberration Silhouette
          ctx.fillStyle = "rgba(255, 0, 127, 0.4)";
          ctx.fillRect(-9 + shimmer, -7, 15, 14);
          ctx.fillStyle = "rgba(0, 229, 255, 0.4)";
          ctx.fillRect(-9 - shimmer, -7, 15, 14);

          // Sleek Stealth Cowl
          ctx.fillStyle = "rgba(124, 77, 255, 0.75)";
          ctx.beginPath();
          ctx.moveTo(11, 0); ctx.lineTo(-11, -8); ctx.lineTo(-7, 0); ctx.lineTo(-11, 8);
          ctx.closePath();
          ctx.fill();

          // Dual Vibro-Daggers with Electric Arc Tips
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(9, -6); ctx.lineTo(18, -2.5);
          ctx.moveTo(9, 6); ctx.lineTo(18, 2.5);
          ctx.stroke();
        } else if (e.type === 'juggernaut') {
          // BOSS 1: Colossus MK-IV Siege Fortress
          const walkB = Math.sin(e.walkAnim || 0) * 4.5;
          ctx.rotate(e.angle);

          // Continuous Heavy Tank Tread Assemblies
          ctx.fillStyle = "#090d16";
          ctx.fillRect(-24 + walkB, -26, 14, 11);
          ctx.fillRect(-24 - walkB, 15, 14, 11);
          ctx.fillRect(11 - walkB, -26, 14, 11);
          ctx.fillRect(11 + walkB, 15, 14, 11);

          // Heavy Welded Steel Armor Hull
          const colossusGrad = ctx.createLinearGradient(-20, -20, 20, 20);
          colossusGrad.addColorStop(0, "#475569");
          colossusGrad.addColorStop(0.5, "#1e293b");
          colossusGrad.addColorStop(1, "#090d16");
          ctx.fillStyle = colossusGrad;
          ctx.fillRect(-20, -20, 40, 40);
          ctx.strokeStyle = "#ff1744";
          ctx.lineWidth = 3.5;
          ctx.strokeRect(-20, -20, 40, 40);

          // Massive Dual Heavy Siege Cannons with Recoil Dampers
          ctx.fillStyle = "#334155";
          ctx.fillRect(5, -23, 24, 7);
          ctx.fillRect(5, 16, 24, 7);

          // Rotating Command Cupola & Sweeping Red Laser Searchlight
          ctx.strokeStyle = "rgba(255, 23, 68, 0.65)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(28, -20); ctx.lineTo(130, -20);
          ctx.moveTo(28, 20); ctx.lineTo(130, 20);
          ctx.stroke();

          // Core Reactor
          ctx.fillStyle = "#ff1744";
          ctx.beginPath();
          ctx.arc(3, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffd600";
          ctx.beginPath();
          ctx.arc(3, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'overseer') {
          // BOSS 2: Eye of Chronos Quantum AI
          const gyro1 = performance.now() * 0.002;
          const gyro2 = performance.now() * -0.003;

          // 3 Concentric Gimbaled Titanium Rings
          ctx.strokeStyle = "rgba(101, 31, 255, 0.85)";
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.ellipse(0, 0, 34, 15, gyro1, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = "rgba(224, 64, 251, 0.85)";
          ctx.beginPath();
          ctx.ellipse(0, 0, 27, 13, gyro2, 0, Math.PI * 2);
          ctx.stroke();

          // Central Quantum Singularity Orb
          ctx.fillStyle = "#1e1b4b";
          ctx.beginPath();
          ctx.arc(0, 0, 17, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#d500f9";
          ctx.lineWidth = 2.2;
          ctx.stroke();

          ctx.fillStyle = "#00e5ff";
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(2, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === 'hive_titan') {
          // BOSS 3: Leviathan Core Bio-Mechanical Centipede
          ctx.rotate(e.angle);

          // 6 Multi-Segmented Carapace Nodes
          for (let s = 4; s >= 0; s--) {
            const sx = -s * 10;
            const segW = 28 - s * 3;
            const segH = 26 - s * 3;
            ctx.fillStyle = s % 2 === 0 ? "#1e293b" : "#374151";
            ctx.fillRect(sx - segW / 2, -segH / 2, segW, segH);
            ctx.strokeStyle = "#f50057";
            ctx.lineWidth = 2.2;
            ctx.strokeRect(sx - segW / 2, -segH / 2, segW, segH);
            // Glowing crimson spine conduits
            ctx.fillStyle = "#ff1744";
            ctx.fillRect(sx - 2, -3.5, 4, 7);
          }

          // Armored Predatory Head & Hydraulic Mandibles
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.moveTo(15, 0); ctx.lineTo(4, -13); ctx.lineTo(4, 13);
          ctx.closePath();
          ctx.fill();

          const snap = Math.sin(performance.now() * 0.008) * 3.5;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(9, -11); ctx.lineTo(21 + snap, -5);
          ctx.moveTo(9, 11); ctx.lineTo(21 + snap, 5);
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
        ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
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
          // Elongated Hypervelocity Sabot Dart with Tungsten Core
          const pAngle = p.target ? Math.atan2(p.target.y - p.y, p.target.x - p.x) : 0;
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(pAngle);

          // Burning plasma wake trail
          this.ctx.fillStyle = "rgba(255, 214, 0, 0.4)";
          this.ctx.fillRect(-10, -2, 10, 4);

          // Outer glowing sabot sheath
          this.ctx.fillStyle = (p.branch === 'B') ? "#00e5ff" : "#ffd600";
          this.ctx.fillRect(-4, -2, 10, 4);

          // Inner white-hot kinetic core
          this.ctx.fillStyle = "#ffffff";
          this.ctx.fillRect(-2, -1, 8, 2);

          this.ctx.restore();
        } else if (p.type === 'mortar') {
          // Artillery Shell with Shadow & Fiery Rocket Exhaust
          const shadowY = p.startY + (p.targetY - p.startY) * p.t;
          const sGrad = this.ctx.createRadialGradient(p.x, shadowY, 2, p.x, shadowY, 8);
          sGrad.addColorStop(0, "rgba(0, 0, 0, 0.5)");
          sGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          this.ctx.fillStyle = sGrad;
          this.ctx.beginPath();
          this.ctx.arc(p.x, shadowY, 8, 0, Math.PI * 2);
          this.ctx.fill();

          // Fin-stabilized mortar bomb
          this.ctx.fillStyle = "#ff9100";
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = "#ffffff";
          this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
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

    renderDynamicLightingLayer() {
      const ctx = this.ctx;
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
      const base = map.lanes[0][map.lanes[0].length - 1];
      const time = performance.now() * 0.002;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // 1. Base Core Additive Light Bloom
      const hpPct = Math.max(0, this.baseHp / this.maxBaseHp);
      const coreLightGrad = ctx.createRadialGradient(base.x, base.y, 4, base.x, base.y, 90 + Math.sin(time * 3) * 10);
      const coreColor = hpPct < 0.3 ? "255, 23, 68" : "0, 229, 255";
      coreLightGrad.addColorStop(0, `rgba(${coreColor}, 0.5)`);
      coreLightGrad.addColorStop(0.4, `rgba(${coreColor}, 0.18)`);
      coreLightGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = coreLightGrad;
      ctx.beginPath();
      ctx.arc(base.x, base.y, 100, 0, Math.PI * 2);
      ctx.fill();

      // 2. Hero Arc-Reactor & Katana Light
      const h = this.hero;
      const heroLightGrad = ctx.createRadialGradient(h.x, h.y, 2, h.x, h.y, 50);
      heroLightGrad.addColorStop(0, "rgba(0, 229, 255, 0.45)");
      heroLightGrad.addColorStop(0.4, "rgba(0, 140, 255, 0.15)");
      heroLightGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = heroLightGrad;
      ctx.beginPath();
      ctx.arc(h.x, h.y, 50, 0, Math.PI * 2);
      ctx.fill();

      if (h.slashAnim > 0) {
        const bladeTipX = h.x + Math.cos(h.angle) * 32;
        const bladeTipY = h.y + Math.sin(h.angle) * 32;
        const slashLight = ctx.createRadialGradient(bladeTipX, bladeTipY, 2, bladeTipX, bladeTipY, 50);
        slashLight.addColorStop(0, "rgba(255, 255, 255, 0.75)");
        slashLight.addColorStop(0.4, "rgba(0, 229, 255, 0.4)");
        slashLight.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = slashLight;
        ctx.beginPath();
        ctx.arc(bladeTipX, bladeTipY, 50, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Dynamic Muzzle Flashes
      for (const mf of this.muzzleFlashes) {
        const alpha = Math.min(1.0, mf.life / mf.maxLife);
        const flashGrad = ctx.createRadialGradient(mf.x, mf.y, 2, mf.x, mf.y, mf.radius);
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
        flashGrad.addColorStop(0.35, `rgba(255, 214, 0, ${alpha * 0.6})`);
        flashGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(mf.x, mf.y, mf.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Flying Projectile Halos
      for (const p of this.projectiles) {
        if (p.type === 'pulse') {
          const pLight = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 20);
          pLight.addColorStop(0, "rgba(255, 255, 220, 0.85)");
          pLight.addColorStop(0.4, "rgba(255, 214, 0, 0.4)");
          pLight.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = pLight;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'mortar') {
          const mLight = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 26);
          mLight.addColorStop(0, "rgba(255, 200, 100, 0.9)");
          mLight.addColorStop(0.5, "rgba(255, 100, 0, 0.35)");
          mLight.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = mLight;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Cryo Aura Light
      for (const t of this.towers) {
        if (t.type === 'cryo') {
          const cryoGrad = ctx.createRadialGradient(t.x, t.y, 4, t.x, t.y, 38);
          cryoGrad.addColorStop(0, "rgba(0, 240, 255, 0.28)");
          cryoGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = cryoGrad;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 38, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
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
      const ctx = this.ctx;
      // Frosted Glassmorphism Top Bar
      const topGrad = ctx.createLinearGradient(0, 0, 0, 60);
      topGrad.addColorStop(0, "rgba(12, 20, 36, 0.98)");
      topGrad.addColorStop(1, "rgba(6, 11, 20, 0.95)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, this.width, 60);

      // Glowing Neon Bottom Border
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 60);
      ctx.lineTo(this.width, 60);
      ctx.stroke();

      // Core Health Meter with Segmented Armor Pips
      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`⬢ ${this.t("core").toUpperCase()}: ${this.baseHp}/${this.maxBaseHp}`, 16, 22);

      const hpPct = Math.max(0, this.baseHp / this.maxBaseHp);
      const barW = 125;
      const pips = 10;
      ctx.fillStyle = "rgba(10, 18, 30, 0.9)";
      ctx.fillRect(16, 30, barW, 14);
      ctx.strokeStyle = "#37474f";
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 30, barW, 14);

      const fillPips = Math.round(hpPct * pips);
      const pipW = (barW - 4 - (pips - 1) * 2) / pips;
      for (let p = 0; p < pips; p++) {
        const px = 18 + p * (pipW + 2);
        if (p < fillPips) {
          ctx.fillStyle = hpPct > 0.4 ? "#00e5ff" : (hpPct > 0.2 ? "#ffd600" : "#ff1744");
        } else {
          ctx.fillStyle = "rgba(40, 55, 75, 0.4)";
        }
        ctx.fillRect(px, 32, pipW, 10);
      }

      // Currency / Tactical Gold
      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 16px monospace";
      ctx.fillText(`⚡ ${this.gold}G`, 155, 36);

      // Score
      ctx.fillStyle = "#90a4ae";
      ctx.font = "11px monospace";
      ctx.fillText(`PTS: ${this.score}`, 240, 36);

      // Wave Meter
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px monospace";
      const maxWStr = (this.maxWaves > 50) ? "∞" : this.maxWaves;
      ctx.fillText(`WAVE ${this.wave}/${maxWStr}`, 380, 36);

      // Start / Wave Action Cyber Button
      const isWaveActive = this.waveActive;
      const waveLabel = isWaveActive ? `⚔ JANGDA (${this.enemies.length})` : `▶ JANG [${Math.ceil(this.waveCountdown)}s]`;
      this.drawCyberButton(450, 10, 160, 40, waveLabel, isWaveActive ? "#ff1744" : "#00e676", isWaveActive ? "HOSTILES IN BOUND" : "ENGAGE WAVE", "", !isWaveActive);

      // Mode & Map Name
      ctx.fillStyle = "#78909c";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      const mapName = (this.gameMode === 'CUSTOM') ? "CUSTOM MAP" : MAPS[this.currentMapIndex].name.toUpperCase();
      ctx.fillText(`[${this.gameMode}] ${mapName}`, 675, 36);

      // Ergonomic Wide Action Cyber Buttons
      this.drawCyberButton(625, 9, 90, 42, `${this.speed}x SPEED`, this.speed > 1 ? "#ffd600" : "#00e5ff", "TEMPO", "⏩", this.speed > 1);
      this.drawCyberButton(725, 9, 125, 42, "SOZLAMALAR", "#00e5ff", "SETTINGS", "⚙️", false);
      this.drawCyberButton(860, 9, 105, 42, this.state === 'PAUSED' ? "DAVOM" : "PAUZA", this.state === 'PAUSED' ? "#ffd600" : "#00e5ff", "PAUSE", "⏸", false);
      this.drawCyberButton(975, 9, 110, 42, "← MENYU", "#ff1744", "ABORT", "🚪", false);
    }

    renderMiniButton(x, y, w, h, text, color = "#00e5ff") {
      const ctx = this.ctx;
      ctx.save();
      const cut = 5;
      ctx.beginPath();
      ctx.moveTo(x + cut, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h - cut);
      ctx.lineTo(x + w - cut, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + cut);
      ctx.closePath();

      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, "rgba(22, 35, 58, 0.95)");
      grad.addColorStop(1, "rgba(9, 15, 26, 0.98)");
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + cut, y + 1);
      ctx.lineTo(x + w - 1, y + 1);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.85)";
      ctx.shadowBlur = 3;
      ctx.fillText(text, x + w / 2, y + h / 2 + 4);
      ctx.restore();
    }

    drawCyberButton(x, y, w, h, text, color = "#00e5ff", subtext = "", icon = "", isHighlighted = false) {
      const ctx = this.ctx;
      const cut = Math.min(8, Math.floor(h * 0.22));
      ctx.save();

      // Chamfered 45-degree tactical polygon
      ctx.beginPath();
      ctx.moveTo(x + cut, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h - cut);
      ctx.lineTo(x + w - cut, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + cut);
      ctx.closePath();

      // Deep metallic titanium gradient
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      if (isHighlighted) {
        grad.addColorStop(0, "rgba(25, 48, 80, 0.98)");
        grad.addColorStop(0.5, "rgba(14, 28, 48, 0.98)");
        grad.addColorStop(1, "rgba(8, 16, 28, 0.99)");
      } else {
        grad.addColorStop(0, "rgba(18, 28, 44, 0.95)");
        grad.addColorStop(0.5, "rgba(11, 18, 29, 0.97)");
        grad.addColorStop(1, "rgba(6, 10, 18, 0.99)");
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Neon glowing border
      ctx.strokeStyle = color;
      ctx.lineWidth = isHighlighted ? 2.0 : 1.3;
      ctx.stroke();

      // Top specular highlight line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + cut + 2, y + 1);
      ctx.lineTo(x + w - 2, y + 1);
      ctx.stroke();

      // Left-side vertical status indicator strip
      ctx.fillStyle = color;
      ctx.fillRect(x, y + cut, 3.5, Math.max(2, h - cut * 2));

      // Corner L-brackets
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + w - 10, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y + h - 8);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + 10, y + h);
      ctx.stroke();

      // High-contrast typography with drop shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;

      const hasSub = !!subtext;
      const titleY = hasSub ? y + h * 0.42 : y + h * 0.5 + 4;

      ctx.fillStyle = isHighlighted ? "#ffffff" : color;
      ctx.font = "bold 13px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      const fullTitle = icon ? `${icon} ${text}` : text;
      ctx.fillText(fullTitle, x + w / 2, titleY);

      if (hasSub) {
        ctx.fillStyle = "#90a4ae";
        ctx.font = "bold 9px 'Segoe UI', monospace";
        ctx.fillText(subtext, x + w / 2, y + h * 0.78);
      }

      ctx.restore();
    }

    renderBottomBar() {
      const ctx = this.ctx;
      // Frosted Glassmorphism Panel
      const botGrad = ctx.createLinearGradient(0, 620, 0, 720);
      botGrad.addColorStop(0, "rgba(9, 15, 27, 0.98)");
      botGrad.addColorStop(1, "rgba(5, 8, 16, 0.99)");
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, 620, this.width, 100);

      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 620);
      ctx.lineTo(this.width, 620);
      ctx.stroke();

      // 1. Hero Mech Button (Far Left: x: 6, w: 46, h: 78)
      const isHeroUltReady = this.hero.currentUltCd <= 0;
      this.drawCyberButton(6, 628, 46, 78, "MECH", isHeroUltReady ? "#ffd600" : "#455a64", isHeroUltReady ? "ULT" : `${Math.ceil(this.hero.currentUltCd)}s`, "⚡", isHeroUltReady);

      // 2. 4 Commander Super Skills Panel (x: 56, 100, 144, 188; each w: 42, h: 78)
      const skillMeta = {
        emp:       { icon: "⚡", label: "EMP",  color: "#00e5ff", sub: `${this.skills.emp.cost}g` },
        orbital:   { icon: "🛰️", label: "LAZ",  color: "#ff1744", sub: `${this.skills.orbital.cost}g` },
        overclock: { icon: "⚙️", label: "ROF",  color: "#ffd600", sub: `${this.skills.overclock.cost}g` },
        drone:     { icon: "🛸", label: "DRN",  color: "#00e676", sub: "FREE" }
      };
      const skillList = ['emp', 'orbital', 'overclock', 'drone'];
      for (let i = 0; i < 4; i++) {
        const k = skillList[i];
        const s = this.skills[k];
        const meta = skillMeta[k];
        const sx = 56 + i * 44;
        const isReady = s.currentCd <= 0 && this.gold >= s.cost;
        const isAiming = (this.aimingSkill === k);
        const color = isAiming ? "#ffeb3b" : (isReady ? meta.color : "#37474f");

        this.drawCyberButton(sx, 628, 42, 78, meta.label, color, meta.sub, meta.icon, isReady || isAiming);

        // Active Aiming Highlight Ring
        if (isAiming) {
          ctx.save();
          ctx.strokeStyle = "#ffd600";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#ffd600";
          ctx.shadowBlur = 8;
          ctx.strokeRect(sx, 628, 42, 78);
          ctx.restore();
        }

        // Active Cooldown Sweep
        if (s.currentCd > 0) {
          ctx.fillStyle = "rgba(255, 23, 68, 0.70)";
          const pct = s.currentCd / s.cd;
          ctx.fillRect(sx, 628 + 78 * (1 - pct), 42, 78 * pct);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`${Math.ceil(s.currentCd)}`, sx + 21, 696);
        }
      }

      // 3. Selection vs Hotbar
      if (this.selectedTower) {
        const t = this.selectedTower;
        const def = TOWER_DEFS[t.type];
        const spec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];

        // Tower info box
        ctx.fillStyle = spec.color || def.color;
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "left";
        const titleStr = t.branch ? spec.name.toUpperCase() : `${def.name.toUpperCase()} (T${t.tier})`;
        ctx.fillText(titleStr, 235, 652);

        ctx.fillStyle = "#cfd8dc";
        ctx.font = "11px monospace";
        const stats = t.type === 'beacon' ?
          `Aura: +${(spec.dmgBuff || 0.35) * 100}% Dmg | Radius: ${spec.range}px` :
          `Dmg: ${spec.dmg} | Rate: ${spec.rate}/s | Kills: ${t.kills} | Deal: ${t.damageDealt}`;
        ctx.fillText(stats, 235, 674);

        // Branching upgrade at Tier 2
        if (t.tier === 2) {
          const bA = def.branches.A;
          const bB = def.branches.B;
          const canA = this.gold >= bA.cost;
          const canB = this.gold >= bB.cost;
          this.drawCyberButton(450, 632, 140, 72, `[A] ${bA.name}`, canA ? bA.color : "#455a64", `${bA.cost}g • ${bA.perk.toUpperCase()}`, "", canA);
          this.drawCyberButton(605, 632, 140, 72, `[B] ${bB.name}`, canB ? bB.color : "#455a64", `${bB.cost}g • ${bB.perk.toUpperCase()}`, "", canB);
        } else if (t.tier === 1) {
          const upCost = spec.upCost;
          const canUpgrade = this.gold >= upCost;
          this.drawCyberButton(480, 636, 140, 62, `[U] ${this.t("upgrade")}`, canUpgrade ? "#00e676" : "#455a64", `NARXI: ${upCost}g`, "⚡", canUpgrade);
        } else {
          this.drawCyberButton(480, 636, 140, 62, "MAX TIER 3", "#ffd600", "MAX SPECIALIZED", "★", false);
        }

        // Sell button
        const refund = Math.floor(t.totalInvested * 0.70);
        this.drawCyberButton(760, 636, 110, 62, `SOTISH`, "#ff1744", `+${refund}g QAYTADI`, "🗑", true);

        // Priority button
        this.drawCyberButton(885, 636, 115, 62, `NISHON`, "#00e5ff", t.priority.toUpperCase(), "🎯", false);

        // Close button
        this.drawCyberButton(1015, 636, 45, 62, "✕", "#90a4ae", "YOPISH", "", false);
      } else {
        // Tower Hotbar
        const towerKeys = ['pulse', 'mortar', 'cryo', 'railgun', 'beacon'];
        for (let i = 0; i < 5; i++) {
          const key = towerKeys[i];
          const def = TOWER_DEFS[key];
          const bx = 236 + i * 175;
          const isSelected = this.selectedBuildType === key;
          const canAfford = this.gold >= def.cost;
          const cardColor = isSelected ? "#00e5ff" : (canAfford ? def.color : "#455a64");

          this.drawCyberButton(bx, 628, 165, 78, `[${i + 1}] ${def.name.split(' ')[0]}`, cardColor, `${def.cost}g • ${def.type.toUpperCase()}`, isSelected ? "▶" : "⬢", isSelected);
        }

        // [6] Tactical Barricade Deploy Button
        const barX = 1115;
        const isBarSelected = this.selectedBuildType === 'barricade';
        const canBar = this.gold >= 40;
        this.drawCyberButton(barX, 628, 155, 78, "[6] 🚧 TO'SIQ", isBarSelected ? "#ff9100" : (canBar ? "#ffd600" : "#455a64"), "40g • MUSTAHKAM DEVOR", "", isBarSelected);
      }
    }

    renderDraftModal() {
      const ctx = this.ctx;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, "rgba(4, 7, 14, 0.97)");
      bgGrad.addColorStop(1, "rgba(8, 14, 25, 0.98)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.shadowColor = "rgba(255, 214, 0, 0.7)";
      ctx.shadowBlur = 15;
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffd600";
      ctx.font = "900 34px 'Segoe UI', monospace";
      ctx.fillText(this.t("draftTitle"), 640, 110);
      ctx.restore();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(this.t("draftSub"), 640, 148);

      for (let i = 0; i < this.draftCards.length; i++) {
        const c = this.draftCards[i];
        const x = 180 + i * 320;
        const y = 195;
        const w = 280;
        const h = 330;
        const cut = 10;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + cut, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h - cut);
        ctx.lineTo(x + w - cut, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + cut);
        ctx.closePath();

        const cardGrad = ctx.createLinearGradient(x, y, x, y + h);
        cardGrad.addColorStop(0, "rgba(16, 26, 46, 0.98)");
        cardGrad.addColorStop(1, "rgba(8, 14, 25, 0.99)");
        ctx.fillStyle = cardGrad;
        ctx.fill();

        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = c.color;
        ctx.fillRect(x, y + cut, 4, 35);

        ctx.font = "42px monospace";
        ctx.textAlign = "center";
        ctx.fillText(c.icon, x + w / 2, y + 62);

        ctx.fillStyle = c.color;
        ctx.font = "bold 16px 'Segoe UI', monospace";
        ctx.fillText(c.title, x + w / 2, y + 112);

        ctx.fillStyle = "#b0bec5";
        ctx.font = "12px 'Segoe UI', monospace";
        this.wrapText(c.desc, x + 20, y + 155, 240, 18);

        this.drawCyberButton(x + 20, y + 255, 240, 48, "PERKNI TANLASH", c.color, c.title.toUpperCase(), "⚡", true);
        ctx.restore();
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
      const ctx = this.ctx;
      const time = performance.now() * 0.002;

      // Deep Space / Battlefield animated backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, "#050811");
      bgGrad.addColorStop(0.5, "#080e1d");
      bgGrad.addColorStop(1, "#04060c");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Subtle cyber grid lines in menu backdrop
      ctx.strokeStyle = "rgba(0, 229, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 64) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
      }
      for (let y = 0; y <= this.height; y += 64) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // 1. Neon Glowing Main Title with Pulse
      ctx.save();
      const glowAmt = 12 + Math.sin(time * 2) * 5;
      ctx.shadowColor = "rgba(0, 229, 255, 0.85)";
      ctx.shadowBlur = glowAmt;
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 46px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText(this.t("title"), 640, 135);
      ctx.restore();

      // 2. Subtitle with Cyber Accents
      ctx.fillStyle = "#ff007f";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚡ CYBER-NEON TACTICAL BATTLEFIELD (v3.8.0) ⚡", 640, 172);

      // 3. Commander Tactical Pill / Badge
      ctx.save();
      ctx.fillStyle = "rgba(14, 25, 42, 0.9)";
      ctx.fillRect(400, 195, 480, 26);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(400, 195, 480, 26);
      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`COMMANDER: ${this.playerName}  |  MECH HERO: ONLINE  |  STANDALONE APK`, 640, 212);
      ctx.restore();

      // Language Switcher (Top Right)
      this.renderMiniButton(1140, 20, 100, 36, `LANG: ${this.lang.toUpperCase()}`, "#ffd600");

      // Ergonomic Main Menu Grid
      this.drawCyberButton(440, 260, 400, 46, "3D TPS ARENA REJIMI", "#ff007f", "DIRECT 3D OVER-THE-SHOULDER COMBAT", "🎮", true);
      this.drawCyberButton(440, 314, 400, 46, this.t("campaign"), "#00e5ff", "10 PROGRESSIVE TACTICAL GRID SECTORS", "🚀", true);
      this.drawCyberButton(440, 368, 400, 44, this.t("sectorSelect"), "#00e5ff", "MISSION ARCHIVE & REPLAY ZONES", "🗺", false);
      this.drawCyberButton(440, 420, 400, 44, this.t("endless"), "#e040fb", "INFINITE HIGH-SPEED WAVE SURVIVAL", "⚡", false);

      this.drawCyberButton(440, 472, 190, 42, this.t("bossRush"), "#ff1744", "ELITE TITANS", "💀", false);
      this.drawCyberButton(650, 472, 190, 42, this.t("mapEditor"), "#00e676", "GRID CREATOR", "🛠", false);

      this.drawCyberButton(440, 522, 190, 42, this.t("leaderboard"), "#ffd600", "GLOBAL AGENTS", "🏆", false);
      this.drawCyberButton(650, 522, 190, 42, this.t("fieldManual"), "#00e5ff", "TOWER SPECS", "📖", false);

      this.drawCyberButton(440, 572, 190, 44, "⚙️ SOZLAMALAR", "#00e5ff", "SETTINGS & AUDIO", "⚙️", true);
      this.drawCyberButton(650, 572, 190, 44, "📲 ANDROID APK", "#00e676", "OFFLINE STANDALONE", "📲", true);

      this.drawCyberButton(440, 624, 400, 42, this.t("downloadOffline"), "#ffd600", "COMPLETE ASSET ZIP BUNDLE", "📦", false);
    }

    renderMenuButton(x, y, w, h, text, bg, fg, border) {
      const color = border || fg || "#00e5ff";
      const isHigh = (border === "#ffd600" || bg === "#00e5ff" || bg === "#ff007f" || border === "#00e676");
      this.drawCyberButton(x, y, w, h, text, color, "", "", isHigh);
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
      const ctx = this.ctx;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, "#050811");
      bgGrad.addColorStop(1, "#03050a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.textAlign = "left";
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 26px 'Segoe UI', monospace";
      ctx.fillText(this.t("sectorSelect"), 170, 48);

      this.renderMiniButton(40, 20, 110, 36, "← MENYU", "#ff1744");

      for (let i = 0; i < MAPS.length; i++) {
        const m = MAPS[i];
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 40 + col * 242;
        const y = 75 + row * 245;
        const starsEarned = this.saveData.stars[m.id] || 0;
        const isCompleted = starsEarned > 0;

        ctx.save();
        const cut = 8;
        ctx.beginPath();
        ctx.moveTo(x + cut, y);
        ctx.lineTo(x + 230, y);
        ctx.lineTo(x + 230, y + 230 - cut);
        ctx.lineTo(x + 230 - cut, y + 230);
        ctx.lineTo(x, y + 230);
        ctx.lineTo(x, y + cut);
        ctx.closePath();

        const cardGrad = ctx.createLinearGradient(x, y, x, y + 230);
        cardGrad.addColorStop(0, "rgba(16, 26, 44, 0.96)");
        cardGrad.addColorStop(1, "rgba(8, 14, 24, 0.98)");
        ctx.fillStyle = cardGrad;
        ctx.fill();

        ctx.strokeStyle = isCompleted ? "#00e676" : "#00e5ff";
        ctx.lineWidth = 1.3;
        ctx.stroke();

        ctx.fillStyle = isCompleted ? "#00e676" : "#00e5ff";
        ctx.fillRect(x, y + cut, 4, 30);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Segoe UI', monospace";
        ctx.textAlign = "left";
        ctx.fillText(`0${i + 1}. ${m.name.toUpperCase()}`, x + 14, y + 24);

        ctx.fillStyle = "#90a4ae";
        ctx.font = "11px 'Segoe UI', monospace";
        this.wrapText(m.desc, x + 14, y + 48, 202, 16);

        ctx.fillStyle = "#ffd600";
        ctx.font = "bold 12px monospace";
        const starStr = "★".repeat(starsEarned) + "☆".repeat(3 - starsEarned);
        ctx.fillText(`${starStr} (${starsEarned}/3)`, x + 14, y + 140);

        ctx.fillStyle = "#00e5ff";
        ctx.font = "11px monospace";
        const biomeTag = (m.biome === 'lava') ? "🌋 LAVA" : (m.biome === 'cryo' ? "❄️ CRYO" : "⚡ CYBER");
        const biomeColor = (m.biome === 'lava') ? "#ff5722" : (m.biome === 'cryo' ? "#80deea" : "#00e5ff");
        ctx.fillText(`WAVES: ${m.wave_count}`, x + 14, y + 160);
        ctx.fillStyle = biomeColor;
        ctx.fillText(biomeTag, x + 105, y + 160);

        this.drawCyberButton(x + 12, y + 176, 206, 42, "JANGGA KIRISH", isCompleted ? "#00e676" : "#00e5ff", `SECTOR 0${i + 1}`, "▶", true);

        ctx.restore();
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
      const ctx = this.ctx;
      ctx.fillStyle = "rgba(4, 7, 14, 0.92)";
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.shadowColor = "rgba(0, 229, 255, 0.7)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 42px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("TAKTIK PAUZA", 640, 270);
      ctx.restore();

      ctx.fillStyle = "#b0bec5";
      ctx.font = "14px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("Jang to'xtatildi. Qaytish yoki menyuga chiqish uchun tugmani bosing:", 640, 320);

      this.drawCyberButton(440, 340, 400, 50, "DAVOM ETISH", "#00e676", "RESUME COMBAT", "▶", true);
      this.drawCyberButton(440, 405, 400, 50, "SOZLAMALAR", "#00e5ff", "AUDIO & SCREEN SETTINGS", "⚙️", false);
      this.drawCyberButton(440, 470, 400, 50, "ASOSIY MENYUGA QAYTISH", "#ff1744", "ABORT MISSION", "←", false);
    }

    renderVictoryModal() {
      const ctx = this.ctx;
      ctx.fillStyle = "rgba(4, 7, 14, 0.94)";
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.shadowColor = "rgba(0, 230, 118, 0.8)";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#00e676";
      ctx.font = "900 46px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("🏆 G'ALABA! SEKTOR HIMOYALANDI", 640, 210);
      ctx.restore();

      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 22px monospace";
      ctx.textAlign = "center";
      ctx.fillText(this.t("missionSuccess"), 640, 265);

      ctx.fillStyle = "rgba(18, 30, 50, 0.9)";
      ctx.fillRect(360, 295, 560, 42);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.strokeRect(360, 295, 560, 42);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`TAKTIK BALL: ${this.score} PTS  |  MVP MINORA: ${this.analytics.mvpName.toUpperCase()}`, 640, 322);

      this.drawCyberButton(340, 410, 180, 52, this.t("playAgain"), "#00e676", "RETRY SECTOR", "▶", true);
      this.drawCyberButton(550, 410, 180, 52, "STATISTIKA", "#ffd600", "BATTLE REPORT", "📊", false);
      this.drawCyberButton(760, 410, 180, 52, this.t("mainMenu"), "#00e5ff", "COMMAND HQ", "←", false);

      this.drawCyberButton(340, 475, 600, 50, "♾️ CHEKSIZ REJIMDA DAVOM ETISH", "#e040fb", "KEEP TOWERS & FACE INFINITE HORDE", "⚡", true);
    }

    renderDefeatModal() {
      const ctx = this.ctx;
      ctx.fillStyle = "rgba(4, 7, 14, 0.94)";
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      const isEndless = (this.gameMode === 'ENDLESS');
      ctx.shadowColor = isEndless ? "rgba(224, 64, 251, 0.85)" : "rgba(255, 23, 68, 0.85)";
      ctx.shadowBlur = 24;
      ctx.fillStyle = isEndless ? "#e040fb" : "#ff1744";
      ctx.font = "900 44px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText(isEndless ? "♾️ CHEKSIZ REJIM YAKUNLANDI" : "💀 SEKTOR VAYRON BO'LDI", 640, 210);
      ctx.restore();

      ctx.fillStyle = "#b0bec5";
      ctx.font = "bold 17px monospace";
      ctx.textAlign = "center";
      const record = localStorage.getItem('lg_endless_wave') || this.wave;
      const descStr = isEndless
        ? `Erishilgan to'lqin: Wave ${this.wave}  |  Shaxsiy rekord: Wave ${record}  |  Ball: ${this.score} PTS`
        : `Dushmanlar ${this.wave}-to'lqinda bazani yorib o'tdi. To'plangan ball: ${this.score} PTS`;
      ctx.fillText(descStr, 640, 270);

      this.drawCyberButton(340, 410, 180, 52, this.t("retry"), isEndless ? "#e040fb" : "#ff1744", "RESTART", "🔄", true);
      this.drawCyberButton(550, 410, 180, 52, "STATISTIKA", "#ffd600", "BATTLE REPORT", "📊", false);
      this.drawCyberButton(760, 410, 180, 52, this.t("mainMenu"), "#00e5ff", "COMMAND HQ", "←", false);
    }

    // =========================================================================
    // --- 3D THIRD-PERSON SHOOTER & BASE DEFENSE ARENA ENGINE (v3.4 3D) ---
    // =========================================================================

    start3DTPSMode() {
      this.state = 'TPS_3D';
      audio.victory();
      this.tps3D = {
        player: {
          x: 0, y: 0, z: 12,
          yaw: 0,
          pitch: 0.08,
          speed: 14.0,
          isAiming: false,
          health: 100, maxHealth: 100,
          ammo: 30, maxAmmo: 30, reserveAmmo: 120,
          isReloading: false, reloadTimer: 0,
          fireCd: 0,
          walkAnim: 0,
          recoil: 0,
          hasRedDot: true,
          hasLaser: true
        },
        core: { x: 0, y: 0, z: -35, health: 500, maxHealth: 500, radius: 4 },
        enemies: [],
        towers: [],
        bullets: [],
        particles: [],
        score: 0,
        wave: 1,
        waveTimer: 4.0,
        waveActive: false,
        spawnQueue: 0,
        spawnInterval: 0,
        isBuilding: false,
        keys: { w: false, a: false, s: false, d: false, shift: false },
        touch: {
          moveId: null,
          moveStart: { x: 0, y: 0 },
          moveVec: { x: 0, y: 0 },
          lookId: null,
          lookLast: { x: 0, y: 0 }
        }
      };
      this.addFloatingText("3D TPS ARENA: WELCOME COMMANDER!", 640, 180, "#00e5ff", 24);
      this.startWave3DTPS();
    }

    startWave3DTPS() {
      const t = this.tps3D;
      t.waveActive = true;
      t.spawnQueue = 6 + t.wave * 4;
      t.spawnInterval = 1.0;
      this.addFloatingText(`WAVE ${t.wave} INCOMING!`, 640, 220, "#ff1744", 26);
    }

    update3DTPS(dt) {
      const t = this.tps3D;
      const p = t.player;

      // 1. Player Movement along Camera Yaw
      let moveX = 0;
      let moveZ = 0;
      if (t.keys.w) moveZ -= 1;
      if (t.keys.s) moveZ += 1;
      if (t.keys.a) moveX -= 1;
      if (t.keys.d) moveX += 1;

      // Mobile Touch Joystick Input
      if (t.touch.moveId !== null) {
        moveX += t.touch.moveVec.x;
        moveZ += t.touch.moveVec.y;
      }

      const inputLen = Math.hypot(moveX, moveZ);
      if (inputLen > 0.05) {
        const normX = moveX / inputLen;
        const normZ = moveZ / inputLen;
        const effSpeed = p.speed * (t.keys.shift ? 1.5 : 1.0) * (p.isAiming ? 0.6 : 1.0);

        // Transform movement relative to camera yaw
        const worldMoveX = Math.cos(p.yaw) * normX + Math.sin(p.yaw) * normZ;
        const worldMoveZ = -Math.sin(p.yaw) * normX + Math.cos(p.yaw) * normZ;

        p.x += worldMoveX * effSpeed * dt;
        p.z += worldMoveZ * effSpeed * dt;
        p.walkAnim += dt * (t.keys.shift ? 14 : 9);

        // Clamp to 500x500m arena boundaries
        p.x = Math.max(-55, Math.min(55, p.x));
        p.z = Math.max(-65, Math.min(45, p.z));
      } else {
        p.walkAnim = 0;
      }

      // Gun Fire Cooldown & Recoil Decay
      if (p.fireCd > 0) p.fireCd = Math.max(0, p.fireCd - dt);
      if (p.recoil > 0) p.recoil = Math.max(0, p.recoil - dt * 10);

      // Reloading
      if (p.isReloading) {
        p.reloadTimer -= dt;
        if (p.reloadTimer <= 0) {
          const needed = p.maxAmmo - p.ammo;
          const load = Math.min(needed, p.reserveAmmo);
          p.ammo += load;
          p.reserveAmmo -= load;
          p.isReloading = false;
          audio.upgrade();
        }
      }

      // 2. Wave Spawning
      if (t.waveActive) {
        t.spawnInterval -= dt;
        if (t.spawnInterval <= 0 && t.spawnQueue > 0) {
          t.spawnQueue--;
          t.spawnInterval = 1.2;
          const ang = Math.random() * Math.PI - Math.PI / 2;
          const dist = 75;
          const ex = Math.sin(ang) * dist;
          const ez = -35 - Math.cos(ang) * (dist * 0.7);
          const eType = Math.random() < 0.25 ? 'brute' : (Math.random() < 0.4 ? 'sprinter' : 'grunt');
          t.enemies.push({
            type: eType,
            x: ex, y: 0, z: ez,
            hp: eType === 'brute' ? 350 : (eType === 'sprinter' ? 60 : 120),
            maxHp: eType === 'brute' ? 350 : (eType === 'sprinter' ? 60 : 120),
            speed: eType === 'sprinter' ? 12 : (eType === 'brute' ? 4.5 : 7.0),
            size: eType === 'brute' ? 1.8 : 1.1,
            color: eType === 'brute' ? '#ffd600' : (eType === 'sprinter' ? '#ff9100' : '#ff1744'),
            atkCd: 0
          });
        }
        if (t.spawnQueue <= 0 && t.enemies.length === 0) {
          t.waveActive = false;
          t.wave++;
          t.waveTimer = 6.0;
          this.addFloatingText(`WAVE COMPLETE! +${t.wave * 100} PTS`, 640, 220, "#00e676", 24);
        }
      } else {
        t.waveTimer -= dt;
        if (t.waveTimer <= 0) this.startWave3DTPS();
      }

      // 3. Enemies Update
      for (let i = t.enemies.length - 1; i >= 0; i--) {
        const e = t.enemies[i];
        const distToPlayer = Math.hypot(p.x - e.x, p.z - e.z);
        let targetX = t.core.x;
        let targetZ = t.core.z;

        if (distToPlayer < 14) {
          targetX = p.x;
          targetZ = p.z;
        }

        const angleToTarget = Math.atan2(targetX - e.x, targetZ - e.z);
        e.x += Math.sin(angleToTarget) * e.speed * dt;
        e.z += Math.cos(angleToTarget) * e.speed * dt;

        // Attack core
        if (Math.hypot(e.x - t.core.x, e.z - t.core.z) < 4.5) {
          e.atkCd = (e.atkCd || 0) - dt;
          if (e.atkCd <= 0) {
            e.atkCd = 1.0;
            t.core.health = Math.max(0, t.core.health - 25);
            this.screenShake = 4;
            audio.leak();
          }
        }
        // Attack player
        if (distToPlayer < 2.2) {
          e.atkCd = (e.atkCd || 0) - dt;
          if (e.atkCd <= 0) {
            e.atkCd = 1.2;
            p.health = Math.max(0, p.health - 15);
            this.screenShake = 6;
            this.vibrate([60, 40, 60]);
            audio.leak();
          }
        }
      }

      // 4. Towers Update
      for (const tw of t.towers) {
        tw.fireCd = (tw.fireCd || 0) - dt;
        let nearest = null;
        let minDist = 30;
        for (const e of t.enemies) {
          const d = Math.hypot(e.x - tw.x, e.z - tw.z);
          if (d < minDist) { minDist = d; nearest = e; }
        }
        if (nearest) {
          tw.angle = Math.atan2(nearest.x - tw.x, nearest.z - tw.z);
          if (tw.fireCd <= 0) {
            tw.fireCd = 0.2;
            nearest.hp -= 20;
            audio.shootPulse();
            t.particles.push({
              x: nearest.x, y: 1.0, z: nearest.z,
              life: 0.25, maxLife: 0.25, color: "#ffd600"
            });
            if (nearest.hp <= 0) {
              const idx = t.enemies.indexOf(nearest);
              if (idx !== -1) t.enemies.splice(idx, 1);
              t.score += 80;
            }
          }
        }
      }

      // 5. Bullets Update
      for (let i = t.bullets.length - 1; i >= 0; i--) {
        const b = t.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.z += b.vz * dt;
        b.life -= dt;

        for (let j = t.enemies.length - 1; j >= 0; j--) {
          const e = t.enemies[j];
          if (Math.hypot(b.x - e.x, b.z - e.z) < e.size && Math.abs(b.y - 1.0) < 1.5) {
            // Valorant Ballistics: Distance Falloff
            const distFromPlayer = Math.hypot(b.x - t.player.x, b.z - t.player.z);
            let falloff = 1.0;
            if (distFromPlayer > 30) falloff = 0.70;
            else if (distFromPlayer > 15) falloff = 0.85;

            // Headshot Detection (upper body / head hit)
            const isHeadshot = (b.y > 1.3);
            const critMult = isHeadshot ? 2.2 : 1.0;
            const finalDmg = Math.round(b.damage * falloff * critMult);

            e.hp -= finalDmg;
            b.life = 0;
            this.screenShake = isHeadshot ? 5 : 2;
            const pColor = isHeadshot ? "#ffd600" : "#ff1744";
            t.particles.push({ x: e.x, y: 1.2, z: e.z, life: 0.3, maxLife: 0.3, color: pColor });
            if (isHeadshot) {
              this.addFloatingText("CRIT 2.2x!", 640, 300, "#ffd600", 22);
            }
            if (e.hp <= 0) {
              t.enemies.splice(j, 1);
              t.score += isHeadshot ? 200 : 100;
              audio.hit();
            }
            break;
          }
        }
        if (b.life <= 0) t.bullets.splice(i, 1);
      }

      // 6. Particles Update
      for (let i = t.particles.length - 1; i >= 0; i--) {
        const pt = t.particles[i];
        pt.life -= dt;
        if (pt.life <= 0) t.particles.splice(i, 1);
      }
    }

    shoot3DTPS() {
      const t = this.tps3D;
      const p = t.player;
      if (p.isReloading || p.fireCd > 0) return;
      if (p.ammo <= 0) { this.reload3DTPS(); return; }

      p.ammo--;
      p.fireCd = 0.12;
      p.recoil = 1.0;
      audio.shootPulse();
      this.screenShake = 2;

      const speed = 120;
      const spread = p.hasRedDot ? 0.02 : 0.05;
      const yawSpread = (Math.random() * 2 - 1) * spread;
      const pitchSpread = (Math.random() * 2 - 1) * spread;

      const aimYaw = p.yaw + yawSpread;
      const aimPitch = p.pitch + pitchSpread;

      t.bullets.push({
        x: p.x + Math.sin(p.yaw) * 0.8,
        y: 1.4,
        z: p.z - Math.cos(p.yaw) * 0.8,
        vx: Math.sin(aimYaw) * speed,
        vy: -Math.sin(aimPitch) * speed,
        vz: -Math.cos(aimYaw) * speed,
        damage: 45,
        life: 0.8
      });
    }

    reload3DTPS() {
      const p = this.tps3D.player;
      if (p.isReloading || p.ammo === p.maxAmmo || p.reserveAmmo <= 0) return;
      p.isReloading = true;
      p.reloadTimer = 1.8;
      audio.sell();
    }

    place3DTower() {
      const t = this.tps3D;
      const p = t.player;
      const tx = p.x + Math.sin(p.yaw) * 4.5;
      const tz = p.z - Math.cos(p.yaw) * 4.5;
      t.towers.push({ x: tx, y: 0, z: tz, angle: 0, fireCd: 0 });
      t.isBuilding = false;
      audio.upgrade();
      this.addFloatingText("3D GATLING TURRET DEPLOYED!", 640, 240, "#00e5ff", 22);
    }

    project3DPoint(wx, wy, wz, camX, camY, camZ, yaw, pitch, fov = 460) {
      const dx = wx - camX;
      const dy = wy - camY;
      const dz = wz - camZ;

      const cosY = Math.cos(-yaw);
      const sinY = Math.sin(-yaw);
      const x1 = dx * cosY - dz * sinY;
      const z1 = dx * sinY + dz * cosY;

      const cosP = Math.cos(-pitch);
      const sinP = Math.sin(-pitch);
      const y2 = dy * cosP - z1 * sinP;
      const z2 = dy * sinP + z1 * cosP;

      if (z2 <= 0.4) return null;

      const scale = fov / z2;
      return {
        x: 640 + x1 * scale,
        y: 360 - y2 * scale,
        z: z2,
        scale: scale
      };
    }

    render3DTPS() {
      const ctx = this.ctx;
      const t = this.tps3D;
      const p = t.player;

      // 1. Cyber Skybox & Atmosphere
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 720);
      skyGrad.addColorStop(0, "#030712");
      skyGrad.addColorStop(0.5, "#0b1329");
      skyGrad.addColorStop(1, "#111827");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      const camDist = p.isAiming ? 2.0 : 3.8;
      const shoulderX = p.isAiming ? 0.35 : 0.75;
      const camX = p.x - Math.sin(p.yaw) * camDist + Math.cos(p.yaw) * shoulderX;
      const camZ = p.z + Math.cos(p.yaw) * camDist + Math.sin(p.yaw) * shoulderX;
      const camY = 1.9 + Math.sin(p.pitch) * camDist;

      // 2. 3D Perspective Ground Grid
      ctx.lineWidth = 1;
      for (let x = -50; x <= 50; x += 10) {
        const p1 = this.project3DPoint(x, 0, -80, camX, camY, camZ, p.yaw, p.pitch);
        const p2 = this.project3DPoint(x, 0, 40, camX, camY, camZ, p.yaw, p.pitch);
        if (p1 && p2) {
          ctx.strokeStyle = (x === 0) ? "rgba(0, 229, 255, 0.4)" : "rgba(0, 229, 255, 0.12)";
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      for (let z = -80; z <= 40; z += 10) {
        const p1 = this.project3DPoint(-50, 0, z, camX, camY, camZ, p.yaw, p.pitch);
        const p2 = this.project3DPoint(50, 0, z, camX, camY, camZ, p.yaw, p.pitch);
        if (p1 && p2) {
          ctx.strokeStyle = (z === -35) ? "rgba(255, 23, 68, 0.5)" : "rgba(0, 229, 255, 0.12)";
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 3. Central Base Core in 3D
      const coreProj = this.project3DPoint(t.core.x, 0, t.core.z, camX, camY, camZ, p.yaw, p.pitch);
      if (coreProj) {
        const cr = 4.0 * coreProj.scale;
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.ellipse(coreProj.x, coreProj.y, cr * 1.4, cr * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0c1527";
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const px = coreProj.x + Math.cos(a) * cr;
          const py = coreProj.y + Math.sin(a) * cr * 0.6;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const orbY = coreProj.y - 2.5 * coreProj.scale;
        const orbGrad = ctx.createRadialGradient(coreProj.x, orbY, 2, coreProj.x, orbY, cr * 0.6);
        orbGrad.addColorStop(0, "#ffffff");
        orbGrad.addColorStop(0.5, "#00e5ff");
        orbGrad.addColorStop(1, "rgba(0, 110, 255, 0)");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(coreProj.x, orbY, cr * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#00e5ff";
        ctx.font = `bold ${Math.max(10, Math.round(12 * coreProj.scale / 20))}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`BASE CORE [${t.core.health}/${t.core.maxHealth}]`, coreProj.x, orbY - cr * 0.7);
      }

      // 4. 3D Defense Towers
      for (const tw of t.towers) {
        const tp = this.project3DPoint(tw.x, 0, tw.z, camX, camY, camZ, p.yaw, p.pitch);
        if (tp) {
          const sz = 2.0 * tp.scale;
          ctx.fillStyle = "#1e293b";
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 1.5;
          ctx.fillRect(tp.x - sz / 2, tp.y - sz, sz, sz);
          ctx.strokeRect(tp.x - sz / 2, tp.y - sz, sz, sz);
          ctx.fillStyle = "#ffd600";
          ctx.beginPath();
          ctx.arc(tp.x, tp.y - sz * 1.1, sz * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. 3D Enemies (Sorted back to front)
      const renderList = [];
      for (const e of t.enemies) {
        const ep = this.project3DPoint(e.x, 0, e.z, camX, camY, camZ, p.yaw, p.pitch);
        if (ep) renderList.push({ type: 'enemy', e: e, proj: ep, z: ep.z });
      }
      renderList.sort((a, b) => b.z - a.z);

      for (const item of renderList) {
        const e = item.e;
        const ep = item.proj;
        const eh = e.size * 1.8 * ep.scale;
        const ew = e.size * 0.9 * ep.scale;

        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.beginPath();
        ctx.ellipse(ep.x, ep.y, ew * 0.9, ew * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        const eGrad = ctx.createLinearGradient(ep.x - ew / 2, ep.y - eh, ep.x + ew / 2, ep.y);
        eGrad.addColorStop(0, "#475569");
        eGrad.addColorStop(0.5, e.color);
        eGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = eGrad;
        ctx.beginPath();
        ctx.roundRect(ep.x - ew / 2, ep.y - eh, ew, eh, [ew * 0.3]);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#ff1744";
        ctx.fillRect(ep.x - ew * 0.35, ep.y - eh * 0.85, ew * 0.7, eh * 0.15);

        const barW = Math.max(24, ew * 1.4);
        ctx.fillStyle = "#090d16";
        ctx.fillRect(ep.x - barW / 2, ep.y - eh - 8, barW, 4);
        ctx.fillStyle = e.color;
        ctx.fillRect(ep.x - barW / 2, ep.y - eh - 8, barW * (e.hp / e.maxHp), 4);
      }

      // 6. 3D Bullets
      for (const b of t.bullets) {
        const bp = this.project3DPoint(b.x, b.y, b.z, camX, camY, camZ, p.yaw, p.pitch);
        if (bp) {
          ctx.fillStyle = "#ffd600";
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, Math.max(2, 2.5 * bp.scale / 20), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. 3D Player Mech (Over-The-Shoulder TPS Character)
      const pp = this.project3DPoint(p.x, 0, p.z, camX, camY, camZ, p.yaw, p.pitch);
      if (pp) {
        const pw = 1.3 * pp.scale;
        const ph = 2.4 * pp.scale;

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.beginPath();
        ctx.ellipse(pp.x, pp.y, pw * 0.8, pw * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        const mechGrad = ctx.createLinearGradient(pp.x - pw / 2, pp.y - ph, pp.x + pw / 2, pp.y);
        mechGrad.addColorStop(0, "#334155");
        mechGrad.addColorStop(0.5, "#1e293b");
        mechGrad.addColorStop(1, "#090d16");
        ctx.fillStyle = mechGrad;
        ctx.beginPath();
        ctx.roundRect(pp.x - pw * 0.4, pp.y - ph * 0.9, pw * 0.8, ph * 0.65, [pw * 0.2]);
        ctx.fill();
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(pp.x, pp.y - ph * 0.6, pw * 0.16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#090d16";
        ctx.beginPath();
        ctx.arc(pp.x, pp.y - ph * 0.95, pw * 0.26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(pp.x - pw * 0.2, pp.y - ph * 0.98, pw * 0.4, ph * 0.1);

        const recoilOffset = p.recoil * 10;
        const gunX = pp.x + pw * 0.45;
        const gunY = pp.y - ph * 0.55 + recoilOffset;
        ctx.fillStyle = "#475569";
        ctx.fillRect(gunX - 4, gunY - 3, 24, 7);
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(gunX + 16, gunY - 2, 8, 3);

        if (p.hasLaser && !p.isAiming) {
          ctx.strokeStyle = "rgba(0, 229, 255, 0.45)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(gunX + 24, gunY);
          ctx.lineTo(640, 360);
          ctx.stroke();
        }
      }

      // 8. 3D Building Ghost
      if (t.isBuilding) {
        const buildX = p.x + Math.sin(p.yaw) * 5.0;
        const buildZ = p.z - Math.cos(p.yaw) * 5.0;
        const bp = this.project3DPoint(buildX, 0, buildZ, camX, camY, camZ, p.yaw, p.pitch);
        if (bp) {
          const bs = 3.0 * bp.scale;
          ctx.strokeStyle = "#00e676";
          ctx.fillStyle = "rgba(0, 230, 118, 0.25)";
          ctx.lineWidth = 2;
          ctx.strokeRect(bp.x - bs / 2, bp.y - bs / 2, bs, bs);
          ctx.fillRect(bp.x - bs / 2, bp.y - bs / 2, bs, bs);
          ctx.fillStyle = "#00e676";
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.fillText("TAP [FIRE] TO DEPLOY TURRET", bp.x, bp.y - bs / 2 - 8);
        }
      }

      // 9. Precision Crosshair (Center Screen)
      const cx = 640;
      const cy = 360;
      if (p.isAiming) {
        ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#ff1744";
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2;
        const gap = 8 + p.recoil * 14;
        const len = 12;
        ctx.beginPath();
        ctx.moveTo(cx - gap - len, cy); ctx.lineTo(cx - gap, cy);
        ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + gap + len, cy);
        ctx.moveTo(cx, cy - gap - len); ctx.lineTo(cx, cy - gap);
        ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + gap + len);
        ctx.stroke();
      }

      // 10. Tactical 3D HUD & Controls
      this.renderMiniButton(30, 20, 110, 36, "← MENYU");

      ctx.fillStyle = "#0c1527";
      ctx.fillRect(160, 18, 960, 40);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(160, 18, 960, 40);

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`WAVE: ${t.wave}`, 180, 43);
      ctx.fillText(`SCORE: ${t.score}`, 320, 43);

      ctx.fillStyle = "#cfd8dc";
      ctx.fillText(`BASE CORE:`, 480, 43);
      ctx.fillStyle = "#090d16";
      ctx.fillRect(590, 28, 200, 18);
      ctx.fillStyle = t.core.health > 150 ? "#00e676" : "#ff1744";
      ctx.fillRect(590, 28, 200 * (t.core.health / t.core.maxHealth), 18);
      ctx.strokeStyle = "#ffffff";
      ctx.strokeRect(590, 28, 200, 18);

      ctx.fillStyle = "#0c1527";
      ctx.fillRect(30, 640, 240, 60);
      ctx.strokeStyle = "#00e5ff";
      ctx.strokeRect(30, 640, 240, 60);

      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`AMMO: ${p.ammo} / ${p.reserveAmmo}`, 45, 675);
      if (p.isReloading) {
        ctx.fillStyle = "#ff1744";
        ctx.font = "bold 12px monospace";
        ctx.fillText("RELOADING...", 175, 675);
      }

      // Mobile Touch Action Buttons (Right side)
      ctx.fillStyle = "rgba(255, 23, 68, 0.75)";
      ctx.beginPath();
      ctx.arc(1200, 620, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.fillText("💥 OTISH", 1200, 626);

      ctx.fillStyle = p.isAiming ? "rgba(0, 229, 255, 0.85)" : "rgba(15, 23, 42, 0.75)";
      ctx.beginPath();
      ctx.arc(1080, 640, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = p.isAiming ? "#000" : "#fff";
      ctx.font = "bold 12px monospace";
      ctx.fillText("🎯 DURBIN", 1080, 645);

      ctx.fillStyle = t.isBuilding ? "rgba(0, 230, 118, 0.85)" : "rgba(15, 23, 42, 0.75)";
      ctx.beginPath();
      ctx.arc(1200, 500, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#00e676";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = t.isBuilding ? "#000" : "#fff";
      ctx.font = "bold 12px monospace";
      ctx.fillText("🏗️ QURISH", 1200, 505);

      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.beginPath();
      ctx.arc(1080, 540, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffd600";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 11px monospace";
      ctx.fillText("🔄 O'Q", 1080, 544);

      if (t.touch.moveId !== null) {
        ctx.fillStyle = "rgba(0, 229, 255, 0.2)";
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(t.touch.moveStart.x, t.touch.moveStart.y, 65, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffd600";
        ctx.beginPath();
        ctx.arc(t.touch.moveStart.x + t.touch.moveVec.x * 55, t.touch.moveStart.y + t.touch.moveVec.y * 55, 24, 0, Math.PI * 2);
        ctx.fill();
      }
    }

  }

  window.addEventListener('DOMContentLoaded', () => {
    window.lastGridEngine = new LastGridEngine();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  });

})();
