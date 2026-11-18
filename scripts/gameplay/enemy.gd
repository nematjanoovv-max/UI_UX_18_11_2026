class_name Enemy
extends Node2D

## Base class for all enemy units navigating along waypoint paths.

signal reached_base(damage: int)
signal died(killed_by_player: bool)
signal spawn_child_requested(enemy_id: String, progress_px: float, lane_id: int)

static var _next_uid: int = 1

var uid: int = 0
var data: EnemyData
var lane_id: int = 0
var path_network: PathNetwork
var progress_px: float = 0.0
var path_length: float = 0.0

var current_hp: float = 100.0
var max_hp: float = 100.0
var current_shield: float = 0.0
var max_shield: float = 0.0
var armor: float = 0.0
var base_speed: float = 60.0
var bounty: int = 5
var base_damage: int = 1

var status_effects: StatusEffects
var is_active: bool = false
var has_phase_trait: bool = false
var has_shield_regen_trait: bool = false
var has_split_trait: bool = false
var has_heal_trait: bool = false
var shield_regen_timer: float = 0.0
var heal_pulse_timer: float = 0.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var hp_bar: ProgressBar = $HpBar

func _init() -> void:
	status_effects = StatusEffects.new()
	uid = _next_uid
	_next_uid += 1

func setup(enemy_data: EnemyData, lane: int, network: PathNetwork, wave_index: int = 1, hp_mult: float = 1.0, gold_mult: float = 1.0) -> void:
	data = enemy_data
	lane_id = lane
	path_network = network
	progress_px = 0.0
	path_length = path_network.get_lane_length(lane_id)
	
	# Scale stats per wave formula
	var wave_hp_scaling: float = CombatCalc.calculate_wave_hp_mult(wave_index) * hp_mult
	if enemy_data.is_boss:
		# Spec §8.2: Boss HP is NOT multiplied by wave_hp_mult, only by difficulty
		wave_hp_scaling = hp_mult
		
	max_hp = enemy_data.hp * wave_hp_scaling
	current_hp = max_hp
	max_shield = enemy_data.shield
	current_shield = max_shield
	armor = enemy_data.armor
	base_speed = enemy_data.speed
	bounty = CombatCalc.calculate_bounty(enemy_data.bounty, wave_index, gold_mult)
	base_damage = enemy_data.base_damage
	
	has_phase_trait = "phase" in enemy_data.traits
	has_shield_regen_trait = "shield_regen" in enemy_data.traits
	has_split_trait = "split_on_death" in enemy_data.traits
	has_heal_trait = "heal_aura" in enemy_data.traits
	shield_regen_timer = 0.0
	heal_pulse_timer = 0.0
	
	status_effects.reset()
	is_active = true
	visible = true
	
	# Update initial position
	_update_position_from_progress()

func _physics_process(delta: float) -> void:
	if not is_active:
		return
	
	status_effects.tick(delta)
	if has_phase_trait:
		status_effects.update_phase(delta)
	
	# Shield regeneration after 3s without damage
	if has_shield_regen_trait and current_shield < max_shield:
		shield_regen_timer += delta
		if shield_regen_timer >= 3.0:
			current_shield = minf(max_shield, current_shield + 20.0 * delta)
	
	var effective_speed: float = base_speed * status_effects.get_speed_multiplier()
	progress_px += effective_speed * delta
	
	_update_position_from_progress()
	
	if progress_px >= path_length:
		_on_reach_base()

func _update_position_from_progress() -> void:
	if not path_network:
		return
	var sample_res: Dictionary = path_network.sample_lane(lane_id, progress_px)
	global_position = sample_res.get("position", global_position)
	var tangent: Vector2 = sample_res.get("tangent", Vector2.RIGHT)
	if tangent != Vector2.ZERO:
		rotation = tangent.angle()

func take_damage(raw_amount: float, dmg_type: CombatCalc.DamageType) -> void:
	if not is_active:
		return
	if status_effects.is_phased:
		# Phased enemies are untargetable and immune to incoming hits
		return
	
	shield_regen_timer = 0.0 # Reset shield regeneration cooldown on hit
	
	# 1. Shield absorbs first
	if current_shield > 0.0:
		var shield_dmg: float = CombatCalc.calculate_shield_damage(raw_amount, dmg_type)
		if current_shield >= shield_dmg:
			current_shield -= shield_dmg
			return
		else:
			# Overflow to HP
			var absorbed_ratio: float = current_shield / shield_dmg
			current_shield = 0.0
			raw_amount = raw_amount * (1.0 - absorbed_ratio)
	
	# 2. HP absorbs with armor reduction
	var final_damage: float = CombatCalc.calculate_damage(raw_amount, armor, dmg_type)
	current_hp -= final_damage
	
	if current_hp <= 0.0:
		current_hp = 0.0
		_on_death(true)

func is_targetable() -> bool:
	return is_active and not status_effects.is_phased

func get_total_ehp() -> float:
	return current_hp + current_shield

func _on_reach_base() -> void:
	is_active = false
	visible = false
	reached_base.emit(base_damage)
	if EventBus:
		EventBus.enemy_reached_base.emit(self, base_damage)

func _on_death(killed_by_player: bool) -> void:
	if has_split_trait and killed_by_player:
		# Spec §8.1: Splitter spawns 2 swarmlings on death
		spawn_child_requested.emit("swarmling", progress_px, lane_id)
		spawn_child_requested.emit("swarmling", maxf(0.0, progress_px - 15.0), lane_id)
		
	is_active = false
	visible = false
	died.emit(killed_by_player)
	if EventBus:
		EventBus.enemy_died.emit(self, killed_by_player)

func reset() -> void:
	is_active = false
	visible = false
	progress_px = 0.0
	status_effects.reset()
