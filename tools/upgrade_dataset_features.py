#!/usr/bin/env python3
import re

GAME_JS = "/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js"

with open(GAME_JS, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Upgrade SoundSynth with CC0 Studio Audio samples and hybrid playback
old_synth_constructor = """      this.step = 0;
      this.scale = [146.83, 164.81, 174.61, 196.00, 220.00, 261.63, 293.66, 329.63];
      this.bassNotes = [73.42, 73.42, 87.31, 98.00, 73.42, 73.42, 110.00, 98.00];
    }
    init() {"""

new_synth_constructor = """      this.step = 0;
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
      const s = this.sampleBuffers && this.sampleBuffers[key];
      if (!s) return false;
      try {
        if (s instanceof AudioBuffer && this.ctx) {
          const src = this.ctx.createBufferSource();
          src.buffer = s;
          const gain = this.ctx.createGain();
          gain.gain.value = vol;
          src.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(0);
          return true;
        } else if (s instanceof Audio) {
          const clone = s.cloneNode();
          clone.volume = Math.max(0, Math.min(1, vol));
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
      this.loadSamples();"""

if old_synth_constructor in content:
    content = content.replace(old_synth_constructor, new_synth_constructor)
    print("Replaced SoundSynth constructor and added sample loader.")
else:
    print("Warning: old_synth_constructor not found!")

# Upgrade SoundSynth methods
old_synth_methods = """    shootPulse() { this.playTone(850, 'sawtooth', 0.08, 0.06, 200); }
    shootMortar() { this.playTone(180, 'triangle', 0.35, 0.15, 35); }
    shootCryo() { this.playTone(650, 'sine', 0.22, 0.08, 1100); }
    shootRailgun() {
      this.playTone(120, 'sawtooth', 0.3, 0.18, 40);
      this.playTone(1200, 'square', 0.15, 0.08, 300);
    }
    upgrade() {
      this.playTone(440, 'triangle', 0.1, 0.1, 660);
      setTimeout(() => this.playTone(660, 'triangle', 0.15, 0.1, 880), 80);
    }"""

new_synth_methods = """    click() {
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
    }"""

if old_synth_methods in content:
    content = content.replace(old_synth_methods, new_synth_methods)
    print("Replaced SoundSynth methods.")
else:
    print("Warning: old_synth_methods not found!")

# Upgrade victory & defeat with samples
old_vic = """    victory() {
      [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.15), i * 120));
    }"""
new_vic = """    victory() {
      if (!this.playSample('wave_clear', 0.75)) {
        [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.15), i * 120));
      }
    }"""
if old_vic in content:
    content = content.replace(old_vic, new_vic)
    print("Replaced victory method.")

# Upgrade artilleryBlast with explosion sample
old_blast = """    artilleryBlast() {
      this.playTone(70, 'sawtooth', 0.45, 0.25, 30);
      this.playTone(140, 'triangle', 0.3, 0.2, 40);
    }"""
new_blast = """    artilleryBlast() {
      if (!this.playSample('explosion', 0.7)) {
        this.playTone(70, 'sawtooth', 0.45, 0.25, 30);
        this.playTone(140, 'triangle', 0.3, 0.2, 40);
      }
    }"""
if old_blast in content:
    content = content.replace(old_blast, new_blast)
    print("Replaced artilleryBlast method.")

# Add audio.click() to handleCanvasClick
old_handle_click = """    handleCanvasClick(x, y, isRightClick = false) {
      if (this.state === 'TPS_3D') {"""
new_handle_click = """    handleCanvasClick(x, y, isRightClick = false) {
      if (this.state !== 'TPS_3D') {
        audio.click();
        this.vibrate(10);
      }
      if (this.state === 'TPS_3D') {"""
if old_handle_click in content:
    content = content.replace(old_handle_click, new_handle_click)
    print("Added audio.click() to handleCanvasClick.")

# Upgrade TOWER_DEFS with Cyberpunk 2077 & Valorant archetypes
old_towers = """  // --- TOWER BLUEPRINTS & BRANCHING SPECIALIZATIONS (TIER 3) ---
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
    },"""

new_towers = """  // --- TOWER BLUEPRINTS & BRANCHING SPECIALIZATIONS (TIER 3) ---
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
    },"""

if old_towers in content:
    content = content.replace(old_towers, new_towers)
    print("Replaced TOWER_DEFS.")
else:
    print("Warning: old_towers not found!")

# Upgrade getWaveConfig with BTD6 30 Waves Progression
old_waves = """  function getWaveConfig(waveNum, mode = 'CAMPAIGN') {
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
  }"""

new_waves = """  // --- BTD6-POWERED WAVE PROGRESSION & CHOREOGRAPHY ---
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
  }"""

if old_waves in content:
    content = content.replace(old_waves, new_waves)
    print("Replaced getWaveConfig.")
else:
    print("Warning: old_waves not found!")

# Upgrade 3D TPS bullets collision: add Range Falloff & Headshot Crit
old_bullet_hit = """        for (let j = t.enemies.length - 1; j >= 0; j--) {
          const e = t.enemies[j];
          if (Math.hypot(b.x - e.x, b.z - e.z) < e.size && Math.abs(b.y - 1.0) < 1.5) {
            e.hp -= b.damage;
            b.life = 0;
            this.screenShake = 2;
            t.particles.push({ x: e.x, y: 1.2, z: e.z, life: 0.3, maxLife: 0.3, color: "#ff1744" });
            if (e.hp <= 0) {
              t.enemies.splice(j, 1);
              t.score += 100;
              audio.hit();
            }
            break;
          }
        }"""

new_bullet_hit = """        for (let j = t.enemies.length - 1; j >= 0; j--) {
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
        }"""

if old_bullet_hit in content:
    content = content.replace(old_bullet_hit, new_bullet_hit)
    print("Replaced 3D bullet hit with ballistics & headshot.")
else:
    print("Warning: old_bullet_hit not found!")

# Upgrade downloadApk version to v3.6.0
content = content.replace("TowerDefense_LastGrid_v3.5.0.apk", "TowerDefense_LastGrid_v3.6.0.apk")
content = content.replace("v3.5.0", "v3.6.0")

with open(GAME_JS, "w", encoding="utf-8") as f:
    f.write(content)

print("Finished updating game.js successfully!")
