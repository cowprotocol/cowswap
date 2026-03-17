# Quality Ledger

Last reviewed: 2026-03-05
Review owner: frontend platform + area maintainers
Purpose: lightweight quality/freshness signal for autonomous contributors.

## Grade Scale

- `A`: boundaries and tests are healthy; no meaningful structural debt.
- `B`: mostly healthy with isolated debt.
- `C`: repeated drift or missing coverage; remediation needed.
- `D`: unstable architecture/testing posture; prioritize cleanup work.

## Domain Grades

| Domain/Layer | Grade | Notes |
| --- | --- | --- |
| cowswap-frontend `swap` | B | Healthy core flow; continue reducing deep cross-module imports. |
| cowswap-frontend `limitOrders` | B | Stable behavior; keep atom/query migration pressure. |
| cowswap-frontend `common` | C | Guard against domain logic leakage from modules. |
| cowswap-frontend `trade` | B | Orchestrator role is useful but import direction should be reviewed regularly. |
| cow-fi app | B | Lint/type strictness still partially downgraded in eslint config. |
| explorer app | B | Stable baseline; keep additive AGENTS/docs aligned with root harness. |

## Known Cross-Cutting Gaps

- Some architectural boundaries are still documented more strongly than they are lint-enforced.
- Data fetching pattern (SWR vs `atomWithQuery`) migration is under evaluation.
- Domain grading should be refreshed continuously with targeted evidence.
- Hardening roadmap and milestones live in `docs/HARNESS_HARDENING.md`.

## Update Rules

- Update this file whenever a cleanup/refactor materially improves or regresses domain health.
- Add one sentence of evidence in the notes column when changing a grade.
- If no quality review happened in 30 days, open a maintenance issue and refresh grades.
