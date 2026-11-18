class_name Tower3D
extends Node3D

## 3D Tactical Defense Turret for TPS Base Defense (Godot 4.3)

@export_group("Turret Stats")
@export var tower_type: String = "gatling"
@export var damage: float = 18.0
@export var fire_rate: float = 6.0
@export var attack_range: float = 24.0
@export var rotation_speed: float = 8.0

@export_group("Targeting")
var current_target: Node3D = null
var fire_cooldown: float = 0.0

@onready var turret_head: Node3D = $TurretHead
@onready var muzzle_left: Node3D = $TurretHead/MuzzleL
@onready var muzzle_right: Node3D = $TurretHead/MuzzleR
@onready var range_area: Area3D = $RangeArea

func _ready() -> void:
	if range_area:
		range_area.body_entered.connect(_on_body_entered)
		range_area.body_exited.connect(_on_body_exited)

func _physics_process(dt: float) -> void:
	if fire_cooldown > 0.0:
		fire_cooldown = max(0.0, fire_cooldown - dt)

	# Validate target
	if current_target and not is_instance_valid(current_target):
		current_target = null

	if current_target:
		# Track target in 3D
		var target_pos: Vector3 = current_target.global_position
		target_pos.y = turret_head.global_position.y # horizontal aim
		var target_basis: Basis = Transform3D.IDENTITY.looking_at(target_pos - turret_head.global_position, Vector3.UP).basis
		turret_head.basis = turret_head.basis.slerp(target_basis, rotation_speed * dt)

		# Fire when aimed and cooled down
		if fire_cooldown <= 0.0:
			fire_at_target()

func fire_at_target() -> void:
	if not current_target:
		return
	fire_cooldown = 1.0 / fire_rate
	
	if current_target.has_method("take_damage"):
		current_target.take_damage(damage)

func _on_body_entered(body: Node3D) -> void:
	if body.is_in_group("enemies") and current_target == null:
		current_target = body

func _on_body_exited(body: Node3D) -> void:
	if body == current_target:
		current_target = null
		# Find next enemy in area
		var bodies: Array[Node3D] = range_area.get_overlapping_bodies()
		for b in bodies:
			if b.is_in_group("enemies") and is_instance_valid(b):
				current_target = b
				break
