class_name TowerPanels
extends CanvasLayer

## Manages both the bottom build bar (hotkeys 1-5) and selected tower inspection/upgrade panel.

signal build_tower_selected(tower_id: String)
signal upgrade_requested()
signal sell_requested()
signal target_mode_cycled()

@onready var pulse_btn: Button = %PulseBtn
@onready var mortar_btn: Button = %MortarBtn
@onready var cryo_btn: Button = %CryoBtn
@onready var railgun_btn: Button = %RailgunBtn
@onready var beacon_btn: Button = %BeaconBtn

@onready var inspect_panel: PanelContainer = %InspectPanel
@onready var tower_name_label: Label = %InspectTowerName
@onready var tier_label: Label = %InspectTier
@onready var target_mode_btn: Button = %InspectTargetModeBtn
@onready var upgrade_btn: Button = %InspectUpgradeBtn
@onready var sell_btn: Button = %InspectSellBtn

var _inspected_tower: TowerBase = null
var _current_gold: int = 250

func _ready() -> void:
	pulse_btn.pressed.connect(func(): build_tower_selected.emit("pulse"))
	mortar_btn.pressed.connect(func(): build_tower_selected.emit("mortar"))
	cryo_btn.pressed.connect(func(): build_tower_selected.emit("cryo"))
	railgun_btn.pressed.connect(func(): build_tower_selected.emit("railgun"))
	beacon_btn.pressed.connect(func(): build_tower_selected.emit("beacon"))
	
	upgrade_btn.pressed.connect(func(): upgrade_requested.emit())
	sell_btn.pressed.connect(func(): sell_requested.emit())
	target_mode_btn.pressed.connect(func(): target_mode_cycled.emit())
	
	if EventBus:
		EventBus.gold_changed.connect(_on_gold_changed)
		EventBus.tower_selected.connect(_on_tower_selected)
		EventBus.tower_upgraded.connect(_on_tower_updated)
		
	inspect_panel.visible = false

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("build_select_1"):
		build_tower_selected.emit("pulse")
	elif event.is_action_pressed("build_select_2"):
		build_tower_selected.emit("mortar")
	elif event.is_action_pressed("build_select_3"):
		build_tower_selected.emit("cryo")
	elif event.is_action_pressed("build_select_4"):
		build_tower_selected.emit("railgun")
	elif event.is_action_pressed("build_select_5"):
		build_tower_selected.emit("beacon")
	elif event.is_action_pressed("upgrade"):
		upgrade_requested.emit()
	elif event.is_action_pressed("sell"):
		sell_requested.emit()
	elif event.is_action_pressed("cycle_target"):
		target_mode_cycled.emit()

func _on_gold_changed(gold: int) -> void:
	_current_gold = gold
	pulse_btn.disabled = gold < 100
	mortar_btn.disabled = gold < 150
	cryo_btn.disabled = gold < 120
	railgun_btn.disabled = gold < 250
	beacon_btn.disabled = gold < 180
	_update_inspect_panel()

func _on_tower_selected(tower: Node) -> void:
	_inspected_tower = tower as TowerBase
	_update_inspect_panel()

func _on_tower_updated(_tower: Node) -> void:
	_update_inspect_panel()

func _update_inspect_panel() -> void:
	if not _inspected_tower or not is_instance_valid(_inspected_tower):
		inspect_panel.visible = false
		return

	inspect_panel.visible = true
	var data: TowerData = _inspected_tower.tower_data
	tower_name_label.text = data.id.to_upper() + " TOWER"
	tier_label.text = "Tier: %d / 3" % _inspected_tower.current_tier
	
	var mode_names := ["FIRST", "LAST", "STRONGEST", "NEAREST"]
	target_mode_btn.text = "Target: " + mode_names[_inspected_tower.target_mode]
	
	if _inspected_tower.can_upgrade():
		var cost: int = _inspected_tower.get_upgrade_cost()
		upgrade_btn.text = "Upgrade (%dg)" % cost
		upgrade_btn.disabled = _current_gold < cost
	else:
		upgrade_btn.text = "MAX TIER"
		upgrade_btn.disabled = true
		
	sell_btn.text = "Sell (+%dg)" % _inspected_tower.get_sell_refund()
