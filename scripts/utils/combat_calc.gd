class_name CombatCalc
extends RefCounted

## Pure functional calculations for damage, armor reduction, scaling, and splash falloff.

enum DamageType {
	KINETIC,
	EXPLOSIVE,
	ENERGY,
	PIERCE
}

const ARMOR_MULTIPLIERS: Dictionary = {
	DamageType.KINETIC: 1.0,
	DamageType.EXPLOSIVE: 0.5,
	DamageType.ENERGY: 0.0,
	DamageType.PIERCE: 0.25
}

static func calculate_effective_armor(armor: float, damage_type: DamageType) -> float:
	var mult: float = ARMOR_MULTIPLIERS.get(damage_type, 1.0)
	return maxf(0.0, armor * mult)

static func calculate_damage(raw_damage: float, armor: float, damage_type: DamageType) -> float:
	if raw_damage <= 0.0:
		return 0.0
	var effective_armor: float = calculate_effective_armor(armor, damage_type)
	var floor_damage: float = raw_damage * 0.20
	return maxf(raw_damage - effective_armor, floor_damage)

static func calculate_shield_damage(raw_damage: float, damage_type: DamageType) -> float:
	if damage_type == DamageType.ENERGY:
		return raw_damage * 1.5
	return raw_damage

static func calculate_splash_damage(center_damage: float, distance_px: float, radius_px: float) -> float:
	if radius_px <= 0.0 or distance_px > radius_px:
		return 0.0
	if distance_px <= 0.0:
		return center_damage
	# Full damage at center (1.0), falling linearly to 50% (0.5) at the edge
	var falloff_ratio: float = 1.0 - (0.5 * (distance_px / radius_px))
	return center_damage * falloff_ratio

static func calculate_wave_hp_mult(wave_index: int) -> float:
	if wave_index <= 1:
		return 1.0
	var w: float = float(wave_index - 1)
	return 1.0 + (0.10 * w) + (0.004 * w * w)

static func calculate_bounty(base_bounty: int, wave_index: int, gold_mult: float = 1.0) -> int:
	var w: float = float(max(1, wave_index) - 1)
	var wave_factor: float = 1.0 + (0.03 * w)
	return int(round(float(base_bounty) * wave_factor * gold_mult))

static func calculate_sell_refund(invested_gold: int, refund_ratio: float = 0.70) -> int:
	return int(float(invested_gold) * refund_ratio)
