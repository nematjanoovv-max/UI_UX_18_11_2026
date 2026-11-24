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

const drawnTexts = [];
const dummyCtx = {
  textAlign: "left",
  font: "12px monospace",
  fillStyle: "#fff",
  strokeStyle: "#fff",
  lineWidth: 1,
  shadowColor: "transparent",
  shadowBlur: 0,
  setTransform: () => {},
  clearRect: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  save() { this._savedAlign = this.textAlign; },
  restore() { if (this._savedAlign !== undefined) this.textAlign = this._savedAlign; },
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
  fillText(text, x, y) {
    drawnTexts.push({ text: String(text), x, y, align: this.textAlign, font: this.font });
  },
  measureText(text) {
    // Approx 8px per char in 13px Segoe UI
    return { width: String(text).length * 8.5 };
  },
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

console.log("=== TESTING CYBER-AUGMENT DRAFT MODAL REFACTOR ===");
const engine = new window.LastGridEngine();
engine.lang = 'uz';
engine.state = 'DRAFT';

// Set exact 3 cards from user's screenshot:
engine.draftCards = [
  { id: "bounty_hunter", title: "BOUNTY HUNTER", desc: "+30% Gold bounty from all kills, but enemies move +10% faster.", icon: "🪙", color: "#ffd600" },
  { id: "tesla_overcharge", title: "TESLA OVERCHARGE", desc: "Tesla Coil arcs to +3 extra targets, and EMP shockwaves inflict 2.5x stun.", icon: "⚡", color: "#ffd600" },
  { id: "titan_slayer", title: "TITAN SLAYER", desc: "All towers deal +45% extra damage to Bosses and heavy Brutes.", icon: "⚔️", color: "#ff1744" }
];

drawnTexts.length = 0;
engine.renderDraftModal();

console.log(`Rendered ${drawnTexts.length} text elements in DRAFT modal.`);

// Verify titles and descriptions
const renderedCards = [];
for (let i = 0; i < 3; i++) {
  const cx = 100 + i * 380;
  const cw = 320;
  const cardCenterX = cx + cw / 2; // 260, 640, 1020

  const cardTexts = drawnTexts.filter(t => Math.abs(t.x - cardCenterX) < 5 || (t.x >= cx && t.x <= cx + cw));
  console.log(`\nCard ${i + 1} (cx=${cx}, center=${cardCenterX}):`);
  cardTexts.forEach(t => console.log(`  [${t.align}] (x=${t.x}, y=${t.y}): "${t.text}"`));

  // Assert that NO description text is drawn at x < cx or x > cx + cw
  const outOfBounds = drawnTexts.filter(t => {
    // If it's part of this card's y-range (y between 170 and 590)
    if (t.y >= 170 && t.y <= 590) {
      if (t.align === "center") {
        const halfW = (t.text.length * 8.5) / 2;
        const leftEdge = t.x - halfW;
        const rightEdge = t.x + halfW;
        if (Math.abs(t.x - cardCenterX) < 10) {
          return leftEdge < cx || rightEdge > (cx + cw);
        }
      }
    }
    return false;
  });

  if (outOfBounds.length > 0) {
    console.error("OVERFLOW DETECTED:", outOfBounds);
    throw new Error(`Card ${i + 1} text overflows card boundary!`);
  }
}

// Check Uzbek Translations
const title1 = engine.getAugmentTitle(engine.draftCards[0]);
const desc1 = engine.getAugmentDesc(engine.draftCards[0]);
console.log("\nUzbek card 1 title:", title1);
console.log("Uzbek card 1 desc:", desc1);

if (title1 !== "KALLA OVCHISI") throw new Error(`Expected KALLA OVCHISI, got ${title1}`);
if (!desc1.includes("oltin")) throw new Error(`Expected Uzbek description, got ${desc1}`);

// Check Russian Translations
engine.lang = 'ru';
const title1Ru = engine.getAugmentTitle(engine.draftCards[0]);
const desc1Ru = engine.getAugmentDesc(engine.draftCards[0]);
console.log("Russian card 1 title:", title1Ru);
if (title1Ru !== "ОХОТНИК ЗА ГОЛОВАМИ") throw new Error(`Expected Russian title, got ${title1Ru}`);

console.log("\nALL DRAFT MODAL AND TEXT WRAPPING TESTS PASSED (0 ERRORS)!");
process.exit(0);
