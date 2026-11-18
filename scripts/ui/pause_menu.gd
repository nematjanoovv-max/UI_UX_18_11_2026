class_name PauseMenu
extends Control

## Pause overlay pausing the game tree while keeping UI reactive.

signal resumed()
signal restarted()
signal quit_to_menu()

@onready var resume_btn: Button = %ResumeButton
@onready var restart_btn: Button = %RestartButton
@onready var settings_btn: Button = %SettingsButton
@onready var quit_btn: Button = %QuitButton

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	resume_btn.pressed.connect(_on_resume_pressed)
	restart_btn.pressed.connect(_on_restart_pressed)
	settings_btn.pressed.connect(_on_settings_pressed)
	quit_btn.pressed.connect(_on_quit_pressed)

func open_pause() -> void:
	visible = true
	if GameState:
		GameState.change_state(GameStateSingleton.State.PAUSED)

func close_pause() -> void:
	visible = false
	if GameState:
		GameState.change_state(GameState.previous_state)
	resumed.emit()

func _on_resume_pressed() -> void:
	close_pause()

func _on_restart_pressed() -> void:
	close_pause()
	restarted.emit()
	if SceneManager:
		SceneManager.change_scene("res://scenes/levels/battlefield.tscn")

func _on_settings_pressed() -> void:
	# Open settings
	close_pause()
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/settings_menu.tscn")

func _on_quit_pressed() -> void:
	close_pause()
	quit_to_menu.emit()
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/main_menu.tscn")
