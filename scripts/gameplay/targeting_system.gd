class_name TargetingSystem
extends RefCounted

## Implements all 4 targeting modes (FIRST, LAST, STRONGEST, NEAREST) with deterministic tie-breaks.

static func select_target(
	tower_pos: Vector2,
	range_px: float,
	target_mode: TowerData.TargetMode,
	candidates: Array[Enemy],
	can_target_ground: bool = true,
	can_target_air: bool = true
) -> Enemy:
	var valid_candidates: Array[Enemy] = []
	var r2: float = range_px * range_px
	
	for enemy in candidates:
		if not is_instance_valid(enemy) or not enemy.is_targetable():
			continue
		if enemy.global_position.distance_squared_to(tower_pos) > r2:
			continue
		# Ground / Air filter check
		var is_air: bool = "air" in enemy.data.tags
		if is_air and not can_target_air:
			continue
		if not is_air and not can_target_ground:
			continue
			
		valid_candidates.append(enemy)

	if valid_candidates.is_empty():
		return null

	var best_target: Enemy = valid_candidates[0]
	for i in range(1, valid_candidates.size()):
		var candidate: Enemy = valid_candidates[i]
		if _is_better_target(candidate, best_target, target_mode, tower_pos):
			best_target = candidate

	return best_target

static func _is_better_target(
	candidate: Enemy,
	current_best: Enemy,
	mode: TowerData.TargetMode,
	tower_pos: Vector2
) -> bool:
	match mode:
		TowerData.TargetMode.FIRST:
			if candidate.progress_px > current_best.progress_px:
				return true
			elif candidate.progress_px < current_best.progress_px:
				return false
			else:
				return candidate.uid < current_best.uid

		TowerData.TargetMode.LAST:
			if candidate.progress_px < current_best.progress_px:
				return true
			elif candidate.progress_px > current_best.progress_px:
				return false
			else:
				return candidate.uid < current_best.uid

		TowerData.TargetMode.STRONGEST:
			var cand_ehp: float = candidate.get_total_ehp()
			var best_ehp: float = current_best.get_total_ehp()
			if cand_ehp > best_ehp:
				return true
			elif cand_ehp < best_ehp:
				return false
			else:
				# Tie -> FIRST
				if candidate.progress_px > current_best.progress_px:
					return true
				elif candidate.progress_px < current_best.progress_px:
					return false
				else:
					return candidate.uid < current_best.uid

		TowerData.TargetMode.NEAREST:
			var d_cand: float = tower_pos.distance_squared_to(candidate.global_position)
			var d_best: float = tower_pos.distance_squared_to(current_best.global_position)
			if d_cand < d_best:
				return true
			elif d_cand > d_best:
				return false
			else:
				# Tie -> FIRST
				if candidate.progress_px > current_best.progress_px:
					return true
				elif candidate.progress_px < current_best.progress_px:
					return false
				else:
					return candidate.uid < current_best.uid

	return false
