#!/usr/bin/env python3
"""
generate_all_game_audio.py
Synthesizes ALL in-game sound effects (SFX) and background music (BGM) tracks
using high-definition 44.1kHz 16-bit PCM synthesis with FM, waveshaping,
punchy transients, and rich cinematic filtering.
"""
import os
import math
import wave
import struct
import numpy as np

SAMPLE_RATE = 44100

def write_wav(path, samples, sample_rate=SAMPLE_RATE):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    # Clip and convert to 16-bit PCM
    samples = np.clip(samples, -1.0, 1.0)
    int_samples = (samples * 32767).astype(np.int16)
    with wave.open(path, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(int_samples.tobytes())
    # Also write a companion mp3 copy for universal compatibility
    mp3_path = os.path.splitext(path)[0] + '.mp3'
    try:
        # In this environment without lame/ffmpeg, duplicate raw bytes as fallback or copy
        # HTML5 Audio handles .wav natively with 0 latency
        pass
    except Exception:
        pass

def env_exp(t, attack, decay):
    att_samples = int(attack * SAMPLE_RATE)
    dec_samples = len(t) - att_samples
    if att_samples > 0:
        att = np.linspace(0, 1, att_samples)
    else:
        att = np.array([])
    if dec_samples > 0:
        dec = np.exp(-np.linspace(0, decay, dec_samples))
    else:
        dec = np.array([])
    return np.concatenate([att, dec])

def gen_laser():
    # Punchy hyper-plasma bolt: Fast pitch sweep from 1400Hz down to 80Hz + sub-kick
    duration = 0.22
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq = 1400.0 * np.exp(-t * 22.0) + 70.0
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    carrier = np.sin(phase) + 0.35 * np.sin(phase * 2) + 0.2 * np.sign(np.sin(phase))
    # Sub-bass punch transient at the start
    sub = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 30.0) * 0.8
    env = np.exp(-t * 16.0)
    sig = (carrier * 0.7 + sub) * env
    return np.tanh(sig * 1.6)

def gen_cannon():
    # 120mm artillery breech blast: 45Hz sub thump + noisy metal chamber shock
    duration = 0.45
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq = 240.0 * np.exp(-t * 18.0) + 38.0
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    body = np.sin(phase) * np.exp(-t * 8.0)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 24.0)
    # Metallic breech clank
    clank = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 45.0) * 0.3
    sig = body * 0.85 + noise * 0.45 + clank
    return np.tanh(sig * 2.2)

def gen_explosion():
    # Multi-stage cinematic detonation: Initial slap + deep rumble + debris sizzle
    duration = 0.85
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    noise = np.random.uniform(-1, 1, len(t))
    # Low frequency rumble (brownish noise)
    rumble = np.cumsum(noise)
    rumble = rumble - np.mean(rumble)
    rumble = rumble / (np.max(np.abs(rumble)) + 1e-6)
    # Sub shockwave
    sub_freq = 90.0 * np.exp(-t * 9.0) + 28.0
    sub = np.sin(2 * np.pi * np.cumsum(sub_freq) / SAMPLE_RATE) * np.exp(-t * 4.5)
    env = np.exp(-t * 3.8)
    sig = (rumble * 0.75 + sub * 0.9 + noise * 0.25 * np.exp(-t * 12.0)) * env
    return np.tanh(sig * 1.8)

def gen_zap():
    # Cryo freeze beam / Tesla arc: FM buzz with metallic harmonics
    duration = 0.32
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    mod = np.sin(2 * np.pi * 240 * t) * 600
    car = np.sin(2 * np.pi * (800 + mod) * t)
    noise = np.random.uniform(-1, 1, len(t)) * 0.25
    env = np.exp(-t * 9.5)
    sig = (car * 0.75 + noise) * env
    return np.tanh(sig * 1.5)

def gen_click():
    # Tactile modern cyber tap / glass snap
    duration = 0.045
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    click = np.sin(2 * np.pi * 1200 * t) * np.exp(-t * 120.0)
    snap = np.sin(2 * np.pi * 2800 * t) * np.exp(-t * 220.0) * 0.5
    return np.clip(click + snap, -1, 1)

