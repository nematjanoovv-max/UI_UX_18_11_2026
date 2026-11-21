import sys, os, time
sys.path.append('/mnt/sdcard/Agent/UI_UX_18_11_2026/tools')
from sketchfab_fetcher import download_model
from glb_optimizer import optimize_glb

TOKEN = '98dbaedcf2a64330a6bd16a13b43e94a'
BASE = '/mnt/sdcard/Agent/UI_UX_18_11_2026/assets/models'

items = [
    ('turret_tesla.glb', 'a493bb91843149e8a57c591ac9c75316', 'TeslaCoil Turret'),
    ('enemy_shieldbearer.glb', 'dae0366489e54d10b15c1315407cac33', 'Robot Warrior Shield')
]

for fname, uid, name in items:
    out = os.path.join(BASE, fname)
    print(f"\n[START] {name} ({uid})")
    try:
        download_model(uid, TOKEN, out)
        sz = os.path.getsize(out) // 1024
        print(f"Downloaded {fname}: {sz} KB. Now optimizing...")
        opt = out + '.opt.glb'
        optimize_glb(out, opt, max_dim=512, jpeg_quality=80)
        new_sz = os.path.getsize(opt) // 1024
        if new_sz < sz:
            os.replace(opt, out)
            print(f"✓ Replaced with optimized version: {sz} KB -> {new_sz} KB")
        else:
            if os.path.exists(opt): os.remove(opt)
    except Exception as e:
        print(f"✗ Failed {name}: {e}")
    time.sleep(2.0)

print("\n=== COMPLETED TESLA & SHIELDBEARER ===")
