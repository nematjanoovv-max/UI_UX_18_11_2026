#!/usr/bin/env python3
import re

GAME_JS = "/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js"

with open(GAME_JS, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Boss AI Phasing and Abilities in updateEnemies loop
old_boss_logic = """        // Phasing for Phantom enemies
        if (e.type === 'phantom') {
          e.phaseTimer += dt;
          if (e.phaseTimer >= 2.5) {
            e.phaseTimer = 0;
            e.phased = !e.phased;
          }
        }"""

new_boss_logic = """        // Phasing for Phantom enemies
        if (e.type === 'phantom') {
          e.phaseTimer += dt;
          if (e.phaseTimer >= 2.5) {
            e.phaseTimer = 0;
            e.phased = !e.phased;
          }
        }

        // Advanced Boss AI Behavior Modeling
        if (e.isBoss) {
          e.abilityTimer = (e.abilityTimer || 0) + dt;

          // 1. Juggernaut Enrage (Phase 2 at 50% HP)
          if (e.type === 'juggernaut' && !e.enraged && e.hp <= e.maxHp * 0.5) {
            e.enraged = true;
            e.speed *= 1.35;
            this.screenShake = 18;
            this.addFloatingText("☠️ JUGGERNAUT ENRAGED!", e.x, e.y - 35, "#ff1744", 24);
            this.triggerRadioComm("HQ OVERWATCH", "⚠️ DIQQAT: Juggernaut 50% HP! Enrage rejimi: tezlik va zarba oshdi!", 4.0);
            this.spawnShockwave(e.x, e.y, 90, "#ff1744");
            if (audio) audio.artilleryBlast();
          }

          // 2. Overseer Energy Shield Pulse (Every 6.5s)
          if (e.type === 'overseer' && e.abilityTimer >= 6.5) {
            e.abilityTimer = 0;
            this.spawnShockwave(e.x, e.y, 140, "#651fff");
            this.addFloatingText("🛡️ SHIELD PULSE AURA!", e.x, e.y - 32, "#00b0ff", 18);
            if (audio) audio.shootCryo();
            for (const other of this.enemies) {
              if (Math.hypot(other.x - e.x, other.y - e.y) <= 140) {
                other.shield = Math.min(other.maxShield || 150, (other.shield || 0) + 75);
                other.maxShield = Math.max(other.maxShield || 0, other.shield);
              }
            }
          }

          // 3. Hive Titan Swarm Deployment (Every 5.5s)
          if (e.type === 'hive_titan' && e.abilityTimer >= 5.5) {
            e.abilityTimer = 0;
            this.spawnShockwave(e.x, e.y, 80, "#f50057");
            this.addFloatingText("☣️ SWARM DEPLOYED!", e.x, e.y - 35, "#ffab00", 18);
            for (let k = -1; k <= 1; k += 2) {
              this.enemies.push({
                uid: this.nextUid++,
                type: 'swarmling',
                laneIdx: e.laneIdx,
                progress: Math.max(0, e.progress + k * 18),
                hp: 35, maxHp: 35, shield: 0, maxShield: 0, armor: 0,
                speed: 95, bounty: 2, size: 7, color: '#ffab00', marker: '◆', isBoss: false,
                slowRatio: 0, slowTimer: 0, x: e.x, y: e.y, angle: e.angle
              });
            }
          }
        }"""

if old_boss_logic in content:
    content = content.replace(old_boss_logic, new_boss_logic)
    print("Added advanced Boss AI behavior modeling.")
else:
    print("Warning: old_boss_logic not found!")

# 2. Hero Kinetic Booster Dash when moving
old_hero_move = """      // 3. Hero Click or Move
      if (this.hero.selected) {
        if (y >= 60 && y <= 620) {
          this.hero.targetX = x;
          this.hero.targetY = y;
          this.hero.selected = false;
          this.spawnShockwave(x, y, 35, "#ffd600");
          audio.upgrade();
          this.vibrate(20);
          return;
        }
      }"""

new_hero_move = """      // 3. Hero Click or Move with Kinetic Booster Dash
      if (this.hero.selected) {
        if (y >= 60 && y <= 620) {
          this.hero.targetX = x;
          this.hero.targetY = y;
          this.hero.selected = false;
          // Trigger Kinetic Booster Rocket Dash
          this.hero.dashSpeedBoost = 2.4;
          this.hero.dashTimer = 0.45;
          this.spawnShockwave(this.hero.x, this.hero.y, 45, "#00e5ff");
          this.spawnShockwave(x, y, 35, "#ffd600");
          this.addFloatingText("⚡ KINETIC DASH!", this.hero.x, this.hero.y - 25, "#00e5ff", 16);
          if (audio) audio.shootPulse();
          this.vibrate([20, 20, 35]);
          return;
        }
      }"""

if old_hero_move in content:
    content = content.replace(old_hero_move, new_hero_move)
    print("Added Hero Kinetic Dash on move.")
else:
    print("Warning: old_hero_move not found!")

# 3. Update Hero position logic to consume dashSpeedBoost
old_hero_update = """    updateHero(dt) {
      const h = this.hero;
      const dx = h.targetX - h.x;
      const dy = h.targetY - h.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        const moveDist = h.speed * dt;
        h.x += (dx / dist) * Math.min(dist, moveDist);
        h.y += (dy / dist) * Math.min(dist, moveDist);
        h.angle = Math.atan2(dy, dx);
      }"""

new_hero_update = """    updateHero(dt) {
      const h = this.hero;
      const dx = h.targetX - h.x;
      const dy = h.targetY - h.y;
      const dist = Math.hypot(dx, dy);

      if (h.dashTimer > 0) {
        h.dashTimer -= dt;
        // Dash particle trail
        this.particles.push({
          x: h.x + (Math.random() * 8 - 4),
          y: h.y + (Math.random() * 8 - 4),
          vx: -(dx / (dist || 1)) * 30,
          vy: -(dy / (dist || 1)) * 30,
          color: "#00e5ff", size: 3, life: 0.25, maxLife: 0.25
        });
      } else {
        h.dashSpeedBoost = 1.0;
      }

      if (dist > 5) {
        const effSpeed = h.speed * (h.dashSpeedBoost || 1.0);
        const moveDist = effSpeed * dt;
        h.x += (dx / dist) * Math.min(dist, moveDist);
        h.y += (dy / dist) * Math.min(dist, moveDist);
        h.angle = Math.atan2(dy, dx);
      }"""

if old_hero_update in content:
    content = content.replace(old_hero_update, new_hero_update)
    print("Updated updateHero with kinetic dash boosters.")
else:
    print("Warning: old_hero_update not found!")

with open(GAME_JS, "w", encoding="utf-8") as f:
    f.write(content)

print("Game modeling upgrade completed successfully!")
