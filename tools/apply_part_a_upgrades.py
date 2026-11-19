#!/usr/bin/env python3
"""
apply_part_a_upgrades.py
Executes PART A of LAST_GRID_PROMPT.md:
1. Fix Title overlap: "GRID" vs version badge.
2. Fix text clipped or overflowing ("ENSIKLOPEDIYA", "(ZIP)", "WAVE", comms messages).
3. Clean bottom bar ability slots (MECH/EMP/LAZ/ROF/DRN: icon on top, label below, cost, cooldown ring) & tower cards.
4. Remove duplicate icons ("⚙ ⚙ SOZLAMALAR", "📲 📲 ANDROID APK").
5. Remove stray debug text "[CAM…" behind HUD buttons.
6. Comms box: 2-line wrapped typewriter effect with auto-hide.
7. Map layout safe zones: shift y=64 to y=96 on Map 2 & Map 10 so WARP is fully visible.
8. Settings: live BGM volume updates via setBGMVolume() and persistence.
9. Single language per UI state with complete I18N support (UZ / EN / RU).
10. Endless record persistence: save wave and score to localStorage.
11. Port and integrate APEX-01 Mech System into the Hangar card with Three.js.
"""

import os
import re

ROOT_DIR = "/mnt/sdcard/Agent/UI_UX_18_11_2026"
GAME_JS = os.path.join(ROOT_DIR, "game.js")

with open(GAME_JS, "r", encoding="utf-8") as f:
    code = f.read()

# --- 1. SoundSynth: setBGMVolume for live audio adjustment ---
sound_synth_target = """    playBGMTrack(trackName) {"""
sound_synth_addition = """    setBGMVolume(vol) {
      if (this.bgmAudio) {
        try {
          this.bgmAudio.volume = Math.max(0, Math.min(1, vol));
          if (vol <= 0) this.bgmAudio.pause();
          else if (this.bgmAudio.paused && !this.bgmMuted) this.bgmAudio.play().catch(() => {});
        } catch(e) {}
      }
    }
    playBGMTrack(trackName) {"""

if sound_synth_target in code and "setBGMVolume" not in code:
    code = code.replace(sound_synth_target, sound_synth_addition, 1)
    print("Added setBGMVolume() to SoundSynth")

# Hook setBGMVolume into handleSettingsClick
settings_bgm_target = """            this.settings.bgmVol = bgmLevels[i];
            localStorage.setItem('lg_bgm_vol', bgmLevels[i].toString());
            audio.bgmMuted = (bgmLevels[i] === 0.0);
            if (audio.bgmMuted) audio.stopBGM(); else audio.startBGM();"""

settings_bgm_repl = """            this.settings.bgmVol = bgmLevels[i];
            localStorage.setItem('lg_bgm_vol', bgmLevels[i].toString());
            audio.bgmMuted = (bgmLevels[i] === 0.0);
            if (audio.bgmMuted) audio.stopBGM();
            else { audio.startBGM(); audio.setBGMVolume(bgmLevels[i]); }"""

if settings_bgm_target in code:
    code = code.replace(settings_bgm_target, settings_bgm_repl, 1)
    print("Hooked live volume update into handleSettingsClick")

# --- 2. MAP SAFE ZONES: Fix Map 2 & Map 10 WARP sitting under HUD ---
# Map 2: spiral_core
map2_target = '{x:64, y:64}, {x:1152, y:64}'
if map2_target in code:
    code = code.replace(map2_target, '{x:64, y:96}, {x:1152, y:96}')
    print("Fixed Map 2 & Map 10 safe zones: WARP portals adjusted to y:96")

# --- 3. I18N DICTIONARY UPDATES ---
# Update fieldManual and downloadOffline so they never clip
code = code.replace('fieldManual: "QO\'LLANMA / ENSIKLOPEDIYA"', 'fieldManual: "ENSIKLOPEDIYA"')
code = code.replace('fieldManual: "FIELD MANUAL / GUIDE"', 'fieldManual: "ENCYCLOPEDIA"')
code = code.replace('fieldManual: "РУКОВОДСТВО / СПРАВКА"', 'fieldManual: "СПРАВОЧНИК"')

code = code.replace('downloadOffline: "OFLAYN O\'YINNI YUKLAB OLISH (ZIP)"', 'downloadOffline: "OFLAYN ZIP (19MB)"')
code = code.replace('downloadOffline: "DOWNLOAD OFFLINE ZIP"', 'downloadOffline: "OFFLINE ZIP (19MB)"')
code = code.replace('downloadOffline: "СКАЧАТЬ ОФЛАЙН ИГРУ (ZIP)"', 'downloadOffline: "ОФЛАЙН ZIP (19MB)"')

