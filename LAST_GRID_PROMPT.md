# TOWER DEFENSE: LAST GRID — AGENT PROMPT (Antigravity)

Paste PART A first. When the agent finishes and reports, paste PART B.
Attach `apex01_mech_v2.html` (reference mech model) to the project before starting.

---

## PART A — AUDIT, UI FIXES, VISUAL UPGRADE

**ROLE:** Senior game developer + QA + UI/UX + technical artist.
**PROJECT:** "Tower Defense: Last Grid" — mobile landscape, offline, HTML5/JS + Android APK, languages uz/en/ru.
**RULE:** Do not break working features. Fix and upgrade only. Work phase by phase, commit after each, post a short summary per phase. Ask only when blocked.

### Phase 1 — Full audit (before writing code)
1. Read the whole codebase. List every interactive element: main menu (Campaign, Endless, 3D TPS Arena, Map Select, Boss Rush, Map Editor, Leaderboard, Encyclopedia, Settings, Android APK, ZIP download), HUD (START/ENGAGE, speed, settings, pause, menu/abort, ULT), bottom bar (MECH/EMP/LAZ/ROF/DRN abilities, towers 1-6), settings dialog, comms box.
2. Test each one and log `works / broken / cause` in `AUDIT.md`. Typical causes to check: missing or duplicate listeners, touchstart vs click conflicts, overlays/canvas swallowing pointer events, z-index, disabled state never reset, undefined handlers, duplicate IDs, state not reset on mode change.
3. Fix all of them. Use Pointer Events everywhere, minimum 48px touch targets, `touch-action: manipulation`, no 300ms delay, no ghost clicks through dialogs.

### Phase 2 — Known UI/layout bugs (fix all)
- Title: "GRID" overlaps the version text → put the version in a small separate label.
- Text clipped or overflowing: "ENSIKLOPEDIYA", "(ZIP)", "WAVE", comms message ("Minora va t…") → use flex/grid, `clamp()` font sizes, wrapping or ellipsis, never clip.
- Bottom bar: ability icons MECH/EMP/LAZ/ROF/DRN overlap → clean slots: icon on top, label below, cost, cooldown ring. Tower cards: icon, name, cost, selected glow, dimmed when gold is too low, hotkey badge.
- Duplicate icons: "⚙ ⚙ SOZLAMALAR", "📲 📲 ANDROID APK" → one each.
- Stray debug text "[CAM…" behind the HUD buttons → remove.
- Comms box: show the full message with typewriter effect, then auto-hide.
- Map layout: nothing may sit under the HUD (map 2: WARP spawn is half-hidden). Apply safe-area insets and one scale rule for 16:9 and 20:9. WARP and CORE fully visible on all 10 maps.
- Settings (SFX/BGM volume, haptics, Fit/Fill, 60/30 FPS, language, CRT) must apply live and persist in localStorage.
- Single language per UI state, all strings from an i18n dictionary (uz/en/ru), no mixed strings.
- Endless record shows "Wave 0" and PTS does not persist → fix.

### Phase 3 — Visual upgrade
- **Mech APEX-01:** replace the boxy placeholder in the menu card and the 3D TPS arena with the model in `apex01_mech_v2.html` (procedural Three.js: legs, torso, cockpit core, shoulder pods, dual cannons, thrusters; idle breathing, recoil, dash trail, hit flash, ULT beam). Port `createApex` logic into the game. If the game UI is Canvas 2D, render the mech with Three.js on a separate canvas inside the menu card. Vendor Three.js locally (download `three.module.js` into `/libs`, change the import map) so the game stays 100% offline.
- **Enemies:** 6 distinct types (scout, grunt, tank, flyer, swarm, shielded) + boss. Larger readable size, HP bar, hit sparks, death explosion, floating damage numbers.
- **Towers:** unique silhouette per tower, level-up visuals (3 levels), range circle on tap, radial upgrade/sell menu (sell refund 70%), muzzle flash, projectile trails.
- **Feel:** screen shake (small, optional in settings), wave-start banner, parallax ambient background, smooth 60 FPS via object pooling, 30 FPS battery mode.
- **Performance rules:** cap device pixel ratio at 1.5; keep draw calls under ~150 on mobile; use InstancedMesh or batching for repeated objects; pool bullets/particles/damage numbers (no allocation in the frame loop); dispose geometries, materials and textures on scene change; no shadows on mobile.
- **Assets (free licenses only, record each in `CREDITS.md` with URL and license):**
  - Kenney Tower Defense Kit (3D, CC0): https://kenney.nl/assets/tower-defense-kit
  - Kenney Tower Defense Top-Down (2D, CC0, 300 files): https://kenney.nl/assets/tower-defense-top-down
  - Quaternius Animated Mech Pack (4 mechs, CC0): https://opengameart.org/node/126992
  - Quaternius Sci-Fi Essentials Kit (enemies, guns, CC0): https://opengameart.org/content/sci-fi-essentials-kit
  - Quaternius LowPoly Robot (CC0): https://quaternius.itch.io/lowpoly-robot
  - Kenney Sci-Fi Sounds (CC0): https://kenney.nl/assets/sci-fi-sounds
  - Kenney Digital Audio (CC0): https://kenney.nl/assets/digital-audio
  - Kenney Interface Sounds (CC0): https://kenney.nl/assets/interface-sounds
  - Kenney Impact Sounds (CC0): find it in the audio section on kenney.nl and check the bundled license.txt
  - Freesound.org (filter license = CC0 only), jsfxr for generated retro SFX.
  - **Do NOT use** models with "Custom"/"Royalty Free" marketplace licenses (CGTrader, TurboSquid) or Meshy free-plan output (CC BY needs credit and has other terms). If unsure of a license, skip the asset.
  - Compress everything (glTF/GLB + Draco or meshopt, WebP textures, OGG/MP3 audio). Keep the APK small.

