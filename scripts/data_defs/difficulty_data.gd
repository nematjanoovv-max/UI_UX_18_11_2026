class_name DifficultyData
extends Resource

## Data schema defining run difficulty parameters.

@export var id: String = "normal"
@export var name_key: String = "difficulty_normal"
@export var hp_multiplier: float = 1.0
@export var gold_multiplier: float = 1.0
@export var base_hp: int = 20
@export var sell_refund_ratio: float = 0.70
@export var star_threshold_lenient: bool = false
