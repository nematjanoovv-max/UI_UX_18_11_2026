#!/usr/bin/env python3
"""
Generate high-definition, punchy, cinematic sci-fi sound effects (44.1kHz 16-bit WAV)
for Tower Defense: Last Grid.
"""
import os
import math
import wave
import struct
import random

SAMPLE_RATE = 44100

def write_wav(path, samples):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        raw = bytearray()
        for s in samples:
            val = int(max(-1.0, min(1.0, s)) * 32767.0)
            raw.extend(struct.pack('<h', val))
        wf.writeframes(raw)
    print(f"Generated {path} ({len(samples)/SAMPLE_RATE:.2f}s)")

# 1. Laser / Pulse Cannon: High-speed plasma bolt with sharp transient chirp + resonant tail
def gen_laser():
    duration = 0.22
    n = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 18.0)
        # Pitch envelope drops rapidly from 2400Hz to 320Hz
        freq = 320.0 + 2080.0 * math.exp(-t * 28.0)
        phase = 2.0 * math.pi * (320.0 * t - (2080.0 / 28.0) * (math.exp(-t * 28.0) - 1.0))
        # Fundamental saw + sine sub
        saw = (phase % (2.0 * math.pi)) / math.pi - 1.0
        sub = math.sin(phase * 0.5)
        # FM modulation for laser bite
        fm = math.sin(phase + 0.6 * math.sin(phase * 3.5))
        s = (0.55 * saw + 0.35 * sub + 0.3 * fm) * env
        # Soft saturation
        s = math.tanh(s * 1.5)
        samples.append(s * 0.85)
    return samples

# 2. Cannon / Heavy Mortar: Punchy 45Hz sub-bass thump + metallic breech blast
def gen_cannon():
    duration = 0.55
    n = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 7.5)
        # Deep sub pitch drop: 160Hz -> 42Hz
        freq = 42.0 + 118.0 * math.exp(-t * 22.0)
        phase = 2.0 * math.pi * (42.0 * t - (118.0 / 22.0) * (math.exp(-t * 22.0) - 1.0))
        sub = math.sin(phase)
        # White noise burst at start
        noise = (random.random() * 2.0 - 1.0) * math.exp(-t * 35.0)
        # Metallic mechanical ring
        ring = math.sin(2.0 * math.pi * 320.0 * t) * math.exp(-t * 14.0) * 0.35
        s = (0.75 * sub + 0.5 * noise + ring) * env
        s = math.tanh(s * 1.8)
        samples.append(s * 0.90)
    return samples

# 3. Explosion: Deep subterranean shockwave + explosive crackle + low-end rumble
def gen_explosion():
    duration = 0.85
    n = int(duration * SAMPLE_RATE)
    samples = []
    # Lowpass filter state
    lp = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 4.2)
        # Pitch sweep: 90Hz -> 32Hz
        sub_phase = 2.0 * math.pi * (32.0 * t - (58.0 / 8.0) * (math.exp(-t * 8.0) - 1.0))
        sub = math.sin(sub_phase) * 0.8
        # Filtered explosive noise
        raw_noise = random.random() * 2.0 - 1.0
        # Dynamic filter cutoff
        alpha = min(0.85, 0.05 + 0.75 * math.exp(-t * 12.0))
        lp += alpha * (raw_noise - lp)
        # Distant secondary rumble
        rumble = math.sin(2.0 * math.pi * 26.0 * t) * math.exp(-t * 3.0) * 0.4
        s = (0.55 * sub + 0.65 * lp + rumble) * env
        s = math.tanh(s * 2.2)
        samples.append(s * 0.92)
    return samples

