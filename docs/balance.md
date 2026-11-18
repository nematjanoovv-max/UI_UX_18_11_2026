# Balance & Economy Reference — Tower Defense: Last Grid

## 1. Tower Progression & Efficiency Table

| Tower | Tier | Cost | Total Inv. | Dmg | Rate (/s) | Range (px) | DPS | Cost / DPS | Special / Area |
|---|---|---|---|---|---|---|---|---|---|
| **Pulse** | 1 | 100g | 100g | 12 | 4.0 | 140 | 48.0 | 2.08 | Cheap, rapid response |
| | 2 | 80g | 180g | 18 | 5.0 | 150 | 90.0 | 2.00 | High single-target DPS |
| | 3 | 160g | 340g | 26 | 6.0 | 160 | 156.0 | 2.18 | Anti-swarm powerhouse |
| **Mortar** | 1 | 150g | 150g | 45 | 0.8 | 200 | 36.0 | 4.16 | Splash radius 60px |
| | 2 | 120g | 270g | 70 | 0.9 | 215 | 63.0 | 4.28 | Splash radius 70px |
| | 3 | 240g | 510g | 105 | 1.0 | 230 | 105.0 | 4.85 | Splash radius 85px |
| **Cryo** | 1 | 120g | 120g | 4 | 2.0 | 120 | 8.0 | — | 35% slow for 2s |
| | 2 | 90g | 210g | 6 | 2.0 | 130 | 12.0 | — | 45% slow for 2s |
| | 3 | 180g | 390g | 9 | 2.0 | 140 | 18.0 | — | 55% slow + 15% freeze |
| **Railgun** | 1 | 250g | 250g | 140 | 0.5 | 360 | 70.0 | 3.57 | Pierce 1 enemy |
| | 2 | 200g | 450g | 220 | 0.55 | 390 | 121.0 | 3.71 | Pierce 2 enemies |
| | 3 | 400g | 850g | 340 | 0.6 | 420 | 204.0 | 4.16 | Pierce 3 enemies |
| **Beacon** | 1 | 180g | 180g | — | — | 130 | — | — | +15% dmg, +10% range aura |
| | 2 | 140g | 320g | — | — | 145 | — | — | +25% dmg, +15% range aura |
| | 3 | 280g | 600g | — | — | 160 | — | — | +35% dmg, +20% range, +10% rate |

## 2. Enemy Base Stats & Effective Health (EHP)

| Enemy ID | Base HP | Shield | Armor | Speed (px/s) | Kinetic EHP | Explosive EHP | Energy EHP | Pierce EHP | Bounty |
|---|---|---|---|---|---|---|---|---|---|
| `grunt` | 100 | 0 | 0 | 60 | 100 | 100 | 100 | 100 | 5g |
| `sprinter` | 60 | 0 | 0 | 110 | 60 | 60 | 60 | 60 | 6g |
| `brute` | 400 | 0 | 8 | 40 | 432 | 416 | 400 | 408 | 15g |
| `swarmling` | 25 | 0 | 0 | 80 | 25 | 25 | 25 | 25 | 2g |
| `shieldbearer` | 200 | 150 | 2 | 55 | 352 | 351 | 300 | 350.5 | 14g |
| `medic` | 150 | 0 | 0 | 50 | 150 | 150 | 150 | 150 | 18g |
| `splitter` | 250 | 0 | 3 | 55 | 257.5 | 253.7 | 250 | 251.8 | 12g |
| `phantom` | 180 | 0 | 0 | 75 | 180 | 180 | 180 | 180 | 16g |

## 3. Wave Scaling Formula
- Enemy Wave Health Multiplier:
  $$\text{wave\_hp\_mult}(w) = 1.0 + 0.10 \times (w - 1) + 0.004 \times (w - 1)^2$$
  - Wave 1: 1.00x
  - Wave 10: 2.22x
  - Wave 20: 4.34x
  - Wave 30: 7.26x
- Bounty Scaling:
  $$\text{bounty}(w) = \text{round}(\text{base\_bounty} \times (1 + 0.03 \times (w - 1)))$$
- Wave Clear Gold Bonus:
  $$\text{bonus} = 25 + 2 \times w$$
