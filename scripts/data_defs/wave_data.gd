class_name WaveData
extends Resource

## Data schema defining the composition and rewards of a single wave.

@export var index: int = 1
@export var groups: Array[SpawnGroup] = []
@export var is_boss: bool = false
@export var bonus_gold: int = 25
@export var notes: String = ""
