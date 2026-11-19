# Changelog

All notable changes to **Tower Defense: Last Grid** will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [4.1.0] - 2026-11-19
### Added & Enhanced (PART B — DATA-DRIVEN GAMEPLAY, BALANCE, AUDIO & QA)
- **Data-Driven JSON Architecture**: Extracted all gameplay mechanics and balance parameters into structured JSON files: `data/towers.json`, `data/enemies.json`, `data/waves.json` (all 10 campaign maps), and `data/endless.json`.
- **Flyer Aerial Enemies & Targeting**: Introduced `flyer` aerodynamic drones that bypass surface maze lanes and obstacles to fly straight to the core. Restricted Mortar targeting to ground hostiles while Pulse, Railgun, and Cryo engage air.
- **Wall Defense Tower**: Added Wall barricade to the hotbar (cost 40g, 400..900 HP) with Spike Barrier (thorns reflection) and Electrified Gate upgrades.
- **Difficulty Multipliers**: Integrated live 3-tier difficulty system (`CASUAL`: 0.8x enemy HP, 1.25x gold; `NORMAL`: 1.0x; `HEROIC`: 1.3x enemy HP, 0.85x gold) selectable from Map Select screen.
- **Step-by-Step Map 1 Interactive Tutorial**: Added highlight overlay on Map 1 guiding new players through tower placement, wave engagement, upgrading, and commander abilities with one-tap skip.
- **Tactical Next-Wave Preview**: Added top HUD preview badge showing upcoming enemy wave compositions before triggering engagement.
- **Star Scoring Persistence**: Integrated 3-star ranking across all 10 maps with total campaign stars tally (`X / 30 ★`) saved to localStorage.
- **Automated Headless Balance Simulator (`tools/simulate.js`)**: Evaluated 200 bot runs per map across 10 maps (2,000 total runs). Verified 55%–85% target win rate on Normal, verified that no-tower and single-tower builds lose, and confirmed all 6 tower archetypes appear in winning builds. Output stored in `BALANCE.md`.
- **Automated Smoke Test (`tools/smoke_test.js`)**: Validated all UI screens, 1-wave runs on all 10 maps, abilities, aspect ratios (16:9, 20:9, portrait), and verified zero memory leaks after 10 consecutive map restarts (-2.36 MB heap delta).
- **Portrait Fallback Orientation Overlay**: Added centered warning and phone rotation guidance screen for portrait orientation.

## [4.0.0] - 2026-11-19
### Added & Enhanced (PART A — AUDIT, UI OVERHAUL, APEX-01 3D MECH)
- **Comprehensive Interactive Audit (`AUDIT.md`)**: Full matrix of every button, touch target (>= 48px), and pointer event handling across all screens.
- **Procedural 3D APEX-01 Mech Integration (`apex_mech.js`)**: Ported full Three.js procedural mech with digitigrade hydraulic legs, rotating radar, shoulder missile pods, dual plasma cannons, pulsating reactor core, drag-to-rotate 360° inspection, and touch hit reactions.
- **100% Offline Standalone Three.js**: Vendored `libs/three.min.js` and `libs/three.module.js` locally for total offline Android APK and web bundle reliability.
- **UI Bug Fixes**: Repaired title/version overlap, removed duplicate icons, fixed text clipping in 3 languages, added typewriter wrap to radio comms, and shifted Map 2 & 10 WARP spawns from under HUD.
- **Live Sound Updates**: Added `setBGMVolume()` for instantaneous volume adjustments in settings dialog.
- **Credits & Open Assets (`CREDITS.md`)**: Documented CC0 open licenses for Kenney, Quaternius, and Freesound assets.

