const fs = require("fs");
const THREE = require("./libs/three.min.js");
global.THREE = THREE;
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.window = {
  innerWidth: 1280,
  innerHeight: 720,
  devicePixelRatio: 1,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: global.requestAnimationFrame,
  cancelAnimationFrame: global.cancelAnimationFrame,
  AudioContext: function() {
    return {
      state: "running",
      resume: () => Promise.resolve(),
      createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
      createBufferSource: () => ({ connect: () => {}, start: () => {}, stop: () => {} }),
      createGain: () => ({ connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }),
      createBiquadFilter: () => ({ connect: () => {}, frequency: { setValueAtTime: () => {} } }),
      destination: {}
    };
  }
};
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] || null; },
  setItem(k, v) { this._data[k] = String(v); },
  removeItem(k) { delete this._data[k]; }
};
const dummyCtx = {
  setTransform: () => {},
  clearRect: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  save: () => {},
  restore: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  beginPath: () => {},
  arc: () => {},
  ellipse: () => {},
  fill: () => {},
  stroke: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  rect: () => {},
  roundRect: () => {},
  clip: () => {},
  fillText: () => {},
  measureText: () => ({ width: 50 }),
  drawImage: () => {},
  setLineDash: () => {},
  createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  putImageData: () => {},
  createRadialGradient: () => ({ addColorStop: () => {} }),
  createLinearGradient: () => ({ addColorStop: () => {} }),
  canvas: { width: 1280, height: 720 }
};
const rawGL = {
  canvas: { width: 1280, height: 720 },
  getParameter: () => '',
  getExtension: () => null,
  getShaderParameter: () => true,
  getProgramParameter: () => true,
  createShader: () => ({}),
  createProgram: () => ({}),
  createBuffer: () => ({}),
  createTexture: () => ({})
};
const dummyWebGL = new Proxy(rawGL, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return () => 0;
  }
});
global.document = {
  createElement: (tag) => ({
    getContext: (type) => (type && type.includes('webgl')) ? dummyWebGL : dummyCtx,
    style: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    width: 1280,
    height: 720
  }),
  getElementById: (id) => ({
    getContext: (type) => (type && type.includes('webgl')) ? dummyWebGL : dummyCtx,
    style: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    width: 1280,
    height: 720
  }),
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.navigator = { userAgent: "Node", vibrate: () => {} };

require("./apex_mech.js");
require("./codex_3d_engine.js");
const gameCode = fs.readFileSync("./game.js", "utf8");
eval(gameCode);

const game = new window.LastGridEngine();
console.log("Game initialized. Selecting Map 0...");
game.startMission(0, 'CAMPAIGN');
console.log("Starting wave 1...");
game.startWave(1);

// Build some towers
game.buildTower('pulse', 2, 2);
game.buildTower('flame', 3, 2);
game.buildTower('mortar', 4, 2);

console.log("Simulating 60 seconds of gameplay (3600 steps at dt=0.016)...");
const startTime = Date.now();
for (let frame = 0; frame < 3600; frame++) {
  game.update(0.016);
  if (frame % 1200 === 0) {
    console.log(`Frame ${frame}: wave=${game.wave}, enemies=${game.enemies.length}, projectiles=${game.projectiles.length}, particles=${game.particles.length}`);
  }
}
const elapsed = Date.now() - startTime;
console.log(`Simulation finished in ${elapsed}ms. State: wave=${game.wave}, enemies=${game.enemies.length}, projectiles=${game.projectiles.length}`);
process.exit(0);
