class_name ResultsScreen
extends Control

## Displays end-of-mission Victory or Defeat debrief, stars, RP earned, and run statistics.

@onready var banner_label: Label = %BannerLabel
@onready var stars_label: Label = %StarsLabel
@onready var rp_label: Label = %RpLabel
@onready var stats_text: RichTextLabel = %StatsText
@onready var retry_btn: Button = %RetryButton
@onready var next_map_btn: Button = %NextMapButton
@onready var menu_btn: Button = %MenuButton

var is_victory: bool = true
var stars_earned: int = 1
var rp_earned: int = 10

func _ready() -> void:
	if GameState:
		is_victory = (GameState.current_state == GameStateSingleton.State.VICTORY)
	
	retry_btn.pressed.connect(_on_retry_pressed)
	next_map_btn.pressed.connect(_on_next_map_pressed)
	menu_btn.pressed.connect(_on_menu_pressed)
	
	_populate_results()

func _populate_results() -> void:
	if is_victory:
		banner_label.text = "MISSION VICTORY"
		banner_label.add_theme_color_override("font_color", Color(0, 1, 0.5, 1))
		stars_label.text = "★ ★ ★"
		rp_earned = 15
		rp_label.text = "+%d Research Points" % rp_earned
		next_map_btn.visible = true
	else:
		banner_label.text = "MISSION DEFEAT"
		banner_label.add_theme_color_override("font_color", Color(1, 0.2, 0.2, 1))
		stars_label.text = "BASE COMPROMISED"
		rp_earned = 2
		rp_label.text = "+%d Research Points" % rp_earned
		next_map_btn.visible = false
		
	stats_text.text = """
[b]Tactical Debrief:[/b]
- Map: %s
- Difficulty: %s
- Outcome: %s
- RP Rewarded: %d
""" % [
		GameState.current_map_id if GameState else "training_grid",
		GameState.current_difficulty if GameState else "normal",
		"Completed" if is_victory else "Failed",
		rp_earned
	]
	
	# Persist progress
	if SaveSystem and SaveSystem.progress_data.has("rp_total"):
		SaveSystem.progress_data["rp_total"] += rp_earned
		SaveSystem.save_progress()

func _on_retry_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/levels/battlefield.tscn")

func _on_next_map_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/map_select.tscn")

func _on_menu_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/main_menu.tscn")