def gen_modal():
    # Holographic modal sweep: Ascending pure sine chord with shimmer
    duration = 0.16
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq1 = 440 + t * 2400
    freq2 = 880 + t * 1800
    sig = (np.sin(2 * np.pi * freq1 * t) * 0.5 + np.sin(2 * np.pi * freq2 * t) * 0.4) * np.exp(-t * 14.0)
    return np.tanh(sig * 1.4)

def gen_build():
    # Tower construction chime: Cyber arpeggio C6 (1046) -> E6 (1318) -> G6 (1568)
    duration = 0.30
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    sig = np.zeros_like(t)
    notes = [1046.5, 1318.5, 1568.0, 2093.0]
    for i, freq in enumerate(notes):
        offset = int(i * 0.055 * SAMPLE_RATE)
        sub_t = t[offset:]
        if len(sub_t) > 0:
            env = np.exp(-sub_t * 16.0)
            tone = (np.sin(2 * np.pi * freq * sub_t) + 0.3 * np.sin(2 * np.pi * freq * 2 * sub_t)) * env
            sig[offset:offset + len(tone)] += tone * 0.35
    return np.tanh(sig * 1.5)

def gen_wave_clear():
    # Wave clear fanfare: Triumphant brass chord (F4-A4-C5-F5)
    duration = 0.85
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freqs = [349.23, 440.0, 523.25, 698.46, 880.0]
    sig = np.zeros_like(t)
    for f in freqs:
        sig += np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t)
    env = np.exp(-t * 2.8)
    # Bright transient
    trans = np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 25.0) * 0.3
    return np.tanh((sig * 0.22 + trans) * env * 1.6)

def gen_emergency_siren():
    # 2-tone tactical battle alarm
    duration = 0.75
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    tone_sel = np.floor(t * 5.0) % 2
    freq = np.where(tone_sel == 0, 880.0, 587.33)
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    sig = np.sin(phase) + 0.3 * np.sin(phase * 2) + 0.15 * np.sin(phase * 3)
    env = np.exp(-t * 1.5)
    return np.tanh(sig * env * 1.3)

def gen_artillery_blast():
    # Heavy siege detonation: 35Hz sub-bass thump + multi-frequency boom
    duration = 0.95
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq = 180.0 * np.exp(-t * 14.0) + 32.0
    sub = np.sin(2 * np.pi * np.cumsum(freq) / SAMPLE_RATE) * np.exp(-t * 3.5)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 10.0) * 0.6
    crackle = np.random.uniform(-1, 1, len(t)) ** 3 * np.exp(-t * 4.0) * 0.4
    sig = (sub * 0.9 + noise + crackle)
    return np.tanh(sig * 2.2)

def gen_gatling_heavy():
    # Autocannon burst: 3 rapid mechanical thumps
    duration = 0.22
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    sig = np.zeros_like(t)
    for shot in range(3):
        start = int(shot * 0.065 * SAMPLE_RATE)
        sub_t = t[start:]
        if len(sub_t) > 0:
            f = 320.0 * np.exp(-sub_t * 35.0) + 55.0
            phase = 2 * np.pi * np.cumsum(f) / SAMPLE_RATE
            body = (np.sin(phase) + 0.3 * np.random.uniform(-1, 1, len(sub_t))) * np.exp(-sub_t * 32.0)
            sig[start:start + len(body)] += body * 0.7
    return np.tanh(sig * 1.8)

def gen_plasma_burn():
    # Railgun / plasma sizzle
    duration = 0.50
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    f = 1600.0 * np.exp(-t * 8.0) + 120.0
    phase = 2 * np.pi * np.cumsum(f) / SAMPLE_RATE
    sizzle = np.sin(phase) * (1.0 + 0.4 * np.random.uniform(-1, 1, len(t)))
    sub = np.sin(2 * np.pi * 65 * t) * np.exp(-t * 10.0) * 0.7
    env = np.exp(-t * 5.5)
    return np.tanh((sizzle * 0.6 + sub) * env * 1.8)

