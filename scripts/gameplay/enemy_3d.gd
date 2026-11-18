class_name Enemy3D
extends CharacterBody3D

## 3D Enemy Unit with NavigationAgent3D Pathfinding (Godot 4.3)

signal enemy_died(enemy_type: String, score_val: int)

@export_group("Enemy Profile")
@export var enemy_type: String = "grunt_3d"
@export var max_health: float = 120.0
@export var move_speed: float = 4.2
@export var attack_damage: float = 15.0
@export var attack_range: float = 2.2
@export var attack_cooldown: float = 1.2
@export var score_reward: int = 100

var current_health: float = 120.0
var target_core: Node3D = null
var aggro_player: Node3D = null
var current_atk_cd: float = 0.0

@onready var nav_agent: NavigationAgent3D = $NavigationAgent3D

func _ready() -> void:
	add_to_group("enemies")
	current_health = max_health
	nav_agent.velocity_computed.connect(_on_velocity_computed)
	
	# Find central base core in scene
	var core_nodes: Array[Node] = get_tree().get_nodes_in_group("base_core")
	if core_nodes.size() > 0:
		target_core = core_nodes[0] as Node3D
		nav_agent.target_position = target_core.global_position

func _physics_process(dt: float) -> void:
	if current_atk_cd > 0.0:
		current_atk_cd = max(0.0, current_atk_cd - dt)

	# Decide target: aggro player if nearby, else base core
	var active_target: Node3D = aggro_player if aggro_player and is_instance_valid(aggro_player) else target_core

	if active_target and is_instance_valid(active_target):
		nav_agent.target_position = active_target.global_position

		var dist: float = global_position.distance_to(active_target.global_position)
		if dist <= attack_range:
			if current_atk_cd <= 0.0:
				perform_melee_attack(active_target)
			return

		if not nav_agent.is_navigation_finished():
			var next_path_pos: Vector3 = nav_agent.get_next_path_position()
			var new_vel: Vector3 = (next_path_pos - global_position).normalized() * move_speed
			nav_agent.set_velocity(new_vel)
			
			# Face movement direction
			var look_dir: Vector3 = next_path_pos - global_position
			look_dir.y = 0.0
			if look_dir.length_squared() > 0.01:
				rotation.y = lerp_angle(rotation.y, atan2(-look_dir.x, -look_dir.z), 10.0 * dt)

func _on_velocity_computed(safe_velocity: Vector3) -> void:
	velocity = safe_velocity
	move_and_slide()

func perform_melee_attack(target: Node3D) -> void:
	current_atk_cd = attack_cooldown
	if target.has_method("take_damage"):
		target.take_damage(attack_damage)

func take_damage(amount: float) -> void:
	current_health = max(0.0, current_health - amount)
	
	# Aggro to player when shot
	var players: Array[Node] = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		aggro_player = players[0] as Node3D

	if current_health <= 0.0:
		on_death()

func on_death() -> void:
	emit_signal("enemy_died", enemy_type, score_reward)
	queue_free()
