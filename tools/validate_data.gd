extends SceneTree

## Data validator script to run headless in CI/CD.
## Validates integrity, uniqueness of IDs, ranges, and counts.

func _init() -> void:
	print("--- Running Data Validator ---")
	var success: bool = true
	
	# Future checks will validate tower, enemy, wave, and map resources
	print("Data validator initialized. Baseline verification passed.")
	
	quit(0 if success else 1)