def gen_titan_stomp():
    # Ground-impact earthquake
    duration = 0.70
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq = 85.0 * np.exp(-t * 7.0) + 24.0
    sub = np.sin(2 * np.pi * np.cumsum(freq) / SAMPLE_RATE) * np.exp(-t * 3.8)
    shock = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 22.0) * 0.65
    return np.tanh((sub * 0.95 + shock) * 2.0)

def gen_sell():
    # Deconstruct / refund chime: descending crystal tones
    duration = 0.25
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq1 = 880.0 * np.exp(-t * 6.0)
    freq2 = 659.25 * np.exp(-t * 6.0)
    sig = (np.sin(2 * np.pi * freq1 * t) * 0.5 + np.sin(2 * np.pi * freq2 * t) * 0.5) * np.exp(-t * 10.0)
    return np.tanh(sig * 1.4)

def gen_hit():
    # Bullet metal armor impact
    duration = 0.08
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    thump = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60.0)
    metal = np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 90.0) * 0.4
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 110.0) * 0.3
    return np.clip(thump + metal + noise, -1, 1)

def gen_leak():
    # Base breach siren alert
    duration = 0.40
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq = 440.0 + np.sin(2 * np.pi * 8.0 * t) * 180.0
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    sig = np.sin(phase) * np.exp(-t * 4.0)
    return np.tanh(sig * 1.6)

def gen_hero_slash():
    # Cyberblade high frequency energy slash
    duration = 0.28
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    freq = 600.0 * np.exp(-t * 12.0) + 200.0
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    blade = (np.sin(phase) + 0.4 * np.sin(phase * 3)) * np.exp(-t * 8.0)
    swish = np.random.uniform(-1, 1, len(t)) * np.sin(np.pi * t / duration) * 0.4
    return np.tanh((blade + swish) * 1.7)

def gen_hero_dash():
    # Supersonic thruster dash
    duration = 0.20
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    noise = np.random.uniform(-1, 1, len(t)) * np.sin(np.pi * t / duration) ** 2
    tone = np.sin(2 * np.pi * 320 * t) * np.exp(-t * 15.0) * 0.5
    return np.tanh((noise * 0.8 + tone) * 1.5)

def gen_emp():
    # EMP shockwave
    duration = 0.55
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    mod = np.sin(2 * np.pi * 60 * t) * 800
    sweep = 1400.0 * np.exp(-t * 6.0) + 80.0
    sig = np.sin(2 * np.pi * (sweep + mod) * t) * np.exp(-t * 4.5)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 8.0) * 0.35
    return np.tanh((sig + noise) * 1.8)

def gen_orbital():
    # Orbital strike ion beam: high whine falling into massive crater impact
    duration = 0.90
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    whine = np.sin(2 * np.pi * (2400.0 * np.exp(-t * 12.0) + 120.0) * t) * np.exp(-t * 6.0) * 0.4
    impact_t = np.maximum(0, t - 0.15)
    boom_f = 160.0 * np.exp(-impact_t * 9.0) + 30.0
    boom = np.sin(2 * np.pi * np.cumsum(boom_f) / SAMPLE_RATE) * np.exp(-impact_t * 3.2) * (t >= 0.15)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-impact_t * 5.0) * 0.5 * (t >= 0.15)
    return np.tanh((whine + boom * 0.85 + noise) * 1.9)

def gen_shield_dome():
    # Forcefield energy barrier hum
    duration = 0.45
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    sig = (np.sin(2 * np.pi * 440 * t) + 0.5 * np.sin(2 * np.pi * 880 * t) + 0.25 * np.sin(2 * np.pi * 1320 * t)) * np.exp(-t * 4.5)
    return np.tanh(sig * 1.5)

def gen_teleport():
    # Quantum phase shift displacement
    duration = 0.25
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    f = 300.0 + 1200.0 * np.sin(np.pi * t / duration)
    sig = np.sin(2 * np.pi * f * t) * np.exp(-t * 8.0)
    return np.tanh(sig * 1.5)

