#!/usr/bin/env python3
"""
Sketchfab Model Fetcher & Pipeline for Tower Defense: Last Grid
Searches, downloads, unpacks, and integrates CC-licensed 3D models from Sketchfab API.
"""

import os
import sys
import json
import zipfile
import argparse
import urllib.request
import urllib.parse
import shutil

SKETCHFAB_API_BASE = "https://api.sketchfab.com/v3"

ROLE_QUERIES = {
    "mortar": {"query": "sci-fi artillery cannon turret", "name": "Heavy Mortar"},
    "cryo": {"query": "cryo generator sci-fi turret", "name": "Cryo Core"},
    "tesla": {"query": "tesla coil pylon sci-fi", "name": "Tesla Coil"},
    "flame": {"query": "flame turret sci-fi", "name": "Flame Thrower"},
    "beacon": {"query": "radar dish comm tower sci-fi", "name": "Radar Beacon"},
    "barricade": {"query": "sci-fi barricade wall defense", "name": "Blast Barricade"},
    "sprinter": {"query": "cyber dog robot hound quadruped", "name": "Sprinter Raptor"},
    "brute": {"query": "heavy mech robot brute armor", "name": "Armored Brute"},
    "shieldbearer": {"query": "riot shield robot sci-fi enforcer", "name": "Shieldbearer Droid"},
    "medic": {"query": "medical drone repair bot sci-fi", "name": "Medic Drone"},
    "splitter": {"query": "sci-fi crystal drone shard", "name": "Cluster Splitter"},
    "phantom": {"query": "stealth sniper assassin robot", "name": "Stealth Phantom"},
    "juggernaut": {"query": "sci-fi heavy tank siege goliath", "name": "Goliath Juggernaut"},
    "overseer": {"query": "alien mothership giant drone eye", "name": "Cyber Overseer"},
    "hive_titan": {"query": "spider mech arachnid robot", "name": "Hive Titan"},
    "void_titan": {"query": "dark matter golem void colossus", "name": "Void Titan"},
    "chrono_phantom": {"query": "temporal mech phantom robot", "name": "Chrono Phantom"},
    "mecha_colossus": {"query": "giant jaeger colossus mech robot", "name": "Mecha Colossus"}
}

def request_json(url, token=None, timeout=30):
    headers = {"User-Agent": "LastGrid-3D-Fetcher/1.0"}
    if token:
        headers["Authorization"] = f"Token {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8'))

def search_models(query, token=None, count=3):
    params = {
        "q": query,
        "type": "models",
        "downloadable": "true",
        "sort_by": "-likeCount"
    }
    url = f"{SKETCHFAB_API_BASE}/models?" + urllib.parse.urlencode(params)
    data = request_json(url, token)
    return data.get("results", [])[:count]

def download_model(uid, token, output_glb_path):
    download_url_info = f"{SKETCHFAB_API_BASE}/models/{uid}/download"
    data = request_json(download_url_info, token)
    
    # Try direct glb first (binary glTF)
    if "glb" in data and "url" in data["glb"]:
        glb_entry = data["glb"]
        print(f"  Downloading direct GLB ({glb_entry.get('size', 0) // 1024} KB)...")
        req = urllib.request.Request(glb_entry["url"], headers={"User-Agent": "LastGrid-3D-Fetcher/1.0"})
        with urllib.request.urlopen(req, timeout=30) as response, open(output_glb_path, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
        print(f"  ✓ Successfully saved direct GLB to: {output_glb_path}")
        return True

    # Otherwise fallback to gltf zip archive
    if "gltf" in data and "url" in data["gltf"]:
        gltf_entry = data["gltf"]
        temp_zip = output_glb_path + ".temp.zip"
        temp_dir = output_glb_path + ".temp_extract"
        
        print(f"  Downloading glTF archive ({gltf_entry.get('size', 0) // 1024} KB)...")
        req = urllib.request.Request(gltf_entry["url"], headers={"User-Agent": "LastGrid-3D-Fetcher/1.0"})
        with urllib.request.urlopen(req, timeout=30) as response, open(temp_zip, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
            
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
        os.makedirs(temp_dir, exist_ok=True)
        
        with zipfile.ZipFile(temp_zip, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
            
        found_file = None
        for root, dirs, files in os.walk(temp_dir):
            for f in files:
                if f.endswith('.glb'):
                    found_file = os.path.join(root, f)
                    break
                elif f.endswith('.gltf') and not found_file:
                    found_file = os.path.join(root, f)
                    
        if found_file:
            shutil.move(found_file, output_glb_path)
            print(f"  ✓ Successfully extracted to: {output_glb_path}")
        else:
            raise FileNotFoundError(f"No .glb or .gltf found inside downloaded package for {uid}")
            
        if os.path.exists(temp_zip): os.remove(temp_zip)
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
        return True

    raise ValueError(f"No downloadable glb/gltf entry found for UID {uid}")

def main():
    parser = argparse.ArgumentParser(description="Sketchfab Model Fetcher for Last Grid")
    parser.add_argument("--token", help="Sketchfab API Token (from profile -> Settings -> Password & API)")
    parser.add_argument("--search", help="Search query on Sketchfab")
    parser.add_argument("--role", help="Specific role ID to search/download (e.g. mortar, sprinter)")
    parser.add_argument("--download-uid", help="Download specific model by Sketchfab UID")
    parser.add_argument("--out", help="Output path for downloaded model")
    parser.add_argument("--list-roles", action="store_true", help="List all configurable roles")
    
    args = parser.parse_args()
    
    if args.list_roles:
        print("Available roles for Sketchfab binding:")
        for role_id, info in ROLE_QUERIES.items():
            print(f"  [{role_id:15}] - {info['name']} (Search: '{info['query']}')")
        return

    if args.search:
        print(f"Searching Sketchfab for: '{args.search}'...")
        results = search_models(args.search, args.token)
        for i, res in enumerate(results):
            print(f"  {i+1}. [{res['uid']}] {res['name']} by {res.get('user', {}).get('displayName', 'Unknown')} ({res.get('likeCount', 0)} likes)")
        return

    if args.download_uid and args.token and args.out:
        print(f"Downloading model {args.download_uid}...")
        download_model(args.download_uid, args.token, args.out)
        return

    print("Use --help for options or provide --token to run automated batch fetch.")

if __name__ == "__main__":
    main()
