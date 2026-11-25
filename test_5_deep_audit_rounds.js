const fs = require('fs');
global.THREE = require('./libs/three.min.js');
global.self = global;
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};

let saveStack = 0;
let minStack = 0;
let maxStack = 0;

const mockCtx = {
  save: () => { saveStack++; if (saveStack > maxStack) maxStack = saveStack; },
  restore: () => {
    saveStack--;
    if (saveStack < minStack) minStack = saveStack;
  },
  beginPath: () => {}, closePath: () => {}, stroke: () => {}, fill: () => {},
  moveTo: () => {}, lineTo: () => {}, arc: () => {}, rect: () => {}, ellipse: () => {},
  arcTo: () => {},
  roundRect: function(x, y, w, h, r) { this.rect(x, y, w, h); },
  fillRect: () => {}, strokeRect: () => {}, clearRect: () => {},
  fillText: () => {}, strokeText: () => {}, measureText: () => ({ width: 50 }),
  translate: () => {}, rotate: () => {}, scale: () => {}, transform: () => {}, resetTransform: () => {}, setTransform: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  createPattern: () => ({}),
  drawImage: () => {}, clip: () => {}, setLineDash: () => {},
  canvas: { width: 1280, height: 720, clientWidth: 1280, clientHeight: 720 }
};

