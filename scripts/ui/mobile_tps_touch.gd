class_name MobileTPSTouch
extends Control

## Mobile Virtual Touch Joysticks & Action Buttons for 3D TPS (Godot 4.3)
## Enables PUBG/GTA-style dual thumb control on smartphones.

@export var player_node: Player3D
@export var joystick_radius: float = 75.0

# Touch Tracking
var move_touch_id: int = -1
var look_touch_id: int = -1
var move_center: Vector2 = Vector2.ZERO
var move_current: Vector2 = Vector2.ZERO

@onready var joystick_base: Control = $LeftZone/JoystickBase
@onready var joystick_knob: Control = $LeftZone/JoystickKnob

func _ready() -> void:
	# Hide on desktop PCs with mouse
	if not DisplayServer.has_feature(DisplayServer.FEATURE_TOUCHSCREEN):
		visible = false

func _input(event: InputEvent) -> void:
	if not player_node:
		return

	if event is InputEventScreenTouch:
		var half_screen_w: float = get_viewport_rect().size.x * 0.5

		if event.pressed:
			# Left side: Movement Joystick
			if event.position.x < half_screen_w and move_touch_id == -1:
				move_touch_id = event.index
				move_center = event.position
				move_current = event.position
				if joystick_base:
					joystick_base.position = move_center - joystick_base.size * 0.5
					joystick_base.visible = true
			# Right side: Camera Drag Orbit
			elif event.position.x >= half_screen_w and look_touch_id == -1:
				look_touch_id = event.index
		else:
			# Touch Released
			if event.index == move_touch_id:
				move_touch_id = -1
				player_node.virtual_move_dir = Vector2.ZERO
				if joystick_base:
					joystick_base.visible = false
			elif event.index == look_touch_id:
				look_touch_id = -1

	elif event is InputEventScreenDrag:
		if event.index == move_touch_id:
			move_current = event.position
			var delta: Vector2 = move_current - move_center
			if delta.length() > joystick_radius:
				delta = delta.normalized() * joystick_radius
			if joystick_knob:
				joystick_knob.position = delta
			# Normalize output to [-1, 1]
			player_node.virtual_move_dir = delta / joystick_radius

		elif event.index == look_touch_id:
			# Feed look swipe delta to Player3D
			player_node.virtual_look_delta = event.relative

# UI Button Callbacks
func _on_fire_button_pressed() -> void:
	if player_node:
		player_node.shoot_weapon()

func _on_ads_button_toggled(button_pressed: bool) -> void:
	if player_node:
		player_node.set_aiming(button_pressed)

func _on_jump_button_pressed() -> void:
	if player_node and player_node.is_on_floor():
		player_node.velocity.y = player_node.jump_velocity

func _on_crouch_button_toggled(button_pressed: bool) -> void:
	if player_node:
		player_node.is_crouching = button_pressed

func _on_reload_button_pressed() -> void:
	if player_node and player_node.weapon_controller:
		player_node.weapon_controller.reload()

func _on_build_button_pressed() -> void:
	if player_node:
		player_node.toggle_build_mode()
