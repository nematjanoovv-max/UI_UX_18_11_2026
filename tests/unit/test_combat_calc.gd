extends GutTest

## Unit tests verifying combat math, armor reduction floor, splash falloff, and wave scaling.

func test_effective_armor_reduction() -> void:
	var armor: float = 20.0
	assert_almost_eq(CombatCalc.calculate_effective_armor(armor, CombatCalc.DamageType.KINETIC), 20.0, 0.001)
	assert_almost_eq(CombatCalc.calculate_effective_armor(armor, CombatCalc.DamageType.EXPLOSIVE), 10.0, 0.001)
	assert_almost_eq(CombatCalc.calculate_effective_armor(armor, CombatCalc.DamageType.ENERGY), 0.0, 0.001)
	assert_almost_eq(CombatCalc.calculate_effective_armor(armor, CombatCalc.DamageType.PIERCE), 5.0, 0.001)

func test_damage_floor_20_percent() -> void:
	# Raw damage 100 vs armor 200 (effective armor 200 for Kinetic)
	# Raw - armor = -100, but floor is 100 * 0.20 = 20
	var dmg: float = CombatCalc.calculate_damage(100.0, 200.0, CombatCalc.DamageType.KINETIC)
	assert_almost_eq(dmg, 20.0, 0.001, "Damage dealt should not fall below 20% floor")

func test_energy_ignores_armor() -> void:
	# Raw damage 50 vs armor 100
	var dmg: float = CombatCalc.calculate_damage(50.0, 100.0, CombatCalc.DamageType.ENERGY)
	assert_almost_eq(dmg, 50.0, 0.001, "Energy damage must completely ignore armor")

func test_shield_damage_bonus() -> void:
	var raw_dmg: float = 40.0
	assert_almost_eq(CombatCalc.calculate_shield_damage(raw_dmg, CombatCalc.DamageType.ENERGY), 60.0, 0.001)
	assert_almost_eq(CombatCalc.calculate_shield_damage(raw_dmg, CombatCalc.DamageType.KINETIC), 40.0, 0.001)

func test_splash_falloff() -> void:
	var radius: float = 100.0
	var center_dmg: float = 100.0
	
	# Center
	assert_almost_eq(CombatCalc.calculate_splash_damage(center_dmg, 0.0, radius), 100.0, 0.001)
	# Half radius -> 75%
	assert_almost_eq(CombatCalc.calculate_splash_damage(center_dmg, 50.0, radius), 75.0, 0.001)
	# Edge -> 50%
	assert_almost_eq(CombatCalc.calculate_splash_damage(center_dmg, 100.0, radius), 50.0, 0.001)
	# Outside radius -> 0%
	assert_almost_eq(CombatCalc.calculate_splash_damage(center_dmg, 105.0, radius), 0.0, 0.001)

func test_wave_scaling() -> void:
	assert_almost_eq(CombatCalc.calculate_wave_hp_mult(1), 1.0, 0.001)
	# Wave 30: 1 + 0.10*29 + 0.004*29*29 = 1 + 2.9 + 3.364 = 7.264
	assert_almost_eq(CombatCalc.calculate_wave_hp_mult(30), 7.264, 0.01)

func test_sell_refund() -> void:
	assert_eq(CombatCalc.calculate_sell_refund(100, 0.70), 70)
	assert_eq(CombatCalc.calculate_sell_refund(250, 0.70), 175)
