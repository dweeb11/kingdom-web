# Kingdom Web

## Vision
Web-based kingdom management / grid dungeon crawler. Design lab for Kingdom Crawler —
explore game systems with more depth using programmatic vector art. Not a port, a parallel
exploration. Lessons feed back into the Godot version.

## Tech Stack
TypeScript, web browser, programmatic art (SVG/Canvas 2D/shaders). Zero external art assets.

## Quick Start
[TBD — fill in as project matures]

## Architecture
[TBD — fill in as project matures. See docs/design/kingdom-web-design.md for current spec]

---

## Process

```
  VISION ──▸ ART DIR ──▸ DESIGN ──▸ MILESTONE ──▸ IMPLEMENT ──▸ VERIFY ──▸ SHIP
             (programmatic)  docs/design/  docs/milestones/  branch+test  evidence  merge via PR
```

## Agent Roles

**You are Producer + Engineer. The human is Designer + Assistant Producer.**
- Own the process — update milestone checklists as you complete tasks
- Surface design decisions — don't make them, flag them and wait
- Commit after each task, not at end of session

## Testing

| Code Type | Approach |
|-----------|----------|
| Game logic, state, systems | Test FIRST |
| Rendering, UI, interactions | Manual acceptance criteria |

## Git

- Branch per feature: `feat/`, `fix/`, `docs/`, `refactor/`
- PRs for all merges
- Commit after every completed task

## Knowledge

**Read `.claude/knowledge/` before starting work.** Update when you discover non-obvious patterns or gotchas. Max 5 files, 50 lines each.

## Non-Negotiables

- Plans save to `docs/milestones/` or `docs/design/` — NEVER `docs/superpowers/`
- No date-prefixed filenames
- PITCH.md and SCRATCH.md are human-owned — never modify
