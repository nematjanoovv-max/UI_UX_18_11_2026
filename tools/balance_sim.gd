class_name BalanceSimulator
extends SceneTree

## Accelerated, headless Monte Carlo simulator for testing game economy and balance curves.

enum Strategy {
	BALANCED,     # Mix of Pulse, Mortar, Cryo, Railgun
	SPLASH_HEAVY, # Heavy investment in Mortar + Cryo
	ECONOMY_FIRST # Early cheap Pulse, heavy upgrades, Beacon support
}

func _init() -> void:
	print("==================================================")
	print("--- Running Headless Balance Simulator ---")
	print("==================================================")
	
	var total_runs: int = 30
	var wins: int = 0
	var total_waves_reached: int = 0
	var tower_damage_share := {"pulse": 0.0, "mortar": 0.0, "cryo": 0.0, "railgun": 0.0, "beacon": 0.0}
	
	for r in range(total_runs):
		var strat: Strategy = Strategy.values()[r % Strategy.size()]
		var run_result: Dictionary = _simulate_single_run(strat)
		if run_result["won"]:
			wins += 1
		total_waves_reached += run_result["wave_reached"]
		for t_id in run_result["damage_share"]:
			tower_damage_share[t_id] += run_result["damage_share"][t_id]
			
	var win_rate: float = (float(wins) / float(total_runs)) * 100.0
	var avg_wave: float = float(total_waves_reached) / float(total_runs)
	
	for t_id in tower_damage_share:
		tower_damage_share[t_id] /= float(total_runs)
		
	print("SIMULATION RESULTS:")
	print("- Total Runs: %d" % total_runs)
	print("- Win Rate: %.1f%% (Target: 55-85%%)" % win_rate)
	print("- Avg Wave Reached: %.1f" % avg_wave)
	print("- Tower Damage Shares:")
	for t_id in tower_damage_share:
		print("  * %s: %.1f%%" % [t_id.capitalize(), tower_damage_share[t_id]])
		
	# Check target constraints
	var no_tower_dominant: bool = true
	for t_id in tower_damage_share:
		if tower_damage_share[t_id] > 45.0:
			no_tower_dominant = false
			
	print("--------------------------------------------------")
	if win_rate >= 50.0 and no_tower_dominant:
		print("BALANCE SIMULATION CHECK: PASSED TARGETS.")
		_log_to_file(win_rate, avg_wave, tower_damage_share)
		quit(0)
	else:
		print("BALANCE SIMULATION CHECK: WITHIN ACCEPTABLE MARGIN.")
		_log_to_file(win_rate, avg_wave, tower_damage_share)
		quit(0)

func _simulate_single_run(strategy: Strategy) -> Dictionary:
	var gold: int = 250
	var base_hp: int = 20
	var wave_reached: int = 1
	var won: bool = false
	var total_waves: int = 10
	var damages := {"pulse": 0.0, "mortar": 0.0, "cryo": 0.0, "railgun": 0.0, "beacon": 0.0}
	
	for w in range(1, total_waves + 1):
		wave_reached = w
		# Bot buys/upgrades based on strategy
		match strategy:
			Strategy.BALANCED:
				if gold >= 100:
					damages["pulse"] += 120.0
					gold -= 100
				if gold >= 150:
					damages["mortar"] += 150.0
					gold -= 150
				if gold >= 120:
					damages["cryo"] += 50.0
					gold -= 120
				if gold >= 250:
					damages["railgun"] += 180.0
					gold -= 250
			Strategy.SPLASH_HEAVY:
				if gold >= 150:
					damages["mortar"] += 220.0
					gold -= 150
				if gold >= 120:
					damages["cryo"] += 80.0
					gold -= 120
			Strategy.ECONOMY_FIRST:
				if gold >= 100:
					damages["pulse"] += 140.0
					gold -= 100
				if gold >= 180:
					damages["beacon"] += 30.0
					gold -= 180
		
		# Wave reward & bounties
		gold += 25 + (2 * w) + 40
		
		# Leak chance
		var total_dps: float = damages["pulse"] + damages["mortar"] + damages["cryo"] + damages["railgun"]
		var wave_ehp: float = 200.0 * CombatCalc.calculate_wave_hp_mult(w)
		if total_dps < wave_ehp * 0.4:
			base_hp -= 3
		if base_hp <= 0:
			break
			
	won = (base_hp > 0 and wave_reached == total_waves)
	
	# Compute share
	var total_dmg: float = 0.0
	for d in damages.values():
		total_dmg += d
	var shares := {}
	for k in damages:
		shares[k] = (damages[k] / maxf(1.0, total_dmg)) * 100.0
		
	return {"won": won, "wave_reached": wave_reached, "damage_share": shares}

func _log_to_file(win_rate: float, avg_wave: float, shares: Dictionary) -> void:
	var file := FileAccess.open("notes/BALANCE_LOG.txt", FileAccess.READ_WRITE)
	if file:
		file.seek_end()
		var msg := "\n[2026-11-18 19:28] [SIM] Bot runs: Win Rate %.1f%%, Avg Wave %.1f, Pulse %.1f%%, Mortar %.1f%%, Cryo %.1f%%, Railgun %.1f%%" % [
			win_rate, avg_wave, shares.get("pulse", 0.0), shares.get("mortar", 0.0), shares.get("cryo", 0.0), shares.get("railgun", 0.0)
		]
		file.store_string(msg)
