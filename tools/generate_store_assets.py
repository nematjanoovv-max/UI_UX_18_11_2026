#!/usr/bin/env python3
"""
generate_store_assets.py
Generates official Google Play Store assets:
1. app_icon_512.png (512x512 high-resolution app icon)
2. feature_graphic_1024x500.png (1024x500 promo banner)
3. google_play_listing.md (Complete 3-language store listing & metadata)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont

def ensure_dir(d):
    os.makedirs(d, exist_ok=True)

def generate_app_icon(output_path):
    size = (512, 512)
    img = Image.new("RGBA", size, (5, 8, 17, 255))
    draw = ImageDraw.Draw(img)

    cx, cy = 256, 256

    # 1. Radial background glow
    for r in range(256, 0, -8):
        alpha = int(45 * (1 - r / 256))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(0, 229, 255, alpha))

    # 2. Outer Cyber Shield Octagon
    oct_r = 210
    points = []
    for i in range(8):
        angle = math.radians(45 * i + 22.5)
        px = cx + oct_r * math.cos(angle)
        py = cy + oct_r * math.sin(angle)
        points.append((px, py))
    
    draw.polygon(points, fill=(10, 20, 36, 240), outline=(0, 229, 255, 255), width=6)

    # 3. Inner shield ring
    inner_points = []
    for i in range(8):
        angle = math.radians(45 * i + 22.5)
        px = cx + 180 * math.cos(angle)
        py = cy + 180 * math.sin(angle)
        inner_points.append((px, py))
    draw.polygon(inner_points, outline=(255, 214, 0, 200), width=3)

    # 4. Stylized Defense Turret / Plasma Cannon Base
    draw.polygon([
        (cx - 70, cy + 120),
        (cx + 70, cy + 120),
        (cx + 45, cy + 40),
        (cx - 45, cy + 40)
    ], fill=(18, 32, 55, 255), outline=(0, 229, 255, 255), width=4)

    # Turret Head / Core
    draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=(24, 45, 75, 255), outline=(255, 0, 127, 255), width=5)
    draw.ellipse([cx - 22, cy - 22, cx + 22, cy + 22], fill=(0, 229, 255, 255))

    # Twin Plasma Barrels firing upward
    barrel_w = 14
    draw.rectangle([cx - 32, cy - 110, cx - 32 + barrel_w, cy - 35], fill=(0, 229, 255, 255), outline=(255, 255, 255, 255), width=2)
    draw.rectangle([cx + 18, cy - 110, cx + 18 + barrel_w, cy - 35], fill=(0, 229, 255, 255), outline=(255, 255, 255, 255), width=2)

    # Laser Beams Burst
    draw.line([(cx - 25, cy - 110), (cx - 25, cy - 165)], fill=(0, 255, 200, 255), width=6)
    draw.line([(cx + 25, cy - 110), (cx + 25, cy - 165)], fill=(0, 255, 200, 255), width=6)
    draw.ellipse([cx - 35, cy - 175, cx - 15, cy - 155], fill=(255, 255, 255, 255))
    draw.ellipse([cx + 15, cy - 175, cx + 35, cy - 155], fill=(255, 255, 255, 255))

    # Tactical Chevron Accents
    for dy in [-15, 10, 35]:
        draw.line([(cx - 15, cy + 140 + dy), (cx, cy + 152 + dy), (cx + 15, cy + 140 + dy)], fill=(255, 214, 0, 255), width=3)

    img.save(output_path, "PNG")
    print(f"Generated App Icon: {output_path}")

def generate_feature_graphic(output_path):
    width, height = 1024, 500
    img = Image.new("RGBA", (width, height), (5, 8, 16, 255))
    draw = ImageDraw.Draw(img)

    # 1. Background Grid & Cyber Atmosphere
    for y in range(0, height, 40):
        draw.line([(0, y), (width, y)], fill=(0, 229, 255, 22), width=1)
    for x in range(0, width, 40):
        draw.line([(x, 0), (x, height)], fill=(0, 229, 255, 22), width=1)

    # Center-left energy burst
    for r in range(260, 0, -10):
        alpha = int(40 * (1 - r / 260))
        draw.ellipse([280 - r, 250 - r, 280 + r, 250 + r], fill=(0, 229, 255, alpha))
        draw.ellipse([780 - r, 250 - r, 780 + r, 250 + r], fill=(255, 0, 127, alpha // 2))

    # Outer border hazard frame
    draw.rectangle([12, 12, width - 12, height - 12], outline=(0, 229, 255, 140), width=3)
    draw.rectangle([20, 20, width - 20, height - 20], outline=(255, 214, 0, 80), width=1)

    # Cyber Shield Emblem on Left
    cx, cy = 200, 250
    oct_r = 140
    points = []
    for i in range(8):
        angle = math.radians(45 * i + 22.5)
        points.append((cx + oct_r * math.cos(angle), cy + oct_r * math.sin(angle)))
    draw.polygon(points, fill=(12, 22, 40, 230), outline=(0, 229, 255, 255), width=4)

    # Inner Core
    draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=(0, 229, 255, 255), outline=(255, 255, 255, 255), width=4)
    draw.polygon([(cx - 25, cy + 50), (cx + 25, cy + 50), (cx, cy + 85)], fill=(255, 214, 0, 255))

    # Try loading custom fonts or fallback
    try:
        font_title = ImageFont.truetype("/system/fonts/Roboto-Bold.ttf", 46)
        font_sub = ImageFont.truetype("/system/fonts/Roboto-Bold.ttf", 22)
        font_badge = ImageFont.truetype("/system/fonts/Roboto-Regular.ttf", 15)
    except:
        font_title = font_sub = font_badge = ImageFont.load_default()

    # Title & Text on Right
    draw.text((380, 105), "TOWER DEFENSE", fill=(255, 214, 0, 255), font=font_sub)
    draw.text((380, 140), "LAST GRID", fill=(0, 229, 255, 255), font=font_title)
    draw.text((380, 215), "CYBERNETIC TACTICAL WARFARE • v3.8.0", fill=(255, 0, 127, 255), font=font_sub)

    # Feature Badges
    badges = [
        "10 TACTICAL SECTORS",
        "3 BIOMES (CYBER, LAVA, CRYO)",
        "3 TITAN BOSSES",
        "ENDLESS SURVIVAL",
        "3D TPS ARENA MODE",
        "100% OFFLINE STANDALONE"
    ]
    bx, by = 380, 270
    for i, b in enumerate(badges):
        rx = bx + (i % 2) * 290
        ry = by + (i // 2) * 44
        draw.rectangle([rx, ry, rx + 275, ry + 34], fill=(15, 26, 46, 240), outline=(0, 229, 255, 180), width=1)
        draw.text((rx + 12, ry + 8), f"★ {b}", fill=(255, 255, 255, 240), font=font_badge)

    img.save(output_path, "PNG")
    print(f"Generated Feature Graphic: {output_path}")

def generate_store_listing(output_path):
    md = """# Google Play Store Listing: Tower Defense: Last Grid (v3.8.0)

