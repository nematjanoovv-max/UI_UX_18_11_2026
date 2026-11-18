# Changelog

All notable changes to **Tower Defense: Last Grid** will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

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
