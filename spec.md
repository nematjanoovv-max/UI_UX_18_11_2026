# SPEC.md — Tower Defense: Last Grid

> Uzbek: Bu to'liq texnik spetsifikatsiya (nima qurilishi kerak). Manba: 2D o'yinlar texnik topshirig'i, 07-loyiha.
> Raqamlar (HP, narx, tezlik) — **boshlang'ich qiymatlar**; balance simulyator orqali sozlanadi va `notes/BALANCE_LOG.txt` ga yoziladi.

## 1. Overview

| Item | Value |
|---|---|
| Title | Tower Defense: Last Grid |
| Genre | Tower Defense / Strategy, 2D top-down, grid-based building |
| Difficulty (project) | High |
| Premise | Enemies walk a fixed route to the player's base. The player manages gold, builds/upgrades/sells towers and stops waves. Lose all base HP → Defeat. Survive all waves of a map → Victory. |
| Platforms | Windows, Web (HTML5), Android |
| Engine | Godot 4.x stable (pin exact), GDScript typed, Compatibility renderer |
| Mode | 100 % offline single-player (online leaderboard = optional post-MVP) |
| Languages | en (default), uz, ru |
| Controls | Mouse/touch: select tower, build, upgrade. `Space`: start wave. `Esc`: pause. |

### 1.1 Final deliverable (from source doc — mandatory counts)
**10 maps · 5 towers · 8 enemy types · 3 bosses · 30 wave configurations.**

### 1.2 Acceptance criteria (from source doc)
1. Enemies never leave the path.
2. Tower target rules (first / last / strongest / nearest) work as specified.
3. Wave completion and base-loss (defeat) states are correct.
Plus project-wide: full loop *start → play → goal/lose → result → restart*; save/load; tests; README; GitHub repo; builds; demo.

## 2. Core loop

```
Main Menu → Map Select (+difficulty) → Battlefield:
   [Build phase: countdown] → Space / auto → [Wave: enemies spawn & walk] → kill for gold → build/upgrade/sell
   → wave cleared → bonus → next wave … → final wave cleared = VICTORY (stars + research points)
   base HP ≤ 0 = DEFEAT → Results → Retry / Map Select / Menu
Meta: research points → Skill Tree (persistent) → stronger next runs.
```

## 3. Game states (GameState FSM)
`BOOT → MAIN_MENU → MAP_SELECT → LOADING → BUILD_PHASE ⇄ WAVE_ACTIVE → (PAUSED) → VICTORY | DEFEAT → RESULTS → MAIN_MENU/MAP_SELECT/RETRY`
- `PAUSED` freezes physics tick, timers, tweens, projectile/enemy movement and gameplay audio (music ducks); UI stays interactive.
- Legal transitions are defined in one table (`game_state.gd`) and unit-tested; illegal transitions assert in debug.

## 4. Architecture

### 4.1 Repository layout (root = this folder)
```
project.godot
export_presets.cfg            # no secrets
README.md  LICENSE  CHANGELOG.md  .gitignore  .gitattributes
agents.md  plan.md  spec.md
vercel.json  render.yaml(optional)
.github/ workflows/(ci.yml, deploy-web.yml, release.yml)  ISSUE_TEMPLATE/  pull_request_template.md
addons/gut/                   # pinned
scenes/ main/ menus/ levels/ towers/ enemies/ objects/ ui/ vfx/
scripts/ managers/ systems/ gameplay/ ai/ data_defs/ utils/
data/ towers/ enemies/ bosses/ waves/ maps/ skills/ achievements/ modifiers/ difficulty/ i18n/
assets/ sprites/ tilesets/ animations/ backgrounds/ audio/{music,sfx}/ fonts/ ui/ shaders/
tests/ unit/ integration/ sim/
tools/ balance_sim.tscn  balance_sim.gd  validate_data.gd
docs/ GDD.md  controls.md  changelog.md  api.md(optional)
notes/ *.txt                  # see agents.md §3
export/                       # git-ignored build output
```

### 4.2 Autoloads
| Name | Responsibility |
|---|---|
| `EventBus` | Global typed signals only (no state). |
| `GameState` | FSM, current run context (map, difficulty, seed), pause control. |
| `Settings` | Audio volumes, language, UI scale, keybinds, colour-blind mode, reduced motion, game speed, touch layout. Persists to `user://settings.cfg`. |
| `SaveSystem` | Versioned JSON progress save (see §10). |
| `AudioManager` | Buses Master/Music/SFX/UI, pooled `AudioStreamPlayer`s, ducking, web unlock. |
| `SceneManager` | Async scene load, fade transitions, loading screen. |
| `Localization` | `TranslationServer` wrapper, CSV/PO loading, runtime language switch. |