## 1. App Identity & Basics
- **App Title**: `Tower Defense: Last Grid` (26 / 30 chars)
- **Package Name**: `com.lastgrid.towerdefense`
- **Version**: `3.8.0` (VersionCode: `380`)
- **Target SDK**: `33` (Android 13+ compliant) | **Min SDK**: `21` (Android 5.0+)
- **Category**: Strategy / Tower Defense / Sci-Fi
- **Content Rating**: Everyone 10+ (Fantasy Violence)

---

## 2. Short Description (Max 80 chars)
- **English**: `Hardcore cybernetic tower defense with controllable mech & 3D combat arena.` (76 chars)
- **Uzbek**: `Kibernetik taktik minora mudofaasi: qahramon mexi, 3D jang va cheksiz rejim.` (76 chars)
- **Russian**: `Кибернетический тактический Tower Defense: мех, 3D арена и бесконечный режим.` (77 chars)

---

## 3. Full Description (Uzbek)
**Tower Defense: Last Grid** — bu kiberpank uslubidagi yuqori intellektual taktik minora mudofaasi o'yini. Dushman to'dalaridan o'z kvant bazangizni himoya qiling, maydonni taktik to'siqlar bilan o'zgartiring va bevosita boshqariluvchi **Apex-01** qahramoni bilan jangga kiring!

