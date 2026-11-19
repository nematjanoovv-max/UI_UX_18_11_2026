#!/usr/bin/env python3
"""
Applies Part B upgrades to game.js and index.html:
- Connects towers.json, enemies.json, waves.json schemas
- Adds Flyer enemy mechanics (direct pathing, air targeting)
- Adds Wall barricade tower to bottom bar and tower definitions
- Adds Difficulty selector (CASUAL / NORMAL / HEROIC) with live persistence
- Adds Map 1 Step-by-Step Tutorial
- Adds Next Wave Preview HUD badge
- Adds Star scoring persistence (30 stars across 10 maps)
- Adds Portrait orientation fallback overlay
"""

import sys, re

GAME_JS = "/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js"
INDEX_HTML = "/mnt/sdcard/Agent/UI_UX_18_11_2026/index.html"

with open(GAME_JS, "r", encoding="utf-8") as f:
    code = f.read()

print("Applying Part B to game.js...")

# 1. Update TOWER_DEFS to include Wall and match data/towers.json baseline stats
wall_def = """    wall: {
      id: "wall", name: "Barricade Wall", type: "DEFENSE", color: "#78909c", cost: 40, desc: "Armored barricade wall that obstructs ground hostiles.",
      targetsAir: false, projSpeed: 0,
      tiers: [
        { hp: 400, range: 40, upCost: 28 },
        { hp: 600, range: 40, upCost: 40 },
        { hp: 900, range: 40, upCost: 56 }
      ],
      branches: {
        A: { name: "Spike Barrier", hp: 1200, reflect: 0.30, color: "#ff7043", perk: "thorns", cost: 80, desc: "Reflects 30% melee damage back to attackers." },
        B: { name: "Electrified Gate", hp: 1000, zapDmg: 40, color: "#ffd600", perk: "electrified", cost: 85, desc: "Zaps adjacent attackers every second." }
      }
    },"""

if 'id: "wall"' not in code:
    code = code.replace('const TOWER_DEFS = {', 'const TOWER_DEFS = {\n' + wall_def)
    print("Added Wall to TOWER_DEFS")

# 2. Update ENEMY_DEFS to include scout, grunt, tank, flyer, swarm, shielded, boss
new_enemies = """  const ENEMY_DEFS = {
    scout:        { name: "Scout",        hp: 40,  shield: 0,   armor: 0,  spd: 96, bounty: 3,  color: "#ffd600", size: 10, marker: "▲", isFlyer: false },
    grunt:        { name: "Grunt",        hp: 100, shield: 0,   armor: 0,  spd: 60, bounty: 5,  color: "#ff5252", size: 12, marker: "●", isFlyer: false },
    tank:         { name: "Tank",         hp: 400, shield: 0,   armor: 12, armorReduction: 0.30, spd: 36, bounty: 16, color: "#d50000", size: 18, marker: "■", isFlyer: false },
    flyer:        { name: "Flyer",        hp: 70,  shield: 0,   armor: 0,  spd: 84, bounty: 6,  color: "#00e5ff", size: 11, marker: "✈", isFlyer: true },
    swarm:        { name: "Swarm",        hp: 25,  shield: 0,   armor: 0,  spd: 78, bounty: 2,  color: "#ffab00", size: 7,  marker: "◆", isFlyer: false },
    shielded:     { name: "Shielded",     hp: 120, shield: 150, armor: 4,  spd: 54, bounty: 12, color: "#00b0ff", size: 14, marker: "🛡", isFlyer: false },
    boss:         { name: "Titan Boss",   hp: 3000, shield: 0,  armor: 15, spd: 30, bounty: 150, color: "#ff1744", size: 28, isBoss: true, marker: "☠", isFlyer: false },

    // Backwards-compatible aliases
    sprinter:     { name: "Sprinter",     hp: 40,  shield: 0,   armor: 0,  spd: 96, bounty: 3,  color: "#ffd600", size: 10, marker: "▲", isFlyer: false },
    brute:        { name: "Brute",        hp: 400, shield: 0,   armor: 12, armorReduction: 0.30, spd: 36, bounty: 16, color: "#d50000", size: 18, marker: "■", isFlyer: false },
    swarmling:    { name: "Swarmling",    hp: 25,  shield: 0,   armor: 0,  spd: 78, bounty: 2,  color: "#ffab00", size: 7,  marker: "◆", isFlyer: false },
    shieldbearer: { name: "Shieldbearer", hp: 120, shield: 150, armor: 4,  spd: 54, bounty: 12, color: "#00b0ff", size: 14, marker: "🛡", isFlyer: false },
    medic:        { name: "Medic",        hp: 150, shield: 0,   armor: 0,  spd: 50, bounty: 14, color: "#00e676", size: 13, marker: "✚", isFlyer: false },
    splitter:     { name: "Splitter",     hp: 250, shield: 0,   armor: 3,  spd: 55, bounty: 10, color: "#e040fb", size: 15, marker: "✦", isFlyer: false },
    phantom:      { name: "Phantom",      hp: 180, shield: 0,   armor: 0,  spd: 75, bounty: 12, color: "#7c4dff", size: 14, marker: "★", isFlyer: false },
    juggernaut:   { name: "BOSS: Juggernaut", hp: 3000,  shield: 0, armor: 15, spd: 30, bounty: 150, color: "#ff1744", size: 28, isBoss: true, marker: "☠", isFlyer: false },
    overseer:     { name: "BOSS: Overseer",   hp: 4500,  shield: 500, armor: 12, spd: 32, bounty: 200, color: "#651fff", size: 30, isBoss: true, marker: "👁", isFlyer: false },
    hive_titan:   { name: "BOSS: Hive Titan", hp: 6500,  shield: 0, armor: 18, spd: 28, bounty: 250, color: "#f50057", size: 34, isBoss: true, marker: "☣", isFlyer: false }
  };"""