---

## PART B — GAMEPLAY, BALANCE, AUDIO, QA, DELIVERY

### Phase 4 — Data-driven gameplay and balance
Move all numbers into JSON: `towers.json`, `enemies.json`, `waves.json` (10 campaign maps), `endless.json`. Starting values below are a baseline to tune with the simulator, not final.

**Economy:** start gold 250, base HP 20 (Normal). Kill reward ≈ 4 + 0.6×wave for a grunt; scale by enemy type. Wave-clear bonus. Sell refund 70%.

**Enemies (baseline, wave 1):**
| Type | HP | Speed | Notes |
|---|---|---|---|
| Scout | 40 | 1.6 | fast, low reward |
| Grunt | 100 | 1.0 | standard |
| Tank | 400 | 0.6 | 30% armor |
| Flyer | 70 | 1.4 | ignores path, only some towers can hit it |
| Swarm | 25 | 1.3 | spawns in groups of 8 |
| Shielded | 120 + 150 shield | 0.9 | EMP disables shield |
| Boss | 3000 | 0.5 | every 5th wave, special ability |

**Scaling:** campaign HP multiplier `1.12^(wave-1)`; enemies per wave `min(30, 8 + floor(1.2 × wave))`; endless after wave 20 uses a softer curve so it stays playable. Difficulty curve should be exponential rather than linear, with no sudden spike at wave 3.

**Towers:** each tower should be roughly equal in DPS per gold (±25%) but differ in role: Pulse (kinetic, cheap), Mortar (splash, slow shot), Cryo (slow 35% for 2s), Railgun (pierce, low fire rate), Beacon (aura: +20% damage, +15% range to neighbors), Wall. Upgrades: 3 levels at 0.7× / 1.0× / 1.4× base cost, +40% damage each, range gains with diminishing returns (e.g. +10% / +5% / +3.5%). Projectile speed must be high enough to hit the fastest enemy.

**Balance checks (automatic):**
- Write `tools/simulate.js` (headless, Node): run 200 randomized bot builds per map and difficulty. Targets on Normal: bot-win rate 55–85%; no-tower or single-tower-type runs lose; every tower type appears in at least one winning build (otherwise it is useless or overpowered).
- Print a table per map: win rate, average gold left, leak count, most used tower. Fix numbers until all maps pass. Save the table in `BALANCE.md`.

**Game flow:**
- Map 1 tutorial with step-by-step highlights (place tower → START → upgrade → ULT).
- Clear START/ENGAGE flow, next-wave preview (enemy types and count), 3 difficulty levels, star scoring (30 stars total across 10 maps), progress saved in localStorage.
- Pause menu, game-over and victory screens with stats (kills, gold, leaks, time), retry and next buttons.
- Local leaderboard that works offline; online sync only as an optional later step.
- Boss Rush, Map Editor, 3D TPS Arena: each must start, end and return to the menu without errors.

### Phase 5 — Audio, haptics, settings
- Verify SFX and BGM volume, haptics, Fit/Fill, FPS mode, language and CRT toggles apply immediately and persist after restart.
- Sounds required: shoot (per tower type), hit, explosion, UI click, wave start, build/sell, ULT, victory, defeat. Use the CC0 packs in Part A. Pool audio, never create a new Audio object per shot. Unlock audio on the first user gesture.

### Phase 6 — QA and delivery
- Automated smoke test (Playwright or similar): click every button in every screen, play one wave on each map, assert no console errors and no unhandled promise rejections.
- Test at 1920×1080, 2400×1080 (20:9) and 360×800 portrait fallback ("rotate your device" screen).
- Fix all console warnings, memory leaks (heap stays flat after 10 map restarts) and input lag.
- Rebuild the APK and ZIP, bump the version, write `CHANGELOG.md`.
- Final report: what was fixed, what remains, top 5 next improvements.