### 4.3 Gameplay modules (each = own scene/script + test)
`Battlefield` · `GridMap2D` (cells, buildable mask) · `PathNetwork` (waypoints/lanes) · `EnemyFollower` · `Enemy` (+stats, status effects) ·
`StatusEffects` · `TowerBase` + per-tower behaviour scenes · `TargetingSystem` · `ProjectilePool`/`Projectile` ·
`DamageSystem` · `SpatialHash` · `WaveManager` · `EconomyManager` · `BuildController` (placement/ghost/validation) ·
`UpgradeController` · `SkillTreeSystem` · `ModifierSystem` · `DifficultySystem` · `AchievementSystem` · `StatsTracker` · `Tutorial`.

### 4.4 Key signals (EventBus)
`wave_started(n)`, `wave_cleared(n)`, `all_waves_cleared`, `enemy_spawned(e)`, `enemy_died(e, killed_by_player)`, `enemy_reached_base(e, dmg)`,
`base_hp_changed(hp, max)`, `gold_changed(g)`, `tower_built(t)`, `tower_upgraded(t)`, `tower_sold(t)`, `tower_selected(t)`,
`state_changed(from, to)`, `settings_changed`, `achievement_unlocked(id)`, `run_finished(result)`.

## 5. Grid, viewport & camera
- Base viewport **1280×720**, stretch mode `canvas_items`, aspect `expand` (supports 16:9 → 21:9 and portrait-safe HUD on phones).
- Grid cell **64×64 px**, map 20×11 cells playable + HUD margin. Cells: `EMPTY(buildable)`, `PATH`, `BLOCKED(decor)`, `BASE`, `SPAWN`.
- One tower per cell (1×1). Cannot build on PATH/BLOCKED/BASE/SPAWN. No path-blocking (path is fixed; "maze-building" is out of scope).
- Camera: fixed per map with optional small pan/zoom on mobile (pinch, clamped); zoom limits 0.75–1.5; map always fits by default.
- Safe-area insets respected for HUD on Android notches.

## 6. Data schemas (Godot `Resource` classes in `scripts/data_defs/`)

### 6.1 `TowerData`
`id, display_key, desc_key, icon, scene, damage_type, cost, sell_ratio(=0.7), tiers: Array[TowerTier], targeting_default, can_target: {ground,air}`
`TowerTier`: `damage, fire_rate(shots/s), range_px, projectile_speed, splash_radius, effect(slow%, duration, buff), upgrade_cost, pierce_count`.

### 6.2 `EnemyData`
`id, display_key, hp, shield, armor, speed, bounty, base_damage, scale, traits[] (heal_aura, split_on_death, phase, shield_regen, …), sprite_frames, tags[]`.

### 6.3 `BossData` (extends EnemyData)
`phases: Array[BossPhase]` (hp threshold, behaviours: spawn_minions, aura, speed_mult, enrage), `immunities{slow_cap}`, `intro_cutscene`.

### 6.4 `WaveData` / `WaveSet`
`WaveData`: `index, groups: Array[SpawnGroup], is_boss, bonus_gold, notes`. `SpawnGroup`: `enemy_id, count, interval_s, start_delay_s, lane_id, hp_mult_override?`.
`WaveSet` = the **30 wave configurations** (waves 1–30). Maps pick `wave_range` and apply scaling/modifiers.

### 6.5 `MapData`
`id, name_key, theme, grid_size, cell_layout (PackedInt32Array), lanes: Array[LaneData{waypoints: PackedVector2Array}], spawn_cells, base_cell, wave_count, wave_profile, modifier_ids[], starting_gold, base_hp, unlock_requires(map_id, stars), star_thresholds, background, music`.

### 6.6 `SkillNodeData`, `AchievementData`, `ModifierData`, `DifficultyData` — see §9.

**Validation:** `tools/validate_data.gd` runs in CI: all ids unique, all references resolve, all counts match §1.1, waypoints inside grid and contiguous, no tower stat ≤ 0.

## 7. Core gameplay systems

### 7.1 Enemy movement (path/waypoint)
- Each lane = ordered waypoint polyline. Enemy stores `progress_px` (distance along baked path) and sets position = `path.sample(progress_px)`.
  This makes it **mathematically impossible to leave the path** (position is derived, never integrated freely). Speed modifiers only change `progress_px` rate.
