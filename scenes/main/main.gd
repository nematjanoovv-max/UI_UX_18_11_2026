class_name MainRoot
extends Node2D

## Boot scene and top-level game controller.

@onready var title_label: Label = $CanvasLayer/CenterContainer/VBoxContainer/TitleLabel
@onready var status_label: Label = $CanvasLayer/CenterContainer/VBoxContainer/StatusLabel

func _ready() -> void:
	if GameState:
		GameState.change_state(GameStateSingleton.State.BOOT)
	
	status_label.text = "Initializing Systems..."
	
	# Transition to MAIN_MENU after a short delay
	var timer := get_tree().create_timer(0.5)
	timer.timeout.connect(_on_boot_complete)

func _on_boot_complete() -> void:
	status_label.text = "Ready"
	if GameState:
		GameState.change_state(GameStateSingleton.State.MAIN_MENU)
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/main_menu.tscn")
