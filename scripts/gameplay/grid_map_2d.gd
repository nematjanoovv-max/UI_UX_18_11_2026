class_name GridMap2D
extends Node2D

## Manages 2D tile grid, cell types, coordinate conversions, and tower occupation.

enum CellType {
	EMPTY,   # Buildable
	PATH,    # Enemy walking lane
	BLOCKED, # Scenery / obstacle
	BASE,    # Player headquarters
	SPAWN    # Enemy spawn point
}

@export var grid_width: int = 20
@export var grid_height: int = 11
@export var cell_size: int = 64
@export var grid_origin: Vector2 = Vector2.ZERO

var cell_types: Dictionary = {} # Vector2i -> CellType
var occupied_cells: Dictionary = {} # Vector2i -> Node (Tower)

func _ready() -> void:
	# Default initialize all cells to EMPTY
	for x in range(grid_width):
		for y in range(grid_height):
			cell_types[Vector2i(x, y)] = CellType.EMPTY

func world_to_cell(world_pos: Vector2) -> Vector2i:
	var local_pos: Vector2 = world_pos - grid_origin
	return Vector2i(int(floor(local_pos.x / float(cell_size))), int(floor(local_pos.y / float(cell_size))))

func cell_to_world(cell_pos: Vector2i) -> Vector2:
	return grid_origin + Vector2(float(cell_pos.x * cell_size) + float(cell_size) * 0.5, float(cell_pos.y * cell_size) + float(cell_size) * 0.5)

func is_within_bounds(cell_pos: Vector2i) -> bool:
	return cell_pos.x >= 0 and cell_pos.x < grid_width and cell_pos.y >= 0 and cell_pos.y < grid_height

func get_cell_type(cell_pos: Vector2i) -> CellType:
	return cell_types.get(cell_pos, CellType.BLOCKED)

func set_cell_type(cell_pos: Vector2i, type: CellType) -> void:
	if is_within_bounds(cell_pos):
		cell_types[cell_pos] = type

func is_cell_buildable(cell_pos: Vector2i) -> bool:
	if not is_within_bounds(cell_pos):
		return false
	if cell_types.get(cell_pos, CellType.BLOCKED) != CellType.EMPTY:
		return false
	if occupied_cells.has(cell_pos):
		return false
	return true

func place_tower(cell_pos: Vector2i, tower: Node) -> bool:
	if not is_cell_buildable(cell_pos):
		return false
	occupied_cells[cell_pos] = tower
	return true

func remove_tower(cell_pos: Vector2i) -> void:
	occupied_cells.erase(cell_pos)

func get_tower_at(cell_pos: Vector2i) -> Node:
	return occupied_cells.get(cell_pos, null)
