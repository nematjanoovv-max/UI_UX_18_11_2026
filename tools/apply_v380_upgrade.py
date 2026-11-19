#!/usr/bin/env python3
"""
apply_v380_upgrade.py
Implements:
1. Commander Super Skills Mobile Panel (⚡ EMP, 🛰️ LAZ, ⚙️ ROF, 🛸 DRN) with enlarged 42px touch targets, icons, cooldown overlays & aiming rings.
2. Boss Cinematic Alarm & Tactical Banner (bossSiren, emergency red perimeter pulsing, holographic alert box, haptic pattern).
3. Biome System: Cyber Grid, Lava Core, Cryo Base with biome atmospheric particles & distinct terrain palettes.
4. Endless Survival Enhancements: Record tracking, endless notifications, Continue Endless button in Victory modal.
5. Updates version string to v3.8.0.
"""

import sys
import re

def main():
    game_js_path = "/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js"
    with open(game_js_path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Update version to v3.8.0
    code = code.replace("v3.7.0", "v3.8.0")
    code = code.replace("CYBER-NEON TACTICAL BATTLEFIELD (v3.7.0)", "CYBER-NEON TACTICAL BATTLEFIELD (v3.8.0)")

    # 2. Add bossSiren to SoundSynth
    if "bossSiren()" not in code:
        sound_target = "    redZoneSiren() {"
        sound_replacement = """    bossSiren() {
      // 2-tone cycling high-urgency emergency tactical alert siren
      [580, 880, 580, 880, 520, 780].forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'sawtooth', 0.28, 0.25, f * 0.8), i * 250);
      });
    }
    redZoneSiren() {"""
        if sound_target in code:
            code = code.replace(sound_target, sound_replacement, 1)
            print("Added bossSiren to SoundSynth")
        else:
            print("Warning: sound_target not found")

    # 3. Add biomes to MAPS
    maps_target = """  const MAPS = [
    {
      id: "training_grid", name: "Training Grid", desc: "Basic S-curve test field. Clean terrain with single lane.",
      wave_count: 10, gold: 250, hp: 20, modifier: "none","""
    
    maps_replacement = """  const MAPS = [
    {
      id: "training_grid", name: "Training Grid", desc: "Basic S-curve test field. Clean terrain with single lane.",
      wave_count: 10, gold: 250, hp: 20, modifier: "none", biome: "cyber",
      lanes: [ [ {x:64, y:192}, {x:384, y:192}, {x:384, y:448}, {x:896, y:448}, {x:896, y:256}, {x:1152, y:256} ] ]
    },
    {
      id: "crossroads", name: "Crossroads", desc: "Interconnected straight corridors with multiple defense pockets.",
      wave_count: 12, gold: 250, hp: 20, modifier: "none", biome: "cyber",
      lanes: [ [ {x:64, y:128}, {x:448, y:128}, {x:448, y:384}, {x:896, y:384}, {x:1152, y:384} ] ]
    },
    {
      id: "spiral_core", name: "Spiral Core", desc: "Concentric inward spiral. Optimal for Mortar and Cryo AoE setups.",
      wave_count: 15, gold: 250, hp: 20, modifier: "none", biome: "lava",
      lanes: [ [ {x:64, y:64}, {x:1152, y:64}, {x:1152, y:576}, {x:192, y:576}, {x:192, y:192}, {x:960, y:192}, {x:960, y:448}, {x:384, y:448}, {x:384, y:320}, {x:640, y:320} ] ]
    },
    {
      id: "misty_pass", name: "Misty Pass", desc: "Dense electromagnetic fog reduces all tower ranges by -15%.",
      wave_count: 15, gold: 250, hp: 20, modifier: "fog", biome: "cryo",
      lanes: [ [ {x:64, y:320}, {x:256, y:128}, {x:512, y:512}, {x:768, y:128}, {x:1024, y:512}, {x:1152, y:320} ] ]
    },
    {
      id: "fast_track", name: "Fast Track", desc: "High-speed magnetic highway. All enemies move +15% faster!",
      wave_count: 20, gold: 260, hp: 20, modifier: "fast_lane", biome: "cyber",
      lanes: [ [ {x:64, y:256}, {x:1152, y:256} ] ]
    },
    {
      id: "scrap_yard", name: "Scrap Yard", desc: "Resource-starved industrial ruins. Enemy bounties reduced by -20%.",
      wave_count: 20, gold: 240, hp: 20, modifier: "scarce", biome: "lava",
      lanes: [ [ {x:64, y:128}, {x:768, y:128}, {x:768, y:384}, {x:256, y:384}, {x:256, y:576}, {x:1152, y:576} ] ]
    },
    {
      id: "iron_wall", name: "Iron Wall", desc: "Fortified barrier zone. All enemy units gain +20% bonus armor.",
      wave_count: 25, gold: 280, hp: 20, modifier: "armored", biome: "cyber",
      lanes: [ [ {x:64, y:128}, {x:192, y:512}, {x:960, y:512}, {x:1152, y:128} ] ]
    },
    {
      id: "blackout_city", name: "Blackout City", desc: "Cybernetic metropolis with periodic EMP surges every 5 waves.",
      wave_count: 25, gold: 280, hp: 20, modifier: "blackout", biome: "cryo",
      lanes: [ [ {x:64, y:128}, {x:320, y:128}, {x:320, y:448}, {x:640, y:448}, {x:640, y:192}, {x:960, y:192}, {x:960, y:512}, {x:1152, y:512} ] ]
    },
    {
      id: "twin_gate", name: "Twin Gate", desc: "Dual converging vectors converging directly into the central core.",
      wave_count: 30, gold: 300, hp: 20, modifier: "double_lane", biome: "lava",
      lanes: [
        [ {x:64, y:192}, {x:512, y:192}, {x:640, y:320}, {x:1152, y:320} ],
        [ {x:64, y:448}, {x:512, y:448}, {x:640, y:320}, {x:1152, y:320} ]
      ]
    },
    {
      id: "last_grid", name: "The Last Grid", desc: "Final endurance sector: full 30 waves with 3 Boss encounters!",
      wave_count: 30, gold: 350, hp: 25, modifier: "last_grid", biome: "cyber","""
    
    # Check if biome is already in MAPS
    if 'biome: "cyber"' not in code:
        # We replace the whole MAPS declaration up to last_grid
        old_maps_pattern = r"  const MAPS = \[\s+\{\s+id: \"training_grid\".*?modifier: \"last_grid\","
        match = re.search(old_maps_pattern, code, re.DOTALL)
        if match:
            code = code[:match.start()] + maps_replacement + code[match.end():]
            print("Updated MAPS with biomes (cyber, lava, cryo)")
        else:
            print("Warning: MAPS pattern not matched")

    # 4. Update Victory modal click handler for Continue Endless
    victory_click_target = """      if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
        if (x >= 330 && x <= 530 && y >= 420 && y <= 500) this.startMission(this.currentMapIndex, this.gameMode);
        else if (x >= 540 && x <= 740 && y >= 420 && y <= 500) this.state = 'ANALYTICS';
        else if (x >= 750 && x <= 950 && y >= 420 && y <= 500) this.state = 'MENU';
        return;
      }"""
    
    victory_click_replacement = """      if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
        if (this.state === 'VICTORY' && x >= 340 && x <= 940 && y >= 475 && y <= 540) {
          // Continue Endless Survival Mode!
          this.gameMode = 'ENDLESS';
          this.maxWaves = 999;
          this.wave = 31;
          this.waveActive = false;
          this.waveCountdown = 8;
          this.state = 'PLAYING';
          audio.upgrade();
          this.vibrate([30, 40, 60]);
          this.triggerRadioComm("HQ OVERWATCH", "⚠️ CHEKSIZ REJIM FAOL! Barcha mudofaa minoralari saqlandi. Omon qoling, Komandir!", 5.0);
          return;
        }
        if (x >= 330 && x <= 530 && y >= 405 && y <= 470) this.startMission(this.currentMapIndex, this.gameMode);
        else if (x >= 540 && x <= 740 && y >= 405 && y <= 470) this.state = 'ANALYTICS';
        else if (x >= 750 && x <= 950 && y >= 405 && y <= 470) this.state = 'MENU';
        return;
      }"""
    if victory_click_target in code:
        code = code.replace(victory_click_target, victory_click_replacement, 1)
        print("Updated Victory modal Continue Endless click handler")
    else:
        print("Warning: victory_click_target not found")

    # 5. Update Bottom Bar Click Targets for Skills & Hero Ult
    bottom_click_target = """        // Hero Ult button at x: 5 to 70
        if (x >= 5 && x <= 70) { this.triggerHeroUlt(); this.vibrate([40, 25, 70]); return; }

        // Skills at x: 75 to 235
        if (x >= 75 && x <= 112) this.triggerSkill('emp');
        else if (x >= 115 && x <= 152) this.triggerSkill('orbital');
        else if (x >= 155 && x <= 192) this.triggerSkill('overclock');
        else if (x >= 195 && x <= 235) this.triggerSkill('drone');"""

    bottom_click_replacement = """        // Hero Mech Ult button at x: 5 to 53
        if (x >= 5 && x <= 53) { this.triggerHeroUlt(); this.vibrate([40, 25, 70]); return; }

        // Commander Super Skills Mobile Buttons (x: 56, 100, 144, 188; each w: 42)
        if (x >= 54 && x <= 97) { this.triggerSkill('emp'); this.vibrate(20); return; }
        else if (x >= 98 && x <= 141) { this.triggerSkill('orbital'); this.vibrate(20); return; }
        else if (x >= 142 && x <= 185) { this.triggerSkill('overclock'); this.vibrate(20); return; }
        else if (x >= 186 && x <= 234) { this.triggerSkill('drone'); this.vibrate(20); return; }"""

    if bottom_click_target in code:
        code = code.replace(bottom_click_target, bottom_click_replacement, 1)
        print("Updated Bottom Bar click targets for Skills & Hero Ult")
    else:
        print("Warning: bottom_click_target not found")

    # 6. Update Boss spawn logic for Siren & Alert Banner
    boss_spawn_target = """      if (def.isBoss) {
        this.triggerRadioComm("HQ OVERWATCH", `☠️ DIQQAT: ${def.name.toUpperCase()} JANG MAYDONIGA KIRDI! Barcha olovni jamlang!`, 5.0);
        this.screenShake = 15;
      }"""

    boss_spawn_replacement = """      if (def.isBoss) {
        this.triggerRadioComm("HQ OVERWATCH", `☠️ DIQQAT: ${def.name.toUpperCase()} JANG MAYDONIGA KIRDI! Barcha olovni jamlang!`, 5.0);
        this.screenShake = 20;
        audio.bossSiren();
        this.vibrate([150, 80, 150, 80, 350]);
        this.bossAlert = {
          name: def.name.toUpperCase(),
          hp: Math.round(def.hp * hpMult),
          armor: Math.round(def.armor * armorMult),
          marker: def.marker || "☠",
          color: def.color || "#ff1744",
          timer: 4.8,
          maxTimer: 4.8,
          desc: (type === 'juggernaut') ? "OG'IR ZIRHLI TANK • 50% HP ENRAGE REJIMI" :
                (type === 'overseer') ? "ENERGIYA QALQONI GENERATORI • DRON SUMMONER" :
                "BIO-MEXANIK TITAN • 3 FAZALI APOLISIS GIGANTI"
        };
      }"""

    if boss_spawn_target in code:
        code = code.replace(boss_spawn_target, boss_spawn_replacement, 1)
        print("Updated Boss spawn logic with Siren & Alert Banner")
    else:
        print("Warning: boss_spawn_target not found")

    # 7. Update update(dt) with bossAlert timer & updateBiomeParticles
    update_dt_target = """    update(dt) {
      if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - 20 * dt);

      // Radio Comms & Battlefield Events
      this.updateRadioComms(dt);"""

    update_dt_replacement = """    update(dt) {
      if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - 20 * dt);

      if (this.bossAlert && this.bossAlert.timer > 0) {
        this.bossAlert.timer = Math.max(0, this.bossAlert.timer - dt);
      }
      this.updateBiomeParticles(dt);

      // Radio Comms & Battlefield Events
      this.updateRadioComms(dt);"""

    if update_dt_target in code:
        code = code.replace(update_dt_target, update_dt_replacement, 1)
        print("Updated update(dt) with bossAlert timer & updateBiomeParticles")
    else:
        print("Warning: update_dt_target not found")

    # 8. Add updateBiomeParticles and renderBiomeParticles and renderBossAlert
    if "renderBossAlert()" not in code:
        render_methods = """    updateBiomeParticles(dt) {
      if (!this.biomeParticles) this.biomeParticles = [];
      const map = (this.gameMode === 'CUSTOM') ? { biome: "cyber" } : MAPS[this.currentMapIndex];
      const biome = (map && map.biome) ? map.biome : "cyber";

      if (this.biomeParticles.length < 28) {
        if (biome === 'lava') {
          this.biomeParticles.push({
            x: Math.random() * this.width,
            y: 620 + Math.random() * 20,
            vx: (Math.random() - 0.5) * 20,
            vy: -30 - Math.random() * 40,
            size: 1.5 + Math.random() * 2.5,
            life: 2.0 + Math.random() * 2.0,
            maxLife: 4.0,
            color: Math.random() > 0.4 ? "#ff3d00" : "#ff9100"
          });
        } else if (biome === 'cryo') {
          this.biomeParticles.push({
            x: Math.random() * this.width,
            y: 50 + Math.random() * 30,
            vx: 15 + Math.random() * 25,
            vy: 20 + Math.random() * 30,
            size: 1.2 + Math.random() * 2.2,
            life: 3.0 + Math.random() * 3.0,
            maxLife: 6.0,
            color: Math.random() > 0.3 ? "#80deea" : "#ffffff"
          });
        }
      }

      for (let i = this.biomeParticles.length - 1; i >= 0; i--) {
        const p = this.biomeParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0 || p.x < 0 || p.x > this.width || p.y < 55 || p.y > 625) {
          this.biomeParticles.splice(i, 1);
        }
      }
    }

    renderBiomeParticles(ctx, biome) {
      if (!this.biomeParticles || biome === 'cyber') return;
      ctx.save();
      for (const p of this.biomeParticles) {
        const alpha = Math.max(0, p.life / p.maxLife) * 0.7;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    renderBossAlert() {
      if (!this.bossAlert || this.bossAlert.timer <= 0) return;
      const ctx = this.ctx;
      const b = this.bossAlert;
      const alpha = Math.min(1.0, b.timer, (b.maxTimer - b.timer) * 2.5);
      const pulse = (Math.sin(performance.now() * 0.012) + 1) * 0.5;

      ctx.save();
      // 1. Screen Edge Threat Pulsing
      ctx.strokeStyle = `rgba(255, 23, 68, ${0.25 + pulse * 0.45 * alpha})`;
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 63, this.width - 6, 554);

      // 2. Center Cinematic Holographic Banner
      const bw = 680;
      const bh = 95;
      const bx = (this.width - bw) / 2;
      const by = 85;

      ctx.fillStyle = `rgba(10, 2, 6, ${0.90 * alpha})`;
      ctx.fillRect(bx, by, bw, bh);

      ctx.strokeStyle = `rgba(255, 23, 68, ${0.9 * alpha})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      ctx.fillStyle = `rgba(255, 23, 68, ${alpha})`;
      ctx.font = "bold 13px 'Segoe UI', monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚠️ TIKLANISH REJIMI: RED ALERT • TITAN BOSS ANIQLANDI ⚠️", 640, by + 22);

      ctx.font = "900 24px 'Segoe UI', monospace";
      ctx.fillStyle = b.color || "#ff1744";
      ctx.fillText(`${b.marker} ${b.name}`, 640, by + 52);

      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#cfd8dc";
      ctx.fillText(`HP: ${b.hp}  |  ARMOR: ${b.armor}  |  ${b.desc || "CRITICAL SECTOR THREAT"}`, 640, by + 76);

      ctx.restore();
    }
"""
        code = code.replace("    renderRadioComms() {", render_methods + "\n    renderRadioComms() {", 1)
        print("Added updateBiomeParticles, renderBiomeParticles and renderBossAlert")

    # 9. In render(), call this.renderBossAlert()
    render_dispatch_target = """        this.renderRadialBuildWheel();
        this.renderRadioComms();
        this.renderTopHUD();"""
    render_dispatch_replacement = """        this.renderRadialBuildWheel();
        this.renderRadioComms();
        this.renderBossAlert();
        this.renderTopHUD();"""
    if render_dispatch_target in code:
        code = code.replace(render_dispatch_target, render_dispatch_replacement, 1)
        print("Added this.renderBossAlert() to render pipeline")

    # 10. Update renderBackgroundGrid with biomes
    bg_grid_target = """    renderBackgroundGrid() {
      const ctx = this.ctx;
      // High-Contrast Deep Industrial Cyber-Backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      bgGrad.addColorStop(0, "#050812");
      bgGrad.addColorStop(0.5, "#080e1e");
      bgGrad.addColorStop(1, "#04060d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Modular Tactical Floor Tiles with crisp grid lines
      ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 60);
        ctx.lineTo(x, 620);
        ctx.stroke();
      }
      for (let y = 60; y <= 620; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }

      // Tech Junction Crosshairs
      ctx.fillStyle = "rgba(0, 229, 255, 0.25)";
      for (let x = 64; x < this.width; x += 128) {
        for (let y = 124; y < 620; y += 128) {
          ctx.fillRect(x - 3, y - 0.5, 6, 1);
          ctx.fillRect(x - 0.5, y - 3, 1, 6);
        }
      }

      // Outer Perimeter Defense Hazard Border
      ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 62, this.width - 4, 556);
    }"""

    bg_grid_replacement = """    renderBackgroundGrid() {
      const ctx = this.ctx;
      const map = (this.gameMode === 'CUSTOM') ? { biome: "cyber" } : MAPS[this.currentMapIndex];
      const biome = (map && map.biome) ? map.biome : "cyber";

      // Background gradient based on biome
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      if (biome === 'lava') {
        bgGrad.addColorStop(0, "#150403");
        bgGrad.addColorStop(0.5, "#220805");
        bgGrad.addColorStop(1, "#100202");
      } else if (biome === 'cryo') {
        bgGrad.addColorStop(0, "#030c18");
        bgGrad.addColorStop(0.5, "#07182c");
        bgGrad.addColorStop(1, "#020812");
      } else {
        bgGrad.addColorStop(0, "#050812");
        bgGrad.addColorStop(0.5, "#080e1e");
        bgGrad.addColorStop(1, "#04060d");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Grid Lines
      const gridStroke = (biome === 'lava') ? "rgba(255, 87, 34, 0.12)" :
                         (biome === 'cryo') ? "rgba(128, 222, 234, 0.14)" :
                         "rgba(0, 229, 255, 0.08)";
      ctx.strokeStyle = gridStroke;
      ctx.lineWidth = 1;
      for (let x = 0; x <= this.width; x += 64) {
        ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 620); ctx.stroke();
      }
      for (let y = 60; y <= 620; y += 64) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
      }

      // Tech Junction Crosshairs
      ctx.fillStyle = (biome === 'lava') ? "rgba(255, 112, 67, 0.35)" :
                      (biome === 'cryo') ? "rgba(0, 229, 255, 0.40)" :
                      "rgba(0, 229, 255, 0.25)";
      for (let x = 64; x < this.width; x += 128) {
        for (let y = 124; y < 620; y += 128) {
          ctx.fillRect(x - 3, y - 0.5, 6, 1);
          ctx.fillRect(x - 0.5, y - 3, 1, 6);
        }
      }

      // Outer Perimeter Defense Hazard Border
      ctx.strokeStyle = (biome === 'lava') ? "rgba(255, 61, 0, 0.45)" :
                        (biome === 'cryo') ? "rgba(0, 229, 255, 0.40)" :
                        "rgba(0, 229, 255, 0.30)";
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 62, this.width - 4, 556);

      // Atmospheric Biome Floating Particles
      this.renderBiomeParticles(ctx, biome);
    }"""

    if bg_grid_target in code:
        code = code.replace(bg_grid_target, bg_grid_replacement, 1)
        print("Updated renderBackgroundGrid with biomes")
    else:
        print("Warning: bg_grid_target not found")

    # 11. Update renderBottomBar Commander Skills Panel
    bottom_bar_target = """      // 1. Hero Mech Button (Far Left)
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
      }"""

    bottom_bar_replacement = """      // 1. Hero Mech Button (Far Left: x: 6, w: 46, h: 78)
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

        this.drawCyberButton(sx, 628, 42, 78, meta.label, color, meta.sub, meta.icon, isReady || isAiming);

        // Active Aiming Highlight Ring
        if (isAiming) {
          ctx.save();
          ctx.strokeStyle = "#ffd600";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#ffd600";
          ctx.shadowBlur = 8;
          ctx.strokeRect(sx, 628, 42, 78);
          ctx.restore();
        }

        // Active Cooldown Sweep
        if (s.currentCd > 0) {
          ctx.fillStyle = "rgba(255, 23, 68, 0.70)";
          const pct = s.currentCd / s.cd;
          ctx.fillRect(sx, 628 + 78 * (1 - pct), 42, 78 * pct);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`${Math.ceil(s.currentCd)}`, sx + 21, 696);
        }
      }"""

    if bottom_bar_target in code:
        code = code.replace(bottom_bar_target, bottom_bar_replacement, 1)
        print("Updated renderBottomBar Commander Skills Panel")
    else:
        print("Warning: bottom_bar_target not found")

    # 12. Update renderVictoryModal with Continue Endless Button
    victory_modal_target = """      this.drawCyberButton(340, 430, 180, 56, this.t("playAgain"), "#00e676", "RETRY SECTOR", "▶", true);
      this.drawCyberButton(550, 430, 180, 56, "STATISTIKA", "#ffd600", "BATTLE REPORT", "📊", false);
      this.drawCyberButton(760, 430, 180, 56, this.t("mainMenu"), "#00e5ff", "COMMAND HQ", "←", false);"""

    victory_modal_replacement = """      this.drawCyberButton(340, 410, 180, 52, this.t("playAgain"), "#00e676", "RETRY SECTOR", "▶", true);
      this.drawCyberButton(550, 410, 180, 52, "STATISTIKA", "#ffd600", "BATTLE REPORT", "📊", false);
      this.drawCyberButton(760, 410, 180, 52, this.t("mainMenu"), "#00e5ff", "COMMAND HQ", "←", false);

      this.drawCyberButton(340, 475, 600, 50, "♾️ CHEKSIZ REJIMDA DAVOM ETISH", "#e040fb", "KEEP TOWERS & FACE INFINITE HORDE", "⚡", true);"""

    if victory_modal_target in code:
        code = code.replace(victory_modal_target, victory_modal_replacement, 1)
        print("Updated renderVictoryModal with Continue Endless button")
    else:
        print("Warning: victory_modal_target not found")

    # 13. Update renderDefeatModal with Endless Record Info
    defeat_modal_target = """      ctx.fillStyle = "rgba(18, 30, 50, 0.9)";
      ctx.fillRect(360, 295, 560, 42);
      ctx.strokeStyle = "rgba(255, 23, 68, 0.4)";
      ctx.strokeRect(360, 295, 560, 42);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`YAKUNIY BALL: ${this.score} PTS  |  TO'XTATILGAN TO'LQIN: ${this.wave}`, 640, 322);"""

    defeat_modal_replacement = """      ctx.fillStyle = "rgba(18, 30, 50, 0.9)";
      ctx.fillRect(360, 295, 560, 42);
      ctx.strokeStyle = "rgba(255, 23, 68, 0.4)";
      ctx.strokeRect(360, 295, 560, 42);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px monospace";
      const endlessBest = localStorage.getItem('lg_endless_wave') || this.wave;
      const waveStr = (this.gameMode === 'ENDLESS') ? `CHEKSIZ TO'LQIN: ${this.wave} (ENG YAXSHI: ${endlessBest})` : `TO'XTATILGAN TO'LQIN: ${this.wave}`;
      ctx.fillText(`YAKUNIY BALL: ${this.score} PTS  |  ${waveStr}`, 640, 322);"""

    if defeat_modal_target in code:
        code = code.replace(defeat_modal_target, defeat_modal_replacement, 1)
        print("Updated renderDefeatModal with Endless record info")
    else:
        print("Warning: defeat_modal_target not found")

    # 14. Update renderMapSelect with Biome Badges
    map_select_target = """        ctx.fillStyle = "#00e5ff";
        ctx.font = "11px monospace";
        ctx.fillText(`WAVES: ${m.wave_count}`, x + 14, y + 160);"""

    map_select_replacement = """        ctx.fillStyle = "#00e5ff";
        ctx.font = "11px monospace";
        const biomeTag = (m.biome === 'lava') ? "🌋 LAVA" : (m.biome === 'cryo' ? "❄️ CRYO" : "⚡ CYBER");
        const biomeColor = (m.biome === 'lava') ? "#ff5722" : (m.biome === 'cryo' ? "#80deea" : "#00e5ff");
        ctx.fillText(`WAVES: ${m.wave_count}`, x + 14, y + 160);
        ctx.fillStyle = biomeColor;
        ctx.fillText(biomeTag, x + 105, y + 160);"""

    if map_select_target in code:
        code = code.replace(map_select_target, map_select_replacement, 1)
        print("Updated renderMapSelect with Biome Badges")
    else:
        print("Warning: map_select_target not found")

    # 15. Write updated code back to game.js and android_project/assets/www/game.js
    with open(game_js_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Saved /mnt/sdcard/Agent/UI_UX_18_11_2026/game.js")

    www_game_path = "/mnt/sdcard/Agent/UI_UX_18_11_2026/android_project/assets/www/game.js"
    with open(www_game_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Saved /mnt/sdcard/Agent/UI_UX_18_11_2026/android_project/assets/www/game.js")

if __name__ == "__main__":
    main()