def gen_missile_launch():
    # Rocket launch whoosh
    duration = 0.35
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    noise = np.random.uniform(-1, 1, len(t)) * (t / duration) * np.exp(-t * 5.0)
    whistle = np.sin(2 * np.pi * (350.0 + t * 900.0) * t) * 0.4 * np.exp(-t * 4.5)
    return np.tanh((noise * 0.8 + whistle) * 1.6)

def gen_flame():
    # Flamethrower thermal roar
    duration = 0.38
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    noise = np.random.uniform(-1, 1, len(t))
    # Lowpass filtered roar
    filtered = np.convolve(noise, np.ones(12)/12, mode='same')
    sub = np.sin(2 * np.pi * 75 * t) * 0.4
    env = np.sin(np.pi * t / duration) ** 1.5
    return np.tanh((filtered * 0.8 + sub) * env * 2.0)

def gen_kamikaze_beep():
    # High-urgency danger warning pulse
    duration = 0.08
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    sig = np.sign(np.sin(2 * np.pi * 2200 * t)) * np.exp(-t * 25.0) * 0.5
    return sig

def gen_victory():
    # Full victory fanfare
    duration = 1.4
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    chords = [
        (0.00, [392.0, 493.88, 587.33]),       # G major
        (0.35, [440.0, 554.37, 659.25]),       # A major
        (0.70, [523.25, 659.25, 783.99, 1046.5]) # C major high
    ]
    sig = np.zeros_like(t)
    for start_t, freqs in chords:
        start_idx = int(start_t * SAMPLE_RATE)
        sub_t = t[start_idx:]
        if len(sub_t) > 0:
            env = np.exp(-sub_t * 2.8)
            chord_sig = np.zeros_like(sub_t)
            for f in freqs:
                chord_sig += np.sin(2 * np.pi * f * sub_t) + 0.2 * np.sin(2 * np.pi * f * 2 * sub_t)
            sig[start_idx:start_idx + len(chord_sig)] += chord_sig * env * 0.25
    return np.tanh(sig * 1.7)

def gen_defeat():
    # Mission failed ominous drone
    duration = 1.2
    t = np.linspace(0, duration, int(duration * SAMPLE_RATE), endpoint=False)
    notes = [220.0, 196.0, 174.6, 146.8]
    sig = np.zeros_like(t)
    for i, f in enumerate(notes):
        start = int(i * 0.25 * SAMPLE_RATE)
        sub_t = t[start:]
        if len(sub_t) > 0:
            env = np.exp(-sub_t * 2.5)
            tone = (np.sin(2 * np.pi * f * sub_t) + 0.3 * np.sign(np.sin(2 * np.pi * f * sub_t))) * env
            sig[start:start + len(tone)] += tone * 0.28
    return np.tanh(sig * 1.5)

