#!/usr/bin/env python3
"""
apply_v390_ui_overhaul.py
Transforms the game UI into a AAA-grade Mobile Tactical Experience:
1. Modern Tactical Dashboard Main Menu:
   - Left side (x: 40 to 420): Animated Hero Mech Hangar Showcase with breathing animations, rotating core glow, dynamic stats.
   - Right side (x: 460 to 1240): Widescreen Tactical Mission Matrix with large thumb-friendly cards.
2. Battlefield Holographic Radial Upgrade Wheel:
   - On selecting any tower, an intuitive glowing neon radial wheel appears directly over the tower on the battlefield:
     - ⬆️ Upgrade / Branching buttons
     - 💰 Sell button
     - 🎯 Priority button
     - ✕ Close button
3. Micro-Animations & Juice:
   - Flying Gold Coins (🪙 flying from enemy death location to top gold HUD).
   - Level-Up Plazma Ustuni (Energetic light beam skyward on tower upgrades).
   - Critical Low Base HP heartbeat pulse on screen edges.
4. Updates version to v3.9.0 Ultimate UI.
"""

import os
import re

def main():
    game_js_path = "/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js"
    with open(game_js_path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Update version to v3.9.0
    code = code.replace("v3.8.0", "v3.9.0")
    code = code.replace("3.8.0", "3.9.0")

    # 2. Add flying coins and upgrade pillars to constructor
    constructor_target = "      this.biomeParticles = [];"
    constructor_replacement = """      this.biomeParticles = [];
      this.flyingCoins = [];
      this.upgradePillars = [];
      this.heroMenuAnim = { breathe: 0, coreGlow: 0, stanceTimer: 0 };"""

    if constructor_target in code:
        code = code.replace(constructor_target, constructor_replacement, 1)
        print("Added flyingCoins and upgradePillars to constructor")
    else:
        # Fallback to this.screenShake = 0;
        alt_target = "      this.screenShake = 0;"
        alt_replacement = """      this.screenShake = 0;
      this.flyingCoins = [];
      this.upgradePillars = [];
      this.heroMenuAnim = { breathe: 0, coreGlow: 0, stanceTimer: 0 };"""
        code = code.replace(alt_target, alt_replacement, 1)
        print("Added flyingCoins and upgradePillars after screenShake")

    # 3. Add spawnFlyingCoins and spawnUpgradePillar methods
    helper_methods = """    spawnFlyingCoins(startX, startY, amount = 1) {
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
"""
    if "spawnFlyingCoins" not in code:
        code = code.replace("    addFloatingText(", helper_methods + "\n    addFloatingText(", 1)
        print("Added spawnFlyingCoins and spawnUpgradePillar")

    # 4. Trigger spawnFlyingCoins on enemy kill
    enemy_kill_target = """      this.gold += bounty;
      this.score += bounty * 10;
      this.analytics.totalGold += bounty;
      this.analytics.totalKills++;"""

    enemy_kill_replacement = """      this.gold += bounty;
      this.score += bounty * 10;
      this.analytics.totalGold += bounty;
      this.analytics.totalKills++;
      this.spawnFlyingCoins(e.x, e.y, bounty);"""

    if enemy_kill_target in code:
        code = code.replace(enemy_kill_target, enemy_kill_replacement, 1)
        print("Hooked spawnFlyingCoins into enemy kill logic")
    else:
        print("Warning: enemy_kill_target not found")

    # 5. Trigger spawnUpgradePillar on tower upgrades
    up_targ_1 = "        audio.upgrade();\n        this.vibrate([25, 30, 25]);"
    up_repl_1 = "        audio.upgrade();\n        this.spawnUpgradePillar(t.x, t.y, spec.color || def.color);\n        this.vibrate([25, 30, 25]);"
    if up_targ_1 in code:
        code = code.replace(up_targ_1, up_repl_1, 1)
        print("Hooked spawnUpgradePillar to upgradeSelectedTower")

    branch_targ = "      audio.upgrade();\n      this.vibrate([30, 40, 30]);"
    branch_repl = "      audio.upgrade();\n      this.spawnUpgradePillar(t.x, t.y, spec.color);\n      this.vibrate([30, 40, 30]);"
    if branch_targ in code:
        code = code.replace(branch_targ, branch_repl, 1)
        print("Hooked spawnUpgradePillar to upgradeBranch")

    # 6. Update update(dt) with flyingCoins and upgradePillars
    update_dt_target = "      this.updateBiomeParticles(dt);"
    update_dt_replacement = """      this.updateBiomeParticles(dt);

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
      }"""

    if update_dt_target in code:
        code = code.replace(update_dt_target, update_dt_replacement, 1)
        print("Added flyingCoins and upgradePillars physics to update(dt)")

    # 7. Add rendering of Flying Coins, Upgrade Pillars, and Critical Base HP Heartbeat
    render_pipeline_target = "        this.renderParticles();"
    render_pipeline_replacement = """        this.renderParticles();
        this.renderUpgradePillars();
        this.renderFlyingCoins();
        this.renderSelectedTowerRadialHUD();
        this.renderCriticalLowHPPulse();"""

    if render_pipeline_target in code:
        code = code.replace(render_pipeline_target, render_pipeline_replacement, 1)
        print("Hooked new UI rendering methods into render pipeline")

    # 8. Define the new rendering methods
    new_render_methods = """    renderUpgradePillars() {
      if (!this.upgradePillars || this.upgradePillars.length === 0) return;
      const ctx = this.ctx;
      ctx.save();
      for (const p of this.upgradePillars) {
        const alpha = Math.max(0, p.timer / p.maxTimer);
        const w = 32 * alpha + 12;

        // Vertical Laser Beam
        const beamGrad = ctx.createLinearGradient(p.x - w, 0, p.x + w, 0);
        beamGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        beamGrad.addColorStop(0.5, p.color);
        beamGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = beamGrad;
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillRect(p.x - w, 0, w * 2, p.y);

        // Ground expanding shock ring
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * alpha;
        ctx.beginPath();
        const r = (1 - alpha) * 60 + 15;
        ctx.ellipse(p.x, p.y, r, r * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    renderFlyingCoins() {
      if (!this.flyingCoins || this.flyingCoins.length === 0) return;
      const ctx = this.ctx;
      ctx.save();
      for (const c of this.flyingCoins) {
        ctx.fillStyle = "#ffd600";
        ctx.shadowColor = "#ffd600";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();
    }

    renderCriticalLowHPPulse() {
      if (this.baseHp > this.maxBaseHp * 0.35) return;
      const ctx = this.ctx;
      const pulse = Math.pow((Math.sin(performance.now() * 0.009) + 1) * 0.5, 3);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 23, 68, ${0.15 + pulse * 0.65})`;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 62, this.width - 10, 556);
      ctx.restore();
    }

    renderSelectedTowerRadialHUD() {
      if (!this.selectedTower) return;
      const t = this.selectedTower;
      const ctx = this.ctx;
      const def = TOWER_DEFS[t.type];
      const time = performance.now() * 0.003;

      ctx.save();
      // 1. Futuristic Spinning Range Ring
      const spec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];
      const range = spec.range;
      ctx.strokeStyle = t.branch ? spec.color : def.color;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -time * 20;
      ctx.beginPath();
      ctx.arc(t.x, t.y, range, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(0, 229, 255, 0.04)";
      ctx.beginPath();
      ctx.arc(t.x, t.y, range, 0, Math.PI * 2);
      ctx.fill();
      ctx.setLineDash([]);

      // 2. Holographic Radial Action Ring around the Tower
      // Top: Upgrade or Branches
      if (t.tier === 2) {
        // Branch A
        const ba = def.branches.A;
        const canA = this.gold >= ba.upCost;
        this.drawCyberButton(t.x - 110, t.y - 70, 105, 36, `[A] ${ba.name.split(' ')[0]}`, canA ? ba.color : "#455a64", `${ba.upCost}g`, "🔱", canA);
        // Branch B
        const bb = def.branches.B;
        const canB = this.gold >= bb.upCost;
        this.drawCyberButton(t.x + 5, t.y - 70, 105, 36, `[B] ${bb.name.split(' ')[0]}`, canB ? bb.color : "#455a64", `${bb.upCost}g`, "🔱", canB);
      } else if (t.tier === 1) {
        const upCost = def.tiers[0].upCost;
        const canUp = this.gold >= upCost;
        this.drawCyberButton(t.x - 70, t.y - 65, 140, 36, `⬆️ TIER 2`, canUp ? "#00e676" : "#455a64", `${upCost}g`, "⚡", canUp);
      } else {
        this.drawCyberButton(t.x - 65, t.y - 65, 130, 32, "★ MAX TIER", "#ffd600", "MAX BLUEPRINT", "★", false);
      }

      // Left: Sell
      const refund = Math.floor(t.totalInvested * 0.70);
      this.drawCyberButton(t.x - 115, t.y - 18, 75, 36, "SOTISH", "#ff1744", `+${refund}g`, "🗑", true);

      // Right: Target Priority
      this.drawCyberButton(t.x + 40, t.y - 18, 75, 36, "NISHON", "#00e5ff", t.priority.substring(0, 5).toUpperCase(), "🎯", false);

      // Bottom: Close
      this.drawCyberButton(t.x - 35, t.y + 40, 70, 28, "✕ YOPISH", "#78909c", "", "", false);

      ctx.restore();
    }
"""
    if "renderUpgradePillars()" not in code:
        code = code.replace("    renderBossAlert() {", new_render_methods + "\n    renderBossAlert() {", 1)
        print("Added renderUpgradePillars, renderFlyingCoins, renderCriticalLowHPPulse and renderSelectedTowerRadialHUD")

    # 9. Radial Tower Tap in handleCanvasClick
    radial_tap_target = """      // 5. Bottom Bar actions
      if (y >= 620) {"""

    radial_tap_replacement = """      // Tactical Holographic Radial Tower Clicks (When tower is selected)
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
      if (y >= 620) {"""

    if radial_tap_target in code and "Tactical Holographic Radial Tower Clicks" not in code:
        code = code.replace(radial_tap_target, radial_tap_replacement, 1)
        print("Added direct on-battlefield Radial Tower Click handlers")

    # 10. OVERHAUL BOSH MENYU (renderMainMenu)
    # Replace renderMainMenu with the Modern Tactical Dashboard
    old_main_menu_pattern = r"    renderMainMenu\(\) \{.*?renderMenuButton\("
    match = re.search(old_main_menu_pattern, code, re.DOTALL)
    if match:
        new_main_menu = """    renderMainMenu() {
      const ctx = this.ctx;
      const time = performance.now() * 0.002;

      // 1. Deep Space Atmospheric Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
      bgGrad.addColorStop(0, "#040711");
      bgGrad.addColorStop(0.4, "#070e20");
      bgGrad.addColorStop(1, "#03050b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Cyber Grid Lines
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
      }
      for (let y = 0; y <= this.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // 2. Top Header Bar (Commander Profile & Global Status)
      ctx.fillStyle = "rgba(8, 15, 28, 0.92)";
      ctx.fillRect(0, 0, this.width, 68);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, this.width, 68);

      // Game Title
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
      ctx.fillText("v3.9.0 ULTIMATE DASHBOARD", 410, 42);

      // Commander Name & Status Badge
      ctx.fillStyle = "#cfd8dc";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`KOMANDIR: ${this.playerName.toUpperCase()}  |  HQ STATUS: ONLINE`, 1110, 42);

      // Lang Button
      this.renderMiniButton(1130, 18, 110, 34, `LANG: ${this.lang.toUpperCase()}`, "#ffd600");

      // =========================================================================
      // 3. LEFT HERO SHOWCASE HANGAR (x: 40 to 420, y: 88 to 680)
      // =========================================================================
      const hx = 40, hy = 88, hw = 390, hh = 590;
      ctx.save();
      const cut = 12;
      ctx.beginPath();
      ctx.moveTo(hx + cut, hy);
      ctx.lineTo(hx + hw, hy);
      ctx.lineTo(hx + hw, hy + hh - cut);
      ctx.lineTo(hx + hw - cut, hy + hh);
      ctx.lineTo(hx, hy + hh);
      ctx.lineTo(hx, hy + cut);
      ctx.closePath();

      const hGrad = ctx.createLinearGradient(hx, hy, hx, hy + hh);
      hGrad.addColorStop(0, "rgba(12, 22, 40, 0.94)");
      hGrad.addColorStop(1, "rgba(6, 11, 20, 0.96)");
      ctx.fillStyle = hGrad;
      ctx.fill();

      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Hangar Header
      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 14px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText("🛡️ JANGOVAR MECH: APEX-01", hx + 20, hy + 32);

      ctx.fillStyle = "#00e676";
      ctx.font = "11px monospace";
      ctx.fillText("STATUS: TAYYOR (COMBAT READY)", hx + 20, hy + 50);

      // Rotating Hologram Base Plate on Floor
      const px = hx + hw / 2;
      const py = hy + 285;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px, py + 95, 120, 36, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 214, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(px, py + 95, 85, 26, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Animated 3D Mech Torso & Chassis
      const breathe = Math.sin(time * 3) * 4;
      const my = py + breathe;

      // Legs / Hydraulics
      ctx.strokeStyle = "#37474f";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(px - 35, my + 30); ctx.lineTo(px - 50, py + 85);
      ctx.moveTo(px + 35, my + 30); ctx.lineTo(px + 50, py + 85);
      ctx.stroke();

      // Foot Pads
      ctx.fillStyle = "#263238";
      ctx.fillRect(px - 65, py + 82, 30, 10);
      ctx.fillRect(px + 35, py + 82, 30, 10);

      // Heavy Torso
      ctx.fillStyle = "#1e3a5f";
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px - 45, my - 40);
      ctx.lineTo(px + 45, my - 40);
      ctx.lineTo(px + 35, my + 35);
      ctx.lineTo(px - 35, my + 35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pulsing Plasmatic Core Reactor
      const corePulse = (Math.sin(time * 5) + 1) * 0.5;
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 15 + corePulse * 10;
      ctx.fillStyle = corePulse > 0.5 ? "#ffffff" : "#00e5ff";
      ctx.beginPath();
      ctx.arc(px, my - 5, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Shoulder Armor & Heavy Missile Pods
      ctx.fillStyle = "#ff007f";
      ctx.fillRect(px - 72, my - 50, 24, 30);
      ctx.fillRect(px + 48, my - 50, 24, 30);

      // Head Visor (Glowing Cyan)
      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(px - 18, my - 62, 36, 12);

      // Hero Dossier Stats at Hangar Bottom
      ctx.fillStyle = "rgba(10, 18, 32, 0.85)";
      ctx.fillRect(hx + 15, hy + 415, hw - 30, 150);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
      ctx.strokeRect(hx + 15, hy + 415, hw - 30, 150);

      ctx.fillStyle = "#cfd8dc";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText("⚔️ ASOSIY QUROL: Dual Kinetic Tracer", hx + 28, hy + 440);
      ctx.fillText("⚡ ULT: Orbital Titan Death Beam", hx + 28, hy + 465);
      ctx.fillText("🚀 HARAKAT: Reaktiv Kinetik Dash", hx + 28, hy + 490);
      ctx.fillText("🛡️ ZIRH: Nanite Composite (Level 5)", hx + 28, hy + 515);

      ctx.fillStyle = "#ffd600";
      ctx.font = "11px monospace";
      ctx.fillText("▶ Qahramon jangda to'liq boshqariladi!", hx + 28, hy + 545);

      ctx.restore();

      // =========================================================================
      // 4. RIGHT TACTICAL MISSION MATRIX (x: 455 to 1240, y: 88 to 680)
      // =========================================================================
      // Primary Action Card 1: KAMPANIYA (x: 455, y: 88, w: 380, h: 95)
      this.drawCyberButton(455, 88, 380, 95, this.t("campaign"), "#00e5ff", "10 PROGRESSIV SEKTOR • 3 TA BIOM", "🚀", true);

      // Primary Action Card 2: CHEKSIZ OMON QOLISH (x: 855, y: 88, w: 385, h: 95)
      const record = localStorage.getItem('lg_endless_wave') || "0";
      this.drawCyberButton(855, 88, 385, 95, this.t("endless"), "#e040fb", `CHEKSIZ TO'LQINLAR • ENG YAXSHI: W${record}`, "⚡", true);

      // Secondary Action Card 3: 3D TPS ARENA (x: 455, y: 195, w: 380, h: 72)
      this.drawCyberButton(455, 195, 380, 72, "3D TPS ARENA REJIMI", "#ff007f", "UCHINCHI SHAXS O'TISHMA ARENASI", "🎮", true);

      // Secondary Action Card 4: SEKTORLAR XARITASI (x: 855, y: 195, w: 385, h: 72)
      this.drawCyberButton(855, 195, 385, 72, this.t("sectorSelect"), "#00e5ff", "XARITA VA BIOM TANLASH", "🗺️", false);

      // Quick Ops Grid (Row 3: 4 buttons, y: 278)
      this.drawCyberButton(455, 278, 185, 62, this.t("bossRush"), "#ff1744", "TITANLAR", "💀", false);
      this.drawCyberButton(650, 278, 185, 62, this.t("mapEditor"), "#00e676", "TAHRIRLASH", "🛠️", false);
      this.drawCyberButton(855, 278, 185, 62, this.t("leaderboard"), "#ffd600", "REKORDLAR", "🏆", false);
      this.drawCyberButton(1055, 278, 185, 62, this.t("fieldManual"), "#00e5ff", "QO'LLANMA", "📖", false);

      // System Controls (Row 4: y: 350)
      this.drawCyberButton(455, 350, 255, 58, "⚙️ SOZLAMALAR", "#00e5ff", "AUDIO & GRAFIKA", "⚙️", true);
      this.drawCyberButton(720, 350, 255, 58, "📲 ANDROID APK", "#00e676", "OFLAYN APK (v3.9)", "📲", true);
      this.drawCyberButton(985, 350, 255, 58, this.t("downloadOffline"), "#ffd600", "ZIP ARXIV (369KB)", "📦", false);

      // Commander Tactical Report & Dossier Panel (Bottom Right: y: 420 to 678)
      ctx.save();
      const dx = 455, dy = 420, dw = 785, dh = 258;
      ctx.fillStyle = "rgba(10, 18, 32, 0.92)";
      ctx.fillRect(dx, dy, dw, dh);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dx, dy, dw, dh);

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 15px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText("📊 KOMANDIR STRATEGIK HISOBOTI", dx + 24, dy + 32);

      // Stats 4-box grid
      const totalStars = Object.values(this.saveData.stars || {}).reduce((a, b) => a + b, 0);
      const boxes = [
        { label: "QO'LGA KIRITILGAN YULDUZLAR", val: `★ ${totalStars} / 30`, col: "#ffd600" },
        { label: "CHEKSIZ REKORD TO'LQINI", val: `Wave ${record}`, col: "#e040fb" },
        { label: "LIDERLIK BALLI", val: `${this.saveData.highScores?.campaign || 0} PTS`, col: "#00e5ff" },
        { label: "STANDALONE APK TIZIMI", val: "100% OFFLINE TAYYOR", col: "#00e676" }
      ];

      for (let i = 0; i < 4; i++) {
        const bx = dx + 20 + (i % 2) * 375;
        const by = dy + 50 + Math.floor(i / 2) * 72;
        ctx.fillStyle = "rgba(16, 28, 48, 0.85)";
        ctx.fillRect(bx, by, 360, 60);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
        ctx.strokeRect(bx, by, 360, 60);

        ctx.fillStyle = "#90a4ae";
        ctx.font = "11px monospace";
        ctx.fillText(boxes[i].label, bx + 16, by + 22);

        ctx.fillStyle = boxes[i].col;
        ctx.font = "bold 18px 'Segoe UI', monospace";
        ctx.fillText(boxes[i].val, bx + 16, by + 47);
      }

      ctx.fillStyle = "#78909c";
      ctx.font = "11px monospace";
      ctx.fillText("💡 MASLAHAT: Jang paytida minora ustiga bosing — to'g'ridan-to'g'ri golografik taktik halqa ochiladi!", dx + 24, dy + 232);

      ctx.restore();
    }

    renderMenuButton("""
        code = code[:match.start()] + new_main_menu + code[match.end():]
        print("Replaced renderMainMenu with Modern Tactical Dashboard")
    else:
        print("Warning: old_main_menu_pattern not matched")

    # 11. UPDATE MENU CLICK HANDLERS in handleCanvasClick
    old_menu_click_target = """      if (this.state === 'MENU') {
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

    new_menu_click_replacement = """      if (this.state === 'MENU') {
        // Left Hero Hangar Tap (Trigger Hero Sound & Spark)
        if (x >= 40 && x <= 430 && y >= 88 && y <= 678) {
          audio.heroSlash();
          this.vibrate([30, 20, 50]);
          this.addFloatingText("⚡ APEX-01 SYSTEM ONLINE!", 235, 300, "#00e5ff", 18);
          return;
        }

        // Primary Action 1: Kampaniya (x: 455 to 835, y: 88 to 183)
        if (x >= 455 && x <= 835 && y >= 88 && y <= 183) { this.startMission(0, 'CAMPAIGN'); return; }

        // Primary Action 2: Cheksiz Omon Qolish (x: 855 to 1240, y: 88 to 183)
        if (x >= 855 && x <= 1240 && y >= 88 && y <= 183) { this.startMission(9, 'ENDLESS'); return; }

        // Secondary Action 3: 3D TPS Arena (x: 455 to 835, y: 195 to 267)
        if (x >= 455 && x <= 835 && y >= 195 && y <= 267) { this.start3DTPSMode(); return; }

        // Secondary Action 4: Sektorlar Xaritasi (x: 855 to 1240, y: 195 to 267)
        if (x >= 855 && x <= 1240 && y >= 195 && y <= 267) { this.state = 'MAP_SELECT'; return; }

        // Quick Ops Row 3 (y: 278 to 340)
        if (y >= 278 && y <= 340) {
          if (x >= 455 && x <= 640) { this.startMission(0, 'BOSS_RUSH'); return; }
          if (x >= 650 && x <= 835) { this.state = 'EDITOR'; return; }
          if (x >= 855 && x <= 1040) { this.state = 'LEADERBOARD'; return; }
          if (x >= 1055 && x <= 1240) { this.state = 'MANUAL'; return; }
        }

        // System Controls Row 4 (y: 350 to 408)
        if (y >= 350 && y <= 408) {
          if (x >= 455 && x <= 710) { this.showSettingsModal = true; this.settingsReturnState = 'MENU'; return; }
          if (x >= 720 && x <= 975) { this.downloadApk(); return; }
          if (x >= 985 && x <= 1240) { this.downloadOfflineZip(); return; }
        }

        // Language Switcher Top Right
        if (x >= 1130 && x <= 1240 && y >= 18 && y <= 52) {
          this.toggleLanguage();
          return;
        }
        return;
      }"""

    if old_menu_click_target in code:
        code = code.replace(old_menu_click_target, new_menu_click_replacement, 1)
        print("Updated handleCanvasClick for Modern Tactical Dashboard")
    else:
        print("Warning: old_menu_click_target not found")

    # 12. Save to game.js and android_project/assets/www/game.js
    with open(game_js_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Saved /mnt/sdcard/Agent/UI_UX_18_11_2026/game.js")

    www_game_path = "/mnt/sdcard/Agent/UI_UX_18_11_2026/android_project/assets/www/game.js"
    with open(www_game_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Saved /mnt/sdcard/Agent/UI_UX_18_11_2026/android_project/assets/www/game.js")

if __name__ == "__main__":
    main()