- Spawn at `progress=0`; reaching `path_length` → `enemy_reached_base` → deal `base_damage` → despawn (returns to pool). No bounty.
- Multiple lanes supported (maps 2, 9, 10). Enemy chooses lane from `SpawnGroup.lane_id` (or alternates).
- Sprite faces movement tangent; smooth corner rounding is visual only.

### 7.2 Enemy stats pipeline
`final_hp = base_hp × difficulty.hp_mult × wave_hp_mult(w) × map_modifier.hp_mult`
`wave_hp_mult(w) = 1 + 0.10·(w−1) + 0.004·(w−1)²` (w=30 → ≈ 7.26)
`bounty = round(base_bounty × (1 + 0.03·(w−1)) × difficulty.gold_mult)`
Speed/armor scale only through modifiers (not per wave) to keep slow/pierce counters readable.

### 7.3 Damage types & armor
Types: `KINETIC, EXPLOSIVE, ENERGY, PIERCE`.
`armor_mult: KINETIC 1.0 · EXPLOSIVE 0.5 · ENERGY 0.0 (ignores armor) · PIERCE 0.25`
`effective_armor = armor × armor_mult[type]`
`damage_dealt = max(raw_damage − effective_armor, raw_damage × 0.20)`  ← 20 % floor, no immunity by armor alone.
Shield absorbs first: ENERGY ×1.5 vs shield, others ×1.0; shield regenerates after 3 s without damage (shield-bearers only).
Splash: full damage at centre → linear falloff to 50 % at radius edge. Crit (from skill tree): ×2 damage.

### 7.4 Status effects
- **Slow**: strongest slow wins (no stacking multiplicatively); duration refresh; bosses cap slow at 50 %.
- **Buff (Beacon)**: additive percentage bonuses from all beacons in range, capped at +60 % damage.
- **Heal aura (Medic)**: heals allies in radius for HP/s; does not heal above max; heal is cancelled while enemy is "marked" (optional).
- **Phase (Phantom)**: untargetable for 1.5 s every 4 s (still moves; projectiles in flight on a phasing target miss).
- Effects tick on the fixed 60 Hz logic step; all are pause-safe.

### 7.5 Towers (5) — initial stats (tier 1 → 3)
| Tower | Role | Damage type | Cost | Dmg | Rate/s | Range px | Special |
|---|---|---|---|---|---|---|---|
| **Pulse** | Fast-firing | KINETIC | 100 | 12 → 18 → 26 | 4 → 5 → 6 | 140 → 150 → 160 | Cheap, reliable vs swarms |
| **Mortar** | Splash | EXPLOSIVE | 150 | 45 → 70 → 105 | 0.8 → 0.9 → 1.0 | 200 → 215 → 230 | Splash 60 → 70 → 85 px; arc projectile with travel time; ground only |
| **Cryo** | Slow | ENERGY | 120 | 4 → 6 → 9 | 2 | 120 → 130 → 140 | Slow 35 % → 45 % → 55 % for 2 s; T3 15 % freeze (0.6 s) |
| **Railgun** | Sniper | PIERCE | 250 | 140 → 220 → 340 | 0.5 → 0.55 → 0.6 | 360 → 390 → 420 | Hitscan line; pierces 1 → 2 → 3 enemies |
| **Beacon** | Support | — | 180 | — | — | 130 → 145 → 160 | Buff in range: +15/+25/+35 % damage, +10/+15/+20 % range; T3 +10 % fire rate |

Upgrade costs: Pulse 80 / 160 · Mortar 120 / 240 · Cryo 90 / 180 · Railgun 200 / 400 · Beacon 140 / 280.
Sell refund = **70 %** of total gold invested (difficulty/skill modifiable). Selling is instant; refunds cannot be abused (no refund for builds cancelled in the same tick beyond 100 %).
Placement: ghost preview with range ring; invalid cells tinted; confirm by tap/click; cancel by right-click / back / `Esc`.

