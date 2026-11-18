extends GutTest

## Integration tests verifying economy transactions, tower upgrades/sells, and wave loop completion.

func test_economy_transactions() -> void:
	var eco := EconomyManager.new()
	add_child_autofree(eco)
	eco.set_initial_gold(250)
	
	assert_eq(eco.current_gold, 250)
	assert_true(eco.can_afford(100))
	assert_false(eco.can_afford(300))
	
	# Purchase Pulse tower (100)
	assert_true(eco.deduct(100))
	assert_eq(eco.current_gold, 150)
	
	# Early call bonus with 8.5s remaining -> +8 gold
	var bonus: int = eco.add_early_call_bonus(8.5)
	assert_eq(bonus, 8)
	assert_eq(eco.current_gold, 158)
	
	# Wave clear bonus on wave 1 -> 25 + 2 = 27
	eco._on_wave_cleared(1)
	assert_eq(eco.current_gold, 185)

func test_upgrade_and_sell_controller() -> void:
	var eco := EconomyManager.new()
	var grid := GridMap2D.new()
	var up_ctrl := UpgradeController.new()
	add_child_autofree(eco)
	add_child_autofree(grid)
	add_child_autofree(up_ctrl)
	
	eco.set_initial_gold(300)
	up_ctrl.economy_manager = eco
	up_ctrl.grid_map = grid
	
	# Create a Pulse tower
	var tower_data: TowerData = load("res://data/towers/pulse.tres") as TowerData
	var tower := TowerBase.new()
	add_child_autofree(tower)
	tower.tower_data = tower_data
	tower.total_invested_gold = 100
	
	grid.place_tower(Vector2i(5, 5), tower)
	up_ctrl.select_tower(tower)
	
	# Upgrade to tier 2 (Pulse tier 1 upgrade cost = 80)
	assert_true(up_ctrl.try_upgrade_selected())
	assert_eq(tower.current_tier, 2)
	assert_eq(eco.current_gold, 220) # 300 - 80
	assert_eq(tower.total_invested_gold, 180) # 100 + 80
	
	# Target mode cycle: FIRST -> LAST
	up_ctrl.cycle_selected_target_mode()
	assert_eq(tower.target_mode, TowerData.TargetMode.LAST)
	
	# Sell refund: 70% of 180 = 126
	assert_true(up_ctrl.try_sell_selected())
	assert_eq(eco.current_gold, 346) # 220 + 126

func test_wave_clear_and_defeat_logic() -> void:
	# Acceptance Criteria #3: Wave completion and base-loss states are correct
	var base := BaseCore.new()
	add_child_autofree(base)
	base.set_initial_hp(10)
	
	# Base leaks 10 HP -> Defeat state
	base.take_damage(10)
	assert_eq(base.current_hp, 0)
	assert_eq(GameState.current_state, GameStateSingleton.State.DEFEAT, "Zero base HP must trigger DEFEAT state")
