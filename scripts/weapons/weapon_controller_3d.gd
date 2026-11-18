class_name WeaponController3D
extends Node3D

## 3D Weapon Controller with PUBG-style Attachments & Recoil (Godot 4.3)

signal ammo_updated(current: int, reserve: int)
signal reload_started()
signal reload_finished()

@export_group("Weapon Archetype")
@export var weapon_name: String = "Pulse Carbine Mk-IV"
@export var damage: float = 34.0
@export var fire_rate: float = 10.0 # rounds per second
@export var magazine_size: int = 30
@export var max_reserve_ammo: int = 150
@export var reload_time: float = 2.1
@export var range_distance: float = 200.0

@export_group("Recoil & Accuracy")
@export var base_spread: float = 0.015
@export var recoil_pitch: float = 0.03
@export var recoil_yaw: float = 0.01
@export var recoil_recovery_speed: float = 8.0

@export_group("Attachments")
@export var has_red_dot: bool = true
@export var has_silencer: bool = false
@export var has_laser_sight: bool = false
@export var has_extended_mag: bool = false

var current_ammo: int = 30
var reserve_ammo: int = 120
var can_fire: bool = true
var is_reloading: bool = false
var fire_cooldown: float = 0.0

@onready var muzzle_point: Node3D = $MuzzlePoint
@onready var laser_mesh: MeshInstance3D = $LaserSight
@onready var silencer_mesh: MeshInstance3D = $SilencerMesh
@onready var red_dot_mesh: MeshInstance3D = $RedDotOptic

func _ready() -> void:
	if has_extended_mag:
		magazine_size = 45
	current_ammo = magazine_size
	emit_signal("ammo_updated", current_ammo, reserve_ammo)
	update_attachment_visuals()

func _process(dt: float) -> void:
	if fire_cooldown > 0.0:
		fire_cooldown = max(0.0, fire_cooldown - dt)

func update_attachment_visuals() -> void:
	if laser_mesh:
		laser_mesh.visible = has_laser_sight
	if silencer_mesh:
		silencer_mesh.visible = has_silencer
	if red_dot_mesh:
		red_dot_mesh.visible = has_red_dot

func fire(from: Vector3, to: Vector3) -> bool:
	if is_reloading or fire_cooldown > 0.0:
		return false
	
	if current_ammo <= 0:
		reload()
		return false

	current_ammo -= 1
	fire_cooldown = 1.0 / fire_rate
	emit_signal("ammo_updated", current_ammo, reserve_ammo)

	# Raycast hit detection in 3D physics space
	var space_state: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
	var query: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(from, to)
	query.collision_mask = 1 | 2 # Layer 1: Environment, Layer 2: Enemies

	# Spread modifier (Red-Dot cuts spread in half)
	var eff_spread: float = base_spread * (0.5 if has_red_dot else 1.0)
	var spread_offset: Vector3 = Vector3(
		randf_range(-eff_spread, eff_spread),
		randf_range(-eff_spread, eff_spread),
		randf_range(-eff_spread, eff_spread)
	) * from.distance_to(to)
	query.to += spread_offset

	var hit: Dictionary = space_state.intersect_ray(query)
	if not hit.is_empty():
		var collider: Object = hit.collider
		var hit_pos: Vector3 = hit.position
		var hit_norm: Vector3 = hit.normal

		# Apply damage if enemy hit
		if collider and collider.has_method("take_damage"):
			var final_dmg: float = damage * (0.9 if has_silencer else 1.0)
			collider.take_damage(final_dmg)
			spawn_blood_spark_fx(hit_pos, hit_norm)
		else:
			spawn_bullet_decal(hit_pos, hit_norm)

	# Physical recoil on weapon model
	position.z += 0.08
	rotation.x += recoil_pitch

	return true

func reload() -> void:
	if is_reloading or current_ammo == magazine_size or reserve_ammo <= 0:
		return

	is_reloading = true
	emit_signal("reload_started")
	
	await get_tree().create_timer(reload_time).timeout

	var needed: int = magazine_size - current_ammo
	var to_load: int = min(needed, reserve_ammo)
	current_ammo += to_load
	reserve_ammo -= to_load

	is_reloading = false
	emit_signal("ammo_updated", current_ammo, reserve_ammo)
	emit_signal("reload_finished")

func spawn_blood_spark_fx(_pos: Vector3, _norm: Vector3) -> void:
	# Spawn particle fx
	pass

func spawn_bullet_decal(_pos: Vector3, _norm: Vector3) -> void:
	# Spawn bullet hole decal on concrete walls
	pass
