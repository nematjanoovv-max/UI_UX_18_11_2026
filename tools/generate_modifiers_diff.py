#!/usr/bin/env python3
"""
Generates modifier and difficulty resources for Tower Defense: Last Grid.
"""

MODIFIERS = [
    ("none", 1.0, 1.0, 1.0, 1.0, 1.0, 0),
    ("fast_lane", 1.15, 1.0, 1.0, 1.0, 1.0, 0),
    ("scarce", 1.0, 0.80, 1.0, 1.0, 1.0, 0),
    ("fog", 1.0, 1.0, 0.85, 1.0, 1.0, 0),
    ("armored", 1.0, 1.0, 1.0, 1.20, 1.0, 0),
    ("blackout", 1.0, 1.0, 1.0, 1.0, 1.0, 5),
    ("double_lane", 1.0, 1.0, 1.0, 1.0, 1.0, 0),
    ("last_grid", 1.10, 0.90, 1.0, 1.10, 1.0, 0)
]

for m_id, spd, bnty, rng, arm, hp, blk in MODIFIERS:
    content = f"""[gd_resource type="Resource" script_class="ModifierData" load_steps=2 format=3]

[ext_resource type="Script" path="res://scripts/data_defs/modifier_data.gd" id="1_mod"]

[resource]
script = ExtResource("1_mod")
id = "{m_id}"
name_key = "modifier_{m_id}_name"
desc_key = "modifier_{m_id}_desc"
speed_mult = {spd}
bounty_mult = {bnty}
range_mult = {rng}
armor_mult = {arm}
hp_mult = {hp}
blackout_interval_waves = {blk}
"""
    with open(f"data/modifiers/{m_id}.tres", "w", encoding="utf-8") as f:
        f.write(content)

DIFFICULTIES = [
    ("easy", 0.8, 1.2, 30, 0.70, "true"),
    ("normal", 1.0, 1.0, 20, 0.70, "false"),
    ("hard", 1.3, 0.9, 15, 0.70, "false"),
    ("nightmare", 1.7, 0.8, 10, 0.50, "false")
]

for d_id, hp_m, g_m, bhp, ref, leni in DIFFICULTIES:
    content = f"""[gd_resource type="Resource" script_class="DifficultyData" load_steps=2 format=3]

[ext_resource type="Script" path="res://scripts/data_defs/difficulty_data.gd" id="1_diff"]

[resource]
script = ExtResource("1_diff")
id = "{d_id}"
name_key = "difficulty_{d_id}_name"
hp_multiplier = {hp_m}
gold_multiplier = {g_m}
base_hp = {bhp}
sell_refund_ratio = {ref}
star_threshold_lenient = {leni}
"""
    with open(f"data/difficulty/{d_id}.tres", "w", encoding="utf-8") as f:
        f.write(content)

print("Generated modifiers and difficulties successfully.")
