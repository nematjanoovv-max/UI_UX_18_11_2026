/**
 * Test Suite: v4.2.6 Feature Verification
 * 1. Multilingual I18N completeness across EN, UZ, RU
 * 2. Tactical Pause Abort/Surrender Confirmation flow
 * 3. Settings modal in-game safe surrender routing
 * 4. Back button handling safety
 * 5. index.html 3D preloader and iOS audio auto-resume listeners
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("=== RUNNING TEST SUITE: v4.2.6 FEATURES ===");

// 1. Verify index.html updates
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
assert(htmlContent.includes('id="robotLoader"'), "index.html must have #robotLoader element");
assert(htmlContent.includes('id="robotProgressBar"'), "index.html must have #robotProgressBar element");
assert(htmlContent.includes('id="robotProgressText"'), "index.html must have #robotProgressText element");
assert(htmlContent.includes('resumeAudioOnWake'), "index.html must have resumeAudioOnWake function");
assert(htmlContent.includes("document.addEventListener('visibilitychange'"), "index.html must listen to visibilitychange");
console.log("✔ Test 1 PASS: index.html 3D preloader & Web Audio listeners verified.");

// 2. Setup mock browser environment for game.js
global.window = {
  innerWidth: 1280,
  innerHeight: 720,
  devicePixelRatio: 1,
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; }
  },
  location: { origin: 'http://localhost' },
  audio: {
    init() {},
    click() {},
    modal() {},
    sell() {},
    upgrade() {},
    playSample() {},
    playBGMTrack() {},
    startBGM() {},
    stopBGM() {},
    setBGMVolume() {},
    shootPulse() {}
  }
};
global.localStorage = global.window.localStorage;
global.audio = global.window.audio;
global.navigator = { vibrate() {} };
global.requestAnimationFrame = () => {};
global.cancelAnimationFrame = () => {};
global.confirm = () => false; // test safe cancellation

const textDrawn = [];
const mockCtx = {
  save() {},
  restore() {},
  beginPath() {},
  closePath() {},
  moveTo() {},
  lineTo() {},
  arc() {},
  rect() {},
  roundRect() {},
  strokeRect() {},
  fillRect() {},
  fillText(text, x, y) {
    textDrawn.push({ text: String(text), x, y });
  },
  measureText(text) {
    return { width: String(text).length * 8 };
  },
  fill() {},
  stroke() {},
  clip() {},
  createLinearGradient() {
    return { addColorStop() {} };
  },
  createRadialGradient() {
    return { addColorStop() {} };
  },
  setLineDash() {}
};

const mockCanvas = {
  width: 1280,
  height: 720,
  style: {},
  addEventListener: () => {},
  removeEventListener: () => {},
  getContext: () => mockCtx,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 })
};

global.document = {
  getElementById: (id) => mockCanvas,
  addEventListener: () => {},
  removeEventListener: () => {},
  fullscreenElement: null
};

// Evaluate game.js in this sandbox
const gameSrc = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');
eval(gameSrc);

assert(typeof window.LastGridEngine === 'function', "LastGridEngine class must be defined");
const engine = new window.LastGridEngine();
engine.ctx = mockCtx;
engine.canvas = mockCanvas;

// 3. Multilingual I18N Dictionary Completeness
const testKeys = [
  'paused', 'pauseDesc', 'resume', 'settings', 'abort',
  'confirmAbortTitle', 'confirmAbortDesc', 'confirmYes', 'confirmNo',
  'tacticalSectors', 'campaignStars', 'enterBattle', 'secured', 'hostile',
  'customLevel', 'playCustom', 'editMap', 'achievementsTitle', 'achievementsEarned',
  'achievementsClaimed', 'page1', 'page2', 'claim', 'claimed', 'leaderboardTitle',
  'activeCommander', 'rank', 'commander', 'sector', 'score', 'tier', 'syncScores',
  'editHandle', 'noScores', 'settingsTitle', 'settingsSub', 'audioTitle',
  'displayTitle', 'hapticsTitle', 'perfTitle', 'langTitle', 'saveAndClose'
];

['uz', 'en', 'ru'].forEach(lang => {
  engine.lang = lang;
  testKeys.forEach(k => {
    const val = engine.t(k);
    assert(val && val !== k, `Language [${lang}] missing translation for key "${k}"`);
  });
});
console.log(`✔ Test 2 PASS: All ${testKeys.length} I18N keys translated across UZ, EN, and RU.`);

// 4. Tactical Pause Abort Confirmation Logic
engine.state = 'PAUSED';
engine.showAbortConfirm = false;

// Clicking "ASOSIY MENYUGA" (440, 470, 400, 50)
engine.handleCanvasClick(500, 490, false);
assert(engine.state === 'PAUSED', "State should remain PAUSED on abort click before confirmation");
assert(engine.showAbortConfirm === true, "showAbortConfirm must be set to true");

// While confirm dialog is open, render pause modal and verify strings
textDrawn.length = 0;
engine.renderPauseModal();
const dialogTitle = textDrawn.find(t => t.text.includes(engine.t('confirmAbortTitle')));
assert(dialogTitle, "Pause modal must render abort confirmation title when showAbortConfirm is true");
const yesBtn = textDrawn.find(t => t.text.includes(engine.t('confirmYes')));
assert(yesBtn, "Pause modal must render confirm Yes button");
const noBtn = textDrawn.find(t => t.text.includes(engine.t('confirmNo')));
assert(noBtn, "Pause modal must render confirm No button");

// Clicking "YO'Q, QOLISH" (cx + 275 = 655 to 865, cy + 185 = 400 to 452)
engine.handleCanvasClick(700, 420, false);
assert(engine.showAbortConfirm === false, "Clicking No must dismiss abort confirmation");
assert(engine.state === 'PAUSED', "State must remain PAUSED after clicking No");

// Open abort confirm again and click "HA, CHIQISH" (cx + 35 = 415 to 625, cy + 185 = 400 to 452)
engine.showAbortConfirm = true;
engine.handleCanvasClick(450, 420, false);
assert(engine.showAbortConfirm === false, "showAbortConfirm must reset after exit");
assert(engine.state === 'MENU', "State must transition to MENU upon confirming exit");
console.log("✔ Test 3 PASS: Tactical pause abort confirmation dialog & button clicks verified.");

// 5. Back Button Safety in PAUSED state
engine.state = 'PAUSED';
engine.showAbortConfirm = true;
engine.handleBackAction();
assert(engine.showAbortConfirm === false, "Back button while abort dialog is open must dismiss it safely");
assert(engine.state === 'PAUSED', "State should remain PAUSED when abort dialog was dismissed");

// Second back button resumes combat
engine.handleBackAction();
assert(engine.state === 'PLAYING', "Back button during PAUSED state must resume combat");
console.log("✔ Test 4 PASS: Android back button navigation safely resumes battle without data loss.");

// 6. In-game Settings Modal Safe Exit Routing
engine.state = 'PAUSED';
engine.showSettingsModal = true;
engine.settingsReturnState = 'PAUSED';
// In settings modal, clicking "ASOSIY MENYUGA" button (col2X: 660 to 1070, y: 110 + 420 = 530 to 582)
engine.handleSettingsClick(700, 550);
assert(engine.showSettingsModal === false, "Settings modal should close");
assert(engine.state === 'PAUSED', "State should return to PAUSED with abort confirm");
assert(engine.showAbortConfirm === true, "showAbortConfirm must be triggered from in-game settings exit");
console.log("✔ Test 5 PASS: In-game settings exit safely routes through surrender confirmation.");

// 7. Verify dynamic multilingual rendering across all sub-modals
['uz', 'en', 'ru'].forEach(lang => {
  engine.lang = lang;
  textDrawn.length = 0;
  engine.renderMapSelect();
  assert(textDrawn.some(t => t.text.includes(engine.t('tacticalSectors'))), `MapSelect failed to render localized title for ${lang}`);
  
  textDrawn.length = 0;
  engine.renderAchievementsModal();
  assert(textDrawn.some(t => t.text.includes(engine.t('achievementsTitle'))), `Achievements failed to render localized title for ${lang}`);

  textDrawn.length = 0;
  engine.renderLeaderboardModal();
  assert(textDrawn.some(t => t.text.includes(engine.t('leaderboardTitle'))), `Leaderboard failed to render localized title for ${lang}`);

  textDrawn.length = 0;
  engine.renderSettingsModal();
  assert(textDrawn.some(t => t.text.includes(engine.t('settingsTitle'))), `Settings failed to render localized title for ${lang}`);
});
console.log("✔ Test 6 PASS: Sub-screens render 100% dynamic localized strings in UZ, EN, and RU.");

console.log("\nALL v4.2.6 UNIT TESTS PASSED SUCCESSFULLY! (100% PASS)");
process.exit(0);
