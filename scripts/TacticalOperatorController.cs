using System;
using System.Collections;
using UnityEngine;

namespace LastGrid.Characters
{
    /// <summary>
    /// Tactical Operator Character Controller for Unity.
    /// Handles character locomotion, state transitions (Idle, Walk, Run, Jump),
    /// smooth rotation, ground detection, and animator blending.
    /// Asset: assets/characters/tactical_operator.glb
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class TacticalOperatorController : MonoBehaviour
    {
        [Header("Locomotion Speeds")]
        [Tooltip("Walk speed in meters per second.")]
        [SerializeField] private float walkSpeed = 2.4f;
        
        [Tooltip("Run/Sprint speed in meters per second.")]
        [SerializeField] private float runSpeed = 5.6f;
        
        [Tooltip("Jump apex height in meters.")]
        [SerializeField] private float jumpHeight = 1.25f;
        
        [Tooltip("Gravity acceleration (m/s^2).")]
        [SerializeField] private float gravity = -18.0f;

        [Header("Smoothing & Turning")]
        [SerializeField] private float turnSmoothTime = 0.08f;
        [SerializeField] private float speedSmoothTime = 0.1f;
        
        [Header("References")]
        [SerializeField] private Animator animator;
        [SerializeField] private Transform cameraTransform;

        // Internal physics state
        private CharacterController controller;
        private float verticalVelocity;
        private float currentSpeed;
        private float speedSmoothVelocity;
        private float turnSmoothVelocity;
        private bool isGrounded;

        // Animator parameter hashes for high performance
        private static readonly int SpeedHash = Animator.StringToHash("Speed");
        private static readonly int IsGroundedHash = Animator.StringToHash("IsGrounded");
        private static readonly int JumpTriggerHash = Animator.StringToHash("Jump");
        private static readonly int StateHash = Animator.StringToHash("State"); // 0: Idle, 1: Walk, 2: Run, 3: Jump

        public enum LocomotionState
        {
            Idle = 0,
            Walk = 1,
            Run = 2,
            Jump = 3
        }

        public LocomotionState CurrentState { get; private set; } = LocomotionState.Idle;

        private void Awake()
        {
            controller = GetComponent<CharacterController>();
            if (animator == null)
            {
                animator = GetComponentInChildren<Animator>();
            }

            if (Camera.main != null && cameraTransform == null)
            {
                cameraTransform = Camera.main.transform;
            }
        }

        private void Update()
        {
            CheckGrounded();
            HandleMovement();
            HandleJumpAndGravity();
            UpdateAnimator();
        }

        private void CheckGrounded()
        {
            isGrounded = controller.isGrounded;
            if (isGrounded && verticalVelocity < 0)
            {
                // Small downward force to stay glued to uneven terrain
                verticalVelocity = -2.0f;
            }
        }

        private void HandleMovement()
        {
            float horizontal = Input.GetAxisRaw("Horizontal");
            float vertical = Input.GetAxisRaw("Vertical");
            Vector3 inputDirection = new Vector3(horizontal, 0f, vertical).normalized;

            bool isRunning = Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift);
            float targetSpeed = 0f;

            if (inputDirection.magnitude >= 0.1f)
            {
                // Target angle relative to camera view
                float targetAngle = Mathf.Atan2(inputDirection.x, inputDirection.z) * Mathf.Rad2Deg;
                if (cameraTransform != null)
                {
                    targetAngle += cameraTransform.eulerAngles.y;
                }

                float angle = Mathf.SmoothDampAngle(transform.eulerAngles.y, targetAngle, ref turnSmoothVelocity, turnSmoothTime);
                transform.rotation = Quaternion.Euler(0f, angle, 0f);

                Vector3 moveDir = Quaternion.Euler(0f, targetAngle, 0f) * Vector3.forward;
                targetSpeed = (isRunning ? runSpeed : walkSpeed);

                currentSpeed = Mathf.SmoothDamp(currentSpeed, targetSpeed, ref speedSmoothVelocity, speedSmoothTime);
                controller.Move(moveDir.normalized * (currentSpeed * Time.deltaTime));

                CurrentState = isRunning ? LocomotionState.Run : LocomotionState.Walk;
            }
            else
            {
                currentSpeed = Mathf.SmoothDamp(currentSpeed, 0f, ref speedSmoothVelocity, speedSmoothTime);
                CurrentState = LocomotionState.Idle;
            }
        }

        private void HandleJumpAndGravity()
        {
            if (isGrounded && Input.GetButtonDown("Jump"))
            {
                // v = sqrt(2 * h * -g)
                verticalVelocity = Mathf.Sqrt(jumpHeight * -2.0f * gravity);
                CurrentState = LocomotionState.Jump;

                if (animator != null)
                {
                    animator.SetTrigger(JumpTriggerHash);
                }
            }

            verticalVelocity += gravity * Time.deltaTime;
            controller.Move(new Vector3(0, verticalVelocity, 0) * Time.deltaTime);

            if (!isGrounded)
            {
                CurrentState = LocomotionState.Jump;
            }
        }

        private void UpdateAnimator()
        {
            if (animator == null) return;

            float normalizedSpeed = currentSpeed / runSpeed;
            animator.SetFloat(SpeedHash, normalizedSpeed, speedSmoothTime, Time.deltaTime);
            animator.SetBool(IsGroundedHash, isGrounded);
            animator.SetInteger(StateHash, (int)CurrentState);
        }

        /// <summary>
        /// Explicit API trigger for testing specific animations from UI or cutscenes.
        /// </summary>
        public void PlayAnimation(string clipName)
        {
            if (animator == null) return;

            switch (clipName.ToLowerInvariant())
            {
                case "idle":
                    animator.CrossFade("idle", 0.15f);
                    break;
                case "walk":
                    animator.CrossFade("walk", 0.15f);
                    break;
                case "run":
                    animator.CrossFade("run", 0.15f);
                    break;
                case "jump":
                    animator.CrossFade("jump", 0.1f);
                    break;
                default:
                    Debug.LogWarning($"[TacticalOperator] Clip '{clipName}' not recognized.");
                    break;
            }
        }
    }
}