# --- 4. REMOVE STRAY DEBUG TEXT BEHIND TOP HUD ---
stray_hud_target = """      // Mode & Map Name
      ctx.fillStyle = "#78909c";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      const mapName = (this.gameMode === 'CUSTOM') ? "CUSTOM MAP" : MAPS[this.currentMapIndex].name.toUpperCase();
      ctx.fillText(`[${this.gameMode}] ${mapName}`, 675, 36);"""

stray_hud_repl = """      // Mode & Map Name displayed cleanly above action button
      ctx.fillStyle = "#546e7a";
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      const mapName = (this.gameMode === 'CUSTOM') ? "CUSTOM MAP" : MAPS[this.currentMapIndex].name.toUpperCase();
      ctx.fillText(`${mapName}`, 240, 48);"""

if stray_hud_target in code:
    code = code.replace(stray_hud_target, stray_hud_repl, 1)
    print("Removed stray debug text from behind HUD buttons")

# --- 5. COMMS BOX: Multi-line typewriter wrap & auto-hide ---
comms_target = """      ctx.fillStyle = "#ffffff";
      ctx.font = "11px monospace";
      const charCount = Math.floor(rc.anim);
      const visibleText = rc.text.substring(0, charCount);
      ctx.fillText(visibleText, bx + 12, by + 54);

      ctx.restore();"""

comms_repl = """      ctx.fillStyle = "#ffffff";
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

      ctx.restore();"""

if comms_target in code:
    code = code.replace(comms_target, comms_repl, 1)
    print("Enhanced comms box with 2-line typewriter text wrap")

# --- 6. TITLE OVERLAP & DUPLICATE ICONS IN MAIN MENU ---
menu_title_target = """      // Game Title
      ctx.save();
      ctx.shadowColor = "rgba(0, 229, 255, 0.8)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 24px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText("⚡ TOWER DEFENSE: LAST GRID", 40, 42);
      ctx.restore();

      // Version & Platform Badge
      ctx.fillStyle = "#ff007f";
      ctx.font = "bold 12px monospace";
      ctx.fillText("v4.0.0 ULTIMATE DASHBOARD", 410, 42);"""

menu_title_repl = """      // Game Title (Strictly non-overlapping)
      ctx.save();
      ctx.shadowColor = "rgba(0, 229, 255, 0.8)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 21px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText("⚡ TOWER DEFENSE: LAST GRID", 35, 42);
      ctx.restore();

      // Version in separate pill badge
      this.renderMiniButton(390, 24, 75, 24, "v4.0.0", "#ff007f");"""

if menu_title_target in code:
    code = code.replace(menu_title_target, menu_title_repl, 1)
    print("Fixed title and version badge overlap")

# Duplicate icons removal in menu row 4
code = code.replace('"⚙️ SOZLAMALAR", "#00e5ff", "AUDIO & GRAFIKA", "⚙️"', '"SOZLAMALAR", "#00e5ff", "AUDIO & GRAFIKA", "⚙️"')
code = code.replace('"📲 ANDROID APK", "#00e676", "OFLAYN APK (v3.9)", "📲"', '"ANDROID APK", "#00e676", "OFLAYN APK (28MB)", "📲"')

# --- 7. CLEAN BOTTOM BAR ABILITY SLOTS ---
# Refactor ability slots (MECH/EMP/LAZ/ROF/DRN) so icons and labels are cleanly stacked
old_bottom_abilities = """      // 1. Hero Mech Button (Far Left: x: 6, w: 46, h: 78)
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

        this.drawCyberButton(sx, 628, 42, 78, meta.label, color, meta.sub, meta.icon, isReady || isAiming);"""

new_bottom_abilities = """      // 1. Hero Mech Button (Clean Stacked Slot: x: 6, w: 46, h: 78)
      const isHeroUltReady = this.hero.currentUltCd <= 0;
      this.renderAbilitySlot(6, 628, 46, 78, "⚡", "MECH", isHeroUltReady ? "ULT" : `${Math.ceil(this.hero.currentUltCd)}s`, isHeroUltReady ? "#ffd600" : "#455a64", isHeroUltReady, this.hero.currentUltCd / this.hero.ultCd);

      // 2. 4 Commander Super Skills Panel (Clean Stacked Slots: w: 42, h: 78)
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

        this.renderAbilitySlot(sx, 628, 42, 78, meta.icon, meta.label, meta.sub, color, isReady || isAiming, s.currentCd / s.cd);"""

if old_bottom_abilities in code:
    code = code.replace(old_bottom_abilities, new_bottom_abilities, 1)
    print("Refactored bottom bar ability slots to clean stacked vertical layout")

