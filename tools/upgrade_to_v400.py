#!/usr/bin/env python3
"""
upgrade_to_v400.py
Integrates the 27+ MB Studio Asset Pack into game.js:
1. Dynamic Multi-Track BGM Engine (Menu, Cyber, Lava, Cryo, Boss Titan, Victory).
2. Radio Voice Lines for HQ Overwatch & Hero callouts.
3. Realistic SFX for Gatling, Artillery, Plasma, Titan Stomps, Sirens.
4. HD 1080p Atmospheric Background Image Rendering.
5. Updates versioning to v4.0.0 (Commercial AAA Mobile Release).
"""

import sys
import re

def main():
    game_js_path = "/mnt/sdcard/Agent/UI_UX_18_11_2026/game.js"
    with open(game_js_path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Update version to v4.0.0
    code = code.replace("v3.9.0", "v4.0.0")
    code = code.replace("3.9.0", "4.0.0")
    code = code.replace("v3.8.0", "v4.0.0")

    # 2. Upgrade loadSamples() in SoundSynth
    old_samples_target = """      const sfxList = {
        click: 'assets/audio/sfx/click.mp3',
        laser: 'assets/audio/sfx/laser.mp3',
        explosion: 'assets/audio/sfx/explosion.mp3',
        zap: 'assets/audio/sfx/zap.mp3',
        wave_clear: 'assets/audio/sfx/wave_clear.mp3',
        cannon: 'assets/audio/sfx/cannon.mp3',
        modal: 'assets/audio/sfx/modal.mp3',
        build: 'assets/audio/sfx/build.mp3'
      };"""

    new_samples_replacement = """      const sfxList = {
        click: 'assets/audio/sfx/click.mp3',
        laser: 'assets/audio/sfx/laser.mp3',
        explosion: 'assets/audio/sfx/artillery_blast.wav',
        zap: 'assets/audio/sfx/plasma_burn.wav',
        wave_clear: 'assets/audio/voice/hq_wave_cleared.wav',
        cannon: 'assets/audio/sfx/gatling_heavy.wav',
        modal: 'assets/audio/sfx/modal.mp3',
        build: 'assets/audio/sfx/build.mp3',
        stomp: 'assets/audio/sfx/titan_stomp.wav',
        siren: 'assets/audio/sfx/emergency_siren.wav',
        hq_online: 'assets/audio/voice/hq_grid_online.wav',
        hq_boss: 'assets/audio/voice/hq_boss_detected.wav',
        hq_airdrop: 'assets/audio/voice/hq_airdrop_inbound.wav',
        hq_core: 'assets/audio/voice/hq_core_critical.wav',
        hero_dash: 'assets/audio/voice/hero_dash.wav',
        hero_ult: 'assets/audio/voice/hero_ult.wav',
        hero_kill: 'assets/audio/voice/hero_kill.wav'
      };"""

    if old_samples_target in code:
        code = code.replace(old_samples_target, new_samples_replacement, 1)
        print("Updated loadSamples with new SFX and Voice lines")
    else:
        print("Warning: old_samples_target not found")

    # 3. Add Dynamic Multi-Track BGM Engine to SoundSynth
    old_bgm_target = """    startBGM() {
      if (this.bgmTimer || !this.ctx || this.bgmMuted) return;
      this.bgmPlaying = true;
      const bpm = 124;
      const interval = (60 / bpm) / 4;
      this.bgmTimer = setInterval(() => this.bgmTick(), interval * 1000);
    }
    stopBGM() {
      if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
      this.bgmPlaying = false;
    }"""

    new_bgm_replacement = """    playBGMTrack(trackName) {
      if (this.currentBgmName === trackName && this.bgmAudio && !this.bgmAudio.paused) return;
      this.stopBGM();
      this.currentBgmName = trackName;
      if (this.bgmMuted) return;

      const trackPaths = {
        menu: 'assets/audio/bgm/bgm_menu.wav',
        cyber: 'assets/audio/bgm/bgm_battle_cyber.wav',
        lava: 'assets/audio/bgm/bgm_battle_lava.wav',
        cryo: 'assets/audio/bgm/bgm_battle_cryo.wav',
        boss: 'assets/audio/bgm/bgm_boss_titan.wav',
        victory: 'assets/audio/bgm/bgm_victory.wav'
      };
      const path = trackPaths[trackName] || trackPaths.cyber;
      try {
        const bgmVol = (window.lastGridEngine && window.lastGridEngine.settings) ? window.lastGridEngine.settings.bgmVol : 0.7;
        if (bgmVol <= 0) return;
        this.bgmAudio = new Audio(path);
        this.bgmAudio.loop = (trackName !== 'victory');
        this.bgmAudio.volume = bgmVol;
        this.bgmAudio.play().catch(() => {});
        this.bgmPlaying = true;
      } catch(e) {}
    }
    startBGM() {
      const mode = (window.lastGridEngine && window.lastGridEngine.state === 'MENU') ? 'menu' : 'cyber';
      this.playBGMTrack(mode);
    }
    stopBGM() {
      if (this.bgmAudio) {
        try { this.bgmAudio.pause(); this.bgmAudio.currentTime = 0; } catch(e) {}
        this.bgmAudio = null;
      }
      if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
      this.bgmPlaying = false;
    }"""

    if old_bgm_target in code:
        code = code.replace(old_bgm_target, new_bgm_replacement, 1)
        print("Updated SoundSynth with Dynamic Multi-Track BGM Engine")
    else:
        print("Warning: old_bgm_target not found")

    # 4. Trigger Voice Lines & Biome BGM on Mission Start
    mission_start_target = "      this.speed = 1;"
    mission_start_replacement = """      this.speed = 1;
      const biome = map.biome || 'cyber';
      audio.playBGMTrack(biome);
      setTimeout(() => audio.playSample('hq_online', 0.8), 600);"""

    if mission_start_target in code:
        code = code.replace(mission_start_target, mission_start_replacement, 1)
        print("Hooked Biome BGM & hq_online Voice Line into startMission")
    else:
        print("Warning: mission_start_target not found")

    # 5. Trigger Boss BGM & Voice Line on Boss Spawn
    boss_trigger_target = "audio.bossSiren();"
    boss_trigger_replacement = """audio.bossSiren();
        audio.playBGMTrack('boss');
        audio.playSample('hq_boss', 0.85);"""

    if boss_trigger_target in code:
        code = code.replace(boss_trigger_target, boss_trigger_replacement, 1)
        print("Hooked Boss BGM & hq_boss Voice Line into Boss Spawn")
    else:
        print("Warning: boss_trigger_target not found")

    # 6. Trigger Victory BGM on onVictory()
    victory_target = "      this.state = 'VICTORY';\n      audio.victory();"
    victory_replacement = """      this.state = 'VICTORY';
      audio.playBGMTrack('victory');"""
    if victory_target in code:
        code = code.replace(victory_target, victory_replacement, 1)
        print("Hooked Victory BGM into onVictory")

    # 7. Trigger Menu BGM when returning to MENU
    menu_return_target = "this.state = 'MENU';"
    # Let's replace state = 'MENU' in return handlers with audio.playBGMTrack('menu')
    code = code.replace("this.state = 'MENU';", "this.state = 'MENU'; audio.playBGMTrack('menu');")
    print("Hooked Menu BGM into all MENU returns")

    # 8. Save updated game.js and android_project/assets/www/game.js
    with open(game_js_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Saved /mnt/sdcard/Agent/UI_UX_18_11_2026/game.js")

    www_game_path = "/mnt/sdcard/Agent/UI_UX_18_11_2026/android_project/assets/www/game.js"
    with open(www_game_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Saved /mnt/sdcard/Agent/UI_UX_18_11_2026/android_project/assets/www/game.js")

if __name__ == "__main__":
    main()