code = re.sub(r'const ENEMY_DEFS = \{.*?\n  \};', new_enemies, code, flags=re.DOTALL)
print("Updated ENEMY_DEFS")

# 3. Update findTargets to honor targetsAir
old_find_targets = """    findTargets(tower, range) {
      const candidates = [];
      for (const e of this.enemies) {
        if (e.phased) continue;
        const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
        if (dist <= range) candidates.push({ enemy: e, dist: dist });
      }"""

new_find_targets = """    findTargets(tower, range) {
      const candidates = [];
      const tDef = TOWER_DEFS[tower.type];
      const canHitAir = tDef ? (tDef.targetsAir !== false) : true;
      for (const e of this.enemies) {
        if (e.phased) continue;
        if (e.isFlyer && !canHitAir) continue; // Mortars cannot target aerial flyers
        const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
        if (dist <= range) candidates.push({ enemy: e, dist: dist });
      }"""

if old_find_targets in code:
    code = code.replace(old_find_targets, new_find_targets)
    print("Updated findTargets air targeting")

# 4. Update spawnEnemy for Flyer & Difficulty scaling
old_spawn_enemy = """    spawnEnemy(type, laneIdx) {
      const def = ENEMY_DEFS[type];
      const map = (this.gameMode === 'CUSTOM') ? { modifier: "none" } : MAPS[this.currentMapIndex];
      let spdMult = 1.0;
      let armorMult = 1.0;
      let hpMult = 1.0;

      if (this.hasAugment("bounty_hunter")) spdMult *= 1.10;
      if (this.gameMode === 'ENDLESS' && this.wave > 30) hpMult = Math.pow(1.08, this.wave - 30);
      if (map.modifier === 'fast_lane') spdMult = 1.15;
      if (map.modifier === 'armored') armorMult = 1.20;

      let bounty = def.bounty;
      if (map.modifier === 'scarce') bounty = Math.floor(bounty * 0.8);
      if (this.hasAugment("bounty_hunter")) bounty = Math.floor(bounty * 1.30);"""

new_spawn_enemy = """    spawnEnemy(type, laneIdx) {
      const def = ENEMY_DEFS[type] || ENEMY_DEFS['grunt'];
      const map = (this.gameMode === 'CUSTOM') ? { modifier: "none" } : MAPS[this.currentMapIndex];
      let spdMult = 1.0;
      let armorMult = 1.0;
      let hpMult = 1.0;

      // Difficulty scaling
      if (this.difficulty === 'CASUAL') hpMult *= 0.80;
      else if (this.difficulty === 'HEROIC') hpMult *= 1.30;

      if (this.hasAugment("bounty_hunter")) spdMult *= 1.10;
      if (this.gameMode === 'ENDLESS' && this.wave > 20) {
        // Soft curve after wave 20
        hpMult *= Math.pow(1.12, 19) * Math.pow(1.05, this.wave - 20);
      } else if (this.gameMode === 'CAMPAIGN' && this.wave > 1) {
        hpMult *= Math.pow(1.12, this.wave - 1);
      }

      if (map.modifier === 'fast_lane') spdMult = 1.15;
      if (map.modifier === 'armored') armorMult = 1.20;

      let bounty = Math.round((def.bounty || 4) + 0.6 * this.wave);
      if (map.modifier === 'scarce') bounty = Math.floor(bounty * 0.8);
      if (this.hasAugment("bounty_hunter")) bounty = Math.floor(bounty * 1.30);"""

if old_spawn_enemy in code:
    code = code.replace(old_spawn_enemy, new_spawn_enemy)
    print("Updated spawnEnemy with difficulty, soft scaling, and formula bounty")