## [3.7.0] - 2026-11-18
### Added & Enhanced (Ultimate Mobile Ergonomics & Adaptive Viewport)
- **Universal Adaptive Viewport (All Android Phones)**: Added automatic aspect ratio support for 16:9, 18:9, 19.5:9, 20:9, and 21:9 screens. Added `FIT` (proportional centered) and `FILL` (edge-to-edge full stretch) display modes.
- **Hardware Back Button Navigation (`handleBackAction`)**: Integrated seamless Android hardware back key support. Prevents accidental quits during combat by triggering tactical pause instead of abandoning gameplay; handles modal dismissals, sub-menu back navigation, and double-tap to exit on main menu.
- **Dedicated Cyber-Tactical Settings Menu**: Built a comprehensive settings modal featuring SFX volume (100/70/30/0%), BGM volume, Haptic vibration toggle, Screen Fit (FIT/FILL), Performance FPS limit (60 Ultra / 30 Eco), Language selection, and Retro CRT filter.
- **Touch Ergonomics Overhaul**: Widened all touch hitboxes to minimum 100px-160px for effortless thumb gameplay. Consolidated cluttered Top HUD icons into clean buttons.
- **Barricade & Sub-Menu Bug Fixes**: Fixed bottom bar barricade selection hitbox and repaired mismatched back button hit areas in Field Manual, Map Select, and Map Editor.
- **Android Display Cutout Support**: Added `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES` to AndroidManifest and MainActivity for full immersion behind punch-hole camera and notch cutouts.

## [3.6.0] - 2026-11-18
### Added & Balanced (Dataset-Driven Game Architecture)
- **Bloons TD 6 Pacing Model**: Integrated 30 curated campaign waves based on Kaggle BTD6 dataset (`brandonconrady/bloons-tower-defense-6-rounds-1140`). Implemented power-law RBE curve $RBE = 21.24 \cdot w^{0.66}$ for infinite endless survival.
- **Cyberpunk 2077 & Valorant Weapon Archetypes**: Calibrated tower fire rates and damage. Added armor shredding (-1 armor/hit) to Gatling Shredder, 2.5x boss crit and 100% pierce to Railgun Sniper, and AoE cyber-fire Napalm pools.
- **Valorant 3D TPS Ballistics**: Added range damage falloff (100% up to 15m, 85% up to 30m, 70% beyond) and 2.2x headshot critical strikes with floating indicators and camera feedback.
- **CC0 Studio Sound Effects Engine**: Upgraded audio from synthetic 8-bit oscillator beeps to 8 real studio audio samples (`click.mp3`, `laser.mp3`, `explosion.mp3`, `zap.mp3`, `wave_clear.mp3`, `cannon.mp3`, `modal.mp3`, `build.mp3`) with dual-tier fallback to Web Audio synthesis.
- **Android APK v3.6.0**: Built, zipaligned, and signed with official Google `apksigner` supporting v1, v2, and v3 schemes (`TowerDefense_LastGrid_v3.6.0.apk`). Bundled 100% offline audio and graphics.

## [1.0.0] - 2026-11-18
### Added
- Complete release of Tower Defense: Last Grid.
- 10 Playable Maps with unique themes, waypoints, and modifiers.
- 5 Tower Archetypes with 3 upgrade tiers each (Pulse, Mortar, Cryo, Railgun, Beacon).
- 8 Enemy Archetypes (Grunt, Sprinter, Brute, Swarmling, Shieldbearer, Medic, Splitter, Phantom).
- 3 Boss Encounters with multi-phase mechanics (Juggernaut, Overseer, Hive Titan).
- 30 Configured Encounter Waves.
- 4 Targeting Modes: FIRST, LAST, STRONGEST, NEAREST with deterministic tie-breaking.
- Meta-progression Skill Tree with 15 persistent upgrade nodes across Offense, Economy, and Defense.
- 15 In-game Achievements with toast notifications.
- Complete UI flow: Main Menu, Map Select, Encyclopedia, Settings, Pause, HUD, Tower Panels, and Results Screen.
- Full localization in English, Uzbek, and Russian.
- Unit and integration tests with GUT v9.3.0.
- Headless Monte Carlo balance simulator.
- GitHub Actions CI/CD workflows and Web export deployment shell.
