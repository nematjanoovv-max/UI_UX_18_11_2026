class_name Player3D
extends CharacterBody3D

## 3D Third-Person Shooter (TPS) Character Controller (Godot 4.3)
## Inspired by PUBG/GTA mechanics with over-the-shoulder camera and base-defense building.

signal health_changed(current: float, max_val: float)
signal weapon_fired()
signal build_mode_toggled(is_building: bool)

@export_group("Movement Settings")
@export var walk_speed: float = 6.5
@export var sprint_speed: float = 11.0
@export var crouch_speed: float = 3.5
@export var jump_velocity: float = 6.2
@export var acceleration: float = 12.0
@export var friction: float = 14.0
@export var gravity: float = 18.0

@export_group("Camera & Aiming")
@export var mouse_sensitivity: float = 0.003
@export var touch_sensitivity: float = 0.005
@export var default_fov: float = 75.0
@export var ads_fov: float = 48.0
@export var normal_cam_offset: Vector3 = Vector3(0.65, 0.4, 2.8)
@export var ads_cam_offset: Vector3 = Vector3(0.45, 0.25, 1.4)

@export_group("Combat & Stats")
@export var max_health: float = 100.0
var current_health: float = 100.0

# Node References
@onready var camera_pivot: Node3D = $CameraPivot
@onready var spring_arm: SpringArm3D = $CameraPivot/SpringArm3D
@onready var camera: Camera3D = $CameraPivot/SpringArm3D/Camera3D
@onready var weapon_controller: Node3D = $CameraPivot/SpringArm3D/Camera3D/WeaponHolder
@onready var collision_shape: CollisionShape3D = $CollisionShape3D
@onready var build_raycast: RayCast3D = $BuildRaycast

# State Variables
var is_aiming: bool = false
var is_sprinting: bool = false
var is_crouching: bool = false
var is_building: bool = false
var selected_tower_id: String = "pulse_3d"

# Mobile virtual inputs (updated by MobileTPSTouch)
var virtual_move_dir: Vector2 = Vector2.ZERO
var virtual_look_delta: Vector2 = Vector2.ZERO

func _ready() -> void:
	current_health = max_health
	emit_signal("health_changed", current_health, max_health)
	
	# Only capture mouse on Desktop (not on Touch/Mobile devices)
	if not DisplayServer.has_feature(DisplayServer.FEATURE_TOUCHSCREEN):
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _unhandled_input(event: InputEvent) -> void:
	# Mouse look rotation
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_camera(Vector2(event.relative.x, event.relative.y) * mouse_sensitivity)

	# Combat & Building Keybindings
	if event.is_action_pressed("fire_weapon"):
		shoot_weapon()
	elif event.is_action_pressed("aim_down_sights"):
		set_aiming(true)
	elif event.is_action_released("aim_down_sights"):
		set_aiming(false)
	elif event.is_action_pressed("toggle_build_mode"):
		toggle_build_mode()
	elif event.is_action_pressed("reload_weapon"):
		if weapon_controller and weapon_controller.has_method("reload"):
			weapon_controller.reload()

