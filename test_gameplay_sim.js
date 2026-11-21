
const fs = require("fs");
const THREE = require("./libs/three.min.js");
global.THREE = THREE;
global.window = {
  innerWidth: 1280,
  innerHeight: 720,
  devicePixelRatio: 1,
  addEventListener: () => {},
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
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
global.document = {
  createElement: (tag) => {
    return {
      getContext: () => ({
        setTransform: () => {},
        clearRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        beginPath: () => {},
        arc: () => {},
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
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createLinearGradient: () => ({ addColorStop: () => {} }),
      }),
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  },
  getElementById: () => null,
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.navigator = { userAgent: "Node" };

require("./apex_mech.js");
require("./codex_3d_engine.js");
const gameCode = fs.readFileSync("./game.js", "utf8");
eval(gameCode);

const game = new LastGridEngine();
game.init();
console.log("Game initialized. Selecting Map 0...");
game.selectMap(0);
console.log("Starting wave 1...");
game.startWave(1);

// Build some towers
game.towers.push({
  id: 1, type: "pulse", tier: 1, x: 200, y: 300, cooldown: 0, range: 140, rate: 2, dmg: 15, recoil: 0
});
game.towers.push({
  id: 2, type: "flame", tier: 1, x: 260, y: 300, cooldown: 0, range: 120, rate: 5, dmg: 8, recoil: 0
});
game.towers.push({
  id: 3, type: "mortar", tier: 1, x: 320, y: 300, cooldown: 0, range: 200, rate: 0.8, dmg: 45, recoil: 0
});

console.log("Simulating 120 seconds of gameplay (7200 steps at dt=0.016)...");
const startTime = Date.now();
for (let frame = 0; frame < 7200; frame++) {
  game.update(0.016);
  if (frame % 3600 === 0) {
    console.log(`Frame ${frame}: wave=${game.wave}, enemies=${game.enemies.length}, projectiles=${game.projectiles.length}, particles=${game.particles.length}`);
  }
}
const elapsed = Date.now() - startTime;
console.log(`Simulation finished in ${elapsed}ms. State: wave=${game.wave}, enemies=${game.enemies.length}, projectiles=${game.projectiles.length}`);