### 7.6 Targeting priority (all four modes — acceptance critical)
Each attacking tower has `target_mode ∈ {FIRST, LAST, STRONGEST, NEAREST}`; default FIRST; changeable in the tower panel (and hotkey `T` cycles).
Candidates = enemies within range that are targetable (not phasing, valid air/ground).
- **FIRST**: max `progress_px` (closest to base).
- **LAST**: min `progress_px` (closest to spawn).
- **STRONGEST**: max current `hp + shield`; tie → FIRST.
- **NEAREST**: min Euclidean distance to the tower; tie → FIRST.
Final tie-break: lowest `enemy.uid` (deterministic). Retarget when: target dies, leaves range, becomes untargetable, mode changes, or every 0.1 s.
Range queries use a `SpatialHash` (cell = 96 px) — no O(towers×enemies) scans per frame.
Unit tests cover each mode with crafted positions, including ties and phasing.

### 7.7 Economy
- Start gold: map value × difficulty (default 250). Gold only from kills (bounty), wave-clear bonus, early-call bonus, refunds.
- Wave-clear bonus: `25 + 2·wave`. **Early call** (press `Space`/Start during build countdown): bonus gold = remaining seconds × 1.
- Build countdown between waves: 15 s (first wave: wait for player). Auto-start toggle in Settings.
- Gold never negative; purchase atomic (check → deduct → place or rollback).

### 7.8 Waves (WaveManager)
- Plays `SpawnGroup`s in time order; wave ends when all spawned enemies are dead or have reached the base (and all split children, summons).
- States: `IDLE → COUNTDOWN → SPAWNING → ACTIVE → CLEARED`. `all_waves_cleared` only after the final wave is fully cleared → Victory.
- Boss waves: 10, 20, 30 (announcement banner, music change, boss health bar HUD).
- Game speed 1×/2×/3× scales the logic step (not the render rate); all timers go through the same scaled clock.

### 7.9 Base & defeat
Base HP default 20 (Easy 30 / Normal 20 / Hard 15 / Nightmare 10). Enemy `base_damage` subtracts on arrival. HP ≤ 0 → DEFEAT immediately
(remaining enemies freeze; results show reached wave). Bosses: Juggernaut 8, Overseer 10, Hive Titan = all remaining HP.

### 7.10 Skill tree (meta-progression, persistent)
Currency: **Research Points (RP)** = `1 per cleared wave + 3 per star earned + 10 per boss kill (first time per map)`; retry-farming allowed with diminishing return (×0.5 after the first clear of a map).
Three branches × 5 nodes (each node 1–3 ranks, cost 1–5 RP, prerequisite chain):
- **Offense**: Damage +3 %/rank · Fire rate +3 %/rank · Range +2 %/rank · Crit 4 %/rank (×2) · Pierce armor +5 %/rank.
- **Economy**: Start gold +25/rank · Bounty +3 %/rank · Sell refund +4 %/rank (max 82 %) · Wave bonus +5 %/rank · Cheaper upgrades −3 %/rank.
- **Defense**: Base HP +2/rank · Repair 1 HP every 10 waves · Slow effect +4 %/rank · Beacon aura +4 %/rank · Emergency shield (absorb 1 hit, once per run).
Respec is free. Skill effects are applied as `RunModifiers` at map start and covered by tests.

### 7.11 Map modifiers
| Id | Name | Effect |
|---|---|---|
| `none` | — | — |
| `fast_lane` | Fast Lane | Enemy speed +15 % |
| `scarce` | Scarcity | Bounty −20 % |
| `fog` | Fog | Tower range −15 % |
| `armored` | Reinforced | Enemy armor +20 % |
| `blackout` | Blackout | Every 5th wave, all towers offline 3 s at wave start |
| `double_lane` | Double Lane | Two active spawn lanes |
| `last_grid` | Last Grid | Fast Lane + Scarcity + Armored (lite values) |

### 7.12 Difficulty levels
| | Easy | Normal | Hard | Nightmare |
|---|---|---|---|---|
| Enemy HP × | 0.8 | 1.0 | 1.3 | 1.7 |
| Gold × | 1.2 | 1.0 | 0.9 | 0.8 |
| Base HP | 30 | 20 | 15 | 10 |
| Sell refund | 70 % | 70 % | 70 % | 50 % |
| Star thresholds | lenient | standard | strict | strict |
Stars per map (by base HP left %): ★ win · ★★ ≥ 50 % · ★★★ ≥ 90 %. Nightmare unlocks after clearing a map on Hard.

### 7.13 Achievements (≥ 15)
First Blood, Wave 10, Wave 20, Perfect Defense (3★), Boss Slayer ×3, Frugal (win with ≤ 5 towers), Full Grid, Crit Master (100 crits), Slow Poke (cryo 10 000 s slow total), Sniper (railgun 500 kills), Splash Zone (mortar 3+ kills one shell), Beacon of Hope, Millionaire (10 000 lifetime gold), Nightmare Clear, Completionist (all maps ★★★)… Stored in save; toast on unlock.

