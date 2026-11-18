with open('/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Upgrade renderDraftModal
old_draft = """    renderDraftModal() {
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
    }"""

new_draft = """    renderDraftModal() {
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
    }"""

assert old_draft in code, "old_draft not found"
code = code.replace(old_draft, new_draft, 1)

# 2. Upgrade Pause, Victory, and Defeat modals
old_modals = """    renderPauseModal() {
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
    }"""

new_modals = """    renderPauseModal() {
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

      this.drawCyberButton(440, 380, 400, 52, "DAVOM ETISH", "#00e676", "RESUME COMBAT", "▶", true);
      this.drawCyberButton(440, 448, 400, 52, "ASOSIY MENYUGA QAYTISH", "#ff1744", "ABORT MISSION", "←", false);
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

      this.drawCyberButton(340, 430, 180, 56, this.t("playAgain"), "#00e676", "RETRY SECTOR", "▶", true);
      this.drawCyberButton(550, 430, 180, 56, "STATISTIKA", "#ffd600", "BATTLE REPORT", "📊", false);
      this.drawCyberButton(760, 430, 180, 56, this.t("mainMenu"), "#00e5ff", "COMMAND HQ", "←", false);
    }

    renderDefeatModal() {
      const ctx = this.ctx;
      ctx.fillStyle = "rgba(4, 7, 14, 0.94)";
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.shadowColor = "rgba(255, 23, 68, 0.85)";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#ff1744";
      ctx.font = "900 46px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("💀 SEKTOR VAYRON BO'LDI", 640, 210);
      ctx.restore();

      ctx.fillStyle = "#b0bec5";
      ctx.font = "bold 18px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Dushmanlar ${this.wave}-to'lqinda bazani yorib o'tdi. To'plangan ball: ${this.score} PTS`, 640, 270);

      this.drawCyberButton(340, 430, 180, 56, this.t("retry"), "#ff1744", "RESTART SECTOR", "🔄", true);
      this.drawCyberButton(550, 430, 180, 56, "STATISTIKA", "#ffd600", "BATTLE REPORT", "📊", false);
      this.drawCyberButton(760, 430, 180, 56, this.t("mainMenu"), "#00e5ff", "COMMAND HQ", "←", false);
    }"""

assert old_modals in code, "old_modals not found"
code = code.replace(old_modals, new_modals, 1)

# 3. Add pause modal touch handling in handlePointerDown
old_paused_check = """      if (this.state === 'PAUSED') {
        this.togglePause();
        return;
      }"""

new_paused_check = """      if (this.state === 'PAUSED') {
        if (x >= 440 && x <= 840 && y >= 380 && y <= 432) {
          this.togglePause();
          return;
        } else if (x >= 440 && x <= 840 && y >= 448 && y <= 500) {
          this.state = 'MENU';
          this.vibrate(20);
          return;
        }
        this.togglePause();
        return;
      }"""

if old_paused_check in code:
    code = code.replace(old_paused_check, new_paused_check, 1)

with open('/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Modals upgrade complete!")
