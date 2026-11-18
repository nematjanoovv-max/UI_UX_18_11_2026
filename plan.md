# PLAN.md — Tower Defense: Last Grid

> Uzbek: Bu bajarish rejasi (qaysi tartibda). Har bir bosqich oxirida tekshiruv (gate) o'tmaguncha keyingisiga o'tilmaydi.
> Qoidalar: `agents.md`. Nima qurilishi: `spec.md`. Raqamlar `§` = spec bo'limi. `[61]–[70]` = manba hujjatdagi "Ishlab chiqish ketma-ketligi" qadamlari.

**Legend:** `[ ]` todo · `[x]` done. Agent ticks boxes as work is verified. Estimated effort = focused working days (1 developer-equivalent).
**Order is strict:** M0 → M1 → … → M10. Do not start the next milestone while the current Gate fails.

## Timeline overview
| M | Name | Days | Gate (summary) |
|---|---|---|---|
| M0 | Foundation: repo, project, CI skeleton, notes | 1 | Empty project runs, CI green, notes files exist |
| M1 | GDD, balance sheet, data schemas | 1.5 | `docs/GDD.md` + data validates [61] |
| M2 | Prototype: path + enemy movement | 1.5 | Enemies walk path, reach base [62][63] |
| M3 | Core combat: towers, targeting, projectiles | 3 | All 4 target modes + 5 towers fire [64][65] |
| M4 | Economy, waves, bosses | 3 | Full 30-wave map playable end-to-end [66][67] |
| M5 | UI/UX: menus, HUD, panels, results, tutorial | 3 | Full loop with menus, no placeholders [69] |
| M6 | Content: 10 maps, modifiers, difficulty, skill tree, achievements | 4 | All content counts met [68] |
| M7 | Art, audio, VFX, i18n, accessibility polish | 3 | Consistent style, audio, 3 languages |
| M8 | Save/progression hardening + performance | 2 | Save robust, perf budgets met |
| M9 | QA, balance, tests [70] | 3 | Sim targets + QA checklist pass |
| M10 | Build, deploy (GitHub, Vercel, Android, Windows), release | 2 | v1.0.0 released, README-only install works |
Total ≈ 27 days. MVP-playable checkpoint (one full map) at end of M4.

---

## M0 — Foundation (Day 1)
- [x] Create `notes/` with all `.txt` files from agents.md §3 (header line + date in each).
- [x] Verify/pin Godot stable version → `notes/DECISIONS.txt`; create `project.godot` at repo root (Compatibility renderer, 1280×720, stretch `canvas_items`/`expand`, landscape).
- [x] Create folder layout (spec §4.1) with `.gdignore`/`.gitkeep` where needed.
- [x] `.gitignore`, `.gitattributes`, `README.md` (stub), `LICENSE`, `CHANGELOG.md`.
- [x] `git init`, first commit `chore: bootstrap project`. Branches `main`, `dev`.
- [x] Install GUT (pinned) into `addons/gut/`; one passing smoke test.
- [x] Install `gdtoolkit` config (`.gdlintrc`), pre-commit hook (optional).
- [x] Create autoload stubs: `EventBus, GameState, Settings, SaveSystem, AudioManager, SceneManager, Localization`.
- [ ] GitHub Actions `ci.yml` skeleton (lint + tests). **Ask user** to create the GitHub repo and push (agents.md §9).
- [x] Input map: `build_select_1..5`, `start_wave` (Space), `pause` (Esc), `upgrade`, `sell`, `cycle_target`, `speed_toggle`, `ui_*`.
**Gate M0:** project opens & runs a blank scene on desktop + Web export of blank scene loads; CI green; notes files exist.

