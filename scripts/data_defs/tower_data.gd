class_name TowerData
extends Resource

## Data schema defining tower archetypes, base properties, and tier progressions.

enum DamageType {
	KINETIC,
	EXPLOSIVE,
	ENERGY,
	PIERCE
}

enum TargetMode {
	FIRST,
	LAST,
	STRONGEST,
	NEAREST
}

@export var id: String = ""
@export var display_key: String = ""
@export var desc_key: String = ""
@export var icon: Texture2D
@export var scene: PackedScene
@export var damage_type: DamageType = DamageType.KINETIC
@export var cost: int = 100
@export var sell_ratio: float = 0.7
@export var targeting_default: TargetMode = TargetMode.FIRST
@export var can_target_ground: bool = true
@export var can_target_air: bool = true
@export var tiers: Array[TowerTier] = []
