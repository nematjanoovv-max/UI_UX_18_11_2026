class_name Projectile
extends Node2D

## Handles projectile flight, homing, ballistic arc, hit detection, and damage delivery.

signal hit_target(target: Enemy, damage: float, dmg_type: CombatCalc.DamageType)
signal exploded_at(world_pos: Vector2, radius: float, damage: float, dmg_type: CombatCalc.DamageType)
signal finished()

enum ProjectileType {
	BULLET,    # Homing / direct
	MORTAR,    # Arc ballistic with area splash
	CRYO_BEAM, # Freezing cone / bolt
	RAILGUN    # High speed piercing beam
}

var projectile_type: ProjectileType = ProjectileType.BULLET
var damage: float = 10.0
var damage_type: CombatCalc.DamageType = CombatCalc.DamageType.KINETIC
var speed: float = 600.0
var splash_radius: float = 0.0
var slow_ratio: float = 0.0
var slow_duration: float = 0.0
var pierce_remaining: int = 1

var target_enemy: Enemy = null
var target_destination: Vector2 = Vector2.ZERO
var velocity: Vector2 = Vector2.ZERO
var is_active: bool = false
var lifetime_timer: float = 0.0
var hit_enemies: Array[Enemy] = []

func setup_bullet(start_pos: Vector2, target: Enemy, dmg: float, dmg_t: CombatCalc.DamageType, spd: float) -> void:
	global_position = start_pos
	target_enemy = target
	damage = dmg
	damage_type = dmg_t
	speed = spd
	projectile_type = ProjectileType.BULLET
	splash_radius = 0.0
	pierce_remaining = 1
	is_active = true
	visible = true
	lifetime_timer = 3.0
	hit_enemies.clear()

func setup_mortar(start_pos: Vector2, dest_pos: Vector2, dmg: float, splash_r: float, spd: float) -> void:
	global_position = start_pos
	target_destination = dest_pos
	damage = dmg
	damage_type = CombatCalc.DamageType.EXPLOSIVE
	speed = spd
	projectile_type = ProjectileType.MORTAR
	splash_radius = splash_r
	pierce_remaining = 1
	is_active = true
	visible = true
	lifetime_timer = 4.0
	hit_enemies.clear()

func setup_cryo(start_pos: Vector2, target: Enemy, dmg: float, slow_r: float, slow_dur: float, spd: float) -> void:
	global_position = start_pos
	target_enemy = target
	damage = dmg
	damage_type = CombatCalc.DamageType.ENERGY
	speed = spd
	projectile_type = ProjectileType.CRYO_BEAM
	slow_ratio = slow_r
	slow_duration = slow_dur
	splash_radius = 0.0
	pierce_remaining = 1
	is_active = true
	visible = true
	lifetime_timer = 2.0
	hit_enemies.clear()

func setup_railgun(start_pos: Vector2, dir: Vector2, dmg: float, pierce: int, length_px: float) -> void:
	global_position = start_pos
	velocity = dir.normalized() * 3000.0
	damage = dmg
	damage_type = CombatCalc.DamageType.PIERCE
	speed = 3000.0
	projectile_type = ProjectileType.RAILGUN
	pierce_remaining = pierce
	splash_radius = 0.0
	is_active = true
	visible = true
	lifetime_timer = length_px / speed
	hit_enemies.clear()

func _physics_process(delta: float) -> void:
	if not is_active:
		return
		
	lifetime_timer -= delta
	if lifetime_timer <= 0.0:
		_despawn()
		return

	match projectile_type:
		ProjectileType.BULLET, ProjectileType.CRYO_BEAM:
			if is_instance_valid(target_enemy) and target_enemy.is_active:
				var dir: Vector2 = (target_enemy.global_position - global_position).normalized()
				global_position += dir * speed * delta
				rotation = dir.angle()
				if global_position.distance_to(target_enemy.global_position) <= 12.0:
					_impact(target_enemy)
			else:
				# Target lost/dead, continue in current direction
				global_position += Vector2.RIGHT.rotated(rotation) * speed * delta
				
		ProjectileType.MORTAR:
			var dir: Vector2 = (target_destination - global_position).normalized()
			var dist: float = global_position.distance_to(target_destination)
			var step: float = speed * delta
			if dist <= step:
				global_position = target_destination
				_explode_mortar()
			else:
				global_position += dir * step
				rotation = dir.angle()
				
		ProjectileType.RAILGUN:
			global_position += velocity * delta

func _impact(enemy: Enemy) -> void:
	if not is_instance_valid(enemy) or enemy in hit_enemies:
		return
	hit_enemies.append(enemy)
	enemy.take_damage(damage, damage_type)
	if slow_ratio > 0.0 and enemy.status_effects:
		enemy.status_effects.apply_slow(slow_ratio, slow_duration)
	hit_target.emit(enemy, damage, damage_type)
	_despawn()

func _explode_mortar() -> void:
	exploded_at.emit(global_position, splash_radius, damage, damage_type)
	_despawn()

func _despawn() -> void:
	is_active = false
	visible = false
	finished.emit()
