import re

with open('game.js', 'r', encoding='utf-8') as f:
    content = f.read()

# ==============================================================================
# FIX 1: 3D TPS Touch Controls & Ergonomic Non-Overlapping Layout
# ==============================================================================

# Target in touchstart (around line 1820-1860)
target_tps_touch = """            if (tx < 160 && ty < 70) {
              this.state = 'MENU'; audio.playBGMTrack('menu');
              audio.sell();
              return;
            }
            if (Math.hypot(tx - 1200, ty - 620) <= 52) {
              if (t.isBuilding) this.place3DTower(); else this.shoot3DTPS();
              this.vibrate(22);
              return;
            }
            if (Math.hypot(tx - 1080, ty - 640) <= 40) {
              t.player.isAiming = !t.player.isAiming;
              return;
            }
            if (Math.hypot(tx - 1200, ty - 500) <= 40) {
              t.isBuilding = !t.isBuilding;
              audio.upgrade();
              return;
            }
            if (Math.hypot(tx - 1080, ty - 540) <= 35) {
              this.reload3DTPS();
              return;
            }

            if (tx < 500 && t.touch.moveId === null) {
              t.touch.moveId = touch.identifier;
              t.touch.moveStart = { x: tx, y: ty };
              t.touch.moveVec = { x: 0, y: 0 };
            } else if (tx >= 500 && t.touch.lookId === null) {
              t.touch.lookId = touch.identifier;
              t.touch.lookLast = { x: tx, y: ty };
            }"""

replacement_tps_touch = """            // Back to Menu or 2D Strategy
            if (tx < 180 && ty < 65) {
              this.state = (this.waveActive || this.wave > 1) ? 'PLAYING' : 'MENU';
              if (this.state === 'MENU') audio.playBGMTrack('menu');
              audio.sell();
              return;
            }

            // 1. Fire (Large Primary)
            if (Math.hypot(tx - 1200, ty - 625) <= 54) {
              if (t.isBuilding) this.place3DTower(); else this.shoot3DTPS();
              this.vibrate(22);
              return;
            }
            // 2. Reload
            if (Math.hypot(tx - 1200, ty - 505) <= 42) {
              this.reload3DTPS();
              this.vibrate(15);
              return;
            }
            // 3. Aim
            if (Math.hypot(tx - 1080, ty - 630) <= 42) {
              t.player.isAiming = !t.player.isAiming;
              this.vibrate(15);
              return;
            }
            // 4. Build Turret
            if (Math.hypot(tx - 1080, ty - 515) <= 42) {
              t.isBuilding = !t.isBuilding;
              audio.upgrade();
              this.vibrate(18);
              return;
            }
            // 5. Mech Mode (Robot / Tank)
            if (tx >= 835 && tx <= 945 && ty >= 620 && ty <= 675) {
              this.toggle3DMechMode();
              this.vibrate(25);
              return;
            }
            // 6. EMP Shockwave
            if (tx >= 835 && tx <= 945 && ty >= 550 && ty <= 605) {
              this.fire3DEMP();
              this.vibrate(30);
              return;
            }
            // 7. Missile Salvo
            if (tx >= 955 && tx <= 1065 && ty >= 550 && ty <= 605) {
              this.fire3DMissiles();
              this.vibrate(30);
              return;
            }

            // Movement Joystick vs Look Swipe
            if (tx < 500 && t.touch.moveId === null) {
              t.touch.moveId = touch.identifier;
              t.touch.moveStart = { x: tx, y: ty };
              t.touch.moveVec = { x: 0, y: 0 };
            } else if (tx >= 500 && t.touch.lookId === null) {
              if (!(tx >= 830 && ty >= 480)) {
                t.touch.lookId = touch.identifier;
                t.touch.lookLast = { x: tx, y: ty };
              }
            }"""

assert target_tps_touch in content, "target_tps_touch not found!"
content = content.replace(target_tps_touch, replacement_tps_touch)