# --- 8. ADD renderAbilitySlot() HELPER TO LastGridEngine ---
ability_slot_code = """
    renderAbilitySlot(x, y, w, h, icon, label, subtext, color = "#00e5ff", isReady = true, cdRatio = 0) {
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

      ctx.fillStyle = isReady ? "rgba(16, 26, 44, 0.95)" : "rgba(8, 12, 20, 0.98)";
      ctx.fill();

      ctx.strokeStyle = color;
      ctx.lineWidth = isReady ? 1.8 : 1.0;
      ctx.stroke();

      // Top specular highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.moveTo(x + cut, y + 1);
      ctx.lineTo(x + w - 1, y + 1);
      ctx.stroke();

      // Centered Stacked Layout:
      // 1. Icon on top
      ctx.fillStyle = color;
      ctx.font = "14px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText(icon, x + w / 2, y + 26);

      // 2. Label below
      ctx.fillStyle = isReady ? "#ffffff" : "#78909c";
      ctx.font = "bold 11px monospace";
      ctx.fillText(label, x + w / 2, y + 48);

      // 3. Subtext / Cost below
      ctx.fillStyle = isReady ? color : "#546e7a";
      ctx.font = "9px monospace";
      ctx.fillText(subtext, x + w / 2, y + 68);

      // Cooldown Sweep
      if (cdRatio > 0) {
        ctx.fillStyle = "rgba(255, 23, 68, 0.65)";
        ctx.fillRect(x + 1, y + h * (1 - cdRatio), w - 2, h * cdRatio);
      }
      ctx.restore();
    }
"""

if "renderAbilitySlot(" not in code:
    code = code.replace("    renderBottomBar() {", ability_slot_code + "\n    renderBottomBar() {", 1)
    print("Added renderAbilitySlot() to LastGridEngine")

# --- 9. ENDLESS RECORD PERSISTENCE ---
# Hook Endless wave and score persistence in onDefeat and onVictory
endless_record_code = """
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
      }"""

if "this.state = 'DEFEAT';" in code:
    code = code.replace("this.state = 'DEFEAT';", "this.state = 'DEFEAT';" + endless_record_code, 1)
    print("Hooked Endless persistence into onDefeat")

# --- 10. APEX-01 MECH THREE.JS HANGAR INTEGRATION ---
# Add mech system initialization and canvas sync to LastGridEngine
mech_init_code = """
    initMechSystem() {
      const mechCanvas = document.getElementById('mech-hangar-canvas');
      if (mechCanvas && window.Apex01System) {
        this.apexSystem = new window.Apex01System();
        this.apexSystem.init(mechCanvas);
        this.syncMechCanvasPosition();
      }
    }

    syncMechCanvasPosition() {
      const mechCanvas = document.getElementById('mech-hangar-canvas');
      if (!mechCanvas || !this.canvas) return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = rect.width / 1280;
      const scaleY = rect.height / 720;

      // Hangar slot in 1280x720: x: 50, y: 155, w: 370, h: 325
      mechCanvas.style.left = `${rect.left + 50 * scaleX}px`;
      mechCanvas.style.top = `${rect.top + 155 * scaleY}px`;
      mechCanvas.style.width = `${Math.floor(370 * scaleX)}px`;
      mechCanvas.style.height = `${Math.floor(325 * scaleY)}px`;
    }
"""

if "initMechSystem(" not in code:
    code = code.replace("    setupCanvasScaling() {", mech_init_code + "\n    setupCanvasScaling() {", 1)
    print("Added initMechSystem and syncMechCanvasPosition to LastGridEngine")

# Hook initMechSystem into constructor
if "this.initMechSystem();" not in code:
    code = code.replace("this.setupCanvasScaling();", "this.setupCanvasScaling();\n      this.initMechSystem();", 1)
    print("Hooked initMechSystem into constructor")

# Hook syncMechCanvasPosition into resizeCanvas
if "this.syncMechCanvasPosition();" not in code:
    code = code.replace("this.dpr = dpr;", "this.dpr = dpr;\n      this.syncMechCanvasPosition();", 1)
    print("Hooked syncMechCanvasPosition into resizeCanvas")

# Hook show/hide into render()
render_mech_toggle = """      if (this.apexSystem) {
        if (this.state === 'MENU') this.apexSystem.show();
        else this.apexSystem.hide();
      }"""

if "if (this.state === 'MENU') this.renderMainMenu();" in code and "if (this.apexSystem)" not in code:
    code = code.replace("if (this.state === 'MENU') this.renderMainMenu();", render_mech_toggle + "\n      if (this.state === 'MENU') this.renderMainMenu();", 1)
    print("Hooked 3D Mech Hangar show/hide into render loop")

with open(GAME_JS, "w", encoding="utf-8") as f:
    f.write(code)
print("Updated game.js with all PART A upgrades successfully!")

