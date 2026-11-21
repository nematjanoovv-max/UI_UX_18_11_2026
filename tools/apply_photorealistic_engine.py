#!/usr/bin/env python3
"""
Apply Photorealistic In-Game Unit and Battlefield Rendering Engine to game.js
"""

import sys, os

GAME_JS = "/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js"

with open(GAME_JS, "r", encoding="utf-8") as f:
    content = f.read()

target_hero = "    renderHero() {"
idx_hero = content.find(target_hero)
if idx_hero == -1:
    print("ERROR: could not find renderHero()", file=sys.stderr)
    sys.exit(1)

target_proj = "    renderProjectiles() {"
idx_proj = content.find(target_proj)
if idx_proj == -1:
    print("ERROR: could not find renderProjectiles()", file=sys.stderr)
    sys.exit(1)

NEW_CODE = r'''    drawHexBolt(ctx, x, y, r = 2) {
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

      // Slotted Muzzle Brake with Heat Glow
      this.drawSlottedMuzzleBrake(ctx, 42 - barrelRecoil, -7.5, 9, 15, 3);
      if (h.siegeRecoil > 0) {
        ctx.fillStyle = `rgba(192, 132, 252, ${h.siegeRecoil})`;
        ctx.fillRect(44 - barrelRecoil, -6, 6, 12);
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

        const baseGrad = ctx.createLinearGradient(t.x - 25, t.y - 25, t.x + 25, t.y + 25);
        baseGrad.addColorStop(0, "#475569");
        baseGrad.addColorStop(0.4, "#1e293b");
        baseGrad.addColorStop(1, "#090d16");
        ctx.fillStyle = baseGrad;
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
        } else if (t.type === 'beacon') {
          // Tactical Radar / Overcharge Arc
          const spGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
          spGrad.addColorStop(0, "#ffffff"); spGrad.addColorStop(0.5, "#b388ff"); spGrad.addColorStop(1, "#651fff");
          ctx.fillStyle = spGrad;
          ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#ffd600"; ctx.lineWidth = 2; ctx.stroke();
        } else if (t.type === 'tesla') {
          // Induction Coil Stack & Spherical Electrode
          this.drawBevelPlate(ctx, -9, -11, 18, 22, "#334155", "#ffd600", 3);
          const tGrad = ctx.createRadialGradient(10, 0, 1, 10, 0, 9);
          tGrad.addColorStop(0, "#ffffff"); tGrad.addColorStop(0.5, "#ffd600"); tGrad.addColorStop(1, "#b45309");
          ctx.fillStyle = tGrad;
          ctx.beginPath(); ctx.arc(10, 0, 8.5, 0, Math.PI * 2); ctx.fill();
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

      for (const e of this.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);

        if (e.isFlyer) {
          if (e.type === "gunship") {
            // VTOL Heavy Aerial Attack Gunship
            this.drawUnitContactShadow(ctx, 24, 13, 0.45);
            ctx.rotate(e.angle);
            const rotorSpin = tNow * 0.05;

            // Swept Composite Stealth Wings
            this.drawBevelPlate(ctx, -7, -24, 9, 48, "#334155", "#64748b", 2);

            // Dual Tilting Tilt-Rotor Nacelles
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

            // Underslung Chin 30mm Autocannon
            this.drawTemperedBarrel(ctx, 17, -1.5, 10, 3);

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
          ctx.fillStyle = "#0f172a"; ctx.fillRect(-10 + walk, -9, 8, 4.5); ctx.fillRect(-10 - walk, 4.5, 8, 4.5);

          // Ballistic Kevlar Chest Rig
          this.drawBevelPlate(ctx, -8, -8, 16, 16, "#334155", e.color || "#00e5ff", 3);
          // Combat Helmet & Glowing NVG Visor
          ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(4, 0, 5.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#00e5ff"; ctx.fillRect(6, -2.5, 4, 5);
          ctx.fillStyle = "#ffffff"; ctx.fillRect(8, -1.2, 1.8, 2.4);
          // Assault Carbine
          this.drawTemperedBarrel(ctx, 7, 3, 14, 3.5);

        } else if (e.type === "sprinter") {
          // Quadruped Predator Cyber-Hound
          ctx.rotate(e.angle);
          const runFore = Math.sin(e.walkAnim || 0) * 7;
          const runHind = Math.sin((e.walkAnim || 0) + 1.2) * 7;
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(4 + runFore, -12, 7, 4.5); ctx.fillRect(4 - runFore, 7.5, 7, 4.5);
          ctx.fillRect(-12 - runHind, -11, 7, 5); ctx.fillRect(-12 + runHind, 6, 7, 5);

          // Flexible Carbon Chassis
          this.drawBevelPlate(ctx, -13, -8, 26, 16, "#451a03", e.color || "#ffd600", 4);
          // Cyber Skull & Glowing Crimson Optics
          ctx.fillStyle = "#0f172a";
          ctx.beginPath(); ctx.moveTo(9, -4.5); ctx.lineTo(18, 0); ctx.lineTo(9, 4.5); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#ff1744"; ctx.fillRect(13, -2, 4, 4);

        } else if (e.type === "brute") {
          // 4-Meter War-Mech Juggernaut
          ctx.rotate(e.angle);
          const stomp = Math.sin(e.walkAnim || 0) * 4.5;
          ctx.fillStyle = "#090d16";
          ctx.fillRect(-18 + stomp, -19, 12, 9); ctx.fillRect(-18 - stomp, 10, 12, 9);

          // Bolted Glacis Armor & Hazard Stripes
          this.drawBevelPlate(ctx, -16, -17, 30, 34, "#334155", e.color || "#ff007f", 4);
          this.drawHazardStripes(ctx, -14, -14, 6, 28, 4);

          // Twin Exhaust Smokestacks spewing soot & ember sparks
          ctx.fillStyle = "#1e293b"; ctx.fillRect(-19, -15, 5, 8); ctx.fillRect(-19, 7, 5, 8);
          ctx.fillStyle = "#ff3d00"; ctx.fillRect(-20, -14, 2, 6); ctx.fillRect(-20, 8, 2, 6);

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

          // High-Explosive Spherical Payload
          const kGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 10);
          kGrad.addColorStop(0, "#cbd5e1"); kGrad.addColorStop(0.5, "#475569"); kGrad.addColorStop(1, "#090d16");
          ctx.fillStyle = kGrad; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();

          // High-Intensity Ticking Crimson Strobe
          const kStrobe = Math.sin(tNow * 0.025) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255, 23, 68, ${0.5 + kStrobe * 0.5})`;
          ctx.beginPath(); ctx.arc(0, 0, 5 + kStrobe * 2, 0, Math.PI * 2); ctx.fill();

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

          // Armored Chitin Carapace
          this.drawBevelPlate(ctx, -10, -7, 18, 14, "#0f172a", "#ffab00", 3);
          ctx.fillStyle = "#ff1744"; ctx.fillRect(4, -2.5, 4, 5);

        } else if (e.type === "shieldbearer") {
          // Aegis Paladin Mech with Hex-Pavise Shield
          ctx.rotate(e.angle);
          this.drawBevelPlate(ctx, -13, -12, 18, 24, "#1e293b", "#00b0ff", 4);
          ctx.fillStyle = "#00e5ff"; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();

          // Curved Holographic Hex Shield
          ctx.save();
          ctx.strokeStyle = "rgba(0, 176, 255, 0.95)";
          ctx.fillStyle = "rgba(0, 229, 255, 0.35)";
          ctx.lineWidth = 3.5;
          ctx.beginPath(); ctx.arc(13, 0, 24, -Math.PI / 2.2, Math.PI / 2.2); ctx.stroke(); ctx.fill();
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

        } else if (e.type === "phantom") {
          // Stealth Spectre with Chromatic Aberration
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

          // 4 Independent Heavy Caterpillar Tread Assemblies
          ctx.fillStyle = "#090d16";
          ctx.fillRect(-28 + walkB, -30, 20, 14); ctx.fillRect(-28 - walkB, 16, 20, 14);
          ctx.fillRect(8 - walkB, -30, 20, 14); ctx.fillRect(8 + walkB, 16, 20, 14);
          ctx.strokeStyle = "#ff1744"; ctx.lineWidth = 1.8;
          ctx.strokeRect(-28 + walkB, -30, 20, 14); ctx.strokeRect(-28 - walkB, 16, 20, 14);
          ctx.strokeRect(8 - walkB, -30, 20, 14); ctx.strokeRect(8 + walkB, 16, 20, 14);

          // Sloped Reactive Fortress Armor Glacis
          this.drawBevelPlate(ctx, -24, -24, 48, 48, "#334155", "#ff1744", 6);
          this.drawHazardStripes(ctx, -20, -20, 8, 40, 5);

          // Dual Heavy Siege Howitzer Barrels
          this.drawTemperedBarrel(ctx, 16, -11, 26, 8);
          this.drawTemperedBarrel(ctx, 16, 3, 26, 8);
          this.drawSlottedMuzzleBrake(ctx, 38, -12.5, 6, 11, 2);
          this.drawSlottedMuzzleBrake(ctx, 38, 1.5, 6, 11, 2);

          // Center Rotating Command Cupola
          ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#ffd600"; ctx.lineWidth = 2.2; ctx.stroke();
          ctx.fillStyle = "#ff1744"; ctx.beginPath(); ctx.arc(4, 0, 4, 0, Math.PI * 2); ctx.fill();

        } else {
          this.drawBevelPlate(ctx, -e.size, -e.size, e.size * 2, e.size * 2, "#1e293b", e.color || "#00e5ff", 3);
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
'''

new_content = content[:idx_hero] + NEW_CODE + content[idx_proj:]

with open(GAME_JS, "w", encoding="utf-8") as f:
    f.write(new_content)

print("SUCCESS: Injected photorealistic rendering engine into game.js!")
