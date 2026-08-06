---
name: e2e-scenario-to-spec
description: Use when given a rough, informal e2e test scenario (Preconditions/Steps/Expected results, possibly ambiguous or underspecified) for apps/cowswap-e2e-tests, and asked to turn it into a detailed spec — before handing off to the e2e-spec-to-playwright skill for code generation.
---

# E2E scenario → detailed spec

## Overview

The input is a human-written, informal scenario — short steps, vague preconditions, expected results as a separate trailing list, conditional phrases like "if needed". The output is a **detailed spec** in the exact format `E2E-SPEC-SKILL.md` consumes: concrete `Preconditions:` lines, numbered `Steps:` phrased in that skill's vocabulary, `[expect]:` lines inserted right after the step that produces them.

This skill's only deliverable is the refined spec text. Do not write test code here — that's the next skill's job.

**Core failure mode to avoid:** silently resolving an ambiguity by picking the "reasonable-sounding" interpretation. Some ambiguities change what the test actually verifies (see below) — guessing wrong means the generated test checks the wrong thing without anyone noticing until it's already merged.

## Example

Input:
```
Preconditions:
EOA wallet connected; USDC balance > 0

Steps:
1. Select USDC as sell token, ETH as buy token
2. Enter sell amount
3. Approve if needed
4. Click Swap and sign

Expected results:
1. Order submitted off-chain
2. appears in open orders with status Open
```

This has at least four things worth clarifying before writing a spec (see Must-clarify checklist): exact USDC balance, native ETH vs. WETH, whether to exercise the approve flow or mock around it, exact sell amount, and which "open orders" UI surface is meant. Ask about all of them in one batch before producing the detailed spec (see the worked output in `E2E-SPEC-SKILL.md`'s own example — that's what this scenario turned into after clarification).

## Workflow

1. **Read the target spec file first** (e.g. `src/tests/market-orders.spec.ts`) — existing `[XX-NN]` numbering to continue, known preconditions (chain, token addresses/symbols already used), and phrasing already established there. If it's unclear which spec file the scenario belongs in, ask.
2. **Walk the rough scenario against the "Must-clarify" checklist below.** Collect every ambiguity found — don't stop at the first one.
3. **Ask all clarifying questions in a single batch** (one `AskUserQuestion` call, multiple questions), not one at a time. Only do a second round if an answer opens a new ambiguity.
4. **Fill in silent defaults** (below) for anything not ambiguous, without asking.
5. **Write the detailed spec**: concrete `Preconditions:`, numbered `Steps:` using phrasing from `E2E-SPEC-SKILL.md`'s mapping table (insert the mechanical steps a rough scenario usually skips — "wait for quote", "go to confirmation screen" — as silent defaults per step 4), and `[expect]:` lines mapped from the input's "Expected results" onto the step that produces each one, in order.
6. **Flag anything you added beyond what the human specified** (an inserted mechanical step is fine and doesn't need flagging; an assertion or precondition value you invented does) in a short note after the spec, so it can be vetoed before moving to code.

## Must-clarify checklist

These change what the generated test actually verifies — always ask, never guess:

| Ambiguous phrase / gap | Why it matters | Example question |
|---|---|---|
| "Approve if needed" / any conditional step | Changes the whole test: exercise the real approve UI (insufficient allowance → click Approve → wait → then swap) vs. pre-mock sufficient allowance so it never appears | "Should this test exercise the approval flow, or should I mock sufficient allowance so it goes straight to Confirm Swap?" |
| "ETH" as a sell/buy token | Native ETH (wrap/unwrap flow) and WETH (plain ERC-20) are different code paths in this app | "By 'ETH' do you mean native ETH (wrap/unwrap) or WETH?" |
| Balance/allowance given as an inequality or omitted ("> 0", not mentioned) | Downstream code needs a literal number; the number also determines what round post-trade balances are achievable | "What starting balance should I use (e.g. 1500 USDC)?" |
| Sell/buy amount not given a number | Same as above | "What sell amount should step N use?" |
| "Open orders" / "activity" / "my orders" with no UI surface named | This suite has more than one candidate (account modal's activities list vs. an orders table) — see `E2E-SPEC-SKILL.md`'s known quirks | "Do you mean the account modal's activities list, or a different orders view?" |
| An expected result with no obvious mapping to `E2E-SPEC-SKILL.md`'s phrasing vocabulary | If it doesn't map, either the wording needs to change or it's a genuinely new interaction the code skill hasn't covered yet | "I don't have an established phrasing/selector for '<X>' — can you describe the exact UI signal, or give a selector?" |
| Fees/slippage mentioned or implied in an expected amount | Determines whether the spec should pin the quote to a round number (deterministic) or let it float | "Should the expected buy amount be an exact round number (I'll mock the quote for it), or is approximate fine?" |

## Silent defaults (don't ask, just fill in)

- Network: Sepolia, unless the scenario says otherwise — every existing spec in this suite uses it.
- Wallet: the mock EOA wallet fixture — already the file-level default, no step needed.
- Mechanical intermediate steps a rough scenario glosses over ("wait for quote", "go to confirmation screen") — insert them; they're always required, never optional.
- Test id: next unused `[XX-NN]` in the target file's numbering scheme.
- If the human's "expected result" already matches a phrase in `E2E-SPEC-SKILL.md`'s mapping table (e.g. "order submitted" → progress-bar-modal text), use that exact phrasing rather than inventing new wording.

## Output contract

The result must be directly consumable by `E2E-SPEC-SKILL.md` — same shape as its own worked example:

```
Preconditions:
Wallet: connected to EOA wallet
Network: Sepolia
Balances: <token>: <amount>, ...
Allowances: <token>: <amount>          (only if relevant to the scenario)

Steps:
1. ...
[expect]: ...
2. ...
...
```

Every `[expect]` line sits immediately after the step it verifies, not batched at the end — that's the main structural transform from the human's input format.
