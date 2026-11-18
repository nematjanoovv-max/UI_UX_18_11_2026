class_name PathNetwork
extends RefCounted

## Manages polyline waypoints, pre-baked segment lengths, and continuous sampling along paths.

class BakedLane:
	var waypoints: PackedVector2Array
	var segment_lengths: PackedFloat32Array
	var total_length: float = 0.0

	func _init(pts: PackedVector2Array) -> void:
		waypoints = pts
		segment_lengths = PackedFloat32Array()
		total_length = 0.0
		if pts.size() < 2:
			return
		
		for i in range(pts.size() - 1):
			var seg_len: float = pts[i].distance_to(pts[i + 1])
			segment_lengths.append(seg_len)
			total_length += seg_len

	func sample(progress_px: float) -> Dictionary:
		# Returns {"position": Vector2, "tangent": Vector2}
		if waypoints.size() == 0:
			return {"position": Vector2.ZERO, "tangent": Vector2.RIGHT}
		if waypoints.size() == 1 or progress_px <= 0.0:
			var tangent: Vector2 = Vector2.RIGHT
			if waypoints.size() >= 2:
				tangent = (waypoints[1] - waypoints[0]).normalized()
			return {"position": waypoints[0], "tangent": tangent}
		if progress_px >= total_length:
			var last_idx: int = waypoints.size() - 1
			var tangent: Vector2 = (waypoints[last_idx] - waypoints[last_idx - 1]).normalized()
			return {"position": waypoints[last_idx], "tangent": tangent}

		var accumulated: float = 0.0
		for i in range(segment_lengths.size()):
			var seg_len: float = segment_lengths[i]
			if accumulated + seg_len >= progress_px:
				var t: float = (progress_px - accumulated) / seg_len
				var pos: Vector2 = waypoints[i].lerp(waypoints[i + 1], t)
				var tangent: Vector2 = (waypoints[i + 1] - waypoints[i]).normalized()
				return {"position": pos, "tangent": tangent}
			accumulated += seg_len

		return {"position": waypoints[waypoints.size() - 1], "tangent": Vector2.RIGHT}

var lanes: Dictionary = {} # int (lane_id) -> BakedLane

func add_lane(lane_id: int, waypoints: PackedVector2Array) -> void:
	lanes[lane_id] = BakedLane.new(waypoints)

func get_lane(lane_id: int) -> BakedLane:
	return lanes.get(lane_id, null)

func sample_lane(lane_id: int, progress_px: float) -> Dictionary:
	var lane: BakedLane = get_lane(lane_id)
	if lane:
		return lane.sample(progress_px)
	return {"position": Vector2.ZERO, "tangent": Vector2.RIGHT}

func get_lane_length(lane_id: int) -> float:
	var lane: BakedLane = get_lane(lane_id)
	if lane:
		return lane.total_length
	return 0.0
