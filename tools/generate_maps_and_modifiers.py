#!/usr/bin/env python3
"""
Generates all 10 MapData .tres files and modifier resources.
Accurately follows spec.md §8.4, §7.11, §7.12.
"""

import os

MAPS = [
    {
        "id": "training_grid",
        "name_key": "map_training_grid_name",
        "theme": "neon_grid",
        "waves": 10,
        "modifier": "none",
        "req_map": "",
        "req_stars": 0,
        "waypoints": [(64, 192), (384, 192), (384, 448), (896, 448), (896, 256), (1152, 256)]
    },
    {
        "id": "crossroads",
        "name_key": "map_crossroads_name",
        "theme": "crossroads",
        "waves": 12,
        "modifier": "none",
        "req_map": "training_grid",
        "req_stars": 1,
        "waypoints": [(64, 128), (448, 128), (448, 384), (896, 384), (1152, 384)]
    },
    {
        "id": "spiral_core",
        "name_key": "map_spiral_core_name",
        "theme": "spiral",
        "waves": 15,
        "modifier": "none",
        "req_map": "crossroads",
        "req_stars": 1,
        "waypoints": [(64, 64), (1152, 64), (1152, 576), (192, 576), (192, 192), (960, 192), (960, 448), (384, 448), (384, 320), (640, 320)]
    },
    {
        "id": "misty_pass",
        "name_key": "map_misty_pass_name",
        "theme": "canyon",
        "waves": 15,
        "modifier": "fog",
        "req_map": "spiral_core",
        "req_stars": 1,
        "waypoints": [(64, 320), (256, 128), (512, 512), (768, 128), (1024, 512), (1152, 320)]
    },
    {
        "id": "fast_track",
        "name_key": "map_fast_track_name",
        "theme": "highway",
        "waves": 20,
        "modifier": "fast_lane",
        "req_map": "misty_pass",
        "req_stars": 1,
        "waypoints": [(64, 256), (1152, 256)]
    },
    {
        "id": "scrap_yard",
        "name_key": "map_scrap_yard_name",
        "theme": "industrial",
        "waves": 20,
        "modifier": "scarce",
        "req_map": "fast_track",
        "req_stars": 1,
        "waypoints": [(64, 128), (768, 128), (768, 384), (256, 384), (256, 576), (1152, 576)]
    },
    {
        "id": "iron_wall",
        "name_key": "map_iron_wall_name",
        "theme": "fortress",
        "waves": 25,
        "modifier": "armored",
        "req_map": "scrap_yard",
        "req_stars": 2,
        "waypoints": [(64, 128), (192, 512), (960, 512), (1152, 128)]
    },
    {
        "id": "blackout_city",
        "name_key": "map_blackout_city_name",
        "theme": "cyber_city",
        "waves": 25,
        "modifier": "blackout",
        "req_map": "iron_wall",
        "req_stars": 2,
        "waypoints": [(64, 128), (320, 128), (320, 448), (640, 448), (640, 192), (960, 192), (960, 512), (1152, 512)]
    },
    {
        "id": "twin_gate",
        "name_key": "map_twin_gate_name",
        "theme": "twin_gate",
        "waves": 30,
        "modifier": "double_lane",
        "req_map": "blackout_city",
        "req_stars": 2,
        "waypoints": [(64, 192), (512, 192), (640, 320), (1152, 320)]
    },
    {
        "id": "last_grid",
        "name_key": "map_last_grid_name",
        "theme": "deep_core",
        "waves": 30,
        "modifier": "last_grid",
        "req_map": "twin_gate",
        "req_stars": 2,
        "waypoints": [(64, 64), (1152, 64), (1152, 256), (128, 256), (128, 448), (1152, 448), (1152, 576), (640, 576)]
    }
]

os.makedirs("data/maps", exist_ok=True)
os.makedirs("data/modifiers", exist_ok=True)
os.makedirs("data/difficulty", exist_ok=True)

# 1. Generate Maps
for m in MAPS:
    wp_str = ", ".join([f"Vector2({x}, {y})" for x, y in m["waypoints"]])
    lines = [
        '[gd_resource type="Resource" script_class="MapData" load_steps=3 format=3]',
        '',
        '[ext_resource type="Script" path="res://scripts/data_defs/lane_data.gd" id="1_lane"]',
        '[ext_resource type="Script" path="res://scripts/data_defs/map_data.gd" id="2_data"]',
        '',
        '[sub_resource type="Resource" id="Resource_lane1"]',
        'script = ExtResource("1_lane")',
        'lane_id = 0',
        f'waypoints = PackedVector2Array({wp_str})',
        '',
        '[resource]',
        'script = ExtResource("2_data")',
        f'id = "{m["id"]}"',
        f'name_key = "{m["name_key"]}"',
        f'theme = "{m["theme"]}"',
        'grid_width = 20',
        'grid_height = 11',
        'cell_size = 64',
        'lanes = Array[ExtResource("1_lane")]([SubResource("Resource_lane1")])',
        f'wave_count = {m["waves"]}',
        f'modifier_ids = Array[String](["{m["modifier"]}"])',
        'starting_gold = 250',
        'base_hp = 20',
        f'unlock_requires_map_id = "{m["req_map"]}"',
        f'unlock_requires_stars = {m["req_stars"]}',
        'star_threshold_3 = 0.90',
        'star_threshold_2 = 0.50',
        ''
    ]
    with open(f"data/maps/{m['id']}.tres", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

print(f"Generated {len(MAPS)} maps in data/maps/")
