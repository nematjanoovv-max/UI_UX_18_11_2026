class_name MapData
extends Resource

## Data schema defining complete map properties, grid layout, lanes, and rules.

@export var id: String = ""
@export var name_key: String = ""
@export var theme: String = "neon_grid"
@export var grid_width: int = 20
@export var grid_height: int = 11
@export var cell_size: int = 64
@export var cell_layout: PackedInt32Array = PackedInt32Array()
@export var lanes: Array[LaneData] = []
@export var wave_count: int = 10
@export var modifier_ids: Array[String] = []
@export var starting_gold: int = 250
@export var base_hp: int = 20
@export var unlock_requires_map_id: String = ""
@export var unlock_requires_stars: int = 0
@export var star_threshold_3: float = 0.90 # >= 90% Base HP left
@export var star_threshold_2: float = 0.50 # >= 50% Base HP left
@export var background_texture: Texture2D
@export var bgm_stream: AudioStream
