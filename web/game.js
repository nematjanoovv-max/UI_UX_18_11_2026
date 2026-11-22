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
      fieldManual: "ENCYCLOPEDIA",
      downloadOffline: "OFFLINE ZIP (19MB)",
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
      fieldManual: "ENSIKLOPEDIYA",
      downloadOffline: "OFLAYN ZIP (19MB)",
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
      fieldManual: "СПРАВОЧНИК",
      downloadOffline: "ОФЛАЙН ZIP (19MB)",
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
        click: 'assets/audio/sfx/click.wav',
        laser: 'assets/audio/sfx/laser.wav',
        explosion: 'assets/audio/sfx/explosion.wav',
        zap: 'assets/audio/sfx/zap.wav',
        wave_clear: 'assets/audio/sfx/wave_clear.wav',
        cannon: 'assets/audio/sfx/cannon.wav',
        modal: 'assets/audio/sfx/modal.wav',
        build: 'assets/audio/sfx/build.wav',
        stomp: 'assets/audio/sfx/titan_stomp.wav',
        siren: 'assets/audio/sfx/emergency_siren.wav',
        artillery: 'assets/audio/sfx/artillery_blast.wav',
        gatling: 'assets/audio/sfx/gatling_heavy.wav',
        plasma: 'assets/audio/sfx/plasma_burn.wav',
        sell: 'assets/audio/sfx/sell.wav',
        hit: 'assets/audio/sfx/hit.wav',
        leak: 'assets/audio/sfx/leak.wav',
        hero_slash: 'assets/audio/sfx/hero_slash.wav',
        hero_dash: 'assets/audio/sfx/hero_dash.wav',
        emp: 'assets/audio/sfx/emp.wav',
        orbital: 'assets/audio/sfx/orbital.wav',
        shield_dome: 'assets/audio/sfx/shield_dome.wav',
        teleport: 'assets/audio/sfx/teleport.wav',
        missile_launch: 'assets/audio/sfx/missile_launch.wav',
        flame: 'assets/audio/sfx/flame.wav',
        kamikaze_beep: 'assets/audio/sfx/kamikaze_beep.wav',
        victory: 'assets/audio/sfx/victory.wav',
        defeat: 'assets/audio/sfx/defeat.wav',
        hq_online: 'assets/audio/voice/hq_grid_online.wav',
        hq_boss: 'assets/audio/voice/hq_boss_detected.wav',
        hq_airdrop: 'assets/audio/voice/hq_airdrop_inbound.wav',
        hq_core: 'assets/audio/voice/hq_core_critical.wav'
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
          s.volume = finalVol;
          s.currentTime = 0;
          s.play().catch(() => {});
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
    setBGMVolume(vol) {
      if (this.bgmAudio) {
        try {
          this.bgmAudio.volume = Math.max(0, Math.min(1, vol));
          if (vol <= 0) this.bgmAudio.pause();
          else if (this.bgmAudio.paused && !this.bgmMuted) this.bgmAudio.play().catch(() => {});
        } catch(e) {}
      }
    }
    playBGMTrack(trackName) {
      const bgmVol = (window.lastGridEngine && window.lastGridEngine.settings) ? window.lastGridEngine.settings.bgmVol : 0.7;
      if (this.bgmMuted || bgmVol <= 0) {
        this.stopBGM();
        this.currentBgmName = trackName;
        return;
      }

      if (this.currentBgmName === trackName && ((this.bgmAudio && !this.bgmAudio.paused) || this.bgmTimer)) {
        return;
      }

      this.stopBGM();
      this.currentBgmName = trackName;
      this.bgmTheme = trackName;

      // Unlock AudioContext if present
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const trackPaths = {
        menu: 'assets/audio/bgm/bgm_menu.wav',
        cyber: 'assets/audio/bgm/bgm_battle_cyber.wav',
        lava: 'assets/audio/bgm/bgm_battle_lava.wav',
        cryo: 'assets/audio/bgm/bgm_battle_cryo.wav',
        boss: 'assets/audio/bgm/bgm_boss_titan.wav',
        victory: 'assets/audio/bgm/bgm_victory.wav'
      };
      const path = trackPaths[trackName] || trackPaths.cyber;

      if (!this.bgmAudioCache) this.bgmAudioCache = {};
      let audioEl = this.bgmAudioCache[trackName];
      if (!audioEl) {
        try {
          audioEl = new Audio(path);
          audioEl.loop = (trackName !== 'victory');
          this.bgmAudioCache[trackName] = audioEl;
        } catch(e) {}
      }

      let audioSucceeded = false;
      if (audioEl) {
        try {
          audioEl.volume = bgmVol;
          audioEl.currentTime = 0;
          const p = audioEl.play();
          if (p && typeof p.then === 'function') {
            p.then(() => {
              this.bgmAudio = audioEl;
              this.bgmPlaying = true;
              this.stopProceduralBGM();
            }).catch(() => {
              // Seamless Web Audio procedural fallback - zero silence guaranteed!
              this.startProceduralBGM(trackName);
            });
            audioSucceeded = true;
          } else {
            this.bgmAudio = audioEl;
            this.bgmPlaying = true;
            audioSucceeded = true;
          }
        } catch(e) {
          audioSucceeded = false;
        }
      }

      if (!audioSucceeded) {
        this.startProceduralBGM(trackName);
      }
    }
    startBGM() {
      const mode = (window.lastGridEngine && window.lastGridEngine.state === 'MENU') ? 'menu' : 'cyber';
      this.playBGMTrack(mode);
    }
    startProceduralBGM(trackName = 'menu') {
      if (this.bgmMuted) return;
      this.bgmTheme = trackName;
      if (this.bgmTimer) return;
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.step = 0;
      this.bgmPlaying = true;
      const bpm = (trackName === 'menu') ? 112 : (trackName === 'boss' ? 134 : 124);
      const intervalMs = Math.round((60000 / bpm) / 4); // 16th notes
      this.bgmTimer = setInterval(() => this.bgmTick(this.bgmTheme), intervalMs);
    }
    stopProceduralBGM() {
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
    stopBGM() {
      if (this.bgmAudio) {
        try { this.bgmAudio.pause(); this.bgmAudio.currentTime = 0; } catch(e) {}
        this.bgmAudio = null;
      }
      this.stopProceduralBGM();
      this.bgmPlaying = false;
    }
    bgmTick(theme = 'menu') {
      if (this.bgmMuted || !this.ctx) return;
      const bgmVol = (window.lastGridEngine && window.lastGridEngine.settings) ? window.lastGridEngine.settings.bgmVol : 0.7;
      if (bgmVol <= 0) return;

      const beat16 = this.step % 16;
      const gainScale = bgmVol * 0.45;

      if (theme === 'menu') {
        // Futuristic Cyber Hangar Ambient Music
        if (beat16 === 0 || beat16 === 8) {
          this.playDrum(85, 0.005, 0.18, 0.22 * gainScale, 28);
        }
        if (beat16 % 4 === 2) {
          this.playHiHat(0.025, 0.04 * gainScale);
        }
        const menuMelody = [146.83, 174.61, 220.00, 261.63, 293.66, 349.23, 329.63, 220.00];
        if (beat16 % 2 === 0) {
          const mIdx = Math.floor(this.step / 2) % menuMelody.length;
          this.playSynthNote(menuMelody[mIdx], 0.12, 0.07 * gainScale);
        }
        if (beat16 === 0) {
          const bassNotes = [73.42, 87.31, 98.00, 110.00];
          const bIdx = Math.floor(this.step / 16) % bassNotes.length;
          this.playSynthBass(bassNotes[bIdx], 0.35, 0.08 * gainScale);
        }
      } else if (theme === 'boss') {
        if (beat16 % 4 === 0) this.playDrum(180, 0.001, 0.16, 0.35 * gainScale, 25);
        if (beat16 === 4 || beat16 === 12) this.playSnare(0.12, 0.18 * gainScale);
        if (beat16 % 2 === 1) this.playHiHat(0.04, 0.08 * gainScale);
        const bossBass = [55.00, 58.27, 55.00, 61.74];
        const bIdx = Math.floor(this.step / 4) % bossBass.length;
        this.playSynthBass(bossBass[bIdx], 0.12, 0.14 * gainScale);
      } else {
        if (beat16 % 4 === 0) this.playDrum(150, 0.001, 0.12, 0.25 * gainScale, 30);
        if (beat16 === 4 || beat16 === 12) this.playSnare(0.08, 0.12 * gainScale);
        if (beat16 % 2 === 1) this.playHiHat(0.03, 0.06 * gainScale);
        const bassIndex = Math.floor(this.step / 8) % this.bassNotes.length;
        const baseFreq = this.bassNotes[bassIndex];
        const oct = (beat16 % 4 === 2) ? 2 : 1;
        this.playSynthBass(baseFreq * oct, 0.09, 0.09 * gainScale);
        if (beat16 % 4 === 0 || beat16 % 4 === 3) {
          const sIdx = Math.floor(this.step / 4) % this.scale.length;
          this.playSynthNote(this.scale[sIdx] * 2, 0.08, 0.05 * gainScale);
        }
      }
      this.step++;
    }
    playSynthNote(freq, duration, gainVal) {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch(e) {}
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
    playNoise(duration, gainVal = 0.08) {
      if (this.sfxMuted || !this.ctx) return;
      try {
        const sampleRate = this.ctx.sampleRate || 44100;
        const bufferSize = Math.max(1, Math.floor(sampleRate * duration));
        const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
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
      if (!this.playSample('laser', 0.55)) this.playTone(850, 'sawtooth', 0.08, 0.06, 200);
    }
    shootMortar() {
      if (!this.playSample('cannon', 0.70)) this.playTone(180, 'triangle', 0.35, 0.15, 35);
    }
    shootCryo() {
      if (!this.playSample('zap', 0.60)) this.playTone(650, 'sine', 0.22, 0.08, 1100);
    }
    shootRailgun() {
      if (!this.playSample('plasma', 0.75) && !this.playSample('laser', 0.65)) {
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
      if (!this.playSample('sell', 0.65)) {
        this.playTone(700, 'sine', 0.08, 0.1, 950);
        setTimeout(() => this.playTone(950, 'sine', 0.12, 0.1, 1200), 70);
      }
    }
    hit() {
      if (!this.playSample('hit', 0.50)) this.playTone(140, 'square', 0.05, 0.04, 60);
    }
    leak() {
      if (!this.playSample('leak', 0.75)) this.playTone(220, 'sawtooth', 0.3, 0.2, 90);
    }
    heroSlash() {
      if (!this.playSample('hero_slash', 0.70)) {
        this.playTone(400, 'sawtooth', 0.2, 0.15, 80);
        this.playTone(900, 'triangle', 0.25, 0.12, 200);
      }
    }
    emp() {
      if (!this.playSample('emp', 0.75)) {
        this.playTone(1200, 'sawtooth', 0.4, 0.2, 80);
        this.playTone(300, 'square', 0.5, 0.15, 60);
      }
    }
    orbital() {
      if (!this.playSample('orbital', 0.85)) {
        this.playTone(80, 'sawtooth', 0.6, 0.25, 40);
        this.playTone(1500, 'sawtooth', 0.5, 0.2, 200);
      }
    }
    victory() {
      if (!this.playSample('victory', 0.85) && !this.playSample('wave_clear', 0.75)) {
        [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.15), i * 120));
      }
    }
    airdropFlyby() {
      if (!this.playSample('missile_launch', 0.60)) {
        this.playTone(90, 'triangle', 0.8, 0.12, 160);
        setTimeout(() => this.playTone(160, 'triangle', 0.8, 0.1, 80), 300);
      }
    }
    airdropLoot() {
      if (!this.playSample('build', 0.70)) {
        [523, 659, 783, 1046].forEach((f, i) => setTimeout(() => this.playTone(f, 'square', 0.18, 0.12), i * 70));
      }
    }
    bossSiren() {
      if (!this.playSample('siren', 0.85)) {
        // 2-tone cycling high-urgency emergency tactical alert siren
        [580, 880, 580, 880, 520, 780].forEach((f, i) => {
          setTimeout(() => this.playTone(f, 'sawtooth', 0.28, 0.25, f * 0.8), i * 250);
        });
      }
    }
    redZoneSiren() {
      if (!this.playSample('siren', 0.75)) {
        this.playTone(600, 'sawtooth', 0.35, 0.18, 300);
        setTimeout(() => this.playTone(750, 'sawtooth', 0.35, 0.18, 400), 200);
      }
    }
    artilleryBlast() {
      if (!this.playSample('artillery', 0.85) && !this.playSample('explosion', 0.85)) {
        this.playTone(70, 'sawtooth', 0.45, 0.25, 30);
        this.playTone(140, 'triangle', 0.3, 0.2, 40);
      }
    }
    titanStomp() {
      if (!this.playSample('stomp', 0.85)) this.artilleryBlast();
    }
    barricadeHit() {
      if (!this.playSample('hit', 0.60)) this.playTone(110, 'square', 0.08, 0.12, 50);
    }
    barricadeBreak() {
      if (!this.playSample('explosion', 0.75)) {
        this.playTone(180, 'sawtooth', 0.4, 0.25, 45);
        this.playTone(90, 'square', 0.5, 0.2, 30);
      }
    }
    radioBeep() {
      this.playTone(880, 'sine', 0.05, 0.08);
      setTimeout(() => this.playTone(1174, 'sine', 0.07, 0.08), 60);
    }
    radioChirp() {
      this.playTone(1800, 'sine', 0.04, 0.1, 2400);
      setTimeout(() => this.playTone(2400, 'sine', 0.05, 0.08, 1200), 50);
      this.playNoise(0.06, 0.03);
    }
    voiceRadio(text, sampleKey) {
      if (this.sfxMuted) return;
      this.radioChirp();
      if (sampleKey && this.playSample(sampleKey, 0.95)) {
        return;
      }
      // On mobile or Android WebView, speechSynthesis can deadlock or freeze the rendering thread
      const isMobileOrAndroid = typeof navigator !== 'undefined' && (/android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '') || (typeof window !== 'undefined' && !!window.AndroidBridge));
      if (isMobileOrAndroid) {
        return; // Military chirp is already sounded, avoiding mobile TTS thread hang
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const cleanText = (text || "").replace(/[^\w\s.,!?:-]/gi, ' ').trim();
          if (cleanText) {
            const u = new SpeechSynthesisUtterance(cleanText);
            u.pitch = 0.85;
            u.rate = 1.08;
            u.volume = 0.85;
            const voices = window.speechSynthesis.getVoices();
            const v = voices.find(x => x.lang.startsWith('en') && (x.name.includes('Google') || x.name.includes('Natural') || x.name.includes('Robot')));
            if (v) u.voice = v;
            window.speechSynthesis.speak(u);
          }
        } catch(e) {}
      }
    }
    defeat() {
      if (!this.playSample('defeat', 0.85)) {
        [330, 293, 261, 196].forEach((f, i) => setTimeout(() => this.playTone(f, 'sawtooth', 0.35, 0.2, 80), i * 150));
      }
    }
    mechTransform() {
      if (!this.playSample('modal', 0.65) && !this.playSample('build', 0.60)) {
        this.playTone(350, 'sawtooth', 0.18, 0.18, 120);
        setTimeout(() => this.playTone(180, 'square', 0.22, 0.20, 60), 80);
        setTimeout(() => this.playTone(550, 'triangle', 0.15, 0.15, 800), 180);
      }
    }
    shootTesla() {
      if (!this.playSample('zap', 0.65)) {
        this.playTone(1400, 'sawtooth', 0.12, 0.14, 250);
        this.playNoise(0.10, 0.08);
      }
    }
    shootFlame() {
      if (!this.playSample('flame', 0.70)) {
        this.playNoise(0.22, 0.12);
        this.playTone(120, 'sawtooth', 0.18, 0.08, 60);
      }
    }
    missileLaunch() {
      if (!this.playSample('missile_launch', 0.70)) {
        this.playTone(280, 'sawtooth', 0.25, 0.15, 950);
        this.playNoise(0.18, 0.06);
      }
    }
    shieldDome() {
      if (!this.playSample('shield_dome', 0.70)) {
        this.playTone(440, 'sine', 0.45, 0.18, 880);
        setTimeout(() => this.playTone(880, 'sine', 0.35, 0.12, 1320), 120);
      }
    }
    kamikazeBeep() {
      if (!this.playSample('kamikaze_beep', 0.65)) this.playTone(1800, 'square', 0.05, 0.15);
    }
    heroDash() {
      if (!this.playSample('hero_dash', 0.65)) this.playTone(320, 'sawtooth', 0.15, 0.15, 600);
    }
    mortarFire() { this.shootMortar(); }
    pulseFire() { this.shootPulse(); }
    emergencySiren() { this.bossSiren(); }
    zap() { this.shootTesla(); }
    teleport() {
      if (!this.playSample('teleport', 0.70)) this.playTone(800, 'sine', 0.18, 0.15, 200);
    }
    explosion() { this.artilleryBlast(); }
    freeze() { this.shootCryo(); }
    tesla() { this.shootTesla(); }
    flame() { this.shootFlame(); }
    railgun() { this.shootRailgun(); }
    laserShoot() { this.shootRailgun(); }
    bossRoar() { this.bossSiren(); }
  }

  const rawAudio = new SoundSynth();
  const audio = (typeof Proxy !== 'undefined') ? new Proxy(rawAudio, {
    get(target, prop) {
      if (prop in target) {
        const val = target[prop];
        if (typeof val === 'function') return val.bind(target);
        return val;
      }
      return (...args) => {};
    }
  }) : rawAudio;
  window.audio = audio;

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
      lanes: [ [ {x:64, y:96}, {x:1152, y:96}, {x:1152, y:576}, {x:192, y:576}, {x:192, y:192}, {x:960, y:192}, {x:960, y:448}, {x:384, y:448}, {x:384, y:320}, {x:640, y:320} ] ]
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
      lanes: [ [ {x:64, y:96}, {x:1152, y:96}, {x:1152, y:256}, {x:128, y:256}, {x:128, y:448}, {x:1152, y:448}, {x:1152, y:576}, {x:640, y:576} ] ]
    }
  ];
  if (typeof window !== 'undefined') {
    window.MAPS = MAPS;
  }

  // --- TOWER BLUEPRINTS & BRANCHING SPECIALIZATIONS (TIER 3) ---
  // Calibrated with Cyberpunk 2077 & Valorant Weapon Statistics
  const TOWER_DEFS = {
    wall: {
      id: "wall", name: "Barricade Wall", type: "DEFENSE", color: "#78909c", cost: 40, desc: "Armored barricade wall that obstructs ground hostiles.",
      targetsAir: false, projSpeed: 0,
      tiers: [
        { hp: 400, range: 40, upCost: 28 },
        { hp: 600, range: 40, upCost: 40 },
        { hp: 900, range: 40, upCost: 56 }
      ],
      branches: {
        A: { name: "Spike Barrier", hp: 1200, reflect: 0.30, color: "#ff7043", perk: "thorns", cost: 80, desc: "Reflects 30% melee damage back to attackers." },
        B: { name: "Electrified Gate", hp: 1000, zapDmg: 40, color: "#ffd600", perk: "electrified", cost: 85, desc: "Zaps adjacent attackers every second." }
      }
    },
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
    },
    tesla: {
      id: "tesla", name: "Tesla Coil", type: "ENERGY", color: "#ffd600", cost: 180, desc: "High-voltage coil arcing chain lightning across hostiles.",
      tiers: [
        { dmg: 45, rate: 1.2, range: 160, chainCount: 3, upCost: 180 },
        { dmg: 75, rate: 1.4, range: 180, chainCount: 4, upCost: 280 },
        { dmg: 115, rate: 1.6, range: 200, chainCount: 5, upCost: 0 }
      ],
      branches: {
        A: { name: "Overcharge Arc", dmg: 190, rate: 1.8, range: 220, chainCount: 6, color: "#ffd600", perk: "emp_shock", cost: 380, desc: "Fires lightning arcs that EMP-stun mechanical hostiles." },
        B: { name: "Tesla Storm Aura", dmg: 95, rate: 3.5, range: 210, chainCount: 8, color: "#76ff03", perk: "storm_aura", cost: 360, desc: "Discharges a continuous 360-degree storm field frying all hostiles." }
      }
    },
    flame: {
      id: "flame", name: "Flamethrower", type: "FIRE", color: "#ff3d00", cost: 160, desc: "Continuous conical plasma flame spray applying heavy burning DOT.",
      targetsAir: false,
      tiers: [
        { dmg: 18, rate: 8.0, range: 135, coneAngle: 0.65, dotDmg: 20, dotDur: 3.0, upCost: 160 },
        { dmg: 28, rate: 9.0, range: 150, coneAngle: 0.70, dotDmg: 35, dotDur: 3.5, upCost: 240 },
        { dmg: 42, rate: 10.0, range: 165, coneAngle: 0.75, dotDmg: 55, dotDur: 4.0, upCost: 0 }
      ],
      branches: {
        A: { name: "Napalm Inferno", dmg: 55, rate: 11.0, range: 180, coneAngle: 0.85, dotDmg: 90, dotDur: 5.0, color: "#ff3d00", perk: "ground_fire", cost: 350, desc: "Ignites ground, leaving persistent plasma fire puddles." },
        B: { name: "Plasma Blaze", dmg: 75, rate: 10.0, range: 175, coneAngle: 0.75, dotDmg: 70, dotDur: 4.0, color: "#00e5ff", perk: "armor_melt", cost: 370, desc: "Extreme heat melts 70% of hostile armor permanently." }
      }
    }
  };
  TOWER_DEFS.barricade = TOWER_DEFS.wall;

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
    { id: "hero_overdrive", title: "HERO OVERDRIVE", desc: "Field Hero Champion gains +60% melee damage and moves +25% faster.", icon: "🤖", color: "#b388ff" },
    { id: "plasma_inferno", title: "PLASMA INFERNO", desc: "Flame & Tesla attacks cause burning to chain to nearby enemies (+45% DoT).", icon: "🔥", color: "#ff3d00" },
    { id: "tesla_overcharge", title: "TESLA OVERCHARGE", desc: "Tesla Coil arcs to +3 extra targets, and EMP shockwaves inflict 2.5x stun.", icon: "⚡", color: "#ffd600" },
    { id: "nanite_aegis", title: "NANITE AEGIS", desc: "Shield Dome gains +500 HP and reflects 50% absorbed damage back as homing bolts.", icon: "🛡️", color: "#00e5ff" },
    { id: "siege_artillery_core", title: "SIEGE ARTILLERY", desc: "Siege Tank mode deals +60% explosion splash damage and creates burning craters.", icon: "🚜", color: "#ff9100" },
    { id: "void_collector", title: "VOID COLLECTOR", desc: "Slain hostiles award +3 gold per 5 kills and charge Mech Ult 2x faster.", icon: "🌌", color: "#b388ff" },
    { id: "chronos_overdrive", title: "CHRONOS OVERDRIVE", desc: "Mech movement speed +30%, and all skill cooldowns recharge 35% quicker.", icon: "⌛", color: "#76ff03" }
  ];

  // --- ENEMY BLUEPRINTS ---
  const ENEMY_DEFS = {
    scout:        { name: "Scout",        hp: 40,  shield: 0,   armor: 0,  spd: 96, bounty: 3,  color: "#ffd600", size: 10, marker: "▲", isFlyer: false },
    grunt:        { name: "Grunt",        hp: 100, shield: 0,   armor: 0,  spd: 60, bounty: 5,  color: "#ff5252", size: 12, marker: "●", isFlyer: false },
    tank:         { name: "Tank",         hp: 400, shield: 0,   armor: 12, armorReduction: 0.30, spd: 36, bounty: 16, color: "#d50000", size: 18, marker: "■", isFlyer: false },
    flyer:        { name: "Flyer",        hp: 70,  shield: 0,   armor: 0,  spd: 84, bounty: 6,  color: "#00e5ff", size: 11, marker: "✈", isFlyer: true },
    swarm:        { name: "Swarm",        hp: 25,  shield: 0,   armor: 0,  spd: 78, bounty: 2,  color: "#ffab00", size: 7,  marker: "◆", isFlyer: false },
    shielded:     { name: "Shielded",     hp: 120, shield: 150, armor: 4,  spd: 54, bounty: 12, color: "#00b0ff", size: 14, marker: "🛡", isFlyer: false },
    boss:         { name: "Titan Boss",   hp: 3000, shield: 0,  armor: 15, spd: 30, bounty: 150, color: "#ff1744", size: 28, isBoss: true, marker: "☠", isFlyer: false },

    // Backwards-compatible aliases
    sprinter:     { name: "Sprinter",     hp: 40,  shield: 0,   armor: 0,  spd: 96, bounty: 3,  color: "#ffd600", size: 10, marker: "▲", isFlyer: false },
    brute:        { name: "Brute",        hp: 400, shield: 0,   armor: 12, armorReduction: 0.30, spd: 36, bounty: 16, color: "#d50000", size: 18, marker: "■", isFlyer: false },
    swarmling:    { name: "Swarmling",    hp: 25,  shield: 0,   armor: 0,  spd: 78, bounty: 2,  color: "#ffab00", size: 7,  marker: "◆", isFlyer: false },
    shieldbearer: { name: "Shieldbearer", hp: 120, shield: 150, armor: 4,  spd: 54, bounty: 12, color: "#00b0ff", size: 14, marker: "🛡", isFlyer: false },
    medic:        { name: "Medic",        hp: 150, shield: 0,   armor: 0,  spd: 50, bounty: 14, color: "#00e676", size: 13, marker: "✚", isFlyer: false },
    splitter:     { name: "Splitter",     hp: 250, shield: 0,   armor: 3,  spd: 55, bounty: 10, color: "#e040fb", size: 15, marker: "✦", isFlyer: false },
    phantom:      { name: "Phantom",      hp: 180, shield: 0,   armor: 0,  spd: 75, bounty: 12, color: "#7c4dff", size: 14, marker: "★", isFlyer: false },
    gunship:      { name: "Gunship",      hp: 240, shield: 100, armor: 6,  spd: 72, bounty: 18, color: "#00e5ff", size: 16, marker: "🚁", isFlyer: true },
    kamikaze:     { name: "Kamikaze",     hp: 65,  shield: 0,   armor: 0,  spd: 120, bounty: 8,  color: "#ff3d00", size: 11, marker: "💣", isFlyer: false, isKamikaze: true },
    siege_breaker:{ name: "Siege Breaker",hp: 1250,shield: 300, armor: 22, armorReduction: 0.40, spd: 32, bounty: 45, color: "#7c4dff", size: 24, marker: "🗿", isFlyer: false, isSiegeBreaker: true },
    juggernaut:   { name: "BOSS: Juggernaut", hp: 3000,  shield: 0, armor: 15, spd: 30, bounty: 150, color: "#ff1744", size: 28, isBoss: true, marker: "☠", isFlyer: false },
    overseer:     { name: "BOSS: Overseer",   hp: 4500,  shield: 500, armor: 12, spd: 32, bounty: 200, color: "#651fff", size: 30, isBoss: true, marker: "👁", isFlyer: false },
    hive_titan:   { name: "BOSS: Hive Titan", hp: 6500,  shield: 0, armor: 18, spd: 28, bounty: 250, color: "#f50057", size: 34, isBoss: true, marker: "☣", isFlyer: false },
    void_titan:   { name: "BOSS: Void Titan", hp: 8500,  shield: 1200, armor: 20, armorReduction: 0.35, spd: 26, bounty: 300, color: "#9c27b0", size: 36, isBoss: true, isVoidTitan: true, marker: "🌌", isFlyer: false },
    chrono_phantom:{ name: "BOSS: Chrono Phantom", hp: 7200, shield: 800, armor: 14, spd: 34, bounty: 280, color: "#00e5ff", size: 32, isBoss: true, isChronoPhantom: true, marker: "⌛", isFlyer: false },
    mecha_colossus:{ name: "BOSS: Mecha Colossus", hp: 11000, shield: 1500, armor: 26, armorReduction: 0.45, spd: 24, bounty: 450, color: "#ffd600", size: 38, isBoss: true, isMechaColossus: true, marker: "🤖", isFlyer: false }
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
    [ { type: "grunt", count: 15, interval: 0.6 }, { type: "swarmling", count: 20, interval: 0.3 }, { type: "kamikaze", count: 6, interval: 0.8 } ],
    [ { type: "brute", count: 6, interval: 1.2 }, { type: "grunt", count: 14, interval: 0.7 } ],
    [ { type: "brute", count: 8, interval: 1.0 }, { type: "sprinter", count: 14, interval: 0.5 }, { type: "gunship", count: 5, interval: 1.2 } ],
    [ { type: "juggernaut", count: 1, interval: 2.5 }, { type: "grunt", count: 18, interval: 0.65 } ],

    // W11 - W15: Energy Shields, Medics & Stealth Phantoms
    [ { type: "shieldbearer", count: 8, interval: 0.8 }, { type: "sprinter", count: 15, interval: 0.5 } ],
    [ { type: "shieldbearer", count: 12, interval: 0.7 }, { type: "swarmling", count: 30, interval: 0.3 } ],
    [ { type: "medic", count: 8, interval: 0.8 }, { type: "grunt", count: 18, interval: 0.6 }, { type: "kamikaze", count: 8, interval: 0.7 } ],
    [ { type: "medic", count: 10, interval: 0.7 }, { type: "shieldbearer", count: 12, interval: 0.7 }, { type: "gunship", count: 6, interval: 1.0 } ],
    [ { type: "phantom", count: 14, interval: 0.65 }, { type: "sprinter", count: 16, interval: 0.5 } ],

    // W16 - W20: Splitters & Combined Arms & Boss 2
    [ { type: "phantom", count: 18, interval: 0.6 }, { type: "brute", count: 8, interval: 1.1 } ],
    [ { type: "splitter", count: 12, interval: 0.9 }, { type: "shieldbearer", count: 10, interval: 0.7 }, { type: "siege_breaker", count: 2, interval: 2.2 } ],
    [ { type: "splitter", count: 16, interval: 0.8 }, { type: "medic", count: 10, interval: 0.7 } ],
    [ { type: "phantom", count: 15, interval: 0.6 }, { type: "brute", count: 10, interval: 0.9 }, { type: "gunship", count: 8, interval: 0.9 } ],
    [ { type: "overseer", count: 1, interval: 2.5 }, { type: "phantom", count: 16, interval: 0.6 }, { type: "shieldbearer", count: 12, interval: 0.65 } ],

    // W21 - W25: High-Voltage Swarms & Mini-Boss Surge
    [ { type: "splitter", count: 18, interval: 0.75 }, { type: "kamikaze", count: 12, interval: 0.5 }, { type: "gunship", count: 8, interval: 0.8 } ],
    [ { type: "brute", count: 14, interval: 0.9 }, { type: "medic", count: 12, interval: 0.7 }, { type: "sprinter", count: 22, interval: 0.45 } ],
    [ { type: "phantom", count: 20, interval: 0.55 }, { type: "shieldbearer", count: 18, interval: 0.65 } ],
    [ { type: "brute", count: 12, interval: 0.85 }, { type: "siege_breaker", count: 4, interval: 1.8 }, { type: "phantom", count: 15, interval: 0.6 } ],
    [ { type: "juggernaut", count: 1, interval: 2.0 }, { type: "splitter", count: 24, interval: 0.65 }, { type: "sprinter", count: 20, interval: 0.4 } ],

    // W26 - W30: Grand Apocalypse & Hive Titan Finale
    [ { type: "shieldbearer", count: 22, interval: 0.6 }, { type: "phantom", count: 20, interval: 0.55 }, { type: "medic", count: 15, interval: 0.6 } ],
    [ { type: "grunt", count: 30, interval: 0.4 }, { type: "sprinter", count: 20, interval: 0.35 }, { type: "siege_breaker", count: 5, interval: 1.6 }, { type: "gunship", count: 10, interval: 0.8 } ],
    [ { type: "overseer", count: 1, interval: 2.5 }, { type: "phantom", count: 20, interval: 0.5 }, { type: "brute", count: 18, interval: 0.75 } ],
    [ { type: "splitter", count: 28, interval: 0.6 }, { type: "shieldbearer", count: 22, interval: 0.6 }, { type: "sprinter", count: 25, interval: 0.35 } ],
    [ { type: "hive_titan", count: 1, interval: 3.0 }, { type: "brute", count: 20, interval: 0.7 }, { type: "phantom", count: 25, interval: 0.5 } ]
  ];

  function getWaveConfig(waveNum, mode = 'CAMPAIGN') {
    if (mode === 'BOSS_RUSH') {
      if (waveNum === 1) return [{ type: "juggernaut", count: 1, interval: 2.5 }, { type: "brute", count: 6, interval: 1.0 }];
      if (waveNum === 2) return [{ type: "overseer", count: 1, interval: 2.5 }, { type: "gunship", count: 6, interval: 0.9 }];
      if (waveNum === 3) return [{ type: "hive_titan", count: 1, interval: 3.0 }, { type: "swarmling", count: 25, interval: 0.35 }];
      if (waveNum === 4) return [{ type: "juggernaut", count: 2, interval: 3.5 }, { type: "kamikaze", count: 12, interval: 0.5 }];
      if (waveNum === 5) return [{ type: "chrono_phantom", count: 1, interval: 3.0 }, { type: "phantom", count: 16, interval: 0.5 }];
      if (waveNum === 6) return [{ type: "void_titan", count: 1, interval: 3.0 }, { type: "shieldbearer", count: 14, interval: 0.6 }];
      if (waveNum === 7) return [{ type: "chrono_phantom", count: 1, interval: 3.0 }, { type: "void_titan", count: 1, interval: 4.0 }, { type: "gunship", count: 8, interval: 0.8 }];
      if (waveNum === 8) return [{ type: "mecha_colossus", count: 1, interval: 4.0 }, { type: "siege_breaker", count: 5, interval: 1.5 }];
      if (waveNum === 9) return [{ type: "overseer", count: 1, interval: 3.0 }, { type: "chrono_phantom", count: 1, interval: 3.5 }, { type: "void_titan", count: 1, interval: 4.0 }];
      if (waveNum === 10) return [{ type: "mecha_colossus", count: 1, interval: 3.0 }, { type: "hive_titan", count: 1, interval: 3.5 }, { type: "juggernaut", count: 2, interval: 4.0 }];
      return [{ type: "mecha_colossus", count: 2, interval: 4.0 }];
    }
    if (mode === 'CAMPAIGN' && waveNum >= 1 && waveNum <= 30) {
      return CAMPAIGN_WAVES_BTD6[waveNum - 1];
    }
    // Endless mode: fitted BTD6 power curve: RBE = 21.24 * wave^0.66
    const pool = ["grunt", "sprinter", "brute", "swarmling", "shieldbearer", "medic", "splitter", "phantom", "gunship", "kamikaze", "siege_breaker"];
    const baseCount = Math.floor(15 + Math.pow(waveNum, 0.75) * 3);
    const primary = pool[waveNum % pool.length];
    const secondary = pool[(waveNum + 3) % pool.length];
    const groups = [
      { type: primary, count: baseCount, interval: Math.max(0.25, 0.9 - waveNum * 0.01) },
      { type: secondary, count: Math.floor(baseCount * 0.7), interval: 0.5 }
    ];
    if (waveNum % 10 === 0) {
      const bossType = (waveNum % 60 === 0) ? "mecha_colossus" : (waveNum % 50 === 0 ? "void_titan" : (waveNum % 40 === 0 ? "chrono_phantom" : (waveNum % 30 === 0 ? "hive_titan" : (waveNum % 20 === 0 ? "overseer" : "juggernaut"))));
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
      this.MAPS = MAPS;

      this.lang = localStorage.getItem('last_grid_lang') || 'uz';
      this.gameMode = 'CAMPAIGN';
      this.state = 'MENU';
      this.speed = 1;
      try { audio.playBGMTrack('menu'); } catch(e) {}
      this.loadBackgroundImages();
      this.crtEnabled = localStorage.getItem('lg_crt') === 'true';
      this.colorblind = false;
      this.screenShake = 0;
      this.flyingCoins = [];
      this.upgradePillars = [];
      this.heroMenuAnim = { breathe: 0, coreGlow: 0, stanceTimer: 0 };
      this.initProceduralPBRTextures();

      // Mobile Ergonomics & Dedicated Settings
      this.settings = {
        sfxVol: parseFloat(localStorage.getItem('lg_sfx_vol') || '1.0'),
        bgmVol: parseFloat(localStorage.getItem('lg_bgm_vol') || '0.7'),
        haptics: localStorage.getItem('lg_haptics') !== 'false',
        screenFit: localStorage.getItem('lg_screen_fit') || 'FILL',
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
        damageByTower: { pulse: 0, mortar: 0, cryo: 0, tesla: 0, flame: 0, railgun: 0, beacon: 0, hero: 0, skills: 0 },
        totalKills: 0,
        totalGold: 0,
        mvpName: "Pulse Tower"
      };

      // Commander Skills
      this.skills = {
        emp:       { cost: 50, cd: 25, currentCd: 0, key: "Z", name: "EMP Storm" },
        missiles:  { cost: 65, cd: 22, currentCd: 0, key: "X", name: "Micro-Missiles" },
        shield:    { cost: 60, cd: 30, currentCd: 0, key: "C", name: "Shield Dome" },
        overclock: { cost: 50, cd: 35, currentCd: 0, key: "V", name: "Overclock", activeTime: 0 },
        orbital:   { cost: 75, cd: 30, currentCd: 0, key: "B", name: "Orbital Beam" },
        drone:     { cost: 0,  cd: 40, currentCd: 0, key: "N", name: "Supply Drone" }
      };

      // Controllable Field Hero Mech (Apex-01)
      this.hero = {
        name: "Apex-01 Mech",
        x: 300, y: 350,
        targetX: 300, targetY: 350,
        hp: 400, maxHp: 400,
        level: 1, xp: 0, maxXp: 80,
        speed: 130,
        mode: 'BIPED', // 'BIPED' (Assault Robot) | 'SIEGE' (Siege Tank)
        siegeRecoil: 0,
        siegeCooldown: 0,
        shieldDome: null,
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

      // Battlefield Dynamics v4.0.0
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
      this.selectedMechSkin = 'MEGATRON';
      this.minimapExpanded = true;
      this.cinematicBanner = null;
      this.codexTab = 'TOWERS';
      this.codexSelectedId = 'pulse';
      this.codexSubTab = 'SPECS';
      this.codexBranch = 'BASE';
      this.codexYaw = 0.25;
      this.codexPitch = 0.20;
      this.codexZoom = 1.0;
      this.codexAutoRotate = false;
      this.codexRenderMode = 'SHADED';
      this.codexDragging = false;
      this.codexDragStart = { x: 0, y: 0 };
      this.codexSimActive = false;
      this.codexSimTimer = 0;
      this.codexSimTargetType = 'STANDARD';
      this.codexDummyHp = 1000;
      this.codexDummyMaxHp = 1000;
      this.codexDummyShield = 0;
      this.codexDummyMaxShield = 0;
      this.codexDummyFlash = 0;
      this.codexRecoil = 0;
      this.codexProjectiles = [];
      this.codexParticles = [];
      this.codexDmgTexts = [];
      this.codexDmgHistory = [];
      this.codexTotalDmg = 0;
      this.isDraggingSlider = null;
      this.combatFeed = [];
      this.heroKillStreak = 0;
      this.lastHeroKillTime = 0;
      this.achievementsPage = 0;

      this.saveData = this.loadSave();

      this.initEvents();
      this.setupCanvasScaling();
      this.initMechSystem();
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
        const parsed = d ? JSON.parse(d) : {
          stars: {},
          achievements: {},
          highScores: { campaign: 0, endless: 0, boss_rush: 0 },
          leaderboard: [
            { player_name: "NeonMaster", map_id: "last_grid", wave_reached: 30, score: 12450 },
            { player_name: "CyberGhost", map_id: "twin_gate", wave_reached: 29, score: 9820 },
            { player_name: "GridRunner_UZ", map_id: "iron_wall", wave_reached: 25, score: 7650 },
            { player_name: "TashkentPro", map_id: "training_grid", wave_reached: 10, score: 3400 }
          ]
        };
        parsed.achievements = parsed.achievements || {};
        return parsed;
      } catch (e) {
        return { stars: {}, achievements: {}, highScores: {}, leaderboard: [] };
      }
    }

    saveSave() {
      try {
        localStorage.setItem('last_grid_save_v2', JSON.stringify(this.saveData));
      } catch (e) {}
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


    initMechSystem() {
      const mechCanvas = document.getElementById('mech-hangar-canvas');
      if (mechCanvas && window.Apex01System) {
        this.apexSystem = new window.Apex01System();
        this.apexSystem.init(mechCanvas);
        if (!this.selectedMechSkin) {
          this.selectedMechSkin = 'MEGATRON';
        }
        if (this.selectedMechSkin && this.apexSystem.setSkin) {
          this.apexSystem.setSkin(this.selectedMechSkin);
        }
        this.syncMechCanvasPosition();
      }
    }

    cycleNextMechHero() {
      const skins = ['MEGATRON', 'OPTIMUS', 'BUMBLEBEE'];
      const cur = this.selectedMechSkin || 'MEGATRON';
      const curIdx = skins.indexOf(cur);
      const nextIdx = (curIdx + 1) % skins.length;
      const nextSkin = skins[nextIdx];
      this.setMechSkin(nextSkin);
    }

    setMechSkin(skin) {
      this.selectedMechSkin = skin;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lg_mech_skin_v42', skin);
        localStorage.setItem('lg_mech_skin', skin);
      }
      if (this.apexSystem && this.apexSystem.setSkin) {
        this.apexSystem.setSkin(skin);
      }
      if (window.audio) {
        audio.click();
        if (skin === 'MEGATRON') audio.playSample('boss_spawn', 1.0);
        else if (skin === 'OPTIMUS') audio.playSample('mortar_fire', 0.8);
        else if (skin === 'BUMBLEBEE') audio.playSample('pulse_fire', 0.9);
        else audio.playSample('hero_dash', 0.8);
      }
      const label = (skin === 'MEGATRON') ? "MEGATRON (DECEPTICON)" : ((skin === 'OPTIMUS') ? "OPTIMUS PRIME (AUTOBOT)" : (skin === 'BUMBLEBEE' ? "BUMBLEBEE (SCOUT)" : "APEX-01 (CYBER-MECH)"));
      const color = (skin === 'MEGATRON') ? '#c084fc' : ((skin === 'OPTIMUS') ? '#ff3355' : (skin === 'BUMBLEBEE' ? '#ffd600' : '#00e5ff'));
      this.vibrate([25, 20, 35]);
      this.addFloatingText(`⚡ ${label} TANLANDI!`, 235, 260, color, 16);
    }

    toggleMechTransform() {
      if (this.apexSystem && this.apexSystem.toggleTransform) {
        const mode = this.apexSystem.toggleTransform();
        if (window.audio) {
          audio.heroDash();
          audio.playSample('rocket_fire', 0.7);
        }
        this.vibrate([40, 30, 60]);
        const modeText = (mode === 'VEHICLE') ? "🚚 TRANSPORT REJIMI (VEHICLE)" : "🤖 JANGOVAR ROBOT REJIMI";
        this.addFloatingText(modeText, 235, 280, "#00ff88", 16);
      } else {
        this.addFloatingText("ℹ️ Ushbu model faqat robot rejimida ishlaydi", 235, 280, "#90a4ae", 14);
      }
    }

    triggerMechAction() {
      if (this.apexSystem) {
        if (this.selectedMechSkin === 'OPTIMUS') {
          this.apexSystem.swingAxe();
          this.apexSystem.fireWeapon();
          if (window.audio) { audio.mortarFire(); audio.heroSlash(); }
          this.addFloatingText("💥 ION BLASTER & ENERGON AXE!", 235, 270, "#ff3355", 16);
        } else if (this.selectedMechSkin === 'BUMBLEBEE') {
          this.apexSystem.fireWeapon();
          this.apexSystem.swingAxe();
          if (window.audio) { audio.pulseFire(); audio.heroSlash(); }
          this.addFloatingText("⚡ STINGER PLASMA CANNON!", 235, 270, "#ffd600", 16);
        } else {
          this.apexSystem.fireWeapon();
          if (window.audio) { audio.heroSlash(); audio.heroDash(); }
          this.addFloatingText("⚡ DUAL KINETIC TRACER!", 235, 270, "#00e5ff", 16);
        }
        this.vibrate([35, 20, 45]);
      }
    }

    toggleMechBattleMask() {
      if (this.apexSystem && this.apexSystem.toggleBattleMask) {
        const isOpen = this.apexSystem.toggleBattleMask();
        if (window.audio) { audio.click(); audio.playSample('bullet_reflect', 0.8); }
        this.vibrate([20, 15, 30]);
        this.addFloatingText(isOpen ? "🗣️ YUZ NIQOBI: MULOQOT" : "🛡️ JANGOVAR NIQOB YOPILDI", 235, 270, "#00e5ff", 16);
      }
    }

    toggleMechMatrixChest() {
      if (this.apexSystem && this.apexSystem.toggleMatrixChest) {
        const isOpen = this.apexSystem.toggleMatrixChest();
        if (window.audio) { audio.heroDash(); audio.playSample('pulse_fire', 0.9); }
        this.vibrate([30, 20, 50]);
        this.addFloatingText(isOpen ? "✨ MATRIX OF LEADERSHIP OCHILDI!" : "🚛 KO'KRAK OYNALARI YOPILDI", 235, 270, "#ffd600", 16);
      }
    }

    triggerMechSmoke() {
      if (this.apexSystem && this.apexSystem.triggerDieselSmoke) {
        this.apexSystem.triggerDieselSmoke(14);
        if (window.audio) { audio.mortarFire(); audio.playSample('mortar_fire', 0.7); }
        this.vibrate([35, 25, 45]);
        this.addFloatingText("💨 2.8M MO'RILARDAN DIZEL TUTUN OTILDI!", 235, 270, "#90a4ae", 16);
      }
    }

    syncMechCanvasPosition() {
      const mechCanvas = (typeof document !== 'undefined') ? document.getElementById('mech-hangar-canvas') : null;
      if (this.canvas && mechCanvas) {
        mechCanvas.style.width = this.canvas.style.width;
        mechCanvas.style.height = this.canvas.style.height;
      }

      const rw = parseInt(this.canvas ? this.canvas.style.width : 0, 10) || (typeof window !== 'undefined' ? window.innerWidth : 1280);
      const rh = parseInt(this.canvas ? this.canvas.style.height : 0, 10) || (typeof window !== 'undefined' ? window.innerHeight : 720);

      if (this.apexSystem && typeof this.apexSystem.resize === 'function') {
        this.apexSystem.resize(rw, rh);
      }
    }

    setupCanvasScaling() {
      window.addEventListener('resize', () => this.resizeCanvas());
      window.addEventListener('orientationchange', () => setTimeout(() => this.resizeCanvas(), 150));
      document.addEventListener('fullscreenchange', () => setTimeout(() => this.resizeCanvas(), 150));
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (typeof audio !== "undefined" && audio) {
            audio.stopBGM();
            if (audio.ctx && audio.ctx.state === "running") audio.ctx.suspend().catch(() => {});
          }
        } else {
          if (typeof audio !== "undefined" && audio) {
            if (audio.ctx && audio.ctx.state === "suspended") audio.ctx.resume().catch(() => {});
            if (!audio.bgmMuted && (this.state === "PLAYING" || this.state === "MENU")) {
              audio.playBGMTrack(this.state === "MENU" ? "menu" : (this.currentBgmName || "cyber"));
            }
          }
        }
      });
      this.resizeCanvas();
    }

    handleBackAction() {
      // 1. If Settings modal is open -> close it
      if (this.showSettingsModal) {
        this.showSettingsModal = false;
        if (this.state === 'MENU' && this.apexSystem) this.apexSystem.show();
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
        if (this.apexSystem) this.apexSystem.show();
        audio.playBGMTrack('menu');
        audio.click();
        return;
      }
      // 7. If in 3D TPS arena -> return to MENU
      if (this.state === 'TPS_3D') {
        this.state = 'MENU';
        if (this.apexSystem) this.apexSystem.show();
        audio.playBGMTrack('menu');
        audio.sell();
        return;
      }
      // 8. If in PLAYING state -> toggle PAUSE (Never abruptly lose progress!)
      if (this.state === 'PLAYING') {
        this.togglePause();
        audio.modal();
        return;
      }
      // 9. If in PAUSED state -> safely return to MENU!
      if (this.state === 'PAUSED') {
        this.state = 'MENU';
        this.selectedTower = null;
        this.selectedBuildType = null;
        this.radialBuildCell = null;
        if (this.apexSystem) this.apexSystem.show();
        audio.playBGMTrack('menu');
        audio.sell();
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

      // Section 1: SFX Volume Slider
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px monospace";
      ctx.fillText("🔊 SFX OVOZLAR:", mx + 40, my + 115);

      const sfxTrackX = mx + 240;
      const sfxTrackY = my + 104;
      const trackW = 420;
      const trackH = 12;

      // Track base
      ctx.fillStyle = "rgba(10, 16, 28, 0.95)";
      ctx.fillRect(sfxTrackX, sfxTrackY, trackW, trackH);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(sfxTrackX, sfxTrackY, trackW, trackH);

      // Track fill
      const sfxFillW = Math.max(0, Math.min(trackW, trackW * this.settings.sfxVol));
      const sfxGrad = ctx.createLinearGradient(sfxTrackX, 0, sfxTrackX + sfxFillW, 0);
      sfxGrad.addColorStop(0, "#00b0ff");
      sfxGrad.addColorStop(1, "#00e5ff");
      ctx.fillStyle = sfxGrad;
      ctx.fillRect(sfxTrackX + 1, sfxTrackY + 1, sfxFillW, trackH - 2);

      // Thumb knob
      const sfxThumbX = sfxTrackX + sfxFillW;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sfxThumbX, sfxTrackY + trackH / 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Readout
      this.drawCyberButton(mx + 680, my + 92, 80, 36, `${Math.round(this.settings.sfxVol * 100)}%`, this.settings.sfxVol > 0 ? "#00e5ff" : "#455a64", "", "", false);

      // Section 2: BGM Volume Slider
      ctx.fillStyle = "#ffffff";
      ctx.fillText("🎵 MUSIQA (BGM):", mx + 40, my + 175);

      const bgmTrackX = mx + 240;
      const bgmTrackY = my + 164;

      ctx.fillStyle = "rgba(10, 16, 28, 0.95)";
      ctx.fillRect(bgmTrackX, bgmTrackY, trackW, trackH);
      ctx.strokeStyle = "rgba(0, 230, 118, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(bgmTrackX, bgmTrackY, trackW, trackH);

      const bgmFillW = Math.max(0, Math.min(trackW, trackW * this.settings.bgmVol));
      const bgmGrad = ctx.createLinearGradient(bgmTrackX, 0, bgmTrackX + bgmFillW, 0);
      bgmGrad.addColorStop(0, "#00b0ff");
      bgmGrad.addColorStop(1, "#00e676");
      ctx.fillStyle = bgmGrad;
      ctx.fillRect(bgmTrackX + 1, bgmTrackY + 1, bgmFillW, trackH - 2);

      const bgmThumbX = bgmTrackX + bgmFillW;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#00e676";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(bgmThumbX, bgmTrackY + trackH / 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#00e676";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      this.drawCyberButton(mx + 680, my + 152, 80, 36, `${Math.round(this.settings.bgmVol * 100)}%`, this.settings.bgmVol > 0 ? "#00e676" : "#455a64", "", "", false);

      // Section 3: Haptic Feedback
      ctx.fillStyle = "#ffffff";
      ctx.fillText("📳 TEBRANISH:", mx + 40, my + 235);
      this.drawCyberButton(mx + 240, my + 212, 240, 36, "YONIQ 🟢 (HAPTICS)", this.settings.haptics ? "#00e676" : "#455a64", "", "", this.settings.haptics);
      this.drawCyberButton(mx + 500, my + 212, 240, 36, "O'CHIQ 🔴 (OFF)", !this.settings.haptics ? "#ff1744" : "#455a64", "", "", !this.settings.haptics);

      // Section 4: Screen Fit Mode
      ctx.fillStyle = "#ffffff";
      ctx.fillText("📱 EKRAN REJIMI:", mx + 40, my + 295);
      const isFit = this.settings.screenFit === 'FIT';
      this.drawCyberButton(mx + 240, my + 272, 240, 36, "FIT (16:9 NISBAT)", isFit ? "#00e5ff" : "#455a64", "STANDART 16:9", "", isFit);
      this.drawCyberButton(mx + 500, my + 272, 240, 36, "FILL (TO'LIQ EKRAN)", !isFit ? "#00e5ff" : "#455a64", "20:9 KENG EKRAN", "", !isFit);

      // Section 5: FPS Mode
      ctx.fillStyle = "#ffffff";
      ctx.fillText("⚡ FPS REJIMI:", mx + 40, my + 355);
      const is60 = this.settings.fpsLimit === 60;
      this.drawCyberButton(mx + 240, my + 332, 240, 36, "60 FPS (SILLIQ)", is60 ? "#ffd600" : "#455a64", "ULTRA 60 FPS", "", is60);
      this.drawCyberButton(mx + 500, my + 332, 240, 36, "30 FPS (TEJAMKOR)", !is60 ? "#ffd600" : "#455a64", "BATAREYA TEJASH", "", !is60);

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
      this.drawCyberButton(mx + 420, my + 540, 320, 50, isIngame ? "🚪 ASOSIY MENYUGA" : "ASOSIY MENYUDA QOLISH", "#ff1744", isIngame ? "JANGNI TUGATISH" : "ORQAGA", "←", false);

      ctx.restore();
    }

    handleSettingsClick(x, y) {
      const mx = 240;
      const my = 40;

      // Section 1: SFX Slider Click / Drag
      if (y >= my + 88 && y <= my + 130 && x >= mx + 230 && x <= mx + 670) {
        const pct = Math.max(0, Math.min(1.0, (x - (mx + 240)) / 420));
        this.settings.sfxVol = Math.round(pct * 20) / 20;
        localStorage.setItem('lg_sfx_vol', this.settings.sfxVol.toString());
        audio.sfxMuted = (this.settings.sfxVol === 0.0);
        audio.shootPulse();
        this.vibrate(14);
        return;
      }
      if (x >= mx + 680 && x <= mx + 760 && y >= my + 92 && y <= my + 128) {
        this.settings.sfxVol = this.settings.sfxVol > 0 ? 0 : 0.7;
        localStorage.setItem('lg_sfx_vol', this.settings.sfxVol.toString());
        audio.sfxMuted = (this.settings.sfxVol === 0.0);
        audio.click();
        this.vibrate(15);
        return;
      }

      // Section 2: BGM Slider Click / Drag
      if (y >= my + 148 && y <= my + 190 && x >= mx + 230 && x <= mx + 670) {
        const pct = Math.max(0, Math.min(1.0, (x - (mx + 240)) / 420));
        this.settings.bgmVol = Math.round(pct * 20) / 20;
        localStorage.setItem('lg_bgm_vol', this.settings.bgmVol.toString());
        audio.bgmMuted = (this.settings.bgmVol === 0.0);
        if (audio.bgmMuted) audio.stopBGM();
        else { audio.startBGM(); audio.setBGMVolume(this.settings.bgmVol); }
        audio.click();
        this.vibrate(14);
        return;
      }
      if (x >= mx + 680 && x <= mx + 760 && y >= my + 152 && y <= my + 188) {
        this.settings.bgmVol = this.settings.bgmVol > 0 ? 0 : 0.7;
        localStorage.setItem('lg_bgm_vol', this.settings.bgmVol.toString());
        audio.bgmMuted = (this.settings.bgmVol === 0.0);
        if (audio.bgmMuted) audio.stopBGM();
        else { audio.startBGM(); audio.setBGMVolume(this.settings.bgmVol); }
        audio.click();
        this.vibrate(15);
        return;
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
          if (this.state === 'MENU' && this.apexSystem) this.apexSystem.show();
          audio.click();
          this.vibrate(20);
          return;
        } else if (x >= mx + 420 && x <= mx + 740) {
          this.showSettingsModal = false;
          this.state = 'MENU';
          this.selectedTower = null;
          this.selectedBuildType = null;
          this.radialBuildCell = null;
          if (this.apexSystem) this.apexSystem.show();
          audio.playBGMTrack('menu');
          audio.sell();
          this.vibrate(25);
          return;
        }
      }
    }

    resizeCanvas() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const screenFit = (this.settings && this.settings.screenFit) || localStorage.getItem('lg_screen_fit') || 'FILL';

      let cssW = w;
      let cssH = h;
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
        cssW = Math.floor(targetW);
        cssH = Math.floor(targetH);
        this.canvas.style.width = `${cssW}px`;
        this.canvas.style.height = `${cssH}px`;
      }
      this.canvas.style.display = 'block';

      // True Native Ultra-Crisp Resolution with DPR scaling (capped at 3.0 for crystal clarity on AMOLED/Retina)
      const dpr = Math.min(window.devicePixelRatio || 1, 3.0);
      const targetBufferW = Math.round(cssW * dpr);
      const targetBufferH = Math.round(cssH * dpr);
      if (this.canvas.width !== targetBufferW || this.canvas.height !== targetBufferH) {
        this.canvas.width = targetBufferW;
        this.canvas.height = targetBufferH;
      }
      this.dpr = dpr;
      this.renderScaleX = targetBufferW / 1280;
      this.renderScaleY = targetBufferH / 720;

      if (this.ctx) {
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
      }
      this.syncMechCanvasPosition();
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
      // Pointer State & Ripple Tracking
      this.isPointerDown = false;
      this.buttonRipples = [];

      this.canvas.addEventListener('mousedown', (e) => {
        this.isPointerDown = true;
        this.mousePos = this.getCanvasPos(e);
        if (this.mousePos) {
          this.buttonRipples.push({ x: this.mousePos.x, y: this.mousePos.y, r: 4, maxR: 52, alpha: 0.9, color: "#00e5ff" });
          if (this.state === 'MANUAL' && this.mousePos.x >= 320 && this.mousePos.x <= 780 && this.mousePos.y >= 75 && this.mousePos.y <= 540) {
            this.codexDragging = true;
            this.codexDragStart = { x: this.mousePos.x, y: this.mousePos.y };
          }
          if (this.state === 'MENU' && this.mousePos.x >= 20 && this.mousePos.x <= 580 && this.mousePos.y >= 70 && this.mousePos.y <= 656) {
            this.mechDragging = true;
            this.mechDragStart = { x: this.mousePos.x, y: this.mousePos.y, lx: this.mousePos.x, moved: false };
            if (this.apexSystem) this.apexSystem.pointerActive = true;
          }
        }
      });
      window.addEventListener('mouseup', () => {
        this.isPointerDown = false;
        this.codexDragging = false;
        if (this.mechDragging) {
          this.mechDragging = false;
          if (this.apexSystem) this.apexSystem.pointerActive = false;
        }
      });

      // Desktop Mouse Move
      this.canvas.addEventListener('mousemove', (e) => {
        this.mousePos = this.getCanvasPos(e);
        this.updateHoverCell();
        if (this.state === 'MENU') {
          if (this.apexSystem && this.apexSystem.setLookAtTarget && this.mousePos) {
            const nx = Math.max(-1, Math.min(1, (this.mousePos.x - 295) / 300));
            const ny = Math.max(-1, Math.min(1, (this.mousePos.y - 370) / 280));
            this.apexSystem.setLookAtTarget(nx, ny);
          }
          if (this.mechDragging && this.mousePos && this.apexSystem && this.apexSystem.mech) {
            const dx = this.mousePos.x - this.mechDragStart.lx;
            if (Math.abs(this.mousePos.x - this.mechDragStart.x) > 5) this.mechDragStart.moved = true;
            this.apexSystem.mech.yawVel = dx * 0.008;
            this.mechDragStart.lx = this.mousePos.x;
          }
        }
        if (this.showSettingsModal && this.isPointerDown && this.mousePos) {
          this.handleSettingsClick(this.mousePos.x, this.mousePos.y);
        }
        if (this.state === 'MANUAL' && this.isPointerDown && this.codexDragging && this.mousePos) {
          const dx = this.mousePos.x - this.codexDragStart.x;
          const dy = this.mousePos.y - this.codexDragStart.y;
          this.codexYaw = (this.codexYaw || 0) + dx * 0.012;
          this.codexYawVel = dx * 0.007;
          this.codexPitch = Math.max(-0.6, Math.min(0.8, (this.codexPitch !== undefined ? this.codexPitch : 0.28) + dy * 0.012));
          this.codexDragStart = { x: this.mousePos.x, y: this.mousePos.y };
          this.codexAutoRotate = false;
        }
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

      this.canvas.addEventListener('wheel', (e) => {
        if (this.state === 'MANUAL') {
          const pos = this.getCanvasPos(e);
          if (pos && pos.x >= 320 && pos.x <= 780 && pos.y >= 75 && pos.y <= 540) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.12 : 0.12;
            this.codexZoom = Math.max(0.6, Math.min(2.0, (this.codexZoom || 1.0) + delta));
          }
        }
      }, { passive: false });

      // MOBILE TOUCH GESTURES & SENSORS
      this.canvas.addEventListener('touchstart', (e) => {
        this.isTouchDevice = true;
        this.isPointerDown = true;
        audio.init();
        const tPos = this.getCanvasPos(e);
        if (tPos) {
          this.mousePos = tPos;
          this.buttonRipples.push({ x: tPos.x, y: tPos.y, r: 4, maxR: 52, alpha: 0.9, color: "#00e5ff" });
          if (this.state === 'MENU' && tPos.x >= 20 && tPos.x <= 580 && tPos.y >= 70 && tPos.y <= 656) {
            this.mechDragging = true;
            this.mechDragStart = { x: tPos.x, y: tPos.y, lx: tPos.x, moved: false };
            if (this.apexSystem) this.apexSystem.pointerActive = true;
          }
          if (this.state === 'MANUAL') {
            this.codexYawVel = 0;
            if (e.touches && e.touches.length === 2) {
              this.codexPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
              this.codexDragging = false;
            } else if (tPos.x >= 320 && tPos.x <= 780 && tPos.y >= 75 && tPos.y <= 540) {
              this.codexDragging = true;
              this.codexDragStart = { x: tPos.x, y: tPos.y };
            }
          }
        }
        if (this.state === 'TPS_3D' && this.tps3D) {
          const t = this.tps3D;
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const rect = this.canvas.getBoundingClientRect();
            const tx = (touch.clientX - rect.left) * (1280 / rect.width);
            const ty = (touch.clientY - rect.top) * (720 / rect.height);

            // Back to Menu or 2D Strategy
            if (tx < 180 && ty < 65) {
              this.state = (this.waveActive || this.wave > 1) ? 'PLAYING' : 'MENU';
              if (this.state === 'MENU') audio.playBGMTrack('menu');
              audio.sell();
              return;
            }

            // 1. Fire (Large Primary)
            if (Math.hypot(tx - 1200, ty - 625) <= 54) {
              if (t.isBuilding) this.place3DTower(); else this.shoot3DTPS();
              this.vibrate(22);
              return;
            }
            // 2. Reload
            if (Math.hypot(tx - 1200, ty - 505) <= 42) {
              this.reload3DTPS();
              this.vibrate(15);
              return;
            }
            // 3. Aim
            if (Math.hypot(tx - 1080, ty - 630) <= 42) {
              t.player.isAiming = !t.player.isAiming;
              this.vibrate(15);
              return;
            }
            // 4. Build Turret
            if (Math.hypot(tx - 1080, ty - 515) <= 42) {
              t.isBuilding = !t.isBuilding;
              audio.upgrade();
              this.vibrate(18);
              return;
            }
            // 5. Mech Mode (Robot / Tank)
            if (tx >= 835 && tx <= 945 && ty >= 620 && ty <= 675) {
              this.toggle3DMechMode();
              this.vibrate(25);
              return;
            }
            // 6. EMP Shockwave
            if (tx >= 835 && tx <= 945 && ty >= 550 && ty <= 605) {
              this.fire3DEMP();
              this.vibrate(30);
              return;
            }
            // 7. Missile Salvo
            if (tx >= 955 && tx <= 1065 && ty >= 550 && ty <= 605) {
              this.fire3DMissiles();
              this.vibrate(30);
              return;
            }

            // Movement Joystick vs Look Swipe
            if (tx < 500 && t.touch.moveId === null) {
              t.touch.moveId = touch.identifier;
              t.touch.moveStart = { x: tx, y: ty };
              t.touch.moveVec = { x: 0, y: 0 };
            } else if (tx >= 500 && t.touch.lookId === null) {
              if (!(tx >= 830 && ty >= 480)) {
                t.touch.lookId = touch.identifier;
                t.touch.lookLast = { x: tx, y: ty };
              }
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
          // Floating Wave / Speed Button (x: 1210, y: 450, radius: 36)
          if (Math.hypot(pos.x - 1210, pos.y - 450) <= 36) {
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
            const towerKeys = ['pulse', 'mortar', 'cryo', 'tesla', 'flame', 'railgun', 'beacon', 'barricade'];
            for (let i = 0; i < 8; i++) {
              const bx = 276 + i * 125;
              if (pos.x >= bx && pos.x <= bx + 120 && pos.y >= 625 && pos.y <= 715) {
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

        if (this.showSettingsModal && pos) {
          this.handleSettingsClick(pos.x, pos.y);
          return;
        }

        if (this.state === 'MENU') {
          if (this.apexSystem && this.apexSystem.setLookAtTarget && pos) {
            const nx = Math.max(-1, Math.min(1, (pos.x - 295) / 300));
            const ny = Math.max(-1, Math.min(1, (pos.y - 370) / 280));
            this.apexSystem.setLookAtTarget(nx, ny);
          }
          if (this.mechDragging && pos && this.apexSystem && this.apexSystem.mech) {
            const dx = pos.x - this.mechDragStart.lx;
            if (Math.abs(pos.x - this.mechDragStart.x) > 5) this.mechDragStart.moved = true;
            this.apexSystem.mech.yawVel = dx * 0.008;
            this.mechDragStart.lx = pos.x;
          }
        }

        if (this.state === 'MANUAL') {
          if (e.touches && e.touches.length === 2) {
            e.preventDefault();
            const curDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            if (this.codexPinchDist) {
              const ratio = curDist / this.codexPinchDist;
              this.codexZoom = Math.max(0.5, Math.min(2.2, (this.codexZoom || 1.0) * ratio));
            }
            this.codexPinchDist = curDist;
            this.codexDragging = false;
            return;
          }
          if (this.codexDragging && pos) {
            const dx = pos.x - this.codexDragStart.x;
            const dy = pos.y - this.codexDragStart.y;
            this.codexYaw = (this.codexYaw || 0) + dx * 0.012;
            this.codexYawVel = dx * 0.007;
            this.codexPitch = Math.max(-0.6, Math.min(0.8, (this.codexPitch !== undefined ? this.codexPitch : 0.28) + dy * 0.012));
            this.codexDragStart = { x: pos.x, y: pos.y };
            this.codexAutoRotate = false;
          }
        }

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
        this.isPointerDown = false;
        this.codexDragging = false;
        this.codexPinchDist = null;
        if (this.mechDragging) {
          this.mechDragging = false;
          if (this.apexSystem) this.apexSystem.pointerActive = false;
        }
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
          if (k === 't') { this.toggle3DMechMode(); return; }
          if (k === 'r') { this.fire3DMissiles(); return; }
          if (k === 'z') { this.fire3DEMP(); return; }
          if (k === 'b') { this.tps3D.isBuilding = !this.tps3D.isBuilding; audio.upgrade(); return; }
          if (e.code === 'Space') { e.preventDefault(); this.shoot3DTPS(); return; }
          if (e.key === 'Escape' || k === 'p') {
            this.state = (this.waveActive || this.wave > 1) ? 'PLAYING' : 'MENU';
            if (this.state === 'MENU') audio.playBGMTrack('menu');
            return;
          }
        }
        if (k === 'p' && this.state === 'PLAYING') {
          this.start3DTPSMode();
          return;
        }
        if (e.key >= '1' && e.key <= '8') {
          const keys = ['pulse', 'mortar', 'cryo', 'tesla', 'flame', 'railgun', 'beacon', 'barricade'];
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
        else if (k === 't') {
          if (this.selectedTower) this.cycleTargetPriority();
          else this.toggleHeroTransform();
        }
        else if (k === 'z') this.triggerSkill('emp');
        else if (k === 'x') this.triggerSkill('missiles');
        else if (k === 'c') this.triggerSkill('shield');
        else if (k === 'v') this.triggerSkill('overclock');
        else if (k === 'b') this.triggerSkill('orbital');
        else if (k === 'n') this.triggerSkill('drone');
        else if (k === 'h') this.hero.selected = !this.hero.selected;
        else if (k === 'f') {
          e.preventDefault();
          this.toggleFullscreen();
        } else if (k === 'm') {
          e.preventDefault();
          audio.toggleSFX();
          audio.toggleBGM();
          const isMuted = audio.sfxMuted && audio.bgmMuted;
          this.addFloatingText(isMuted ? "🔇 OVOZ O'CHIRILDI" : "🔊 OVOZ YOQILDI", 640, 100, isMuted ? "#ff5252" : "#00e676", 18);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          this.cycleSpeed();
        }
      });

      // Mouse Wheel for Desktop Web Players (Tower Selection cycling)
      this.canvas.addEventListener('wheel', (e) => {
        if (this.state === 'PLAYING') {
          const types = ['pulse', 'mortar', 'cryo', 'tesla', 'flame', 'railgun', 'beacon', 'barricade'];
          if (this.selectedBuildType) {
            let idx = types.indexOf(this.selectedBuildType);
            if (e.deltaY > 0) idx = (idx + 1) % types.length;
            else idx = (idx - 1 + types.length) % types.length;
            this.selectBuildType(types[idx]);
          }
        }
      }, { passive: true });
    }

    startMission(mapIdx = 0, mode = 'CAMPAIGN') {
      this.gameMode = mode;
      this.currentMapIndex = mapIdx;
      const savedCustom = localStorage.getItem('lg_custom_map');
      let customData = null;
      if (savedCustom) {
        try { customData = JSON.parse(savedCustom); } catch(e) {}
      }
      const customWaypoints = (customData && customData.waypoints && customData.waypoints.length >= 2) ? customData.waypoints : this.editorWaypoints;
      const customBiome = (customData && customData.biome) ? customData.biome : (this.editorBiome || 'cyber');
      const customGold = (customData && customData.gold) ? customData.gold : (this.editorGold || 350);
      const customWaves = (customData && customData.waves) ? customData.waves : (this.editorWaves || 20);

      const map = (mode === 'CUSTOM') ? {
        id: "custom", name: "Maxsus Sektor",
        gold: customGold, hp: 20, wave_count: customWaves, modifier: "none", biome: customBiome,
        lanes: [ customWaypoints ]
      } : MAPS[mapIdx];

      this.difficulty = localStorage.getItem('lg_difficulty') || 'NORMAL';
      const diffGoldMult = (this.difficulty === 'CASUAL') ? 1.25 : ((this.difficulty === 'HEROIC') ? 0.85 : 1.0);
      const diffHpMult = (this.difficulty === 'CASUAL') ? 1.2 : ((this.difficulty === 'HEROIC') ? 0.8 : 1.0);
      this.gold = Math.round((mode === 'BOSS_RUSH' ? 1200 : map.gold) * diffGoldMult);
      this.score = 0;
      this.baseHp = Math.round(map.hp * diffHpMult);
      this.maxBaseHp = this.baseHp;
      this.wave = 1;
      this.maxWaves = (mode === 'ENDLESS') ? 999 : (mode === 'BOSS_RUSH' ? 10 : map.wave_count);
      this.waveActive = false;
      this.waveCountdown = 8;
      this.speed = 1;
      try {
        const biome = (map && map.biome) ? map.biome : 'cyber';
        audio.playBGMTrack(biome);
        setTimeout(() => audio.playSample('hq_online', 0.8), 600);
      } catch(e) {}

      this.activeAugments = [];
      this.draftCards = [];
      this.analytics = {
        damageByTower: { pulse: 0, mortar: 0, cryo: 0, tesla: 0, flame: 0, railgun: 0, beacon: 0, hero: 0, skills: 0 },
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
      this.hero.mode = 'BIPED';
      this.hero.speed = 130;
      this.hero.siegeRecoil = 0;
      this.hero.siegeCooldown = 0;
      this.hero.shieldDome = null;

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
      const rawLanes = (map && map.lanes && map.lanes.length > 0) ? map.lanes : [[{ x: 64, y: 320 }, { x: 1216, y: 320 }]];
      this.bakedLanes = rawLanes.map(rawLane => {
        const lane = (rawLane && rawLane.length >= 2) ? rawLane : [{ x: 64, y: 320 }, { x: 1216, y: 320 }];
        let total = 0;
        const segments = [];
        for (let i = 0; i < lane.length - 1; i++) {
          const p1 = lane[i];
          const p2 = lane[i + 1];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          segments.push({ p1, p2, start: total, length: dist });
          total += dist;
        }
        return { totalLength: total, segments, waypoints: lane, points: lane };
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
      // Right-click cancel / deselect for PC desktop web players
      if (isRightClick) {
        if (this.aimingSkill) { this.aimingSkill = null; return; }
        if (this.selectedBuildType) { this.selectedBuildType = null; return; }
        if (this.radialBuildCell) { this.radialBuildCell = null; return; }
        if (this.selectedTower) { this.selectedTower = null; return; }
        if (this.hero && this.hero.selected) { this.hero.selected = false; return; }
        return;
      }
      // If Settings Modal is open -> handle settings interactions
      if (this.showSettingsModal) {
        this.handleSettingsClick(x, y);
        return;
      }
      if (this.state === 'TPS_3D') {
        if (x >= 20 && x <= 200 && y >= 15 && y <= 65) {
          this.state = (this.waveActive || this.wave > 1) ? 'PLAYING' : 'MENU';
          if (this.state === 'MENU') audio.playBGMTrack('menu');
          audio.sell();
          return;
        }
        // Mode toggle button [835..945, 620..675]
        if (x >= 835 && x <= 945 && y >= 620 && y <= 675) {
          this.toggle3DMechMode();
          return;
        }
        // EMP button [835..945, 550..605]
        if (x >= 835 && x <= 945 && y >= 550 && y <= 605) {
          this.fire3DEMP();
          return;
        }
        // Missile button [955..1065, 550..605]
        if (x >= 955 && x <= 1065 && y >= 550 && y <= 605) {
          this.fire3DMissiles();
          return;
        }
        // Fire button (1200, 625, r=48)
        if (Math.hypot(x - 1200, y - 625) <= 54) {
          if (this.tps3D.isBuilding) this.place3DTower();
          else this.shoot3DTPS();
          this.vibrate(22);
          return;
        }
        // Reload button (1200, 505, r=36)
        if (Math.hypot(x - 1200, y - 505) <= 42) {
          this.reload3DTPS();
          return;
        }
        // Aim button (1080, 630, r=36)
        if (Math.hypot(x - 1080, y - 630) <= 42) {
          this.tps3D.player.isAiming = !this.tps3D.player.isAiming;
          return;
        }
        // Build button (1080, 515, r=36)
        if (Math.hypot(x - 1080, y - 515) <= 42) {
          this.tps3D.isBuilding = !this.tps3D.isBuilding;
          audio.upgrade();
          return;
        }
        // Fallback tap to shoot if clicked in right upper gameplay area (not UI)
        if (x > 350 && !(x >= 830 && y >= 480)) {
          if (this.tps3D.isBuilding) this.place3DTower();
          else this.shoot3DTPS();
          return;
        }
        return;
      }
      if (this.state === 'MENU') {
        // Stage tap on Megatron 3D Body: Trigger Fusion Cannon Blast
        if (x >= 20 && x <= 580 && y >= 30 && y <= 700) {
          this.triggerMechAction();
          return;
        }

        // 3. Primary Hero Mission Cards (Row 1, y: 66 to 184)
        if (y >= 66 && y <= 184) {
          if (x >= 585 && x <= 924) {
            this.vibrate([25, 20, 35]);
            audio.click();
            this.startMission(0, 'CAMPAIGN');
            return;
          }
          if (x >= 928 && x <= 1265) {
            this.vibrate([25, 20, 35]);
            audio.click();
            this.startMission(9, 'ENDLESS');
            return;
          }
        }

        // 4. Tactical Operations (Row 2, y: 194 to 282)
        if (y >= 194 && y <= 282) {
          if (x >= 585 && x <= 810) {
            this.vibrate(15);
            audio.click();
            this.state = 'MAP_SELECT';
            return;
          }
          if (x >= 814 && x <= 1040) {
            this.vibrate([25, 20, 45]);
            audio.click();
            this.startMission(0, 'BOSS_RUSH');
            return;
          }
          if (x >= 1042 && x <= 1265) {
            this.vibrate(15);
            audio.click();
            this.state = 'EDITOR';
            return;
          }
        }

        // 5. Codex, Records & Achievements (Row 3, y: 288 to 376)
        if (y >= 288 && y <= 376) {
          if (x >= 585 && x <= 810) {
            this.vibrate(15);
            audio.click();
            this.state = 'MANUAL';
            if (this.apexSystem) this.apexSystem.hide();
            return;
          }
          if (x >= 814 && x <= 1040) {
            this.vibrate(15);
            audio.click();
            this.state = 'LEADERBOARD';
            return;
          }
          if (x >= 1042 && x <= 1265) {
            this.vibrate(20);
            audio.click();
            this.state = 'ACHIEVEMENTS';
            this.achievementsPage = 0;
            if (this.apexSystem) this.apexSystem.hide();
            return;
          }
        }

        // 6. Dossier Actions (y: 504 to 582)
        if (y >= 504 && y <= 582) {
          if (x >= 600 && x <= 816) {
            this.vibrate(15);
            audio.click();
            this.showSettingsModal = true;
            this.settingsReturnState = 'MENU';
            if (this.apexSystem) this.apexSystem.hide();
            return;
          }
          if (x >= 820 && x <= 1036) {
            this.vibrate([20, 15, 30]);
            audio.click();
            this.downloadApk();
            return;
          }
          if (x >= 1040 && x <= 1260) {
            this.vibrate(20);
            audio.click();
            this.state = 'ANALYTICS';
            this.achievementsPage = 0;
            if (this.apexSystem) this.apexSystem.hide();
            return;
          }
        }

        // Fullscreen Toggle (x: 875 to 972, y: 12 to 46)
        if (x >= 875 && x <= 972 && y >= 12 && y <= 46) {
          this.toggleFullscreen();
          audio.click();
          return;
        }

        // Quick Audio Mute / Unmute (x: 978 to 1076, y: 12 to 46)
        if (x >= 978 && x <= 1076 && y >= 12 && y <= 46) {
          audio.toggleSFX();
          audio.toggleBGM();
          audio.click();
          return;
        }

        // Language Switcher Top Right
        if (x >= 1085 && x <= 1245 && y >= 12 && y <= 46) {
          this.toggleLanguage();
          return;
        }
        return;
      }

      if (this.state === 'ACHIEVEMENTS') {
        // Back Button
        if (x >= 30 && x <= 160 && y >= 14 && y <= 56) {
          this.state = 'MENU';
          if (this.apexSystem) this.apexSystem.show();
          audio.playBGMTrack('menu');
          return;
        }
        // Prev Page
        if (x >= 860 && x <= 980 && y >= 14 && y <= 56) {
          this.achievementsPage = 0;
          audio.click();
          return;
        }
        // Next Page
        if (x >= 990 && x <= 1110 && y >= 14 && y <= 56) {
          this.achievementsPage = 1;
          audio.click();
          return;
        }

        // Claim Reward clicks
        const allList = this.getAchievementsList();
        const pageList = allList.slice((this.achievementsPage || 0) * 10, (this.achievementsPage || 0) * 10 + 10);
        for (let i = 0; i < pageList.length; i++) {
          const item = pageList[i];
          const col = i % 2;
          const row = Math.floor(i / 2);
          const cx = 150 + col * 485;
          const cy = 105 + row * 102;
          const bx = cx + 330;
          const by = cy + 28;
          if (x >= bx && x <= bx + 125 && y >= by && y <= by + 40) {
            if (item.isDone && !item.isClaimed) {
              this.saveData.achievements = this.saveData.achievements || {};
              this.saveData.achievements[item.id] = true;
              this.gold += item.reward;
              this.saveSave();
              audio.victory();
              this.vibrate([30, 20, 50]);
              this.addFloatingText(`+${item.reward}G MUKOFOT!`, 640, 180, "#ffd600", 24);
              return;
            }
          }
        }
        return;
      }

      if (this.state === 'DRAFT') {
        for (let i = 0; i < this.draftCards.length; i++) {
          const cx = 100 + i * 380;
          if (x >= cx && x <= cx + 320 && y >= 170 && y <= 590) {
            this.selectAugment(this.draftCards[i]);
            return;
          }
        }
        return;
      }

      if (this.state === 'ANALYTICS') {
        if (x >= 240 && x <= 620 && y >= 595 && y <= 660) {
          this.state = 'MENU';
          if (this.apexSystem) this.apexSystem.show();
          audio.playBGMTrack('menu');
          return;
        }
        if (x >= 660 && x <= 1040 && y >= 595 && y <= 660) {
          this.startMission(this.currentMapIndex, this.gameMode);
          return;
        }
        return;
      }

      if (this.state === 'MANUAL') {
        // Back to Menu
        if (x >= 20 && x <= 160 && y >= 10 && y <= 65) {
          this.state = 'MENU';
          if (this.apexSystem) this.apexSystem.show();
          audio.playBGMTrack('menu');
          return;
        }

        // Main Category Tabs
        if (y >= 15 && y <= 55) {
          if (x >= 440 && x <= 605) { this.codexTab = 'TOWERS'; this.codexSelectedId = 'pulse'; this.codexBranch = 'BASE'; audio.click(); this.vibrate(12); return; }
          if (x >= 620 && x <= 795) { this.codexTab = 'ENEMIES'; this.codexSelectedId = 'grunt'; audio.click(); this.vibrate(12); return; }
          if (x >= 810 && x <= 1005) { this.codexTab = 'BOSSES'; this.codexSelectedId = 'juggernaut'; audio.click(); this.vibrate(12); return; }
          if (x >= 1020 && x <= 1205) { this.codexTab = 'MECH'; this.codexSelectedId = 'biped'; this.codexBranch = 'BASE'; audio.click(); this.vibrate(12); return; }
        }

        // Left Item List clicks
        if (x >= 32 && x <= 316) {
          const tab = this.codexTab || 'TOWERS';
          const counts = { TOWERS: 8, ENEMIES: 9, BOSSES: 6, MECH: 5 };
          const count = counts[tab] || 8;
          const itemH = Math.min(68, Math.floor(590 / count));
          for (let i = 0; i < count; i++) {
            const iy = 88 + i * (itemH + 4);
            if (y >= iy && y <= iy + itemH) {
              const listMap = {
                TOWERS: ['pulse', 'mortar', 'cryo', 'tesla', 'flame', 'railgun', 'beacon', 'barricade'],
                ENEMIES: ['grunt', 'sprinter', 'brute', 'shieldbearer', 'medic', 'splitter', 'phantom', 'kamikaze_drone', 'gunship'],
                BOSSES: ['juggernaut', 'overseer', 'hive_titan', 'void_titan', 'chrono_phantom', 'mecha_colossus'],
                MECH: ['megatron', 'optimus', 'bumblebee', 'biped', 'siege']
              };
              const selList = listMap[tab] || listMap.TOWERS;
              if (selList[i]) {
                this.codexSelectedId = selList[i];
                audio.click();
                this.vibrate(15);
                return;
              }
            }
          }
        }

        // Right Dossier Sub-Tabs (Specs, Evolution/Counter, Lore)
        if (y >= 82 && y <= 118) {
          if (x >= 790 && x <= 935) { this.codexSubTab = 'SPECS'; audio.click(); this.vibrate(12); return; }
          if (x >= 940 && x <= 1095) { this.codexSubTab = 'BRANCHES'; audio.click(); this.vibrate(12); return; }
          if (x >= 1100 && x <= 1250) { this.codexSubTab = 'LORE'; audio.click(); this.vibrate(12); return; }
        }

        // Branch Selection Toggles (Base, Branch A, Branch B)
        if (y >= 122 && y <= 152) {
          if (x >= 790 && x <= 935) { this.codexBranch = 'BASE'; audio.click(); this.vibrate(12); return; }
          if (x >= 940 && x <= 1090) { this.codexBranch = 'BRANCH_A'; audio.click(); this.vibrate(12); return; }
          if (x >= 1095 && x <= 1250) { this.codexBranch = 'BRANCH_B'; audio.click(); this.vibrate(12); return; }
        }

        // Top Turntable HUD Controls (Reset & Lighting)
        if (y >= 80 && y <= 112) {
          // [⟲ MARKAZGA]
          if (x >= 470 && x <= 595) {
            this.codexYaw = 0.25;
            this.codexPitch = 0.20;
            this.codexZoom = 1.0;
            this.codexYawVel = 0;
            audio.click();
            this.vibrate(12);
            return;
          }
          // [💡 LIGHTING PRESET]
          if (x >= 598 && x <= 770) {
            if (this.codex3DEngine) {
              const newPreset = this.codex3DEngine.cycleLightingPreset();
              this.addFloatingText(`💡 YORUG'LIK: ${newPreset}`, 550, 140, "#00e5ff", 14);
            }
            audio.click();
            this.vibrate(15);
            return;
          }
        }

        // Action Demo Button (⚔️ JANG HARAKATINI KO'RISH)
        if (x >= 330 && x <= 770 && y >= 585 && y <= 642) {
          this.triggerCodexActionDemo();
          return;
        }

        // Quick Zoom & Reset Angle Controls (Row at y: 662 to 700)
        if (y >= 662 && y <= 702) {
          // [🔍 ZOOM +]
          if (x >= 330 && x <= 470) {
            this.codexZoom = Math.min(1.8, (this.codexZoom || 1.0) + 0.15);
            audio.click();
            return;
          }
          // [🔎 ZOOM -]
          if (x >= 478 && x <= 622) {
            this.codexZoom = Math.max(0.6, (this.codexZoom || 1.0) - 0.15);
            audio.click();
            return;
          }
          // [⟲ BURCHAK]
          if (x >= 628 && x <= 770) {
            this.codexYaw = 0.25;
            this.codexPitch = 0.20;
            this.codexZoom = 1.0;
            this.codexYawVel = 0;
            audio.click();
            this.vibrate(12);
            return;
          }
        }

        return;
      }

      if (this.state === 'MAP_SELECT') {
        if (y >= 10 && y <= 65 && x >= 20 && x <= 180) {
          this.state = 'MENU';
          if (this.apexSystem) this.apexSystem.show();
          audio.playBGMTrack('menu');
          return;
        }
        if (x >= 580 && x <= 920 && y >= 18 && y <= 58) {
          const idx = Math.floor((x - 580) / 110);
          const diffs = ['CASUAL', 'NORMAL', 'HEROIC'];
          if (diffs[idx]) {
            this.difficulty = diffs[idx];
            localStorage.setItem('lg_difficulty', this.difficulty);
            audio.click();
            this.vibrate(15);
          }
          return;
        }
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
        if (y >= 565 && y <= 700) {
          if (x >= 820 && x <= 1040) {
            this.startMission(0, 'CUSTOM');
            return;
          }
          if (x >= 1060 && x <= 1220) {
            this.state = 'EDITOR';
            return;
          }
        }
        return;
      }

      if (this.state === 'LEADERBOARD') {
        if ((y >= 15 && y <= 55 && x >= 30 && x <= 160) || (x >= 140 && x <= 380 && y >= 615 && y <= 665)) {
          this.state = 'MENU';
          if (this.apexSystem) this.apexSystem.show();
          audio.playBGMTrack('menu');
          return;
        }
        if (x >= 400 && x <= 640 && y >= 615 && y <= 665) {
          this.fetchLiveScores();
          audio.click();
          this.addFloatingText("REYTINGLAR YANGILANDI!", 640, 200, "#00e5ff", 20);
          return;
        }
        if ((x > 1050 && x < 1240 && y > 15 && y < 55) || (x >= 660 && x <= 900 && y >= 615 && y <= 665)) {
          const newName = prompt("Enter CyberCommander handle:", this.playerName);
          if (newName && newName.trim()) {
            this.playerName = newName.trim().substring(0, 18);
            localStorage.setItem('last_grid_player_name', this.playerName);
          }
          return;
        }
        if (x >= 920 && x <= 1160 && y >= 615 && y <= 665) {
          this.state = 'MAP_SELECT';
          audio.click();
          return;
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
        else if (x >= 750 && x <= 950 && y >= 405 && y <= 470) {
          this.state = 'MENU';
          if (this.apexSystem) this.apexSystem.show();
          audio.playBGMTrack('menu');
        }
        return;
      }

      // Handle Tactic Pause Modal Clicks (Davom etish, Sozlamalar, Chiqish)
      if (this.state === 'PAUSED') {
        // Button 1: Davom Etish (Resume Combat: 440, 340, 400, 50)
        if (x >= 440 && x <= 840 && y >= 340 && y <= 390) {
          this.state = 'PLAYING';
          audio.modal();
          this.vibrate(15);
          return;
        }
        // Button 2: Sozlamalar (440, 405, 400, 50)
        if (x >= 440 && x <= 840 && y >= 405 && y <= 455) {
          this.showSettingsModal = true;
          this.settingsReturnState = 'PAUSED';
          if (this.apexSystem) this.apexSystem.hide();
          audio.click();
          this.vibrate(15);
          return;
        }
        // Button 3: Asosiy Menyuga Qaytish (440, 470, 400, 50)
        if (x >= 440 && x <= 840 && y >= 470 && y <= 520) {
          this.state = 'MENU';
          this.selectedTower = null;
          this.selectedBuildType = null;
          this.radialBuildCell = null;
          if (this.apexSystem) this.apexSystem.show();
          audio.playBGMTrack('menu');
          audio.sell();
          this.vibrate(25);
          return;
        }
        return; // Click blocked by pause overlay
      }

      // Tutorial Skip Click
      if (this.currentMapIndex === 0 && !localStorage.getItem('lg_tutorial_done') && x >= 1090 && x <= 1240 && y >= 15 && y <= 50) {
        localStorage.setItem('lg_tutorial_done', 'true');
        this.addFloatingText("TUTORIAL O'TKAZILDI", 640, 100, "#ffd600");
        return;
      }

      // 1. Mobile Floating Thumb Buttons (⚡ ULT & ▶ WAVE/SPEED)
      if (Math.hypot(x - 1210, y - 540) <= 45) {
        this.triggerHeroUlt();
        this.vibrate([40, 25, 70]);
        return;
      }
      if (Math.hypot(x - 1210, y - 450) <= 36) {
        if (!this.waveActive) this.callNextWave();
        else this.cycleSpeed();
        this.vibrate(20);
        return;
      }

      // Radar Minimap Click / Tactical Waypoint Navigation
      if (x >= 1118 && x <= 1266 && y >= 62 && y <= (this.minimapExpanded ? 162 : 92)) {
        if (y <= (this.minimapExpanded ? 84 : 92)) {
          this.minimapExpanded = !this.minimapExpanded;
          audio.click();
        } else if (this.minimapExpanded) {
          const ix = 1118 + 6;
          const iy = 62 + 22;
          const iw = 148 - 12;
          const ih = 100 - 26;
          const targetWorldX = Math.max(64, Math.min(1216, (x - ix) / (iw / 1280)));
          const targetWorldY = Math.max(64, Math.min(640, (y - iy) / (ih / 704)));
          this.hero.targetX = targetWorldX;
          this.hero.targetY = targetWorldY;
          this.hero.selected = false;
          this.hero.dashSpeedBoost = 2.4;
          this.hero.dashTimer = 0.45;
          this.spawnShockwave(targetWorldX, targetWorldY, 35, "#00e5ff");
          this.addFloatingText("RADAR WAYPOINT", targetWorldX, targetWorldY - 20, "#00e5ff", 14);
          if (audio) audio.shootPulse();
          this.vibrate([20, 20]);
        }
        return;
      }

      // 2. Mobile Quick Radial Build Wheel Clicks
      if (this.radialBuildCell) {
        const rc = this.radialBuildCell;
        const towerList = ['pulse', 'mortar', 'cryo', 'tesla', 'flame', 'railgun', 'beacon', 'barricade'];
        let chosen = null;
        for (let i = 0; i < 8; i++) {
          const ang = -Math.PI / 2 + (Math.PI * 2 / 8) * i;
          const bx = rc.px + Math.cos(ang) * 84;
          const by = rc.py + Math.sin(ang) * 84;
          if (Math.hypot(x - bx, y - by) <= 28) {
            chosen = towerList[i];
            break;
          }
        }
        if (chosen) {
          this.buildTower(chosen, rc.gx, rc.gy);
          this.radialBuildCell = null;
          this.vibrate([25, 30, 25]);
          return;
        } else {
          // Tapped outside radial buttons or center dismisses
          this.radialBuildCell = null;
          return;
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
        else if (x >= 720 && x <= 852) {
          this.showSettingsModal = true;
          this.settingsReturnState = (this.state === 'PAUSED' ? 'PAUSED' : 'PLAYING');
          if (this.apexSystem) this.apexSystem.hide();
          audio.click();
        }
        else if (x >= 855 && x <= 968) this.togglePause();
        else if (x >= 970 && x <= 1090) {
          this.state = 'PAUSED';
          audio.modal();
        }
        else if (x >= 1092 && x <= 1265) {
          this.start3DTPSMode();
          return;
        }
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

      // Tactical Holographic Radial Tower Clicks (When tower is selected)
      if (this.selectedTower) {
        const t = this.selectedTower;
        const def = TOWER_DEFS[t.type];

        // Top Upgrade / Branch Clicks
        if (t.tier === 2) {
          if (x >= t.x - 110 && x <= t.x - 5 && y >= t.y - 70 && y <= t.y - 34) { this.upgradeBranch('A'); return; }
          if (x >= t.x + 5 && x <= t.x + 110 && y >= t.y - 70 && y <= t.y - 34) { this.upgradeBranch('B'); return; }
        } else if (t.tier === 1) {
          if (x >= t.x - 70 && x <= t.x + 70 && y >= t.y - 65 && y <= t.y - 29) { this.upgradeSelectedTower(); return; }
        }

        // Left Sell Click
        if (x >= t.x - 115 && x <= t.x - 40 && y >= t.y - 18 && y <= t.y + 18) { this.sellSelectedTower(); return; }

        // Right Priority Click
        if (x >= t.x + 40 && x <= t.x + 115 && y >= t.y - 18 && y <= t.y + 18) { this.cycleTargetPriority(); return; }

        // Bottom Close Click
        if (x >= t.x - 35 && x <= t.x + 35 && y >= t.y + 40 && y <= t.y + 68) { this.selectedTower = null; return; }
      }

      // 5. Bottom Bar actions
      if (y >= 620) {
        this.radialBuildCell = null;

        // Hero Mech Ult button at x: 5 to 49
        if (x >= 5 && x <= 49) { this.triggerHeroUlt(); this.vibrate([40, 25, 70]); return; }

        // Hero Mech Mode Toggle button at x: 50 to 95
        if (x >= 50 && x <= 95) { this.toggleHeroTransform(); return; }

        // Commander Super Skills Mobile Buttons (x: 98, 142, 186, 230; each w: 40)
        if (x >= 96 && x <= 139) { this.triggerSkill('emp'); this.vibrate(20); return; }
        else if (x >= 140 && x <= 183) { this.triggerSkill('missiles'); this.vibrate(20); return; }
        else if (x >= 184 && x <= 227) { this.triggerSkill('shield'); this.vibrate(20); return; }
        else if (x >= 228 && x <= 273) { this.triggerSkill('overclock'); this.vibrate(20); return; }

        if (this.selectedTower) {
          const t = this.selectedTower;
          const def = TOWER_DEFS[t.type];

          // Tier 3 Branch A and Branch B buttons
          if (t.tier === 2) {
            if (x >= 485 && x <= 635 && y >= 630 && y <= 705) { this.upgradeBranch('A'); this.vibrate([25, 30, 25]); return; }
            if (x >= 640 && x <= 790 && y >= 630 && y <= 705) { this.upgradeBranch('B'); this.vibrate([25, 30, 25]); return; }
          } else {
            // Normal Upgrade (Tier 1 -> Tier 2)
            if (x >= 515 && x <= 665 && y >= 630 && y <= 705) { this.upgradeSelectedTower(); this.vibrate([25, 30, 25]); return; }
          }

          // Sell button
          if (x >= 795 && x <= 915 && y >= 630 && y <= 705) { this.sellSelectedTower(); this.vibrate(20); return; }
          // Priority button
          if (x >= 920 && x <= 1045 && y >= 630 && y <= 705) { this.cycleTargetPriority(); this.vibrate(15); return; }
          // Close button
          if (x >= 1050 && x <= 1110 && y >= 630 && y <= 705) { this.selectedTower = null; return; }
        } else {
          // 8 Hotbar Items (7 Towers + Barricade)
          const hotbarKeys = ['pulse', 'mortar', 'cryo', 'tesla', 'flame', 'railgun', 'beacon', 'barricade'];
          for (let i = 0; i < 8; i++) {
            const bx = 276 + i * 125;
            if (x >= bx && x <= bx + 120 && y >= 625 && y <= 715) {
              if (i === 7) {
                this.selectedBuildType = (this.selectedBuildType === 'barricade') ? null : 'barricade';
              } else {
                this.selectBuildType(hotbarKeys[i]);
              }
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

    // --- BATTLEFIELD DYNAMICS METHODS (v4.0.0) ---
    triggerRadioComm(speaker, text, duration = 4.5, sampleKey = null) {
      this.radioComm = {
        speaker: speaker || "HQ COMMANDER",
        text: text || "",
        maxTimer: duration,
        timer: duration,
        anim: 0
      };
      audio.voiceRadio(text, sampleKey);
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

      // Multi-line wrap
      const words = visibleText.split(" ");
      let line1 = "", line2 = "";
      for (const w of words) {
        if ((line1 + " " + w).length <= 44) line1 += (line1 ? " " : "") + w;
        else line2 += (line2 ? " " : "") + w;
      }
      ctx.fillText(line1, bx + 12, by + 50);
      if (line2) ctx.fillText(line2, bx + 12, by + 64);

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
        if (ad.planeX < this.width + 160) {
          ad.planeX += ad.planeSpeed * dt;
          if (!ad.cargoDropped && Math.random() < 0.45 && this.particles.length < 250) {
            this.particles.push({
              x: ad.planeX - 35, y: ad.planeY,
              vx: -40, vy: (Math.random() * 6 - 3),
              color: "rgba(200, 230, 255, 0.4)", size: 3, growth: 8, life: 0.4, maxLife: 0.4
            });
          }
          if (!ad.cargoDropped && ad.planeX >= ad.targetX) {
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
              if (this.particles.length < 250) {
                this.particles.push({
                  x: ad.crateX, y: ad.crateY,
                  vx: (Math.random() * 80 - 40),
                  vy: (Math.random() * 40 - 20),
                  color: "#e2e8f0", size: 3, life: 0.4, maxLife: 0.4
                });
              }
            }
            this.addFloatingText("📦 AIRDROP YERGA TUSHDI!", ad.crateX, ad.crateY - 20, "#ffd600", 15);
          }
        }
        if (ad.landed && !ad.looted) {
          ad.smokeFlareTimer -= dt;
          if (Math.random() < 0.4 && this.particles.length < 250) {
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
          // Unlooted supply expires after 40 seconds so it never accumulates
          if (ad.smokeFlareTimer <= -40) {
            this.airdrops.splice(i, 1);
            continue;
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
            this.spawnScorchMark(sh.targetX, sh.targetY, 24);
            for (let k = 0; k < 16; k++) {
              if (this.particles.length < 250) {
                this.particles.push({
                  x: sh.targetX, y: sh.targetY,
                  vx: (Math.random() * 180 - 90),
                  vy: (Math.random() * 180 - 90),
                  color: Math.random() < 0.5 ? "#ff3d00" : "#ff9100",
                  size: 3 + Math.random() * 4, growth: 8, life: 0.5, maxLife: 0.5
                });
              }
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

    toggleFullscreen() {
      try {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          const docEl = document.documentElement;
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(() => {});
          } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
          }
          if (this.addFloatingText) this.addFloatingText("⛶ FULLSCREEN FAOL", 640, 100, "#00e5ff", 18);
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
          if (this.addFloatingText) this.addFloatingText("WINDOWED REJIM", 640, 100, "#ffd600", 18);
        }
      } catch (err) {}
      setTimeout(() => this.resizeCanvas(), 120);
    }

    downloadApk() {
      if (typeof window !== 'undefined' && window.AndroidBridge) {
        if (this.addFloatingText) this.addFloatingText("Siz Android APK dasiz (v4.1.0)!", 640, 360, "#00e676", 18);
        return;
      }
      const isWeb = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
      const url = (isWeb && window.location.hostname.includes('vercel'))
        ? 'https://raw.githubusercontent.com/nematjanoovv-max/UI_UX_18_11_2026/main/TowerDefense_LastGrid_v4.1.0.apk'
        : 'TowerDefense_LastGrid_v4.1.0.apk';
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TowerDefense_LastGrid_v4.1.0.apk';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (this.addFloatingText) this.addFloatingText("APK YUKLAB OLINMOQDA (v4.1.0)...", 640, 360, "#00e676", 18);
    }

    downloadOfflineZip() {
      const isWeb = typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http');
      const url = (isWeb && window.location.hostname.includes('vercel'))
        ? 'last-grid-offline-v2.zip'
        : 'last-grid-offline-v2.zip';
      const a = document.createElement('a');
      a.href = url;
      a.download = 'last-grid-offline-v2.zip';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (this.addFloatingText) this.addFloatingText("OFFLINE ZIP YUKLAB OLINMOQDA...", 640, 360, "#ffd600", 18);
    }

    handleEditorClick(x, y) {
      if (y >= 10 && y <= 55) {
        // 1. Menu
        if (x >= 20 && x <= 115) { this.state = 'MENU'; if (this.apexSystem) this.apexSystem.show(); audio.playBGMTrack('menu'); return; }
        // 2. Test Play
        if (x >= 120 && x <= 245) {
          if (this.editorWaypoints.length < 2) {
            this.addFloatingText("⚠️ KAMIDA 2 TA NUQTA KERAK (SPAWN VA CORE)!", 640, 200, "#ff1744", 22);
            audio.sell();
            this.vibrate([40, 30, 40]);
            return;
          }
          this.startMission(0, 'CUSTOM');
          return;
        }
        // 3. Save
        if (x >= 250 && x <= 355) {
          if (this.editorWaypoints.length < 2) {
            this.addFloatingText("⚠️ KAMIDA 2 TA NUQTA BELGILANG!", 640, 200, "#ff1744", 22);
            audio.sell();
            this.vibrate([40, 30, 40]);
            return;
          }
          localStorage.setItem('lg_custom_map', JSON.stringify({
            waypoints: this.editorWaypoints,
            biome: this.editorBiome || 'cyber',
            waves: this.editorWaves || 20,
            gold: this.editorGold || 350
          }));
          this.addFloatingText("💾 XARITA SAQLANDI!", 640, 200, "#ffd600", 24);
          audio.upgrade();
          return;
        }
        // 4. Clear
        if (x >= 360 && x <= 455) {
          this.editorWaypoints = [{ x: 64, y: 320 }];
          this.addFloatingText("XARITA TOZALANDI!", 640, 200, "#ff1744", 20);
          audio.sell();
          return;
        }
        // 5. Export
        if (x >= 460 && x <= 555) {
          prompt("Xarita JSON nusxasi:", JSON.stringify({
            waypoints: this.editorWaypoints,
            biome: this.editorBiome || 'cyber',
            waves: this.editorWaves || 20,
            gold: this.editorGold || 350
          }));
          return;
        }
        // 6. Import
        if (x >= 560 && x <= 655) {
          const input = prompt("Xarita JSON kodini kiriting:");
          if (input) {
            try {
              const parsed = JSON.parse(input);
              if (Array.isArray(parsed) && parsed.length >= 2) this.editorWaypoints = parsed;
              else if (parsed.waypoints && parsed.waypoints.length >= 2) {
                this.editorWaypoints = parsed.waypoints;
                if (parsed.biome) this.editorBiome = parsed.biome;
                if (parsed.waves) this.editorWaves = parsed.waves;
                if (parsed.gold) this.editorGold = parsed.gold;
              }
              this.addFloatingText("XARITA YUKLANDI!", 640, 200, "#00e676", 24);
              audio.upgrade();
            } catch(e) {}
          }
          return;
        }
        // 7. Biome Toggle
        if (x >= 660 && x <= 790) {
          const biomes = ['cyber', 'lava', 'cryo'];
          const curIdx = biomes.indexOf(this.editorBiome || 'cyber');
          this.editorBiome = biomes[(curIdx + 1) % biomes.length];
          audio.click();
          return;
        }
        // 8. Waves Toggle
        if (x >= 795 && x <= 905) {
          const waveOptions = [10, 15, 20, 25, 30];
          const wIdx = waveOptions.indexOf(this.editorWaves || 20);
          this.editorWaves = waveOptions[(wIdx + 1) % waveOptions.length];
          audio.click();
          return;
        }
        // 9. Gold Toggle
        if (x >= 910 && x <= 1020) {
          const goldOptions = [250, 350, 500, 1000];
          const gIdx = goldOptions.indexOf(this.editorGold || 350);
          this.editorGold = goldOptions[(gIdx + 1) % goldOptions.length];
          audio.click();
          return;
        }
        // 10. Undo
        if (x >= 1025 && x <= 1130) {
          if (this.editorWaypoints.length > 1) {
            this.editorWaypoints.pop();
            audio.sell();
          }
          return;
        }
      }
      if (y >= 65 && y <= 660) {
        const gx = Math.floor(x / 64) * 64 + 32;
        const gy = Math.floor(y / 64) * 64 + 32;
        const existingIdx = this.editorWaypoints.findIndex(pt => Math.hypot(pt.x - gx, pt.y - gy) < 32);
        if (existingIdx > 0 && this.editorWaypoints.length > 2) {
          this.editorWaypoints.splice(existingIdx, 1);
          audio.sell();
        } else {
          this.editorWaypoints.push({ x: gx, y: gy });
          audio.build();
        }
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

    toggleHeroTransform() {
      const h = this.hero;
      if (h.mode === 'BIPED') {
        h.mode = 'SIEGE';
        h.speed = 45;
        h.siegeCooldown = 0.5;
        h.siegeRecoil = 0;
        audio.mechTransform();
        this.screenShake = 6;
        this.spawnShockwave(h.x, h.y, 65, "#ffd600");
        this.addFloatingText("🚜 SIEGE TANK (+50% ZIRH • 120MM GAUBITSA)", h.x, h.y - 32, "#ffd600", 17);
        this.triggerRadioComm("APEX-01 AI", "TRANSFORMATSIYA: SIEGE TANK REJIMI FAOL! 120mm gaubitsa va og'ir zirh ishga tushdi!", 4.0);
        this.vibrate([40, 30, 80]);
      } else {
        h.mode = 'BIPED';
        h.speed = 130;
        audio.mechTransform();
        this.screenShake = 4;
        this.spawnShockwave(h.x, h.y, 50, "#00e5ff");
        this.addFloatingText("🤖 ROBOT REJIMI (130 TEZLIK • PLAZMA KATANA)", h.x, h.y - 32, "#00e5ff", 17);
        this.triggerRadioComm("APEX-01 AI", "TRANSFORMATSIYA: ASSAULT ROBOT REJIMI! Yuqori manyovr va katana faol!", 4.0);
        this.vibrate([30, 20, 60]);
      }
    }

    damageHero(rawDmg) {
      let dmg = rawDmg;
      if (this.hero.shieldDome && this.hero.shieldDome.hp > 0) {
        const absorb = Math.min(this.hero.shieldDome.hp, dmg);
        this.hero.shieldDome.hp -= absorb;
        dmg -= absorb;
        this.addFloatingText(`-${absorb} QALQON`, this.hero.x, this.hero.y - 22, "#00e5ff", 14);
        if (dmg <= 0) return;
      }
      if (this.hero.mode === 'SIEGE') {
        dmg *= 0.50; // +50% armor damage reduction in SIEGE mode!
      }
      this.hero.hp = Math.max(0, this.hero.hp - dmg);
      this.addFloatingText(`-${Math.round(dmg)} HP`, this.hero.x, this.hero.y - 15, "#ff1744", 15);
      if (this.hero.hp <= 0) {
        this.hero.hp = 1;
        this.addFloatingText("⚡ EMERGENCY SHIELD REBOOT!", this.hero.x, this.hero.y - 30, "#ffd600", 18);
        this.triggerRadioComm("APEX-01 AI", "OGOHLANTIRISH: Mech kritik shikastlandi! Favqulodda qayta yuklash faol!", 3.5);
      }
    }

    // --- COMMANDER SKILLS ---
    triggerSkill(skillKey) {
      const s = this.skills[skillKey];
      if (!s) return;
      if (s.currentCd > 0) return;
      if (this.gold < s.cost) {
        this.addFloatingText(this.t("notEnoughGold"), 640, 600, "#ff1744");
        return;
      }
      if (skillKey === 'overclock') {
        this.gold -= s.cost;
        s.currentCd = s.cd;
        s.activeTime = 8.0;
        audio.upgrade();
        this.screenShake = 4;
        this.analytics.damageByTower.skills += 50;
        this.addFloatingText("OVERCLOCK ACTIVE! (+80% ROF / 8s)", 640, 200, "#ffd600", 24);
      } else if (skillKey === 'shield') {
        this.gold -= s.cost;
        s.currentCd = s.cd;
        const shieldMaxHp = this.hasAugment("nanite_aegis") ? 1500 : 1000;
        this.hero.shieldDome = { active: true, radius: 170, maxHp: shieldMaxHp, hp: shieldMaxHp, duration: 10.0, timer: 10.0 };
        audio.shieldDome();
        this.screenShake = 5;
        this.spawnShockwave(this.hero.x, this.hero.y, 170, "#00e5ff");
        this.addFloatingText(`🛡️ SHIELD DOME FAOL (${shieldMaxHp} HP / 10s)!`, this.hero.x, this.hero.y - 30, "#00e5ff", 22);
        this.triggerRadioComm("HQ COMMANDER", "Qalqon gumbazi o'rnatildi! Barcha zarbalar yutiladi!", 3.5);
      } else if (skillKey === 'missiles') {
        this.gold -= s.cost;
        s.currentCd = s.cd;
        audio.missileLaunch();
        this.screenShake = 6;
        this.addFloatingText("🚀 MICRO-MISSILE SWARM (12 RAKETA)!", this.hero.x, this.hero.y - 30, "#ff9100", 22);
        this.triggerRadioComm("APEX-01 AI", "Mikro-raketalar yelka bo'lmasidan uchirildi! Nishonlar o'q ostida!", 3.5);
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            if (this.state !== 'PLAYING') return;
            let target = null;
            if (this.enemies.length > 0) {
              const pool = this.enemies.filter(e => !e.phased);
              target = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
            }
            const offsetAng = (i % 2 === 0 ? -1 : 1) * (0.3 + Math.random() * 0.5);
            const launchAng = (this.hero.angle || 0) + offsetAng;
            this.projectiles.push({
              type: 'missile',
              x: this.hero.x + Math.cos(launchAng) * 16,
              y: this.hero.y + Math.sin(launchAng) * 16,
              angle: launchAng,
              speed: 460,
              target: target,
              targetX: target ? target.x : this.hero.x + Math.cos(launchAng) * 280,
              targetY: target ? target.y : this.hero.y + Math.sin(launchAng) * 280,
              damage: 75,
              splash: 40,
              life: 3.2
            });
            audio.missileLaunch();
          }, i * 55);
        }
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
        this.screenShake = 10;
        this.spawnShockwave(x, y, 260, "#00e5ff");
        this.spawnShockwave(x, y, 160, "#ffffff");
        const stunDur = this.hasAugment("tesla_overcharge") ? 10.0 : 4.0;
        for (const e of this.enemies) {
          if (Math.hypot(e.x - x, e.y - y) <= 260) {
            e.slowRatio = 1.0;
            e.slowTimer = stunDur;
            e.shield = 0; // Destroy 100% of enemy shields!
            this.applyDamage(e, 120, 'SKILL');
            this.addFloatingText(this.hasAugment("tesla_overcharge") ? "⚡ TESLA OVERCHARGE STUN (10s)!" : "⚡ EMP STUN + SHIELD SHATTER!", e.x, e.y - 14, "#00e5ff", 14);
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
      if (this.gameMode === 'ENDLESS' && waveNum > 20) {
        const ovMult = (1 + (waveNum - 20) * 0.04).toFixed(2);
        this.addCombatFeed("OVERDRIVE", `DEFENSE OVERDRIVE x${ovMult} DMG ACTIVE!`, "#00e5ff", "⚡");
      }

      // Trigger Cinematic Wave Alert Banner
      const bossGroup = groups.find(g => ENEMY_DEFS[g.type] && ENEMY_DEFS[g.type].isBoss);
      const isBoss = !!bossGroup;
      const bossDef = isBoss ? ENEMY_DEFS[bossGroup.type] : null;
      const title = isBoss ? `⚠ BOSS DETECTED — WAVE ${waveNum}!` : `WAVE ${waveNum} INBOUND`;
      const subtitle = isBoss ?
        `${bossDef.name.toUpperCase()} (HP: ${bossDef.hp}) — HEAVY TITAN CLASS` :
        `HOSTILE SWARM APPROACHING GRID DEFENSE PERIMETER`;

      this.cinematicBanner = {
        title: title,
        subtitle: subtitle,
        isBoss: isBoss,
        duration: 3.2,
        timer: 3.2,
        color: isBoss ? "#ff1744" : "#00e5ff"
      };

      if (isBoss) {
        audio.emergencySiren();
        this.screenShake = 12;
        this.addCombatFeed("TITAN INBOUND", `${bossDef.name.toUpperCase()} DETECTED!`, "#ff1744", "💀");
      } else {
        audio.waveClear();
        this.addCombatFeed("WAVE INBOUND", `SECTOR DEFENSE: WAVE ${waveNum}`, "#ff9100", "⚠️");
      }
    }

    spawnEnemy(type, laneIdx) {
      const def = ENEMY_DEFS[type] || ENEMY_DEFS['grunt'];
      const map = (this.gameMode === 'CUSTOM') ? { modifier: "none" } : MAPS[this.currentMapIndex];
      let spdMult = 1.0;
      let armorMult = 1.0;
      let hpMult = 1.0;

      // Difficulty scaling
      if (this.difficulty === 'CASUAL') hpMult *= 0.80;
      else if (this.difficulty === 'HEROIC') hpMult *= 1.30;

      if (this.hasAugment("bounty_hunter")) spdMult *= 1.10;
      if (this.gameMode === 'ENDLESS' && this.wave > 20) {
        // Balanced scaling curve: 1.12 for first 20 waves, then steady 1.04 afterwards
        hpMult *= Math.pow(1.12, 19) * Math.pow(1.04, this.wave - 20);
      } else if (this.gameMode === 'CAMPAIGN' && this.wave > 1) {
        hpMult *= Math.pow(1.12, this.wave - 1);
      }

      if (map.modifier === 'fast_lane') spdMult = 1.15;
      if (map.modifier === 'armored') armorMult = 1.20;

      // Higher bounty rewards in endless mode to sustain defenses
      let bounty = Math.round((def.bounty || 4) + (this.gameMode === 'ENDLESS' ? 1.4 : 0.6) * this.wave);
      if (map.modifier === 'scarce') bounty = Math.floor(bounty * 0.8);
      if (this.hasAugment("bounty_hunter")) bounty = Math.floor(bounty * 1.30);

      if (def.isBoss) {
        this.triggerRadioComm("HQ OVERWATCH", `☠️ DIQQAT: ${def.name.toUpperCase()} JANG MAYDONIGA KIRDI! Barcha olovni jamlang!`, 5.0);
        this.screenShake = 20;
        audio.bossSiren();
        audio.playBGMTrack('boss');
        audio.playSample('hq_boss', 0.85);
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
        name: def.name || type,
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
        isFlyer: !!def.isFlyer,
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
        const dt = Math.min(0.05, Math.max(0.001, (timestamp - this.lastTimestamp) / 1000.0));
        this.lastTimestamp = timestamp;
        this.uiTime = (this.uiTime || 0) + dt;

        // Animate Button Click Ripples
        if (this.buttonRipples && this.buttonRipples.length > 0) {
          for (let i = this.buttonRipples.length - 1; i >= 0; i--) {
            const rip = this.buttonRipples[i];
            rip.r += dt * 85;
            rip.alpha -= dt * 2.2;
            if (rip.alpha <= 0 || rip.r >= rip.maxR) this.buttonRipples.splice(i, 1);
          }
        }

        try {
          if (this.state === 'PLAYING') {
            for (let i = 0; i < this.speed; i++) this.update(dt);
          } else if (this.state === 'TPS_3D') {
            this.update3DTPS(dt);
          } else if (this.state === 'MANUAL') {
            this.updateCodex(dt);
          }
          this.render();
        } catch (err) {
          console.error("Game loop execution caught error:", err);
        } finally {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }

    update(dt) {
      // Memory Flatness & Collection Bounds (prevents mobile WebView GC lag spikes)
      if (this.particles.length > 250) this.particles.splice(0, this.particles.length - 250);
      if (this.casings.length > 60) this.casings.splice(0, this.casings.length - 60);
      if (this.footprints.length > 40) this.footprints.splice(0, this.footprints.length - 40);
      if (this.scorchMarks.length > 35) this.scorchMarks.splice(0, this.scorchMarks.length - 35);
      if (this.floatingTexts.length > 30) this.floatingTexts.splice(0, this.floatingTexts.length - 30);
      if (this.groundHazards.length > 15) this.groundHazards.splice(0, this.groundHazards.length - 15);
      if (this.projectiles.length > 150) this.projectiles.splice(0, this.projectiles.length - 150);

      if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - 20 * dt);

      if (this.cinematicBanner && this.cinematicBanner.timer > 0) {
        this.cinematicBanner.timer = Math.max(0, this.cinematicBanner.timer - dt);
      }

      // Combat Kill Feed Decay & Smooth Slide
      if (this.combatFeed) {
        for (let i = this.combatFeed.length - 1; i >= 0; i--) {
          const item = this.combatFeed[i];
          item.timer -= dt;
          item.slide = Math.min(1.0, (item.slide || 0) + dt * 8);
          if (item.timer <= 0) this.combatFeed.splice(i, 1);
        }
      }
      if (this.heroKillStreak > 0 && Date.now() - this.lastHeroKillTime > 4000) {
        this.heroKillStreak = 0;
      }

      if (this.bossAlert && this.bossAlert.timer > 0) {
        this.bossAlert.timer = Math.max(0, this.bossAlert.timer - dt);
      }
      this.updateBiomeParticles(dt);

      // Flying Gold Coins Update
      for (let i = this.flyingCoins.length - 1; i >= 0; i--) {
        const c = this.flyingCoins[i];
        c.progress += dt * c.speed;
        if (c.progress >= 1.0) {
          this.flyingCoins.splice(i, 1);
        } else {
          // Quadratic bezier trajectory towards top gold counter (180, 30)
          const t = c.progress;
          const ctrlX = (c.startX + c.targetX) / 2 + c.curveOffset;
          const ctrlY = Math.min(c.startY, c.targetY) - 60;
          c.x = (1 - t) * (1 - t) * c.startX + 2 * (1 - t) * t * ctrlX + t * t * c.targetX;
          c.y = (1 - t) * (1 - t) * c.startY + 2 * (1 - t) * t * ctrlY + t * t * c.targetY;
        }
      }

      // Upgrade Light Pillars Update
      for (let i = this.upgradePillars.length - 1; i >= 0; i--) {
        const p = this.upgradePillars[i];
        p.timer -= dt;
        if (p.timer <= 0) this.upgradePillars.splice(i, 1);
      }

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

      const skillCdMult = this.hasAugment("chronos_overdrive") ? 1.35 : 1.0;
      for (const k in this.skills) {
        if (this.skills[k].currentCd > 0) this.skills[k].currentCd = Math.max(0, this.skills[k].currentCd - dt * skillCdMult);
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

          // 4. Void Titan Gravity Well (Every 4.5s)
          if (e.type === 'void_titan' && e.abilityTimer >= 4.5) {
            e.abilityTimer = 0;
            this.spawnShockwave(e.x, e.y, 160, "#9c27b0");
            this.addFloatingText("🌌 VOID GRAVITY VORTEX!", e.x, e.y - 36, "#ba68c8", 20);
            if (audio) audio.zap();
            // Pull hero and nearby barricades
            if (this.hero) {
              const dHero = Math.hypot(this.hero.x - e.x, this.hero.y - e.y);
              if (dHero <= 200) {
                const pullAngle = Math.atan2(e.y - this.hero.y, e.x - this.hero.x);
                this.hero.x += Math.cos(pullAngle) * 35;
                this.hero.y += Math.sin(pullAngle) * 35;
                this.damageHero(25);
              }
            }
          }

          // 5. Chrono Phantom Temporal Warp (Every 3.8s)
          if (e.type === 'chrono_phantom' && e.abilityTimer >= 3.8) {
            e.abilityTimer = 0;
            e.progress += 30; // Temporal time leap forward!
            this.spawnShockwave(e.x, e.y, 130, "#00e5ff");
            this.addFloatingText("⌛ TIME DILATION WARP!", e.x, e.y - 34, "#00e5ff", 20);
            if (audio) audio.teleport();
            // Disrupt nearby towers attack cooldowns
            for (const tw of this.towers) {
              if (Math.hypot(tw.x - e.x, tw.y - e.y) <= 160) {
                tw.cooldown = Math.max(tw.cooldown, 2.2);
              }
            }
          }

          // 6. Mecha Colossus Missile Barrage (Every 5.0s)
          if (e.type === 'mecha_colossus' && e.abilityTimer >= 5.0) {
            e.abilityTimer = 0;
            this.screenShake = 14;
            this.addFloatingText("🤖 COLOSSUS MISSILE SALVO!", e.x, e.y - 38, "#ffd600", 22);
            if (audio) audio.missileLaunch();
            for (let m = 0; m < 2; m++) {
              const targetObj = this.hero || (this.barricades && this.barricades[0]) || { x: e.x + 80, y: e.y };
              const tx = (targetObj && targetObj.x !== undefined) ? targetObj.x : (e.x + 80);
              const ty = (targetObj && targetObj.y !== undefined) ? targetObj.y : e.y;
              this.projectiles.push({
                type: 'missile',
                x: e.x + (m === 0 ? -15 : 15),
                y: e.y,
                vx: (Math.random() - 0.5) * 60,
                vy: (Math.random() - 0.5) * 60,
                speed: 340,
                life: 3.5,
                splash: 40,
                damage: 75,
                radius: 40,
                target: targetObj,
                targetX: tx,
                targetY: ty,
                color: "#ffd600",
                homing: true,
                isEnemyProj: true
              });
            }
          }
        }

        // Burning Flame DoT
        if (e.burnTimer > 0) {
          e.burnTimer -= dt;
          e.burnTick = (e.burnTick || 0) + dt;
          if (e.burnTick >= 0.4) {
            e.burnTick = 0;
            const dotMult = this.activeAugments.includes('plasma_inferno') ? 1.45 : 1.0;
            this.applyDamage(e, (e.burnDmg || 25) * 0.4 * dotMult, 'FIRE', null, 'flame');
            if (this.activeAugments.includes('plasma_inferno')) {
              // Spread flame to nearby enemies
              for (const other of this.enemies) {
                if (other !== e && Math.hypot(other.x - e.x, other.y - e.y) <= 65) {
                  other.burnTimer = Math.max(other.burnTimer || 0, 2.5);
                  other.burnDmg = Math.max(other.burnDmg || 0, 30);
                }
              }
            }
            this.particles.push({
              x: e.x + (Math.random() * 12 - 6),
              y: e.y + (Math.random() * 12 - 6),
              vx: (Math.random() - 0.5) * 15,
              vy: -25 - Math.random() * 20,
              color: "#ff3d00", size: 2.5, growth: 2, life: 0.3, maxLife: 0.3
            });
          }
        }

        // Kamikaze Drone Suicide Detonation
        if (e.isKamikaze) {
          e.beepTimer = (e.beepTimer || 0) + dt;
          if (e.beepTimer >= 0.5) {
            e.beepTimer = 0;
            audio.kamikazeBeep();
          }
          const distToHero = Math.hypot(e.x - this.hero.x, e.y - this.hero.y);
          if (distToHero <= 40) {
            this.screenShake = 9;
            this.spawnShockwave(e.x, e.y, 70, "#ff1744");
            this.spawnScorchMark(e.x, e.y, 45);
            audio.artilleryBlast();
            this.damageHero(120);
            this.enemies.splice(i, 1);
            continue;
          }
        }

        // Siege Breaker Ground Stomp
        if (e.isSiegeBreaker) {
          e.stompTimer = (e.stompTimer || 0) + dt;
          if (e.stompTimer >= 5.5) {
            e.stompTimer = 0;
            this.screenShake = 12;
            audio.titanStomp();
            this.spawnShockwave(e.x, e.y, 160, "#7c4dff");
            this.spawnScorchMark(e.x, e.y, 60);
            this.addFloatingText("🗿 GROUND STOMP!", e.x, e.y - 35, "#7c4dff", 18);
            for (const t of this.towers) {
              if (Math.hypot(t.x - e.x, t.y - e.y) <= 170) {
                t.cooldown = Math.max(t.cooldown || 0, 1.8);
                this.addFloatingText("DISRUPTED!", t.x, t.y - 18, "#ffd600", 12);
              }
            }
            if (Math.hypot(this.hero.x - e.x, this.hero.y - e.y) <= 170) {
              this.damageHero(40);
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

        const lane = this.bakedLanes[e.laneIdx] || this.bakedLanes[0];
        if (e.isFlyer) {
          // Aerial drone bypasses barricades and flies straight to Core
          const pts = (lane && (lane.points || lane.waypoints)) || [{ x: 1216, y: 320 }];
          const endPt = pts[pts.length - 1] || { x: 1216, y: 320 };
          const fdx = endPt.x - e.x;
          const fdy = endPt.y - e.y;
          const fdist = Math.hypot(fdx, fdy);
          e.angle = Math.atan2(fdy, fdx);
          e.progress += effSpeed * dt;
          if (fdist > 8) {
            e.x += Math.cos(e.angle) * effSpeed * dt;
            e.y += Math.sin(e.angle) * effSpeed * dt;
          } else {
            e.progress = (lane && lane.totalLength) ? lane.totalLength : 9999;
          }
          if (Math.random() < 0.25) {
            this.particles.push({
              x: e.x - Math.cos(e.angle) * 12,
              y: e.y - Math.sin(e.angle) * 12,
              vx: -Math.cos(e.angle) * 40 + (Math.random() * 20 - 10),
              vy: -Math.sin(e.angle) * 40 + (Math.random() * 20 - 10),
              color: "#00e5ff", size: 2.5, life: 0.25, maxLife: 0.25
            });
          }
        } else {
          if (!isBlocked) {
            e.progress += effSpeed * dt;
          }
          e.walkAnim = (e.walkAnim || 0) + effSpeed * dt * 0.15;
          const pt = this.getPointAlongLane(e.laneIdx, e.progress);
          e.x = pt.x;
          e.y = pt.y;
          e.angle = pt.angle;

          // Footstep dust puffs & ground footprints
          if (!isBlocked && Math.random() < (e.isBoss ? 0.35 : 0.08)) {
            this.particles.push({
              x: e.x + (Math.random() * 6 - 3),
              y: e.y + (Math.random() * 6 - 3),
              vx: -Math.cos(e.angle) * 12 + (Math.random() * 6 - 3),
              vy: -Math.sin(e.angle) * 12 + (Math.random() * 6 - 3),
              color: "rgba(100, 116, 139, 0.3)", size: e.isBoss ? 4.5 : 2.5, growth: 5, life: 0.35, maxLife: 0.35
            });
            if (e.isBoss || e.type === 'brute') {
              this.spawnFootprint(e.x, e.y, e.angle, true);
            }
          }

          // Heavy Diesel & Plasma Exhaust Smoke Puffs
          if (['brute', 'juggernaut'].includes(e.type) && Math.random() < 0.25) {
            const backX = e.x - Math.cos(e.angle) * 14;
            const backY = e.y - Math.sin(e.angle) * 14;
            this.particles.push({
              x: backX + (Math.random() * 6 - 3),
              y: backY + (Math.random() * 6 - 3),
              vx: -Math.cos(e.angle) * 20 + (Math.random() * 8 - 4),
              vy: -Math.sin(e.angle) * 20 - 15,
              color: "rgba(30, 41, 59, 0.55)", size: 3.5, growth: 8, life: 0.45, maxLife: 0.45
            });
          }
        }

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
      const endlessOverdrive = (this.gameMode === 'ENDLESS' && this.wave > 20) ? (1 + (this.wave - 20) * 0.04) : 1.0;
      for (const t of this.towers) {
        if (t.type === 'beacon') continue;
        const def = TOWER_DEFS[t.type];
        const currentSpec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];
        const mapFog = (map.modifier === 'fog') ? 0.85 : 1.0;
        const effRange = currentSpec.range * (t.buffRange || 1.0) * mapFog;
        const effRate = currentSpec.rate * (t.buffRate || 1.0) * overclockMult;
        const effDmg = Math.round(currentSpec.dmg * (t.buffDmg || 1.0) * endlessOverdrive);

        t.cooldown -= dt;
        if (t.laserTimer > 0) t.laserTimer -= dt;
        if (t.lightningArcs) {
          t.lightningArcs.time -= dt;
          if (t.lightningArcs.time <= 0) t.lightningArcs = null;
        }
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
        } else if (p.type === 'siege_shell') {
          p.t += dt / p.flightTime;
          p.x = p.startX + (p.targetX - p.startX) * p.t;
          p.y = p.startY + (p.targetY - p.startY) * p.t - Math.sin(p.t * Math.PI) * 45;
          if (p.t >= 1.0) {
            this.screenShake = 6;
            audio.artilleryBlast();
            const splashRad = p.splash * (this.hasAugment("siege_artillery_core") ? 1.6 : 1.0);
            this.spawnShockwave(p.targetX, p.targetY, splashRad, "#ffd600");
            this.spawnScorchMark(p.targetX, p.targetY, splashRad * 0.7);
            if (this.hasAugment("siege_artillery_core")) {
              this.groundHazards.push({ x: p.targetX, y: p.targetY, radius: splashRad * 0.65, life: 4.0, tickTimer: 0 });
            }
            for (const e of this.enemies) {
              const d = Math.hypot(e.x - p.targetX, e.y - p.targetY);
              if (d <= splashRad) {
                const falloff = 1.0 - (d / splashRad) * 0.4;
                this.applyDamage(e, p.damage * falloff, 'EXPLOSIVE', null, 'hero');
              }
            }
            this.projectiles.splice(i, 1);
          }
        } else if (p.type === 'missile') {
          p.life = (p.life !== undefined && !isNaN(p.life)) ? p.life - dt : -1;
          if (p.target && (this.enemies.includes(p.target) || p.target === this.hero)) {
            p.targetX = p.target.x;
            p.targetY = p.target.y;
          }
          if (p.targetX === undefined || isNaN(p.targetX)) p.targetX = p.x;
          if (p.targetY === undefined || isNaN(p.targetY)) p.targetY = p.y;
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          const desAng = Math.atan2(dy, dx);
          p.angle = (p.angle !== undefined && !isNaN(p.angle)) ? p.angle : desAng;
          let angDiff = Math.atan2(Math.sin(desAng - p.angle), Math.cos(desAng - p.angle));
          if (isNaN(angDiff)) angDiff = 0;
          p.angle += Math.sign(angDiff) * Math.min(Math.abs(angDiff), dt * 10);
          const pSpd = p.speed || 380;
          p.x += Math.cos(p.angle) * pSpd * dt;
          p.y += Math.sin(p.angle) * pSpd * dt;

          if (Math.random() < 0.45 && this.particles.length < 250) {
            this.particles.push({
              x: p.x - Math.cos(p.angle) * 8,
              y: p.y - Math.sin(p.angle) * 8,
              vx: (Math.random() - 0.5) * 15,
              vy: (Math.random() - 0.5) * 15,
              color: "rgba(220, 220, 220, 0.55)", size: 3, growth: 5, life: 0.35, maxLife: 0.35
            });
          }

          if (dist < 16 || p.life <= 0 || isNaN(p.x) || isNaN(p.y)) {
            const splashRad = p.splash || p.radius || 40;
            this.spawnShockwave(p.x, p.y, splashRad, "#ff9100");
            audio.hit();
            if (p.isEnemyProj) {
              if (this.hero && Math.hypot(this.hero.x - p.x, this.hero.y - p.y) <= splashRad) {
                this.damageHero(p.damage || 50);
              }
            } else {
              for (const e of this.enemies) {
                if (Math.hypot(e.x - p.x, e.y - p.y) <= splashRad) {
                  this.applyDamage(e, p.damage, 'EXPLOSIVE', null, 'skills');
                }
              }
            }
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
      if (h.currentUltCd > 0) h.currentUltCd = Math.max(0, h.currentUltCd - dt * (this.hasAugment("chronos_overdrive") ? 1.35 : 1.0));
      if (h.ultActiveTime > 0) h.ultActiveTime = Math.max(0, h.ultActiveTime - dt);
      if (h.slashAnim > 0) h.slashAnim = Math.max(0, h.slashAnim - dt);
      if (h.dashTimer > 0) h.dashTimer = Math.max(0, h.dashTimer - dt);
      if (h.siegeRecoil > 0) h.siegeRecoil = Math.max(0, h.siegeRecoil - dt * 4.5);

      // Energy Shield Dome decay
      if (h.shieldDome) {
        h.shieldDome.timer -= dt;
        if (h.shieldDome.timer <= 0 || h.shieldDome.hp <= 0) {
          h.shieldDome = null;
          this.addFloatingText("SHIELD DOME TUGADI", h.x, h.y - 25, "#78909c", 13);
        }
      }

      // Hero Movement toward target
      const distToTarget = Math.hypot(h.targetX - h.x, h.targetY - h.y);
      if (distToTarget > 4) {
        const dashMult = (h.dashTimer > 0) ? 2.4 : 1.0;
        const moveSpd = h.speed * (this.hasAugment("hero_overdrive") ? 1.25 : 1.0) * (this.hasAugment("chronos_overdrive") ? 1.30 : 1.0) * dashMult;
        h.angle = Math.atan2(h.targetY - h.y, h.targetX - h.x);
        h.x += Math.cos(h.angle) * moveSpd * dt;
        h.y += Math.sin(h.angle) * moveSpd * dt;
        h.walkAnim = (h.walkAnim || 0) + dt * (h.dashTimer > 0 ? 20 : 10);

        // Footstep dust & imprints
        if (Math.random() < 0.22) {
          this.spawnFootprint(h.x, h.y, h.angle, h.mode === 'SIEGE');
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
            color: (h.mode === 'SIEGE') ? "#ffd600" : "#00e5ff", size: 2.5, life: 0.25, maxLife: 0.25
          });
        }
      } else {
        h.walkAnim = (h.walkAnim || 0) + dt * 2;
      }

      // Hero Combat State: SIEGE vs BIPED
      let inCombat = false;
      if (h.mode === 'SIEGE') {
        // SIEGE MODE: Heavy Dual 120mm Artillery Auto-Targeting (Range: 250px)
        h.siegeCooldown = Math.max(0, (h.siegeCooldown || 0) - dt);
        let bestTarget = null;
        let maxProg = -1;
        for (const e of this.enemies) {
          if (e.phased) continue;
          const d = Math.hypot(e.x - h.x, e.y - h.y);
          if (d <= 250) {
            inCombat = true;
            const score = (e.isBoss ? 1000 : 0) + (e.progress || 0);
            if (score > maxProg) {
              maxProg = score;
              bestTarget = e;
            }
          }
        }
        if (bestTarget) {
          h.angle = Math.atan2(bestTarget.y - h.y, bestTarget.x - h.x);
          if (h.siegeCooldown <= 0) {
            h.siegeCooldown = 1.35;
            h.siegeRecoil = 1.0;
            audio.shootMortar();
            this.screenShake = 4;
            this.vibrate(22);
            this.spawnMuzzleFlash(h.x, h.y, h.angle, 34, "#ffd600");
            this.spawnMuzzleSmoke(h.x, h.y, h.angle, "rgba(255, 180, 0, 0.45)");
            this.spawnSpentCasing(h.x, h.y, h.angle);
            // Launch 120mm Heavy Siege Shell
            this.projectiles.push({
              type: 'siege_shell',
              x: h.x + Math.cos(h.angle) * 20,
              y: h.y + Math.sin(h.angle) * 20,
              startX: h.x,
              startY: h.y,
              targetX: bestTarget.x,
              targetY: bestTarget.y,
              t: 0,
              flightTime: 0.45,
              damage: 180 * (this.hasAugment("hero_overdrive") ? 1.5 : 1.0),
              splash: 65
            });
          }
        }
      } else {
        // BIPED MODE: In-Combat Melee Plasma Katana (Range: 50px)
        h.atkCooldown -= dt;
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
      const tDef = TOWER_DEFS[tower.type];
      const canHitAir = tDef ? (tDef.targetsAir !== false) : true;
      for (const e of this.enemies) {
        if (e.phased) continue;
        if (e.isFlyer && !canHitAir) continue; // Mortars cannot target aerial flyers
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
      } else if (tower.type === 'tesla') {
        audio.shootTesla();
        this.spawnMuzzleFlash(tower.x, tower.y, tower.angle, 28, "#ffd600");
        const bonusChains = this.hasAugment("tesla_overcharge") ? 3 : 0;
        const chainCount = (spec.chainCount || 4) + bonusChains;
        const chained = [];
        let curr = primary;
        let chainDmg = finalDmg;
        for (let i = 0; i < chainCount && curr; i++) {
          chained.push(curr);
          this.applyDamage(curr, chainDmg, 'ENERGY', tower, 'tesla');
          if (tower.branch === 'A') {
            curr.slowRatio = 1.0;
            curr.slowTimer = 1.2; // EMP shock stun
          }
          const next = this.enemies.find(e => !chained.includes(e) && !e.phased && Math.hypot(e.x - curr.x, e.y - curr.y) <= 100);
          curr = next;
          chainDmg *= 0.85;
        }
        tower.lightningArcs = {
          time: 0.16,
          points: [{ x: tower.x, y: tower.y }, ...chained.map(c => ({ x: c.x, y: c.y }))]
        };
        if (tower.branch === 'B') {
          this.spawnShockwave(tower.x, tower.y, range, "#ffd600");
          for (const e of targets) {
            if (!chained.includes(e)) this.applyDamage(e, finalDmg * 0.65, 'ENERGY', tower, 'tesla');
          }
        }
      } else if (tower.type === 'flame') {
        audio.shootFlame();
        const coneHalf = (spec.coneAngle || 0.7) / 2;
        // Conical flame particles
        for (let p = 0; p < 7; p++) {
          const spreadAng = tower.angle + (Math.random() - 0.5) * (coneHalf * 2);
          const spd = 160 + Math.random() * 120;
          this.particles.push({
            x: tower.x + Math.cos(tower.angle) * 16,
            y: tower.y + Math.sin(tower.angle) * 16,
            vx: Math.cos(spreadAng) * spd,
            vy: Math.sin(spreadAng) * spd,
            color: (tower.branch === 'B') ? (Math.random() > 0.4 ? "#00e5ff" : "#ffffff") : (Math.random() > 0.4 ? "#ff3d00" : "#ffd600"),
            size: 4 + Math.random() * 5,
            growth: 14,
            life: 0.35 + Math.random() * 0.2,
            maxLife: 0.55
          });
        }
        for (const e of targets) {
          const toTargetAng = Math.atan2(e.y - tower.y, e.x - tower.x);
          let diffAng = Math.abs(toTargetAng - tower.angle);
          diffAng = ((diffAng % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          if (diffAng > Math.PI) diffAng = Math.PI * 2 - diffAng;
          if (diffAng <= coneHalf) {
            this.applyDamage(e, finalDmg, 'FIRE', tower, 'flame');
            e.burnDmg = spec.dotDmg || 25;
            e.burnTimer = spec.dotDur || 3.0;
            if (tower.branch === 'B') {
              e.armor = Math.max(0, e.armor * 0.30); // 70% armor melt
            }
          }
        }
        if (tower.branch === 'A' && Math.random() < 0.25) {
          const poolDist = 40 + Math.random() * (range - 50);
          const px = tower.x + Math.cos(tower.angle) * poolDist;
          const py = tower.y + Math.sin(tower.angle) * poolDist;
          this.groundHazards.push({ x: px, y: py, radius: 40, life: 3.5, tickTimer: 0 });
        }
      }
    }

    detonateMortar(x, y, dmg, splashRadius, tower, branch) {
      audio.hit();
      this.screenShake = 6;
      let finalRadius = splashRadius;
      if (this.hasAugment("cluster_munitions")) finalRadius *= 1.35;
      if (this.hasAugment("siege_artillery_core")) {
        finalRadius *= 1.60;
        this.groundHazards.push({ x: x, y: y, radius: finalRadius * 0.65, life: 4.0, tickTimer: 0 });
      }

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

      // Endless Overdrive bonus for Hero attacks and Super Skills
      if (this.gameMode === 'ENDLESS' && this.wave > 20 && (category === 'hero' || category === 'skills')) {
        finalDmg *= (1 + (this.wave - 20) * 0.04);
      }

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
      this.spawnFlyingCoins(enemy.x, enemy.y, enemy.bounty);

      // Void Collector Augment
      if (this.hasAugment("void_collector")) {
        this.voidKillCount = (this.voidKillCount || 0) + 1;
        if (this.voidKillCount % 5 === 0) {
          this.gold += 3;
          this.analytics.totalGold += 3;
          this.addFloatingText("+3g VOID HARVEST", enemy.x, enemy.y - 32, "#7c4dff", 14);
        }
        if (this.hero.currentUltCd > 0) {
          this.hero.currentUltCd = Math.max(0, this.hero.currentUltCd - 0.5);
        }
      }

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
            name: 'Swarmling',
            laneIdx: enemy.laneIdx,
            progress: Math.max(0, enemy.progress + i * 20),
            hp: 25, maxHp: 25, shield: 0, maxShield: 0, armor: 0,
            speed: 85, bounty: 2, size: 7, color: '#ffab00', marker: '◆', isBoss: false,
            slowRatio: 0, slowTimer: 0, x: enemy.x, y: enemy.y, angle: enemy.angle
          });
        }
      }

      const eName = (enemy.name || (ENEMY_DEFS[enemy.type] && ENEMY_DEFS[enemy.type].name) || enemy.type || "ENEMY").toUpperCase();
      if (enemy.isBoss) {
        this.addCombatFeed("TITAN DESTROYED", `${eName} (+${enemy.bounty || 100}G)`, "#ff1744", "💀");
        this.screenShake = 12;
        audio.victory();
      } else if (['gunship', 'brute', 'phantom', 'kamikaze', 'kamikaze_drone', 'siege_breaker'].includes(enemy.type)) {
        this.addCombatFeed("ELITE DOWN", `${eName} (+${enemy.bounty || 15}G)`, "#00e5ff", "💥");
      }

      const now = Date.now();
      if (now - this.lastHeroKillTime < 3500) {
        this.heroKillStreak = (this.heroKillStreak || 0) + 1;
        if (this.heroKillStreak === 3) {
          this.addCombatFeed("MECH STREAK", "TRIPLE KILL! (+15G)", "#ffd600", "⚡");
          this.gold += 15;
          this.spawnFlyingCoins(this.hero.x, this.hero.y, 15);
        } else if (this.heroKillStreak === 5) {
          this.addCombatFeed("MECH RAMPAGE", "PENTAKILL OVERDRIVE! (+35G)", "#e040fb", "🤖");
          this.gold += 35;
          this.spawnFlyingCoins(this.hero.x, this.hero.y, 35);
        }
      } else {
        this.heroKillStreak = 1;
      }
      this.lastHeroKillTime = now;

      this.spawnDeathParticles(enemy.x, enemy.y, enemy.color, enemy.isBoss);
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

      // Roguelike Draft at Wave 5, 10, 15, 20, 25 OR after every wave in BOSS_RUSH!
      if ((this.gameMode === 'BOSS_RUSH' && this.wave < this.maxWaves) || (this.wave % 5 === 0 && this.wave < this.maxWaves)) {
        this.triggerAugmentDraft();
        this.wave++;
        this.waveCountdown = 8;
        return;
      }

      if ((this.gameMode === 'CAMPAIGN' || this.gameMode === 'CUSTOM') && this.wave >= this.maxWaves) this.onVictory();
      else if (this.gameMode === 'BOSS_RUSH' && this.wave >= this.maxWaves) this.onVictory();
      else {
        this.wave++;
        this.waveCountdown = 8;
      }
    }

    onVictory() {
      this.state = 'VICTORY';
      audio.playBGMTrack('victory');
      this.calculateMVP();
      const stars = (this.baseHp === this.maxBaseHp) ? 3 : (this.baseHp >= this.maxBaseHp * 0.5 ? 2 : 1);
      const mapId = (this.gameMode === 'CUSTOM') ? 'custom' : MAPS[this.currentMapIndex].id;
      this.saveProgress(mapId, stars, this.score, this.wave);
    }

    onDefeat() {
      this.state = 'DEFEAT';
      if (this.gameMode === 'ENDLESS') {
        try {
          const cur = parseInt(localStorage.getItem('lg_endless_wave') || '0');
          if (this.wave > cur) {
            localStorage.setItem('lg_endless_wave', this.wave.toString());
          }
          if (this.score > (this.saveData.highScores?.endless || 0)) {
            if (!this.saveData.highScores) this.saveData.highScores = {};
            this.saveData.highScores.endless = this.score;
            localStorage.setItem('last_grid_save_v2', JSON.stringify(this.saveData));
          }
        } catch(e) {}
      }
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

    spawnDeathParticles(x, y, color, isBoss = false) {
      // 1. Ground Blast Scorch Decal (Kuygan Iz)
      this.spawnScorchMark(x, y, isBoss ? 48 : 24);

      // 2. Metallic Shrapnel & Armor Debris Chunks (Gibs)
      const chunkCount = isBoss ? 32 : 14;
      for (let i = 0; i < chunkCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * (isBoss ? 180 : 120);
        const size = isBoss ? (3.5 + Math.random() * 4) : (2.0 + Math.random() * 2.5);
        this.particles.push({
          x: x, y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          color: (i % 3 === 0) ? "#475569" : ((i % 3 === 1) ? "#1e293b" : (color || "#ffd600")),
          size: size,
          life: 0.8 + Math.random() * 0.4,
          maxLife: 1.2
        });
      }

      // 3. Volumetric Fire & Smoke Puffs
      const smokeCount = isBoss ? 16 : 8;
      for (let s = 0; s < smokeCount; s++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 15 + Math.random() * 40;
        this.particles.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          color: (s % 2 === 0) ? "rgba(30, 41, 59, 0.6)" : "rgba(71, 85, 105, 0.45)",
          size: 4 + Math.random() * 3,
          growth: 10 + Math.random() * 12,
          life: 0.6 + Math.random() * 0.4,
          maxLife: 1.0
        });
      }

      // 4. Incandescent Spark Embers
      for (let e = 0; e < (isBoss ? 20 : 8); e++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 80 + Math.random() * 160;
        this.particles.push({
          x: x, y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          color: (e % 2 === 0) ? "#ffd600" : "#ff3d00",
          size: 1.8,
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.6
        });
      }

      // 5. Boss Shockwave
      if (isBoss) {
        this.spawnShockwave(x, y, 140, "#ff1744");
      }
    }

    spawnFlyingCoins(startX, startY, amount = 1) {
      const count = Math.min(6, Math.max(2, Math.floor(amount / 8)));
      for (let i = 0; i < count; i++) {
        this.flyingCoins.push({
          x: startX + (Math.random() - 0.5) * 24,
          y: startY + (Math.random() - 0.5) * 24,
          startX: startX,
          startY: startY,
          targetX: 180,
          targetY: 30,
          progress: 0,
          speed: 1.4 + Math.random() * 0.8,
          curveOffset: (Math.random() - 0.5) * 80,
          size: 7 + Math.random() * 3
        });
      }
    }

    spawnUpgradePillar(x, y, color = "#00e5ff") {
      this.upgradePillars.push({
        x, y, color,
        timer: 0.55,
        maxTimer: 0.55
      });
      this.screenShake = Math.max(this.screenShake, 6);
    }

    addFloatingText(text, x, y, color = '#ffffff', size = 13) {
      if (this.floatingTexts.length > 30) this.floatingTexts.shift();
      this.floatingTexts.push({ text, x, y, color, size, life: 1.0 });
    }

    // --- RENDERING PIPELINE ---
    
    renderTutorialOverlay(ctx) {
      ctx.save();
      const time = Date.now() * 0.005;
      const pulseRing = 10 + Math.sin(time) * 4;

      if (this.towers.length === 0) {
        // Step 1: Place Tower
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2.5;
        // Highlight Pulse slot in bottom bar (x: 170, y: 648)
        ctx.strokeRect(130, 642, 65, 72);

        // Highlight optimal grid slot (x: 320, y: 320)
        ctx.beginPath();
        ctx.arc(384, 320, 24 + pulseRing, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(10, 25, 47, 0.92)";
        ctx.strokeStyle = "#ffd600";
        ctx.beginPath();
        ctx.roundRect(140, 560, 420, 50, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffd600";
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "center";
        ctx.fillText("1. PASTKI PANELDAN MINORA TANLAB XARITAGA QO'YING!", 350, 590);
      } else if (!this.waveActive) {
        // Step 2: Engage Wave (Top HUD Bar)
        ctx.strokeStyle = "#ffd600";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(530, 30, 42 + pulseRing, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(10, 25, 47, 0.92)";
        ctx.strokeStyle = "#00e5ff";
        ctx.beginPath();
        ctx.roundRect(330, 80, 400, 46, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("2. TO'LQINNI BOSHLASH UCHUN 'JANGGA'NI BOSING!", 530, 108);
      }

      // Skip Button
      ctx.fillStyle = "rgba(255, 23, 68, 0.85)";
      ctx.beginPath();
      ctx.roundRect(1100, 18, 140, 30, 6);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("TUTORIALNI O'TKAZISH", 1170, 37);
      ctx.restore();
    }

    render() {
      // Clear entire backing buffer at full physical resolution
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.save();
      const sx = this.renderScaleX || (this.canvas.width / 1280);
      const sy = this.renderScaleY || (this.canvas.height / 720);
      this.ctx.setTransform(sx, 0, 0, sy, 0, 0);

      if (this.screenShake > 0) {
        const shakeX = (Math.random() * 2 - 1) * this.screenShake;
        const shakeY = (Math.random() * 2 - 1) * this.screenShake;
        this.ctx.translate(shakeX, shakeY);
      }

      // Hide 3D mech when Settings modal is open or when not in MENU
      if (this.apexSystem) {
        if (this.state === 'MENU' && !this.showSettingsModal) this.apexSystem.show();
        else this.apexSystem.hide();
      }

      if (this.state === 'MENU') {
        this.renderMainMenu();
        if (typeof audio !== 'undefined' && audio.ctx && audio.ctx.state === 'suspended') {
          this.ctx.fillStyle = "rgba(10, 20, 36, 0.92)";
          this.ctx.beginPath();
          this.ctx.roundRect(420, 10, 440, 30, 6);
          this.ctx.fill();
          this.ctx.strokeStyle = "#ffd600";
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
          this.ctx.fillStyle = "#ffd600";
          this.ctx.font = "bold 11px monospace";
          this.ctx.textAlign = "center";
          this.ctx.fillText("🔊 OVOZNI YOQISH UCHUN EKRANGA TEGING (TAP TO UNMUTE)", 640, 29);
        }
      }
      else if (this.state === 'MAP_SELECT') this.renderMapSelect();
      else if (this.state === 'LEADERBOARD') this.renderLeaderboardModal();
      else if (this.state === 'ACHIEVEMENTS') this.renderAchievementsModal();
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
        this.renderUpgradePillars();
        this.renderFlyingCoins();
        this.renderSelectedTowerRadialHUD();
        this.renderCriticalLowHPPulse();
        this.renderDynamicLightingLayer();
        this.renderFloatingText();
        this.renderPlacementGhost();
        this.renderTacticalDragVector();
        this.renderRadialBuildWheel();
        this.renderRadioComms();
        this.renderBossAlert();
        this.renderMinimapHUD();
        this.renderCinematicBanner();
        this.renderCombatFeed();
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


    toggleLanguage() {
      return this.toggleLang();
    }

    loadBackgroundImages() {
      this.bgImages = {};
      const list = {
        cyber: 'assets/backgrounds/bg_cyber_grid_hd.png',
        lava: 'assets/backgrounds/bg_lava_core_hd.png',
        cryo: 'assets/backgrounds/bg_cryo_base_hd.png',
        menu: 'assets/backgrounds/bg_menu_hangar_hd.png'
      };
      for (const [key, path] of Object.entries(list)) {
        try {
          const img = new Image();
          img.src = path;
          img.onload = () => { this.bgImages[key] = img; };
        } catch(e) {}
      }
    }

    renderUpgradePillars() {
      if (!this.upgradePillars || this.upgradePillars.length === 0) return;
      const ctx = this.ctx;
      for (const p of this.upgradePillars) {
        const progress = Math.max(0, p.timer / p.maxTimer);
        const alpha = progress;
        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        const grad = ctx.createLinearGradient(p.x, p.y + 10, p.x, p.y - 140);
        grad.addColorStop(0, p.color || '#00e5ff');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(p.x - 24, p.y - 140, 48, 150);

        ctx.strokeStyle = p.color || '#00e5ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 40 * (1 - progress), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    renderFlyingCoins() {
      if (!this.flyingCoins || this.flyingCoins.length === 0) return;
      const ctx = this.ctx;
      ctx.save();
      for (const c of this.flyingCoins) {
        ctx.fillStyle = "#ffd600";
        ctx.shadowColor = "#ffea00";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size || 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff9c4";
        ctx.beginPath();
        ctx.arc(c.x, c.y, (c.size || 6) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    renderSelectedTowerRadialHUD() {
      if (!this.selectedTower) return;
      const t = this.selectedTower;
      const def = TOWER_DEFS[t.type];
      const ctx = this.ctx;
      const tm = this.uiTime || 0;
      ctx.save();

      // 1. Tactical Holographic Range Ring with rotating laser sweep
      const rng = t.range || 140;
      ctx.fillStyle = "rgba(0, 229, 255, 0.05)";
      ctx.beginPath();
      ctx.arc(t.x, t.y, rng, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(t.x, t.y, rng, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4 Tactical Poles on Range Boundary
      const tickAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      for (const a of tickAngles) {
        ctx.beginPath();
        ctx.moveTo(t.x + Math.cos(a) * (rng - 6), t.y + Math.sin(a) * (rng - 6));
        ctx.lineTo(t.x + Math.cos(a) * (rng + 6), t.y + Math.sin(a) * (rng + 6));
        ctx.stroke();
      }

      // 2. Connecting Laser Spokes to Action Pods
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(t.x, t.y); ctx.lineTo(t.x, t.y - 48);
      ctx.moveTo(t.x, t.y); ctx.lineTo(t.x - 75, t.y);
      ctx.moveTo(t.x, t.y); ctx.lineTo(t.x + 75, t.y);
      ctx.moveTo(t.x, t.y); ctx.lineTo(t.x, t.y + 40);
      ctx.stroke();

      // 3. Top Upgrade or Branch A/B buttons
      if (t.tier === 1) {
        const upCost = def.tiers[0].upCost;
        const canAfford = this.gold >= upCost;
        this.drawCyberButton(t.x - 70, t.y - 65, 140, 34, `▲ TIER 2 (${upCost}g)`, canAfford ? "#00e5ff" : "#455a64", "+45% DPS", "⚡", canAfford);
      } else if (t.tier === 2) {
        // Branch A (Left top)
        const bA = def.branches.A;
        const canA = this.gold >= bA.cost;
        this.drawCyberButton(t.x - 110, t.y - 70, 105, 36, bA.name.slice(0, 9), canA ? "#00e5ff" : "#455a64", `${bA.cost}g • [A]`, "⚡", canA);

        // Branch B (Right top)
        const bB = def.branches.B;
        const canB = this.gold >= bB.cost;
        this.drawCyberButton(t.x + 5, t.y - 70, 105, 36, bB.name.slice(0, 9), canB ? "#ff9100" : "#455a64", `${bB.cost}g • [B]`, "🔥", canB);
      }

      // Left Sell Button
      const refund = Math.floor(t.totalInvested * 0.70);
      this.drawCyberButton(t.x - 115, t.y - 18, 75, 36, "SOTISH", "#ff1744", `+${refund}g`, "🗑️", false);

      // Right Priority Button
      this.drawCyberButton(t.x + 40, t.y - 18, 75, 36, t.priority.slice(0, 6), "#7c4dff", "NISHON", "🎯", false);

      // Bottom Close Button
      this.drawCyberButton(t.x - 35, t.y + 40, 70, 28, "YOPISH", "#90a4ae", "", "✕", false);

      ctx.restore();
    }

    renderCriticalLowHPPulse() {
      if (this.baseHp > 5 || this.state !== 'PLAYING') return;
      const ctx = this.ctx;
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 23, 68, ${0.35 + 0.35 * pulse})`;
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, this.width - 8, this.height - 8);

      ctx.fillStyle = `rgba(255, 23, 68, ${0.12 * pulse})`;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
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
      const pbr = this.pbrPatterns || {};
      const tNow = performance.now();

      // 1. Base Layer with Real PBR Pattern or Biome Gradient
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

      // PBR Texture Underlay with Photorealistic Blending
      ctx.save();
      if (biome === 'lava' && pbr.volcanicBasalt) {
        ctx.fillStyle = pbr.volcanicBasalt;
        ctx.globalAlpha = 0.60;
        ctx.fillRect(0, 60, this.width, 560);
        // Animated Pulsing Magma Cracks
        ctx.globalAlpha = 0.28 + Math.sin(tNow * 0.002) * 0.15;
        ctx.strokeStyle = "#ff3d00";
        ctx.lineWidth = 1.8;
        for (let x = 64; x < this.width; x += 192) {
          ctx.beginPath();
          ctx.moveTo(x, 60); ctx.lineTo(x + 24, 200); ctx.lineTo(x - 18, 380); ctx.lineTo(x + 12, 620);
          ctx.stroke();
        }
      } else if (biome === 'cryo' && pbr.cryoFrost) {
        ctx.fillStyle = pbr.cryoFrost;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(0, 60, this.width, 560);
        // Crystalline Frost Fractures
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 1.4;
        for (let x = 96; x < this.width; x += 220) {
          ctx.beginPath();
          ctx.moveTo(x, 90); ctx.lineTo(x + 35, 240); ctx.lineTo(x + 10, 420); ctx.lineTo(x + 40, 580);
          ctx.stroke();
        }
      } else if (pbr.brushedTitanium) {
        ctx.fillStyle = pbr.brushedTitanium;
        ctx.globalAlpha = 0.42;
        ctx.fillRect(0, 60, this.width, 560);
      }
      ctx.restore();

      // 2. Photorealistic Interlocking Steel Decking & Expansion Seams (64x64)
      const seamStroke = (biome === 'lava') ? "rgba(255, 87, 34, 0.22)" :
                         (biome === 'cryo') ? "rgba(128, 222, 234, 0.24)" :
                         "rgba(0, 229, 255, 0.16)";
      ctx.strokeStyle = seamStroke;
      ctx.lineWidth = 1.2;
      for (let x = 0; x <= this.width; x += 64) {
        ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 620); ctx.stroke();
      }
      for (let y = 60; y <= 620; y += 64) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // Hexagonal Plate Fasteners & Rivet Clusters
      for (let x = 64; x < this.width; x += 128) {
        for (let y = 124; y < 620; y += 128) {
          this.drawHexBolt(ctx, x, y, 2.2);
        }
      }

      // Sub-floor Energon Ventilation Grids (at strategic sector coordinates)
      if (pbr.industrialGrate) {
        ctx.save();
        ctx.fillStyle = pbr.industrialGrate;
        ctx.globalAlpha = 0.65;
        for (let x = 128; x < this.width - 64; x += 256) {
          ctx.fillRect(x + 12, 188, 40, 40);
          ctx.fillRect(x + 12, 444, 40, 40);
        }
        ctx.restore();
      }

      // Outer Perimeter Defense Hazard Stripes
      this.drawHazardStripes(ctx, 4, 60, this.width - 8, 5, 6);
      this.drawHazardStripes(ctx, 4, 615, this.width - 8, 5, 6);

      // Atmospheric Biome Floating Particles
      this.renderBiomeParticles(ctx, biome);
    }

    renderLanes() {
      const map = (this.gameMode === 'CUSTOM') ? { lanes: [this.editorWaypoints] } : MAPS[this.currentMapIndex];
      const ctx = this.ctx;
      const time = performance.now() * 0.003;
      const pbr = this.pbrPatterns || {};

      for (const lane of map.lanes) {
        if (!lane || lane.length < 2) continue;

        // 1. Reinforced Trench Roadway (Dark Heavy Composite Base)
        ctx.beginPath();
        ctx.moveTo(lane[0].x, lane[0].y);
        for (let i = 1; i < lane.length; i++) ctx.lineTo(lane[i].x, lane[i].y);
        ctx.strokeStyle = "#04070e";
        ctx.lineWidth = 56;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // 2. Concrete/Steel Curb Edge Lines with Specular Bevel
        ctx.strokeStyle = "rgba(71, 85, 105, 0.88)";
        ctx.lineWidth = 50;
        ctx.stroke();

        // 3. Inner Weathered Roadbed with Tread Rutting
        ctx.strokeStyle = "#0c1424";
        ctx.lineWidth = 44;
        ctx.stroke();

        // 4. Directional Conveyor Chevrons / Animated Guidance Dashes
        ctx.save();
        ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
        ctx.lineWidth = 2.8;
        ctx.lineDashOffset = -time * 30;
        ctx.setLineDash([16, 14]);
        ctx.beginPath();
        ctx.moveTo(lane[0].x, lane[0].y);
        for (let i = 1; i < lane.length; i++) ctx.lineTo(lane[i].x, lane[i].y);
        ctx.stroke();
        ctx.restore();

        // 5. Tactical Cat-Eye LED Pathway Beacons along the curbs
        ctx.save();
        for (let i = 0; i < lane.length - 1; i++) {
          const p1 = lane[i], p2 = lane[i + 1];
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const steps = Math.floor(dist / 48);
          for (let s = 1; s < steps; s++) {
            const tVal = s / steps;
            const px = p1.x + (p2.x - p1.x) * tVal;
            const py = p1.y + (p2.y - p1.y) * tVal;
            const nx = -(p2.y - p1.y) / dist;
            const ny = (p2.x - p1.x) / dist;
            ctx.fillStyle = "rgba(0, 229, 255, 0.75)";
            ctx.beginPath(); ctx.arc(px + nx * 22, py + ny * 22, 1.8, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px - nx * 22, py - ny * 22, 1.8, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.restore();
      }

      // Holographic Quantum Warp Gate at Spawn
      for (const lane of map.lanes) {
        if (!lane || lane.length < 2) continue;
        const sp = lane[0];
        ctx.save();
        ctx.translate(sp.x, sp.y);

        // Rotating Magnetic Hazard Rings
        ctx.rotate(time * 1.6);
        ctx.strokeStyle = "#ff1744";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#ffd600";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing Quantum Induction Arcs
        ctx.strokeStyle = "rgba(255, 23, 68, 0.75)";
        ctx.lineWidth = 2.0;
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i - time * 2;
          ctx.beginPath();
          ctx.arc(0, 0, 32, a, a + Math.PI / 6);
          ctx.stroke();
        }
        ctx.restore();

        // Spawn Gate Core & Event Horizon
        const coreGrad = ctx.createRadialGradient(sp.x, sp.y, 2, sp.x, sp.y, 16);
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.4, "#ff1744");
        coreGrad.addColorStop(1, "#7f1d1d");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 15, 0, Math.PI * 2);
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

    initProceduralPBRTextures() {
      if (this.pbrPatterns) return;
      try {
        let seed = 42891;
        const rnd = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

        // 1. Brushed Titanium Armor Texture (64x64)
        const titC = document.createElement('canvas'); titC.width = titC.height = 64;
        const tCtx = titC.getContext('2d');
        tCtx.fillStyle = '#1e293b'; tCtx.fillRect(0, 0, 64, 64);
        for (let i = 0; i < 70; i++) {
          const y = rnd() * 64;
          const len = 12 + rnd() * 52;
          const x = rnd() * 64;
          tCtx.fillStyle = rnd() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.22)';
          tCtx.fillRect(x, y, len, 1);
        }
        for (let s = 0; s < 12; s++) {
          tCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
          tCtx.lineWidth = 0.8;
          tCtx.beginPath();
          const sx = rnd() * 64, sy = rnd() * 64;
          tCtx.moveTo(sx, sy); tCtx.lineTo(sx + (rnd() - 0.5) * 14, sy + (rnd() - 0.5) * 6);
          tCtx.stroke();
        }

        // 2. Carbon Fiber Twill Weave Pattern (16x16)
        const carbC = document.createElement('canvas'); carbC.width = carbC.height = 16;
        const cCtx = carbC.getContext('2d');
        cCtx.fillStyle = '#0a0f1d'; cCtx.fillRect(0, 0, 16, 16);
        cCtx.fillStyle = '#1e293b';
        cCtx.fillRect(0, 0, 8, 8); cCtx.fillRect(8, 8, 8, 8);
        cCtx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        cCtx.fillRect(1, 1, 6, 2); cCtx.fillRect(9, 9, 6, 2);
        cCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        cCtx.fillRect(0, 7, 8, 1); cCtx.fillRect(8, 15, 8, 1);

        // 3. Hazard Warning Chevron Pattern (32x32)
        const hazC = document.createElement('canvas'); hazC.width = hazC.height = 32;
        const hCtx = hazC.getContext('2d');
        hCtx.fillStyle = '#ffd600'; hCtx.fillRect(0, 0, 32, 32);
        hCtx.fillStyle = '#090d16';
        for (let i = -32; i < 64; i += 16) {
          hCtx.beginPath();
          hCtx.moveTo(i, 0); hCtx.lineTo(i + 8, 0);
          hCtx.lineTo(i + 40, 32); hCtx.lineTo(i + 32, 32);
          hCtx.closePath(); hCtx.fill();
        }

        // 4. Bio-Chitin Honeycomb Exoskeleton Pattern (32x32)
        const bioC = document.createElement('canvas'); bioC.width = bioC.height = 32;
        const bCtx = bioC.getContext('2d');
        bCtx.fillStyle = '#2e1065'; bCtx.fillRect(0, 0, 32, 32);
        bCtx.strokeStyle = '#e040fb'; bCtx.lineWidth = 1;
        for (let bx = 0; bx <= 32; bx += 8) {
          for (let by = 0; by <= 32; by += 8) {
            bCtx.strokeRect(bx + 1, by + 1, 6, 6);
          }
        }

        // 5. Cast Gunmetal Heavy Iron Armor (64x64)
        const gunC = document.createElement('canvas'); gunC.width = gunC.height = 64;
        const gCtx = gunC.getContext('2d');
        gCtx.fillStyle = '#0b1120'; gCtx.fillRect(0, 0, 64, 64);
        for (let i = 0; i < 110; i++) {
          const gx = rnd() * 64, gy = rnd() * 64;
          gCtx.fillStyle = rnd() > 0.5 ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.38)';
          gCtx.fillRect(gx, gy, 1.5, 1.5);
        }

        // 6. Volcanic Basalt Magma Rock with Glowing Fissures (64x64)
        const lavaC = document.createElement('canvas'); lavaC.width = lavaC.height = 64;
        const lCtx = lavaC.getContext('2d');
        lCtx.fillStyle = '#150503'; lCtx.fillRect(0, 0, 64, 64);
        for (let i = 0; i < 80; i++) {
          const lx = rnd() * 64, ly = rnd() * 64;
          lCtx.fillStyle = rnd() > 0.65 ? 'rgba(255, 87, 34, 0.25)' : 'rgba(0, 0, 0, 0.45)';
          lCtx.fillRect(lx, ly, 2, 2);
        }
        for (let f = 0; f < 5; f++) {
          lCtx.strokeStyle = 'rgba(255, 61, 0, 0.45)';
          lCtx.lineWidth = 1.2;
          lCtx.beginPath();
          let fx = rnd() * 64, fy = rnd() * 64;
          lCtx.moveTo(fx, fy);
          for (let step = 0; step < 4; step++) {
            fx += (rnd() - 0.5) * 16; fy += (rnd() - 0.5) * 16;
            lCtx.lineTo(fx, fy);
          }
          lCtx.stroke();
        }

        // 7. Cryo Permafrost Glacial Ice with Cyan Shimmer (64x64)
        const cryoC = document.createElement('canvas'); cryoC.width = cryoC.height = 64;
        const crCtx = cryoC.getContext('2d');
        crCtx.fillStyle = '#061527'; crCtx.fillRect(0, 0, 64, 64);
        for (let i = 0; i < 75; i++) {
          const cx = rnd() * 64, cy = rnd() * 64;
          crCtx.fillStyle = rnd() > 0.5 ? 'rgba(0, 229, 255, 0.16)' : 'rgba(255, 255, 255, 0.12)';
          crCtx.fillRect(cx, cy, 2, 1);
        }
        for (let c = 0; c < 6; c++) {
          crCtx.strokeStyle = 'rgba(128, 222, 234, 0.35)';
          crCtx.lineWidth = 0.9;
          crCtx.beginPath();
          let cx = rnd() * 64, cy = rnd() * 64;
          crCtx.moveTo(cx, cy);
          for (let step = 0; step < 3; step++) {
            cx += (rnd() - 0.5) * 18; cy += (rnd() - 0.5) * 18;
            crCtx.lineTo(cx, cy);
          }
          crCtx.stroke();
        }

        // 8. Industrial Diamond Catwalk Grate (32x32)
        const grateC = document.createElement('canvas'); grateC.width = grateC.height = 32;
        const grCtx = grateC.getContext('2d');
        grCtx.fillStyle = '#050912'; grCtx.fillRect(0, 0, 32, 32);
        grCtx.strokeStyle = 'rgba(71, 85, 105, 0.42)';
        grCtx.lineWidth = 1.2;
        for (let d = -32; d < 64; d += 8) {
          grCtx.beginPath(); grCtx.moveTo(d, 0); grCtx.lineTo(d + 32, 32); grCtx.stroke();
          grCtx.beginPath(); grCtx.moveTo(d, 32); grCtx.lineTo(d + 32, 0); grCtx.stroke();
        }

        // 9. Caterpillar Heavy Tank Tread Links (32x32)
        const treadC = document.createElement('canvas'); treadC.width = treadC.height = 32;
        const trCtx = treadC.getContext('2d');
        trCtx.fillStyle = '#080c14'; trCtx.fillRect(0, 0, 32, 32);
        trCtx.fillStyle = '#1e293b'; trCtx.fillRect(2, 2, 28, 12); trCtx.fillRect(2, 18, 28, 12);
        trCtx.fillStyle = 'rgba(255, 255, 255, 0.12)'; trCtx.fillRect(3, 3, 26, 2); trCtx.fillRect(3, 19, 26, 2);
        trCtx.fillStyle = '#000000'; trCtx.fillRect(2, 14, 28, 4);

        if (this.ctx && this.ctx.createPattern) {
          this.pbrPatterns = {
            brushedTitanium: this.ctx.createPattern(titC, 'repeat'),
            carbonFiber: this.ctx.createPattern(carbC, 'repeat'),
            hazardPlate: this.ctx.createPattern(hazC, 'repeat'),
            bioChitin: this.ctx.createPattern(bioC, 'repeat'),
            castGunmetal: this.ctx.createPattern(gunC, 'repeat'),
            volcanicBasalt: this.ctx.createPattern(lavaC, 'repeat'),
            cryoFrost: this.ctx.createPattern(cryoC, 'repeat'),
            industrialGrate: this.ctx.createPattern(grateC, 'repeat'),
            caterpillarTread: this.ctx.createPattern(treadC, 'repeat')
          };
        }
      } catch(e) {
        this.pbrPatterns = null;
      }
    }

    drawBevelPlate(ctx, x, y, w, h, pattern, borderColor = "#00e5ff", radius = 0) {
      ctx.save();
      ctx.fillStyle = pattern || "#1e293b";
      if (radius > 0) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, w, h);
      }
      // Top-Left Specular Rim Light
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + w, y); ctx.lineTo(x, y); ctx.lineTo(x, y + h);
      ctx.stroke();
      // Bottom-Right Ambient Occlusion Shadow Rim
      ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
      ctx.stroke();
      // Outer Contour Border
      if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1.2;
        if (radius > 0) ctx.stroke(); else ctx.strokeRect(x, y, w, h);
      }
      ctx.restore();
    }

    drawRivet(ctx, x, y) {
      ctx.fillStyle = "#0f172a";
      ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, 1.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(x - 0.3, y - 0.3, 0.5, 0, Math.PI * 2); ctx.fill();
    }

    drawChromePiston(ctx, x, y, w, h) {
      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, "#cbd5e1");
      grad.addColorStop(0.3, "#ffffff");
      grad.addColorStop(0.7, "#64748b");
      grad.addColorStop(1, "#334155");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#020617";
      ctx.fillRect(x, y + h - 1.5, w, 1.5);
    }

    drawTemperedBarrel(ctx, x, y, w, h) {
      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, "#475569");
      grad.addColorStop(0.5, "#1e293b");
      grad.addColorStop(1, "#090d16");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);
      const blueGrad = ctx.createLinearGradient(x + w - 8, 0, x + w, 0);
      blueGrad.addColorStop(0, "rgba(59, 130, 246, 0.45)");
      blueGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.55)");
      blueGrad.addColorStop(1, "rgba(245, 158, 11, 0.65)");
      ctx.fillStyle = blueGrad;
      ctx.fillRect(x + w - 8, y, 8, h);
      ctx.fillStyle = "#020617";
      ctx.fillRect(x + w - 1.5, y + 0.5, 1.5, h - 1);
    }

    drawHexBolt(ctx, x, y, r = 2) {
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = x + Math.cos(a) * (r + 0.6);
        const py = y + Math.sin(a) * (r + 0.6);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHazardStripes(ctx, x, y, w, h, stripeW = 6) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.fillStyle = "#ffd600";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#0a0f1d";
      for (let sx = -h; sx < w + h; sx += stripeW * 2) {
        ctx.beginPath();
        ctx.moveTo(x + sx, y);
        ctx.lineTo(x + sx + stripeW, y);
        ctx.lineTo(x + sx + stripeW - h, y + h);
        ctx.lineTo(x + sx - h, y + h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }

    drawSlottedMuzzleBrake(ctx, x, y, w, h, slots = 2) {
      const mGrad = ctx.createLinearGradient(0, y, 0, y + h);
      mGrad.addColorStop(0, "#475569");
      mGrad.addColorStop(0.5, "#1e293b");
      mGrad.addColorStop(1, "#090d16");
      ctx.fillStyle = mGrad;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "#020617";
      const slotW = Math.max(2, (w - 4) / (slots * 2));
      for (let i = 0; i < slots; i++) {
        const sx = x + 3 + i * (slotW * 2);
        ctx.fillRect(sx, y - 1, slotW, h + 2);
      }
    }

    drawUnitContactShadow(ctx, rx, ry, alpha = 0.55) {
      ctx.save();
      const shGrad = ctx.createRadialGradient(0, 3, 2, 0, 3, Math.max(rx, ry));
      shGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
      shGrad.addColorStop(0.5, `rgba(0, 0, 0, ${alpha * 0.45})`);
      shGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shGrad;
      ctx.beginPath();
      ctx.ellipse(0, 3, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    renderHeroMegatronBiped(ctx, h, pbr, walk, walkCycle, walkCos, tNow, idleBreath) {
      const titPat = pbr.brushedTitanium || "#475569";
      const carbPat = pbr.carbonFiber || "#1e293b";
      const strideL = walkCycle * 7;
      const strideR = -walkCycle * 7;
      const kneeFlexL = Math.max(0, -walkCos * 3.5);
      const kneeFlexR = Math.max(0, walkCos * 3.5);

      // 1. Hydraulic Reverse-Articulated Bipedal Legs
      // Left Leg
      ctx.save();
      ctx.translate(-5, -14);
      this.drawBevelPlate(ctx, strideL - 4, -3, 11, 7, "#334155", "#a855f7", 2);
      this.drawChromePiston(ctx, strideL - 2, -1.5, 6, 2.8);
      ctx.fillStyle = "#1e293b";
      ctx.beginPath(); ctx.arc(strideL + 4, 0, 3.2, 0, Math.PI * 2); ctx.fill();
      this.drawBevelPlate(ctx, strideL + 3, -2 - kneeFlexL, 7, 5, "#0f172a", "#c084fc", 1);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(strideL + 7, -3.5 - kneeFlexL, 4, 7); // Talon claw boot
      ctx.restore();

      // Right Leg
      ctx.save();
      ctx.translate(-5, 14);
      this.drawBevelPlate(ctx, strideR - 4, -3, 11, 7, "#334155", "#a855f7", 2);
      this.drawChromePiston(ctx, strideR - 2, -1, 6, 2.8);
      ctx.fillStyle = "#1e293b";
      ctx.beginPath(); ctx.arc(strideR + 4, 0, 3.2, 0, Math.PI * 2); ctx.fill();
      this.drawBevelPlate(ctx, strideR + 3, -2.5 + kneeFlexR, 7, 5, "#0f172a", "#c084fc", 1);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(strideR + 7, -3.5 + kneeFlexR, 4, 7);
      ctx.restore();

      // 2. Dark Energon Booster Core Backpack
      const jetGrad = ctx.createLinearGradient(-19, -11, -11, 11);
      jetGrad.addColorStop(0, "#475569");
      jetGrad.addColorStop(0.5, "#1e293b");
      jetGrad.addColorStop(1, "#0a0a0f");
      ctx.fillStyle = jetGrad;
      ctx.fillRect(-18, -11, 9, 22);
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-18, -11, 9, 22);

      // Dark Energon Thruster Vent Plumes (Pulsing Purple)
      const ePulse = 5 + Math.sin(tNow * 0.02) * 2.5;
      ctx.fillStyle = "rgba(192, 132, 252, 0.45)";
      ctx.beginPath();
      ctx.moveTo(-18, -8); ctx.lineTo(-18 - ePulse * 2, -5.5); ctx.lineTo(-18, -3);
      ctx.moveTo(-18, 3); ctx.lineTo(-18 - ePulse * 2, 5.5); ctx.lineTo(-18, 8);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-18, -7); ctx.lineTo(-18 - ePulse, -5.5); ctx.lineTo(-18, -4);
      ctx.moveTo(-18, 4); ctx.lineTo(-18 - ePulse, 5.5); ctx.lineTo(-18, 7);
      ctx.fill();

      // 3. Megatron Silver-Gunmetal Heavy Chest Glacis
      this.drawBevelPlate(ctx, -13, -13, 30, 26, titPat, "#a855f7", 5);
      this.drawRivet(ctx, -11, -11); this.drawRivet(ctx, 13, -9);
      this.drawRivet(ctx, -11, 11); this.drawRivet(ctx, 13, 9);

      // Sweeping Decepticon Shoulder Pauldrons (Spiked Blades)
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(-8, -14); ctx.lineTo(4, -20); ctx.lineTo(-4, -14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-8, 14); ctx.lineTo(4, 20); ctx.lineTo(-4, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pulsing Dark Energon Chest Conduit
      const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 7);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.35, "#c084fc");
      coreGrad.addColorStop(0.8, "#7e22ce");
      coreGrad.addColorStop(1, "rgba(126, 34, 206, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 6 + idleBreath * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // 4. Decepticon Crowned Helmet & Menacing Crimson Optics
      ctx.fillStyle = "#090d16";
      ctx.beginPath();
      ctx.moveTo(3, -5); ctx.lineTo(16, -3); ctx.lineTo(19, 0); ctx.lineTo(16, 3); ctx.lineTo(3, 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ff1744";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Decepticon Helmet Brow Horns
      ctx.fillStyle = "#475569";
      ctx.fillRect(8, -6, 5, 2);
      ctx.fillRect(8, 4, 5, 2);

      // Glowing Red Optic Visor
      ctx.fillStyle = "#ff1744";
      ctx.fillRect(9, -2.5, 7, 5);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(13, -1.2, 2.5, 2.4);

      // 5. Left Arm: Spiked Decepticon Energon Gauntlet
      ctx.save();
      ctx.translate(3, -13);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-3, -3.5, 8, 7);
      ctx.strokeStyle = "#a855f7";
      ctx.strokeRect(-3, -3.5, 8, 7);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(5, -4, 5, 8); // Knuckle block
      // 3 Armored finger claws
      ctx.fillStyle = "#c084fc";
      ctx.fillRect(10, -4, 4, 2);
      ctx.fillRect(10, -1, 4, 2);
      ctx.fillRect(10, 2, 4, 2);
      ctx.restore();

      // 6. Right Arm: THE ICONIC FUSION CANNON (Heavy High-Caliber Energy Cannon)
      const fireRecoil = (h.slashAnim > 0) ? ((0.22 - h.slashAnim) / 0.22) * 5 : 0;
      ctx.save();
      ctx.translate(4 - fireRecoil, 12);

      // Heavy Forearm Mount Saddle
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-6, -4, 10, 8);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-6, -4, 10, 8);

      // Main Fusion Cannon Cylindrical Chassis
      const fcGrad = ctx.createLinearGradient(0, -6, 0, 6);
      fcGrad.addColorStop(0, "#64748b");
      fcGrad.addColorStop(0.4, "#334155");
      fcGrad.addColorStop(0.8, "#1e293b");
      fcGrad.addColorStop(1, "#090d16");
      ctx.fillStyle = fcGrad;
      ctx.fillRect(0, -5.5, 26, 11);
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, -5.5, 26, 11);

      // Dark Energon Power Conduits & Cooling Fins
      ctx.fillStyle = "#7e22ce";
      ctx.fillRect(6, -6.5, 12, 1.5);
      ctx.fillRect(6, 5, 12, 1.5);

      // Glowing Purple Plasma Core Window
      ctx.fillStyle = "#c084fc";
      ctx.fillRect(8, -2, 9, 4);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(11, -1, 3, 2);

      // Heavy Slotted Double-Baffle Muzzle Brake
      this.drawSlottedMuzzleBrake(ctx, 24, -6.5, 7, 13, 2);

      // Violet Fusion Plasma Flash when firing
      if (h.slashAnim > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(32, 0, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(192, 132, 252, 0.75)";
        ctx.beginPath(); ctx.arc(33, 0, 18, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    renderHeroMegatronTank(ctx, h, pbr, walk, tNow) {
      const recoil = (h.siegeRecoil || 0) * 8;
      const trackCycle = walk * 10;

      // Heavy Cybertronian Tank Destroyer Chassis
      // Left Dark Energon Track Assembly
      ctx.fillStyle = "#090d16";
      ctx.fillRect(-22 - recoil, -24, 44, 13);
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-22 - recoil, -24, 44, 13);

      for (let t = -18; t <= 18; t += 5) {
        const off = ((t + trackCycle) % 40) - 20;
        ctx.fillStyle = "#475569";
        ctx.fillRect(off - recoil, -24, 2.5, 13);
      }

      // Right Dark Energon Track Assembly
      ctx.fillStyle = "#090d16";
      ctx.fillRect(-22 - recoil, 11, 44, 13);
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-22 - recoil, 11, 44, 13);

      for (let t = -18; t <= 18; t += 5) {
        const off = ((t + trackCycle) % 40) - 20;
        ctx.fillStyle = "#475569";
        ctx.fillRect(off - recoil, 11, 2.5, 13);
      }

      // Sloped Heavy Glacis Armor Hull (Decepticon Wedge)
      this.drawBevelPlate(ctx, -18 - recoil, -14, 38, 28, "#334155", "#a855f7", 5);
      this.drawHazardStripes(ctx, -15 - recoil, -12, 8, 24, 4);

      // Center Heavy Fusion Cannon Turret Housing
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(-2 - recoil, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Colossal 1500 DMG Fusion Artillery Cannon Barrel
      const barrelRecoil = recoil * 1.3;
      const bGrad = ctx.createLinearGradient(0, -7, 0, 7);
      bGrad.addColorStop(0, "#64748b");
      bGrad.addColorStop(0.5, "#334155");
      bGrad.addColorStop(1, "#090d16");
      ctx.fillStyle = bGrad;
      ctx.fillRect(10 - barrelRecoil, -6, 34, 12);
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(10 - barrelRecoil, -6, 34, 12);

      // Slotted Muzzle Brake with Heat Glow & Colossal Gas Jets
      this.drawSlottedMuzzleBrake(ctx, 42 - barrelRecoil, -7.5, 9, 15, 3);
      if (h.siegeRecoil > 0) {
        // Barrel thermal emission glow
        ctx.save();
        ctx.fillStyle = `rgba(192, 132, 252, ${h.siegeRecoil * 0.9})`;
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 14 * h.siegeRecoil;
        ctx.fillRect(12 - barrelRecoil, -5, 30, 10);

        // Muzzle brake side blast gas jets
        const gLen = h.siegeRecoil * 22;
        ctx.fillStyle = `rgba(224, 64, 251, ${h.siegeRecoil * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(42 - barrelRecoil, -7.5); ctx.lineTo(42 - barrelRecoil - gLen * 0.4, -7.5 - gLen); ctx.lineTo(49 - barrelRecoil, -7.5); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(42 - barrelRecoil, 7.5); ctx.lineTo(42 - barrelRecoil - gLen * 0.4, 7.5 + gLen); ctx.lineTo(49 - barrelRecoil, 7.5); ctx.fill();
        ctx.restore();
      }
    }

    renderHeroOptimusBiped(ctx, h, pbr, walk, walkCycle, walkCos, tNow, idleBreath) {
      const strideL = walkCycle * 7;
      const strideR = -walkCycle * 7;
      const kneeFlexL = Math.max(0, -walkCos * 3);
      const kneeFlexR = Math.max(0, walkCos * 3);

      // Cobalt Blue Articulated Legs
      ctx.save();
      ctx.translate(-5, -13);
      this.drawBevelPlate(ctx, strideL - 4, -3, 10, 6.5, "#1d4ed8", "#60a5fa", 2);
      this.drawChromePiston(ctx, strideL - 2, -1.5, 6, 2.5);
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(strideL + 6, -3 - kneeFlexL, 3, 6);
      ctx.restore();

      ctx.save();
      ctx.translate(-5, 13);
      this.drawBevelPlate(ctx, strideR - 4, -3, 10, 6.5, "#1d4ed8", "#60a5fa", 2);
      this.drawChromePiston(ctx, strideR - 2, -1, 6, 2.5);
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(strideR + 6, -3 + kneeFlexR, 3, 6);
      ctx.restore();

      // Dual Chrome Exhaust Smokestacks
      this.drawChromePiston(ctx, -17, -9, 4, 6);
      this.drawChromePiston(ctx, -17, 3, 4, 6);

      // Peterbilt Crimson Torso Chassis & Dual Windshield Grille
      this.drawBevelPlate(ctx, -12, -12, 28, 24, "#b91c1c", "#f87171", 4);
      // Dual Chrome Windshield Panels
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(4, -8, 7, 6);
      ctx.fillRect(4, 2, 7, 6);
      // Chrome Radiator Grille
      this.drawChromePiston(ctx, 11, -5, 3, 10);

      // Matrix of Leadership Core
      const matGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 6);
      matGrad.addColorStop(0, "#ffffff");
      matGrad.addColorStop(0.4, "#ffd700");
      matGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = matGrad;
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();

      // Cobalt Blue Head & Cyan Optics
      ctx.fillStyle = "#1d4ed8";
      ctx.beginPath();
      ctx.moveTo(5, -4); ctx.lineTo(15, -2); ctx.lineTo(17, 0); ctx.lineTo(15, 2); ctx.lineTo(5, 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(11, -1.5, 4, 3);

      // Right Arm: ION BLASTER
      ctx.save();
      ctx.translate(3, 12);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-2, -3, 6, 6);
      this.drawTemperedBarrel(ctx, 4, -3, 20, 6);
      this.drawSlottedMuzzleBrake(ctx, 22, -4, 4, 8, 2);
      ctx.restore();

      // Left Arm: ENERGON BATTLE AXE
      ctx.save();
      ctx.translate(3, -12);
      ctx.fillStyle = "#1e293b"; ctx.fillRect(-2, -3, 6, 6);
      // Glowing Orange-Gold Holographic Blade
      ctx.fillStyle = "rgba(255, 160, 0, 0.85)";
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(6, 0); ctx.lineTo(18, -8); ctx.lineTo(15, 0); ctx.lineTo(18, 8);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    renderHeroOptimusTruck(ctx, h, pbr, walk, tNow) {
      const recoil = (h.siegeRecoil || 0) * 8;
      // Heavy Peterbilt 379 Truck Armor Chassis
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-20 - recoil, -20, 40, 40);
      this.drawBevelPlate(ctx, -18 - recoil, -16, 36, 32, "#b91c1c", "#f87171", 5);
      // Dual Chrome Stacks
      this.drawChromePiston(ctx, -20 - recoil, -15, 5, 6);
      this.drawChromePiston(ctx, -20 - recoil, 9, 5, 6);
      // Chrome Bumper Ram
      this.drawChromePiston(ctx, 16 - recoil, -14, 5, 28);
      // Dual Heavy Roof Lasers
      this.drawTemperedBarrel(ctx, 4 - recoil, -9, 24, 5);
      this.drawTemperedBarrel(ctx, 4 - recoil, 4, 24, 5);
    }

    renderHeroBumblebeeBiped(ctx, h, pbr, walk, walkCycle, walkCos, tNow, idleBreath) {
      const strideL = walkCycle * 7;
      const strideR = -walkCycle * 7;

      // Agile Racing Legs
      ctx.save(); ctx.translate(-4, -13);
      this.drawBevelPlate(ctx, strideL - 4, -3, 10, 6.5, "#eab308", "#facc15", 2);
      ctx.restore();
      ctx.save(); ctx.translate(-4, 13);
      this.drawBevelPlate(ctx, strideR - 4, -3, 10, 6.5, "#eab308", "#facc15", 2);
      ctx.restore();

      // Canary Yellow Muscle Chassis & Racing Stripes
      this.drawBevelPlate(ctx, -12, -12, 28, 24, "#eab308", "#fde047", 4);
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(-10, -5, 24, 3);
      ctx.fillRect(-10, 2, 24, 3);

      // Battle Mask & Blue Honeycomb Optics
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(4, -4); ctx.lineTo(15, -2); ctx.lineTo(17, 0); ctx.lineTo(15, 2); ctx.lineTo(4, 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(10, -2, 4, 4);

      // Right Arm: TRIPLE STINGER PLASMA CANNON
      ctx.save();
      ctx.translate(3, 12);
      ctx.fillStyle = "#1e293b"; ctx.fillRect(-2, -3, 6, 6);
      this.drawTemperedBarrel(ctx, 4, -4, 18, 3);
      this.drawTemperedBarrel(ctx, 4, -1, 18, 3);
      this.drawTemperedBarrel(ctx, 4, 2, 18, 3);
      ctx.restore();
    }

    renderHeroBumblebeeTank(ctx, h, pbr, walk, tNow) {
      const recoil = (h.siegeRecoil || 0) * 8;
      this.drawBevelPlate(ctx, -16 - recoil, -14, 34, 28, "#eab308", "#facc15", 6);
      ctx.fillStyle = "#0f172a"; ctx.fillRect(-14 - recoil, -5, 28, 10);
      this.drawTemperedBarrel(ctx, 8 - recoil, -4, 22, 8);
      this.drawSlottedMuzzleBrake(ctx, 28 - recoil, -5, 5, 10, 2);
    }

    renderHeroApexBiped(ctx, h, pbr, walk, walkCycle, walkCos, tNow, idleBreath) {
      const strideL = walkCycle * 7;
      const strideR = -walkCycle * 7;
      ctx.save(); ctx.translate(-4, -13);
      this.drawBevelPlate(ctx, strideL - 4, -3, 10, 6.5, "#1e293b", "#00e5ff", 2);
      ctx.restore();
      ctx.save(); ctx.translate(-4, 13);
      this.drawBevelPlate(ctx, strideR - 4, -3, 10, 6.5, "#1e293b", "#00e5ff", 2);
      ctx.restore();

      this.drawBevelPlate(ctx, -12, -12, 28, 24, "#334155", "#00e5ff", 4);
      ctx.fillStyle = "#00e5ff";
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();

      ctx.save(); ctx.translate(3, 12);
      this.drawTemperedBarrel(ctx, 2, -3, 20, 6);
      ctx.restore();
      ctx.save(); ctx.translate(3, -12);
      this.drawTemperedBarrel(ctx, 2, -3, 20, 6);
      ctx.restore();
    }

    renderHeroApexTank(ctx, h, pbr, walk, tNow) {
      const recoil = (h.siegeRecoil || 0) * 8;
      this.drawBevelPlate(ctx, -16 - recoil, -14, 36, 28, "#1e293b", "#00e5ff", 4);
      this.drawTemperedBarrel(ctx, 10 - recoil, -7, 26, 5);
      this.drawTemperedBarrel(ctx, 10 - recoil, 2, 26, 5);
    }

    renderHero() {
      const h = this.hero;
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(h.x, h.y);

      // Contact Ambient Occlusion Ground Shadow (Soft Multi-Stop)
      const shadowStretch = 1.0 + Math.sin(h.walkAnim || 0) * 0.08;
      this.drawUnitContactShadow(ctx, (h.mode === 'SIEGE' ? 36 : 26) * shadowStretch, (h.mode === 'SIEGE' ? 22 : 16) * shadowStretch, 0.65);

      // Ultimate Holographic Mandala Blade Storm
      if (h.ultActiveTime > 0) {
        const ultProg = h.ultActiveTime / 0.6;
        ctx.save();
        ctx.rotate(performance.now() * 0.015);
        ctx.strokeStyle = "rgba(192, 132, 252, 0.95)";
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(0, 0, 85 * (1.1 - ultProg * 0.3), 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "rgba(255, 23, 68, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 125 * (1.0 - ultProg * 0.4), 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      // Tactical Reticle when selected
      if (h.selected) {
        ctx.strokeStyle = (this.selectedMechSkin === 'MEGATRON') ? "#c084fc" : "#ffd600";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }

      const ang = h.angle || 0;
      ctx.rotate(ang);

      const walk = h.walkAnim || 0;
      const walkCycle = Math.sin(walk);
      const walkCos = Math.cos(walk);
      const idleBreath = Math.sin(performance.now() * 0.003) * 0.8;
      const tNow = performance.now();
      const pbr = this.pbrPatterns || {};
      const activeSkin = this.selectedMechSkin || 'MEGATRON';

      if (activeSkin === 'MEGATRON') {
        if (h.mode === 'SIEGE') this.renderHeroMegatronTank(ctx, h, pbr, walk, tNow);
        else this.renderHeroMegatronBiped(ctx, h, pbr, walk, walkCycle, walkCos, tNow, idleBreath);
      } else if (activeSkin === 'OPTIMUS') {
        if (h.mode === 'SIEGE') this.renderHeroOptimusTruck(ctx, h, pbr, walk, tNow);
        else this.renderHeroOptimusBiped(ctx, h, pbr, walk, walkCycle, walkCos, tNow, idleBreath);
      } else if (activeSkin === 'BUMBLEBEE') {
        if (h.mode === 'SIEGE') this.renderHeroBumblebeeTank(ctx, h, pbr, walk, tNow);
        else this.renderHeroBumblebeeBiped(ctx, h, pbr, walk, walkCycle, walkCos, tNow, idleBreath);
      } else {
        if (h.mode === 'SIEGE') this.renderHeroApexTank(ctx, h, pbr, walk, tNow);
        else this.renderHeroApexBiped(ctx, h, pbr, walk, walkCycle, walkCos, tNow, idleBreath);
      }

      // Floating Tactical Health & Energy Bar
      ctx.rotate(-ang);
      const barW = 34;
      const bx = -barW / 2;
      const by = -36;

      if (h.shieldDome && h.shieldDome.timer > 0) {
        const shPct = Math.max(0, h.shieldDome.hp / h.shieldDome.maxHp);
        ctx.fillStyle = "#003366";
        ctx.fillRect(bx, by - 6, barW, 4);
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(bx, by - 6, barW * shPct, 4);
      }

      ctx.fillStyle = "#090e17";
      ctx.fillRect(bx, by, barW, 6);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, barW, 6);

      const hpPct = Math.max(0, h.hp / h.maxHp);
      ctx.fillStyle = hpPct > 0.3 ? ((activeSkin === 'MEGATRON') ? "#c084fc" : "#00e676") : "#ff1744";
      ctx.fillRect(bx, by, barW * hpPct, 6);
      ctx.restore();
    }

    renderTowers() {
      const map = (this.gameMode === 'CUSTOM') ? { modifier: "none" } : MAPS[this.currentMapIndex];
      const ctx = this.ctx;

      for (const t of this.towers) {
        const def = TOWER_DEFS[t.type];
        const spec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];
        const color = t.branch ? spec.color : def.color;

        // 1. Selection Range Indicator
        if (this.selectedTower === t) {
          const mapFog = (map.modifier === 'fog') ? 0.85 : 1.0;
          const range = (spec.range || 130) * (t.buffRange || 1.0) * mapFog;
          ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
          ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(t.x, t.y, range, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }

        // Overclock Aura
        if (this.skills.overclock.activeTime > 0) {
          ctx.strokeStyle = "rgba(255, 214, 0, 0.75)";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(t.x, t.y, 30, 0, Math.PI * 2); ctx.stroke();
        }

        // 2. Heavy Cast-Titanium Octagonal Pedestal Base with PBR Bevels
        this.drawUnitContactShadow(ctx, 28, 28, 0.65);

        const pbr = this.pbrPatterns || {};
        const baseGrad = ctx.createLinearGradient(t.x - 25, t.y - 25, t.x + 25, t.y + 25);
        baseGrad.addColorStop(0, "#475569");
        baseGrad.addColorStop(0.4, "#1e293b");
        baseGrad.addColorStop(1, "#090d16");
        ctx.fillStyle = pbr.castGunmetal || baseGrad;
        ctx.strokeStyle = color;
        ctx.lineWidth = t.branch ? 3 : 2;

        ctx.beginPath();
        const r = 24;
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          const px = t.x + Math.cos(a) * r;
          const py = t.y + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();

        // Inner 45-degree Bevel Chamfer
        ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          const px = t.x + Math.cos(a) * 19;
          const py = t.y + Math.sin(a) * 19;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();

        // 8 Stainless Steel Hex Mounting Bolts
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          this.drawHexBolt(ctx, t.x + Math.cos(a) * 16, t.y + Math.sin(a) * 16, 1.8);
        }

        // Turret Traverse Bearing Ring
        ctx.fillStyle = "#020617";
        ctx.beginPath(); ctx.arc(t.x, t.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Rotating Turret Head Assembly with Dynamic Recoil
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);

        const recoilKick = (t.recoil || 0) * 6.5;
        ctx.translate(-recoilKick, 0);

        if (t.type === 'pulse') {
          if (t.branch === 'A') {
            // Gatling Vulcan: 6-Barrel Rotary Minigun
            const spin = t.barrelSpin || 0;
            this.drawBevelPlate(ctx, -2, -8, 26, 16, "#334155", "#64748b", 3);
            ctx.fillStyle = "#ffd54f"; ctx.fillRect(-7, -4, 5, 8); // Brass feed
            for (let b = 0; b < 6; b++) {
              const ba = spin + (Math.PI / 3) * b;
              const by = Math.sin(ba) * 5.5;
              this.drawTemperedBarrel(ctx, 24, by - 1.5, 9, 3);
            }
          } else if (t.branch === 'B') {
            // Anti-Materiel Sniper Rail-Pulse
            this.drawBevelPlate(ctx, -8, -7, 18, 14, "#1e293b", "#00b0ff", 3);
            this.drawTemperedBarrel(ctx, 10, -3, 38, 6);
            this.drawSlottedMuzzleBrake(ctx, 46, -4.5, 6, 9, 2);
            // Targeting Laser
            ctx.fillStyle = "#ffd600"; ctx.fillRect(16, -7, 12, 3.5);
          } else {
            // Dual Heavy Autocannon Barrels with Slotted Muzzle Brakes
            this.drawBevelPlate(ctx, -9, -9, 18, 18, "#1e293b", "#475569", 3);
            this.drawTemperedBarrel(ctx, 3, -8, 23, 5.5);
            this.drawTemperedBarrel(ctx, 3, 2.5, 23, 5.5);
            this.drawSlottedMuzzleBrake(ctx, 24, -9, 4, 7.5, 2);
            this.drawSlottedMuzzleBrake(ctx, 24, 1.5, 4, 7.5, 2);
          }
        } else if (t.type === 'mortar') {
          if (t.branch === 'A') {
            // Hexagonal Cluster Rocket Pod
            this.drawBevelPlate(ctx, -9, -12, 26, 24, "#334155", "#ff9100", 4);
            ctx.fillStyle = "#ff1744";
            ctx.fillRect(17, -9, 4, 5); ctx.fillRect(17, -2, 4, 5); ctx.fillRect(17, 5, 4, 5);
          } else if (t.branch === 'B') {
            // Napalm Flame Projector & Pressurized Fuel Tanks
            this.drawBevelPlate(ctx, -7, -11, 24, 22, "#334155", "#ff3d00", 3);
            ctx.fillStyle = "#ff3d00"; ctx.fillRect(-12, -9, 6, 18);
            ctx.fillStyle = "#ffd600"; ctx.fillRect(17, -3, 10, 6);
          } else {
            // Heavy 155mm Howitzer with Armored Recoil Mantlet
            this.drawBevelPlate(ctx, -11, -11, 16, 22, "#1e293b", "#ff9100", 4);
            this.drawTemperedBarrel(ctx, 5, -7, 26, 14);
            this.drawSlottedMuzzleBrake(ctx, 28, -9, 6, 18, 2);
          }
        } else if (t.type === 'cryo') {
          if (t.branch === 'A') {
            // Blizzard Zero Crystalline Spire
            const cryoGrad = ctx.createLinearGradient(20, 0, -9, 0);
            cryoGrad.addColorStop(0, "#ffffff"); cryoGrad.addColorStop(0.5, "#00f0ff"); cryoGrad.addColorStop(1, "#0066cc");
            ctx.fillStyle = cryoGrad;
            ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-9, -12); ctx.lineTo(-4, 0); ctx.lineTo(-9, 12);
            ctx.closePath(); ctx.fill(); ctx.stroke();
          } else if (t.branch === 'B') {
            // Tesla Chain-Frost Dual Prongs
            this.drawBevelPlate(ctx, -7, -10, 18, 20, "#334155", "#76ff03", 3);
            ctx.strokeStyle = "#76ff03"; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(11, -8); ctx.lineTo(27, -5); ctx.moveTo(11, 8); ctx.lineTo(27, 5);
            ctx.stroke();
          } else {
            // Frosted Cryogenic Pressure Sphere
            const spGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 15);
            spGrad.addColorStop(0, "#ffffff"); spGrad.addColorStop(0.4, "#00e5ff"); spGrad.addColorStop(1, "#0284c7");
            ctx.fillStyle = spGrad;
            ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.stroke();
          }
        } else if (t.type === 'railgun') {
          if (t.branch === 'A') {
            // Hyper Beam Optical Ruby Prism Array
            this.drawBevelPlate(ctx, -2, -6, 34, 12, "#ff007f", "#ff4081", 3);
            ctx.fillStyle = "#ffffff"; ctx.fillRect(30, -7, 7, 14);
          } else if (t.branch === 'B') {
            // Ion Disruptor Triple Toroidal Rings
            this.drawTemperedBarrel(ctx, 0, -4, 30, 8);
            ctx.strokeStyle = "#e040fb"; ctx.lineWidth = 2.2;
            for (let r = 8; r <= 24; r += 8) ctx.strokeRect(r, -7, 3.5, 14);
          } else {
            // Heavy Magnetic Induction Rails
            this.drawBevelPlate(ctx, -9, -9, 15, 18, "#334155", "#ff007f", 3);
            this.drawTemperedBarrel(ctx, 0, -4, 34, 8);
            ctx.fillStyle = "#ffd600"; ctx.fillRect(11, -7, 4, 14); ctx.fillRect(21, -7, 4, 14);
          }
        } else if (t.type === 'flame') {
          // Dual Pressurized Napalm Canisters & Pilot Flame
          this.drawBevelPlate(ctx, -9, -12, 22, 24, pbr.castGunmetal || "#334155", "#ff5722", 3);
          ctx.fillStyle = "#d97706";
          ctx.fillRect(-14, -10, 6, 20);
          this.drawTemperedBarrel(ctx, 4, -4, 20, 8);
          const pFlicker = Math.sin(performance.now() * 0.03) * 2;
          ctx.fillStyle = "#ff9100";
          ctx.beginPath(); ctx.arc(25 + pFlicker, 0, 4, 0, Math.PI * 2); ctx.fill();
        } else if (t.type === 'beacon') {
          // Revolving Tactical Radar Sweep Dish
          const sweepA = performance.now() * 0.003;
          ctx.save();
          ctx.rotate(sweepA);
          ctx.strokeStyle = "rgba(179, 136, 255, 0.85)";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, 0, 16, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(16, 0); ctx.stroke();
          ctx.restore();

          const spGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 12);
          spGrad.addColorStop(0, "#ffffff"); spGrad.addColorStop(0.5, "#b388ff"); spGrad.addColorStop(1, "#651fff");
          ctx.fillStyle = spGrad;
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#ffd600"; ctx.lineWidth = 1.5; ctx.stroke();
        } else if (t.type === 'tesla') {
          // Induction Coil Stack & Spherical Electrode with Dancing Sparks
          this.drawBevelPlate(ctx, -9, -11, 18, 22, pbr.castGunmetal || "#334155", "#ffd600", 3);
          const tGrad = ctx.createRadialGradient(10, 0, 1, 10, 0, 9);
          tGrad.addColorStop(0, "#ffffff"); tGrad.addColorStop(0.5, "#ffd600"); tGrad.addColorStop(1, "#b45309");
          ctx.fillStyle = tGrad;
          ctx.beginPath(); ctx.arc(10, 0, 8.5, 0, Math.PI * 2); ctx.fill();

          ctx.save();
          ctx.strokeStyle = "rgba(255, 214, 0, 0.85)";
          ctx.lineWidth = 1.4;
          const sparkT = performance.now() * 0.02;
          for (let s = 0; s < 3; s++) {
            const sa = sparkT + s * (Math.PI * 2 / 3);
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(10 + Math.cos(sa) * 14, Math.sin(sa) * 14);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Overheating Barrel Thermal Radiation Glow (Cherry-red to molten yellow)
        if (t.heat && t.heat > 0.05) {
          ctx.save();
          const hAlpha = Math.min(0.85, t.heat * 1.1);
          const hGrad = ctx.createLinearGradient(0, 0, 36, 0);
          hGrad.addColorStop(0, `rgba(180, 20, 0, ${hAlpha * 0.35})`);
          hGrad.addColorStop(0.6, `rgba(255, 61, 0, ${hAlpha * 0.8})`);
          hGrad.addColorStop(1, `rgba(255, 235, 59, ${hAlpha})`);
          ctx.fillStyle = hGrad;
          ctx.shadowColor = "#ff3d00";
          ctx.shadowBlur = 12 * t.heat;
          ctx.fillRect(4, -5, 28, 10);
          ctx.restore();
        }

        // Side Muzzle Brake High-Pressure Gas Exhaust Jets
        if (t.recoil && t.recoil > 0.12) {
          ctx.save();
          const gLen = t.recoil * 18;
          const gGrad = ctx.createLinearGradient(24, 0, 24, -gLen);
          gGrad.addColorStop(0, "#ffffff");
          gGrad.addColorStop(0.4, "#ff9100");
          gGrad.addColorStop(1, "rgba(255, 61, 0, 0)");
          ctx.fillStyle = gGrad;
          ctx.beginPath();
          ctx.moveTo(25, -6); ctx.lineTo(25 - gLen * 0.4, -6 - gLen); ctx.lineTo(31, -6); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(25, 6); ctx.lineTo(25 - gLen * 0.4, 6 + gLen); ctx.lineTo(31, 6); ctx.fill();
          ctx.restore();
        }

        // Dynamic Recoil Muzzle Flash Burst when firing
        if (t.recoil && t.recoil > 0.05) {
          ctx.save();
          const flashSize = 6 + t.recoil * 14;
          const flashGrad = ctx.createRadialGradient(30, 0, 1, 30, 0, flashSize);
          flashGrad.addColorStop(0, "#ffffff");
          flashGrad.addColorStop(0.35, color);
          flashGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = flashGrad;
          ctx.beginPath(); ctx.arc(30, 0, flashSize, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }

        ctx.restore();

        // 4. Floating Tactical Ammo / Charge Bar
        if (t.heat > 0) {
          ctx.fillStyle = "#ff3d00";
          ctx.fillRect(t.x - 14, t.y - 30, 28 * t.heat, 3);
        }
      }
    }

    renderEnemies() {
      const ctx = this.ctx;
      const tNow = performance.now();
      const pbr = this.pbrPatterns || {};
      const metalPat = pbr.castGunmetal || "#334155";
      const carbonPat = pbr.carbonFiber || "#1e293b";
      const treadPat = pbr.caterpillarTread || "#090d16";

      for (const e of this.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);

        if (e.isFlyer) {
          if (e.type === "gunship") {
            // VTOL Heavy Aerial Attack Gunship
            this.drawUnitContactShadow(ctx, 24, 13, 0.45);
            ctx.rotate(e.angle);
            const rotorSpin = tNow * 0.055;

            // Swept Composite Stealth Wings with Carbon-Fiber PBR
            this.drawBevelPlate(ctx, -7, -24, 9, 48, carbonPat, "#64748b", 2);

            // Dual Tilting Tilt-Rotor Nacelles with Chrome Hydraulic Pivots
            this.drawChromePiston(ctx, -5, -28, 10, 8);
            this.drawChromePiston(ctx, -5, 20, 10, 8);

            // Rapid 3-Blade Rotor Discs with Motion Blur Trails
            ctx.save();
            ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
            ctx.lineWidth = 1.8;
            for (let b = 0; b < 3; b++) {
              const ba = rotorSpin + (Math.PI * 2 / 3) * b;
              ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(Math.cos(ba) * 16, -24 + Math.sin(ba) * 16); ctx.stroke();
              const ba2 = -rotorSpin + (Math.PI * 2 / 3) * b;
              ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(Math.cos(ba2) * 16, 24 + Math.sin(ba2) * 16); ctx.stroke();
            }
            ctx.restore();

            // Aerodynamic Carbon-Fiber Fuselage
            const fGrad = ctx.createLinearGradient(-19, -12, 21, 12);
            fGrad.addColorStop(0, "#475569"); fGrad.addColorStop(0.4, "#1e293b"); fGrad.addColorStop(1, "#090d16");
            ctx.fillStyle = fGrad;
            ctx.beginPath();
            ctx.moveTo(23, 0); ctx.lineTo(11, -11); ctx.lineTo(-16, -9); ctx.lineTo(-21, -13);
            ctx.lineTo(-19, 0); ctx.lineTo(-21, 13); ctx.lineTo(-16, 9); ctx.lineTo(11, 11);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 2.0; ctx.stroke();

            // Cockpit Canopy Reflection
            const cGrad = ctx.createLinearGradient(5, -4, 16, 4);
            cGrad.addColorStop(0, "#ffffff"); cGrad.addColorStop(0.5, "#00e5ff"); cGrad.addColorStop(1, "#0284c7");
            ctx.fillStyle = cGrad;
            ctx.beginPath(); ctx.ellipse(10, 0, 7.5, 4, 0, 0, Math.PI * 2); ctx.fill();

            // Underslung Chin 30mm Rotary Autocannon with Recoil & Muzzle Flash
            this.drawTemperedBarrel(ctx, 17, -1.5, 10, 3);
            const gunRecoil = (Math.sin(tNow * 0.04) > 0.7);
            if (gunRecoil) {
              ctx.fillStyle = "#ffffff";
              ctx.beginPath(); ctx.arc(28, 0, 4, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = "rgba(255, 214, 0, 0.75)";
              ctx.beginPath(); ctx.arc(29, 0, 8, 0, Math.PI * 2); ctx.fill();
            }

            // Floating HP
            ctx.rotate(-e.angle);
            const fHpPct = Math.max(0, e.hp / e.maxHp);
            ctx.fillStyle = "#090d16"; ctx.fillRect(-18, -27, 36, 4.5);
            ctx.fillStyle = "#00e5ff"; ctx.fillRect(-18, -27, 36 * fHpPct, 4.5);
            ctx.restore();
            continue;
          }

          // Aerial Fighter Jet
          this.drawUnitContactShadow(ctx, 18, 9, 0.4);
          ctx.rotate(e.angle);
          ctx.fillStyle = e.color || "#00e5ff";
          ctx.beginPath();
          ctx.moveTo(17, 0); ctx.lineTo(-13, -13); ctx.lineTo(-8, 0); ctx.lineTo(-13, 13);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.4; ctx.stroke();
          ctx.rotate(-e.angle);
          const fHpPct = Math.max(0, e.hp / e.maxHp);
          ctx.fillStyle = "#090d16"; ctx.fillRect(-14, -22, 28, 4);
          ctx.fillStyle = fHpPct > 0.4 ? "#00e5ff" : "#ff1744"; ctx.fillRect(-14, -22, 28 * fHpPct, 4);
          ctx.restore();
          continue;
        }

        if (e.phased) ctx.globalAlpha = 0.25;

        // Ground Unit Contact Shadow
        this.drawUnitContactShadow(ctx, e.size * 1.1, e.size * 0.7, 0.55);

        // Slow Frost Field Aura
        if (e.slowTimer > 0) {
          ctx.strokeStyle = "#00f0ff"; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(0, 0, e.size + 6, 0, Math.PI * 2); ctx.stroke();
        }

        // Energy Shield Dome
        if (e.shield > 0) {
          ctx.strokeStyle = "rgba(0, 176, 255, 0.85)"; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(0, 0, e.size + 8, 0, Math.PI * 2); ctx.stroke();
        }

        // --- ARTICULATED PHOTOREALISTIC PROCEDURAL ENEMY MODELS ---
        if (e.type === "grunt") {
          // Cyborg Shock-Trooper
          ctx.rotate(e.angle);
          const walk = Math.sin(e.walkAnim || 0) * 5;
          // Leg pistons & boots
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(-10 + walk, -9, 8, 4.5);
          ctx.fillRect(-10 - walk, 4.5, 8, 4.5);
          this.drawChromePiston(ctx, -7 + walk, -8, 5, 2.5);
          this.drawChromePiston(ctx, -7 - walk, 5.5, 5, 2.5);

          // Ballistic Kevlar Chest Rig with Cast Gunmetal
          this.drawBevelPlate(ctx, -8, -8, 16, 16, metalPat, e.color || "#00e5ff", 3);
          this.drawRivet(ctx, -6, -6); this.drawRivet(ctx, 6, -6);
          this.drawRivet(ctx, -6, 6); this.drawRivet(ctx, 6, 6);

          // Combat Helmet & Glowing NVG Visor
          ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(4, 0, 5.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#00e5ff"; ctx.fillRect(6, -2.5, 4, 5);
          ctx.fillStyle = "#ffffff"; ctx.fillRect(8, -1.2, 1.8, 2.4);

          // Assault Carbine with Dynamic Recoil & Muzzle Flash
          const firing = (Math.sin(tNow * 0.03 + e.x) > 0.65);
          this.drawTemperedBarrel(ctx, 7 - (firing ? 2 : 0), 3, 14, 3.5);
          if (firing) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(22, 3, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(0, 229, 255, 0.75)";
            ctx.beginPath(); ctx.arc(23, 3, 6, 0, Math.PI * 2); ctx.fill();
          }

        } else if (e.type === "sprinter") {
          // Quadruped Predator Cyber-Hound
          ctx.rotate(e.angle);
          const runFore = Math.sin(e.walkAnim || 0) * 7;
          const runHind = Math.sin((e.walkAnim || 0) + 1.2) * 7;
          // Articulated Gallop Legs with Chrome Hydraulic Pistons
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(4 + runFore, -12, 7, 4.5); ctx.fillRect(4 - runFore, 7.5, 7, 4.5);
          ctx.fillRect(-12 - runHind, -11, 7, 5); ctx.fillRect(-12 + runHind, 6, 7, 5);
          this.drawChromePiston(ctx, 5 + runFore, -10.5, 5, 2.2);
          this.drawChromePiston(ctx, 5 - runFore, 8.5, 5, 2.2);

          // Flexible Carbon Chassis with Carbon-Fiber PBR
          this.drawBevelPlate(ctx, -13, -8, 26, 16, carbonPat, e.color || "#ffd600", 4);
          // Heat dissipation spine vents
          ctx.fillStyle = "#ff5722";
          ctx.fillRect(-6, -1.5, 3, 3); ctx.fillRect(0, -1.5, 3, 3);

          // Cyber Skull & Glowing Crimson Optics
          ctx.fillStyle = "#0f172a";
          ctx.beginPath(); ctx.moveTo(9, -4.5); ctx.lineTo(18, 0); ctx.lineTo(9, 4.5); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#ff1744"; ctx.fillRect(13, -2, 4, 4);
          ctx.fillStyle = "#ffffff"; ctx.fillRect(15, -1, 2, 2);

        } else if (e.type === "brute") {
          // 4-Meter War-Mech Juggernaut
          ctx.rotate(e.angle);
          const stomp = Math.sin(e.walkAnim || 0) * 4.5;
          ctx.fillStyle = "#090d16";
          ctx.fillRect(-18 + stomp, -19, 12, 9); ctx.fillRect(-18 - stomp, 10, 12, 9);
          this.drawChromePiston(ctx, -16 + stomp, -16, 8, 4);
          this.drawChromePiston(ctx, -16 - stomp, 13, 8, 4);

          // Bolted Glacis Armor & Hazard Stripes with Cast Gunmetal
          this.drawBevelPlate(ctx, -16, -17, 30, 34, metalPat, e.color || "#ff007f", 4);
          this.drawHazardStripes(ctx, -14, -14, 6, 28, 4);
          this.drawRivet(ctx, -14, -15); this.drawRivet(ctx, 11, -15);
          this.drawRivet(ctx, -14, 15); this.drawRivet(ctx, 11, 15);

          // Twin Exhaust Smokestacks spewing soot & ember sparks
          ctx.fillStyle = "#1e293b"; ctx.fillRect(-19, -15, 5, 8); ctx.fillRect(-19, 7, 5, 8);
          ctx.fillStyle = "#ff3d00"; ctx.fillRect(-20, -14, 2, 6); ctx.fillRect(-20, 8, 2, 6);
          const sparkOffset = Math.sin(tNow * 0.05) * 3;
          ctx.fillStyle = "rgba(255, 87, 34, 0.8)";
          ctx.beginPath(); ctx.arc(-24 + sparkOffset, -11, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(-24 - sparkOffset, 11, 2.5, 0, Math.PI * 2); ctx.fill();

          // Hydraulic Ram Power-Fists
          this.drawChromePiston(ctx, 9, -21, 17, 8);
          this.drawChromePiston(ctx, 9, 13, 17, 8);
          // Glowing Thermal Reactor Grille
          ctx.fillStyle = "#ff1744"; ctx.fillRect(7, -4.5, 8, 9);
          ctx.fillStyle = "#ffd600"; ctx.fillRect(9, -2.5, 5, 5);

        } else if (e.type === "kamikaze") {
          // Skittering Spider-Mine with Ticking Strobe
          ctx.rotate(e.angle);
          const kWalk = Math.sin(tNow * 0.035) * 5;
          ctx.strokeStyle = "#ff3d00"; ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(-5, -6); ctx.lineTo(-12, -14 + kWalk);
          ctx.moveTo(5, -6); ctx.lineTo(12, -14 - kWalk);
          ctx.moveTo(-5, 6); ctx.lineTo(-12, 14 - kWalk);
          ctx.moveTo(5, 6); ctx.lineTo(12, 14 + kWalk);
          ctx.stroke();

          // High-Explosive Spherical Payload with Metallic Cast Alloy
          const kGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 10);
          kGrad.addColorStop(0, "#cbd5e1"); kGrad.addColorStop(0.5, "#475569"); kGrad.addColorStop(1, "#090d16");
          ctx.fillStyle = kGrad; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();

          // High-Intensity Ticking Crimson Strobe
          const kStrobe = Math.sin(tNow * 0.025) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255, 23, 68, ${0.5 + kStrobe * 0.5})`;
          ctx.beginPath(); ctx.arc(0, 0, 5 + kStrobe * 2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();

        } else if (e.type === "swarmling") {
          // Nano-Arachnid Bio-Drone
          ctx.rotate(e.angle);
          const walkS = Math.sin(tNow * 0.025) * 4;
          ctx.strokeStyle = "#ffab00"; ctx.lineWidth = 1.8;
          for (let i = 0; i < 3; i++) {
            const ly = -9 + i * 9;
            const st = (i % 2 === 0 ? walkS : -walkS);
            ctx.beginPath();
            ctx.moveTo(-2, ly); ctx.lineTo(-8, ly + st); ctx.lineTo(-14, ly + st * 1.5); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(2, ly); ctx.lineTo(8, ly - st); ctx.lineTo(14, ly - st * 1.5); ctx.stroke();
          }

          // Armored Chitin Carapace with Carbon-Fiber PBR
          this.drawBevelPlate(ctx, -10, -7, 18, 14, carbonPat, "#ffab00", 3);
          ctx.fillStyle = "#ff1744"; ctx.fillRect(4, -2.5, 4, 5);
          ctx.fillStyle = "#ffffff"; ctx.fillRect(6, -1.2, 1.8, 2.4);

        } else if (e.type === "shieldbearer") {
          // Aegis Paladin Mech with Hex-Pavise Shield
          ctx.rotate(e.angle);
          this.drawBevelPlate(ctx, -13, -12, 18, 24, metalPat, "#00b0ff", 4);
          ctx.fillStyle = "#00e5ff"; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();

          // Curved Holographic Hex Shield with Dynamic Energy Ripple
          ctx.save();
          ctx.strokeStyle = "rgba(0, 176, 255, 0.95)";
          ctx.fillStyle = "rgba(0, 229, 255, 0.35)";
          ctx.lineWidth = 3.5;
          ctx.beginPath(); ctx.arc(13, 0, 24, -Math.PI / 2.2, Math.PI / 2.2); ctx.stroke(); ctx.fill();
          // Shimmering Hex Grid Deflector Line
          const shieldPulse = Math.sin(tNow * 0.01) * 2;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(13 + shieldPulse, 0, 21, -Math.PI / 2.5, Math.PI / 2.5); ctx.stroke();
          ctx.restore();

        } else if (e.type === "medic") {
          // Quad-Rotor Bio-Synth Drone
          ctx.rotate(e.angle);
          const bob = Math.sin(tNow * 0.005) * 2;
          this.drawBevelPlate(ctx, -12, -12 + bob, 24, 24, "#064e3b", "#00e676", 5);
          ctx.fillStyle = "#00e676";
          ctx.fillRect(-3, bob - 8, 6, 16); ctx.fillRect(-8, bob - 3, 16, 6);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-1.5, bob - 5.5, 3, 11); ctx.fillRect(-5.5, bob - 1.5, 11, 3);

          // Oscillating Nano-Repair Laser Emitter
          const repairGlow = Math.sin(tNow * 0.02) * 0.4 + 0.6;
          ctx.fillStyle = `rgba(0, 230, 118, ${repairGlow})`;
          ctx.beginPath(); ctx.arc(12, bob, 3, 0, Math.PI * 2); ctx.fill();

        } else if (e.type === "phantom") {
          // Stealth Spectre with Active-Camo Chromatic Aberration
          ctx.rotate(e.angle);
          const shimmer = Math.sin(tNow * 0.015) * 3.5;
          ctx.fillStyle = "rgba(255, 0, 127, 0.35)"; ctx.fillRect(-10 + shimmer, -8, 16, 16);
          ctx.fillStyle = "rgba(0, 229, 255, 0.35)"; ctx.fillRect(-10 - shimmer, -8, 16, 16);
          this.drawBevelPlate(ctx, -11, -9, 22, 18, "rgba(109, 40, 217, 0.85)", "#c084fc", 4);
          this.drawTemperedBarrel(ctx, 8, -6, 12, 3);
          this.drawTemperedBarrel(ctx, 8, 3, 12, 3);

        } else if (e.type === "juggernaut" || e.type === "boss" || e.isBoss) {
          // TITAN DREADNOUGHT FORTRESS (Boss War-Machine)
          ctx.rotate(e.angle);
          const walkB = Math.sin(e.walkAnim || 0) * 5;

          // 4 Independent Heavy Caterpillar Tread Assemblies with Tread Pattern
          ctx.fillStyle = treadPat;
          ctx.fillRect(-28 + walkB, -30, 20, 14); ctx.fillRect(-28 - walkB, 16, 20, 14);
          ctx.fillRect(8 - walkB, -30, 20, 14); ctx.fillRect(8 + walkB, 16, 20, 14);
          ctx.strokeStyle = "#ff1744"; ctx.lineWidth = 1.8;
          ctx.strokeRect(-28 + walkB, -30, 20, 14); ctx.strokeRect(-28 - walkB, 16, 20, 14);
          ctx.strokeRect(8 - walkB, -30, 20, 14); ctx.strokeRect(8 + walkB, 16, 20, 14);

          // Sloped Reactive Fortress Armor Glacis with Cast Gunmetal
          this.drawBevelPlate(ctx, -24, -24, 48, 48, metalPat, "#ff1744", 6);
          this.drawHazardStripes(ctx, -20, -20, 8, 40, 5);
          this.drawRivet(ctx, -20, -20); this.drawRivet(ctx, 20, -20);
          this.drawRivet(ctx, -20, 20); this.drawRivet(ctx, 20, 20);

          // Dual Heavy Siege Howitzer Barrels with Recoil & Muzzle Flash
          const bossRecoil = (Math.sin(tNow * 0.02) > 0.8);
          const bOffset = bossRecoil ? 4 : 0;
          this.drawTemperedBarrel(ctx, 16 - bOffset, -11, 26, 8);
          this.drawTemperedBarrel(ctx, 16 - bOffset, 3, 26, 8);
          this.drawSlottedMuzzleBrake(ctx, 38 - bOffset, -12.5, 6, 11, 2);
          this.drawSlottedMuzzleBrake(ctx, 38 - bOffset, 1.5, 6, 11, 2);
          if (bossRecoil) {
            // Muzzle flash bursts
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(46, -7, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(46, 7, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(255, 23, 68, 0.75)";
            ctx.beginPath(); ctx.arc(48, -7, 12, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(48, 7, 12, 0, Math.PI * 2); ctx.fill();

            // Muzzle brake side blast gas jets
            ctx.fillStyle = "rgba(255, 145, 0, 0.85)";
            ctx.beginPath();
            ctx.moveTo(38 - bOffset, -14); ctx.lineTo(32 - bOffset, -22); ctx.lineTo(44 - bOffset, -14); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(38 - bOffset, 14); ctx.lineTo(32 - bOffset, 22); ctx.lineTo(44 - bOffset, 14); ctx.fill();

            // Glowing cherry-red barrel heat overlay
            ctx.fillStyle = "rgba(255, 61, 0, 0.65)";
            ctx.fillRect(18 - bOffset, -10, 22, 6);
            ctx.fillRect(18 - bOffset, 4, 22, 6);
          }

          // Center Rotating Command Cupola
          ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#ffd600"; ctx.lineWidth = 2.2; ctx.stroke();
          ctx.fillStyle = "#ff1744"; ctx.beginPath(); ctx.arc(4, 0, 4, 0, Math.PI * 2); ctx.fill();

        } else {
          this.drawBevelPlate(ctx, -e.size, -e.size, e.size * 2, e.size * 2, metalPat, e.color || "#00e5ff", 3);
        }

        // Colorblind Indicator Icon
        if (this.colorblind) {
          ctx.fillStyle = "#ffffff"; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
          ctx.fillText(e.marker, 0, 4);
        }

        ctx.restore();

        // Modern Floating Health Bar
        const barW = Math.max(32, e.size * 2.2);
        const barH = e.isBoss ? 6 : 4.5;
        const bx = e.x - barW / 2;
        const by = e.y - e.size - 13;

        ctx.fillStyle = "#0a0f1d"; ctx.fillRect(bx, by, barW, barH);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.4)"; ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barW, barH);

        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = e.isBoss ? "#ff1744" : "#00e676";
        ctx.fillRect(bx, by, barW * hpPct, barH);

        if (e.maxShield > 0) {
          const shPct = Math.max(0, e.shield / e.maxShield);
          ctx.fillStyle = "#00b0ff"; ctx.fillRect(bx, by - 3.5, barW * shPct, 2.5);
        }
      }
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
        } else if (p.type === 'siege_shell') {
          // Heavy 120mm High-Explosive Siege Shell with Glowing Tracer
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          const sAngle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX);
          this.ctx.rotate(sAngle);
          this.ctx.fillStyle = "rgba(255, 145, 0, 0.6)";
          this.ctx.fillRect(-14, -3, 14, 6);
          this.ctx.fillStyle = "#ffd600";
          this.ctx.fillRect(-6, -3, 12, 6);
          this.ctx.fillStyle = "#ffffff";
          this.ctx.fillRect(2, -1.5, 4, 3);
          this.ctx.restore();
        } else if (p.type === 'missile') {
          // Micro-Missile with Rocket Exhaust Flame
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.angle || 0);
          this.ctx.fillStyle = "#ff3d00";
          this.ctx.fillRect(-8, -1.5, 6, 3);
          this.ctx.fillStyle = "#eceff1";
          this.ctx.fillRect(-3, -2, 8, 4);
          this.ctx.fillStyle = "#ff1744";
          this.ctx.fillRect(4, -1.5, 3, 3);
          this.ctx.restore();
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

    renderTacticalDragVector() {
      if (!this.tacticalDragVector || !this.tacticalDragVector.active) return;
      const v = this.tacticalDragVector;
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = v.color || "#00e5ff";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(v.sx, v.sy);
      ctx.lineTo(v.ex, v.ey);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = v.color || "#00e5ff";
      ctx.beginPath();
      ctx.arc(v.ex, v.ey, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    renderRadialBuildWheel() {
      if (!this.radialBuildCell) return;
      const ctx = this.ctx;
      const t = this.uiTime || 0;
      const rc = this.radialBuildCell;

      rc.anim = Math.min(1.0, (rc.anim || 0) + 0.14);
      const scale = rc.anim;

      // 1. Highlight selected cell
      ctx.save();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2.5;
      ctx.fillStyle = "rgba(0, 229, 255, 0.22)";
      ctx.fillRect(rc.gx * 64 + 2, rc.gy * 64 + 2, 60, 60);
      ctx.strokeRect(rc.gx * 64 + 2, rc.gy * 64 + 2, 60, 60);

      // Center close button at (rc.px, rc.py)
      ctx.fillStyle = "rgba(255, 23, 68, 0.85)";
      ctx.beginPath();
      ctx.arc(rc.px, rc.py, 16 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("✕", rc.px, rc.py + 4);

      // Rotating dashed calibration ring
      const R = 84 * scale;
      const rot = t * 1.5;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.arc(rc.px, rc.py, R, rot, rot + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const options = [
        { key: 'pulse', icon: "⚡", label: "PULSE" },
        { key: 'mortar', icon: "💣", label: "MORTAR" },
        { key: 'cryo', icon: "❄️", label: "CRYO" },
        { key: 'tesla', icon: "⚡", label: "TESLA" },
        { key: 'flame', icon: "🔥", label: "FLAME" },
        { key: 'railgun', icon: "🎯", label: "RAILGUN" },
        { key: 'beacon', icon: "📡", label: "BEACON" },
        { key: 'barricade', icon: "🛡️", label: "TO'SIQ" }
      ];

      for (let i = 0; i < 8; i++) {
        const opt = options[i];
        const def = (opt.key === 'barricade') ? { cost: 40, color: "#ffd600" } : TOWER_DEFS[opt.key];
        const canAfford = this.gold >= def.cost;
        const ang = -Math.PI / 2 + (Math.PI * 2 / 8) * i;
        const bx = rc.px + Math.cos(ang) * R;
        const by = rc.py + Math.sin(ang) * R;
        const br = 24 * scale;

        // Connecting spoke
        ctx.strokeStyle = canAfford ? "rgba(0, 229, 255, 0.4)" : "rgba(100, 116, 139, 0.25)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(rc.px + Math.cos(ang) * 18, rc.py + Math.sin(ang) * 18);
        ctx.lineTo(bx - Math.cos(ang) * br, by - Math.sin(ang) * br);
        ctx.stroke();

        // Orb glassmorphic fill
        const grad = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, 0, bx, by, br);
        if (canAfford) {
          grad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
          grad.addColorStop(0.3, "rgba(20, 36, 62, 0.95)");
          grad.addColorStop(1, "rgba(8, 14, 26, 0.98)");
        } else {
          grad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
          grad.addColorStop(0.4, "rgba(15, 20, 28, 0.92)");
          grad.addColorStop(1, "rgba(5, 8, 14, 0.98)");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = canAfford ? def.color : "#455a64";
        ctx.lineWidth = canAfford ? 2.0 : 1.2;
        ctx.shadowColor = canAfford ? def.color : "transparent";
        ctx.shadowBlur = canAfford ? 8 : 0;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Icon & Cost Text
        ctx.textAlign = "center";
        ctx.fillStyle = canAfford ? def.color : "#78909c";
        ctx.font = "bold 13px 'Segoe UI', monospace";
        ctx.fillText(opt.icon, bx, by - 2);

        ctx.fillStyle = canAfford ? "#ffffff" : "#607d8b";
        ctx.font = "bold 9px monospace";
        ctx.fillText(`${def.cost}g`, bx, by + 12);
      }

      ctx.restore();
    }

    renderMinimapHUD() {
      const ctx = this.ctx;
      const t = this.uiTime || 0;
      const rx = 1118;
      const ry = 62;
      const rw = 148;
      const rh = 100;
      const cut = 8;

      ctx.save();

      // Collapsed pill badge if minimized
      if (!this.minimapExpanded) {
        this.renderMiniButton(rx + rw - 85, ry, 85, 28, "📡 RADAR", "#00e5ff");
        ctx.restore();
        return;
      }

      // Frosted Glassmorphism Radar Panel Frame
      ctx.beginPath();
      ctx.moveTo(rx + cut, ry);
      ctx.lineTo(rx + rw - cut, ry);
      ctx.lineTo(rx + rw, ry + cut);
      ctx.lineTo(rx + rw, ry + rh - cut);
      ctx.lineTo(rx + rw - cut, ry + rh);
      ctx.lineTo(rx + cut, ry + rh);
      ctx.lineTo(rx, ry + rh - cut);
      ctx.lineTo(rx, ry + cut);
      ctx.closePath();

      const bgGrad = ctx.createLinearGradient(rx, ry, rx, ry + rh);
      bgGrad.addColorStop(0, "rgba(10, 20, 36, 0.94)");
      bgGrad.addColorStop(1, "rgba(4, 8, 16, 0.98)");
      ctx.fillStyle = bgGrad;
      ctx.fill();

      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 1.4;
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Header Bar: "RADAR // FEED" + rec dot + minimize toggle
      ctx.fillStyle = "rgba(0, 229, 255, 0.12)";
      ctx.fillRect(rx + 1, ry + 1, rw - 2, 18);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
      ctx.strokeRect(rx + 1, ry + 1, rw - 2, 18);

      ctx.textAlign = "left";
      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("📡 RADAR // FEED", rx + 8, ry + 13);

      const recBlink = Math.sin(t * 5) > 0;
      ctx.fillStyle = recBlink ? "#00e676" : "#ff1744";
      ctx.beginPath();
      ctx.arc(rx + rw - 28, ry + 10, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#78909c";
      ctx.font = "bold 9px monospace";
      ctx.fillText("▾", rx + rw - 14, ry + 13);

      // Inner Display Area: maps 1280 x 704 to inner display
      const ix = rx + 6;
      const iy = ry + 22;
      const iw = rw - 12;
      const ih = rh - 26;
      const sx = iw / 1280;
      const sy = ih / 704;

      ctx.save();
      ctx.beginPath();
      ctx.rect(ix, iy, iw, ih);
      ctx.clip();

      // Faint cyber grid inside radar screen
      ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let gx = ix; gx <= ix + iw; gx += 16) {
        ctx.beginPath(); ctx.moveTo(gx, iy); ctx.lineTo(gx, iy + ih); ctx.stroke();
      }
      for (let gy = iy; gy <= iy + ih; gy += 14) {
        ctx.beginPath(); ctx.moveTo(ix, gy); ctx.lineTo(ix + iw, gy); ctx.stroke();
      }

      // Draw map lanes in glowing faint cyan
      if (this.bakedLanes) {
        ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
        ctx.lineWidth = 1.5;
        for (const lane of this.bakedLanes) {
          const pts = lane ? (lane.waypoints || lane.points || (Array.isArray(lane) ? lane : null)) : null;
          if (!pts || pts.length === 0 || !pts[0]) continue;
          ctx.beginPath();
          ctx.moveTo(ix + pts[0].x * sx, iy + pts[0].y * sy);
          for (let p = 1; p < pts.length; p++) {
            if (pts[p]) ctx.lineTo(ix + pts[p].x * sx, iy + pts[p].y * sy);
          }
          ctx.stroke();
        }
      }

      // Draw Towers as colored dots
      for (const tow of this.towers) {
        const def = TOWER_DEFS[tow.type];
        ctx.fillStyle = def ? def.color : "#00e5ff";
        ctx.fillRect(ix + tow.x * sx - 1.5, iy + tow.y * sy - 1.5, 3, 3);
      }

      // Draw Core Base as glowing cyan diamond
      const map = (this.gameMode === 'CUSTOM') ? (this.customMap || { basePos: { x: 19, y: 5 } }) : MAPS[this.currentMapIndex];
      const coreX = (map.basePos ? map.basePos.x * 64 + 32 : 1248) * sx;
      const coreY = (map.basePos ? map.basePos.y * 64 + 32 : 352) * sy;
      ctx.fillStyle = "#00e5ff";
      ctx.beginPath();
      ctx.arc(ix + coreX, iy + coreY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw Field Hero Mech as amber blip
      if (this.hero) {
        const hx = ix + this.hero.x * sx;
        const hy = iy + this.hero.y * sy;
        ctx.fillStyle = "#ffd600";
        ctx.beginPath();
        ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Enemies as glowing red dots (Bosses as pulsing yellow/red diamond)
      for (const e of this.enemies) {
        const ex = ix + e.x * sx;
        const ey = iy + e.y * sy;
        if (e.isBoss) {
          ctx.fillStyle = "#ff1744";
          ctx.strokeStyle = "#ffd600";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = e.type === 'swarmling' ? "#ffab00" : (e.type === 'brute' ? "#ff007f" : "#ff5252");
          ctx.fillRect(ex - 1, ey - 1, 2.5, 2.5);
        }
      }

      // Rotating Radar Phosphor Sweep
      const sweepAng = (t * 2.8) % (Math.PI * 2);
      const sweepLen = Math.hypot(iw, ih);
      const sweepX = ix + iw * 0.5 + Math.cos(sweepAng) * sweepLen;
      const sweepY = iy + ih * 0.5 + Math.sin(sweepAng) * sweepLen;

      ctx.strokeStyle = "rgba(0, 229, 255, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ix + iw * 0.5, iy + ih * 0.5);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      ctx.restore(); // end clip
      ctx.restore(); // end save
    }

    renderCinematicBanner() {
      if (!this.cinematicBanner || this.cinematicBanner.timer <= 0) return;
      const b = this.cinematicBanner;
      const ctx = this.ctx;
      const t = this.uiTime || 0;
      const progress = b.timer / b.duration; // 1 down to 0

      let alpha = 1.0;
      if (progress > 0.85) alpha = (1.0 - progress) / 0.15;
      else if (progress < 0.2) alpha = progress / 0.2;
      alpha = Math.max(0, Math.min(1, alpha));

      ctx.save();
      ctx.globalAlpha = alpha;

      // Red vignette on screen edges if Boss
      if (b.isBoss) {
        const pulse = Math.sin(t * 8) * 0.5 + 0.5;
        const vigGrad = ctx.createRadialGradient(640, 360, 300, 640, 360, 720);
        vigGrad.addColorStop(0, "rgba(255, 0, 0, 0)");
        vigGrad.addColorStop(1, `rgba(255, 23, 68, ${0.25 + pulse * 0.2})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, this.width, this.height);
      }

      // Center Banner Background (y: 205 to 300)
      const by = 205;
      const bh = 95;
      const bgGrad = ctx.createLinearGradient(0, by, 0, by + bh);
      bgGrad.addColorStop(0, "rgba(8, 14, 25, 0.94)");
      bgGrad.addColorStop(0.5, b.isBoss ? "rgba(45, 10, 20, 0.96)" : "rgba(12, 28, 48, 0.96)");
      bgGrad.addColorStop(1, "rgba(4, 7, 14, 0.98)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, by, this.width, bh);

      // Top and Bottom Glowing Neon Hazard Borders
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, by);
      ctx.lineTo(this.width, by);
      ctx.moveTo(0, by + bh);
      ctx.lineTo(this.width, by + bh);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Animated Chevron Hazard Stripes along borders
      ctx.fillStyle = b.color;
      const offset = (t * 80) % 40;
      ctx.save();
      ctx.globalAlpha = alpha * 0.45;
      for (let x = -40 + offset; x < this.width + 40; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, by);
        ctx.lineTo(x + 15, by);
        ctx.lineTo(x + 5, by + 8);
        ctx.lineTo(x - 10, by + 8);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, by + bh - 8);
        ctx.lineTo(x + 15, by + bh - 8);
        ctx.lineTo(x + 5, by + bh);
        ctx.lineTo(x - 10, by + bh);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Title Typography
      ctx.textAlign = "center";
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = b.isBoss ? "#ff1744" : "#ffffff";
      ctx.font = "900 28px 'Segoe UI', monospace";
      ctx.fillText(b.title, 640, by + 42);

      // Subtitle
      ctx.shadowBlur = 0;
      ctx.fillStyle = b.isBoss ? "#ffd600" : "#00e5ff";
      ctx.font = "bold 13px monospace";
      ctx.fillText(b.subtitle, 640, by + 72);

      ctx.restore();
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

      // 2. Floating Wave / Speed Thumb Action Button (Bottom Right, above Ult)
      const wx = 1210;
      const wy = 450;
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


    addCombatFeed(tag, text, col = "#00e5ff", icon = "⚡") {
      if (!this.combatFeed) this.combatFeed = [];
      this.combatFeed.unshift({ tag, text, col, icon, time: 4.5, alpha: 1.0 });
      if (this.combatFeed.length > 5) this.combatFeed.pop();
    }

    renderCombatFeed() {
      if (!this.combatFeed || this.combatFeed.length === 0) return;
      const ctx = this.ctx;
      const startX = 20, startY = 625;
      for (let i = 0; i < this.combatFeed.length; i++) {
        const item = this.combatFeed[i];
        if (item.time <= 0) continue;
        const alpha = Math.min(1.0, item.time / 0.8);
        const y = startY - i * 22;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(10, 16, 28, 0.75)";
        ctx.fillRect(startX, y - 14, 280, 20);
        ctx.strokeStyle = item.col || "#00e5ff";
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, y - 14, 280, 20);

        ctx.fillStyle = item.col || "#00e5ff";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "left";
        ctx.fillText(item.icon + " [" + item.tag + "] " + item.text, startX + 6, y);
        ctx.restore();
      }
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

      // Mode & Map Name displayed cleanly above action button
      ctx.fillStyle = "#546e7a";
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      const mapName = (this.gameMode === 'CUSTOM') ? "CUSTOM MAP" : MAPS[this.currentMapIndex].name.toUpperCase();
      ctx.fillText(`${mapName}`, 240, 48);

      // Ergonomic Wide Action Cyber Buttons
      this.drawCyberButton(625, 9, 90, 42, `${this.speed}x SPEED`, this.speed > 1 ? "#ffd600" : "#00e5ff", "TEMPO", "⏩", this.speed > 1);
      this.drawCyberButton(725, 9, 125, 42, "SOZLAMALAR", "#00e5ff", "SETTINGS", "⚙️", false);
      this.drawCyberButton(860, 9, 105, 42, this.state === 'PAUSED' ? "DAVOM" : "PAUZA", this.state === 'PAUSED' ? "#ffd600" : "#00e5ff", "PAUSE", "⏸", false);
      this.drawCyberButton(975, 9, 110, 42, "← MENYU", "#ff1744", "ABORT", "🚪", false);
      this.drawCyberButton(1095, 9, 165, 42, "🕹️ 3D PILOT", "#e040fb", "TPS BATTLE", "🎮", false);
    }

    renderMiniButton(x, y, w, h, text, color = "#00e5ff") {
      const ctx = this.ctx;
      const t = this.uiTime || 0;
      const ptr = this.mousePos;
      const isHovered = !!(ptr && ptr.x >= x && ptr.x <= x + w && ptr.y >= y && ptr.y <= y + h);
      const isPressed = isHovered && this.isPointerDown;

      const pressOffset = isPressed ? 1.5 : 0;
      const bx = x;
      const by = y + pressOffset;
      const bw = w;
      const bh = h - pressOffset;
      const cut = Math.min(6, Math.floor(bh * 0.25));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx + cut, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + bh - cut);
      ctx.lineTo(bx + bw - cut, by + bh);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx, by + cut);
      ctx.closePath();

      // Frosted Glassmorphism Gradient
      const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
      if (isPressed) {
        grad.addColorStop(0, "rgba(32, 54, 90, 0.98)");
        grad.addColorStop(1, "rgba(14, 24, 40, 0.99)");
      } else if (isHovered) {
        grad.addColorStop(0, "rgba(24, 44, 76, 0.96)");
        grad.addColorStop(1, "rgba(9, 18, 32, 0.98)");
      } else {
        grad.addColorStop(0, "rgba(16, 28, 48, 0.92)");
        grad.addColorStop(1, "rgba(7, 12, 22, 0.97)");
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Animated Neon Pulse Glow on hover
      const pulse = Math.sin(t * 3.8) * 0.5 + 0.5;
      if (isHovered) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + pulse * 6;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 1.8 : 1.2;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // Top Specular Highlight Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + cut, by + 1);
      ctx.lineTo(bx + bw - 1, by + 1);
      ctx.stroke();

      ctx.fillStyle = isHovered ? "#ffffff" : color;
      let fontSize = Math.min(12, Math.max(9, Math.floor(bh * 0.38)));
      ctx.font = `bold ${fontSize}px monospace`;
      let textW = ctx.measureText ? ctx.measureText(text).width : 60;
      const maxW = bw - 8;
      if (textW > maxW && maxW > 0) {
        fontSize = Math.max(8, Math.floor(fontSize * (maxW / textW)));
        ctx.font = `bold ${fontSize}px monospace`;
      }
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 3;
      ctx.fillText(text, bx + bw / 2, by + bh / 2 + Math.round(fontSize * 0.35));
      ctx.restore();
    }

    drawCyberButton(x, y, w, h, text, color = "#00e5ff", subtext = "", icon = "", isHighlighted = false) {
      const ctx = this.ctx;
      const t = this.uiTime || 0;
      const ptr = this.mousePos;
      const isHovered = !!(ptr && ptr.x >= x && ptr.x <= x + w && ptr.y >= y && ptr.y <= y + h);
      const isPressed = isHovered && this.isPointerDown;

      const pressOffset = isPressed ? 2 : 0;
      const bx = x;
      const by = y + pressOffset;
      const bw = w;
      const bh = h - pressOffset;
      const cut = Math.min(10, Math.floor(bh * 0.22));

      ctx.save();

      // Chamfered 45-degree tactical polygon
      ctx.beginPath();
      ctx.moveTo(bx + cut, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + bh - cut);
      ctx.lineTo(bx + bw - cut, by + bh);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx, by + cut);
      ctx.closePath();

      // 1. Frosted Glassmorphism Multi-layer Gradient Fill
      const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
      if (isPressed) {
        grad.addColorStop(0, "rgba(35, 68, 115, 0.98)");
        grad.addColorStop(0.5, "rgba(20, 42, 74, 0.98)");
        grad.addColorStop(1, "rgba(10, 22, 42, 0.99)");
      } else if (isHovered || isHighlighted) {
        grad.addColorStop(0, "rgba(25, 52, 92, 0.96)");
        grad.addColorStop(0.35, "rgba(18, 38, 68, 0.94)");
        grad.addColorStop(0.75, "rgba(11, 24, 44, 0.97)");
        grad.addColorStop(1, "rgba(6, 13, 24, 0.99)");
      } else {
        grad.addColorStop(0, "rgba(16, 27, 46, 0.93)");
        grad.addColorStop(0.4, "rgba(12, 20, 35, 0.95)");
        grad.addColorStop(1, "rgba(6, 10, 18, 0.98)");
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // 2. Animated Pulse Neon Outer Glow
      const pulse = Math.sin(t * 3.8) * 0.5 + 0.5;
      if (isHighlighted || isHovered) {
        ctx.shadowColor = color;
        ctx.shadowBlur = isPressed ? 18 : (11 + pulse * 8);
      } else {
        ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
        ctx.shadowBlur = 4;
      }

      // 3. Glowing Neon Tactical Border
      ctx.strokeStyle = color;
      ctx.lineWidth = (isHighlighted || isHovered) ? 2.0 : 1.3;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // 4. Frosted Glass Specular Sheen (Clipped to button)
      ctx.save();
      ctx.clip();

      const sheenGrad = ctx.createLinearGradient(bx, by, bx, by + bh * 0.48);
      sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.24)");
      sheenGrad.addColorStop(1, "rgba(255, 255, 255, 0.02)");
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(bx, by, bw, bh * 0.48);

      // 5. Holographic Light Scanline Sweep across face (Every ~2.8s)
      if (isHighlighted || isHovered) {
        const sweepProgress = ((t * 0.42) % 1.5) - 0.25;
        const sweepX = bx + bw * sweepProgress;
        const beamGrad = ctx.createLinearGradient(sweepX - 25, by, sweepX + 25, by + bh);
        beamGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        beamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.28)");
        beamGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(bx, by, bw, bh);
      }

      // 6. Expanding Click/Tap Shockwave Ripples inside button
      if (this.buttonRipples && this.buttonRipples.length > 0) {
        for (const rip of this.buttonRipples) {
          if (rip.x >= bx - 30 && rip.x <= bx + bw + 30 && rip.y >= by - 30 && rip.y <= by + bh + 30) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha * 0.65})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      ctx.restore(); // end clip

      // 7. Tactical Cyber Accents: Left Vertical Glow Strip
      ctx.fillStyle = color;
      ctx.fillRect(bx, by + cut, 3.5, Math.max(2, bh - cut * 2));

      // 8. Corner Sci-Fi L-Brackets
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(bx + bw - 10, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx, by + bh - 8);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + 10, by + bh);
      ctx.stroke();

      // Top specular highlight edge line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + cut + 2, by + 1);
      ctx.lineTo(bx + bw - 2, by + 1);
      ctx.stroke();

      // 9. Technical micro-status dot on top left
      ctx.fillStyle = (isHighlighted || isHovered) ? color : "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(bx + cut + 5, by + 5, 2.0, 0, Math.PI * 2);
      ctx.fill();

      // 10. High-contrast Typography with Drop Shadow & Overflow Prevention
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 1;

      const hasSub = !!subtext;
      const isCard = (bw >= 260 && bh >= 85 && !!icon);

      if (isCard) {
        // High-end AAA Mode Card Layout with Dedicated Left Icon Badge
        const badgeR = Math.min(26, Math.floor(bh * 0.28));
        const badgeX = bx + cut + badgeR + 10;
        const badgeY = by + bh * 0.5;

        ctx.fillStyle = "rgba(10, 18, 34, 0.88)";
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = `${Math.round(badgeR * 1.05)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(icon, badgeX, badgeY + 1);
        ctx.textBaseline = "alphabetic";

        const textStartX = badgeX + badgeR + 14;
        const maxTextW = bw - (textStartX - bx) - 12;

        ctx.textAlign = "left";
        ctx.fillStyle = (isHighlighted || isHovered) ? "#ffffff" : color;
        let fontSize = 14;
        ctx.font = `bold ${fontSize}px 'Segoe UI', monospace`;
        let textW = ctx.measureText ? ctx.measureText(text).width : 60;
        if (textW > maxTextW && maxTextW > 0) {
          fontSize = Math.max(10, Math.floor(fontSize * (maxTextW / textW)));
          ctx.font = `bold ${fontSize}px 'Segoe UI', monospace`;
        }
        ctx.fillText(text, textStartX, by + bh * 0.44);

        if (hasSub) {
          ctx.fillStyle = (isHighlighted || isHovered) ? "#cfd8dc" : "#94a3b8";
          let subFontSize = 10;
          ctx.font = `bold ${subFontSize}px 'Segoe UI', monospace`;
          let subW = ctx.measureText ? ctx.measureText(subtext).width : 60;
          if (subW > maxTextW && maxTextW > 0) {
            subFontSize = Math.max(8, Math.floor(subFontSize * (maxTextW / subW)));
            ctx.font = `bold ${subFontSize}px 'Segoe UI', monospace`;
          }
          ctx.fillText(subtext, textStartX, by + bh * 0.74);
        }
      } else {
        // Crisp Centered Compact Layout with Auto-fitting for Grid and Action Buttons
        const titleY = hasSub ? by + bh * 0.42 : by + bh * 0.5 + 4;

        ctx.fillStyle = (isHighlighted || isHovered) ? "#ffffff" : color;
        let fontSize = Math.min(13, Math.max(9, Math.floor(bh * 0.32)));
        ctx.font = `bold ${fontSize}px 'Segoe UI', monospace`;
        ctx.textAlign = "center";
        const fullTitle = icon ? `${icon} ${text}` : text;
        const maxW = bw - 12;
        let textW = ctx.measureText ? ctx.measureText(fullTitle).width : 60;
        if (textW > maxW && maxW > 0) {
          fontSize = Math.max(8.5, Math.floor(fontSize * (maxW / textW)));
          ctx.font = `bold ${fontSize}px 'Segoe UI', monospace`;
        }
        ctx.fillText(fullTitle, bx + bw / 2, titleY);

        if (hasSub) {
          ctx.fillStyle = (isHighlighted || isHovered) ? "#cfd8dc" : "#78909c";
          let subFontSize = Math.min(9.5, Math.max(7.5, Math.floor(bh * 0.22)));
          ctx.font = `bold ${subFontSize}px 'Segoe UI', monospace`;
          let subW = ctx.measureText ? ctx.measureText(subtext).width : 50;
          if (subW > maxW && maxW > 0) {
            subFontSize = Math.max(7, Math.floor(subFontSize * (maxW / subW)));
            ctx.font = `bold ${subFontSize}px 'Segoe UI', monospace`;
          }
          ctx.fillText(subtext, bx + bw / 2, by + bh * 0.78);
        }
      }

      ctx.restore();
    }

    renderAbilitySlot(x, y, w, h, icon, label, subtext, color = "#00e5ff", isReady = true, cdRatio = 0) {
      const ctx = this.ctx;
      const t = this.uiTime || 0;
      const ptr = this.mousePos;
      const isHovered = !!(ptr && ptr.x >= x && ptr.x <= x + w && ptr.y >= y && ptr.y <= y + h);
      const isPressed = isHovered && this.isPointerDown;

      const pressOffset = (isPressed && isReady) ? 2 : 0;
      const bx = x;
      const by = y + pressOffset;
      const bw = w;
      const bh = h - pressOffset;
      const cut = 6;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx + cut, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + bh - cut);
      ctx.lineTo(bx + bw - cut, by + bh);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx, by + cut);
      ctx.closePath();

      // Frosted Glassmorphism Background
      const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
      if (isReady) {
        if (isPressed) {
          grad.addColorStop(0, "rgba(30, 56, 95, 0.98)");
          grad.addColorStop(1, "rgba(12, 22, 38, 0.99)");
        } else if (isHovered) {
          grad.addColorStop(0, "rgba(24, 48, 82, 0.96)");
          grad.addColorStop(1, "rgba(9, 18, 32, 0.98)");
        } else {
          grad.addColorStop(0, "rgba(16, 30, 52, 0.94)");
          grad.addColorStop(1, "rgba(7, 13, 24, 0.98)");
        }
      } else {
        grad.addColorStop(0, "rgba(10, 15, 24, 0.95)");
        grad.addColorStop(1, "rgba(5, 8, 14, 0.98)");
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Neon glowing border when ready
      const pulse = Math.sin(t * 4.5) * 0.5 + 0.5;
      if (isReady) {
        ctx.shadowColor = color;
        ctx.shadowBlur = isHovered ? (14 + pulse * 6) : (8 + pulse * 4);
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = isReady ? (isHovered ? 2.2 : 1.6) : 1.0;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // Frosted Glass Sheen & Holographic scan
      ctx.save();
      ctx.clip(); // clip to slot polygon

      const sheen = ctx.createLinearGradient(bx, by, bx, by + bh * 0.45);
      sheen.addColorStop(0, "rgba(255, 255, 255, 0.22)");
      sheen.addColorStop(1, "rgba(255, 255, 255, 0.02)");
      ctx.fillStyle = sheen;
      ctx.fillRect(bx, by, bw, bh * 0.45);

      // Cooldown Sweep Overlay
      if (cdRatio > 0) {
        const sweepH = bh * cdRatio;
        const sweepY = by + bh - sweepH;
        const cdGrad = ctx.createLinearGradient(bx, sweepY, bx, by + bh);
        cdGrad.addColorStop(0, "rgba(255, 23, 68, 0.78)");
        cdGrad.addColorStop(1, "rgba(180, 10, 40, 0.90)");
        ctx.fillStyle = cdGrad;
        ctx.fillRect(bx, sweepY, bw, sweepH);

        // Glowing wave line at the cooldown boundary
        ctx.strokeStyle = "#ff5252";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx, sweepY);
        ctx.lineTo(bx + bw, sweepY);
        ctx.stroke();
      }

      // Ready Scanline Sweep
      if (isReady) {
        const sweepProg = ((t * 0.5) % 1.5) - 0.25;
        const sweepX = bx + bw * sweepProg;
        const beamGrad = ctx.createLinearGradient(sweepX - 12, by, sweepX + 12, by + bh);
        beamGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        beamGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.25)");
        beamGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(bx, by, bw, bh);
      }

      ctx.restore(); // end clip

      // Top specular highlight line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + cut, by + 1);
      ctx.lineTo(bx + bw - 1, by + 1);
      ctx.stroke();

      // Icon on top
      ctx.fillStyle = isReady ? color : "#78909c";
      ctx.font = "15px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.shadowColor = isReady ? color : "transparent";
      ctx.shadowBlur = isReady ? 6 : 0;
      ctx.fillText(icon, bx + bw / 2, by + 26);
      ctx.shadowBlur = 0;

      // Label below
      ctx.fillStyle = isReady ? "#ffffff" : "#78909c";
      ctx.font = "bold 11px monospace";
      ctx.shadowColor = "rgba(0,0,0,0.95)";
      ctx.shadowBlur = 4;
      ctx.fillText(label, bx + bw / 2, by + 47);

      // Subtext / Cost below
      ctx.fillStyle = isReady ? color : "#546e7a";
      ctx.font = "bold 9px monospace";
      ctx.fillText(subtext, bx + bw / 2, by + 67);

      ctx.restore();
    }

    render3DCircularButton(cx, cy, radius, label, sublabel, color = "#00e5ff", isActive = false) {
      const ctx = this.ctx;
      const t = this.uiTime || 0;
      const ptr = this.mousePos;
      const isHovered = !!(ptr && Math.hypot(ptr.x - cx, ptr.y - cy) <= radius);
      const isPressed = isHovered && this.isPointerDown;

      const r = (isPressed ? radius * 0.92 : (isHovered ? radius * 1.05 : radius));
      ctx.save();

      // Outer animated rotating radar calibration notches
      const ringAngle = t * (isActive ? 2.5 : 1.2);
      ctx.strokeStyle = isActive ? color : "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 12]);
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, ringAngle, ringAngle + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Multi-layer Radial Frosted Glass Glow
      const radGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
      if (isActive) {
        radGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
        radGrad.addColorStop(0.3, color);
        radGrad.addColorStop(0.85, "rgba(10, 20, 36, 0.95)");
        radGrad.addColorStop(1, "rgba(5, 10, 20, 0.99)");
      } else if (isHovered) {
        radGrad.addColorStop(0, "rgba(255, 255, 255, 0.28)");
        radGrad.addColorStop(0.4, "rgba(30, 50, 85, 0.85)");
        radGrad.addColorStop(1, "rgba(10, 16, 28, 0.95)");
      } else {
        radGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
        radGrad.addColorStop(0.4, "rgba(18, 28, 48, 0.80)");
        radGrad.addColorStop(1, "rgba(6, 10, 18, 0.95)");
      }

      // Neon Pulsing Outer Glow
      const pulse = Math.sin(t * 4.0) * 0.5 + 0.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = isActive ? (16 + pulse * 8) : (isHovered ? 12 : 5);

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Solid Rim Stroke
      ctx.strokeStyle = isActive ? "#ffffff" : color;
      ctx.lineWidth = isActive ? 2.5 : (isHovered ? 2.0 : 1.4);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // Top Crescent Specular Glass Reflection
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
      ctx.clip();

      const crescentGrad = ctx.createLinearGradient(cx, cy - r, cx, cy);
      crescentGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      crescentGrad.addColorStop(1, "rgba(255, 255, 255, 0.02)");
      ctx.fillStyle = crescentGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r);
      ctx.restore();

      // Icon & Label Typography
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
      ctx.shadowBlur = 5;
      ctx.textAlign = "center";
      ctx.fillStyle = isActive ? "#ffffff" : (isHovered ? "#ffffff" : color);
      ctx.font = `bold ${Math.round(r * 0.34)}px 'Segoe UI', monospace`;
      const textY = sublabel ? cy + 1 : cy + 5;
      ctx.fillText(label, cx, textY);

      if (sublabel) {
        ctx.fillStyle = isActive ? "#ffffff" : "#b0bec5";
        ctx.font = `bold ${Math.round(r * 0.22)}px monospace`;
        ctx.fillText(sublabel, cx, cy + r * 0.52);
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

      // 1. Hero Mech Ult Button (x: 6, w: 42, h: 78)
      const isHeroUltReady = this.hero.currentUltCd <= 0;
      this.renderAbilitySlot(6, 628, 42, 78, "⚡", "MECH", isHeroUltReady ? "ULT" : `${Math.ceil(this.hero.currentUltCd)}s`, isHeroUltReady ? "#ffd600" : "#455a64", isHeroUltReady, this.hero.currentUltCd / this.hero.ultCd);

      // 2. Hero Mech Mode Toggle Button (x: 52, w: 42, h: 78)
      const isSiege = this.hero.mode === 'SIEGE';
      this.renderAbilitySlot(52, 628, 42, 78, isSiege ? "🚜" : "🤖", "MODE", isSiege ? "TANK" : "ROBOT", isSiege ? "#ffd600" : "#00e5ff", true, 0);

      // 3. 4 Commander Super Skills Panel (Clean Stacked Slots: w: 40, h: 78)
      const skillMeta = {
        emp:       { icon: "⚡", label: "EMP",  color: "#00e5ff", sub: `${this.skills.emp.cost}g` },
        missiles:  { icon: "🚀", label: "MSL",  color: "#ff9100", sub: `${this.skills.missiles.cost}g` },
        shield:    { icon: "🛡️", label: "SHD",  color: "#00b0ff", sub: `${this.skills.shield.cost}g` },
        overclock: { icon: "⚙️", label: "ROF",  color: "#ffd600", sub: `${this.skills.overclock.cost}g` }
      };
      const skillList = ['emp', 'missiles', 'shield', 'overclock'];
      for (let i = 0; i < 4; i++) {
        const k = skillList[i];
        const s = this.skills[k];
        const meta = skillMeta[k];
        const sx = 98 + i * 44;
        const isReady = s.currentCd <= 0 && this.gold >= s.cost;
        const isAiming = (this.aimingSkill === k);
        const color = isAiming ? "#ffeb3b" : (isReady ? meta.color : "#37474f");

        this.renderAbilitySlot(sx, 628, 40, 78, meta.icon, meta.label, meta.sub, color, isReady || isAiming, s.currentCd / s.cd);

        // Active Aiming Highlight Ring
        if (isAiming) {
          ctx.save();
          ctx.strokeStyle = "#ffd600";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#ffd600";
          ctx.shadowBlur = 8;
          ctx.strokeRect(sx, 628, 40, 78);
          ctx.restore();
        }

        // Active Cooldown Countdown Text
        if (s.currentCd > 0) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0,0,0,0.9)";
          ctx.shadowBlur = 4;
          ctx.fillText(`${Math.ceil(s.currentCd)}s`, sx + 20, 696);
        }
      }

      // 4. Selection vs Hotbar
      if (this.selectedTower) {
        const t = this.selectedTower;
        const def = TOWER_DEFS[t.type];
        const spec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];

        // Cyber-Dossier Telemetry Box (Left)
        ctx.save();
        ctx.fillStyle = "rgba(10, 18, 32, 0.94)";
        ctx.beginPath();
        ctx.roundRect(275, 626, 215, 80, 8);
        ctx.fill();
        ctx.strokeStyle = spec.color || def.color || "#00e5ff";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.fillStyle = spec.color || def.color || "#00e5ff";
        ctx.font = "bold 13px 'Segoe UI', monospace";
        ctx.textAlign = "left";
        const titleStr = t.branch ? spec.name.toUpperCase() : `${def.name.toUpperCase()} (T${t.tier})`;
        ctx.fillText(`⬢ ${titleStr}`, 286, 646);

        ctx.fillStyle = "#cfd8dc";
        ctx.font = "11px monospace";
        const stats = t.type === 'beacon' ?
          `AURA: +${(spec.dmgBuff || 0.35) * 100}% DMG | RNG: ${spec.range}px` :
          `DMG: ${spec.dmg} | SPD: ${spec.rate}/s | RNG: ${spec.range}px`;
        ctx.fillText(stats, 286, 667);

        ctx.fillStyle = "#ffd600";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`💀 KILLS: ${t.kills}  |  ⚡ DEAL: ${(t.damageDealt || 0).toLocaleString()} DMG`, 286, 688);
        ctx.restore();

        // Branching upgrade at Tier 2
        if (t.tier === 2) {
          const bA = def.branches.A;
          const bB = def.branches.B;
          const canA = this.gold >= bA.cost;
          const canB = this.gold >= bB.cost;
          this.drawCyberButton(495, 630, 142, 72, `[A] ${bA.name}`, canA ? bA.color : "#455a64", `${bA.cost}g • ${bA.perk.slice(0, 18).toUpperCase()}`, "⚡", canA);
          this.drawCyberButton(645, 630, 142, 72, `[B] ${bB.name}`, canB ? bB.color : "#455a64", `${bB.cost}g • ${bB.perk.slice(0, 18).toUpperCase()}`, "🔥", canB);
        } else if (t.tier === 1) {
          const upCost = spec.upCost;
          const canUpgrade = this.gold >= upCost;
          this.drawCyberButton(500, 630, 285, 72, `[▲] TIER 2 GA OSHIRISH`, canUpgrade ? "#00e676" : "#455a64", `NARXI: ${upCost}g • (+45% DPS)`, "⚡", canUpgrade);
        } else {
          this.drawCyberButton(500, 630, 285, 72, "MAX TIER 3 (ELITE)", "#ffd600", "MAKSIMAL DARAJA", "★", false);
        }

        // Sell button
        const refund = Math.floor(t.totalInvested * 0.70);
        this.drawCyberButton(795, 630, 115, 72, `SOTISH`, "#ff1744", `+${refund}g QAYTARISH`, "🗑️", true);

        // Priority button
        this.drawCyberButton(920, 630, 120, 72, `NISHON`, "#00e5ff", t.priority.toUpperCase(), "🎯", false);

        // Close button
        this.drawCyberButton(1050, 630, 52, 72, "✕", "#90a4ae", "YOPISH", "", false);
      } else {
        // 8 Tower Hotbar Slots: 7 Towers + Barricade Wall
        const hotbarItems = [
          { key: 'pulse', label: '[1] PULSE' },
          { key: 'mortar', label: '[2] MORTAR' },
          { key: 'cryo', label: '[3] CRYO' },
          { key: 'tesla', label: '[4] TESLA' },
          { key: 'flame', label: '[5] FLAME' },
          { key: 'railgun', label: '[6] RAILGUN' },
          { key: 'beacon', label: '[7] BEACON' },
          { key: 'barricade', label: "[8] TO'SIQ" }
        ];

        for (let i = 0; i < 8; i++) {
          const item = hotbarItems[i];
          const bx = 276 + i * 125;
          const isSelected = this.selectedBuildType === item.key;
          let cost = 40;
          let color = "#ffd600";
          let subText = "40g • DEVOR";

          if (item.key !== 'barricade') {
            const def = TOWER_DEFS[item.key];
            cost = def.cost;
            color = def.color;
            subText = `${cost}g • ${def.type}`;
          }

          const canAfford = this.gold >= cost;
          const cardColor = isSelected ? "#00e5ff" : (canAfford ? color : "#455a64");

          this.drawCyberButton(bx, 628, 120, 78, item.label, cardColor, subText, isSelected ? "▶" : "⬢", isSelected);
        }
      }
    }

    getAchievementsList() {
      const savedAchievements = (this.saveData && this.saveData.achievements) ? this.saveData.achievements : {};
      const kills = (this.analytics && this.analytics.totalKills) || 0;
      const gold = (this.analytics && this.analytics.totalGold) || this.gold || 0;
      const wave = Math.max(this.wave || 1, (this.saveData && this.saveData.maxWave) || 1);
      const dmg = (this.analytics && this.analytics.damageByTower) || {};
      const cryoDmg = dmg.cryo || 0;
      const railgunDmg = dmg.railgun || 0;
      const mortarDmg = dmg.mortar || 0;
      const pulseDmg = dmg.pulse || 0;
      const heroDmg = dmg.hero || 0;
      const skillDmg = dmg.skills || 0;
      const heroLvl = (this.hero && this.hero.level) || 1;
      const towerCount = (this.towers && this.towers.length) || 0;
      const hasCustom = Boolean(localStorage.getItem('lg_custom_map'));
      const activeCards = (this.activeAugments && this.activeAugments.length) || 0;
      const sectorWins = (this.saveData && this.saveData.campaignProgress && this.saveData.campaignProgress.length) || 0;

      const raw = [
        { id: "first_blood", icon: "🩸", title: "ILK QON (FIRST BLOOD)", desc: "1 ta dushmanni yo'q qiling", cur: kills, req: 1, rew: 100 },
        { id: "wave_10", icon: "🛡️", title: "10-TO'LQIN POSBONI", desc: "10-to'lqin hujumini muvaffaqiyatli qaytaring", cur: wave, req: 10, rew: 250 },
        { id: "wave_25", icon: "⚔️", title: "25-TO'LQIN APEX", desc: "25-to'lqin bosqichiga yetib boring", cur: wave, req: 25, rew: 500 },
        { id: "wave_50", icon: "👑", title: "50-TO'LQIN AFSONASI", desc: "50-to'lqin cheksiz hujumini yengib o'ting", cur: wave, req: 50, rew: 1000 },
        { id: "kill_100", icon: "💀", title: "100 TA KIBER-QOTIL", desc: "Jami 100 ta dushman bo'linmasini yo'q qiling", cur: kills, req: 100, rew: 300 },
        { id: "kill_500", icon: "☠️", title: "500 TA TITOR-TOZALOVCHI", desc: "500 ta kiber-dushman agregatini yo'q qiling", cur: kills, req: 500, rew: 800 },
        { id: "gold_magnate", icon: "💰", title: "KIBER-MAGNAT", desc: "2000 oltin (G) jamg'aring yoki sarflang", cur: gold, req: 2000, rew: 350 },
        { id: "gold_tycoon", icon: "💎", title: "GALAKTIK SARMOYADOR", desc: "5000 oltin (G) kapitaliga ega bo'ling", cur: gold, req: 5000, rew: 750 },
        { id: "pulse_master", icon: "⚡", title: "PULSE OVERLOAD", desc: "Pulse lazer minoralari orqali 10,000 zarba bering", cur: pulseDmg, req: 10000, rew: 400 },
        { id: "mortar_barrage", icon: "💥", title: "PLAZMA BOMBARDIMONI", desc: "Mortar artilleriyasi orqali 15,000 zarar bering", cur: mortarDmg, req: 15000, rew: 450 },
        { id: "cryo_freeze", icon: "❄️", title: "ABSOLYUT NO'L (CRYO)", desc: "Cryo muzlatish orqali 8,000 zarar yetkazing", cur: cryoDmg, req: 8000, rew: 350 },
        { id: "railgun_sniper", icon: "🎯", title: "GIPER-IMPULS MERGANI", desc: "Railgun quroli orqali 12,000 zarar bering", cur: railgunDmg, req: 12000, rew: 500 },
        { id: "hero_veteran", icon: "🤖", title: "MEX-PILOT VETERAN", desc: "Mex Robotini 5-darajaga ko'taring", cur: heroLvl, req: 5, rew: 350 },
        { id: "hero_apex", icon: "🌟", title: "APEX MEX-TITAN", desc: "Mex Robotini 10-darajaga yetkazing", cur: heroLvl, req: 10, rew: 700 },
        { id: "hero_rampage", icon: "🔥", title: "MEX QAHRAMONLIK HUJUMI", desc: "Mex qurollari orqali 10,000 zarar bering", cur: heroDmg, req: 10000, rew: 450 },
        { id: "commander_strike", icon: "☄️", title: "KOMANDIR ORBITAL ZARBASI", desc: "Super-qobiliyatlar orqali 5,000 zarar yetkazing", cur: skillDmg, req: 5000, rew: 400 },
        { id: "architect_defense", icon: "🏗️", title: "MUDOFAA ARXITEKTORI", desc: "Maydonga bir vaqtda 8 ta minora o'rnating", cur: towerCount, req: 8, rew: 300 },
        { id: "augment_collector", icon: "🃏", title: "KIBER-AUGMENT MASTER", desc: "Jang davomida kamida 3 ta augment tanlang", cur: activeCards, req: 3, rew: 350 },
        { id: "custom_designer", icon: "🛠️", title: "XARITA MUHANDISI", desc: "Xarita muharririda shaxsiy xaritani yarating", cur: hasCustom ? 1 : 0, req: 1, rew: 300 },
        { id: "galactic_conqueror", icon: "🌌", title: "GALAKTIK G'OLIB", desc: "Barcha 5 ta kampaniya sektorini zabt eting", cur: sectorWins, req: 5, rew: 1500 }
      ];

      return raw.map(item => ({
        id: item.id,
        icon: item.icon,
        title: item.title,
        desc: item.desc,
        current: Math.min(item.cur, item.req),
        target: item.req,
        reward: item.rew,
        isDone: item.cur >= item.req,
        isClaimed: Boolean(savedAchievements[item.id])
      }));
    }

    renderAchievementsModal() {
      const ctx = this.ctx;
      const bgGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
      bgGrad.addColorStop(0, "#040711");
      bgGrad.addColorStop(0.5, "#060c1c");
      bgGrad.addColorStop(1, "#03060e");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Cyber Grid Background
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
      }
      for (let y = 0; y <= this.height; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // Top Header Navigation Bar
      ctx.fillStyle = "rgba(10, 18, 34, 0.95)";
      ctx.fillRect(0, 0, this.width, 68);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 68); ctx.lineTo(this.width, 68); ctx.stroke();

      this.renderMiniButton(30, 14, 130, 42, "← BOSH MENYU", "#00e5ff");

      const allList = this.getAchievementsList();
      const doneCount = allList.filter(a => a.isDone).length;
      const claimedCount = allList.filter(a => a.isClaimed).length;

      ctx.save();
      ctx.shadowColor = "rgba(255, 214, 0, 0.8)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#ffd600";
      ctx.font = "900 24px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("🏆 KIBER-YUTUQLAR ZALI (CYBER ACHIEVEMENTS)", 520, 38);
      ctx.restore();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`ERISHILDI: ${doneCount}/20  |  MUKOFOTLANDI: ${claimedCount}/20  |  KIBER-OLTIN: ${this.gold}G`, 520, 58);

      // Pagination Buttons
      const curPage = this.achievementsPage || 0;
      this.renderMiniButton(860, 14, 120, 42, "◀ 1-SAHIFA", curPage === 0 ? "#ffd600" : "#78909c");
      this.renderMiniButton(990, 14, 120, 42, "2-SAHIFA ▶", curPage === 1 ? "#ffd600" : "#78909c");

      // Achievement Cards (10 per page, 2 columns x 5 rows)
      const pageList = allList.slice(curPage * 10, curPage * 10 + 10);
      for (let i = 0; i < pageList.length; i++) {
        const item = pageList[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = 150 + col * 485;
        const cy = 105 + row * 102;
        const cw = 465;
        const ch = 90;

        ctx.save();
        // Glassmorphic Card Container
        ctx.fillStyle = item.isClaimed ? "rgba(10, 20, 32, 0.75)" : (item.isDone ? "rgba(18, 32, 54, 0.9)" : "rgba(12, 20, 36, 0.8)");
        ctx.beginPath();
        ctx.roundRect(cx, cy, cw, ch, 8);
        ctx.fill();

        ctx.strokeStyle = item.isClaimed ? "rgba(0, 230, 118, 0.35)" : (item.isDone ? "#ffd600" : "rgba(0, 229, 255, 0.2)");
        ctx.lineWidth = item.isDone && !item.isClaimed ? 2 : 1;
        ctx.stroke();

        // Icon Box
        ctx.fillStyle = item.isDone ? "rgba(255, 214, 0, 0.15)" : "rgba(0, 229, 255, 0.08)";
        ctx.beginPath();
        ctx.roundRect(cx + 10, cy + 10, 68, 70, 6);
        ctx.fill();
        ctx.strokeStyle = item.isDone ? "#ffd600" : "rgba(0, 229, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "32px monospace";
        ctx.textAlign = "center";
        ctx.fillText(item.icon, cx + 44, cy + 55);

        // Title & Description
        ctx.textAlign = "left";
        ctx.fillStyle = item.isClaimed ? "#90a4ae" : (item.isDone ? "#ffd600" : "#00e5ff");
        ctx.font = "bold 13px 'Segoe UI', monospace";
        ctx.fillText(item.title, cx + 88, cy + 26);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px 'Segoe UI', monospace";
        ctx.fillText(item.desc, cx + 88, cy + 44);

        // Progress Bar
        const barX = cx + 88;
        const barY = cy + 56;
        const barW = 230;
        const barH = 14;
        ctx.fillStyle = "rgba(4, 8, 16, 0.9)";
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 4);
        ctx.fill();

        const pct = Math.min(100, Math.floor((item.current / item.target) * 100));
        const fillW = Math.max(0, (pct / 100) * barW);
        if (fillW > 0) {
          const pGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
          if (item.isDone) {
            pGrad.addColorStop(0, "#00e676");
            pGrad.addColorStop(1, "#ffd600");
          } else {
            pGrad.addColorStop(0, "#0091ea");
            pGrad.addColorStop(1, "#00e5ff");
          }
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.roundRect(barX, barY, fillW, barH, 4);
          ctx.fill();
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${item.current.toLocaleString()} / ${item.target.toLocaleString()} (${pct}%)`, barX + barW / 2, barY + 11);

        // Claim Button or Status Tag
        const bx = cx + 330;
        const by = cy + 28;
        const bw = 125;
        const bh = 40;

        if (item.isClaimed) {
          ctx.fillStyle = "rgba(0, 230, 118, 0.15)";
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 6);
          ctx.fill();
          ctx.strokeStyle = "rgba(0, 230, 118, 0.5)";
          ctx.stroke();
          ctx.fillStyle = "#00e676";
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "center";
          ctx.fillText("✅ ERISHILDI", bx + bw / 2, by + 24);
        } else if (item.isDone) {
          const pulse = (Math.sin(performance.now() * 0.006) + 1) * 0.5;
          ctx.fillStyle = `rgba(255, 214, 0, ${0.2 + pulse * 0.25})`;
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 6);
          ctx.fill();
          ctx.strokeStyle = "#ffd600";
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.fillStyle = "#ffd600";
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`🎁 +${item.reward}G OLISH`, bx + bw / 2, by + 24);
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 6);
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
          ctx.stroke();
          ctx.fillStyle = "#78909c";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`🔒 +${item.reward}G`, bx + bw / 2, by + 24);
        }

        ctx.restore();
      }
    }

    renderDraftModal() {
      const ctx = this.ctx;
      const time = performance.now() * 0.002;

      // Deep Space Holographic Canvas
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, "rgba(4, 7, 16, 0.98)");
      bgGrad.addColorStop(0.5, "rgba(8, 14, 28, 0.99)");
      bgGrad.addColorStop(1, "rgba(4, 8, 18, 0.98)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Ambient Laser Grid
      ctx.strokeStyle = "rgba(0, 229, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
      }
      for (let y = 0; y <= this.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // Title & Subtitle Header
      ctx.save();
      ctx.shadowColor = "rgba(255, 214, 0, 0.8)";
      ctx.shadowBlur = 18;
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffd600";
      ctx.font = "900 32px 'Segoe UI', monospace";
      ctx.fillText("⚡ KIBER-AUGMENT VA TAKTIK PROTOKOL TANLOVI", 640, 85);
      ctx.restore();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Jang davomida bazani kuchaytiruvchi 1 ta kiber-karta yoki taktik modulni tanlang", 640, 122);

      // Rarity Tier Profiles
      const tiers = [
        { label: "▲ RARE PROTOCOL ▲", color: "#00e5ff", glow: "rgba(0, 229, 255, 0.6)" },
        { label: "◆ EPIC AUGMENT ◆", color: "#d500f9", glow: "rgba(213, 0, 249, 0.6)" },
        { label: "★ LEGENDARY APEX ★", color: "#ffd600", glow: "rgba(255, 214, 0, 0.7)" }
      ];

      for (let i = 0; i < this.draftCards.length; i++) {
        const c = this.draftCards[i];
        const tier = tiers[i % tiers.length];
        const cx = 100 + i * 380;
        const cy = 170;
        const cw = 320;
        const ch = 420;
        const cut = 14;

        ctx.save();

        // Card Glow Halo
        ctx.shadowColor = tier.glow;
        ctx.shadowBlur = 22;

        // Chamfered Cyber Card Body
        ctx.beginPath();
        ctx.moveTo(cx + cut, cy);
        ctx.lineTo(cx + cw - cut, cy);
        ctx.lineTo(cx + cw, cy + cut);
        ctx.lineTo(cx + cw, cy + ch - cut);
        ctx.lineTo(cx + cw - cut, cy + ch);
        ctx.lineTo(cx + cut, cy + ch);
        ctx.lineTo(cx, cy + ch - cut);
        ctx.lineTo(cx, cy + cut);
        ctx.closePath();

        const cardGrad = ctx.createLinearGradient(cx, cy, cx, cy + ch);
        cardGrad.addColorStop(0, "rgba(16, 26, 48, 0.96)");
        cardGrad.addColorStop(0.5, "rgba(10, 18, 34, 0.98)");
        cardGrad.addColorStop(1, "rgba(6, 12, 22, 0.99)");
        ctx.fillStyle = cardGrad;
        ctx.fill();

        ctx.strokeStyle = tier.color;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();

        // Rarity Ribbon Header
        ctx.fillStyle = tier.color;
        ctx.font = "900 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(tier.label, cx + cw / 2, cy + 32);

        // Rotating Energy Hexagon Behind Icon
        ctx.save();
        ctx.translate(cx + cw / 2, cy + 105);
        ctx.rotate(time * (i % 2 === 0 ? 1 : -1));
        ctx.strokeStyle = tier.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const ang = (s * Math.PI) / 3;
          const hx = Math.cos(ang) * 44;
          const hy = Math.sin(ang) * 44;
          if (s === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Central Perk Icon
        ctx.font = "48px monospace";
        ctx.textAlign = "center";
        ctx.fillText(c.icon || "⚡", cx + cw / 2, cy + 120);

        // Title
        ctx.fillStyle = tier.color;
        ctx.font = "bold 18px 'Segoe UI', monospace";
        ctx.fillText(c.title || "AUGMENT", cx + cw / 2, cy + 190);

        // Divider
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + 30, cy + 208);
        ctx.lineTo(cx + cw - 30, cy + 208);
        ctx.stroke();

        // Multi-line Description
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "13px 'Segoe UI', monospace";
        this.wrapText(c.desc || "", cx + 24, cy + 236, cw - 48, 20);

        // Pulsing Selection Button
        this.drawCyberButton(cx + 20, cy + 345, cw - 40, 52, "TANLASH VA FAOL QILISH", tier.color, "ACTIVATE PROTOCOL", "⚡", true);
      }
    }

    renderAnalyticsScreen() {
      const ctx = this.ctx;
      const bgGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
      bgGrad.addColorStop(0, "#040711");
      bgGrad.addColorStop(0.5, "#070e20");
      bgGrad.addColorStop(1, "#03050b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Cyber Grid Background
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
      }
      for (let y = 0; y <= this.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // Top Header Navigation Bar
      ctx.fillStyle = "rgba(10, 18, 34, 0.95)";
      ctx.fillRect(0, 0, this.width, 68);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 68); ctx.lineTo(this.width, 68); ctx.stroke();

      this.renderMiniButton(40, 14, 150, 42, "← BOSH MENYU", "#00e5ff");

      ctx.save();
      ctx.shadowColor = "rgba(0, 229, 255, 0.8)";
      ctx.shadowBlur = 14;
      ctx.textAlign = "center";
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 24px 'Segoe UI', monospace";
      ctx.fillText("📊 BOSH QAROR: JANG TAHLILI VA TELEMETRIYA", 640, 36);
      ctx.restore();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("BATTLE INTELLIGENCE & ADVANCED TACTICAL DAMAGE DOSSIER", 640, 56);

      // LEFT COLUMN: MVP UNIT SPOTLIGHT & BATTLE SUMMARY (x: 40, y: 85, w: 340, h: 485)
      const lx = 40, ly = 85, lw = 340, lh = 485;
      ctx.save();
      ctx.fillStyle = "rgba(12, 22, 40, 0.92)";
      ctx.beginPath();
      ctx.roundRect(lx, ly, lw, lh, 8);
      ctx.fill();
      ctx.strokeStyle = "#ffd600";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // MVP Header Badge
      ctx.fillStyle = "rgba(255, 214, 0, 0.12)";
      ctx.beginPath();
      ctx.roundRect(lx + 14, ly + 14, lw - 28, 36, 4);
      ctx.fill();
      ctx.fillStyle = "#ffd600";
      ctx.font = "900 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("👑 JANGNING ENG YAXSHI BO'LINMASI (MVP)", lx + lw / 2, ly + 37);

      // MVP Avatar Hologram
      ctx.fillStyle = "rgba(255, 214, 0, 0.08)";
      ctx.beginPath();
      ctx.arc(lx + lw / 2, ly + 120, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffd600";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "52px monospace";
      ctx.fillText("🤖", lx + lw / 2, ly + 138);

      // MVP Name & Class
      ctx.fillStyle = "#ffd600";
      ctx.font = "900 20px 'Segoe UI', monospace";
      ctx.fillText(this.analytics.mvpName || "CYBER HERO MECH", lx + lw / 2, ly + 205);

      ctx.fillStyle = "#00e676";
      ctx.font = "bold 11px monospace";
      ctx.fillText("TIER S+ APEX COMBAT UNIT", lx + lw / 2, ly + 225);

      // Divider
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx + 20, ly + 245);
      ctx.lineTo(lx + lw - 20, ly + 245);
      ctx.stroke();

      // Combat Telemetry Metrics
      ctx.textAlign = "left";
      ctx.font = "bold 12px monospace";
      const metrics = [
        { label: "YO'Q QILINGAN DUSHMAN:", val: `${this.analytics.totalKills || 0} ta`, color: "#ff5252" },
        { label: "YIG'ILGAN KIBER-OLTIN:", val: `${(this.analytics.totalGold || 0).toLocaleString()} G`, color: "#ffd600" },
        { label: "YETIB KELINGAN TO'LQIN:", val: `WAVE ${this.wave || 1}`, color: "#00e5ff" },
        { label: "BAZA BUTUNLIGI (CORE):", val: `${Math.max(0, Math.floor(this.coreHealth || 100))}%`, color: "#00e676" },
        { label: "QURILGAN MINORALAR:", val: `${(this.towers && this.towers.length) || 0} ta`, color: "#e040fb" }
      ];

      for (let m = 0; m < metrics.length; m++) {
        const my = ly + 278 + m * 38;
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(metrics[m].label, lx + 20, my);
        ctx.fillStyle = metrics[m].color;
        ctx.textAlign = "right";
        ctx.fillText(metrics[m].val, lx + lw - 20, my);
        ctx.textAlign = "left";
      }
      ctx.restore();

      // RIGHT COLUMN: ADVANCED DAMAGE CONTRIBUTION CHARTS (x: 405, y: 85, w: 835, h: 485)
      const rx = 405, ry = 85, rw = 835, rh = 485;
      ctx.save();
      ctx.fillStyle = "rgba(10, 20, 36, 0.92)";
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Header
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 14px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText("💥 BO'LINMALAR BO'YICHA ZARBA VA DESTRUCTION HISSASI", rx + 24, ry + 36);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px monospace";
      ctx.fillText("Barcha minora turlari, Mex Qahramoni va Orbital Super-zarbalar telemetriyasi", rx + 24, ry + 56);

      // Bar Charts for Damage
      const dmg = this.analytics.damageByTower || {};
      const categories = [
        { label: "PULSE LAZER", icon: "⚡", val: dmg.pulse || 0, color: "#00e5ff", grad: ["#0091ea", "#00e5ff"] },
        { label: "PLAZMA MORTAR", icon: "💥", val: dmg.mortar || 0, color: "#ff9100", grad: ["#ff3d00", "#ff9100"] },
        { label: "CRYO MUZLATGICH", icon: "❄️", val: dmg.cryo || 0, color: "#00f0ff", grad: ["#00b0ff", "#80deea"] },
        { label: "GIPER RAILGUN", icon: "🎯", val: dmg.railgun || 0, color: "#ff007f", grad: ["#c51162", "#ff4081"] },
        { label: "APEX HERO MECH", icon: "🤖", val: dmg.hero || 0, color: "#ffd600", grad: ["#ffab00", "#ffd600"] },
        { label: "KOMANDIR ORBITAL", icon: "☄️", val: dmg.skills || 0, color: "#76ff03", grad: ["#00c853", "#76ff03"] }
      ];

      const totalDmg = Math.max(1, categories.reduce((acc, c) => acc + c.val, 0));
      const maxVal = Math.max(1, ...categories.map(c => c.val));

      for (let i = 0; i < categories.length; i++) {
        const c = categories[i];
        const by = ry + 85 + i * 62;

        // Unit Label & Icon
        ctx.textAlign = "left";
        ctx.fillStyle = c.color;
        ctx.font = "bold 13px monospace";
        ctx.fillText(`${c.icon} ${c.label}`, rx + 24, by + 18);

        // Bar Track
        const trackX = rx + 220;
        const trackW = 430;
        const trackH = 22;
        ctx.fillStyle = "rgba(4, 8, 16, 0.9)";
        ctx.beginPath();
        ctx.roundRect(trackX, by, trackW, trackH, 4);
        ctx.fill();

        // Bar Fill
        const barW = Math.max(0, (c.val / maxVal) * trackW);
        if (barW > 0) {
          const bGrad = ctx.createLinearGradient(trackX, by, trackX + barW, by);
          bGrad.addColorStop(0, c.grad[0]);
          bGrad.addColorStop(1, c.grad[1]);
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.roundRect(trackX, by, barW, trackH, 4);
          ctx.fill();
        }

        // Percentage Badge
        const pct = ((c.val / totalDmg) * 100).toFixed(1);
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.roundRect(rx + 665, by, 62, trackH, 4);
        ctx.fill();
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = c.color;
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${pct}%`, rx + 696, by + 15);

        // Absolute Damage Text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${c.val.toLocaleString()} DMG`, rx + rw - 24, by + 16);
      }
      ctx.restore();

      // BOTTOM ACTION BUTTONS
      this.drawCyberButton(240, 595, 380, 65, "BOSH MENYUGA QAYTISH", "#00e5ff", "RETURN TO HEADQUARTERS", "◀", false);
      this.drawCyberButton(660, 595, 380, 65, "JANGNI QAYTA BOSHLASH", "#00e676", "REDEPLOY MISSION", "🚀", true);
    }

    renderMainMenu() {
      const ctx = this.ctx;
      const time = performance.now() * 0.002;

      // 1. Transparent Clear with Deep Space Sci-Fi Radial Atmosphere
      ctx.clearRect(0, 0, this.width, this.height);
      const bgGrad = ctx.createRadialGradient(this.width * 0.36, this.height * 0.48, 120, this.width * 0.5, this.height * 0.5, this.width * 0.88);
      bgGrad.addColorStop(0, "rgba(8, 16, 32, 0.05)");
      bgGrad.addColorStop(0.45, "rgba(5, 12, 26, 0.25)");
      bgGrad.addColorStop(1, "rgba(2, 4, 10, 0.75)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Floating Energon Sparks & Cyber Motes
      if (!this.mainMenuParticles) {
        this.mainMenuParticles = [];
        for (let i = 0; i < 28; i++) {
          this.mainMenuParticles.push({
            x: 30 + Math.random() * 1220,
            y: 80 + Math.random() * 600,
            vy: 0.25 + Math.random() * 0.65,
            vx: (Math.random() - 0.5) * 0.3,
            size: 1.0 + Math.random() * 2.2,
            alpha: 0.25 + Math.random() * 0.65,
            color: (i % 3 === 0) ? "#c084fc" : ((i % 3 === 1) ? "#00e5ff" : "#ffd600")
          });
        }
      }
      for (const p of this.mainMenuParticles) {
        p.y -= p.vy;
        p.x += p.vx;
        if (p.y < 70) {
          p.y = 690;
          p.x = 30 + Math.random() * 1220;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.6 + Math.sin(time * 3 + p.x) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Sci-Fi Corner HUD Brackets
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      const cPad = 12;
      const cLen = 22;
      // Top-Left
      ctx.beginPath(); ctx.moveTo(cPad, cPad + cLen); ctx.lineTo(cPad, cPad); ctx.lineTo(cPad + cLen, cPad); ctx.stroke();
      // Top-Right
      ctx.beginPath(); ctx.moveTo(this.width - cPad - cLen, cPad); ctx.lineTo(this.width - cPad, cPad); ctx.lineTo(this.width - cPad, cPad + cLen); ctx.stroke();
      // Bottom-Left
      ctx.beginPath(); ctx.moveTo(cPad, this.height - cPad - cLen); ctx.lineTo(cPad, this.height - cPad); ctx.lineTo(cPad + cLen, this.height - cPad); ctx.stroke();
      // Bottom-Right
      ctx.beginPath(); ctx.moveTo(this.width - cPad - cLen, this.height - cPad); ctx.lineTo(this.width - cPad, this.height - cPad); ctx.lineTo(this.width - cPad, this.height - cPad - cLen); ctx.stroke();

      // 2. Top Aerospace Header Bar (Sleek Glassmorphism with Live Waveform)
      ctx.save();
      const topH = 58;
      ctx.fillStyle = "rgba(8, 15, 28, 0.88)";
      ctx.fillRect(0, 0, this.width, topH);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, this.width, topH);

      // Glowing Title
      ctx.shadowColor = "rgba(0, 229, 255, 0.85)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 19px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      const titleStr = "⚡ TOWER DEFENSE: LAST GRID";
      ctx.fillText(titleStr, 32, 36);
      const titleWidth = ctx.measureText(titleStr).width;
      ctx.shadowBlur = 0;

      // Version in separate pill badge
      const badgeX = Math.round(32 + titleWidth + 16);
      this.renderMiniButton(badgeX, 16, 75, 26, "v4.2.0", "#e040fb");

      // Live Telemetry Signal Waveform
      const waveX = badgeX + 92;
      ctx.fillStyle = "#00e676";
      ctx.beginPath();
      ctx.arc(waveX, 29, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#00e676";
      ctx.font = "bold 10px monospace";
      ctx.fillText("GRID ONLINE", waveX + 10, 33);
      for (let bar = 0; bar < 4; bar++) {
        const barH = 4 + Math.abs(Math.sin(time * 6 + bar * 1.2)) * 12;
        ctx.fillStyle = "rgba(0, 230, 118, 0.8)";
        ctx.fillRect(waveX + 90 + bar * 5, 29 - barH / 2, 3, barH);
      }

      // Commander Name & Status
      const cmdX = waveX + 125;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`KOMANDIR: ${this.playerName.toUpperCase()} [★★★]`, cmdX, 33);

      // Web Controls in Top Header: Fullscreen & Audio & Language
      const isFull = !!(typeof document !== 'undefined' && (document.fullscreenElement || document.webkitFullscreenElement));
      this.renderMiniButton(880, 14, 90, 30, isFull ? "⛶ WINDOW" : "⛶ FULL", "#00e5ff");
      const isMuted = audio.sfxMuted && audio.bgmMuted;
      this.renderMiniButton(980, 14, 95, 30, isMuted ? "🔇 MUTE" : "🔊 OVOZ", isMuted ? "#ff5252" : "#00e676");
      this.renderMiniButton(1085, 14, 155, 30, `🌐 LANG: ${this.lang.toUpperCase()}`, "#ffd600");
      ctx.restore();

      // =========================================================================
      // 3. LEFT HERO SHOWCASE: MEGATRON CINEMATIC 3D ARENA (Clean unobstructed view)
      // =========================================================================

      // =========================================================================
      // 4. RIGHT COMMAND DECK: SPACIOUS & UNCLUTTERED (x: 590 to 1260, w: 670)
      // =========================================================================
      // Row 1: Primary Hero Mission Cards (y: 68 to 182, h: 114)
      this.drawCyberButton(590, 68, 328, 114, this.t("campaign"), "#00e5ff", "10 TA KIBER-SEKTOR • 3 TA BIOM", "🚀", true);
      const record = localStorage.getItem('lg_endless_wave') || "0";
      this.drawCyberButton(932, 68, 328, 114, this.t("endless"), "#e040fb", `CHEKSIZ TO'LQINLAR • W${record}`, "⚡", true);

      // Row 2: Tactical Operations (y: 196 to 278, h: 82)
      this.drawCyberButton(590, 196, 214, 82, this.t("sectorSelect"), "#00e5ff", "STRATEGIK BIOM", "🗺️", false);
      this.drawCyberButton(818, 196, 214, 82, this.t("bossRush"), "#ff1744", "10 TA ELITA TITAN", "💀", false);
      this.drawCyberButton(1046, 196, 214, 82, this.t("mapEditor"), "#00e676", "MAXSUS XARITALAR", "🛠️", false);

      // Row 3: Codex, Records & Achievements (y: 290 to 372, h: 82)
      this.drawCyberButton(590, 290, 214, 82, this.t("fieldManual"), "#ffd600", "3D MINORALAR & BAZA", "📖", false);
      this.drawCyberButton(818, 290, 214, 82, this.t("leaderboard"), "#00e5ff", "GLOBAL LIDERLAR", "🏆", false);
      this.drawCyberButton(1046, 290, 214, 82, "YUTUQLAR", "#e040fb", "20 TA UNVON", "🎖️", false);

      // Section 4: Commander Tactical Telemetry Dossier Panel (Bottom Right: y: 384 to 698, h: 314)
      ctx.save();
      const dx = 590, dy = 384, dw = 670, dh = 314;
      ctx.fillStyle = "rgba(10, 18, 32, 0.92)";
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dx, dy, dw, dh);

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 13px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText("📊 MEGATRON HARBIY TELEMETRIYASI & QO'MONDONLIK SHTABI", dx + 18, dy + 22);

      // Live LED Status indicator
      ctx.fillStyle = "#00e676";
      ctx.beginPath();
      ctx.arc(dx + dw - 150, dy + 18, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 9px monospace";
      ctx.fillText("TIZIM ONLAYN // v4.2.0", dx + dw - 140, dy + 22);

      // Live 3-Metrics Bar (y: 418 to 494, h: 76)
      const totalStars = Object.values(this.saveData.stars || {}).reduce((a, b) => a + b, 0);
      const statBoxes = [
        { label: "★ FATH ETILGAN", val: `★ ${totalStars} / 30`, col: "#ffd600" },
        { label: "⚡ CHEKSIZ REKORD", val: `Wave ${record}`, col: "#e040fb" },
        { label: "🛡️ HARBIY REYTINQ", val: `${this.saveData.highScores?.campaign || 0} PTS`, col: "#00e5ff" }
      ];

      for (let i = 0; i < 3; i++) {
        const bx = dx + 14 + i * 220;
        const by = dy + 34;
        ctx.fillStyle = "rgba(16, 26, 44, 0.88)";
        ctx.fillRect(bx, by, 206, 76);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
        ctx.strokeRect(bx, by, 206, 76);

        ctx.fillStyle = "#90a4ae";
        ctx.font = "bold 10px monospace";
        ctx.fillText(statBoxes[i].label, bx + 12, by + 24);

        ctx.fillStyle = statBoxes[i].col;
        ctx.font = "bold 20px 'Segoe UI', monospace";
        ctx.fillText(statBoxes[i].val, bx + 12, by + 56);
      }

      // Quick System Action Buttons inside Dossier (y: 506 to 580, h: 74)
      this.drawCyberButton(dx + 14, dy + 122, 206, 74, "SOZLAMALAR", "#38bdf8", "AUDIO & GRAFIKA", "⚙️", false);
      this.drawCyberButton(dx + 234, dy + 122, 206, 74, "ANDROID APK", "#00e676", "OFLAYN v4.2.0 (63MB)", "📱", false);
      this.drawCyberButton(dx + 454, dy + 122, 206, 74, "JANG TAHLILI", "#a855f7", "MVP & TELEMETRIYA", "📈", false);

      // Micro status footer ticker
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("● DECEPTICON CORE SYNCHRONIZED // 60 FPS ULTRA PBR // ALL COMBAT SYSTEMS OPERATIONAL", dx + dw / 2, dy + 292);

      ctx.restore();
    }

    renderMenuButton(x, y, w, h, text, bg, fg, border) {
      const color = border || fg || "#00e5ff";
      const isHigh = (border === "#ffd600" || bg === "#00e5ff" || bg === "#ff007f" || border === "#00e676");
      this.drawCyberButton(x, y, w, h, text, color, "", "", isHigh);
    }

getCodexDatabase() {
      return {
        TOWERS: [
          {
            id: "pulse", name: "Pulse Turret", icon: "⚡", role: "Rapid Energy Blaster", type: "ENERGY",
            cost: "100g", hp: "N/A", dmg: "22", rate: "3.5/s", dps: "77 DPS", range: "140px", armor: "N/A", speed: "Statik",
            eff: { vsShield: "200% (A'lo)", vsArmor: "60% (Zaif)", vsSwarm: "Yakka Nishon", vsBoss: "Yuqori DPS" },
            desc: "Yuqori chastotali lazer impulslari beruvchi asosiy kiber-minora. Standart dushmanlar va energiya qalqonlariga qarshi yuqori samaradorlik ko'rsatadi.",
            branchA: {
              name: "Plasma Overcharge", cost: "180g", dmg: "34 (AoE)", rate: "3.5/s", dps: "119 DPS",
              perk: "+55% DMG & 40px plazma chayqalishi",
              desc: "Kondensatorlar magnit plazma sharlarini hosil qilib, dushmanga urilganda kichik maydonda portlaydi."
            },
            branchB: {
              name: "Gatling Overdrive", cost: "160g", dmg: "22", rate: "6.5/s", dps: "143 DPS",
              perk: "+85% O'q uzish tezligi",
              desc: "Aylanuvchi 4-barrelli pulemyot klasteri. Dushmanlarni uzluksiz gipertovushli o'q yomg'iri ostida qoldiradi."
            },
            lore: {
              origin: "Apex Cybernetics R&D Lab - Sector 7", blueprint: "ARC-PL-101 / MK-IV",
              history: "2084-yilda Kiber-shahar himoyasi uchun yaratilgan ilk avtonom lazer minorasi. Millionslab kiber-bosqinchilarga qarshi janglarda sinalgan.",
              advice: "Yo'l boshiga va burilish burchaklariga qo'yish tavsiya etiladi. Cryo minorasi bilan tandemda dps 2x oshadi."
            },
            col: "#00e5ff"
          },
          {
            id: "mortar", name: "Heavy Mortar", icon: "💣", role: "Artillery Blast", type: "EXPLOSIVE",
            cost: "150g", hp: "N/A", dmg: "85", rate: "0.7/s", dps: "60 DPS", range: "220px", armor: "N/A", speed: "Statik",
            eff: { vsShield: "70% (Oddiy)", vsArmor: "140% (Kuchli)", vsSwarm: "100% AoE Portlash", vsBoss: "O'rta DPS" },
            desc: "Katta radiusda maydoniy portlash (AoE) beruvchi og'ir artilleriya. Zirhli dushmanlar va katta to'dalar uchun ideal.",
            branchA: {
              name: "Cluster Munitions", cost: "210g", dmg: "85 + 4x25", rate: "0.7/s", dps: "129 DPS",
              perk: "4 ta kassetali mikro-bomba",
              desc: "Asosiy snaryad portlagach, atrofga 4 ta mayda kassetali bomba sachratib ikkilamchi portlash hosil qiladi."
            },
            branchB: {
              name: "Napalm Fire", cost: "190g", dmg: "85 + 24/s", rate: "0.7/s", dps: "115 DPS",
              perk: "4 soniya olov krateri",
              desc: "Portlash markazida 4 soniya davomida yonuvchi napalm ko'lmak hosil qilib, o'tgan barcha dushmanlarni yoqadi."
            },
            lore: {
              origin: "Titan Heavy Ordnance Foundry", blueprint: "MORT-HV-505 / TITAN",
              history: "Zirhli kiber-tanklarni yo'q qilish uchun ishlab chiqilgan 200mm artilleriya batareyasi.",
              advice: "Xaritaning markaziga yoki aylanma yo'llar kesishmasiga qo'ying. To'dalar to'planganda halokatli kuchga ega."
            },
            col: "#ff9100"
          },
          {
            id: "cryo", name: "Cryo Emitter", icon: "❄️", role: "Frost Field Slow", type: "COLD",
            cost: "120g", hp: "N/A", dmg: "14", rate: "2.0/s", dps: "28 DPS", range: "130px", armor: "N/A", speed: "Statik",
            eff: { vsShield: "100% (Oddiy)", vsArmor: "100% (Oddiy)", vsSwarm: "Sekinlashtirish -60%", vsBoss: "Sekinlashtirish -35%" },
            desc: "Dushmanlarni 60% gacha muzlatuvchi va sekinlashtiruvchi kriogen nurlar emitteri. Tezkor dushmanlarni to'xtatadi.",
            branchA: {
              name: "Deep Freeze", cost: "170g", dmg: "22", rate: "2.0/s", dps: "44 DPS",
              perk: "1.5s To'liq qotirish (Stun)",
              desc: "Muzlatish darajasi 100% ga yetganda dushman 1.5 soniyaga harakatdan to'liq to'xtaydi."
            },
            branchB: {
              name: "Cryo Nova", cost: "185g", dmg: "38", rate: "1.2/s", dps: "45 DPS",
              perk: "360° Aylana Muz To'lqini",
              desc: "Har 2 soniyada minora atrofida 360 darajali muz to'lqini portlab, yaqin atrofdagi barcha nishonlarni muzlatadi."
            },
            lore: {
              origin: "CryoTech Polar Systems", blueprint: "CRY-FRZ-009 / SUBZERO",
              history: "Mutlaq nol haroratga yaqin suyuq azot oqimini nurlatuvchi kvant kristalli sovutgich tizimi.",
              advice: "Har doim Mortar yoki Flame minoralaridan sal oldinroqqa joylashtiring, dushmanlar sekinlashganda ko'proq zarba oladi."
            },
            col: "#00f0ff"
          },
          {
            id: "tesla", name: "Tesla Coil", icon: "⚡", role: "Chain Lightning", type: "ENERGY",
            cost: "180g", hp: "N/A", dmg: "48", rate: "1.4/s", dps: "67 DPS", range: "150px", armor: "N/A", speed: "Statik",
            eff: { vsShield: "180% (Yuqori)", vsArmor: "80% (O'rta)", vsSwarm: "Zanjirli x5 Nishon", vsBoss: "Doimiy Shok" },
            desc: "Bir vaqtning o'zida 4-7 ta yaqin atrofdagi dushmanga zanjirsimon yuqori voltli elektr toki ulovchi qurol.",
            branchA: {
              name: "EMP Disruption", cost: "230g", dmg: "55", rate: "1.4/s", dps: "77 DPS",
              perk: "1.2s EMP Shok Falaji",
              desc: "Elektr zanjiri dushman qalqonlarini tezda eritadi va 1.2 soniyaga ularning maxsus qobiliyatlarini o'chiradi."
            },
            branchB: {
              name: "Overload Burst", cost: "215g", dmg: "68", rate: "1.4/s", dps: "95 DPS",
              perk: "Qo'shimcha zanjir x8",
              desc: "Zanjir sakrash soni 8 tagacha oshadi va har bir sakrashda qo'shimcha energiya to'lqini chaqnaydi."
            },
            lore: {
              origin: "Voltaic Energy Corporation", blueprint: "TSL-ARC-404 / VOLT",
              history: "Yuqori voltli plazma generatorlari asosida ishlab chiqilgan afsonaviy mudofaa minorasi.",
              advice: "Dushmanlar zich guruhlangan joylarda va qalqonli dushmanlar paydo bo'ladigan yo'laklarda juda samarali."
            },
            col: "#ffd600"
          },
          {
            id: "flame", name: "Flame Thrower", icon: "🔥", role: "Conical Napalm Burn", type: "FIRE",
            cost: "160g", hp: "N/A", dmg: "32", rate: "2.8/s", dps: "89 DPS", range: "135px", armor: "N/A", speed: "Statik",
            eff: { vsShield: "80% (Oddiy)", vsArmor: "160% (Zirhni Eritadi)", vsSwarm: "Konus AoE Olov", vsBoss: "Uzluksiz DoT" },
            desc: "Konus shaklidagi olov purkab, dushmanlarga 3 soniya uzluksiz yonish zarari (DoT) va zirh eritish beradi.",
            branchA: {
              name: "Napalm Puddle", cost: "195g", dmg: "38 + DoT", rate: "2.8/s", dps: "120 DPS",
              perk: "Zaminni yoqib qoldirish",
              desc: "Olov o'tgan yerda 3 soniya davomida yonuvchi termal qatlam qoladi va dushmanlarni kuydiradi."
            },
            branchB: {
              name: "Armor Melt", cost: "220g", dmg: "32", rate: "2.8/s", dps: "90 DPS",
              perk: "-70% Zirh eritish",
              desc: "Har bir olov tegishi dushman zirhini 70% ga pasaytirib, boshqa minoralar zarbasini 2 barobar oshiradi."
            },
            lore: {
              origin: "Inferno Thermal Works", blueprint: "FLM-NPL-777 / INFERNO",
              history: "1500°C darajali sintetik napalm bilan kiber-organik xavflarni tozalovchi maxsus stansiya.",
              advice: "Burilish nuqtalariga o'rnating, dushmanlar sekin o'tayotganda maksimal darajada yonish zarari oladi."
            },
            col: "#ff3d00"
          },
          {
            id: "railgun", name: "Railgun Sniper", icon: "🎯", role: "Kinetic Piercer", type: "PIERCE",
            cost: "240g", hp: "N/A", dmg: "210", rate: "0.5/s", dps: "105 DPS", range: "300px", armor: "N/A", speed: "Statik",
            eff: { vsShield: "120% (Teshadi)", vsArmor: "200% (100% Zirh O'tadi)", vsSwarm: "Chiziqli Teshuvchi", vsBoss: "Kritik Zarba" },
            desc: "Butun xarita bo'ylab barcha dushmanlarni to'g'ri chiziqda teshib o'tuvchi gipertovushli magnit to'p.",
            branchA: {
              name: "Hyper-Velocity", cost: "280g", dmg: "340", rate: "0.5/s", dps: "170 DPS",
              perk: "Cheksiz nishonlarni teshish",
              desc: "Magnit tezlanish 15 Max tezlikka yetadi va snaryad o'z yo'lidagi cheksiz sonli dushmanlarni teshadi."
            },
            branchB: {
              name: "Shield Stripper", cost: "260g", dmg: "210", rate: "0.5/s", dps: "105 DPS",
              perk: "100% Qalqon sindirish",
              desc: "Qalqonli dushmanga tekkanida qalqonni 1 zarbada darhol butunlay sindirib tashlaydi."
            },
            lore: {
              origin: "AeroSpace Rail Defense", blueprint: "RLG-SN-001 / MACH-15",
              history: "Kosmik stansiyalar mudofaasidan olingan orbital magnit zambarak texnologiyasi.",
              advice: "Uzun to'g'ri chiziqli yo'laklar oxiriga qo'ying, snaryad birvarakayiga butun to'dani teshadi."
            },
            col: "#ff007f"
          },
          {
            id: "beacon", name: "Radar Beacon", icon: "📡", role: "Buff & Stealth Reveal", type: "SUPPORT",
            cost: "200g", hp: "N/A", dmg: "0", rate: "Aura", dps: "Buff", range: "160px", armor: "N/A", speed: "Statik",
            eff: { vsShield: "N/A", vsArmor: "N/A", vsSwarm: "Fosh qilish", vsBoss: "+35% Jamoaviy DMG" },
            desc: "Yaqin atrofdagi barcha minoralarga +35% zarar qo'shuvchi va ko'rinmas (Phantom) dushmanlarni fosh qiluvchi radar.",
            branchA: {
              name: "Hyper Overclock", cost: "240g", dmg: "Buff", rate: "Aura", dps: "Buff",
              perk: "+50% Minora tezligi",
              desc: "Radiusi ichidagi minoralar o'q uzish tezligini +50% ga oshirib, overdrive rejimiga kiritadi."
            },
            branchB: {
              name: "Sensor Jammer", cost: "220g", dmg: "Buff", rate: "Aura", dps: "Buff",
              perk: "Dushmanlarni sarosimaga solish",
              desc: "Radar to'lqini dushman tizimlarini chalkashtirib, ularning tezligini 30% ga pasaytiradi."
            },
            lore: {
              origin: "Cyber Intelligence Node", blueprint: "RAD-BCN-999 / INTEL",
              history: "Barcha mudofaa tarmoqlarini yagona sinxron jangovar kompyuterga birlashtiruvchi markaziy antenna.",
              advice: "Eng ko'p minoralaringiz to'plangan markazga joylashtiring, barcha minoralar samaradorligi keskin ortadi."
            },
            col: "#76ff03"
          },
          {
            id: "barricade", name: "Cyber Barricade", icon: "🛡️", role: "Defensive Barrier", type: "BARRIER",
            cost: "40g", hp: "500 HP", dmg: "0", rate: "Statik", dps: "0 DPS", range: "0px", armor: "15 Armor", speed: "Statik",
            eff: { vsShield: "Qaytarish", vsArmor: "Bloklash", vsSwarm: "Yo'lni burish", vsBoss: "Vaqtincha to'xtatish" },
            desc: "Dushmanlar harakatini to'sib, ularni aylanma uzoq yo'lga buruvchi mustahkam kiber-to'siq.",
            branchA: {
              name: "Reinforced Plating", cost: "60g", dmg: "0", rate: "Statik", dps: "0",
              perk: "1200 HP va 30 Armor",
              desc: "Titan qotishmali qoplamalar bilan quvvatlantirilib, gigant boss zarbalariga uzoq vaqt dosh beradi."
            },
            branchB: {
              name: "Shock Spikes", cost: "70g", dmg: "45 Retaliation", rate: "Statik", dps: "45 DPS",
              perk: "Urilgan dushmanga 45 zarar",
              desc: "To'siqqa tegingan har bir dushmanga 45 birlik yuqori voltli teskari elektr zarbasi beradi."
            },
            lore: {
              origin: "Fortress Nanite Engineering", blueprint: "BAR-DEF-100 / WALL",
              history: "Shaharning tor ko'chalarida dushman kolonnalarini labirintga haydash uchun barpo etilgan to'siq.",
              advice: "Labirint hosil qilish uchun qatorma-qator qo'ying, dushmanlar sizning qurollaringiz ostida 3x ko'proq yuradi."
            },
            col: "#ffd600"
          }
        ],
        ENEMIES: [
          {
            id: "grunt", name: "Cyber Grunt", icon: "◆", role: "Basic Infantry", type: "LIGHT",
            bounty: "8g", hp: "75 HP", dmg: "Low", rate: "N/A", dps: "N/A", speed: "75 px/s", armor: "0", range: "Melee",
            eff: { vsShield: "Zaif", vsArmor: "Zaif", vsSwarm: "To'da bo'ladi", vsBoss: "Piyoda" },
            desc: "Standart kiber-piyoda dushman. Alohida xavfli emas, ammo katta to'dalar bo'lib bazani bosib olishga urinadi.",
            lore: {
              origin: "Rogue Drone Assembly - Sub-Grid", blueprint: "GRN-CYB-01",
              history: "Standart kiber-piyoda robot. Kiber-bosqinning birinchi to'lqinida maydonga tushiriladi.",
              advice: "Pulse Turret va Mortar yordamida osongina yo'q qilinadi."
            },
            col: "#00e5ff"
          },
          {
            id: "sprinter", name: "Sprinter Drone", icon: "▲", role: "Fast Infiltrator", type: "FAST",
            bounty: "10g", hp: "45 HP", dmg: "Low", rate: "N/A", dps: "N/A", speed: "135 px/s", armor: "0", range: "Melee",
            eff: { vsShield: "Zaif", vsArmor: "Zaif", vsSwarm: "Tezkor", vsBoss: "Infiltrator" },
            desc: "Juda yuqori harakat tezligiga ega engil dron. Mudofaa chizig'ini tezda yorib o'tishga intiladi.",
            lore: {
              origin: "Scout Recon Unit", blueprint: "SPT-DRN-02",
              history: "Tezkor razvedka droni. Baza mudofaasining bo'shliqlarini qidiradi.",
              advice: "Cryo Emitter yoki Tesla Coil bilan sekinlashtirish zarur, aks holda bazaga yetib boradi."
            },
            col: "#ffd600"
          },
          {
            id: "brute", name: "Armored Brute", icon: "■", role: "Heavy Ground Breaker", type: "ARMORED",
            bounty: "22g", hp: "280 HP", dmg: "High", rate: "N/A", dps: "N/A", speed: "45 px/s", armor: "8 Armor", range: "Melee",
            eff: { vsShield: "O'rta", vsArmor: "Qalin Zirh", vsSwarm: "Yakka Tank", vsBoss: "Mini-Boss" },
            desc: "Qalin titan zirh bilan qoplangan og'ir kiber-gladiator. Kinetik qurollarga qarshi yuqori chidamlilikka ega.",
            lore: {
              origin: "Siege Mech Division", blueprint: "BRT-HV-03",
              history: "Mudofaa to'siqlarini buzib o'tish uchun maxsus yaratilgan og'ir piyoda tank.",
              advice: "Railgun (Zirh teshuvchi) yoki Flame Thrower (Zirh erituvchi) bilan yo'q qiling."
            },
            col: "#ff007f"
          },
          {
            id: "shieldbearer", name: "Shieldbearer", icon: "⬢", role: "Energy Shielded", type: "SHIELD",
            bounty: "25g", hp: "160 HP", dmg: "Medium", rate: "N/A", dps: "N/A", speed: "60 px/s", armor: "120 Shield", range: "Support",
            eff: { vsShield: "Kuchli Qalqon", vsArmor: "O'rta", vsSwarm: "Himoyachi", vsBoss: "Qalqon generatori" },
            desc: "O'zini va yonidagi dushmanlarni energiya qalqoni bilan himoyalaydi. Qalqoni buzilmaguncha HP kamaymaydi.",
            lore: {
              origin: "Defensive Array Core", blueprint: "SHD-BR-04",
              history: "Ittifoqchi dushmanlarni uzoq masofali qurollardan himoya qiluvchi harakatlanuvchi qalqon generatori.",
              advice: "Tesla Coil (EMP) yoki Pulse Turret orqali energiya qalqonini bir zumda sindiring."
            },
            col: "#00b0ff"
          },
          {
            id: "medic", name: "Nanite Medic", icon: "✚", role: "Field Healer", type: "HEALER",
            bounty: "28g", hp: "140 HP", dmg: "None", rate: "Heal 25/s", dps: "Support", speed: "65 px/s", armor: "0", range: "120px",
            eff: { vsShield: "Davolash", vsArmor: "Tuzatish", vsSwarm: "Guruhni tiklaydi", vsBoss: "Yordamchi" },
            desc: "Yaqin atrofdagi dushmanlarni soniyasiga +25 HP bilan davolaydi. Kolonnada birinchi bo'lib yo'q qilinishi shart.",
            lore: {
              origin: "Bio-Nanite Lab", blueprint: "MED-NAN-05",
              history: "Zararlangan kiber-mexanizmlarni jang maydonida qayta tiklovchi nanit droni.",
              advice: "Railgun yoki Hero Mech orqali to'g'ridan-to'g'ri nishonga olib eng birinchi yo'q qiling."
            },
            col: "#00e676"
          },
          {
            id: "splitter", name: "Splitter Organism", icon: "❖", role: "Dividing Menace", type: "LIGHT",
            bounty: "18g", hp: "190 HP", dmg: "Medium", rate: "N/A", dps: "N/A", speed: "55 px/s", armor: "2 Armor", range: "Melee",
            eff: { vsShield: "Oddiy", vsArmor: "Oddiy", vsSwarm: "2x Swarmling bo'linadi", vsBoss: "To'da" },
            desc: "O'ldirilganda ikkita kichik va juda tezkor Swarmling dushmaniga bo'linadi. AoE qurollarga muhtoj.",
            lore: {
              origin: "Bio-Mechanical Mutagen", blueprint: "SPL-ORG-06",
              history: "Kiber-virusli organik klon. Mag'lubiyat paytida bo'linish mexanizmini ishga tushiradi.",
              advice: "Heavy Mortar yoki Flame Thrower yordamida bo'lingan paytidayoq ikkala bo'lagini yoqing."
            },
            col: "#ffab00"
          },
          {
            id: "phantom", name: "Phantom Ghost", icon: "◌", role: "Phase Shifter", type: "FAST",
            bounty: "30g", hp: "120 HP", dmg: "Medium", rate: "N/A", dps: "N/A", speed: "80 px/s", armor: "Phasing", range: "Melee",
            eff: { vsShield: "Fazoviy", vsArmor: "Ko'rinmas", vsSwarm: "G'oyib bo'ladi", vsBoss: "Infiltrator" },
            desc: "Har 4 soniyada fazoviy g'oyib bo'lib, oddiy minoralarning nishonidan chiqib ketadi. Radar Beacon kerak.",
            lore: {
              origin: "Quantum Rift Technology", blueprint: "PHT-GST-07",
              history: "Giperfazo orqali o'lchamlararo sakrash imkoniyatiga ega kvant kiber-arvohi.",
              advice: "Radar Beacon minorasini o'rnating, u Phantomning fazoviy niqobini darhol fosh qiladi."
            },
            col: "#b388ff"
          },
          {
            id: "kamikaze_drone", name: "Kamikaze Drone", icon: "💥", role: "Suicide Flyer", type: "FLYER",
            bounty: "15g", hp: "60 HP", dmg: "120 AoE", rate: "N/A", dps: "N/A", speed: "160 px/s", armor: "0", range: "Suicide",
            eff: { vsShield: "Portlovchi", vsArmor: "Portlovchi", vsSwarm: "Havo hujumi", vsBoss: "Halokatli" },
            desc: "Uchuvchi havo dushmani. Yer to'siqlarini chetlab o'tib, baza yoki minoralar tomon uchib kelib portlaydi.",
            lore: {
              origin: "Volatile Munition Pod", blueprint: "KMK-DRN-08",
              history: "Yuqori quvvatli plazma portlovchisi bilan jihozlangan bir martalik qanotli bomba.",
              advice: "Pulse Turret yoki Railgun yordamida uzoq masofada havodayoq urib tushiring."
            },
            col: "#ff1744"
          },
          {
            id: "gunship", name: "Heavy Gunship", icon: "🚁", role: "Aerial Corvette", type: "FLYER",
            bounty: "45g", hp: "480 HP", dmg: "Laser Salvo", rate: "1.5/s", dps: "Medium", speed: "50 px/s", armor: "6 Armor", range: "180px",
            eff: { vsShield: "Havodan", vsArmor: "Zirhli Havo", vsSwarm: "Minoralarni o'qqa tutadi", vsBoss: "Mini-Titan" },
            desc: "Havodan minoralarni o'qqa tutuvchi og'ir uchuvchi kiber-korvet. Zamin to'siqlaridan mutlaqo mustasno.",
            lore: {
              origin: "Sky-Fortress Fleet", blueprint: "GNS-COR-09",
              history: "Kiber-legionning asosiy jangovar zarba beruvchi vertolyot korveti.",
              advice: "Railgun va kuchaytirilgan Pulse Turretlar havodan kelayotgan korvetni tezda yo'q qiladi."
            },
            col: "#ff5252"
          }
        ],
        BOSSES: [
          {
            id: "juggernaut", name: "Goliath Juggernaut", icon: "💀", role: "Wave 10 Titan", type: "TITAN",
            bounty: "150g", hp: "6,000 HP", dmg: "Titan Slam", rate: "Heavy", dps: "Destructive", speed: "38 px/s", armor: "20 Armor", range: "Melee",
            eff: { vsShield: "Super Og'ir", vsArmor: "20 Titan Zirh", vsSwarm: "Yer silkinishi", vsBoss: "Bosh Titan" },
            desc: "10-to'lqin bosh titani. Qalin monolit po'lat zirhga ega. Railgun va Flame Thrower zarbalariga juda zaif.",
            lore: {
              origin: "Heavy Siege Forge Alpha", blueprint: "GLH-JUG-W10",
              history: "Kiber-urushning ilk yirik devqomat titanlaridan biri. Shahar devorlarini qulatish uchun yasalgan.",
              advice: "Flame Thrower bilan zirhini 70% ga eritib, Railgun va Mortar bilan konsentrlangan o't oching."
            },
            col: "#ff1744"
          },
          {
            id: "overseer", name: "Cyber Overseer", icon: "👁️", role: "Wave 20 Titan", type: "TITAN",
            bounty: "250g", hp: "9,000 HP", dmg: "Orbital Pulse", rate: "2.0/s", dps: "Energy Salvo", speed: "42 px/s", armor: "14 Armor", range: "220px",
            eff: { vsShield: "Ko'z nuri", vsArmor: "Dron chiqaradi", vsSwarm: "Doimiy to'lqin", vsBoss: "Kvant Ko'z" },
            desc: "20-to'lqin titani. Doimiy ravishda Sprinter dronlar armiyasini maydonga chiqaradi va qizil lazer to'lqinlari sochadi.",
            lore: {
              origin: "Sentient Nexus Singularity", blueprint: "OVR-EYE-W20",
              history: "Kiber-tarmoqni boshqaruvchi markaziy sun'iy intellektning jangovar avatari.",
              advice: "Tesla Coil orqali chiqqan dronlarni birvarakayiga yo'q qiling, Hero Mech bilan ulti urib yakunlang."
            },
            col: "#e040fb"
          },
          {
            id: "hive_titan", name: "Hive Titan", icon: "👑", role: "Wave 30 Titan", type: "TITAN",
            bounty: "500g", hp: "20,000 HP", dmg: "Venom Salvo", rate: "3 bosqich", dps: "Supreme", speed: "40 px/s", armor: "22 Armor", range: "200px",
            eff: { vsShield: "Enrage +40%", vsArmor: "3 Bosqichli Jang", vsSwarm: "Biologik klonlar", vsBoss: "Final Bosqich" },
            desc: "30-to'lqin bosh titani. 3 ta jangga bo'lingan faza va har faza oxirida enrage tezlanishiga ega bosh titan.",
            lore: {
              origin: "Broodmother Bio-Cyber Hive", blueprint: "HVE-TTN-W30",
              history: "Kiber-organik laboratoriyalardan qochgan eng qudratli kiber-ona organizm.",
              advice: "Barcha minoralarni Radar Beacon bilan kuchaytiring va Cryo orqali uning enrage tezligini to'xtating."
            },
            col: "#ffd600"
          },
          {
            id: "void_titan", name: "Void Titan", icon: "🌀", role: "Singularity Colossus", type: "TITAN",
            bounty: "320g", hp: "8,500 HP", dmg: "Black Hole Vortex", rate: "Special", dps: "Gravity", speed: "36 px/s", armor: "18 Armor", range: "250px",
            eff: { vsShield: "Gravitatsiya", vsArmor: "Qora Tuynuk", vsSwarm: "O'ziga tortadi", vsBoss: "Fazoviy" },
            desc: "Atrofidagi narsalarni tortib oluvchi gravitatsion qora tuynuk voronkasini yaratib minoralarni to'xtatadi.",
            lore: {
              origin: "Void Dimensional Rift", blueprint: "VOID-COL-00",
              history: "Fazolararo darvoza buzilganda paydo bo'lgan o'lchamsiz qora energiya kolossi.",
              advice: "Masofadan Railgun va Mortar bilan o'q yog'diring, markaziga yaqinlashish xavfli."
            },
            col: "#7c4dff"
          },
          {
            id: "chrono_phantom", name: "Chrono Phantom", icon: "⌛", role: "Temporal Anomaly", type: "TITAN",
            bounty: "300g", hp: "7,200 HP", dmg: "Time Warp", rate: "Phase", dps: "Distortion", speed: "46 px/s", armor: "12 Armor", range: "180px",
            eff: { vsShield: "Vaqtni buzish", vsArmor: "Sekinlashtirish", vsSwarm: "Sakraydi", vsBoss: "Temporal" },
            desc: "Minoralarning otish tezligini 50% ga pasaytiradi va har 4 soniyada 120 piksel oldinga sakrab o'tadi.",
            lore: {
              origin: "Chrono-Temporal Lab Beta", blueprint: "CHR-PHN-88",
              history: "Vaqt oqimini buzish tajribasi natijasida yuzaga kelgan anomal temporal kiborg.",
              advice: "Radar Beacon uning vaqt sakrashlarini fosh qiladi, EMP esa vaqt qobig'ini buzadi."
            },
            col: "#00e5ff"
          },
          {
            id: "mecha_colossus", name: "Mecha Colossus", icon: "🤖", role: "Mobile Fortress", type: "TITAN",
            bounty: "400g", hp: "11,000 HP", dmg: "Dual 150mm & Missiles", rate: "Barrage", dps: "Catastrophic", speed: "32 px/s", armor: "26 Armor", range: "240px",
            eff: { vsShield: "Raketalar salvosi", vsArmor: "26 Super Zirh", vsSwarm: "Og'ir to'p", vsBoss: "Jangovar Dev" },
            desc: "Qo'shaloq raketalar salvosi va 150mm to'p bilan minoralarga javob zarbasi beruvchi harbiy devqomat.",
            lore: {
              origin: "Apex Renegade Prototype Factory", blueprint: "MCH-COL-X1",
              history: "Ittifoqchilar harbiy bazasini yo'q qilish uchun isyonchi robotlar tomonidan qurilgan super-mech.",
              advice: "Uning 26 birlik super-zirhini faqat Flame Thrower (Armor Melt) va Railgun sindira oladi."
            },
            col: "#ff9100"
          }
        ],
        MECH: [
          {
            id: "megatron", name: "Megatron (WFC 3D)", icon: "💀", role: "Supreme Decepticon Leader", type: "HERO_DECEPTICON",
            cost: "Supreme", hp: "1200 HP", dmg: "450 Dark Energon", rate: "1.0/s", dps: "450 DPS", range: "350px", armor: "40 Armor", speed: "110 px/s",
            eff: { vsShield: "220% (Dark Energon)", vsArmor: "180% (Zirhni yanchadi)", vsSwarm: "Maydoniy zarba", vsBoss: "Kritik 1450" },
            desc: "Cybertron qudratli Decepticon yetakchisi. 1450 DMG Fusion Cannon va Dark Energon plazmasi bilan qurollangan. Robot va Og'ir Kiber-Tank rejimlariga o'ta oladi.",
            branchA: {
              name: "Fusion Cannon Overcharge", cost: "Upgrade", dmg: "850", rate: "1.0/s", dps: "850 DPS",
              perk: "Massive Penetration & Screen Shake",
              desc: "Fusion Cannon to'liq Dark Energon bilan to'yintirilib, 1450 gacha kritik maydoniy portlash beradi."
            },
            branchB: {
              name: "Cybertron Siege Tank", cost: "Upgrade", dmg: "500 AoE", rate: "1.2/s", dps: "600 DPS",
              perk: "Armor +80% & Splash Blast",
              desc: "Megatron og'ir kiber-tankka aylanib, butun dushman qatorlarini uzluksiz artilleriya o'ti ostida qoldiradi."
            },
            lore: {
              origin: "War for Cybertron Citadel", blueprint: "MEG-WFC-001 / DECEPTICON",
              history: "Kiber-urushning qudratli yetakchisi. Million yillar davomida kurashgan va Dark Energon kuchini o'zlashtirgan.",
              advice: "Fusion Cannon bilan eng yirik bosslar va titanlarni bir zarbada yakson qiling."
            },
            col: "#c084fc"
          },
          {
            id: "optimus", name: "Optimus Prime (3D)", icon: "⭐", role: "Autobot Supreme Commander", type: "HERO_AUTOBOT",
            cost: "Supreme", hp: "1000 HP", dmg: "320 Ion Blaster", rate: "1.5/s", dps: "480 DPS", range: "300px", armor: "35 Armor", speed: "130 px/s",
            eff: { vsShield: "150% (Ion)", vsArmor: "160% (Axe Cleave)", vsSwarm: "Matrix Nova", vsBoss: "Yuqori Barqarorlik" },
            desc: "Autobotlarning afsonaviy oliy qo'mondoni. Ion Blaster, Energon Boltasi va Matrix of Leadership bilan jihozlangan. Peterbilt transportiga aylana oladi.",
            branchA: {
              name: "Matrix of Leadership", cost: "Upgrade", dmg: "700 Holy Light", rate: "Aura", dps: "700 DPS",
              perk: "Team Buff +100% & Holy Nova",
              desc: "Matrix of Leadership yadrosi ochilib, xaritadagi barcha mudofaa minoralarini quvvatlantiradi va dushmanlarni yoqadi."
            },
            branchB: {
              name: "Energon Axe Cleave", cost: "Upgrade", dmg: "550 Melee", rate: "2.0/s", dps: "1100 DPS",
              perk: "100% Armor Pierce",
              desc: "Yonuvchi Energon boltasi bilan dushmanlarni teng ikkiga bo'lib, har qanday zirhni teshib o'tadi."
            },
            lore: {
              origin: "Autobot High Command", blueprint: "OPT-PRIME-001 / MATRIX",
              history: "Kiber-shaharlarni himoya qiluvchi afsonaviy ritsar va yetakchi. Ozodlik har bir ongli mavjudotning huquqidir deb hisoblaydi.",
              advice: "Jang markaziga kirib Energon boltasi va Ion Blaster bilan kombinatsiyalangan zarba bering."
            },
            col: "#ff3355"
          },
          {
            id: "bumblebee", name: "Bumblebee TLK (3D)", icon: "⚡", role: "Elite Autobot Scout", type: "HERO_SCOUT",
            cost: "Supreme", hp: "750 HP", dmg: "180 Plasma Stinger", rate: "4.0/s", dps: "720 DPS", range: "240px", armor: "20 Armor", speed: "175 px/s",
            eff: { vsShield: "200% (Plasma)", vsArmor: "110% (Oddiy)", vsSwarm: "Rapid Barrage", vsBoss: "Tezkor Shok" },
            desc: "O'ta chaqqon va chaqmoqdek tezkor razvedkachi. Stinger Plazma to'pi va Cyber-Blade pichoqlari bilan dushmanlar atrofida raqs tushadi.",
            branchA: {
              name: "Plasma Stinger Burst", cost: "Upgrade", dmg: "240", rate: "5.0/s", dps: "1200 DPS",
              perk: "Rapid Stun & EMP",
              desc: "Uzluksiz plazma o'qlari yomg'iri dushman elektronikasini falaj qilib, to'xtatib qo'yadi."
            },
            branchB: {
              name: "Camaro Speed Drift", cost: "Upgrade", dmg: "350 Dash", rate: "Instant", dps: "Burst",
              perk: "Evasion +60% & Speed Boost",
              desc: "Camaro transport rejimida yuqori tezlikda dushmanlarni sudrab o'tadi va orqadan aylanib kelib zarba beradi."
            },
            lore: {
              origin: "Autobot Recon Detachment", blueprint: "BEE-TLK-007 / SCOUT",
              history: "Jasur razvedkachi qahramon. Eng xavfli topshiriqlarda dushman mudofaasini birinchi bo'lib yorib kirgan.",
              advice: "Tezkor harakat qilib dushmanlarning orqa chizig'iga kirib boring va Stinger Cannon bilan yo'q qiling."
            },
            col: "#ffd600"
          },
          {
            id: "biped", name: "Apex-01 (Assault Biped)", icon: "🤖", role: "Field Commander Mech", type: "HERO_BIPED",
            cost: "Commander", hp: "400 HP", dmg: "40 Kinetic", rate: "4.5/s", dps: "180 DPS", range: "175px", armor: "10 Armor", speed: "130 px/s",
            eff: { vsShield: "120% (Tezkor)", vsArmor: "90% (Kinetic)", vsSwarm: "Dash va Gatling", vsBoss: "Cyber-Slash 400 DMG" },
            desc: "Manyovrli yuruvchi qo'mondon roboti. 2 ta aylanuvchi lazer Gatling pulemyoti, kinetik tezlanish (Dash) va 400 zarbali Cyber-Slash ultisi bor.",
            branchA: {
              name: "Gatling Overheat", cost: "Upgrade", dmg: "52", rate: "5.5/s", dps: "286 DPS",
              perk: "+45% Gatling o't kuchi",
              desc: "Gatling pulemyotlari o'ta qizish rejimida ishlaydi va har 5-o'qda yondiruvchi plazma otadi."
            },
            branchB: {
              name: "Vortex Blade", cost: "Upgrade", dmg: "600 Ulti", rate: "Dash x2", dps: "Burst DPS",
              perk: "Cyber-Slash +50% Radius",
              desc: "Qilich zarbasi butun xaritani qamrab oluvchi energiyali plazma to'lqinini hosil qiladi."
            },
            lore: {
              origin: "Apex Cybernetics Flagship Project", blueprint: "APX-01 / COMMANDER",
              history: "Insoniyatning eng so'nggi mudofaa tarmog'ini boshqarish uchun yaratilgan 5-avlod avtonom qo'mondon kiber-mechi.",
              advice: "Xaritaning xavfli nuqtalariga tezda Dash orqali yetib boring va to'dalarni Cyber-Slash bilan yo'q qiling."
            },
            col: "#00e5ff"
          },
          {
            id: "siege", name: "Apex-01 (Siege Tank)", icon: "🚜", role: "Heavy Dual Artillery", type: "HERO_SIEGE",
            cost: "Commander", hp: "400 HP", dmg: "140 Explosive", rate: "1.2/s", dps: "168 DPS", range: "260px", armor: "25 Armor (Fortified)", speed: "90 px/s",
            eff: { vsShield: "100% (Oddiy)", vsArmor: "180% (Zirhni yanchadi)", vsSwarm: "70px AoE Portlash", vsBoss: "Ulkan zarba" },
            desc: "O'rnatiladigan og'ir tank rejimi. Qabul qiluvchi barcha zarbalarni 50% kamaytiradi (og'ir zirh) va 70px maydonda portlovchi qo'shaloq 120mm to'p otadi.",
            branchA: {
              name: "Heavy Artillery Battery", cost: "Upgrade", dmg: "220", rate: "1.2/s", dps: "264 DPS",
              perk: "+60% Portlash radiusi",
              desc: "120mm qo'shaloq to'plar snaryadlari butun dushman guruhini bir zumda kulga aylantiradi."
            },
            branchB: {
              name: "Reactive Fortress", cost: "Upgrade", dmg: "140", rate: "1.2/s", dps: "168 DPS",
              perk: "-70% Olingan zarar & EMP Spikes",
              desc: "Qabul qilingan zarbalarni 70% ga kamaytiradi va urilgan dushmanlarga EMP kontr-zarbasi beradi."
            },
            lore: {
              origin: "Apex Heavy Siege Engineering", blueprint: "APX-01 / SIEGE-PLATFORM",
              history: "Qo'mondon mechining og'ir mudofaa rejimi. Xavfli sektorlarni bir o'zi ushlab turishga mo'ljallangan.",
              advice: "Dushmanlar ko'p keladigan tor yo'llarda Siege rejimiga o'ting va to'xtovsiz maydoniy zarbalar bering."
            },
            col: "#ffd600"
          }
        ]
      };
    }

    getCodexFireInterval() {
      const db = this.getCodexDatabase();
      const tab = this.codexTab || "TOWERS";
      const list = db[tab] || db.TOWERS;
      const item = list.find(i => i.id === this.codexSelectedId) || list[0];
      const br = this.codexBranch || "BASE";
      if (tab === "TOWERS") {
        if (item.id === "pulse") return br === "BRANCH_B" ? 0.15 : 0.28;
        if (item.id === "mortar") return 1.4;
        if (item.id === "cryo") return 0.5;
        if (item.id === "tesla") return 0.7;
        if (item.id === "flame") return 0.35;
        if (item.id === "railgun") return br === "BRANCH_A" ? 1.6 : 2.0;
        if (item.id === "beacon") return 1.2;
        if (item.id === "barricade") return 1.8;
      }
      if (tab === "MECH") {
        if (item.id === "biped") return br === "BRANCH_A" ? 0.18 : 0.22;
        if (item.id === "siege") return 0.95;
      }
      return 1.4;
    }

    fireCodexSimShot() {
      const db = this.getCodexDatabase();
      const tab = this.codexTab || "TOWERS";
      const list = db[tab] || db.TOWERS;
      const item = list.find(i => i.id === this.codexSelectedId) || list[0];
      const br = this.codexBranch || "BASE";

      const sx = 550;
      const sy = 340;
      const tx = 665;
      const ty = 280;

      this.codexRecoil = 1.0;

      let pColor = item.col || "#00e5ff";
      let pSpeed = 4.0;
      let pArc = 0;
      let pType = item.type || "ENERGY";
      let dmgVal = 25;

      if (tab === "TOWERS") {
        if (item.id === "pulse") {
          dmgVal = br === "BRANCH_A" ? 34 : 22;
          pSpeed = 5.5;
          pColor = br === "BRANCH_A" ? "#b388ff" : "#00e5ff";
          audio.shootPulse();
        } else if (item.id === "mortar") {
          dmgVal = 85;
          pSpeed = 1.6;
          pArc = 90;
          pColor = "#ff9100";
          audio.shootMortar();
        } else if (item.id === "cryo") {
          dmgVal = 14;
          pSpeed = 4.0;
          pColor = "#00f0ff";
          audio.shootCryo();
        } else if (item.id === "tesla") {
          dmgVal = br === "BRANCH_B" ? 68 : 48;
          pSpeed = 8.0;
          pColor = "#ffd600";
          audio.shootTesla ? audio.shootTesla() : audio.shootPulse();
        } else if (item.id === "flame") {
          dmgVal = 32;
          pSpeed = 3.5;
          pColor = "#ff3d00";
          audio.shootFlame ? audio.shootFlame() : audio.shootMortar();
        } else if (item.id === "railgun") {
          dmgVal = br === "BRANCH_A" ? 340 : 210;
          pSpeed = 12.0;
          pColor = br === "BRANCH_B" ? "#e040fb" : "#ff007f";
          audio.shootRailgun();
        } else if (item.id === "beacon") {
          dmgVal = 0;
          pSpeed = 2.5;
          pColor = "#76ff03";
          audio.modal();
        } else if (item.id === "barricade") {
          dmgVal = 45;
          pSpeed = 5.0;
          pColor = "#ffd600";
          audio.hit();
        }
      } else if (tab === "MECH") {
        if (item.id === "megatron") {
          dmgVal = br === "BRANCH_A" ? 850 : 450;
          pSpeed = 8.5;
          pColor = "#c084fc";
          pType = "ENERGY";
          if (audio.mortarFire) audio.mortarFire();
          this.screenShake = 6;
        } else if (item.id === "optimus") {
          dmgVal = br === "BRANCH_B" ? 550 : 320;
          pSpeed = 7.0;
          pColor = "#ff3355";
          pType = "ENERGY";
          if (audio.mortarFire) audio.mortarFire();
        } else if (item.id === "bumblebee") {
          dmgVal = br === "BRANCH_A" ? 240 : 180;
          pSpeed = 10.0;
          pColor = "#ffd600";
          pType = "ENERGY";
          if (audio.pulseFire) audio.pulseFire();
        } else if (item.id === "biped") {
          dmgVal = br === "BRANCH_A" ? 52 : 40;
          pSpeed = 6.0;
          pColor = "#00e5ff";
          audio.shootPulse();
        } else {
          dmgVal = br === "BRANCH_A" ? 220 : 140;
          pSpeed = 3.0;
          pArc = 45;
          pColor = "#ffd600";
          audio.artilleryBlast ? audio.artilleryBlast() : audio.shootMortar();
        }
      } else {
        if (item.id === "kamikaze_drone") {
          dmgVal = 120;
          pSpeed = 5.5;
          pColor = "#ff1744";
          audio.leak();
        } else if (item.id === "gunship") {
          dmgVal = 65;
          pSpeed = 7.0;
          pColor = "#00e5ff";
          audio.shootPulse();
        } else if (item.id === "brute") {
          dmgVal = 95;
          pSpeed = 4.0;
          pColor = "#ff007f";
          audio.hit();
        } else if (item.id === "juggernaut") {
          dmgVal = 220;
          pSpeed = 4.5;
          pColor = "#ff1744";
          this.screenShake = 5;
          audio.explosion();
        } else if (item.id === "overseer") {
          dmgVal = 180;
          pSpeed = 9.0;
          pColor = "#00e5ff";
          audio.shootPulse();
        } else {
          dmgVal = tab === "BOSSES" ? 140 : 35;
          pSpeed = 3.5;
          pColor = item.col || "#ff1744";
          audio.hit();
        }
      }

      this.codexProjectiles.push({
        startX: sx,
        startY: sy,
        x: sx,
        y: sy,
        targetX: tx,
        targetY: ty,
        progress: 0,
        speed: pSpeed,
        arc: pArc,
        color: pColor,
        type: pType,
        dmg: dmgVal,
        itemId: item.id,
        branch: br
      });

      for (let m = 0; m < 6; m++) {
        this.codexParticles.push({
          x: sx + (Math.random() - 0.5) * 8,
          y: sy + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 45,
          vy: (Math.random() - 0.5) * 45,
          r: 2 + Math.random() * 3,
          color: pColor,
          alpha: 1.0,
          life: 0.18
        });
      }
    }

    onCodexProjectileHit(p) {
      this.codexDummyFlash = 1.0;
      const targetType = this.codexSimTargetType || "STANDARD";

      let mult = 1.0;
      let tag = "";
      let txtCol = "#ffffff";

      if (targetType === "SHIELDED" && this.codexDummyShield > 0) {
        if (p.type === "ENERGY" || p.itemId === "tesla" || (p.branch === "BRANCH_A" && p.itemId === "pulse")) {
          mult = 2.0;
          tag = " ⚡ CRIT vs SHIELD (+100%)";
          txtCol = "#00e5ff";
        } else if (p.itemId === "railgun") {
          mult = 1.5;
          tag = " 🎯 SHIELD PIERCE";
          txtCol = "#ff007f";
        } else {
          mult = 0.7;
          tag = " 🛡️ SHIELD ABSORB (-30%)";
          txtCol = "#90caf9";
        }
      } else if (targetType === "ARMORED") {
        if (p.itemId === "railgun") {
          mult = 1.35;
          tag = " 🎯 100% ARMOR PIERCE!";
          txtCol = "#ff007f";
        } else if (p.itemId === "flame") {
          mult = 1.5;
          tag = " 🔥 ARMOR MELT (+50%)";
          txtCol = "#ff3d00";
        } else if (p.type === "EXPLOSIVE") {
          mult = 1.2;
          tag = " 💣 HEAVY CRUSH";
          txtCol = "#ff9100";
        } else {
          mult = 0.6;
          tag = " ■ ARMOR DEFLECT (-40%)";
          txtCol = "#b0bec5";
        }
      }

      if (p.itemId === "cryo") {
        tag = " ❄️ MUZLATILDI (-60%)";
        txtCol = "#00f0ff";
      }

      const finalDmg = Math.round(p.dmg * mult);

      if (targetType === "SHIELDED" && this.codexDummyShield > 0) {
        this.codexDummyShield = Math.max(0, this.codexDummyShield - finalDmg);
      } else {
        this.codexDummyHp = Math.max(0, this.codexDummyHp - finalDmg);
      }

      const now = Date.now();
      this.codexDmgHistory.push({ t: now, dmg: finalDmg });
      this.codexTotalDmg = (this.codexTotalDmg || 0) + finalDmg;

      this.codexDmgTexts.push({
        x: p.targetX + (Math.random() - 0.5) * 35,
        y: p.targetY - 15 + (Math.random() - 0.5) * 15,
        text: `-${finalDmg}${tag}`,
        color: txtCol,
        alpha: 1.0,
        scale: mult > 1.2 ? 1.25 : 1.0
      });

      for (let s = 0; s < 14; s++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 30 + Math.random() * 80;
        this.codexParticles.push({
          x: p.targetX,
          y: p.targetY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: 2 + Math.random() * 3,
          color: p.color,
          alpha: 1.0,
          life: 0.35 + Math.random() * 0.25
        });
      }
    }

    triggerCodexActionDemo() {
      this.codexRecoil = 1.0;
      this.vibrate([30, 25, 45]);
      const codexData = this.getCodexDatabase();
      const tab = this.codexTab || "TOWERS";
      const list = codexData[tab] || codexData.TOWERS;
      const activeItem = list.find(i => i.id === this.codexSelectedId) || list[0];

      if (typeof audio !== 'undefined' && audio) {
        if (tab === 'TOWERS') {
          if (activeItem.id === 'mortar') audio.mortarFire();
          else if (activeItem.id === 'cryo') audio.freeze();
          else if (activeItem.id === 'tesla') audio.tesla();
          else if (activeItem.id === 'flame') audio.flame();
          else if (activeItem.id === 'railgun') audio.railgun();
          else audio.laserShoot();
        } else if (tab === 'MECH') {
          if (activeItem.id === 'megatron') { audio.mortarFire(); audio.playSample('mortar_fire', 0.8); }
          else if (activeItem.id === 'siege') { audio.mortarFire(); }
          else audio.heroSlash();
        } else if (tab === 'BOSSES') {
          audio.bossRoar();
        } else {
          audio.hit();
        }
      }

      this.addFloatingText(`⚔️ ${activeItem.name.toUpperCase()} // JANG HARAKATI!`, 550, 180, activeItem.col || "#00e5ff", 18);
    }

    updateCodex(dt) {
      if (typeof document !== 'undefined') {
        const mh = document.getElementById('mech-hangar-canvas');
        if (mh && mh.style.display !== 'none') mh.style.display = 'none';
      }

      if (!this.codex3DEngine && typeof window !== 'undefined' && window.Codex3DEngine) {
        this.codex3DEngine = new window.Codex3DEngine();
        this.codex3DEngine.init();
      }
      if (this.codex3DEngine && this.codex3DEngine.active) {
        this.codex3DEngine.loadUnit(this.codexSelectedId, this.codexTab, this.codexBranch, this.codexRenderMode);
        this.codex3DEngine.update(dt, this.codexYaw !== undefined ? this.codexYaw : 0.25, this.codexPitch !== undefined ? this.codexPitch : 0.20, this.codexZoom || 1.0, this.codexRecoil || 0);
      }

      if (this.codexAutoRotate) {
        this.codexYaw = (this.codexYaw || 0) + dt * 0.75;
      } else if (!this.codexDragging && Math.abs(this.codexYawVel || 0) > 0.0002) {
        this.codexYaw = (this.codexYaw || 0) + this.codexYawVel * dt * 60;
        this.codexYawVel *= Math.pow(0.88, dt * 60);
      }
      if (this.codexRecoil > 0) {
        this.codexRecoil = Math.max(0, this.codexRecoil - dt * 4.5);
      }
      if (this.codexDummyFlash > 0) {
        this.codexDummyFlash = Math.max(0, this.codexDummyFlash - dt * 4.0);
      }

      if (this.codexSimActive) {
        this.codexSimTimer = (this.codexSimTimer || 0) + dt;
        const interval = this.getCodexFireInterval();
        if (this.codexSimTimer >= interval) {
          this.codexSimTimer = 0;
          this.fireCodexSimShot();
        }
      }

      if (this.codexDummyHp <= 0) {
        this.codexDummyHp = this.codexDummyMaxHp;
        this.codexDummyShield = this.codexDummyMaxShield;
        this.codexDummyFlash = 1.0;
      }

      if (this.codexProjectiles) {
        for (let i = this.codexProjectiles.length - 1; i >= 0; i--) {
          const p = this.codexProjectiles[i];
          p.progress += dt * p.speed;
          p.x = p.startX + (p.targetX - p.startX) * Math.min(1, p.progress);
          p.y = p.startY + (p.targetY - p.startY) * Math.min(1, p.progress) - (p.arc ? Math.sin(p.progress * Math.PI) * p.arc : 0);

          if (Math.random() < 0.6) {
            this.codexParticles.push({
              x: p.x + (Math.random() - 0.5) * 6,
              y: p.y + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 15,
              vy: (Math.random() - 0.5) * 15,
              r: 2.5,
              color: p.color,
              alpha: 0.85,
              life: 0.22
            });
          }

          if (p.progress >= 1.0) {
            this.onCodexProjectileHit(p);
            this.codexProjectiles.splice(i, 1);
          }
        }
      }

      if (this.codexParticles) {
        for (let i = this.codexParticles.length - 1; i >= 0; i--) {
          const pt = this.codexParticles[i];
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.alpha -= dt / (pt.life || 0.35);
          if (pt.alpha <= 0) this.codexParticles.splice(i, 1);
        }
      }

      if (this.codexDmgTexts) {
        for (let i = this.codexDmgTexts.length - 1; i >= 0; i--) {
          const txt = this.codexDmgTexts[i];
          txt.y -= dt * 32;
          txt.alpha -= dt * 0.9;
          if (txt.alpha <= 0) this.codexDmgTexts.splice(i, 1);
        }
      }

      const now = Date.now();
      if (this.codexDmgHistory) {
        this.codexDmgHistory = this.codexDmgHistory.filter(h => now - h.t < 3000);
      }
    }

    projectCodexPoint(x, y, z, yaw, pitch, scale, cx, cy) {
      const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
      const x1 = x * cyaw + z * syaw;
      const z1 = -x * syaw + z * cyaw;

      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const y2 = y * cp - z1 * sp;
      const z2 = y * sp + z1 * cp;

      const camDist = 420;
      const fov = camDist / (camDist + z2);
      return {
        x: cx + x1 * scale * fov,
        y: cy + y2 * scale * fov,
        z: z2,
        fov: fov
      };
    }

    drawCodex3DPoly(ctx, pts3D, yaw, pitch, scale, cx, cy, fillCol, strokeCol, lineWidth = 1.2, mode = "SHADED") {
      if (pts3D.length < 3) return;
      const pts2D = pts3D.map(p => this.projectCodexPoint(p[0], p[1], p[2], yaw, pitch, scale, cx, cy));

      const v1 = [pts3D[1][0] - pts3D[0][0], pts3D[1][1] - pts3D[0][1], pts3D[1][2] - pts3D[0][2]];
      const v2 = [pts3D[2][0] - pts3D[0][0], pts3D[2][1] - pts3D[0][1], pts3D[2][2] - pts3D[0][2]];
      const nx = v1[1] * v2[2] - v1[2] * v2[1];
      const ny = v1[2] * v2[0] - v1[0] * v2[2];
      const nz = v1[0] * v2[1] - v1[1] * v2[0];
      const len = Math.hypot(nx, ny, nz) || 1;
      const norm = [nx / len, ny / len, nz / len];

      ctx.beginPath();
      ctx.moveTo(pts2D[0].x, pts2D[0].y);
      for (let i = 1; i < pts2D.length; i++) {
        ctx.lineTo(pts2D[i].x, pts2D[i].y);
      }
      ctx.closePath();

      if (mode === "WIREFRAME") {
        ctx.strokeStyle = strokeCol || "#00e5ff";
        ctx.lineWidth = lineWidth || 1.2;
        ctx.stroke();
        return;
      }

      if (mode === "XRAY") {
        ctx.fillStyle = fillCol || "rgba(0, 229, 255, 0.18)";
        ctx.fill();
        ctx.strokeStyle = strokeCol || "rgba(0, 229, 255, 0.75)";
        ctx.lineWidth = lineWidth || 1.0;
        ctx.stroke();
        return;
      }

      const lDot = Math.max(0, -norm[0] * 0.4 - norm[1] * 0.7 + norm[2] * 0.5);
      const brightness = 0.35 + 0.65 * lDot;

      ctx.fillStyle = fillCol;
      ctx.fill();

      if (brightness < 0.6) {
        ctx.fillStyle = `rgba(0, 0, 0, ${(1.0 - brightness * 1.5) * 0.55})`;
        ctx.fill();
      } else if (brightness > 0.8) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(brightness - 0.8) * 0.65})`;
        ctx.fill();
      }

      if (strokeCol) {
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = lineWidth || 1.0;
        ctx.stroke();
      }
    }

    drawCodex3DBox(ctx, x, y, z, w, h, d, yaw, pitch, scale, cx, cy, fillCol, strokeCol, mode = "SHADED") {
      const hw = w / 2, hh = h / 2, hd = d / 2;
      const v = [
        [x - hw, y - hh, z - hd], [x + hw, y - hh, z - hd], [x + hw, y + hh, z - hd], [x - hw, y + hh, z - hd],
        [x - hw, y - hh, z + hd], [x + hw, y - hh, z + hd], [x + hw, y + hh, z + hd], [x - hw, y + hh, z + hd]
      ];
      const faces = [
        [v[0], v[1], v[2], v[3]],
        [v[5], v[4], v[7], v[6]],
        [v[4], v[0], v[3], v[7]],
        [v[1], v[5], v[6], v[2]],
        [v[4], v[5], v[1], v[0]],
        [v[3], v[2], v[6], v[7]]
      ];
      for (const f of faces) {
        this.drawCodex3DPoly(ctx, f, yaw, pitch, scale, cx, cy, fillCol, strokeCol, 1.2, mode);
      }
    }

    drawCodex3DCylinder(ctx, x, y, z, rTop, rBottom, height, segs, yaw, pitch, scale, cx, cy, fillCol, strokeCol, mode = "SHADED") {
      const hh = height / 2;
      const topPts = [], botPts = [];
      for (let i = 0; i < segs; i++) {
        const ang = (Math.PI * 2 / segs) * i;
        topPts.push([x + Math.cos(ang) * rTop, y - hh, z + Math.sin(ang) * rTop]);
        botPts.push([x + Math.cos(ang) * rBottom, y + hh, z + Math.sin(ang) * rBottom]);
      }
      for (let i = 0; i < segs; i++) {
        const next = (i + 1) % segs;
        this.drawCodex3DPoly(ctx, [topPts[i], topPts[next], botPts[next], botPts[i]], yaw, pitch, scale, cx, cy, fillCol, strokeCol, 1.0, mode);
      }
      this.drawCodex3DPoly(ctx, topPts, yaw, pitch, scale, cx, cy, fillCol, strokeCol, 1.2, mode);
      this.drawCodex3DPoly(ctx, botPts, yaw, pitch, scale, cx, cy, fillCol, strokeCol, 1.2, mode);
    }

    drawCodex3DHexPrism(ctx, x, y, z, radius, height, yaw, pitch, scale, cx, cy, fillCol, strokeCol, mode = "SHADED") {
      this.drawCodex3DCylinder(ctx, x, y, z, radius, radius, height, 6, yaw, pitch, scale, cx, cy, fillCol, strokeCol, mode);
    }

    drawCodex3DRing(ctx, x, y, z, radius, segs, yaw, pitch, scale, cx, cy, strokeCol, lineWidth = 1.5) {
      const pts = [];
      for (let i = 0; i < segs; i++) {
        const ang = (Math.PI * 2 / segs) * i;
        pts.push([x + Math.cos(ang) * radius, y, z + Math.sin(ang) * radius]);
      }
      const pts2D = pts.map(p => this.projectCodexPoint(p[0], p[1], p[2], yaw, pitch, scale, cx, cy));
      ctx.beginPath();
      ctx.moveTo(pts2D[0].x, pts2D[0].y);
      for (let i = 1; i < pts2D.length; i++) ctx.lineTo(pts2D[i].x, pts2D[i].y);
      ctx.closePath();
      ctx.strokeStyle = strokeCol || "#00e5ff";
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    drawCodex3DSphere(ctx, x, y, z, radius, yaw, pitch, scale, cx, cy, color, glow = true) {
      const p = this.projectCodexPoint(x, y, z, yaw, pitch, scale, cx, cy);
      const r2D = radius * scale * p.fov;
      ctx.save();
      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;
      }
      const grad = ctx.createRadialGradient(p.x - r2D * 0.3, p.y - r2D * 0.3, r2D * 0.1, p.x, p.y, r2D);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.4, color);
      grad.addColorStop(1, "rgba(5, 10, 20, 0.8)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r2D, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawCodex3DUnit(ctx, item, tab, t, yaw, pitch, scale, cx, cy, mode, branch, recoil) {
      const rec = (recoil || 0) * 12;

      if (tab === "TOWERS") {
        this.drawCodex3DHexPrism(ctx, 0, 36, 0, 38, 14, yaw, pitch, scale, cx, cy, "#1a233a", "#00e5ff", mode);
        this.drawCodex3DHexPrism(ctx, 0, 24, 0, 32, 10, yaw, pitch, scale, cx, cy, "#111827", item.col || "#00e5ff", mode);
        this.drawCodex3DCylinder(ctx, 0, 12, 0, 16, 18, 14, 8, yaw, pitch, scale, cx, cy, "#1e293b", "#334155", mode);

        if (item.id === "pulse") {
          this.drawCodex3DBox(ctx, 0, -2, -rec, 24, 16, 26, yaw, pitch, scale, cx, cy, "#1e293b", "#00e5ff", mode);

          if (branch === "BRANCH_A") {
            this.drawCodex3DBox(ctx, -10, -4, 18 - rec, 4, 10, 24, yaw, pitch, scale, cx, cy, "#0f172a", "#b388ff", mode);
            this.drawCodex3DBox(ctx, 10, -4, 18 - rec, 4, 10, 24, yaw, pitch, scale, cx, cy, "#0f172a", "#b388ff", mode);
            this.drawCodex3DSphere(ctx, 0, -4, 18 - rec, 10 + Math.sin(t * 8) * 2, yaw, pitch, scale, cx, cy, "#b388ff", true);
          } else if (branch === "BRANCH_B") {
            const spin = t * 15;
            for (let b = 0; b < 4; b++) {
              const ang = spin + (Math.PI / 2) * b;
              const bx = Math.cos(ang) * 8;
              const by = -2 + Math.sin(ang) * 8;
              this.drawCodex3DCylinder(ctx, bx, by, 20 - rec, 3, 3, 30, 6, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
            }
            this.drawCodex3DCylinder(ctx, 0, -2, 20 - rec, 6, 6, 26, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
          } else {
            this.drawCodex3DCylinder(ctx, -7, -2, 18 - rec, 3.5, 3.5, 26, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
            this.drawCodex3DCylinder(ctx, 7, -2, 18 - rec, 3.5, 3.5, 26, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
            this.drawCodex3DRing(ctx, -7, -2, 31 - rec, 5, 8, yaw, pitch, scale, cx, cy, "#00e5ff", 2);
            this.drawCodex3DRing(ctx, 7, -2, 31 - rec, 5, 8, yaw, pitch, scale, cx, cy, "#00e5ff", 2);
          }
        } else if (item.id === "mortar") {
          for (let l = 0; l < 4; l++) {
            const lang = (Math.PI / 2) * l + Math.PI / 4;
            const lx = Math.cos(lang) * 36;
            const lz = Math.sin(lang) * 36;
            this.drawCodex3DBox(ctx, lx, 32, lz, 10, 8, 12, yaw, pitch, scale, cx, cy, "#0f172a", "#ff9100", mode);
          }
          this.drawCodex3DSphere(ctx, 0, 4, 0, 14, yaw, pitch, scale, cx, cy, "#334155", false);
          this.drawCodex3DCylinder(ctx, 0, -12, 10 - rec, 12, 14, 34, 8, yaw, pitch, scale, cx, cy, "#1e293b", "#ff9100", mode);
          this.drawCodex3DCylinder(ctx, 0, -28, 22 - rec, 15, 15, 8, 8, yaw, pitch, scale, cx, cy, "#ff9100", "#ffffff", mode);

          if (branch === "BRANCH_A") {
            this.drawCodex3DBox(ctx, -18, -10, 8 - rec, 8, 14, 16, yaw, pitch, scale, cx, cy, "#ff1744", "#ffd600", mode);
            this.drawCodex3DBox(ctx, 18, -10, 8 - rec, 8, 14, 16, yaw, pitch, scale, cx, cy, "#ff1744", "#ffd600", mode);
          } else if (branch === "BRANCH_B") {
            this.drawCodex3DCylinder(ctx, -14, 0, -12, 6, 6, 20, 6, yaw, pitch, scale, cx, cy, "#ff3d00", "#ff9100", mode);
            this.drawCodex3DCylinder(ctx, 14, 0, -12, 6, 6, 20, 6, yaw, pitch, scale, cx, cy, "#ff3d00", "#ff9100", mode);
          }
        } else if (item.id === "cryo") {
          this.drawCodex3DCylinder(ctx, 0, 2, 0, 8, 12, 16, 6, yaw, pitch, scale, cx, cy, "#0e7490", "#00f0ff", mode);
          this.drawCodex3DCylinder(ctx, 0, -16, 8, 22, 6, 16, 8, yaw, pitch, scale, cx, cy, "rgba(0, 240, 255, 0.25)", "#00f0ff", mode);
          this.drawCodex3DSphere(ctx, 0, -18, 10, 7, yaw, pitch, scale, cx, cy, "#e0f7fa", true);

          for (let s = 0; s < 3; s++) {
            const sang = t * 2.2 + (Math.PI * 2 / 3) * s;
            const sx = Math.cos(sang) * 26;
            const sz = 8 + Math.sin(sang) * 26;
            this.drawCodex3DHexPrism(ctx, sx, -16, sz, 4, 8, yaw, pitch, scale, cx, cy, "#00f0ff", "#ffffff", mode);
          }

          if (branch === "BRANCH_A") {
            this.drawCodex3DCylinder(ctx, 0, -32, 14, 1, 9, 24, 4, yaw, pitch, scale, cx, cy, "#00f0ff", "#ffffff", mode);
          } else if (branch === "BRANCH_B") {
            this.drawCodex3DRing(ctx, 0, -8, 0, 32, 12, yaw, pitch, scale, cx, cy, "#00f0ff", 2.5);
          }
        } else if (item.id === "tesla") {
          this.drawCodex3DCylinder(ctx, 0, 16, 0, 18, 20, 8, 8, yaw, pitch, scale, cx, cy, "#1e293b", "#ffd600", mode);
          this.drawCodex3DCylinder(ctx, 0, 6, 0, 14, 16, 8, 8, yaw, pitch, scale, cx, cy, "#334155", "#ffd600", mode);
          this.drawCodex3DCylinder(ctx, 0, -4, 0, 10, 12, 8, 8, yaw, pitch, scale, cx, cy, "#1e293b", "#ffd600", mode);
          this.drawCodex3DCylinder(ctx, 0, -18, 0, 6, 6, 22, 6, yaw, pitch, scale, cx, cy, "#b45309", "#ffd600", mode);
          this.drawCodex3DRing(ctx, 0, -28, 0, 24, 16, yaw, pitch, scale, cx, cy, "#ffd600", 4);
          this.drawCodex3DRing(ctx, 0, -28, 0, 20, 12, yaw, pitch, scale, cx, cy, "#ffffff", 2);
          this.drawCodex3DSphere(ctx, 0, -28, 0, 8, yaw, pitch, scale, cx, cy, "#ffd600", true);

          const arcAng = t * 6;
          const ax = Math.cos(arcAng) * 20;
          const az = Math.sin(arcAng) * 20;
          const midX = ax * 0.5 + (Math.random() - 0.5) * 8;
          const midZ = az * 0.5 + (Math.random() - 0.5) * 8;
          const p1 = this.projectCodexPoint(0, -28, 0, yaw, pitch, scale, cx, cy);
          const p2 = this.projectCodexPoint(midX, -28 + (Math.random() - 0.5) * 6, midZ, yaw, pitch, scale, cx, cy);
          const p3 = this.projectCodexPoint(ax, -28, az, yaw, pitch, scale, cx, cy);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
          ctx.stroke();

          if (branch === "BRANCH_A") {
            this.drawCodex3DCylinder(ctx, -22, -6, 0, 4, 5, 24, 6, yaw, pitch, scale, cx, cy, "#ffd600", "#00e5ff", mode);
            this.drawCodex3DCylinder(ctx, 22, -6, 0, 4, 5, 24, 6, yaw, pitch, scale, cx, cy, "#ffd600", "#00e5ff", mode);
          } else if (branch === "BRANCH_B") {
            for (let k = 0; k < 6; k++) {
              const kang = (Math.PI / 3) * k;
              const kx = Math.cos(kang) * 22;
              const kz = Math.sin(kang) * 22;
              this.drawCodex3DBox(ctx, kx, -36, kz, 3, 12, 3, yaw, pitch, scale, cx, cy, "#ffd600", "#ffffff", mode);
            }
          }
        } else if (item.id === "flame") {
          this.drawCodex3DBox(ctx, 0, 0, -rec, 24, 18, 22, yaw, pitch, scale, cx, cy, "#1c1917", "#ff3d00", mode);
          this.drawCodex3DCylinder(ctx, -7, 0, 18 - rec, 5, 5, 22, 6, yaw, pitch, scale, cx, cy, "#44403c", "#ff3d00", mode);
          this.drawCodex3DCylinder(ctx, 7, 0, 18 - rec, 5, 5, 22, 6, yaw, pitch, scale, cx, cy, "#44403c", "#ff3d00", mode);
          this.drawCodex3DCylinder(ctx, -10, -4, -14, 6, 6, 24, 6, yaw, pitch, scale, cx, cy, "#ff3d00", "#ffd600", mode);
          this.drawCodex3DCylinder(ctx, 10, -4, -14, 6, 6, 24, 6, yaw, pitch, scale, cx, cy, "#ff3d00", "#ffd600", mode);

          if (branch === "BRANCH_A") {
            this.drawCodex3DCylinder(ctx, 0, -18, -12, 9, 9, 16, 6, yaw, pitch, scale, cx, cy, "#65a30d", "#ffd600", mode);
          } else if (branch === "BRANCH_B") {
            this.drawCodex3DRing(ctx, -7, 0, 22 - rec, 7, 8, yaw, pitch, scale, cx, cy, "#ffedd5", 2);
            this.drawCodex3DRing(ctx, 7, 0, 22 - rec, 7, 8, yaw, pitch, scale, cx, cy, "#ffedd5", 2);
          }
        } else if (item.id === "railgun") {
          this.drawCodex3DBox(ctx, 0, 4, 0, 22, 14, 28, yaw, pitch, scale, cx, cy, "#0f172a", "#ff007f", mode);
          const rLen = branch === "BRANCH_A" ? 70 : 54;
          this.drawCodex3DBox(ctx, -5, -4, 26 - rec, 3, 4, rLen, yaw, pitch, scale, cx, cy, "#0284c7", "#ff007f", mode);
          this.drawCodex3DBox(ctx, 5, -4, 26 - rec, 3, 4, rLen, yaw, pitch, scale, cx, cy, "#0284c7", "#ff007f", mode);
          for (let c = 0; c < 5; c++) {
            const cz = 6 + c * 10 - rec;
            const isPulse = Math.floor(t * 8) % 5 === c;
            this.drawCodex3DBox(ctx, 0, -4, cz, 18, 12, 4, yaw, pitch, scale, cx, cy, isPulse ? "#ff007f" : "#1e293b", "#00e5ff", mode);
          }
          if (branch === "BRANCH_B") {
            this.drawCodex3DRing(ctx, 0, -4, 48 - rec, 12, 8, yaw, pitch, scale, cx, cy, "#e040fb", 2.5);
          }
        } else if (item.id === "beacon") {
          this.drawCodex3DCylinder(ctx, 0, 2, 0, 8, 14, 20, 6, yaw, pitch, scale, cx, cy, "#1e293b", "#76ff03", mode);
          this.drawCodex3DBox(ctx, 0, -22, 0, 6, 26, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#76ff03", mode);
          const dishAng = t * 2.5;
          const dx1 = Math.cos(dishAng) * 26;
          const dz1 = Math.sin(dishAng) * 26;
          this.drawCodex3DBox(ctx, dx1 * 0.4, -36, dz1 * 0.4, 28, 12, 4, yaw + dishAng, pitch, scale, cx, cy, "#166534", "#76ff03", mode);
          this.drawCodex3DSphere(ctx, 0, -44, 0, 5, yaw, pitch, scale, cx, cy, "#76ff03", true);

          if (branch === "BRANCH_A") {
            this.drawCodex3DRing(ctx, 0, -36, 0, 36, 12, yaw, pitch, scale, cx, cy, "#76ff03", 2);
          } else if (branch === "BRANCH_B") {
            for (let j = 0; j < 4; j++) {
              const jang = (Math.PI / 2) * j;
              this.drawCodex3DBox(ctx, Math.cos(jang) * 20, -26, Math.sin(jang) * 20, 3, 16, 3, yaw, pitch, scale, cx, cy, "#ffd600", "#76ff03", mode);
            }
          }
        } else if (item.id === "barricade") {
          this.drawCodex3DBox(ctx, -26, 8, 0, 14, 38, 16, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 26, 8, 0, 14, 38, 16, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 0, 8, 0, 42, 28, 6, yaw, pitch, scale, cx, cy, "rgba(255, 214, 0, 0.25)", "#ffd600", mode);

          if (branch === "BRANCH_A") {
            this.drawCodex3DBox(ctx, 0, 8, 5, 38, 22, 6, yaw, pitch, scale, cx, cy, "#334155", "#cbd5e1", mode);
          } else if (branch === "BRANCH_B") {
            for (let s = -16; s <= 16; s += 8) {
              this.drawCodex3DCylinder(ctx, s, 8, 12, 1, 3, 14, 4, yaw, pitch, scale, cx, cy, "#ffd600", "#ffffff", mode);
            }
          }
        }
      } else if (tab === "ENEMIES") {
        if (item.id === "grunt") {
          // Cyborg Mercenary Infantry Trooper in 3D
          const walkG = Math.sin(t * 6);
          // Torso with Plate Carrier Vest
          this.drawCodex3DBox(ctx, 0, -2, 0, 20, 24, 14, yaw, pitch, scale, cx, cy, "#1e293b", "#00e5ff", mode);
          this.drawCodex3DBox(ctx, 0, -2, 7, 16, 18, 4, yaw, pitch, scale, cx, cy, "#334155", "#00e5ff", mode);
          // Tactical Helmet with Night-Vision Visor
          this.drawCodex3DBox(ctx, 0, -20, 2, 13, 13, 14, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
          this.drawCodex3DBox(ctx, 0, -20, 9, 11, 4, 3, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
          // Two-Handed Assault Carbine
          this.drawCodex3DBox(ctx, 14, 0, 8 - rec, 5, 14, 6, yaw, pitch, scale, cx, cy, "#334155", "#00e5ff", mode);
          this.drawCodex3DBox(ctx, 14, -2, 20 - rec, 4, 4, 22, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
          this.drawCodex3DBox(ctx, 14, -6, 16 - rec, 3, 4, 4, yaw, pitch, scale, cx, cy, "#ffd600", "#ffffff", mode);
          // Articulated Running Legs (Thighs & Boots)
          this.drawCodex3DBox(ctx, -7, 20, walkG * 8, 7, 20, 8, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
          this.drawCodex3DBox(ctx, 7, 20, -walkG * 8, 7, 20, 8, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
        } else if (item.id === "sprinter") {
          // Quadruped Predatory Cyber-Hound in 3D
          const gallop = Math.sin(t * 8);
          // Aerodynamic Carbon-Fiber Body Chassis
          this.drawCodex3DBox(ctx, 0, -2, 0, 16, 14, 38, yaw, pitch, scale, cx, cy, "#1e293b", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 0, -10, -4, 12, 6, 26, yaw, pitch, scale, cx, cy, "#451a03", "#ffd600", mode);
          // Predatory Skull Head with Crimson Visor
          this.drawCodex3DBox(ctx, 0, -6, 22, 12, 10, 14, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 0, -7, 29, 9, 3, 2, yaw, pitch, scale, cx, cy, "#ff1744", "#ffffff", mode);
          // 4 Articulated Galloping Legs
          this.drawCodex3DBox(ctx, -11, 12, 12 + gallop * 8, 5, 18, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 11, 12, 12 - gallop * 8, 5, 18, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          this.drawCodex3DBox(ctx, -12, 12, -14 - gallop * 8, 6, 18, 7, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 12, 12, -14 + gallop * 8, 6, 18, 7, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          // Twin Dorsal Afterburner Thrusters with Fire
          this.drawCodex3DCylinder(ctx, -5, -4, -22, 3, 4, 8, 6, yaw, pitch, scale, cx, cy, "#ff9100", "#ffd600", mode);
          this.drawCodex3DCylinder(ctx, 5, -4, -22, 3, 4, 8, 6, yaw, pitch, scale, cx, cy, "#ff9100", "#ffd600", mode);
          this.drawCodex3DSphere(ctx, 0, -4, -26, 4 + Math.sin(t * 12) * 1.5, yaw, pitch, scale, cx, cy, "#ff9100", true);
        } else if (item.id === "brute") {
          // Goliath 3.5m Heavy War-Mech in 3D
          const stompG = Math.sin(t * 4);
          // Massive Sloped Glacis Torso
          this.drawCodex3DBox(ctx, 0, -6, 0, 36, 32, 26, yaw, pitch, scale, cx, cy, "#334155", "#ff007f", mode);
          this.drawCodex3DBox(ctx, 0, -8, 13, 28, 22, 4, yaw, pitch, scale, cx, cy, "#ffd600", "#000000", mode);
          // Twin Vertical Exhaust Smokestacks
          this.drawCodex3DCylinder(ctx, -12, -26, -10, 4, 4, 16, 6, yaw, pitch, scale, cx, cy, "#475569", "#ff3d00", mode);
          this.drawCodex3DCylinder(ctx, 12, -26, -10, 4, 4, 16, 6, yaw, pitch, scale, cx, cy, "#475569", "#ff3d00", mode);
          // Massive Shoulder Pauldrons & Ram Arms
          this.drawCodex3DBox(ctx, -24, -12, 2, 18, 20, 20, yaw, pitch, scale, cx, cy, "#1e293b", "#ff007f", mode);
          this.drawCodex3DBox(ctx, 24, -12, 2, 18, 20, 20, yaw, pitch, scale, cx, cy, "#1e293b", "#ff007f", mode);
          this.drawCodex3DBox(ctx, -24, 12, 12, 14, 16, 16, yaw, pitch, scale, cx, cy, "#0f172a", "#ff007f", mode);
          this.drawCodex3DBox(ctx, 24, 12, 12, 14, 16, 16, yaw, pitch, scale, cx, cy, "#0f172a", "#ff007f", mode);
          // Heavy Hydraulic Stomping Legs
          this.drawCodex3DBox(ctx, -12, 26, stompG * 6, 12, 22, 14, yaw, pitch, scale, cx, cy, "#0f172a", "#ff007f", mode);
          this.drawCodex3DBox(ctx, 12, 26, -stompG * 6, 12, 22, 14, yaw, pitch, scale, cx, cy, "#0f172a", "#ff007f", mode);
          this.drawCodex3DSphere(ctx, 0, -4, 15, 6, yaw, pitch, scale, cx, cy, "#ff1744", true);
        } else if (item.id === "shieldbearer") {
          // Crusader Android with Hex Pavise Shield in 3D
          this.drawCodex3DBox(ctx, 0, 0, 0, 20, 26, 16, yaw, pitch, scale, cx, cy, "#1e293b", "#00b0ff", mode);
          this.drawCodex3DBox(ctx, 0, -18, 2, 12, 12, 12, yaw, pitch, scale, cx, cy, "#0f172a", "#00b0ff", mode);
          this.drawCodex3DSphere(ctx, 0, 0, 8, 6, yaw, pitch, scale, cx, cy, "#00e5ff", true);
          // Massive Curved Hexagonal Pavise Tower Shield in Front
          this.drawCodex3DBox(ctx, 0, 0, 22, 34, 38, 4, yaw, pitch, scale, cx, cy, "rgba(0, 176, 255, 0.4)", "#00e5ff", mode);
          this.drawCodex3DRing(ctx, 0, 0, 24, 14, 6, yaw, pitch, scale, cx, cy, "#ffffff", 2);
          for (let s = 0; s < 3; s++) {
            const sang = t * 1.8 + (Math.PI * 2 / 3) * s;
            const sx = Math.cos(sang) * 28;
            const sz = Math.sin(sang) * 28;
            this.drawCodex3DBox(ctx, sx, 0, sz, 4, 26, 14, yaw + sang, pitch, scale, cx, cy, "rgba(0, 176, 255, 0.3)", "#00e5ff", mode);
          }
        } else if (item.id === "medic") {
          // Nanite Medical Drone with 4 Tilting Thrusters in 3D
          this.drawCodex3DBox(ctx, 0, 0, 0, 28, 10, 14, yaw, pitch, scale, cx, cy, "#0f172a", "#00e676", mode);
          this.drawCodex3DBox(ctx, 0, 0, 0, 14, 10, 28, yaw, pitch, scale, cx, cy, "#0f172a", "#00e676", mode);
          this.drawCodex3DSphere(ctx, 0, -8, 0, 8, yaw, pitch, scale, cx, cy, "#00e676", true);
          // 4 Ducted-Fan Micro Thruster Nacelles
          this.drawCodex3DCylinder(ctx, -18, -4, -18, 5, 5, 8, 6, yaw, pitch, scale, cx, cy, "#334155", "#69f0ae", mode);
          this.drawCodex3DCylinder(ctx, 18, -4, -18, 5, 5, 8, 6, yaw, pitch, scale, cx, cy, "#334155", "#69f0ae", mode);
          this.drawCodex3DCylinder(ctx, -18, -4, 18, 5, 5, 8, 6, yaw, pitch, scale, cx, cy, "#334155", "#69f0ae", mode);
          this.drawCodex3DCylinder(ctx, 18, -4, 18, 5, 5, 8, 6, yaw, pitch, scale, cx, cy, "#334155", "#69f0ae", mode);
          // Orbiting Nanite Spheres
          for (let n = 0; n < 4; n++) {
            const na = t * 2.5 + (Math.PI / 2) * n;
            this.drawCodex3DSphere(ctx, Math.cos(na) * 26, -4, Math.sin(na) * 26, 3.5, yaw, pitch, scale, cx, cy, "#69f0ae", true);
          }
        } else if (item.id === "splitter") {
          // Living Bio-Cyber Abomination with Breathing Carapace
          const ribPulse = Math.sin(t * 4) * 3;
          this.drawCodex3DSphere(ctx, 0, 0, 0, 13 + Math.sin(t * 8) * 2, yaw, pitch, scale, cx, cy, "#f43f5e", true);
          for (let p = 0; p < 4; p++) {
            const pang = (Math.PI / 2) * p + Math.sin(t * 3) * 0.2;
            const px = Math.cos(pang) * (20 + ribPulse);
            const pz = Math.sin(pang) * (20 + ribPulse);
            this.drawCodex3DBox(ctx, px, 0, pz, 6, 26, 14, yaw + pang, pitch, scale, cx, cy, "#2e1065", "#e040fb", mode);
          }
        } else if (item.id === "phantom") {
          // Cloaked Assassin with Vibro-Daggers & Chromatic Dispersion
          const tRot = t * 1.5;
          this.drawCodex3DBox(ctx, 0, -2, 0, 18, 26, 14, yaw, pitch, scale, cx, cy, "rgba(109, 40, 217, 0.4)", "#b388ff", mode);
          this.drawCodex3DBox(ctx, 0, -18, 2, 11, 11, 12, yaw, pitch, scale, cx, cy, "#0f172a", "#b388ff", mode);
          // Dual Glowing Vibro-Daggers
          this.drawCodex3DBox(ctx, -14, 0, 14, 2.5, 4, 22, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
          this.drawCodex3DBox(ctx, 14, 0, 14, 2.5, 4, 22, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
          this.drawCodex3DBox(ctx, 0, 0, 0, 28, 28, 28, yaw + tRot, pitch + tRot * 0.5, scale, cx, cy, "rgba(179, 136, 255, 0.2)", "#b388ff", "WIREFRAME");
          this.drawCodex3DBox(ctx, 0, 0, 0, 42, 42, 42, yaw - tRot * 0.7, pitch, scale, cx, cy, "rgba(0, 229, 255, 0.15)", "#ffffff", "WIREFRAME");
        } else if (item.id === "kamikaze_drone") {
          // Skittering Spider Drone with Flashing Detonator
          this.drawCodex3DSphere(ctx, 0, -2, 0, 15, yaw, pitch, scale, cx, cy, "#1e293b", false);
          const blink = Math.sin(t * 14) > 0 ? "#ffffff" : "#ff1744";
          this.drawCodex3DSphere(ctx, 0, -2, 14, 5, yaw, pitch, scale, cx, cy, blink, true);
          // 4 Articulated Skittering Spider Legs
          const sWalk = Math.sin(t * 12) * 5;
          this.drawCodex3DBox(ctx, -16, 8, 12 + sWalk, 4, 16, 4, yaw, pitch, scale, cx, cy, "#ff3d00", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 16, 8, 12 - sWalk, 4, 16, 4, yaw, pitch, scale, cx, cy, "#ff3d00", "#ffd600", mode);
          this.drawCodex3DBox(ctx, -16, 8, -12 - sWalk, 4, 16, 4, yaw, pitch, scale, cx, cy, "#ff3d00", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 16, 8, -12 + sWalk, 4, 16, 4, yaw, pitch, scale, cx, cy, "#ff3d00", "#ffd600", mode);
        } else if (item.id === "gunship") {
          // VTOL Heavy Aerial Gunship with Tilting Nacelles
          this.drawCodex3DBox(ctx, 0, 0, 0, 22, 16, 44, yaw, pitch, scale, cx, cy, "#1e293b", "#ff5252", mode);
          this.drawCodex3DBox(ctx, 0, -7, 14, 15, 8, 18, yaw, pitch, scale, cx, cy, "#0284c7", "#38bdf8", mode);
          // Swept Wings & Tilt-Rotor Nacelles
          this.drawCodex3DBox(ctx, 0, 0, -2, 58, 4, 12, yaw, pitch, scale, cx, cy, "#334155", "#ff5252", mode);
          this.drawCodex3DCylinder(ctx, -30, -2, -2, 7, 7, 16, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
          this.drawCodex3DCylinder(ctx, 30, -2, -2, 7, 7, 16, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
          // Spinning 3-Blade Rotors
          const rotG = t * 25;
          this.drawCodex3DRing(ctx, -30, -12, -2, 16, 8, yaw + rotG, pitch, scale, cx, cy, "#00e5ff", 2);
          this.drawCodex3DRing(ctx, 30, -12, -2, 16, 8, yaw - rotG, pitch, scale, cx, cy, "#00e5ff", 2);
          // Chin Autocannon Turret
          this.drawCodex3DCylinder(ctx, 0, 8, 22, 3, 3, 14, 6, yaw, pitch, scale, cx, cy, "#ffd600", "#ffffff", mode);
        }
      } else if (tab === "BOSSES") {
        if (item.id === "juggernaut") {
          // BOSS 1: Colossus MK-IV Siege Fortress
          this.drawCodex3DBox(ctx, 0, 0, 0, 52, 36, 44, yaw, pitch, scale, cx, cy, "#1e293b", "#ff1744", mode);
          this.drawCodex3DBox(ctx, -30, 8, 0, 14, 20, 54, yaw, pitch, scale, cx, cy, "#090d16", "#ff1744", mode);
          this.drawCodex3DBox(ctx, 30, 8, 0, 14, 20, 54, yaw, pitch, scale, cx, cy, "#090d16", "#ff1744", mode);
          this.drawCodex3DCylinder(ctx, 0, -20, 4, 18, 20, 12, 8, yaw, pitch, scale, cx, cy, "#0f172a", "#ff1744", mode);
          this.drawCodex3DCylinder(ctx, -14, -20, 26 - rec, 5.5, 5.5, 38, 6, yaw, pitch, scale, cx, cy, "#334155", "#ffd600", mode);
          this.drawCodex3DCylinder(ctx, 14, -20, 26 - rec, 5.5, 5.5, 38, 6, yaw, pitch, scale, cx, cy, "#334155", "#ffd600", mode);
          this.drawCodex3DSphere(ctx, 0, -4, 22, 9, yaw, pitch, scale, cx, cy, "#ff1744", true);
        } else if (item.id === "overseer") {
          // BOSS 2: Eye of Chronos Singularity
          this.drawCodex3DSphere(ctx, 0, 0, 0, 24, yaw, pitch, scale, cx, cy, "#0f172a", true);
          this.drawCodex3DSphere(ctx, 0, 0, 18, 10, yaw, pitch, scale, cx, cy, "#e040fb", true);
          this.drawCodex3DRing(ctx, 0, 0, 0, 44, 16, yaw + t * 2, pitch, scale, cx, cy, "#e040fb", 3);
          this.drawCodex3DRing(ctx, 0, 0, 0, 54, 16, yaw, pitch + t * 2, scale, cx, cy, "#ffd600", 2.5);
          this.drawCodex3DRing(ctx, 0, 0, 0, 62, 16, yaw - t * 1.5, pitch - t * 1.5, scale, cx, cy, "#00e5ff", 2);
        } else if (item.id === "hive_titan") {
          // BOSS 3: Leviathan Core Bio-Centipede
          for (let s = 0; s < 4; s++) {
            const und = Math.sin(t * 3 + s * 0.8) * 5;
            this.drawCodex3DBox(ctx, 0, -6 + und, -s * 18, 38 - s * 3, 24 - s * 2, 18, yaw, pitch, scale, cx, cy, s % 2 === 0 ? "#422006" : "#78350f", "#ffd600", mode);
          }
          this.drawCodex3DSphere(ctx, 0, -2, 14, 18, yaw, pitch, scale, cx, cy, "rgba(255, 214, 0, 0.45)", true);
          for (let l = 0; l < 6; l++) {
            const side = l < 3 ? -1 : 1;
            const lIdx = l % 3;
            const lz = -24 + lIdx * 20;
            const legSwing = Math.sin(t * 6 + l) * 6;
            this.drawCodex3DBox(ctx, side * 34, 12 + legSwing, lz, 22, 6, 6, yaw, pitch, scale, cx, cy, "#78350f", "#ffd600", mode);
          }
        } else if (item.id === "void_titan") {
          // BOSS 4: Gravitational Singularity Core
          this.drawCodex3DSphere(ctx, 0, 0, 0, 24, yaw, pitch, scale, cx, cy, "#000000", true);
          this.drawCodex3DRing(ctx, 0, 0, 0, 46, 16, yaw + t * 3, pitch + 0.4, scale, cx, cy, "#7c4dff", 4);
          this.drawCodex3DRing(ctx, 0, 0, 0, 58, 16, yaw - t * 2, pitch - 0.3, scale, cx, cy, "#c084fc", 2.5);
          for (let a = 0; a < 4; a++) {
            const ang = t * 2 + (Math.PI / 2) * a;
            this.drawCodex3DSphere(ctx, Math.cos(ang) * 44, Math.sin(ang) * 16, Math.sin(ang) * 44, 4, yaw, pitch, scale, cx, cy, "#e040fb", true);
          }
        } else if (item.id === "chrono_phantom") {
          // BOSS 5: Chrono Phantom Temporal Clockwork
          this.drawCodex3DHexPrism(ctx, 0, 0, 0, 20, 38, yaw, pitch, scale, cx, cy, "rgba(0, 229, 255, 0.35)", "#00e5ff", mode);
          this.drawCodex3DRing(ctx, 0, 0, 0, 38, 12, yaw + t * 1.5, pitch, scale, cx, cy, "#00e5ff", 2.2);
          this.drawCodex3DRing(ctx, 0, 0, 0, 48, 12, yaw - t * 1.2, pitch, scale, cx, cy, "#ffffff", 1.8);
          this.drawCodex3DSphere(ctx, 0, 0, 0, 8, yaw, pitch, scale, cx, cy, "#00e5ff", true);
        } else if (item.id === "mecha_colossus") {
          // BOSS 6: Apex Mecha Colossus War Dreadnought
          this.drawCodex3DBox(ctx, 0, -10, 0, 48, 36, 32, yaw, pitch, scale, cx, cy, "#1e293b", "#ff9100", mode);
          this.drawCodex3DBox(ctx, 0, -32, 4, 20, 16, 20, yaw, pitch, scale, cx, cy, "#0f172a", "#ff9100", mode);
          this.drawCodex3DBox(ctx, 34, -4, 18, 14, 16, 48, yaw, pitch, scale, cx, cy, "#0f172a", "#ff9100", mode);
          this.drawCodex3DCylinder(ctx, -34, -4, 16, 11, 11, 38, 6, yaw, pitch, scale, cx, cy, "#334155", "#ffd600", mode);
          this.drawCodex3DSphere(ctx, 0, -8, 16, 8, yaw, pitch, scale, cx, cy, "#ffd600", true);
        }
      } else if (tab === "MECH") {
        if (item.id === "megatron") {
          // Megatron (WFC 3D) - Cybertronian Supreme Warlord
          const walkMech = Math.sin(t * 4);
          // Dark Gunmetal Torso with Energon Conduits
          this.drawCodex3DBox(ctx, 0, -4, 0, 32, 28, 24, yaw, pitch, scale, cx, cy, "#334155", "#a855f7", mode);
          this.drawCodex3DSphere(ctx, 0, -4, 12, 8, yaw, pitch, scale, cx, cy, "#a855f7", true);
          // Bucket Crested Helmet & Crimson Optics
          this.drawCodex3DBox(ctx, 0, -24, 2, 16, 16, 16, yaw, pitch, scale, cx, cy, "#1e293b", "#a855f7", mode);
          this.drawCodex3DBox(ctx, 0, -23, 11, 12, 4, 3, yaw, pitch, scale, cx, cy, "#ff0055", "#ffffff", mode);
          // Right Arm: Iconic 1450 Fusion Cannon with Dark Energon Corona & Recoil Slide
          this.drawCodex3DBox(ctx, 22, -2, 8 - rec, 11, 13, 16, yaw, pitch, scale, cx, cy, "#334155", "#a855f7", mode);
          this.drawCodex3DCylinder(ctx, 24, -4, 20 - rec, 7.5, 8.5, 46, 8, yaw, pitch, scale, cx, cy, "#0f172a", "#a855f7", mode);
          this.drawCodex3DSphere(ctx, 24, -4, 43 - rec, 8.5, yaw, pitch, scale, cx, cy, "#a855f7", true);
          // Left Arm: Clawed Gauntlet
          this.drawCodex3DBox(ctx, -22, -2, 6, 10, 14, 14, yaw, pitch, scale, cx, cy, "#334155", "#475569", mode);
          // Tank Tread Calf Guarded Legs
          this.drawCodex3DBox(ctx, -12, 24, walkMech * 7, 11, 26, 14, yaw, pitch, scale, cx, cy, "#1e293b", "#a855f7", mode);
          this.drawCodex3DBox(ctx, 12, 24, -walkMech * 7, 11, 26, 14, yaw, pitch, scale, cx, cy, "#1e293b", "#a855f7", mode);
        } else if (item.id === "optimus") {
          // Optimus Prime (Autobot Supreme Commander)
          const walkMech = Math.sin(t * 4.5);
          // Red Peterbilt Windshield Torso
          this.drawCodex3DBox(ctx, 0, -4, 0, 30, 26, 22, yaw, pitch, scale, cx, cy, "#b91c1c", "#60a5fa", mode);
          this.drawCodex3DBox(ctx, -8, -6, 11, 9, 8, 2, yaw, pitch, scale, cx, cy, "#0284c7", "#ffffff", mode);
          this.drawCodex3DBox(ctx, 8, -6, 11, 9, 8, 2, yaw, pitch, scale, cx, cy, "#0284c7", "#ffffff", mode);
          // Glowing Matrix of Leadership Chamber
          this.drawCodex3DSphere(ctx, 0, -4, 11, 7, yaw, pitch, scale, cx, cy, "#93c5fd", true);
          // Battle Mask Head with Side Antennas
          this.drawCodex3DBox(ctx, 0, -22, 2, 15, 14, 16, yaw, pitch, scale, cx, cy, "#1d4ed8", "#60a5fa", mode);
          this.drawCodex3DBox(ctx, 0, -21, 11, 11, 3.5, 2.5, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
          // Dual Chrome Smokestacks on Back
          this.drawCodex3DCylinder(ctx, -12, -18, -10, 2.5, 2.5, 28, 6, yaw, pitch, scale, cx, cy, "#e2e8f0", "#ffffff", mode);
          this.drawCodex3DCylinder(ctx, 12, -18, -10, 2.5, 2.5, 28, 6, yaw, pitch, scale, cx, cy, "#e2e8f0", "#ffffff", mode);
          // Right Arm: Heavy Ion Blaster
          this.drawCodex3DCylinder(ctx, 22, -2, 20 - rec, 5, 5, 36, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#60a5fa", mode);
          // Left Arm: Flaming Energon Battle Axe
          this.drawCodex3DBox(ctx, -22, -2, 20, 3, 24, 14, yaw, pitch, scale, cx, cy, "#ff7700", "#ffea00", mode);
          // Cobalt Blue Legs
          this.drawCodex3DBox(ctx, -11, 24, walkMech * 7, 10, 26, 12, yaw, pitch, scale, cx, cy, "#1d4ed8", "#475569", mode);
          this.drawCodex3DBox(ctx, 11, 24, -walkMech * 7, 10, 26, 12, yaw, pitch, scale, cx, cy, "#1d4ed8", "#475569", mode);
        } else if (item.id === "bumblebee") {
          // Bumblebee TLK (Elite Autobot Scout)
          const walkMech = Math.sin(t * 6);
          // Yellow & Carbon Rally Torso
          this.drawCodex3DBox(ctx, 0, -2, 0, 26, 24, 18, yaw, pitch, scale, cx, cy, "#f59e0b", "#000000", mode);
          this.drawCodex3DBox(ctx, -5, -2, 10, 3, 24, 2, yaw, pitch, scale, cx, cy, "#111827", "#111827", mode);
          this.drawCodex3DBox(ctx, 5, -2, 10, 3, 24, 2, yaw, pitch, scale, cx, cy, "#111827", "#111827", mode);
          // Scout Head
          this.drawCodex3DBox(ctx, 0, -18, 2, 13, 12, 14, yaw, pitch, scale, cx, cy, "#f59e0b", "#00e5ff", mode);
          this.drawCodex3DBox(ctx, 0, -17, 10, 9, 3, 2, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
          // Dual Arm Stinger Cannons
          this.drawCodex3DCylinder(ctx, -18, 0, 18 - rec, 4, 4, 28, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          this.drawCodex3DCylinder(ctx, 18, 0, 18 - rec, 4, 4, 28, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          // Agile Legs
          this.drawCodex3DBox(ctx, -9, 22, walkMech * 8, 8, 24, 10, yaw, pitch, scale, cx, cy, "#f59e0b", "#141824", mode);
          this.drawCodex3DBox(ctx, 9, 22, -walkMech * 8, 8, 24, 10, yaw, pitch, scale, cx, cy, "#f59e0b", "#141824", mode);
        } else if (item.id === "biped") {
          // APEX-01 Biped Assault Robot in 3D (Full Articulated Rig)
          const walkMech = Math.sin(t * 5);
          // Torso Chassis & Quantum Reactor Core
          this.drawCodex3DBox(ctx, 0, -4, 0, 30, 28, 22, yaw, pitch, scale, cx, cy, "#1e293b", "#00e5ff", mode);
          this.drawCodex3DSphere(ctx, 0, -4, 11, 7, yaw, pitch, scale, cx, cy, "#00e5ff", true);
          // Cockpit Helmet & Glazed Visor
          this.drawCodex3DBox(ctx, 0, -22, 2, 17, 13, 17, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
          this.drawCodex3DBox(ctx, 0, -22, 11, 13, 4, 3, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
          // Left Arm: Rotary Multi-Barrel Gatling Autocannon
          this.drawCodex3DBox(ctx, -22, -2, 8 - rec, 10, 12, 18, yaw, pitch, scale, cx, cy, "#334155", "#00e5ff", mode);
          this.drawCodex3DCylinder(ctx, -22, -2, 24 - rec, 4.5, 4.5, 26, 6, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
          // Right Arm: High-Frequency Plasma Katana
          this.drawCodex3DBox(ctx, 22, -2, 8, 10, 12, 16, yaw, pitch, scale, cx, cy, "#334155", "#00e5ff", mode);
          this.drawCodex3DBox(ctx, 22, -2, 28, 3, 2, 34, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
          // Backpack Dual Ion Thrusters with Flame Cones
          this.drawCodex3DCylinder(ctx, -10, -10, -14, 4.5, 5.5, 18, 6, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
          this.drawCodex3DCylinder(ctx, 10, -10, -14, 4.5, 5.5, 18, 6, yaw, pitch, scale, cx, cy, "#00e5ff", "#ffffff", mode);
          this.drawCodex3DSphere(ctx, -10, -10, -24, 5 + Math.sin(t * 12) * 1.5, yaw, pitch, scale, cx, cy, "#00e5ff", true);
          this.drawCodex3DSphere(ctx, 10, -10, -24, 5 + Math.sin(t * 12) * 1.5, yaw, pitch, scale, cx, cy, "#00e5ff", true);
          // 2 Articulated Hydraulic Walking Legs
          this.drawCodex3DBox(ctx, -11, 24, walkMech * 8, 9, 26, 12, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
          this.drawCodex3DBox(ctx, 11, 24, -walkMech * 8, 9, 26, 12, yaw, pitch, scale, cx, cy, "#0f172a", "#00e5ff", mode);
        } else if (item.id === "siege") {
          // APEX-01 Fortress Siege Tank in 3D (Armored Crawler Rig)
          // Heavy Sloped Glacis Chassis
          this.drawCodex3DBox(ctx, 0, 10, 0, 58, 18, 54, yaw, pitch, scale, cx, cy, "#1e293b", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 0, 4, 12, 38, 8, 14, yaw, pitch, scale, cx, cy, "#ffd600", "#000000", mode);
          // Left & Right Continuous Caterpillar Tread Units
          this.drawCodex3DBox(ctx, -34, 14, 0, 16, 20, 62, yaw, pitch, scale, cx, cy, "#0f172a", "#64748b", mode);
          this.drawCodex3DBox(ctx, 34, 14, 0, 16, 20, 62, yaw, pitch, scale, cx, cy, "#0f172a", "#64748b", mode);
          // Rotating Heavy Armored Commander Turret Cupola
          this.drawCodex3DCylinder(ctx, 0, -2, 0, 19, 23, 14, 8, yaw, pitch, scale, cx, cy, "#0f172a", "#ffd600", mode);
          // Dual 120mm Heavy Artillery Cannons with Slotted Muzzle Brakes & Recoil Slide
          this.drawCodex3DCylinder(ctx, -8, -6, 26 - rec, 5.5, 5.5, 46, 6, yaw, pitch, scale, cx, cy, "#334155", "#ffd600", mode);
          this.drawCodex3DCylinder(ctx, 8, -6, 26 - rec, 5.5, 5.5, 46, 6, yaw, pitch, scale, cx, cy, "#334155", "#ffd600", mode);
          this.drawCodex3DBox(ctx, -8, -6, 49 - rec, 8, 8, 8, yaw, pitch, scale, cx, cy, "#090d16", "#ffd600", mode);
          this.drawCodex3DBox(ctx, 8, -6, 49 - rec, 8, 8, 8, yaw, pitch, scale, cx, cy, "#090d16", "#ffd600", mode);
        }
      }
    }

    renderFieldManual() {
      const ctx = this.ctx;
      const t = this.uiTime || 0;

      // 1. Deep space cyber grid background
      ctx.fillStyle = "#040714";
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
      }
      for (let y = 0; y <= this.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // 2. Top Header Bar with Tabs
      ctx.fillStyle = "rgba(10, 18, 34, 0.95)";
      ctx.fillRect(0, 0, this.width, 68);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, this.width, 68);

      this.renderMiniButton(30, 16, 110, 36, "← MENYU", "#ff1744");

      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 18px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 8;
      ctx.fillText("⚡ KIBER-KODEX // 3D INTEL", 155, 40);
      ctx.shadowBlur = 0;

      const tab = this.codexTab || "TOWERS";
      this.drawCyberButton(440, 15, 165, 38, "⚡ MINORALAR", tab === "TOWERS" ? "#00e5ff" : "#455a64", "TOWERS", "", tab === "TOWERS");
      this.drawCyberButton(620, 15, 175, 38, "👾 DUSHMANLAR", tab === "ENEMIES" ? "#00e676" : "#455a64", "HOSTILES", "", tab === "ENEMIES");
      this.drawCyberButton(810, 15, 195, 38, "💀 GIGANT BOSSLAR", tab === "BOSSES" ? "#ff1744" : "#455a64", "TITANS", "", tab === "BOSSES");
      this.drawCyberButton(1020, 15, 185, 38, "🤖 APEX-01 MECH", tab === "MECH" ? "#ffd600" : "#455a64", "FIELD HERO", "", tab === "MECH");

      // 3. Codex Database & Active Item
      const codexData = this.getCodexDatabase();
      const list = codexData[tab] || codexData.TOWERS;
      let activeItem = list.find(i => i.id === this.codexSelectedId);
      if (!activeItem) {
        activeItem = list[0];
        this.codexSelectedId = activeItem.id;
      }

      // 4. Left List Column (x: 25, y: 76, w: 290, h: 630)
      ctx.fillStyle = "rgba(10, 18, 32, 0.92)";
      ctx.fillRect(25, 76, 290, 630);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(25, 76, 290, 630);

      const itemH = Math.min(68, Math.floor(590 / list.length));
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const iy = 86 + i * (itemH + 4);
        const isSel = (item.id === activeItem.id);
        this.drawCyberButton(32, iy, 276, itemH, `${item.icon} ${item.name}`, isSel ? (item.col || "#00e5ff") : "#455a64", item.role, "", isSel);
      }

      // 5. Central Holographic Bay (x: 325, y: 76, w: 450, h: 630)
      ctx.fillStyle = "rgba(8, 14, 26, 0.95)";
      ctx.fillRect(325, 76, 450, 630);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(325, 76, 450, 630);

      const px = 550;
      const py = 350;
      const scale = 2.4 * (this.codexZoom || 1.0);
      const yaw = this.codexYaw !== undefined ? this.codexYaw : 0.25;
      const pitch = (this.codexPitch !== undefined ? this.codexPitch : 0.20);
      const mode = this.codexRenderMode || "SHADED";
      const branch = this.codexBranch || "BASE";

      // Top Turntable HUD Controls (Badge, Reset & Lighting)
      ctx.fillStyle = "rgba(0, 229, 255, 0.12)";
      ctx.fillRect(332, 82, 130, 26);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(332, 82, 130, 26);
      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚡ 3D PBR HD", 397, 99);

      this.drawCyberButton(472, 82, 120, 26, "⟲ MARKAZGA", "#ffd600", "", "");
      const lightName = this.codex3DEngine ? this.codex3DEngine.getLightingPresetName() : "CS2 HANGAR";
      this.drawCyberButton(600, 82, 168, 26, `💡 ${lightName}`, "#00e5ff", "", "");

      // Holographic Turntable Base & Animated Scanner Rings
      ctx.save();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(px, py + 120, 140, 48, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = activeItem.col || "#00e5ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px, py + 120, 110, 38, 0, 0, Math.PI * 2);
      ctx.stroke();

      const ringAng = t * 1.5;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.ellipse(px, py + 120, 155, 52, ringAng, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const scanY = py - 70 + Math.sin(t * 3) * 105;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - 110, scanY);
      ctx.lineTo(px + 110, scanY);
      ctx.stroke();

      if (this.codex3DEngine && this.codex3DEngine.active && this.codex3DEngine.canvas) {
        ctx.drawImage(this.codex3DEngine.canvas, 335, 105, 430, 430);
      } else {
        this.drawCodex3DUnit(ctx, activeItem, tab, t, yaw, pitch, scale, px, py + 30, mode, branch, this.codexRecoil);
      }

      ctx.restore();

      // Bottom Cyber Control & Role Action Bar
      // 1. Role & Specialty Plate (y: 546, h: 36)
      ctx.fillStyle = "rgba(10, 18, 34, 0.85)";
      ctx.fillRect(332, 546, 436, 36);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(332, 546, 436, 36);

      ctx.textAlign = "left";
      ctx.fillStyle = activeItem.col || "#00e5ff";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`⚡ VAZIFASI: ${activeItem.role.toUpperCase()}`, 345, 568);

      ctx.textAlign = "right";
      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`REJIM: ${activeItem.type || 'HARBIY'}`, 756, 568);

      // 2. Action Demo Button (y: 590, h: 46)
      this.drawCyberButton(332, 590, 436, 46, "⚔️ JANG HARAKATINI KO'RISH", "#00e5ff", "Qurol & Mudofaa Harakati", "⚡", true);

      // 3. User Gesture Hint (y: 650)
      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("👆 Barmoq bilan surib 360° ko'rishingiz mumkin", px, 650);

      // 4. Quick Zoom Controls (y: 666, h: 32)
      this.drawCyberButton(332, 666, 138, 32, "🔍 ZOOM +", "#ffd600", "", "");
      this.drawCyberButton(481, 666, 138, 32, "🔎 ZOOM -", "#ffd600", "", "");
      this.drawCyberButton(630, 666, 138, 32, "⟲ BURCHAK", "#00e676", "", "");

      // 6. Right Tactical Dossier Bay (x: 785, y: 76, w: 470, h: 630)
      ctx.fillStyle = "rgba(8, 14, 26, 0.95)";
      ctx.fillRect(785, 76, 470, 630);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(785, 76, 470, 630);

      const subTab = this.codexSubTab || "SPECS";
      this.drawCyberButton(790, 84, 145, 34, "📊 XARAKTERISTIKA", subTab === "SPECS" ? "#00e5ff" : "#455a64", "", "", subTab === "SPECS");
      const subTitle2 = (tab === "TOWERS" || tab === "MECH") ? "🧬 EVOLYUTSIYA" : "🛡️ COUNTER TAKTIKA";
      this.drawCyberButton(940, 84, 155, 34, subTitle2, subTab === "BRANCHES" ? "#00e676" : "#455a64", "", "", subTab === "BRANCHES");
      this.drawCyberButton(1100, 84, 150, 34, "📜 KODEX LORE", subTab === "LORE" ? "#ffd600" : "#455a64", "", "", subTab === "LORE");

      if (tab === "TOWERS" || tab === "MECH") {
        const b = this.codexBranch || "BASE";
        this.drawCyberButton(790, 122, 145, 30, "ASOSIY MODEL", b === "BASE" ? "#00e5ff" : "#334155", "", "", b === "BASE");
        this.drawCyberButton(940, 122, 155, 30, `A: ${(activeItem.branchA ? activeItem.branchA.name.split(" ")[0] : "TARMOQ A")}`, b === "BRANCH_A" ? "#00e676" : "#334155", "", "", b === "BRANCH_A");
        this.drawCyberButton(1100, 122, 150, 30, `B: ${(activeItem.branchB ? activeItem.branchB.name.split(" ")[0] : "TARMOQ B")}`, b === "BRANCH_B" ? "#ffd600" : "#334155", "", "", b === "BRANCH_B");
      }

      const tx = 795;
      const contentY = (tab === "TOWERS" || tab === "MECH") ? 160 : 126;

      if (subTab === "SPECS") {
        ctx.textAlign = "left";
        ctx.fillStyle = activeItem.col || "#00e5ff";
        ctx.font = "900 22px 'Segoe UI', monospace";
        ctx.shadowColor = activeItem.col || "#00e5ff";
        ctx.shadowBlur = 8;
        ctx.fillText(activeItem.name.toUpperCase(), tx, contentY + 22);
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 12px monospace";
        ctx.fillText(`KLASSIFIKATSIYA: ${activeItem.role.toUpperCase()} // ${activeItem.type}`, tx, contentY + 42);

        let curDmg = activeItem.dmg;
        let curRate = activeItem.rate;
        let curDps = activeItem.dps;
        if (branch === "BRANCH_A" && activeItem.branchA) {
          curDmg = activeItem.branchA.dmg;
          curRate = activeItem.branchA.rate;
          curDps = activeItem.branchA.dps;
        } else if (branch === "BRANCH_B" && activeItem.branchB) {
          curDmg = activeItem.branchB.dmg;
          curRate = activeItem.branchB.rate;
          curDps = activeItem.branchB.dps;
        }

        const specs = [
          { label: "XARAJAT / MUKOFOT", val: activeItem.cost || activeItem.bounty || "N/A", pct: 0.65, col: "#ffd600" },
          { label: "HAYOTIY KUCH (HP)", val: activeItem.hp || "N/A", pct: 0.75, col: "#00e676" },
          { label: "ZARBA / DPS", val: `${curDmg} (${curDps})`, pct: 0.85, col: "#ff1744" },
          { label: "HUJUM RADIUSI", val: activeItem.range || "N/A", pct: 0.70, col: "#00e5ff" },
          { label: "OTISH / HARAKAT TEZLIGI", val: curRate || activeItem.speed || "N/A", pct: 0.80, col: "#e040fb" },
          { label: "ZIRH / RESISTANCE", val: activeItem.armor || "0", pct: 0.50, col: "#38bdf8" }
        ];

        for (let s = 0; s < specs.length; s++) {
          const sy = contentY + 54 + s * 42;
          ctx.fillStyle = "rgba(16, 28, 48, 0.85)";
          ctx.fillRect(tx, sy, 450, 36);
          ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
          ctx.strokeRect(tx, sy, 450, 36);

          ctx.fillStyle = specs[s].col;
          ctx.globalAlpha = 0.2;
          ctx.fillRect(tx, sy, 450 * specs[s].pct, 36);
          ctx.globalAlpha = 1.0;

          ctx.fillStyle = "#cbd5e1";
          ctx.font = "bold 11px monospace";
          ctx.fillText(specs[s].label, tx + 12, sy + 22);

          ctx.fillStyle = specs[s].col;
          ctx.font = "bold 13px monospace";
          ctx.textAlign = "right";
          ctx.fillText(specs[s].val, tx + 438, sy + 22);
          ctx.textAlign = "left";
        }

        const matY = contentY + 316;
        ctx.fillStyle = "rgba(14, 24, 42, 0.95)";
        ctx.fillRect(tx, matY, 450, 180);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
        ctx.strokeRect(tx, matY, 450, 180);

        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 12px monospace";
        ctx.fillText("JANG SAMARADORLIGI MATRITSASI (EFFECTIVENESS):", tx + 14, matY + 24);

        const eff = activeItem.eff || { vsShield: "100%", vsArmor: "100%", vsSwarm: "100%", vsBoss: "100%" };
        const rows = [
          { name: "⚡ vs ENERGIYA QALQONI:", val: eff.vsShield, col: "#00e5ff" },
          { name: "■ vs OG'IR TITAN ZIRHI:", val: eff.vsArmor, col: "#ff007f" },
          { name: "❖ vs KATTA TO'DALAR:", val: eff.vsSwarm, col: "#ffd600" },
          { name: "💀 vs GIGANT BOSSLAR:", val: eff.vsBoss, col: "#ff1744" }
        ];

        for (let r = 0; r < rows.length; r++) {
          const ry = matY + 48 + r * 30;
          ctx.fillStyle = "#94a3b8";
          ctx.font = "11px monospace";
          ctx.fillText(rows[r].name, tx + 14, ry);

          ctx.fillStyle = rows[r].col;
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "right";
          ctx.fillText(rows[r].val, tx + 436, ry);
          ctx.textAlign = "left";
        }
      } else if (subTab === "BRANCHES") {
        ctx.textAlign = "left";
        if (tab === "TOWERS" || tab === "MECH") {
          ctx.fillStyle = "rgba(16, 32, 24, 0.9)";
          ctx.fillRect(tx, contentY + 10, 450, 190);
          ctx.strokeStyle = "#00e676";
          ctx.strokeRect(tx, contentY + 10, 450, 190);

          ctx.fillStyle = "#00e676";
          ctx.font = "900 15px 'Segoe UI', monospace";
          ctx.fillText(`[TARMOQ A] ${activeItem.branchA ? activeItem.branchA.name : "TARMOQ A"}`, tx + 14, contentY + 36);

          ctx.fillStyle = "#ffd600";
          ctx.font = "bold 12px monospace";
          ctx.fillText(`QIYMATI: ${activeItem.branchA ? activeItem.branchA.cost : "N/A"} | DPS: ${activeItem.branchA ? activeItem.branchA.dps : "N/A"}`, tx + 14, contentY + 60);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px monospace";
          ctx.fillText(`PERK: ${activeItem.branchA ? activeItem.branchA.perk : "Maxsus qobiliyat"}`, tx + 14, contentY + 84);

          ctx.fillStyle = "#cbd5e1";
          ctx.font = "11px monospace";
          this.wrapText(activeItem.branchA ? activeItem.branchA.desc : activeItem.desc, tx + 14, contentY + 110, 420, 18);

          ctx.fillStyle = "rgba(32, 24, 16, 0.9)";
          ctx.fillRect(tx, contentY + 215, 450, 190);
          ctx.strokeStyle = "#ffd600";
          ctx.strokeRect(tx, contentY + 215, 450, 190);

          ctx.fillStyle = "#ffd600";
          ctx.font = "900 15px 'Segoe UI', monospace";
          ctx.fillText(`[TARMOQ B] ${activeItem.branchB ? activeItem.branchB.name : "TARMOQ B"}`, tx + 14, contentY + 241);

          ctx.fillStyle = "#00e5ff";
          ctx.font = "bold 12px monospace";
          ctx.fillText(`QIYMATI: ${activeItem.branchB ? activeItem.branchB.cost : "N/A"} | DPS: ${activeItem.branchB ? activeItem.branchB.dps : "N/A"}`, tx + 14, contentY + 265);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px monospace";
          ctx.fillText(`PERK: ${activeItem.branchB ? activeItem.branchB.perk : "Maxsus qobiliyat"}`, tx + 14, contentY + 289);

          ctx.fillStyle = "#cbd5e1";
          ctx.font = "11px monospace";
          this.wrapText(activeItem.branchB ? activeItem.branchB.desc : activeItem.desc, tx + 14, contentY + 315, 420, 18);
        } else {
          ctx.fillStyle = "rgba(16, 28, 48, 0.9)";
          ctx.fillRect(tx, contentY + 10, 450, 420);
          ctx.strokeStyle = "rgba(255, 23, 68, 0.5)";
          ctx.strokeRect(tx, contentY + 10, 450, 420);

          ctx.fillStyle = "#ff1744";
          ctx.font = "900 16px 'Segoe UI', monospace";
          ctx.fillText("🛡️ TAKTIK QARSHI CHORA (COUNTER TACTICS):", tx + 14, contentY + 40);

          ctx.fillStyle = "#ffd600";
          ctx.font = "bold 13px monospace";
          ctx.fillText("ENG SAMARALI MINORA:", tx + 14, contentY + 75);

          ctx.fillStyle = "#ffffff";
          ctx.font = "12px monospace";
          this.wrapText(activeItem.lore ? activeItem.lore.advice : activeItem.desc, tx + 14, contentY + 105, 420, 20);

          ctx.fillStyle = "#00e5ff";
          ctx.font = "bold 13px monospace";
          ctx.fillText("TAVSIYA ETILGAN TANDEM:", tx + 14, contentY + 210);

          ctx.fillStyle = "#cbd5e1";
          ctx.font = "12px monospace";
          ctx.fillText("• Cryo Emitter + Railgun (Sekinlashtirish va teshish)", tx + 14, contentY + 235);
          ctx.fillText("• Tesla Coil (EMP) + Flame Thrower (Zirh eritish)", tx + 14, contentY + 260);
          ctx.fillText("• Apex-01 Hero Mech (Cyber-Slash ultimatum)", tx + 14, contentY + 285);
        }
      } else if (subTab === "LORE") {
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(12, 20, 36, 0.95)";
        ctx.fillRect(tx, contentY + 10, 450, 440);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
        ctx.strokeRect(tx, contentY + 10, 450, 440);

        ctx.fillStyle = "#ffd600";
        ctx.font = "900 15px 'Segoe UI', monospace";
        ctx.fillText("HARBIY ARXIV VA TARIQAT // LORE INTEL:", tx + 14, contentY + 40);

        const lore = activeItem.lore || {
          origin: "Apex Classified Lab",
          blueprint: "ARCH-DEF-001",
          history: activeItem.desc,
          advice: "Front chizig'ida ehtiyotkorlik bilan foydalaning."
        };

        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 11px monospace";
        ctx.fillText("LABORATORIYA / ISHLAB CHIQARUVCHI:", tx + 14, contentY + 75);
        ctx.fillStyle = "#ffffff";
        ctx.font = "11px monospace";
        ctx.fillText(lore.origin, tx + 14, contentY + 95);

        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 11px monospace";
        ctx.fillText("CHIZMA SERIYA RAQAMI (BLUEPRINT ID):", tx + 14, contentY + 125);
        ctx.fillStyle = "#ffd600";
        ctx.font = "11px monospace";
        ctx.fillText(lore.blueprint, tx + 14, contentY + 145);

        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 11px monospace";
        ctx.fillText("JANG MAYDONI TARIXI:", tx + 14, contentY + 175);
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "11px monospace";
        this.wrapText(lore.history, tx + 14, contentY + 200, 420, 18);

        ctx.fillStyle = "#00e676";
        ctx.font = "bold 11px monospace";
        ctx.fillText("QO'MDON MASLAHATI:", tx + 14, contentY + 320);
        ctx.fillStyle = "#ffffff";
        ctx.font = "11px monospace";
        this.wrapText(lore.advice, tx + 14, contentY + 342, 420, 18);
      }
    }

    renderMapSelect() {
      const ctx = this.ctx;
      const t = this.uiTime || 0;

      // 1. Deep Space Starmap Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, "#040713");
      bgGrad.addColorStop(0.5, "#070d20");
      bgGrad.addColorStop(1, "#03050b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Faint Starmap Grid
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 45) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
      }
      for (let y = 0; y <= this.height; y += 45) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // 2. Animated Constellation Conduits connecting sectors
      ctx.save();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.22)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -t * 20;

      for (let i = 0; i < MAPS.length - 1; i++) {
        const c1 = i % 5, r1 = Math.floor(i / 5);
        const x1 = 40 + c1 * 242 + 115;
        const y1 = 75 + r1 * 245 + 115;

        const c2 = (i + 1) % 5, r2 = Math.floor((i + 1) / 5);
        const x2 = 40 + c2 * 242 + 115;
        const y2 = 75 + r2 * 245 + 115;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Top Header Bar
      ctx.fillStyle = "rgba(8, 14, 26, 0.94)";
      ctx.fillRect(0, 0, this.width, 68);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, this.width, 68);

      this.renderMiniButton(40, 20, 110, 36, "← MENYU", "#ff1744");

      ctx.textAlign = "left";
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 22px 'Segoe UI', monospace";
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 10;
      ctx.fillText("🗺️ TAKTIK SEKTORLAR VA GALA-MUDOFAA", 170, 44);
      ctx.shadowBlur = 0;

      // Total campaign stars display
      let totalStars = 0;
      for (const m of MAPS) totalStars += (this.saveData.stars[m.id] || 0);
      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`KAMPANIYA: ${totalStars} / 30 ★`, 1240, 44);

      // Difficulty Selector Pill (CASUAL / NORMAL / HEROIC)
      const diffs = ['CASUAL', 'NORMAL', 'HEROIC'];
      ctx.fillStyle = "rgba(10, 25, 47, 0.9)";
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(580, 20, 335, 34, 6);
      ctx.fill();
      ctx.stroke();
      diffs.forEach((d, idx) => {
        const dx = 584 + idx * 110;
        const isCur = this.difficulty === d;
        if (isCur) {
          ctx.fillStyle = "#00e5ff";
          ctx.beginPath();
          ctx.roundRect(dx, 23, 105, 28, 4);
          ctx.fill();
        }
        ctx.fillStyle = isCur ? "#030712" : "#94a3b8";
        ctx.font = "900 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(d, dx + 52, 42);
      });

      // 4. 10 Sector Cards
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
        cardGrad.addColorStop(0, "rgba(14, 24, 42, 0.96)");
        cardGrad.addColorStop(1, "rgba(6, 12, 22, 0.98)");
        ctx.fillStyle = cardGrad;
        ctx.fill();

        ctx.strokeStyle = isCompleted ? "#00e676" : "#00e5ff";
        ctx.lineWidth = isCompleted ? 1.6 : 1.2;
        ctx.shadowColor = isCompleted ? "rgba(0, 230, 118, 0.4)" : "rgba(0, 229, 255, 0.25)";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Left Status Strip
        ctx.fillStyle = isCompleted ? "#00e676" : "#00e5ff";
        ctx.fillRect(x, y + cut, 4, 30);

        // Header: Sector Number & Name
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px 'Segoe UI', monospace";
        ctx.textAlign = "left";
        ctx.fillText(`0${i + 1}. ${m.name.toUpperCase()}`, x + 14, y + 24);

        // Status Pill Badge (SECURED vs HOSTILE)
        ctx.fillStyle = isCompleted ? "rgba(0, 230, 118, 0.18)" : "rgba(255, 23, 68, 0.18)";
        ctx.beginPath();
        ctx.roundRect(x + 130, y + 10, 90, 18, 4);
        ctx.fill();
        ctx.strokeStyle = isCompleted ? "#00e676" : "#ff1744";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isCompleted ? "#00e676" : "#ff5252";
        ctx.font = "900 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(isCompleted ? "✔ SECURED" : "⚠ HOSTILE", x + 175, y + 22);

        // Mini Waypoint Lane Preview Box inside card
        const prevX = x + 14;
        const prevY = y + 36;
        const prevW = 202;
        const prevH = 46;
        ctx.fillStyle = "rgba(4, 8, 16, 0.85)";
        ctx.beginPath();
        ctx.roundRect(prevX, prevY, prevW, prevH, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw miniature lanes
        if (m.waypoints && m.waypoints.length > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(prevX, prevY, prevW, prevH);
          ctx.clip();
          ctx.strokeStyle = isCompleted ? "rgba(0, 230, 118, 0.6)" : "rgba(0, 229, 255, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let pi = 0; pi < m.waypoints.length; pi++) {
            const wp = m.waypoints[pi];
            const px = prevX + 10 + (wp.x / 1280) * (prevW - 20);
            const py = prevY + 6 + (wp.y / 704) * (prevH - 12);
            if (pi === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Biome and Wave Telemetry
        ctx.textAlign = "left";
        const biomeTag = (m.biome === 'lava') ? "🌋 LAVA" : (m.biome === 'cryo' ? "❄️ CRYO" : "⚡ CYBER");
        const biomeColor = (m.biome === 'lava') ? "#ff5722" : (m.biome === 'cryo' ? "#80deea" : "#00e5ff");
        ctx.fillStyle = biomeColor;
        ctx.font = "bold 10px monospace";
        ctx.fillText(biomeTag, x + 14, y + 100);

        ctx.fillStyle = "#90a4ae";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`WAVES: ${m.wave_count}`, x + 216, y + 100);

        // Description
        ctx.textAlign = "left";
        ctx.fillStyle = "#b0bec5";
        ctx.font = "10px 'Segoe UI', monospace";
        this.wrapText(m.desc, x + 14, y + 116, 202, 14);

        // 3-Star Campaign Rating
        ctx.fillStyle = "#ffd600";
        ctx.font = "bold 13px monospace";
        const starStr = "★".repeat(starsEarned) + "☆".repeat(3 - starsEarned);
        ctx.fillText(`${starStr} (${starsEarned}/3)`, x + 14, y + 162);

        this.drawCyberButton(x + 12, y + 176, 206, 42, "JANGGA KIRISH", isCompleted ? "#00e676" : "#00e5ff", `SECTOR 0${i + 1}`, "▶", true);

        ctx.restore();
      }

      // 11. Custom Created Map Card (y: 565, w: 1200, h: 135)
      const savedCustom = localStorage.getItem('lg_custom_map');
      let customData = null;
      if (savedCustom) {
        try { customData = JSON.parse(savedCustom); } catch(e) {}
      }
      const cWaypoints = (customData && customData.waypoints) ? customData.waypoints : this.editorWaypoints;
      const cBiome = (customData && customData.biome) ? customData.biome : (this.editorBiome || 'cyber');
      const cGold = (customData && customData.gold) ? customData.gold : (this.editorGold || 350);
      const cWaves = (customData && customData.waves) ? customData.waves : (this.editorWaves || 20);

      const cx = 40, cy = 565, cw = 1200, ch = 135;
      ctx.save();
      ctx.fillStyle = "rgba(12, 22, 38, 0.95)";
      ctx.beginPath();
      ctx.roundRect(cx, cy, cw, ch, 8);
      ctx.fill();
      ctx.strokeStyle = "#ffd600";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 16px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText("🛠️ SHAXSIY XARITA (CUSTOM LEVEL)", cx + 24, cy + 32);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px monospace";
      ctx.fillText(`Nuqtalar: ${cWaypoints.length} ta  |  Biom: ${cBiome.toUpperCase()}  |  Boshlang'ich Oltin: ${cGold}G  |  To'lqinlar: ${cWaves}`, cx + 24, cy + 58);
      ctx.fillText("Xarita muharririda o'zingiz chizgan maxsus xaritani darhol sinab ko'ring yoki qayta tahrirlang!", cx + 24, cy + 82);

      this.drawCyberButton(cx + 780, cy + 32, 220, 70, "▶ MAXSUS O'YIN", "#00e676", "PLAY CUSTOM", "🚀", true);
      this.drawCyberButton(cx + 1020, cy + 32, 160, 70, "✏️ TAHRIRLASH", "#00e5ff", "EDIT MAP", "🛠️", false);
      ctx.restore();
    }

    renderEditor() {
      const ctx = this.ctx;
      const time = performance.now() * 0.002;
      const bColor = (this.editorBiome === 'lava') ? "#160606" : (this.editorBiome === 'cryo' ? "#05121c" : "#050914");
      ctx.fillStyle = bColor;
      ctx.fillRect(0, 0, this.width, this.height);

      // Fine Technical Blueprint CAD Grid (32px minor, 64px major)
      const minorColor = (this.editorBiome === 'lava') ? "rgba(255, 61, 0, 0.05)" : (this.editorBiome === 'cryo' ? "rgba(0, 240, 255, 0.05)" : "rgba(0, 229, 255, 0.05)");
      const majorColor = (this.editorBiome === 'lava') ? "rgba(255, 61, 0, 0.14)" : (this.editorBiome === 'cryo' ? "rgba(0, 240, 255, 0.14)" : "rgba(0, 229, 255, 0.14)");

      ctx.lineWidth = 0.5;
      ctx.strokeStyle = minorColor;
      for (let x = 0; x <= this.width; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 90); ctx.lineTo(x, 700); ctx.stroke();
      }
      for (let y = 96; y <= 700; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = majorColor;
      for (let x = 0; x <= this.width; x += 64) {
        ctx.beginPath(); ctx.moveTo(x, 90); ctx.lineTo(x, 700); ctx.stroke();
      }
      for (let y = 96; y <= 700; y += 64) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // Technical Coordinate Marks & Crosshairs (+)
      ctx.fillStyle = "rgba(148, 163, 184, 0.35)";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      for (let x = 64; x < this.width; x += 128) {
        ctx.fillText(`X:${x}`, x + 4, 105);
      }
      for (let y = 160; y < 680; y += 128) {
        ctx.fillText(`Y:${y}`, 6, y - 4);
      }

      // Intersection Crosshairs
      ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
      ctx.lineWidth = 1;
      for (let x = 128; x < this.width; x += 128) {
        for (let y = 160; y < 680; y += 128) {
          ctx.beginPath();
          ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y);
          ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5);
          ctx.stroke();
        }
      }

      // Technical CAD Blueprint Watermark
      ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
      ctx.font = "900 16px monospace";
      ctx.textAlign = "right";
      ctx.fillText("TACTICAL MAP BLUEPRINT // CAD V4.1 // ORTHOGRAPHIC", this.width - 20, 690);

      // Connecting Multi-layer Laser Path Highway
      if (this.editorWaypoints.length >= 2) {
        // Outer soft glow
        ctx.beginPath();
        ctx.moveTo(this.editorWaypoints[0].x, this.editorWaypoints[0].y);
        for (let i = 1; i < this.editorWaypoints.length; i++) {
          ctx.lineTo(this.editorWaypoints[i].x, this.editorWaypoints[i].y);
        }
        ctx.strokeStyle = "rgba(0, 229, 255, 0.2)";
        ctx.lineWidth = 44;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // High-energy conduit
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 8;
        ctx.stroke();

        // White-hot core beam
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Flowing chevrons along path with dynamic movement
        const flowShift = (time * 1.5) % 1;
        for (let i = 0; i < this.editorWaypoints.length - 1; i++) {
          const p1 = this.editorWaypoints[i];
          const p2 = this.editorWaypoints[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          const ang = Math.atan2(dy, dx);

          const step = 45;
          const count = Math.floor(dist / step);
          for (let s = 0; s < count; s++) {
            const ratio = ((s + flowShift) / count) % 1;
            const ax = p1.x + dx * ratio;
            const ay = p1.y + dy * ratio;

            ctx.save();
            ctx.translate(ax, ay);
            ctx.rotate(ang);
            ctx.fillStyle = "#ffd600";
            ctx.beginPath();
            ctx.moveTo(7, 0); ctx.lineTo(-5, -5); ctx.lineTo(-2, 0); ctx.lineTo(-5, 5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // Interactive Tactical Waypoint Nodes
      for (let i = 0; i < this.editorWaypoints.length; i++) {
        const pt = this.editorWaypoints[i];
        const isStart = (i === 0);
        const isEnd = (i === this.editorWaypoints.length - 1 && this.editorWaypoints.length >= 2);

        ctx.save();
        ctx.translate(pt.x, pt.y);

        if (isStart) {
          // Rotating Warp Portal Ring
          ctx.save();
          ctx.rotate(time * 2);
          ctx.strokeStyle = "rgba(255, 23, 68, 0.6)";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();

          // Pulsing Red Portal
          const pScale = 1 + Math.sin(time * 4) * 0.1;
          ctx.fillStyle = "rgba(255, 23, 68, 0.25)";
          ctx.beginPath(); ctx.arc(0, 0, 22 * pScale, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = "#ff1744";
          ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.stroke();

          // Label Banner
          ctx.fillStyle = "rgba(10, 15, 26, 0.9)";
          ctx.beginPath(); ctx.roundRect(-45, -34, 90, 16, 3); ctx.fill();
          ctx.strokeStyle = "#ff1744"; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = "#ff5252"; ctx.font = "900 9px monospace"; ctx.textAlign = "center";
          ctx.fillText("🚪 SPAWN [01]", 0, -22);

          ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px monospace";
          ctx.fillText("1", 0, 4);

        } else if (isEnd) {
          // Rotating Cyan Shield Perimeter
          ctx.save();
          ctx.rotate(-time * 2);
          ctx.strokeStyle = "rgba(0, 229, 255, 0.6)";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();

          // Pulsing Base Core Crystal
          const cScale = 1 + Math.sin(time * 4 + 1) * 0.1;
          ctx.fillStyle = "rgba(0, 229, 255, 0.25)";
          ctx.beginPath(); ctx.arc(0, 0, 24 * cScale, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = "#00e5ff";
          ctx.beginPath();
          ctx.moveTo(0, -18); ctx.lineTo(18, 0); ctx.lineTo(0, 18); ctx.lineTo(-18, 0);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.stroke();

          // Label Banner
          ctx.fillStyle = "rgba(10, 15, 26, 0.9)";
          ctx.beginPath(); ctx.roundRect(-45, -34, 90, 16, 3); ctx.fill();
          ctx.strokeStyle = "#00e5ff"; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = "#00e5ff"; ctx.font = "900 9px monospace"; ctx.textAlign = "center";
          ctx.fillText("💎 CORE [BASE]", 0, -22);

          ctx.fillStyle = "#000000"; ctx.font = "bold 11px monospace";
          ctx.fillText(`${i + 1}`, 0, 4);

        } else {
          // Tactical Intermediate Waypoint Beacon
          ctx.strokeStyle = "rgba(255, 214, 0, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();

          ctx.fillStyle = "#ffd600";
          ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#000000"; ctx.lineWidth = 1.5; ctx.stroke();

          ctx.fillStyle = "#000000"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
          ctx.fillText(`${i + 1}`, 0, 4);
        }
        ctx.restore();
      }

      // Top Toolbar Header & Action Buttons
      ctx.fillStyle = "#0c1527";
      ctx.fillRect(0, 0, this.width, 65);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, this.width, 65);

      this.renderMiniButton(20, 15, 90, 36, "← MENYU", "#ff1744");
      this.renderMiniButton(120, 15, 125, 36, "▶ TEST O'YNASH", "#00e676");
      this.renderMiniButton(255, 15, 95, 36, "💾 SAQLASH", "#ffd600");
      this.renderMiniButton(360, 15, 95, 36, "🗑️ TOZALASH", "#ff5252");
      this.renderMiniButton(465, 15, 95, 36, "📋 EXPORT", "#00e5ff");
      this.renderMiniButton(570, 15, 95, 36, "📥 IMPORT", "#00e5ff");
      this.renderMiniButton(675, 15, 125, 36, `BIOM: ${(this.editorBiome || 'CYBER').toUpperCase()}`, (this.editorBiome === 'lava' ? "#ff5722" : (this.editorBiome === 'cryo' ? "#80deea" : "#00e5ff")));
      this.renderMiniButton(810, 15, 105, 36, `WAVES: ${this.editorWaves || 20}`, "#e040fb");
      this.renderMiniButton(925, 15, 110, 36, `GOLD: ${this.editorGold || 350}G`, "#ffd600");
      this.renderMiniButton(1045, 15, 85, 36, "UNDO ↩️", "#cfd8dc");

      // Subheader Guide Banner
      ctx.fillStyle = "rgba(12, 21, 39, 0.9)";
      ctx.fillRect(0, 65, this.width, 25);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("🎯 Kataklarni bosing: 1-nuqta = [SPAWN 🚪 Dushman kirishi], Oxirgi = [CORE 💎 Baza]. Nuqtani qayta bosish uni o'chiradi.", this.width / 2, 82);

      // Bottom Right Live Diagnostics HUD
      let totalDist = 0;
      for (let i = 0; i < this.editorWaypoints.length - 1; i++) {
        totalDist += Math.hypot(this.editorWaypoints[i+1].x - this.editorWaypoints[i].x, this.editorWaypoints[i+1].y - this.editorWaypoints[i].y);
      }
      const estSeconds = Math.round(totalDist / 80);

      ctx.fillStyle = "rgba(8, 14, 26, 0.92)";
      ctx.beginPath();
      ctx.roundRect(this.width - 380, this.height - 42, 365, 34, 6);
      ctx.fill();
      ctx.strokeStyle = this.editorWaypoints.length >= 2 ? "rgba(0, 229, 255, 0.5)" : "rgba(255, 23, 68, 0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = this.editorWaypoints.length >= 2 ? "#00e5ff" : "#ff5252";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      if (this.editorWaypoints.length >= 2) {
        ctx.fillText(`📍 NUQTALAR: ${this.editorWaypoints.length} ta  |  MASOFA: ${Math.round(totalDist)}px  |  VAQT: ~${estSeconds}s`, this.width - 197, this.height - 21);
      } else {
        ctx.fillText("⚠️ KAMIDA 2 TA NUQTA KERAK (SPAWN VA CORE)", this.width - 197, this.height - 21);
      }
    }

    renderLeaderboardModal() {
      const ctx = this.ctx;
      const bgGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
      bgGrad.addColorStop(0, "#040711");
      bgGrad.addColorStop(0.5, "#070e20");
      bgGrad.addColorStop(1, "#03050b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Cyber Hex Grid
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 55) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
      }
      for (let y = 0; y <= this.height; y += 55) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // Top Header Navigation Bar
      ctx.fillStyle = "rgba(10, 18, 34, 0.95)";
      ctx.fillRect(0, 0, this.width, 65);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 65); ctx.lineTo(this.width, 65); ctx.stroke();

      this.renderMiniButton(30, 14, 130, 38, "← BOSH MENYU", "#00e5ff");

      ctx.save();
      ctx.shadowColor = "rgba(255, 214, 0, 0.8)";
      ctx.shadowBlur = 14;
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffd600";
      ctx.font = "900 24px 'Segoe UI', monospace";
      ctx.fillText("🏅 APEX REYTINGLAR ZALI (HALL OF FAME)", 640, 36);
      ctx.restore();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GLOBAL TACTICAL COMMANDER STANDINGS & COMBAT RECORDS", 640, 54);

      this.renderMiniButton(1040, 14, 200, 38, `👤 NIK: ${this.playerName}`, "#ffd600");

      // Commander Personal Best Banner (x: 40, y: 75, w: 1200, h: 48)
      const bx = 40, by = 75, bw = 1200, bh = 48;
      ctx.fillStyle = "rgba(14, 26, 48, 0.88)";
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 6);
      ctx.fill();
      ctx.strokeStyle = "#ffd600";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 13px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`🎖️ FAOL KOMANDIR: ${this.playerName}`, bx + 20, by + 30);

      const bestScore = (this.saveData && this.saveData.leaderboard && this.saveData.leaderboard[0]) ? this.saveData.leaderboard[0].score : 1000;
      const bestWave = (this.saveData && this.saveData.maxWave) || 1;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`MAKSIMAL TO'LQIN: Wave ${bestWave}  |  ENG YUQORI NATIJA: ${bestScore.toLocaleString()} PTS  |  DARAXT: APEX GENERAL ⭐⭐⭐`, bx + bw - 20, by + 30);

      // Table Header (x: 40, y: 132, w: 1200, h: 36)
      ctx.fillStyle = "rgba(18, 32, 56, 0.95)";
      ctx.fillRect(40, 132, 1200, 36);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 132, 1200, 36);

      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText("O'RIN", 60, 155);
      ctx.fillText("KOMANDIR / HANDLE", 150, 155);
      ctx.fillText("SEKTOR", 460, 155);
      ctx.fillText("TO'LQIN", 700, 155);
      ctx.fillText("TAKTIK BALL", 900, 155);
      ctx.fillText("UNVON TIER", 1080, 155);

      // Leaderboard Rows
      const rows = (this.saveData && this.saveData.leaderboard) ? this.saveData.leaderboard.slice(0, 10) : [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const ry = 174 + i * 42;
        const isSelf = r.player_name === this.playerName;

        // Row background
        if (isSelf) {
          ctx.fillStyle = "rgba(0, 229, 255, 0.16)";
        } else if (i === 0) {
          ctx.fillStyle = "rgba(255, 214, 0, 0.12)";
        } else if (i === 1) {
          ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
        } else if (i === 2) {
          ctx.fillStyle = "rgba(255, 145, 0, 0.08)";
        } else {
          ctx.fillStyle = (i % 2 === 0) ? "rgba(10, 18, 32, 0.65)" : "rgba(16, 28, 48, 0.4)";
        }

        ctx.fillRect(40, ry, 1200, 38);

        // Rank Badge / Trophy
        let rankColor = "#cfd8dc";
        let rankLabel = `#${i + 1}`;
        let tierLabel = "WARRIOR";
        let tierColor = "#90a4ae";

        if (i === 0) {
          rankColor = "#ffd600";
          rankLabel = "🥇 1-O'RIN";
          tierLabel = "APEX OVERLORD";
          tierColor = "#ffd600";
        } else if (i === 1) {
          rankColor = "#00e5ff";
          rankLabel = "🥈 2-O'RIN";
          tierLabel = "TITAN MASTER";
          tierColor = "#00e5ff";
        } else if (i === 2) {
          rankColor = "#ff9100";
          rankLabel = "🥉 3-O'RIN";
          tierLabel = "ELITE SENTINEL";
          tierColor = "#ff9100";
        } else if (i < 5) {
          tierLabel = "VETERAN";
          tierColor = "#80cbc4";
        }

        ctx.fillStyle = rankColor;
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "left";
        ctx.fillText(rankLabel, 60, ry + 24);

        ctx.fillStyle = isSelf ? "#00e5ff" : (i === 0 ? "#ffd600" : "#ffffff");
        ctx.font = isSelf ? "bold 13px monospace" : "13px monospace";
        ctx.fillText(r.player_name + (isSelf ? " (SIZ)" : ""), 150, ry + 24);

        ctx.fillStyle = "#81d4fa";
        ctx.font = "12px monospace";
        ctx.fillText(r.map_id.toUpperCase(), 460, ry + 24);

        ctx.fillStyle = "#a7ffeb";
        ctx.fillText(`Wave ${r.wave_reached}`, 700, ry + 24);

        ctx.fillStyle = "#ffd600";
        ctx.font = "bold 13px monospace";
        ctx.fillText(`${(r.score || 0).toLocaleString()} PTS`, 900, ry + 24);

        ctx.fillStyle = tierColor;
        ctx.font = "bold 11px monospace";
        ctx.fillText(tierLabel, 1080, ry + 24);
      }

      // Bottom Control Action Bar (y: 605, h: 56)
      this.drawCyberButton(140, 605, 230, 56, "BOSH MENYU", "#00e5ff", "MAIN MENU", "◀", false);
      this.drawCyberButton(400, 605, 230, 56, "YANGILASH", "#00e676", "SYNC SCORES", "🔄", true);
      this.drawCyberButton(660, 605, 230, 56, "NIKNI O'ZGARTIR", "#ffd600", "EDIT HANDLE", "✏️", false);
      this.drawCyberButton(920, 605, 230, 56, "JANGGA KIRISH", "#ff1744", "LAUNCH BATTLE", "🚀", true);
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
      this.drawCyberButton(440, 470, 400, 50, "ASOSIY MENYUGA", "#ff1744", "ABORT MISSION", "←", false);
    }

    renderVictoryModal() {
      const ctx = this.ctx;
      const t = this.uiTime || 0;

      // Darkened Atmospheric Backdrop with Emerald Radial Glow
      ctx.fillStyle = "rgba(4, 8, 16, 0.95)";
      ctx.fillRect(0, 0, this.width, this.height);

      const radG = ctx.createRadialGradient(640, 320, 50, 640, 320, 480);
      radG.addColorStop(0, "rgba(0, 230, 118, 0.15)");
      radG.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radG;
      ctx.fillRect(0, 0, this.width, this.height);

      // Central Glassmorphic Dossier Frame
      const mx = 240, my = 40, mw = 800, mh = 635, cut = 16;
      ctx.save();
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
      bgGrad.addColorStop(0, "rgba(12, 24, 38, 0.98)");
      bgGrad.addColorStop(1, "rgba(6, 12, 20, 0.99)");
      ctx.fillStyle = bgGrad;
      ctx.fill();

      ctx.strokeStyle = "#00e676";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00e676";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Animated Victory Hexagon Crest Medal at (640, 105)
      ctx.save();
      ctx.translate(640, 105);
      const hexR = 32;
      ctx.rotate(Math.sin(t * 1.5) * 0.08);

      // Rotating particle rays
      ctx.strokeStyle = "rgba(0, 230, 118, 0.4)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const ang = (t * 0.8) + (Math.PI * 2 / 8) * i;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * (hexR + 4), Math.sin(ang) * (hexR + 4));
        ctx.lineTo(Math.cos(ang) * (hexR + 14), Math.sin(ang) * (hexR + 14));
        ctx.stroke();
      }

      ctx.fillStyle = "#0a2618";
      ctx.strokeStyle = "#ffd600";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = Math.cos(a) * hexR;
        const py = Math.sin(a) * hexR;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffd600";
      ctx.font = "900 24px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("★", 0, 8);
      ctx.restore();

      // Victory Title
      ctx.save();
      ctx.shadowColor = "rgba(0, 230, 118, 0.85)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#00e676";
      ctx.font = "900 32px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("🏆 G'ALABA! SEKTOR TO'LIQ HIMOYALANDI", 640, 172);
      ctx.restore();

      ctx.fillStyle = "#cfd8dc";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("OPERATSIYA MUVAFFAQIShIYATLI YAKUNLANDI • BAZA YADROSI XAVFSIZ", 640, 196);

      // 4 Telemetry Pods (y: 215, h: 62)
      const podW = 175;
      const podH = 62;
      const pods = [
        { label: "⚔️ TO'LQINLAR", val: `${this.wave}/${this.maxWaves > 50 ? '∞' : this.maxWaves}`, col: "#00e5ff" },
        { label: "💀 QATLIOM", val: `${this.analytics.totalKills} HOSTILES`, col: "#ff1744" },
        { label: "⚡ DAROMAD", val: `+${this.analytics.totalGold}G`, col: "#ffd600" },
        { label: "🏆 TAKTIK BALL", val: `${this.score} PTS`, col: "#00e676" }
      ];

      for (let i = 0; i < 4; i++) {
        const px = mx + 38 + i * (podW + 12);
        const py = 215;

        ctx.fillStyle = "rgba(10, 18, 30, 0.95)";
        ctx.beginPath();
        ctx.roundRect(px, py, podW, podH, 6);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#90a4ae";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(pods[i].label, px + podW / 2, py + 22);

        ctx.fillStyle = pods[i].col;
        ctx.font = "900 15px 'Segoe UI', monospace";
        ctx.fillText(pods[i].val, px + podW / 2, py + 46);
      }

      // MVP Tower Spotlight Card (y: 295, h: 58)
      ctx.fillStyle = "rgba(14, 26, 44, 0.92)";
      ctx.beginPath();
      ctx.roundRect(mx + 38, 292, mw - 76, 58, 6);
      ctx.fill();
      ctx.strokeStyle = "#ffd600";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 13px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`🎖️ ENG SAMARALI QUROL (MVP): ${(this.analytics.mvpName || "CYBER HERO MECH").toUpperCase()}`, mx + 55, 318);

      ctx.fillStyle = "#b0bec5";
      ctx.font = "11px monospace";
      ctx.fillText(`Bu minora umumiy mudofaada hal qiluvchi rol o'ynadi va eng ko'p zarba berdi.`, mx + 55, 337);

      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "right";
      const starsEarned = (this.saveData && this.saveData.stars && this.saveData.stars[MAPS[this.currentMapIndex].id]) || 3;
      const starStr = "★".repeat(Math.min(3, Math.max(1, starsEarned)));
      ctx.fillText(starStr, mx + mw - 55, 328);

      // Action Buttons
      this.drawCyberButton(340, 410, 180, 52, this.t("playAgain"), "#00e676", "RETRY SECTOR", "▶", true);
      this.drawCyberButton(550, 410, 180, 52, "STATISTIKA", "#ffd600", "BATTLE REPORT", "📊", false);
      this.drawCyberButton(760, 410, 180, 52, this.t("mainMenu"), "#00e5ff", "COMMAND HQ", "←", false);

      this.drawCyberButton(340, 475, 600, 50, "♾️ CHEKSIZ REJIMDA DAVOM ETISH", "#e040fb", "CHEKSIZ TO'LQINLAR BILAN DAVOM ETISH", "⚡", true);
      ctx.restore();
    }

    renderDefeatModal() {
      const ctx = this.ctx;
      const t = this.uiTime || 0;
      const isEndless = (this.gameMode === 'ENDLESS');

      // Crimson Darkened Atmospheric Backdrop with Red Vignette
      ctx.fillStyle = "rgba(10, 4, 8, 0.95)";
      ctx.fillRect(0, 0, this.width, this.height);

      const radG = ctx.createRadialGradient(640, 320, 60, 640, 320, 520);
      radG.addColorStop(0, isEndless ? "rgba(224, 64, 251, 0.15)" : "rgba(255, 23, 68, 0.20)");
      radG.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radG;
      ctx.fillRect(0, 0, this.width, this.height);

      // Central Frame: x: 240, y: 40, w: 800, h: 635
      const mx = 240, my = 40, mw = 800, mh = 635, cut = 16;
      ctx.save();
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
      bgGrad.addColorStop(0, "rgba(26, 12, 18, 0.98)");
      bgGrad.addColorStop(1, "rgba(12, 6, 10, 0.99)");
      ctx.fillStyle = bgGrad;
      ctx.fill();

      ctx.strokeStyle = isEndless ? "#e040fb" : "#ff1744";
      ctx.lineWidth = 2;
      ctx.shadowColor = isEndless ? "#e040fb" : "#ff1744";
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Caution Hazard Stripes Bar across Header
      ctx.save();
      ctx.beginPath();
      ctx.rect(mx + 2, my + 2, mw - 4, 14);
      ctx.clip();
      ctx.fillStyle = "#1e080e";
      ctx.fillRect(mx + 2, my + 2, mw - 4, 14);
      const stripeOffset = (t * 25) % 30;
      ctx.fillStyle = isEndless ? "rgba(224, 64, 251, 0.6)" : "rgba(255, 23, 68, 0.6)";
      for (let sx = mx - 40 + stripeOffset; sx < mx + mw + 40; sx += 30) {
        ctx.beginPath();
        ctx.moveTo(sx, my + 2);
        ctx.lineTo(sx + 15, my + 2);
        ctx.lineTo(sx + 5, my + 16);
        ctx.lineTo(sx - 10, my + 16);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Title Typography
      ctx.save();
      ctx.shadowColor = isEndless ? "rgba(224, 64, 251, 0.9)" : "rgba(255, 23, 68, 0.9)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = isEndless ? "#e040fb" : "#ff1744";
      ctx.font = "900 34px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText(isEndless ? "♾️ CHEKSIZ REJIM YAKUNLANDI" : "💀 SEKTOR VAYRON BO'LDI", 640, 160);
      ctx.restore();

      ctx.fillStyle = "#b0bec5";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("MUDOFAA CHIZIG'I BUZILDI • BAZA YADRO REAKTORI ZARARLANDI", 640, 188);

      // 4 Telemetry Pods (y: 215, h: 62)
      const podW = 175;
      const podH = 62;
      const record = localStorage.getItem('lg_endless_wave') || this.wave;
      const pods = [
        { label: "⚔️ YETIB KELINDI", val: `WAVE ${this.wave}`, col: "#ff1744" },
        { label: "🏆 REKORD TO'LQIN", val: `WAVE ${record}`, col: "#ffd600" },
        { label: "💀 QATLIOM", val: `${this.analytics.totalKills} TA`, col: "#00e5ff" },
        { label: "⚡ BALL", val: `${this.score} PTS`, col: isEndless ? "#e040fb" : "#ff1744" }
      ];

      for (let i = 0; i < 4; i++) {
        const px = mx + 38 + i * (podW + 12);
        const py = 215;

        ctx.fillStyle = "rgba(18, 10, 14, 0.95)";
        ctx.beginPath();
        ctx.roundRect(px, py, podW, podH, 6);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 23, 68, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#90a4ae";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(pods[i].label, px + podW / 2, py + 22);

        ctx.fillStyle = pods[i].col;
        ctx.font = "900 15px 'Segoe UI', monospace";
        ctx.fillText(pods[i].val, px + podW / 2, py + 46);
      }

      // Tactical Debrief Intel Advice Card (y: 295, h: 60)
      ctx.fillStyle = "rgba(20, 10, 16, 0.95)";
      ctx.beginPath();
      ctx.roundRect(mx + 38, 292, mw - 76, 60, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 214, 0, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText("📡 HQ TAKTIK RAZVODKA TAVSIYASI:", mx + 55, 316);

      ctx.fillStyle = "#cfd8dc";
      ctx.font = "11px monospace";
      const advice = (this.wave >= 20) ?
        "Titan Bosslarning qalin zirhini teshish uchun Railgun va Flame minoralari kombinatsiyasidan foydalaning!" :
        "Tezkor dushmanlarni to'xtatish uchun Cryo sekinlatgichlari va Tesla elektr zanjirlarini erta quring.";
      ctx.fillText(advice, mx + 55, 335);

      // Action Buttons
      this.drawCyberButton(340, 410, 180, 52, this.t("retry"), isEndless ? "#e040fb" : "#ff1744", "RESTART SECTOR", "🔄", true);
      this.drawCyberButton(550, 410, 180, 52, "STATISTIKA", "#ffd600", "BATTLE REPORT", "📊", false);
      this.drawCyberButton(760, 410, 180, 52, this.t("mainMenu"), "#00e5ff", "COMMAND HQ", "←", false);
      ctx.restore();
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

      // Gun Fire Cooldown, Skills & Recoil Decay
      if (p.fireCd > 0) p.fireCd = Math.max(0, p.fireCd - dt);
      if (p.missileCd > 0) p.missileCd = Math.max(0, p.missileCd - dt);
      if (p.empCd > 0) p.empCd = Math.max(0, p.empCd - dt);
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
          t.spawnInterval = 1.1;
          const ang = Math.random() * Math.PI - Math.PI / 2;
          const dist = 75;
          const ex = Math.sin(ang) * dist;
          const ez = -35 - Math.cos(ang) * (dist * 0.7);
          const randType = Math.random();
          const eType = randType < 0.20 ? 'kamikaze' : (randType < 0.40 ? 'gunship' : (randType < 0.65 ? 'brute' : (randType < 0.85 ? 'sprinter' : 'grunt')));
          t.enemies.push({
            type: eType,
            x: ex, y: (eType === 'gunship' ? 3.5 : 0), z: ez,
            hp: eType === 'brute' ? 350 : (eType === 'gunship' ? 240 : (eType === 'kamikaze' ? 65 : (eType === 'sprinter' ? 60 : 120))),
            maxHp: eType === 'brute' ? 350 : (eType === 'gunship' ? 240 : (eType === 'kamikaze' ? 65 : (eType === 'sprinter' ? 60 : 120))),
            speed: eType === 'kamikaze' ? 16 : (eType === 'sprinter' ? 12 : (eType === 'gunship' ? 8.5 : (eType === 'brute' ? 4.5 : 7.0))),
            size: eType === 'brute' ? 1.8 : (eType === 'gunship' ? 1.4 : 1.1),
            color: eType === 'kamikaze' ? '#ff3d00' : (eType === 'gunship' ? '#00e5ff' : (eType === 'brute' ? '#ffd600' : (eType === 'sprinter' ? '#ff9100' : '#ff1744'))),
            atkCd: 0,
            stunTimer: 0
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
        if (e.stunTimer > 0) {
          e.stunTimer -= dt;
          continue;
        }

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
            const dmg = (e.type === 'kamikaze') ? 60 : 25;
            t.core.health = Math.max(0, t.core.health - dmg);
            this.screenShake = 6;
            audio.leak();
            if (e.type === 'kamikaze') {
              t.enemies.splice(i, 1);
              continue;
            }
          }
        }
        // Attack player
        if (distToPlayer < 2.2) {
          e.atkCd = (e.atkCd || 0) - dt;
          if (e.atkCd <= 0) {
            e.atkCd = 1.2;
            const rawDmg = (e.type === 'kamikaze') ? 45 : 15;
            const armorRed = (p.mode === 'SIEGE') ? 0.50 : 1.0;
            p.health = Math.max(0, p.health - Math.round(rawDmg * armorRed));
            this.screenShake = 6;
            this.vibrate([60, 40, 60]);
            audio.leak();
            if (e.type === 'kamikaze') {
              t.enemies.splice(i, 1);
              continue;
            }
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

            if (b.splashRadius > 0) {
              for (const other of t.enemies) {
                if (other !== e && Math.hypot(other.x - b.x, other.z - b.z) <= b.splashRadius) {
                  other.hp -= Math.round(finalDmg * 0.7);
                }
              }
              for (let k = 0; k < 12; k++) {
                t.particles.push({ x: b.x + (Math.random() - 0.5) * 4, y: 0.5 + Math.random() * 2, z: b.z + (Math.random() - 0.5) * 4, life: 0.4, maxLife: 0.4, color: "#ff9100" });
              }
            }

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

      const isSiege = (p.mode === 'SIEGE');
      p.ammo -= (isSiege ? 2 : 1);
      p.fireCd = (isSiege ? 0.45 : 0.12);
      p.recoil = (isSiege ? 2.2 : 1.0);
      this.screenShake = (isSiege ? 7 : 2);

      if (isSiege) audio.explosion();
      else audio.shootPulse();

      const speed = isSiege ? 95 : 120;
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
        damage: isSiege ? 160 : 45,
        isSiege: isSiege,
        splashRadius: isSiege ? 7.0 : 0,
        life: 0.85
      });
    }

    fire3DMissiles() {
      const t = this.tps3D;
      const p = t.player;
      if (p.missileCd > 0) return;
      p.missileCd = 8.0;
      audio.missileLaunch();
      this.screenShake = 6;
      this.addFloatingText("🚀 3D MISSILE SALVO!", 640, 260, "#ffd600", 22);

      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          if (!this.tps3D) return;
          const target = t.enemies[i % t.enemies.length] || null;
          const a = p.yaw + (Math.random() - 0.5) * 0.8;
          t.bullets.push({
            x: p.x + (i % 2 === 0 ? -1.0 : 1.0),
            y: 2.2,
            z: p.z,
            vx: Math.sin(a) * 45,
            vy: 8.0 + Math.random() * 6,
            vz: -Math.cos(a) * 45,
            damage: 95,
            isMissile: true,
            splashRadius: 5.0,
            target: target,
            life: 1.8
          });
        }, i * 90);
      }
    }

    fire3DEMP() {
      const t = this.tps3D;
      const p = t.player;
      if (p.empCd > 0) return;
      p.empCd = 12.0;
      audio.zap();
      this.screenShake = 12;
      this.addFloatingText("⚡ 3D EMP SHOCKWAVE DISCHARGED!", 640, 240, "#00e5ff", 24);

      for (const e of t.enemies) {
        e.stunTimer = 4.0;
        e.hp -= 40;
      }
      for (let i = 0; i < 30; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 30;
        t.particles.push({
          x: p.x + Math.cos(ang) * dist,
          y: 0.5 + Math.random() * 2.5,
          z: p.z + Math.sin(ang) * dist,
          life: 0.6, maxLife: 0.6,
          color: "#00e5ff"
        });
      }
    }

    toggle3DMechMode() {
      const p = this.tps3D.player;
      p.mode = (p.mode === 'SIEGE') ? 'BIPED' : 'SIEGE';
      p.speed = (p.mode === 'SIEGE') ? 8.0 : 14.0;
      audio.mechTransform();
      this.screenShake = 8;
      const modeStr = (p.mode === 'SIEGE') ? "🚜 SIEGE TANK FAOL! 120MM GAUBITSA" : "🤖 ASSAULT ROBOT! TEZKOR HARAKAT";
      const modeCol = (p.mode === 'SIEGE') ? "#ffd600" : "#00e5ff";
      this.addFloatingText(modeStr, 640, 200, modeCol, 22);
      this.triggerRadioComm("APEX-01 AI", modeStr, 3.5, "hero_dash");
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
      if (!this.tps3D) this.start3DTPSMode();
      const ctx = this.ctx;
      const t = this.tps3D;
      const p = t.player;

      // 1. Cyber Skybox & Atmosphere (Cached to eliminate GC pause)
      if (!this._tpsSkyGrad) {
        this._tpsSkyGrad = ctx.createLinearGradient(0, 0, 0, 720);
        this._tpsSkyGrad.addColorStop(0, "#030712");
        this._tpsSkyGrad.addColorStop(0.5, "#0b1329");
        this._tpsSkyGrad.addColorStop(1, "#111827");
      }
      ctx.fillStyle = this._tpsSkyGrad;
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

      // 5. 3D Enemies (Sorted back to front - Zero GC allocation)
      if (!this._tpsRenderList) this._tpsRenderList = [];
      this._tpsRenderList.length = 0;
      const renderList = this._tpsRenderList;
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

        // Soft ground shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.beginPath();
        ctx.ellipse(ep.x, ep.y, ew * 0.9, ew * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // High-Fidelity 3D Enemy Models
        if (e.type === 'sprinter') {
          // 4-legged cyber-hound silhouette
          ctx.fillStyle = "#1e293b";
          ctx.beginPath();
          ctx.roundRect(ep.x - ew * 0.6, ep.y - eh * 0.7, ew * 1.2, eh * 0.45, [ew * 0.2]);
          ctx.fill();
          ctx.strokeStyle = e.color || "#ffd600";
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Paws
          const gallop = Math.sin((e.walkAnim || 0) * 2) * (eh * 0.15);
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(ep.x - ew * 0.5, ep.y - eh * 0.25 + gallop, ew * 0.25, eh * 0.25);
          ctx.fillRect(ep.x + ew * 0.25, ep.y - eh * 0.25 - gallop, ew * 0.25, eh * 0.25);

          // Crimson Visor
          ctx.fillStyle = "#ff1744";
          ctx.fillRect(ep.x - ew * 0.2, ep.y - eh * 0.65, ew * 0.4, eh * 0.12);
        } else if (e.type === 'brute') {
          // Goliath War-Mech
          ctx.fillStyle = "#334155";
          ctx.fillRect(ep.x - ew * 0.7, ep.y - eh * 0.9, ew * 1.4, eh * 0.6);
          ctx.strokeStyle = e.color || "#ff007f";
          ctx.lineWidth = 2.0;
          ctx.strokeRect(ep.x - ew * 0.7, ep.y - eh * 0.9, ew * 1.4, eh * 0.6);

          // Hazard stripes
          ctx.fillStyle = "#ffd600";
          ctx.fillRect(ep.x - ew * 0.5, ep.y - eh * 0.85, ew * 0.3, eh * 0.5);
          ctx.fillStyle = "#000000";
          ctx.fillRect(ep.x - ew * 0.2, ep.y - eh * 0.85, ew * 0.3, eh * 0.5);

          // Massive Fists
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(ep.x - ew * 0.9, ep.y - eh * 0.5, ew * 0.35, eh * 0.35);
          ctx.fillRect(ep.x + ew * 0.55, ep.y - eh * 0.5, ew * 0.35, eh * 0.35);

          // Stomping Feet
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(ep.x - ew * 0.6, ep.y - eh * 0.3, ew * 0.45, eh * 0.3);
          ctx.fillRect(ep.x + ew * 0.15, ep.y - eh * 0.3, ew * 0.45, eh * 0.3);
        } else {
          // Grunt & General Hostile
          ctx.fillStyle = e.color || "#00e5ff";
          ctx.beginPath();
          ctx.roundRect(ep.x - ew / 2, ep.y - eh, ew, eh, [ew * 0.3]);
          ctx.fill();
          ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
          ctx.fillRect(ep.x - ew / 2, ep.y - eh * 0.35, ew, eh * 0.35);
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Visor & Weapon
          ctx.fillStyle = "#ff1744";
          ctx.fillRect(ep.x - ew * 0.35, ep.y - eh * 0.85, ew * 0.7, eh * 0.15);
          ctx.fillStyle = "#334155";
          ctx.fillRect(ep.x + ew * 0.2, ep.y - eh * 0.5, ew * 0.4, eh * 0.15);
        }

        // Floating HP Bar
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
        const walkCycle = Math.sin(p.walkAnim || 0) * (ph * 0.08);

        // Ground Occlusion Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.beginPath();
        ctx.ellipse(pp.x, pp.y, pw * 0.85, pw * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Articulated Walking Legs (Biped Mode)
        if (p.mode !== 'SIEGE') {
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(pp.x - pw * 0.38, pp.y - ph * 0.35 + walkCycle, pw * 0.3, ph * 0.38);
          ctx.fillRect(pp.x + pw * 0.08, pp.y - ph * 0.35 - walkCycle, pw * 0.3, ph * 0.38);
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 1.0;
          ctx.strokeRect(pp.x - pw * 0.38, pp.y - ph * 0.35 + walkCycle, pw * 0.3, ph * 0.38);
          ctx.strokeRect(pp.x + pw * 0.08, pp.y - ph * 0.35 - walkCycle, pw * 0.3, ph * 0.38);
        } else {
          // Dual Heavy Caterpillar Treads
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(pp.x - pw * 0.7, pp.y - ph * 0.4, pw * 0.35, ph * 0.45);
          ctx.fillRect(pp.x + pw * 0.35, pp.y - ph * 0.4, pw * 0.35, ph * 0.45);
          ctx.strokeStyle = "#ffd600";
          ctx.lineWidth = 1.2;
          ctx.strokeRect(pp.x - pw * 0.7, pp.y - ph * 0.4, pw * 0.35, ph * 0.45);
          ctx.strokeRect(pp.x + pw * 0.35, pp.y - ph * 0.4, pw * 0.35, ph * 0.45);
        }

        // Armored Torso Chassis
        ctx.fillStyle = (p.mode === 'SIEGE') ? "#1e293b" : "#0f172a";
        ctx.beginPath();
        ctx.roundRect(pp.x - pw * 0.4, pp.y - ph * 0.9, pw * 0.8, ph * 0.65, [pw * 0.2]);
        ctx.fill();
        ctx.fillStyle = "#334155";
        ctx.fillRect(pp.x - pw * 0.35, pp.y - ph * 0.85, pw * 0.7, ph * 0.25);
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Quantum Reactor Core Glow
        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(pp.x, pp.y - ph * 0.6, pw * 0.16, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit Helmet & Cyan Visor
        ctx.fillStyle = "#090d16";
        ctx.beginPath();
        ctx.arc(pp.x, pp.y - ph * 0.95, pw * 0.26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#00e5ff";
        ctx.fillRect(pp.x - pw * 0.2, pp.y - ph * 0.98, pw * 0.4, ph * 0.1);

        // Weapon Rig with Recoil & Flash
        const recoilOffset = p.recoil * 10;
        const gunX = pp.x + pw * 0.45;
        const gunY = pp.y - ph * 0.55 + recoilOffset;

        if (p.mode === 'SIEGE') {
          // Twin 120mm Heavy Artillery Cannons
          ctx.fillStyle = "#334155";
          ctx.fillRect(gunX - 6, gunY - 4, 28, 6);
          ctx.fillRect(gunX - 6, gunY + 4, 28, 6);
          ctx.fillStyle = "#ffd600";
          ctx.fillRect(gunX + 20, gunY - 5, 4, 8);
          ctx.fillRect(gunX + 20, gunY + 3, 4, 8);
        } else {
          // Rotary Gatling Autocannon
          ctx.fillStyle = "#475569";
          ctx.fillRect(gunX - 4, gunY - 3, 24, 7);
          ctx.fillStyle = "#00e5ff";
          ctx.fillRect(gunX + 16, gunY - 2, 8, 3);
        }

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

      // 10. Futuristic Sci-Fi Helmet Visor HUD Overlay
      ctx.save();
      const vColor = "rgba(0, 229, 255, 0.45)";
      ctx.strokeStyle = vColor;
      ctx.lineWidth = 2;

      // 4 Visor Corner Brackets
      const cLen = 45;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(35 + cLen, 25); ctx.lineTo(35, 25); ctx.lineTo(35, 25 + cLen);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(1245 - cLen, 25); ctx.lineTo(1245, 25); ctx.lineTo(1245, 25 + cLen);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(35 + cLen, 695); ctx.lineTo(35, 695); ctx.lineTo(35, 695 - cLen);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(1245 - cLen, 695); ctx.lineTo(1245, 695); ctx.lineTo(1245, 695 - cLen);
      ctx.stroke();

      // Visor Peripheral Tick Marks
      ctx.lineWidth = 1;
      for (let y = 140; y <= 580; y += 40) {
        ctx.beginPath(); ctx.moveTo(35, y); ctx.lineTo(43, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(1245, y); ctx.lineTo(1237, y); ctx.stroke();
      }

      // 11. Top Center: 360° Tactical Compass Tape (x: 480..800, y: 16..46)
      const compX = 480, compY = 16, compW = 320, compH = 30;
      ctx.fillStyle = "rgba(6, 12, 24, 0.92)";
      ctx.beginPath();
      ctx.roundRect(compX, compY, compW, compH, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Clip inside compass tape
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(compX + 2, compY + 2, compW - 4, compH - 4, 4);
      ctx.clip();

      const curYawDeg = ((p.yaw * 180 / Math.PI) % 360 + 360) % 360;
      const degScale = compW / 120; // 120 degrees visible at once

      const cardinals = [
        { deg: 0, label: "N" }, { deg: 45, label: "NE" }, { deg: 90, label: "E" },
        { deg: 135, label: "SE" }, { deg: 180, label: "S" }, { deg: 225, label: "SW" },
        { deg: 270, label: "W" }, { deg: 315, label: "NW" }
      ];

      for (let d = -180; d <= 540; d += 15) {
        let diff = ((d - curYawDeg + 540) % 360) - 180;
        if (Math.abs(diff) <= 65) {
          const tickX = compX + compW / 2 + diff * degScale;
          const card = cardinals.find(c => Math.abs(c.deg - ((d % 360 + 360) % 360)) < 1);
          if (card) {
            ctx.fillStyle = (card.label === "N") ? "#ff1744" : "#00e5ff";
            ctx.font = "900 11px monospace";
            ctx.textAlign = "center";
            ctx.fillText(card.label, tickX, compY + 18);
          } else {
            ctx.strokeStyle = "rgba(0, 229, 255, 0.5)";
            ctx.beginPath();
            ctx.moveTo(tickX, compY + 18);
            ctx.lineTo(tickX, compY + compH - 3);
            ctx.stroke();
          }
        }
      }

      // Compass Blip: Base Core (0, 0, -35)
      const coreAng = (Math.atan2(t.core.x - p.x, -(t.core.z - p.z)) * 180 / Math.PI + 360) % 360;
      let coreDiff = ((coreAng - curYawDeg + 540) % 360) - 180;
      if (Math.abs(coreDiff) <= 60) {
        const blipX = compX + compW / 2 + coreDiff * degScale;
        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(blipX, compY + 8, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Compass Blips: Active Enemies
      for (const e of t.enemies) {
        const eAng = (Math.atan2(e.x - p.x, -(e.z - p.z)) * 180 / Math.PI + 360) % 360;
        let eDiff = ((eAng - curYawDeg + 540) % 360) - 180;
        if (Math.abs(eDiff) <= 60) {
          const blipX = compX + compW / 2 + eDiff * degScale;
          ctx.fillStyle = e.isBoss ? "#ff1744" : "#ffd600";
          ctx.beginPath();
          ctx.arc(blipX, compY + 8, e.isBoss ? 4.5 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore(); // end compass clip

      // Compass Center Marker
      ctx.fillStyle = "#ffd600";
      ctx.beginPath();
      ctx.moveTo(compX + compW / 2, compY + compH - 2);
      ctx.lineTo(compX + compW / 2 - 4, compY + compH + 4);
      ctx.lineTo(compX + compW / 2 + 4, compY + compH + 4);
      ctx.closePath();
      ctx.fill();

      // Top Status Bar
      this.renderMiniButton(20, 16, 155, 34, "← 2D STRATEGIYA", "#00e5ff");

      // Right Top Waves & Score Glass Pill
      ctx.fillStyle = "rgba(8, 14, 26, 0.9)";
      ctx.beginPath();
      ctx.roundRect(830, 16, 415, 32, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.stroke();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`WAVE: ${t.wave}`, 845, 36);
      ctx.fillText(`PTS: ${t.score}`, 945, 36);

      ctx.fillStyle = "#cfd8dc";
      ctx.fillText(`CORE:`, 1045, 36);
      const hpPct = Math.max(0, t.core.health / t.core.maxHealth);
      ctx.fillStyle = "rgba(10, 20, 32, 0.9)";
      ctx.fillRect(1100, 24, 130, 15);
      ctx.fillStyle = hpPct > 0.4 ? "#00e676" : "#ff1744";
      ctx.fillRect(1100, 24, 130 * hpPct, 15);
      ctx.strokeStyle = "#455a64";
      ctx.strokeRect(1100, 24, 130, 15);

      // Bottom-Left Pod: Mech Hull Health & Shield Integrity
      ctx.fillStyle = "rgba(8, 14, 26, 0.94)";
      ctx.beginPath();
      ctx.roundRect(30, 582, 240, 52, 6);
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.stroke();

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      const modeTitle = (p.mode === 'SIEGE') ? "🚜 SIEGE TANK [ARMORED]" : "🤖 APEX-01 [BIPED ASSAULT]";
      ctx.fillText(modeTitle, 42, 600);

      // 10 Health Pips
      const pips = 10;
      const phpPct = p.health / p.maxHealth;
      for (let pi = 0; pi < pips; pi++) {
        const pipW = 18;
        const pipX = 42 + pi * (pipW + 3);
        ctx.fillStyle = (pi < Math.ceil(phpPct * pips)) ? (phpPct > 0.4 ? "#00e5ff" : "#ff1744") : "rgba(30, 50, 70, 0.4)";
        ctx.fillRect(pipX, 608, pipW, 14);
      }

      // Bottom-Left Pod: Plasma Ammo Cells & Overheat
      ctx.fillStyle = "rgba(8, 14, 26, 0.94)";
      ctx.beginPath();
      ctx.roundRect(30, 642, 240, 58, 6);
      ctx.fill();
      ctx.strokeStyle = p.isReloading ? "#ff1744" : "#ffd600";
      ctx.stroke();

      ctx.fillStyle = "#ffd600";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`⚡ AMMO: ${p.ammo}/${p.maxAmmo} (${p.reserveAmmo})`, 42, 662);

      // 15 Ammo Bars
      const ammoPips = 15;
      const ammoPct = p.ammo / p.maxAmmo;
      for (let ai = 0; ai < ammoPips; ai++) {
        const apW = 12;
        const apX = 42 + ai * (apW + 2);
        ctx.fillStyle = (ai < Math.ceil(ammoPct * ammoPips)) ? "#ffd600" : "rgba(40, 45, 30, 0.4)";
        ctx.fillRect(apX, 670, apW, 12);
      }
      if (p.isReloading) {
        ctx.fillStyle = "#ff1744";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "right";
        ctx.fillText("RELOADING...", 255, 662);
      }
      ctx.restore(); // end visor save

      // Mobile Touch Action Sci-Fi Circular Buttons (Right side - Non-overlapping ergonomic layout)
      this.render3DCircularButton(1200, 625, 48, "💥 OTISH", "FIRE", "#ff1744", false);
      this.render3DCircularButton(1200, 505, 36, "🔄 O'Q", "RELOAD", "#ffd600", p.isReloading);
      this.render3DCircularButton(1080, 630, 36, "🎯 DURBIN", "AIM", "#00e5ff", p.isAiming);
      this.render3DCircularButton(1080, 515, 36, "🏗️ QURISH", "BUILD", "#00e676", t.isBuilding);

      // Mech Mode & Super Skill Action Buttons
      const modeLabel = (p.mode === 'SIEGE') ? "🚜 TANK" : "🤖 ROBOT";
      const modeCol = (p.mode === 'SIEGE') ? "#ffd600" : "#00e5ff";
      this.renderMiniButton(840, 625, 105, 48, modeLabel, modeCol);
      this.renderMiniButton(840, 555, 105, 48, p.empCd > 0 ? `EMP ${Math.ceil(p.empCd)}s` : "⚡ EMP", "#00e5ff");
      this.renderMiniButton(960, 555, 105, 48, p.missileCd > 0 ? `MSL ${Math.ceil(p.missileCd)}s` : "🚀 RAKETA", "#ffd600");

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

  window.LastGridEngine = LastGridEngine;

  window.addEventListener('DOMContentLoaded', () => {
    window.lastGridEngine = new LastGridEngine();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // Global Cross-Platform WebAudio Silent Buffer Unlocker (iOS Safari / Mobile Chrome / Android WebView)
    const unlockAudioPipeline = () => {
      if (typeof audio !== 'undefined' && audio) {
        if (!audio.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) audio.ctx = new AudioCtx();
        }
        if (audio.ctx && audio.ctx.state === 'suspended') {
          audio.ctx.resume().catch(() => {});
        }
        if (audio.ctx) {
          try {
            const buffer = audio.ctx.createBuffer(1, 1, 22050);
            const source = audio.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(audio.ctx.destination);
            source.start(0);
          } catch(e) {}
        }
        if (!audio.bgmPlaying && !audio.bgmMuted) {
          audio.startBGM();
        }
      }
    };
    ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlockAudioPipeline, { passive: true });
    });
  });

})();