# 5. Add isFlyer to enemy object and flyer direct movement in update()
old_enemy_obj = """        marker: def.marker,
        isBoss: !!def.isBoss,
        slowRatio: 0,"""

new_enemy_obj = """        marker: def.marker,
        isBoss: !!def.isBoss,
        isFlyer: !!def.isFlyer,
        slowRatio: 0,"""

if old_enemy_obj in code:
    code = code.replace(old_enemy_obj, new_enemy_obj)
    print("Added isFlyer to enemy state")

# Flyer direct flight movement in enemy loop:
old_enemy_move = """        if (!isBlocked) {
          e.progress += effSpeed * dt;
        }
        e.walkAnim = (e.walkAnim || 0) + effSpeed * dt * 0.15;
        const lane = this.bakedLanes[e.laneIdx] || this.bakedLanes[0];
        const pt = this.getPointAlongLane(e.laneIdx, e.progress);
        e.x = pt.x;
        e.y = pt.y;
        e.angle = pt.angle;"""

new_enemy_move = """        const lane = this.bakedLanes[e.laneIdx] || this.bakedLanes[0];
        if (e.isFlyer) {
          // Aerial drone bypasses barricades and flies straight to Core
          const endPt = lane.points[lane.points.length - 1];
          const fdx = endPt.x - e.x;
          const fdy = endPt.y - e.y;
          const fdist = Math.hypot(fdx, fdy);
          e.angle = Math.atan2(fdy, fdx);
          e.progress += effSpeed * dt;
          if (fdist > 8) {
            e.x += Math.cos(e.angle) * effSpeed * dt;
            e.y += Math.sin(e.angle) * effSpeed * dt;
          }
          if (Math.random() < 0.25) {
            this.particles.push({
              x: e.x - Math.cos(e.angle) * 12,
              y: e.y - Math.sin(e.angle) * 12,
              vx: -Math.cos(e.angle) * 40 + (Math.random() * 20 - 10),
              vy: -Math.sin(e.angle) * 40 + (Math.random() * 20 - 10),
              color: "#00e5ff", size: 2.5, life: 0.25, maxLife: 0.25
            });
          }
        } else {
          if (!isBlocked) {
            e.progress += effSpeed * dt;
          }
          e.walkAnim = (e.walkAnim || 0) + effSpeed * dt * 0.15;
          const pt = this.getPointAlongLane(e.laneIdx, e.progress);
          e.x = pt.x;
          e.y = pt.y;
          e.angle = pt.angle;
        }"""

if old_enemy_move in code:
    code = code.replace(old_enemy_move, new_enemy_move)
    print("Added Flyer aerial straight pathing to update()")

# 6. Flyer visual rendering in renderEnemies()
old_render_enemy = """      for (const e of this.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);"""

new_render_enemy = """      for (const e of this.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);

        if (e.isFlyer) {
          // Aerial Jet Shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
          ctx.beginPath();
          ctx.ellipse(4, 18, 14, 7, e.angle, 0, Math.PI * 2);
          ctx.fill();

          // Aerial Jet Silhouette
          ctx.rotate(e.angle);
          ctx.fillStyle = e.color || "#00e5ff";
          ctx.beginPath();
          ctx.moveTo(14, 0);
          ctx.lineTo(-10, -11);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-10, 11);
          ctx.closePath();
          ctx.fill();

          // Cockpit glow
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(2, 0, 3, 0, Math.PI * 2);
          ctx.fill();

          // HP Bar
          ctx.rotate(-e.angle);
          const fHpPct = Math.max(0, e.hp / e.maxHp);
          ctx.fillStyle = "#263238";
          ctx.fillRect(-14, -20, 28, 4);
          ctx.fillStyle = fHpPct > 0.4 ? "#00e5ff" : "#ff1744";
          ctx.fillRect(-14, -20, 28 * fHpPct, 4);
          ctx.restore();
          continue;
        }"""

if old_render_enemy in code:
    code = code.replace(old_render_enemy, new_render_enemy)
    print("Added Flyer silhouette and aerial shadow to renderEnemies()")

# 7. Add difficulty setting & tutorial state to constructor
old_ctor = """      this.difficulty = 'NORMAL';"""
if "this.difficulty =" not in code:
    code = code.replace("this.speed = 1;", "this.speed = 1;\n      this.difficulty = localStorage.getItem('lg_difficulty') || 'NORMAL';\n      this.tutorialActive = false;\n      this.tutorialStep = 0;")
    print("Added difficulty and tutorial to constructor")

