class_name SettingsMenu
extends Control

## Interactive settings menu supporting volume sliders, language switch, and accessibility.

@onready var back_btn: Button = %BackButton
@onready var master_slider: HSlider = %MasterSlider
@onready var music_slider: HSlider = %MusicSlider
@onready var sfx_slider: HSlider = %SfxSlider
@onready var lang_option: OptionButton = %LangOption
@onready var color_blind_check: CheckBox = %ColorBlindCheck
@onready var auto_start_check: CheckBox = %AutoStartCheck
@onready var damage_num_check: CheckBox = %DamageNumCheck
@onready var reset_save_btn: Button = %ResetSaveButton

func _ready() -> void:
	back_btn.pressed.connect(_on_back_pressed)
	reset_save_btn.pressed.connect(_on_reset_save_pressed)
	
	_load_current_values()
	_connect_change_events()

func _load_current_values() -> void:
	if not Settings:
		return
	master_slider.value = Settings.master_volume * 100.0
	music_slider.value = Settings.music_volume * 100.0
	sfx_slider.value = Settings.sfx_volume * 100.0
	
	lang_option.clear()
	lang_option.add_item("English", 0)
	lang_option.add_item("O'zbek", 1)
	lang_option.add_item("Русский", 2)
	
	match Settings.language:
		"uz": lang_option.selected = 1
		"ru": lang_option.selected = 2
		_: lang_option.selected = 0
		
	color_blind_check.button_pressed = Settings.color_blind_mode
	auto_start_check.button_pressed = Settings.auto_start_waves
	damage_num_check.button_pressed = Settings.show_damage_numbers

func _connect_change_events() -> void:
	master_slider.value_changed.connect(func(v): 
		Settings.master_volume = v / 100.0
		if AudioManager: AudioManager.set_bus_volume("Master", Settings.master_volume)
	)
	music_slider.value_changed.connect(func(v): 
		Settings.music_volume = v / 100.0
		if AudioManager: AudioManager.set_bus_volume("Music", Settings.music_volume)
	)
	sfx_slider.value_changed.connect(func(v): 
		Settings.sfx_volume = v / 100.0
		if AudioManager: AudioManager.set_bus_volume("SFX", Settings.sfx_volume)
	)
	
	lang_option.item_selected.connect(func(idx):
		var langs := ["en", "uz", "ru"]
		Settings.language = langs[idx]
		if Localization: Localization.set_locale(Settings.language)
	)
	
	color_blind_check.toggled.connect(func(toggled): Settings.color_blind_mode = toggled)
	auto_start_check.toggled.connect(func(toggled): Settings.auto_start_waves = toggled)
	damage_num_check.toggled.connect(func(toggled): Settings.show_damage_numbers = toggled)

func _on_reset_save_pressed() -> void:
	if SaveSystem:
		SaveSystem.reset_save()
	if Settings:
		Settings.save_settings()

func _on_back_pressed() -> void:
	if Settings:
		Settings.save_settings()
	if SceneManager:
		SceneManager.change_scene("res://scenes/menus/main_menu.tscn")
