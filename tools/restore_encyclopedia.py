import re

for filepath in ['game.js', 'web/game.js', 'android_project/assets/www/game.js']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Row 2 in renderMainMenu to feature SEKTORLAR XARITASI & ENSIKLOPEDIYA
    target_row2 = """      // Secondary Action Card: SEKTORLAR XARITASI (Full-width balanced layout, x: 455, y: 195, w: 785, h: 72)
      this.drawCyberButton(455, 195, 785, 72, this.t("sectorSelect"), "#00e5ff", "10 TA STRATEGIK SEKTOR VA BIOM TANLASH", "🗺️", true);"""

    replacement_row2 = """      // Secondary Action Cards Row 2 (Balanced 2-card layout, y: 195, h: 72)
      // Left: Sektorlar Xaritasi
      this.drawCyberButton(455, 195, 380, 72, this.t("sectorSelect"), "#00e5ff", "10 TA STRATEGIK SEKTOR VA BIOM", "🗺️", true);
      // Right: Ensiklopedya (Kiber-Kodex)
      this.drawCyberButton(855, 195, 385, 72, this.t("fieldManual"), "#ffd600", "MINORALAR, DUSHMANLAR VA BOSSLAR BAZASI", "📖", true);"""

    assert target_row2 in content, f"target_row2 not found in {filepath}"
    content = content.replace(target_row2, replacement_row2)

    # 2. Update Row 2 click handlers in handleCanvasClick
    target_click = """        // Secondary Action: Sektorlar Xaritasi (Full width, x: 455 to 1240, y: 195 to 267)
        if (x >= 455 && x <= 1240 && y >= 195 && y <= 267) { this.state = 'MAP_SELECT'; return; }"""

    replacement_click = """        // Secondary Action Row 2 (y: 195 to 267)
        // Left: Sektorlar Xaritasi (x: 455 to 835)
        if (x >= 455 && x <= 835 && y >= 195 && y <= 267) { this.state = 'MAP_SELECT'; return; }
        // Right: Ensiklopediya (x: 855 to 1240)
        if (x >= 855 && x <= 1240 && y >= 195 && y <= 267) {
          this.state = 'MANUAL';
          if (this.apexSystem) this.apexSystem.hide();
          audio.click();
          return;
        }"""

    assert target_click in content, f"target_click not found in {filepath}"
    content = content.replace(target_click, replacement_click)

    # 3. Add auto-font scaling to drawCyberButton so long titles never clip
    target_btn_font = """      ctx.fillStyle = (isHighlighted || isHovered) ? "#ffffff" : color;
      ctx.font = "bold 13px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      const fullTitle = icon ? `${icon} ${text}` : text;
      ctx.fillText(fullTitle, bx + bw / 2, titleY);"""

    replacement_btn_font = """      ctx.fillStyle = (isHighlighted || isHovered) ? "#ffffff" : color;
      let fontSize = 13;
      ctx.font = `bold ${fontSize}px 'Segoe UI', monospace`;
      ctx.textAlign = "center";
      const fullTitle = icon ? `${icon} ${text}` : text;
      const textW = ctx.measureText(fullTitle).width;
      const maxW = bw - 14;
      if (textW > maxW) {
        fontSize = Math.max(9, Math.floor(fontSize * (maxW / textW)));
        ctx.font = `bold ${fontSize}px 'Segoe UI', monospace`;
      }
      ctx.fillText(fullTitle, bx + bw / 2, titleY);"""

    assert target_btn_font in content, f"target_btn_font not found in {filepath}"
    content = content.replace(target_btn_font, replacement_btn_font)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Restored Ensiklopediya in {filepath}")

print("Ensiklopediya successfully restored and optimized!")
