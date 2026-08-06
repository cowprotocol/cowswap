---
name: e2e-spec-to-playwright
description: Use when given a manual test case in Preconditions/Steps/[expect] format (or similarly-shaped structured spec) and asked to add or update a Playwright test in apps/cowswap-e2e-tests — translating spec steps into test code for this suite fast, instead of re-deriving selectors or flows from the frontend source.
---

# E2E spec → Playwright test

## Overview

The input is a structured manual-test spec (Preconditions / numbered Steps / `[expect]` assertions), e.g.:

```
Preconditions:
Wallet: connected to EOA wallet
Network: Sepolia
Balances: 1500 USDC, 0 WETH

Steps:
1. Open default swap page
2. Select USDC → WETH using UI token selector
[expect]: Sell token balance is 1500 USDC, buy token balance is 0 WETH
3. Enter sell amount: 1000 USDC
...
```

The job is a **mechanical translation** into a `test(...)` block in `src/tests/*.spec.ts`. Most of the building blocks already exist in this suite. The failure mode to avoid is treating this as a reverse-engineering task — reading frontend source to rediscover selectors, triggers, and app behavior that are either already used elsewhere in this suite or are one question away from the person who wrote the spec.

## Order of operations

1. **Grep existing spec files first** (`src/tests/*.spec.ts`), not frontend source. If the spec mentions confirming a swap, fulfilling an order, opening a modal, checking a balance — search for that phrase/state across existing tests before opening anything under `../cowswap-frontend`. High odds a near-identical step already exists.
2. **Reuse page objects and fixtures** in `src/pages/*.ts` and `src/support/*.ts` (`setupTestConditions`, `mocks.*`, `ConfirmModal`, `TokenSelector`, etc.) — don't hand-roll a locator that a page object already exposes.
3. **Missing selector or trigger → ask, don't explore.** If the step needs a UI element with no existing locator anywhere in `src/pages` or `src/tests`, stop and ask the user for it (a CSS selector, an `id`, or "which button/behavior closes X"). Do not dispatch a sub-agent or trace React components/hooks to reverse-engineer it — that's minutes of work the person who wrote the spec can answer in one line.
4. **Write the test**, following the mapping table below.
5. **Run only the new test** in isolation first (`--grep '\[XX-NN\]'`) before running the full file — cheaper feedback loop, and isolates new-test failures from unrelated flakiness in other tests.

## When a quick grep is fine vs. when to ask

| Fine to do yourself (cheap, ≤1-2 tool calls) | Ask the user instead |
|---|---|
| grep `src/tests/*.spec.ts` for a phrase/behavior from the spec | Selector/id/trigger not found in any existing page object or test |
| grep `src/pages/*.ts` for an existing locator | A business rule that changes which UI state appears isn't inferable from existing specs (e.g. "does X require an extra confirmation screen?") |
| Reuse a pattern already read in full from another test | Ambiguous default app state that materially changes the flow |

Rule of thumb: if answering the question requires opening more than ~2 files under `../cowswap-frontend`, stop and ask instead.

## Spec phrase → code mapping

| Spec phrasing | Code |
|---|---|
| "Wallet: connected to EOA" | Already handled by `test.use({ mockWalletKey: ... })` at the top of the file — no action needed |
| "Network: X" / "Balances: ..." / "Allowances: ..." (tokens fixed, not chosen via UI) | `setupTestConditions({ chainId, tradeType, sellToken, buyToken, sellAmount, balances, allowances })` |
| Same, but tokens are picked **via UI** mid-test | Set balances/allowances manually with `mocks.balances.set(...)` / `mocks.allowances.set(...)` before `swapPage.goto({ chainId })`, since `setupTestConditions` bakes tokens into the URL |
| "Open default swap page" | `swapPage.goto({ chainId })` (no `sell`/`buy`) |
| "Select X → Y using UI token selector" | `swapPage.tokens.openInput()/openOutput()` + `searchAndPick('X')` |
| "Enter sell amount: N" | `swapPage.enterSellAmount('N')` |
| "Wait for quote" | `swapPage.waitForQuote()` |
| "Go to confirmation screen" | `swapPage.clickSwap()` |
| "Confirm, sign and send order" | `confirmModal.confirmButton.click()` |
| "[expect] progress bar shows '...'" | `expect(swapPage.orderProgressBarModal).toContainText('...')` |
| "Close the progress bar modal" | `swapPage.page.keyboard.press('Escape')` (works at every step, not just when finished) |
| "Open/close account modal", "activities list" | `accountModal.open()/close()`, `accountModal.activitiesList` |
| "Trigger order fulfillment using mocks" | `const posting = swapPage.mockOrderPosting(mocks.cowApi, wallet.address)` once, then `posting.fulfill(mocks.balances, chainId, balanceBeforeInAtoms)` when the spec says to settle |
| "[expect] balance is N TOKEN" | `expect(swapPage.sellBalance / buyBalance).toHaveAttribute('title', 'N TOKEN', { timeout: 15_000 })` — give balance assertions a longer timeout, they wait on an SSE reconnect |

If a mapping doesn't exist for a phrase, check other spec files before inventing one.

## Known suite quirks (save yourself the rediscovery)

- Both Sepolia test tokens (WETH and the test "USDC") report **18 decimals on-chain** — don't assume real USDC's 6. `support/tokens.ts`'s `decimals: 6` entry is wrong; compute raw atoms with `parseUnits(amount, 18)` instead of trusting `resolveToken`.
- `mocks.usdPrices` defaults every token to **$1**. A quote ratio that doesn't roughly match $1:$1 trips an unrelated "Confirm Price Impact" dialog. If you override `quote`'s `buyAmount`, also call `mocks.usdPrices.setPrice(token, matchingRatio)` unless the spec explicitly wants that dialog.
- The default swap page pre-selects **sell=WETH / buy=USDC** on Sepolia. Picking a token that's already active on the *other* side triggers the app's duplicate-currency guard, which swaps the pair instead of just overwriting one side — so picking one side can silently satisfy the other. `TokenSelector.searchAndPick` already handles the resulting "already selected" no-op by dismissing with `Escape` instead of clicking.
- Dismissing the order-progress modal *before* an order settles, then expecting it to reopen on fulfillment, requires `mockOrderPosting`'s mocked `order` (GET-by-uid) endpoint — `orderStatus` alone only drives a modal that's still open. If reusing `mockOrderPosting`, this is already covered.

## Red flags — you're exploring instead of translating

- About to open a 3rd+ frontend source file to find a selector → stop, ask.
- About to dispatch an Explore/general-purpose agent to trace hooks/atoms for "how does X close" → stop, ask.
- Re-deriving math (decimals, slippage, fee handling) that another spec file already solved → grep that file instead.
- Spending more tool calls investigating one step than the whole rest of the test took to write.
