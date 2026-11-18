class_name TowerTier
extends Resource

## Data schema defining stats for a specific upgrade tier of a tower.

@export var tier_level: int = 1
@export var damage: float = 10.0
@export var fire_rate: float = 1.0 # Shots per second
@export var range_px: float = 140.0
@export var projectile_speed: float = 500.0
@export var splash_radius: float = 0.0
@export var slow_ratio: float = 0.0 # E.g. 0.35 for 35% slow
@export var slow_duration: float = 0.0 # Seconds
@export var buff_damage_ratio: float = 0.0 # E.g. 0.15 for +15% damage
@export var buff_range_ratio: float = 0.0 # E.g. 0.10 for +10% range
@export var buff_rate_ratio: float = 0.0 # E.g. 0.10 for +10% fire rate
@export var upgrade_cost: int = 80
@export var pierce_count: int = 1
