class_name EncyclopediaMenu
extends Control

## Displays comprehensive codex information for towers, damage types, enemies, and bosses.

@onready var back_btn: Button = %BackButton
@onready var tower_list: ItemList = %TowerList
@onready var enemy_list: ItemList = %EnemyList
@onready var details_text: RichTextLabel = %DetailsText

const TOWER_INFO: Dictionary = {
	"Pulse": "Role: Rapid-fire anti-swarm\nDamage Type: KINETIC\nCost: 100g (Upgrades: 80g / 160g)\nTier 1: 12 dmg, 4.0 rps, 140 range\nTier 2: 18 dmg, 5.0 rps, 150 range\nTier 3: 26 dmg, 6.0 rps, 160 range",
	"Mortar": "Role: Long-range explosive artillery\nDamage Type: EXPLOSIVE\nCost: 150g (Upgrades: 120g / 240g)\nTier 1: 45 dmg, 0.8 rps, 200 range, 60px splash\nTier 2: 70 dmg, 0.9 rps, 215 range, 70px splash\nTier 3: 105 dmg, 1.0 rps, 230 range, 85px splash",
	"Cryo": "Role: Slowing energy field\nDamage Type: ENERGY\nCost: 120g (Upgrades: 90g / 180g)\nTier 1: 4 dmg, 35% slow, 120 range\nTier 2: 6 dmg, 45% slow, 130 range\nTier 3: 9 dmg, 55% slow, 140 range + 15% freeze",
	"Railgun": "Role: Sniper piercing beam\nDamage Type: PIERCE\nCost: 250g (Upgrades: 200g / 400g)\nTier 1: 140 dmg, 0.5 rps, 360 range, 1 pierce\nTier 2: 220 dmg, 0.55 rps, 390 range, 2 pierce\nTier 3: 340 dmg, 0.6 rps, 420 range, 3 pierce",
	"Beacon": "Role: Tactical support buffer\nCost: 180g (Upgrades: 140g / 280g)\nTier 1: +15% dmg, +10% range aura\nTier 2: +25% dmg, +15% range aura\nTier 3: +35% dmg, +20% range, +10% fire rate aura"
}

const ENEMY_INFO: Dictionary = {
	"Grunt": "Baseline infantry. HP: 100, Speed: 60 px/s, Bounty: 5g.",
	"Sprinter": "High-velocity scout. HP: 60, Speed: 110 px/s, Bounty: 6g.",
	"Brute": "Heavy armored unit. HP: 400, Armor: 8, Speed: 40 px/s, Bounty: 15g.",
	"Swarmling": "Lightweight swarm unit. HP: 25, Speed: 80 px/s, Bounty: 2g.",
	"Shieldbearer": "Shielded defender. HP: 200, Shield: 150, Armor: 2, Speed: 55 px/s, Bounty: 14g.",
	"Medic": "Support healer. Heals 15 HP/s to allies within 96px. HP: 150, Speed: 50 px/s, Bounty: 18g.",
	"Splitter": "Splits into 2 swarmlings on death. HP: 250, Armor: 3, Speed: 55 px/s, Bounty: 12g.",
	"Phantom": "Phases out every 4s for 1.5s (untargetable). HP: 180, Speed: 75 px/s, Bounty: 16g.",
	"Juggernaut (Boss 1)": "Wave 10 Boss. HP: 6000, Armor: 20, Slow capped at 50%, Splash resist 25%.",
	"Overseer (Boss 2)": "Wave 20 Boss. HP: 9000, Armor: 10, Summons 3 sprinters every 6s, pulse shield.",
	"Hive Titan (Boss 3)": "Wave 30 Boss. HP: 20000, Armor: 15, 3 Phases, spawns splitters, enrages."
}

func _ready() -> void:
	back_btn.pressed.connect(_on_back_pressed)
	tower_list.item_selected.connect(_on_tower_selected)
	enemy_list.item_selected.connect(_on_enemy_selected)
	
	for t in TOWER_INFO.keys():
		tower_list.add_item(t)
	for e in ENEMY_INFO.keys():
		enemy_list.add_item(e)
		
	if tower_list.item_count > 0:
		tower_list.select(0)
		_on_tower_selected(0)

func _on_tower_selected(index: int) -> void:
	var key: String = tower_list.get_item_text(index)
	details_text.text = "[b][color=cyan]" + key + " Tower[/color][/b]\n\n" + TOWER_INFO.get(key, "")

func _on_enemy_selected(index: int) -> void:
	var key: String = enemy_list.get_item_text(index)
	details_text.text = "[b][color=magenta]" + key + "[/color][/b]\n\n" + ENEMY_INFO.get(key, "")

func _on_back_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/main_menu.tscn")
