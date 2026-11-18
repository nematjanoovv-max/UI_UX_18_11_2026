class_name GameStateSingleton
extends Node

## Central FSM managing overall game flow, state transitions, and run context.

enum State {
	BOOT,
	MAIN_MENU,
	MAP_SELECT,
	LOADING,
	BUILD_PHASE,
	WAVE_ACTIVE,
	PAUSED,
	VICTORY,
	DEFEAT,
	RESULTS
}

var current_state: State = State.BOOT
var previous_state: State = State.BOOT

# Run context
var current_map_id: String = "training_grid"
var current_difficulty: String = "normal"
var run_seed: int = 12345
var game_speed: float = 1.0

# Table of legal transitions
const LEGAL_TRANSITIONS: Dictionary = {
	State.BOOT: [State.MAIN_MENU, State.LOADING],
	State.MAIN_MENU: [State.MAP_SELECT, State.LOADING],
	State.MAP_SELECT: [State.MAIN_MENU, State.LOADING],
	State.LOADING: [State.BUILD_PHASE, State.MAIN_MENU],
	State.BUILD_PHASE: [State.WAVE_ACTIVE, State.PAUSED, State.DEFEAT, State.MAIN_MENU],
	State.WAVE_ACTIVE: [State.BUILD_PHASE, State.PAUSED, State.VICTORY, State.DEFEAT],
	State.PAUSED: [State.BUILD_PHASE, State.WAVE_ACTIVE, State.MAIN_MENU, State.MAP_SELECT],
	State.VICTORY: [State.RESULTS],
	State.DEFEAT: [State.RESULTS],
	State.RESULTS: [State.MAIN_MENU, State.MAP_SELECT, State.LOADING]
}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS

func can_transition_to(target_state: State) -> bool:
	if not LEGAL_TRANSITIONS.has(current_state):
		return false
	var allowed: Array = LEGAL_TRANSITIONS[current_state]
	return target_state in allowed

func change_state(target_state: State) -> bool:
	if not can_transition_to(target_state):
		push_warning("Illegal state transition attempted: %s -> %s" % [State.keys()[current_state], State.keys()[target_state]])
		return false
	
	var old_state: State = current_state
	previous_state = old_state
	current_state = target_state
	
	if target_state == State.PAUSED:
		get_tree().paused = true
	elif old_state == State.PAUSED and target_state != State.PAUSED:
		get_tree().paused = false
		
	if EventBus:
		EventBus.state_changed.emit(old_state, target_state)
	return true

func set_game_speed(speed: float) -> void:
	game_speed = clampf(speed, 1.0, 3.0)
	Engine.time_scale = game_speed

func reset_speed() -> void:
	game_speed = 1.0
	Engine.time_scale = 1.0
