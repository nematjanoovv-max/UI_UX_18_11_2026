class_name EventBusSingleton
extends Node

## Global typed signal bus for decoupled cross-system communication.

# Wave & Combat signals
signal wave_started(wave_index: int)
signal wave_cleared(wave_index: int)
signal all_waves_cleared()
signal enemy_spawned(enemy: Node)
signal enemy_died(enemy: Node, killed_by_player: bool)
signal enemy_reached_base(enemy: Node, damage: int)

# Base & Economy signals
signal base_hp_changed(hp: int, max_hp: int)
signal gold_changed(gold: int)

# Tower signals
signal tower_built(tower: Node)
signal tower_upgraded(tower: Node)
signal tower_sold(tower: Node)
signal tower_selected(tower: Node)

# State & System signals
signal state_changed(from_state: int, to_state: int)
signal settings_changed()
signal achievement_unlocked(id: String)
signal run_finished(is_victory: bool)