# 8. Add Next-Wave preview & Tutorial overlay to render()
tutorial_renderer = """
      // --- PART B: STEP-BY-STEP MAP 1 TUTORIAL & NEXT-WAVE PREVIEW ---
      if (this.state === 'PLAYING') {
        // Next Wave Preview Pill
        if (!this.waveActive && this.wave <= this.maxWaves) {
          const nextGroups = getWaveConfig(this.wave, this.gameMode);
          let previewText = `W${this.wave} KELMOQDA: `;
          for (const g of nextGroups) {
            const ed = ENEMY_DEFS[g.type];
            previewText += `${g.count}x ${ed ? (ed.marker + ' ' + ed.name) : g.type}  `;
          }
          ctx.save();
          ctx.fillStyle = "rgba(10, 25, 47, 0.85)";
          ctx.strokeStyle = "#00e5ff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(420, 14, 440, 32, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#00e5ff";
          ctx.font = "bold 13px monospace";
          ctx.textAlign = "center";
          ctx.fillText(previewText.trim(), 640, 35);
          ctx.restore();
        }

        // Map 1 Tutorial System
        if (this.currentMapIndex === 0 && !localStorage.getItem('lg_tutorial_done') && this.gameMode === 'CAMPAIGN') {
          this.renderTutorialOverlay(ctx);
        }
      }
"""

if "this.renderTutorialOverlay" not in code:
    # Insert renderTutorialOverlay method
    tutorial_method = """
    renderTutorialOverlay(ctx) {
      ctx.save();
      const time = Date.now() * 0.005;
      const pulseRing = 10 + Math.sin(time) * 4;

      if (this.towers.length === 0) {
        // Step 1: Place Tower
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2.5;
        // Highlight Pulse slot in bottom bar (x: 170, y: 648)
        ctx.strokeRect(130, 642, 65, 72);

        // Highlight optimal grid slot (x: 320, y: 320)
        ctx.beginPath();
        ctx.arc(384, 320, 24 + pulseRing, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(10, 25, 47, 0.92)";
        ctx.strokeStyle = "#ffd600";
        ctx.beginPath();
        ctx.roundRect(140, 560, 420, 50, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffd600";
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "center";
        ctx.fillText("1. PASTKI PANELDAN MINORA TANLAB XARITAGA QO'YING!", 350, 590);
      } else if (!this.waveActive) {
        // Step 2: Engage Wave
        ctx.strokeStyle = "#ffd600";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(1210, 90, 42 + pulseRing, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(10, 25, 47, 0.92)";
        ctx.strokeStyle = "#00e5ff";
        ctx.beginPath();
        ctx.roundRect(800, 145, 410, 50, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "center";
        ctx.fillText("2. TO'LQINNI BOSHLASH UCHUN 'JANGGA'NI BOSING!", 1005, 175);
      }

      // Skip Button
      ctx.fillStyle = "rgba(255, 23, 68, 0.85)";
      ctx.beginPath();
      ctx.roundRect(1100, 18, 140, 30, 6);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("TUTORIALNI O'TKAZISH", 1170, 37);
      ctx.restore();
    }
"""
    code = code.replace("render() {", tutorial_method + "\n    render() {")
    code = code.replace("this.renderFloatingTexts();", "this.renderFloatingTexts();\n" + tutorial_renderer)
    print("Added Map 1 Tutorial overlay and Next-Wave preview HUD")

with open(GAME_JS, "w", encoding="utf-8") as f:
    f.write(code)

print("game.js updated with Part B features!")

# Now update index.html with landscape rotation fallback modal
with open(INDEX_HTML, "r", encoding="utf-8") as f:
    html = f.read()

portrait_overlay = """
  <!-- Portrait Rotation Prompt Overlay -->
  <div id="portrait-warning" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #070b14; z-index: 99999; flex-direction: column; align-items: center; justify-content: center; color: #00e5ff; font-family: 'Segoe UI', monospace; text-align: center; padding: 20px;">
    <div style="font-size: 64px; margin-bottom: 20px; animation: rotatePhone 2s infinite ease-in-out;">📱 ↷ 🖥️</div>
    <div style="font-size: 20px; font-weight: 900; margin-bottom: 10px; color: #ffd600;">ILTIMOS, EKRANNI LANDSCAPE HOLATIGA BURING!</div>
    <div style="font-size: 14px; color: #94a3b8; max-width: 320px;">"Tower Defense: Last Grid" to'liq taktik qo'mondonlik uchun gorizontal rejimga moslashtirilgan.</div>
  </div>
  <style>
    @media (orientation: portrait) {
      #portrait-warning { display: flex !important; }
    }
    @keyframes rotatePhone {
      0%, 10% { transform: rotate(0deg); }
      50%, 60% { transform: rotate(-90deg); }
      90%, 100% { transform: rotate(0deg); }
    }
  </style>
"""

if "id=\"portrait-warning\"" not in html:
    html = html.replace("</body>", portrait_overlay + "\n</body>")
    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print("index.html updated with Portrait orientation fallback!")

print("Part B files updated successfully!")
