class_name MapSelect
extends Control

## Map selection screen with 10 mission cards, difficulty selector, and star progress.

@onready var map_container: GridContainer = %MapGrid
@onready var difficulty_option: OptionButton = %DifficultyOption
@onready var start_btn: Button = %StartButton
@onready var back_btn: Button = %BackButton
@onready var selected_info_label: Label = %SelectedInfoLabel

const MAPS_META: Array[Dictionary] = [
	{"id": "training_grid", "name": "Training Grid", "waves": 10, "mod": "none", "stars_req": 0},
	{"id": "crossroads", "name": "Crossroads", "waves": 12, "mod": "none", "stars_req": 1},
	{"id": "spiral_core", "name": "Spiral Core", "waves": 15, "mod": "none", "stars_req": 1},
	{"id": "misty_pass", "name": "Misty Pass", "waves": 15, "mod": "fog", "stars_req": 1},
	{"id": "fast_track", "name": "Fast Track", "waves": 20, "mod": "fast_lane", "stars_req": 1},
	{"id": "scrap_yard", "name": "Scrap Yard", "waves": 20, "mod": "scarce", "stars_req": 1},
	{"id": "iron_wall", "name": "Iron Wall", "waves": 25, "mod": "armored", "stars_req": 2},
	{"id": "blackout_city", "name": "Blackout City", "waves": 25, "mod": "blackout", "stars_req": 2},
	{"id": "twin_gate", "name": "Twin Gate", "waves": 30, "mod": "double_lane", "stars_req": 2},
	{"id": "last_grid", "name": "The Last Grid", "waves": 30, "mod": "last_grid", "stars_req": 2}
]

var selected_map_idx: int = 0
var total_stars_earned: int = 0

func _ready() -> void:
	if GameState:
		GameState.change_state(GameStateSingleton.State.MAP_SELECT)
	
	_load_stars_progress()
	_populate_difficulty_options()
	_populate_map_cards()
	_select_map(0)
	
	start_btn.pressed.connect(_on_start_pressed)
	back_btn.pressed.connect(_on_back_pressed)

func _load_stars_progress() -> void:
	total_stars_earned = 0
	if SaveSystem and SaveSystem.progress_data.has("map_progress"):
		var maps_prog: Dictionary = SaveSystem.progress_data["map_progress"]
		for m_id in maps_prog:
			total_stars_earned += maps_prog[m_id].get("stars", 0)

func _populate_difficulty_options() -> void:
	difficulty_option.clear()
	difficulty_option.add_item("Easy (HP 30, Gold 1.2x)", 0)
	difficulty_option.add_item("Normal (HP 20, Gold 1.0x)", 1)
	difficulty_option.add_item("Hard (HP 15, Gold 0.9x)", 2)
	difficulty_option.add_item("Nightmare (HP 10, Gold 0.8x)", 3)
	difficulty_option.selected = 1 # Normal by default

func _populate_map_cards() -> void:
	for child in map_container.get_children():
		child.queue_free()

	for i in range(MAPS_META.size()):
		var meta: Dictionary = MAPS_META[i]
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(200, 60)
		var is_locked: bool = (i > 0 and total_stars_earned < meta["stars_req"])
		
		if is_locked:
			btn.text = "🔒 %s\n(Requires %d ★)" % [meta["name"], meta["stars_req"]]
			btn.disabled = true
		else:
			btn.text = "%d. %s\n(%d Waves | Mod: %s)" % [i + 1, meta["name"], meta["waves"], meta["mod"]]
			btn.pressed.connect(_select_map.bind(i))
		map_container.add_child(btn)

func _select_map(idx: int) -> void:
	selected_map_idx = idx
	var meta: Dictionary = MAPS_META[idx]
	selected_info_label.text = "Selected: %s | %d Waves | Modifier: %s" % [meta["name"], meta["waves"], meta["mod"]]

func _on_start_pressed() -> void:
	var meta: Dictionary = MAPS_META[selected_map_idx]
	var diff_names := ["easy", "normal", "hard", "nightmare"]
	var selected_diff: String = diff_names[difficulty_option.selected]
	
	if GameState:
		GameState.current_map_id = meta["id"]
		GameState.current_difficulty = selected_diff
		GameState.change_state(GameStateSingleton.State.LOADING)
		
	if SceneManager:
		SceneManager.change_scene("res://scenes/levels/battlefield.tscn")

func _on_back_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/main_menu.tscn")
