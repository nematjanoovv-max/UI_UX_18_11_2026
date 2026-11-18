class_name BossPhase
extends Resource

## Data schema defining health threshold and mechanics for boss phases.

@export var hp_threshold_ratio: float = 0.5 # Trigger when HP drops below this fraction (e.g. 0.66, 0.33)
@export var speed_multiplier: float = 1.0
@export var armor_bonus: float = 0.0
@export var spawn_minion_id: String = ""
@export var spawn_minion_count: int = 0
@export var spawn_interval: float = 5.0
@export var description: String = ""
