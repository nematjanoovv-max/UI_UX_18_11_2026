class_name BaseCore
extends Node2D

## Player base station that withstands enemy leaks and triggers defeat when destroyed.

signal hp_changed(current_hp: int, max_hp: int)
signal base_destroyed()

@export var max_hp: int = 20
var current_hp: int = 20

func _ready() -> void:
	current_hp = max_hp
	if EventBus:
		EventBus.enemy_reached_base.connect(_on_enemy_reached_base)

func set_initial_hp(hp: int) -> void:
	max_hp = hp
	current_hp = max_hp
	hp_changed.emit(current_hp, max_hp)
	if EventBus:
		EventBus.base_hp_changed.emit(current_hp, max_hp)

func _on_enemy_reached_base(_enemy: Node, dmg: int) -> void:
	take_damage(dmg)

func take_damage(amount: int) -> void:
	if current_hp <= 0:
		return
	
	current_hp = max(0, current_hp - amount)
	hp_changed.emit(current_hp, max_hp)
	if EventBus:
		EventBus.base_hp_changed.emit(current_hp, max_hp)
	
	if current_hp <= 0:
		base_destroyed.emit()
		if GameState:
			GameState.change_state(GameStateSingleton.State.DEFEAT)