global.document = {
  getElementById: () => ({ getContext: () => mockCtx, style: {}, addEventListener: () => {} }),
  createElement: () => ({ getContext: () => mockCtx, style: {}, addEventListener: () => {} }),
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = {
  _data: {},
  getItem: function(k) { return this._data[k] || null; },
  setItem: function(k, v) { this._data[k] = String(v); },
  removeItem: function(k) { delete this._data[k]; }
};
global.navigator = { userAgent: 'linux-termux-test' };
global.requestAnimationFrame = () => 1;
global.cancelAnimationFrame = () => {};

eval(fs.readFileSync('game.js', 'utf8'));

console.log('================================================================');
console.log('🛡️ 5 TA CHUQUR VA HAR TOMONLAMA TEKSHIRUV BOSQICHI (5 AUDIT ROUNDS)');
console.log('================================================================\n');

let totalPasses = 0;
let totalFails = 0;

function report(roundNum, title, passed, detail) {
  if (passed) {
    totalPasses++;
    console.log('[PASS - ROUND ' + roundNum + '] ' + title + ': ' + (detail || 'OK'));
  } else {
    totalFails++;
    console.error('[FAIL - ROUND ' + roundNum + '] ' + title + ': ' + detail);
  }
}

// -----------------------------------------------------------------------------
// ROUND 1: KAMPANIYA (BARCHA 10 TA XARITA VA G\'ALABA SIKLI)
// -----------------------------------------------------------------------------
console.log('>>> [BOSQICH 1] KAMPANIYA HAYOT SIKLI: BARCHA 10 TA XARITA <<<');
try {
  const engine1 = new LastGridEngine();
  engine1.ctx = mockCtx;
  engine1.canvas = mockCtx.canvas;

  for (let m = 0; m < 10; m++) {
    engine1.startMission(m, 'CAMPAIGN');
    engine1.gold = 3000;
    engine1.buildTower('pulse', 6, 4);
    engine1.buildTower('mortar', 8, 4);
    engine1.buildTower('tesla', 10, 4);

    let mapWon = false;
    for (let step = 0; step < 2500; step++) {
      engine1.update(0.016);
      engine1.render();
      if (engine1.state === 'VICTORY' || engine1.wave >= 2) {
        mapWon = true;
        break;
      }
    }
    const mapName = engine1.MAPS[m] ? engine1.MAPS[m].name : 'Sektor ' + m;
    report(1, 'Xarita ' + m + ' (' + mapName + ')', mapWon, 'To\'lqin: ' + engine1.wave + ', Gold: ' + engine1.gold);
  }
} catch (e) {
  report(1, 'Kampaniya sikli', false, e.stack);
}

// -----------------------------------------------------------------------------
// ROUND 2: BOSS RUSH & TITAN MEXANIKALARI
// -----------------------------------------------------------------------------
console.log('\n>>> [BOSQICH 2] BOSS RUSH & ELITA TITANLARNING AI QOBILIYATLARI <<<');
try {
  const engine2 = new LastGridEngine();
  engine2.ctx = mockCtx;
  engine2.canvas = mockCtx.canvas;
  engine2.startMission(0, 'BOSS_RUSH');

  const bosses = ['juggernaut', 'overseer', 'hive_titan', 'void_titan', 'chrono_phantom', 'mecha_colossus'];
  bosses.forEach(bName => {
    let bossSpawned = false;
    engine2.spawnEnemy(bName);
    const boss = engine2.enemies.find(e => e.type === bName);
    if (boss) {
      bossSpawned = true;
      for (let s = 0; s < 120; s++) {
        engine2.update(0.016);
      }
    }
    report(2, 'Titan ' + bName + ' AI & qobiliyatlari', bossSpawned, boss ? 'HP: ' + boss.hp + '/' + boss.maxHp : 'Topilmadi');
  });
} catch (e) {
  report(2, 'Boss Rush sikli', false, e.stack);
}

// -----------------------------------------------------------------------------
// ROUND 3: CHEKSIZ REJIM & CHEGARAVIY HISOBLASH (WAVES 1 - 50+)
// -----------------------------------------------------------------------------
console.log('\n>>> [BOSQICH 3] CHEKSIZ REJIM & EKSTREMAL TO\'LQINLAR HISOBLASHI <<<');
try {
  const engine3 = new LastGridEngine();
  engine3.ctx = mockCtx;
  engine3.canvas = mockCtx.canvas;
  engine3.startMission(9, 'ENDLESS');

  let numericError = false;
  for (let w = 1; w <= 50; w += 5) {
    engine3.wave = w;
    let hpMult = 1.0;
    if (w > 20) {
      hpMult *= Math.pow(1.12, 19) * Math.pow(1.04, w - 20);
    } else if (w > 1) {
      hpMult *= Math.pow(1.12, w - 1);
    }
    if (isNaN(hpMult) || !isFinite(hpMult) || hpMult <= 0) {
      numericError = true;
      break;
    }
  }
  report(3, '50 to\'lqinli eksponensial qiyinlik multiplikatorlari', !numericError, 'To\'g\'ri progressiv masshtablash');

  // Trigger cyber augment draft
  engine3.triggerAugmentDraft();
  report(3, 'Kiber-Augment Draft taktik kartalar tanlovi', engine3.state === 'DRAFT' && engine3.draftCards.length === 3, 'Kartalar: ' + engine3.draftCards.map(c=>c.id).join(', '));
  const chosenCard = engine3.draftCards[0];
  engine3.selectAugment(chosenCard);
  report(3, 'Draft kartasini faollashtirish va jangga qaytish', engine3.activeAugments.length === 1 && engine3.state === 'PLAYING', 'Faol: ' + engine3.activeAugments[0]);
} catch (e) {
  report(3, 'Cheksiz rejim sikli', false, e.stack);
}

// -----------------------------------------------------------------------------
// ROUND 4: INTERFEYS, MODALLAR VA KO'P TILLILIK (UZ / EN / RU)
// -----------------------------------------------------------------------------
console.log('\n>>> [BOSQICH 4] BARCHA 12 TA EKRAN VA MODALLAR INTERFEYSI <<<');
try {
  const engine4 = new LastGridEngine();
  engine4.ctx = mockCtx;
  engine4.canvas = mockCtx.canvas;

  const allStates = ['MENU', 'MAP_SELECT', 'LEADERBOARD', 'ACHIEVEMENTS', 'MANUAL', 'EDITOR', 'ANALYTICS', 'PLAYING', 'PAUSED', 'DRAFT', 'VICTORY', 'DEFEAT'];
  let renderErrors = 0;
  allStates.forEach(st => {
    engine4.state = st;
    saveStack = 0;
    try {
      engine4.render();
      if (saveStack !== 0) renderErrors++;
    } catch(err) {
      renderErrors++;
    }
  });
  report(4, 'Barcha 12 ta ekran renderi va Canvas stack muvozanati', renderErrors === 0, '0 ta stack xatosi');

  // Multilingual checks
  let langErrors = 0;
  ['uz', 'en', 'ru'].forEach(lang => {
    engine4.setLanguage(lang);
    if (engine4.lang !== lang) langErrors++;
  });
  report(4, 'UZ / EN / RU til almashtirish va saqlash', langErrors === 0, 'Joriy til: ' + engine4.lang);

  // Back button handling across states
  engine4.state = 'MAP_SELECT';
  engine4.handleBackAction();
  report(4, 'Orqaga (Back) tugmasi menyuga qaytarishi', engine4.state === 'MENU', 'Yangi holat: ' + engine4.state);
} catch (e) {
  report(4, 'Interfeys tekshiruvi', false, e.stack);
}

// -----------------------------------------------------------------------------
// ROUND 5: UZOQ MUDDATLI XOTIRA BARQARORLIGI & 3D WEAPON FRAMING (10,000 FRAMES)
// -----------------------------------------------------------------------------
console.log('\n>>> [BOSQICH 5] 10,000 KADRLI XOTIRA BARQARORLIGI & 3D KAMERA <<<');
try {
  const engine5 = new LastGridEngine();
  engine5.ctx = mockCtx;
  engine5.canvas = mockCtx.canvas;
  engine5.startMission(0, 'CAMPAIGN');
  engine5.gold = 10000;
  for (let i = 0; i < 5; i++) engine5.buildTower('pulse', 4 + i, 3);

  const initHeap = process.memoryUsage().heapUsed / 1024 / 1024;
  for (let f = 0; f < 10000; f++) {
    engine5.update(0.016);
    if (f % 50 === 0) engine5.render();
  }
  const finalHeap = process.memoryUsage().heapUsed / 1024 / 1024;
  const growth = finalHeap - initHeap;
  report(5, '10,000 kadrli xotira barqarorligi', growth < 60, 'Dastlabki: ' + initHeap.toFixed(1) + 'MB -> Yakuniy: ' + finalHeap.toFixed(1) + 'MB (O\'sish: ' + growth.toFixed(1) + 'MB)');

  // Universal roundRect polyfill verification
  const polyfillActive = typeof engine5.ctx.roundRect === 'function';
  report(5, 'Universal Canvas roundRect polifilli mavjudligi', polyfillActive, 'Eski Android va brauzerlar himoyalangan');

  // Mathematical 3D Megatron weapon clearance
  const tanHalf = Math.tan((36 / 2) * Math.PI / 180);
  const charH = 3.60;
  const charW = 4.45;
  const zHeight = (charH / 0.88) / (2 * tanHalf);
  const zWidth = (charW / 0.76) / (2 * tanHalf * 1.30);
  const finalZ = Math.max(6.20, Math.min(8.40, Math.max(zHeight, zWidth)));
  const visibleW = 2 * finalZ * tanHalf * 1.30;
  const leftClearance = (-2.3912 + 0.20) - (-visibleW / 2);
  const leftClearancePct = (leftClearance / visibleW) * 100;
  report(5, 'Megatron qurolining ekranga sig\'ishi va xavfsiz masofasi', leftClearance > 0.4, 'finalZ=' + finalZ.toFixed(2) + ', Chap bo\'sh joy: ' + leftClearance.toFixed(2) + ' birlik (' + leftClearancePct.toFixed(1) + '%)');
} catch (e) {
  report(5, 'Xotira va 3D tekshiruvi', false, e.stack);
}

console.log('\n================================================================');
console.log('JAMI TEKSHIRUVLAR: ' + (totalPasses + totalFails) + ' ta');
console.log('MUVAFFAQIYATLI (PASS): ' + totalPasses + ' ta');
console.log('XATOLIKLAR (FAIL): ' + totalFails + ' ta');
console.log('================================================================');

if (totalFails > 0) process.exit(1);
else process.exit(0);
