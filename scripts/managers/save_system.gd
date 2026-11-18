class_name SaveSystemSingleton
extends Node

## Handles robust, versioned, atomic save/load operations for meta-progression.

const SAVE_PATH: String = "user://progress.json"
const SAVE_BAK_PATH: String = "user://progress.json.bak"
const SAVE_TEMP_PATH: String = "user://progress.json.tmp"
const CURRENT_VERSION: int = 1

var progress_data: Dictionary = {}

func _ready() -> void:
	load_progress()

func get_default_progress() -> Dictionary:
	return {
		"version": CURRENT_VERSION,
		"map_progress": {
			"training_grid": {
				"stars": 0,
				"best_wave": 0,
				"best_difficulty": "normal",
				"cleared": false
			}
		},
		"rp_total": 0,
		"rp_spent": 0,
		"skills": {},
		"achievements": {},
		"stats": {
			"total_kills": 0,
			"total_gold_earned": 0,
			"total_runs": 0,
			"bosses_defeated": 0
		},
		"codex": {
			"towers": ["pulse", "mortar", "cryo", "railgun", "beacon"],
			"enemies": []
		},
		"tutorial_done": false
	}

func load_progress() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		if FileAccess.file_exists(SAVE_BAK_PATH):
			_load_from_path(SAVE_BAK_PATH)
		else:
			progress_data = get_default_progress()
		return
	
	if not _load_from_path(SAVE_PATH):
		if FileAccess.file_exists(SAVE_BAK_PATH):
			if not _load_from_path(SAVE_BAK_PATH):
				progress_data = get_default_progress()
		else:
			progress_data = get_default_progress()

func _load_from_path(path: String) -> bool:
	var file := FileAccess.open(path, FileAccess.READ)
	if not file:
		return false
	var text: String = file.get_as_text()
	var json := JSON.new()
	var parse_err: Error = json.parse(text)
	if parse_err != OK or not (json.data is Dictionary):
		return false
	
	progress_data = json.data
	_migrate_if_needed()
	return true

func _migrate_if_needed() -> void:
	var version: int = progress_data.get("version", 0)
	if version < CURRENT_VERSION:
		progress_data["version"] = CURRENT_VERSION

func save_progress() -> bool:
	var text: String = JSON.stringify(progress_data, "\t")
	
	# 1. Write to temporary file
	var temp_file := FileAccess.open(SAVE_TEMP_PATH, FileAccess.WRITE)
	if not temp_file:
		push_error("Failed to open temp save file for writing.")
		return false
	temp_file.store_string(text)
	temp_file.close()
	
	# 2. Back up existing save
	if FileAccess.file_exists(SAVE_PATH):
		var dir := DirAccess.open("user://")
		if dir:
			dir.copy(SAVE_PATH, SAVE_BAK_PATH)
			
	# 3. Rename temp to primary
	var dir := DirAccess.open("user://")
	if dir:
		var err: Error = dir.rename(SAVE_TEMP_PATH, SAVE_PATH)
		return err == OK
	return false

func reset_save() -> void:
	progress_data = get_default_progress()
	save_progress()
