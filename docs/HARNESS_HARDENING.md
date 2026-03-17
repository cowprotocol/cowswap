# Harness Hardening Roadmap

Last reviewed: 2026-03-05
Owner: frontend platform maintainers
Status: active roadmap

Purpose: track the next steps to move from "documented guidance + partial checks" to "fully enforced, measurable, and continuously maintained" contributor harnesses.

## Current State

Implemented:

- Root AGENTS is compact and acts as a TOC.
- `pnpm agents:check` validates AGENTS/doc harness integrity.
- CI job `agent-harness` enforces these checks on PRs/pushes.

Still pending:

- More architecture constraints are prose or warning-only, not blocking.
- No scenario-based eval harness with pass-rate trend tracking.
- No scheduled drift-maintenance automation that opens maintenance PRs.

## Track 1: Architecture As Code

Goal: convert boundary guidance into blocking checks with safe rollout.

### Pending Work

- Add a baseline-backed guardrail for `common/** -> modules/**` imports.
- Promote selected warning-level boundary rules to error-level where safe.
- Encode critical module dependency direction rules as machine checks.

### Implementation Shape

1. Add `tools/scripts/common-modules-guardrail.mjs` with baseline support.
2. Add `tools/baselines/common-to-modules-baseline.txt`.
3. Add scripts:
   - `common-modules:check`
   - `common-modules:baseline:update`
4. Wire `common-modules:check` into `agents:check`.
5. Incrementally tighten lint rules in `eslint.config.js`:
   - start with narrow, high-confidence denies
   - keep remediation text actionable

### Exit Criteria

- New `common -> modules` violations fail CI.
- Selected boundary rules promoted from warning to error with no broad breakage.
- Legacy violations visible via baseline files and trendable counts.

## Track 2: Eval Harness

Goal: measure agent/code-change quality with repeatable tasks and score trends.

### Pending Work

- Create executable scenario suite for representative repo tasks.
- Add pass/fail assertions and metrics output.
- Run smoke evals on PR and full evals on schedule.

### Implementation Shape

1. Add `tools/harness/scenarios/` with 10-20 scoped tasks:
   - boundary fix
   - data fetching pattern slice
   - typed bugfix
   - small refactor with tests
2. Add `tools/harness/run.mjs`:
   - executes scenarios
   - emits JSON report with pass rate and regressions
3. Add CI integration:
   - PR: smoke subset
   - nightly: full suite
4. Store historical reports as workflow artifacts or committed snapshots.

### Exit Criteria

- Harness pass-rate and regressions are visible over time.
- Failing scenarios are actionable and link to exact checks.
- Scenario set is maintained as architecture/rules evolve.

## Track 3: Drift Automation

Goal: pay down harness/codebase drift continuously with small automated maintenance loops.

### Pending Work

- Add scheduled workflow that runs harness and drift scans.
- Auto-open maintenance PRs for safe updates.
- Keep quality grades and plan status fresh.

### Implementation Shape

1. Add scheduled workflow (weekly):
   - run `pnpm agents:check`
   - run architecture drift scripts
   - scan stale `.plans/active` entries
2. Generate/update:
   - `docs/QUALITY.md` freshness section
   - baseline drift summaries
3. Auto-open a maintenance PR with constrained file scope.
4. Require normal CI + owner review for merge.

### Exit Criteria

- Weekly maintenance PR is generated reliably.
- Quality ledger and baselines stay current with minimal manual effort.
- Drift backlog no longer accumulates silently.

## Sequencing

Recommended order:

1. Track 1 (highest risk-reduction and immediate enforcement value)
2. Track 2 (adds measurable quality signal)
3. Track 3 (sustains long-term health with lower manual overhead)

## Reporting

- Update this roadmap when milestone status changes.
- Mirror key progress in `docs/QUALITY.md`.
- For active execution, create/maintain a concrete plan under `.plans/active/`.
