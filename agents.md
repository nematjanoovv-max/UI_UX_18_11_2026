# AGENTS.md — Tower Defense: Last Grid

> Uzbek: Bu fayl AI agent (Antigravity) uchun asosiy qoidalar. Avval shuni, keyin `spec.md` va `plan.md` ni to'liq o'qing.
> Source: Project 07 of "2D O'YINLAR UCHUN 12 TA TO'LIQ AMALIY LOYIHA" (Texnik topshiriq, 2026).

## 0. Mission

Build **Tower Defense: Last Grid** — a complete, playable, wave-based 2D tower-defense strategy game, start to finish
(menu → play → win/lose → results → restart). A menu or moving prototype alone is NOT acceptable.

- Engine: **Godot 4.x (latest stable, GDScript, statically typed)**. Pin the exact version in `project.godot`,
  CI and `notes/DECISIONS.txt`. (4.6.x is confirmed stable; 4.7 docs exist — verify at godotengine.org, then pin.)
- Platforms: **Windows, Web (HTML5), Android**.
- Deploy: **GitHub** (source, CI, releases) + **Vercel** (web build hosting). **Render** is optional (see spec §14.3).
- Final content: **10 maps, 5 towers, 8 enemy types, 3 bosses, 30 wave configurations**.

Read order: `agents.md` (this) → `spec.md` (what to build) → `plan.md` (in what order, with checklists).

## 1. Working language & communication

- Talk to the user in **Uzbek** (Latin script). Code, comments, commit messages, file names, docs: **English**.
- In-game text: i18n keys, languages `en` (default), `uz`, `ru`. Never hardcode UI strings.
- Be concise. After each milestone report: what was done, what was tested, what is next, what needs the user.
- Ask the user ONLY for things in §9 ("Human-gated actions"). For everything else, pick the most reasonable option,
  write it into `notes/DECISIONS.txt`, and continue.

## 2. Workspace rules

- The folder that contains this file is the **repository root**. Do not hardcode absolute paths anywhere
  (project may live on an SD card / external storage / other machine). Use `res://`, `user://` and relative paths.
- Godot project (`project.godot`) lives at the repo root. Do NOT create a nested duplicate project.
- Keep `agents.md`, `plan.md`, `spec.md` at the root. Do not delete or rewrite them; append only to the
  "Change log" section at the bottom of `plan.md`.
- Do one thing at a time: **finish and verify a milestone before starting the next** (source rule 123).
- Never paste secrets, tokens or keystores into the repo, chat, logs or notes.

## 3. The `.txt` notes protocol (IMPORTANT — user requirement)

Keep a running record in plain **`.txt`** files inside `notes/` (create all on day 1). Write to them *as you go*,
not at the end. Every entry: `[YYYY-MM-DD HH:MM] [TAG] message` (one entry per line, short, factual).

| File | What goes in it |
|---|---|
| `notes/NOTES.txt` | Running log: what you did, what worked, what surprised you. Append after every task. |
| `notes/DECISIONS.txt` | Every technical/design decision + short reason (engine version, libs, formulas changed). |
| `notes/ASSUMPTIONS.txt` | Anything ambiguous in the source doc and how you interpreted it. |
| `notes/BLOCKERS.txt` | Anything stopping progress; what you tried; what is needed from the user. |
| `notes/KNOWN_BUGS.txt` | Open bugs: repro steps, severity, status. Move to "FIXED" section when done. |
| `notes/BALANCE_LOG.txt` | Every balance change: old → new value, reason, simulator result. |
| `notes/ASSET_LICENSES.txt` | Every external asset: file, source URL, author, license, date. (Required for release.) |
| `notes/DEPLOY_CHECKLIST.txt` | Exact deploy steps that worked (GitHub / Vercel / Render / Android), env var NAMES only. |
| `notes/PERF_LOG.txt` | FPS/memory/load-time measurements per platform and per milestone. |

Tags: `IMPORTANT`, `WARN`, `DECISION`, `ASSUMPTION`, `TODO`, `BUG`, `FIXED`, `IDEA`, `PERF`, `BALANCE`.
Anything the user *must* see goes in `IMPORTANT` and is also repeated in your milestone report.
Never write secret values — only names.

## 4. Tech stack & modern practices (use these)

- **Godot 4.x stable**, GDScript with **static typing everywhere** (`var x: int`, typed arrays, `-> void`).
  Enable warnings-as-errors for untyped declarations in Project Settings (GDScript > Debug).
- **Renderer: Compatibility** (the only one that exports to Web and is safest on mid/low Android). No Forward+ features.
- **Data-driven design**: towers, enemies, waves, maps, skills are custom `Resource` classes (`.tres`) under `data/`
  (see spec §6). No stats hardcoded in scripts.
- **Autoload singletons** (small, single-purpose): `EventBus`, `GameState`, `Settings`, `SaveSystem`, `AudioManager`,
  `SceneManager`, `Localization`. Cross-system talk via **signals on EventBus**, not hard node paths.
- **Composition over inheritance**; every mechanic is its own scene/module. No god-scripts (source rule 125).
- **Object pooling** for enemies, projectiles, floating text, VFX (no per-frame `instantiate()` in hot paths).
- **Deterministic simulation**: fixed logic tick (`_physics_process`, 60 Hz), seeded RNG per run, no gameplay logic
  in `_process`. Needed for the balance simulator and tests.
- **Input**: Godot InputMap actions only (never raw keycodes in gameplay); mouse + touch share one code path
  (`emulate_mouse_from_touch` OFF; handle `InputEventScreenTouch/Drag` explicitly or via a unified pointer layer).
