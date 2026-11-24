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
  createLinearGradient: () => ({ addColorStop: () => {} })
};
const rawGL = {
  canvas: { width: 1280, height: 720 },
  getExtension: () => null,
  getParameter: () => 16,
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
global.navigator = { vibrate: () => {}, userAgent: "NodeTest" };

require("./apex_mech.js");
require("./codex_3d_engine.js");
const gameCode = fs.readFileSync("./game.js", "utf8");
eval(gameCode);

console.log("Instantiating LastGridEngine for Settings Modal verification...");
const engine = new window.LastGridEngine();

console.log("Testing renderSettingsModal()...");
engine.showSettingsModal = true;
engine.renderSettingsModal();
console.log("renderSettingsModal() rendered successfully without errors!");

const mx = 180;
const my = 110;
const col1X = mx + 30; // 210
const col2X = mx + 480; // 660

console.log("Testing handleSettingsClick on Screen Fit...");
engine.handleSettingsClick(col2X + 250, my + 115); // FILL
if (engine.settings.screenFit !== 'FILL') throw new Error("ScreenFit FILL failed");
engine.handleSettingsClick(col2X + 50, my + 115); // FIT
if (engine.settings.screenFit !== 'FIT') throw new Error("ScreenFit FIT failed");

console.log("Testing handleSettingsClick on CRT Scanlines...");
engine.handleSettingsClick(col2X + 50, my + 165); // CRT on
if (!engine.crtEnabled) throw new Error("CRT on failed");
engine.handleSettingsClick(col2X + 250, my + 165); // CRT off
if (engine.crtEnabled) throw new Error("CRT off failed");

console.log("Testing handleSettingsClick on Haptics & FPS...");
engine.handleSettingsClick(col1X + 50, my + 240); // Haptics on
if (!engine.settings.haptics) throw new Error("Haptics on failed");
engine.handleSettingsClick(col1X + 250, my + 240); // Haptics off
if (engine.settings.haptics) throw new Error("Haptics off failed");

engine.handleSettingsClick(col2X + 250, my + 240); // 30 FPS
if (engine.settings.fpsLimit !== 30) throw new Error("FPS 30 failed");
engine.handleSettingsClick(col2X + 50, my + 240); // 60 FPS
if (engine.settings.fpsLimit !== 60) throw new Error("FPS 60 failed");

console.log("Testing handleSettingsClick on Screen Shake & Graphics...");
engine.handleSettingsClick(col1X + 50, my + 290); // 100% Shake
if (engine.settings.screenShake !== 1.0) throw new Error("Shake 100% failed");
engine.handleSettingsClick(col1X + 200, my + 290); // 50% Shake
if (engine.settings.screenShake !== 0.5) throw new Error("Shake 50% failed");
engine.handleSettingsClick(col1X + 350, my + 290); // 0% Shake
if (engine.settings.screenShake !== 0.0) throw new Error("Shake 0% failed");

engine.handleSettingsClick(col2X + 50, my + 290); // ULTRA Graphics
if (engine.settings.graphicsQuality !== 'ULTRA') throw new Error("Gfx ULTRA failed");
engine.handleSettingsClick(col2X + 200, my + 290); // MEDIUM Graphics
if (engine.settings.graphicsQuality !== 'MEDIUM') throw new Error("Gfx MEDIUM failed");
engine.handleSettingsClick(col2X + 350, my + 290); // LOW Graphics
if (engine.settings.graphicsQuality !== 'LOW') throw new Error("Gfx LOW failed");

console.log("Testing handleSettingsClick on Centered Languages...");
engine.handleSettingsClick(400, my + 370); // UZ
if (engine.lang !== 'uz') throw new Error("Lang UZ failed");
engine.handleSettingsClick(600, my + 370); // EN
if (engine.lang !== 'en') throw new Error("Lang EN failed");
engine.handleSettingsClick(800, my + 370); // RU
if (engine.lang !== 'ru') throw new Error("Lang RU failed");

console.log("Testing handleSettingsClick on Save & Close...");
engine.handleSettingsClick(col1X + 100, my + 440); // Save & Close
if (engine.showSettingsModal !== false) throw new Error("Save & Close failed to close modal");

console.log("Testing handleSettingsClick on Main Menu button...");
engine.showSettingsModal = true;
engine.state = 'PLAYING';
engine.handleSettingsClick(col2X + 100, my + 440); // Exit to Main Menu
if (engine.showSettingsModal !== false) throw new Error("Main Menu button failed to close modal");
if (engine.state !== 'MENU') throw new Error("Main Menu button failed to switch to MENU state");

console.log("ALL SETTINGS MODAL AND CLICK TESTS PASSED PERFECTLY (0 ERRORS)!");
process.exit(0);