# Target in handleCanvasClick (around line 2318-2365)
target_tps_click = """      if (this.state === 'TPS_3D') {
        if (x >= 20 && x <= 200 && y >= 15 && y <= 65) {
          this.state = (this.waveActive || this.wave > 1) ? 'PLAYING' : 'MENU';
          if (this.state === 'MENU') audio.playBGMTrack('menu');
          audio.sell();
          return;
        }
        // Mode toggle button
        if (x >= 955 && x <= 1060 && y >= 610 && y <= 665) {
          this.toggle3DMechMode();
          return;
        }
        // EMP button
        if (x >= 955 && x <= 1060 && y >= 550 && y <= 605) {
          this.fire3DEMP();
          return;
        }
        // Missile button
        if (x >= 1065 && x <= 1170 && y >= 550 && y <= 605) {
          this.fire3DMissiles();
          return;
        }
        if (Math.hypot(x - 1200, y - 620) <= 52) {
          if (this.tps3D.isBuilding) this.place3DTower();
          else this.shoot3DTPS();
          this.vibrate(22);
          return;
        }
        if (Math.hypot(x - 1080, y - 640) <= 40) {
          this.tps3D.player.isAiming = !this.tps3D.player.isAiming;
          return;
        }
        if (Math.hypot(x - 1200, y - 500) <= 40) {
          this.tps3D.isBuilding = !this.tps3D.isBuilding;
          audio.upgrade();
          return;
        }
        if (Math.hypot(x - 1080, y - 540) <= 35) {
          this.reload3DTPS();
          return;
        }
        if (x > 350) {
          if (this.tps3D.isBuilding) this.place3DTower();
          else this.shoot3DTPS();
          return;
        }
        return;
      }"""

replacement_tps_click = """      if (this.state === 'TPS_3D') {
        if (x >= 20 && x <= 200 && y >= 15 && y <= 65) {
          this.state = (this.waveActive || this.wave > 1) ? 'PLAYING' : 'MENU';
          if (this.state === 'MENU') audio.playBGMTrack('menu');
          audio.sell();
          return;
        }
        // Mode toggle button [835..945, 620..675]
        if (x >= 835 && x <= 945 && y >= 620 && y <= 675) {
          this.toggle3DMechMode();
          return;
        }
        // EMP button [835..945, 550..605]
        if (x >= 835 && x <= 945 && y >= 550 && y <= 605) {
          this.fire3DEMP();
          return;
        }
        // Missile button [955..1065, 550..605]
        if (x >= 955 && x <= 1065 && y >= 550 && y <= 605) {
          this.fire3DMissiles();
          return;
        }
        // Fire button (1200, 625, r=48)
        if (Math.hypot(x - 1200, y - 625) <= 54) {
          if (this.tps3D.isBuilding) this.place3DTower();
          else this.shoot3DTPS();
          this.vibrate(22);
          return;
        }
        // Reload button (1200, 505, r=36)
        if (Math.hypot(x - 1200, y - 505) <= 42) {
          this.reload3DTPS();
          return;
        }
        // Aim button (1080, 630, r=36)
        if (Math.hypot(x - 1080, y - 630) <= 42) {
          this.tps3D.player.isAiming = !this.tps3D.player.isAiming;
          return;
        }
        // Build button (1080, 515, r=36)
        if (Math.hypot(x - 1080, y - 515) <= 42) {
          this.tps3D.isBuilding = !this.tps3D.isBuilding;
          audio.upgrade();
          return;
        }
        // Fallback tap to shoot if clicked in right upper gameplay area (not UI)
        if (x > 350 && !(x >= 830 && y >= 480)) {
          if (this.tps3D.isBuilding) this.place3DTower();
          else this.shoot3DTPS();
          return;
        }
        return;
      }"""

assert target_tps_click in content, "target_tps_click not found!"
content = content.replace(target_tps_click, replacement_tps_click)