- **Tests**: **GUT** (Godot Unit Test, version matching Godot 4) + headless balance simulator.
- **Lint/format**: `gdtoolkit` (`gdformat`, `gdlint`) in CI and pre-commit.
- **CI/CD**: GitHub Actions → test → export (Web/Windows/Android) → deploy Web to Vercel → GitHub Release.
- **Web**: single-threaded export (default, no COOP/COEP needed). Audio must unlock on first user gesture.
- **Accessibility & UX**: UI scale, colour-blind-safe palette, reduced-motion option, game speed 1×/2×/3×,
  big touch targets (≥ 48 dp), safe-area handling, rebindable keys, full keyboard menu navigation.
- Use only free / own / properly licensed assets. Prefer **procedurally generated or self-made vector/pixel art**
  (SVG/Krita/Aseprite style) and CC0 audio. Record every asset in `notes/ASSET_LICENSES.txt`.

## 5. Code conventions

- Files/dirs: `snake_case`. Classes: `PascalCase` (`class_name TowerBase`). Constants: `UPPER_SNAKE`. Signals: past tense
  (`enemy_died`, `wave_started`). Scenes and their main script share a name (`tower_base.tscn` / `tower_base.gd`).
- One responsibility per script; target < 250 lines per script. Extract when larger.
- No magic numbers — put in Resources or `const`. No `get_node("../../..")`; use `@export var x: Node` or signals.
- Public API documented with `##` doc-comments. Comments explain *why*, not *what*.
- Every system has: a Resource schema (if data-driven), a scene/script, and at least one GUT test.
- Frame budget: no allocations in `_physics_process` hot loops; cache lookups; use a spatial hash for range queries.
- Errors: fail loudly in debug (`assert`, `push_error`), degrade gracefully in release (never crash on a bad save).

## 6. Git & GitHub workflow

- Branches: `main` (always releasable, deploys to Vercel), `dev` (integration), `feat/<topic>`, `fix/<topic>`.
- **Conventional Commits**: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `perf:`, `refactor:`, `ci:`.
- Commit small and often (one logical change). Large features on their own branch, merged via PR into `dev`.
- PR must: pass CI, include tests, update `notes/*.txt` and the checklist in `plan.md`.
- Tag releases `vMAJOR.MINOR.PATCH` (SemVer). `v0.x` until MVP acceptance passes; `v1.0.0` = all acceptance criteria met.
- Commit message footer when the tooling requires attribution: follow the host tool's instruction; never add secrets.
- `.gitignore`: `.godot/`, `export/`, `*.apk`, `*.aab`, `*.keystore`, `*.jks`, `.env*`, `user://` data, OS junk.
  Commit `export_presets.cfg` **without** credentials (use CI env vars for signing).

## 7. Definition of Done (per task / milestone)

A task is done only when ALL are true:
1. Feature works in the running game (verified by actually running it, not only reading code).
2. GUT tests added/updated and passing; lint passes.
3. No new warnings in the Godot debugger output.
4. Works with mouse AND touch; pause/resume safe; save/load safe.
5. `notes/NOTES.txt` updated; `KNOWN_BUGS.txt` / `BALANCE_LOG.txt` / `PERF_LOG.txt` updated if relevant.
6. `plan.md` checkbox ticked; committed with a conventional commit.

## 8. Verification rules (do not skip)

- Run the game (editor or headless) after every system. If you can use a browser, smoke-test the **Web build** locally
  and again on the Vercel preview URL.
- Run the **balance simulator** (spec §12.3) after every balance change; log results in `BALANCE_LOG.txt`.
- Run the **path-invariant test**: enemies must never deviate from the path (acceptance criterion).
- Run the manual QA checklist (spec §13) before each tagged release.
- Never claim "works" without evidence. If you could not test something (e.g. a real Android device),
  say so explicitly in the report and in `NOTES.txt`.

## 9. Human-gated actions (STOP and ask the user)

Do the preparation, then ask — do not do these silently:
- Creating the GitHub repository / adding remotes / first push (give the exact commands if you lack access).
- Creating & linking the Vercel project, adding Vercel/GitHub secrets, any Render account or service.
- Generating / storing the Android signing keystore (instruct the user how; never commit it).
- Buying, paying for, or subscribing to anything; installing paid tools.
- Deleting user files outside the repo; force-pushing; rewriting history.
- Changing the final scope numbers (10 maps / 5 towers / 8 enemies / 3 bosses / 30 waves).

## 10. Hard "don'ts"

- Don't start a new feature while the previous milestone's acceptance is failing.
- Don't put all code in one script; don't hardcode stats; don't use `get_node` spaghetti.
- Don't use copyrighted assets, names, logos or music you cannot license.
- Don't add online features to the MVP (leaderboard/Render is optional, post-MVP only; game must be 100% offline-playable).
- Don't use unpinned versions for CI actions, GUT, gdtoolkit or Godot.
- Don't leave the game unplayable on `main`.

## 11. Quick command reference (adapt to the pinned version)

```bash
# run tests headless
godot --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests -gexit

# lint / format
gdlint scripts/ ; gdformat --check scripts/

# balance simulator (headless)
godot --headless --path . res://tools/balance_sim.tscn -- --runs=200 --map=all --difficulty=normal

# exports (presets named: "Web", "Windows", "Android")
godot --headless --export-release "Web" export/web/index.html
godot --headless --export-release "Windows Desktop" export/windows/LastGrid.exe
godot --headless --export-release "Android" export/android/LastGrid.apk
```

## 12. Reporting template (send to user after each milestone, in Uzbek)

```
Milestone: <M#> — <name>
Bajarildi: <3–6 qisqa band>
Test natijasi: <GUT pass/fail, simulator, qo'lda test>
Muammolar/Qarorlar: <notes/ fayllariga havola>
Keyingi qadam: <M# nomi>
Sizdan kerak: <faqat §9 dagi narsalar yoki "hech narsa">
```