## 8. Content tables

### 8.1 Enemies (8) — base stats
| Id | HP | Shield | Armor | Speed px/s | Bounty | Base dmg | Trait |
|---|---|---|---|---|---|---|---|
| `grunt` | 100 | 0 | 0 | 60 | 5 | 1 | Baseline |
| `sprinter` | 60 | 0 | 0 | 110 | 6 | 1 | Fast |
| `brute` | 400 | 0 | 8 | 40 | 15 | 3 | Heavy armor |
| `swarmling` | 25 | 0 | 0 | 80 | 2 | 1 | Spawns in large groups |
| `shieldbearer` | 200 | 150 | 2 | 55 | 14 | 2 | Regenerating shield (weak to ENERGY) |
| `medic` | 150 | 0 | 0 | 50 | 18 | 2 | Heals 15 HP/s, radius 96 px |
| `splitter` | 250 | 0 | 3 | 55 | 12 | 2 | On death spawns 2 swarmlings |
| `phantom` | 180 | 0 | 0 | 75 | 16 | 2 | Untargetable 1.5 s every 4 s |

### 8.2 Bosses (3)
| Id | Wave | HP | Armor | Speed | Base dmg | Mechanics |
|---|---|---|---|---|---|---|
| `juggernaut` | 10 | 6 000 | 20 | 30 | 8 | Slow capped at 50 %; resists splash 25 % |
| `overseer` | 20 | 9 000 | 10 | 40 | 10 | Summons 3 sprinters every 6 s; shield pulse gives nearby enemies +5 armor for 3 s |
| `hive_titan` | 30 | 20 000 | 15 | 35 | all remaining HP | 3 phases (100–66 / 66–33 / 33–0 %): P2 spawns splitters, P3 +40 % speed & minor regen; slow capped at 50 % |
(HP shown before difficulty/wave scaling — boss HP is **not** multiplied by `wave_hp_mult`, only by difficulty.)

### 8.3 The 30 wave configurations (WaveSet)
| W | Composition | W | Composition |
|---|---|---|---|
| 1 | 8 grunt | 16 | 10 phantom + 6 medic |
| 2 | 12 grunt | 17 | 12 brute + 10 sprinter |
| 3 | 10 grunt + 4 sprinter | 18 | 40 swarmling + 8 splitter |
| 4 | 20 swarmling | 19 | 10 shieldbearer + 8 medic + 8 brute |
| 5 | 8 sprinter + 8 grunt | **20** | **BOSS overseer** + 8 phantom + 6 medic |
| 6 | 4 brute + 10 grunt | 21 | 14 splitter + 14 sprinter |
| 7 | 15 swarmling + 6 sprinter | 22 | 12 phantom + 10 shieldbearer |
| 8 | 4 shieldbearer + 10 grunt | 23 | 16 brute + 8 medic |
| 9 | 3 medic + 12 grunt + 4 brute | 24 | 50 swarmling + 12 sprinter |
| **10** | **BOSS juggernaut** + 10 grunt | 25 | 14 shieldbearer + 12 splitter + 6 medic |
| 11 | 6 splitter + 10 sprinter | 26 | 16 phantom + 14 brute |
| 12 | 6 phantom + 12 swarmling | 27 | 20 splitter + 12 shieldbearer |
| 13 | 8 brute + 4 medic | 28 | 60 swarmling + 16 phantom |
| 14 | 25 swarmling + 8 sprinter | 29 | 20 brute + 12 medic + 12 shieldbearer |
| 15 | 8 shieldbearer + 6 splitter | **30** | **BOSS hive_titan** + escorts of every type (3 each) |
Spawn intervals: 0.3–1.2 s within groups (swarmlings 0.12 s), 2–4 s between groups. Each `WaveData` is a `.tres` file (`data/waves/wave_01.tres … wave_30.tres`).

