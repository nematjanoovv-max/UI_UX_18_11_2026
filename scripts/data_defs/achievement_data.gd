class_name AchievementData
extends Resource

## Data schema defining unlockable achievements.

@export var id: String = ""
@export var title_key: String = ""
@export var desc_key: String = ""
@export var icon: Texture2D
@export var is_secret: bool = false
@export var target_progress: int = 1