### 🔥 ASOSIY IMKONIYATLAR:
* **10 Taktik Sektor & 3 Biom**:
  * ⚡ **Cyber Grid**: Klassik neon shahar mudofaasi.
  * 🌋 **Lava Core**: Magma oqimlari va vulqon atmosferasi.
  * ❄️ **Cryo Base**: Muzlatuvchi qor bo'ronlari va sub-zero poligon.
* **5 Ta Asosiy Minora & 10 Ta Tier-3 Ixtisoslashuv**:
  * Gatling / Minigun / Plazma
  * Mortar / Napalm Zarba / Klaster Bomba
  * Cryo Emitter / Blizzard / Absolute Zero
  * Railgun / EMP Disruptor / Giper-Tezlik
  * Kvant Mayoq / Radar / Energiya Kuchaytirgich
* **3 Ta Titan Boss & Multi-Faza AI**:
  * ☠️ **Juggernaut (Wave 10)**: 50% HP Enrage rejimi bilan reaktiv zarba.
  * 👁️ **Overseer (Wave 20)**: Energiya qalqoni va dronlar to'dasi.
  * ☣️ **Hive Titan (Wave 30)**: 3 fazali apokalipsis giganti.
* **Super Qobiliyatlar Paneli (Commander Skills)**:
  * ⚡ **EMP Zarba**: Dushmanlarni 3.5 soniyaga qotirib qo'yadi.
  * 🛰️ **Orbital Lazer**: Yuqori quvvatli plazma nurlari.
  * ⚙️ **Overclock**: Minoralarning otish tezligini +60% ga oshiradi.
  * 🛸 **Jangovar Dron**: Resurs va qo'llab-quvvatlash.
* **♾️ Cheksiz Omon Qolish (Endless Survival)**:
  * 30-to'lqindan so'ng bazangizni saqlagan holda cheksiz to'lqinlar bilan jang qiling va global rekord o'rnating!
* **🎮 3D TPS Arena Rejimi**:
  * Minora mudofaasidan to'g'ridan-to'g'ri 3-shaxs otishma arenasiga o'ting!
* **100% Oflayn & Avtomatik Moslashuv**:
  * Internetsiz to'liq ishlaydi. 20:9 AMOLED, punch-hole va barcha ekranlarga to'liq moslashadi.

---

## 4. Full Description (English)
**Tower Defense: Last Grid** delivers intense cyber-neon tactical warfare. Command the battlefield by constructing advanced defense towers, manipulating enemy choke-points with destructible barricades, and piloting the frontline **Apex-01 Hero Mech**!

### Key Features:
* **10 Progressive Grid Sectors across 3 Biomes**: Cyber Grid, Volcanic Lava Core, and Frozen Cryo Base.
* **5 Defense Towers with 10 Tier-3 Branch Upgrades**: Gatling, Plasma, Napalm, Railgun, EMP and Radar Beacons.
* **3 Multi-Phase Boss Encounters**: Juggernaut Enrage, Overseer Shield Pulse, and Hive Titan Swarms.
* **Commander Super Skills**: EMP Shockwave, Orbital Death Beam, Tower Overclock, and Tactical Cargo Drones.
* **Endless Survival Mode**: Push beyond Wave 30 and challenge infinite enemy scaling for leaderboard supremacy.
* **Full 3D TPS Arena Combat**: Switch into third-person shooter action and fight alongside your defense towers.
* **Complete Offline Standalone**: Zero mandatory ads, fully offline, calibrated for all modern Android displays.

---

## 5. Keywords & Tags
`tower defense`, `td`, `strategy`, `cyberpunk`, `sci-fi`, `offline`, `tactical`, `mech`, `3d shooter`, `robot`, `endless survival`
"""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"Generated Store Listing: {output_path}")

def main():
    out_dir = "/mnt/sdcard/Agent/UI_UX_18_11_2026/store_assets"
    ensure_dir(out_dir)
    generate_app_icon(os.path.join(out_dir, "app_icon_512.png"))
    generate_feature_graphic(os.path.join(out_dir, "feature_graphic_1024x500.png"))
    generate_store_listing(os.path.join(out_dir, "google_play_listing.md"))

if __name__ == "__main__":
    main()