### 8.4 The 10 maps
| # | Id / Name | Layout | Waves | Modifier | Unlock |
|---|---|---|---|---|---|
| 1 | `training_grid` Training Grid | Simple S-path, tutorial prompts | 10 | none | open |
| 2 | `crossroads` Crossroads | Two lanes that merge | 12 | none | M1 ★ |
| 3 | `spiral_core` Spiral Core | Long spiral toward centre | 15 | none | M2 ★ |
| 4 | `misty_pass` Misty Pass | Zig-zag canyon | 15 | fog | M3 ★ |
| 5 | `fast_track` Fast Track | Long straights, few corners | 20 | fast_lane | M4 ★ |
| 6 | `scrap_yard` Scrap Yard | Loops back on itself (tower hot-spots) | 20 | scarce | M5 ★ |
| 7 | `iron_wall` Iron Wall | Wide U-shape | 25 | armored | M6 ★★ |
| 8 | `blackout_city` Blackout City | Dense city grid, tight slots | 25 | blackout | M7 ★★ |
| 9 | `twin_gate` Twin Gate | Two independent spawn lanes → one base | 30 | double_lane | M8 ★★ |
| 10 | `last_grid` The Last Grid | Final map, long snake path | 30 | last_grid | M9 ★★ |
Every map ships: unique background/theme, ≥ 18 buildable cells, tested lane polylines, own star thresholds, and passes the balance-sim winnability check on Normal (§12.3).

## 9. UI / UX screens

All screens: keyboard + mouse + touch navigable, focus visible, scales with `Settings.ui_scale`, localised, colour-blind safe.
1. **Boot/Splash** (logo, loading, audio unlock prompt on Web).
2. **Main Menu**: Play, Skill Tree, Encyclopedia, Achievements, Settings, Quit (hidden on Web/Android).
3. **Map Select**: 10 map cards (thumbnail, stars, locked state + requirement), difficulty selector, modifier badge, best wave.
4. **Tower Encyclopedia**: 5 towers (stats per tier, damage-type chart, animated preview) + enemy/boss codex (unlocked on first sight).
5. **Skill Tree**: node graph, RP counter, rank pips, tooltip, respec button.
6. **Battlefield HUD**: wave `n/total` + next-wave preview icons, gold, base HP bar, speed toggle (1×/2×/3×), Start-wave button (`Space`), pause button,
   boss HP bar, wave banner, floating damage/gold numbers (toggle in Settings).
7. **Tower build bar** (bottom; on mobile larger icons): 5 tower buttons with cost, greyed when unaffordable, hotkeys `1–5`.
8. **Tower info / upgrade panel**: name, tier, stats, range ring, target-mode selector, Upgrade (cost), Sell (refund), hotkeys `U`, `S`, `T`.
9. **Pause menu**: Resume, Restart, Settings, Controls, Quit to Menu (with confirm).
10. **Settings**: Audio sliders, language, UI scale, key rebinding, colour-blind mode, reduced motion, auto-start waves, show damage numbers, FPS counter, reset save (confirm).
11. **Tutorial/Onboarding**: contextual hints on Map 1 (place tower → start wave → upgrade → priority → sell), skippable, replayable from Settings.
12. **Victory / Defeat + Statistics**: result banner, stars, RP earned, stats (kills per type, damage per tower, gold earned/spent, leaks, time, best wave), Retry / Next Map / Menu.
13. **Controls reference** (from `docs/controls.md` rendered in-game).

### 9.1 Visual direction
Neon-on-dark "grid" aesthetic (fits the title): dark navy background, glowing cyan/magenta/amber accents, thin vector-like outlines, subtle scanlines/CRT off by default.
Pure vector/pixel art generated or self-made; light shaders only (Compatibility-safe); `CPUParticles2D` for VFX. One consistent palette + colour-blind variant (shape/icon coding for tower and enemy types, not colour alone).
Typography: one open-license display font + one readable UI font (OFL). Icons: self-made SVG set.

### 9.2 Audio
Music: menu loop, calm build-phase loop, intense wave loop, boss loop, victory/defeat stingers (CC0/own, loop-clean OGG).
SFX: per tower (fire/hit), enemy hit/death/leak, build/upgrade/sell, UI click/hover/error, wave start/clear, boss roar, low-HP alarm. Max 32 simultaneous voices with priority + per-SFX cooldown to avoid spam. Buses: Master, Music, SFX, UI.

## 10. Save system
- Files: `user://progress.json` (+ `.bak`), `user://settings.cfg`. Web persists via IndexedDB (automatic for `user://`).
- Progress JSON: `{version, map_progress{map_id:{stars,best_wave,best_difficulty,cleared}}, rp_total, rp_spent, skills{id:rank}, achievements{}, stats{lifetime}, codex{}, tutorial_done}`.
- **Atomic write** (write temp → rename), keep `.bak`, schema `version` + migration functions, safe defaults on corrupt/missing file (never crash).
- Autosave: on run end, on skill purchase, on settings change, on app pause/lose-focus (Android/Web).
- Mid-run save: **not required** (runs are short); if the app is backgrounded the game pauses.

