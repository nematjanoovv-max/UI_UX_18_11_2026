import re

for filepath in ['game.js', 'web/game.js', 'android_project/assets/www/game.js']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # =========================================================================
    # 1. FIX TOP HEADER TITLE & VERSION OVERLAP
    # =========================================================================
    target_header = """      // Game Title (Strictly non-overlapping)
      ctx.save();
      ctx.shadowColor = "rgba(0, 229, 255, 0.8)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 21px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      ctx.fillText("⚡ TOWER DEFENSE: LAST GRID", 35, 42);
      ctx.restore();

      // Version in separate pill badge
      this.renderMiniButton(370, 22, 65, 26, "v4.1.0", "#ff007f");

      // Commander Name & Status Badge
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`KOMANDIR: ${this.playerName.toUpperCase()}`, 450, 42);"""

    replacement_header = """      // Game Title (Dynamically measured to prevent badge overlap)
      ctx.save();
      ctx.shadowColor = "rgba(0, 229, 255, 0.8)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#00e5ff";
      ctx.font = "900 20px 'Segoe UI', monospace";
      ctx.textAlign = "left";
      const titleStr = "⚡ TOWER DEFENSE: LAST GRID";
      ctx.fillText(titleStr, 35, 42);
      const titleWidth = ctx.measureText(titleStr).width;
      ctx.restore();

      // Version in separate pill badge (cleanly placed with generous padding)
      const badgeX = Math.round(35 + titleWidth + 18);
      this.renderMiniButton(badgeX, 22, 65, 26, "v4.1.0", "#ff007f");

      // Commander Name & Status Badge
      const cmdX = badgeX + 82;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`KOMANDIR: ${this.playerName.toUpperCase()}`, cmdX, 42);"""

    assert target_header in content, f"target_header not found in {filepath}"
    content = content.replace(target_header, replacement_header)

    # =========================================================================
    # 2. REMOVE "3D MECH STUDIYA (360°)" BUTTON FROM LEFT HANGAR
    # =========================================================================
    target_hangar_bottom = """      // Hero Dossier Stats at Hangar Bottom
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
      ctx.fillText("▶ Qahramon jangda to'liq boshqariladi!", hx + 28, hy + 540);

      // 3D Mech Studio Button
      this.renderMenuButton(hx + 20, hy + 520, hw - 40, 48, "🤖 3D MECH STUDIYA (360°)", "#00e5ff", "#000");"""

    replacement_hangar_bottom = """      // Hero Dossier Stats at Hangar Bottom (Clean layout without overlapping buttons)
      ctx.fillStyle = "rgba(10, 18, 32, 0.85)";
      ctx.fillRect(hx + 15, hy + 415, hw - 30, 160);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
      ctx.strokeRect(hx + 15, hy + 415, hw - 30, 160);

      ctx.fillStyle = "#cfd8dc";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText("⚔️ ASOSIY QUROL: Dual Kinetic Tracer", hx + 28, hy + 445);
      ctx.fillText("⚡ ULT: Orbital Titan Death Beam", hx + 28, hy + 472);
      ctx.fillText("🚀 HARAKAT: Reaktiv Kinetik Dash", hx + 28, hy + 499);
      ctx.fillText("🛡️ ZIRH: Nanite Composite (Level 5)", hx + 28, hy + 526);

      ctx.fillStyle = "#00e676";
      ctx.font = "bold 12px monospace";
      ctx.fillText("✔ Qahramon jangda to'liq faol va boshqaruvda!", hx + 28, hy + 555);"""

    assert target_hangar_bottom in content, f"target_hangar_bottom not found in {filepath}"
    content = content.replace(target_hangar_bottom, replacement_hangar_bottom)

    # =========================================================================
    # 3. REMOVE "3D TPS ARENA REJIMI", "ENSIKLOPEDIYA", "OFLAYN ZIP" & "STANDALONE APK TIZIMI"
    # =========================================================================
    target_menu_cards = """      // Secondary Action Card 3: 3D TPS ARENA (x: 455, y: 195, w: 380, h: 72)
      this.drawCyberButton(455, 195, 380, 72, "3D TPS ARENA REJIMI", "#ff007f", "UCHINCHI SHAXS O'TISHMA ARENASI", "🎮", true);

      // Secondary Action Card 4: SEKTORLAR XARITASI (x: 855, y: 195, w: 385, h: 72)
      this.drawCyberButton(855, 195, 385, 72, this.t("sectorSelect"), "#00e5ff", "XARITA VA BIOM TANLASH", "🗺️", false);

      // Quick Ops Grid (Row 3: 4 buttons, y: 278)
      this.drawCyberButton(455, 278, 185, 62, this.t("bossRush"), "#ff1744", "TITANLAR", "💀", false);
      this.drawCyberButton(650, 278, 185, 62, this.t("mapEditor"), "#00e676", "TAHRIRLASH", "🛠️", false);
      this.drawCyberButton(855, 278, 185, 62, this.t("leaderboard"), "#ffd600", "REKORDLAR", "🏆", false);
      this.drawCyberButton(1055, 278, 185, 62, this.t("fieldManual"), "#00e5ff", "QO'LLANMA", "📖", false);

      // System Controls (Row 4: y: 350)
      this.drawCyberButton(455, 350, 255, 58, "SOZLAMALAR", "#00e5ff", "AUDIO & GRAFIKA", "⚙️", true);
      this.drawCyberButton(720, 350, 255, 58, "ANDROID APK", "#00e676", "OFLAYN APK (44MB)", "📲", true);
      this.drawCyberButton(985, 350, 255, 58, this.t("downloadOffline"), "#ffd600", "ZIP ARXIV (40MB)", "📦", false);

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

      // Quick Access: Achievements & Battle Analytics
      this.drawCyberButton(dx + 20, dy + 196, 360, 48, "🏆 YUTUQLAR ZALI", "#ffd600", "20 TA UNVON VA TROFEYLAR", "★", true);
      this.drawCyberButton(dx + 395, dy + 196, 365, 48, "📊 JANG TAHLILI", "#00e5ff", "MVP & TELEMETRIYA", "📈", false);"""

    replacement_menu_cards = """      // Secondary Action Card: SEKTORLAR XARITASI (Full-width balanced layout, x: 455, y: 195, w: 785, h: 72)
      this.drawCyberButton(455, 195, 785, 72, this.t("sectorSelect"), "#00e5ff", "10 TA STRATEGIK SEKTOR VA BIOM TANLASH", "🗺️", true);

      // Quick Ops Grid (Row 3: 3 balanced buttons across 785px, y: 278)
      this.drawCyberButton(455, 278, 250, 62, this.t("bossRush"), "#ff1744", "TITANLAR DUELI", "💀", false);
      this.drawCyberButton(722, 278, 250, 62, this.t("mapEditor"), "#00e676", "XARITALAR MUHARRIRI", "🛠️", false);
      this.drawCyberButton(990, 278, 250, 62, this.t("leaderboard"), "#ffd600", "GLOBAL REKORDLAR", "🏆", false);

      // System Controls (Row 4: 2 wide ergonomic buttons across 785px, y: 350)
      this.drawCyberButton(455, 350, 380, 58, "SOZLAMALAR", "#00e5ff", "AUDIO VA GRAFIKA SOZLAMALARI", "⚙️", true);
      this.drawCyberButton(860, 350, 380, 58, "ANDROID APK", "#00e676", "OFLAYN APK O'RNATISH (44MB)", "📲", true);

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

      // Stats 3-box clean player performance row (No redundant APK marketing text)
      const totalStars = Object.values(this.saveData.stars || {}).reduce((a, b) => a + b, 0);
      const statBoxes = [
        { label: "QO'LGA KIRITILGAN YULDUZLAR", val: `★ ${totalStars} / 30`, col: "#ffd600" },
        { label: "CHEKSIZ REKORD TO'LQINI", val: `Wave ${record}`, col: "#e040fb" },
        { label: "LIDERLIK BALLI", val: `${this.saveData.highScores?.campaign || 0} PTS`, col: "#00e5ff" }
      ];

      for (let i = 0; i < 3; i++) {
        const bx = dx + 20 + i * 252;
        const by = dy + 52;
        ctx.fillStyle = "rgba(16, 28, 48, 0.85)";
        ctx.fillRect(bx, by, 240, 75);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
        ctx.strokeRect(bx, by, 240, 75);

        ctx.fillStyle = "#90a4ae";
        ctx.font = "11px monospace";
        ctx.fillText(statBoxes[i].label, bx + 14, by + 25);

        ctx.fillStyle = statBoxes[i].col;
        ctx.font = "bold 20px 'Segoe UI', monospace";
        ctx.fillText(statBoxes[i].val, bx + 14, by + 56);
      }

      // Quick Access: Achievements & Battle Analytics (Expanded clean cards)
      this.drawCyberButton(dx + 20, dy + 150, 365, 82, "🏆 YUTUQLAR ZALI", "#ffd600", "20 TA UNVON VA TROFEYLAR", "★", true);
      this.drawCyberButton(dx + 400, dy + 150, 365, 82, "📊 JANG TAHLILI", "#00e5ff", "MVP & TELEMETRIYA TAHLILI", "📈", true);"""

    assert target_menu_cards in content, f"target_menu_cards not found in {filepath}"
    content = content.replace(target_menu_cards, replacement_menu_cards)

    # =========================================================================
    # 4. UPDATE MENU CLICK HANDLERS
    # =========================================================================
    target_clicks = """        // Left Hero Hangar Tap (Trigger Hero Sound or Open 3D Studio)
        if (x >= 40 && x <= 430 && y >= 88 && y <= 678) {
          if (y >= 580 || (x >= 55 && x <= 415 && y >= 570)) {
            window.location.href = 'preview_character.html';
            return;
          }
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
          if (x >= 455 && x <= 710) {
            this.showSettingsModal = true;
            this.settingsReturnState = 'MENU';
            if (this.apexSystem) this.apexSystem.hide();
            audio.click();
            return;
          }
          if (x >= 720 && x <= 975) { this.downloadApk(); return; }
          if (x >= 985 && x <= 1240) { this.downloadOfflineZip(); return; }
        }

        // Strategic Report Action Buttons (Achievements & Analytics)
        if (y >= 615 && y <= 668) {
          if (x >= 475 && x <= 835) {
            this.state = 'ACHIEVEMENTS';
            this.achievementsPage = 0;
            if (this.apexSystem) this.apexSystem.hide();
            audio.click();
            return;
          }
          if (x >= 850 && x <= 1220) {
            this.state = 'ANALYTICS';
            if (this.apexSystem) this.apexSystem.hide();
            audio.click();
            return;
          }
        }"""

    replacement_clicks = """        // Left Hero Hangar Tap (Trigger Hero Sound effect without navigating away)
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

        // Secondary Action: Sektorlar Xaritasi (Full width, x: 455 to 1240, y: 195 to 267)
        if (x >= 455 && x <= 1240 && y >= 195 && y <= 267) { this.state = 'MAP_SELECT'; return; }

        // Quick Ops Row 3 (y: 278 to 340)
        if (y >= 278 && y <= 340) {
          if (x >= 455 && x <= 705) { this.startMission(0, 'BOSS_RUSH'); return; }
          if (x >= 722 && x <= 972) { this.state = 'EDITOR'; return; }
          if (x >= 990 && x <= 1240) { this.state = 'LEADERBOARD'; return; }
        }

        // System Controls Row 4 (y: 350 to 408)
        if (y >= 350 && y <= 408) {
          if (x >= 455 && x <= 835) {
            this.showSettingsModal = true;
            this.settingsReturnState = 'MENU';
            if (this.apexSystem) this.apexSystem.hide();
            audio.click();
            return;
          }
          if (x >= 860 && x <= 1240) { this.downloadApk(); return; }
        }

        // Strategic Report Action Buttons (Achievements & Analytics, y: 570 to 660)
        if (y >= 570 && y <= 660) {
          if (x >= 475 && x <= 840) {
            this.state = 'ACHIEVEMENTS';
            this.achievementsPage = 0;
            if (this.apexSystem) this.apexSystem.hide();
            audio.click();
            return;
          }
          if (x >= 855 && x <= 1225) {
            this.state = 'ANALYTICS';
            if (this.apexSystem) this.apexSystem.hide();
            audio.click();
            return;
          }
        }"""

    assert target_clicks in content, f"target_clicks not found in {filepath}"
    content = content.replace(target_clicks, replacement_clicks)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned up {filepath} successfully!")

print("All requested menu sections removed and version overlap fixed!")