# 4. Zap / Tesla Coil: High-voltage electrical arcing with FM buzz + harmonic crackle
def gen_zap():
    duration = 0.38
    n = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 9.0)
        # FM modulation for electric buzz (carrier 880Hz, modulator 120Hz)
        mod = math.sin(2.0 * math.pi * 120.0 * t) * 4.0
        carrier = math.sin(2.0 * math.pi * 880.0 * t + mod)
        # High-voltage jitter crackle
        jitter = (random.random() * 2.0 - 1.0) * (0.35 if (i % 7 == 0) else 0.08)
        # Sub harmonic
        sub = math.sin(2.0 * math.pi * 220.0 * t) * 0.4
        s = (0.6 * carrier + 0.4 * jitter + sub) * env
        s = math.tanh(s * 1.6)
        samples.append(s * 0.85)
    return samples

# 5. Tactile Click / UI Tap: Ultra-clean, crisp modern sci-fi haptic tap
def gen_click():
    duration = 0.045
    n = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 95.0)
        tone = math.sin(2.0 * math.pi * 1850.0 * t) * 0.7
        sub = math.sin(2.0 * math.pi * 420.0 * t) * 0.5
        noise = (random.random() * 2.0 - 1.0) * 0.25 * math.exp(-t * 180.0)
        s = (tone + sub + noise) * env
        samples.append(s * 0.75)
    return samples

# 6. Holographic Build / Upgrade: Uplifting cyber chime arpeggio (C6 - E6 - G6)
def gen_build():
    duration = 0.32
    n = int(duration * SAMPLE_RATE)
    samples = []
    notes = [1046.5, 1318.5, 1567.98] # C6, E6, G6
    for i in range(n):
        t = i / SAMPLE_RATE
        s = 0.0
        for idx, freq in enumerate(notes):
            tStart = idx * 0.065
            if t >= tStart:
                dt = t - tStart
                env = math.exp(-dt * 14.0)
                tone = math.sin(2.0 * math.pi * freq * dt)
                overtone = math.sin(2.0 * math.pi * freq * 2.0 * dt) * 0.25
                s += (tone + overtone) * env * 0.38
        samples.append(s * 0.85)
    return samples

# 7. Wave Clear / Victory: Triumphant sci-fi fanfare chords
def gen_wave_clear():
    duration = 0.85
    n = int(duration * SAMPLE_RATE)
    samples = []
    chords = [
        (0.0, 523.25),   # C5
        (0.12, 659.25),  # E5
        (0.24, 783.99),  # G5
        (0.38, 1046.50), # C6
        (0.38, 1318.51)  # E6
    ]
    for i in range(n):
        t = i / SAMPLE_RATE
        s = 0.0
        for tStart, freq in chords:
            if t >= tStart:
                dt = t - tStart
                env = math.exp(-dt * 4.5)
                # Brass synth oscillator (saw + sine)
                phase = 2.0 * math.pi * freq * dt
                saw = (phase % (2.0 * math.pi)) / math.pi - 1.0
                sine = math.sin(phase)
                s += (0.45 * saw + 0.55 * sine) * env * 0.32
        # Deep bass foundation
        if t >= 0.38:
            dt = t - 0.38
            s += math.sin(2.0 * math.pi * 130.81 * dt) * math.exp(-dt * 3.5) * 0.4
        s = math.tanh(s * 1.3)
        samples.append(s * 0.88)
    return samples

# 8. Modal Open: Futuristic cyber interface sweep
def gen_modal():
    duration = 0.18
    n = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 16.0)
        freq = 600.0 + 1200.0 * (t / duration)
        phase = 2.0 * math.pi * (600.0 * t + 600.0 * (t * t / duration))
        tone = math.sin(phase)
        shimmer = math.sin(phase * 2.5) * 0.25
        s = (tone + shimmer) * env
        samples.append(s * 0.70)
    return samples

# 9. Emergency Siren / Tactical Alert: Menacing Cybertronian alert pulse
def gen_emergency_siren():
    duration = 0.75
    n = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        cycle = math.sin(2.0 * math.pi * 3.2 * t)
        freq = 650.0 + 260.0 * cycle
        phase = 2.0 * math.pi * freq * t
        saw = (phase % (2.0 * math.pi)) / math.pi - 1.0
        env = 0.75 + 0.25 * math.sin(2.0 * math.pi * 6.4 * t)
        s = saw * env * 0.75
        samples.append(s)
    return samples