## 11. Performance & platform requirements
| Metric | Target |
|---|---|
| Desktop | 60 FPS stable, wave 30 on largest map |
| Android (mid-range, 4 GB RAM) | ≥ 45 FPS with 150 enemies + 40 towers + 200 projectiles |
| Web | Initial download ≤ 40 MB (compressed), start ≤ 8 s on 4G, ≥ 50 FPS on mid laptop |
| Memory | ≤ 300 MB mobile / web |
| Logic | Fixed 60 Hz tick; render may vary; 3× speed must not tunnel/skip waypoints (sub-stepping) |
Techniques: pooling, spatial hash, atlas textures, culled off-screen VFX, texture compression (ETC2 for Android, VRAM off for web), disabled unused engine features/modules via export template trimming (optional).
Android: min SDK per Godot docs, portrait locked OFF (landscape forced), back button = pause/back, immersive mode, safe areas, adaptive icon, `arm64-v8a` (+ `armeabi-v7a` if size allows), AAB for store / APK for sideload.
Web: Compatibility renderer, single-thread export (no SharedArrayBuffer needed), fullscreen button, touch support, visibility-change pauses, audio unlock overlay, custom HTML shell with loading bar and neon splash.

## 12. Testing & QA

### 12.1 Unit tests (GUT) — minimum
`damage formula & armor floor` · `shield mechanics` · `splash falloff` · `slow stacking rules` · `all 4 targeting modes + ties + phasing` ·
`path follower stays on path (sampled every frame, tolerance ≤ 0.5 px)` · `wave manager state machine & wave-clear detection incl. splits/summons` ·
`economy (buy/sell/upgrade/refund/atomicity)` · `GameState transitions` · `save/load/migrate/corrupt-file` · `skill modifiers` · `difficulty/modifier math` · `data validation`.

### 12.2 Integration/e2e (headless)
Boot → start map 1 → place towers via API → run to wave 3 → assert state. Pause/resume determinism. Win and Defeat flows reach RESULTS and persist progress. Retry creates a clean run.

### 12.3 Balance simulator (`tools/balance_sim`)
Headless, seeded, accelerated (no rendering). A scripted "bot" builds with a fixed strategy set (e.g. *balanced*, *splash-heavy*, *economy-first*) per map/difficulty.
Reports: win-rate, average wave reached, gold curve, leak counts, per-tower damage share. Targets on **Normal**: bot win-rate 55–85 % on maps 1–8, 35–65 % on maps 9–10; no single tower > 45 % damage share; every tower used in ≥ 1 winning strategy.
Results are appended to `notes/BALANCE_LOG.txt`.

### 12.4 Manual QA checklist (run before each release)
- Menu → game → pause → resume → quit to menu works; Game Over and Victory trigger correctly.
- Collision/targeting/projectile/damage/interaction correct; towers can't be placed on path or on top of each other.
- Enemies never leave the path; no softlocks (e.g., wave never ends because a split/summon is stuck).
- Save/load restores stars, RP, skills, settings, achievements; corrupt-save recovery.
- Audio: mute, volume, pause, scene change, Web unlock.
- Multiple resolutions/aspect ratios (16:9, 16:10, 21:9, 4:3, phone landscape) + UI scale; 30/60/144 Hz.
- Android: touch build/upgrade/sell, pinch zoom, safe area, back button, backgrounding, performance on a mid device.
- Release build runs on a clean machine/device following the README only.

## 13. Documentation deliverables
`README.md` (engine version, run, controls, build, deploy), `docs/GDD.md`, `docs/controls.md`, `docs/changelog.md` + `CHANGELOG.md`,
asset list/licences (`notes/ASSET_LICENSES.txt` → also `docs/ASSETS.md` at release), test checklist & bug changelog, demo video / gameplay recording.

## 14. Build, deploy & CI/CD

