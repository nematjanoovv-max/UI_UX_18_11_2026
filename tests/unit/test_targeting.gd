extends GutTest

## Unit tests verifying SpatialHash spatial queries and all 4 targeting priority modes.

func test_spatial_hash_radius_query() -> void:
	var sh := SpatialHash.new(96.0)
	var node1 := Node2D.new()
	var node2 := Node2D.new()
	var node3 := Node2D.new()
	autofree(node1)
	autofree(node2)
	autofree(node3)
	
	node1.global_position = Vector2(100, 100)
	node2.global_position = Vector2(150, 100)
	node3.global_position = Vector2(500, 500)
	
	sh.insert(node1, node1.global_position)
	sh.insert(node2, node2.global_position)
	sh.insert(node3, node3.global_position)
	
	var in_range: Array[Node2D] = sh.query_radius(Vector2(100, 100), 80.0)
	assert_has(in_range, node1)
	assert_has(in_range, node2)
	assert_does_not_have(in_range, node3)

func test_targeting_modes_first_last_strongest_nearest() -> void:
	var tower_pos := Vector2(200, 200)
	var range_px: float = 300.0
	
	var e_data := EnemyData.new()
	e_data.id = "test_grunt"
	e_data.hp = 100.0
	
	var network := PathNetwork.new()
	network.add_lane(0, PackedVector2Array([Vector2(0, 0), Vector2(1000, 0)]))
	
	var e1 := Enemy.new()
	var e2 := Enemy.new()
	var e3 := Enemy.new()
	autofree(e1)
	autofree(e2)
	autofree(e3)
	
	e1.setup(e_data, 0, network)
	e2.setup(e_data, 0, network)
	e3.setup(e_data, 0, network)
	
	# Positions & progress
	e1.global_position = Vector2(200, 250) # Distance 50
	e1.progress_px = 300.0
	e1.current_hp = 50.0
	
	e2.global_position = Vector2(200, 300) # Distance 100
	e2.progress_px = 500.0                 # Furthest ahead
	e2.current_hp = 30.0
	
	e3.global_position = Vector2(200, 220) # Distance 20 (Nearest)
	e3.progress_px = 100.0                 # Furthest behind
	e3.current_hp = 200.0                  # Strongest
	
	var candidates: Array[Enemy] = [e1, e2, e3]
	
	# 1. Mode FIRST -> e2 (progress 500)
	var target_first: Enemy = TargetingSystem.select_target(tower_pos, range_px, TowerData.TargetMode.FIRST, candidates)
	assert_eq(target_first, e2, "FIRST mode should select enemy closest to base (highest progress)")
	
	# 2. Mode LAST -> e3 (progress 100)
	var target_last: Enemy = TargetingSystem.select_target(tower_pos, range_px, TowerData.TargetMode.LAST, candidates)
	assert_eq(target_last, e3, "LAST mode should select enemy closest to spawn (lowest progress)")
	
	# 3. Mode STRONGEST -> e3 (HP 200)
	var target_strong: Enemy = TargetingSystem.select_target(tower_pos, range_px, TowerData.TargetMode.STRONGEST, candidates)
	assert_eq(target_strong, e3, "STRONGEST mode should select enemy with highest HP+shield")
	
	# 4. Mode NEAREST -> e3 (distance 20)
	var target_near: Enemy = TargetingSystem.select_target(tower_pos, range_px, TowerData.TargetMode.NEAREST, candidates)
	assert_eq(target_near, e3, "NEAREST mode should select enemy closest Euclidean distance to tower")

func test_targeting_phasing_ignored() -> void:
	var tower_pos := Vector2(0, 0)
	var e_data := EnemyData.new()
	e_data.id = "phantom"
	var network := PathNetwork.new()
	network.add_lane(0, PackedVector2Array([Vector2(0, 0), Vector2(500, 0)]))
	
	var enemy := Enemy.new()
	autofree(enemy)
	enemy.setup(e_data, 0, network)
	enemy.global_position = Vector2(50, 0)
	enemy.status_effects.is_phased = true # Phasing active
	
	var target: Enemy = TargetingSystem.select_target(tower_pos, 200.0, TowerData.TargetMode.FIRST, [enemy])
	assert_null(target, "Phased enemies must not be targetable")
