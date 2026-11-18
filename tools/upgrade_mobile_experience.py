#!/usr/bin/env python3
import re

GAME_JS = "/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js"

with open(GAME_JS, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update constructor of LastGridEngine to add Settings & Mobile Back state
old_engine_constructor = """      this.speed = 1;
      this.crtEnabled = false;
      this.colorblind = false;
      this.screenShake = 0;"""

new_engine_constructor = """      this.speed = 1;
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
      this.lastBackTapTime = 0;"""

if old_engine_constructor in content:
    content = content.replace(old_engine_constructor, new_engine_constructor)
    print("Updated LastGridEngine constructor with settings.")
else:
    print("Warning: old_engine_constructor not found!")

# 2. Update resizeCanvas for Dynamic Viewport (FIT vs FILL)
old_resize = """    resizeCanvas() {
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

      // HiDPI / Retina Crispness for Android AMOLED & High-Res displays
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetBufferW = Math.round(1280 * dpr);
      const targetBufferH = Math.round(720 * dpr);
      if (this.canvas.width !== targetBufferW || this.canvas.height !== targetBufferH) {
        this.canvas.width = targetBufferW;
        this.canvas.height = targetBufferH;
      }
      this.dpr = dpr;
    }"""

new_resize = """    resizeCanvas() {
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
    }"""

if old_resize in content:
    content = content.replace(old_resize, new_resize)
    print("Updated resizeCanvas for FIT and FILL modes.")
else:
    print("Warning: old_resize not found!")

# 3. Add handleBackAction and Settings Modal methods
helper_methods = """    handleBackAction() {
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
        this.togglePause();
        audio.click();
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
"""

# Insert helper methods before render() or after constructor
content = content.replace("    resizeCanvas() {", helper_methods + "\n    resizeCanvas() {", 1)

# 4. Render modal checks in render()
old_render_end = """        if (this.state === 'PAUSED') this.renderPauseModal();
        if (this.state === 'VICTORY') this.renderVictoryModal();
        if (this.state === 'DEFEAT') this.renderDefeatModal();
      }

      if (this.crtEnabled) this.renderCRTOverlay();"""

new_render_end = """        if (this.state === 'PAUSED') this.renderPauseModal();
        if (this.state === 'VICTORY') this.renderVictoryModal();
        if (this.state === 'DEFEAT') this.renderDefeatModal();
      }

      if (this.showSettingsModal) this.renderSettingsModal();
      if (this.exitToastTimer > 0) this.renderExitToast();
      if (this.crtEnabled) this.renderCRTOverlay();"""

if old_render_end in content:
    content = content.replace(old_render_end, new_render_end)
    print("Added settings and exit toast modals into render().")
else:
    print("Warning: old_render_end not found!")

# 5. Update update(dt) to tick exitToastTimer
old_update_dt = """    update(dt) {
      if (this.state !== 'PLAYING') return;"""
new_update_dt = """    update(dt) {
      if (this.exitToastTimer > 0) this.exitToastTimer -= dt;
      if (this.state !== 'PLAYING') return;"""
if old_update_dt in content:
    content = content.replace(old_update_dt, new_update_dt)
    print("Updated update(dt) with exitToastTimer.")

# 6. Top HUD Bar Rendering: Clean, ergonomic thumb layout
old_top_hud = """      // Compact Control Cyber Buttons
      this.renderMiniButton(755, 12, 45, 36, `${this.speed}x`, this.speed > 1 ? "#ffd600" : "#00e5ff");
      this.renderMiniButton(805, 12, 50, 36, audio.sfxMuted ? "SFX ✕" : "SFX ✓", audio.sfxMuted ? "#78909c" : "#00e676");
      this.renderMiniButton(860, 12, 50, 36, audio.bgmMuted ? "BGM ✕" : "BGM ✓", audio.bgmMuted ? "#78909c" : "#00e676");
      this.renderMiniButton(915, 12, 50, 36, this.crtEnabled ? "CRT ✓" : "CRT ✕", this.crtEnabled ? "#00e5ff" : "#78909c");
      this.renderMiniButton(970, 12, 50, 36, this.colorblind ? "CB ✓" : "CB ✕", this.colorblind ? "#ffd600" : "#78909c");
      this.renderMiniButton(1025, 12, 45, 36, this.lang.toUpperCase(), "#00e5ff");
      this.renderMiniButton(1075, 12, 60, 36, this.state === 'PAUSED' ? "DAVOM" : "PAUZA", this.state === 'PAUSED' ? "#ffd600" : "#00e5ff");
      this.renderMiniButton(1140, 12, 80, 36, "← MENYU", "#ff1744");"""

new_top_hud = """      // Ergonomic Wide Action Cyber Buttons
      this.drawCyberButton(625, 9, 90, 42, `${this.speed}x SPEED`, this.speed > 1 ? "#ffd600" : "#00e5ff", "TEMPO", "⏩", this.speed > 1);
      this.drawCyberButton(725, 9, 125, 42, "SOZLAMALAR", "#00e5ff", "SETTINGS", "⚙️", false);
      this.drawCyberButton(860, 9, 105, 42, this.state === 'PAUSED' ? "DAVOM" : "PAUZA", this.state === 'PAUSED' ? "#ffd600" : "#00e5ff", "PAUSE", "⏸", false);
      this.drawCyberButton(975, 9, 110, 42, "← MENYU", "#ff1744", "ABORT", "🚪", false);"""

if old_top_hud in content:
    content = content.replace(old_top_hud, new_top_hud)
    print("Replaced Top HUD buttons with ergonomic wide cyber buttons.")
else:
    print("Warning: old_top_hud not found!")

# 7. Main Menu: Add Dedicated Settings Button & Polish Layout
old_menu_buttons = """      // Menu Cyber Buttons
      this.drawCyberButton(440, 265, 400, 48, "3D TPS ARENA REJIMI", "#ff007f", "DIRECT 3D OVER-THE-SHOULDER COMBAT", "🎮", true);
      this.drawCyberButton(440, 322, 400, 48, this.t("campaign"), "#00e5ff", "10 PROGRESSIVE TACTICAL GRID SECTORS", "🚀", true);
      this.drawCyberButton(440, 379, 400, 46, this.t("sectorSelect"), "#00e5ff", "MISSION ARCHIVE & REPLAY ZONES", "🗺", false);
      this.drawCyberButton(440, 434, 400, 46, this.t("endless"), "#e040fb", "INFINITE HIGH-SPEED WAVE SURVIVAL", "⚡", false);

      this.drawCyberButton(440, 489, 190, 44, this.t("bossRush"), "#ff1744", "ELITE TITANS", "💀", false);
      this.drawCyberButton(650, 489, 190, 44, this.t("mapEditor"), "#00e676", "GRID CREATOR", "🛠", false);

      this.drawCyberButton(440, 542, 190, 44, this.t("leaderboard"), "#ffd600", "GLOBAL AGENTS", "🏆", false);
      this.drawCyberButton(650, 542, 190, 44, this.t("fieldManual"), "#00e5ff", "TOWER SPECS", "📖", false);

      this.drawCyberButton(440, 595, 190, 44, "ANDROID APK", "#00e676", "OFFLINE STANDALONE", "📲", true);
      this.drawCyberButton(650, 595, 190, 44, this.t("downloadOffline"), "#ffd600", "ASSET ZIP BUNDLE", "📦", false);"""

new_menu_buttons = """      // Ergonomic Main Menu Grid
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

      this.drawCyberButton(440, 624, 400, 42, this.t("downloadOffline"), "#ffd600", "COMPLETE ASSET ZIP BUNDLE", "📦", false);"""

if old_menu_buttons in content:
    content = content.replace(old_menu_buttons, new_menu_buttons)
    print("Replaced Main Menu buttons with settings button.")
else:
    print("Warning: old_menu_buttons not found!")

# 8. Pause Modal 3-button layout
old_pause = """      this.drawCyberButton(440, 380, 400, 52, "DAVOM ETISH", "#00e676", "RESUME COMBAT", "▶", true);
      this.drawCyberButton(440, 448, 400, 52, "ASOSIY MENYUGA QAYTISH", "#ff1744", "ABORT MISSION", "←", false);"""

new_pause = """      this.drawCyberButton(440, 340, 400, 50, "DAVOM ETISH", "#00e676", "RESUME COMBAT", "▶", true);
      this.drawCyberButton(440, 405, 400, 50, "SOZLAMALAR", "#00e5ff", "AUDIO & SCREEN SETTINGS", "⚙️", false);
      this.drawCyberButton(440, 470, 400, 50, "ASOSIY MENYUGA QAYTISH", "#ff1744", "ABORT MISSION", "←", false);"""

if old_pause in content:
    content = content.replace(old_pause, new_pause)
    print("Updated renderPauseModal with Settings option.")

# 9. handleCanvasClick: Settings modal check, menu hitboxes, sub-screen back hitboxes, top bar hitboxes, bottom bar barricade fix
old_click_start = """    handleCanvasClick(x, y, isRightClick = false) {
      if (this.state !== 'TPS_3D') {
        audio.click();
        this.vibrate(10);
      }
      if (this.state === 'TPS_3D') {"""

new_click_start = """    handleCanvasClick(x, y, isRightClick = false) {
      if (this.state !== 'TPS_3D') {
        audio.click();
        this.vibrate(10);
      }
      // If Settings Modal is open -> handle settings interactions
      if (this.showSettingsModal) {
        this.handleSettingsClick(x, y);
        return;
      }
      if (this.state === 'TPS_3D') {"""

if old_click_start in content:
    content = content.replace(old_click_start, new_click_start)
    print("Added showSettingsModal check in handleCanvasClick.")

# Menu clicks: add Settings button hit at y: 572-618, x: 440-630
old_menu_clicks = """      if (this.state === 'MENU') {
        // Generous touch hitboxes for mobile screens
        if (y >= 260 && y <= 318 && x >= 380 && x <= 900) { this.start3DTPSMode(); return; }
        else if (y >= 319 && y <= 375 && x >= 380 && x <= 900) { this.startMission(0, 'CAMPAIGN'); return; }
        else if (y >= 376 && y <= 430 && x >= 380 && x <= 900) { this.state = 'MAP_SELECT'; return; }
        else if (y >= 431 && y <= 485 && x >= 380 && x <= 900) { this.startMission(9, 'ENDLESS'); return; }
        else if (y >= 486 && y <= 538 && x >= 380 && x <= 635) { this.startMission(0, 'BOSS_RUSH'); return; }
        else if (y >= 486 && y <= 538 && x >= 645 && x <= 900) { this.state = 'EDITOR'; return; }
        else if (y >= 539 && y <= 590 && x >= 380 && x <= 635) { this.state = 'LEADERBOARD'; return; }
        else if (y >= 539 && y <= 590 && x >= 645 && x <= 900) { this.state = 'MANUAL'; return; }
        else if (y >= 591 && y <= 660 && x >= 380 && x <= 635) { this.downloadApk(); return; }
        else if (y >= 591 && y <= 660 && x >= 645 && x <= 900) { this.downloadOfflineZip(); return; }
        if (x > 1080 && x < 1260 && y > 10 && y < 65) this.toggleLang();
        return;
      }"""

new_menu_clicks = """      if (this.state === 'MENU') {
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
      }"""

if old_menu_clicks in content:
    content = content.replace(old_menu_clicks, new_menu_clicks)
    print("Updated menu click hitboxes.")
else:
    print("Warning: old_menu_clicks not found!")

# Sub-screens back buttons in handleCanvasClick:
old_sub_screens = """      if (this.state === 'ANALYTICS') {
        if (x > 500 && x < 780 && y > 620 && y < 690) this.state = 'MENU';
        return;
      }

      if (this.state === 'MANUAL') {
        if (x > 1000 && x < 1200 && y > 30 && y < 75) this.state = 'MENU';
        return;
      }

      if (this.state === 'MAP_SELECT') {
        if (y > 15 && y < 65 && x > 30 && x < 160) { this.state = 'MENU'; return; }"""

new_sub_screens = """      if (this.state === 'ANALYTICS') {
        if (x >= 450 && x <= 830 && y >= 615 && y <= 695) this.state = 'MENU';
        return;
      }

      if (this.state === 'MANUAL') {
        if (x >= 20 && x <= 180 && y >= 10 && y <= 65) this.state = 'MENU';
        return;
      }

      if (this.state === 'MAP_SELECT') {
        if (y >= 10 && y <= 65 && x >= 20 && x <= 180) { this.state = 'MENU'; return; }"""

if old_sub_screens in content:
    content = content.replace(old_sub_screens, new_sub_screens)
    print("Fixed sub-screens back button hitboxes.")
else:
    print("Warning: old_sub_screens not found!")

# Pause state clicks in handleCanvasClick
old_pause_clicks = """      if (this.state === 'PAUSED') {
        if (x >= 440 && x <= 840 && y >= 380 && y <= 432) { this.togglePause(); return; }
        if (x >= 440 && x <= 840 && y >= 448 && y <= 500) { this.state = 'MENU'; this.selectedTower = null; return; }
        return;
      }"""

# Check how pause is handled
if "if (this.state === 'PAUSED')" in content:
    # Replace it with 3-button handling
    content = re.sub(
        r"if\s*\(\s*this\.state\s*===\s*'PAUSED'\s*\)\s*\{[^}]+\}",
        """if (this.state === 'PAUSED') {
        if (x >= 420 && x <= 860 && y >= 335 && y <= 395) { this.togglePause(); return; }
        if (x >= 420 && x <= 860 && y >= 400 && y <= 460) { this.showSettingsModal = true; this.settingsReturnState = 'PAUSED'; return; }
        if (x >= 420 && x <= 860 && y >= 465 && y <= 525) { this.state = 'MENU'; this.selectedTower = null; return; }
        return;
      }""",
        content
    )
    print("Updated PAUSED state clicks in handleCanvasClick.")

# Top HUD Bar clicks in handleCanvasClick
old_hud_clicks = """      // 4. Top HUD Bar clicks
      if (y >= 0 && y <= 60) {
        if (x >= 450 && x <= 620) this.callNextWave();
        else if (x >= 750 && x <= 800) this.cycleSpeed();
        else if (x >= 801 && x <= 855) audio.toggleSFX();
        else if (x >= 856 && x <= 910) audio.toggleBGM();
        else if (x >= 911 && x <= 965) this.crtEnabled = !this.crtEnabled;
        else if (x >= 966 && x <= 1020) this.colorblind = !this.colorblind;
        else if (x >= 1021 && x <= 1070) this.toggleLang();
        else if (x >= 1071 && x <= 1135) this.togglePause();
        else if (x >= 1136 && x <= 1230) { this.state = 'MENU'; this.vibrate(20); }
        return;
      }"""

new_hud_clicks = """      // 4. Top HUD Bar clicks
      if (y >= 0 && y <= 60) {
        if (x >= 440 && x <= 618) this.callNextWave();
        else if (x >= 620 && x <= 718) this.cycleSpeed();
        else if (x >= 720 && x <= 852) { this.showSettingsModal = true; this.settingsReturnState = 'PLAYING'; }
        else if (x >= 855 && x <= 968) this.togglePause();
        else if (x >= 970 && x <= 1090) { this.togglePause(); } // opens pause dialog safely
        return;
      }"""

if old_hud_clicks in content:
    content = content.replace(old_hud_clicks, new_hud_clicks)
    print("Replaced Top HUD Bar clicks with settings and safe pause.")
else:
    print("Warning: old_hud_clicks not found!")

# Bottom Bar barricade and tower clicks in handleCanvasClick
old_bottom_clicks = """      // 5. Bottom Bar actions
      if (y >= 620) {
        // [6] Barricade Hotbar selection
        if (!this.selectedTower && x >= 1115 && x <= 1265 && y >= 630 && y <= 710) {
          this.selectedBuildType = (this.selectedBuildType === 'barricade') ? null : 'barricade';
          this.vibrate(15);
          return;
        }
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
      }"""

new_bottom_clicks = """      // 5. Bottom Bar actions
      if (y >= 620) {
        // [6] Barricade Hotbar selection
        if (!this.selectedTower && x >= 1100 && x <= 1275 && y >= 625 && y <= 715) {
          this.selectedBuildType = (this.selectedBuildType === 'barricade') ? null : 'barricade';
          this.vibrate(15);
          return;
        }
        this.radialBuildCell = null;

        // Hero Ult button at x: 5 to 70
        if (x >= 5 && x <= 70) { this.triggerHeroUlt(); this.vibrate([40, 25, 70]); return; }

        // Skills at x: 75 to 235
        if (x >= 75 && x <= 112) this.triggerSkill('emp');
        else if (x >= 115 && x <= 152) this.triggerSkill('orbital');
        else if (x >= 155 && x <= 192) this.triggerSkill('overclock');
        else if (x >= 195 && x <= 235) this.triggerSkill('drone');

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
      }"""

if old_bottom_clicks in content:
    content = content.replace(old_bottom_clicks, new_bottom_clicks)
    print("Replaced Bottom Bar click handling with exact hitboxes.")
else:
    print("Warning: old_bottom_clicks not found!")

# 10. Update APK download version to v3.7.0
content = content.replace("TowerDefense_LastGrid_v3.6.0.apk", "TowerDefense_LastGrid_v3.7.0.apk")
content = content.replace("v3.6.0", "v3.7.0")

with open(GAME_JS, "w", encoding="utf-8") as f:
    f.write(content)

print("Upgrade mobile experience applied to game.js successfully!")
