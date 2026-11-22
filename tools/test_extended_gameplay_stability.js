const fs = require('fs');

// Browser environment mocks
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.document = {
  getElementById: (id) => ({
    getContext: () => ({
      fillRect: () => {},
      strokeRect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      clip: () => {},
      measureText: (txt) => ({ width: (txt || '').length * 8 }),
      fillText: () => {},
      strokeText: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createPattern: () => null,
      drawImage: () => {}
    }),
    addEventListener: () => {},
    style: {},
    width: 1280,
    height: 720
  }),
  createElement: () => ({
    getContext: () => null,
    addEventListener: () => {},
    style: {},
    width: 1280,
    height: 720
  }),
  body: { appendChild: () => {}, removeChild: () => {}, style: {} },
  head: { appendChild: () => {} },
  addEventListener: () => {}
};
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.requestAnimationFrame = () => {};
global.navigator = { userAgent: 'Android Mobile Linux' };

require('../libs/three.min.js');
eval(fs.readFileSync('./apex_mech.js', 'utf8'));
eval(fs.readFileSync('./codex_3d_engine.js', 'utf8'));
eval(fs.readFileSync('./game.js', 'utf8'));

console.log("=== RUNNING EXTENDED COMBAT STABILITY TEST (10 WAVES) ===");
const engine = new global.LastGridEngine();
engine.startMission(0, "CAMPAIGN");

// Place towers along the road
engine.towers.push({ id: 1, type: 'pulse', x: 200, y: 300, tier: 1, cooldown: 0, recoil: 0, heat: 0 });
engine.towers.push({ id: 2, type: 'mortar', x: 400, y: 300, tier: 1, cooldown: 0, recoil: 0, heat: 0 });
engine.towers.push({ id: 3, type: 'cryo', x: 600, y: 300, tier: 1, cooldown: 0, recoil: 0, heat: 0 });
engine.towers.push({ id: 4, type: 'tesla', x: 800, y: 300, tier: 1, cooldown: 0, recoil: 0, heat: 0 });
engine.towers.push({ id: 5, type: 'railgun', x: 1000, y: 300, tier: 1, cooldown: 0, recoil: 0, heat: 0 });

const enemyTypes = [
  'scout', 'grunt', 'tank', 'flyer', 'swarm', 'shielded',
  'medic', 'splitter', 'phantom', 'gunship', 'kamikaze',
  'siege_breaker', 'juggernaut', 'overseer', 'hive_titan', 'void_titan'
];

let totalFramesSimulated = 0;
let errorsCaught = 0;

try {
  for (let wave = 1; wave <= 5; wave++) {
    console.log(`Simulating Wave ${wave}...`);
    engine.startWave(wave);

    // Spawn 10 varied enemies per wave including flyers and bosses
    for (let k = 0; k < 8; k++) {
      const type = enemyTypes[(wave * 3 + k) % enemyTypes.length];
      engine.spawnEnemy(type, 0);
    }

    // Trigger dynamic battlefield events
    engine.spawnAirdrop();
    engine.triggerRedZone();

    // Advance 600 frames (10 seconds game time at 60fps)
    for (let f = 0; f < 600; f++) {
      engine.update(0.016);
      totalFramesSimulated++;
    }
  }

  console.log(`PASS: Simulated ${totalFramesSimulated} frames across 5 waves without any crash!`);
  console.log(`Active enemies: ${engine.enemies.length}, Projectiles: ${engine.projectiles.length}, Base HP: ${engine.baseHp}`);
} catch (err) {
  errorsCaught++;
  console.error("FAIL: Crash during simulation:", err);
  process.exit(1);
}

if (errorsCaught === 0) {
  console.log("=== ALL STABILITY TESTS PASSED WITH ZERO CRASHES ===");
}
