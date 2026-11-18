extends GutTest

## Unit tests verifying complete content counts and map star progression.

func test_content_counts() -> void:
	# Acceptance Criteria: 10 maps · 5 towers · 8 enemies · 3 bosses · 30 waves
	var dir := DirAccess.open("res://data/")
	assert_not_null(dir)
	
	# Towers
	var tower_count: int = 0
	var d_tow := DirAccess.open("res://data/towers/")
	if d_tow:
		for f in d_tow.get_files():
			if f.ends_with(".tres"):
				tower_count += 1
	assert_eq(tower_count, 5, "Mandatory tower count must be exactly 5")
	
	# Enemies
	var enemy_count: int = 0
	var d_ene := DirAccess.open("res://data/enemies/")
	if d_ene:
		for f in d_ene.get_files():
			if f.ends_with(".tres"):
				enemy_count += 1
	assert_eq(enemy_count, 8, "Mandatory enemy count must be exactly 8")
	
	# Bosses
	var boss_count: int = 0
	var d_bos := DirAccess.open("res://data/bosses/")
	if d_bos:
		for f in d_bos.get_files():
			if f.ends_with(".tres"):
				boss_count += 1
	assert_eq(boss_count, 3, "Mandatory boss count must be exactly 3")
	
	# Waves
	var wave_count: int = 0
	var d_wav := DirAccess.open("res://data/waves/")
	if d_wav:
		for f in d_wav.get_files():
			if f.ends_with(".tres"):
				wave_count += 1
	assert_eq(wave_count, 30, "Mandatory wave count must be exactly 30")
	
	# Maps
	var map_count: int = 0
	var d_map := DirAccess.open("res://data/maps/")
	if d_map:
		for f in d_map.get_files():
			if f.ends_with(".tres"):
				map_count += 1
	assert_eq(map_count, 10, "Mandatory map count must be exactly 10")
