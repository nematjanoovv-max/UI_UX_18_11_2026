import os
import zipfile

def pack_zip():
    base_dir = '/mnt/sdcard/Agent/UI_UX_18_11_2026'
    zip_path = os.path.join(base_dir, 'last-grid-offline-v2.zip')
    
    files_to_include = [
        'index.html',
        'game.js',
        'codex_3d_engine.js',
        'apex_mech.js',
        'transformers_mech.js',
        'sw.js',
        'manifest.json',
        'icon.svg'
    ]
    
    dirs_to_include = [
        'libs',
        'data',
        'assets'
    ]
    
    print(f"Creating {zip_path}...")
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for fname in files_to_include:
            fpath = os.path.join(base_dir, fname)
            if os.path.exists(fpath):
                zf.write(fpath, fname)
                print(f"  + file: {fname}")
                
        for dname in dirs_to_include:
            dpath = os.path.join(base_dir, dname)
            for root, dirs, files in os.walk(dpath):
                for f in files:
                    if f.endswith('.tmp') or f.endswith('.bak') or f.endswith('.log'):
                        continue
                    full_p = os.path.join(root, f)
                    rel_p = os.path.relpath(full_p, base_dir)
                    zf.write(full_p, rel_p)
    
    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"Zip created successfully! Size: {size_mb:.2f} MB")
    
    # Copy to web/
    web_zip = os.path.join(base_dir, 'web', 'last-grid-offline-v2.zip')
    os.makedirs(os.path.dirname(web_zip), exist_ok=True)
    with open(zip_path, 'rb') as src, open(web_zip, 'wb') as dst:
        dst.write(src.read())
    print(f"Copied to {web_zip}")

if __name__ == '__main__':
    pack_zip()
