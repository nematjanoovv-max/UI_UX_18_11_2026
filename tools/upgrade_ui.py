import re

with open('/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add drawCyberButton and upgrade renderBottomBar
old_bottom_bar_pattern = r"    renderBottomBar\(\) \{[\s\S]*?this\.ctx\.fillText\(\"MUSTAHKAM DEVOR\", barX \+ 10, 693\);\s*\}\s*\}"

new_bottom_bar = '''    drawCyberButton(x, y, w, h, text, color = "#00e5ff", subtext = "", icon = "", isHighlighted = false) {
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

      // 1. Hero Mech Button (Far Left)
      const isHeroUltReady = this.hero.currentUltCd <= 0;
      this.drawCyberButton(10, 628, 52, 78, "ULT", isHeroUltReady ? "#ffd600" : "#455a64", isHeroUltReady ? "READY" : `${Math.ceil(this.hero.currentUltCd)}s`, "⚡", isHeroUltReady);

      // 2. 4 Commander Skills Panel (x: 68 to 228)
      const skillList = ['emp', 'orbital', 'overclock', 'drone'];
      for (let i = 0; i < 4; i++) {
        const k = skillList[i];
        const s = this.skills[k];
        const sx = 68 + i * 40;
        const isReady = s.currentCd <= 0 && this.gold >= s.cost;
        const color = isReady ? "#00e5ff" : "#37474f";

        this.drawCyberButton(sx, 628, 36, 78, `[${s.key}]`, color, `${s.cost}g`, "", isReady);

        if (s.currentCd > 0) {
          ctx.fillStyle = "rgba(255, 23, 68, 0.65)";
          const pct = s.currentCd / s.cd;
          ctx.fillRect(sx, 628 + 78 * (1 - pct), 36, 78 * pct);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`${Math.ceil(s.currentCd)}`, sx + 18, 696);
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
    }'''

content, count1 = re.subn(old_bottom_bar_pattern, new_bottom_bar, content, count=1)
print(f"Replaced renderBottomBar: {count1}")

# 2. Upgrade renderMainMenu and renderMenuButton
old_menu_pattern = r"    renderMainMenu\(\) \{[\s\S]*?renderMenuButton\(x, y, w, h, text, bg, fg, border\) \{[\s\S]*?this\.ctx\.fillText\(text, x \+ w / 2, y \+ h / 2 \+ 5\);\s*\}"

new_menu = '''    renderMainMenu() {
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
      ctx.fillText("⚡ CYBER-NEON TACTICAL BATTLEFIELD (v3.5.0) ⚡", 640, 172);

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

      // Menu Cyber Buttons
      this.drawCyberButton(440, 265, 400, 48, "3D TPS ARENA REJIMI", "#ff007f", "DIRECT 3D OVER-THE-SHOULDER COMBAT", "🎮", true);
      this.drawCyberButton(440, 322, 400, 48, this.t("campaign"), "#00e5ff", "10 PROGRESSIVE TACTICAL GRID SECTORS", "🚀", true);
      this.drawCyberButton(440, 379, 400, 46, this.t("sectorSelect"), "#00e5ff", "MISSION ARCHIVE & REPLAY ZONES", "🗺", false);
      this.drawCyberButton(440, 434, 400, 46, this.t("endless"), "#e040fb", "INFINITE HIGH-SPEED WAVE SURVIVAL", "⚡", false);

      this.drawCyberButton(440, 489, 190, 44, this.t("bossRush"), "#ff1744", "ELITE TITANS", "💀", false);
      this.drawCyberButton(650, 489, 190, 44, this.t("mapEditor"), "#00e676", "GRID CREATOR", "🛠", false);

      this.drawCyberButton(440, 542, 190, 44, this.t("leaderboard"), "#ffd600", "GLOBAL AGENTS", "🏆", false);
      this.drawCyberButton(650, 542, 190, 44, this.t("fieldManual"), "#00e5ff", "TOWER SPECS", "📖", false);

      this.drawCyberButton(440, 595, 190, 44, "ANDROID APK", "#00e676", "OFFLINE STANDALONE", "📲", true);
      this.drawCyberButton(650, 595, 190, 44, this.t("downloadOffline"), "#ffd600", "ASSET ZIP BUNDLE", "📦", false);
    }

    renderMenuButton(x, y, w, h, text, bg, fg, border) {
      const color = border || fg || "#00e5ff";
      const isHigh = (border === "#ffd600" || bg === "#00e5ff" || bg === "#ff007f" || border === "#00e676");
      this.drawCyberButton(x, y, w, h, text, color, "", "", isHigh);
    }'''

content, count2 = re.subn(old_menu_pattern, new_menu, content, count=1)
print(f"Replaced renderMainMenu and renderMenuButton: {count2}")

# 3. Upgrade renderMapSelect
old_map_select_pattern = r"    renderMapSelect\(\) \{[\s\S]*?this\.ctx\.fillText\(\"DEPLOY SECTOR\", x \+ 110, y \+ 191\);\s*\}\s*\}"

new_map_select = '''    renderMapSelect() {
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
        ctx.fillText(`WAVES: ${m.wave_count}`, x + 14, y + 160);

        this.drawCyberButton(x + 12, y + 176, 206, 42, "JANGGA KIRISH", isCompleted ? "#00e676" : "#00e5ff", `SECTOR 0${i + 1}`, "▶", true);

        ctx.restore();
      }
    }'''

content, count3 = re.subn(old_map_select_pattern, new_map_select, content, count=1)
print(f"Replaced renderMapSelect: {count3}")

# 4. Update pointer down top HUD and map select click hitboxes
old_pointer_top_hud = r"      if \(y >= 0 && y <= 60\) \{[\s\S]*?else if \(x >= 1176 && x <= 1250\) this\.togglePause\(\);\s*return;\s*\}"
new_pointer_top_hud = '''      if (y >= 0 && y <= 60) {
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
      }'''

content, count4 = re.subn(old_pointer_top_hud, new_pointer_top_hud, content, count=1)
print(f"Replaced pointer top HUD: {count4}")

# 5. Update map select pointer clicks
old_pointer_map_select = r"      if \(this\.state === 'MAP_SELECT'\) \{[\s\S]*?this\.startMission\(i, 'CAMPAIGN'\);\s*return;\s*\}\s*\}\s*return;\s*\}"
new_pointer_map_select = '''      if (this.state === 'MAP_SELECT') {
        if (y > 15 && y < 65 && x > 30 && x < 160) { this.state = 'MENU'; return; }
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
      }'''

content, count5 = re.subn(old_pointer_map_select, new_pointer_map_select, content, count=1)
print(f"Replaced pointer map select: {count5}")

with open('/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Upgrade complete!")
