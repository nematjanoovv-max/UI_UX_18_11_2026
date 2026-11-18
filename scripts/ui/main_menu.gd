class_name MainMenu
extends Control

## Main landing menu providing navigation across game modes and meta-systems.

@onready var play_btn: Button = %PlayButton
@onready var skill_tree_btn: Button = %SkillTreeButton
@onready var encyclopedia_btn: Button = %EncyclopediaButton
@onready var achievements_btn: Button = %AchievementsButton
@onready var settings_btn: Button = %SettingsButton
@onready var quit_btn: Button = %QuitButton

func _ready() -> void:
	if GameState:
		GameState.change_state(GameStateSingleton.State.MAIN_MENU)
	
	play_btn.pressed.connect(_on_play_pressed)
	skill_tree_btn.pressed.connect(_on_skill_tree_pressed)
	encyclopedia_btn.pressed.connect(_on_encyclopedia_pressed)
	achievements_btn.pressed.connect(_on_achievements_pressed)
	settings_btn.pressed.connect(_on_settings_pressed)
	quit_btn.pressed.connect(_on_quit_pressed)

	# Hide quit button on Web and Mobile platforms
	if OS.has_feature("web") or OS.has_feature("mobile"):
		quit_btn.visible = false

func _on_play_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/map_select.tscn")

func _on_skill_tree_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/skill_tree_menu.tscn")

func _on_encyclopedia_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/encyclopedia.tscn")

func _on_achievements_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/achievements_menu.tscn")

func _on_settings_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/settings_menu.tscn")

func _on_quit_pressed() -> void:
	get_tree().quit()