# 10. Artillery Blast / Titan Stomp: Massive shockwave blast
def gen_artillery_blast():
    duration = 0.95
    n = int(duration * SAMPLE_RATE)
    samples = []
    lp = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 3.6)
        sub = math.sin(2.0 * math.pi * 38.0 * t) * 0.95
        noise = random.random() * 2.0 - 1.0
        alpha = min(0.9, 0.04 + 0.8 * math.exp(-t * 10.0))
        lp += alpha * (noise - lp)
        s = (0.7 * sub + 0.6 * lp) * env
        s = math.tanh(s * 2.5)
        samples.append(s * 0.92)
    return samples

# 11. Gatling Autocannon: Heavy rotary kinetic burst
def gen_gatling():
    duration = 0.16
    n = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 26.0)
        pop = math.sin(2.0 * math.pi * 210.0 * t) * math.exp(-t * 35.0)
        crack = (random.random() * 2.0 - 1.0) * math.exp(-t * 50.0) * 0.65
        s = (pop + crack) * env
        samples.append(s * 0.85)
    return samples

# 12. Plasma Burn / Flame: Continuous high-energy thermal roar
def gen_plasma_burn():
    duration = 0.52
    n = int(duration * SAMPLE_RATE)
    samples = []
    lp = 0.0
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.sin(math.pi * min(1.0, t / 0.05)) * math.exp(-max(0.0, t - 0.2) * 5.5)
        raw = random.random() * 2.0 - 1.0
        lp += 0.25 * (raw - lp)
        hum = math.sin(2.0 * math.pi * 140.0 * t) * 0.4
        s = (lp * 0.75 + hum) * env
        samples.append(s * 0.85)
    return samples

# 13. Titan Stomp: Subterranean ground-impact earthquake
def gen_titan_stomp():
    duration = 0.65
    n = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 6.0)
        sub = math.sin(2.0 * math.pi * 28.0 * t) * 1.0
        thump = math.sin(2.0 * math.pi * 65.0 * t) * math.exp(-t * 18.0) * 0.8
        crunch = (random.random() * 2.0 - 1.0) * math.exp(-t * 24.0) * 0.45
        s = (sub + thump + crunch) * env
        s = math.tanh(s * 2.0)
        samples.append(s * 0.90)
    return samples

def main():
    root = "/mnt/sdcard/Agent/UI_UX_18_11_2026/assets/audio/sfx"
    gens = {
        "laser.wav": gen_laser,
        "laser.mp3": gen_laser, # Write as wav format with mp3 extension for seamless WebAudio loading
        "cannon.wav": gen_cannon,
        "cannon.mp3": gen_cannon,
        "explosion.wav": gen_explosion,
        "explosion.mp3": gen_explosion,
        "zap.wav": gen_zap,
        "zap.mp3": gen_zap,
        "click.wav": gen_click,
        "click.mp3": gen_click,
        "build.wav": gen_build,
        "build.mp3": gen_build,
        "wave_clear.wav": gen_wave_clear,
        "wave_clear.mp3": gen_wave_clear,
        "modal.wav": gen_modal,
        "modal.mp3": gen_modal,
        "emergency_siren.wav": gen_emergency_siren,
        "artillery_blast.wav": gen_artillery_blast,
        "gatling_heavy.wav": gen_gatling,
        "plasma_burn.wav": gen_plasma_burn,
        "titan_stomp.wav": gen_titan_stomp
    }
    for filename, fn in gens.items():
        path = os.path.join(root, filename)
        samples = fn()
        write_wav(path, samples)
    print("ALL SFX GENERATED SUCCESSFULLY!")

if __name__ == '__main__':
    main()