# ==============================================================================
# FIX 2: 3D TPS Button Rendering & Zero-GC Allocations in render3DTPS
# ==============================================================================

# Target skybox in render3DTPS
target_skybox = """      // 1. Cyber Skybox & Atmosphere
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 720);
      skyGrad.addColorStop(0, "#030712");
      skyGrad.addColorStop(0.5, "#0b1329");
      skyGrad.addColorStop(1, "#111827");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.height);"""

replacement_skybox = """      // 1. Cyber Skybox & Atmosphere (Cached to eliminate GC pause)
      if (!this._tpsSkyGrad) {
        this._tpsSkyGrad = ctx.createLinearGradient(0, 0, 0, 720);
        this._tpsSkyGrad.addColorStop(0, "#030712");
        this._tpsSkyGrad.addColorStop(0.5, "#0b1329");
        this._tpsSkyGrad.addColorStop(1, "#111827");
      }
      ctx.fillStyle = this._tpsSkyGrad;
      ctx.fillRect(0, 0, this.width, this.height);"""

assert target_skybox in content, "target_skybox not found!"
content = content.replace(target_skybox, replacement_skybox)

# Target enemies render list in render3DTPS
target_enemies_render = """      // 5. 3D Enemies (Sorted back to front)
      const renderList = [];
      for (const e of t.enemies) {
        const ep = this.project3DPoint(e.x, 0, e.z, camX, camY, camZ, p.yaw, p.pitch);
        if (ep) renderList.push({ type: 'enemy', e: e, proj: ep, z: ep.z });
      }
      renderList.sort((a, b) => b.z - a.z);

      for (const item of renderList) {
        const e = item.e;
        const ep = item.proj;
        const eh = e.size * 1.8 * ep.scale;
        const ew = e.size * 0.9 * ep.scale;

        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.beginPath();
        ctx.ellipse(ep.x, ep.y, ew * 0.9, ew * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        const eGrad = ctx.createLinearGradient(ep.x - ew / 2, ep.y - eh, ep.x + ew / 2, ep.y);
        eGrad.addColorStop(0, "#475569");
        eGrad.addColorStop(0.5, e.color);
        eGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = eGrad;
        ctx.beginPath();
        ctx.roundRect(ep.x - ew / 2, ep.y - eh, ew, eh, [ew * 0.3]);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();"""

replacement_enemies_render = """      // 5. 3D Enemies (Sorted back to front - Zero GC allocation)
      if (!this._tpsRenderList) this._tpsRenderList = [];
      this._tpsRenderList.length = 0;
      const renderList = this._tpsRenderList;
      for (const e of t.enemies) {
        const ep = this.project3DPoint(e.x, 0, e.z, camX, camY, camZ, p.yaw, p.pitch);
        if (ep) renderList.push({ type: 'enemy', e: e, proj: ep, z: ep.z });
      }
      renderList.sort((a, b) => b.z - a.z);

      for (const item of renderList) {
        const e = item.e;
        const ep = item.proj;
        const eh = e.size * 1.8 * ep.scale;
        const ew = e.size * 0.9 * ep.scale;

        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.beginPath();
        ctx.ellipse(ep.x, ep.y, ew * 0.9, ew * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.roundRect(ep.x - ew / 2, ep.y - eh, ew, eh, [ew * 0.3]);
        ctx.fill();
        ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
        ctx.fillRect(ep.x - ew / 2, ep.y - eh * 0.35, ew, eh * 0.35);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();"""

assert target_enemies_render in content, "target_enemies_render not found!"
content = content.replace(target_enemies_render, replacement_enemies_render)

# Target player mech gradient in render3DTPS
target_player_mech_grad = """        const mechGrad = ctx.createLinearGradient(pp.x - pw / 2, pp.y - ph, pp.x + pw / 2, pp.y);
        mechGrad.addColorStop(0, "#334155");
        mechGrad.addColorStop(0.5, "#1e293b");
        mechGrad.addColorStop(1, "#090d16");
        ctx.fillStyle = mechGrad;
        ctx.beginPath();
        ctx.roundRect(pp.x - pw * 0.4, pp.y - ph * 0.9, pw * 0.8, ph * 0.65, [pw * 0.2]);
        ctx.fill();"""

