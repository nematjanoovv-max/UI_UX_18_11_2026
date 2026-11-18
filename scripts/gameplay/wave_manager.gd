class_name WaveManager
extends Node

## Coordinates wave scheduling, enemy spawning, early-calls, and clear detection.

signal countdown_tick(remaining_seconds: float)
signal wave_started(wave_index: int)
signal wave_cleared(wave_index: int)
signal all_waves_completed()

enum WaveState {
	IDLE,
	COUNTDOWN,
	SPAWNING,
	ACTIVE,
	CLEARED
}

@export var enemy_pool: EnemyPool
@export var path_network: PathNetwork
@export var economy_manager: EconomyManager

var current_state: WaveState = WaveState.IDLE
var current_wave_index: int = 0
var max_waves: int = 10

var countdown_timer: float = 0.0
const DEFAULT_COUNTDOWN: float = 15.0

# Wave active tracking
var _current_wave_data: WaveData = null
var _groups_to_spawn: Array[Dictionary] = [] # {"group": SpawnGroup, "spawned": int, "timer": float, "delay_left": float}
var _live_enemy_count: int = 0
var _loaded_waves: Dictionary = {} # int -> WaveData
var _enemy_data_cache: Dictionary = {} # String -> EnemyData

func _ready() -> void:
	_preload_enemy_data()
	if EventBus:
		EventBus.enemy_spawned.connect(_on_enemy_spawned)
		EventBus.enemy_died.connect(_on_enemy_despawned)
		EventBus.enemy_reached_base.connect(_on_enemy_reached_base)

func _preload_enemy_data() -> void:
	var enemies := ["grunt", "sprinter", "brute", "swarmling", "shieldbearer", "medic", "splitter", "phantom"]
	for e in enemies:
		var res: EnemyData = load("res://data/enemies/" + e + ".tres") as EnemyData
		if res:
			_enemy_data_cache[e] = res
			
	var bosses := ["juggernaut", "overseer", "hive_titan"]
	for b in bosses:
		var b_res: BossData = load("res://data/bosses/" + b + ".tres") as BossData
		if b_res:
			_enemy_data_cache[b] = b_res

func load_wave_data(wave_index: int) -> WaveData:
	if _loaded_waves.has(wave_index):
		return _loaded_waves[wave_index]
	var path: String = "res://data/waves/wave_%02d.tres" % wave_index
	var wave: WaveData = load(path) as WaveData
	if wave:
		_loaded_waves[wave_index] = wave
	return wave

func start_level(total_waves: int = 10) -> void:
	max_waves = total_waves
	current_wave_index = 0
	_live_enemy_count = 0
	start_next_wave_countdown(true)

func start_next_wave_countdown(is_first_wave: bool = false) -> void:
	current_wave_index += 1
	if current_wave_index > max_waves:
		current_state = WaveState.CLEARED
		all_waves_completed.emit()
		if EventBus:
			EventBus.all_waves_cleared.emit()
		if GameState:
			GameState.change_state(GameStateSingleton.State.VICTORY)
		return

	_current_wave_data = load_wave_data(current_wave_index)
	current_state = WaveState.COUNTDOWN
	# On first wave, wait until player initiates (or 5s if auto)
	countdown_timer = 0.0 if is_first_wave else DEFAULT_COUNTDOWN
	if GameState:
		GameState.change_state(GameStateSingleton.State.BUILD_PHASE)

func trigger_early_call() -> void:
	if current_state != WaveState.COUNTDOWN:
		return
	if economy_manager:
		economy_manager.add_early_call_bonus(countdown_timer)
	countdown_timer = 0.0
	_begin_wave()

func _begin_wave() -> void:
	current_state = WaveState.SPAWNING
	_groups_to_spawn.clear()
	
	if _current_wave_data:
		for g in _current_wave_data.groups:
			_groups_to_spawn.append({
				"group": g,
				"spawned": 0,
				"timer": 0.0,
				"delay_left": g.start_delay_s
			})
			
	wave_started.emit(current_wave_index)
	if EventBus:
		EventBus.wave_started.emit(current_wave_index)
	if GameState:
		GameState.change_state(GameStateSingleton.State.WAVE_ACTIVE)

func _physics_process(delta: float) -> void:
	match current_state:
		WaveState.COUNTDOWN:
			if countdown_timer > 0.0:
				countdown_timer -= delta
				countdown_tick.emit(countdown_timer)
				if countdown_timer <= 0.0:
					_begin_wave()

		WaveState.SPAWNING:
			_process_spawning(delta)
			
		WaveState.ACTIVE:
			_check_wave_clear()

func _process_spawning(delta: float) -> void:
	var all_groups_finished: bool = true
	
	for spawn_info in _groups_to_spawn:
		var group: SpawnGroup = spawn_info["group"]
		if spawn_info["spawned"] >= group.count:
			continue
			
		all_groups_finished = false
		
		# Delay handling
		if spawn_info["delay_left"] > 0.0:
			spawn_info["delay_left"] -= delta
			continue
			
		spawn_info["timer"] -= delta
		if spawn_info["timer"] <= 0.0:
			spawn_info["timer"] = group.interval_s
			_spawn_enemy_from_group(group)
			spawn_info["spawned"] += 1

	if all_groups_finished:
		current_state = WaveState.ACTIVE
		_check_wave_clear()

func _spawn_enemy_from_group(group: SpawnGroup) -> void:
	var enemy_id: String = group.enemy_id
	var e_data: EnemyData = _enemy_data_cache.get(enemy_id, null)
	if not e_data:
		push_error("EnemyData not found for id: " + enemy_id)
		return
		
	if enemy_pool and path_network:
		var spawned: Enemy = enemy_pool.spawn_enemy(
			e_data,
			group.lane_id,
			path_network,
			current_wave_index,
			group.hp_mult_override
		)
		if spawned:
			_live_enemy_count += 1
			if EventBus:
				EventBus.enemy_spawned.emit(spawned)

func register_summon_child(child_enemy: Enemy) -> void:
	_live_enemy_count += 1
	if EventBus:
		EventBus.enemy_spawned.emit(child_enemy)

func _on_enemy_spawned(_enemy: Node) -> void:
	pass

func _on_enemy_despawned(_enemy: Node, _killed_by_player: bool) -> void:
	_decrement_live_enemy()

func _on_enemy_reached_base(_enemy: Node, _dmg: int) -> void:
	_decrement_live_enemy()

func _decrement_live_enemy() -> void:
	_live_enemy_count = max(0, _live_enemy_count - 1)
	if current_state == WaveState.ACTIVE:
		_check_wave_clear()

func _check_wave_clear() -> void:
	if _live_enemy_count <= 0:
		current_state = WaveState.CLEARED
		wave_cleared.emit(current_wave_index)
		if EventBus:
			EventBus.wave_cleared.emit(current_wave_index)
			
		if current_wave_index >= max_waves:
			all_waves_completed.emit()
			if EventBus:
				EventBus.all_waves_cleared.emit()
			if GameState:
				GameState.change_state(GameStateSingleton.State.VICTORY)
		else:
			start_next_wave_countdown(false)
