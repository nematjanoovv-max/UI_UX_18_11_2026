class_name BossData
extends EnemyData

## Data schema for multi-phase Boss encounters.

@export var phases: Array[BossPhase] = []
@export var slow_cap: float = 0.5 # Maximum slow percentage allowed on this boss
@export var splash_resistance_ratio: float = 0.0 # E.g. 0.25 for 25% damage reduction
@export var intro_cutscene: bool = true