func _physics_process(dt: float) -> void:
	# Process mobile virtual camera rotation
	if virtual_look_delta != Vector2.ZERO:
		rotate_camera(virtual_look_delta * touch_sensitivity)
		virtual_look_delta = Vector2.ZERO

	# Apply Gravity
	if not is_on_floor():
		velocity.y -= gravity * dt

	# Jump
	if is_on_floor() and (Input.is_action_just_pressed("jump") or Input.is_action_just_pressed("ui_accept")):
		velocity.y = jump_velocity

	# Determine Move Speed
	var current_speed: float = walk_speed
	if is_crouching:
		current_speed = crouch_speed
	elif is_sprinting and not is_aiming:
		current_speed = sprint_speed

	# Input Direction (combining Keyboard and Mobile Touch Joystick)
	var input_vec: Vector2 = Input.get_vector("move_left", "move_right", "move_forward", "move_backward")
	if virtual_move_dir != Vector2.ZERO:
		input_vec = virtual_move_dir

	# Direction aligned with camera orientation
	var cam_yaw: float = camera_pivot.rotation.y
	var move_dir: Vector3 = (Transform3D.IDENTITY.rotated(Vector3.UP, cam_yaw) * Vector3(input_vec.x, 0, input_vec.y)).normalized()

	if move_dir.length_squared() > 0.01:
		velocity.x = move_toward(velocity.x, move_dir.x * current_speed, acceleration * dt * 5.0)
		velocity.z = move_toward(velocity.z, move_dir.z * current_speed, acceleration * dt * 5.0)
		
		# Rotate character body towards movement direction if not aiming
		if not is_aiming:
			var target_rot_y: float = atan2(-move_dir.x, -move_dir.z)
			rotation.y = lerp_angle(rotation.y, target_rot_y, 10.0 * dt)
	else:
		velocity.x = move_toward(velocity.x, 0.0, friction * dt * 5.0)
		velocity.z = move_toward(velocity.z, 0.0, friction * dt * 5.0)

	# If aiming, character always faces camera forward direction
	if is_aiming:
		rotation.y = lerp_angle(rotation.y, camera_pivot.rotation.y, 15.0 * dt)

	# Camera ADS interpolation
	update_camera_ads(dt)

	move_and_slide()

	# Process 3D Building Ghost
	if is_building:
		update_building_ghost()

func rotate_camera(delta: Vector2) -> void:
	if not camera_pivot:
		return
	camera_pivot.rotation.y -= delta.x
	camera_pivot.rotation.x = clamp(camera_pivot.rotation.x - delta.y, -deg_to_rad(75.0), deg_to_rad(65.0))

func set_aiming(aim: bool) -> void:
	is_aiming = aim

func update_camera_ads(dt: float) -> void:
	if not camera or not spring_arm:
		return
	var target_fov: float = ads_fov if is_aiming else default_fov
	var target_offset: Vector3 = ads_cam_offset if is_aiming else normal_cam_offset
	
	camera.fov = lerp(camera.fov, target_fov, 12.0 * dt)
	spring_arm.spring_length = lerp(spring_arm.spring_length, target_offset.z, 12.0 * dt)

func shoot_weapon() -> void:
	if is_building:
		place_selected_tower()
		return
		
	if weapon_controller and weapon_controller.has_method("fire"):
		var screen_center: Vector2 = get_viewport().get_visible_rect().size * 0.5
		var from: Vector3 = camera.project_ray_origin(screen_center)
		var to: Vector3 = from + camera.project_ray_normal(screen_center) * 500.0
		weapon_controller.fire(from, to)
		emit_signal("weapon_fired")

func toggle_build_mode() -> void:
	is_building = !is_building
	emit_signal("build_mode_toggled", is_building)

func update_building_ghost() -> void:
	if not build_raycast:
		return
	build_raycast.force_raycast_update()
	if build_raycast.is_colliding():
		var hit_point: Vector3 = build_raycast.get_collision_point()
		# Snap to 2-meter grid for clean tactical defense layout
		var snapped_pos: Vector3 = Vector3(
			snapped(hit_point.x, 2.0),
			hit_point.y,
			snapped(hit_point.z, 2.0)
		)
		# Update position of placement ghost node if present

func place_selected_tower() -> void:
	if not build_raycast or not build_raycast.is_colliding():
		return
	var hit_pos: Vector3 = build_raycast.get_collision_point()
	# Spawn 3D defense tower at position
	toggle_build_mode()

func take_damage(amount: float) -> void:
	current_health = max(0.0, current_health - amount)
	emit_signal("health_changed", current_health, max_health)
	if current_health <= 0.0:
		on_death()

func on_death() -> void:
	# Respawn or defeat screen trigger
	pass
