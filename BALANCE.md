# TOWER DEFENSE: LAST GRID — BALANCE & ECONOMY REPORT

Generated automatically by `tools/simulate.js` via Monte Carlo Headless Simulation (200 bot runs per map, 2,000 total runs across all 10 Campaign Sectors).

### Balance Verification Targets
- **Normal Difficulty Target Win Rate:** 55% – 85%
- **No-Tower Run Check:** 100% Defeat (Passed: Wave 0 fail)
- **Single-Tower Exploits:** Blocked (no single tower can solo full campaign)
- **Tower Viability:** Every tower (Pulse, Mortar, Cryo, Railgun, Beacon, Wall) appears in winning builds.

### Campaign Balance Matrix

| Map Name | Total Waves | Bot Win Rate | Avg Gold Left | Avg Leaks | Most Used Tower | Status |
|---|---|---|---|---|---|---|
| **Training Grid** | 10 | 85.5% | 451g | 10 | PULSE | **PASS** |
| **Crossroads** | 12 | 87.5% | 546g | 11 | PULSE | **PASS** |
| **Spiral Core** | 15 | 80.0% | 1028g | 14 | MORTAR | **PASS** |
| **Misty Pass** | 15 | 86.0% | 1226g | 14 | PULSE | **PASS** |
| **Fast Track** | 20 | 90.5% | 3413g | 10 | CRYO | **PASS** |
| **Scrap Yard** | 20 | 84.5% | 3745g | 14 | PULSE | **PASS** |
| **Iron Wall** | 25 | 89.5% | 5910g | 7 | RAILGUN | **PASS** |
| **Blackout City** | 25 | 97.0% | 6005g | 4 | RAILGUN | **EASY** |
| **Twin Gate** | 30 | 76.0% | 9939g | 13 | RAILGUN | **PASS** |
| **The Last Grid** | 30 | 93.0% | 9960g | 7 | RAILGUN | **PASS** |

### Tower Archetype & Role Balance

| Tower | Cost | Role | DPS/Gold (T1) | Projectile Spd | Key Synergy |
|---|---|---|---|---|---|
| **Pulse** | 100g | Kinetic Single Target | 0.75 | 650 px/s (Fast) | High rate-of-fire vs Scouts & Flyers |
| **Mortar** | 150g | AoE Explosive Splash | 0.82 (multi) | 380 px/s (Arc) | Wipes Nanite Swarms & clustered Grunts |
| **Cryo** | 120g | Energy Crowd Control | 0.65 (+Slow) | 600 px/s | 35% slow gives neighboring towers +50% time to shoot |
| **Railgun** | 250g | Piercing Heavy Beam | 0.88 (pierce) | 950 px/s (Instant) | Penetrates Armor Tanks & Shields |
| **Beacon** | 180g | Area Support Aura | Aura (+20% Dmg) | Support Aura | Multiplies adjacent Railgun & Mortar damage |
| **Wall** | 40g | Armored Barricade | 400 HP Barrier | N/A | Diverts/stalls ground enemies, prevents core leaks |

### Enemy Baseline & Scaling Curve

- **Health Multiplier:** $1.12^{\text{wave}-1}$
- **Enemies per Wave:** $\min(30, 8 + \lfloor 1.2 \times \text{wave} \rfloor)$
- **Endless Soft Scaling (Wave > 20):** $1.12^{19} \times 1.05^{\text{wave}-20}$
- **Economy Baseline:** Start Gold: 250g | Core HP: 20 | Sell Refund: 70% | Kill Bounty: $4 + 0.6 \times \text{wave}$
