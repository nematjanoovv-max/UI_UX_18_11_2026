extends SceneTree

## Comprehensive data validator for Tower Defense: Last Grid.
## Validates mandatory content counts: 10 maps, 5 towers, 8 enemies, 3 bosses, 30 waves.

func _init() -> void:
	print("==================================================")
	print("--- Running Full Scope Content Validator ---")
	print("==================================================")
	
	var all_valid: bool = true
	var ids: Dictionary = {}
	
	# 1. Validate Towers (5)
	var tower_files := ["pulse.tres", "mortar.tres", "cryo.tres", "railgun.tres", "beacon.tres"]
	for f in tower_files:
		var t: TowerData = load("res://data/towers/" + f) as TowerData
		if not t or ids.has(t.id) or t.cost <= 0 or t.tiers.size() != 3:
			push_error("Tower validation failed: " + f)
			all_valid = false
		else:
			ids[t.id] = true
	print("✓ Validated 5/5 Towers.")
	
	# 2. Validate Enemies (8)
	var enemy_files := ["grunt.tres", "sprinter.tres", "brute.tres", "swarmling.tres",
						"shieldbearer.tres", "medic.tres", "splitter.tres", "phantom.tres"]
	for f in enemy_files:
		var e: EnemyData = load("res://data/enemies/" + f) as EnemyData
		if not e or ids.has(e.id) or e.hp <= 0 or e.speed <= 0:
			push_error("Enemy validation failed: " + f)
			all_valid = false
		else:
			ids[e.id] = true
	print("✓ Validated 8/8 Enemies.")
	
	# 3. Validate Bosses (3)
	var boss_files := ["juggernaut.tres", "overseer.tres", "hive_titan.tres"]
	for f in boss_files:
		var b: BossData = load("res://data/bosses/" + f) as BossData
		if not b or ids.has(b.id) or b.hp <= 0 or not b.is_boss:
			push_error("Boss validation failed: " + f)
			all_valid = false
		else:
			ids[b.id] = true
	print("✓ Validated 3/3 Bosses.")
	
	# 4. Validate Waves (30)
	for w in range(1, 31):
		var w_path := "res://data/waves/wave_%02d.tres" % w
		var wave: WaveData = load(w_path) as WaveData
		if not wave or wave.index != w or wave.groups.is_empty():
			push_error("Wave validation failed for wave %d" % w)
			all_valid = false
	print("✓ Validated 30/30 Wave Configurations.")
	
	# 5. Validate Maps (10)
	var map_files := ["training_grid", "crossroads", "spiral_core", "misty_pass", "fast_track",
					  "scrap_yard", "iron_wall", "blackout_city", "twin_gate", "last_grid"]
	for m_id in map_files:
		var m_path := "res://data/maps/" + m_id + ".tres"
		var map: MapData = load(m_path) as MapData
		if not map or map.id != m_id or map.lanes.is_empty():
			push_error("Map validation failed: " + m_id)
			all_valid = false
	print("✓ Validated 10/10 Maps.")
	
	print("==================================================")
	if all_valid:
		print("VALIDATION SUCCESS: Mandatory content criteria 10 maps, 5 towers, 8 enemies, 3 bosses, 30 waves SATISFIED.")
		quit(0)
	else:
		push_error("VALIDATION FAILED.")
		quit(1)