replacement_player_mech_grad = """        ctx.fillStyle = (p.mode === 'SIEGE') ? "#1e293b" : "#0f172a";
        ctx.beginPath();
        ctx.roundRect(pp.x - pw * 0.4, pp.y - ph * 0.9, pw * 0.8, ph * 0.65, [pw * 0.2]);
        ctx.fill();
        ctx.fillStyle = "#334155";
        ctx.fillRect(pp.x - pw * 0.35, pp.y - ph * 0.85, pw * 0.7, ph * 0.25);"""

assert target_player_mech_grad in content, "target_player_mech_grad not found!"
content = content.replace(target_player_mech_grad, replacement_player_mech_grad)

# Target action buttons in render3DTPS
target_action_buttons = """      // Mobile Touch Action Sci-Fi Circular Buttons (Right side)
      this.render3DCircularButton(1200, 620, 48, "💥 OTISH", "FIRE", "#ff1744", false);
      this.render3DCircularButton(1080, 640, 36, "🎯 DURBIN", "AIM", "#00e5ff", p.isAiming);
      this.render3DCircularButton(1200, 500, 36, "🏗️ QURISH", "BUILD", "#00e676", t.isBuilding);
      this.render3DCircularButton(1080, 540, 30, "🔄 O'Q", "RELOAD", "#ffd600", p.isReloading);

      // Mech Mode & Super Skill Action Buttons
      const modeLabel = (p.mode === 'SIEGE') ? "🚜 TANK" : "🤖 ROBOT";
      const modeCol = (p.mode === 'SIEGE') ? "#ffd600" : "#00e5ff";
      this.renderMiniButton(960, 615, 95, 45, modeLabel, modeCol);
      this.renderMiniButton(960, 555, 95, 45, p.empCd > 0 ? `EMP ${Math.ceil(p.empCd)}s` : "⚡ EMP", "#00e5ff");
      this.renderMiniButton(1070, 555, 95, 45, p.missileCd > 0 ? `MSL ${Math.ceil(p.missileCd)}s` : "🚀 RAKETA", "#ffd600");"""

replacement_action_buttons = """      // Mobile Touch Action Sci-Fi Circular Buttons (Right side - Non-overlapping ergonomic layout)
      this.render3DCircularButton(1200, 625, 48, "💥 OTISH", "FIRE", "#ff1744", false);
      this.render3DCircularButton(1200, 505, 36, "🔄 O'Q", "RELOAD", "#ffd600", p.isReloading);
      this.render3DCircularButton(1080, 630, 36, "🎯 DURBIN", "AIM", "#00e5ff", p.isAiming);
      this.render3DCircularButton(1080, 515, 36, "🏗️ QURISH", "BUILD", "#00e676", t.isBuilding);

      // Mech Mode & Super Skill Action Buttons
      const modeLabel = (p.mode === 'SIEGE') ? "🚜 TANK" : "🤖 ROBOT";
      const modeCol = (p.mode === 'SIEGE') ? "#ffd600" : "#00e5ff";
      this.renderMiniButton(840, 625, 105, 48, modeLabel, modeCol);
      this.renderMiniButton(840, 555, 105, 48, p.empCd > 0 ? `EMP ${Math.ceil(p.empCd)}s` : "⚡ EMP", "#00e5ff");
      this.renderMiniButton(960, 555, 105, 48, p.missileCd > 0 ? `MSL ${Math.ceil(p.missileCd)}s` : "🚀 RAKETA", "#ffd600");"""

assert target_action_buttons in content, "target_action_buttons not found!"
content = content.replace(target_action_buttons, replacement_action_buttons)

# ==============================================================================
# FIX 3: Endless Mode Balance & Overdrive Damage Scaling
# ==============================================================================

