extends GutTest

## Acceptance tests for Path-invariance, Enemy movement, and Base core mechanics.

func test_path_network_segment_sampling() -> void:
	var waypoints: PackedVector2Array = PackedVector2Array([
		Vector2(0, 0),
		Vector2(100, 0),
		Vector2(100, 200),
		Vector2(300, 200)
	])
	var network := PathNetwork.new()
	network.add_lane(0, waypoints)
	
	# Expected length: 100 + 200 + 200 = 500 px
	var total_len: float = network.get_lane_length(0)
	assert_almost_eq(total_len, 500.0, 0.001)
	
	# Sample at 50 px -> Vector2(50, 0)
	var s1: Dictionary = network.sample_lane(0, 50.0)
	assert_almost_eq(s1["position"].x, 50.0, 0.001)
	assert_almost_eq(s1["position"].y, 0.0, 0.001)
	
	# Sample at 200 px -> halfway down second segment -> Vector2(100, 100)
	var s2: Dictionary = network.sample_lane(0, 200.0)
	assert_almost_eq(s2["position"].x, 100.0, 0.001)
	assert_almost_eq(s2["position"].y, 100.0, 0.001)

func test_path_invariant_1000_samples() -> void:
	# Gate M2 / Acceptance Criteria #1:
	# Enemies mathematically never leave the path (sampled point must lie on line segments within <= 0.001 px).
	var waypoints: PackedVector2Array = PackedVector2Array([
		Vector2(64, 64),
		Vector2(256, 64),
		Vector2(256, 320),
		Vector2(512, 320),
		Vector2(512, 576),
		Vector2(896, 576)
	])
	var network := PathNetwork.new()
	network.add_lane(1, waypoints)
	var total_len: float = network.get_lane_length(1)
	
	for i in range(1000):
		# Test progress across various simulated speeds and time steps
		var progress: float = (float(i) / 1000.0) * total_len
		var sample: Dictionary = network.sample_lane(1, progress)
		var pt: Vector2 = sample["position"]
		
		# Compute minimum distance to the polyline segments
		var min_dist: float = 1e9
		for seg_idx in range(waypoints.size() - 1):
			var a: Vector2 = waypoints[seg_idx]
			var b: Vector2 = waypoints[seg_idx + 1]
			var seg_vec: Vector2 = b - a
			var l2: float = seg_vec.length_squared()
			var dist: float = 0.0
			if l2 == 0.0:
				dist = pt.distance_to(a)
			else:
				var t: float = clampf((pt - a).dot(seg_vec) / l2, 0.0, 1.0)
				var proj: Vector2 = a + t * seg_vec
				dist = pt.distance_to(proj)
			min_dist = minf(min_dist, dist)
			
		assert_lt(min_dist, 0.001, "Sampled point #%d deviated from waypoint path" % i)

func test_base_core_damage_and_destruction() -> void:
	var base := BaseCore.new()
	add_child_autofree(base)
	base.set_initial_hp(20)
	
	assert_eq(base.current_hp, 20)
	base.take_damage(5)
	assert_eq(base.current_hp, 15)
	
	var signal_emitted: bool = false
	base.base_destroyed.connect(func(): signal_emitted = true)
	
	base.take_damage(20)
	assert_eq(base.current_hp, 0)
	assert_true(signal_emitted, "Base destruction signal should be emitted when HP reaches 0")
