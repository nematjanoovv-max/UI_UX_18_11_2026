class_name TowerBase
extends Node2D

## Base class for placed towers handling targeting, buffing, firing, and tier upgrades.

signal fired(target: Enemy)
signal upgraded(new_tier: int)
signal sold(refund_amount: int)

@export var tower_data: TowerData
var current_tier: int = 1 # 1, 2, or 3
var target_mode: TowerData.TargetMode = TowerData.TargetMode.FIRST
var current_target: Enemy = null

var fire_cooldown_timer: float = 0.0
var retarget_timer: float = 0.0

# Support Buffs applied by nearby Beacons (spec §7.4: capped at +60% damage)
var buff_damage_mult: float = 1.0
var buff_range_mult: float = 1.0
var buff_rate_mult: float = 1.0

var projectile_pool: ProjectilePool
var spatial_hash: SpatialHash
var total_invested_gold: int = 0
var is_selected: bool = false

@onready var range_indicator: Node2D = $RangeIndicator

func _ready() -> void:
	if tower_data:
		total_invested_gold = tower_data.cost
		target_mode = tower_data.targeting_default
	queue_redraw()

func get_current_tier_data() -> TowerTier:
	if not tower_data or tower_data.tiers.is_empty():
		return null
	var idx: int = clamp(current_tier - 1, 0, tower_data.tiers.size() - 1)
	return tower_data.tiers[idx]

func get_effective_damage() -> float:
	var t: TowerTier = get_current_tier_data()
	return (t.damage if t else 0.0) * buff_damage_mult

func get_effective_range() -> float:
	var t: TowerTier = get_current_tier_data()
	return (t.range_px if t else 100.0) * buff_range_mult

func get_effective_fire_rate() -> float:
	var t: TowerTier = get_current_tier_data()
	return (t.fire_rate if t else 1.0) * buff_rate_mult

func cycle_target_mode() -> TowerData.TargetMode:
	match target_mode:
		TowerData.TargetMode.FIRST:
			target_mode = TowerData.TargetMode.LAST
		TowerData.TargetMode.LAST:
			target_mode = TowerData.TargetMode.STRONGEST
		TowerData.TargetMode.STRONGEST:
			target_mode = TowerData.TargetMode.NEAREST
		TowerData.TargetMode.NEAREST:
			target_mode = TowerData.TargetMode.FIRST
	current_target = null
	return target_mode

func can_upgrade() -> bool:
	return current_tier < 3

func get_upgrade_cost() -> int:
	var t: TowerTier = get_current_tier_data()
	return t.upgrade_cost if t else 0

func upgrade() -> bool:
	if not can_upgrade():
		return false
	var cost: int = get_upgrade_cost()
	current_tier += 1
	total_invested_gold += cost
	upgraded.emit(current_tier)
	queue_redraw()
	return true

func get_sell_refund() -> int:
	var ratio: float = tower_data.sell_ratio if tower_data else 0.70
	return CombatCalc.calculate_sell_refund(total_invested_gold, ratio)

func set_selected(selected: bool) -> void:
	is_selected = selected
	if range_indicator:
		range_indicator.visible = selected
	queue_redraw()

func _physics_process(delta: float) -> void:
	if not tower_data:
		return
		
	# Beacon towers don't fire projectiles
	if tower_data.id == "beacon":
		return

	if fire_cooldown_timer > 0.0:
		fire_cooldown_timer -= delta

	retarget_timer -= delta
	if retarget_timer <= 0.0 or not _is_target_valid(current_target):
		retarget_timer = 0.1 # Retarget interval
		_find_new_target()

	if _is_target_valid(current_target):
		var target_angle: float = (current_target.global_position - global_position).angle()
		rotation = lerp_angle(rotation, target_angle, 15.0 * delta)
		
		if fire_cooldown_timer <= 0.0:
			_fire()

func _is_target_valid(target: Enemy) -> bool:
	if not is_instance_valid(target) or not target.is_targetable():
		return false
	var r: float = get_effective_range()
	return global_position.distance_squared_to(target.global_position) <= r * r

func _find_new_target() -> void:
	var r: float = get_effective_range()
	var candidates: Array[Enemy] = []
	
	if spatial_hash:
		var raw_nodes: Array[Node2D] = spatial_hash.query_radius(global_position, r)
		for node in raw_nodes:
			var e := node as Enemy
			if e:
				candidates.append(e)
	
	current_target = TargetingSystem.select_target(
		global_position,
		r,
		target_mode,
		candidates,
		tower_data.can_target_ground,
		tower_data.can_target_air
	)

func _fire() -> void:
	var rate: float = get_effective_fire_rate()
	if rate <= 0.0:
		return
	fire_cooldown_timer = 1.0 / rate

	var tier_data: TowerTier = get_current_tier_data()
	if not tier_data or not projectile_pool:
		return

	var dmg: float = get_effective_damage()
	var proj: Projectile = projectile_pool.acquire()
	
	match tower_data.damage_type:
		TowerData.DamageType.KINETIC:
			proj.setup_bullet(global_position, current_target, dmg, CombatCalc.DamageType.KINETIC, tier_data.projectile_speed)
		TowerData.DamageType.EXPLOSIVE:
			proj.setup_mortar(global_position, current_target.global_position, dmg, tier_data.splash_radius, tier_data.projectile_speed)
		TowerData.DamageType.ENERGY:
			proj.setup_cryo(global_position, current_target, dmg, tier_data.slow_ratio, tier_data.slow_duration, tier_data.projectile_speed)
		TowerData.DamageType.PIERCE:
			var dir: Vector2 = (current_target.global_position - global_position).normalized()
			proj.setup_railgun(global_position, dir, dmg, tier_data.pierce_count, get_effective_range())
			
	fired.emit(current_target)

func _draw() -> void:
	if is_selected:
		var r: float = get_effective_range()
		draw_arc(Vector2.ZERO, r, 0, TAU, 48, Color(0.0, 0.9, 1.0, 0.4), 2.0)
