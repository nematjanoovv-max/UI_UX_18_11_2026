class_name LocalizationSingleton
extends Node

## Manages locale selection, translations (en, uz, ru), and string formatting.

signal locale_changed(new_locale: String)

const SUPPORTED_LOCALES: Array[String] = ["en", "uz", "ru"]
var current_locale: String = "en"

func _ready() -> void:
	if Settings:
		set_locale(Settings.language)
	else:
		set_locale("en")

func set_locale(locale_code: String) -> void:
	if locale_code in SUPPORTED_LOCALES:
		current_locale = locale_code
	else:
		current_locale = "en"
	TranslationServer.set_locale(current_locale)
	locale_changed.emit(current_locale)

func get_localized_text(key: String) -> String:
	return tr(key)
