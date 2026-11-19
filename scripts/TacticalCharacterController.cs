/* =========================================================================================
 * UNITY IMPORT QO'LLANMASI:
 * 1. .glb faylni Unity'da ishlatish uchun: Package Manager orqali 'glTFast' paketini o'rnating.
 * 2. Mixamo .fbx fayllarini ishlatish uchun: Fayl tanlang -> Rig tab -> Animation Type: 'Humanoid' -> Apply.
 * 3. Animator Controller yarating: 'Speed' (float: 0=Idle, 1.5=Walk, 4.0=Run) va 'Jump' (trigger) parametrlarini qo'shing.
 * ========================================================================================= */

using UnityEngine;

namespace CS2Tactical
{
    [RequireComponent(typeof(CharacterController))]
    [RequireComponent(typeof(Animator))]
    public class TacticalCharacterController : MonoBehaviour
    {
        [Header("Harakat Parametrlari")]
        [Tooltip("Yurish tezligi (m/s)")]
        [SerializeField] private float walkSpeed = 2.0f;

        [Tooltip("Yugurish tezligi (m/s)")]
        [SerializeField] private float runSpeed = 5.0f;

        [Tooltip("Sakrash balandligi (metr)")]
        [SerializeField] private float jumpHeight = 1.2f;

        [Tooltip("Gravitatsiya kuchi")]
        [SerializeField] private float gravity = -18.0f;

        [Tooltip("Kameraga qarab burilish silliqligi (sekund)")]
        [SerializeField] private float rotationSmoothTime = 0.08f;

        [Header("Kamera va Bog'lanishlar")]
        [Tooltip("Asosiy kamera transformi (yo'nalishni hisoblash uchun)")]
        [SerializeField] private Transform cameraTransform;

        private CharacterController characterController;
        private Animator animator;

        private Vector3 verticalVelocity;
        private float turnSmoothVelocity;
        private float currentAnimationSpeed = 0f;

        private static readonly int SpeedHash = Animator.StringToHash("Speed");
        private static readonly int JumpHash = Animator.StringToHash("Jump");
        private static readonly int IsGroundedHash = Animator.StringToHash("IsGrounded");

        private void Awake()
        {
            characterController = GetComponent<CharacterController>();
            animator = GetComponent<Animator>();

            if (cameraTransform == null && Camera.main != null)
            {
                cameraTransform = Camera.main.transform;
            }
        }

        private void Update()
        {
            HandleMovement();
            HandleJumpAndGravity();
            UpdateAnimator();
        }

        private void HandleMovement()
        {
            float horizontal = Input.GetAxisRaw("Horizontal");
            float vertical = Input.GetAxisRaw("Vertical");
            Vector3 direction = new Vector3(horizontal, 0f, vertical).normalized;

            bool isRunning = Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift);
            float targetSpeed = 0f;

            if (direction.magnitude >= 0.1f)
            {
                float targetAngle = Mathf.Atan2(direction.x, direction.z) * Mathf.Rad2Deg;
                if (cameraTransform != null)
                {
                    targetAngle += cameraTransform.eulerAngles.y;
                }

                float angle = Mathf.SmoothDampAngle(transform.eulerAngles.y, targetAngle, ref turnSmoothVelocity, rotationSmoothTime);
                transform.rotation = Quaternion.Euler(0f, angle, 0f);

                Vector3 moveDir = Quaternion.Euler(0f, targetAngle, 0f) * Vector3.forward;
                targetSpeed = isRunning ? runSpeed : walkSpeed;
                characterController.Move(moveDir.normalized * (targetSpeed * Time.deltaTime));
            }

            // Animator Speed parametrini silliq o'tkazish (Blend Tree)
            currentAnimationSpeed = Mathf.Lerp(currentAnimationSpeed, targetSpeed, Time.deltaTime * 10f);
        }

        private void HandleJumpAndGravity()
        {
            if (characterController.isGrounded)
            {
                if (verticalVelocity.y < 0)
                {
                    verticalVelocity.y = -2f;
                }

                if (Input.GetButtonDown("Jump"))
                {
                    verticalVelocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
                    animator.SetTrigger(JumpHash);
                }
            }

            verticalVelocity.y += gravity * Time.deltaTime;
            characterController.Move(verticalVelocity * Time.deltaTime);
        }

        private void UpdateAnimator()
        {
            animator.SetFloat(SpeedHash, currentAnimationSpeed);
            animator.SetBool(IsGroundedHash, characterController.isGrounded);
        }
    }
}
