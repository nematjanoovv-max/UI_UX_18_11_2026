class_name EnemyData
extends Resource

## Data schema for enemy units and baseline attributes.

@export var id: String = ""
@export var display_key: String = ""
@export var hp: float = 100.0
@export var shield: float = 0.0
@export var armor: float = 0.0
@export var speed: float = 60.0 # Pixels per second
@export var bounty: int = 5
@export var base_damage: int = 1
@export var visual_scale: float = 1.0
@export var traits: Array[String] = []
@export var tags: Array[String] = []
@export var is_boss: bool = false
