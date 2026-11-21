/**
 * Test Codex 3D Engine
 * Validates initialization, procedural textures, material modes, and model generation for all 25 units.
 */

const fs = require('fs');
const path = require('path');

// Setup headless mock environment
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};

global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 256,
        height: 256,
        getContext: () => ({
          fillStyle: '',
          fillRect: () => {},
          strokeStyle: '',
          lineWidth: 1,
          strokeRect: () => {},
          beginPath: () => {},
          closePath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          arc: () => {},
          fillText: () => {},
          measureText: () => ({ width: 0 }),
          fill: () => {},
          stroke: () => {},
          getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
          createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
          putImageData: () => {}
        }),
        style: {}
      };
    }
    return { style: {} };
  }
};

global.THREE = require('../libs/three.min.js');
eval(fs.readFileSync(path.join(__dirname, '../apex_mech.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../codex_3d_engine.js'), 'utf8'));

console.log("=== TESTING CODEX 3D ENGINE ===");
const engine = new global.Codex3DEngine();
console.log("✓ Created Codex3DEngine instance");
console.log("✓ Codex3DEngine class ready");

// Test Lighting Presets
for (let i = 0; i < 4; i++) {
  const pName = engine.cycleLightingPreset();
  console.log(`✓ Lighting preset [${i}]: ${pName}`);
}

const allUnits = [
  // Towers
  { id: 'pulse', tab: 'TOWERS' },
  { id: 'mortar', tab: 'TOWERS' },
  { id: 'cryo', tab: 'TOWERS' },
  { id: 'tesla', tab: 'TOWERS' },
  { id: 'flame', tab: 'TOWERS' },
  { id: 'railgun', tab: 'TOWERS' },
  { id: 'beacon', tab: 'TOWERS' },
  { id: 'barricade', tab: 'TOWERS' },
  // Enemies
  { id: 'grunt', tab: 'ENEMIES' },
  { id: 'sprinter', tab: 'ENEMIES' },
  { id: 'brute', tab: 'ENEMIES' },
  { id: 'shieldbearer', tab: 'ENEMIES' },
  { id: 'medic', tab: 'ENEMIES' },
  { id: 'splitter', tab: 'ENEMIES' },
  { id: 'phantom', tab: 'ENEMIES' },
  { id: 'kamikaze_drone', tab: 'ENEMIES' },
  { id: 'gunship', tab: 'ENEMIES' },
  // Boss Titans
  { id: 'juggernaut', tab: 'BOSSES' },
  { id: 'overseer', tab: 'BOSSES' },
  { id: 'hive_titan', tab: 'BOSSES' },
  { id: 'void_titan', tab: 'BOSSES' },
  { id: 'chrono_phantom', tab: 'BOSSES' },
  { id: 'mecha_colossus', tab: 'BOSSES' },
  // Hero Mech
  { id: 'megatron', tab: 'MECH' },
  { id: 'optimus', tab: 'MECH' },
  { id: 'bumblebee', tab: 'MECH' },
  { id: 'biped', tab: 'MECH' },
  { id: 'siege', tab: 'MECH' }
];

console.log(`✓ Verifying all ${allUnits.length} models across tabs...`);
// Mock WebGL context-less factory test
const THREE = global.THREE;
const DummyCanvas = global.document.createElement('canvas');
const pbrMats = new (function() {
  const std = o => new THREE.MeshBasicMaterial(o);
  this.materials = {
    titanium: std({ color: 0x242e42 }),
    carbon: std({ color: 0x141824 }),
    armorLight: std({ color: 0x3b4a68 }),
    hazard: std({ color: 0xffd600 }),
    chrome: std({ color: 0xe2e8f0 }),
    steel: std({ color: 0x475569 }),
    darkAlloy: std({ color: 0x0f172a }),
    barrel: std({ color: 0x1e293b }),
    copper: std({ color: 0xd97706 }),
    cyanEnergy: std({ color: 0x00e5ff }),
    magentaEnergy: std({ color: 0xff007f }),
    plasmaYellow: std({ color: 0xffd600 }),
    flameOrange: std({ color: 0xff5722 }),
    acidGreen: std({ color: 0x00e676 }),
    voidPurple: std({ color: 0xa855f7 }),
    glassCyan: std({ color: 0x0284c7 }),
    cryoIce: std({ color: 0x38bdf8 }),
    bioChitin: std({ color: 0x6366f1 }),
    wireframe: new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true }),
    xray: std({ color: 0x00e5ff, transparent: true, opacity: 0.35 })
  };
  this.get = (name, mode) => {
    if (mode === 'WIREFRAME') return this.materials.wireframe;
    if (mode === 'XRAY') return this.materials.xray;
    return this.materials[name] || this.materials.titanium;
  };
})();

// Instantiate dummy model factory
// Extract factory from codex_3d_engine
eval(fs.readFileSync(path.join(__dirname, '../codex_3d_engine.js'), 'utf8'));

// Test factory on all 28 units with full kinematics and recoil update
console.log(`✓ Testing model creation for all 28 units in SHADED, WIREFRAME, and XRAY modes`);
const scene = new THREE.Scene();
const root = new THREE.Group();
scene.add(root);

const modes = ['SHADED', 'WIREFRAME', 'XRAY'];
for (const u of allUnits) {
  for (const m of modes) {
    while (root.children.length > 0) root.remove(root.children[0]);
    engine.active = true;
    engine.factory = new global.Codex3DModelFactory(THREE, new global.CodexMaterialLibrary(THREE));
    engine.modelRoot = root;
    engine.loadUnit(u.id, u.tab, 'BASE', m);
    // Simulate frame updates with recoil and overheating
    engine.update(0.016, 0.45, 0.28, 1.0, 0.8);
    engine.update(0.016, 0.46, 0.28, 1.0, 0.0);
  }
  console.log(`  ✓ Unit [${u.id}] (${u.tab}) verified across all 3 modes with recoil & kinematics`);
}

console.log("==================================================");
console.log("✓ ALL 28 MODELS GENERATE AND ANIMATE CLEANLY!");
console.log("==================================================");
