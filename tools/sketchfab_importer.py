#!/usr/bin/env python3
"""
Sketchfab API Manager & 3D Asset Importer
Enables searching, downloading GLB models, and inspecting metadata via Sketchfab Data API v3.
"""
import sys
import os
import re
import json
import urllib.request
import urllib.parse
import argparse

TOKEN_FILE = os.path.join(os.path.dirname(__file__), ".sketchfab_token")
DEFAULT_TOKEN = "98dbaedcf2a64330a6bd16a13b43e94a"

def get_token():
    if os.path.exists(TOKEN_FILE):
        try:
            with open(TOKEN_FILE, "r") as f:
                t = f.read().strip()
                if t: return t
        except Exception:
            pass
    return os.environ.get("SKETCHFAB_API_TOKEN", DEFAULT_TOKEN)

def save_token(token):
    with open(TOKEN_FILE, "w") as f:
        f.write(token.strip())
    print("Sketchfab API token saqlandi!")

def api_request(endpoint, token=None):
    if not token:
        token = get_token()
    url = f"https://api.sketchfab.com/v3/{endpoint.lstrip('/')}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Token {token}")
    req.add_header("User-Agent", "LastGrid3DEngine/1.0")
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode("utf-8")
            return json.loads(data)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        print(f"[XATO] HTTP {e.code}: {err_msg}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[XATO]: {e}", file=sys.stderr)
        return None

def extract_uid(input_str):
    input_str = input_str.strip()
    # If full URL like https://sketchfab.com/3d-models/name-uid
    m = re.search(r"([0-9a-fA-F]{32})", input_str)
    if m:
        return m.group(1)
    # If 27/28-char alphanumeric UID
    m2 = re.search(r"([a-zA-Z0-9_\-]{20,36})", input_str)
    if m2:
        return m2.group(1)
    return input_str

def cmd_me():
    token = get_token()
    data = api_request("me", token)
    if data:
        print("=== Sketchfab Profil Ma'lumotlari ===")
        print(f"Foydalanuvchi: {data.get('displayName')} (@{data.get('username')})")
        print(f"UID: {data.get('uid')}")
        print(f"Email: {data.get('email')}")
        print(f"Tarif: {data.get('account')}")
        print(f"Profil: {data.get('profileUrl')}")
        return True
    return False

def cmd_search(query, tag=None, limit=10):
    params = {
        "downloadable": "true",
        "sort_by": "-likeCount"
    }
    if query:
        params["q"] = query
    if tag:
        params["tags"] = tag

    qs = urllib.parse.urlencode(params)
    data = api_request(f"models?{qs}")
    if not data:
        print("Qidiruvda xatolik yuz berdi.")
        return

    results = data.get("results", [])
    if not results:
        print(f"'{query}' bo'yicha yuklab olinadigan model topilmadi.")
        return

    print(f"\nTopilgan modellar (Jami: {len(results)}, Ko'rsatilmoqda: {min(limit, len(results))}):")
    print("-" * 75)
    for i, m in enumerate(results[:limit], 1):
        uid = m.get("uid")
        name = m.get("name")
        author = m.get("user", {}).get("displayName", "Noma'lum")
        likes = m.get("likeCount", 0)
        faces = m.get("faceCount", 0)
        anims = m.get("animationCount", 0)
        url = m.get("viewerUrl")
        print(f"{i}. [{uid}] {name}")
        print(f"   Muallif: {author} | Yoqtirishlar: {likes} | Poligonlar: {faces:,} | Animatsiyalar: {anims}")
        print(f"   Havola: {url}")
        print("-" * 75)

def cmd_info(target):
    uid = extract_uid(target)
    m = api_request(f"models/{uid}")
    if not m:
        print(f"Model topilmadi: {uid}")
        return

    print("\n=== Model Tafsilotlari ===")
    print(f"Nomi: {m.get('name')}")
    print(f"UID: {m.get('uid')}")
    print(f"Muallif: {m.get('user', {}).get('displayName')}")
    print(f"Yuklab olish ruxsati: {'HA (Downloadable)' if m.get('isDownloadable') else 'YOQ'}")
    print(f"Poligonlar: {m.get('faceCount'):,}")
    print(f"Animatsiyalar soni: {m.get('animationCount', 0)}")
    print(f"Ko'rishlar: {m.get('viewCount')}")
    print(f"Yoqtirishlar: {m.get('likeCount')}")
    print(f"Sketchfab sahifasi: {m.get('viewerUrl')}")

