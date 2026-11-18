class_name BattleHUD
extends CanvasLayer

## Minimal tactical battlefield HUD tracking wave progress, base integrity, and gold.

signal start_wave_pressed()
signal pause_pressed()
signal speed_toggled()

@onready var wave_label: Label = $TopBar/HBox/WaveLabel
@onready var gold_label: Label = $TopBar/HBox/GoldLabel
@onready var hp_label: Label = $TopBar/HBox/HpLabel
@onready var start_wave_btn: Button = $BottomBar/StartWaveButton
@onready var speed_btn: Button = $TopBar/HBox/SpeedButton
@onready var pause_btn: Button = $TopBar/HBox/PauseButton

var current_speed_mode: int = 1 # 1, 2, or 3

func _ready() -> void:
	if start_wave_btn:
		start_wave_btn.pressed.connect(func(): start_wave_pressed.emit())
	if speed_btn:
		speed_btn.pressed.connect(_on_speed_pressed)
	if pause_btn:
		pause_btn.pressed.connect(func(): pause_pressed.emit())
		
	if EventBus:
		EventBus.wave_started.connect(_on_wave_started)
		EventBus.gold_changed.connect(_on_gold_changed)
		EventBus.base_hp_changed.connect(_on_hp_changed)

func update_wave_display(current_wave: int, total_waves: int) -> void:
	if wave_label:
		wave_label.text = "Wave: %d / %d" % [current_wave, total_waves]

func _on_wave_started(wave_idx: int) -> void:
	update_wave_display(wave_idx, 10)

func _on_gold_changed(gold: int) -> void:
	if gold_label:
		gold_label.text = "Gold: %d" % gold

func _on_hp_changed(hp: int, max_hp: int) -> void:
	if hp_label:
		hp_label.text = "Base HP: %d / %d" % [hp, max_hp]

func _on_speed_pressed() -> void:
	current_speed_mode = (current_speed_mode % 3) + 1
	if GameState:
		GameState.set_game_speed(float(current_speed_mode))
	if speed_btn:
		speed_btn.text = "%dx" % current_speed_mode
	speed_toggled.emit()
