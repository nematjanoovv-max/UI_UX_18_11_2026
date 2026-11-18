class_name SkillTreeMenu
extends Control

## Interactive meta-progression Skill Tree screen across Offense, Economy, and Defense.

@onready var rp_label: Label = %RpLabel
@onready var respec_btn: Button = %RespecButton
@onready var back_btn: Button = %BackButton
@onready var offense_container: VBoxContainer = %OffenseContainer
@onready var economy_container: VBoxContainer = %EconomyContainer
@onready var defense_container: VBoxContainer = %DefenseContainer

const SKILLS_DEF: Array[Dictionary] = [
	# Offense
	{"id": "dmg_boost", "branch": 0, "name": "Kinetic Calibration", "desc": "+3% Tower Damage/rank", "cost": 2, "max": 3},
	{"id": "rate_boost", "branch": 0, "name": "Overclock Cycles", "desc": "+3% Fire Rate/rank", "cost": 2, "max": 3},
	{"id": "range_boost", "branch": 0, "name": "Target Optics", "desc": "+2% Range/rank", "cost": 3, "max": 3},
	{"id": "crit_boost", "branch": 0, "name": "Critical Matrices", "desc": "+4% Crit Chance/rank", "cost": 4, "max": 3},
	{"id": "pierce_boost", "branch": 0, "name": "Dense Penetrators", "desc": "+5% Armor Piercing/rank", "cost": 5, "max": 3},
	# Economy
	{"id": "start_gold", "branch": 1, "name": "Venture Capital", "desc": "+25 Starting Gold/rank", "cost": 1, "max": 3},
	{"id": "bounty_boost", "branch": 1, "name": "Scrap Scavenger", "desc": "+3% Kill Bounty/rank", "cost": 2, "max": 3},
	{"id": "refund_boost", "branch": 1, "name": "Salvage Rights", "desc": "+4% Sell Refund/rank", "cost": 3, "max": 3},
	{"id": "wave_bonus", "branch": 1, "name": "Interest Yield", "desc": "+5% Wave Clear Bonus/rank", "cost": 4, "max": 3},
	{"id": "cheap_upgrades", "branch": 1, "name": "Modular Design", "desc": "-3% Upgrade Costs/rank", "cost": 5, "max": 3},
	# Defense
	{"id": "base_hp_boost", "branch": 2, "name": "Reinforced Hull", "desc": "+2 Base HP/rank", "cost": 1, "max": 3},
	{"id": "auto_repair", "branch": 2, "name": "Nanite Field", "desc": "Repair 1 HP every 10 waves", "cost": 3, "max": 3},
	{"id": "slow_boost", "branch": 2, "name": "Supercooling", "desc": "+4% Slow Effect/rank", "cost": 3, "max": 3},
	{"id": "beacon_boost", "branch": 2, "name": "Harmonic Resonance", "desc": "+4% Beacon Buff/rank", "cost": 4, "max": 3},
	{"id": "emergency_shield", "branch": 2, "name": "Emergency Barrier", "desc": "Absorb 1 leak per run", "cost": 5, "max": 1}
]

func _ready() -> void:
	back_btn.pressed.connect(_on_back_pressed)
	respec_btn.pressed.connect(_on_respec_pressed)
	_refresh_display()

func _refresh_display() -> void:
	var total_rp: int = SaveSystem.progress_data.get("rp_total", 0) if SaveSystem else 0
	var spent_rp: int = SaveSystem.progress_data.get("rp_spent", 0) if SaveSystem else 0
	var available_rp: int = max(0, total_rp - spent_rp)
	rp_label.text = "Available RP: %d  (Total Earned: %d)" % [available_rp, total_rp]
	
	_populate_branch(offense_container, 0)
	_populate_branch(economy_container, 1)
	_populate_branch(defense_container, 2)

func _populate_branch(container: VBoxContainer, branch_idx: int) -> void:
	for child in container.get_children():
		child.queue_free()

	var skills_dict: Dictionary = SaveSystem.progress_data.get("skills", {}) if SaveSystem else {}
	var total_rp: int = SaveSystem.progress_data.get("rp_total", 0) if SaveSystem else 0
	var spent_rp: int = SaveSystem.progress_data.get("rp_spent", 0) if SaveSystem else 0
	var available_rp: int = max(0, total_rp - spent_rp)

	for skill in SKILLS_DEF:
		if skill["branch"] != branch_idx:
			continue
		var s_id: String = skill["id"]
		var current_rank: int = skills_dict.get(s_id, 0)
		var is_max: bool = current_rank >= skill["max"]
		var cost: int = skill["cost"]
		
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(240, 48)
		if is_max:
			btn.text = "%s [MAX]\n%s" % [skill["name"], skill["desc"]]
			btn.disabled = true
		else:
			btn.text = "%s (Rank %d/%d) - %d RP\n%s" % [skill["name"], current_rank, skill["max"], cost, skill["desc"]]
			btn.disabled = (available_rp < cost)
			btn.pressed.connect(_buy_skill.bind(s_id, cost))
		container.add_child(btn)

func _buy_skill(skill_id: String, cost: int) -> void:
	if not SaveSystem:
		return
	var skills_dict: Dictionary = SaveSystem.progress_data.get("skills", {})
	skills_dict[skill_id] = skills_dict.get(skill_id, 0) + 1
	SaveSystem.progress_data["skills"] = skills_dict
	SaveSystem.progress_data["rp_spent"] = SaveSystem.progress_data.get("rp_spent", 0) + cost
	SaveSystem.save_progress()
	_refresh_display()

func _on_respec_pressed() -> void:
	if not SaveSystem:
		return
	SaveSystem.progress_data["skills"] = {}
	SaveSystem.progress_data["rp_spent"] = 0
	SaveSystem.save_progress()
	_refresh_display()

func _on_back_pressed() -> void:
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/main_menu.tscn")
