class_name SettingsSingleton
extends Node

## Manages persistent user preferences, accessibility options, and audio levels.

const SETTINGS_FILE_PATH: String = "user://settings.cfg"

var master_volume: float = 0.8
var music_volume: float = 0.7
var sfx_volume: float = 0.8
var ui_volume: float = 0.8

var language: String = "en"
var ui_scale: float = 1.0
var color_blind_mode: bool = false
var reduced_motion: bool = false
var auto_start_waves: bool = false
var show_damage_numbers: bool = true
var show_fps: bool = false

func _ready() -> void:
	load_settings()

func load_settings() -> void:
	var config := ConfigFile.new()
	var err: Error = config.load(SETTINGS_FILE_PATH)
	if err != OK:
		return
	
	master_volume = config.get_value("audio", "master", master_volume)
	music_volume = config.get_value("audio", "music", music_volume)
	sfx_volume = config.get_value("audio", "sfx", sfx_volume)
	ui_volume = config.get_value("audio", "ui", ui_volume)
	
	language = config.get_value("general", "language", language)
	ui_scale = config.get_value("display", "ui_scale", ui_scale)
	color_blind_mode = config.get_value("accessibility", "color_blind", color_blind_mode)
	reduced_motion = config.get_value("accessibility", "reduced_motion", reduced_motion)
	auto_start_waves = config.get_value("gameplay", "auto_start_waves", auto_start_waves)
	show_damage_numbers = config.get_value("gameplay", "show_damage_numbers", show_damage_numbers)
	show_fps = config.get_value("display", "show_fps", show_fps)

func save_settings() -> void:
	var config := ConfigFile.new()
	config.set_value("audio", "master", master_volume)
	config.set_value("audio", "music", music_volume)
	config.set_value("audio", "sfx", sfx_volume)
	config.set_value("audio", "ui", ui_volume)
	
	config.set_value("general", "language", language)
	config.set_value("display", "ui_scale", ui_scale)
	config.set_value("accessibility", "color_blind", color_blind_mode)
	config.set_value("accessibility", "reduced_motion", reduced_motion)
	config.set_value("gameplay", "auto_start_waves", auto_start_waves)
	config.set_value("gameplay", "show_damage_numbers", show_damage_numbers)
	config.set_value("display", "show_fps", show_fps)
	
	config.save(SETTINGS_FILE_PATH)
	if EventBus:
		EventBus.settings_changed.emit()
