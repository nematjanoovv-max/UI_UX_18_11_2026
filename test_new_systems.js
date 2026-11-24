const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.document = {
  getElementById: (id) => {
    return {
      id: id,
      width: 1280,
      height: 720,
      getContext: (type) => {
        if (type === '2d') {
          return {
            save: () => {},
            restore: () => {},
            translate: (x, y) => { global.__lastTranslate = { x, y }; },
            scale: () => {},
            rotate: () => {},
            clearRect: () => {},
            fillRect: () => {},
            strokeRect: () => {},
            rect: () => {},
            clip: () => {},
            fillText: () => {},
            beginPath: () => {},
            closePath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            roundRect: () => {},
            ellipse: () => {},
            createLinearGradient: () => ({ addColorStop: () => {} }),
            createRadialGradient: () => ({ addColorStop: () => {} }),
            setTransform: () => {},
            drawImage: () => {}
          };
        }
        return null;
      },
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 })
    };
  },
  createElement: (tag) => ({
    style: {},
    setAttribute: () => {},
    appendChild: () => {},
    removeChild: () => {},
    click: () => {}
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  addEventListener: () => {},
  removeEventListener: () => {}
};

Object.defineProperty(globalThis, "navigator", {
  value: {
    vibrate: () => {},
    clipboard: {
      writeText: (txt) => {
        global.__clipboard = txt;
        return Promise.resolve();
      }
    }
  },
  configurable: true
});

const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] !== undefined ? storage[k] : null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);

