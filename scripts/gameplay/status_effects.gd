class_name StatusEffects
extends RefCounted

## Manages status effects (Slow, Freeze, Phase) applied to enemy instances.

var slow_ratio: float = 0.0 # 0.0 to 1.0
var slow_timer: float = 0.0
var slow_cap: float = 1.0 # E.g. 0.50 for bosses

var is_phased: bool = false
var phase_cooldown_timer: float = 0.0
var phase_duration_timer: float = 0.0

func apply_slow(ratio: float, duration: float, cap: float = 1.0) -> void:
	slow_cap = cap
	var capped_ratio: float = minf(ratio, slow_cap)
	# Strongest slow wins (does not multiply stack)
	if capped_ratio >= slow_ratio:
		slow_ratio = capped_ratio
		slow_timer = maxf(slow_timer, duration)

func tick(delta: float) -> void:
	if slow_timer > 0.0:
		slow_timer -= delta
		if slow_timer <= 0.0:
			slow_ratio = 0.0

func update_phase(delta: float, cycle_interval: float = 4.0, phase_duration: float = 1.5) -> void:
	if is_phased:
		phase_duration_timer -= delta
		if phase_duration_timer <= 0.0:
			is_phased = false
			phase_cooldown_timer = cycle_interval
	else:
		phase_cooldown_timer -= delta
		if phase_cooldown_timer <= 0.0:
			is_phased = true
			phase_duration_timer = phase_duration

func get_speed_multiplier() -> float:
	return maxf(0.0, 1.0 - slow_ratio)

func reset() -> void:
	slow_ratio = 0.0
	slow_timer = 0.0
	slow_cap = 1.0
	is_phased = false
	phase_cooldown_timer = 0.0
	phase_duration_timer = 0.0
