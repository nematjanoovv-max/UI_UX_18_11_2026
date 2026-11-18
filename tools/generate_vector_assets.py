#!/usr/bin/env python3
"""
Generates clean neon vector SVG graphics for all towers, hostiles, and bosses.
"""

import os

os.makedirs("assets/sprites", exist_ok=True)

SPRITES = {
    # Towers
    "tower_pulse": """<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="8" y="8" width="48" height="48" rx="8" fill="#111827" stroke="#00e5ff" stroke-width="3"/>
  <circle cx="32" cy="32" r="14" fill="#00e5ff" fill-opacity="0.3" stroke="#00e5ff" stroke-width="2"/>
  <rect x="29" y="10" width="6" height="24" rx="2" fill="#00e5ff"/>
</svg>""",
    "tower_mortar": """<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="8" y="8" width="48" height="48" rx="8" fill="#1a1423" stroke="#ff9100" stroke-width="3"/>
  <circle cx="32" cy="32" r="16" fill="#ff9100" fill-opacity="0.25" stroke="#ff9100" stroke-width="2"/>
  <circle cx="32" cy="32" r="8" fill="#ff9100"/>
</svg>""",
    "tower_cryo": """<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="8" y="8" width="48" height="48" rx="8" fill="#0a192f" stroke="#00ffff" stroke-width="3"/>
  <polygon points="32,12 48,44 16,44" fill="none" stroke="#00ffff" stroke-width="3"/>
  <circle cx="32" cy="33" r="6" fill="#00ffff"/>
</svg>""",
    "tower_railgun": """<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="8" y="8" width="48" height="48" rx="8" fill="#1f132b" stroke="#e040fb" stroke-width="3"/>
  <line x1="12" y1="32" x2="52" y2="32" stroke="#e040fb" stroke-width="4"/>
  <rect x="42" y="26" width="12" height="12" fill="#e040fb"/>
</svg>""",
    "tower_beacon": """<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="8" y="8" width="48" height="48" rx="8" fill="#13231b" stroke="#00e676" stroke-width="3"/>
  <circle cx="32" cy="32" r="18" fill="none" stroke="#00e676" stroke-dasharray="4 4" stroke-width="2"/>
  <polygon points="32,18 42,38 22,38" fill="#00e676"/>
</svg>""",
    # Enemies
    "enemy_grunt": """<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="16" fill="#2d1215" stroke="#ff1744" stroke-width="3"/>
  <circle cx="24" cy="24" r="6" fill="#ff1744"/>
</svg>""",
    "enemy_sprinter": """<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <polygon points="36,24 14,12 18,24 14,36" fill="#ffea00" stroke="#ffd600" stroke-width="2"/>
</svg>""",
    "enemy_brute": """<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
  <rect x="10" y="10" width="36" height="36" rx="6" fill="#3e1b13" stroke="#ff3d00" stroke-width="4"/>
  <rect x="18" y="18" width="20" height="20" fill="#ff3d00"/>
</svg>""",
    "enemy_swarmling": """<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="8" fill="#d500f9"/>
</svg>""",
    "enemy_shieldbearer": """<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="15" fill="#102027" stroke="#29b6f6" stroke-width="3"/>
  <circle cx="24" cy="24" r="19" fill="none" stroke="#00e5ff" stroke-width="2" stroke-dasharray="3 3"/>
</svg>""",
    "enemy_medic": """<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="15" fill="#0d2b1d" stroke="#00e676" stroke-width="3"/>
  <rect x="21" y="14" width="6" height="20" fill="#00e676"/>
  <rect x="14" y="21" width="20" height="6" fill="#00e676"/>
</svg>""",
    "enemy_splitter": """<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="18" cy="24" r="10" fill="#f57c00"/>
  <circle cx="30" cy="24" r="10" fill="#ff9800"/>
</svg>""",
    "enemy_phantom": """<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <polygon points="24,10 38,36 24,30 10,36" fill="#7c4dff" fill-opacity="0.6" stroke="#b388ff" stroke-width="2"/>
</svg>""",
    # Bosses
    "boss_juggernaut": """<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
  <rect x="12" y="12" width="48" height="48" rx="8" fill="#3b0f14" stroke="#ff1744" stroke-width="5"/>
  <circle cx="36" cy="36" r="14" fill="#ff1744"/>
</svg>""",
    "boss_overseer": """<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
  <circle cx="36" cy="36" r="26" fill="#1a1235" stroke="#d500f9" stroke-width="5"/>
  <polygon points="36,18 48,46 24,46" fill="#d500f9"/>
</svg>""",
    "boss_hive_titan": """<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <polygon points="40,8 72,26 72,62 40,78 8,62 8,26" fill="#2d0a0e" stroke="#ff0055" stroke-width="5"/>
  <circle cx="40" cy="43" r="18" fill="#ff0055"/>
</svg>"""
}

for name, svg in SPRITES.items():
    with open(f"assets/sprites/{name}.svg", "w", encoding="utf-8") as f:
        f.write(svg)

print(f"Generated {len(SPRITES)} vector assets in assets/sprites/")
