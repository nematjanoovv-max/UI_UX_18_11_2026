class_name Arena3D
extends Node3D

## Master 3D TPS Combat Arena Manager (Godot 4.3)

@export var enemy_scene: PackedScene = preload("res://scenes/arena_3d/enemy_3d.tscn")
@export var tower_scene: PackedScene = preload("res://scenes/arena_3d/tower_3d.tscn")

@export var max_core_health: float = 500.0
var current_core_health: float = 500.0
var current_wave: int = 1
var enemies_remaining: int = 0
var wave_active: bool = false
var wave_timer: float = 5.0
var total_score: int = 0

@onready var base_core: Node3D = $BaseCore
@onready var player: Player3D = $Player3D
@onready var spawn_points: Node3D = $SpawnPoints
@onready var hud: CanvasLayer = $ArenaHUD

func _ready() -> void:
	current_core_health = max_core_health
	update_hud()
	start_wave()

func _process(dt: float) -> void:
	if not wave_active:
		wave_timer -= dt
		if wave_timer <= 0.0:
			start_wave()

func start_wave() -> void:
	wave_active = true
	var enemy_count: int = 8 + current_wave * 4
	enemies_remaining = enemy_count
	update_hud()

	for i in range(enemy_count):
		await get_tree().create_timer(1.2).timeout
		if not is_inside_tree():
			return
		spawn_single_enemy()

func spawn_single_enemy() -> void:
	if not enemy_scene or not spawn_points:
		return

	var spawners: Array[Node] = spawn_points.get_children()
	if spawners.is_empty():
		return

	var rand_spawner: Node3D = spawners[randi() % spawners.size()] as Node3D
	var enemy: Enemy3D = enemy_scene.instantiate() as Enemy3D
	enemy.global_position = rand_spawner.global_position + Vector3(randf_range(-3, 3), 0, randf_range(-3, 3))
	enemy.enemy_died.connect(_on_enemy_died)
	add_child(enemy)

func _on_enemy_died(_type: String, reward: int) -> void:
	total_score += reward
	enemies_remaining = max(0, enemies_remaining - 1)
	update_hud()

	if enemies_remaining <= 0 and wave_active:
		wave_active = false
		current_wave += 1
		wave_timer = 8.0 # break between waves

func damage_base_core(amount: float) -> void:
	current_core_health = max(0.0, current_core_health - amount)
	update_hud()
	if current_core_health <= 0.0:
		on_defeat()

func update_hud() -> void:
	# Update score, wave, and core health labels
	pass

func on_defeat() -> void:
	# Show defeat overlay
	pass
