class_name BuildController
extends Node2D

## Handles tower placement preview (ghost), cell validation, and instantiation.

signal tower_placed(tower: TowerBase, cell: Vector2i)
signal build_cancelled()

@export var grid_map: GridMap2D
@export var tower_base_scene: PackedScene
@export var projectile_pool: ProjectilePool
@export var spatial_hash: SpatialHash

var selected_tower_data: TowerData = null
var current_cell: Vector2i = Vector2i(-1, -1)
var is_active: bool = false

@onready var ghost_rect: ColorRect = $GhostRect
@onready var ghost_range: Node2D = $GhostRange

func _ready() -> void:
	if not tower_base_scene:
		tower_base_scene = preload("res://scenes/towers/tower_base.tscn")
	set_process_unhandled_input(true)
	cancel_build()

func start_build(data: TowerData) -> void:
	selected_tower_data = data
	is_active = true
	visible = true
	queue_redraw()

func cancel_build() -> void:
	selected_tower_data = null
	is_active = false
	visible = false
	current_cell = Vector2i(-1, -1)
	build_cancelled.emit()

func _unhandled_input(event: InputEvent) -> void:
	if not is_active:
		return
		
	if event is InputEventMouseMotion:
		_update_ghost_position(event.position)
	elif event is InputEventMouseButton:
		var mb := event as InputEventMouseButton
		if mb.pressed:
			if mb.button_index == MOUSE_BUTTON_LEFT:
				try_place_tower()
			elif mb.button_index == MOUSE_BUTTON_RIGHT:
				cancel_build()
	elif event.is_action_pressed("pause"):
		cancel_build()

func _update_ghost_position(mouse_pos: Vector2) -> void:
	if not grid_map:
		return
	current_cell = grid_map.world_to_cell(mouse_pos)
	global_position = grid_map.cell_to_world(current_cell)
	
	var is_valid: bool = grid_map.is_cell_buildable(current_cell)
	if ghost_rect:
		ghost_rect.color = Color(0.0, 1.0, 0.4, 0.4) if is_valid else Color(1.0, 0.2, 0.2, 0.4)
	queue_redraw()

func try_place_tower() -> bool:
	if not is_active or not selected_tower_data or not grid_map:
		return false
	if not grid_map.is_cell_buildable(current_cell):
		return false

	var tower: TowerBase = tower_base_scene.instantiate() as TowerBase
	tower.tower_data = selected_tower_data
	tower.global_position = grid_map.cell_to_world(current_cell)
	tower.projectile_pool = projectile_pool
	tower.spatial_hash = spatial_hash
	
	grid_map.place_tower(current_cell, tower)
	get_parent().add_child(tower)
	
	tower_placed.emit(tower, current_cell)
	if EventBus:
		EventBus.tower_built.emit(tower)
	
	cancel_build()
	return true

func _draw() -> void:
	if is_active and selected_tower_data and not selected_tower_data.tiers.is_empty():
		var r: float = selected_tower_data.tiers[0].range_px
		draw_arc(Vector2.ZERO, r, 0, TAU, 36, Color(0, 0.9, 1, 0.5), 2.0)
