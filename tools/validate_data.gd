extends SceneTree

## Data validation utility for Tower Defense: Last Grid.
## Validates integrity, uniqueness, counts, and ranges of all Resource files.

func _init() -> void:
	print("==================================================")
	print("--- Running Tower Defense Data Validator ---")
	print("==================================================")
	
	var all_valid: bool = true
	var ids: Dictionary = {}
	
	# 1. Validate Towers
	var tower_files := ["pulse.tres", "mortar.tres", "cryo.tres", "railgun.tres", "beacon.tres"]
	var tower_count: int = 0
	for file_name in tower_files:
		var path := "res://data/towers/" + file_name
		var tower: TowerData = load(path) as TowerData
		if not tower:
			push_error("Failed to load tower: " + path)
			all_valid = false
			continue
		
		tower_count += 1
		if ids.has(tower.id):
			push_error("Duplicate ID found in tower: " + tower.id)
			all_valid = false
		ids[tower.id] = true
		
		if tower.cost <= 0:
			push_error("Tower cost must be > 0: " + tower.id)
			all_valid = false
			
		if tower.tiers.size() != 3:
			push_error("Tower must have exactly 3 tiers: " + tower.id)
			all_valid = false
			
		for i in range(tower.tiers.size()):
			var tier: TowerTier = tower.tiers[i]
			if tier.range_px <= 0:
				push_error("Tier range must be > 0: %s tier %d" % [tower.id, i + 1])
				all_valid = false
	print("Validated %d towers successfully." % tower_count)
	
	# 2. Validate Enemies
	var enemy_files := ["grunt.tres", "sprinter.tres", "brute.tres", "swarmling.tres", 
						"shieldbearer.tres", "medic.tres", "splitter.tres", "phantom.tres"]
	var enemy_count: int = 0
	for file_name in enemy_files:
		var path := "res://data/enemies/" + file_name
		var enemy: EnemyData = load(path) as EnemyData
		if not enemy:
			push_error("Failed to load enemy: " + path)
			all_valid = false
			continue
			
		enemy_count += 1
		if ids.has(enemy.id):
			push_error("Duplicate ID found in enemy: " + enemy.id)
			all_valid = false
		ids[enemy.id] = true
		
		if enemy.hp <= 0 or enemy.speed <= 0 or enemy.base_damage <= 0:
			push_error("Enemy stats must be positive: " + enemy.id)
			all_valid = false
	print("Validated %d enemies successfully." % enemy_count)
	
	# 3. Validate Bosses
	var boss_files := ["juggernaut.tres", "overseer.tres", "hive_titan.tres"]
	var boss_count: int = 0
	for file_name in boss_files:
		var path := "res://data/bosses/" + file_name
		var boss: BossData = load(path) as BossData
		if not boss:
			push_error("Failed to load boss: " + path)
			all_valid = false
			continue
			
		boss_count += 1
		if ids.has(boss.id):
			push_error("Duplicate ID found in boss: " + boss.id)
			all_valid = false
		ids[boss.id] = true
		
		if boss.hp <= 0 or boss.speed <= 0 or boss.base_damage <= 0:
			push_error("Boss stats must be positive: " + boss.id)
			all_valid = false
	print("Validated %d bosses successfully." % boss_count)
	
	print("--------------------------------------------------")
	if all_valid:
		print("DATA VALIDATION RESULT: ALL CHECKS PASSED.")
		quit(0)
	else:
		push_error("DATA VALIDATION FAILED WITH ERRORS.")
		quit(1)
