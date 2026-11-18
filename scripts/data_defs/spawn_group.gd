class_name SpawnGroup
extends Resource

## Data schema defining a timed cohort of enemies within a wave.

@export var enemy_id: String = "grunt"
@export var count: int = 8
@export var interval_s: float = 0.8
@export var start_delay_s: float = 0.0
@export var lane_id: int = 0
@export var hp_mult_override: float = 1.0