// Mock WebAudio API with vocoder inspection
global.AudioContext = class {
  constructor() {
    this.state = 'running';
    this.destination = {};
  }
  createGain() {
    return {
      gain: {
        value: 1,
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        linearRampToValueAtTime: () => {}
      },
      connect: () => {}
    };
  }
  createOscillator() {
    return {
      type: 'sawtooth',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createBiquadFilter() {
    return {
      type: 'bandpass',
      frequency: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      Q: { setValueAtTime: () => {} },
      connect: () => {}
    };
  }
};
global.webkitAudioContext = global.AudioContext;

// Load three.js and game.js
global.THREE = require('./libs/three.min.js');
const code = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');
eval(code);

console.log("--- STARTING RIGOROUS TESTS ---");

const engine = new window.LastGridEngine();
let passed = 0;
let total = 0;

function assert(condition, name) {
  total++;
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    console.error(`[FAIL] ${name}`);
    process.exit(1);
  }
}

// TEST 1: Vocoder synthesis calls
assert(typeof window.audio.megatronVoice === 'function', "SoundSynth.megatronVoice is defined");
['dash', 'ult', 'tank', 'biped', 'cannon', 'spawn'].forEach(v => {
  window.audio.megatronVoice(v);
});
assert(true, "SoundSynth.megatronVoice executes all vocoder phrases without throwing");

// TEST 2: Target priorities (WEAKEST & FLYERS_FIRST)
assert(engine.targetPriorities.includes('WEAKEST'), "targetPriorities includes WEAKEST");
assert(engine.targetPriorities.includes('FLYERS_FIRST'), "targetPriorities includes FLYERS_FIRST");

const mockTower = { type: 'pulse', x: 200, y: 200, priority: 'WEAKEST' };
engine.enemies = [
  { uid: 1, x: 220, y: 200, hp: 500, shield: 100, isFlyer: false, progress: 10 },
  { uid: 2, x: 210, y: 200, hp: 50, shield: 0, isFlyer: false, progress: 5 },
  { uid: 3, x: 215, y: 200, hp: 120, shield: 10, isFlyer: false, progress: 8 }
];
let targets = engine.findTargets(mockTower, 100);
assert(targets[0].uid === 2, "WEAKEST priority selects enemy with lowest total HP+shield (uid 2)");

mockTower.priority = 'FLYERS_FIRST';
engine.enemies = [
  { uid: 10, x: 220, y: 200, hp: 500, shield: 0, isFlyer: false, progress: 100 },
  { uid: 20, x: 210, y: 200, hp: 300, shield: 0, isFlyer: true, progress: 20 },
  { uid: 30, x: 215, y: 200, hp: 200, shield: 0, isFlyer: true, progress: 50 }
];
targets = engine.findTargets(mockTower, 100);
assert(targets[0].uid === 30, "FLYERS_FIRST prioritizes flyers and sorts by progress (uid 30)");

// TEST 3: Biome particles across cyber biome and graphics presets
engine.currentMapIndex = 0; // MAP 0 is cyber biome
engine.settings.graphicsQuality = 'LOW';
engine.biomeParticles = [];
engine.updateBiomeParticles(0.1);
assert(engine.biomeParticles.length > 0, "Cyber biome generates particles (cyber_rain)");
assert(engine.biomeParticles[0].type === 'cyber_rain', "Particle type is cyber_rain");

engine.biomeParticles = [];
engine.settings.graphicsQuality = 'LOW';
for (let i = 0; i < 50; i++) engine.updateBiomeParticles(0.016);
const lowCount = engine.biomeParticles.length;
assert(lowCount <= 12, `LOW preset caps particles at 12 (actual: ${lowCount})`);

engine.biomeParticles = [];
engine.settings.graphicsQuality = 'ULTRA';
for (let i = 0; i < 50; i++) engine.updateBiomeParticles(0.016);
const ultraCount = engine.biomeParticles.length;
assert(ultraCount > 24 && ultraCount <= 45, `ULTRA preset allows up to 45 particles (actual: ${ultraCount})`);

// TEST 4: Screen shake multiplier
engine.settings.screenShake = 0.0;
engine.screenShake = 10;
engine.render();
// With shake = 0.0, shake mult makes shakeX and shakeY = 0
assert(global.__lastTranslate && global.__lastTranslate.x === 0 && global.__lastTranslate.y === 0, "screenShake = 0 disables translation in render");

engine.settings.screenShake = 1.0;
engine.screenShake = 10;
engine.render();
assert(global.__lastTranslate && (global.__lastTranslate.x !== 0 || global.__lastTranslate.y !== 0), "screenShake = 1.0 enables full translation in render");

// TEST 5: Settings modal clicks
const mx = 180, my = 110;
const col1X = mx + 30; // 210
const col2X = mx + 480; // 660
// Test Screen Shake button click: 50% button
engine.handleSettingsClick(col1X + 200, my + 290);
assert(engine.settings.screenShake === 0.5, "Clicking 50% Screen Shake updates settings to 0.5");
assert(localStorage.getItem('lg_screen_shake') === '0.5', "Screen shake saved to localStorage");

// Test Graphics Quality button click: O'RTA button
engine.handleSettingsClick(col2X + 200, my + 290);
assert(engine.settings.graphicsQuality === 'MEDIUM', "Clicking O'RTA Graphics updates settings to MEDIUM");
assert(localStorage.getItem('lg_graphics_quality') === 'MEDIUM', "Graphics quality saved to localStorage");

// TEST 6: Save Data Export & Import
localStorage.setItem('lg_endless_wave', '42');
localStorage.setItem('last_grid_player_name', 'TestCommander');
engine.exportSaveData();
assert(global.__clipboard && global.__clipboard.includes('TestCommander') && global.__clipboard.includes('42'), "exportSaveData copies full JSON backup to clipboard");

global.prompt = () => JSON.stringify({
  last_grid_player_name: 'ImportedHero',
  lg_endless_wave: '99',
  lg_screen_shake: '0.0',
  lg_graphics_quality: 'LOW'
});
engine.importSaveData();
assert(localStorage.getItem('last_grid_player_name') === 'ImportedHero', "importSaveData restores player name");
assert(localStorage.getItem('lg_endless_wave') === '99', "importSaveData restores endless wave");
assert(engine.settings.screenShake === 0.0, "importSaveData updates live screenShake setting");
assert(engine.settings.graphicsQuality === 'LOW', "importSaveData updates live graphicsQuality setting");

// TEST 7: Megatron Ult and Transform
engine.startMission(0, 'CAMPAIGN');
assert(engine.hero.hp === 400, "Hero spawned with full HP");
engine.triggerHeroUlt();
assert(engine.hero.currentUltCd > 0, "triggerHeroUlt activates cooldown");
engine.toggleHeroTransform();
assert(engine.hero.mode === 'SIEGE', "toggleHeroTransform switches to SIEGE mode");
engine.toggleHeroTransform();
assert(engine.hero.mode === 'BIPED', "toggleHeroTransform switches back to BIPED mode");

console.log(`\nALL ${passed}/${total} TESTS PASSED WITH 100% SUCCESS!`);
process.exit(0);
