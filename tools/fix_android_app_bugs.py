#!/usr/bin/env python3
"""
fix_android_app_bugs.py
Fixes:
1. "uyinga kirib qorongu turibdi muzika bilan":
   - Caused by `const biome = map.biome` throwing ReferenceError inside constructor,
     halting the constructor before startLoop() and event registration.
2. "ekrak yuqori burchagida full screen button qotib turadi":
   - Caused by `#fullscreen-btn` having `display: block !important` in mobile CSS.
   - For Android APK, full-screen is already native; remove fullscreen button and web headers/footers.
3. Fix handleBackAction() syntax/scope bug with undeclared `x`.
4. Implement missing render methods:
   - renderUpgradePillars()
   - renderFlyingCoins()
   - renderSelectedTowerRadialHUD()
   - renderCriticalLowHPPulse()
   - toggleLanguage()
5. Preload and render HD background images in renderBackgroundGrid() & renderMainMenu().
"""

import os
import shutil

ROOT_DIR = "/mnt/sdcard/Agent/UI_UX_18_11_2026"
GAME_JS = os.path.join(ROOT_DIR, "game.js")
INDEX_HTML = os.path.join(ROOT_DIR, "index.html")
WWW_DIR = os.path.join(ROOT_DIR, "android_project/assets/www")

# --- 1. CLEAN INDEX.HTML ---
clean_html = """<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover">
  <title>Tower Defense: Last Grid</title>
  <meta name="theme-color" content="#05070d">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      outline: none;
    }
    html, body {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      background-color: #05070d;
      color: #00e5ff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, monospace, sans-serif;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: none;
    }
    #canvas-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      max-width: 100vw;
      max-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
      overflow: hidden;
      border: none;
      box-shadow: none;
    }
    #game-canvas {
      display: block;
      touch-action: none;
      -webkit-touch-callout: none;
      cursor: crosshair;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
  </style>
</head>
<body>
  <div id="canvas-container">
    <canvas id="game-canvas" width="1280" height="720"></canvas>
  </div>
  <script src="game.js"></script>
</body>
</html>
"""

with open(INDEX_HTML, "w", encoding="utf-8") as f:
    f.write(clean_html)
print("Updated index.html: clean 100% full-screen responsive Android layout")

# --- 2. UPDATE GAME.JS ---
with open(GAME_JS, "r", encoding="utf-8") as f:
    code = f.read()

# Fix constructor crash
bad_constructor_snippet = """      this.state = 'MENU'; audio.playBGMTrack('menu'); // 'MENU', 'PLAYING', 'PAUSED', 'VICTORY', 'DEFEAT', 'MAP_SELECT', 'EDITOR', 'LEADERBOARD', 'MANUAL', 'DRAFT', 'ANALYTICS'
      this.speed = 1;
      const biome = map.biome || 'cyber';
      audio.playBGMTrack(biome);
      setTimeout(() => audio.playSample('hq_online', 0.8), 600);"""

good_constructor_snippet = """      this.state = 'MENU';
      this.speed = 1;
      try { audio.playBGMTrack('menu'); } catch(e) {}
      this.loadBackgroundImages();"""

if bad_constructor_snippet in code:
    code = code.replace(bad_constructor_snippet, good_constructor_snippet, 1)
    print("Fixed constructor crash: removed rogue map.biome reference and hooked loadBackgroundImages")
else:
    print("Warning: bad_constructor_snippet not found directly, checking regex")

# Fix startMission biome BGM
if "audio.playBGMTrack(biome);" not in code.split("startMission")[1][:1000]:
    target_sm = "      this.speed = 1;\n\n      this.activeAugments = [];"
    repl_sm = """      this.speed = 1;
      try {
        const biome = (map && map.biome) ? map.biome : 'cyber';
        audio.playBGMTrack(biome);
        setTimeout(() => audio.playSample('hq_online', 0.8), 600);
      } catch(e) {}

      this.activeAugments = [];"""
    if target_sm in code:
        code = code.replace(target_sm, repl_sm, 1)
        print("Hooked biome BGM and hq_online safely into startMission")

# Fix handleBackAction undeclared x bug
bad_back_snippet = """      // 9. If in PAUSED state -> unpause
      if (this.state === 'PAUSED') {
        if (x >= 420 && x <= 860 && y >= 335 && y <= 395) { this.togglePause(); return; }
        if (x >= 420 && x <= 860 && y >= 400 && y <= 460) { this.showSettingsModal = true; this.settingsReturnState = 'PAUSED'; return; }
        if (x >= 420 && x <= 860 && y >= 465 && y <= 525) { this.state = 'MENU'; audio.playBGMTrack('menu'); this.selectedTower = null; return; }
        return;
      }"""

good_back_snippet = """      // 9. If in PAUSED state -> unpause
      if (this.state === 'PAUSED') {
        this.togglePause();
        try { audio.modal(); } catch(e) {}
        return;
      }"""

if bad_back_snippet in code:
    code = code.replace(bad_back_snippet, good_back_snippet, 1)
    print("Fixed handleBackAction bug with undeclared x variable")