## M1 — Design docs & data (Days 2–3) — **[61]**
- [ ] Write `docs/GDD.md` (core loop, controls, mechanics, win/lose, levels, difficulty) from spec.
- [ ] Write `docs/controls.md`.
- [ ] Create Resource classes: `TowerData, TowerTier, EnemyData, BossData, BossPhase, WaveData, SpawnGroup, MapData, LaneData, SkillNodeData, AchievementData, ModifierData, DifficultyData`.
- [ ] Author data: 5 towers, 8 enemies, 3 bosses (spec §7.5, §8.1–8.2) as `.tres`.
- [ ] Spreadsheet-like **economy & balance table** in `docs/balance.md` (cost vs DPS vs range, cost-efficiency per tower, enemy EHP per wave, gold income per wave).
- [ ] `tools/validate_data.gd` + CI step.
- [ ] Unit tests: data validation, damage formula pure functions (spec §7.3).
**Gate M1:** validator passes; balance table reviewed (no tower strictly dominated); GDD committed.

## M2 — Path & enemy movement prototype (Days 4–5) — **[62][63]**
- [ ] `GridMap2D` (cell types, world↔cell conversion, buildable mask) + debug overlay.
- [ ] `PathNetwork`: waypoint polyline → baked length, `sample(progress)`, tangent; multi-lane.
- [ ] `Enemy` base scene driven by `progress_px` (spec §7.1) + object pool.
- [ ] Enemy stats: HP, shield, armor, speed, base damage; `StatusEffects` (slow) hook.
- [ ] Base node: HP, `enemy_reached_base`, defeat signal.
- [ ] Temporary spawner (1 enemy/s) on Training Grid layout.
- [ ] Tests: **path-invariant** (position always on polyline ≤ 0.5 px for all lanes/speeds/3× sub-stepping), reaching base deals correct damage, pooling reuse is clean.
**Gate M2 (acceptance #1):** 1000 enemies at 1×/2×/3× never leave the path; base takes exact damage; no leaks of nodes (monitor shows stable object count).

## M3 — Towers, targeting, projectiles (Days 6–9) — **[64][65]**
- [ ] `SpatialHash` + tests.
- [ ] `TowerBase` (tiers, stats from `TowerData`, range ring, rotation, fire timer on fixed tick).
- [ ] `TargetingSystem` with FIRST / LAST / STRONGEST / NEAREST + deterministic tie-break (spec §7.6) + tests (ties, phasing, out-of-range, retarget on death/mode change).
- [ ] `Projectile` + `ProjectilePool`: homing bullet (Pulse), arc shell with splash (Mortar), cone/aura pulse (Cryo), hitscan piercing line (Railgun), aura buff (Beacon).
- [ ] `DamageSystem`: types, armor floor, shield, splash falloff, crits, kill credit.
- [ ] Status effects: slow (strongest wins, boss cap), buff (additive, cap), heal aura, phase.
- [ ] `BuildController`: ghost preview, validity tint, place/cancel, one tower per cell.
- [ ] Debug HUD: DPS meter, target lines.
**Gate M3 (acceptance #2):** each of 5 towers works vs. each enemy type; 4 targeting modes verified by tests + visual debug; 60 FPS with 100 enemies + 30 towers on desktop.

## M4 — Economy, waves, bosses, full run (Days 10–12) — **[66][67]**
- [ ] `EconomyManager`: gold, buy/upgrade/sell atomic, refunds, bounties, wave bonus, early-call bonus.
- [ ] `UpgradeController`: tier-up costs, sell (70 %), target-mode switch.
- [ ] `WaveManager`: load `WaveData`, timing, spawn groups, countdown, early call, speed 1×/2×/3×, clear detection incl. split/summon children (spec §7.8).
- [ ] Author `wave_01…wave_30.tres` (spec §8.3).
- [ ] Enemy traits: heal aura (medic), split on death (splitter), phase (phantom), shield regen (shieldbearer).
- [ ] Bosses: Juggernaut, Overseer (summons + aura), Hive Titan (3 phases) + boss HP bar signals.
- [ ] `GameState` FSM complete: build ⇄ wave, victory, defeat, pause (freezes all timers/tweens/audio-gameplay).
- [ ] Temporary minimal HUD (gold, wave, base HP) so the loop is playable.
- [ ] Integration test: scripted run on map 1 reaches VICTORY and DEFEAT deterministically.
**Gate M4 — MVP checkpoint:** one map, all 30 waves, all towers/enemies/bosses playable start→finish; wave-clear and base-loss logic verified (acceptance #3); tag `v0.1.0`.

## M5 — UI/UX (Days 13–15) — **[69]**
- [ ] Theme/Design tokens (`assets/ui/theme.tres`): colours, spacing, fonts, StyleBoxes, colour-blind variants.
- [ ] `Boot/Splash`, `Main Menu`, `Map Select` (cards, stars, lock state, difficulty), `Settings`, `Pause`, `Controls` screen.
- [ ] Battlefield HUD (wave, next-wave preview, gold, base HP, speed, start button, boss bar, banners, floating numbers).
- [ ] Tower build bar (cost, affordability, hotkeys 1–5) + Tower info/upgrade panel (target mode, upgrade, sell).
- [ ] `Tower Encyclopedia` (+ enemy/boss codex).
- [ ] `Victory/Defeat + Statistics` screens (StatsTracker: kills/type, damage/tower, gold, leaks, time).
- [ ] Tutorial/onboarding on Map 1 (skippable, replayable).
- [ ] Touch UX: ≥ 48 dp targets, tap-to-select, drag ghost, pinch zoom, safe areas; keyboard/gamepad focus navigation.
- [ ] Key rebinding UI (persisted).
- [ ] `SceneManager` transitions + loading screen.
**Gate M5:** whole loop playable only via UI (no debug tools): menu → map → play → result → retry/menu; works with mouse, touch (emulated + device), keyboard.

## M6 — Content: maps, modifiers, meta (Days 16–19) — **[68]**
- [ ] Build 10 `MapData` (spec §8.4): layouts, lanes, buildable cells, backgrounds, thresholds, unlock chain.
- [ ] `ModifierSystem` (spec §7.11) + tests; `DifficultySystem` (§7.12) + tests.
- [ ] Map progression: unlock by stars, best wave/difficulty stored; Nightmare unlock rule.
- [ ] `SkillTreeSystem` (15 nodes, RP rules, respec) + UI wiring + tests (§7.10).
- [ ] `AchievementSystem` (≥ 15) + toast + list screen.
- [ ] Per-map wave profile (which waves, scaling) validated by `validate_data.gd`.
**Gate M6:** counts verified by validator = **10 maps, 5 towers, 8 enemies, 3 bosses, 30 waves**; each map winnable by the balance bot on Easy.

## M7 — Art, audio, VFX, i18n, accessibility (Days 20–22)
- [ ] Final sprites/vector art for towers (3 tiers), enemies, bosses, tiles, backgrounds per theme, UI icons; consistent neon style (spec §9.1).
- [ ] Animations (idle, walk, hit flash, death, build/upgrade pop, muzzle flash), `CPUParticles2D` VFX.
- [ ] Audio: music (menu/build/wave/boss/stingers), SFX set, voice limiting, ducking, Web unlock. Record in `ASSET_LICENSES.txt`.
- [ ] i18n: all strings keyed; `en`, `uz`, `ru`; runtime switch; font coverage for Cyrillic/Uzbek diacritics (oʻ, gʻ).
- [ ] Accessibility: colour-blind mode (shape coding), UI scale, reduced motion, damage-number toggle.
- [ ] App icon, splash, Web HTML shell (loading bar), Android adaptive icon.
**Gate M7:** no placeholder art/audio; no hardcoded strings (lint script greps UI text); readable at 720p and on phone landscape.

## M8 — Save hardening & performance (Days 23–24)
- [ ] `SaveSystem`: atomic write, `.bak`, versioned migration, corrupt-recovery, autosave on pause/blur.
- [ ] Settings persistence + reset-save flow (confirm).
- [ ] Profile (Godot profiler/monitors) on desktop, Web, Android; optimise hot paths (pooling, hash, texture atlases, draw calls).
- [ ] Meet budgets (spec §11): log numbers in `notes/PERF_LOG.txt`.
- [ ] 3× speed sub-stepping stress test.
**Gate M8:** kill-the-process test during save never corrupts progress; perf targets met on Web + (device or best-effort emulator, flagged in notes).

## M9 — QA & balance (Days 25–27) — **[70]**
- [ ] Balance simulator (`tools/balance_sim`) with 3 bot strategies; runs in CI smoke mode.
- [ ] Tune to targets (spec §12.3); every change logged in `BALANCE_LOG.txt`.
- [ ] Full GUT suite green; coverage of every system in spec §12.1.
- [ ] Manual QA checklist (spec §12.4) executed; bugs in `KNOWN_BUGS.txt`; fix all severity-high.
- [ ] Softlock hunt: wave never ends, stuck splits/summons, pause during transitions, tab-away on Web, back button on Android.
- [ ] Pathfinding/target-selection/performance regression tests locked in CI.
**Gate M9:** zero open high-severity bugs; balance targets met; QA checklist fully ticked.

## M10 — Build, deploy, release (Days 28–29)
- [ ] Export presets finalised (`Web`, `Windows Desktop`, `Android`) — no secrets committed.
- [ ] **GitHub**: repo pushed (user-gated), branch protection, PR/issue templates, labels, `ci.yml`, `deploy-web.yml`, `release.yml`.
- [ ] **Vercel**: project linked (user-gated), `vercel.json`, secrets set, production deploy of Web build, preview deploys on PRs; smoke test the live URL.
- [ ] **Render** (optional): decide in `DECISIONS.txt` — default = *not used*. If used: static mirror or leaderboard stretch (spec §14.3), user-gated.
- [ ] **Android**: generate keystore (user instructs/approves), signed APK/AAB build, install test on device/emulator.
- [ ] **Windows**: exported `.exe` + zip; test on clean machine/VM.
- [ ] README final (engine version, run, controls, build, deploy), `docs/ASSETS.md`, changelog, release notes.
- [ ] Record demo video/gameplay capture (user or agent via screen capture if available).
- [ ] Tag `v1.0.0`; GitHub Release with Web/Windows/Android artifacts.
- [ ] Clean-machine verification using only README.
**Gate M10 (project acceptance):** all items in spec §1.2 true; deliverables list (source doc §9) complete.

---

## Cross-cutting checklists

### Per-task routine (repeat for every task)
1. Read relevant spec section → 2. write/adjust data + test first when practical → 3. implement → 4. run game + tests + lint →
5. update `notes/NOTES.txt` (+ other txt) → 6. tick checkbox → 7. conventional commit.

### Risk register
| Risk | Impact | Mitigation |
|---|---|---|
| Web performance / load size | Poor UX | Compatibility renderer, atlas, OGG, strip unused features, budget ≤ 60 MB |
| Mobile FPS with many entities | Unplayable | Pooling, spatial hash, cap VFX, quality toggle, early profiling in M3 |
| Balance spiral (too easy/hard) | Bad feel | Data-driven + simulator from M9, early rough table in M1 |
| Pause/speed timer desync | Softlocks | Single scaled clock; tests for pause & 3× |
| Wave never "clears" (splits/summons) | Softlock | Track live-enemy counter incl. children; test in M4 |
| Android signing/build tooling | Release delay | Start export dry-run at M5, not M10 |
| Web audio blocked | No sound | Unlock overlay on first gesture |
| Asset licensing | Legal | Own/CC0 only; log in `ASSET_LICENSES.txt` |
| Godot version drift | Breakage | Pin version in CI, project, notes |
| Scope creep (online features) | Delay | Out-of-scope list (spec §15); Render only post-MVP |

### Early de-risk spikes (do during M0–M2, 0.5 day each, log results in notes)
- [ ] Web export of a blank scene → local test → deploy to a throwaway Vercel preview.
- [ ] Android debug export of a blank scene (JDK/SDK/export templates configured).
- [ ] 300 sprites moving at 60 Hz in Web Compatibility renderer (feasibility benchmark).

### Weekly rhythm (if working in sessions)
Start: re-read `plan.md` current milestone + last 20 lines of `notes/NOTES.txt`. End: update notes, commit, push, short Uzbek report (agents.md §12).

## Change log (append-only)
- 2026-11-18 — Initial plan created from the source technical assignment (Project 07).
- 2026-11-18 — Completed M0 foundation tasks (notes, project.godot, autoloads, GUT v9.3.0, workflows, initial git commit).