def cmd_download(target, output_path=None):
    uid = extract_uid(target)
    print(f"Model uchun yuklab olish havolasi olinmoqda (UID: {uid})...")
    dl_info = api_request(f"models/{uid}/download")
    if not dl_info:
        print("Yuklab olish havolasini olib bo'lmadi. Token yoki model ruxsatini tekshiring.")
        return None

    # Check for direct GLB format first
    glb_obj = dl_info.get("glb")
    gltf_obj = dl_info.get("gltf")
    source_obj = dl_info.get("source")

    dl_url = None
    is_zip = False
    file_ext = ".glb"

    if glb_obj and glb_obj.get("url"):
        dl_url = glb_obj.get("url")
        file_size = glb_obj.get("size", 0)
        file_ext = ".glb"
        print(f"To'g'ridan-to'g'ri GLB formati topildi (Hajmi: {file_size / (1024*1024):.2f} MB)")
    elif gltf_obj and gltf_obj.get("url"):
        dl_url = gltf_obj.get("url")
        file_size = gltf_obj.get("size", 0)
        is_zip = True
        file_ext = ".zip"
        print(f"GLTF ZIP arxivi topildi (Hajmi: {file_size / (1024*1024):.2f} MB)")
    elif source_obj and source_obj.get("url"):
        dl_url = source_obj.get("url")
        file_size = source_obj.get("size", 0)
        is_zip = True
        file_ext = ".zip"
        print(f"Source ZIP arxivi topildi (Hajmi: {file_size / (1024*1024):.2f} MB)")
    else:
        print("Ushbu model uchun mavjud yuklab olish formatlari topilmadi.")
        return None

    if not output_path:
        output_path = f"assets/models/{uid}{file_ext}"

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    print(f"Yuklab olinmoqda: {output_path}...")

    def reporthook(block_num, block_size, total_size):
        if total_size > 0:
            percent = (block_num * block_size / total_size) * 100
            sys.stdout.write(f"\rYuklanish: {percent:.1f}% ({block_num*block_size/(1024*1024):.2f}/{total_size/(1024*1024):.2f} MB)")
            sys.stdout.flush()

    try:
        urllib.request.urlretrieve(dl_url, output_path, reporthook)
        print(f"\nMuvaffaqiyatli saqlandi: {output_path}")
        return output_path
    except Exception as e:
        print(f"\nYuklab olishda xatolik: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Sketchfab 3D Asset Importer")
    subparsers = parser.add_subparsers(dest="cmd")

    subparsers.add_parser("me", help="Sketchfab profilini tekshirish")

    search_p = subparsers.add_parser("search", help="Modellarni qidirish")
    search_p.add_argument("query", nargs="?", default="", help="Qidiruv so'zi")
    search_p.add_argument("--tag", "-t", default=None, help="Teg bo'yicha filter (masalan: transformers)")
    search_p.add_argument("--limit", "-l", type=int, default=8, help="Natijalar soni")

    info_p = subparsers.add_parser("info", help="Model haqida to'liq ma'lumot")
    info_p.add_argument("target", help="Model URL yoki UID")

    dl_p = subparsers.add_parser("download", help="Modelni yuklab olish")
    dl_p.add_argument("target", help="Model URL yoki UID")
    dl_p.add_argument("--out", "-o", default=None, help="Chiqish fayli yo'li (.glb)")

    args = parser.parse_args()

    if args.cmd == "me" or not args.cmd:
        cmd_me()
    elif args.cmd == "search":
        cmd_search(args.query, args.tag, args.limit)
    elif args.cmd == "info":
        cmd_info(args.target)
    elif args.cmd == "download":
        cmd_download(args.target, args.out)

if __name__ == "__main__":
    main()