# Target in spawnEnemy
target_spawn_scaling = """      if (this.gameMode === 'ENDLESS' && this.wave > 20) {
        // Soft curve after wave 20
        hpMult *= Math.pow(1.12, 19) * Math.pow(1.05, this.wave - 20);
      } else if (this.gameMode === 'CAMPAIGN' && this.wave > 1) {
        hpMult *= Math.pow(1.12, this.wave - 1);
      }

      if (map.modifier === 'fast_lane') spdMult = 1.15;
      if (map.modifier === 'armored') armorMult = 1.20;

      let bounty = Math.round((def.bounty || 4) + 0.6 * this.wave);"""

replacement_spawn_scaling = """      if (this.gameMode === 'ENDLESS' && this.wave > 20) {
        // Balanced scaling curve: 1.12 for first 20 waves, then steady 1.04 afterwards
        hpMult *= Math.pow(1.12, 19) * Math.pow(1.04, this.wave - 20);
      } else if (this.gameMode === 'CAMPAIGN' && this.wave > 1) {
        hpMult *= Math.pow(1.12, this.wave - 1);
      }

      if (map.modifier === 'fast_lane') spdMult = 1.15;
      if (map.modifier === 'armored') armorMult = 1.20;

      // Higher bounty rewards in endless mode to sustain defenses
      let bounty = Math.round((def.bounty || 4) + (this.gameMode === 'ENDLESS' ? 1.4 : 0.6) * this.wave);"""

assert target_spawn_scaling in content, "target_spawn_scaling not found!"
content = content.replace(target_spawn_scaling, replacement_spawn_scaling)

# Target in Towers Combat (around line 4693)
target_tower_combat = """      // 3. Towers Combat
      const overclockMult = (this.skills.overclock.activeTime > 0) ? 1.6 : 1.0;
      for (const t of this.towers) {
        if (t.type === 'beacon') continue;
        const def = TOWER_DEFS[t.type];
        const currentSpec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];
        const mapFog = (map.modifier === 'fog') ? 0.85 : 1.0;
        const effRange = currentSpec.range * (t.buffRange || 1.0) * mapFog;
        const effRate = currentSpec.rate * (t.buffRate || 1.0) * overclockMult;
        const effDmg = currentSpec.dmg * (t.buffDmg || 1.0);"""

replacement_tower_combat = """      // 3. Towers Combat
      const overclockMult = (this.skills.overclock.activeTime > 0) ? 1.6 : 1.0;
      const endlessOverdrive = (this.gameMode === 'ENDLESS' && this.wave > 20) ? (1 + (this.wave - 20) * 0.04) : 1.0;
      for (const t of this.towers) {
        if (t.type === 'beacon') continue;
        const def = TOWER_DEFS[t.type];
        const currentSpec = t.branch ? def.branches[t.branch] : def.tiers[t.tier - 1];
        const mapFog = (map.modifier === 'fog') ? 0.85 : 1.0;
        const effRange = currentSpec.range * (t.buffRange || 1.0) * mapFog;
        const effRate = currentSpec.rate * (t.buffRate || 1.0) * overclockMult;
        const effDmg = Math.round(currentSpec.dmg * (t.buffDmg || 1.0) * endlessOverdrive);"""

assert target_tower_combat in content, "target_tower_combat not found!"
content = content.replace(target_tower_combat, replacement_tower_combat)

# Target in applyDamage (around line 5244)
target_apply_dmg = """    applyDamage(enemy, rawDmg, dmgType, tower, category = 'pulse') {
      let finalDmg = rawDmg;

      // Augment perks"""

replacement_apply_dmg = """    applyDamage(enemy, rawDmg, dmgType, tower, category = 'pulse') {
      let finalDmg = rawDmg;

      // Endless Overdrive bonus for Hero attacks and Super Skills
      if (this.gameMode === 'ENDLESS' && this.wave > 20 && (category === 'hero' || category === 'skills')) {
        finalDmg *= (1 + (this.wave - 20) * 0.04);
      }

      // Augment perks"""

