class_name EconomyManager
extends Node

## Handles player gold economy, atomic transactions, wave bonuses, and bounties.

signal gold_updated(current_gold: int, delta: int)

@export var starting_gold: int = 250
var current_gold: int = 250

func _ready() -> void:
	current_gold = starting_gold
	if EventBus:
		EventBus.enemy_died.connect(_on_enemy_died)
		EventBus.wave_cleared.connect(_on_wave_cleared)

func set_initial_gold(amount: int) -> void:
	starting_gold = amount
	current_gold = starting_gold
	gold_updated.emit(current_gold, 0)
	if EventBus:
		EventBus.gold_changed.emit(current_gold)

func can_afford(cost: int) -> bool:
	return current_gold >= cost

func deduct(cost: int) -> bool:
	if not can_afford(cost):
		return false
	current_gold -= cost
	gold_updated.emit(current_gold, -cost)
	if EventBus:
		EventBus.gold_changed.emit(current_gold)
	return true

func add_gold(amount: int) -> void:
	if amount <= 0:
		return
	current_gold += amount
	gold_updated.emit(current_gold, amount)
	if EventBus:
		EventBus.gold_changed.emit(current_gold)

func add_early_call_bonus(remaining_seconds: float) -> int:
	var bonus: int = int(floor(remaining_seconds))
	if bonus > 0:
		add_gold(bonus)
	return bonus

func _on_enemy_died(enemy: Node, killed_by_player: bool) -> void:
	if not killed_by_player:
		return
	var e := enemy as Enemy
	if e:
		add_gold(e.bounty)

func _on_wave_cleared(wave_index: int) -> void:
	var wave_bonus: int = 25 + (2 * wave_index)
	add_gold(wave_bonus)
