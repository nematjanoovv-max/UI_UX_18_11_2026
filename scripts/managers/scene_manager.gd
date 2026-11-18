class_name SceneManagerSingleton
extends Node

## Handles asynchronous scene transitions and screen management.

signal scene_loaded()

var _current_scene_path: String = ""

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

func change_scene(scene_path: String) -> void:
	_current_scene_path = scene_path
	var root := get_tree().root
	var current_scene: Node = get_tree().current_scene
	
	var new_scene_res: PackedScene = load(scene_path)
	if not new_scene_res:
		push_error("Failed to load scene: " + scene_path)
		return
	
	if current_scene:
		current_scene.queue_free()
	
	var inst: Node = new_scene_res.instantiate()
	root.add_child(inst)
	get_tree().current_scene = inst
	scene_loaded.emit()