assert target_apply_dmg in content, "target_apply_dmg not found!"
content = content.replace(target_apply_dmg, replacement_apply_dmg)

# Target in startWave for Overdrive combat feed
target_start_wave_txt = """      this.spawnTimer = 0;
      this.addFloatingText(`${this.t("wave")} ${waveNum}!`, 640, 150, "#00e5ff", 28);"""

replacement_start_wave_txt = """      this.spawnTimer = 0;
      this.addFloatingText(`${this.t("wave")} ${waveNum}!`, 640, 150, "#00e5ff", 28);
      if (this.gameMode === 'ENDLESS' && waveNum > 20) {
        const ovMult = (1 + (waveNum - 20) * 0.04).toFixed(2);
        this.addCombatFeed("OVERDRIVE", `DEFENSE OVERDRIVE x${ovMult} DMG ACTIVE!`, "#00e5ff", "⚡");
      }"""

assert target_start_wave_txt in content, "target_start_wave_txt not found!"
content = content.replace(target_start_wave_txt, replacement_start_wave_txt)

# ==============================================================================
# FIX 4: iOS Safari / Mobile WebAudio Autoplay Unlock & Floating Prompt
# ==============================================================================

# Target in render() for menu audio prompt
target_render_menu = """      if (this.state === 'MENU') this.renderMainMenu();"""

replacement_render_menu = """      if (this.state === 'MENU') {
        this.renderMainMenu();
        if (typeof audio !== 'undefined' && audio.ctx && audio.ctx.state === 'suspended') {
          this.ctx.fillStyle = "rgba(10, 20, 36, 0.92)";
          this.ctx.beginPath();
          this.ctx.roundRect(420, 10, 440, 30, 6);
          this.ctx.fill();
          this.ctx.strokeStyle = "#ffd600";
          this.ctx.lineWidth = 1.2;
          this.ctx.stroke();
          this.ctx.fillStyle = "#ffd600";
          this.ctx.font = "bold 11px monospace";
          this.ctx.textAlign = "center";
          this.ctx.fillText("🔊 OVOZNI YOQISH UCHUN EKRANGA TEGING (TAP TO UNMUTE)", 640, 29);
        }
      }"""

assert target_render_menu in content, "target_render_menu not found!"
content = content.replace(target_render_menu, replacement_render_menu)

# Target at bottom of file for Global Audio Unlock Pipeline
target_dom_loaded = """  window.addEventListener('DOMContentLoaded', () => {
    window.lastGridEngine = new LastGridEngine();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  });"""

replacement_dom_loaded = """  window.addEventListener('DOMContentLoaded', () => {
    window.lastGridEngine = new LastGridEngine();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // Global Cross-Platform WebAudio Silent Buffer Unlocker (iOS Safari / Mobile Chrome / Android WebView)
    const unlockAudioPipeline = () => {
      if (typeof audio !== 'undefined' && audio) {
        if (!audio.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) audio.ctx = new AudioCtx();
        }
        if (audio.ctx && audio.ctx.state === 'suspended') {
          audio.ctx.resume().catch(() => {});
        }
        if (audio.ctx) {
          try {
            const buffer = audio.ctx.createBuffer(1, 1, 22050);
            const source = audio.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(audio.ctx.destination);
            source.start(0);
          } catch(e) {}
        }
        if (!audio.bgmPlaying && !audio.bgmMuted) {
          audio.startBGM();
        }
      }
    };
    ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlockAudioPipeline, { passive: true });
    });
  });"""

assert target_dom_loaded in content, "target_dom_loaded not found!"
content = content.replace(target_dom_loaded, replacement_dom_loaded)

# Write to all 3 paths
for path in ['game.js', 'web/game.js', 'android_project/assets/www/game.js']:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {path} successfully!")

print("All game.js targets successfully patched!")
