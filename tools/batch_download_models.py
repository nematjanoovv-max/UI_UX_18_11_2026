import os
import sys
import time
from sketchfab_fetcher import download_model

TOKEN = "98dbaedcf2a64330a6bd16a13b43e94a"
BASE_DIR = "/mnt/sdcard/Agent/UI_UX_18_11_2026/assets/models"

BATCH = [
    ("turret_beacon.glb", "ed6850e61792430581c8f9851fb7b4c5", "Radar Beacon"),
    ("turret_barricade.glb", "74e8408828da4ce9b0faead75c01e0dd", "Blast Barricade"),
    ("enemy_sprinter.glb", "745c8026934a450fb4c8c99568463860", "Sprinter Robot Dog"),
    ("enemy_brute.glb", "f5536df4400d408096973799d200f797", "Centurion Heavy Brute Mech"),
    ("enemy_medic.glb", "a1760eb7ba0c4005a33b27d6796a47aa", "Critical Medical Drone"),
    ("enemy_splitter.glb", "294e79652f494130ad2ab00a13fdbafd", "Buster Splitter Drone"),
    ("boss_juggernaut.glb", "f846f2d3fbf640d9bd79be9c17bd67b6", "Goliath Sci-Fi Siege Tank"),
    ("boss_overseer.glb", "ffdd7e54fa194885919e24029d1f3e91", "Overseer Sphere Bot")
]

print("=== STARTING BATCH DOWNLOAD FROM SKETCHFAB ===")
for filename, uid, desc in BATCH:
    out_path = os.path.join(BASE_DIR, filename)
    print(f"\n[MODEL] {desc} -> {filename} (UID: {uid})")
    try:
        download_model(uid, TOKEN, out_path)
        sz = os.path.getsize(out_path) // 1024
        print(f"✓ Downloaded successfully ({sz} KB)")
    except Exception as e:
        print(f"✗ Failed to download {filename}: {e}")
    time.sleep(2.0)

print("\n=== BATCH DOWNLOAD COMPLETED ===")
