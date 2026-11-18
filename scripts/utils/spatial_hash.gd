class_name SpatialHash
extends RefCounted

## 2D Spatial partitioning grid (cell size 96px) for fast O(1) broadphase range queries.

var cell_size: float = 96.0
var grid: Dictionary = {} # Vector2i -> Array[Node2D]

func _init(size: float = 96.0) -> void:
	cell_size = size

func _get_cell_coord(pos: Vector2) -> Vector2i:
	return Vector2i(int(floor(pos.x / cell_size)), int(floor(pos.y / cell_size)))

func clear() -> void:
	grid.clear()

func insert(entity: Node2D, pos: Vector2) -> void:
	var cell: Vector2i = _get_cell_coord(pos)
	if not grid.has(cell):
		grid[cell] = []
	grid[cell].append(entity)

func query_radius(center: Vector2, radius: float) -> Array[Node2D]:
	var result: Array[Node2D] = []
	var min_cell: Vector2i = _get_cell_coord(center - Vector2(radius, radius))
	var max_cell: Vector2i = _get_cell_coord(center + Vector2(radius, radius))
	var r2: float = radius * radius

	for cx in range(min_cell.x, max_cell.x + 1):
		for cy in range(min_cell.y, max_cell.y + 1):
			var cell := Vector2i(cx, cy)
			if grid.has(cell):
				var entities: Array = grid[cell]
				for ent in entities:
					if is_instance_valid(ent):
						var node := ent as Node2D
						if node and node.global_position.distance_squared_to(center) <= r2:
							result.append(node)
	return result