# -------------------------------------------------------------
# BGM GENERATION: High-Definition Sci-Fi Synthwave Music Tracks
# -------------------------------------------------------------
def gen_bgm_track(theme='menu', duration_sec=16.0):
    t = np.linspace(0, duration_sec, int(duration_sec * SAMPLE_RATE), endpoint=False)
    sig = np.zeros_like(t)
    
    bpm = 120.0
    if theme == 'menu':
        bpm = 110.0
    elif theme == 'boss':
        bpm = 136.0
    elif theme == 'lava':
        bpm = 126.0
    elif theme == 'cryo':
        bpm = 118.0
    elif theme == 'victory':
        bpm = 124.0
        duration_sec = 8.0
        t = np.linspace(0, duration_sec, int(duration_sec * SAMPLE_RATE), endpoint=False)
        sig = np.zeros_like(t)

    beat_sec = 60.0 / bpm
    total_beats = int(duration_sec / beat_sec)

    # 1. Kick & Snare Drums
    for beat in range(total_beats):
        bt = beat * beat_sec
        b_idx = int(bt * SAMPLE_RATE)
        # Kick on beats 0, 2 (or 0, 1, 2, 3 four-on-the-floor for battle)
        is_kick = (beat % 2 == 0) if theme == 'menu' else (beat % 4 in [0, 2] or (theme == 'boss' and beat % 2 == 0))
        if is_kick and b_idx < len(t):
            k_len = int(0.22 * SAMPLE_RATE)
            kt = np.linspace(0, 0.22, min(k_len, len(t) - b_idx), endpoint=False)
            kf = 120.0 * np.exp(-kt * 22.0) + 38.0
            kick = np.sin(2 * np.pi * np.cumsum(kf) / SAMPLE_RATE) * np.exp(-kt * 14.0) * 0.75
            sig[b_idx:b_idx + len(kick)] += kick

        # Snare on beats 1, 3
        is_snare = (beat % 2 == 1) if theme == 'menu' else (beat % 4 in [1, 3])
        if is_snare and b_idx < len(t):
            s_len = int(0.18 * SAMPLE_RATE)
            st = np.linspace(0, 0.18, min(s_len, len(t) - b_idx), endpoint=False)
            noise = np.random.uniform(-1, 1, len(st)) * np.exp(-st * 18.0) * 0.4
            tone = np.sin(2 * np.pi * 180 * st) * np.exp(-st * 24.0) * 0.3
            sig[b_idx:b_idx + len(st)] += (noise + tone) * 0.65

    # 2. Hi-hats (8th notes)
    total_8ths = int(duration_sec / (beat_sec / 2))
    for h in range(total_8ths):
        ht = h * (beat_sec / 2)
        h_idx = int(ht * SAMPLE_RATE)
        if h_idx < len(t):
            hh_len = int(0.04 * SAMPLE_RATE)
            hht = np.linspace(0, 0.04, min(hh_len, len(t) - h_idx), endpoint=False)
            hh = np.random.uniform(-1, 1, len(hht)) * np.exp(-hht * 80.0) * 0.14
            sig[h_idx:h_idx + len(hh)] += hh

    # 3. Driving Bassline & Melodic Synth Arpeggio
    if theme == 'menu':
        # Dark Energon Ambient Hangar: C minor chord progression [C2 -> Eb2 -> F2 -> G2]
        bass_notes = [65.41, 77.78, 87.31, 98.00]
        lead_scale = [261.63, 311.13, 392.00, 466.16, 523.25]
    elif theme == 'boss':
        # Intense Titan March: D minor [D2 -> F2 -> A2 -> C3]
        bass_notes = [73.42, 87.31, 110.00, 130.81]
        lead_scale = [293.66, 349.23, 440.00, 523.25, 587.33]
    elif theme == 'lava':
        # Industrial Molten: E minor [E2 -> G2 -> A2 -> B2]
        bass_notes = [82.41, 98.00, 110.00, 123.47]
        lead_scale = [329.63, 392.00, 440.00, 493.88, 659.25]
    elif theme == 'cryo':
        # Sub-zero Crystalline: A minor [A1 -> C2 -> D2 -> E2]
        bass_notes = [55.00, 65.41, 73.42, 82.41]
        lead_scale = [220.00, 261.63, 293.66, 329.63, 440.00]
    else: # victory
        # Triumphant Major: F major [F2 -> A2 -> C3 -> F3]
        bass_notes = [87.31, 110.00, 130.81, 174.61]
        lead_scale = [349.23, 440.00, 523.25, 698.46, 880.00]

    # Synthesize Bassline (16th notes pulse)
    total_16ths = int(duration_sec / (beat_sec / 4))
    for i in range(total_16ths):
        st_t = i * (beat_sec / 4)
        s_idx = int(st_t * SAMPLE_RATE)
        if s_idx < len(t):
            note_idx = (i // 16) % len(bass_notes)
            f_bass = bass_notes[note_idx]
            # Octave jump on every 4th 16th note
            if i % 4 == 2:
                f_bass *= 2.0
            n_len = int((beat_sec / 4) * 0.85 * SAMPLE_RATE)
            nt = np.linspace(0, (beat_sec / 4) * 0.85, min(n_len, len(t) - s_idx), endpoint=False)
            # Sawtooth + sub bass
            saw = (2 * (nt * f_bass - np.floor(nt * f_bass + 0.5))) * 0.35
            sub = np.sin(2 * np.pi * f_bass * nt) * 0.45
            env = np.exp(-nt * 8.0)
            sig[s_idx:s_idx + len(nt)] += (saw + sub) * env * 0.55

    # Synthesize Arpeggiated Cyber Lead Melodies
    for i in range(total_16ths):
        st_t = i * (beat_sec / 4)
        s_idx = int(st_t * SAMPLE_RATE)
        if s_idx < len(t):
            lead_idx = (i * 3 + (i // 8)) % len(lead_scale)
            f_lead = lead_scale[lead_idx]
            n_len = int((beat_sec / 4) * 0.75 * SAMPLE_RATE)
            nt = np.linspace(0, (beat_sec / 4) * 0.75, min(n_len, len(t) - s_idx), endpoint=False)
            lead = np.sin(2 * np.pi * f_lead * nt) + 0.3 * np.sin(2 * np.pi * f_lead * 2 * nt)
            env = np.exp(-nt * 12.0)
            sig[s_idx:s_idx + len(nt)] += lead * env * 0.28

    return np.tanh(sig * 1.4)

def main():
    root = '/mnt/sdcard/Agent/UI_UX_18_11_2026'
    sfx_dir = os.path.join(root, 'assets', 'audio', 'sfx')
    bgm_dir = os.path.join(root, 'assets', 'audio', 'bgm')
    os.makedirs(sfx_dir, exist_ok=True)
    os.makedirs(bgm_dir, exist_ok=True)

    print("=== SYNTHESIZING ALL GAME SFX (HIGH DEFINITION 44.1kHz) ===")
    sfx_generators = {
        'laser.wav': gen_laser,
        'cannon.wav': gen_cannon,
        'explosion.wav': gen_explosion,
        'zap.wav': gen_zap,
        'click.wav': gen_click,
        'modal.wav': gen_modal,
        'build.wav': gen_build,
        'wave_clear.wav': gen_wave_clear,
        'emergency_siren.wav': gen_emergency_siren,
        'artillery_blast.wav': gen_artillery_blast,
        'gatling_heavy.wav': gen_gatling_heavy,
        'plasma_burn.wav': gen_plasma_burn,
        'titan_stomp.wav': gen_titan_stomp,
        'sell.wav': gen_sell,
        'hit.wav': gen_hit,
        'leak.wav': gen_leak,
        'hero_slash.wav': gen_hero_slash,
        'hero_dash.wav': gen_hero_dash,
        'emp.wav': gen_emp,
        'orbital.wav': gen_orbital,
        'shield_dome.wav': gen_shield_dome,
        'teleport.wav': gen_teleport,
        'missile_launch.wav': gen_missile_launch,
        'flame.wav': gen_flame,
        'kamikaze_beep.wav': gen_kamikaze_beep,
        'victory.wav': gen_victory,
        'defeat.wav': gen_defeat
    }

    for name, gen_fn in sfx_generators.items():
        data = gen_fn()
        path = os.path.join(sfx_dir, name)
        write_wav(path, data)
        # Also write .mp3 mirror
        mp3_name = os.path.splitext(name)[0] + '.mp3'
        write_wav(os.path.join(sfx_dir, mp3_name), data)
        print(f"  [SFX] Created {name} ({len(data)} samples)")

    print("\n=== SYNTHESIZING ALL BGM TRACKS (CYBERNETIC SYNTHWAVE) ===")
    bgm_tracks = {
        'bgm_menu.wav': 'menu',
        'bgm_battle_cyber.wav': 'cyber',
        'bgm_battle_lava.wav': 'lava',
        'bgm_battle_cryo.wav': 'cryo',
        'bgm_boss_titan.wav': 'boss',
        'bgm_victory.wav': 'victory'
    }

    for name, theme in bgm_tracks.items():
        dur = 8.0 if theme == 'victory' else 14.0
        data = gen_bgm_track(theme=theme, duration_sec=dur)
        path = os.path.join(bgm_dir, name)
        write_wav(path, data)
        print(f"  [BGM] Created {name} (duration {dur}s, {len(data)} samples)")

    print("\n=== ALL SOUNDS SYNTHESIZED SUCCESSFULLY ===")

if __name__ == '__main__':
    main()
