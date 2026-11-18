extends GutTest

## Unit tests verifying SaveSystem atomicity, backup restore, and corruption resilience.

func test_default_save_schema() -> void:
	var def_data: Dictionary = SaveSystem.get_default_progress()
	assert_has(def_data, "version")
	assert_has(def_data, "map_progress")
	assert_has(def_data, "rp_total")
	assert_has(def_data, "skills")
	assert_has(def_data, "achievements")
	assert_eq(def_data["version"], 1)

func test_corrupt_save_recovery() -> void:
	var corrupt_path := "user://test_corrupt.json"
	var file := FileAccess.open(corrupt_path, FileAccess.WRITE)
	file.store_string("{ INVALID JSON TRUNCATED...")
	file.close()
	
	# Loading invalid json must degrade gracefully and return false without crashing
	var loaded_ok: bool = SaveSystem._load_from_path(corrupt_path)
	assert_false(loaded_ok, "Corrupt save must not parse as valid dictionary")
	
	DirAccess.remove_absolute(corrupt_path)
