class_name UpgradeController
extends Node

## Manages tower selection, tier upgrades, selling, and target mode cycling.

signal tower_inspected(tower: TowerBase)
signal inspection_cleared()

@export var economy_manager: EconomyManager
@export var grid_map: GridMap2D

var selected_tower: TowerBase = null

func select_tower(tower: TowerBase) -> void:
	if selected_tower and is_instance_valid(selected_tower):
		selected_tower.set_selected(false)
		
	selected_tower = tower
	if selected_tower:
		selected_tower.set_selected(true)
		tower_inspected.emit(selected_tower)
		if EventBus:
			EventBus.tower_selected.emit(selected_tower)
	else:
		inspection_cleared.emit()
		if EventBus:
			EventBus.tower_selected.emit(null)

func deselect() -> void:
	select_tower(null)

func try_upgrade_selected() -> bool:
	if not selected_tower or not is_instance_valid(selected_tower):
		return false
	if not selected_tower.can_upgrade():
		return false
		
	var cost: int = selected_tower.get_upgrade_cost()
	if economy_manager and not economy_manager.deduct(cost):
		return false
		
	var success: bool = selected_tower.upgrade()
	if success and EventBus:
		EventBus.tower_upgraded.emit(selected_tower)
	return success

func try_sell_selected() -> bool:
	if not selected_tower or not is_instance_valid(selected_tower):
		return false
		
	var refund: int = selected_tower.get_sell_refund()
	if economy_manager:
		economy_manager.add_gold(refund)
		
	var cell: Vector2i = grid_map.world_to_cell(selected_tower.global_position)
	grid_map.remove_tower(cell)
	
	if EventBus:
		EventBus.tower_sold.emit(selected_tower)
		
	selected_tower.queue_free()
	deselect()
	return true

func cycle_selected_target_mode() -> void:
	if selected_tower and is_instance_valid(selected_tower):
		selected_tower.cycle_target_mode()
		tower_inspected.emit(selected_tower)
