class_name AudioManagerSingleton
extends Node

## Handles audio buses, pooled sound effects, background music looping, and web unlock.

var music_player: AudioStreamPlayer
var sfx_pool: Array[AudioStreamPlayer] = []
const POOL_SIZE: int = 16

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	music_player = AudioStreamPlayer.new()
	music_player.bus = "Music"
	add_child(music_player)
	
	for i in range(POOL_SIZE):
		var p := AudioStreamPlayer.new()
		p.bus = "SFX"
		add_child(p)
		sfx_pool.append(p)

func play_music(stream: AudioStream) -> void:
	if not stream:
		return
	if music_player.stream == stream and music_player.playing:
		return
	music_player.stream = stream
	music_player.play()

func stop_music() -> void:
	music_player.stop()

func play_sfx(stream: AudioStream) -> void:
	if not stream:
		return
	for player in sfx_pool:
		if not player.playing:
			player.stream = stream
			player.play()
			return
	# If all busy, steal the first player
	if not sfx_pool.is_empty():
		sfx_pool[0].stream = stream
		sfx_pool[0].play()

func set_bus_volume(bus_name: String, linear_volume: float) -> void:
	var bus_index: int = AudioServer.get_bus_index(bus_name)
	if bus_index >= 0:
		AudioServer.set_bus_volume_db(bus_index, linear_to_db(clampf(linear_volume, 0.0001, 1.0)))
