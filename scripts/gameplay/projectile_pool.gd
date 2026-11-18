class_name ProjectilePool
extends Node2D

## High performance pool for reusable projectiles and impact effects.

@export var projectile_scene: PackedScene
@export var initial_pool_size: int = 100

var _available: Array[Projectile] = []
var _active: Array[Projectile] = []

func _ready() -> void:
	if not projectile_scene:
		projectile_scene = preload("res://scenes/objects/projectile_base.tscn")
	for i in range(initial_pool_size):
		var p: Projectile = projectile_scene.instantiate() as Projectile
		p.visible = false
		p.set_physics_process(false)
		add_child(p)
		_available.append(p)

func acquire() -> Projectile:
	var p: Projectile
	if not _available.is_empty():
		p = _available.pop_back()
	else:
		p = projectile_scene.instantiate() as Projectile
		add_child(p)
	
	_active.append(p)
	p.set_physics_process(true)
	if not p.finished.is_connected(_on_projectile_finished):
		p.finished.connect(_on_projectile_finished.bind(p))
	return p

func _on_projectile_finished(p: Projectile) -> void:
	if p in _active:
		_active.erase(p)
		p.set_physics_process(false)
		_available.append(p)

func get_active_projectiles() -> Array[Projectile]:
	return _active
