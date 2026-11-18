# Game Design Document (GDD) — Tower Defense: Last Grid

## 1. Game Overview
- **Title**: Tower Defense: Last Grid
- **Genre**: 2D Grid-based Tower Defense / Tactical Strategy
- **Target Platforms**: Web (HTML5), Desktop (Windows), Mobile (Android)
- **Target Resolution**: 1280x720 base viewport (landscape, expand aspect ratio)
- **Visual Style**: Cyberpunk neon-on-dark grid aesthetics, high contrast, clean vector/pixel lines.

## 2. Core Gameplay Loop
1. **Selection & Preparation**:
   - Player selects Map and Difficulty in the Main Menu / Map Select screen.
   - Enter Battlefield in **Build Phase** (15s countdown or wait for user input on Wave 1).
   - Inspect route, starting gold (default 250g), and placement grid (64x64px cells).
2. **Tower Deployment & Tactics**:
   - Place towers onto valid buildable grid cells (cannot place on paths, spawns, or base).
   - Select targeting priority for each attacking tower: `FIRST`, `LAST`, `STRONGEST`, `NEAREST`.
   - Upgrade towers (Tiers 1 -> 2 -> 3) or sell (70% gold refund).
3. **Wave Combat**:
   - Enemies spawn from map spawn points and traverse waypoint polylines strictly.
   - Towers engage enemies within range using specific projectile types (bullets, mortar shells, beam hitscan, slowing cones).
   - Destroy enemies to earn bounty gold and score.
4. **Wave Resolution**:
   - Clearing all wave enemies awards wave clear bonus (`25 + 2 * wave`) and begins the next build phase.
   - Enemies reaching base deal damage to Base HP (default 20 HP).
   - Base HP <= 0 results in **Defeat**.
   - Surviving the final wave (Wave 10, 12, 15, 20, 25, or 30 depending on map) results in **Victory**.
5. **Meta-Progression**:
   - Earn **Research Points (RP)** from waves cleared, stars earned, and boss kills.
   - Unlock permanent upgrades in the 3-branch **Skill Tree** (Offense, Economy, Defense).

## 3. Damage & Armor Mechanics
- **Damage Types**:
  - `KINETIC`: Full armor reduction (1.0x).
  - `EXPLOSIVE`: Half armor reduction (0.5x), deals area splash damage with linear falloff.
  - `ENERGY`: Completely ignores armor (0.0x), deals 1.5x damage against shields.
  - `PIERCE`: 0.25x armor reduction, pierces multiple targets in a line.
- **Armor Formula**:
  $$\text{effective\_armor} = \text{armor} \times \text{armor\_mult}[\text{type}]$$
  $$\text{damage\_dealt} = \max(\text{raw\_damage} - \text{effective\_armor}, \text{raw\_damage} \times 0.20)$$
  *Note: A strict 20% minimum damage floor guarantees no enemy is entirely immune.*

## 4. Towers (5 Archetypes)
1. **Pulse Tower** (Kinetic): Fast firing, anti-swarm, low cost (100g).
2. **Mortar Tower** (Explosive): Long range, slow firing, ground-only area splash (150g).
3. **Cryo Tower** (Energy): Chilling aura, slows target speed by 35%-55% (120g).
4. **Railgun Tower** (Pierce): High-damage piercing hitscan sniper beam (250g).
5. **Beacon Tower** (Support): Buffs damage, range, and fire rate of adjacent towers (180g).

## 5. Enemies (8 Archetypes) & Bosses (3)
- **Grunt**: Standard balanced baseline infantry.
- **Sprinter**: High speed, low health scout.
- **Brute**: Heavy armored juggernaut unit.
- **Swarmling**: Fragile, high spawn count unit.
- **Shieldbearer**: Regenerating energy shield.
- **Medic**: Healing aura for surrounding allies.
- **Splitter**: Splits into 2 swarmlings on death.
- **Phantom**: Periodically phases out of targetability.
- **Bosses**:
  - `Juggernaut` (Wave 10): Slow cap resistance, splash resistance.
  - `Overseer` (Wave 20): Summons sprinters, armor pulse shield.
  - `Hive Titan` (Wave 30): 3 combat phases, spawns splitters, enrage speed buff.

## 6. Controls & Accessibility
- Full mouse, touch, and keyboard support.
- Fully rebindable keys and gamepad navigation support.
- Color-blind safe iconography and high-contrast outlines.
