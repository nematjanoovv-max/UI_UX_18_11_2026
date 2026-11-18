class_name EnemyPool
extends Node2D

## High performance object pool for enemy instances to avoid garbage collector hitches.

@export var enemy_scene: PackedScene
@export var initial_pool_size: int = 50

var _available: Array[Enemy] = []
var _active: Array[Enemy] = []

func _ready() -> void:
	if not enemy_scene:
		enemy_scene = preload("res://scenes/enemies/enemy_base.tscn")
	
	for i in range(initial_pool_size):
		var enemy: Enemy = enemy_scene.instantiate() as Enemy
		enemy.visible = false
		enemy.set_physics_process(false)
		add_child(enemy)
		_available.append(enemy)

func spawn_enemy(enemy_data: EnemyData, lane_id: int, network: PathNetwork, wave_index: int = 1, hp_mult: float = 1.0, gold_mult: float = 1.0) -> Enemy:
	var enemy: Enemy
	if not _available.is_empty():
		enemy = _available.pop_back()
	else:
		enemy = enemy_scene.instantiate() as Enemy
		add_child(enemy)
	
	_active.append(enemy)
	enemy.set_physics_process(true)
	enemy.setup(enemy_data, lane_id, network, wave_index, hp_mult, gold_mult)
	
	# Connect recycle signals
	if not enemy.reached_base.is_connected(_on_enemy_finished):
		enemy.reached_base.connect(_on_enemy_finished.bind(enemy))
	if not enemy.died.is_connected(_on_enemy_died):
		enemy.died.connect(_on_enemy_died.bind(enemy))
		
	return enemy

func _on_enemy_finished(_dmg: int, enemy: Enemy) -> void:
	recycle_enemy(enemy)

func _on_enemy_died(_killed: bool, enemy: Enemy) -> void:
	recycle_enemy(enemy)

func recycle_enemy(enemy: Enemy) -> void:
	if enemy in _active:
		_active.erase(enemy)
		enemy.reset()
		enemy.set_physics_process(false)
		_available.append(enemy)

func get_active_enemies() -> Array[Enemy]:
	return _active