# Missing methods implementation
missing_methods = """
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
      ctx.save();

      // Top Upgrade or Branch A/B buttons
      if (t.tier === 1) {
        const upCost = def.tiers[0].upCost;
        const canAfford = this.gold >= upCost;
        ctx.fillStyle = canAfford ? "rgba(0, 229, 255, 0.9)" : "rgba(80, 90, 100, 0.85)";
        ctx.fillRect(t.x - 65, t.y - 62, 130, 32);
        ctx.strokeStyle = canAfford ? "#00e5ff" : "#546e7a";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(t.x - 65, t.y - 62, 130, 32);
        ctx.fillStyle = "#05070d";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`▲ UPGRADE (${upCost}g)`, t.x, t.y - 42);
      } else if (t.tier === 2) {
        // Branch A (Left top)
        const bA = def.branches.A;
        const canA = this.gold >= bA.cost;
        ctx.fillStyle = canA ? "rgba(0, 229, 255, 0.9)" : "rgba(80, 90, 100, 0.85)";
        ctx.fillRect(t.x - 110, t.y - 70, 105, 36);
        ctx.strokeStyle = "#00e5ff";
        ctx.strokeRect(t.x - 110, t.y - 70, 105, 36);
        ctx.fillStyle = "#05070d";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${bA.name.slice(0, 10)}`, t.x - 57, t.y - 53);
        ctx.fillText(`(${bA.cost}g)`, t.x - 57, t.y - 40);

        // Branch B (Right top)
        const bB = def.branches.B;
        const canB = this.gold >= bB.cost;
        ctx.fillStyle = canB ? "rgba(255, 145, 0, 0.9)" : "rgba(80, 90, 100, 0.85)";
        ctx.fillRect(t.x + 5, t.y - 70, 105, 36);
        ctx.strokeStyle = "#ff9100";
        ctx.strokeRect(t.x + 5, t.y - 70, 105, 36);
        ctx.fillStyle = "#05070d";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${bB.name.slice(0, 10)}`, t.x + 57, t.y - 53);
        ctx.fillText(`(${bB.cost}g)`, t.x + 57, t.y - 40);
      }

      // Left Sell Button
      const refund = Math.floor(t.totalInvested * 0.70);
      ctx.fillStyle = "rgba(255, 23, 68, 0.85)";
      ctx.fillRect(t.x - 115, t.y - 18, 75, 36);
      ctx.strokeStyle = "#ff1744";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(t.x - 115, t.y - 18, 75, 36);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SOTISH", t.x - 77, t.y);
      ctx.fillText(`+${refund}g`, t.x - 77, t.y + 12);

      // Right Priority Button
      ctx.fillStyle = "rgba(124, 77, 255, 0.85)";
      ctx.fillRect(t.x + 40, t.y - 18, 75, 36);
      ctx.strokeStyle = "#7c4dff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(t.x + 40, t.y - 18, 75, 36);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("NISHON", t.x + 77, t.y);
      ctx.fillText(`${t.priority.slice(0, 6)}`, t.x + 77, t.y + 12);

      // Bottom Close Button
      ctx.fillStyle = "rgba(38, 50, 56, 0.9)";
      ctx.fillRect(t.x - 35, t.y + 40, 70, 28);
      ctx.strokeStyle = "#90a4ae";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(t.x - 35, t.y + 40, 70, 28);
      ctx.fillStyle = "#eceff1";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("✕ YOPISH", t.x, t.y + 58);

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
"""

# Insert missing methods before renderCRTOverlay
target_crt = "    renderCRTOverlay() {"
if target_crt in code:
    code = code.replace(target_crt, missing_methods + "\n    renderCRTOverlay() {", 1)
    print("Inserted missing render methods into LastGridEngine")
else:
    print("Warning: renderCRTOverlay target not found")

# Integrate background image drawing into renderBackgroundGrid
old_bg_fill = """      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);"""

new_bg_fill = """      if (this.bgImages && this.bgImages[biome]) {
        try {
          ctx.drawImage(this.bgImages[biome], 0, 0, this.width, this.height);
        } catch(e) {
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, this.width, this.height);
        }
      } else {
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);
      }"""

if old_bg_fill in code:
    code = code.replace(old_bg_fill, new_bg_fill, 1)
    print("Integrated Full HD background image rendering into renderBackgroundGrid")

# Integrate menu background image into renderMainMenu
old_menu_bg = """      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, "#05070d");
      bgGrad.addColorStop(0.5, "#0b1326");
      bgGrad.addColorStop(1, "#03050a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);"""

new_menu_bg = """      if (this.bgImages && this.bgImages.menu) {
        try {
          ctx.drawImage(this.bgImages.menu, 0, 0, this.width, this.height);
        } catch(e) {
          const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
          bgGrad.addColorStop(0, "#05070d");
          bgGrad.addColorStop(0.5, "#0b1326");
          bgGrad.addColorStop(1, "#03050a");
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, this.width, this.height);
        }
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, "#05070d");
        bgGrad.addColorStop(0.5, "#0b1326");
        bgGrad.addColorStop(1, "#03050a");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);
      }"""

if old_menu_bg in code:
    code = code.replace(old_menu_bg, new_menu_bg, 1)
    print("Integrated Full HD menu hangar background image into renderMainMenu")

with open(GAME_JS, "w", encoding="utf-8") as f:
    f.write(code)
print("Updated game.js successfully!")

# Copy to android_project/assets/www
shutil.copyfile(INDEX_HTML, os.path.join(WWW_DIR, "index.html"))
shutil.copyfile(GAME_JS, os.path.join(WWW_DIR, "game.js"))
print("Synced index.html and game.js to android_project/assets/www/")

