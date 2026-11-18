class_name Battlefield
extends Node2D

## Top-level mission scene binding together Grid, Spawner, Towers, Economy, and HUD.

@onready var grid_map: GridMap2D = $GridMap2D
@onready var base_core: BaseCore = $BaseCore
@onready var enemy_pool: EnemyPool = $EnemyPool
@onready var projectile_pool: ProjectilePool = $ProjectilePool
@onready var wave_manager: WaveManager = $WaveManager
@onready var economy_manager: EconomyManager = $EconomyManager
@onready var upgrade_controller: UpgradeController = $UpgradeController
@onready var build_controller: BuildController = $BuildController
@onready var battle_hud: BattleHUD = $BattleHUD
@onready var tower_panels: TowerPanels = $TowerPanels
@onready var pause_menu: PauseMenu = $PauseMenu

var path_network: PathNetwork
var spatial_hash: SpatialHash
var current_map_data: MapData

func _ready() -> void:
	path_network = PathNetwork.new()
	spatial_hash = SpatialHash.new(96.0)
	
	_setup_map()
	_wire_controllers()
	
	# Start Wave Manager
	var total_waves: int = current_map_data.wave_count if current_map_data else 10
	wave_manager.start_level(total_waves)

func _setup_map() -> void:
	# Load current map or default training_grid
	var map_id: String = GameState.current_map_id if GameState else "training_grid"
	var map_path := "res://data/maps/%s.tres" % map_id
	if ResourceLoader.exists(map_path):
		current_map_data = load(map_path) as MapData
		
	# Configure waypoints for lane 0
	var waypoints := PackedVector2Array([
		Vector2(64, 192),
		Vector2(384, 192),
		Vector2(384, 448),
		Vector2(896, 448),
		Vector2(896, 256),
		Vector2(1152, 256)
	])
	
	if current_map_data and not current_map_data.lanes.is_empty():
		waypoints = current_map_data.lanes[0].waypoints
		
	path_network.add_lane(0, waypoints)
	
	# Position Base Core at end of path
	var end_pt: Vector2 = waypoints[waypoints.size() - 1]
	base_core.global_position = end_pt
	
	# Mark path cells on grid_map so towers cannot be built on them
	for i in range(waypoints.size() - 1):
		var p1: Vector2 = waypoints[i]
		var p2: Vector2 = waypoints[i + 1]
		var dist: float = p1.distance_to(p2)
		var steps: int = int(dist / 32.0)
		for s in range(steps + 1):
			var sample_pt: Vector2 = p1.lerp(p2, float(s) / float(max(1, steps)))
			var cell: Vector2i = grid_map.world_to_cell(sample_pt)
			grid_map.set_cell_type(cell, GridMap2D.CellType.PATH)

	# Mark Base cell
	var base_cell: Vector2i = grid_map.world_to_cell(end_pt)
	grid_map.set_cell_type(base_cell, GridMap2D.CellType.BASE)

func _wire_controllers() -> void:
	# Wire WaveManager
	wave_manager.enemy_pool = enemy_pool
	wave_manager.path_network = path_network
	wave_manager.economy_manager = economy_manager
	
	# Wire UpgradeController
	upgrade_controller.economy_manager = economy_manager
	upgrade_controller.grid_map = grid_map
	
	# Wire BuildController
	build_controller.grid_map = grid_map
	build_controller.projectile_pool = projectile_pool
	build_controller.spatial_hash = spatial_hash
	
	# Connect UI Signals
	battle_hud.start_wave_pressed.connect(func(): wave_manager.trigger_early_call())
	battle_hud.pause_pressed.connect(func(): pause_menu.open_pause())
	
	tower_panels.build_tower_selected.connect(_on_tower_build_selected)
	tower_panels.upgrade_requested.connect(func(): upgrade_controller.try_upgrade_selected())
	tower_panels.sell_requested.connect(func(): upgrade_controller.try_sell_selected())
	tower_panels.target_mode_cycled.connect(func(): upgrade_controller.cycle_selected_target_mode())
	
	# Connect State Changes
	if EventBus:
		EventBus.state_changed.connect(_on_game_state_changed)

func _on_tower_build_selected(tower_id: String) -> void:
	var path := "res://data/towers/%s.tres" % tower_id
	var tower_res: TowerData = load(path) as TowerData
	if tower_res and economy_manager.can_afford(tower_res.cost):
		build_controller.start_build(tower_res)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		var mb := event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_LEFT and not build_controller.is_active:
			var cell: Vector2i = grid_map.world_to_cell(mb.position)
			var tower: Node = grid_map.get_tower_at(cell)
			upgrade_controller.select_tower(tower as TowerBase)
	elif event.is_action_pressed("start_wave"):
		wave_manager.trigger_early_call()
	elif event.is_action_pressed("pause"):
		if not pause_menu.visible:
			pause_menu.open_pause()
		else:
			pause_menu.close_pause()

func _physics_process(_delta: float) -> void:
	# Update spatial hash with active enemies for fast range queries
	spatial_hash.clear()
	for enemy in enemy_pool.get_active_enemies():
		if is_instance_valid(enemy) and enemy.is_active:
			spatial_hash.insert(enemy, enemy.global_position)

func _on_game_state_changed(_from: int, to: int) -> void:
	if to == GameStateSingleton.State.VICTORY or to == GameStateSingleton.State.DEFEAT:
		var timer := get_tree().create_timer(1.2)
		timer.timeout.connect(func():
			if SceneManager:
				SceneManager.change_scene("res://scenes/menus/results_screen.tscn")
		)
