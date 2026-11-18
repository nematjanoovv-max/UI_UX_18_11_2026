extends GutTest

## Basic smoke test to verify test harness setup.

func test_smoke_assertion() -> void:
	assert_true(true, "Test harness is operating properly.")

func test_math_sanity() -> void:
	assert_eq(2 + 2, 4, "Arithmetic sanity check.")
