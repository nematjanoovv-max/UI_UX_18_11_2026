#!/usr/bin/env python3
"""
Generates all 30 wave .tres configuration files for Tower Defense: Last Grid.
Follows spec.md §8.3 accurately.
"""

import os

WAVES = [
    # 1-10
    (1, False, [("grunt", 8, 0.8, 0.0)]),
    (2, False, [("grunt", 12, 0.7, 0.0)]),
    (3, False, [("grunt", 10, 0.7, 0.0), ("sprinter", 4, 0.5, 2.0)]),
    (4, False, [("swarmling", 20, 0.25, 0.0)]),
    (5, False, [("sprinter", 8, 0.5, 0.0), ("grunt", 8, 0.7, 2.0)]),
    (6, False, [("brute", 4, 1.2, 0.0), ("grunt", 10, 0.6, 2.0)]),
    (7, False, [("swarmling", 15, 0.25, 0.0), ("sprinter", 6, 0.5, 2.0)]),
    (8, False, [("shieldbearer", 4, 1.0, 0.0), ("grunt", 10, 0.6, 2.0)]),
    (9, False, [("medic", 3, 1.0, 0.0), ("grunt", 12, 0.6, 1.5), ("brute", 4, 1.2, 3.0)]),
    (10, True, [("juggernaut", 1, 1.0, 0.0), ("grunt", 10, 0.6, 2.0)]),
    # 11-20
    (11, False, [("splitter", 6, 0.9, 0.0), ("sprinter", 10, 0.5, 2.0)]),
    (12, False, [("phantom", 6, 0.8, 0.0), ("swarmling", 12, 0.25, 2.0)]),
    (13, False, [("brute", 8, 1.1, 0.0), ("medic", 4, 1.0, 2.0)]),
    (14, False, [("swarmling", 25, 0.2, 0.0), ("sprinter", 8, 0.5, 2.0)]),
    (15, False, [("shieldbearer", 8, 1.0, 0.0), ("splitter", 6, 0.9, 2.0)]),
    (16, False, [("phantom", 10, 0.8, 0.0), ("medic", 6, 0.9, 2.0)]),
    (17, False, [("brute", 12, 1.0, 0.0), ("sprinter", 10, 0.5, 2.0)]),
    (18, False, [("swarmling", 40, 0.18, 0.0), ("splitter", 8, 0.9, 2.5)]),
    (19, False, [("shieldbearer", 10, 0.9, 0.0), ("medic", 8, 0.8, 2.0), ("brute", 8, 1.0, 3.0)]),
    (20, True, [("overseer", 1, 1.0, 0.0), ("phantom", 8, 0.8, 2.0), ("medic", 6, 0.9, 3.0)]),
    # 21-30
    (21, False, [("splitter", 14, 0.8, 0.0), ("sprinter", 14, 0.45, 2.0)]),
    (22, False, [("phantom", 12, 0.75, 0.0), ("shieldbearer", 10, 0.8, 2.0)]),
    (23, False, [("brute", 16, 0.9, 0.0), ("medic", 8, 0.8, 2.0)]),
    (24, False, [("swarmling", 50, 0.15, 0.0), ("sprinter", 12, 0.45, 2.0)]),
    (25, False, [("shieldbearer", 14, 0.8, 0.0), ("splitter", 12, 0.8, 2.0), ("medic", 6, 0.8, 3.0)]),
    (26, False, [("phantom", 16, 0.7, 0.0), ("brute", 14, 0.9, 2.0)]),
    (27, False, [("splitter", 20, 0.75, 0.0), ("shieldbearer", 12, 0.8, 2.0)]),
    (28, False, [("swarmling", 60, 0.15, 0.0), ("phantom", 16, 0.7, 2.0)]),
    (29, False, [("brute", 20, 0.85, 0.0), ("medic", 12, 0.75, 2.0), ("shieldbearer", 12, 0.8, 3.0)]),
    (30, True, [
        ("hive_titan", 1, 1.0, 0.0),
        ("grunt", 3, 0.6, 2.0),
        ("sprinter", 3, 0.5, 2.5),
        ("brute", 3, 1.0, 3.0),
        ("swarmling", 3, 0.3, 3.5),
        ("shieldbearer", 3, 0.8, 4.0),
        ("medic", 3, 0.8, 4.5),
        ("splitter", 3, 0.8, 5.0),
        ("phantom", 3, 0.7, 5.5)
    ])
]

os.makedirs("data/waves", exist_ok=True)

for wave_num, is_boss, groups in WAVES:
    lines = []
    lines.append('[gd_resource type="Resource" script_class="WaveData" load_steps=2 format=3]')
    lines.append('')
    lines.append('[ext_resource type="Script" path="res://scripts/data_defs/spawn_group.gd" id="1_group"]')
    lines.append('[ext_resource type="Script" path="res://scripts/data_defs/wave_data.gd" id="2_data"]')
    lines.append('')

    sub_res_ids = []
    for idx, (enemy_id, count, interval, delay) in enumerate(groups):
        sub_id = f"Resource_g{idx + 1}"
        sub_res_ids.append(f'SubResource("{sub_id}")')
        lines.append(f'[sub_resource type="Resource" id="{sub_id}"]')
        lines.append('script = ExtResource("1_group")')
        lines.append(f'enemy_id = "{enemy_id}"')
        lines.append(f'count = {count}')
        lines.append(f'interval_s = {interval}')
        lines.append(f'start_delay_s = {delay}')
        lines.append('lane_id = 0')
        lines.append('hp_mult_override = 1.0')
        lines.append('')

    lines.append('[resource]')
    lines.append('script = ExtResource("2_data")')
    lines.append(f'index = {wave_num}')
    lines.append(f'is_boss = {"true" if is_boss else "false"}')
    lines.append(f'bonus_gold = {25 + 2 * wave_num}')
    lines.append(f'notes = "Wave {wave_num} composition"')
    lines.append(f'groups = Array[ExtResource("1_group")]([{", ".join(sub_res_ids)}])')
    lines.append('')

    file_path = f"data/waves/wave_{wave_num:02d}.tres"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

print(f"Generated {len(WAVES)} wave configurations in data/waves/")
