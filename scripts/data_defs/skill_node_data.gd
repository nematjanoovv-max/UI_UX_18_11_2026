class_name SkillNodeData
extends Resource

## Data schema defining a node in the persistent meta-progression skill tree.

enum Branch {
	OFFENSE,
	ECONOMY,
	DEFENSE
}

@export var id: String = ""
@export var title_key: String = ""
@export var desc_key: String = ""
@export var branch: Branch = Branch.OFFENSE
@export var max_rank: int = 3
@export var cost_per_rank: Array[int] = [1, 2, 3]
@export var prerequisite_node_id: String = ""
@export var effect_type: String = ""
@export var effect_value_per_rank: float = 0.03
