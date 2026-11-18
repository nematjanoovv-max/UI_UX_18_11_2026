class_name AchievementsMenu
extends Control

## Displays all 15 unlockable achievements with unlock status and descriptions.

@onready var back_btn: Button = %BackButton
@onready var achievements_container: VBoxContainer = %AchievementsContainer

const ACHIEVEMENTS_LIST: Array[Dictionary] = [
	{"id": "first_blood", "title": "First Blood", "desc": "Destroy your first hostile unit"},
	{"id": "wave_10", "title": "Survivor X", "desc": "Clear wave 10 on any map"},
	{"id": "wave_20", "title": "Veteran Defender", "desc": "Clear wave 20 on any map"},
	{"id": "wave_30", "title": "Apex Guardian", "desc": "Survive all 30 waves of a mission"},
	{"id": "perfect_defense", "title": "Perfect Defense", "desc": "Win a mission with 100% Base HP remaining"},
	{"id": "boss_slayer_1", "title": "Juggernaut Down", "desc": "Neutralize the Juggernaut boss"},
	{"id": "boss_slayer_2", "title": "Overseer Silenced", "desc": "Defeat the Overseer boss"},
	{"id": "boss_slayer_3", "title": "Titan Breaker", "desc": "Annihilate the Hive Titan final boss"},
	{"id": "frugal", "title": "Frugal Tactician", "desc": "Complete a map building 5 or fewer towers"},
	{"id": "full_grid", "title": "Total Coverage", "desc": "Deploy 15+ towers simultaneously"},
	{"id": "slow_poke", "title": "Cryogenic Lock", "desc": "Inflict 10,000 total seconds of Cryo slow"},
	{"id": "sniper", "title": "Railgun Precision", "desc": "Eliminate 500 enemies with Railgun piercing beams"},
	{"id": "splash_zone", "title": "Splash Zone", "desc": "Eliminate 4+ hostiles in a single Mortar explosion"},
	{"id": "beacon_of_hope", "title": "Beacon of Hope", "desc": "Buff 4+ adjacent towers with a Beacon aura"},
	{"id": "millionaire", "title": "Millionaire", "desc": "Accumulate 10,000 lifetime gold earned"}
]

func _ready() -> void:
	back_btn.pressed.connect(_on_back_pressed)
	_populate_achievements()

func _populate_achievements() -> void:
	for child in achievements_container.get_children():
		child.queue_free()

	var unlocked_dict: Dictionary = SaveSystem.progress_data.get("achievements", {}) if SaveSystem else {}
	
	for ach in ACHIEVEMENTS_LIST:
		var a_id: String = ach["id"]
		var is_unlocked: bool = unlocked_dict.get(a_id, false)
		
		var panel := PanelContainer.new()
		var hbox := HBoxContainer.new()
		hbox.add_theme_constant_override("separation", 16)
		panel.add_child(hbox)
		
		var icon_lbl := Label.new()
		icon_lbl.text = "🏆" if is_unlocked else "🔒"
		icon_lbl.add_theme_font_size_override("font_size", 24)
		hbox.add_child(icon_lbl)
		
		var vbox := VBoxContainer.new()
		var title_lbl := Label.new()
		title_lbl.text = ach["title"] + (" (UNLOCKED)" if is_unlocked else " (LOCKED)")
		title_lbl.add_theme_color_override("font_color", Color(0, 1, 0.5) if is_unlocked else Color(0.7, 0.7, 0.7))
		vbox.add_child(title_lbl)
		
		var desc_lbl := Label.new()
		desc_lbl.text = ach["desc"]
		vbox.add_child(desc_lbl)
		
		hbox.add_child(vbox)
		achievements_container.add_child(panel)

func _on_back_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/main_menu.tscn")