### 14.1 GitHub
Repo `last-grid-td` (name suggestion). Protected `main`; PR template; issue templates (bug, balance, feature); labels.
**Workflows** (`.github/workflows/`):
- `ci.yml` (on PR/push): checkout → setup Godot (pinned) → `gdlint`/`gdformat --check` → data validation → GUT tests → headless balance smoke (20 runs).
- `deploy-web.yml` (on push to `main`): export Web → deploy `export/web` to **Vercel** via CLI (`vercel deploy --prod` with `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) → post preview/prod URL.
- `release.yml` (on tag `v*`): export Windows (zip), Web (zip), Android (APK/AAB, signed from secrets) → create GitHub Release with notes from `CHANGELOG.md`.
Pin all actions by version/SHA. Cache Godot export templates. Never echo secrets.
Required secrets (names only): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_ALIAS`, `ANDROID_KEYSTORE_PASSWORD`.
Skeleton (adapt, pin versions):
```yaml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: chickensoft-games/setup-godot@v2   # verify latest tag & pin
        with: { version: 4.6.3, use-dotnet: false, include-templates: true }   # use the pinned project version
      - run: pip install gdtoolkit==4.*  && gdlint scripts && gdformat --check scripts
      - run: godot --headless --path . -s tools/validate_data.gd
      - run: godot --headless --path . -s addons/gut/gut_cmdln.gd -gdir=res://tests -gexit
```

### 14.2 Vercel (web hosting)
Static hosting of the Godot Web export (no build step on Vercel; CI uploads the prebuilt folder, or Vercel serves a committed `web/` folder as fallback).
`vercel.json` (project root or inside the deployed folder):
```json
{
  "cleanUrls": true,
  "headers": [
    { "source": "/(.*)", "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" } ] },
    { "source": "/(.*)\\.(wasm|pck|js)", "headers": [
      { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } ] },
    { "source": "/index.html", "headers": [ { "key": "Cache-Control", "value": "no-cache" } ] }
  ]
}
```
Notes: export Web as `index.html` entry; `.wasm` served as `application/wasm` (Vercel does by default). Cross-origin isolation headers (COOP `same-origin`, COEP `require-corp`) are **only** needed if a threaded Web export is chosen — default is single-threaded, so omit them (keeps third-party embeds/itch.io-style iframes working).
If using versioned filenames is not enabled, shorten cache for `.pck/.wasm` (e.g. `max-age=3600, must-revalidate`) to avoid stale builds. Keep every file < 100 MB (Vercel static file limit) — web build budget is ≤ 60 MB total.
Preview deployments for PRs; production on `main`. Custom domain = user decision.

### 14.3 Render (optional — only if needed)
The game is offline-first, so **Render is NOT required for the MVP**. Use it only for:
- (a) a static-site mirror of the Web build (`render.yaml` `type: web`, `runtime: static`, `staticPublishPath: export/web`), or
- (b) **post-MVP stretch**: online leaderboard API — FastAPI + PostgreSQL (`/scores` POST/GET, per-map/difficulty top 100, HMAC-signed score payload with run seed + checksum, rate-limit, CORS allowlist for the Vercel domain). The game must work fully when the API is unreachable.
Any Render step is Human-gated (agents.md §9). Document the outcome in `notes/DEPLOY_CHECKLIST.txt`.

### 14.4 Export presets
`Web` (Compatibility, single-thread, custom shell `web/shell.html`), `Windows Desktop` (x86_64, embedded PCK, icon/version info), `Android` (gradle build, arm64-v8a, ETC2, signed release via env vars). Icons, splash, version (`application/config/version` synced to git tag).

## 15. Out of scope (MVP)
Maze-building/path-blocking, online multiplayer, mid-run save, 3D, in-app purchases, ads, level editor, controller-only UI polish (basic gamepad support optional).

## 16. Requirement traceability (source doc → spec)
| Source requirement | Spec section |
|---|---|
| Waypoint/path enemy route, reach base | §7.1, §7.9 |
| Tower types: fast, splash, slow, sniper, support | §7.5 |
| Target priority: first, last, strongest, nearest | §7.6 |
| Resource, build cost, upgrade, sell | §7.5, §7.7 |
| Wave schedule, enemy types, armor, bosses | §7.2–7.3, §7.8, §8 |
| Skill tree, map modifiers, difficulty | §7.10–7.12 |
| Map Select, Tower Encyclopedia | §9 (3, 4) |
| Battlefield HUD (wave, gold, base HP), build/upgrade panel | §9 (6–8) |
| Victory/Defeat + statistics | §9 (12) |
| 10 maps, 5 towers, 8 enemies, 3 bosses, 30 waves | §1.1, §8 |
| General: menus, settings, pause, tutorial, input remap, save, FPS/scaling, README, tests | §3, §9, §10, §11, §12, §13 |
| Web + Windows + Android, GitHub, release | §11, §14 |
